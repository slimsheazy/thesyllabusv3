
import React, { useState, memo, useCallback, useEffect } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getElectionalAnalysis } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';
import { ReadAloudButton } from './ReadAloudButton';
import { ZodiacWheel } from './ZodiacWheel';

const InputSection = memo(({
  intent,
  setIntent,
  onConsult,
  loading,
  location,
  onDetect,
  detecting
}: {
  intent: string,
  setIntent: (v: string) => void,
  onConsult: () => void,
  loading: boolean,
  location: { lat: number, lng: number } | null,
  onDetect: () => void,
  detecting: boolean
}) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest ml-1">The Objective</label>
      <textarea
        value={intent}
        onChange={e => setIntent(e.target.value)}
        placeholder="What action do you seek the perfect time for? (e.g. Starting a project, signing a contract...)"
        className="w-full p-6 marker-border bg-surface italic text-xl outline-none focus:border-marker-teal shadow-sm min-h-[140px]"
      />
    </div>

    <div className="space-y-2">
      <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest ml-1">Coordinate Lock</label>
      <button
        onClick={onDetect}
        disabled={detecting}
        className={`w-full p-4 marker-border flex items-center justify-center gap-3 transition-all ${location ? 'bg-marker-teal/5 border-marker-teal text-marker-teal' : 'bg-surface hover:bg-marker-black/5'}`}
      >
        {detecting ? (
          <div className="w-4 h-4 border-2 border-marker-black border-t-transparent animate-spin rounded-full"></div>
        ) : location ? (
          <span className="flex items-center gap-2">✓ Locked: {location.lat.toFixed(2)}N, {location.lng.toFixed(2)}E</span>
        ) : (
          <span>Detect Current Position</span>
        )}
      </button>
    </div>

    <button
      onClick={onConsult}
      disabled={loading || !intent.trim() || !location}
      className={`brutalist-button w-full !py-6 !text-2xl transition-all ${!intent.trim() || !location ? 'opacity-30' : '!bg-marker-teal text-white shadow-xl hover:scale-[1.02]'}`}
    >
      {loading ? 'Plotting Ephemeris...' : 'Find Window'}
    </button>
  </div>
));

const ResultCard = memo(({ result }: { result: any }) => {
  const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const processedPlanets = result.chartData.planets.map((p: any) => ({
    name: p.name,
    degree: p.degree % 30,
    sign: SIGNS[Math.floor(p.degree / 30) % 12]
  }));

  return (
    <div className="animate-in fade-in duration-1000 space-y-12">
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
          <h3 className="heading-marker text-4xl sm:text-5xl text-marker-black lowercase">Chosen Moment</h3>
          <span className="handwritten text-[10px] font-bold uppercase text-marker-teal bg-marker-teal/5 px-3 py-1 rounded-full border border-marker-teal/10">Signal Locked</span>
        </div>
        <div className="p-10 marker-border border-marker-teal bg-surface shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none text-9xl font-bold italic">TIME</div>
          <div className="heading-marker text-3xl sm:text-5xl text-marker-black mb-8 leading-tight">
            {result.selectedDate}
          </div>
          <p className="handwritten text-2xl text-marker-black/80 leading-relaxed italic font-medium">
            <WritingEffect text="The sky aligns with your intent at this precise coordinate in history. The planetary hour provides the necessary friction for manifestation." />
          </p>
          <div className="mt-8 flex justify-end">
            <ReadAloudButton text={`The optimal time is ${result.selectedDate}`} className="!py-1 !px-3 !text-[10px]" />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <span className="handwritten text-[10px] font-bold uppercase text-marker-black/50 tracking-[0.4em] block border-b border-marker-black/5 pb-2 italic">Auspicious Geometry</span>
        <ZodiacWheel
          planets={processedPlanets}
          ascendantDegree={result.chartData.ascendant}
        />
      </section>

      <div className="grid grid-cols-1 gap-8">
        <div className="p-8 marker-border border-marker-black/5 bg-marker-black/[0.02] space-y-6">
          <span className="handwritten text-[10px] font-bold uppercase text-marker-black/40 tracking-widest block border-b border-marker-black/5 pb-2">Astrological Logic</span>
          <div className="space-y-4">
            {result.chartData.planets.map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center group">
                <span className="heading-marker text-xl lowercase text-marker-black">{p.name}</span>
                <span className="handwritten text-sm text-marker-black/50 italic">{p.degree.toFixed(1)}° Resonance</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const ElectionalTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [detecting, setDetecting] = useState(false);

  const { recordCalculation, userLocation, setUserLocation } = useSyllabusStore();

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Temporal positioning unavailable.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setDetecting(false);
        audioManager.playRustle();
      },
      (err) => {
        alert('Coordinate lock failed.');
        setDetecting(false);
      },
      { timeout: 10000 }
    );
  }, [setUserLocation]);

  const handleConsult = useCallback(async() => {
    if (!intent.trim() || !userLocation) {
      return;
    }
    setLoading(true);
    setResult(null);
    audioManager.playRustle();

    try {
      const now = new Date();
      const currentIso = now.toISOString();

      let analysis = await getElectionalAnalysis(intent, userLocation.lat, userLocation.lng, currentIso);

      if (analysis) {
        let returnedDate = new Date(analysis.isoDate);
        if (isNaN(returnedDate.getTime()) || returnedDate <= now) {
          analysis = await getElectionalAnalysis(`${intent} (STRICTLY FUTURE DATE ONLY)`, userLocation.lat, userLocation.lng, currentIso);
          returnedDate = new Date(analysis?.isoDate);
        }

        if (analysis && !isNaN(returnedDate.getTime()) && returnedDate > now) {
          setResult(analysis);
          recordCalculation();
          logCalculation('ELECTIONAL', intent, analysis);
        } else {
          alert('Temporal noise is too high. Please refine your inquiry.');
        }
      }
    } catch (err) {
      alert('Systemic error during epoch selection.');
    } finally {
      setLoading(false);
    }
  }, [intent, userLocation, recordCalculation]);

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-6xl mx-auto">
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-surface shadow-xl">Index</button>

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-24 items-start">
        <div className="w-full lg:w-[400px] space-y-10 lg:sticky lg:top-20">
          <header className="space-y-4 pt-6 lg:pt-0">
            <h2 className="heading-marker text-5xl sm:text-7xl text-marker-teal lowercase leading-none">Electional <GlossaryTerm word="Electional">Time</GlossaryTerm> Finder</h2>
            <p className="handwritten text-lg sm:text-xl text-marker-teal opacity-40 font-bold uppercase tracking-widest italic">Kairic Window Selection</p>
          </header>

          <InputSection
            intent={intent}
            setIntent={setIntent}
            onConsult={handleConsult}
            loading={loading}
            location={userLocation}
            onDetect={handleDetectLocation}
            detecting={detecting}
          />
        </div>

        <div className="flex-1 w-full min-h-[500px] pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-10 animate-in fade-in">
              <div className="relative">
                <div className="w-20 h-20 border-2 border-marker-teal border-t-transparent animate-spin rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center heading-marker text-2xl opacity-20 italic">☊</div>
              </div>
              <div className="text-center space-y-2">
                <span className="handwritten text-xl text-marker-teal font-black animate-pulse uppercase tracking-[0.4em]">Slicing Chronos...</span>
              </div>
            </div>
          ) : result ? (
            <ResultCard result={result} />
          ) : (
            <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none text-center">
              <div className="text-[10rem] sm:text-[14rem] heading-marker leading-none uppercase">Null</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Input Intent</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionalTool;
