
import React, { useState, useCallback, useRef } from 'react';
import { getCustomTarotSpread, generateStream, generateTarotImage } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { audioManager } from './AudioManager';
import { WritingEffect } from './WritingEffect';
import { ReadAloudButton } from './ReadAloudButton';
import { SpreadDefinition, TarotCard, ToolProps } from '../types';

// Polyfill for AbortController if not available
if (typeof AbortController === 'undefined') {
  (globalThis as any).AbortController = class AbortController {
    signal: any;
    aborted: boolean = false;
    abort() {
      this.aborted = true;
    }
  };
}

const MAJOR_ARCANA = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
];
const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
const MINOR_ARCANA = SUITS.flatMap(suit => RANKS.map(rank => `${rank} of ${suit}`));
const FULL_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

const SpreadGeneratorTool: React.FC<ToolProps> = ({ onBack }) => {
  const [inquiry, setInquiry] = useState('Life path and personal development');
  const [loadingSpread, setLoadingSpread] = useState(false);
  const [loadingReading, setLoadingReading] = useState(false);
  const [spread, setSpread] = useState<SpreadDefinition | null>(null);
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [readingText, setReadingText] = useState('');
  const [view, setView] = useState<'input' | 'spread' | 'reading'>('input');

  const { recordCalculation } = useSyllabusStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerateSpread = async() => {
    if (!inquiry.trim()) {
      return;
    }
    setLoadingSpread(true);
    audioManager.playRustle();
    try {
      const result = await getCustomTarotSpread(inquiry);
      if (result) {
        setSpread(result);
        setView('spread');
      }
    } catch (e) {
      alert('Spread architecture failed. Re-initialize inquiry.');
    } finally {
      setLoadingSpread(false);
    }
  };

  const handleDrawCards = async() => {
    if (!spread) {
      return;
    }
    setLoadingReading(true);
    audioManager.playRustle();

    const selected: TarotCard[] = [...FULL_DECK]
      .sort(() => 0.5 - Math.random())
      .slice(0, spread.positions.length)
      .map((name, i) => ({
        name,
        isReversed: Math.random() > 0.7,
        positionLabel: spread.positions[i].label
      }));

    setDrawnCards(selected);
    setView('reading');

    // Load images
    selected.forEach(async(card, index) => {
      const url = await generateTarotImage(card.name, 'CLASSIC' as any);
      if (url) {
        setDrawnCards(prev => {
          const next = [...prev];
          if (next[index]) {
            next[index] = { ...next[index], imageUrl: url };
          }
          return next;
        });
      }
    });

    // Generate Reading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const cardData = selected.map(c => `${c.positionLabel}: ${c.name}${c.isReversed ? ' (Reversed)' : ''}`).join(', ');
    const prompt = `INQUIRY: ${inquiry}\nSPREAD: ${spread.title}\nCARDS: ${cardData}`;
    const sys = 'You are a Tarot Analyst. Provide a profound synthesis of these cards in this specific custom spread. End with a 5-word guidance sentence.';

    try {
      let full = '';
      const stream = generateStream('gemini-3-flash-preview', prompt, sys, abortControllerRef.current.signal);
      for await (const chunk of stream) {
        full += chunk;
        setReadingText(full);
      }
      recordCalculation();
      logCalculation('TAROT_GENERATOR', inquiry, { spread, cards: selected, reading: full });
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error(e);
      }
    } finally {
      setLoadingReading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface p-6 md:p-12 max-w-7xl mx-auto overflow-hidden text-marker-black">
      <button onClick={onBack} className="fixed top-6 right-6 z-[100] brutalist-button !text-[10px] flex items-center gap-2">
        <span className="text-[10px]">←</span> Index
      </button>

      <div className="w-full flex-grow flex flex-col items-center justify-start pt-12">
        {view === 'input' && (
          <div className="w-full max-w-2xl space-y-12 animate-in fade-in duration-700">
            <header className="space-y-4">
              <h1 className="heading-marker text-7xl md:text-9xl leading-none lowercase text-marker-pink">Spread<br/>Generator</h1>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-40">AI-Augmented Cartomancy Design</p>
            </header>

            <div className="space-y-6">
              <textarea
                value={inquiry}
                onChange={e => setInquiry(e.target.value)}
                placeholder="What area of life requires a custom lens?"
                className="w-full h-40 p-6 marker-border bg-white text-2xl italic outline-none focus:border-marker-purple shadow-inner"
              />
              <button
                onClick={handleGenerateSpread}
                disabled={loadingSpread || !inquiry.trim()}
                className="brutalist-button w-full !py-8 !text-2xl !bg-marker-black !text-surface flex items-center justify-center gap-4"
              >
                {loadingSpread ? 'Architecting...' : <>Generate Layout ✨</>}
              </button>
            </div>
          </div>
        )}

        {view === 'spread' && spread && (
          <div className="w-full max-w-4xl space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            <header className="space-y-4 border-b border-marker-black/10 pb-8">
              <div className="flex justify-between items-end">
                <h2 className="heading-marker text-6xl lowercase">{spread.title}</h2>
                <span className="font-mono text-[9px] uppercase tracking-widest opacity-40">Protocol Locked</span>
              </div>
              <p className="handwritten text-xl italic opacity-60">"{spread.rationale}"</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {spread.positions.map((pos, i) => (
                <div key={i} className="p-8 marker-border bg-white group hover:bg-marker-black hover:text-white transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="heading-marker text-4xl opacity-10 group-hover:opacity-40">0{i + 1}</span>
                    <h4 className="heading-marker text-2xl lowercase">{pos.label}</h4>
                  </div>
                  <p className="handwritten text-sm opacity-60 group-hover:opacity-100">{pos.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-12 flex flex-col sm:flex-row gap-4">
              <button onClick={handleDrawCards} className="brutalist-button flex-grow !py-6 !text-2xl !bg-marker-purple !text-white !border-marker-purple flex items-center justify-center gap-4">
                Cast Cards ⚡
              </button>
              <button onClick={() => setView('input')} className="brutalist-button !py-6 !px-8 hover:!bg-marker-red hover:!text-white hover:!border-marker-red">
                Reset
              </button>
            </div>
          </div>
        )}

        {view === 'reading' && (
          <div className="w-full max-w-6xl space-y-16 animate-in fade-in duration-1000 pb-32">
            <div className="flex flex-wrap gap-6 justify-center">
              {drawnCards.map((card, i) => (
                <div key={i} className="w-32 md:w-48 marker-border bg-white group relative aspect-[2/3] overflow-hidden shadow-xl hover:-translate-y-2 transition-transform">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" alt={card.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center animate-pulse opacity-20">
                      <span className="text-[10px]">📚</span>
                    </div>
                  )}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                    <span className="font-mono text-[8px] bg-white/90 text-marker-black inline-block px-2 py-1 rounded shadow-sm self-start">{card.positionLabel}</span>
                    <div className="bg-white/90 p-2 rounded shadow-sm">
                      <p className="heading-marker text-[10px] leading-tight">{card.name}</p>
                      {card.isReversed && <span className="text-[8px] text-marker-red uppercase font-black tracking-tighter">Rev</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
                <h3 className="heading-marker text-4xl lowercase">The Revelation</h3>
                <ReadAloudButton text={readingText} className="!bg-marker-black !text-white !py-1 !px-3 !text-[10px]" />
              </div>
              <div className="p-8 md:p-12 marker-border bg-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] text-8xl heading-marker italic uppercase select-none">Voice</div>
                <p className="handwritten text-2xl md:text-3xl leading-relaxed italic relative z-10">
                  <WritingEffect text={readingText} speed={20} />
                </p>
              </div>
              <button onClick={() => setView('input')} className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 underline underline-offset-8 decoration-1">Initialize New Vector</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpreadGeneratorTool;
