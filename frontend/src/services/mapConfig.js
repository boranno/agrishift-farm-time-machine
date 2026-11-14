/**
 * AgriShift Map Configuration & Style Provider
 * Provides tile styles, imagery sources, and 3D configuration for MapLibre GL.
 */

// Environment variable credentials (if configured by operator)
export const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || '';
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
export const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || '';
export const TERRAIN_DEM_URL = import.meta.env.VITE_TERRAIN_DEM_URL || '';
const cartoKeyParam = CARTO_API_KEY ? `?key=${encodeURIComponent(CARTO_API_KEY)}` : '';

/**
 * Standard OpenStreetMap Raster Style (Free & Open Source)
 * Usage: Educational & Non-commercial decision-support, subject to OSM Tile Usage Policy.
 */
export const OSM_STYLE = {
  version: 8,
  name: 'OpenStreetMap Standard',
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

/**
 * Satellite Imagery Style
 * Uses Esri World Imagery (ArcGIS Online) as documented public imagery layer
 * Attribution: Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, IGP, and the GIS User Community.
 */
export const SATELLITE_STYLE = {
  version: 8,
  name: 'Satellite World Imagery',
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'satellite-tiles',
      type: 'raster',
      source: 'satellite',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

/**
 * CARTO Voyager raster style
 * Attribution: OpenStreetMap contributors & CARTO
 */
export const TOPO_STYLE = {
  version: 8,
  name: 'CARTO Voyager',
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${cartoKeyParam}`
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'carto-tiles',
      type: 'raster',
      source: 'carto',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export const MAP_LAYERS = [
  { id: 'osm', labelEn: 'Standard Map (OSM)', labelBn: 'সাধারণ মানচিত্র (ওএসএম)', style: OSM_STYLE, isSatellite: false },
  { id: 'satellite', labelEn: 'Satellite Imagery', labelBn: 'উপগ্রহ চিত্র', style: SATELLITE_STYLE, isSatellite: true },
  { id: 'topo', labelEn: 'CARTO Voyager', labelBn: 'CARTO ভয়েজার', style: TOPO_STYLE, isSatellite: false }
];

export const WORLD_PRESET = {
  center: [0, 20],
  zoom: 1.5,
  pitch: 0,
  bearing: 0
};

export const BANGLADESH_PRESET = {
  center: [89.8, 23.6],
  zoom: 7,
  pitch: 0,
  bearing: 0
};

export default {
  OSM_STYLE,
  SATELLITE_STYLE,
  TOPO_STYLE,
  MAP_LAYERS,
  WORLD_PRESET,
  BANGLADESH_PRESET,
  MAPTILER_KEY,
  MAPBOX_TOKEN,
  CARTO_API_KEY,
  TERRAIN_DEM_URL
};
