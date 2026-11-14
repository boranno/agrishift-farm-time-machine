/**
 * Geocoding & Parcel Boundary Geometry Service
 * Provides address search via OpenStreetMap Nominatim and geodesic polygon area calculations.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Searches places worldwide using OpenStreetMap Nominatim.
 * Handles timeouts, rate limits, and network errors gracefully.
 */
export const searchPlaces = async (query) => {
  if (!query || query.trim().length < 2) {
    return { success: true, results: [] };
  }

  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query.trim())}&limit=6&addressdetails=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'bn,en;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `Geocoding request returned status ${response.status}`,
        results: []
      };
    }

    const data = await response.json();
    const formatted = data.map(item => ({
      id: item.place_id,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      importance: item.importance,
      address: item.address || {}
    }));

    return { success: true, results: formatted };
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Geocoding search timed out. Check your internet connection.',
        results: []
      };
    }
    return {
      success: false,
      error: 'Geocoding service unavailable or offline. You can select coordinates directly on the map.',
      results: []
    };
  }
};

/**
 * Reverse geocodes coordinates to a readable address/place name.
 */
export const reverseGeocode = async (lat, lon) => {
  const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'bn,en;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        displayName: data.display_name || '',
        address: data.address || {}
      };
    }
    return { success: false };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Calculates the area of a polygon defined by an array of [lon, lat] coordinates
 * on the WGS84 sphere using the standard spherical excess formula.
 * @param {Array<[number, number]>} coords Array of [longitude, latitude] pairs
 * @returns {number} Area in square meters (m²)
 */
export const calculatePolygonAreaSqMeters = (coords) => {
  if (!coords || coords.length < 3) return 0;

  const EARTH_RADIUS = 6378137; // meters (WGS84)
  const rad = Math.PI / 180;

  // Ensure closed polygon
  const ring = [...coords];
  if (
    ring[0][0] !== ring[ring.length - 1][0] ||
    ring[0][1] !== ring[ring.length - 1][1]
  ) {
    ring.push(ring[0]);
  }

  let totalAngle = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];

    const lon1 = p1[0] * rad;
    const lat1 = p1[1] * rad;
    const lon2 = p2[0] * rad;
    const lat2 = p2[1] * rad;

    totalAngle += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  const area = Math.abs((totalAngle * EARTH_RADIUS * EARTH_RADIUS) / 2.0);
  return isNaN(area) ? 0 : area;
};

/**
 * Converts area in square meters (m²) to common agricultural units.
 */
export const convertAreaFromSqMeters = (sqMeters) => {
  const m2 = Math.max(0, sqMeters);

  // Conversion constants:
  // 1 Decimal (শতক / শতাংশ) = 40.4686 m²
  // 1 Bigha (বিঘা - 33 decimals standard) = 1,335.46 m²
  // 1 Acre (একর) = 4,046.86 m²
  // 1 Hectare (হেক্টর) = 10,000 m²

  return {
    sqMeters: parseFloat(m2.toFixed(1)),
    bigha: parseFloat((m2 / 1335.46).toFixed(2)),
    acre: parseFloat((m2 / 4046.86).toFixed(3)),
    hectare: parseFloat((m2 / 10000).toFixed(3)),
    decimal: parseFloat((m2 / 40.4686).toFixed(2))
  };
};

export default {
  searchPlaces,
  reverseGeocode,
  calculatePolygonAreaSqMeters,
  convertAreaFromSqMeters
};

