
import { useSyllabusStore } from '../store';
import { audioManager } from './AudioManager';
import { useMemo, memo } from 'react';

export const HomeView = memo(({ onEnter }: { onEnter: () => void }) => {
  const { isEclipseMode, calculationsRun, userIdentity } = useSyllabusStore();

  const grade = useMemo(() => {
    if (calculationsRun >= 25) return "Expert Seeker";
    if (calculationsRun >= 15) return "Deep Diver";
    if (calculationsRun >= 10) return "Regular Visitor";
    if (calculationsRun >= 5) return "Curious Student";
    return "Newcomer";
  }, [calculationsRun]);

  const handleEnter = () => {
    audioManager.playRustle();
    onEnter();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden bg-transparent">
      <div className="max-w-4xl w-full space-y-6 sm:space-y-12 flex flex-col items-center py-12 z-10">
        <header className="space-y-4 text-center max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="flex flex-col items-center gap-2">
             <div className="px-3 py-0.5 border border-marker-black/10 rounded-full bg-white shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-marker-green animate-pulse"></span>
                <span className="handwritten text-[9px] font-black uppercase tracking-widest text-marker-black/40">
                  {userIdentity ? `Info on ${userIdentity}` : 'Your Personal Study Guide'}
                </span>
             </div>
             {calculationsRun > 0 && (
               <div className="handwritten text-[10px] font-bold uppercase tracking-[0.2em] text-marker-blue">
                 Your Level: {grade}
               </div>
             )}
           </div>
          <h1 className="title-main text-5xl md:text-7xl text-marker-green leading-none lowercase tracking-tighter">
            the syllabus
          </h1>
           <p className="handwritten text-base sm:text-lg text-marker-black/60 leading-relaxed max-w-md mx-auto">
             A bunch of easy tools and shared tips to help you figure out the big stuff in life.
           </p>
        </header>

        <div className="flex gap-6 pt-4 pb-8 animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <button 
            onClick={handleEnter} 
            className="brutalist-button px-12 py-5 text-xl bg-white shadow-xl hover:scale-105 transition-transform"
          >
            Start Exploring
          </button>
        </div>

        <div className="pt-8 opacity-10 flex flex-col items-center gap-3">
           <div className="w-px h-16 bg-gradient-to-b from-marker-black to-transparent"></div>
           <span className="handwritten text-[8px] uppercase tracking-[0.5em] font-black">scroll down</span>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] border border-black/[0.03] rounded-full"></div>
        <div className="absolute top-[-10%] left-[-15%] w-[35rem] h-[35rem] border border-black/[0.03] rounded-full"></div>
      </div>
      
      {isEclipseMode && <div className="absolute inset-0 bg-black/5 pointer-events-none mix-blend-multiply -z-5"></div>}
    </div>
  );
});
