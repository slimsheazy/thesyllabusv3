
import React, { useMemo, memo, useState } from 'react';
import { useSyllabusStore } from '../store';

export interface PlanetPoint {
  name: string;
  degree: number;
  sign: string;
  retrograde?: boolean;
}

export interface HouseCusp {
  house: number;
  degree: number;
  sign: string;
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const GLYPHS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  'North Node': '☊',
  'South Node': '☋',
  Chiron: '⚷',
  Ascendant: 'AC',
  Midheaven: 'MC'
};

const getAbsoluteDegree = (sign: string, degree: number) => (SIGNS.indexOf(sign) * 30 + degree) % 360;

export const ZodiacWheel: React.FC<any> = memo(({ planets = [], houses = [], ascendantDegree = 0 }) => {
  const { isEclipseMode } = useSyllabusStore();
  const [showHouseHelp, setShowHouseHelp] = useState(false);

  // Center is 250, 250 in a 500x500 SVG
  const CENTER = 250;

  // Pivot the wheel so Ascendant is always on the left (180 degrees in polar)
  const rotationOffset = 180 - ascendantDegree;

  const polar = (r: number, d: number) => {
    const rad = ((d + rotationOffset) * Math.PI) / 180.0;
    return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
  };

  const layers = useMemo(() => {
    // 12 Zodiacal Sign Segments (The Outer Ring)
    const signTicks = SIGNS.map((_, i) => {
      const d = i * 30;
      const p1 = polar(215, d), p2 = polar(245, d), m = polar(230, d + 15);
      return {
        p1, p2, m,
        label: SIGNS[i].slice(0, 3).toUpperCase(),
        symbol: SIGN_SYMBOLS[i],
        angle: d + 15 + rotationOffset + 90
      };
    });

    // 12 House Dividing Lines (Natal Engine Protocol)
    const houseLines = houses?.map((h: any) => {
      const d = getAbsoluteDegree(h.sign, h.degree);
      const isAngle = [1, 4, 7, 10].includes(h.house);
      return {
        p1: polar(0, d), // Center
        p2: polar(215, d), // Inner Sign Edge
        label: polar(120, d + 15),
        id: h.house,
        isAngle
      };
    });

    // Aspects
    const aspects = [];
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const d1 = getAbsoluteDegree(planets[i].sign, planets[i].degree);
        const d2 = getAbsoluteDegree(planets[j].sign, planets[j].degree);
        let diff = Math.abs(d1 - d2);
        if (diff > 180) {
          diff = 360 - diff;
        }

        let color = '';
        if (diff <= 8) {
          color = 'var(--marker-purple)';
        } // Conjunction
        else if (Math.abs(diff - 120) <= 8) {
          color = 'var(--marker-green)';
        } // Trine
        else if (Math.abs(diff - 60) <= 6) {
          color = 'var(--marker-blue)';
        } // Sextile
        else if (Math.abs(diff - 90) <= 8 || Math.abs(diff - 180) <= 8) {
          color = 'var(--marker-red)';
        } // Square/Opp

        if (color) {
          aspects.push({ p1: polar(80, d1), p2: polar(80, d2), color });
        }
      }
    }

    // Planets
    const planetPoints = planets.map((p: any) => {
      const absDeg = getAbsoluteDegree(p.sign, p.degree);
      return {
        pos: polar(180, absDeg),
        tick1: polar(215, absDeg),
        tick2: polar(200, absDeg),
        glyph: GLYPHS[p.name] || p.name[0],
        ...p
      };
    });

    return { signTicks, houseLines, aspects, planetPoints };
  }, [planets, houses, rotationOffset]);

  return (
    <div className="w-full max-w-lg mx-auto aspect-square bg-surface border border-marker-black/5 rounded-full relative shadow-2xl p-4 group">
      {/* Logic Documentation */}
      <button
        onClick={() => setShowHouseHelp(!showHouseHelp)}
        className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full border border-marker-black/10 hover:bg-marker-black hover:text-white transition-all shadow-sm"
        aria-label="Natal Logic"
      >
        <span className="text-[10px] font-bold">?</span>
      </button>

      {showHouseHelp && (
        <div className="absolute top-14 right-4 z-30 max-w-[280px] bg-marker-black text-white p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <p className="handwritten text-base italic leading-relaxed">
            The 12 radial segments define the earthly spheres (Houses). Planetary Glyphs are placed at their deterministic degrees within the celestial ring. Standard UTC offsets and Placidus Framework applied.
          </p>
          <button
            onClick={() => setShowHouseHelp(false)}
            className="mt-4 text-[10px] font-black uppercase text-marker-blue tracking-widest hover:text-white transition-colors"
          >
            Acknowledge Protocol
          </button>
        </div>
      )}

      <svg viewBox="0 0 500 500" className="w-full h-full overflow-visible">
        {/* Foundation Rings */}
        <circle cx="250" cy="250" r="215" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        <circle cx="250" cy="250" r="245" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />

        {/* 12 Sign Markers */}
        {layers.signTicks.map(s => (
          <g key={s.label}>
            <line x1={s.p1.x} y1={s.p1.y} x2={s.p2.x} y2={s.p2.y} stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <text
              x={s.m.x} y={s.m.y}
              fontSize="14"
              fontFamily="sans-serif"
              textAnchor="middle"
              fill="currentColor"
              opacity="0.9"
              transform={`rotate(${s.angle}, ${s.m.x}, ${s.m.y})`}
            >
              {s.symbol}
            </text>
          </g>
        ))}

        {/* 12 House Lines (Extending from Center) */}
        {layers.houseLines?.map((h: any) => (
          <g key={h.id}>
            <line
              x1={h.p1.x} y1={h.p1.y} x2={h.p2.x} y2={h.p2.y}
              stroke="currentColor"
              strokeWidth={h.isAngle ? '2' : '0.5'}
              opacity={h.isAngle ? '0.3' : '0.1'}
            />
            <text
              x={h.label.x} y={h.label.y}
              fontSize="12"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
              fill="currentColor"
              opacity="0.3"
            >
              {h.id}
            </text>
          </g>
        ))}

        {/* Aspects Geometry */}
        {layers.aspects.map((a, i) => (
          <line
            key={i}
            x1={a.p1.x} y1={a.p1.y} x2={a.p2.x} y2={a.p2.y}
            stroke={a.color}
            strokeWidth="0.8"
            opacity="0.3"
            strokeDasharray={a.color.includes('purple') ? 'none' : '3 3'}
          />
        ))}

        {/* Planetary Glyphs (Deterministic Placement) */}
        {layers.planetPoints.map((p: any) => (
          <g key={p.name} className="group/planet cursor-help">
            <line
              x1={p.tick1.x} y1={p.tick1.y} x2={p.tick2.x} y2={p.tick2.y}
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.6"
            />
            <g transform={`translate(${p.pos.x}, ${p.pos.y})`}>
              <circle r="16" fill="var(--surface)" stroke="currentColor" strokeWidth="0.5" className="shadow-md" />
              <text
                fontSize="18"
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="currentColor"
                className="select-none font-sans"
              >
                {p.glyph}
              </text>
              {p.retrograde && (
                <text
                  x="10" y="12"
                  fontSize="8"
                  fill="var(--marker-red)"
                  fontWeight="black"
                  className="font-mono"
                >
                  R
                </text>
              )}
            </g>
            <title>{`${p.name}: ${p.degree.toFixed(1)}° ${p.sign}`}</title>
          </g>
        ))}
      </svg>

      {/* Central Axis Node */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-24 h-24 rounded-full border border-marker-black/5 flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-inner">
          <span className="heading-marker text-5xl opacity-5 italic">♁</span>
        </div>
      </div>
    </div>
  );
});
