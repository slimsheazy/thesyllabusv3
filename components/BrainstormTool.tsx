
import React, { useState, useCallback, memo, useEffect } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getBrainstormSuggestions } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { logCalculation, getLogs } from '../services/dbService';
import { ToolProps } from '../types';

interface BrainstormIdea { id: string; text: string; timestamp: string; starred: boolean; }
interface BrainstormSession { id: string; title: string; prompt: string; timestamp: string; ideas: BrainstormIdea[]; technique: string; }

export const BrainstormTool: React.FC<ToolProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<'create' | 'active' | 'sessions'>('create');
  const [sessions, setSessions] = useState<BrainstormSession[]>([]);
  const [activeSession, setActiveSession] = useState<BrainstormSession | null>(null);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [technique, setTechnique] = useState('freeflow');
  const [currentIdea, setCurrentIdea] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { recordCalculation } = useSyllabusStore();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async() => {
    const logs = await getLogs('BRAINSTORM_SESSION') as any[];
    if (logs && logs.length > 0) {
      setSessions(logs.map(l => JSON.parse(l.result)));
    }
  };

  const saveToArchive = useCallback((session: BrainstormSession) => {
    logCalculation('BRAINSTORM_SESSION', session.title, session);
  }, []);

  const create = useCallback(() => {
    if (!title || !prompt) {
      return;
    }
    const ns: BrainstormSession = {
      id: Date.now().toString(),
      title,
      prompt,
      timestamp: new Date().toISOString(),
      ideas: [],
      technique
    };
    setSessions(prev => [ns, ...prev]);
    saveToArchive(ns);
    setActiveSession(ns);
    setViewMode('active');
  }, [title, prompt, technique, saveToArchive]);

  const add = useCallback((text: string) => {
    if (!activeSession || !text.trim()) {
      return;
    }
    const ni = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      starred: false
    };
    const us = { ...activeSession, ideas: [ni, ...activeSession.ideas] };
    setActiveSession(us);
    setSessions(prev => prev.map(s => s.id === us.id ? us : s));
    saveToArchive(us);
    setCurrentIdea('');
  }, [activeSession, saveToArchive]);

  const fetchAI = async() => {
    if (!activeSession) {
      return;
    }
    setLoadingSuggestions(true);
    const res = await getBrainstormSuggestions(activeSession.prompt, activeSession.ideas.map(i => i.text), activeSession.technique);
    if (res) {
      setAiSuggestions(res.suggestions);
      recordCalculation();
      logCalculation('BRAINSTORM_AI', activeSession.prompt, res);
    }
    setLoadingSuggestions(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-20 px-4 md:px-12 max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-8 right-8 brutalist-button !text-[10px] !px-4 !py-1 z-50 bg-surface shadow-xl">Index</button>
      <div className="w-full flex flex-col lg:flex-row gap-12 items-start">
        <aside className="w-full lg:w-[350px] space-y-12 lg:sticky lg:top-20">
          <header className="space-y-4">
            <h2 className="heading-marker text-7xl text-marker-blue lowercase">Idea <GlossaryTerm word="Synthesis">Brainstorm</GlossaryTerm></h2>
            <p className="handwritten text-xl text-marker-blue opacity-40 font-bold uppercase tracking-widest italic">Archival Ideation</p>
          </header>
          <nav className="flex flex-col gap-2">
            {(['create', 'sessions'] as const).map(id => (
              <button key={id} onClick={() => setViewMode(id)} className={`p-4 marker-border text-left transition-colors ${viewMode === id ? 'bg-marker-blue text-white' : 'bg-surface text-marker-black/40 hover:text-marker-black'}`}>
                {id.toUpperCase()}
              </button>
            ))}
            {activeSession && (
              <button onClick={() => setViewMode('active')} className={`p-4 marker-border text-left transition-colors ${viewMode === 'active' ? 'bg-marker-black text-surface' : 'bg-surface text-marker-black/40 hover:text-marker-black'}`}>
                ACTIVE: {activeSession.title}
              </button>
            )}
          </nav>
        </aside>
        <main className="flex-1 w-full min-h-[600px] pb-32">
          {viewMode === 'create' && (
            <div className="space-y-8 p-10 marker-border bg-surface shadow-sm animate-in fade-in duration-300">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Inquiry Label" className="w-full p-4 marker-border bg-surface text-3xl italic outline-none focus:border-marker-blue" />
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Central Challenge" className="w-full p-6 marker-border bg-surface text-xl outline-none h-32 focus:border-marker-blue" />
              <select value={technique} onChange={e => setTechnique(e.target.value)} className="w-full p-4 marker-border bg-surface outline-none focus:border-marker-blue">
                <option value="freeflow">FREEFLOW</option>
                <option value="scamper">SCAMPER</option>
                <option value="six-hats">SIX HATS</option>
              </select>
              <button onClick={create} disabled={!title || !prompt} className="brutalist-button w-full !py-6 !bg-marker-black text-surface disabled:opacity-30">Open Canvas</button>
            </div>
          )}
          {viewMode === 'active' && activeSession && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <div className="p-10 marker-border bg-surface shadow-sm border-l-8 border-l-marker-blue">
                <h3 className="heading-marker text-5xl lowercase">{activeSession.title}</h3>
                <p className="handwritten text-xl opacity-60 italic">"{activeSession.prompt}"</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={currentIdea} onChange={e => setCurrentIdea(e.target.value)} onKeyPress={e => e.key === 'Enter' && add(currentIdea)} placeholder="Capture fragment..." className="flex-1 p-6 marker-border bg-surface text-2xl italic outline-none focus:border-marker-black" />
                <button onClick={() => add(currentIdea)} className="brutalist-button !px-10 !bg-marker-black text-surface">Record</button>
              </div>
              <div className="space-y-4">
                <button onClick={fetchAI} disabled={loadingSuggestions} className="w-full brutalist-button !bg-marker-blue/5 text-marker-blue border-marker-blue/20">
                  {loadingSuggestions ? 'Consulting Field...' : 'GENERATE AI SUGGESTIONS'}
                </button>
                {aiSuggestions.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-top-2">
                    {aiSuggestions.map((s, idx) => (
                      <button key={idx} onClick={() => add(s)} className="p-4 text-left marker-border border-dashed border-marker-blue text-marker-blue italic text-lg hover:bg-marker-blue/5 transition-colors">
                        + {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {activeSession.ideas.map(i => (
                  <div key={i.id} className="p-8 marker-border bg-surface/40 italic text-2xl animate-in slide-in-from-left-2">"{i.text}"</div>
                ))}
              </div>
            </div>
          )}
          {viewMode === 'sessions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {sessions.length === 0 ? (
                <div className="col-span-full py-40 text-center opacity-10 italic text-3xl">No records discovered.</div>
              ) : (
                sessions.map(s => (
                  <div key={s.id} onClick={() => {
                    setActiveSession(s); setViewMode('active');
                  }} className="p-8 marker-border bg-surface shadow-sm cursor-pointer hover:border-marker-blue group transition-all">
                    <h4 className="heading-marker text-4xl group-hover:text-marker-blue transition-colors">{s.title}</h4>
                    <p className="handwritten text-sm opacity-60 italic truncate mt-2">"{s.prompt}"</p>
                    <div className="mt-6 flex justify-between items-center opacity-30 text-[10px] uppercase font-bold tracking-widest">
                      <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                      <span>{s.ideas.length} fragments</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrainstormTool;
