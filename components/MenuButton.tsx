
export const MenuButton = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => (
  <button onClick={toggle} className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[3000] w-12 h-12 flex flex-col items-center justify-center gap-1.5 bg-surface rounded-lg shadow-xl hover:scale-105 transition-all group" aria-label="Toggle Menu">
    <div className={`w-6 h-0.5 bg-marker-black transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
    <div className={`w-6 h-0.5 bg-marker-black transition-all ${isOpen ? 'opacity-0' : ''}`} />
    <div className={`w-6 h-0.5 bg-marker-black transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
  </button>
);
