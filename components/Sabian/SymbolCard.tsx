
import React, { useState, useEffect } from 'react';
import { getSabianInterpretation } from '../../services/geminiService';
import { HARDCODED_INTERPRETATIONS } from '../../data/sabianInterpretations';
import { ReadAloudButton } from '../ReadAloudButton';
import { WritingEffect } from '../WritingEffect';
import { SabianResult } from '../../types';

export const SymbolCard: React.FC<{ sign: string, degree: number, phrase: string, isOracle?: boolean }> = ({ sign, degree, phrase, isOracle }) => {
  const [data, setData] = useState<SabianResult | null>(null);
  const [loading, setLoading] = useState(false);
  const label = `${degree}° ${sign}`;

  useEffect(() => {
    let isActive = true;
    const fetch = async() => {
      if (HARDCODED_INTERPRETATIONS[label]) {
        if (isActive) {
          setData(HARDCODED_INTERPRETATIONS[label]);
        }
        return;
      }
      setLoading(true);
      const res = await getSabianInterpretation(label, phrase, isOracle ? 'oracle' : 'daily');
      if (isActive && res) {
        setData(res);
        setLoading(false);
      }
    };
    fetch();
    return () => {
      isActive = false;
    };
  }, [label, phrase, isOracle]);

  return (
    <div className="p-8 md:p-12 marker-border bg-surface shadow-2xl space-y-10 animate-in fade-in duration-700">
      <header className="border-b border-marker-black/10 pb-6 flex justify-between items-end">
        <h3 className="heading-marker text-4xl lowercase">{label}</h3>
        {data && <ReadAloudButton text={`${phrase}. ${data.fullInterpretation}`} className="!py-1 !px-2 !text-[10px]" />}
      </header>
      <p className="handwritten text-2xl md:text-3xl italic font-medium leading-tight">"{phrase}"</p>
      {loading ? (
        <div className="flex flex-col gap-4 py-12 items-center text-center opacity-20">
          <div className="w-12 h-12 border-2 border-marker-black border-t-transparent animate-spin rounded-full"></div>
          <p className="handwritten italic">Consulting Archival Gnosis...</p>
        </div>
      ) : data && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-1000">
          <p className="handwritten text-lg md:text-xl text-marker-black/80 italic leading-relaxed border-l-2 border-marker-blue/10 pl-8 relative z-10">
            <WritingEffect text={data.fullInterpretation} speed={12} />
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
            <div className="space-y-2">
              <span className="handwritten text-[10px] font-bold uppercase tracking-widest text-marker-green">Light Path</span>
              <p className="handwritten text-sm italic">"{data.light}"</p>
            </div>
            <div className="space-y-2">
              <span className="handwritten text-[10px] font-bold uppercase tracking-widest text-marker-red">Shadow Work</span>
              <p className="handwritten text-sm italic">"{data.shadow}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
