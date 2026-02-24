
import React, { useState, memo } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getHoraryAnalysis } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation } from '../services/dbService';
import { WritingEffect } from './WritingEffect';
import { audioManager } from './AudioManager';
import { ReadAloudButton } from './ReadAloudButton';
import { HoraryResult } from '../types';
import { ZodiacWheel } from './ZodiacWheel';
import { MapPin } from 'lucide-react';

const HoraryInput = memo(({ 
  question, setQuestion, location, detecting, onDetect, onQuery, loading 
}: { 
  question: string, setQuestion: (v: string) => void, 
  location: { lat: number, lng: number } | null, 
  detecting: boolean, onDetect: () => void, 
  onQuery: () => void, loading: boolean 
}) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest ml-1">What's on your mind?</label>
      <textarea 
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask a specific question you need an answer to right now..."
        className="w-full p-6 marker-border bg-surface italic text-xl outline-none focus:border-marker-blue shadow-sm min-h-[140px]"
      />
    </div>

    <div className="space-y-2">
      <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest ml-1">Pinpoint where you are</label>
      <button 
        onClick={onDetect}
        disabled={detecting}
        className={`w-full p-4 marker-border flex items-center justify-center gap-3 transition-all ${location ? 'bg-marker-green/5 border-marker-green text-marker-green' : 'bg-surface hover:bg-marker-black/5'}`}
      >
        {detecting ? (
          <div className="w-4 h-4 border-2 border-marker-black border-t-transparent animate-spin rounded-full"></div>
        ) : location ? (
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold"><MapPin size={14} /> Got you: {location.lat.toFixed(2)}N, {location.lng.toFixed(2)}E</span>
        ) : (
          <span>Find My Spot</span>
        )}
      </button>
    </div>

    <button 
      onClick={onQuery}
      disabled={loading || !question || !location}
      className={`brutalist-button w-full !py-6 !text-2xl transition-all ${!location || !question ? 'opacity-30' : '!bg-marker-blue text-white shadow-xl hover:scale-[1.02]'}`}
    >
      {loading ? 'Checking the sky...' : 'Get the Answer'}
    </button>
  </div>
));

const HoraryResultDisplay = memo(({ reading }: { reading: HoraryResult }) => {
  const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const processedPlanets = reading.chartData.planets.map(p => ({
    name: p.name,
    degree: p.degree % 30,
    sign: SIGNS[Math.floor(p.degree / 30) % 12]
  }));

  return (
    <div className="animate-in fade-in duration-1000 space-y-12">
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
          <h3 className="heading-marker text-4xl sm:text-5xl text-marker-black lowercase">The Verdict</h3>
          <span className="handwritten text-[10px] font-bold uppercase text-marker-red bg-marker-red/5 px-3 py-1 rounded-full border border-marker-red/10">Outlook: {reading.outcome}</span>
        </div>
        <div className="p-8 md:p-10 marker-border border-marker-blue bg-surface shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none text-9xl font-bold italic">REPLY</div>
          <div className="handwritten text-lg md:text-xl text-marker-black leading-relaxed italic font-medium">
            "<WritingEffect text={reading.judgment} />"
          </div>
          <div className="mt-8 flex justify-end">
            <ReadAloudButton text={reading.judgment} className="!py-1 !px-3 !text-[10px]" />
          </div>
        </div>
      </section>

      <section className="space-y-6">
         <span className="handwritten text-[10px] font-bold uppercase text-marker-black/50 tracking-[0.4em] block border-b border-marker-black/5 pb-2 italic">How it looks up there</span>
         <ZodiacWheel 
            planets={processedPlanets} 
            ascendantDegree={reading.chartData.ascendant}
         />
      </section>

      <div className="grid grid-cols-1 gap-8">
        <div className="p-8 marker-border border-marker-black/5 bg-marker-black/[0.02] space-y-6">
          <span className="handwritten text-[10px] font-bold uppercase text-marker-black/40 tracking-widest block border-b border-marker-black/5 pb-2">The underlying vibes</span>
          <p className="handwritten text-base md:text-lg text-marker-black/80 font-medium leading-relaxed italic">
            {reading.technicalNotes}
          </p>
        </div>
      </div>
    </div>
  );
});

const HoraryTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [reading, setReading] = useState<HoraryResult | null>(null);
  
  const { recordCalculation, userLocation, setUserLocation } = useSyllabusStore();

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Can't find your location on this browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDetecting(false);
        audioManager.playRustle();
      },
      (err) => {
        alert("Couldn't lock onto your spot.");
        setDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  const handleQuery = async () => {
    if (!question.trim() || !userLocation) return;
    setLoading(true);
    setReading(null);
    audioManager.playRustle();

    try {
      const result = await getHoraryAnalysis(question, userLocation.lat, userLocation.lng);
      if (result) {
        setReading(result);
        recordCalculation();
        logCalculation('HORARY', question, result);
      }
    } catch (err) {
      alert("Lost the signal. Give it a second.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-6xl mx-auto">
      <button onClick={onBack} className="fixed top-4 right-4 brutalist-button !text-[10px] z-50 bg-surface">Back</button>

      <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-24 items-start">
        <div className="w-full lg:w-[400px] space-y-10 lg:sticky lg:top-20">
          <header className="space-y-4">
            <h2 className="heading-marker text-5xl sm:text-7xl text-marker-blue lowercase leading-none">Instant <GlossaryTerm word="Horary">Answer</GlossaryTerm></h2>
            <p className="handwritten text-lg sm:text-xl text-marker-blue opacity-40 font-bold uppercase tracking-widest italic">Checking the vibe right now</p>
          </header>
          <HoraryInput 
            question={question} setQuestion={setQuestion} location={userLocation} 
            detecting={detecting} onDetect={handleDetectLocation} onQuery={handleQuery} loading={loading} 
          />
        </div>

        <div className="flex-1 w-full min-h-[500px] pb-32">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-10 animate-in fade-in">
                <div className="relative">
                   <div className="w-20 h-20 border-2 border-marker-blue border-t-transparent animate-spin rounded-full"></div>
                   <div className="absolute inset-0 flex items-center justify-center heading-marker text-2xl opacity-20 italic">☉</div>
                </div>
                <span className="handwritten text-xl text-marker-blue font-black animate-pulse uppercase tracking-[0.4em]">Let's see what the stars say...</span>
             </div>
          ) : reading ? (
            <HoraryResultDisplay reading={reading} />
          ) : (
            <div className="flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none">
              <div className="text-[10rem] heading-marker uppercase">Wait</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Need a Question First</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoraryTool;
