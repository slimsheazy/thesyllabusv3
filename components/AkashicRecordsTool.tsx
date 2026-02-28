
import React, { useState, useCallback, memo, useEffect } from 'react';
import { getAkashicAnalysis } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation, getLogs } from '../services/dbService';
import { audioManager } from './AudioManager';
import { ReadAloudButton } from './ReadAloudButton';
import { AkashicResult, ToolProps } from '../types';

interface AkashicReading extends AkashicResult {
  id: string;
  timestamp: string;
  signature: string;
  theme: string;
}

const LABELS = ['A', 'B', 'C', 'D', 'E'];

const LibraryGrid = memo(({ selected, onToggle }: { selected: string[], onToggle: (id: string) => void }) => {
  return (
    <div className="flex flex-col items-center gap-8 p-12 bg-white marker-border border-marker-black shadow-inner w-full max-w-[480px] mx-auto relative group overflow-hidden">
      <div className="absolute inset-0 bg-marker-black/[0.02] pointer-events-none"></div>
      <h3 className="heading-marker text-xs tracking-[0.5em] text-marker-black/40 uppercase font-black">Archive Search Grid</h3>
      <div className="grid grid-cols-5 gap-4 relative z-10">
        {[...Array(25)].map((_, i) => {
          const id = `${LABELS[Math.floor(i / 5)]}${i % 5 + 1}`;
          const active = selected.includes(id);
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className="relative flex items-center justify-center aspect-square transition-all"
            >
              <div className={`w-8 h-8 flex items-center justify-center border transition-all duration-500 font-mono text-[8px] ${active ? 'bg-marker-black text-white border-marker-black scale-110 shadow-lg' : 'bg-transparent border-marker-black/10 text-marker-black/20 hover:border-marker-black/40'}`}>
                {id}
              </div>
              {active && <div className="absolute -inset-1 border border-marker-black/5 animate-pulse rounded-sm" />}
            </button>
          );
        })}
      </div>
      <div className="handwritten text-[10px] text-marker-black/60 uppercase font-black tracking-widest italic border-t border-marker-black/5 pt-4 w-full text-center">
        Recalling {selected.length} / 3 Archival Nodes
      </div>
    </div>
  );
});

