
import React, { useState, memo } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getBiologicalDepreciation } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';
import { BioDepreciationResult } from '../types';

const BioControls = memo(({
  age, setAge, telomere, setTelomere, load, setLoad, onCalculate, loading
}: {
  age: number, setAge: (v: number) => void,
  telomere: number, setTelomere: (v: number) => void,
  load: number, setLoad: (v: number) => void,
  onCalculate: () => void, loading: boolean
}) => (
  <div className="space-y-10 p-8 marker-border border-marker-red/10 bg-white shadow-sm">
    <div className="space-y-4">
      <label className="handwritten text-[10px] font-bold uppercase opacity-40">How old are you? {age}</label>
      <input type="range" min="1" max="100" value={age} onChange={e => setAge(parseInt(e.target.value))} className="w-full accent-marker-red" />
    </div>
    <div className="space-y-4">
      <label className="handwritten text-[10px] font-bold uppercase opacity-40">General Health: {telomere}%</label>
      <input type="range" min="1" max="100" value={telomere} onChange={e => setTelomere(parseInt(e.target.value))} className="w-full accent-marker-red" />
    </div>
    <div className="space-y-4">
      <label className="handwritten text-[10px] font-bold uppercase opacity-40">Stress Level: {load}%</label>
      <input type="range" min="1" max="100" value={load} onChange={e => setLoad(parseInt(e.target.value))} className="w-full accent-marker-red" />
    </div>
    <button
      onClick={onCalculate}
      disabled={loading}
      className="brutalist-button w-full !py-6 !text-2xl !bg-marker-red text-white"
    >
      {loading ? 'Calculating...' : 'See the Result'}
    </button>
  </div>
));

const BioResultDisplay = memo(({ result }: { result: BioDepreciationResult }) => (
  <div className="animate-in fade-in duration-1000 space-y-12">
    <section className="space-y-6">
      <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
        <h3 className="heading-marker text-4xl text-marker-black lowercase">Your Estimated Time</h3>
        <span className="text-[10px] font-mono opacity-30">PROBABILITY: {result.accuracyProbability}%</span>
      </div>
      <div className="p-8 md:p-10 marker-border border-marker-red bg-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none text-9xl font-bold italic uppercase">CLOCK</div>
        <h4 className="heading-marker text-4xl sm:text-6xl text-marker-black mb-6 lowercase">{result.obsolescenceDate}</h4>
        <p className="handwritten text-lg md:text-xl text-marker-black/80 leading-relaxed italic font-medium">
          <WritingEffect text={result.depreciationMetrics} />
        </p>
      </div>
    </section>

    <div className="p-10 marker-border border-marker-black bg-marker-black/[0.02] space-y-6">
      <span className="handwritten text-[10px] font-bold uppercase text-marker-black/40 tracking-widest block border-b border-marker-black/5 pb-2">The Breakdown</span>
      <p className="handwritten text-lg italic text-marker-black/60 leading-relaxed whitespace-pre-line">
        {result.actuarialReport}
      </p>
    </div>
  </div>
));

const BioCalcTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [age, setAge] = useState(30);
  const [telomere, setTelomere] = useState(50);
  const [load, setLoad] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BioDepreciationResult | null>(null);
  const { recordCalculation } = useSyllabusStore();

  const handleCalculate = async() => {
    setLoading(true);
    setResult(null);
    audioManager.playRustle();

    try {
      const data = await getBiologicalDepreciation({
        age,
        telomereMaintenance: telomere,
        systemicLoad: load
      });
      if (data) {
        setResult(data);
        recordCalculation();
        logCalculation('BIO_DEP', `Age:${age}`, data);
      }
    } catch (err) {
      alert('Error. Couldn\'t figure it out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-6xl mx-auto">
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-white shadow-xl">Back</button>

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-24 items-start">
        <div className="w-full lg:w-[400px] space-y-10 lg:sticky lg:top-20">
          <header className="space-y-4 pt-8 lg:pt-0">
            <h2 className="heading-marker text-5xl sm:text-7xl text-marker-red lowercase leading-none">The 'How Long' Clock</h2>
            <p className="handwritten text-lg sm:text-xl text-marker-red opacity-40 font-bold uppercase tracking-widest italic">A rough guess at your expiration date</p>
          </header>

          <BioControls
            age={age} setAge={setAge} telomere={telomere} setTelomere={setTelomere}
            load={load} setLoad={setLoad} onCalculate={handleCalculate} loading={loading}
          />
        </div>

        <div className="flex-1 w-full min-h-[500px] pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-10 animate-in fade-in">
              <div className="w-20 h-20 border-2 border-marker-red border-t-transparent animate-spin rounded-full"></div>
              <span className="handwritten text-xl text-marker-red font-black animate-pulse uppercase tracking-[0.4em]">Doing the math...</span>
            </div>
          ) : result ? (
            <BioResultDisplay result={result} />
          ) : (
            <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none text-center">
              <div className="text-[10rem] sm:text-[14rem] heading-marker leading-none uppercase">...</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Put in your numbers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BioCalcTool;
