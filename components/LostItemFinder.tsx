
import React, { useState, memo, useCallback, useMemo, useEffect } from 'react';
import { calculateLostItem, CalculationResult } from '../services/lostItemService';
import { getLostItemSynthesis } from '../services/geminiService';
import { GlossaryTerm } from './GlossaryEngine';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { WritingEffect } from './WritingEffect';
import { ReadAloudButton } from './ReadAloudButton';
import { audioManager } from './AudioManager';

const ITEM_TYPES = ['Keys', 'Wallet', 'Phone', 'Jewelry', 'Glasses', 'Pet', 'Documents', 'Other'];

const SearchChecklist = memo(({ spots }: { spots: string[] }) => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => {
    setChecked(prev => ({ ...prev, [i]: !prev[i] }));
    audioManager.playPenScratch(0.05);
  };

  return (
    <div className="space-y-3">
      <span className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-[0.3em] block mb-4">Tactical Search Nodes</span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {spots.map((spot, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`flex items-center gap-3 p-4 marker-border text-left transition-all ${checked[i] ? 'bg-marker-green/5 border-marker-green/30 opacity-40' : 'bg-surface hover:border-marker-purple shadow-sm'}`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked[i] ? 'bg-marker-green border-marker-green' : 'border-marker-black/20'}`}>
              {checked[i] && <span className="text-white text-lg">✓</span>}
            </div>
            <span className={`handwritten text-lg italic ${checked[i] ? 'line-through' : 'text-marker-black'}`}>{spot}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

const CompassVisual = memo(({ angle, direction }: { angle: number, direction: string }) => (
  <div className="relative w-full aspect-square max-w-[280px] mx-auto group">
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
      {/* Outer Ring */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-10" />
      <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-5" />

      {/* Cardinal Labels */}
      {['N', 'E', 'S', 'W'].map((label, i) => {
        const rad = (i * 90 - 90) * (Math.PI / 180);
        return (
          <text
            key={label}
            x={100 + 75 * Math.cos(rad)}
            y={105 + 75 * Math.sin(rad)}
            className="font-mono text-[10px] font-black opacity-30 fill-current"
            textAnchor="middle"
          >
            {label}
          </text>
        );
      })}

      {/* Ticks */}
      {[...Array(24)].map((_, i) => (
        <line
          key={i}
          x1="100" y1="12" x2="100" y2="18"
          transform={`rotate(${i * 15}, 100, 100)`}
          stroke="currentColor"
          strokeWidth={i % 6 === 0 ? '2' : '0.5'}
          className="opacity-20"
        />
      ))}

      {/* Needle */}
      <g transform={`rotate(${angle === -1 ? 0 : angle}, 100, 100)`} className="transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)">
        {angle === -1 ? (
          <circle cx="100" cy="100" r="15" fill="var(--marker-purple)" className="animate-pulse opacity-40" />
        ) : (
          <>
            <path d="M100 25 L110 100 L100 115 L90 100 Z" fill="var(--marker-purple)" className="shadow-lg" />
            <path d="M100 175 L95 100 L105 100 Z" fill="currentColor" className="opacity-10" />
          </>
        )}
        <circle cx="100" cy="100" r="4" fill="white" stroke="currentColor" strokeWidth="1" />
      </g>
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-32">
      <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Azimuth Lock</span>
      <span className="heading-marker text-2xl lowercase">{angle === -1 ? 'Center' : `${angle}°`}</span>
    </div>
  </div>
));

const LostItemFinder: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [view, setView] = useState<'input' | 'result'>('input');
  const { userIdentity, setUserIdentity, recordCalculation } = useSyllabusStore();

  const [inputs, setInputs] = useState<{
    itemName: string;
    dateLost: string;
    seekerName: string;
    itemType: string;
    system: 'pythagorean' | 'chaldean';
  }>({
    itemName: '',
    dateLost: new Date().toISOString().split('T')[0],
    seekerName: userIdentity || '',
    itemType: 'Other',
    system: 'pythagorean'
  });

  const [result, setResult] = useState<(CalculationResult & { synthesis?: any }) | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async() => {
    if (!inputs.itemName) {
      return;
    }
    setLoading(true);
    audioManager.playRustle();

    // Sync identity if seeker name is provided
    if (inputs.seekerName) {
      setUserIdentity(inputs.seekerName);
    }

    try {
      const calc = calculateLostItem(inputs.itemName, inputs.dateLost, inputs.seekerName, inputs.system);
      const synthesis = await getLostItemSynthesis(inputs.itemName, calc.interpretation.direction);
      const final = { ...calc, synthesis };
      setResult(final);
      recordCalculation();
      logCalculation('LOST_ITEM', inputs.itemName, final);
      setView('result');
    } catch {
      alert('Signal disruption. Recursive scan failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setView('input');
    audioManager.playRustle();
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 md:px-8 relative max-w-7xl mx-auto pb-48">
      <button onClick={onBack} className="fixed top-6 right-6 brutalist-button !text-[10px] z-[100] flex items-center gap-2">
        <ChevronLeft size={14} /> Index
      </button>

      <header className="w-full text-center space-y-4 mb-16 pt-8 max-w-2xl animate-in fade-in duration-700">
        <h2 className="heading-marker text-6xl md:text-8xl text-marker-purple lowercase leading-none">Find My Stuff</h2>
        <p className="handwritten text-xl text-marker-purple opacity-50 uppercase italic tracking-widest leading-tight">Retrieval heuristics via numerical reduction and spatial archetypes.</p>
      </header>

      {view === 'input' ? (
        <div className="w-full max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-10 marker-border bg-surface shadow-2xl space-y-8">
            <div className="space-y-4">
              <label className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-widest ml-1">Object Identifier</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="What was lost?"
                  className="w-full p-6 text-3xl italic marker-border bg-white outline-none focus:border-marker-purple shadow-inner pr-16"
                  value={inputs.itemName}
                  onChange={e => setInputs({ ...inputs, itemName: e.target.value })}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20" size={24}>🔍</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-widest ml-1">Loss Epoch</label>
                <input
                  type="date"
                  className="w-full p-4 marker-border bg-white italic outline-none focus:border-marker-purple"
                  value={inputs.dateLost}
                  onChange={e => setInputs({ ...inputs, dateLost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-widest ml-1">Subject Signature</label>
                <input
                  type="text"
                  placeholder="Your name..."
                  className="w-full p-4 marker-border bg-white italic outline-none focus:border-marker-purple"
                  value={inputs.seekerName}
                  onChange={e => setInputs({ ...inputs, seekerName: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-widest ml-1">Item Category</label>
                <select className="w-full p-4 marker-border bg-white outline-none focus:border-marker-purple" value={inputs.itemType} onChange={e => setInputs({ ...inputs, itemType: e.target.value })}>
                  {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-widest ml-1">Calculation System</label>
                <div className="flex h-[58px] marker-border overflow-hidden">
                  <button
                    onClick={() => setInputs({ ...inputs, system: 'pythagorean' })}
                    className={`flex-1 text-[10px] font-black uppercase tracking-tighter ${inputs.system === 'pythagorean' ? 'bg-marker-black text-white' : 'bg-white text-marker-black/40'}`}
                  >Pythagorean</button>
                  <button
                    onClick={() => setInputs({ ...inputs, system: 'chaldean' })}
                    className={`flex-1 text-[10px] font-black uppercase tracking-tighter ${inputs.system === 'chaldean' ? 'bg-marker-black text-white' : 'bg-white text-marker-black/40'}`}
                  >Chaldean</button>
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading || !inputs.itemName}
              className="brutalist-button !py-8 w-full !bg-marker-black text-surface text-2xl flex items-center justify-center gap-4 transition-transform active:scale-95"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-lg">🔄</span>
                  Scanning Nodes...
                </>
              ) : (
                'Initialize Search'
              )}
            </button>
          </div>
        </div>
      ) : result && (
        <div className="w-full flex flex-col gap-12 max-w-6xl mx-auto animate-in fade-in duration-1000">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Primary Result Side Panel */}
            <div className="lg:col-span-1 space-y-8">
              <div className="p-10 marker-border border-marker-purple bg-surface shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-8xl heading-marker select-none pointer-events-none uppercase italic">Lock</div>
                <span className="handwritten text-[10px] font-black uppercase text-marker-purple tracking-[0.5em] block mb-8">Primary Vector</span>
                <CompassVisual angle={result.interpretation.angle} direction={result.interpretation.direction} />
                <div className="mt-8 space-y-1">
                  <h3 className="heading-marker text-5xl text-marker-blue lowercase leading-none">{result.interpretation.direction}</h3>
                  <p className="handwritten text-sm text-marker-black/40 uppercase tracking-widest italic">{result.interpretation.roomType}</p>
                </div>
                <button onClick={handleReset} className="mt-12 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 flex items-center gap-2 transition-opacity">
                  <span className="text-lg">🔄</span> New Inquiry
                </button>
              </div>

              {/* Archetype Breakdown */}
              <div className="p-8 marker-border border-marker-black/10 bg-black/[0.02] grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-[8px] uppercase opacity-40 flex items-center gap-1"><span className="text-lg">📍</span> Elevation</span>
                  <p className="handwritten text-sm font-bold italic">{result.interpretation.height}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[8px] uppercase opacity-40 flex items-center gap-1"><span className="text-lg">📦</span> Container Type</span>
                  <p className="handwritten text-sm font-bold italic">{result.interpretation.containers}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[8px] uppercase opacity-40 flex items-center gap-1"><span className="text-lg">⏰</span> Search Timing</span>
                  <p className="handwritten text-sm font-bold italic">{result.interpretation.timing}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[8px] uppercase opacity-40 flex items-center gap-1"><span className="text-lg">📚</span> Local Material</span>
                  <p className="handwritten text-sm font-bold italic">{result.interpretation.materials}</p>
                </div>
              </div>
            </div>

            {/* Main Narrative and Checklist */}
            <div className="lg:col-span-2 space-y-12">
              <section className="space-y-6">
                <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
                  <h3 className="heading-marker text-4xl text-marker-black lowercase">Guided Recovery Plan</h3>
                  <ReadAloudButton text={result.synthesis?.narrative || ''} className="!py-1 !px-2 !text-[9px]" />
                </div>
                <div className="p-10 marker-border border-marker-blue bg-surface shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-[15rem] heading-marker italic select-none pointer-events-none">SIGHT</div>
                  <p className="handwritten text-2xl md:text-3xl italic text-marker-black/80 leading-relaxed font-medium relative z-10">
                    "<WritingEffect text={result.synthesis?.narrative || ''} speed={15} />"
                  </p>
                  {result.synthesis?.finalClue && (
                    <div className="mt-10 pt-10 border-t border-marker-blue/10 relative z-10 flex flex-col gap-4">
                      <span className="handwritten text-[10px] font-black uppercase text-marker-red tracking-[0.4em] italic">Crucial Search Recommendation</span>
                      <p className="heading-marker text-3xl md:text-4xl text-marker-black leading-tight lowercase">"{result.synthesis?.finalClue}"</p>
                    </div>
                  )}
                </div>
              </section>

              <SearchChecklist spots={result.interpretation.specificSpots} />

              <div className="space-y-4">
                <span className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-widest block border-b border-marker-black/5 pb-2">Environmental Attributes</span>
                <div className="flex flex-wrap gap-4 opacity-70">
                  {result.interpretation.keywords.map((kw, i) => (
                    <span key={i} className="px-4 py-1.5 marker-border border-marker-black/20 bg-surface handwritten text-xs italic font-bold text-marker-black/60 shadow-sm">{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostItemFinder;
