
import React, { useState, useCallback, memo, useEffect } from 'react';
import { useSyllabusStore } from '../store';
import { logCalculation, getLogs } from '../services/dbService';
import { getAkashicAnalysis, getQuantumTimelineScan } from '../services/geminiService';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';
import { ReadAloudButton } from './ReadAloudButton';
import { AkashicResult, QuantumTimelineResult, ToolProps } from '../types';

interface ThreadState {
  id: string;
  timestamp: string;
  signature: string;
  recall: AkashicResult;
  projection: QuantumTimelineResult;
}

const LABELS = ['A', 'B', 'C', 'D', 'E'];

const SignalGrid = memo(({ selected, onToggle, disabled }: { selected: string[], onToggle: (id: string) => void, disabled?: boolean }) => (
  <div className={`flex flex-col items-center gap-8 p-10 bg-black/5 border border-black/10 rounded-sm w-full max-w-[400px] mx-auto relative group transition-all ${disabled ? 'opacity-20 pointer-events-none' : 'opacity-100 hover:border-tactical-cyan/40'}`}>
    <h3 className="font-mono text-[9px] tracking-[0.5em] text-marker-black uppercase font-bold text-center italic">Temporal Lock Sequence</h3>
    <div className="relative aspect-square w-full">
      <div className="grid grid-cols-5 gap-4 relative z-10">
        {[...Array(25)].map((_, i) => {
          const id = `${LABELS[Math.floor(i / 5)]}${i % 5 + 1}`;
          const isSelected = selected.includes(id);
          return (
            <button key={id} onClick={() => onToggle(id)} className="group/node relative flex items-center justify-center aspect-square">
              <div className={`w-3 h-3 rounded-none transition-all duration-300 ${isSelected ? 'bg-tactical-cyan shadow-[0_0_20px_var(--tactical-cyan)] scale-125' : 'bg-black/10 group-hover/node:bg-black/30'}`}></div>
              {isSelected && <div className="absolute inset-0 border border-tactical-cyan/20 rounded-none animate-ping pointer-events-none"></div>}
            </button>
          );
        })}
      </div>
    </div>
    <div className="font-mono text-[9px] text-marker-black font-black tracking-[0.3em] uppercase opacity-40">
      {selected.length === 3 ? 'Establishing Link...' : `Select 3 Anchors: ${selected.length}/3`}
    </div>
  </div>
));

const ThreadRecallSection = memo(({ recall }: { recall: AkashicResult }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
    <div className="flex items-center gap-3 border-b border-marker-black/10 pb-4">
      <span className="text-marker-blue text-[10px]">DB</span>
      <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-marker-blue">Recorded Baseline (Deep Recall)</span>
    </div>

    <div className="p-10 marker-border border-marker-blue bg-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none heading-marker text-[10rem] italic select-none">ROOT</div>
      <div className="flex justify-between items-start mb-6">
        <h4 className="heading-marker text-4xl text-marker-black lowercase italic">Primary Archetypal Imprint</h4>
        {/* Fix: changed soulPurpose to memoryFragment to match AkashicResult type */}
        <ReadAloudButton text={recall.memoryFragment} className="!py-1 !px-2 !text-[9px]" />
      </div>
      <p className="handwritten text-2xl md:text-3xl italic text-marker-black leading-relaxed font-medium relative z-10">
        {/* Fix: changed soulPurpose to memoryFragment to match AkashicResult type */}
        "<WritingEffect text={recall.memoryFragment} speed={25} />"
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-black/5 border border-black/5 space-y-4">
        <span className="font-mono text-[9px] opacity-30 uppercase tracking-widest block border-b border-black/5 pb-2">Sensory Impressions</span>
        {/* Fix: changed specificSynchronicities to sensoryImpressions to match AkashicResult type */}
        <p className="handwritten text-base italic text-marker-black/70">· Chroma: {recall.sensoryImpressions.chroma}</p>
        <p className="handwritten text-base italic text-marker-black/70">· Texture: {recall.sensoryImpressions.texture}</p>
        <p className="handwritten text-base italic text-marker-black/70">· Aroma: {recall.sensoryImpressions.aroma}</p>
      </div>
      <div className="p-6 bg-black/5 border border-black/5 space-y-4">
        <span className="font-mono text-[9px] opacity-30 uppercase tracking-widest block border-b border-black/5 pb-2">Archival Context</span>
        {/* Fix: changed temporalAnchors to emotionalResonance/filingMetadata to match AkashicResult type */}
        <p className="handwritten text-base italic text-marker-black/70">· Resonance: {recall.emotionalResonance}</p>
        <p className="handwritten text-base italic text-marker-black/70">· Filing: {recall.filingMetadata}</p>
      </div>
    </div>
  </div>
));

