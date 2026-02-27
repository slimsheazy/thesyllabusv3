
import React, { useState, useEffect, useMemo } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getLogs, pruneLogs, clearAllLogs, exportDBBinary, getStorageUsage, LogEntry, initDB } from '../services/dbService';
import { audioManager } from './AudioManager';
import { WritingEffect } from './WritingEffect';
import { ReadAloudButton } from './ReadAloudButton';

interface CuratorBook {
  id: string; title: string; author: string; thesis: string; url?: string; timestamp: string;
}

const extractDeepRecallText = (data: any): { body: string; guidance: string | null } => {
  if (!data) {
    return { body: 'Empty archival fragment.', guidance: null };
  }

  const bodyKeys = [
    'final_synthesis', 'interpretation', 'judgment', 'soulPurpose',
    'analysis', 'narrative', 'synthesis', 'brief', 'phrase', 'meaning'
  ];

  let body = '';
  for (const key of bodyKeys) {
    const val = data[key];
    if (typeof val === 'string' && val.length > body.length) {
      body = val;
    }
    if (val && typeof val === 'object' && val.final_synthesis) {
      body = val.final_synthesis;
    }
  }

  if (!body) {
    const firstLongString = Object.values(data).find(v => typeof v === 'string' && v.length > 30);
    body = typeof firstLongString === 'string' ? firstLongString : 'Fragment metadata only.';
  }

  const guidance = data.guidance || data.suggestion || data.actionableInsight || data.finalClue || null;

  return { body, guidance };
};

