
import React, { useState, useCallback, memo, useEffect } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { useSyllabusStore } from '../store';
import { logCalculation, getLogs } from '../services/dbService';
import { getSynchronicityInterpretation } from '../services/geminiService';
import { WritingEffect } from './WritingEffect';
import { ReadAloudButton } from './ReadAloudButton';
import { ToolProps } from '../types';
import { Sparkles, History, Search, Zap, Globe, Hash, Info } from 'lucide-react';
// Added missing audioManager import
import { audioManager } from './AudioManager';

interface Synchronicity {
  id: string;
  timestamp: string;
  description: string;
  category: string;
  emotionalState: string;
  significance: number;
  astrologicalResonance?: string;
  numerologicalRoot?: string;
  theWhy?: string;
  actionableInsight?: string;
}

const SynchronicityEntry = memo(({ 
  formData, setFormData, onRegister, loading 
}: { 
  formData: any, setFormData: (v: any) => void, onRegister: () => void, loading: boolean 
}) => (
  <div className="space-y-10 animate-in fade-in duration-500">
    <div className="space-y-2">
      <label className="handwritten text-[10px] opacity-50 font-bold uppercase tracking-widest ml-1">Phenomenon / Object Trace</label>
      <textarea 
        value={formData.description}
        onChange={e => setFormData({...formData, description: e.target.value})}
        placeholder="Describe the alignment or the object that triggered the thought..."
        className="w-full p-8 text-2xl marker-border bg-white shadow-inner h-56 italic outline-none focus:border-marker-purple border-2"
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="space-y-2">
          <label className="handwritten text-[10px] opacity-50 font-bold uppercase tracking-widest ml-1">Classification</label>
          <select 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="w-full p-4 marker-border bg-white italic outline-none focus:border-marker-purple"
          >
            <option>Numerical Pattern</option>
            <option>Object Mirroring</option>
            <option>Dream Leakage</option>
            <option>Spatial Convergence</option>
            <option>Other / Unclassified</option>
          </select>
       </div>
       <div className="space-y-2">
          <label className="handwritten text-[10px] opacity-50 font-bold uppercase tracking-widest ml-1">Internal Pulse</label>
          <input 
            value={formData.emotionalState} 
            onChange={e => setFormData({...formData, emotionalState: e.target.value})}
            placeholder="e.g. Sharp clarity, subtle unease..."
            className="w-full p-4 marker-border bg-white italic outline-none focus:border-marker-purple"
          />
       </div>
    </div>

    <button 
      onClick={onRegister} 
      disabled={loading || !formData.description} 
      className="brutalist-button w-full !py-8 !text-2xl !bg-marker-black text-surface shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.01] transition-transform"
    >
      {loading ? (
        <>
          <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
          Cross-Domain Mapping...
        </>
      ) : (
        <>
          <Sparkles size={24} />
          Initialize Deep Decode
        </>
      )}
    </button>
  </div>
));

