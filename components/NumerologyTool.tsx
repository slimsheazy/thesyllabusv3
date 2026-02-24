
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getNumerologyAnalysis, getPsychometryAnalysis } from '../services/geminiService';
import { GlossaryTerm } from './GlossaryEngine';
import { ReadAloudButton } from './ReadAloudButton';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';
import { useSyllabusStore } from '../store';
import { NumerologyResult, PsychometryResult } from '../types';
import { Fingerprint, Search, Zap, History, ChevronLeft } from 'lucide-react';

const NumerologyTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'psychometry'>('identity');
  const { userIdentity, setUserIdentity, recordCalculation } = useSyllabusStore();
  
  // Identity State
  const [name, setName] = useState(userIdentity || '');
  const [birthday, setBirthday] = useState('');
  const [system, setSystem] = useState<'pythagorean' | 'chaldean'>('pythagorean');
  const [identityResult, setIdentityResult] = useState<NumerologyResult | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);

  // Psychometry State
  const [objectName, setObjectName] = useState('');
  const [psychometryResult, setPsychometryResult] = useState<PsychometryResult | null>(null);
  const [psychometryLoading, setPsychometryLoading] = useState(false);
  const [contactProgress, setContactProgress] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const calculateIdentity = async () => {
    if (!name || !birthday) return;
    setIdentityLoading(true);
    setIdentityResult(null);
    audioManager.playRustle();
    
    // Sync with global identity
    setUserIdentity(name);
    
    const analysis = await getNumerologyAnalysis(name, birthday, system);
    if (analysis) {
      setIdentityResult(analysis);
    } else {
      alert("Something went wrong with the numbers. Try again?");
    }
    setIdentityLoading(false);
  };

  const startContact = useCallback(() => {
    if (!objectName || psychometryLoading) return;
    setIsTouching(true);
    startTimeRef.current = Date.now();
    audioManager.playPenScratch(2);
    
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setContactProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        handlePsychometryAnalyze();
      }
    }, 4000 / 50); // 4 seconds total
    timerRef.current = interval as any;
  }, [objectName, psychometryLoading]);

  const endContact = useCallback(() => {
    setIsTouching(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (contactProgress < 100) {
      setContactProgress(0);
      audioManager.stopPenScratch();
    }
  }, [contactProgress]);

  const handlePsychometryAnalyze = async () => {
    const duration = Date.now() - startTimeRef.current;
    setPsychometryLoading(true);
    setPsychometryResult(null);
    audioManager.playRustle();
    
    const analysis = await getPsychometryAnalysis(objectName, duration);
    if (analysis) {
      setPsychometryResult(analysis);
    } else {
      alert("Couldn't read the object. Give it another shot.");
    }
    setPsychometryLoading(false);
    setContactProgress(0);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-7xl mx-auto pb-32">
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-surface shadow-xl flex items-center gap-2">
        <ChevronLeft size={14} /> Back
      </button>

      <div className="w-full flex flex-col gap-12">
        <header className="space-y-6 pt-8 lg:pt-0">
          <div className="space-y-2">
            <h2 className="heading-marker text-6xl sm:text-7xl text-marker-teal lowercase leading-none">Life Path & Energy</h2>
            <p className="handwritten text-lg text-marker-teal opacity-60">Reading you and the things you touch</p>
          </div>

          <div className="flex gap-4 border-b border-marker-black/5 pb-4">
            <button 
              onClick={() => setActiveTab('identity')}
              className={`flex items-center gap-3 px-6 py-3 transition-all ${activeTab === 'identity' ? 'text-marker-teal border-b-2 border-marker-teal font-bold' : 'text-marker-black/40 hover:text-marker-black'}`}
            >
              <Fingerprint size={18} />
              <span className="font-mono text-xs uppercase tracking-widest">Reading You</span>
            </button>
            <button 
              onClick={() => setActiveTab('psychometry')}
              className={`flex items-center gap-3 px-6 py-3 transition-all ${activeTab === 'psychometry' ? 'text-marker-purple border-b-2 border-marker-purple font-bold' : 'text-marker-black/40 hover:text-marker-black'}`}
            >
              <Zap size={18} />
              <span className="font-mono text-xs uppercase tracking-widest">Object Energy</span>
            </button>
          </div>
        </header>

        <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
            {activeTab === 'identity' ? (
              <div className="space-y-8 p-6 bg-white border border-marker-teal/10 shadow-sm rounded-2xl animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-3">
                  <label className="handwritten text-[10px] text-marker-black opacity-40 block ml-2 uppercase tracking-widest font-bold">Calculation System</label>
                  <div className="flex gap-2 p-1 bg-surface rounded-xl marker-border">
                    <button 
                      onClick={() => { setSystem('pythagorean'); audioManager.playPenScratch(0.05); }} 
                      className={`flex-1 py-3 px-2 transition-all rounded-lg handwritten text-[10px] font-bold uppercase tracking-widest ${system === 'pythagorean' ? 'bg-marker-teal text-white shadow-md' : 'text-marker-teal/40 hover:text-marker-teal'}`}
                    >
                      System: Pythagorean
                    </button>
                    <button 
                      onClick={() => { setSystem('chaldean'); audioManager.playPenScratch(0.05); }} 
                      className={`flex-1 py-3 px-2 transition-all rounded-lg handwritten text-[10px] font-bold uppercase tracking-widest ${system === 'chaldean' ? 'bg-marker-teal text-white shadow-md' : 'text-marker-teal/40 hover:text-marker-teal'}`}
                    >
                      System: Chaldean
                    </button>
                  </div>
                  <p className="px-2 text-[8px] italic opacity-40">Choose Pythagorean for modern clarity or Chaldean for ancient resonance.</p>
                </div>
                <div className="space-y-2">
                  <label className="handwritten text-[10px] font-bold uppercase text-marker-black opacity-40 block ml-2 tracking-widest">Your Full Name</label>
                  <input type="text" placeholder="e.g. John Doe" className="w-full p-4 text-marker-black text-xl italic bg-surface/50 rounded-lg outline-none border border-transparent focus:border-marker-teal" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="handwritten text-[10px] font-bold uppercase text-marker-black opacity-40 block ml-2 tracking-widest">When were you born?</label>
                  <input type="date" className="w-full p-4 text-marker-black text-xl italic bg-surface/50 rounded-lg outline-none border border-transparent focus:border-marker-teal" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
                </div>
                <button onClick={calculateIdentity} disabled={identityLoading || !name || !birthday} className={`brutalist-button w-full !py-6 !text-2xl transition-all ${!name || !birthday ? 'opacity-30' : '!bg-marker-teal text-white shadow-xl'}`}>{identityLoading ? 'Crunching numbers...' : 'Check My Path'}</button>
              </div>
            ) : (
              <div className="space-y-8 p-6 bg-white border border-marker-purple/10 shadow-sm rounded-2xl animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <label className="handwritten text-[10px] font-bold uppercase text-marker-black opacity-40 block ml-2 tracking-widest">What are you holding?</label>
                  <input 
                    type="text" 
                    placeholder="e.g. My grandma's ring" 
                    className="w-full p-4 text-marker-black text-xl italic bg-surface/50 rounded-lg outline-none border border-transparent focus:border-marker-purple" 
                    value={objectName} 
                    onChange={(e) => setObjectName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="handwritten text-[10px] font-bold uppercase text-marker-black opacity-40 block ml-2 tracking-widest">Hold to Establish Link</label>
                  <div 
                    className="relative aspect-square w-full rounded-full bg-black/5 border-4 border-dashed border-marker-purple/20 flex items-center justify-center group cursor-pointer overflow-hidden select-none"
                    onMouseDown={startContact}
                    onMouseUp={endContact}
                    onMouseLeave={endContact}
                    onTouchStart={startContact}
                    onTouchEnd={endContact}
                  >
                    <div 
                      className="absolute inset-0 bg-marker-purple/10 transition-all duration-300"
                      style={{ clipPath: `inset(${100 - contactProgress}% 0 0 0)` }}
                    />
                    <div className="relative z-10 flex flex-col items-center text-center p-8 gap-4">
                      <Zap size={48} className={`transition-all duration-500 ${isTouching ? 'text-marker-purple scale-125' : 'text-marker-black/20'}`} />
                      <span className={`font-mono text-[9px] uppercase tracking-[0.3em] font-black transition-opacity ${isTouching ? 'opacity-100' : 'opacity-40'}`}>
                        {isTouching ? 'Reading the vibe...' : 'Press & Hold to Sense'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>

          <main className="flex-1 w-full min-h-[600px] pb-32">
            {activeTab === 'identity' ? (
              identityLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-8 py-40">
                  <div className="w-20 h-20 border-4 border-marker-teal border-t-transparent animate-spin rounded-full"></div>
                  <span className="handwritten text-xl text-marker-teal animate-pulse font-black uppercase tracking-[0.4em]">Doing the math...</span>
                </div>
              ) : identityResult ? (
                <div className="w-full space-y-10 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Life Path', val: identityResult.lifePath, glossary: 'Life Path' },
                      { label: 'Destiny', val: identityResult.destinyNumber, glossary: 'Destiny Number' },
                      { label: 'Soul Urge', val: identityResult.soulUrge, glossary: 'Soul Urge' }
                    ].map((item, i) => (
                      <div key={item.label} className="bg-white p-6 text-center shadow-lg rounded-2xl group transition-transform hover:scale-105 border border-black/5">
                        <span className="handwritten text-[10px] font-bold text-marker-black/30 mb-2 block uppercase tracking-widest"><GlossaryTerm word={item.glossary}>{item.label}</GlossaryTerm></span>
                        <span className={`heading-marker text-6xl ${i === 1 ? 'text-marker-red' : 'text-marker-black'}`}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-8 sm:p-10 border border-marker-blue/10 bg-white shadow-2xl rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-8xl heading-marker italic uppercase pointer-events-none">Results</div>
                    <div className="flex justify-between items-center mb-6 border-b-2 border-marker-blue/10 pb-4 relative z-10">
                      <div className="flex flex-col gap-1">
                        <span className="handwritten text-[10px] font-bold uppercase text-marker-blue tracking-widest">Your Narrative</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-mono text-marker-teal">✦</span>
                           <span className="text-[9px] font-black text-white bg-marker-teal px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                             ACTIVE: {system === 'pythagorean' ? 'Pythagorean System' : 'Chaldean System'}
                           </span>
                        </div>
                      </div>
                      <ReadAloudButton text={identityResult.meaning} className="!py-1 !px-2 !text-[10px] bg-marker-blue/10 border-marker-blue/20 text-marker-blue" />
                    </div>
                    <p className="handwritten text-lg md:text-xl italic text-marker-black/80 leading-relaxed font-medium relative z-10">"{identityResult.meaning}"</p>
                    <p className="mt-4 text-[9px] opacity-30 italic">{identityResult.systemComparison}</p>
                  </div>
                  <div className="p-10 bg-white shadow-md rounded-2xl text-center border border-black/5">
                    <div className="handwritten text-[10px] text-marker-red uppercase font-bold italic tracking-widest">Final Thought</div>
                    <p className="heading-marker text-3xl sm:text-4xl text-marker-black lowercase leading-tight">{identityResult.esotericInsight}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-[0.03] flex flex-col items-center justify-center h-full py-40 select-none pointer-events-none">
                  <Fingerprint size={200} className="mb-8" />
                  <p className="handwritten text-4xl uppercase tracking-[0.4em]">Waiting for your info</p>
                </div>
              )
            ) : (
              psychometryLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-8 py-40">
                  <div className="w-20 h-20 border-4 border-marker-purple border-t-transparent animate-spin rounded-full"></div>
                  <span className="handwritten text-xl text-marker-purple animate-pulse font-black uppercase tracking-[0.4em]">Extracting vibes...</span>
                </div>
              ) : psychometryResult ? (
                <div className="w-full space-y-12 animate-in fade-in duration-500">
                  <div className="p-8 marker-border border-marker-purple bg-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-8xl heading-marker italic uppercase">Vibe</div>
                    <div className="flex justify-between items-center mb-6 border-b-2 border-marker-purple/10 pb-2">
                      <span className="handwritten text-[10px] font-bold uppercase text-marker-purple tracking-widest">The Object's Memory</span>
                      <ReadAloudButton text={`${psychometryResult.vibrationalSignature}. ${psychometryResult.imprintHistory}`} />
                    </div>
                    <h3 className="heading-marker text-5xl text-marker-black lowercase mb-4">{psychometryResult.vibrationalSignature}</h3>
                    <p className="handwritten text-xl italic text-marker-black/80 leading-relaxed font-medium">
                      <WritingEffect text={psychometryResult.imprintHistory} speed={15} />
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-white border border-black/5 shadow-sm rounded-xl space-y-4">
                      <span className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-widest border-b pb-2 block">Kind of Energy</span>
                      <p className="heading-marker text-2xl text-marker-black lowercase">{psychometryResult.primaryEnergy}</p>
                    </div>
                    <div className="p-6 bg-white border border-black/5 shadow-sm rounded-xl space-y-4">
                      <span className="handwritten text-[10px] font-black uppercase text-marker-black/40 tracking-widest border-b pb-2 block">Where it belongs</span>
                      <p className="heading-marker text-2xl text-marker-black lowercase">{psychometryResult.environmentalResonance}</p>
                    </div>
                  </div>

                  <div className="p-10 bg-black text-white rounded-2xl shadow-2xl text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-marker-purple/20 to-transparent pointer-events-none" />
                    <span className="handwritten text-[10px] font-black uppercase tracking-[0.6em] text-marker-purple mb-4 block italic">Advice for You</span>
                    <p className="heading-marker text-3xl md:text-5xl lowercase leading-tight relative z-10">
                      "{psychometryResult.actionableGuidance}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-[0.03] flex flex-col items-center justify-center h-full py-40 select-none pointer-events-none">
                  <Zap size={200} className="mb-8" />
                  <p className="handwritten text-4xl uppercase tracking-[0.4em]">Waiting for a connection</p>
                </div>
              )
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default NumerologyTool;
