
import { useState, useRef, useEffect } from 'react';
import { generateStream, generateTarotImage } from '../services/geminiService';
import { GlossaryTerm } from './GlossaryEngine';
import { logCalculation } from '../services/dbService';
import { useSyllabusStore } from '../store';
import { useResonance } from '../hooks/useResonance';
import { audioManager } from './AudioManager';
import { TarotCardDisplay } from './Tarot/CardDisplay';
import { SpreadType, DeckTheme, TarotCard } from '../types';

const MAJOR_ARCANA = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", 
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", 
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", 
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

const SUITS = ["Wands", "Cups", "Swords", "Pentacles"];
const RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

const MINOR_ARCANA = SUITS.flatMap(suit => RANKS.map(rank => `${rank} of ${suit}`));

const FULL_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

const SPREAD_CONFIGS: Record<SpreadType, string[]> = {
  [SpreadType.SINGLE]: ["Main Focus"],
  [SpreadType.TRINITY]: ["The Past", "The Present", "The Future"],
  [SpreadType.CELTIC_CROSS]: [
    "You right now", "What's in your way", "Your goals", "Your foundation",
    "The recent past", "What's coming next", "How you feel", "What others see", "Hopes & Fears", "How it ends"
  ]
};

const DECK_LABELS: Record<DeckTheme, string> = {
  [DeckTheme.CLASSIC]: 'Rider–Waite–Smith',
  [DeckTheme.ALCHEMICAL]: 'Thoth Tarot',
  [DeckTheme.SHADOW]: 'Tarot de Marseille',
  [DeckTheme.COSMIC]: 'Smith–Waite Centennial'
};

export const TarotTool = ({ onBack }: { onBack: () => void }) => {
  const [question, setQuestion] = useState('');
  const [spreadType, setSpreadType] = useState<SpreadType>(SpreadType.TRINITY);
  const [deckTheme, setDeckTheme] = useState<DeckTheme>(DeckTheme.CLASSIC);
  const [reading, setReading] = useState<{ interpretation: string; guidance: string } | null>(null);
  const [streamedText, setStreamedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const { recordCalculation } = useSyllabusStore();
  const { resonancePrompt } = useResonance();
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleDraw = async () => {
    if (!question.trim()) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true); 
    setReading(null); 
    setStreamedText('');
    audioManager.playRustle();

    const positions = SPREAD_CONFIGS[spreadType];
    const selected: TarotCard[] = [...FULL_DECK]
      .sort(() => 0.5 - Math.random())
      .slice(0, positions.length)
      .map((name, i) => ({ 
        name, 
        isReversed: Math.random() > 0.7,
        positionLabel: positions[i]
      }));

    setDrawnCards(selected);

    const deckLabel = DECK_LABELS[deckTheme];

    selected.forEach(async (card, index) => {
      const url = await generateTarotImage(card.name, deckLabel);
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

    const systemInstruction = `You are a friendly tarot reader in 'The Lax Instructor' voice. 
Deck: ${deckLabel} (publicly available). 
Spread: ${spreadType}. 
Tell a story with these cards. Don't just list them. Explain how they connect. 
Use simple, grounded language. Like talking to a friend over a drink.
Finish with 'ADVICE:' and a simple 5-word takeaway.${resonancePrompt}`;

    const prompt = `QUESTION: "${question}"\n\nCARDS DRAWN:\n${selected.map(c => `${c.positionLabel}: ${c.name}${c.isReversed ? ' (Reversed)' : ''}`).join('\n')}`;

    try {
      let full = '';
      const stream = generateStream('gemini-3-flash-preview', prompt, systemInstruction, signal);
      
      let started = false;
      for await (const chunk of stream) { 
        if (signal.aborted) break;
        if (!started) {
          setLoading(false);
          started = true;
        }
        full += chunk; 
        setStreamedText(full); 
      }

      if (!signal.aborted) {
        setLoading(false);
        const parts = full.split('ADVICE:');
        const fr = { interpretation: parts[0].trim(), guidance: parts[1]?.trim() || "Hard to say right now." };
        setReading(fr); 
        logCalculation('TAROT', `${spreadType}: ${question}`, { ...fr, cards: selected, theme: deckTheme }); 
        recordCalculation();
      }
    } catch (err) { 
      if (err instanceof Error && err.name === 'AbortError') return;
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-full py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto pb-48">
      <button onClick={onBack} className="fixed top-4 right-4 brutalist-button !text-[10px] z-50 bg-surface shadow-xl">Back</button>
      <div className="flex flex-col lg:flex-row gap-12 xl:gap-24 items-start pt-12 md:pt-0">
        <div className="w-full lg:w-[450px] space-y-10 lg:sticky lg:top-20">
           <header className="space-y-4">
             <h2 className="heading-marker text-6xl md:text-7xl text-marker-purple lowercase leading-none">Read the Cards</h2>
             <p className="handwritten text-xl opacity-40 uppercase tracking-widest italic">Finding the story in the deck</p>
           </header>
           <div className="space-y-6">
             <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="What's on your mind? Ask a question..." className="w-full p-6 text-xl min-h-[140px] shadow-sm italic outline-none bg-surface/50 rounded-lg" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="handwritten text-[8px] font-black uppercase opacity-40 ml-1">Type of Layout</label>
                 <select value={spreadType} onChange={e => setSpreadType(e.target.value as SpreadType)} className="w-full p-3 bg-surface italic outline-none rounded-lg">
                   <option value={SpreadType.SINGLE}>Just One Card</option>
                   <option value={SpreadType.TRINITY}>Past, Present, Future</option>
                   <option value={SpreadType.CELTIC_CROSS}>The Big Reading</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="handwritten text-[8px] font-black uppercase opacity-40 ml-1">Deck</label>
                 <select value={deckTheme} onChange={e => setDeckTheme(e.target.value as DeckTheme)} className="w-full p-3 bg-surface italic outline-none rounded-lg">
                   <option value={DeckTheme.CLASSIC}>Rider–Waite–Smith</option>
                   <option value={DeckTheme.ALCHEMICAL}>Thoth Tarot</option>
                   <option value={DeckTheme.SHADOW}>Tarot de Marseille</option>
                   <option value={DeckTheme.COSMIC}>Smith–Waite Centennial</option>
                 </select>
               </div>
             </div>
             <button disabled={loading || !question.trim()} onClick={handleDraw} className="brutalist-button w-full !py-8 !text-2xl !bg-marker-black text-surface hover:scale-[1.01] transition-transform shadow-2xl">
               {loading ? 'Shuffling...' : 'Deal the Cards'}
             </button>
           </div>
        </div>
        <div className="flex-1 w-full min-h-[500px]">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-8 animate-in fade-in">
                <div className="w-20 h-20 border-2 border-marker-purple border-t-transparent animate-spin rounded-full"></div>
                <span className="handwritten text-xl text-marker-purple font-black animate-pulse uppercase tracking-[0.4em]">Setting up the table...</span>
             </div>
           ) : (streamedText || reading) ? (
             <TarotCardDisplay cards={drawnCards} text={streamedText} reading={reading} spreadType={spreadType} />
           ) : (
             <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none">
               <div className="text-[12rem] xl:text-[18rem] heading-marker leading-none">CARDS</div>
               <p className="handwritten text-4xl uppercase tracking-[0.4em]">Waiting for a question</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
export default TarotTool;
