
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { logCalculation, getLogs } from '../services/dbService';
import { useSyllabusStore } from '../store';
import { ToolProps, ArchivalInquiry } from '../types';

const AMATool: React.FC<ToolProps> = ({ onBack }) => {
  const { userIdentity, setUserIdentity, recordCalculation } = useSyllabusStore();
  const [inquiries, setInquiries] = useState<ArchivalInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCurator, setIsCurator] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  const [newInquiry, setNewInquiry] = useState({ sender: userIdentity || '', question: '' });
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [draftAnswer, setDraftAnswer] = useState('');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async() => {
    const logs = await getLogs('ARCHIVAL_INQUIRIES') as Array<{ result: string }>;
    if (logs) {
      const items = logs.map(l => JSON.parse(l.result) as ArchivalInquiry);
      setInquiries(items);
    }
  };

  const handleCreatorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.toUpperCase() === 'LOGOS-ARK') {
      setIsCurator(true);
      setShowAuth(false);
      setAccessCode('');
    } else {
      alert('Unauthorized Access Attempt Detected.');
    }
  };

  const handleSubmitInquiry = async(e: React.FormEvent) => {
    e.preventDefault();
    if (!newInquiry.question) {
      return;
    }

    setLoading(true);

    // Sync identity if sender name is provided
    if (newInquiry.sender) {
      setUserIdentity(newInquiry.sender);
    }

    const inquiryData: ArchivalInquiry = {
      id: Date.now().toString(),
      sender: newInquiry.sender || 'Anonymous Seeker',
      question: newInquiry.question,
      timestamp: new Date().toISOString(),
      isAnswered: false
    };

    await logCalculation('ARCHIVAL_INQUIRIES', inquiryData.question.slice(0, 50), inquiryData);
    setInquiries(prev => [inquiryData, ...prev]);
    setNewInquiry({ ...newInquiry, question: '' });
    setLoading(false);
    recordCalculation();
  };

  const handlePostAnswer = async(id: string) => {
    if (!draftAnswer) {
      return;
    }

    const updatedInquiries = inquiries.map(inq => {
      if (inq.id === id) {
        return { ...inq, answer: draftAnswer, isAnswered: true };
      }
      return inq;
    });

    setInquiries(updatedInquiries);
    const item = updatedInquiries.find(i => i.id === id);
    if (item) {
      await logCalculation('ARCHIVAL_INQUIRIES', `ANSWERED: ${item.question.slice(0, 30)}`, item);
    }

    setAnsweringId(null);
    setDraftAnswer('');
  };

  const answeredInquiries = useMemo(() => inquiries.filter(i => i.isAnswered), [inquiries]);
  const pendingInquiries = useMemo(() => inquiries.filter(i => !i.isAnswered), [inquiries]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-20 px-4 md:px-12 relative max-w-6xl mx-auto">
      <button onClick={onBack} className="fixed top-8 right-8 brutalist-button !text-sm !px-4 !py-1 z-50 bg-surface shadow-xl">Index</button>

      <div className="w-full space-y-20">
        <header className="text-center space-y-4">
          <h1 className="heading-marker text-7xl md:text-8xl text-marker-green lowercase leading-tight">ask the <GlossaryTerm word="Archivist">archivists</GlossaryTerm></h1>
          <p className="handwritten text-xl text-marker-green opacity-40 uppercase tracking-[0.3em] italic">Direct correspondence with the <GlossaryTerm word="Syllabus">Curators</GlossaryTerm></p>
          <div className="w-full h-1 bg-marker-green/10 marker-border mt-8"></div>
        </header>

        <section className="max-w-3xl mx-auto w-full">
          <div className="p-8 md:p-12 marker-border border-marker-black bg-surface shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none heading-marker text-8xl">?</div>
            <h3 className="heading-marker text-4xl text-marker-black lowercase mb-8">Submit Inquiry</h3>
            <form onSubmit={handleSubmitInquiry} className="space-y-6">
              <div className="space-y-1">
                <label className="handwritten text-[10px] font-bold uppercase opacity-40 ml-1">Signature (Name)</label>
                <input
                  className="w-full p-4 marker-border bg-marker-black/[0.02] italic outline-none focus:border-marker-green"
                  value={newInquiry.sender}
                  placeholder="e.g. A Seeker from the Void"
                  onChange={e => setNewInquiry({ ...newInquiry, sender: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="handwritten text-[10px] font-bold uppercase opacity-40 ml-1">The Core Inquiry</label>
                <textarea
                  className="w-full p-4 marker-border bg-marker-black/[0.02] italic outline-none focus:border-marker-green h-40 resize-none"
                  value={newInquiry.question}
                  placeholder="Define the node of confusion..."
                  onChange={e => setNewInquiry({ ...newInquiry, question: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !newInquiry.question}
                className="brutalist-button w-full !py-6 !text-2xl !bg-marker-green !text-white !border-marker-green hover:opacity-90 shadow-xl"
              >
                {loading ? 'Dispatching Letter...' : 'Execute Submission'}
              </button>
            </form>
          </div>
        </section>

        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <span className="handwritten text-xs font-bold uppercase tracking-[0.5em] text-marker-black/40">The Public Record</span>
            <div className="h-px bg-marker-black/10 flex-grow"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {answeredInquiries.length === 0 ? (
              <div className="col-span-full text-center py-24 opacity-20 italic">No inquiries have been processed into the public record yet.</div>
            ) : (
              answeredInquiries.map((inq) => (
                <div key={inq.id} className="p-8 md:p-12 marker-border border-marker-black bg-surface shadow-xl space-y-8 animate-in fade-in duration-700">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="handwritten text-[10px] font-bold uppercase text-marker-black/30">The Inquiry</span>
                      <span className="text-[10px] font-mono opacity-20">REF: {inq.id.slice(-4)}</span>
                    </div>
                    <p className="handwritten text-2xl italic text-marker-black leading-snug">"{inq.question}"</p>
                    <p className="handwritten text-sm text-marker-black/40 uppercase tracking-widest">— {inq.sender}</p>
                  </div>

                  <div className="pt-8 border-t-2 border-marker-black/5 space-y-4">
                    <span className="handwritten text-[10px] font-bold uppercase text-marker-green tracking-widest block">Archival Response</span>
                    <div className="p-6 bg-marker-green/[0.02] border-l-4 border-marker-green">
                      <p className="handwritten text-xl text-marker-black/80 font-medium leading-relaxed">
                        {inq.answer}
                      </p>
                    </div>
                    <div className="flex justify-between items-center opacity-30 pt-4">
                      <span className="handwritten text-[10px] font-bold uppercase">The Archivists</span>
                      <span className="handwritten text-[10px]">{new Date(inq.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {isCurator && (
          <section className="pt-20 animate-in slide-in-from-top-4 duration-700">
            <div className="p-8 md:p-12 marker-border border-marker-red bg-marker-red/[0.01] shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-marker-red"></div>
              <div className="flex justify-between items-center mb-12 border-b border-marker-red/10 pb-6">
                <div className="space-y-1">
                  <h3 className="heading-marker text-5xl text-marker-red lowercase">Correspondence Maintenance</h3>
                  <p className="handwritten text-xs uppercase tracking-widest opacity-40 font-bold">Privileged Archivist Responder</p>
                </div>
                <button onClick={() => setIsCurator(false)} className="brutalist-button !text-[10px] !px-4 !py-1 !bg-surface shadow-md">Close Portal</button>
              </div>

              <div className="space-y-8">
                <h4 className="handwritten text-sm font-bold uppercase tracking-[0.3em] text-marker-black opacity-30 italic">Pending Inquiries ({pendingInquiries.length})</h4>
                {pendingInquiries.length === 0 ? (
                  <div className="text-center py-12 opacity-30 italic">No pending inquiries requiring attention.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {pendingInquiries.map(inq => (
                      <div key={inq.id} className="p-6 marker-border border-marker-black/10 bg-surface shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <p className="handwritten text-lg italic text-marker-black/60">"{inq.question}"</p>
                          <span className="handwritten text-[10px] opacity-30 uppercase">{inq.sender}</span>
                        </div>

                        {answeringId === inq.id ? (
                          <div className="space-y-4 animate-in fade-in zoom-in-95">
                            <textarea
                              className="w-full p-4 marker-border bg-surface italic outline-none focus:border-marker-red h-32"
                              value={draftAnswer}
                              onChange={e => setDraftAnswer(e.target.value)}
                              placeholder="Draft scholarly response..."
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handlePostAnswer(inq.id)} className="brutalist-button !bg-marker-red !text-white !border-marker-red !text-xs flex-grow">Publish to Record</button>
                              <button onClick={() => setAnsweringId(null)} className="brutalist-button !text-xs !px-6 shadow-sm">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setAnsweringId(inq.id)} className="text-[10px] font-bold uppercase text-marker-red underline decoration-2 underline-offset-4">Provide Response Right</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="mt-24 pt-24 border-t border-marker-black/5 flex flex-col items-center gap-12 pb-32">
          <div className="text-center opacity-30">
            {showAuth ? (
              <form onSubmit={handleCreatorLogin} className="flex gap-2 items-center animate-in fade-in zoom-in-95">
                <input
                  type="password"
                  placeholder="Archivist Key..."
                  className="p-2 marker-border bg-surface text-xs outline-none focus:border-marker-red shadow-inner"
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="brutalist-button !px-4 !py-1 !text-[10px] !bg-marker-red !text-white !border-marker-red shadow-sm">Validate</button>
                <button type="button" onClick={() => setShowAuth(false)} className="text-[10px] font-bold px-2">×</button>
              </form>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-[8px] uppercase tracking-[0.4em] font-bold hover:text-marker-red transition-colors"
              >
                  Correspondence Maintenance Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMATool;