const SynchronicityLog = memo(({ synchs }: { synchs: Synchronicity[] }) => (
  <div className="space-y-16 pb-48 animate-in fade-in duration-700">
    {synchs.length === 0 ? (
       <div className="text-center py-40 opacity-10 font-display text-5xl lowercase italic">Archive Empty</div>
    ) : synchs.map(s => (
      <div key={s.id} className="marker-border border-marker-black bg-surface shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="bg-marker-black p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
             <span className="font-mono text-[9px] uppercase tracking-widest font-black text-marker-purple">REF: {s.id.slice(-4)}</span>
             <span className="h-4 w-px bg-white/20"></span>
             <span className="handwritten text-xs italic opacity-60">{s.category}</span>
          </div>
          <span className="font-mono text-[9px] opacity-40 uppercase">{new Date(s.timestamp).toLocaleDateString()}</span>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          <div className="space-y-4">
            <span className="handwritten text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic block">The Trace</span>
            <div className="flex justify-between items-start gap-8">
              <p className="handwritten text-3xl md:text-4xl text-marker-black leading-tight italic">"{s.description}"</p>
              {s.theWhy && <ReadAloudButton text={`The hidden architecture behind this coincidence: ${s.theWhy}`} className="!py-1 !px-2 !text-[9px]" />}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="p-6 bg-marker-blue/5 marker-border border-marker-blue/10 space-y-4 group">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-marker-blue uppercase tracking-widest border-b border-marker-blue/10 pb-2">
                   <Globe size={12} /> Astrological Flux
                </div>
                <p className="handwritten text-base italic text-marker-black/80 leading-relaxed group-hover:text-marker-black transition-colors">
                  {s.astrologicalResonance || "Scanning celestial transits..."}
                </p>
             </div>

             <div className="p-6 bg-marker-purple/5 marker-border border-marker-purple/10 space-y-4 group">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-marker-purple uppercase tracking-widest border-b border-marker-purple/10 pb-2">
                   <Hash size={12} /> Numerological Root
                </div>
                <p className="handwritten text-base italic text-marker-black/80 leading-relaxed group-hover:text-marker-black transition-colors">
                  {s.numerologicalRoot || "Calculating Pythagorean depth..."}
                </p>
             </div>

             <div className="p-6 bg-marker-red/5 marker-border border-marker-red/10 space-y-4 group">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-marker-red uppercase tracking-widest border-b border-marker-red/10 pb-2">
                   <Info size={12} /> Actionable insight
                </div>
                <p className="handwritten text-base italic font-bold text-marker-black leading-snug">
                  {s.actionableInsight || "Awaiting behavioral catalyst..."}
                </p>
             </div>
          </div>

          {s.theWhy && (
            <div className="pt-12 border-t border-marker-black/10 relative">
               <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none heading-marker text-[10rem] italic leading-none select-none">LOGOS</div>
               <span className="handwritten text-[10px] font-black uppercase text-marker-black tracking-[0.6em] block mb-6 italic">The Hidden Architecture (The "Why")</span>
               <div className="p-10 marker-border border-marker-black bg-white shadow-xl relative z-10">
                 <p className="heading-marker text-3xl md:text-5xl text-marker-black lowercase leading-tight italic">
                   <WritingEffect text={s.theWhy} speed={25} />
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
));

const SynchronicityDecoder: React.FC<ToolProps> = ({ onBack }) => {
  const [synchronicities, setSynchronicities] = useState<Synchronicity[]>([]);
  const [viewMode, setViewMode] = useState<'register' | 'chronos'>('register');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ description: '', category: 'Alignment', emotionalState: '', significance: 3 });
  const { recordCalculation } = useSyllabusStore();

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const logs = await getLogs('SYNCHRONICITY') as any[];
    if (logs) setSynchronicities(logs.map(l => JSON.parse(l.result)));
  };

  const handleRegister = useCallback(async () => {
    if (!formData.description.trim()) return;
    setLoading(true);
    // Added comment: playing audio for registration
    audioManager.playRustle();
    
    try {
      const res = await getSynchronicityInterpretation(
        formData.description, 
        formData.category, 
        formData.emotionalState
      );
      
      if (res) {
        const newEntry: Synchronicity = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...formData,
          astrologicalResonance: res.astrologicalResonance,
          numerologicalRoot: res.numerologicalRoot,
          theWhy: res.theWhy,
          actionableInsight: res.actionable_insight
        };
        
        setSynchronicities(prev => [newEntry, ...prev]);
        await logCalculation('SYNCHRONICITY', formData.description.slice(0, 50), newEntry);
        recordCalculation(); 
        setFormData({ description: '', category: 'Numerical Pattern', emotionalState: '', significance: 3 });
        setViewMode('chronos');
      }
    } catch (e) {
      alert("Field collapse detected. Recursive mapping failed.");
    } finally {
      setLoading(false); 
    }
  }, [formData, recordCalculation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-6 md:px-12 relative max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-6 right-6 brutalist-button !text-[10px] z-[100] bg-surface shadow-xl flex items-center gap-2">
        <History size={12} /> Index
      </button>

      <div className="w-full flex flex-col lg:flex-row gap-16 items-start pt-16">
        <aside className="w-full lg:w-[400px] space-y-12 lg:sticky lg:top-12">
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-marker-purple">
               <Search size={32} />
               <h2 className="heading-marker text-7xl lowercase leading-none">Sync</h2>
            </div>
            <p className="handwritten text-xl opacity-40 uppercase tracking-widest italic">Cross-Domain Coincidence Mapper</p>
          </header>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'register', icon: Zap, label: 'Capture Coincidence' },
              { id: 'chronos', icon: History, label: 'Archival Chronos' }
            ].map(m => (
              <button 
                key={m.id} 
                onClick={() => setViewMode(m.id as any)} 
                className={`flex items-center justify-between p-6 marker-border text-left transition-all ${viewMode === m.id ? 'bg-marker-black text-surface shadow-xl' : 'bg-surface opacity-50 hover:opacity-100 hover:border-marker-purple/40'}`}
              >
                <div className="flex items-center gap-4">
                  <m.icon size={18} />
                  <span className="font-bold tracking-widest uppercase text-xs">{m.label}</span>
                </div>
                {m.id === 'chronos' && <span className="font-mono text-[9px] opacity-30">[{synchronicities.length}]</span>}
              </button>
            ))}
          </nav>
          
          <div className="p-8 marker-border border-dashed border-marker-black/10 bg-black/[0.01] space-y-4">
             <span className="handwritten text-[10px] font-black uppercase text-marker-black tracking-[0.3em]">Protocol: Why Now?</span>
             <p className="handwritten text-sm italic text-marker-black/40 leading-relaxed">
               This tool maps your personal object traces against real-time planetary hours and numerical roots to expose the logical framework of the "random."
             </p>
          </div>
        </aside>

        <main className="flex-1 w-full">
          {viewMode === 'register' ? (
             <div className="max-w-2xl mx-auto w-full">
                <SynchronicityEntry formData={formData} setFormData={setFormData} onRegister={handleRegister} loading={loading} />
             </div>
          ) : (
            <SynchronicityLog synchs={synchronicities} />
          )}
        </main>
      </div>
    </div>
  );
};

export default SynchronicityDecoder;
