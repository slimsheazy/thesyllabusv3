
import React, { useState, useCallback, memo, useEffect } from 'react';
import { Target, Activity, History, ChevronLeft, Zap, RefreshCcw } from 'lucide-react';
import { useSyllabusStore } from '../store';
import { logCalculation, getLogs } from '../services/dbService';
import { getQuantumTimelineScan } from '../services/geminiService';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';
import { QuantumTimelineResult, ToolProps } from '../types';

interface QuantumState extends QuantumTimelineResult {
  id: string;
  timestamp: string;
  intent: string;
  signature: string;
  timelineIndex: number; // 0 for Current, 1 for Desired
}

const LABELS = ['A', 'B', 'C', 'D', 'E'];
type ViewMode = 'calibrate' | 'navigator' | 'history';

const SignalGrid = memo(({ selected, onToggle, disabled }: { selected: string[], onToggle: (id: string) => void, disabled?: boolean }) => (
  <div className={`flex flex-col items-center gap-8 p-10 bg-black/5 border border-black/10 rounded-sm w-full max-w-[400px] mx-auto relative group transition-all ${disabled ? 'opacity-20 pointer-events-none' : 'opacity-100 hover:border-tactical-cyan/40'}`}>
    <h3 className="font-mono text-[9px] tracking-[0.5em] text-marker-black uppercase font-bold text-center italic">Pick Three Dots</h3>
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
      {selected.length === 3 ? "Locking in..." : `Picking: ${selected.length}/3`}
    </div>
  </div>
));

const RealityTrack = memo(({ 
  reality, 
  label, 
  isActive, 
  onJump 
}: { 
  reality: any, 
  label: string, 
  isActive: boolean, 
  onJump?: () => void 
}) => {
  const isDesired = label === "New";
  
  return (
    <div className={`relative w-full p-8 border transition-all duration-500 ${isActive ? 'bg-white border-marker-black shadow-xl z-20 scale-100' : 'bg-black/5 border-black/10 opacity-40 scale-[0.98] z-10'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${isActive ? 'text-tactical-cyan' : 'text-black/40'}`}>
            {label} Way of Seeing
          </span>
          <h4 className="font-display text-3xl lowercase italic">{reality.stateLabel || reality.entropyLevel || "Normal"}</h4>
        </div>
        <div className="text-right">
          <span className="font-mono text-[9px] opacity-30 uppercase block">The Vibe</span>
          <span className="font-mono text-xs font-bold tracking-tighter text-tactical-cyan">{reality.frequencyMarker}</span>
        </div>
      </div>

      <div className="space-y-4">
        <span className="font-mono text-[9px] opacity-30 uppercase tracking-[0.2em] block border-b border-black/5 pb-2">What's different here?</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reality.realityFragments.map((frag: string, i: number) => (
            <div key={i} className={`p-4 border text-sm italic font-medium leading-snug ${isActive ? 'border-marker-black/10 bg-black/[0.02]' : 'border-transparent'}`}>
              · {frag}
            </div>
          ))}
        </div>
      </div>

      {isDesired && !isActive && onJump && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity">
          <button onClick={onJump} className="brutalist-button !py-4 !px-8 flex items-center gap-3 !bg-tactical-cyan !text-white !border-tactical-cyan">
            <Zap size={16} /> Switch Your View
          </button>
        </div>
      )}
    </div>
  );
});

