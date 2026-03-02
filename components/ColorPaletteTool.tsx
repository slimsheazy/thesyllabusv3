
import React, { useState } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getColorPalette } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';
import { ColorPaletteResult } from '../types';

const ColorPaletteTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'date' | 'vibe'>('vibe');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ColorPaletteResult | null>(null);
  const { recordCalculation } = useSyllabusStore();

  const handleGenerate = async() => {
    if (!input.trim()) {
      return;
    }
    setLoading(true);
    setResult(null);
    audioManager.playRustle();

    try {
      const data = await getColorPalette(input, mode);
      if (data) {
        setResult(data);
        recordCalculation();
        logCalculation('COLOR_PALETTE', input, data);
      }
    } catch (err) {
      alert('Chromatic dissonance detected. Re-tune input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-6xl mx-auto pb-40">
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-surface shadow-xl">Index</button>

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-24 items-start pt-12 md:pt-0">
        <div className="w-full lg:w-[400px] space-y-10 lg:sticky lg:top-20">
          <header className="space-y-4 pt-8 lg:pt-0">
            <h2 className="heading-marker text-5xl sm:text-7xl text-marker-blue lowercase leading-none">Color <GlossaryTerm word="Spectrum">Resonance</GlossaryTerm></h2>
            <p className="handwritten text-lg sm:text-xl text-marker-blue opacity-40 font-bold uppercase tracking-widest italic">Zodiacal Palette Generator</p>
          </header>

          <div className="space-y-8 p-8 marker-border border-marker-blue/10 bg-surface shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('vibe')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${mode === 'vibe' ? 'bg-marker-blue text-white border-marker-blue' : 'bg-surface text-marker-blue/40 border-marker-blue/10'}`}
              >Vibe Mode</button>
              <button
                onClick={() => setMode('date')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${mode === 'date' ? 'bg-marker-blue text-white border-marker-blue' : 'bg-surface text-marker-blue/40 border-marker-blue/10'}`}
              >Date Mode</button>
            </div>
            <div className="space-y-2">
              <label className="handwritten text-[10px] font-bold uppercase opacity-40">Target Input</label>
              <input
                type={mode === 'date' ? 'date' : 'text'}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={mode === 'vibe' ? 'e.g. Melancholic forest night' : ''}
                className="w-full p-4 marker-border bg-surface italic text-xl outline-none focus:border-marker-blue shadow-none appearance-none"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !input}
              className={`brutalist-button w-full !py-6 !text-2xl transition-all ${!input ? 'opacity-30' : '!bg-marker-blue text-white shadow-xl'}`}
            >
              {loading ? 'Mixing Pigments...' : 'Extract Palette'}
            </button>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-10 animate-in fade-in">
              <div className="w-20 h-20 border-2 border-marker-blue border-t-transparent animate-spin rounded-full"></div>
              <span className="handwritten text-xl text-marker-blue font-black animate-pulse uppercase tracking-[0.4em]">Splitting Light Source...</span>
            </div>
          ) : result ? (
            <div className="animate-in fade-in duration-1000 space-y-12">
              <section className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {result.colors.map((c, i) => (
                    <div key={i} className="group relative">
                      <div className="aspect-square w-full marker-border border-black/5 shadow-sm transition-transform group-hover:scale-95" style={{ backgroundColor: c.hex }}></div>
                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-mono opacity-40 uppercase font-bold">{c.hex}</span>
                      </div>
                      <div className="absolute inset-0 bg-surface p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none flex flex-col items-center justify-center text-center border-2 border-marker-black shadow-2xl">
                        <span className="handwritten text-[10px] font-bold uppercase mb-1">{c.name}</span>
                        <p className="text-[8px] italic leading-tight text-marker-black/60">{c.reasoning}</p>
                        <span className="text-[8px] font-mono mt-2 opacity-30">{c.layer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-10 marker-border border-marker-blue bg-surface shadow-2xl relative overflow-hidden">
                <span className="handwritten text-[10px] font-bold uppercase text-marker-blue tracking-widest block mb-4">Spectral Analysis</span>
                <div className="handwritten text-2xl text-marker-black/80 leading-relaxed italic font-medium">
                  <WritingEffect text={result.analysis} />
                </div>
                <div className="mt-8 p-4 bg-marker-red/5 border-l-4 border-marker-red">
                  <span className="handwritten text-[10px] font-black uppercase text-marker-red">Deficiency Warning</span>
                  <p className="handwritten text-sm text-marker-black/70 italic mt-1">{result.deficiency}</p>
                </div>
              </section>

              <div className="p-10 marker-border border-marker-black bg-marker-black/[0.02] text-center shadow-sm">
                <p className="heading-marker text-3xl sm:text-4xl text-marker-black lowercase leading-tight">
                  {result.technicalSynthesis}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none text-center">
              <div className="text-[10rem] sm:text-[14rem] heading-marker leading-none uppercase">Hues</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Input Signal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteTool;
