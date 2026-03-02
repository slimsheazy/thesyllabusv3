
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToolShell } from './ToolShell';
import { calculatePlanetaryHours } from '../services/astrologyService';
import { getPlanetaryHoursAnalysis } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { audioManager } from './AudioManager';
import { PlanetaryHour } from '../types';

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄'
};

const PlanetaryHoursTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userLocation, isCalibrated } = useSyllabusStore();
  const [data, setData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = useCallback(async () => {
    if (!isCalibrated || !userLocation) return;
    
    setLoading(true);
    const now = new Date();
    const result = calculatePlanetaryHours(now, userLocation.lat, userLocation.lng);
    
    if (result) {
      setData(result);
      try {
        const aiRes = await getPlanetaryHoursAnalysis(
          result.currentHour.ruler,
          result.currentHour.isNight,
          result.dayRuler
        );
        setAnalysis(aiRes);
        logCalculation('PLANETARY_HOURS', `Ruler: ${result.currentHour.ruler}`, { ...result, analysis: aiRes });
      } catch (e) {
        console.error('AI Analysis failed', e);
      }
    }
    setLoading(false);
  }, [isCalibrated, userLocation]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const sidebar = useMemo(() => {
    if (!data) return null;
    return (
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <span className="handwritten text-[10px] font-black uppercase opacity-40 block mb-4 tracking-widest">Temporal Sequence</span>
        {data.allHours.map((h: PlanetaryHour) => {
          const isCurrent = data.currentHour.hourNumber === h.hourNumber;
          const start = new Date(h.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div 
              key={h.hourNumber}
              className={`p-3 marker-border flex items-center justify-between transition-all ${isCurrent ? 'bg-marker-amber/10 border-marker-amber scale-[1.02]' : 'bg-surface opacity-60'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{PLANET_SYMBOLS[h.ruler]}</span>
                <span className="handwritten text-xs font-bold">{h.ruler}</span>
              </div>
              <span className="font-mono text-[9px] opacity-40">{start}</span>
            </div>
          );
        })}
      </div>
    );
  }, [data]);

  if (!isCalibrated) {
    return (
      <ToolShell onBack={onBack} title="Planetary Hours" subtitle="Chronos Protocol">
        <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-20">
           <span className="text-6xl opacity-20">♁</span>
           <p className="handwritten text-2xl italic opacity-60 max-w-md">
             "I cannot map the temporal flux without your location. Calibrate your frequency in the main index first."
           </p>
        </div>
      </ToolShell>
    );
  }

  return (
    <ToolShell
      onBack={onBack}
      title="Planetary Hours"
      subtitle={`${data?.dayRuler || '...'}'s Day`}
      titleColor="text-marker-amber"
      loading={loading}
      loadingText="Calculating Temporal Rulers..."
      loadingColor="border-marker-amber"
      sidebar={sidebar}
      secondaryAction={{
        label: 'Recalculate',
        onClick: () => { audioManager.playRustle(); calculate(); }
      }}
    >
      {data && (
        <div className="space-y-12">
          <section className="p-10 marker-border border-marker-amber bg-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[12rem] heading-marker italic select-none pointer-events-none">
                {PLANET_SYMBOLS[data.currentHour.ruler]}
             </div>
             
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-6xl text-marker-amber">{PLANET_SYMBOLS[data.currentHour.ruler]}</span>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-black text-marker-amber tracking-widest">Current Ruler</span>
                    <h3 className="heading-marker text-5xl lowercase leading-none">{data.currentHour.ruler}</h3>
                  </div>
                </div>

                <div className="pt-6 border-t border-marker-black/5">
                  <span className="handwritten text-[10px] uppercase font-black opacity-30 block mb-2">Governance</span>
                  <p className="handwritten text-3xl italic text-marker-black leading-tight">
                    {analysis?.governance || 'Loading archival data...'}
                  </p>
                </div>
             </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 marker-border bg-surface/50 space-y-4">
               <span className="handwritten text-[10px] uppercase font-black opacity-30 block border-b pb-2">Magical Instruction</span>
               <p className="handwritten text-xl italic leading-relaxed text-marker-black/80">
                 "{analysis?.magicalInstruction || 'Awaiting synchronization...'}"
               </p>
            </div>
            <div className="p-8 marker-border bg-marker-black text-white space-y-4 shadow-xl">
               <span className="handwritten text-[10px] uppercase font-black opacity-40 block border-b border-white/10 pb-2">Archival Note</span>
               <p className="handwritten text-sm italic leading-relaxed opacity-80">
                 {analysis?.archivalNote || 'Processing temporal markers...'}
               </p>
            </div>
          </div>
        </div>
      )}
    </ToolShell>
  );
};

export default PlanetaryHoursTool;
