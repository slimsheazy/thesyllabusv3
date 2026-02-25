
import { useSyllabusStore } from '../store';
import { Page } from '../types';
import { useMemo, memo, useState } from 'react';

interface MenuItem {
  name: string;
  page: Page;
  minRuns?: number;
}

interface MenuCategory {
  label: string;
  color: string;
  symbol: string;
  isConditional?: boolean;
  items: MenuItem[];
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    label: 'Need some help?',
    color: 'var(--marker-purple)',
    symbol: '☽',
    items: [
      { name: 'Where am I headed?', page: Page.TIMELINE_THREAD },
      { name: 'Design a Layout', page: Page.SPREAD_GENERATOR },
      { name: 'The Photo Reader', page: Page.PHOTO_SCRYER },
      { name: 'Read the Cards', page: Page.TAROT },
      { name: 'The Random Oracle', page: Page.SABIAN_SYMBOLS },
      { name: 'The Coincidence Decoder', page: Page.SYNCHRONICITY_DECODER },
      { name: 'Ask the Stars Right Now', page: Page.HORARY },
      { name: 'Throwing the Charms', page: Page.CHARM_CASTING },
      { name: 'Find My Lost Stuff', page: Page.LOST_ITEM_FINDER }
    ]
  },
  {
    label: 'The Big View',
    color: 'var(--marker-blue)',
    symbol: '☉',
    items: [
      { name: 'The Birth Map', page: Page.BIRTH_CHART },
      { name: 'Who\'s In Charge?', page: Page.RULERSHIP_ANALYSIS },
      { name: 'Pick the Best Time', page: Page.ELECTIONAL },
      { name: 'Where Should I Live?', page: Page.ASTRO_MAP },
      { name: 'Check Your Home\'s Vibe', page: Page.FLYING_STAR },
      { name: 'The Four Pillars', page: Page.BAZI }
    ]
  },
  {
    label: 'Just about you',
    color: 'var(--marker-red)',
    symbol: '☿',
    items: [
      { name: 'Life Path Reader', page: Page.NUMEROLOGY },
      { name: 'The Friend Connection', page: Page.FRIENDSHIP_MATRIX },
      { name: 'Just Checking the Clock', page: Page.BIO_CALC },
      { name: 'Energy Highs and Lows', page: Page.BIORHYTHM }
    ]
  },
  {
    label: 'Stuff to try',
    color: 'var(--marker-green)',
    symbol: '♃',
    items: [
      { name: 'Make a Personal Symbol', page: Page.SIGIL_MAKER },
      { name: 'Build a Custom Ritual', page: Page.MAD_LIBS },
      { name: 'The Brainstorm Helper', page: Page.BRAINSTORM },
      { name: 'The Big Dictionary', page: Page.LEXICON },
      { name: 'The Word Meanings Game', page: Page.SEMANTIC_DRIFT },
      { name: 'Trace a Word\'s Roots', page: Page.PIE_DECONSTRUCTION },
      { name: 'Your Personal Colors', page: Page.COLOR_PALETTE },
      { name: 'The Shared Notebook', page: Page.ARCHIVE }
    ]
  },
  {
    label: 'Deep stuff',
    color: 'var(--marker-black)',
    symbol: '♄',
    isConditional: true,
    items: [
      { name: 'Dealing with your Mess', page: Page.SHADOW_WORK, minRuns: 10 }
    ]
  },
  {
    label: 'Say hi',
    color: 'var(--marker-black)',
    symbol: '⚷',
    items: [
      { name: 'Suggest a Topic', page: Page.PODCAST_REQUESTS },
      { name: 'Ask us anything', page: Page.AMA }
    ]
  }
];