const ThreadProjectionSection = memo(({ projection }: { projection: QuantumTimelineResult }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
    <div className="flex items-center gap-3 border-b border-marker-black/10 pb-4">
      <span className="text-tactical-cyan text-[10px]">⚡</span>
      <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-tactical-cyan">Projected Vector (Target Reality)</span>
    </div>

    <div className="p-10 marker-border border-tactical-cyan bg-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none heading-marker text-[10rem] italic select-none">FLOW</div>
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h4 className="heading-marker text-4xl text-marker-black lowercase italic">{projection.desiredReality.stateLabel}</h4>
          <p className="font-mono text-[9px] text-tactical-cyan font-bold">RESONANCE: {projection.desiredReality.frequencyMarker}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {projection.desiredReality.realityFragments.map((frag, i) => (
          <div key={i} className="p-4 bg-black/[0.02] marker-border border-black/5 handwritten text-lg italic text-marker-black/80">
            · {frag}
          </div>
        ))}
      </div>
    </div>
  </div>
));

const TimelineThreadTool: React.FC<ToolProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<'calibrate' | 'thread' | 'archive'>('calibrate');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentThread, setCurrentThread] = useState<ThreadState | null>(null);
  const [history, setHistory] = useState<ThreadState[]>([]);
  const { recordCalculation } = useSyllabusStore();

  useEffect(() => {
    const load = async() => {
      const logs = await getLogs('TIMELINE_THREAD') as any[];
      if (logs?.length > 0) {
        setHistory(logs.map(l => JSON.parse(l.result)));
      }
    };
    load();
  }, []);

  const executeThreadScan = useCallback(async(nodes: string[]) => {
    setLoading(true);
    audioManager.playRustle();
    const sig = nodes.join('-');
    const intent = 'Neural Convergence Trace';

    try {
      // Parallel execution for the "Merged" logic
      const [recallRes, projectionRes] = await Promise.all([
        getAkashicAnalysis({ signature: sig }),
        getQuantumTimelineScan({ intent, signature: sig })
      ]);

      if (recallRes && projectionRes) {
        const state: ThreadState = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          signature: sig,
          recall: recallRes,
          projection: projectionRes
        };
        setCurrentThread(state);
        setHistory(prev => [state, ...prev]);
        recordCalculation();
        logCalculation('TIMELINE_THREAD', sig, state);
        setViewMode('thread');
      }
    } catch {
      alert('Field instability detected. Archival link failed.');
    } finally {
      setLoading(false);
    }
  }, [recordCalculation]);

  const handleToggleNode = useCallback((id: string) => {
    setSelectedNodes(prev => {
      if (prev.includes(id)) {
        return prev.filter(n => n !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }

      const next = [...prev, id];
      audioManager.playPenScratch(0.08);
      if (next.length === 3) {
        executeThreadScan(next);
      }
      return next;
    });
  }, [executeThreadScan]);

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-6 md:px-12 relative max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-6 right-6 brutalist-button !text-[10px] z-[100] flex items-center gap-2">
        <span className="text-[10px]">←</span> Index
      </button>

      <div className="w-full flex flex-col lg:flex-row gap-16 items-start pt-16">
        <aside className="w-full lg:w-[350px] space-y-10 lg:sticky lg:top-12">
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-marker-black">
              <span className="text-marker-blue text-[10px]">⚡</span>
            <h2 className="heading-marker text-7xl text-marker-amber lowercase">Thread</h2>
            </div>
            <p className="font-mono text-[10px] opacity-40 uppercase tracking-widest italic">Protocol: Past-Future Synthesis</p>
          </header>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'calibrate', icon: 'Target', label: 'Calibration' },
              { id: 'thread', icon: 'Activity', label: 'Active Thread', disabled: !currentThread },
              { id: 'archive', icon: 'History', label: 'Vault' }
            ].map(m => (
              <button
                key={m.id}
                disabled={m.disabled}
                onClick={() => setViewMode(m.id as any)}
                className={`flex items-center justify-between p-5 border transition-all ${viewMode === m.id ? 'bg-black/10 border-marker-black text-marker-black shadow-lg' : 'bg-black/5 border-black/10 text-marker-black/40 hover:text-marker-black disabled:opacity-10'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[10px]">{m.icon}</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{m.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-10 animate-pulse">
              <div className="w-24 h-1 bg-black/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-marker-blue animate-[shimmer_2s_infinite]"></div>
              </div>
              <span className="font-mono text-[10px] text-marker-blue uppercase tracking-[0.5em] font-black italic">Synchronizing Temporal Nodes...</span>
            </div>
          ) : viewMode === 'calibrate' ? (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-2xl mx-auto">
              <div className="p-10 space-y-10">
                <div className="text-center space-y-4">
                  <p className="handwritten text-2xl italic text-marker-black/60">Identify three spatial anchors to weave the past and future threads.</p>
                </div>
                <SignalGrid selected={selectedNodes} onToggle={handleToggleNode} />
              </div>
            </div>
          ) : viewMode === 'thread' && currentThread ? (
            <div className="space-y-12 animate-in fade-in duration-700 max-w-4xl mx-auto relative">
              <ThreadRecallSection recall={currentThread.recall} />

              <div className="relative h-48 flex items-center justify-center">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px border-l-2 border-dashed border-marker-black/10"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="p-6 bg-white border-2 border-marker-black rounded-full shadow-2xl group animate-bounce">
                    <span className="text-marker-red text-[10px]">↓</span>
                  </div>
                  <div className="bg-white p-6 marker-border border-marker-red shadow-xl text-center space-y-2 max-w-sm">
                    <span className="font-mono text-[10px] font-black uppercase text-marker-red tracking-widest">Behavioral Delta (The Catalyst)</span>
                    <p className="heading-marker text-2xl lowercase italic leading-tight">"{currentThread.projection.quantumJump.behavioralDelta}"</p>
                    <p className="font-mono text-[9px] opacity-40 uppercase tracking-tighter">Bridge Action: {currentThread.projection.quantumJump.bridgeAction}</p>
                  </div>
                </div>
              </div>

              <ThreadProjectionSection projection={currentThread.projection} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {history.length === 0 ? (
                <div className="text-center py-40 opacity-10 font-display text-5xl lowercase">Archive Empty</div>
              ) : history.map(h => (
                <div
                  key={h.id}
                  onClick={() => {
                    setCurrentThread(h); setViewMode('thread'); audioManager.playRustle();
                  }}
                  className="p-8 border border-black/5 bg-black/5 cursor-pointer hover:border-marker-blue group transition-all"
                >
                  <h4 className="font-display text-4xl group-hover:text-marker-blue transition-colors truncate lowercase italic">Archival Trace: {h.signature}</h4>
                  <p className="font-mono text-[9px] opacity-40 uppercase mt-2 tracking-widest">Captured: {new Date(h.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default TimelineThreadTool;