const MemorySnapshotViewer = memo(({ current }: { current: AkashicReading }) => (
  <div className="space-y-12 animate-in fade-in duration-1000 pb-48 max-w-4xl mx-auto">
    {/* Metadata Ribbon */}
    <div className="flex flex-wrap justify-between items-center gap-4 opacity-40 border-b border-marker-black/10 pb-4 italic">
      <span className="text-[10px] font-mono uppercase tracking-tighter">ID: {current.id}</span>
      <span className="text-[10px] font-mono uppercase tracking-tighter">LOC: {current.filingMetadata}</span>
      <span className="text-[10px] font-mono uppercase tracking-tighter">EPOCH: {new Date(current.timestamp).toLocaleDateString()}</span>
    </div>

    {/* The Core Memory */}
    <div className="p-10 md:p-16 marker-border border-marker-black bg-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none heading-marker text-[15rem] italic select-none">RECALL</div>
      <div className="flex justify-between items-start mb-10 relative z-10">
        <span className="handwritten text-[10px] font-black uppercase text-marker-blue tracking-[0.6em] italic">The Stored Memory</span>
        <ReadAloudButton text={current.memoryFragment} className="!py-1 !px-2 !text-[9px] !bg-marker-black !text-white" />
      </div>
      <p className="heading-marker text-4xl md:text-5xl text-marker-black leading-tight italic relative z-10">
        "{current.memoryFragment}"
      </p>
    </div>

    {/* Sensory Ledger */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-8 marker-border border-marker-black/10 bg-white space-y-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 font-black text-[10px] text-marker-purple uppercase tracking-widest border-b border-marker-black/5 pb-2">
          Eye Chroma (Visage)
        </div>
        <p className="handwritten text-xl italic text-marker-black/80 leading-relaxed">
          {current.sensoryImpressions.chroma}
        </p>
      </div>

      <div className="p-8 marker-border border-marker-black/10 bg-white space-y-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 font-black text-[10px] text-marker-green uppercase tracking-widest border-b border-marker-black/5 pb-2">
          Wind Aroma (Vapor)
        </div>
        <p className="handwritten text-xl italic text-marker-black/80 leading-relaxed">
          {current.sensoryImpressions.aroma}
        </p>
      </div>

      <div className="p-8 marker-border border-marker-black/10 bg-white space-y-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 font-black text-[10px] text-marker-red uppercase tracking-widest border-b border-marker-black/5 pb-2">
          Books Texture (Tactile)
        </div>
        <p className="handwritten text-xl italic text-marker-black/80 leading-relaxed">
          {current.sensoryImpressions.texture}
        </p>
      </div>
    </div>

    {/* Emotional Residue */}
    <div className="p-12 marker-border border-marker-black bg-marker-black/[0.02] text-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-marker-black/10"></div>
      <span className="handwritten text-[10px] text-marker-black opacity-30 uppercase tracking-[0.8em] block mb-6 font-black italic">Emotional Resonance</span>
      <p className="heading-marker text-3xl md:text-5xl lowercase text-marker-black italic leading-snug">
         "{current.emotionalResonance}"
      </p>
    </div>
  </div>
));

const AkashicRecordsTool: React.FC<ToolProps> = ({ onBack }) => {
  const [view, setView] = useState<'enter' | 'reading' | 'vault'>('enter');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [intent, setIntent] = useState('');
  const [readings, setReadings] = useState<AkashicReading[]>([]);
  const [current, setCurrent] = useState<AkashicReading | null>(null);
  const { recordCalculation, userIdentity } = useSyllabusStore();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async() => {
    const logs = await getLogs('AKASHIC_ACCESS') as any[];
    if (logs) {
      setReadings(logs.map(l => JSON.parse(l.result)));
    }
  };

  const handleToggle = useCallback((id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(n => n !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      audioManager.playPenScratch(0.12);
      return [...prev, id];
    });
  }, []);

  const handleLink = async() => {
    if (selected.length < 3) {
      return;
    }
    setLoading(true);
    audioManager.playRustle();
    const sig = `NODE-${selected.sort().join('-')}`;
    const res = await getAkashicAnalysis({ signature: sig, theme: intent });
    if (res) {
      const reading = { id: `ARCH-${Date.now().toString().slice(-6)}`, timestamp: new Date().toISOString(), signature: sig, theme: intent || 'Universal', ...res };
      setCurrent(reading); setView('reading'); setReadings(p => [reading, ...p]);
      recordCalculation(); logCalculation('AKASHIC_ACCESS', intent || sig, reading);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-6 md:px-12 relative max-w-7xl mx-auto selection:bg-marker-black selection:text-white">
      <button onClick={onBack} className="fixed top-6 right-6 brutalist-button !text-[10px] z-[100] flex items-center gap-2 bg-white">
        <ChevronLeft size={12} /> Index
      </button>

      <div className="w-full flex flex-col lg:flex-row gap-20 items-start pt-16">
        <aside className="w-full lg:w-[320px] space-y-12 lg:sticky lg:top-12">
          <header className="space-y-4">
            <div className="flex items-center gap-4 text-marker-black">
              <Book size={28} strokeWidth={1.5} />
              <h2 className="heading-marker text-7xl lowercase leading-none">Library</h2>
            </div>
            <p className="handwritten text-lg opacity-40 uppercase tracking-widest italic leading-tight">Archives of the Unspoken {userIdentity ? `for ${userIdentity.split(' ')[0]}` : ''}</p>
          </header>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'enter', icon: Search, label: 'Access Memoir' },
              { id: 'vault', icon: History, label: 'Archival Vault' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setView(m.id)}
                className={`flex items-center justify-between p-6 border transition-all duration-300 ${view === m.id ? 'bg-marker-black border-marker-black text-white shadow-2xl scale-[1.02]' : 'bg-white border-marker-black/10 text-marker-black/40 hover:text-marker-black hover:border-marker-black/20'}`}
              >
                <div className="flex items-center gap-4">
                  <m.icon size={18} />
                  <span className="font-black text-[10px] uppercase tracking-widest">{m.label}</span>
                </div>
                {m.id === 'vault' && <span className="font-mono text-[9px] opacity-30">[{readings.length}]</span>}
              </button>
            ))}
          </nav>

          <div className="p-8 marker-border border-dashed border-marker-black/10 bg-marker-black/[0.01] space-y-4">
            <span className="handwritten text-[9px] font-black uppercase text-marker-black tracking-[0.3em] opacity-40 italic">Librarian Protocol</span>
            <p className="handwritten text-sm italic text-marker-black/40 leading-relaxed">
               Recalling memories requires specific spatial anchors. Select nodes to stabilize the thematic impression.
            </p>
          </div>
        </aside>

        <main className="flex-1 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-48 gap-12 text-center">
              <div className="w-16 h-16 border-t-2 border-marker-black animate-spin rounded-full"></div>
              <div className="space-y-2">
                <span className="heading-marker text-3xl lowercase italic text-marker-black/60 animate-pulse">Entering the stacks...</span>
                <p className="handwritten text-xs uppercase tracking-[0.4em] opacity-30">Indexing Impressionistic Nodes</p>
              </div>
            </div>
          ) : view === 'enter' ? (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-2xl mx-auto pb-48">
              <LibraryGrid selected={selected} onToggle={handleToggle} />
              <div className="space-y-4">
                <label className="handwritten text-[10px] font-black text-marker-black/40 uppercase tracking-widest ml-1 italic">Atmospheric Intent</label>
                <textarea
                  value={intent}
                  onChange={e => setIntent(e.target.value)}
                  className="w-full p-10 marker-border border-marker-black/10 bg-white font-display text-4xl italic outline-none focus:border-marker-black transition-all h-48 resize-none shadow-inner"
                  placeholder="Set the focal mood..."
                />
              </div>
              <button
                onClick={handleLink}
                disabled={selected.length < 3 || loading}
                className={`brutalist-button w-full !py-8 !text-2xl !bg-marker-black !text-white !border-marker-black shadow-2xl transition-all ${selected.length < 3 ? 'opacity-20 grayscale' : 'hover:scale-[1.01]'}`}
              >
                Recall Fragment
              </button>
            </div>
          ) : view === 'reading' && current ? (
            <MemorySnapshotViewer current={current} />
          ) : (
            <div className="grid grid-cols-1 gap-6 pb-48 animate-in fade-in duration-700">
              {readings.length === 0 ? (
                <div className="text-center py-48 opacity-[0.03] select-none pointer-events-none">
                  <div className="text-[12rem] heading-marker italic leading-none">Empty</div>
                  <p className="handwritten text-4xl uppercase tracking-[0.4em]">Vault Unindexed</p>
                </div>
              ) : readings.map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    setCurrent(r); setView('reading'); audioManager.playRustle();
                  }}
                  className="p-10 marker-border border-marker-black/5 bg-white cursor-pointer hover:border-marker-black group transition-all shadow-sm hover:shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono bg-marker-black text-white px-2 py-0.5 uppercase">{r.id}</span>
                        <span className="text-[10px] font-mono opacity-20 uppercase tracking-widest">{r.filingMetadata}</span>
                      </div>
                      <h4 className="heading-marker text-4xl lowercase group-hover:text-marker-black transition-colors italic line-clamp-1">"{r.memoryFragment}"</h4>
                      <p className="handwritten text-xs opacity-40 uppercase mt-2 tracking-widest italic">Focus: {r.theme}</p>
                    </div>
                    <span className="text-[10px] font-mono opacity-20">{new Date(r.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AkashicRecordsTool;
