import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, Marker, NavigationControl, ScaleControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Eye, EyeOff, Layers, MapPin, RotateCcw, Sliders, Compass, Droplets, CloudRain, ThermometerSun, Activity, Target } from 'lucide-react';
import { MAP_LAYERS } from '../../services/mapConfig';
import { ENVIRONMENTAL_LAYERS, GEOGRAPHIC_WATERSHEDS } from '../home/globeData';

// Geographic extent calibrated to the MIT Eltahir Group coastal Bangladesh PNG frame
// so that Satkhira (88.90°E) to Sandwip/Feni (91.65°E) and 23.38°N to 21.62°N align on the map.
export const MIT_SALINITY_PNG_BOUNDS = {
  west: 88.25,
  east: 92.30,
  north: 23.46,
  south: 21.55
};

const COASTAL_HOTSPOTS = [
  { id: 'satkhira', nameEn: 'Shyamnagar, Satkhira', nameBn: 'শ্যামনগর, সাতক্ষীরা', lat: 22.3306, lon: 89.1028, baseEc2025: 11.4, slopePerDecade: 1.2, cropsEn: 'Dhaincha, BRRI dhan67, Sunflower', cropsBn: 'ধইঞ্চা, ব্রি ধান৬৭, সূর্যমুখী' },
  { id: 'dacope', nameEn: 'Dacope, Khulna', nameBn: 'দাকোপ, খুলনা', lat: 22.5721, lon: 89.5105, baseEc2025: 8.6, slopePerDecade: 1.0, cropsEn: 'Sunflower (BARI-2), BRRI dhan67, BRRI dhan73', cropsBn: 'সূর্যমুখী (বারি-২), ব্রি ধান৬৭, ব্রি ধান৭৩' },
  { id: 'koyra', nameEn: 'Koyra, Khulna', nameBn: 'কয়রা, খুলনা', lat: 22.3417, lon: 89.3000, baseEc2025: 10.8, slopePerDecade: 1.1, cropsEn: 'Dhaincha, BRRI dhan67, Spinach', cropsBn: 'ধইঞ্চা, ব্রি ধান৬৭, পালং শাক' },
  { id: 'mongla', nameEn: 'Mongla, Bagerhat', nameBn: 'মোংলা, বাগেরহাট', lat: 22.4833, lon: 89.6000, baseEc2025: 8.2, slopePerDecade: 0.9, cropsEn: 'Sunflower, BRRI dhan73, Relay Khesari', cropsBn: 'সূর্যমুখী, ব্রি ধান৭৩, রিলে খেসারি' },
  { id: 'kalapara', nameEn: 'Kalapara, Patuakhali', nameBn: 'কলাপাড়া, পটুয়াখালী', lat: 21.9833, lon: 90.2333, baseEc2025: 6.8, slopePerDecade: 0.8, cropsEn: 'Watermelon (Mulched), Sunflower, Mungbean', cropsBn: 'তরমুজ (মালচিং), সূর্যমুখী, মুগডাল' },
  { id: 'bhola', nameEn: 'Char Fasson, Bhola', nameBn: 'চর ফ্যাশন, ভোলা', lat: 22.1850, lon: 90.7600, baseEc2025: 4.5, slopePerDecade: 0.6, cropsEn: 'Mustard, Mungbean, BARI Gom-25', cropsBn: 'সরিষা, মুগডাল, বারি গম-২৫' },
  { id: 'subarnachar', nameEn: 'Subarnachar, Noakhali', nameBn: 'সুবর্ণচর, নোয়াখালী', lat: 22.6600, lon: 91.1200, baseEc2025: 4.2, slopePerDecade: 0.5, cropsEn: 'Groundnut, Soybean, Mungbean', cropsBn: 'চীনাবাদাম, সয়াবিন, মুগডাল' }
];

function estimateRegionalEc(lat, lon, year = 2025) {
  // Interpolates regional coastal salinity context based on proximity to SW hypersaline core (Satkhira/Khulna)
  const westWeight = Math.max(0, Math.min(1, (91.6 - lon) / 2.6));
  const southWeight = Math.max(0, Math.min(1, (23.35 - lat) / 1.55));
  const base2025 = 2.8 + westWeight * 5.8 + southWeight * 3.6;
  const yearDelta = ((Number(year) || 2025) - 2025) * 0.09;
  return Number(Math.max(1.5, Math.min(17.5, base2025 + yearDelta)).toFixed(1));
}