const CategorySection = memo(({ cat, onNavigate }: { cat: MenuCategory, onNavigate: (p: Page) => void }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 border-b border-marker-black/5 pb-2">
      <span className="text-2xl font-sans" style={{ color: cat.color }}>{cat.symbol}</span>
      <span className="heading-marker text-2xl text-marker-black uppercase tracking-wide">{cat.label}</span>
    </div>
    <ul className="space-y-1 pl-6">
      {cat.items.map((item, j) => (
        <li key={j}>
          <button onClick={() => onNavigate(item.page)} className="w-full text-left handwritten text-lg text-marker-black hover:text-marker-blue py-1.5 px-4 rounded-md hover:bg-marker-black/5 transition-colors">
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  </div>
));

export const NavigationOverlay = ({ isOpen, onClose, onNavigate }: { isOpen: boolean, onClose: () => void, onNavigate: (page: Page) => void }) => {
  const {
    isEclipseMode,
    toggleEclipseMode,
    calculationsRun,
    userIdentity,
    userBirthday,
    userBirthTime,
    userLocation,
    isCalibrated,
    setUserIdentity,
    setUserBirthday,
    setUserBirthTime,
    setUserLocation
  } = useSyllabusStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const grade = useMemo(() => {
    if (calculationsRun >= 25) {
      return 'Expert Seeker';
    }
    if (calculationsRun >= 15) {
      return 'Deep Diver';
    }
    if (calculationsRun >= 10) {
      return 'Regular Visitor';
    }
    if (calculationsRun >= 5) {
      return 'Curious Student';
    }
    return 'Newcomer';
  }, [calculationsRun]);

  const visibleCategories = useMemo(() => {
    return MENU_CATEGORIES.map(cat => {
      if (!cat.isConditional) {
        return cat;
      }
      const filteredItems = cat.items.filter(item => !item.minRuns || calculationsRun >= (item.minRuns || 0));
      return filteredItems.length > 0 ? { ...cat, items: filteredItems } : null;
    }).filter((c): c is MenuCategory => c !== null);
  }, [calculationsRun]);

  return (
    <div className={`fixed inset-0 z-[2900] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-surface/95 backdrop-blur-md" onClick={onClose} />
      <div className={`absolute top-0 left-0 h-full w-full md:w-[480px] bg-surface border-r border-marker-black/10 transition-transform duration-500 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 sm:p-10 pt-24 flex-grow overflow-y-auto custom-scrollbar">

          {/* Profile Section */}
          <section className="mb-12 p-8 marker-border border-marker-blue/20 bg-white shadow-xl rounded-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-6xl font-sans">☊</div>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl font-sans text-marker-blue">♁</span>
                <span className="handwritten text-[10px] font-black uppercase text-marker-blue tracking-widest">Resonance Calibration</span>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-[10px] font-black uppercase flex items-center gap-1 hover:text-marker-blue transition-colors"
              >
                {isEditingProfile ? <X size={14}/> : <Settings2 size={14} />}
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-6 animate-in fade-in duration-300 relative z-10">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-40 flex items-center gap-2">
                    <User size={10} /> Who are you?
                  </label>
                  <input
                    className="w-full bg-surface p-3 marker-border text-lg italic outline-none focus:border-marker-blue"
                    value={userIdentity || ''}
                    onChange={e => setUserIdentity(e.target.value)}
                    placeholder="Name..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 flex items-center gap-2">
                      <Calendar size={10} /> Arrival Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-surface p-3 marker-border text-lg italic outline-none focus:border-marker-blue"
                      value={userBirthday || ''}
                      onChange={e => setUserBirthday(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 flex items-center gap-2">
                      <Clock size={10} /> Time
                    </label>
                    <input
                      type="time"
                      className="w-full bg-surface p-3 marker-border text-lg italic outline-none focus:border-marker-blue"
                      value={userBirthTime || '12:00'}
                      onChange={e => setUserBirthTime(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if ('geolocation' in navigator) {
                      navigator.geolocation.getCurrentPosition(pos => {
                        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Detected' });
                      });
                    }
                  }}
                  className="w-full brutalist-button !py-3 !text-[10px] flex items-center justify-center gap-2"
                >
                  <MapPin size={12} /> {userLocation ? 'Update Coordinates' : 'Grab My Location'}
                </button>
                <button onClick={() => setIsEditingProfile(false)} className="w-full text-[10px] font-black uppercase opacity-40 hover:opacity-100">Save and Close</button>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                <p className="handwritten text-2xl italic text-marker-black leading-tight">
                  {userIdentity ? `Hi, ${userIdentity.split(' ')[0]}.` : 'Let\'s set your frequency.'}
                </p>
                <div className="flex flex-col gap-2">
                  {userBirthday && (
                    <span className="flex items-center gap-2 text-sm italic opacity-60">
                      <Calendar size={14} className="opacity-40" /> Born: {userBirthday} {userBirthTime && `@ ${userBirthTime}`}
                    </span>
                  )}
                  {userLocation && <span className="flex items-center gap-2 text-sm italic opacity-60"><MapPin size={14} className="opacity-40" /> Location: {userLocation.name || 'Synced'}</span>}
                </div>
                {isCalibrated && (
                  <div className="flex items-center gap-2 text-[9px] font-black text-marker-green uppercase tracking-widest pt-2 border-t border-marker-black/5">
                    <Check size={12} /> Sync Locked ♁
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="flex justify-between items-center mb-10 pb-4 border-b border-marker-black/5">
            <div className="space-y-1">
              <div className="handwritten text-[10px] text-marker-black opacity-40 uppercase tracking-widest">Seeker Level</div>
              <div className="heading-marker text-xl">{grade}</div>
            </div>
            <div className="text-right">
              <div className="handwritten text-[10px] text-marker-black opacity-40 uppercase tracking-widest">Checks Done</div>
              <div className="heading-marker text-xl">{calculationsRun}</div>
            </div>
          </div>

          <div className="space-y-16">
            {visibleCategories.map((cat, i) => (
              <CategorySection key={i} cat={cat} onNavigate={onNavigate} />
            ))}

            {calculationsRun < 10 && (
              <div className="p-6 border-2 border-dashed border-marker-black/10 rounded-xl bg-marker-black/[0.01]">
                <div className="handwritten text-[10px] font-black uppercase tracking-widest mb-2 opacity-40 flex items-center gap-2">
                  <span className="text-lg">♄</span> Deeper Layers Locked
                </div>
                <div className="handwritten text-sm italic opacity-60">Stick around for {10 - calculationsRun} more checks to see more stuff.</div>
              </div>
            )}

            <div className="pt-8 mt-8 border-t border-marker-black/5">
              <button onClick={toggleEclipseMode} className="w-full flex items-center justify-between group p-3 hover:bg-marker-black/5 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  {isEclipseMode ? <Moon size={20} className="text-marker-purple" /> : <Sun size={20} className="text-marker-red" />}
                  <span className="handwritten text-lg italic">{isEclipseMode ? 'Night Watch' : 'Day Watch'}</span>
                </div>
                <div className={`w-12 h-6 rounded-full border-2 relative transition-all ${isEclipseMode ? 'bg-marker-purple border-marker-purple' : 'bg-transparent border-marker-black/20'}`}>
                  <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 ${isEclipseMode ? 'left-[calc(100%-1.2rem)] bg-white' : 'left-1 bg-marker-black/40'}`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
