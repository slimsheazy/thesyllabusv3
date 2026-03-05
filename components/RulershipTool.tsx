
import React, { useState, useMemo } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

const RULERS: Record<string, string> = {
  'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
  'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
  'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
};

const RulershipTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [positions, setPositions] = useState<Record<string, string>>(
    PLANETS.reduce((acc, p) => ({ ...acc, [p]: 'Aries' }), {})
  );
  const [view, setView] = useState<'input' | 'analysis'>('input');

  const updatePosition = (planet: string, sign: string) => {
    setPositions(prev => ({ ...prev, [planet]: sign }));
    audioManager.playPenScratch(0.05);
  };

  const analysis = useMemo(() => {
    const tree: Record<string, string> = {};
    PLANETS.forEach(p => {
      tree[p] = RULERS[positions[p]];
    });

    const findChain = (startPlanet: string) => {
      const path = [startPlanet];
      let current = startPlanet;
      while (true) {
        const next = tree[current];
        if (path.includes(next)) {
          if (next === current) {
            return { type: 'ruler', planet: next, path };
          }
          return { type: 'loop', planets: path.slice(path.indexOf(next)), path };
        }
        path.push(next);
        current = next;
      }
    };

    const results = PLANETS.map(p => ({ planet: p, chain: findChain(p) }));
    const uniqueEnds = Array.from(new Set(results.map(r => JSON.stringify(r.chain.type === 'ruler' ? r.chain.planet : r.chain.planets.sort()))));

    return { results, uniqueEnds };
  }, [positions]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-6xl mx-auto">
      <button onClick={onBack} className="fixed top-4 right-4 brutalist-button !text-[10px] !px-3 !py-1 z-50 bg-surface shadow-xl">Index</button>

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-20 items-start">
        <div className="w-full lg:w-[400px] space-y-10 lg:sticky lg:top-20">
          <header className="space-y-4">
            <h2 className="heading-marker text-5xl sm:text-7xl text-marker-yellow lowercase leading-none">Chart <GlossaryTerm word="Rulership">Rulership</GlossaryTerm></h2>
            <p className="handwritten text-lg text-marker-red opacity-40 font-bold uppercase tracking-widest italic">Authority Patterning</p>
          </header>

          {view === 'input' && (
            <div className="space-y-4 p-6 marker-border border-marker-red/10 bg-surface shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="handwritten text-[10px] font-bold uppercase text-marker-black/40 tracking-widest block mb-4">Input Sign Placements</span>
              <div className="space-y-3">
                {PLANETS.map(p => (
                  <div key={p} className="flex items-center justify-between gap-4 group">
                    <label className="heading-marker text-xl text-marker-black lowercase w-20">{p}</label>
                    <select
                      value={positions[p]}
                      onChange={(e) => updatePosition(p, e.target.value)}
                      className="flex-1 p-2 marker-border bg-surface italic text-sm outline-none focus:border-marker-red"
                    >
                      {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setView('analysis'); audioManager.playRustle();
                }}
                className="brutalist-button w-full !mt-8 !py-4 !text-xl !bg-marker-red text-white border-marker-red"
              >
                Analyze Power
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 w-full min-h-[500px] pb-32">
          {view === 'analysis' ? (
            <div className="animate-in fade-in duration-700 space-y-12">
              <section className="space-y-6">
                <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
                  <h3 className="heading-marker text-4xl sm:text-5xl text-marker-black lowercase">Authority Nodes</h3>
                  <button onClick={() => setView('input')} className="text-[10px] font-bold uppercase text-marker-black/40 hover:text-marker-red transition-colors">Edit Parameters</button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {analysis.uniqueEnds.map((endJson, i) => {
                    const end = JSON.parse(endJson);
                    const isSingle = typeof end === 'string';
                    return (
                      <div key={i} className="p-8 marker-border border-marker-red bg-surface shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] heading-marker text-8xl group-hover:scale-110 transition-transform">{isSingle ? 'Ω' : '∞'}</div>
                        <span className="handwritten text-[10px] font-bold uppercase text-marker-red tracking-[0.4em] block mb-4">{isSingle ? 'Final Dispositor' : 'Mutual Dispositors'}</span>
                        <h4 className="heading-marker text-5xl sm:text-7xl text-marker-black lowercase">{isSingle ? end : end.join(' + ')}</h4>
                        <div className="handwritten text-xl italic text-marker-black/60 mt-4 leading-relaxed max-w-md">
                          <WritingEffect text={isSingle
                            ? `Energy reports to ${end}. This node acts as the final governor, translating all systemic friction into a singular directive.`
                            : `Power is shared in a closed-loop system between ${end.join(' and ')}. They serve as a collaborative governing body, where each planet's expression is contingent upon the other's resonance.`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-6 animate-in fade-in delay-500 duration-1000">
                <div className="p-10 marker-border border-marker-black bg-marker-black/[0.02] space-y-4">
                  <span className="handwritten text-[10px] font-black uppercase text-marker-black/30 tracking-[0.4em]">Dispositor Dynamics</span>
                  <p className="handwritten text-lg text-marker-black/70 italic leading-relaxed">
                    When planets form <GlossaryTerm word="Mutual Reception">Mutual Dispositors</GlossaryTerm>, they enter a symbiotic state. They bypass the standard hierarchy, creating a private "short-circuit" in the psyche where two distinct drives feed each other directly, often becoming the most resilient part of the individual's inner architecture.
                  </p>
                </div>
              </section>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none text-center">
              <div className="text-[10rem] sm:text-[14rem] heading-marker leading-none uppercase">Null</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Input Sign Placements</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RulershipTool;