function getSrdiClassLabel(ec, isBangla) {
  if (ec < 4.0) return isBangla ? 'SRDI S1 (মৃদু লবণাক্ত: ২–৪ dS/m)' : 'SRDI S1 (Slightly Saline: 2–4 dS/m)';
  if (ec < 8.0) return isBangla ? 'SRDI S2 (মাঝারি লবণাক্ত: ৪–৮ dS/m)' : 'SRDI S2 (Moderately Saline: 4–8 dS/m)';
  if (ec < 12.0) return isBangla ? 'SRDI S3 (তীব্র লবণাক্ত: ৮–১২ dS/m)' : 'SRDI S3 (Strongly Saline: 8–12 dS/m)';
  return isBangla ? 'SRDI S4 (অতি তীব্র লবণাক্ত: >১২ dS/m)' : 'SRDI S4 (Very Strongly Saline: >12 dS/m)';
}

export const MitSalinityMapOverlay = ({
  salinityMapUrl,
  salinityYear,
  salinityDataset,
  farmLat = 22.5721,
  farmLon = 89.5105,
  farmLabel = 'Dacope, Khulna',
  isBangla = false,
  altText = 'MIT Bangladesh Soil Salinity Map'
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const inspectMarkerRef = useRef(null);

  const [viewMode, setViewMode] = useState('map_overlay'); // 'map_overlay' | 'standalone'
  const [basemapId, setBasemapId] = useState('topo'); // 'topo' | 'osm' | 'satellite'
  const [activeEnvKey, setActiveEnvKey] = useState('salinity'); // 'moisture' | 'precipitation' | 'temperature' | 'vegetation' | 'salinity'
  const [showOverlay, setShowOverlay] = useState(true);
  const [opacity, setOpacity] = useState(0.82);

  const activeEnvLayer = ENVIRONMENTAL_LAYERS[activeEnvKey] || ENVIRONMENTAL_LAYERS.salinity || ENVIRONMENTAL_LAYERS.moisture;
  const [overlayRect, setOverlayRect] = useState({ left: 0, top: 0, width: 0, height: 0, visible: false });
  const [imgError, setImgError] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(() => ({
    nameEn: farmLabel,
    nameBn: farmLabel,
    lat: Number(farmLat) || 22.5721,
    lon: Number(farmLon) || 89.5105,
    cropsEn: 'Sunflower (BARI-2), BRRI dhan67, BRRI dhan73',
    cropsBn: 'সূর্যমুখী (বারি-২), ব্রি ধান৬৭, ব্রি ধান৭৩'
  }));

  useEffect(() => {
    setImgError(false);
  }, [salinityMapUrl]);

  const updateOverlayPosition = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      const topLeft = map.project([MIT_SALINITY_PNG_BOUNDS.west, MIT_SALINITY_PNG_BOUNDS.north]);
      const bottomRight = map.project([MIT_SALINITY_PNG_BOUNDS.east, MIT_SALINITY_PNG_BOUNDS.south]);
      const width = Math.max(0, bottomRight.x - topLeft.x);
      const height = Math.max(0, bottomRight.y - topLeft.y);
      setOverlayRect({
        left: topLeft.x,
        top: topLeft.y,
        width,
        height,
        visible: width > 20 && height > 20
      });
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (viewMode !== 'map_overlay' || !mapContainerRef.current) return;

    let canvas;
    try {
      canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (_) {
      setWebglSupported(false);
      return;
    }

    const selectedLayer = MAP_LAYERS.find((l) => l.id === basemapId) || MAP_LAYERS[0];

    const map = new Map({
      container: mapContainerRef.current,
      style: selectedLayer.style,
      center: [90.15, 22.48],
      zoom: 7.35,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

    map.addControl(new NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left');

    const markerEl = document.createElement('div');
    markerEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:4px;background:#14532D;color:#fff;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2px solid #fff;transform:translate(-50%,-100%);white-space:nowrap;cursor:pointer;">
        <span style="width:7px;height:7px;border-radius:50%;background:#4ADE80;display:inline-block;"></span>
        <span>${farmLabel}</span>
      </div>
    `;

    const marker = new Marker({ element: markerEl })
      .setLngLat([Number(farmLon) || 89.5105, Number(farmLat) || 22.5721])
      .addTo(map);

    // Interactive click anywhere on the Bangladesh map to inspect regional salinity
    map.on('click', (e) => {
      const clickedLat = Number(e.lngLat.lat.toFixed(4));
      const clickedLon = Number(e.lngLat.lng.toFixed(4));
      const ecVal = estimateRegionalEc(clickedLat, clickedLon, salinityYear);
      setSelectedSpot({
        nameEn: `Clicked Point (${clickedLat}°N, ${clickedLon}°E)`,
        nameBn: `নির্বাচিত বিন্দু (${clickedLat}°উঃ, ${clickedLon}°পূঃ)`,
        lat: clickedLat,
        lon: clickedLon,
        ecOverride: ecVal,
        cropsEn: ecVal > 8 ? 'Dhaincha, BRRI dhan67, Sunflower' : ecVal > 5 ? 'Sunflower, BRRI dhan73, Khesari' : 'Mustard, Mungbean, BARI Gom-25',
        cropsBn: ecVal > 8 ? 'ধইঞ্চা, ব্রি ধান৬৭, সূর্যমুখী' : ecVal > 5 ? 'সূর্যমুখী, ব্রি ধান৭৩, খেসারি' : 'সরিষা, মুগডাল, বারি গম-২৫'
      });

      if (inspectMarkerRef.current) {
        inspectMarkerRef.current.setLngLat([clickedLon, clickedLat]);
      } else {
        const pinEl = document.createElement('div');
        pinEl.innerHTML = `<div style="width:14px;height:14px;border-radius:50%;background:#DC2626;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`;
        inspectMarkerRef.current = new Marker({ element: pinEl })
          .setLngLat([clickedLon, clickedLat])
          .addTo(map);
      }
    });

    mapRef.current = map;
    markerRef.current = marker;

    const syncEvents = ['load', 'move', 'zoom', 'rotate', 'pitch', 'resize'];
    syncEvents.forEach((evt) => map.on(evt, updateOverlayPosition));
    updateOverlayPosition();

    return () => {
      syncEvents.forEach((evt) => map.off(evt, updateOverlayPosition));
      if (inspectMarkerRef.current) {
        inspectMarkerRef.current.remove();
        inspectMarkerRef.current = null;
      }
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [viewMode, basemapId, farmLat, farmLon, farmLabel, salinityYear, updateOverlayPosition]);

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [90.15, 22.48], zoom: 7.35, bearing: 0, pitch: 0, duration: 700 });
    }
  };

  const handleSelectHotspot = (spot) => {
    setSelectedSpot(spot);
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [spot.lon, spot.lat], zoom: 8.8, duration: 750 });
    }
  };

  const inspectedEc = selectedSpot?.ecOverride ?? estimateRegionalEc(selectedSpot.lat, selectedSpot.lon, salinityYear);

  return (
    <div style={{ marginBottom: '0.85rem' }}>
      {/* NASA Earth Observation Layer Pills Bar (Globe Section Overlays) */}
      <div
        style={{
          padding: '0.55rem 0.85rem',
          background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          borderTopLeftRadius: 'var(--radius-md)',
          borderTopRightRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.45rem'
        }}
      >
        {[
          { key: 'moisture', icon: Droplets, labelEn: 'Soil Moisture', labelBn: 'মাটির আর্দ্রতা', code: 'SMAP' },
          { key: 'precipitation', icon: CloudRain, labelEn: 'Precipitation', labelBn: 'বৃষ্টিপাত', code: 'GPM' },
          { key: 'temperature', icon: ThermometerSun, labelEn: 'Surface Temp', labelBn: 'পৃষ্ঠ তাপ', code: 'POWER' },
          { key: 'vegetation', icon: Activity, labelEn: 'Vegetation (NDVI)', labelBn: 'ফসলের স্বাস্থ্য', code: 'MODIS' },
          { key: 'salinity', icon: Layers, labelEn: 'Soil Salinity (ECe)', labelBn: 'মাটির লবণাক্ততা', code: 'MIT/SRDI' }
        ].map((item) => {
          const isActive = activeEnvKey === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveEnvKey(item.key);
                setShowOverlay(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.34rem 0.72rem',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                backgroundColor: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.14)',
                color: isActive ? '#0B2239' : '#E2F5EA',
                border: isActive ? `1.5px solid ${activeEnvLayer.accentColor}` : '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: isActive ? '0 3px 10px rgba(0, 0, 0, 0.22)' : 'none',
                cursor: 'pointer'
              }}
            >
              <Icon size={13} color={isActive ? activeEnvLayer.accentColor : '#86EFAC'} />
              <span>{isBangla ? item.labelBn : item.labelEn}</span>
              <span
                style={{
                  fontSize: '9px',
                  opacity: isActive ? 0.85 : 0.7,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: isActive ? 'rgba(11, 34, 57, 0.08)' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                {item.code}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowOverlay((prev) => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.34rem 0.7rem',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '600',
            backgroundColor: showOverlay ? 'rgba(16, 185, 129, 0.28)' : 'rgba(255, 255, 255, 0.12)',
            color: showOverlay ? '#A7F3D0' : '#D1D5DB',
            border: '1px solid rgba(255, 255, 255, 0.28)',
            cursor: 'pointer'
          }}
        >
          {showOverlay ? <Eye size={13} color="#86EFAC" /> : <EyeOff size={13} />}
          <span>{isBangla ? (showOverlay ? 'ওভারলে: চালু' : 'ওভারলে: বন্ধ') : (showOverlay ? 'Overlay: ON' : 'Overlay: OFF')}</span>
        </button>
      </div>

      {/* Map Overlay Control Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
          padding: '0.6rem 0.85rem',
          backgroundColor: 'var(--color-bg-cream)',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          fontSize: 'var(--font-size-xs)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setViewMode('map_overlay')}
            className="btn btn-sm"
            style={{
              backgroundColor: viewMode === 'map_overlay' ? 'var(--color-primary-800)' : 'var(--color-bg-surface)',
              color: viewMode === 'map_overlay' ? '#fff' : 'var(--color-text-main)',
              padding: '0.28rem 0.65rem',
              fontSize: '11px'
            }}
          >
            <Layers size={13} />
            <span>{isBangla ? 'ইন্টারেক্টিভ বাংলাদেশ মানচিত্র ওভারলে' : 'Interactive Bangladesh Map Overlay'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('standalone')}
            className="btn btn-sm"
            style={{
              backgroundColor: viewMode === 'standalone' ? 'var(--color-primary-800)' : 'var(--color-bg-surface)',
              color: viewMode === 'standalone' ? '#fff' : 'var(--color-text-main)',
              padding: '0.28rem 0.65rem',
              fontSize: '11px'
            }}
          >
            <span>{isBangla ? 'শুধু রাস্টার চিত্র' : 'Standalone Raster'}</span>
          </button>

          {viewMode === 'map_overlay' && (
            <>
              <select
                value={basemapId}
                onChange={(e) => setBasemapId(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.22rem 0.55rem', fontSize: '11px' }}
                aria-label="Basemap style"
              >
                <option value="topo">{isBangla ? 'CARTO ভয়েজার মানচিত্র' : 'CARTO Voyager Map'}</option>
                <option value="osm">{isBangla ? 'বাংলাদেশ জেলা মানচিত্র (OSM)' : 'Bangladesh Street Map (OSM)'}</option>
                <option value="satellite">{isBangla ? 'উপগ্রহ চিত্র (Esri)' : 'Satellite Imagery (Esri)'}</option>
              </select>

              <button
                type="button"
                onClick={() => setShowOverlay((prev) => !prev)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.25rem 0.55rem', fontSize: '11px' }}
              >
                {showOverlay ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>{showOverlay ? (isBangla ? 'ওভারলে চালু' : 'Overlay ON') : (isBangla ? 'ওভারলে বন্ধ' : 'Overlay OFF')}</span>
              </button>
            </>
          )}
        </div>

        {viewMode === 'map_overlay' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11px' }}>
              <Sliders size={12} />
              <span>{isBangla ? 'স্বচ্ছতা:' : 'Opacity:'} {Math.round(opacity * 100)}%</span>
              <input
                type="range"
                min="0.25"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                style={{ width: '75px', accentColor: 'var(--color-primary-800)' }}
              />
            </label>

            <button
              type="button"
              onClick={handleResetView}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.55rem', fontSize: '11px' }}
            >
              <RotateCcw size={12} />
              <span>{isBangla ? 'পুরো উপকূল দেখুন' : 'Full Coast View'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Coastal Zone Jump Pills */}
      {viewMode === 'map_overlay' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexWrap: 'wrap',
            padding: '0.45rem 0.85rem',
            backgroundColor: '#F8FAF7',
            borderLeft: '1px solid var(--color-border)',
            borderRight: '1px solid var(--color-border)',
            fontSize: '11px'
          }}
        >
          <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Compass size={12} />
            {isBangla ? 'উপকূলীয় অঞ্চল জুম:' : 'Jump to Coastal Zone:'}
          </span>
          {COASTAL_HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={() => handleSelectHotspot(spot)}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '10.5px',
                cursor: 'pointer',
                backgroundColor: selectedSpot?.id === spot.id ? 'var(--color-primary-800)' : '#fff',
                color: selectedSpot?.id === spot.id ? '#fff' : 'var(--color-text-main)',
                fontWeight: selectedSpot?.id === spot.id ? '600' : '500'
              }}
            >
              {isBangla ? spot.nameBn : spot.nameEn}
            </button>
          ))}
        </div>
      )}

      {/* Main Map / Raster Viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: viewMode === 'map_overlay' && webglSupported ? '520px' : 'auto',
          backgroundColor: '#F3F4F6',
          border: '1px solid var(--color-border)',
          borderBottomLeftRadius: 'var(--radius-md)',
          borderBottomRightRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}
      >
        {viewMode === 'map_overlay' && webglSupported ? (
          <>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* Synchronized Georeferenced MIT Coastal Bangladesh Salinity Raster Overlay */}
            {showOverlay && !imgError && overlayRect.visible && (
              <img
                key={salinityMapUrl}
                src={salinityMapUrl}
                alt={altText}
                onError={() => setImgError(true)}
                style={{
                  position: 'absolute',
                  left: `${overlayRect.left}px`,
                  top: `${overlayRect.top}px`,
                  width: `${overlayRect.width}px`,
                  height: `${overlayRect.height}px`,
                  pointerEvents: 'none',
                  opacity,
                  mixBlendMode: basemapId === 'satellite' ? 'screen' : 'multiply',
                  filter: 'contrast(1.06) saturate(1.12)',
                  zIndex: 2,
                  userSelect: 'none'
                }}
              />
            )}

            {/* Floating NASA / MIT Telemetry Card (Top-Left) */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 3,
                width: 'min(265px, 78vw)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.55rem 0.75rem',
                fontSize: '11px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: activeEnvLayer.accentColor,
                    boxShadow: `0 0 6px ${activeEnvLayer.accentColor}`
                  }} />
                  <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#0B2239' }}>
                    {activeEnvLayer.datasetId}
                  </span>
                </div>
                <span style={{
                  fontSize: '9px',
                  fontWeight: '600',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(234, 88, 12, 0.12)',
                  color: '#C2410C'
                }}>
                  {isBangla ? 'ক্যালিব্রেটেড প্রিভিউ' : 'Calibration Preview'}
                </span>
              </div>

              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F2942', lineHeight: 1.2 }}>
                {activeEnvKey === 'salinity' ? `~${inspectedEc} dS/m` : activeEnvLayer.defaultDacopeValue}
              </div>

              <div style={{ fontSize: '10px', color: '#374151', marginTop: '2px', fontWeight: '500' }}>
                {activeEnvKey === 'salinity'
                  ? getSrdiClassLabel(inspectedEc, isBangla)
                  : (isBangla ? activeEnvLayer.dacopeStatusBn : activeEnvLayer.dacopeStatusEn)}
              </div>

              <div style={{ color: 'var(--color-text-secondary)', fontSize: '9px', marginTop: '3px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '2px' }}>
                {isBangla ? activeEnvLayer.satelliteBn : activeEnvLayer.satelliteEn}
              </div>
            </div>

            {/* Interactive Point Inspector Card (Bottom-Right) */}
            {selectedSpot && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  zIndex: 3,
                  width: 'min(290px, 85vw)',
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.8rem',
                  fontSize: '11px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.14)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <strong style={{ color: 'var(--color-primary-900)', fontSize: '11.5px' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-2px' }} />
                    {isBangla ? selectedSpot.nameBn : selectedSpot.nameEn}
                  </strong>
                  <span
                    style={{
                      backgroundColor: inspectedEc >= 8 ? '#FEE2E2' : inspectedEc >= 4 ? '#FEF3C7' : '#DCFCE7',
                      color: inspectedEc >= 8 ? '#991B1B' : inspectedEc >= 4 ? '#92400E' : '#166534',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      fontWeight: '700',
                      fontSize: '10.5px'
                    }}
                  >
                    ~{inspectedEc} dS/m
                  </span>
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px', marginBottom: '0.25rem' }}>
                  {getSrdiClassLabel(inspectedEc, isBangla)}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--color-text-main)' }}>
                  <strong>{isBangla ? 'উপযোগী ফসল:' : 'Adapted Crops:'}</strong>{' '}
                  {isBangla ? selectedSpot.cropsBn : selectedSpot.cropsEn}
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            key={salinityMapUrl}
            src={salinityMapUrl}
            alt={altText}
            onError={() => setImgError(true)}
            style={{ display: 'block', width: '100%', maxHeight: '480px', objectFit: 'contain' }}
          />
        )}
      </div>
    </div>
  );
};

export default MitSalinityMapOverlay;