const TimelineNavigator = memo(({ quantumState, onSwitch }: { quantumState: QuantumState, onSwitch: (idx: number) => void }) => {
  const [glitching, setGlitching] = useState(false);
  const { timelineIndex } = quantumState;

  const handleJump = useCallback(() => {
    setGlitching(true);
    audioManager.playRustle();
    setTimeout(() => {
      onSwitch(timelineIndex === 0 ? 1 : 0);
      setGlitching(false);
    }, 400);
  }, [timelineIndex, onSwitch]);

  return (
    <div className={`space-y-4 animate-in fade-in duration-700 pb-48 relative ${glitching ? 'animate-glitch' : ''}`}>
      <RealityTrack 
        reality={quantumState.desiredReality} 
        label="New" 
        isActive={timelineIndex === 1}
        onJump={handleJump}
      />

      <div className="relative h-24 flex items-center justify-center">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-marker-black/5 via-marker-black/20 to-marker-black/5"></div>
        <div className="relative z-10 flex flex-col items-center gap-2">
           <div className="p-4 bg-white border border-marker-black rounded-full shadow-lg group hover:scale-110 transition-transform cursor-pointer" onClick={handleJump}>
             {timelineIndex === 0 ? <Zap className="text-tactical-cyan" size={24} /> : <RefreshCcw className="text-marker-black/40" size={24} />}
           </div>
           <span className="font-mono text-[8px] font-black uppercase tracking-[0.4em] opacity-30 italic">The Bridge</span>
        </div>
      </div>

      <RealityTrack 
        reality={quantumState.currentReality} 
        label="Old" 
        isActive={timelineIndex === 0}
        onJump={timelineIndex === 1 ? handleJump : undefined}
      />

      <div className="mt-12 p-10 bg-white border border-marker-black shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none font-display text-8xl italic uppercase">Change</div>
         <span className="font-mono text-[10px] font-bold text-tactical-cyan tracking-[0.4em] block mb-6 italic">How to change things (The Catalyst)</span>
         <p className="font-display text-4xl text-marker-black leading-tight italic max-w-2xl">
            <WritingEffect text={quantumState.quantumJump.behavioralDelta} speed={25} />
         </p>
         <div className="mt-8 pt-8 border-t border-marker-black/10 flex justify-between items-center">
            <div className="space-y-1">
               <span className="font-mono text-[9px] opacity-30 uppercase block">What to do</span>
               <p className="font-mono text-xs font-bold italic">{quantumState.quantumJump.bridgeAction}</p>
            </div>
            <div className="text-right space-y-1">
               <span className="font-mono text-[9px] opacity-30 uppercase block">Target Energy</span>
               <p className="font-mono text-xs font-bold text-tactical-cyan">{quantumState.quantumJump.shiftFrequency}</p>
            </div>
         </div>
      </div>

      <style>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-glitch {
          animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) infinite;
          filter: contrast(1.5) invert(0.05);
        }
      `}</style>
    </div>
  );
});

const QuantumTimelineScanner: React.FC<ToolProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('calibrate');
  const [loading, setLoading] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [readings, setReadings] = useState<QuantumState[]>([]);
  const [activeQuantumState, setActiveQuantumState] = useState<QuantumState | null>(null);
  const { recordCalculation } = useSyllabusStore();

  useEffect(() => {
    const load = async () => {
      const logs = await getLogs('QUANTUM_SCAN') as any[];
      if (logs?.length > 0) setReadings(logs.map(l => JSON.parse(l.result)));
    };
    load();
  }, []);

  const performScan = useCallback(async (nodes: string[]) => {
    setLoading(true);
    audioManager.playRustle();
    const sig = nodes.join('-');
    const intent = "Shifting your perspective"; 
    try {
      const res = await getQuantumTimelineScan({ intent, signature: sig });
      if (res) {
        const state: QuantumState = { 
          id: Date.now().toString(), 
          timestamp: new Date().toISOString(), 
          intent, 
          signature: sig, 
          timelineIndex: 0,
          ...res 
        };
        setActiveQuantumState(state);
        setReadings(prev => [state, ...prev]);
        recordCalculation();
        logCalculation('QUANTUM_SCAN', intent, state);
        setViewMode('navigator');
      }
    } catch { alert('Lost the thread. Try again.'); } finally { setLoading(false); }
  }, [recordCalculation]);

  const handleToggleNode = useCallback((id: string) => {
    setSelectedNodes(prev => {
      if (prev.includes(id)) return prev.filter(n => n !== id);
      if (prev.length >= 3) return prev;
      
      const next = [...prev, id];
      audioManager.playPenScratch(0.08);
      
      if (next.length === 3) {
        performScan(next);
      }
      return next;
    });
  }, [performScan]);

  const handleSwitchTimeline = (idx: number) => {
    if (!activeQuantumState) return;
    setActiveQuantumState({ ...activeQuantumState, timelineIndex: idx });
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-6 md:px-12 relative max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-6 right-6 brutalist-button !text-[10px] z-[100] flex items-center gap-2">
        <ChevronLeft size={12} /> Index
      </button>

      <div className="w-full flex flex-col lg:flex-row gap-16 items-start pt-16">
        <aside className="w-full lg:w-[350px] space-y-10 lg:sticky lg:top-12">
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-tactical-cyan">
              <Activity size={24} />
              <h2 className="heading-marker text-7xl lowercase">Shifter</h2>
            </div>
            <p className="font-mono text-[10px] text-marker-black opacity-40 uppercase tracking-widest italic">Changing the vibe</p>
          </header>
          <nav className="flex flex-col gap-2">
            {[
              { id: 'calibrate', icon: Target, label: 'Calibration' },
              { id: 'navigator', icon: Activity, label: 'The Shift', disabled: !activeQuantumState },
              { id: 'history', icon: History, label: 'Past Looks' }
            ].map(m => (
              <button 
                key={m.id}
                disabled={m.disabled}
                onClick={() => {
                  setViewMode(m.id as any);
                  if (m.id === 'calibrate') setSelectedNodes([]); 
                }}
                className={`flex items-center justify-between p-5 border transition-all ${viewMode === m.id ? 'bg-black/10 border-marker-black text-marker-black shadow-lg' : 'bg-black/5 border-black/10 text-marker-black/40 hover:text-marker-black disabled:opacity-10'}`}
              >
                <div className="flex items-center gap-4">
                  <m.icon size={16} />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{m.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-10">
               <div className="w-32 h-1 bg-black/10 relative overflow-hidden">
                 <div className="absolute inset-0 bg-tactical-cyan animate-[shimmer_1.5s_infinite]"></div>
               </div>
               <span className="font-mono text-[10px] text-tactical-cyan animate-pulse uppercase tracking-[1em] font-black italic">Thinking it through...</span>
            </div>
          ) : viewMode === 'calibrate' ? (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-2xl mx-auto">
               <div className="p-10 space-y-10">
                  <div className="text-center space-y-2">
                    <p className="handwritten text-xl italic text-marker-black/60">Pick three dots to start shifting your perspective.</p>
                  </div>
                  <SignalGrid selected={selectedNodes} onToggle={handleToggleNode} />
               </div>
            </div>
          ) : viewMode === 'navigator' && activeQuantumState ? (
            <TimelineNavigator quantumState={activeQuantumState} onSwitch={handleSwitchTimeline} />
          ) : (
            <div className="grid grid-cols-1 gap-4">
               {readings.length === 0 ? <div className="text-center py-40 opacity-10 font-display text-5xl lowercase italic">Nothing yet</div>
               : readings.map((r, idx) => (
                   <div key={r.id || idx} onClick={() => { setActiveQuantumState(r); setViewMode('navigator'); audioManager.playRustle(); }} className="p-8 border border-black/5 bg-black/5 cursor-pointer hover:border-tactical-cyan group transition-all">
                      <h4 className="font-display text-4xl group-hover:text-tactical-cyan transition-colors truncate lowercase italic">Look at: {r.signature}</h4>
                      <p className="font-mono text-[9px] text-marker-black opacity-40 uppercase tracking-widest mt-2">Signature: {r.signature}</p>
                   </div>
                 ))
               }
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

export default QuantumTimelineScanner;
