
import React, { useState } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getPieDeconstruction } from '../services/geminiService';
import { ReadAloudButton } from './ReadAloudButton';
import { PieResult } from '../types';

const PieDeconstructionTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<PieResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeconstruct = async() => {
    if (!word) {
      return;
    }
    setLoading(true);
    const data = await getPieDeconstruction(word);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-surface shadow-xl">Index</button>

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <div className="flex-1 w-full space-y-12">
          <header className="space-y-2 pt-8 lg:pt-0">
            <h2 className="heading-marker text-6xl sm:text-7xl text-marker-blue lowercase leading-none">Word Root Tracer</h2>
            <p className="handwritten text-xl text-marker-blue opacity-60 font-bold uppercase tracking-widest italic">Tracing the <GlossaryTerm word="Root">Proto-Indo-European</GlossaryTerm> Archetype</p>
          </header>

          <div className="space-y-6">
            <input
              type="text"
              placeholder="Enter word to trace..."
              value={word}
              onChange={e => setWord(e.target.value)}
              className="w-full p-6 text-2xl sm:p-8 sm:text-3xl marker-border bg-surface italic outline-none focus:border-marker-blue appearance-none"
            />
            <button onClick={handleDeconstruct} disabled={loading} className="brutalist-button w-full !py-6 !text-2xl !bg-marker-blue text-white shadow-xl">{loading ? 'Deconstructing Phonemes...' : 'Initialize Trace'}</button>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[400px] pb-32">
          {result ? (
            <div className="animate-in fade-in duration-700 space-y-8">
              <div className="p-8 marker-border border-marker-blue bg-surface shadow-xl relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-9xl opacity-[0.03] heading-marker font-bold italic uppercase">Root</div>
                <h3 className="heading-marker text-4xl sm:text-5xl lowercase text-marker-blue mb-2">{result.pieRoot}</h3>
                <p className="handwritten text-base font-bold uppercase tracking-widest opacity-40 mb-4">Original Meaning: {result.rootMeaning}</p>
                <p className="handwritten text-lg md:text-xl italic mb-6 leading-relaxed relative z-10">"{result.esotericImplication}"</p>
                <ReadAloudButton text={`${result.pieRoot}, meaning ${result.rootMeaning}. ${result.esotericImplication}`} />
              </div>

              <div className="p-6 marker-border border-marker-black/10 bg-surface shadow-sm">
                <span className="handwritten text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-6 border-b border-marker-black/5 pb-2">Semantic Drift Path</span>
                <div className="flex flex-wrap gap-4">
                  {result.semanticTrace.map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="heading-marker text-xl sm:text-2xl">{step}</span>
                      {i < result.semanticTrace.length - 1 && <span className="opacity-20 text-2xl">Right</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 marker-border border-marker-black bg-marker-black/[0.02] text-center shadow-sm">
                <span className="handwritten text-[10px] font-bold uppercase opacity-40 block mb-2">Modern Concept</span>
                <p className="heading-marker text-2xl sm:text-3xl text-marker-black lowercase">{result.modernConcept}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <div className="w-12 h-12 border-4 border-marker-blue border-t-transparent animate-spin rounded-full"></div>
              <p className="handwritten uppercase tracking-widest font-bold text-marker-blue animate-pulse">Analyzing Etymological Vectors...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] pointer-events-none select-none">
              <div className="text-[10rem] sm:text-[14rem] heading-marker leading-none">NULL</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Awaiting Word</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PieDeconstructionTool;
