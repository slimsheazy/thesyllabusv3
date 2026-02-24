
import React from 'react';
import { ReadAloudButton } from '../ReadAloudButton';
import { TarotCard, ReadingResponse, SpreadType } from '../../types';
import { WritingEffect } from '../WritingEffect';
import { ArrowRight, ArrowDown } from 'lucide-react';

interface CardDisplayProps {
  cards: TarotCard[];
  text: string;
  reading: ReadingResponse | null;
  spreadType?: SpreadType;
}

const CardItem = ({ card, size = "md", isCrossing = false }: { card: TarotCard, size?: "sm" | "md" | "lg", isCrossing?: boolean }) => (
  <div 
    className={`p-1 bg-surface shadow-lg flex flex-col justify-between items-center text-center transition-all group rounded-lg border border-marker-black/5 overflow-hidden 
      ${card.isReversed && !isCrossing ? 'rotate-180' : ''} 
      ${isCrossing ? 'rotate-90 scale-90 z-20 shadow-2xl border-marker-purple/20' : 'z-10'}
      ${size === 'sm' ? 'min-h-[140px] md:min-h-[180px]' : 'min-h-[220px] md:min-h-[280px]'}
      w-full h-full`}
  >
     <div className={`handwritten text-[6px] md:text-[8px] uppercase font-bold text-marker-black/40 tracking-widest py-1 md:py-2 ${card.isReversed && !isCrossing ? 'rotate-180' : ''}`}>
       {card.positionLabel || 'Arcana'}
     </div>
     
     <div className="flex-grow w-full flex items-center justify-center relative overflow-hidden bg-marker-black/[0.02] rounded-md">
        {card.imageUrl ? (
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            className="w-full h-full object-cover animate-in fade-in duration-1000 mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
             <div className="w-4 h-4 md:w-6 md:h-6 border-t-2 border-marker-purple/20 rounded-full animate-spin"></div>
             <span className="handwritten text-[6px] font-black uppercase opacity-20 tracking-widest animate-pulse hidden md:block">Manifesting</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-40 pointer-events-none"></div>
     </div>

     <div className="py-2 px-1">
        <span className="heading-marker text-xs md:text-sm lowercase leading-tight block truncate w-full">{card.name}</span>
        {card.isReversed && !isCrossing && (
          <span className="handwritten text-[6px] font-black uppercase text-marker-red tracking-tighter opacity-60 block">Reversed</span>
        )}
     </div>
  </div>
);

const ArcBridge = ({ label, vertical = false }: { label: string, vertical?: boolean }) => (
  <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-2 opacity-20 group-hover:opacity-50 transition-opacity`}>
    <div className={`h-px ${vertical ? 'w-0 h-8 border-l border-dashed' : 'w-8 border-t border-dashed'} border-marker-black`}></div>
    <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
    <div className={`h-px ${vertical ? 'w-0 h-8 border-l border-dashed' : 'w-8 border-t border-dashed'} border-marker-black`}></div>
  </div>
);

const CelticCrossLayout = ({ cards }: { cards: TarotCard[] }) => {
  if (cards.length < 10) return null;

  return (
    <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
      <div className="min-w-[700px] grid grid-cols-6 grid-rows-4 gap-4 p-4 items-center justify-items-center">
        {/* CROSS PART */}
        <div className="col-start-2 row-start-1 w-24 md:w-32">
          <CardItem card={cards[2]} size="sm" />
        </div>

        <div className="col-start-1 row-start-2 w-24 md:w-32">
          <CardItem card={cards[4]} size="sm" />
        </div>

        <div className="col-start-2 row-start-2 relative w-24 md:w-32 h-full flex items-center justify-center">
           <CardItem card={cards[0]} size="sm" />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 md:w-44 pointer-events-auto">
                <CardItem card={cards[1]} size="sm" isCrossing={true} />
              </div>
           </div>
        </div>

        <div className="col-start-3 row-start-2 w-24 md:w-32">
          <CardItem card={cards[5]} size="sm" />
        </div>

        <div className="col-start-2 row-start-3 w-24 md:w-32">
          <CardItem card={cards[3]} size="sm" />
        </div>

        {/* BRIDGES (Visual hints) */}
        <div className="col-start-2 row-start-2 absolute mt-48 opacity-10">
           <ArcBridge label="Axis" vertical />
        </div>

        {/* STAFF PART */}
        <div className="col-start-5 row-start-1 w-24 md:w-32">
          <CardItem card={cards[9]} size="sm" />
        </div>
        <div className="col-start-5 row-start-2 w-24 md:w-32">
          <CardItem card={cards[8]} size="sm" />
        </div>
        <div className="col-start-5 row-start-3 w-24 md:w-32">
          <CardItem card={cards[7]} size="sm" />
        </div>
        <div className="col-start-5 row-start-4 w-24 md:w-32">
          <CardItem card={cards[6]} size="sm" />
        </div>
      </div>
    </div>
  );
};

export const TarotCardDisplay: React.FC<CardDisplayProps> = ({ cards, text, reading, spreadType }) => {
  const isCelticCross = spreadType === SpreadType.CELTIC_CROSS;
  const isTrinity = spreadType === SpreadType.TRINITY;

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-700 pb-32">
      <section className="space-y-6">
        <span className="handwritten text-[10px] font-bold uppercase text-marker-black/50 tracking-[0.4em] block border-b border-marker-black/5 pb-2 italic">The Pattern</span>
        
        {isCelticCross ? (
          <CelticCrossLayout cards={cards} />
        ) : isTrinity ? (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
             <div className="max-w-[180px] w-full"><CardItem card={cards[0]} /></div>
             <div className="rotate-90 md:rotate-0"><ArrowRight size={16} className="opacity-20" /></div>
             <div className="max-w-[180px] w-full"><CardItem card={cards[1]} /></div>
             <div className="rotate-90 md:rotate-0"><ArrowRight size={16} className="opacity-20" /></div>
             <div className="max-w-[180px] w-full"><CardItem card={cards[2]} /></div>
          </div>
        ) : (
          <div className={`grid gap-6 ${cards.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {cards.map((c, i) => (
              <CardItem key={i} card={c} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
           <h3 className="heading-marker text-4xl text-marker-black lowercase">Synthesis of Arcs</h3>
           {reading && <ReadAloudButton text={reading.interpretation} className="!py-1 !px-2 !text-[10px]" />}
        </div>
        <div className="p-8 md:p-10 bg-surface shadow-2xl rounded-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl font-bold italic">VOICE</div>
           <div className="handwritten text-lg md:text-xl text-marker-black leading-relaxed italic font-medium relative z-10">
             <WritingEffect text={text.split('GUIDANCE:')[0]} speed={15} />
           </div>
        </div>
      </section>

      {reading && (
        <section className="animate-in slide-in-from-bottom-4 duration-1000">
          <div className="p-10 bg-surface shadow-md rounded-2xl text-center">
             <span className="handwritten text-[10px] text-marker-red uppercase font-bold tracking-[0.5em] block mb-4 italic">Threshold Directive</span>
             <p className="heading-marker text-3xl sm:text-4xl text-marker-black lowercase leading-tight">
               "{reading.guidance}"
             </p>
          </div>
        </section>
      )}
    </div>
  );
};
