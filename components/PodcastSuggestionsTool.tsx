
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { logCalculation, getLogs } from '../services/dbService';
import { useSyllabusStore } from '../store';
import { ToolProps, BroadcastProposal } from '../types';

const PodcastSuggestionsTool: React.FC<ToolProps> = ({ onBack }) => {
  const [proposals, setProposals] = useState<BroadcastProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCurator, setIsCurator] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const recordCalculation = useSyllabusStore(state => state.recordCalculation);
  
  const [formData, setFormData] = useState({ topic: '', desc: '', guest: '' });

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    const logs = await getLogs('BROADCAST_PROPOSALS') as Array<{ result: string }>;
    if (logs) {
      const items = logs.map(l => JSON.parse(l.result) as BroadcastProposal);
      const unique = items.reduce((acc: BroadcastProposal[], curr: BroadcastProposal) => {
         const existingIdx = acc.findIndex(i => i.id === curr.id);
         if (existingIdx > -1) {
            acc[existingIdx] = curr;
         } else {
            acc.push(curr);
         }
         return acc;
      }, []);
      setProposals(unique);
    }
  };

  const sortedProposals = useMemo(() => {
    return [...proposals].sort((a, b) => b.votes - a.votes);
  }, [proposals]);

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic || !formData.desc) return;

    setLoading(true);
    const newProposal: BroadcastProposal = {
      id: Date.now().toString(),
      topic: formData.topic,
      desc: formData.desc,
      guest: formData.guest,
      votes: 1,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    await logCalculation('BROADCAST_PROPOSALS', newProposal.topic, newProposal);
    setProposals(prev => [newProposal, ...prev]);
    setFormData({ topic: '', desc: '', guest: '' });
    setLoading(false);
    recordCalculation();
  };

  const handleVote = useCallback(async (id: string) => {
    setProposals(prev => {
      const updated = prev.map(p => {
        if (p.id === id) return { ...p, votes: p.votes + 1 };
        return p;
      });
      const item = updated.find(i => i.id === id);
      if (item) {
         logCalculation('BROADCAST_PROPOSALS', `VOTE: ${item.topic}`, item);
      }
      return updated;
    });
  }, []);

  const handleCuratorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.toUpperCase() === 'LOGOS-ARK') {
      setIsCurator(true);
      setShowAuth(false);
      setAccessCode('');
    } else {
      alert("Invalid Archivist Credentials.");
    }
  };

  const updateStatus = async (id: string, status: 'scheduled' | 'recorded') => {
    setProposals(prev => {
      const updated = prev.map(p => {
         if (p.id === id) return { ...p, status };
         return p;
      });
      const item = updated.find(i => i.id === id);
      if (item) {
         logCalculation('BROADCAST_PROPOSALS', `STATUS_${status.toUpperCase()}: ${item.topic}`, item);
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-20 px-4 md:px-12 relative max-w-6xl mx-auto">
      <button onClick={onBack} className="fixed top-8 right-8 brutalist-button !text-sm !px-4 !py-1 z-50 bg-surface shadow-xl">Index</button>

      <div className="w-full space-y-24">
        <header className="text-center space-y-4">
          <h1 className="heading-marker text-7xl md:text-8xl text-marker-blue lowercase leading-tight">broadcast <GlossaryTerm word="Proposal">proposals</GlossaryTerm></h1>
          <p className="handwritten text-xl text-marker-blue opacity-40 uppercase tracking-[0.3em] italic">Curate the <GlossaryTerm word="Syllabus">Podcast</GlossaryTerm> Frequency</p>
          <div className="w-full h-1 bg-marker-blue/10 marker-border mt-8"></div>
        </header>

        <section className="max-w-4xl mx-auto w-full">
           <div className="p-8 md:p-12 marker-border border-marker-black bg-surface shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-marker-blue"></div>
              <h3 className="heading-marker text-4xl text-marker-black lowercase mb-10">Propose New Transmission</h3>
              <form onSubmit={handleProposalSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-1">
                    <label className="handwritten text-[10px] font-bold uppercase opacity-40 ml-1">Transmission Topic</label>
                    <input 
                      className="w-full p-4 marker-border bg-marker-black/[0.02] italic outline-none focus:border-marker-blue" 
                      value={formData.topic}
                      placeholder="e.g. The Astrology of Artificial Sentience"
                      onChange={e => setFormData({...formData, topic: e.target.value})}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="handwritten text-[10px] font-bold uppercase opacity-40 ml-1">Potential Guest (Optional)</label>
                    <input 
                      className="w-full p-4 marker-border bg-marker-black/[0.02] italic outline-none focus:border-marker-blue" 
                      value={formData.guest}
                      placeholder="A specific scholar or voice..."
                      onChange={e => setFormData({...formData, guest: e.target.value})}
                    />
                 </div>
                 <div className="col-span-full space-y-1">
                    <label className="handwritten text-[10px] font-bold uppercase opacity-40 ml-1">Theological Scope / Why now?</label>
                    <textarea 
                      className="w-full p-4 marker-border bg-marker-black/[0.02] italic outline-none focus:border-marker-blue h-32 resize-none" 
                      value={formData.desc}
                      placeholder="Define the node of inquiry..."
                      onChange={e => setFormData({...formData, desc: e.target.value})}
                    />
                 </div>
                 <button 
                  type="submit" 
                  disabled={loading || !formData.topic || !formData.desc}
                  className="brutalist-button col-span-full !py-6 !text-2xl !bg-marker-blue !text-white !border-marker-blue hover:opacity-90 shadow-xl"
                 >
                    {loading ? 'Encoding Broadcast Signal...' : 'Inject Proposal'}
                 </button>
              </form>
           </div>
        </section>

        <section className="space-y-12">
          <div className="flex items-center gap-4">
             <span className="handwritten text-xs font-bold uppercase tracking-[0.5em] text-marker-black/40">The Collective Frequency</span>
             <div className="h-px bg-marker-black/10 flex-grow"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProposals.length === 0 ? (
               <div className="col-span-full text-center py-24 opacity-20 italic">No proposals detected in the feed. Initiate a new transmission concept.</div>
            ) : (
              sortedProposals.map((prop) => (
                <div key={prop.id} className="p-8 marker-border border-marker-black bg-surface shadow-xl flex flex-col justify-between group hover:border-marker-blue transition-all animate-in fade-in duration-700">
                   <div className="space-y-6">
                      <div className="flex justify-between items-start">
                         <span className={`px-3 py-0.5 text-[8px] font-bold uppercase tracking-widest border rounded-full ${
                           prop.status === 'pending' ? 'border-marker-black/20 text-marker-black/40' :
                           prop.status === 'scheduled' ? 'border-marker-teal text-marker-teal bg-marker-teal/5' :
                           'border-marker-blue text-marker-blue bg-marker-blue/5'
                         }`}>
                           {prop.status}
                         </span>
                         <span className="text-[10px] font-mono opacity-20">VOTES: {prop.votes}</span>
                      </div>
                      
                      <div className="space-y-2">
                         <h4 className="heading-marker text-3xl text-marker-black lowercase leading-tight group-hover:text-marker-blue transition-colors">{prop.topic}</h4>
                         {prop.guest && <p className="handwritten text-xs font-bold text-marker-blue/60 uppercase tracking-widest">W/ {prop.guest}</p>}
                      </div>
                      
                      <p className="handwritten text-sm text-marker-black/70 italic leading-relaxed line-clamp-3">"{prop.desc}"</p>
                   </div>
                   
                   <div className="mt-10 pt-6 border-t border-marker-black/5 flex justify-between items-center">
                      <button 
                        onClick={() => handleVote(prop.id)}
                        className="text-[10px] font-bold uppercase tracking-widest text-marker-black hover:text-marker-blue transition-colors flex items-center gap-2 group/btn"
                      >
                        <span className="text-lg group-hover/btn:scale-125 transition-transform">▲</span> Amplify Signal
                      </button>
                      
                      {isCurator && prop.status === 'pending' && (
                        <div className="flex gap-2">
                           <button onClick={() => updateStatus(prop.id, 'scheduled')} className="text-[8px] font-bold text-marker-teal uppercase border border-marker-teal px-2 py-0.5 rounded shadow-sm">Schedule</button>
                           <button onClick={() => updateStatus(prop.id, 'recorded')} className="text-[8px] font-bold text-marker-blue uppercase border border-marker-blue px-2 py-0.5 rounded shadow-sm">Recorded</button>
                        </div>
                      )}
                   </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="mt-24 pt-24 border-t border-marker-black/5 flex flex-col items-center gap-12 pb-32">
           <div className="text-center opacity-30">
              {showAuth ? (
                <form onSubmit={handleCuratorLogin} className="flex gap-2 items-center animate-in fade-in zoom-in-95">
                   <input 
                     type="password" 
                     placeholder="Archivist Key..." 
                     className="p-2 marker-border bg-surface text-xs outline-none focus:border-marker-blue shadow-inner" 
                     value={accessCode}
                     onChange={e => setAccessCode(e.target.value)}
                     autoFocus
                   />
                   <button type="submit" className="brutalist-button !px-4 !py-1 !text-[10px] !bg-marker-blue !text-white !border-marker-blue shadow-sm">Validate</button>
                   <button type="button" onClick={() => setShowAuth(false)} className="text-[10px] font-bold px-2">×</button>
                </form>
              ) : (
                <button 
                  onClick={() => setShowAuth(true)}
                  className="text-[8px] uppercase tracking-[0.4em] font-bold hover:text-marker-blue transition-colors"
                >
                  Broadcast Maintenance Portal
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastSuggestionsTool;