const DeepRecallModal = ({ log, onClose }: { log: LogEntry, onClose: () => void }) => {
  const { data, error } = useMemo(() => {
    try {
      return { data: JSON.parse(log.result), error: null };
    } catch (e) {
      return { data: null, error: 'Corrupt fragment detected.' };
    }
  }, [log.result]);

  const { body, guidance } = useMemo(() => extractDeepRecallText(data), [data]);

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-12">
      <div className="absolute inset-0 bg-marker-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface marker-border border-marker-black shadow-2xl overflow-y-auto custom-scrollbar p-8 md:p-16 animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 brutalist-button !px-6 !py-1 !text-xs bg-surface shadow-xl">Close</button>
        <header className="space-y-4 mb-12 border-b border-marker-black/10 pb-10">
          <span className="handwritten text-[10px] font-black uppercase text-marker-blue tracking-[0.4em]">{log.module.replace(/_/g, ' ')}</span>
          <h2 className="heading-marker text-4xl md:text-5xl text-marker-black lowercase leading-tight">"{log.query}"</h2>
          <div className="text-[10px] font-mono opacity-50 uppercase">{new Date(log.timestamp).toLocaleString()}</div>
        </header>

        <div className="space-y-12">
          {error ? (
            <div className="p-8 marker-border border-marker-red bg-marker-red/5 text-marker-red font-bold">{error}</div>
          ) : (
            <div className="p-8 md:p-10 marker-border border-marker-blue bg-marker-blue/[0.03] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.02] text-[10rem] font-bold italic select-none">DATA</div>
              <p className="handwritten text-lg md:text-xl text-marker-black leading-relaxed italic font-medium relative z-10">
                <WritingEffect text={body} speed={10} />
              </p>
              {guidance && (
                <div className="mt-8 pt-8 border-t border-marker-blue/10 relative z-10">
                  <span className="handwritten text-[10px] font-bold uppercase text-marker-red tracking-widest block mb-4">Immediate Guidance</span>
                  <p className="heading-marker text-2xl text-marker-black lowercase">"{guidance}"</p>
                </div>
              )}
              <div className="mt-8 flex justify-end relative z-10">
                <ReadAloudButton text={`${body}. ${guidance || ''}`} className="!py-1 !px-3 !text-[10px]" />
              </div>
            </div>
          )}

          <details className="group">
            <summary className="handwritten text-[10px] font-black uppercase opacity-30 cursor-pointer hover:opacity-100 transition-opacity mb-4">View Raw Deterministic Trace</summary>
            <pre className="p-8 bg-marker-black/[0.03] marker-border border-marker-black/10 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap animate-in fade-in duration-300">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

const Archive: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [curatedBooks, setCuratedBooks] = useState<CuratorBook[]>([]);
  const [researchLogs, setResearchLogs] = useState<LogEntry[]>([]);
  const [view, setView] = useState<'curated' | 'logs' | 'management'>('curated');
  const [filterModule, setFilterModule] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [approxSize, setApproxSize] = useState<number>(0);

  useEffect(() => {
    loadLibrary();
    const handlePersist = (e: any) => {
      if (e.detail?.size) {
        setApproxSize(e.detail.size);
      }
    };
    window.addEventListener('db_persisted', handlePersist);
    exportDBBinary().then(bin => {
      if (bin) {
        setApproxSize(bin.byteLength);
      }
    });
    return () => window.removeEventListener('db_persisted', handlePersist);
  }, []);

  const loadLibrary = async() => {
    const [bookLogs, allLogs] = await Promise.all([getLogs('CURATOR_BOOKS'), getLogs()]);
    if (bookLogs) {
      setCuratedBooks(bookLogs.map(l => JSON.parse(l.result)));
    }
    if (allLogs) {
      setResearchLogs(allLogs.filter(l => l.module !== 'CURATOR_BOOKS'));
    }
  };

  const modules = useMemo(() => {
    const set = new Set(researchLogs.map(l => l.module));
    return Array.from(set).sort();
  }, [researchLogs]);

  const filteredLogs = useMemo(() => {
    if (!filterModule) {
      return researchLogs;
    }
    return researchLogs.filter(l => l.module === filterModule);
  }, [researchLogs, filterModule]);

  const handlePrune = async() => {
    if (!confirm('Keep only the most recent 20 research logs? Curator volumes will be preserved.')) {
      return;
    }
    await pruneLogs(20); loadLibrary(); audioManager.playRustle();
    const bin = await exportDBBinary(); if (bin) {
      setApproxSize(bin.byteLength);
    }
  };

  const handleClear = async() => {
    if (!confirm('This will PERMANENTLY WIPE all logs. Are you sure?')) {
      return;
    }
    await clearAllLogs(); loadLibrary(); audioManager.playRustle(); setApproxSize(0);
  };

  const handleExport = async() => {
    const binary = await exportDBBinary(); if (!binary) {
      return;
    }
    const blob = new Blob([binary], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `syllabus_archive_${new Date().toISOString().slice(0,10)}.sqlite`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); audioManager.playRustle();
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-20 px-4 md:px-8 relative max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-8 right-8 brutalist-button !text-sm z-50 bg-surface shadow-xl">Index</button>
      {selectedLog && <DeepRecallModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
      <header className="mb-20 text-center space-y-10">
        <h1 className="title-main !text-6xl md:!text-9xl text-marker-blue leading-none">the <GlossaryTerm word="Archive">shared archive</GlossaryTerm></h1>
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => {
              setView('curated'); audioManager.playRustle();
            }} className={`px-6 py-3 marker-border text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${view === 'curated' ? 'bg-marker-blue text-white shadow-xl' : 'bg-surface opacity-60 hover:opacity-100'}`}>Curated Volumes</button>
            <button onClick={() => {
              setView('logs'); audioManager.playRustle();
            }} className={`px-6 py-3 marker-border text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${view === 'logs' ? 'bg-marker-blue text-white shadow-xl' : 'bg-surface opacity-60 hover:opacity-100'}`}>Research Logs</button>
            <button onClick={() => {
              setView('management'); audioManager.playRustle();
            }} className={`px-6 py-3 marker-border text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${view === 'management' ? 'bg-marker-blue text-white shadow-xl' : 'bg-surface opacity-60 hover:opacity-100'}`}>Maintenance</button>
          </div>
          {view === 'logs' && modules.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl animate-in fade-in">
              <button onClick={() => setFilterModule(null)} className={`px-4 py-1.5 marker-border text-[8px] font-black uppercase tracking-widest ${!filterModule ? 'bg-marker-black text-surface' : 'bg-surface opacity-50'}`}>All</button>
              {modules.map(m => (
                <button key={m} onClick={() => setFilterModule(m)} className={`px-4 py-1.5 marker-border text-[8px] font-black uppercase tracking-widest ${filterModule === m ? 'bg-marker-black text-surface' : 'bg-surface opacity-50'}`}>{m.replace(/_/g, ' ')}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      {view === 'curated' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32 w-full animate-in fade-in duration-500">
          {curatedBooks.length === 0 ? <div className="col-span-full py-40 text-center opacity-10 italic text-3xl">Archive empty.</div> : curatedBooks.map(book => (
            <div key={book.id} className="p-8 marker-border border-marker-red bg-surface shadow-xl flex flex-col justify-between group hover:-translate-y-1 transition-all">
              <div>
                <h4 className="heading-marker text-2xl md:text-3xl lowercase group-hover:text-marker-red">{book.title}</h4>
                <p className="handwritten text-base italic opacity-60 mb-4">{book.author}</p>
                <p className="handwritten text-sm leading-relaxed italic line-clamp-4">"{book.thesis}"</p>
              </div>
              <div className="mt-6 pt-4 border-t border-marker-black/5 flex justify-end">
                <ReadAloudButton text={`${book.title} by ${book.author}. ${book.thesis}`} className="!py-0.5 !px-2 !text-[9px]" />
              </div>
            </div>
          ))}
        </section>
      )}

      {view === 'logs' && (
        <section className="w-full space-y-6 pb-48 animate-in fade-in duration-500 max-w-5xl">
          {filteredLogs.length === 0 ? <div className="py-40 text-center opacity-10 italic text-3xl">No logs detected.</div> : filteredLogs.map(log => (
            <div key={log.id} onClick={() => {
              setSelectedLog(log); audioManager.playRustle();
            }} className="p-6 md:p-8 marker-border border-marker-black bg-surface shadow-md flex flex-col md:flex-row gap-6 md:gap-8 items-center group hover:border-marker-blue cursor-pointer transition-all">
              <div className="shrink-0 w-full md:w-40">
                <span className="text-[10px] font-black uppercase text-marker-blue bg-marker-blue/5 px-3 py-1 rounded block mb-2">{log.module.replace(/_/g, ' ')}</span>
                <span className="text-[10px] font-mono opacity-50 block uppercase">{new Date(log.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex-1">
                <h5 className="heading-marker text-2xl md:text-3xl lowercase leading-tight group-hover:text-marker-blue">"{log.query}"</h5>
              </div>
              <div className="shrink-0 opacity-0 group-hover:opacity-100">
                <span className="text-[10px] font-bold uppercase underline decoration-2 underline-offset-4 decoration-marker-blue/20">Recall →</span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
export default Archive;
