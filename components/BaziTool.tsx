
import React, { useState, memo } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getBaziAnalysis } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';
import { ReadAloudButton } from './ReadAloudButton';
import { BaziResult, BaziPillar } from '../types';

const PillarModal = ({ pillar, onClose }: { pillar: BaziPillar, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-marker-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface marker-border border-marker-black shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="bg-marker-black p-6 flex justify-between items-center text-white">
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-black">The {pillar.type} Pillar Node</span>
          <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors"><span className="text-white text-lg font-bold">×</span></button>
        </header>

        <div className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="handwritten text-[10px] font-bold uppercase text-marker-red tracking-widest">The Element Flavor</span>
                <div className="h-px bg-marker-red/20 flex-grow" />
              </div>
              <h4 className="heading-marker text-5xl text-marker-black lowercase">{pillar.stem}</h4>
              <p className="handwritten text-lg italic text-marker-black/70 leading-relaxed">
                {pillar.stemExplanation}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="handwritten text-[10px] font-bold uppercase text-marker-blue tracking-widest">The Animal Seal</span>
                <div className="h-px bg-marker-blue/20 flex-grow" />
              </div>
              <h4 className="heading-marker text-5xl text-marker-black lowercase">{pillar.branch}</h4>
              <p className="handwritten text-lg italic text-marker-black/70 leading-relaxed">
                {pillar.branchExplanation}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-marker-black/5 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-marker-black/30 tracking-widest">Relationship Context</span>
              <p className="heading-marker text-2xl lowercase">{pillar.tenGod}</p>
            </div>
            <ReadAloudButton text={`${pillar.type} Pillar. The element flavor is ${pillar.stem}. The animal is ${pillar.branch}.`} className="!py-1 !px-3 !text-[10px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

const BaziInput = memo(({
  birthDate,
  setBirthDate,
  birthTime,
  setBirthTime,
  onAnalyze,
  loading
}: {
  birthDate: string,
  setBirthDate: (v: string) => void,
  birthTime: string,
  setBirthTime: (v: string) => void,
  onAnalyze: () => void,
  loading: boolean
}) => (
  <div className="space-y-6 p-6 marker-border border-marker-red/10 bg-white shadow-sm">
    <div className="space-y-2">
      <label className="handwritten text-[10px] font-bold uppercase text-marker-black/40 tracking-widest ml-1">When did you arrive?</label>
      <input
        type="date"
        value={birthDate}
        onChange={e => setBirthDate(e.target.value)}
        className="w-full p-4 marker-border bg-white italic text-xl outline-none focus:border-marker-red"
      />
    </div>
    <div className="space-y-2">
      <label className="handwritten text-[10px] font-bold uppercase text-marker-black/40 tracking-widest ml-1">What time? (Don't sweat the exactness)</label>
      <input
        type="time"
        value={birthTime}
        onChange={e => setBirthTime(e.target.value)}
        className="w-full p-4 marker-border bg-white italic text-xl outline-none focus:border-marker-red"
      />
    </div>
    <button
      onClick={onAnalyze}
      disabled={loading || !birthDate || !birthTime}
      className={`brutalist-button w-full !py-6 !text-2xl transition-all ${!birthDate ? 'opacity-30' : '!bg-marker-red text-white shadow-xl'}`}
    >
      {loading ? 'Crunching flavors...' : 'Check My Pillars'}
    </button>
  </div>
));

const BaziResultDisplay = memo(({ result, onPillarClick }: { result: BaziResult, onPillarClick: (p: BaziPillar) => void }) => (
  <div className="animate-in fade-in duration-1000 space-y-12">
    <section className="space-y-6">
      <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
        <h3 className="heading-marker text-4xl text-marker-black lowercase">Here's the deal</h3>
        <span className="handwritten text-[10px] font-bold uppercase text-marker-red bg-marker-red/5 px-3 py-1 rounded-full border border-marker-red/10">The Main Anchor</span>
      </div>
      <div className="p-8 md:p-10 marker-border border-marker-red bg-white shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] select-none pointer-events-none text-[15rem] font-bold italic uppercase">☉</div>
        <h4 className="heading-marker text-5xl sm:text-7xl text-marker-black mb-4 lowercase">{result.dayMaster}</h4>
        <p className="handwritten text-lg md:text-xl text-marker-black/80 leading-relaxed italic font-medium max-w-xl">
          <WritingEffect text={result.densityProfile} />
        </p>
        <div className="mt-8 flex justify-end">
          <ReadAloudButton text={`Your main flavor is ${result.dayMaster}. ${result.densityProfile}`} className="!py-1 !px-3 !text-[10px]" />
        </div>
      </div>
    </section>

    <section className="space-y-6">
      <div className="flex justify-between items-center border-b border-marker-black/5 pb-2">
        <span className="handwritten text-[10px] font-bold uppercase text-marker-black/40 tracking-widest italic">The Four Pillars Grid</span>
        <span className="font-mono text-[8px] opacity-30 uppercase">Tap a flavor node</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {result.pillars.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              audioManager.playPenScratch(0.1); onPillarClick(p);
            }}
            className="p-6 marker-border border-marker-black/10 bg-white flex flex-col items-center text-center group hover:border-marker-red transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl relative"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-20 transition-opacity"><span className="text-xs">ℹ️</span></div>
            <span className="handwritten text-[10px] font-bold uppercase text-marker-black/30 mb-4">{p.type} Node</span>
            <div className="heading-marker text-3xl text-marker-black lowercase group-hover:text-marker-red transition-colors">{p.stem}</div>
            <div className="w-full h-px bg-marker-black/5 my-2"></div>
            <div className="heading-marker text-3xl text-marker-black lowercase group-hover:text-marker-blue transition-colors">{p.branch}</div>
            <span className="mt-4 text-[10px] font-bold text-marker-red uppercase tracking-tighter">{p.tenGod}</span>
          </button>
        ))}
      </div>
    </section>

    <div className="grid grid-cols-1 gap-8">
      <div className="p-8 marker-border border-marker-black/5 bg-marker-black/[0.02] space-y-6">
        <span className="handwritten text-[10px] font-bold uppercase text-marker-black/40 tracking-widest block border-b border-marker-black/5 pb-2">How it all flows</span>
        <p className="handwritten text-base md:text-lg text-marker-black/80 leading-relaxed italic">
          {result.thermodynamicLogic}
        </p>
      </div>
    </div>
  </div>
));

const BaziTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BaziResult | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<BaziPillar | null>(null);
  const { recordCalculation } = useSyllabusStore();

  const handleAnalyze = async() => {
    if (!birthDate || !birthTime) {
      return;
    }
    setLoading(true);
    setResult(null);
    audioManager.playRustle();

    try {
      const data = await getBaziAnalysis(birthDate, birthTime);
      if (data) {
        setResult(data);
        recordCalculation();
        logCalculation('FOUR_PILLARS', `${birthDate} ${birthTime}`, data);
      }
    } catch (err) {
      alert('Technical glitch. Double check your arrival info.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-6xl mx-auto pb-48">
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-white shadow-xl">Back</button>

      {selectedPillar && <PillarModal pillar={selectedPillar} onClose={() => setSelectedPillar(null)} />}

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-24 items-start pt-12 md:pt-0">
        <div className="w-full lg:w-[400px] space-y-10 lg:sticky lg:top-20">
          <header className="space-y-4 pt-6 lg:pt-0">
            <h2 className="heading-marker text-5xl sm:text-7xl text-marker-red lowercase leading-none">The <GlossaryTerm word="Bazi">Four Pillars</GlossaryTerm></h2>
            <p className="handwritten text-lg sm:text-xl text-marker-red opacity-40 font-bold uppercase tracking-widest italic leading-tight">Think of these like the energetic flavors of the year, month, day, and hour you showed up here.</p>
          </header>

          <BaziInput
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            birthTime={birthTime}
            setBirthTime={setBirthTime}
            onAnalyze={handleAnalyze}
            loading={loading}
          />
        </div>

        <div className="flex-1 w-full min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-10 animate-in fade-in">
              <div className="w-20 h-20 border-2 border-marker-red border-t-transparent animate-spin rounded-full"></div>
              <span className="handwritten text-xl text-marker-red font-black animate-pulse uppercase tracking-[0.4em]">Checking the flavors...</span>
            </div>
          ) : result ? (
            <BaziResultDisplay result={result} onPillarClick={setSelectedPillar} />
          ) : (
            <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none text-center">
              <div className="text-[10rem] sm:text-[14rem] heading-marker leading-none uppercase">♁</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Ready for arrival data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaziTool;
