
import React, { useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react';
import { Page, ToolProps } from './types';
import { useSyllabusStore } from './store';
import { initDB } from './services/dbService';
import { GlossaryProvider } from './components/GlossaryEngine';
import { audioManager } from './components/AudioManager';
import { MenuButton } from './components/MenuButton';
import { NavigationOverlay } from './components/NavigationOverlay';
import { LoadingTool } from './components/LoadingTool';
import { HomeView } from './components/HomeView';

const HoraryTool = lazy(() => import('./components/HoraryTool'));
const ElectionalTool = lazy(() => import('./components/ElectionalTool'));
const NumerologyTool = lazy(() => import('./components/NumerologyTool'));
const SigilMaker = lazy(() => import('./components/SigilMaker'));
const Archive = lazy(() => import('./components/Archive'));
const Lexicon = lazy(() => import('./components/Lexicon'));
const CosmicMadLibs = lazy(() => import('./components/CosmicMadLibs'));
const FriendshipMatrix = lazy(() => import('./components/FriendshipMatrix'));
const BaziTool = lazy(() => import('./components/BaziTool'));
const BioCalcTool = lazy(() => import('./components/BioCalcTool'));
const FlyingStarTool = lazy(() => import('./components/FlyingStarTool'));
const PieDeconstructionTool = lazy(() => import('./components/PieDeconstructionTool'));
const ColorPaletteTool = lazy(() => import('./components/ColorPaletteTool'));
const BiorhythmTool = lazy(() => import('./components/BiorhythmTool'));
const SemanticDriftTool = lazy(() => import('./components/SemanticDriftTool'));
const CharmCastingTool = lazy(() => import('./components/CharmCastingTool'));
const BirthChartTool = lazy(() => import('./components/BirthChartTool'));
const TarotTool = lazy(() => import('./components/TarotTool'));
const SpreadGeneratorTool = lazy(() => import('./components/SpreadGeneratorTool'));
const AstroMapTool = lazy(() => import('./components/AstroMapTool'));
const LostItemFinder = lazy(() => import('./components/LostItemFinder'));
const SynchronicityDecoder = lazy(() => import('./components/SynchronicityDecoder'));
const SabianSymbolsTool = lazy(() => import('./components/SabianSymbolsTool'));
const BrainstormTool = lazy(() => import('./components/BrainstormTool'));
const TimelineThreadTool = lazy(() => import('./components/TimelineThreadTool'));
const AkashicRecordsTool = lazy(() => import('./components/AkashicRecordsTool'));
const QuantumTimelineScanner = lazy(() => import('./components/QuantumTimelineScanner'));
const RulershipTool = lazy(() => import('./components/RulershipTool'));
const AMATool = lazy(() => import('./components/AMATool'));
const PodcastSuggestionsTool = lazy(() => import('./components/PodcastSuggestionsTool'));
const PhotoScryer = lazy(() => import('./components/PhotoScryer'));
const ShadowWorkTool = lazy(() => import('./components/ShadowWorkTool'));

type ToolComponent = React.ComponentType<ToolProps>;

const TOOL_COMPONENTS: Record<Exclude<Page, Page.HOME>, ToolComponent> = {
  [Page.HORARY]: HoraryTool,
  [Page.ELECTIONAL]: ElectionalTool,
  [Page.NUMEROLOGY]: NumerologyTool,
  [Page.SIGIL_MAKER]: SigilMaker,
  [Page.ARCHIVE]: Archive,
  [Page.LEXICON]: Lexicon,
  [Page.MAD_LIBS]: CosmicMadLibs,
  [Page.FRIENDSHIP_MATRIX]: FriendshipMatrix,
  [Page.BAZI]: BaziTool,
  [Page.BIO_CALC]: BioCalcTool,
  [Page.FLYING_STAR]: FlyingStarTool,
  [Page.PIE_DECONSTRUCTION]: PieDeconstructionTool,
  [Page.COLOR_PALETTE]: ColorPaletteTool,
  [Page.BIORHYTHM]: BiorhythmTool,
  [Page.SEMANTIC_DRIFT]: SemanticDriftTool,
  [Page.CHARM_CASTING]: CharmCastingTool,
  [Page.BIRTH_CHART]: BirthChartTool,
  [Page.ASTRO_MAP]: AstroMapTool,
  [Page.LOST_ITEM_FINDER]: LostItemFinder,
  [Page.TAROT]: TarotTool,
  [Page.SPREAD_GENERATOR]: SpreadGeneratorTool,
  [Page.SYNCHRONICITY_DECODER]: SynchronicityDecoder,
  [Page.SABIAN_SYMBOLS]: SabianSymbolsTool,
  [Page.BRAINSTORM]: BrainstormTool,
  [Page.TIMELINE_THREAD]: TimelineThreadTool,
  [Page.AKASHIC_RECORDS]: AkashicRecordsTool,
  [Page.QUANTUM_TIMELINE]: QuantumTimelineScanner,
  [Page.RULERSHIP_ANALYSIS]: RulershipTool,
  [Page.AMA]: AMATool,
  [Page.PODCAST_REQUESTS]: PodcastSuggestionsTool,
  [Page.PHOTO_SCRYER]: PhotoScryer,
  [Page.SHADOW_WORK]: ShadowWorkTool
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { updateLastAccess, isEclipseMode, setUserLocation } = useSyllabusStore();

  useEffect(() => {
    updateLastAccess();
    initDB();

    // Initial Geolocation Hydration
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn('Geolocation denied. Manual override available in tools.'),
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, [updateLastAccess, setUserLocation]);

  useEffect(() => {
    document.documentElement.classList.toggle('eclipse-mode', isEclipseMode);
  }, [isEclipseMode]);

  const handleNavigate = useCallback((page: Page) => {
    audioManager.playRustle();
    setCurrentPage(page);
    setIsMenuOpen(false);
  }, []);

  const CurrentToolComponent = useMemo(() => {
    if (currentPage === Page.HOME) {
      return null;
    }
    return TOOL_COMPONENTS[currentPage];
  }, [currentPage]);

  return (
    <GlossaryProvider>
      <div className="min-h-screen w-full relative selection:bg-marker-green/10 selection:text-marker-green">
        <MenuButton isOpen={isMenuOpen} toggle={() => setIsMenuOpen(!isMenuOpen)} />
        <NavigationOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={handleNavigate} />
        <main className="min-h-full w-full">
          <div key={currentPage} className="min-h-full animate-in fade-in duration-500">
            {currentPage === Page.HOME ? (
              <HomeView onEnter={() => setIsMenuOpen(true)} />
            ) : CurrentToolComponent ? (
              <Suspense fallback={<LoadingTool />}>
                <CurrentToolComponent onBack={() => handleNavigate(Page.HOME)} />
              </Suspense>
            ) : null}
          </div>
        </main>
      </div>
    </GlossaryProvider>
  );
};

export default App;
