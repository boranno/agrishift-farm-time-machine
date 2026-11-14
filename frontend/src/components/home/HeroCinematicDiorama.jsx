import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Layers,
  CalendarDays,
  Satellite,
  Compass,
  Sprout,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const HeroCinematicDiorama = () => {
  const { isBangla } = useTranslation();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const stage = e.currentTarget;
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 10, y: y * 8 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className="isometric-stage"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="isometric-scene-container"
        style={{
          transform: `rotateY(${mouseOffset.x * 0.7}deg) rotateX(${-mouseOffset.y * 0.7}deg)`,
          position: 'relative'
        }}
      >
        {/* Layer 1: Master 3D Isometric SVG Diorama */}
        <svg
          viewBox="0 0 620 540"
          width="100%"
          height="100%"
          style={{
            display: 'block',
            overflow: 'visible',
            filter: 'drop-shadow(0 35px 50px rgba(4, 28, 14, 0.55))'
          }}
        >
          <defs>
            {/* Gradients for Dimensional Soil Stratum */}
            <linearGradient id="topsoilCutawayLeft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E1C14" />
              <stop offset="35%" stopColor="#3E2723" />
              <stop offset="70%" stopColor="#4E342E" />
              <stop offset="100%" stopColor="#2D1E18" />
            </linearGradient>

            <linearGradient id="topsoilCutawayRight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#23140D" />
              <stop offset="35%" stopColor="#321D17" />
              <stop offset="70%" stopColor="#3E2723" />
              <stop offset="100%" stopColor="#1F120B" />
            </linearGradient>

            <linearGradient id="subsoilHorizon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5D4037" />
              <stop offset="50%" stopColor="#452A20" />
              <stop offset="100%" stopColor="#2B1D19" />
            </linearGradient>

            <linearGradient id="salineAquifer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#37474F" />
              <stop offset="40%" stopColor="#263238" />
              <stop offset="100%" stopColor="#1A2327" />
            </linearGradient>

            {/* Farm Surface Field Gradients */}
            <linearGradient id="paddyFieldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="45%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>

            <linearGradient id="sunflowerFieldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="50%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#A16207" />
            </linearGradient>

            <linearGradient id="dhainchaFieldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="50%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#14532D" />
            </linearGradient>

            <linearGradient id="canalWater" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            <linearGradient id="dykeGrass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A3E635" />
              <stop offset="100%" stopColor="#4D7C0F" />
            </linearGradient>

            <linearGradient id="satelliteFrustum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#38BDF8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.03" />
            </linearGradient>

            {/* Ambient Shadow Filter */}
            <filter id="ambientSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#02140A" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* =========================================================
              A. SUBTLE SPACE / EARTH-OBSERVATION SATELLITE
              ========================================================= */}
          <g transform="translate(430, 20)">
            {/* Conical Telemetry Radar Frustum projecting onto farm below */}
            <polygon
              points="45,45 -180,230 60,330 180,240"
              fill="url(#satelliteFrustum)"
            />

            {/* Scanning Grid Ring on Surface */}
            <ellipse cx="-20" cy="270" rx="90" ry="40" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />

            {/* 3D Satellite Model */}
            {/* Solar Panel Left */}
            <polygon points="-35,38 5,20 12,42 -28,60" fill="#1D4ED8" stroke="#93C5FD" strokeWidth="1" />
            <line x1="-15" y1="29" x2="-8" y2="51" stroke="#93C5FD" strokeWidth="0.8" />

            {/* Spacecraft Central Bus (Hexagonal Prism) */}
            <polygon points="12,42 38,28 55,36 55,60 38,72 12,56" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
            <polygon points="38,28 55,36 38,48 20,38" fill="#FFFFFF" />
            <polygon points="38,48 55,36 55,60 38,72" fill="#E2E8F0" />
            {/* Gold Thermal Blanket Detail */}
            <rect x="24" y="44" width="16" height="12" fill="#F59E0B" rx="1" opacity="0.9" />

            {/* Solar Panel Right */}
            <polygon points="55,36 95,18 102,40 62,58" fill="#1D4ED8" stroke="#93C5FD" strokeWidth="1" />
            <line x1="75" y1="27" x2="82" y2="49" stroke="#93C5FD" strokeWidth="0.8" />

            {/* Communication Dish */}
            <ellipse cx="38" cy="74" rx="10" ry="5" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
            <circle cx="38" cy="74" r="2" fill="#2563EB" />
          </g>

          {/* =========================================================
              B. ISOMETRIC SOIL BLOCK — CUTAWAY EXTRUSION
              Top Rhombus: (310,110) -> (530,200) -> (310,290) -> (90,200)
              Extrusion depth: downward to Y=420
              ========================================================= */}

          {/* Ground Contact Shadow (Bottom Occlusion) */}
          <polygon
            points="90,340 310,430 530,340 460,490 160,490"
            fill="#02140A"
            opacity="0.45"
            filter="blur(16px)"
          />

          {/* 1. FRONT-LEFT SOIL HORIZON CUTAWAY FACE */}
          {/* Main Face Polygon */}
          <polygon
            points="90,200 310,290 310,420 90,330"
            fill="url(#topsoilCutawayLeft)"
          />

          {/* Subsoil Horizon Stratum Layer (15 to 45cm) */}
          <polygon
            points="90,235 310,325 310,380 90,290"
            fill="url(#subsoilHorizon)"
            opacity="0.92"
          />

          {/* Saline Groundwater Table Horizon (45 to 100cm) */}
          <polygon
            points="90,290 310,380 310,420 90,330"
            fill="url(#salineAquifer)"
            opacity="0.95"
          />

          {/* Organic Topsoil Root Network Texture (Fine root lines) */}
          <path
            d="M 120,208 Q 125,225 130,238 M 125,222 Q 135,230 140,240 M 170,225 Q 168,240 175,255 M 220,245 Q 225,260 220,275 M 260,265 Q 270,280 268,295"
            stroke="#D7CCC8"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />

          {/* Saline Capillary Water Boundary Lines */}
          <path
            d="M 90,290 Q 200,340 310,380"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            fill="none"
            opacity="0.8"
          />

          {/* 2. FRONT-RIGHT SOIL HORIZON CUTAWAY FACE */}
          {/* Main Face Polygon */}
          <polygon
            points="310,290 530,200 530,330 310,420"
            fill="url(#topsoilCutawayRight)"
          />

          {/* Subsoil Horizon Stratum Layer (Right) */}
          <polygon
            points="310,325 530,235 530,290 310,380"
            fill="url(#subsoilHorizon)"
            opacity="0.9"
          />

          {/* Saline Table (Right) */}
          <polygon
            points="310,380 530,290 530,330 310,420"
            fill="url(#salineAquifer)"
            opacity="0.9"
          />

          {/* Capillary Line (Right) */}
          <path
            d="M 310,380 Q 420,335 530,290"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            fill="none"
            opacity="0.75"
          />

          {/* Leading Center Edge Highlight (Isometric Corner Spine) */}
          <line
            x1="310"
            y1="290"
            x2="310"
            y2="420"
            stroke="#8D6E63"
            strokeWidth="2"
            opacity="0.6"
          />

          {/* Stratum Depth Markers along Center Spine */}
          <g fontSize="10" fontWeight="bold" fill="#D7CCC8" opacity="0.9" textAnchor="end">
            <line x1="305" y1="290" x2="315" y2="290" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="300" y="294">0 cm</text>

            <line x1="305" y1="325" x2="315" y2="325" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="300" y="329">-15 cm</text>

            <line x1="305" y1="380" x2="315" y2="380" stroke="#60A5FA" strokeWidth="1.5" />
            <text x="300" y="384" fill="#93C5FD">-45 cm</text>

            <line x1="305" y1="420" x2="315" y2="420" stroke="#93C5FD" strokeWidth="1.5" />
            <text x="300" y="418" fill="#93C5FD">-100 cm</text>
          </g>

          {/* =========================================================
              C. TOP ISOMETRIC SURFACE — COASTAL AGRICULTURAL PARCEL
              ========================================================= */}

          {/* Base Top Surface Rhombus */}
          <polygon
            points="310,110 530,200 310,290 90,200"
            fill="#14532D"
          />

          {/* Plot 1: Aman Rice Paddy Field (Left quadrant) */}
          <polygon
            points="140,190 280,132 230,195 105,200"
            fill="url(#paddyFieldGrad)"
          />
          {/* Rice crop row textures (isometric lines) */}
          <line x1="145" y1="184" x2="250" y2="140" stroke="#86EFAC" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
          <line x1="135" y1="192" x2="240" y2="148" stroke="#86EFAC" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
          <line x1="125" y1="198" x2="225" y2="157" stroke="#86EFAC" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />

          {/* Bunds / Ail (Field Boundaries) */}
          <path d="M 140,190 L 280,132 L 310,145 L 230,195 Z" fill="#4E342E" opacity="0.5" />

          {/* Plot 2: Rabi Sunflower & Mustard Field (Right quadrant) */}
          <polygon
            points="310,145 480,185 390,250 240,195"
            fill="url(#sunflowerFieldGrad)"
          />
          {/* Golden blossom isometric rows */}
          <line x1="320" y1="155" x2="440" y2="198" stroke="#FEF08A" strokeWidth="2" strokeDasharray="4 4" opacity="0.9" />
          <line x1="300" y1="168" x2="420" y2="212" stroke="#FEF08A" strokeWidth="2" strokeDasharray="4 4" opacity="0.9" />
          <line x1="280" y1="182" x2="395" y2="228" stroke="#FEF08A" strokeWidth="2" strokeDasharray="4 4" opacity="0.9" />

          {/* Plot 3: Dhaincha Green Manure Biomass Plot (Foreground center-left) */}
          <polygon
            points="140,215 250,195 285,255 180,265"
            fill="url(#dhainchaFieldGrad)"
          />
          <line x1="160" y1="225" x2="250" y2="225" stroke="#BBF7D0" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.75" />
          <line x1="170" y1="240" x2="265" y2="240" stroke="#BBF7D0" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.75" />

          {/* Freshwater Irrigation Canal cutting diagonally */}
          <polygon
            points="225,115 250,115 340,285 310,290"
            fill="url(#canalWater)"
          />
          <line x1="237" y1="115" x2="325" y2="288" stroke="#BAE6FD" strokeWidth="1" opacity="0.8" />

          {/* Coastal Polder Embankment (Raised earthen perimeter) */}
          <polygon
            points="90,200 135,182 145,190 100,208"
            fill="url(#dykeGrass)"
          />
          <polygon
            points="100,208 145,190 280,260 235,280"
            fill="url(#dykeGrass)"
          />

          {/* =========================================================
              D. 3D ISOMETRIC PHYSICAL ASSETS (Barn, Windmill, Silo)
              ========================================================= */}

          {/* 1. Coastal Homestead Barn */}
          <g transform="translate(190, 130)">
            {/* Contact Drop Shadow */}
            <polygon points="10,40 45,25 65,35 30,50" fill="#062413" opacity="0.5" />
            {/* Barn Walls (Sunlit front + shaded side) */}
            <polygon points="15,25 35,16 35,38 15,46" fill="#F8FAFC" />
            <polygon points="35,16 55,24 55,44 35,38" fill="#CBD5E1" />
            {/* Barn Roof (Terracotta Red) */}
            <polygon points="12,24 25,12 45,20 32,32" fill="#DC2626" />
            <polygon points="25,12 45,4 65,12 45,20" fill="#B91C1C" />
            {/* Door */}
            <rect x="20" y="32" width="6" height="11" fill="#78350F" />
          </g>

          {/* 2. Agricultural Silo */}
          <g transform="translate(245, 140)">
            <ellipse cx="14" cy="35" rx="10" ry="4" fill="#062413" opacity="0.4" />
            <path d="M 6,15 L 6,32 Q 14,37 22,32 L 22,15 Z" fill="#E2E8F0" />
            <path d="M 14,15 L 14,35 Q 18,34 22,32 L 22,15 Z" fill="#94A3B8" />
            <ellipse cx="14" cy="15" rx="8" ry="3" fill="#F8FAFC" />
            {/* Dome top */}
            <path d="M 6,15 Q 14,8 22,15 Z" fill="#CBD5E1" />
          </g>

          {/* 3. Windmill Tower with Lattice & Blades */}
          <g transform="translate(130, 135)">
            {/* Tower Shadow */}
            <ellipse cx="15" cy="48" rx="8" ry="3" fill="#062413" opacity="0.45" />
            {/* Lattice Legs */}
            <line x1="8" y1="48" x2="15" y2="16" stroke="#475569" strokeWidth="1.5" />
            <line x1="22" y1="48" x2="15" y2="16" stroke="#334155" strokeWidth="1.5" />
            <line x1="10" y1="36" x2="20" y2="36" stroke="#475569" strokeWidth="1" />
            <line x1="12" y1="26" x2="18" y2="26" stroke="#475569" strokeWidth="1" />
            {/* Hub */}
            <circle cx="15" cy="16" r="3.5" fill="#1E293B" />
            {/* Windmill Blades */}
            <line x1="15" y1="16" x2="15" y2="2" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
            <line x1="15" y1="16" x2="28" y2="23" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
            <line x1="15" y1="16" x2="3" y2="24" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* 4. Directional Sunlight Ray cutting across the parcel */}
          <polygon
            points="310,110 530,200 420,290 200,200"
            fill="url(#satelliteFrustum)"
            opacity="0.25"
            style={{ mixBlendMode: 'screen' }}
          />
        </svg>

        {/* =========================================================
            LAYER 2: THREE FLOATING INSIGHT PANELS (Z-DEPTH STAGING)
            ========================================================= */}

        {/* Panel 1: Selected Farm Geolocation (Top-Left Foreground) */}
        <div
          className="cinematic-panel cinematic-panel-1 anim-float-a"
          style={{
            transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 45px)`,
            minWidth: '220px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MapPin size={18} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                {isBangla ? 'শ্যামনগর, সাতক্ষীরা' : 'Syamnagar, Satkhira'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                {isBangla ? 'কৃষি-পরিবেশ অঞ্চল ১৩ (গাঙ্গেয় বদ্বীপ)' : 'AEZ 13 • Ganges Tidal Delta'}
              </div>
            </div>
          </div>
          <div style={{
            marginTop: '0.45rem',
            paddingTop: '0.45rem',
            borderTop: '1px solid #E2E8DF',
            fontSize: '9px',
            color: 'var(--color-text-muted)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {isBangla ? 'নমুনা খামার প্রোফাইল' : 'Sample Farm Profile'}
          </div>
        </div>

        {/* Panel 2: Soil Stratum & Salinity Horizon (Midground Right) */}
        <div
          className="cinematic-panel cinematic-panel-2 anim-float-b"
          style={{
            transform: `translate3d(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px, 35px)`,
            minWidth: '240px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                {isBangla ? 'মাটির স্তর: গাঙ্গেয় এঁটেল দোআঁশ' : 'Soil Stratum: Clay Loam'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-marginal-text)', fontWeight: '600', marginTop: '1px' }}>
                {isBangla ? 'গভীরতা ০-৪৫ সেমি • মাঝারি লবণাক্ততা' : 'Horizon 0–45 cm • Saline Caution'}
              </div>
            </div>
          </div>
          <div style={{
            marginTop: '0.45rem',
            paddingTop: '0.45rem',
            borderTop: '1px solid #E2E8DF',
            fontSize: '9px',
            color: 'var(--color-text-muted)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {isBangla ? 'পরীক্ষামূলক মৃত্তিকা স্তরবিন্যাস' : 'Demonstration Soil Profile'}
          </div>
        </div>

        {/* Panel 3: 3-Season Rotation Sequence (Foreground Bottom-Left) */}
        <div
          className="cinematic-panel cinematic-panel-3 anim-float-a"
          style={{
            transform: `translate3d(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px, 55px)`,
            minWidth: '280px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CalendarDays size={14} color="#15803D" />
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                {isBangla ? '৩-মৌসুম ফসল পর্যায়ক্রম' : '3-Season Crop Strategy'}
              </span>
            </div>
            <span style={{
              fontSize: '9px',
              fontWeight: 'bold',
              color: '#065F46',
              backgroundColor: '#D1FAE5',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              {isBangla ? 'সুপারিশকৃত' : 'Planned'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11px' }}>
            <span style={{ fontWeight: '600', color: '#166534' }}>
              {isBangla ? 'ধইঞ্চা' : 'Dhaincha'}
            </span>
            <span style={{ color: '#94A3B8' }}>&rarr;</span>
            <span style={{ fontWeight: '600', color: '#166534' }}>
              {isBangla ? 'আমন ধান' : 'Aman Rice'}
            </span>
            <span style={{ color: '#94A3B8' }}>&rarr;</span>
            <span style={{ fontWeight: '600', color: '#B45309' }}>
              {isBangla ? 'সূর্যমুখী' : 'Sunflower'}
            </span>
          </div>

          <div style={{
            marginTop: '0.4rem',
            paddingTop: '0.4rem',
            borderTop: '1px solid #E2E8DF',
            fontSize: '9px',
            color: 'var(--color-text-muted)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {isBangla ? 'নমুনা ফসল চক্র পরিকল্পনা' : 'Sample Rotation Flow'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroCinematicDiorama;
