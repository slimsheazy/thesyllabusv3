
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { getRelocationAnalysis, reverseGeocode } from '../services/geminiService';
import { calculateMapLines } from '../services/astrologyService';
import { useSyllabusStore } from '../store';
import { GlossaryTerm } from './GlossaryEngine';
import { ReadAloudButton } from './ReadAloudButton';
import { RelocationResult } from '../types';
import { audioManager } from './AudioManager';
import L from 'leaflet';

const GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅',
  Neptune: '♆', Pluto: '♇'
};

const PLANET_COLORS: Record<string, string> = {
  'Sun': '#f59e0b',
  'Moon': '#94a3b8',
  'Mercury': '#ec4899',
  'Venus': '#10b981',
  'Mars': '#ef4444',
  'Jupiter': '#a855f7',
  'Saturn': '#4b5563',
  'Uranus': '#06b6d4',
  'Neptune': '#3b82f6',
  'Pluto': '#1e293b'
};

const createCustomIcon = (color: string = 'var(--marker-red)') => L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const MapEvents = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
      audioManager.playPenScratch(0.05);
    }
  });
  return null;
};

const AstroMapTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { isEclipseMode, userLocation, userBirthday, userBirthTime, isCalibrated } = useSyllabusStore();

  const [selectedLoc, setSelectedLoc] = useState<{ lat: number, lng: number, fullName?: string } | null>(null);
  const [analysis, setAnalysis] = useState<RelocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLines, setShowLines] = useState(true);

  const planetaryLines = useMemo(() => {
    if (!userBirthday || !userBirthTime) {
      return [];
    }
    try {
      const localDateTime = new Date(`${userBirthday}T${userBirthTime}`);
      return calculateMapLines(localDateTime);
    } catch {
      return [];
    }
  }, [userBirthday, userBirthTime]);

  const handleLocationSelect = useCallback(async(lat: number, lng: number) => {
    if (!userBirthday || !userBirthTime) {
      return;
    }

    setLoading(true);
    setSelectedLoc({ lat, lng });
    audioManager.playRustle();

    try {
      const [locInfo, astroResult] = await Promise.all([
        reverseGeocode(lat, lng),
        getRelocationAnalysis(userBirthday, userBirthTime, lat, lng)
      ]);
      if (locInfo) {
        setSelectedLoc(locInfo);
      }
      setAnalysis(astroResult);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userBirthday, userBirthTime]);

  useEffect(() => {
    if (isCalibrated && userLocation && !selectedLoc) {
      handleLocationSelect(userLocation.lat, userLocation.lng);
    }
  }, [isCalibrated, userLocation, selectedLoc, handleLocationSelect]);

  return (
    <div className="min-h-full flex flex-col py-12 px-4 md:px-8 relative max-w-7xl mx-auto pb-48">
      <button onClick={onBack} className="fixed top-4 right-4 brutalist-button !text-[10px] z-[3000] bg-surface shadow-xl">Back</button>

      <div className="w-full space-y-10">
        <header className="space-y-4 pt-12 md:pt-0">
          <div className="flex items-center gap-4 text-marker-blue">
            <MapIcon size={48} strokeWidth={1} />
            <h2 className="heading-marker text-6xl md:text-8xl lowercase leading-none">Living Map</h2>
          </div>
          <p className="handwritten text-xl opacity-40 uppercase tracking-[0.3em] italic max-w-2xl leading-tight">
            Certain places hit differently for you. Think of these lines like energetic fingerprints across the globe.
          </p>
        </header>

        {!isCalibrated ? (
          <div className="p-12 marker-border border-marker-red bg-marker-red/[0.02] flex flex-col items-center gap-6 text-center animate-in fade-in">
            <AlertCircle size={40} className="text-marker-red opacity-40" />
            <div className="space-y-2">
              <h3 className="heading-marker text-3xl lowercase">Resonance Required</h3>
              <p className="handwritten text-lg italic opacity-60">"I can't draw your lines without your arrival data. Open the menu and calibrate your frequency first."</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-20">
              <div className="p-6 bg-white marker-border border-marker-black/5 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="handwritten text-[10px] font-black uppercase tracking-widest opacity-40">System Legend</span>
                  <button onClick={() => setShowLines(!showLines)} className={`text-[9px] font-bold uppercase transition-colors ${showLines ? 'text-marker-blue' : 'opacity-40'}`}>
                    {showLines ? 'Lines: ON' : 'Lines: OFF'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(PLANET_COLORS).map(([name, color]) => (
                    <div key={name} className="flex items-center gap-3 group">
                      <span className="text-lg font-sans transition-transform group-hover:scale-125" style={{ color }}>{GLYPHS[name]}</span>
                      <span className="handwritten text-xs font-bold text-marker-black/40 group-hover:text-marker-black transition-colors">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-marker-black text-white marker-border shadow-xl space-y-4">
                <span className="handwritten text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">Instructor Tip</span>
                <p className="handwritten text-sm italic leading-relaxed">
                    "Look for where the lines cross or cluster. Those 'hot spots' are where your internal ☉ ☽ signature gets a volume boost."
                </p>
              </div>
            </aside>

            <main className="lg:col-span-9 space-y-8">
              <div className="w-full h-[600px] marker-border border-marker-black bg-slate-900 shadow-2xl relative overflow-hidden group">
                <MapContainer
                  center={userLocation ? [userLocation.lat, userLocation.lng] : [20, 0]}
                  zoom={userLocation ? 4 : 3}
                  className="w-full h-full"
                  zoomControl={true}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url={isEclipseMode
                      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                    }
                  />
                  <MapEvents onClick={handleLocationSelect} />

                  {selectedLoc && (
                    <Marker position={[selectedLoc.lat, selectedLoc.lng]} icon={createCustomIcon('var(--marker-blue)')}>
                      <Popup className="handwritten italic">Targeted Node: {selectedLoc.fullName || 'Deep Scan Area'}</Popup>
                    </Marker>
                  )}

                  {showLines && planetaryLines.map(line => (
                    <React.Fragment key={line.name}>
                      <Polyline
                        positions={[[-90, line.mcLon], [90, line.mcLon]]}
                        color={PLANET_COLORS[line.name]}
                        weight={2}
                        dashArray="10, 10"
                        opacity={0.4}
                      />
                      <Polyline
                        positions={[[-90, line.icLon], [90, line.icLon]]}
                        color={PLANET_COLORS[line.name]}
                        weight={1}
                        dashArray="5, 15"
                        opacity={0.2}
                      />
                      <Polyline
                        positions={line.horizonPoints}
                        color={PLANET_COLORS[line.name]}
                        weight={3}
                        opacity={0.7}
                      />
                    </React.Fragment>
                  ))}
                </MapContainer>
              </div>

              <div className="w-full min-h-[200px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-6 animate-pulse">
                    <div className="w-10 h-10 border-t-2 border-marker-blue animate-spin rounded-full"></div>
                    <p className="handwritten text-xl italic opacity-40">Calculating regional friction...</p>
                  </div>
                ) : analysis ? (
                  <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-8">
                    <div className="p-8 md:p-12 bg-white marker-border border-marker-blue shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none heading-marker text-[12rem] italic select-none uppercase">Vibe</div>
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-marker-blue font-black italic">Regional Assessment</span>
                          <h3 className="heading-marker text-4xl leading-none">{selectedLoc?.fullName?.split(',')[0]}</h3>
                        </div>
                        <ReadAloudButton text={analysis.vibeCheck} className="!py-1 !px-3 !text-[10px]" />
                      </div>
                      <p className="handwritten text-2xl md:text-3xl text-marker-black/80 leading-relaxed italic font-medium relative z-10">
                           "{analysis.vibeCheck}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysis.angles.map((a, i) => (
                        <div key={i} className="p-6 bg-surface marker-border border-marker-black/5 hover:border-marker-purple transition-all group flex items-center gap-6">
                          <span className="text-4xl font-sans" style={{ color: PLANET_COLORS[a.planet] }}>{GLYPHS[a.planet]}</span>
                          <div className="space-y-1">
                            <span className="heading-marker text-2xl lowercase">{a.planet}</span>
                            <p className="handwritten text-sm italic opacity-60">"In this spot, your {a.planet} is {a.angle.toLowerCase()} here."</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-[0.03] select-none pointer-events-none flex flex-col items-center gap-8">
                    <Search size={80} strokeWidth={1} />
                    <p className="handwritten text-4xl uppercase tracking-[0.2em]">Tap the map to<br/>start scrying</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        )}
      </div>

      <style>{`
        .leaflet-container { background: #0f172a !important; border-radius: 4px; }
        .leaflet-control-container .leaflet-bar a { background-color: #fff; border: 1px solid rgba(0,0,0,0.1); }
        .custom-pin { pointer-events: none; }
      `}</style>
    </div>
  );
};

export default AstroMapTool;
