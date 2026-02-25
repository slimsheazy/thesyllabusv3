
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getBirthChartAnalysis, getCitySuggestions, reverseGeocode } from '../services/geminiService';
import { calculateAstroData, getSignFromLongitude, getDegreeInSign } from '../services/astrologyService';
import { calculateAstrology, calculateHumanDesign, calculateGeneKeys } from 'natalengine';
import { logCalculation } from '../services/dbService';
import { useSyllabusStore } from '../store';
import { useResonance } from '../hooks/useResonance';
import { ReadAloudButton } from './ReadAloudButton';
import { ZodiacWheel } from './ZodiacWheel';

/**
 * Natal Engine Protocol
 * Implementation of the Objective Instructor persona.
 * Neutral, descriptive, and deterministic.
 */
const BirthChartTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { birthday, location, resonancePrompt } = useResonance();
  const [formData, setFormData] = useState({ 
    date: birthday || '', 
    time: '12:00', 
    offset: '0' 
  });
  const [cityInput, setCityInput] = useState(location?.name || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(location || null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchingCities, setSearchingCities] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  
  const { recordCalculation } = useSyllabusStore();
  const suggestionRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (val: string) => {
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingCities(true);
    try {
      const res = await getCitySuggestions(val);
      setSuggestions(res);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Coordinate retrieval failed:", err);
    } finally {
      setSearchingCities(false);
    }
  };

  const handleCityInput = (val: string) => {
    setCityInput(val);
    setSelectedCity(null);
    
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      fetchSuggestions(val);
    }, 400);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Coordinate tracking unavailable on this hardware.");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const loc = await reverseGeocode(latitude, longitude);
          if (loc) {
            setSelectedCity(loc);
            setCityInput(loc.fullName);
            const d = new Date();
            const offset = -(d.getTimezoneOffset() / 60);
            setFormData(prev => ({ ...prev, offset: offset.toString() }));
          }
        } catch (e) {
           console.error("Geocoding mismatch:", e);
        } finally {
          setDetectingLocation(false);
          setShowSuggestions(false);
        }
      },
      (error) => {
        alert("Coordinate lock failed. Manual input required.");
        setDetectingLocation(false);
      }
    );
  };

  const handleSelectCity = (city: any) => {
    setCityInput(city.fullName);
    setSelectedCity(city);
    setShowSuggestions(false);
  };

  const handleCalculate = async () => {
    if (!formData.date || !formData.time || !selectedCity) {
      alert("Standard Natal Vector requires Date, Time, and Origin Coordinates.");
      return;
    }
    
    setLoading(true);
    setResult(null);

    const localDateTimeStr = `${formData.date}T${formData.time}`;
    const localDate = new Date(localDateTimeStr);
    const utcTime = localDate.getTime() - (parseFloat(formData.offset) * 60 * 60 * 1000);
    const dateUtc = new Date(utcTime);

    // NatalEngine package execution (Astrology + Human Design + Gene Keys)
    let engineAstrology: any = null;
    let engineHumanDesign: any = null;
    let engineGeneKeys: any = null;

    try {
      const [hourStr, minuteStr = '0'] = formData.time.split(':');
      const hours = parseInt(hourStr, 10) || 0;
      const minutes = parseInt(minuteStr, 10) || 0;
      const birthHour = hours + minutes / 60;
      const tz = parseFloat(formData.offset || '0');

      engineAstrology = calculateAstrology(
        formData.date,
        birthHour,
        tz,
        selectedCity.lat,
        selectedCity.lng
      );

      engineHumanDesign = calculateHumanDesign(
        formData.date,
        birthHour,
        tz
      );

      engineGeneKeys = calculateGeneKeys(engineHumanDesign);
    } catch (e) {
      console.error('NatalEngine computation failed:', e);
    }

    // Existing in-house astronomy engine for planets + houses + angles
    const calculated = calculateAstroData(dateUtc, selectedCity.lat, selectedCity.lng);

    const points = {
      planets: calculated.planets.map(p => ({ 
        planet: p.name, 
        sign: getSignFromLongitude(p.longitude), 
        degree: getDegreeInSign(p.longitude),
        retrograde: p.retrograde 
      })),
      houses: calculated.houses.map(h => ({
        house: h.house,
        sign: getSignFromLongitude(h.longitude),
        degree: getDegreeInSign(h.longitude)
      })),
      ascendant: {
        sign: getSignFromLongitude(calculated.ascendant),
        degree: getDegreeInSign(calculated.ascendant)
      },
      midheaven: {
        sign: getSignFromLongitude(calculated.midheaven),
        degree: getDegreeInSign(calculated.midheaven)
      }
    };

    const analysis = await getBirthChartAnalysis({ 
      date: formData.date, 
      time: formData.time, 
      astrologicalPoints: points,
      settings: { city: selectedCity.fullName, houseSystem: 'Placidus' },
      resonance: resonancePrompt,
      engine: {
        astrology: engineAstrology,
        humanDesign: engineHumanDesign,
        geneKeys: engineGeneKeys
      }
    });

    if (analysis) {
      const enginePayload = {
        astrology: engineAstrology,
        humanDesign: engineHumanDesign,
        geneKeys: engineGeneKeys
      };

      setResult({ 
        ...points, 
        interpretation: analysis.interpretation, 
        chart_metadata: { 
          utc_offset: formData.offset,
          engine: enginePayload
        } 
      });
      recordCalculation();
      logCalculation('NATAL_ENGINE', selectedCity.fullName, { 
        ...points, 
        interpretation: analysis.interpretation,
        engine: enginePayload
      });
    } else {
      alert("Deterministic trace interrupted. Request archival retry.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-20 px-4 md:px-8 relative max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-8 right-8 brutalist-button !text-[10px] !px-4 !py-1 z-50 bg-white shadow-xl">Index</button>
      
      <div className="w-full flex flex-col xl:flex-row gap-12 xl:gap-24 items-start">
        <div className="w-full xl:w-[480px] space-y-12 xl:sticky xl:top-20 z-10">
           <header className="space-y-4">
             <h2 className="heading-marker text-7xl md:text-8xl text-marker-black lowercase leading-none">Natal Engine</h2>
             <p className="handwritten text-xl text-marker-black opacity-60 font-bold uppercase tracking-widest italic">Archival reconstruction of the firmament</p>
           </header>
           
           <div className="space-y-8 p-10 marker-border border-marker-black/5 bg-white shadow-2xl rounded-2xl">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest ml-1">Arrival Epoch (Date)</label>
                 <input 
                   type="date" 
                   value={formData.date} 
                   onChange={e => setFormData({...formData, date: e.target.value})} 
                   className="w-full p-4 marker-border bg-surface text-xl italic outline-none focus:border-marker-blue transition-all" 
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest ml-1">Arrival Time (Local)</label>
                 <input 
                   type="time" 
                   value={formData.time} 
                   onChange={e => setFormData({...formData, time: e.target.value})} 
                   className="w-full p-4 marker-border bg-surface text-xl italic outline-none focus:border-marker-blue transition-all" 
                 />
               </div>
             </div>

             <div className="space-y-2 relative" ref={suggestionRef}>
               <div className="flex justify-between items-center px-1">
                 <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest">Origin Node (Coordinates)</label>
                 <button 
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="text-[9px] font-black uppercase text-marker-blue hover:underline tracking-widest disabled:opacity-30"
                 >
                   {detectingLocation ? 'Syncing...' : 'Detect Origin'}
                 </button>
               </div>
               
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Identify City..." 
                   value={cityInput} 
                   onChange={e => handleCityInput(e.target.value)} 
                   onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                   className={`w-full p-4 marker-border bg-surface italic text-lg outline-none focus:border-marker-blue transition-all ${selectedCity ? 'border-marker-green' : ''}`} 
                 />
                 {searchingCities && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2">
                     <div className="w-4 h-4 border border-marker-black border-t-transparent animate-spin rounded-full"></div>
                   </div>
                 )}
               </div>

               {showSuggestions && suggestions.length > 0 && (
                 <div className="absolute top-full left-0 w-full mt-2 bg-white marker-border z-[100] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl overflow-hidden">
                   <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                     {suggestions.map((city, idx) => (
                       <button
                         key={idx}
                         onClick={() => handleSelectCity(city)}
                         className="w-full text-left p-6 hover:bg-marker-blue/[0.03] transition-colors border-b border-marker-black/5 last:border-0 group"
                       >
                         <p className="handwritten text-xl text-marker-black group-hover:text-marker-blue font-medium">{city.fullName}</p>
                         <p className="text-[10px] font-mono opacity-40 uppercase mt-1 tracking-wider">{city.lat.toFixed(3)}N / {city.lng.toFixed(3)}E</p>
                       </button>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             <button 
               onClick={handleCalculate} 
               disabled={loading || !selectedCity} 
               className={`brutalist-button w-full !py-8 !text-2xl transition-all ${!selectedCity ? 'opacity-30' : '!bg-marker-black text-surface hover:scale-[1.01] shadow-xl'}`}
             >
               {loading ? 'Consulting Archival Record...' : 'Execute Natal Vector'}
             </button>
           </div>
        </div>
        
        <div className="flex-1 w-full min-h-[500px] pb-32">
           {result ? (
             <div className="animate-in fade-in duration-1000 space-y-16">
               <section className="space-y-6">
                 <div className="flex justify-between items-center border-b border-marker-black/10 pb-2">
                   <span className="handwritten text-[10px] font-bold uppercase text-marker-black/50 tracking-[0.4em] italic">Celestial Arrangement: Placidus Framework</span>
                 </div>
                 <ZodiacWheel 
                    planets={result.planets.map((p: any) => ({ name: p.planet, degree: p.degree, sign: p.sign, retrograde: p.retrograde }))} 
                    houses={result.houses}
                    ascendantDegree={(["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].indexOf(result.ascendant.sign) * 30 + result.ascendant.degree)}
                 />
               </section>

               <section className="space-y-8">
                 <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
                    <h3 className="heading-marker text-4xl text-marker-black lowercase italic">Structural Synthesis</h3>
                    <div className="flex items-center gap-3">
                       <span className="handwritten text-[10px] font-bold uppercase text-marker-blue bg-marker-blue/5 px-3 py-1 rounded-full border border-marker-blue/10">{selectedCity?.fullName?.split(',')[0]}</span>
                    </div>
                 </div>
                 <div className="p-10 md:p-12 marker-border border-marker-blue bg-white shadow-2xl rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl font-sans font-black italic">Ω</div>
                    <p className="handwritten text-2xl md:text-3xl text-marker-black leading-relaxed italic font-medium mb-12 relative z-10">
                       "{result.interpretation.final_synthesis}"
                    </p>
                    <ReadAloudButton text={result.interpretation.final_synthesis} className="!py-3 !px-6 !text-sm relative z-10 shadow-lg" />
                 </div>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="p-10 marker-border border-marker-black/5 bg-white shadow-xl rounded-2xl space-y-8">
                     <span className="handwritten text-[10px] font-bold uppercase text-marker-purple tracking-[0.4em] block border-b border-marker-black/5 pb-2 italic">Planetary Residue</span>
                     <div className="space-y-6">
                        {result.planets.map((p: any, i: number) => (
                          <div key={i} className="flex justify-between items-center group">
                             <div className="space-y-0.5">
                                <span className="heading-marker text-3xl text-marker-black lowercase group-hover:text-marker-blue transition-colors">{p.planet}</span>
                                {p.retrograde && <span className="block text-[8px] font-black text-marker-red uppercase tracking-widest animate-pulse">Retrograde Vector</span>}
                             </div>
                             <div className="text-right">
                                <span className="handwritten text-xl text-marker-black/70 italic font-bold">{p.degree.toFixed(1)}° {p.sign}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-10 marker-border border-marker-black/5 bg-white shadow-xl rounded-2xl space-y-8">
                     <span className="handwritten text-[10px] font-bold uppercase text-marker-teal tracking-[0.4em] block border-b border-marker-black/5 pb-2 italic">House Framework (12 Segments)</span>
                     <div className="space-y-6">
                        {result.houses.map((h: any, i: number) => (
                          <div key={i} className="flex justify-between items-center group">
                             <span className="heading-marker text-3xl text-marker-black lowercase">Room {h.house}</span>
                             <span className="handwritten text-xl text-marker-black/70 italic font-bold">{h.degree.toFixed(1)}° {h.sign}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
             </div>
           ) : loading ? (
             <div className="flex flex-col items-center justify-center py-48 gap-12 animate-in fade-in">
                <div className="relative">
                   <div className="w-24 h-24 border-2 border-marker-black border-t-transparent animate-spin rounded-full"></div>
                   <div className="absolute inset-0 flex items-center justify-center heading-marker text-2xl opacity-20 italic">♁</div>
                </div>
                <div className="text-center space-y-2">
                   <span className="handwritten text-3xl text-marker-black font-black animate-pulse uppercase tracking-[0.4em]">Compiling Firmament...</span>
                   <p className="handwritten text-sm italic opacity-40 uppercase tracking-widest">Reconstructing the sky for your arrival node.</p>
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-48 opacity-[0.02] select-none pointer-events-none">
                <div className="text-[14rem] sm:text-[18rem] heading-marker italic leading-none uppercase">Records</div>
                <p className="handwritten text-5xl uppercase tracking-[0.4em]">Ready for natal parameters</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BirthChartTool;
