import React, { useState, useMemo } from 'react';
import { SABIAN_SYMBOLS, SIGNS } from '../data/sabianData';
import { GlossaryTerm } from './GlossaryEngine';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { SymbolCard } from './Sabian/SymbolCard';
import { audioManager } from './AudioManager';

function getDailySunDegree() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 2, 21);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
  let absDeg = day % 360;
  if (absDeg < 0) absDeg += 360;
  const signIdx = Math.floor(absDeg / 30);
  const degree = absDeg % 30;
  return { sign: SIGNS[signIdx], degree, label: `${degree}° ${SIGNS[signIdx]}` };
}

export const SabianSymbolsTool = ({ onBack }: { onBack: () => void }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'oracle' | 'lookup'>('daily');
  const [question, setQuestion] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [lookupSign, setLookupSign] = useState(SIGNS[0]);
  const [lookupDegree, setLookupDegree] = useState(0);

  const daily = useMemo(() => getDailySunDegree(), []);
  const { recordCalculation } = useSyllabusStore();

  const draw = () => {
    if (!question.trim()) return;
    audioManager.playRustle();
    const idx = Math.floor(Math.random() * 360);
    const signIdx = Math.floor(idx / 30);
    const deg = idx % 30;
    const res = { sign: SIGNS[signIdx], degree: deg, phrase: SABIAN_SYMBOLS[SIGNS[signIdx]][deg] };
    setResults([res]);
    recordCalculation();
    logCalculation('SABIAN_ORACLE', question, res);
  };

  return (
    <div className="min-h-screen py-20 px-4 md:px-12 max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-8 right-8 brutalist-button !text-[10px] !px-4 !py-1 z-50 bg-surface shadow-xl">Index</button>
      <div className="w-full flex flex-col lg:flex-row gap-12 items-start">
        <aside className="w-full lg:w-[350px] space-y-12 lg:sticky lg:top-20">
          <header className="space-y-4">
            <h2 className="heading-marker text-7xl text-marker-black lowercase leading-none">Sabian <GlossaryTerm word="Oracle">Symbols</GlossaryTerm></h2>
            <p className="handwritten text-lg opacity-40 uppercase tracking-widest italic">The 360 Degrees of Wisdom</p>
          </header>
          <nav className="flex flex-col gap-2">
            {[
              { id: 'daily', label: 'DAILY SUN', tag: 'TODAY' },
              { id: 'oracle', label: 'THE ORACLE', tag: 'INQUIRY' },
              { id: 'lookup', label: 'THE ARCHIVE', tag: 'LOOKUP' }
            ].map(m => (
              <button 
                key={m.id} 
                onClick={() => { setViewMode(m.id as any); audioManager.playRustle(); }} 
                className={`flex items-center justify-between p-6 marker-border text-left transition-all ${viewMode === m.id ? 'bg-marker-black text-surface shadow-xl' : 'bg-surface opacity-50 hover:opacity-100'}`}
              >
                <span className="font-bold tracking-widest">{m.label}</span>
                <span className="text-[9px] font-mono opacity-40">[{m.tag}]</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 w-full min-h-[600px] pb-32">
          {viewMode === 'daily' && <SymbolCard sign={daily.sign} degree={daily.degree} phrase={SABIAN_SYMBOLS[daily.sign][daily.degree]} />}
          {viewMode === 'oracle' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="p-8 marker-border bg-surface shadow-sm space-y-4">
                <textarea 
                  value={question} 
                  onChange={e => setQuestion(e.target.value)} 
                  placeholder="Define the node of inquiry..." 
                  className="w-full p-8 marker-border bg-surface text-3xl italic outline-none bg-transparent" 
                />
                <button onClick={draw} className="brutalist-button w-full !py-6 !text-2xl !bg-marker-black text-surface shadow-xl">Draw From Field</button>
              </div>
              {results.map((r, i) => <SymbolCard key={i} sign={r.sign} degree={r.degree} phrase={r.phrase} isOracle />)}
            </div>
          )}
          {viewMode === 'lookup' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="p-8 marker-border bg-surface shadow-sm space-y-10">
                <div className="space-y-4">
                  <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest block">Select Zodiacal Sign</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {SIGNS.map(s => (
                      <button key={s} onClick={() => { setLookupSign(s); audioManager.playPenScratch(0.05); }} className={`p-2 marker-border text-[10px] font-bold uppercase transition-all ${lookupSign === s ? 'bg-marker-black text-surface' : 'bg-surface opacity-40 hover:opacity-100'}`}>{s.slice(0, 3)}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest block">Select Degree</label>
                    <span className="heading-marker text-5xl text-marker-black">{lookupDegree}°</span>
                  </div>
                  <input type="range" min="0" max="29" value={lookupDegree} onChange={e => setLookupDegree(parseInt(e.target.value))} className="w-full accent-marker-black" />
                </div>
              </div>
              <SymbolCard key={`${lookupSign}-${lookupDegree}`} sign={lookupSign} degree={lookupDegree} phrase={SABIAN_SYMBOLS[lookupSign][lookupDegree]} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SabianSymbolsTool;