import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Satellite,
  Compass,
  Droplets,
  CloudRain,
  ThermometerSun,
  Activity,
  Layers,
  RotateCw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Target,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import {
  CONTINENT_POLYGONS,
  REALISTIC_CLOUD_PATTERNS,
  GEOGRAPHIC_WATERSHEDS,
  ENVIRONMENTAL_LAYERS
} from './globeData';

// Vertex Shader for Full-Screen Quad
const VS_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment Shader for Photorealistic Orthographic Ray-Casting Sphere
const FS_SOURCE = `
precision highp float;
varying vec2 v_uv;

uniform sampler2D u_earthTexture;
uniform vec2 u_resolution;
uniform vec2 u_viewAngle; // (lat in radians, lon in radians)
uniform float u_zoom;
uniform float u_time;

void main() {
  // Convert screen coordinates to normalized coordinates centered on globe
  vec2 pixelCoord = gl_FragCoord.xy;
  vec2 center = u_resolution * 0.5;
  center.y = center.y + 12.0; // matching canvas layout offset
  
  float globeRadius = min(u_resolution.x, u_resolution.y) * 0.36 * u_zoom;
  vec2 st = (pixelCoord - center) / globeRadius;
  
  float u = st.x;
  float v = -st.y;
  float d2 = u * u + v * v;

  // Space Background & Rayleigh Atmospheric Corona
  if (d2 > 1.0) {
    float dist = sqrt(d2) - 1.0;
    if (dist < 0.26) {
      float corona = pow(1.0 - dist / 0.26, 3.0) * 0.40;
      // Soft transition from sky blue into subtle AgriShift green haze
      vec3 coronaColor = mix(vec3(0.24, 0.72, 0.98), vec3(0.06, 0.72, 0.50), dist / 0.26);
      gl_FragColor = vec4(coronaColor * corona, corona);
    } else {
      discard;
    }
    return;
  }

  // Inside the 3D Sphere!
  float w = sqrt(max(0.0, 1.0 - d2));
  vec3 N = vec3(u, -v, w); // Surface normal facing camera

  // 1. Pitch around X-axis by -lat0
  float phi0 = u_viewAngle.x;
  float lam0 = u_viewAngle.y;

  float cosPhi = cos(-phi0);
  float sinPhi = sin(-phi0);
  float cosLam = cos(lam0);
  float sinLam = sin(lam0);

  vec3 p1 = vec3(N.x, N.y * cosPhi - N.z * sinPhi, N.y * sinPhi + N.z * cosPhi);
  vec3 p2 = vec3(p1.x * cosLam + p1.z * sinLam, p1.y, -p1.x * sinLam + p1.z * cosLam);

  float lat = asin(clamp(p2.y, -1.0, 1.0));
  float lon = atan(p2.x, p2.z);

  float texU = (lon + 3.14159265359) / (2.0 * 3.14159265359);
  float texV = 0.5 - lat / 3.14159265359;

  // Sample official NASA Blue Marble Earth Texture
  vec4 earthColor = texture2D(u_earthTexture, vec2(texU, texV));

  // Natural Space Lighting (Sunlight source at upper-left)
  vec3 sunDir = normalize(vec3(-0.42, 0.46, 0.78));
  float NdotL = max(0.0, dot(N, sunDir));
  float sunLight = 0.42 + 0.68 * NdotL;

  // Specular Reflection on Marine Waters
  bool isWater = (earthColor.b > earthColor.r * 1.10) && (earthColor.g < earthColor.b * 1.12);
  float specular = 0.0;
  if (isWater) {
    vec3 reflectDir = reflect(-sunDir, N);
    specular = pow(max(0.0, dot(reflectDir, vec3(0.0, 0.0, 1.0))), 24.0) * 0.48;
  }

  // Atmospheric Rayleigh Limb Scattering (Iconic Blue Marble Horizon)
  float limb = pow(1.0 - w, 2.5);
  vec3 limbGlow = vec3(0.38, 0.78, 1.0) * limb * 0.65;

  vec3 finalColor = earthColor.rgb * sunLight + vec3(specular) + limbGlow;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const HeroNasaGlobe = () => {
  const { isBangla } = useTranslation();
  const containerRef = useRef(null);
  const glCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  // Active environmental layer ('moisture', 'precipitation', 'temperature', 'vegetation')
  const [activeLayerKey, setActiveLayerKey] = useState('moisture');
  const activeLayer = ENVIRONMENTAL_LAYERS[activeLayerKey] || ENVIRONMENTAL_LAYERS.moisture;

  // Toggle for Data Overlay vs. Natural Blue Marble
  const [showDataOverlay, setShowDataOverlay] = useState(true);

  // Globe orientation state (Center view angles in degrees)
  // Default centered near Bangladesh / South Asia (Lat 22.0°N, Lon 89.5°E)
  const [viewAngle, setViewAngle] = useState({ lat: 21.5, lon: 89.5 });
  const [zoom, setZoom] = useState(1.08);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Drag interaction refs
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const viewAngleRef = useRef({ lat: 21.5, lon: 89.5 });
  const zoomRef = useRef(1.08);
  const isAutoRotatingRef = useRef(true);
  const showDataOverlayRef = useRef(true);

  // Animation frame ref
  const animFrameIdRef = useRef(null);
  const satelliteAngleRef = useRef(0.85); // Radians along orbit
  const pulsePhaseRef = useRef(0);
  const cloudDriftRef = useRef(0);

  // WebGL references
  const glProgramRef = useRef(null);
  const glTextureRef = useRef(null);
  const isTextureLoadedRef = useRef(false);

  // Realistic NASA SMAP Spacecraft Asset Reference
  const smapImgRef = useRef(null);
  const isSmapImgLoadedRef = useRef(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/assets/nasa_smap_spacecraft.png';
    img.onload = () => {
      smapImgRef.current = img;
      isSmapImgLoadedRef.current = true;
    };
  }, []);

  // Sync refs with state
  useEffect(() => {
    viewAngleRef.current = viewAngle;
  }, [viewAngle]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    showDataOverlayRef.current = showDataOverlay;
  }, [showDataOverlay]);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsAutoRotating(false);
      isAutoRotatingRef.current = false;
    }
  }, []);

  // Quick focus on Bangladesh / Coastal Delta
  const handleFocusBangladesh = useCallback(() => {
    setViewAngle({ lat: 22.0, lon: 89.5 });
    viewAngleRef.current = { lat: 22.0, lon: 89.5 };
    setZoom(1.16);
    zoomRef.current = 1.16;
  }, []);

  // 3D Camera Coordinate Transformation (Orthographic for Overlay)
  const toCamCoords = useCallback((lat, lon, lat0, lon0) => {
    const phi = (lat * Math.PI) / 180;
    const lam = (lon * Math.PI) / 180;
    const phi0 = (lat0 * Math.PI) / 180;
    const lam0 = (lon0 * Math.PI) / 180;

    // Unit sphere Cartesian coords
    const X = Math.cos(phi) * Math.cos(lam);
    const Y = Math.cos(phi) * Math.sin(lam);
    const Z = Math.sin(phi);

    // 1. Rotate around Z-axis by -lam0
    const x1 = X * Math.cos(lam0) + Y * Math.sin(lam0);
    const y1 = -X * Math.sin(lam0) + Y * Math.cos(lam0);
    const z1 = Z;

    // 2. Rotate around y1-axis by -phi0
    const depth = x1 * Math.cos(phi0) + z1 * Math.sin(phi0);
    const xScreen = y1;
    const yScreen = -x1 * Math.sin(phi0) + z1 * Math.cos(phi0);

    return { depth, x: xScreen, y: yScreen };
  }, []);

  // Initialize WebGL Shaders & Load NASA Blue Marble Texture
  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    if (!glCanvas) return;
    const gl = glCanvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    // Compile Shader Helper
    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    glProgramRef.current = program;

    // Quad geometry covering full clip-space
    const quadVertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Create & Configure Earth Texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Initial placeholder 1x1 ocean pixel while texture loads
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([11, 34, 57, 255])
    );
    glTextureRef.current = texture;

    // Load High-Resolution NASA Blue Marble Texture
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/assets/nasa_earth_blue_marble.jpg';
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      isTextureLoadedRef.current = true;
    };

    return () => {
      gl.deleteProgram(program);
      gl.deleteBuffer(posBuffer);
      gl.deleteTexture(texture);
    };
  }, []);

  // Main Render Loop: WebGL 3D Textured Sphere + 2D Data Overlay & Satellite
  useEffect(() => {
    let isRunning = true;

    const render = (time) => {
      if (!isRunning) return;

      // Handle Auto-Rotation
      if (isAutoRotatingRef.current && !isDraggingRef.current) {
        viewAngleRef.current.lon = (viewAngleRef.current.lon + 0.10) % 360;
      }

      // Handle Inertia Damping after drag
      if (!isDraggingRef.current && (Math.abs(velocityRef.current.x) > 0.01 || Math.abs(velocityRef.current.y) > 0.01)) {
        viewAngleRef.current.lon = (viewAngleRef.current.lon - velocityRef.current.x * 0.4) % 360;
        viewAngleRef.current.lat = Math.max(-80, Math.min(80, viewAngleRef.current.lat + velocityRef.current.y * 0.4));
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;
      }

      // Advance satellite orbit, cloud drift, and pulse phase
      satelliteAngleRef.current = (satelliteAngleRef.current + 0.007) % (Math.PI * 2);
      pulsePhaseRef.current = (pulsePhaseRef.current + 0.035) % (Math.PI * 2);
      cloudDriftRef.current = (cloudDriftRef.current + 0.018) % 360;

      const glCanvas = glCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;

      if (glCanvas && overlayCanvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = glCanvas.clientWidth;
        const height = glCanvas.clientHeight;

        if (glCanvas.width !== width * dpr || glCanvas.height !== height * dpr) {
          glCanvas.width = width * dpr;
          glCanvas.height = height * dpr;
          overlayCanvas.width = width * dpr;
          overlayCanvas.height = height * dpr;
        }

        const lat0 = viewAngleRef.current.lat;
        const lon0 = viewAngleRef.current.lon;
        const lat0Rad = (lat0 * Math.PI) / 180;
        const lon0Rad = (lon0 * Math.PI) / 180;

        // -------------------------------------------------------------
        // STEP 1: RENDER 3D NASA BLUE MARBLE TEXTURED GLOBE (WebGL)
        // -------------------------------------------------------------
        const gl = glCanvas.getContext('webgl');
        if (gl && glProgramRef.current) {
          gl.viewport(0, 0, glCanvas.width, glCanvas.height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);

          gl.useProgram(glProgramRef.current);

          const uRes = gl.getUniformLocation(glProgramRef.current, 'u_resolution');
          gl.uniform2f(uRes, glCanvas.width, glCanvas.height);

          const uView = gl.getUniformLocation(glProgramRef.current, 'u_viewAngle');
          gl.uniform2f(uView, lat0Rad, lon0Rad);

          const uZoomLoc = gl.getUniformLocation(glProgramRef.current, 'u_zoom');
          gl.uniform1f(uZoomLoc, zoomRef.current);

          const uTimeLoc = gl.getUniformLocation(glProgramRef.current, 'u_time');
          gl.uniform1f(uTimeLoc, time * 0.001);

          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, glTextureRef.current);
          const uTexLoc = gl.getUniformLocation(glProgramRef.current, 'u_earthTexture');
          gl.uniform1i(uTexLoc, 0);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        // -------------------------------------------------------------
        // STEP 2: RENDER 2D SATELLITE, DATA OVERLAYS & CLOUDS
        // -------------------------------------------------------------
        const ctx = overlayCanvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.clearRect(0, 0, width, height);

          const cx = width / 2;
          const cy = height / 2 - 12;
          const baseR = Math.min(width, height) * 0.36;
          const R = baseR * zoomRef.current;

          // 2A. SATELLITE 3D ORBIT TRACK & BACKGROUND SATELLITE
          const orbitR = R * 1.35;
          const satAngle = satelliteAngleRef.current;
          const orbitTilt = 0.44; // ~98° Polar Sun-Synchronous inclination

          const satX = cx + Math.cos(satAngle) * orbitR;
          const satY = cy + Math.sin(satAngle) * orbitR * Math.cos(orbitTilt);
          const satZ = Math.sin(satAngle) * Math.sin(orbitTilt); // +front, -back

          // Draw orbital path
          ctx.save();
          ctx.strokeStyle = 'rgba(147, 197, 253, 0.22)';
          ctx.setLineDash([3, 5]);
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.ellipse(cx, cy, orbitR, orbitR * Math.cos(orbitTilt), -0.12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // If satellite is behind Earth, draw it now (occluded)
          if (satZ < 0) {
            drawSmapSatellite(ctx, satX, satY, 0.65, false);
          }

          // 2B. CLIPPED PLANETARY SURFACE OVERLAYS (Watersheds & Clouds)
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.clip(); // All terrestrial overlays clipped strictly inside Earth disk

          // Subtle hairline coordinate graticules
          ctx.lineWidth = 0.5;
          [-60, -30, 0, 23.5, 30, 60].forEach((lat) => {
            ctx.beginPath();
            let isFirst = true;
            for (let lon = -180; lon <= 180; lon += 4) {
              const pt = toCamCoords(lat, lon, lat0, lon0);
              if (pt.depth >= 0) {
                const px = cx + pt.x * R;
                const py = cy - pt.y * R;
                if (isFirst) { ctx.moveTo(px, py); isFirst = false; }
                else { ctx.lineTo(px, py); }
              } else {
                isFirst = true;
              }
            }
            ctx.strokeStyle = lat === 0 ? 'rgba(255, 255, 255, 0.14)' : (lat === 23.5 ? 'rgba(52, 211, 153, 0.20)' : 'rgba(255, 255, 255, 0.06)');
            ctx.stroke();
          });

          // GEOGRAPHIC AGRICULTURAL WATERSHED OVERLAYS (No Arbitrary Neon Dots)
          if (showDataOverlayRef.current) {
            GEOGRAPHIC_WATERSHEDS.forEach((ws) => {
              const densePoints = [];
              for (let i = 0; i < ws.polygon.length; i++) {
                const p1 = ws.polygon[i];
                const p2 = ws.polygon[(i + 1) % ws.polygon.length];
                densePoints.push(p1);

                const dLon = p2[0] - p1[0];
                const dLat = p2[1] - p1[1];
                const dist = Math.sqrt(dLon * dLon + dLat * dLat);
                const steps = Math.max(1, Math.floor(dist / 2.0));

                for (let s = 1; s < steps; s++) {
                  const frac = s / steps;
                  densePoints.push([p1[0] + dLon * frac, p1[1] + dLat * frac]);
                }
              }

              ctx.beginPath();
              let isFirst = true;
              let visibleCount = 0;

              densePoints.forEach(([lon, lat]) => {
                const pt = toCamCoords(lat, lon, lat0, lon0);
                if (pt.depth >= 0.05) {
                  visibleCount++;
                  const px = cx + pt.x * R;
                  const py = cy - pt.y * R;
                  if (isFirst) { ctx.moveTo(px, py); isFirst = false; }
                  else { ctx.lineTo(px, py); }
                } else {
                  isFirst = true;
                }
              });

              if (visibleCount > 2) {
                let val = ws.moistureVal;
                if (activeLayerKey === 'precipitation') val = ws.precipitationVal;
                else if (activeLayerKey === 'temperature') val = ws.tempVal;
                else if (activeLayerKey === 'vegetation') val = ws.vegetationVal;

                const norm = Math.max(0, Math.min(1, (val - activeLayer.min) / (activeLayer.max - activeLayer.min)));
                const colorIdx = Math.min(activeLayer.colors.length - 1, Math.floor(norm * activeLayer.colors.length));
                const overlayColor = activeLayer.colors[colorIdx];

                ctx.save();
                ctx.fillStyle = overlayColor;
                ctx.globalAlpha = 0.42;
                ctx.fill();

                ctx.strokeStyle = overlayColor;
                ctx.lineWidth = ws.isTargetStation ? 1.5 : 0.9;
                ctx.globalAlpha = 0.80;
                ctx.stroke();
                ctx.restore();
              }

              // TARGET STATION RETICLE: DACOPE, KHULNA ($22.57°N, 89.51°E)
              if (ws.isTargetStation) {
                const pt = toCamCoords(ws.centerLat, ws.centerLon, lat0, lon0);
                if (pt.depth > 0.12) {
                  const px = cx + pt.x * R;
                  const py = cy - pt.y * R;

                  ctx.save();
                  ctx.strokeStyle = '#34D399';
                  ctx.lineWidth = 1.2;
                  const r = 8 * zoomRef.current;

                  ctx.beginPath();
                  ctx.arc(px, py, r, 0, Math.PI * 2);
                  ctx.stroke();

                  ctx.beginPath();
                  ctx.moveTo(px - r - 4, py); ctx.lineTo(px - r + 2, py);
                  ctx.moveTo(px + r - 2, py); ctx.lineTo(px + r + 4, py);
                  ctx.moveTo(px, py - r - 4); ctx.lineTo(px, py - r + 2);
                  ctx.moveTo(px, py + r - 2); ctx.lineTo(px, py + r + 4);
                  ctx.stroke();

                  ctx.fillStyle = '#FFFFFF';
                  ctx.beginPath();
                  ctx.arc(px, py, 2.2, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.restore();
                }
              }
            });
          }

          // REALISTIC ATMOSPHERIC CLOUD FORMATIONS
          REALISTIC_CLOUD_PATTERNS.forEach((c) => {
            const cloudLon = (c.lon + cloudDriftRef.current * 0.25) % 360;
            const pt = toCamCoords(c.lat, cloudLon, lat0, lon0);
            if (pt.depth > 0.08) {
              const px = cx + pt.x * R;
              const py = cy - pt.y * R;
              const rx = (c.rLon / 180) * Math.PI * R * 0.35;
              const ry = (c.rLat / 90) * Math.PI * R * 0.25;

              ctx.save();
              const cloudGrad = ctx.createRadialGradient(px, py, 0, px, py, Math.max(rx, ry));
              cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${c.opacity * pt.depth * 0.85})`);
              cloudGrad.addColorStop(0.5, `rgba(255, 255, 255, ${c.opacity * 0.45 * pt.depth * 0.85})`);
              cloudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

              ctx.fillStyle = cloudGrad;
              ctx.beginPath();
              ctx.ellipse(px, py, rx, ry, 0.15, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });

          ctx.restore(); // End of planetary surface clipping

          // 2C. FOREGROUND SATELLITE & OBSERVATION SWATH
          if (satZ >= 0) {
            const beamTargetX = cx + (satX - cx) * 0.68;
            const beamTargetY = cy + (satY - cy) * 0.68;

            ctx.save();
            const swathGrad = ctx.createLinearGradient(satX, satY, beamTargetX, beamTargetY);
            swathGrad.addColorStop(0, 'rgba(42, 157, 143, 0.32)');
            swathGrad.addColorStop(0.6, 'rgba(42, 157, 143, 0.10)');
            swathGrad.addColorStop(1, 'rgba(42, 157, 143, 0.01)');

            ctx.fillStyle = swathGrad;
            ctx.beginPath();
            ctx.moveTo(satX, satY);
            ctx.lineTo(beamTargetX - 18, beamTargetY + 6);
            ctx.lineTo(beamTargetX + 18, beamTargetY - 6);
            ctx.closePath();
            ctx.fill();

            // Ground observation swath track (1000 km wide SMAP conical swath footprint)
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.40)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.ellipse(beamTargetX, beamTargetY, 20, 10, -0.2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Draw foreground NASA SMAP satellite model
            drawSmapSatellite(ctx, satX, satY, 1.0, true);
          }

          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [activeLayerKey, activeLayer, toCamCoords]);

  // Realistic NASA SMAP Spacecraft Drawing
  // Uses the official high-resolution NASA SMAP Observatory 3D model asset
  // with golden 6-meter mesh reflector antenna, blue solar array, and Kapton MLI bus.
  const drawSmapSatellite = (ctx, x, y, scale = 1.0, isForeground = true) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // If official high-resolution NASA SMAP asset is loaded, render it directly
    if (isSmapImgLoadedRef.current && smapImgRef.current) {
      // Proportions: 2500x3000 aspect ratio = 1.2
      // Scaled proportionate to Earth disc: width 82px (foreground) / 54px (background)
      const baseW = isForeground ? 82 : 54;
      const baseH = baseW * 1.2;

      // Realistic orbital depth occlusion & distance fading
      if (!isForeground) {
        ctx.globalAlpha = 0.50;
      } else {
        ctx.globalAlpha = 1.0;
        // Spacecraft ambient occlusion shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 12;
      }

      // Orbital flight alignment: tilt observation reflector naturally toward Earth nadir
      ctx.rotate(-0.22);

      // Draw the authentic NASA spacecraft asset centered on orbit coordinates
      ctx.drawImage(smapImgRef.current, -baseW / 2, -baseH / 2, baseW, baseH);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Subtle scientific telemetry beacon (soft pulse, non-distracting)
      if (isForeground) {
        const beaconAlpha = 0.4 + Math.sin(pulsePhaseRef.current * 2) * 0.5;
        ctx.fillStyle = `rgba(52, 211, 153, ${beaconAlpha})`;
        ctx.beginPath();
        ctx.arc(baseW * 0.10, -baseH * 0.16, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // Clean vector fallback while texture loads
    const s = 1.15;

    // 1. Single-Wing 3-Panel Solar Array
    const panelGrad = ctx.createLinearGradient(-36 * s, 0, -10 * s, 0);
    panelGrad.addColorStop(0, '#1E3A8A');
    panelGrad.addColorStop(0.5, '#2563EB');
    panelGrad.addColorStop(1, '#1D4ED8');

    ctx.fillStyle = panelGrad;
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 0.8;
    ctx.fillRect(-38 * s, -7 * s, 28 * s, 14 * s);
    ctx.strokeRect(-38 * s, -7 * s, 28 * s, 14 * s);

    // 2. Spacecraft Chassis (MLI Kapton foil)
    const mliGrad = ctx.createLinearGradient(-4 * s, -5 * s, 8 * s, 7 * s);
    mliGrad.addColorStop(0, '#F59E0B');
    mliGrad.addColorStop(0.6, '#D97706');
    mliGrad.addColorStop(1, '#B45309');

    ctx.fillStyle = mliGrad;
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 1.0;
    ctx.fillRect(-4 * s, -6 * s, 14 * s, 12 * s);
    ctx.strokeRect(-4 * s, -6 * s, 14 * s, 12 * s);

    // 3. Deployable Reflector Antenna
    ctx.save();
    ctx.translate(18 * s, 13 * s);
    ctx.rotate(0.5);
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };

  // Drag Event Handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;

    velocityRef.current = { x: dx, y: dy };
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    viewAngleRef.current.lon = (viewAngleRef.current.lon - dx * 0.35) % 360;
    viewAngleRef.current.lat = Math.max(-80, Math.min(80, viewAngleRef.current.lat + dy * 0.35));

    setViewAngle({ ...viewAngleRef.current });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom wheel handler
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.max(0.85, Math.min(1.4, zoomRef.current + delta));
    setZoom(newZoom);
    zoomRef.current = newZoom;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '540px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* =========================================================
          TOP: SCIENTIFIC ENVIRONMENTAL LAYER CONTROLS & TOGGLE
          ========================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '0.75rem',
          zIndex: 15,
          width: '100%',
          maxWidth: '580px'
        }}
      >
        {[
          { key: 'moisture', icon: Droplets, labelEn: 'Soil Moisture', labelBn: 'মাটির আর্দ্রতা', code: 'SMAP L4' },
          { key: 'precipitation', icon: CloudRain, labelEn: 'Precipitation', labelBn: 'বৃষ্টিপাত', code: 'GPM IMERG' },
          { key: 'temperature', icon: ThermometerSun, labelEn: 'Surface Temp', labelBn: 'পৃষ্ঠ তাপ', code: 'POWER / LST' },
          { key: 'vegetation', icon: Activity, labelEn: 'Vegetation (NDVI)', labelBn: 'ফসলের স্বাস্থ্য', code: 'MODIS NDVI' }
        ].map((item) => {
          const isActive = activeLayerKey === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setActiveLayerKey(item.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.42rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '11.5px',
                fontWeight: isActive ? '700' : '500',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.14)',
                color: isActive ? '#0B2239' : '#E2F5EA',
                border: isActive ? `1.5px solid ${activeLayer.accentColor}` : '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow: isActive ? '0 4px 14px rgba(0, 0, 0, 0.25)' : 'none',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                cursor: 'pointer',
                transition: 'all 200ms ease'
              }}
              title={item.code}
            >
              <Icon size={14} color={isActive ? activeLayer.accentColor : '#86EFAC'} />
              <span>{isBangla ? item.labelBn : item.labelEn}</span>
              <span
                style={{
                  fontSize: '9.5px',
                  opacity: isActive ? 0.85 : 0.6,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: isActive ? 'rgba(11, 34, 57, 0.08)' : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {item.code.split(' ')[0]}
              </span>
            </button>
          );
        })}

        {/* Data Overlay Toggle Switch */}
        <button
          onClick={() => setShowDataOverlay(!showDataOverlay)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.42rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: '600',
            backgroundColor: showDataOverlay ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.12)',
            color: showDataOverlay ? '#A7F3D0' : '#D1D5DB',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)'
          }}
          title={isBangla ? 'ডেটা ওভারলে চালু/বন্ধ' : 'Toggle Data Overlay'}
        >
          {showDataOverlay ? <Eye size={13} color="#86EFAC" /> : <EyeOff size={13} />}
          <span>{isBangla ? (showDataOverlay ? 'ওভারলে: চালু' : 'ওভারলে: বন্ধ') : (showDataOverlay ? 'Overlay: ON' : 'Overlay: OFF')}</span>
        </button>
      </div>

      {/* =========================================================
          CENTER: 3D REALISTIC EARTH GLOBE CANVAS STAGE
          ========================================================= */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          height: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Layer 1: Photorealistic NASA Blue Marble Earth Sphere (WebGL) */}
        <canvas
          ref={glCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            filter: 'drop-shadow(0 25px 45px rgba(2, 28, 15, 0.65))'
          }}
        />

        {/* Layer 2: Transparent Overlay Canvas (Satellite, Watersheds, Clouds, Reticles) */}
        <canvas
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'none'
          }}
        />

        {/* -------------------------------------------------------
            SCIENTIFIC TELEMETRY CARD 1: ACTIVE OBSERVATION PRODUCT
            (Top-Right / Frosted Glass)
            ------------------------------------------------------- */}
        <div className="nasa-globe-card nasa-globe-card-telemetry anim-float-a">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: activeLayer.accentColor,
                  boxShadow: `0 0 6px ${activeLayer.accentColor}`
                }}
              />
              <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#0B2239' }}>
                {activeLayer.datasetId}
              </span>
            </div>
            <span
              style={{
                fontSize: '9px',
                fontWeight: '600',
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(234, 88, 12, 0.12)',
                color: '#C2410C'
              }}
            >
              {isBangla ? 'ক্যালিব্রেটেড প্রিভিউ' : 'Calibration Preview'}
            </span>
          </div>

          <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F2942', lineHeight: 1.2 }}>
            {activeLayer.defaultDacopeValue}
          </div>

          <div style={{ fontSize: '10.5px', color: '#374151', marginTop: '2px', fontWeight: '500' }}>
            {isBangla ? activeLayer.dacopeStatusBn : activeLayer.dacopeStatusEn}
          </div>

          <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '4px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '3px' }}>
            {isBangla ? activeLayer.satelliteBn : activeLayer.satelliteEn}
          </div>
        </div>

        {/* -------------------------------------------------------
            SCIENTIFIC TELEMETRY CARD 2: BANGLADESH GROUND STATION
            (Bottom-Left / Frosted Glass)
            ------------------------------------------------------- */}
        <div className="nasa-globe-card nasa-globe-card-target anim-float-b">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
            <Target size={13} color="#059669" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#064E3B' }}>
              {isBangla ? 'দাকোপ, খুলনা (লক্ষ্য স্টেশন)' : 'Dacope Ground Station (Focus)'}
            </span>
          </div>

          <div style={{ fontSize: '10px', color: '#374151', lineHeight: 1.4 }}>
            <span>{isBangla ? 'অক্ষ/দ্রাঘি: ২২.৫৭°উ, ৮৯.৫১°পূ' : 'Coord: 22.57°N, 89.51°E'}</span>
            <br />
            <strong style={{ color: '#047857' }}>
              {isBangla ? activeLayer.tagBn : activeLayer.tagEn}:
            </strong>{' '}
            {activeLayer.defaultDacopeValue}
          </div>

          <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '3px' }}>
            {isBangla ? 'গঙ্গা জোয়ারভাটা প্লাবনভূমি • লবণ সংবেদনশীল' : 'Ganges Tidal Floodplain • SRDI Baseline'}
          </div>
        </div>

        {/* -------------------------------------------------------
            INTERACTIVE CONTROLS BAR (Play/Pause, Zoom, Focus BD)
            ------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(11, 34, 57, 0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '3px 6px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
            zIndex: 15
          }}
        >
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isAutoRotating ? (isBangla ? 'ঘূর্ণন থামান' : 'Pause Rotation') : (isBangla ? 'ঘূর্ণন চালু করুন' : 'Start Rotation')}
          >
            {isAutoRotating ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>|</span>

          <button
            onClick={() => {
              const nz = Math.min(1.4, zoom + 0.1);
              setZoom(nz);
              zoomRef.current = nz;
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isBangla ? 'বড় করুন' : 'Zoom In'}
          >
            <ZoomIn size={13} />
          </button>

          <button
            onClick={() => {
              const nz = Math.max(0.85, zoom - 0.1);
              setZoom(nz);
              zoomRef.current = nz;
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isBangla ? 'ছোট করুন' : 'Zoom Out'}
          >
            <ZoomOut size={13} />
          </button>

          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>|</span>

          <button
            onClick={handleFocusBangladesh}
            style={{
              background: 'none',
              border: 'none',
              color: '#86EFAC',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              fontWeight: '600'
            }}
            title={isBangla ? 'বাংলাদেশ কেন্দ্র করুন' : 'Focus Bangladesh'}
          >
            <Target size={13} />
            <span>{isBangla ? 'বাংলাদেশ' : 'BD Focus'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          BOTTOM: SCIENTIFIC SCALE LEGEND & MISSION ATTRIBUTION
          ========================================================= */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          marginTop: '0.65rem',
          padding: '0.65rem 0.95rem',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Satellite size={13} color="#86EFAC" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>
              {isBangla ? activeLayer.nameBn : activeLayer.nameEn} ({activeLayer.unit})
            </span>
          </div>

          <span style={{ fontSize: '10px', color: '#D1FAE5' }}>
            {activeLayer.datasetId} • {activeLayer.productType}
          </span>
        </div>

        {/* Color Gradient Scale Bar */}
        <div
          style={{
            height: '7px',
            width: '100%',
            borderRadius: '4px',
            background: `linear-gradient(to right, ${activeLayer.colors.join(', ')})`,
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
            marginBottom: '4px'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#A7F3D0' }}>
          <span>{activeLayer.legendMin}</span>
          <span>{activeLayer.legendMid}</span>
          <span>{activeLayer.legendMax}</span>
        </div>

        {/* Spacecraft Identification Footer Note */}
        <div
          style={{
            marginTop: '6px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '4px',
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '4px'
          }}
        >
          <span>
            {isBangla
              ? 'উপগ্রহ ভিজ্যুয়ালাইজেশন: নাসা স্ম্যাপ (মৃত্তিকা আর্দ্রতা উপগ্রহ, ৬৮৫ কিমি সান-সিনক্রোনাস কক্ষপথ)'
              : 'Spacecraft Model: NASA SMAP (6m Mesh Reflector, 685 km Sun-Synchronous Orbit • Conceptual Scale)'}
          </span>
          <span style={{ opacity: 0.85 }}>
            {isBangla ? 'নাসা স্পেস অ্যাপস ২০২৬' : '2026 NASA Space Apps Challenge'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroNasaGlobe;
