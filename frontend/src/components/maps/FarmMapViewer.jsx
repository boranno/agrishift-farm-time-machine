import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Map,
  Marker,
  NavigationControl,
  ScaleControl
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  MapPin,
  LocateFixed,
  Search,
  Layers,
  Compass,
  Globe,
  Eye,
  PenTool,
  RotateCcw,
  Trash2,
  Undo2,
  AlertCircle,
  CheckCircle2,
  Info,
  Maximize2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import {
  MAP_LAYERS,
  WORLD_PRESET,
  BANGLADESH_PRESET,
  TERRAIN_DEM_URL
} from '../../services/mapConfig';
import {
  searchPlaces,
  reverseGeocode,
  calculatePolygonAreaSqMeters,
  convertAreaFromSqMeters
} from '../../services/geocodingService';

export const FarmMapViewer = ({
  latitude = 22.5721,
  longitude = 89.5105,
  boundary = [],
  district = 'Khulna',
  upazila = 'Dacope',
  onCoordinateSelect,
  onBoundaryChange,
  isInteractive = true
}) => {
  const { t, isBangla } = useTranslation();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Map state
  const [activeLayerId, setActiveLayerId] = useState('osm');
  const [is3dPerspective, setIs3dPerspective] = useState(false);
  const [isGlobeView, setIsGlobeView] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [geoAccuracy, setGeoAccuracy] = useState(null);
  const [geoNotice, setGeoNotice] = useState(null);

  // Location search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchNotice, setSearchNotice] = useState(null);

  // Boundary drawing state
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false);
  const [boundaryPoints, setBoundaryPoints] = useState(() => Array.isArray(boundary) ? boundary : []);
  const [boundaryAreaStats, setBoundaryAreaStats] = useState(null);

  // Selected layer
  const currentLayer = MAP_LAYERS.find(l => l.id === activeLayerId) || MAP_LAYERS[0];

  // Helper to check WebGL support
  const isWebGLAvailable = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  };

  // 1. Initialize MapLibre GL Map
  useEffect(() => {
    isMountedRef.current = true;

    if (!mapContainerRef.current) return;

    if (!isWebGLAvailable()) {
      setMapError(isBangla
        ? 'আপনার ব্রাউজার বা ডিভাইসে WebGL হার্ডওয়্যার এক্সিলারেশন সক্রিয় নেই। স্ট্যান্ডার্ড মোড প্রদর্শিত হচ্ছে।'
        : 'WebGL hardware acceleration is unavailable in your browser. Standard fallback view is active.');
      return;
    }

    try {
      const initialLat = Number(latitude) || 22.5721;
      const initialLon = Number(longitude) || 89.5105;

      const map = new Map({
        container: mapContainerRef.current,
        style: currentLayer.style,
        center: [initialLon, initialLat],
        zoom: 12,
        pitch: is3dPerspective ? 50 : 0,
        bearing: 0,
        attributionControl: false // custom attribution below
      });

      // Controls
      map.addControl(new NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
      map.addControl(new ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

      // Create Custom Draggable Farm Marker
      const markerEl = document.createElement('div');
      markerEl.className = 'agrishift-farm-marker';
      markerEl.innerHTML = `
        <div style="position: relative; width: 34px; height: 42px; transform: translate(-50%, -100%); cursor: grab;">
          <svg viewBox="0 0 24 32" width="34" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#14532D" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="12" cy="12" r="5" fill="#22A06B" stroke="#FFFFFF" stroke-width="1.5"/>
          </svg>
        </div>
      `;

      const marker = new Marker({
        element: markerEl,
        draggable: isInteractive
      })
        .setLngLat([initialLon, initialLat])
        .addTo(map);

      // Marker drag event
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        if (onCoordinateSelect) {
          onCoordinateSelect(
            parseFloat(lngLat.lat.toFixed(5)),
            parseFloat(lngLat.lng.toFixed(5))
          );
        }
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Handle map load: add GeoJSON source and layers for farm boundary polygon
      map.on('load', () => {
        if (!map.getSource('farm-boundary-source')) {
          map.addSource('farm-boundary-source', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });

          // Polygon Fill Layer
          map.addLayer({
            id: 'farm-boundary-fill',
            type: 'fill',
            source: 'farm-boundary-source',
            paint: {
              'fill-color': '#22A06B',
              'fill-opacity': 0.25
            }
          });

          // Polygon Outline Layer
          map.addLayer({
            id: 'farm-boundary-line',
            type: 'line',
            source: 'farm-boundary-source',
            paint: {
              'line-color': '#14532D',
              'line-width': 2.5,
              'line-dasharray': [2, 1]
            }
          });

          // Vertices Layer
          map.addLayer({
            id: 'farm-boundary-points',
            type: 'circle',
            source: 'farm-boundary-source',
            filter: ['==', '$type', 'Point'],
            paint: {
              'circle-radius': 5,
              'circle-color': '#166534',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFFFFF'
            }
          });
        }
      });

      // Map Click Event
      map.on('click', (e) => {
        const clickedLng = parseFloat(e.lngLat.lng.toFixed(5));
        const clickedLat = parseFloat(e.lngLat.lat.toFixed(5));

        // If in Boundary Drawing Mode, add vertex to polygon
        if (isDrawingBoundary) {
          setBoundaryPoints(prev => {
            const next = [...prev, [clickedLng, clickedLat]];
            return next;
          });
          return;
        }

        // Standard Mode: update farm location marker
        if (isInteractive && onCoordinateSelect) {
          marker.setLngLat([clickedLng, clickedLat]);
          onCoordinateSelect(clickedLat, clickedLng);
        }
      });

      return () => {
        isMountedRef.current = false;
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize MapLibre GL:', err);
      setMapError(err.message || 'Map initialization error');
    }
  }, []);

  // 2. Synchronize Marker & Center when latitude/longitude props change
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      const currentPos = markerRef.current.getLngLat();
      if (
        Math.abs(currentPos.lat - lat) > 0.0001 ||
        Math.abs(currentPos.lng - lon) > 0.0001
      ) {
        markerRef.current.setLngLat([lon, lat]);
        mapInstanceRef.current.flyTo({
          center: [lon, lat],
          essential: false,
          speed: 1.2
        });
      }
    }
  }, [latitude, longitude]);

  // 3. Update Polygon Layers when boundaryPoints change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const source = map.getSource('farm-boundary-source');
    if (!source) return;

    if (boundaryPoints.length >= 3) {
      // Calculate Area
      const sqMeters = calculatePolygonAreaSqMeters(boundaryPoints);
      const converted = convertAreaFromSqMeters(sqMeters);
      setBoundaryAreaStats(converted);

      if (onBoundaryChange) {
        onBoundaryChange(boundaryPoints, converted);
      }

      // GeoJSON closed ring
      const closedCoordinates = [...boundaryPoints, boundaryPoints[0]];

      const features = [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [closedCoordinates]
          }
        },
        ...boundaryPoints.map(pt => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: pt
          }
        }))
      ];

      source.setData({
        type: 'FeatureCollection',
        features
      });
    } else if (boundaryPoints.length > 0) {
      // Just points while drawing
      const features = boundaryPoints.map(pt => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: pt
        }
      }));

      source.setData({
        type: 'FeatureCollection',
        features
      });
      setBoundaryAreaStats(null);
    } else {
      source.setData({
        type: 'FeatureCollection',
        features: []
      });
      setBoundaryAreaStats(null);
      if (onBoundaryChange) {
        onBoundaryChange([], null);
      }
    }
  }, [boundaryPoints]);

  // 4. Handle Layer Style Switching
  const handleLayerSwitch = (layerId) => {
    setActiveLayerId(layerId);
    const target = MAP_LAYERS.find(l => l.id === layerId);
    if (!target || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const currentPitch = map.getPitch();
    const currentBearing = map.getBearing();

    map.setStyle(target.style, {
      diff: false
    });

    map.once('style.load', () => {
      // Re-add boundary source & layers after style reload
      if (!map.getSource('farm-boundary-source')) {
        map.addSource('farm-boundary-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        map.addLayer({
          id: 'farm-boundary-fill',
          type: 'fill',
          source: 'farm-boundary-source',
          paint: {
            'fill-color': '#22A06B',
            'fill-opacity': 0.25
          }
        });

        map.addLayer({
          id: 'farm-boundary-line',
          type: 'line',
          source: 'farm-boundary-source',
          paint: {
            'line-color': '#14532D',
            'line-width': 2.5,
            'line-dasharray': [2, 1]
          }
        });

        map.addLayer({
          id: 'farm-boundary-points',
          type: 'circle',
          source: 'farm-boundary-source',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 5,
            'circle-color': '#166534',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF'
          }
        });
      }

      // Re-center
      map.setCenter(currentCenter);
      map.setZoom(currentZoom);
      map.setPitch(currentPitch);
      map.setBearing(currentBearing);

      // Re-render boundary points if any
      if (boundaryPoints.length >= 3) {
        const closed = [...boundaryPoints, boundaryPoints[0]];
        const src = map.getSource('farm-boundary-source');
        if (src) {
          src.setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: [closed] }
              }
            ]
          });
        }
      }
    });
  };

  // 5. Live Device Geolocation
  const handleRequestLocation = () => {
    setGeoNotice(null);

    if (!navigator.geolocation) {
      setGeoNotice({
        type: 'error',
        message: isBangla
          ? 'আপনার ব্রাউজারে জিওলোকেশন সুবিধা সমর্থিত নয়।'
          : 'Geolocation is not supported by your browser.'
      });
      return;
    }

    // Check for secure context
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setGeoNotice({
        type: 'warning',
        message: isBangla
          ? 'ব্রাউজারের নিরাপত্তা বিধিমালার কারণে লাইভ লোকেশন পেতে সাধারণত HTTPS বা লোকালহোস্ট (localhost) সংযোগ প্রয়োজন।'
          : 'Browser security policies require HTTPS or localhost to access device geolocation.'
      });
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude: lat, longitude: lon, accuracy } = position.coords;

        setGeoAccuracy(accuracy ? Math.round(accuracy) : null);
        setGeoNotice({
          type: 'success',
          message: isBangla
            ? `ডিভাইসের অবস্থান সফলভাবে শনাক্ত হয়েছে! নির্ভুলতা: ±${accuracy ? Math.round(accuracy) : 'N/A'} মিটার`
            : `Device location detected! Accuracy: ±${accuracy ? Math.round(accuracy) : 'N/A'} meters`
        });

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLngLat([lon, lat]);
          mapInstanceRef.current.flyTo({
            center: [lon, lat],
            zoom: 15,
            speed: 1.5,
            curve: 1
          });
        }

        if (onCoordinateSelect) {
          onCoordinateSelect(
            parseFloat(lat.toFixed(5)),
            parseFloat(lon.toFixed(5)),
            accuracy ? Math.round(accuracy) : null
          );
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = isBangla
              ? 'লোকেশন ব্যবহারের অনুমতি প্রত্যাখ্যাত হয়েছে। অনুগ্রহ করে ব্রাউজার সেটিংসে অনুমতি প্রদান করুন।'
              : 'Location permission was denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = isBangla
              ? 'ডিভাইস বা স্যাটেলাইট থেকে ভৌগোলিক অবস্থান পাওয়া যাচ্ছে না।'
              : 'Location information is currently unavailable from your device or network.';
            break;
          case error.TIMEOUT:
            errorMsg = isBangla
              ? 'লোকেশন অনুসন্ধানের নির্ধারিত সময় শেষ হয়ে গেছে। পুনরায় চেষ্টা করুন।'
              : 'The location request timed out. Please try again.';
            break;
          default:
            errorMsg = error.message || 'An unknown geolocation error occurred.';
        }
        setGeoNotice({ type: 'error', message: errorMsg });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // 6. Geocoding Location Search
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchNotice(null);
    setSearchResults([]);

    const res = await searchPlaces(searchQuery);
    setIsSearching(false);

    if (!res.success) {
      setSearchNotice({
        type: 'error',
        message: isBangla
          ? 'সার্চ সেবা অফলাইনে বা সংযোগহীন অবস্থায় রয়েছে। আপনি ম্যাপে সরাসরি ক্লিক করে বা স্থানাঙ্ক লিখে অবস্থান নির্ধারণ করতে পারেন।'
          : res.error || 'Search service unavailable. You can click on the map or enter coordinates manually.'
      });
      return;
    }

    if (res.results.length === 0) {
      setSearchNotice({
        type: 'info',
        message: isBangla
          ? 'কোনো এলাকা বা স্থান খুঁজে পাওয়া যায়নি। বানানের সঠিকতা যাচাই করুন।'
          : 'No locations found. Try checking the spelling or searching a nearby town/district.'
      });
      return;
    }

    setSearchResults(res.results);
  };

  const handleSelectSearchResult = (result) => {
    setSearchResults([]);
    setSearchQuery(result.displayName);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLngLat([result.lon, result.lat]);
      mapInstanceRef.current.flyTo({
        center: [result.lon, result.lat],
        zoom: 13,
        speed: 1.4
      });
    }

    if (onCoordinateSelect) {
      onCoordinateSelect(
        parseFloat(result.lat.toFixed(5)),
        parseFloat(result.lon.toFixed(5))
      );
    }
  };

  // 7. 3D Perspective & Globe View Controls
  const toggle3dPerspective = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const next3d = !is3dPerspective;
    setIs3dPerspective(next3d);

    map.easeTo({
      pitch: next3d ? 55 : 0,
      bearing: next3d ? 25 : 0,
      duration: 1000
    });
  };

  const toggleGlobeProjection = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const nextGlobe = !isGlobeView;
    setIsGlobeView(nextGlobe);

    try {
      if (typeof map.setProjection === 'function') {
        map.setProjection({ type: nextGlobe ? 'globe' : 'mercator' });
      }
    } catch (e) {
      console.warn('Globe projection toggle not supported by current MapLibre version/style:', e);
    }
  };

  const resetNorth = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.resetNorthPitch({ duration: 800 });
    setIs3dPerspective(false);
  };

  const zoomToWorld = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: WORLD_PRESET.center,
      zoom: WORLD_PRESET.zoom,
      pitch: 0,
      bearing: 0,
      speed: 1.2
    });
  };

  const zoomToBangladesh = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: BANGLADESH_PRESET.center,
      zoom: BANGLADESH_PRESET.zoom,
      pitch: 0,
      bearing: 0,
      speed: 1.4
    });
  };

  const centerOnFarm = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: [Number(longitude), Number(latitude)],
      zoom: 14,
      speed: 1.4
    });
  };

  // 8. Boundary Drawing Actions
  const toggleDrawingMode = () => {
    setIsDrawingBoundary(prev => !prev);
  };

  const clearBoundary = () => {
    setBoundaryPoints([]);
    setBoundaryAreaStats(null);
    if (onBoundaryChange) {
      onBoundaryChange([], null);
    }
  };

  const undoLastBoundaryPoint = () => {
    setBoundaryPoints(prev => prev.slice(0, prev.length - 1));
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      {/* Top Search & Geolocation Action Bar */}
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-bg-cream)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.35rem', flex: 1, minWidth: '260px', position: 'relative' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isBangla ? 'স্থান, জেলা, উপজেলা বা গ্রাম খুঁজুন...' : 'Search place, village or city worldwide...'}
              className="form-control"
              style={{
                paddingLeft: '2rem',
                fontSize: 'var(--font-size-xs)',
                backgroundColor: 'var(--color-bg-surface)'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.8rem' }}
          >
            {isSearching ? <Loader2 size={14} className="animate-spin" /> : <span>{isBangla ? 'খুঁজুন' : 'Search'}</span>}
          </button>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchResult(item)}
                  style={{
                    padding: '0.6rem 0.85rem',
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--color-border)',
                    lineHeight: 1.4
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-cream)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <strong style={{ display: 'block', color: 'var(--color-primary-900)' }}>
                    {item.displayName.split(',')[0]}
                  </strong>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
                    {item.displayName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Live Geolocation Button */}
        <button
          type="button"
          onClick={handleRequestLocation}
          disabled={isLocating}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          title={isBangla ? 'ব্রাউজার থেকে সরাসরি আপনার বর্তমান অবস্থান শনাক্ত করুন' : 'Detect your current device location via browser GPS'}
        >
          {isLocating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={15} />}
          <span>
            {isLocating
              ? (isBangla ? 'শনাক্ত হচ্ছে...' : 'Locating...')
              : (isBangla ? 'আমার অবস্থান ব্যবহার করুন' : 'Use My Location')}
          </span>
        </button>
      </div>

      {/* Geolocation Notice Banner */}
      {geoNotice && (
        <div style={{
          padding: '0.5rem 1rem',
          fontSize: 'var(--font-size-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: geoNotice.type === 'error' ? 'var(--color-risky-bg)' : geoNotice.type === 'warning' ? 'var(--color-marginal-bg)' : 'var(--color-suitable-bg)',
          color: geoNotice.type === 'error' ? 'var(--color-risky-text)' : geoNotice.type === 'warning' ? 'var(--color-marginal-text)' : 'var(--color-suitable-text)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          {geoNotice.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{geoNotice.message}</span>
          <button
            type="button"
            onClick={() => setGeoNotice(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Search Notice Banner */}
      {searchNotice && (
        <div style={{
          padding: '0.5rem 1rem',
          fontSize: 'var(--font-size-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: searchNotice.type === 'error' ? 'var(--color-risky-bg)' : 'var(--color-bg-cream)',
          color: searchNotice.type === 'error' ? 'var(--color-risky-text)' : 'var(--color-text-main)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <Info size={15} />
          <span>{searchNotice.message}</span>
          <button
            type="button"
            onClick={() => setSearchNotice(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Map Control Toolbar (Layers, 3D, Presets, Boundary) */}
      <div style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        {/* Layer Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {MAP_LAYERS.map(layer => (
              <button
                key={layer.id}
                type="button"
                onClick={() => handleLayerSwitch(layer.id)}
                className="btn btn-sm"
                style={{
                  borderRadius: 0,
                  border: 'none',
                  fontSize: '11px',
                  padding: '0.35rem 0.65rem',
                  backgroundColor: activeLayerId === layer.id ? 'var(--color-primary-800)' : 'var(--color-bg-surface)',
                  color: activeLayerId === layer.id ? '#FFFFFF' : 'var(--color-text-main)'
                }}
              >
                {isBangla ? layer.labelBn : layer.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Perspective, Globe & Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {/* 3D Perspective Toggle */}
          <button
            type="button"
            onClick={toggle3dPerspective}
            className={`btn btn-sm ${is3dPerspective ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '11px', padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            title={isBangla ? 'ক্যামেরা কৌণিক ৩ডি ভিউ টগল করুন' : 'Toggle 3D Perspective Camera Pitch (50°)'}
          >
            <Compass size={13} />
            <span>{is3dPerspective ? (isBangla ? '৩ডি পারস্পেক্টিভ' : '3D Pitch (50°)') : (isBangla ? '২ডি সমতল' : '2D Top-Down')}</span>
          </button>

          {/* Reset North */}
          <button
            type="button"
            onClick={resetNorth}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', padding: '0.35rem 0.5rem' }}
            title={isBangla ? 'উত্তরমুখী রিসেট করুন' : 'Reset North Orientation'}
          >
            N
          </button>

          {/* Quick Presets */}
          <button
            type="button"
            onClick={zoomToBangladesh}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', padding: '0.35rem 0.6rem' }}
          >
            {isBangla ? 'বাংলাদেশ' : 'Bangladesh'}
          </button>

          <button
            type="button"
            onClick={zoomToWorld}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', padding: '0.35rem 0.6rem' }}
            title={isBangla ? 'সমগ্র বিশ্ব ভিউ' : 'View Entire World'}
          >
            <Globe size={13} />
            <span>{isBangla ? 'বিশ্ব' : 'World'}</span>
          </button>

          <button
            type="button"
            onClick={centerOnFarm}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', padding: '0.35rem 0.6rem' }}
            title={isBangla ? 'খামার অবস্থানে জুম' : 'Center on Active Farm'}
          >
            <MapPin size={13} />
            <span>{isBangla ? 'খামার' : 'Farm'}</span>
          </button>

          {/* Boundary Drawing Mode Toggle */}
          <button
            type="button"
            onClick={toggleDrawingMode}
            className={`btn btn-sm ${isDrawingBoundary ? 'btn-fresh' : 'btn-secondary'}`}
            style={{ fontSize: '11px', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            title={isBangla ? 'জমির সীমানা কোণা চিহ্নিত করুন' : 'Draw farm perimeter boundary'}
          >
            <PenTool size={13} />
            <span>{isDrawingBoundary ? (isBangla ? 'আঁকা সম্পন্ন' : 'Finish Drawing') : (isBangla ? 'সীমানা আঁকুন' : 'Draw Boundary')}</span>
          </button>

          {boundaryPoints.length > 0 && (
            <>
              <button
                type="button"
                onClick={undoLastBoundaryPoint}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '0.35rem 0.5rem' }}
                title={isBangla ? 'শেষ কোণা বিন্দু মুছুন' : 'Undo last boundary point'}
              >
                <Undo2 size={13} />
              </button>
              <button
                type="button"
                onClick={clearBoundary}
                className="btn btn-danger btn-sm"
                style={{ fontSize: '11px', padding: '0.35rem 0.5rem' }}
                title={isBangla ? 'সম্পূর্ণ সীমানা মুছুন' : 'Clear boundary polygon'}
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Boundary Drawing Guidance Banner */}
      {isDrawingBoundary && (
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#ECFDF5',
          borderBottom: '1px solid #A7F3D0',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-primary-900)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PenTool size={14} color="var(--color-primary-700)" />
            <span>
              {isBangla
                ? 'সীমানা আঁকা মোড সক্রিয়: জমির সীমানা নির্ধারণ করতে ম্যাপের কোণায় ক্লিক করুন (কমপক্ষে ৩টি বিন্দু)।'
                : 'Boundary Drawing Active: Click corners on the map to define your parcel polygon (minimum 3 points).'}
            </span>
          </div>

          <div style={{ fontWeight: '600' }}>
            {boundaryPoints.length} {isBangla ? 'টি বিন্দু নির্বাচিত' : 'points placed'}
          </div>
        </div>
      )}

      {/* Calculated Boundary Area Badge Bar */}
      {boundaryAreaStats && (
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--color-bg-cream)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: 'var(--font-size-xs)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={15} color="var(--color-primary-800)" />
            <strong>{isBangla ? 'গণনাকৃত জমির আয়তন:' : 'Estimated Farm Area:'}</strong>
            <span className="badge badge-suitable" style={{ fontSize: '11px' }}>
              {boundaryAreaStats.bigha} {isBangla ? 'বিঘা' : 'Bigha'}
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              {boundaryAreaStats.acre} {isBangla ? 'একর' : 'Acre'}
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              {boundaryAreaStats.decimal} {isBangla ? 'শতাংশ' : 'Decimal'}
            </span>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
              ({boundaryAreaStats.sqMeters.toLocaleString()} m²)
            </span>
          </div>

          <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>
            {isBangla ? 'ব্যবহারকারী-আঁকা আনুমানিক পরিমাপ' : 'User-drawn geodesic approximation'}
          </span>
        </div>
      )}

      {/* MapLibre GL Canvas Container */}
      <div style={{ position: 'relative', width: '100%', height: '440px', backgroundColor: '#E2E8DF' }}>
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', cursor: isDrawingBoundary ? 'crosshair' : 'default' }}
        />

        {/* Fallback Display if WebGL or Map fails */}
        {mapError && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--color-bg-cream)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 10
          }}>
            <AlertCircle size={32} color="var(--color-marginal-dot)" style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.5rem' }}>
              {isBangla ? 'ইন্টারেক্টিভ ম্যাপ প্রদর্শনে সতর্কতা' : 'Interactive Map Notice'}
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', maxWidth: '420px', marginBottom: '1rem' }}>
              {mapError}
            </p>
            <div style={{ fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--color-bg-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <strong>{isBangla ? 'নির্বাচিত স্থানাঙ্ক:' : 'Selected Coordinates:'}</strong> {latitude}°N, {longitude}°E
            </div>
          </div>
        )}

        {/* Map Coordinates Floating Pill */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(4px)',
          padding: '0.35rem 0.65rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-text-main)',
          zIndex: 5
        }}>
          <MapPin size={12} color="var(--color-primary-800)" />
          <span>
            {Number(latitude).toFixed(5)}°N, {Number(longitude).toFixed(5)}°E
          </span>
          {geoAccuracy && (
            <span className="badge badge-info" style={{ fontSize: '10px', padding: '0.1rem 0.35rem' }}>
              ±{geoAccuracy}m
            </span>
          )}
        </div>
      </div>

      {/* Map Attribution and Scientific Disclosure Footer */}
      <div style={{
        padding: '0.45rem 1rem',
        fontSize: '11px',
        color: 'var(--color-text-secondary)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        backgroundColor: 'var(--color-bg-surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: '500' }}>
            {currentLayer.isSatellite ? 'Imagery: Esri World Imagery / USGS' : 'Tiles: OpenStreetMap Contributors / CARTO'}
          </span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span>{isBangla ? 'মানচিত্র ইঞ্জিন: MapLibre GL JS' : 'Engine: MapLibre GL JS'}</span>
        </div>

        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
          {isBangla
            ? '৩ডি ক্যামেরা পারস্পেক্টিভ সক্রিয়। বিস্তারিত ডিজিটাল এলিভেশন (DEM) মেশ কনফিগারযোগ্য।'
            : '3D perspective camera active. Digital Elevation Mesh (DEM) configurable via VITE_TERRAIN_DEM_URL.'}
        </div>
      </div>
    </div>
  );
};

export default FarmMapViewer;
