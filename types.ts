
export interface TarotCard {
  name: string;
  isReversed: boolean;
  positionLabel?: string;
  imageUrl?: string;
}

export interface ReadingResponse {
  interpretation: string;
  guidance: string;
}

export enum SpreadType {
  SINGLE = 'FOCUS',
  TRINITY = 'TRINITY',
  CELTIC_CROSS = 'CELTIC_CROSS'
}

export enum DeckTheme {
  CLASSIC = 'CLASSIC',
  ALCHEMICAL = 'ALCHEMICAL',
  SHADOW = 'SHADOW',
  COSMIC = 'COSMIC'
}

export interface GlossaryDefinition {
  word: string;
  definition: string;
  etymology?: string;
}

export enum Page {
  HOME = 'HOME',
  HORARY = 'HORARY',
  ELECTIONAL = 'ELECTIONAL',
  NUMEROLOGY = 'NUMEROLOGY',
  LOST_ITEM_FINDER = 'LOST_ITEM_FINDER',
  SYNCHRONICITY_DECODER = 'SYNCHRONICITY_DECODER',
  SABIAN_SYMBOLS = 'SABIAN_SYMBOLS',
  ARCHIVE = 'ARCHIVE',
  LEXICON = 'LEXICON',
  SIGIL_MAKER = 'SIGIL_MAKER',
  MAD_LIBS = 'MAD_LIBS',
  FRIENDSHIP_MATRIX = 'FRIENDSHIP_MATRIX',
  BAZI = 'BAZI',
  BIO_CALC = 'BIO_CALC',
  FLYING_STAR = 'FLYING_STAR',
  PIE_DECONSTRUCTION = 'PIE_DECONSTRUCTION',
  COLOR_PALETTE = 'COLOR_PALETTE',
  BIORHYTHM = 'BIORHYTHM',
  SEMANTIC_DRIFT = 'SEMANTIC_DRIFT',
  CHARM_CASTING = 'CHARM_CASTING',
  BIRTH_CHART = 'BIRTH_CHART',
  ASTRO_MAP = 'ASTRO_MAP',
  TAROT = 'TAROT',
  SPREAD_GENERATOR = 'SPREAD_GENERATOR',
  BRAINSTORM = 'BRAINSTORM',
  TIMELINE_THREAD = 'TIMELINE_THREAD',
  AKASHIC_RECORDS = 'AKASHIC_RECORDS',
  QUANTUM_TIMELINE = 'QUANTUM_TIMELINE',
  RULERSHIP_ANALYSIS = 'RULERSHIP_ANALYSIS',
  AMA = 'AMA',
  PODCAST_REQUESTS = 'PODCAST_REQUESTS',
  PHOTO_SCRYER = 'PHOTO_SCRYER',
  SHADOW_WORK = 'SHADOW_WORK'
}

export interface SpreadPosition {
  label: string;
  description: string;
}

export interface SpreadDefinition {
  title: string;
  rationale: string;
  positions: SpreadPosition[];
}

export interface QuantumTimelineResult {
  currentReality: {
    entropyLevel: string;
    frequencyMarker: string;
    realityFragments: string[];
  };
  desiredReality: {
    stateLabel: string;
    frequencyMarker: string;
    realityFragments: string[];
  };
  quantumJump: {
    behavioralDelta: string;
    shiftFrequency: string;
    bridgeAction: string;
  };
}

export interface PhotoScryerResult {
  primaryObservation: string;
  artifactsDetected: string[];
  spatialVibe: string;
  guidance: string;
}

export interface AkashicResult {
  memoryFragment: string;
  sensoryImpressions: {
    chroma: string; // visual/color vibe
    texture: string; // tactile feel
    aroma: string; // olfactory imprint
  };
  emotionalResonance: string;
  filingMetadata: string; // pseudo-archival classification
}

export interface BaziPillar {
  type: string; // Year, Month, Day, Hour
  stem: string; // Element
  stemExplanation: string;
  branch: string; // Animal
  branchExplanation: string;
  tenGod: string;
}

export interface BaziResult {
  dayMaster: string;
  densityProfile: string;
  thermodynamicLogic: string;
  pillars: BaziPillar[];
  tenGodsAnalysis: { name: string; vector: string; implication: string }[];
}

export interface BioDepreciationResult {
  obsolescenceDate: string;
  accuracyProbability: number;
  depreciationMetrics: string;
  actuarialReport: string;
}

export interface FlyingStarResult {
  palaces: { direction: string; baseStar: number; mountainStar: number; waterStar: number; technicalStatus: string }[];
  spatialAdjustments: string[];
  energyFlowSummary: string;
  thermodynamicLogic: string;
}

export interface HoraryResult {
  chartData: {
    ascendant: number;
    planets: { name: string; degree: number }[];
  };
  outcome: string;
  judgment: string;
  technicalNotes: string;
}

export interface ElectionalResult {
  selectedDate: string;
  isoDate: string;
  chartData: {
    ascendant: number;
    planets: { name: string; degree: number }[];
  };
}

export interface BirthChartResult {
  ascendant: { sign: string; degree: number };
  houses: { house: number; sign: string; degree: number }[];
  planets: { planet: string; sign: string; degree: number; retrograde?: boolean }[];
  chart_metadata: { utc_offset: string };
  interpretation: { final_synthesis: string };
}

export interface NumerologyResult {
  systemComparison: string;
  lifePath: string;
  destinyNumber: string;
  soulUrge: string;
  meaning: string;
  esotericInsight: string;
}

export interface PsychometryResult {
  vibrationalSignature: string;
  imprintHistory: string;
  primaryEnergy: string;
  environmentalResonance: string;
  actionableGuidance: string;
}

export interface PieResult {
  pieRoot: string;
  rootMeaning: string;
  semanticTrace: string[];
  modernConcept: string;
  esotericImplication: string;
}

export interface ColorPaletteResult {
  analysis: string;
  deficiency: string;
  colors: { layer: string; hex: string; name: string; reasoning: string }[];
  technicalSynthesis: string;
}

export interface PlanetaryPosition {
  name: string;
  longitude_zenith: number;
  declination: number;
}

export interface RelocationResult {
  angles: { planet: string; angle: string }[];
  themes: string[];
  dominantInfluence: string;
  vibeCheck: string;
  planetaryPositions?: PlanetaryPosition[];
}

export interface SabianResult {
  phrase: string;
  keywords: string[];
  fullInterpretation: string;
  light: string;
  shadow: string;
  guidance: string;
  meditation: string;
}

export interface RitualResult {
  title: string;
  steps: string[];
  revelation: string;
}

export interface SynastryResult {
  compatibilityScore: number;
  vibrationalMatch: string;
  analysis: string;
  groupDynamic?: string;
  leaderArchetype?: {
    name: string;
    role: string;
  };
  frictionPoints?: string[];
}

export interface BrainstormResult {
  suggestions: string[];
}

export interface ArchivalInquiry {
  id: string;
  sender: string;
  question: string;
  answer?: string;
  timestamp: string;
  isAnswered: boolean;
}

export interface BroadcastProposal {
  id: string;
  topic: string;
  desc: string;
  guest?: string;
  votes: number;
  status: 'pending' | 'scheduled' | 'recorded';
  timestamp: string;
}

// Added CharmData interface for lithomancy casts
export interface CharmData {
  name: string;
  house: number;
  ring: string;
  entangledWith: string[];
  proximityToCenter: number;
}

export interface ToolProps {
  onBack: () => void;
}
