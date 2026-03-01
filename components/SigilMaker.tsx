import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { generateSigil } from '../services/geminiService';
import { GlossaryTerm } from './GlossaryEngine';
import { useSyllabusStore } from '../store';
import { logCalculation, getLogs } from '../services/dbService';
import { audioManager } from './AudioManager';

interface SavedSigil {
  id: string;
  intention: string;
  feeling: string;
  sigilUrl: string;
  timestamp: string;
}

const SigilMaker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [view, setView] = useState<'create' | 'history'>('create');
  const [intention, setIntention] = useState('I am aligned with my true purpose');
  const [selectedFeeling, setSelectedFeeling] = useState('Clarity');
  const [sigilUrl, setSigilUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SavedSigil[]>([]);

  const { recordCalculation } = useSyllabusStore();

  const loadHistory = useCallback(async() => {
    const logs = await getLogs('SIGIL_ENGINE') as any[];
    if (logs) {
      setHistory(logs.map(l => JSON.parse(l.result) as SavedSigil));
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, view]);

  const distilled = useMemo(() => {
    if (!intention) {
      return '';
    }
    const clean = intention.toUpperCase().replace(/[^A-Z]/g, '');
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const unique = new Set();
    for (const c of clean) {
      if (!vowels.includes(c)) {
        unique.add(c);
      }
    }
    return Array.from(unique).join(' ');
  }, [intention]);

  const handleSynthesize = async() => {
    if (!intention.trim()) {
      return;
    }
    setLoading(true);
    setSigilUrl(null);
    audioManager.playRustle();

    try {
      const url = await generateSigil(intention, selectedFeeling);
      if (url) {
        setSigilUrl(url);
        const newSigil: SavedSigil = {
          id: Date.now().toString(),
          intention,
          feeling: selectedFeeling,
          sigilUrl: url,
          timestamp: new Date().toISOString()
        };
        logCalculation('SIGIL_ENGINE', intention, newSigil);
        recordCalculation();
        setHistory(prev => [newSigil, ...prev]);
      }
    } catch (e) {
      alert('Sigil synthesis failed. Field collapse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-6 md:px-8 relative max-w-7xl mx-auto pb-48">
      <button
        onClick={onBack}
        className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-surface shadow-xl"
      >
        Index
      </button>

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start pt-12 lg:pt-0">
        <div className="w-full lg:w-[400px] space-y-12 lg:sticky lg:top-20">
          <header className="space-y-4">
            <h2 className="heading-marker text-6xl text-marker-emerald lowercase leading-none"><GlossaryTerm word="Sigil">Sigil</GlossaryTerm> Engine</h2>
            <p className="handwritten text-lg text-marker-teal opacity-60"><GlossaryTerm word="Austin Osman Spare">Austin Osman Spare</GlossaryTerm> Method</p>
          </header>

          <div className="flex gap-2">
            <button
              onClick={() => setView('create')}
              className={`flex-1 py-3 marker-border text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'create' ? 'bg-marker-teal text-white shadow-lg' : 'bg-surface opacity-50 hover:opacity-100'}`}
            >
                Construct
            </button>
            <button
              onClick={() => {
                setView('history'); loadHistory();
              }}
              className={`flex-1 py-3 marker-border text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'history' ? 'bg-marker-teal text-white shadow-lg' : 'bg-surface opacity-50 hover:opacity-100'}`}
            >
                Vault ({history.length})
            </button>
          </div>

          {view === 'create' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-2">
                <label className="handwritten text-sm text-marker-black opacity-40 block ml-1 uppercase tracking-widest font-bold">Manifestation Goal</label>
                <input
                  type="text"
                  placeholder="I am..."
                  className="w-full p-6 text-marker-black text-2xl shadow-sm italic placeholder:opacity-25 marker-border bg-surface focus:border-marker-teal outline-none"
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                />
              </div>

              <div className="p-6 marker-border border-marker-black/10 bg-surface/30">
                <label className="handwritten text-[10px] text-marker-black opacity-40 block mb-2 uppercase tracking-widest">Sigil Core (Consonants)</label>
                <div className="heading-marker text-4xl text-marker-black tracking-[0.2em] h-12">
                  {distilled || <span className="opacity-10 text-xl tracking-normal">awaiting input...</span>}
                </div>
              </div>

              <div className="space-y-4">
                <label className="handwritten text-[10px] text-marker-black opacity-40 block ml-1 uppercase tracking-widest font-bold">Emotional Tone</label>
                <input
                  type="text"
                  placeholder="e.g. Clarity"
                  className="w-full p-4 text-marker-black text-xl shadow-sm italic placeholder:opacity-25 marker-border bg-surface focus:border-marker-teal outline-none"
                  value={selectedFeeling}
                  onChange={(e) => setSelectedFeeling(e.target.value)}
                />
              </div>

              <button
                onClick={handleSynthesize}
                disabled={loading || !intention.trim()}
                className="brutalist-button w-full !py-6 !text-2xl mt-4 !bg-marker-black text-surface hover:scale-[1.01]"
              >
                {loading ? 'Constructing Glyph...' : 'Draw Pattern'}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 w-full min-h-[600px] pb-32">
          {view === 'create' ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
              {loading ? (
                <div className="flex flex-col items-center gap-8">
                  <div className="w-24 h-24 border-4 border-marker-teal border-t-transparent animate-spin rounded-full"></div>
                  <span className="handwritten text-2xl text-marker-teal animate-pulse italic uppercase tracking-widest">Fusing Forms...</span>
                </div>
              ) : sigilUrl ? (
                <div className="w-full flex flex-col items-center gap-10 animate-in fade-in duration-1000">
                  <div className="relative group max-w-md w-full cursor-zoom-in" onClick={() => window.open(sigilUrl, '_blank')}>
                    <div className="absolute inset-0 bg-marker-black translate-x-3 translate-y-3 rounded-lg opacity-10 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                    <div className="relative z-10 bg-surface border-2 border-marker-black rounded-lg p-10 overflow-hidden shadow-2xl transition-transform group-hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-transparent to-black/5 pointer-events-none z-20 opacity-80"></div>
                      <img src={sigilUrl} alt="Synthesized Sigil" className="w-full aspect-square object-contain contrast-125 relative z-10 mix-blend-multiply" />
                      <div className="absolute inset-5 border border-marker-black/10 rounded-sm z-20 pointer-events-none"></div>
                      <div className="absolute top-3 left-3 w-1.5 h-1.5 border-t border-l border-marker-black/30 z-20"></div>
                      <div className="absolute top-3 right-3 w-1.5 h-1.5 border-t border-r border-marker-black/30 z-20"></div>
                      <div className="absolute bottom-3 left-3 w-1.5 h-1.5 border-b border-l border-marker-black/30 z-20"></div>
                      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 border-b border-r border-marker-black/30 z-20"></div>
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <p className="handwritten text-2xl text-marker-black/80 italic">"Glyph Activated."</p>
                    <div className="flex gap-4 justify-center">
                      <a href={sigilUrl} download={`sigil-${intention.slice(0, 10)}.png`} className="brutalist-button !text-[10px] !py-2 !px-6">Export PNG</a>
                      <button onClick={() => {
                        setSigilUrl(null); setIntention('');
                      }} className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100">Clear</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-[0.03] select-none pointer-events-none">
                  <div className="text-[14rem] heading-marker text-marker-black leading-none uppercase">SEAL</div>
                  <p className="handwritten text-4xl uppercase tracking-[0.4em]">Awaiting Intent</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
              {history.length === 0 ? (
                <div className="col-span-full py-40 text-center opacity-10 italic text-4xl uppercase tracking-widest">Vault Empty</div>
              ) : (
                history.map(s => (
                  <div key={s.id} className="p-6 marker-border bg-surface shadow-xl flex flex-col gap-6 group hover:border-marker-teal transition-all">
                    <div className="aspect-square w-full bg-marker-black/5 p-6 marker-border border-marker-black/5 flex items-center justify-center overflow-hidden">
                      <img src={s.sigilUrl} alt={s.intention} className="w-full h-full object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="heading-marker text-2xl lowercase truncate group-hover:text-marker-teal transition-colors">"{s.intention}"</h4>
                      <div className="flex justify-between items-center opacity-40">
                        <span className="handwritten text-[8px] font-bold uppercase tracking-widest">{s.feeling}</span>
                        <span className="text-[8px] font-mono">{new Date(s.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-marker-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {
                        setSigilUrl(s.sigilUrl); setIntention(s.intention); setView('create');
                      }} className="text-[9px] font-black uppercase text-marker-teal">Load</button>
                      <button onClick={() => {
                        const a = document.createElement('a'); a.href = s.sigilUrl; a.download = `sigil-${s.intention.slice(0,10)}.png`; a.click();
                      }} className="text-[9px] font-black uppercase text-marker-black ml-auto">Export</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SigilMaker;
