
import React, { useState, useMemo } from 'react';
import { useSyllabusStore } from '../store';
import { ReadAloudButton } from './ReadAloudButton';
import { GlossaryTerm } from './GlossaryEngine';
import { audioManager } from './AudioManager';

const COMMON_TERMS = [
  'Heuristic', 'Eudaimonia', 'Archetype', 'Synthesis', 'Framework', 'Entropy', 'Gnosis', 'Lexicon'
];

const Lexicon: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const unlockedTerms = useSyllabusStore(state => state.unlockedTerms);
  const [search, setSearch] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const termList = useMemo(() => {
    return Object.entries(unlockedTerms)
      .filter(([word]) => word.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [unlockedTerms, search]);

  const stats = useMemo(() => ({
    total: Object.keys(unlockedTerms).length,
    foundThisSession: (Object.values(unlockedTerms) as Array<{ discoveredAt: string }>).filter(t => {
      const discovered = new Date(t.discoveredAt).getTime();
      const sessionStart = Date.now() - (1000 * 60 * 60);
      return discovered > sessionStart;
    }).length
  }), [unlockedTerms]);

  return (
    <div className="min-h-screen flex flex-col items-center py-20 px-4 md:px-8 relative max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-8 right-8 brutalist-button !text-sm z-50 bg-surface shadow-xl">Index</button>

      <header className="mb-20 text-center space-y-8 w-full max-w-3xl">
        <h1 className="title-main !text-6xl md:!text-9xl text-marker-blue leading-none">archive <GlossaryTerm word="Lexicon">glossary</GlossaryTerm></h1>
        <p className="handwritten text-xl opacity-60 italic max-w-lg mx-auto">An archival record of identified esoteric concepts and heuristics.</p>

        <div className="flex justify-center gap-8 mt-10">
          <div className="text-center">
            <div className="heading-marker text-5xl text-marker-blue">{stats.total}</div>
            <div className="handwritten text-[10px] uppercase font-bold tracking-widest opacity-40">Identified</div>
          </div>
          <div className="text-center">
            <div className="heading-marker text-5xl text-marker-green">{stats.foundThisSession}</div>
            <div className="handwritten text-[10px] uppercase font-bold tracking-widest opacity-40">Recent</div>
          </div>
        </div>

        <div className="pt-10 w-full">
          <input
            type="text"
            placeholder="Filter Lexical Nodes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-4 marker-border bg-surface text-2xl italic outline-none focus:border-marker-blue shadow-sm"
          />
        </div>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 pb-48">
        <section className="space-y-8">
          <div>
            <span className="handwritten text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 block mb-6 italic">Indices of Gnosis</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {termList.length === 0 ? (
                <div className="col-span-full py-10 opacity-40 italic text-sm">No specific terms discovered yet. Explore other tools to unlock nodes.</div>
              ) : (termList as Array<[string, { etymology?: string, definition: string, discoveredAt: string }]>).map(([word, data]) => (
                <button
                  key={word}
                  onClick={() => {
                    setSelectedTerm(word); audioManager.playRustle();
                  }}
                  className={`p-5 marker-border text-left transition-all group ${selectedTerm === word ? 'bg-marker-blue text-white shadow-xl translate-x-2' : 'bg-surface hover:border-marker-blue'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="heading-marker text-2xl lowercase">{word}</span>
                    <span className={`text-[9px] font-mono opacity-30 ${selectedTerm === word ? 'opacity-100' : ''}`}>[{data.etymology?.slice(0,3) || 'LEX'}]</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {termList.length < 5 && (
            <div className="p-8 marker-border border-dashed border-marker-black/10 bg-marker-black/[0.01]">
              <span className="handwritten text-[10px] font-bold uppercase tracking-widest text-marker-black/30 block mb-6">Common Frameworks (Suggested)</span>
              <div className="flex flex-wrap gap-2">
                {COMMON_TERMS.map(term => (
                  <GlossaryTerm key={term} word={term}>
                    <span className="px-3 py-1 bg-surface marker-border text-xs hover:border-marker-blue transition-colors">{term}</span>
                  </GlossaryTerm>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="relative">
          {selectedTerm ? (
            <div className="sticky top-24 p-8 md:p-10 marker-border border-marker-blue bg-surface shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.02] text-[10rem] font-bold italic select-none pointer-events-none">NODE</div>
              <div className="flex justify-between items-start border-b border-marker-black/10 pb-6">
                <div>
                  <span className="handwritten text-[10px] font-black uppercase text-marker-blue tracking-widest">{unlockedTerms[selectedTerm].etymology || 'Lexicon'}</span>
                  <h2 className="heading-marker text-5xl text-marker-black lowercase leading-none mt-2">{selectedTerm}</h2>
                </div>
                <ReadAloudButton text={`${selectedTerm}. ${unlockedTerms[selectedTerm].definition}`} className="!py-1 !px-2 !text-[10px]" />
              </div>

              <div className="space-y-6">
                <p className="handwritten text-lg md:text-xl text-marker-black/80 leading-relaxed italic font-medium relative z-10">
                  {unlockedTerms[selectedTerm].definition}
                </p>
                <div className="pt-8 flex justify-between items-center opacity-20 text-[9px] font-mono uppercase tracking-tighter">
                  <span>Archival Date: {new Date(unlockedTerms[selectedTerm].discoveredAt).toLocaleDateString()}</span>
                  <span>Status: IDENTIFIED</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-24 flex flex-col items-center justify-center py-40 opacity-[0.05] border-2 border-dashed border-marker-black/20 rounded-xl">
              <div className="text-[12rem] heading-marker">?</div>
              <p className="handwritten text-2xl uppercase tracking-[0.4em]">Select Node</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Lexicon;
