
import React, { useState, useEffect } from 'react';
import { getFriendshipMatrix } from '../services/geminiService';
import { GlossaryTerm } from './GlossaryEngine';
import { SynastryResult, ToolProps } from '../types';
import { useSyllabusStore } from '../store';
import { ReadAloudButton } from './ReadAloudButton';
import { WritingEffect } from './WritingEffect';

const FriendshipMatrix: React.FC<ToolProps> = ({ onBack }) => {
  const { userIdentity, setUserIdentity, recordCalculation } = useSyllabusStore();
  const [subjects, setSubjects] = useState<string[]>([userIdentity || '', '']);
  const [result, setResult] = useState<SynastryResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userIdentity && subjects[0] === '') {
      setSubjects(prev => [userIdentity, ...prev.slice(1)]);
    }
  }, [userIdentity]);

  const handleAddSubject = () => {
    if (subjects.length < 5) {
      setSubjects([...subjects, '']);
    }
  };

  const handleRemoveSubject = (index: number) => {
    if (subjects.length > 2) {
      const newSubjects = [...subjects];
      newSubjects.splice(index, 1);
      setSubjects(newSubjects);
    }
  };

  const handleSubjectChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const handleAnalyze = async() => {
    const validNames = subjects.filter(n => n.trim() !== '');
    if (validNames.length < 2) {
      return;
    }

    // Sync the first name as the primary identity
    if (validNames[0]) {
      setUserIdentity(validNames[0]);
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await getFriendshipMatrix(validNames);
      setResult(data);
      recordCalculation();
    } catch (e) {
      console.error(e);
      alert('Bond calculation failed. The field is unstable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-20 px-4 md:px-8 relative max-w-7xl mx-auto overflow-x-hidden">
      <button onClick={onBack} className="fixed top-8 right-8 brutalist-button !text-sm !px-4 !py-1 z-50 bg-surface shadow-xl">Index</button>

      <div className="w-full space-y-16">
        <header className="text-center space-y-4">
          <h2 className="heading-marker text-7xl text-marker-blue lowercase">Friendship <GlossaryTerm word="Synastry">Matrix</GlossaryTerm></h2>
          <p className="handwritten text-xl text-marker-blue opacity-60">Mapping Group Vibrations</p>
        </header>

        <div className="flex flex-col items-center gap-12 w-full max-w-4xl mx-auto">
          <div className="w-full space-y-6 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((name, index) => (
                <div key={index} className="flex items-center gap-2 group animate-in slide-in-from-left-2" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex-1 space-y-1">
                    <label className="handwritten text-[9px] text-marker-black opacity-40 uppercase tracking-widest ml-1">Subject {index + 1}</label>
                    <input
                      type="text"
                      placeholder="Identity Node"
                      className="w-full p-4 text-marker-black text-xl italic bg-surface/50 border-2 border-marker-black/5 rounded-xl focus:border-marker-blue outline-none transition-all"
                      value={name}
                      onChange={(e) => handleSubjectChange(index, e.target.value)}
                    />
                  </div>
                  {subjects.length > 2 && (
                    <button onClick={() => handleRemoveSubject(index)} className="mt-6 text-marker-red opacity-30 hover:opacity-100 p-2 transition-opacity">×</button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {subjects.length < 5 && (
                <button onClick={handleAddSubject} className="handwritten text-xs font-bold uppercase tracking-widest text-marker-blue border-b-2 border-marker-blue/20 hover:border-marker-blue transition-all pb-1">
                   + Add Member to Collective
                </button>
              )}
              <button
                onClick={handleAnalyze}
                disabled={loading || subjects.filter(n => n.trim()).length < 2}
                className="brutalist-button px-12 py-6 !text-2xl !bg-marker-black text-surface shadow-2xl disabled:opacity-30 hover:scale-[1.02] transition-transform"
              >
                {loading ? 'Measuring Bond...' : 'Calculate Synergy'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full min-h-[400px] flex flex-col items-center justify-start pb-32">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-8">
              <div className="w-20 h-20 border-4 border-marker-blue border-t-transparent animate-spin rounded-full"></div>
              <span className="handwritten text-xl text-marker-blue animate-pulse italic">Triangulating Group Frequency...</span>
            </div>
          )}

          {result && !loading && (
            <div className="w-full max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Primary Compatibility Header */}
              <div className="flex flex-col items-center gap-6">
                <div className="handwritten text-[10px] text-marker-black opacity-40 uppercase tracking-[0.5em] italic">Synergy Quotient</div>
                <div className="text-marker-black font-bold text-8xl md:text-[10rem] leading-none heading-marker select-none">{result.compatibilityScore}%</div>
                <div className="w-full h-2 bg-marker-black/5 marker-border max-w-md overflow-hidden rounded-full">
                  <div className="h-full bg-marker-blue transition-all duration-2000 ease-out" style={{ width: `${result.compatibilityScore}%` }}></div>
                </div>
              </div>

              {/* Grid Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
                    <h3 className="heading-marker text-4xl text-marker-black lowercase">Core Analysis</h3>
                    <ReadAloudButton text={result.analysis} className="!py-1 !px-2 !text-[9px]" />
                  </div>
                  <div className="p-8 md:p-10 marker-border border-marker-blue bg-surface/40 shadow-xl relative overflow-hidden group h-full">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none text-9xl font-bold italic">BOND</div>
                    <p className="handwritten text-lg md:text-xl italic text-marker-black/80 leading-relaxed">
                          "<WritingEffect text={result.analysis} speed={20} />"
                    </p>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex justify-between items-end border-b border-marker-black/10 pb-4">
                    <h3 className="heading-marker text-4xl text-marker-black lowercase">Frequency Match</h3>
                  </div>
                  <div className="p-8 md:p-10 marker-border border-marker-black bg-surface/40 shadow-xl flex flex-col justify-center h-full">
                    <p className="heading-marker text-2xl md:text-3xl text-marker-black lowercase">
                      {result.vibrationalMatch}
                    </p>
                  </div>
                </section>
              </div>

              {/* Multi-Person Expansion Sections */}
              {(subjects.filter(n => n.trim()).length > 2 || result.groupDynamic) && (
                <section className="p-10 marker-border border-marker-black/10 bg-marker-black/[0.02] space-y-8 animate-in fade-in duration-1000 delay-500">
                  <div className="flex items-center gap-4">
                    <span className="handwritten text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Group Structure</span>
                    <div className="h-px bg-marker-black/10 flex-grow"></div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="heading-marker text-3xl lowercase text-marker-black">The Dynamic</h4>
                    <p className="handwritten text-xl text-marker-black/70 italic leading-relaxed">
                      {result.groupDynamic || 'The collective functions as a singular, unified resonant chamber of shared values and hidden growth.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                    <div className="space-y-4">
                      <span className="handwritten text-[10px] font-black uppercase text-marker-blue tracking-widest">Assigned Leader Archetype</span>
                      <div className="p-6 bg-surface marker-border border-marker-blue/20 rounded-lg shadow-sm">
                        <div className="heading-marker text-3xl text-marker-black lowercase mb-1">{result.leaderArchetype?.name}</div>
                        <div className="handwritten text-xs font-bold uppercase text-marker-blue tracking-wider">{result.leaderArchetype?.role}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="handwritten text-[10px] font-black uppercase text-marker-red tracking-widest">Friction Vectors</span>
                      <div className="space-y-2">
                        {result.frictionPoints?.map((point, i) => (
                          <div key={i} className="flex gap-3 items-start group">
                            <span className="heading-marker text-lg text-marker-red opacity-40 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                            <p className="handwritten text-sm italic text-marker-black/60 leading-snug">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="text-center opacity-[0.03] flex flex-col items-center justify-center h-full py-40 select-none pointer-events-none">
              <div className="text-[10rem] md:text-[14rem] heading-marker text-marker-black leading-none uppercase">Null</div>
              <p className="handwritten text-4xl uppercase tracking-[0.4em]">Awaiting Collective Input</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendshipMatrix;
