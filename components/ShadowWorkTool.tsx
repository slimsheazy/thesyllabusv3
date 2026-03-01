
import React, { useState, memo } from 'react';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { audioManager } from './AudioManager';
import { GlossaryTerm } from './GlossaryEngine';
import { WritingEffect } from './WritingEffect';
import { ReadAloudButton } from './ReadAloudButton';

const getShadowWorkAnalysis = async(inquiry: string) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-3-pro-preview',
      prompt: `I am looking at my "shadow" side. I'm reflecting on: "${inquiry}". Give me a grounded explanation of what's really going on beneath the surface, 3 direct questions I should ask myself, and a helpful reminder to close. Return as JSON with keys: analysis, inquiries (array of 3 strings), affirmation.`
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get analysis');
  }
  return JSON.parse(data.response);
};

const ShadowWorkTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [inquiry, setInquiry] = useState('Current life patterns and obstacles');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: string; inquiries: string[]; affirmation: string } | null>(null);
  const { recordCalculation } = useSyllabusStore();

  const handleDeepScan = async() => {
    if (!inquiry.trim()) {
      return;
    }
    setLoading(true);
    setResult(null);
    audioManager.playRustle();

    try {
      const data = await getShadowWorkAnalysis(inquiry);
      setResult(data);
      recordCalculation();
      logCalculation('SHADOW_WORK', inquiry.slice(0, 30), data);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Take a breath and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-5xl mx-auto pb-32">
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-black text-white shadow-xl">Back</button>

      <div className="w-full space-y-12 pt-12 md:pt-0">
        <header className="space-y-4 text-center">
          <h2 className="heading-marker text-6xl sm:text-8xl text-marker-black lowercase leading-none">Shadow Analysis</h2>
          <p className="handwritten text-lg sm:text-xl opacity-40 font-bold uppercase tracking-[0.4em] italic">Examination of unconscious patterns</p>
          <div className="w-32 h-1 bg-marker-black/20 mx-auto rounded-full"></div>
        </header>

        {!result ? (
          <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in duration-1000">
            <div className="space-y-2">
              <label className="handwritten text-[10px] font-bold uppercase opacity-40 tracking-widest ml-1">Identify current obstacles or patterns</label>
              <textarea
                value={inquiry}
                onChange={e => setInquiry(e.target.value)}
                placeholder="Enter analysis subject..."
                className="w-full p-8 marker-border bg-marker-black/[0.03] italic text-2xl outline-none focus:bg-white transition-all h-64 resize-none shadow-inner"
              />
            </div>
            <button
              onClick={handleDeepScan}
              disabled={loading || !inquiry.trim()}
              className="brutalist-button w-full !py-8 !text-2xl !bg-black text-white shadow-2xl hover:bg-marker-red transition-all"
            >
              {loading ? 'Processing...' : 'Analyze'}
            </button>
            <p className="handwritten text-center text-xs opacity-30 italic">"The shadow represents unconscious behavioral patterns."</p>
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-4xl mx-auto">
            <section className="space-y-6">
              <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
                <h3 className="heading-marker text-4xl text-marker-black lowercase">Analysis Results</h3>
                <ReadAloudButton text={result.analysis} className="!bg-black !text-white !py-1 !text-[10px]" />
              </div>
              <div className="p-8 md:p-12 marker-border border-marker-black bg-black text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] select-none pointer-events-none text-9xl font-bold italic">REVEAL</div>
                <p className="handwritten text-xl md:text-2xl leading-relaxed italic font-medium relative z-10">
                  <WritingEffect text={result.analysis} speed={20} playAudio={true} />
                </p>
              </div>
            </section>

            <section className="space-y-8">
              <span className="handwritten text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 block border-b border-marker-black/5 pb-2">3 things to think about</span>
              <div className="grid grid-cols-1 gap-6">
                {result.inquiries.map((q, i) => (
                  <div key={i} className="p-8 marker-border border-marker-black/10 bg-white shadow-sm flex gap-6 items-start group hover:border-black transition-all">
                    <span className="heading-marker text-4xl opacity-10 group-hover:opacity-40 transition-opacity">0{i + 1}</span>
                    <p className="handwritten text-2xl italic text-marker-black leading-snug">{q}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-12 marker-border border-marker-black/20 bg-surface shadow-md text-center space-y-6 animate-in zoom-in duration-1000 delay-500">
              <span className="handwritten text-[10px] font-black uppercase text-marker-black tracking-[0.6em] opacity-40">Final thought</span>
              <p className="heading-marker text-3xl md:text-4xl text-marker-black lowercase leading-tight">
                 "{result.affirmation}"
              </p>
              <button onClick={() => {
                setResult(null); setInquiry('');
              }} className="text-[10px] font-bold uppercase tracking-widest text-marker-black opacity-40 hover:opacity-100 hover:text-marker-red transition-all">Clear and Restart</button>
            </section>
          </div>
        )}
      </div>

      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-b from-transparent via-marker-black/[0.02] to-marker-black/[0.05]"></div>
    </div>
  );
};

export default ShadowWorkTool;
