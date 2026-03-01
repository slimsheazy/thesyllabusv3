
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getBiorhythmInterpretation } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';

const CYCLES = [
  { key: 'physical', label: 'Physical', duration: 23, color: '#f87171', description: 'Governs physical strength, coordination, stamina, and resistance to disease.' },
  { key: 'emotional', label: 'Emotional', duration: 28, color: '#60a5fa', description: 'Governs sensitivity, mood, creativity, and nervous system stability.' },
  { key: 'intellectual', label: 'Intellectual', duration: 33, color: '#c084fc', description: 'Governs logical thinking, alertness, memory, and cognitive processing.' }
];

const BiorhythmChart = ({ birthDate, targetDate }: { birthDate: string, targetDate: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const b = new Date(birthDate);
  const t = new Date(targetDate);

  // Create a 30-day window around the target date
  const windowDays = 30;
  const halfWindow = windowDays / 2;

  const getVal = (date: Date, cycle: number) => {
    const diff = date.getTime() - b.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return Math.sin((2 * Math.PI * days) / cycle) * 100;
  };

  const points = useMemo(() => {
    const data: Record<string, string> = {};
    CYCLES.forEach(c => {
      const pathPoints = [];
      for (let i = -halfWindow; i <= halfWindow; i++) {
        const currentDate = new Date(t);
        currentDate.setDate(t.getDate() + i);
        const x = ((i + halfWindow) / windowDays) * 1000;
        const y = 200 - getVal(currentDate, c.duration) * 1.5;
        pathPoints.push(`${x},${y}`);
      }
      data[c.key] = `M ${pathPoints.join(' L ')}`;
    });
    return data;
  }, [birthDate, targetDate]);

  return (
    <div className="w-full aspect-[2/1] min-h-[300px] marker-border bg-marker-black/[0.02] relative overflow-hidden group">
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
        <div className="border-t border-marker-black/20 w-full flex justify-between text-[8px] font-mono uppercase"><span>High</span><span>Charge</span></div>
        <div className="border-t-2 border-marker-black/40 w-full flex justify-between text-[8px] font-mono uppercase"><span>Zero</span><span>Crossing</span></div>
        <div className="border-t border-marker-black/20 w-full flex justify-between text-[8px] font-mono uppercase"><span>Low</span><span>Recuperate</span></div>
      </div>
      <svg viewBox="0 0 1000 400" className="w-full h-full p-4" preserveAspectRatio="none">
        {/* Zero Line */}
        <line x1="0" y1="200" x2="1000" y2="200" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="opacity-10" />
        {/* Current Day Line */}
        <line x1="500" y1="0" x2="500" y2="400" stroke="currentColor" strokeWidth="1" className="opacity-20" />

        {CYCLES.map(c => (
          <path
            key={c.key}
            d={points[c.key]}
            fill="none"
            stroke={c.color}
            strokeWidth="4"
            className="transition-all duration-1000 ease-in-out opacity-80 group-hover:opacity-100"
          />
        ))}

        {/* Center Point Markers */}
        {CYCLES.map(c => {
          const val = getVal(t, c.duration);
          return (
            <circle
              key={c.key + '-dot'}
              cx="500"
              cy={200 - val * 1.5}
              r="6"
              fill={c.color}
              className="animate-pulse shadow-xl"
            />
          );
        })}
      </svg>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 text-[8px] font-black uppercase tracking-widest bg-surface/80 backdrop-blur px-3 py-1 marker-border">
        {CYCLES.map(c => (
          <div key={c.key} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BiorhythmTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<any>(null);
  const { recordCalculation } = useSyllabusStore();

  const metrics = useMemo(() => {
    if (!birthDate) {
      return null;
    }
    const b = new Date(birthDate);
    const t = new Date(targetDate);

    const getVal = (date: Date, cycle: number) => {
      const diff = date.getTime() - b.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return Math.sin((2 * Math.PI * days) / cycle) * 100;
    };

    const physical = Math.round(getVal(t, 23));
    const emotional = Math.round(getVal(t, 28));
    const intellectual = Math.round(getVal(t, 33));

    // A critical day is within 5% of zero
    const isCritical = (val: number) => Math.abs(val) < 8;

    return {
      physical,
      emotional,
      intellectual,
      isPhysicalCritical: isCritical(physical),
      isEmotionalCritical: isCritical(emotional),
      isIntellectualCritical: isCritical(intellectual)
    };
  }, [birthDate, targetDate]);

  const handleInterpret = async() => {
    if (!metrics) {
      return;
    }
    setLoading(true);
    audioManager.playRustle();
    try {
      const data = await getBiorhythmInterpretation({
        physical: metrics.physical,
        emotional: metrics.emotional,
        intellectual: metrics.intellectual
      });
      if (data) {
        setInterpretation(data);
        recordCalculation();
        logCalculation('BIORHYTHM', birthDate, data);
      }
    } catch (err) {
      alert('Signal disruption. Biorhythmic patterns obscured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-7xl mx-auto pb-48">
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-surface shadow-xl">Index</button>

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-20 items-start">
        <div className="w-full lg:w-[400px] space-y-10 lg:sticky lg:top-20">
          <header className="space-y-4 pt-8 lg:pt-0">
            <h2 className="heading-marker text-5xl sm:text-7xl text-marker-teal lowercase leading-none">Biorhythm <GlossaryTerm word="Biorhythm">Monitor</GlossaryTerm></h2>
            <p className="handwritten text-lg text-marker-teal opacity-60 font-bold uppercase tracking-widest italic">Temporal Capacity Monitor</p>
          </header>

          <div className="space-y-6 p-8 marker-border border-marker-teal/10 bg-surface shadow-sm">
            <div className="space-y-2">
              <label className="handwritten text-[10px] font-bold uppercase opacity-40 tracking-widest">Origin Signature (Birth)</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full p-4 marker-border bg-surface italic text-xl outline-none focus:border-marker-teal"
              />
            </div>
            <div className="space-y-2">
              <label className="handwritten text-[10px] font-bold uppercase opacity-40 tracking-widest">Projection Target</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full p-4 marker-border bg-surface italic text-xl outline-none focus:border-marker-teal"
              />
            </div>
            <button
              onClick={handleInterpret}
              disabled={loading || !birthDate}
              className={`brutalist-button w-full !py-6 !text-2xl transition-all ${!birthDate ? 'opacity-30' : '!bg-marker-teal text-white shadow-xl'}`}
            >
              {loading ? 'Synthesizing...' : 'Plot Capacity'}
            </button>
          </div>

          <section className="p-8 marker-border border-dashed border-marker-black/10 space-y-6">
            <h4 className="handwritten text-[10px] font-black uppercase text-marker-black tracking-widest">Theoretical Framework</h4>
            <div className="space-y-4">
              {CYCLES.map(c => (
                <div key={c.key} className="space-y-1">
                  <span className="text-[10px] font-black uppercase" style={{ color: c.color }}>{c.label} Cycle</span>
                  <p className="handwritten text-xs italic opacity-60 leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-marker-black/5">
              <span className="text-[10px] font-black uppercase text-marker-red flex items-center gap-2">
                <span className="animate-pulse">●</span> Critical Days
              </span>
              <p className="handwritten text-xs italic opacity-60 mt-1">Days where the cycle crosses the 0% line. Theoretical points of maximum instability and transition risk.</p>
            </div>
          </section>
        </div>

        <div className="flex-1 w-full min-h-[500px]">
          {metrics ? (
            <div className="animate-in fade-in duration-1000 space-y-12">
              <BiorhythmChart birthDate={birthDate} targetDate={targetDate} />

              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { ...CYCLES[0], val: metrics.physical, critical: metrics.isPhysicalCritical },
                  { ...CYCLES[1], val: metrics.emotional, critical: metrics.isEmotionalCritical },
                  { ...CYCLES[2], val: metrics.intellectual, critical: metrics.isIntellectualCritical }
                ].map((m) => (
                  <div key={m.key} className={`p-8 marker-border bg-surface shadow-lg relative overflow-hidden group ${m.critical ? 'ring-2 ring-marker-red ring-inset border-marker-red' : 'border-marker-black/5'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] heading-marker text-8xl uppercase pointer-events-none group-hover:scale-110 transition-transform">Wave</div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="heading-marker text-2xl lowercase">{m.label}</span>
                        <span className="handwritten text-xl font-black">{m.val}%</span>
                      </div>

                      <div className="h-2 w-full bg-marker-black/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{
                            width: `${Math.abs(m.val)}%`,
                            backgroundColor: m.color,
                            marginLeft: m.val < 0 ? `${50 - Math.abs(m.val / 2)}%` : '50%'
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-center h-4">
                        <span className="text-[8px] font-bold uppercase opacity-30">{m.val > 0 ? 'Charging' : 'Recuperating'}</span>
                        {m.critical && (
                          <span className="bg-marker-red text-white text-[8px] font-black uppercase px-2 py-px rounded animate-pulse shadow-sm">
                              Critical Transition
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {interpretation && (
                <div className="animate-in slide-in-from-bottom-4 duration-700 space-y-8">
                  <div className="p-10 marker-border border-marker-teal bg-surface shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-9xl font-bold italic select-none">SYNTH</div>
                    <span className="handwritten text-[10px] font-bold uppercase text-marker-teal tracking-[0.4em] block mb-4 italic">Heuristic Observation</span>
                    <p className="handwritten text-2xl sm:text-3xl text-marker-black leading-relaxed italic font-medium">
                      <WritingEffect text={interpretation.brief} />
                    </p>
                  </div>
                  <div className="p-8 marker-border border-marker-black bg-marker-black/[0.02] text-center shadow-md">
                    <span className="handwritten text-[10px] font-bold uppercase opacity-40 block mb-2 tracking-widest">Tactical Protocol</span>
                    <p className="heading-marker text-3xl sm:text-5xl text-marker-black lowercase leading-tight max-w-2xl mx-auto">
                        "{interpretation.suggestion}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none text-center">
              <div className="text-[10rem] sm:text-[14rem] heading-marker leading-none uppercase">Null</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Awaiting Temporal Data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiorhythmTool;
