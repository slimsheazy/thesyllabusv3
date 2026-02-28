
import React, { useState, useEffect, useCallback, memo } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { useSyllabusStore } from '../store';
import { audioManager } from './AudioManager';
import { WritingEffect } from './WritingEffect';

interface SectorInfo {
  star: number;
  label: string;
  vibe: string;
  instructorTalk: string;
  remedy: string;
  color: string;
  icon: React.ReactNode;
}

const SECTORS: Record<string, SectorInfo> = {
  'N': {
    star: 8, label: 'North', color: 'text-marker-blue', icon: <TrendingUp size={20}/>,
    vibe: 'The Money Maker',
    instructorTalk: 'Look, this is basically the VIP lounge of your house right now. If you\'ve got a laptop and some ambition, sit here. It\'s the current \'gold star\' zone.',
    remedy: 'Keep it clean. No laundry piles. Prosperity doesn\'t like tripping over socks.'
  },
  'S': {
    star: 7, label: 'South', color: 'text-marker-red', icon: <AlertTriangle size={20}/>,
    vibe: 'The Gossip Trap',
    instructorTalk: 'This corner\'s got a bit of a sharp tongue. Watch your mouth in this room, or you\'ll end up in a fight about the dishes that lasts three days.',
    remedy: 'Quiet energy. Maybe a bowl of still water to cool the temper down.'
  },
  'E': {
    star: 1, label: 'East', color: 'text-marker-green', icon: <Sparkles size={20}/>,
    vibe: 'The Fresh Start',
    instructorTalk: 'Decent vibes. Good for writing emails or finally starting that hobby you\'ll quit in two weeks. It\'s \'new leaf\' energy.',
    remedy: 'Open a window. Let the air move. Stagnation is the enemy here.'
  },
  'W': {
    star: 5, label: 'West', color: 'text-yellow-600', icon: <ShieldAlert size={20}/>,
    vibe: 'The Danger Zone',
    instructorTalk: 'Treat this square like a sleeping tiger. Don\'t renovate, don\'t bang nails into the wall, and honestly? Maybe don\'t even look at it too hard.',
    remedy: 'Metal. Heavy metal. A brass bowl or just... absolute silence.'
  },
  'NE': {
    star: 6, label: 'Northeast', color: 'text-marker-black', icon: <ShieldAlert size={20}/>,
    vibe: 'The Disciplinarian',
    instructorTalk: 'Very stiff-upper-lip energy here. Good for taxes or doing things you don\'t want to do. It\'s the \'Boss\' star, and he\'s watching the clock.',
    remedy: 'Organize your files. This sector hates chaos more than anything.'
  },
  'NW': {
    star: 4, label: 'Northwest', color: 'text-marker-teal', icon: <Sparkles size={20}/>,
    vibe: 'The Romantic',
    instructorTalk: 'It\'s sexy and it knows it. If you\'re single, hang out here. If you\'re writing a screenplay, also hang out here. It\'s creative juice.',
    remedy: 'Fresh flowers. Four stalks of bamboo. Keep it pretty.'
  },
  'SE': {
    star: 2, label: 'Southeast', color: 'text-orange-800', icon: <Info size={20}/>,
    vibe: 'The Sick Bed',
    instructorTalk: 'This sector\'s a bit under the weather. It\'s the \'nap corner,\' but not the good kind. If you feel sluggish here, blame the 2-star.',
    remedy: 'A salt water cure. Or just, you know, some actual sunlight.'
  },
  'SW': {
    star: 9, label: 'Southwest', color: 'text-marker-purple', icon: <TrendingUp size={20}/>,
    vibe: 'The Rising Star',
    instructorTalk: 'The next big thing. Happy, flashy, and a little bit loud. Great for parties or just feeling like you\'ve actually got your life together.',
    remedy: 'Bright lights. Red accents. Let this place glow.'
  },
  'C': {
    star: 3, label: 'Center', color: 'text-marker-teal', icon: <Coffee size={20}/>,
    vibe: 'The Argumentative',
    instructorTalk: 'The heart of the home is feeling a little cranky. Expect some bickering near the kitchen island. It\'s \'wood\' energy trying to break out.',
    remedy: 'A red rug or a candle. Burn off that nervous friction.'
  }
};

const BlueprintSector = memo(({ id, active, onClick }: { id: string, active: boolean, onClick: () => void }) => {
  const data = SECTORS[id];
  return (
    <button
      onClick={onClick}
      className={`relative aspect-square marker-border flex flex-col items-center justify-center p-2 transition-all duration-500 overflow-hidden ${active ? 'bg-surface shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] border-marker-black' : 'bg-marker-black/[0.02] border-marker-black/10 hover:bg-marker-black/[0.04]'}`}
    >
      <div className={'absolute top-1 left-1 font-mono text-[8px] opacity-30 font-black uppercase'}>{data.label}</div>
      <div className={`heading-marker text-4xl sm:text-6xl ${data.color} ${active ? 'scale-110' : 'opacity-40'} transition-transform`}>{data.star}</div>
      <div className="mt-1 font-mono text-[7px] uppercase font-bold tracking-tighter opacity-40">{data.vibe}</div>
      {active && <div className="absolute inset-0 border-2 border-marker-black/10 animate-pulse pointer-events-none"></div>}
    </button>
  );
});

const FlyingStarTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [degree, setDegree] = useState<number>(0);
  const [selectedSector, setSelectedSector] = useState<string>('C');
  const [compassActive, setCompassActive] = useState(false);
  const { userLocation } = useSyllabusStore();

  const syncCompass = useCallback(() => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
            setCompassActive(true);
          }
        });
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
      setCompassActive(true);
    }
    audioManager.playRustle();
  }, []);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    let heading = 0;
    if ((event as any).webkitCompassHeading) {
      heading = (event as any).webkitCompassHeading;
    } else {
      heading = 360 - (event.alpha || 0);
    }
    setDegree(Math.round(heading));
  };

  useEffect(() => {
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const gridOrder = ['NW', 'N', 'NE', 'W', 'C', 'E', 'SW', 'S', 'SE'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-7xl mx-auto overflow-x-hidden">
      <button onClick={onBack} className="fixed top-4 right-4 brutalist-button !text-[10px] z-50 bg-surface shadow-xl">Back</button>

      <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-start pt-12 lg:pt-0">
        <div className="w-full lg:w-[400px] space-y-10 lg:sticky lg:top-20">
          <header className="space-y-4">
            <h2 className="heading-marker text-6xl text-marker-teal lowercase leading-none">House <GlossaryTerm word="Lo Shu">Vibe Check</GlossaryTerm></h2>
            <p className="handwritten text-lg text-marker-teal opacity-60 font-bold uppercase tracking-widest italic">Organizing your space so you feel better</p>
          </header>

          <div className="p-8 marker-border border-marker-teal/10 bg-surface shadow-sm space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="handwritten text-[10px] font-black uppercase text-marker-black opacity-40 tracking-widest">Door Orientation</label>
                <button
                  onClick={syncCompass}
                  className={`flex items-center gap-2 px-3 py-1 marker-border !text-[9px] font-black uppercase transition-all ${compassActive ? 'bg-marker-teal text-white border-marker-teal' : 'hover:bg-marker-teal/10'}`}
                >
                  <Compass size={12} className={compassActive ? 'animate-spin' : ''} /> {compassActive ? 'Synced' : 'Use Compass'}
                </button>
              </div>
              <div className="flex items-center gap-6">
                <input
                  type="range" min="0" max="359"
                  className="flex-1 accent-marker-teal h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  value={degree}
                  onChange={(e) => {
                    setDegree(parseInt(e.target.value));
                    setCompassActive(false);
                  }}
                />
                <span className="heading-marker text-4xl w-16 text-right">{degree}°</span>
              </div>
            </div>

            <div className="pt-6 border-t border-marker-black/5">
              <span className="handwritten text-[10px] font-black uppercase text-marker-black opacity-30 block mb-2">How to use this</span>
              <p className="handwritten text-sm italic text-marker-black/60 leading-relaxed">
                "Stand in the middle of your place. Point your phone at your front door. The grid on the right shows which corners of your house have which vibe. Tap a square to see the details."
              </p>
            </div>
          </div>

          {userLocation && (
            <div className="flex items-center gap-2 opacity-30 justify-center">
              <Home size={12} />
              <span className="font-mono text-[8px] uppercase font-bold tracking-tighter">Current Lat: {userLocation.lat.toFixed(2)}N</span>
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-12 pb-32">
          {/* THE GRID */}
          <div className="max-w-[500px] mx-auto w-full grid grid-cols-3 marker-border border-marker-black bg-white shadow-2xl p-2 relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] font-black uppercase opacity-20">Front door side</div>
            {gridOrder.map(id => (
              <BlueprintSector
                key={id}
                id={id}
                active={selectedSector === id}
                onClick={() => {
                  setSelectedSector(id); audioManager.playPenScratch(0.05);
                }}
              />
            ))}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] font-black uppercase opacity-20">Back of the house</div>
          </div>

          {/* THE ANALYSIS */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-10 marker-border border-marker-black bg-surface shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-marker-black group-hover:scale-110 transition-transform">
                {SECTORS[selectedSector].icon}
              </div>

              <header className="mb-8 border-b border-marker-black/10 pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`heading-marker text-5xl lowercase ${SECTORS[selectedSector].color}`}>{SECTORS[selectedSector].star}</span>
                  <span className="h-6 w-px bg-marker-black/10"></span>
                  <h3 className="heading-marker text-3xl text-marker-black lowercase">{SECTORS[selectedSector].vibe}</h3>
                </div>
                <span className="handwritten text-[10px] font-black uppercase text-marker-black opacity-30 tracking-[0.4em]">Location: {SECTORS[selectedSector].label}</span>
              </header>

              <div className="space-y-10">
                <div className="space-y-4">
                  <span className="handwritten text-[10px] font-bold uppercase text-marker-teal tracking-widest block">The instructor says...</span>
                  <p className="handwritten text-2xl md:text-3xl italic text-marker-black/80 leading-tight">
                    <WritingEffect text={SECTORS[selectedSector].instructorTalk} speed={20} />
                  </p>
                </div>

                <div className="p-6 bg-marker-red/5 marker-border border-marker-red/10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="shrink-0 flex items-center gap-2 font-mono text-[9px] font-black uppercase text-marker-red tracking-widest">
                    <ShieldAlert size={14} /> Fixing the vibe
                  </div>
                  <p className="handwritten text-lg text-marker-red/80 font-bold italic">
                         "{SECTORS[selectedSector].remedy}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyingStarTool;
