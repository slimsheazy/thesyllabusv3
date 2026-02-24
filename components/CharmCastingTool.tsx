
import React, { useRef, useEffect, useState, memo, useCallback } from 'react';
// Changed import to match exported members of geminiService
import { getCharmReading } from '../services/geminiService';
import { useSyllabusStore } from '../store';
import { ReadAloudButton } from './ReadAloudButton';
import { GlossaryTerm, useGlossary } from './GlossaryEngine';
// Imported CharmData from the central types file
import { CharmData } from '../types';

const CHARMS = [
  { id: 'sun', icon: '☀️', name: 'The Sun' },
  { id: 'moon', icon: '🌙', name: 'The Moon' },
  { id: 'key', icon: '🔑', name: 'The Key' },
  { id: 'heart', icon: '🖤', name: 'The Heart' },
  { id: 'skull', icon: '💀', name: 'The End' },
  { id: 'star', icon: '⭐', name: 'The Star' },
  { id: 'eye', icon: '👁️', name: 'The Eye' }
];

const HOUSE_NAMES = [
  "Self & Identity", "Resources & Values", "Communication & Mind", "Roots & Home",
  "Creation & Joy", "Service & Health", "Partnership & Shadow", "Transformation & Debt",
  "Wisdom & Travel", "Authority & Public", "Community & Hopes", "Unconscious & Solitude"
];

interface PhysicsCharm {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  scale: number;
  settled: boolean;
  hasClanked: boolean;
}

const CharmBoard = memo(({ 
  canvasRef, onMouseDown, onTouchStart, onMouseLeave, isHolding 
}: { 
  canvasRef: React.RefObject<HTMLCanvasElement>, 
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void, 
  onTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void, 
  onMouseLeave: () => void,
  isHolding: boolean
}) => (
  <div className={`relative p-2 md:p-4 bg-surface shadow-2xl marker-border border-marker-black transition-transform duration-500 ${isHolding ? 'scale-[0.98] rotate-0' : 'rotate-1'} w-full max-w-[600px] aspect-square rounded-full`}>
    <canvas 
      ref={canvasRef}
      width={600}
      height={600}
      className="w-full h-full bg-marker-black/[0.05] cursor-grab active:cursor-grabbing touch-none rounded-full"
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
    />
    <div className={`absolute inset-0 border-4 border-marker-purple/10 pointer-events-none transition-opacity duration-300 ${isHolding ? 'opacity-100' : 'opacity-0'} rounded-full`}></div>
    {!isHolding && (
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none z-20 text-center">
        <span className="handwritten text-[10px] uppercase font-black text-marker-black tracking-[0.3em] bg-surface px-3 py-1 rounded shadow-lg border border-marker-black/10 animate-pulse">Gather and Flick</span>
      </div>
    )}
  </div>
));

const CharmResult = memo(({ reading, charms }: { reading: any, charms: CharmData[] }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="p-8 md:p-10 marker-border border-marker-blue bg-surface shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none heading-marker text-8xl">RECORDS</div>
      <div className="flex justify-between items-center mb-4 border-b-2 border-marker-blue/10 pb-2 relative z-10">
        <span className="handwritten text-sm font-black uppercase text-marker-blue tracking-widest">The Synthesis</span>
        <ReadAloudButton text={`${reading.synthesis} ${reading.keyInsight}`} className="!py-1 !px-2 !text-xs bg-marker-blue/5 border-marker-blue/20 text-marker-blue" />
      </div>
      <p className="handwritten text-lg md:text-xl italic text-marker-black/80 leading-relaxed relative z-10">"{reading.synthesis}"</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charms.map((c, i) => {
        const detail = reading.charmDetails.find((d: any) => d.charm.toLowerCase().includes(c.name.toLowerCase()));
        return (
          <div key={i} className="p-6 marker-border border-marker-black/5 bg-surface/40 group hover:border-marker-purple transition-all">
            <div className="flex justify-between items-start mb-2">
               <span className="handwritten text-xs font-bold uppercase text-marker-black/40 group-hover:text-marker-purple">
                 <GlossaryTerm word={c.name}>{c.name}</GlossaryTerm>
               </span>
               <span className="text-[9px] font-mono bg-marker-black/5 px-2 py-0.5 rounded uppercase tracking-tighter">House {c.house}</span>
            </div>
            <p className="handwritten text-xs font-black text-marker-purple/60 mb-2 uppercase tracking-widest">{HOUSE_NAMES[c.house - 1]}</p>
            <p className="handwritten text-base text-marker-black/80 leading-snug">{detail?.meaning || "The signal for this charm is subtle and integrated into the overall synthesis."}</p>
          </div>
        );
      })}
    </div>

    <div className="p-8 marker-border border-marker-red bg-surface/40 text-center">
      <span className="handwritten text-xs font-bold uppercase text-marker-red tracking-widest block mb-4">Core Insight</span>
      <p className="heading-marker text-3xl md:text-4xl text-marker-black lowercase leading-tight">{reading.keyInsight}</p>
    </div>
  </div>
));

const CharmCastingTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [intent, setIntent] = useState('');
  const [isCasting, setIsCasting] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [reading, setReading] = useState<any>(null);
  const [settledCharms, setSettledCharms] = useState<CharmData[]>([]);
  const [loading, setLoading] = useState(false);
  const { isEclipseMode } = useSyllabusStore();
  
  const charmsRef = useRef<PhysicsCharm[]>(CHARMS.map((c, i) => ({
    id: c.id,
    x: 300 + Math.cos(i) * 100,
    y: 300 + Math.sin(i) * 100,
    vx: 0, vy: 0, rot: 0, vRot: 0, scale: 1,
    settled: true, hasClanked: true
  })));
  
  const dragInfoRef = useRef({ lastX: 0, lastY: 0, prevX: 0, prevY: 0, lastTime: 0, prevTime: 0 });
  const animationRef = useRef<number>(0);
  const { recordCalculation } = useSyllabusStore();
  const { inspectWord, hideInspector, updatePosition, cancelHide } = useGlossary();

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  }, []);

  const playClank = useCallback((volume = 0.08) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    const gain = ctx.createGain(); gain.connect(ctx.destination);
    const osc = ctx.createOscillator(); osc.type = 'sine'; 
    osc.frequency.setValueAtTime(1800 + Math.random() * 800, t); 
    osc.connect(gain);
    gain.gain.setValueAtTime(0, t); 
    gain.gain.linearRampToValueAtTime(volume, t + 0.005); 
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t); osc.stop(t + 0.15);
  }, []);

  const drawBoard = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cx = width / 2, cy = height / 2;
    ctx.clearRect(0, 0, width, height);
    
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, width * 0.6);
    bgGrad.addColorStop(0, isEclipseMode ? '#1e1e26' : '#fdfbf7'); 
    bgGrad.addColorStop(1, isEclipseMode ? '#09090b' : '#cbd5e1');
    ctx.fillStyle = bgGrad; 
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = isEclipseMode ? '#c084fc' : '#1e293b';
    ctx.lineWidth = 1;

    [0.1, 0.25, 0.45].forEach(r => {
      ctx.beginPath(); 
      ctx.arc(cx, cy, width * r, 0, Math.PI * 2); 
      ctx.setLineDash([5, 10]);
      ctx.globalAlpha = isEclipseMode ? 0.3 : 0.15;
      ctx.stroke();
    });

    ctx.setLineDash([]);
    
    // Draw 12 House Boundaries starting from Ascendant (9 o'clock)
    // In physics space, 180 degrees is West (Ascendant)
    for (let i = 0; i < 12; i++) {
      const angle = Math.PI + (i * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * width, cy + Math.sin(angle) * width);
      ctx.globalAlpha = isEclipseMode ? 0.2 : 0.1;
      ctx.stroke();

      // Draw House Numbers & Labels
      ctx.save();
      const midAngle = angle + Math.PI/12;
      ctx.translate(cx + Math.cos(midAngle) * width * 0.35, cy + Math.sin(midAngle) * width * 0.35);
      ctx.rotate(midAngle + Math.PI/2);
      
      // Number
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillStyle = isEclipseMode ? '#c084fc' : '#1a1c1e';
      ctx.globalAlpha = 0.3;
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, 0, -10);
      
      // Label
      ctx.font = '7px JetBrains Mono';
      ctx.fillText(HOUSE_NAMES[i].toUpperCase(), 0, 5);
      ctx.restore();
    }
    ctx.globalAlpha = 1.0;

    ctx.lineWidth = isEclipseMode ? 1 : 2;
    ctx.beginPath(); 
    ctx.arc(cx, cy, width * 0.48, 0, Math.PI * 2); 
    if (isEclipseMode) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#c084fc';
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.beginPath(); 
    ctx.arc(cx, cy, width * 0.08, 0, Math.PI * 2); 
    ctx.fillStyle = isHolding ? (isEclipseMode ? '#c084fc' : '#4c1d95') : (isEclipseMode ? '#e2e8f0' : '#1a1c1e'); 
    ctx.fill(); 
    ctx.stroke();
  };

  const drawCharm = (ctx: CanvasRenderingContext2D, charm: PhysicsCharm) => {
    const def = CHARMS.find(c => c.id === charm.id);
    if (!def) return;
    ctx.save();
    ctx.translate(charm.x, charm.y); ctx.rotate(charm.rot); ctx.scale(charm.scale, charm.scale);
    
    if (isEclipseMode) {
       ctx.shadowBlur = 10;
       ctx.shadowColor = 'rgba(255,255,255,0.2)';
    } else {
       ctx.shadowBlur = 4;
       ctx.shadowColor = 'rgba(0,0,0,0.1)';
       ctx.shadowOffsetY = 2;
    }
    
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); 
    ctx.fillStyle = charm.settled ? (isEclipseMode ? '#475569' : '#94a3b8') : (isEclipseMode ? '#64748b' : '#cbd5e1'); 
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = isEclipseMode ? '#e2e8f0' : '#1a1c1e'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = '24px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", Arial, sans-serif'; 
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle'; 
    ctx.fillStyle = isEclipseMode ? '#e2e8f0' : '#1a1c1e'; 
    ctx.fillText(def.icon, 0, 2);
    ctx.restore();
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let allSettled = true;
    drawBoard(ctx, canvas.width, canvas.height);
    
    charmsRef.current.forEach(charm => {
      if (!charm.settled) {
        charm.x += charm.vx; 
        charm.y += charm.vy; 
        charm.rot += charm.vRot;
        
        if (charm.scale > 1) { 
          charm.scale *= 0.975; 
          if (charm.scale <= 1) { 
            charm.scale = 1; 
            if (!charm.hasClanked) { playClank(0.12); charm.hasClanked = true; } 
          } 
        }

        charm.vx *= 0.97; 
        charm.vy *= 0.97;
        charm.vRot *= 0.97;

        const radius = 22;
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const distFromCenter = Math.hypot(charm.x - cx, charm.y - cy);
        const boardRadius = canvas.width * 0.48;

        if (distFromCenter + radius > boardRadius) {
          const angle = Math.atan2(charm.y - cy, charm.x - cx);
          charm.x = cx + Math.cos(angle) * (boardRadius - radius);
          charm.y = cy + Math.sin(angle) * (boardRadius - radius);
          charm.vx *= -0.4; charm.vy *= -0.4;
          if (Math.hypot(charm.vx, charm.vy) > 0.5) playClank(0.03);
        }

        if (Math.abs(charm.vx) < 0.1 && Math.abs(charm.vy) < 0.1 && charm.scale <= 1.01) {
          charm.settled = true; charm.vx = 0; charm.vy = 0;
        } else {
          allSettled = false;
        }
      }
      drawCharm(ctx, charm);
    });

    if (!allSettled) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsCasting(false);
      handleInterpretation();
    }
  }, [playClank, isEclipseMode]);

  const handleInterpretation = async () => {
    if (loading) return;
    setLoading(true);
    const cx = 300, cy = 300;
    
    const charmDataList: CharmData[] = charmsRef.current.map(c => {
      const dx = c.x - cx, dy = c.y - cy;
      const dist = Math.hypot(dx, dy);
      // Map angle to house (1-12) starting from West (180 deg)
      const angleDeg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
      const house = Math.floor(((angleDeg - 180 + 360) % 360) / 30) + 1;
      
      let ring = "Social";
      if (dist < 60) ring = "Personal Core";
      else if (dist < 150) ring = "Internal Narrative";
      else if (dist > 250) ring = "Universal Collective";

      const entangledWith = charmsRef.current
        .filter(other => other.id !== c.id && Math.hypot(c.x - other.x, c.y - other.y) < 60)
        .map(other => CHARMS.find(d => d.id === other.id)?.name || "?");

      return {
        name: CHARMS.find(d => d.id === c.id)?.name || '?', 
        house,
        ring,
        entangledWith,
        proximityToCenter: Math.min(1, dist / 300)
      };
    });

    setSettledCharms(charmDataList);

    try {
      const result = await getCharmReading(charmDataList, intent);
      setReading(result); 
      recordCalculation();
    } catch (e) {
      console.error("AI analysis failed", e);
    } finally {
      setLoading(false); 
    }
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (isCasting || loading || !intent) return;
    initAudio(); setIsHolding(true); setReading(null);
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    
    const now = Date.now();
    dragInfoRef.current = { lastX: x, lastY: y, prevX: x, prevY: y, lastTime: now, prevTime: now };

    charmsRef.current.forEach(c => {
      c.settled = false; c.hasClanked = false;
      c.vx = (x - c.x) * 0.1; c.vy = (y - c.y) * 0.1;
      c.scale = 1.05;
    });
    requestAnimationFrame(animate);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    
    if (isHolding) {
      const now = Date.now();
      dragInfoRef.current.prevX = dragInfoRef.current.lastX;
      dragInfoRef.current.prevY = dragInfoRef.current.lastY;
      dragInfoRef.current.prevTime = dragInfoRef.current.lastTime;
      dragInfoRef.current.lastX = x; 
      dragInfoRef.current.lastY = y;
      dragInfoRef.current.lastTime = now;
      charmsRef.current.forEach(c => {
        c.x = x + (Math.random() - 0.5) * 5;
        c.y = y + (Math.random() - 0.5) * 5;
      });
    } else {
      updatePosition(clientX, clientY);
      const hit = charmsRef.current.some(c => Math.hypot(x - c.x, y - c.y) < 25);
      if (hit) { inspectWord('Charm'); cancelHide(); } else hideInspector();
    }
  };

  const handlePointerUp = () => {
    if (!isHolding) return;
    setIsHolding(false); setIsCasting(true);
    
    const now = Date.now();
    const duration = Math.max(10, now - dragInfoRef.current.prevTime);
    const dx = dragInfoRef.current.lastX - dragInfoRef.current.prevX;
    const dy = dragInfoRef.current.lastY - dragInfoRef.current.prevY;
    
    let vx = (dx / duration) * 45; 
    let vy = (dy / duration) * 45;
    
    if (Math.hypot(vx, vy) < 5) { 
      vx = (Math.random() - 0.5) * 60; 
      vy = (Math.random() - 0.5) * 60; 
    }
    
    charmsRef.current.forEach(c => {
      c.vx = vx + (Math.random() - 0.5) * 15; 
      c.vy = vy + (Math.random() - 0.5) * 15;
      c.vRot = (Math.random() - 0.5) * 0.5; 
      c.scale = 2.4; 
      c.settled = false; 
      c.hasClanked = false;
    });
    playClank(0.12);
  };

  const forceReveal = () => {
    charmsRef.current.forEach(c => { c.settled = true; c.scale = 1; });
    setIsCasting(false); handleInterpretation();
  };

  useEffect(() => {
    const handleGlobalUp = () => handlePointerUp();
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isHolding]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-20 px-4 md:px-8 relative max-w-7xl mx-auto">
      <button onClick={onBack} className="fixed top-8 right-8 brutalist-button !text-sm z-50 bg-surface shadow-xl">Index</button>
      <div className="w-full flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 w-full space-y-12">
           <header className="space-y-4">
             <h2 className="heading-marker text-6xl text-marker-black lowercase leading-none"><GlossaryTerm word="Lithomancy">Charm Casting</GlossaryTerm></h2>
             <p className="handwritten text-lg opacity-40 uppercase tracking-widest italic">Mapping the 12 Houses</p>
           </header>
           <div className="space-y-8">
             <div className="space-y-2">
               <label className="handwritten text-[10px] uppercase font-bold text-marker-black/40 tracking-widest ml-1">The Intention</label>
               <input 
                value={intent} 
                onChange={(e) => setIntent(e.target.value)} 
                placeholder="Define your inquiry..." 
                className="w-full p-6 text-2xl italic border-marker-black/20 bg-surface/50 outline-none focus:border-marker-purple shadow-sm" 
               />
             </div>
             {reading && settledCharms.length > 0 && <CharmResult reading={reading} charms={settledCharms} />}
             {loading && (
               <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in fade-in">
                  <div className="w-12 h-12 border-2 border-marker-purple border-t-transparent animate-spin rounded-full"></div>
                  <span className="handwritten italic animate-pulse">Calculating House Proximity...</span>
               </div>
             )}
             {isCasting && (
               <div className="flex justify-center pt-8">
                 <button onClick={forceReveal} className="text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity">Skip Physics & Reveal</button>
               </div>
             )}
           </div>
        </div>
        <div className="w-full lg:w-auto flex flex-col items-center gap-8">
          <CharmBoard 
            canvasRef={canvasRef} 
            onMouseDown={e => handlePointerDown(e.clientX, e.clientY)} 
            onMouseLeave={hideInspector}
            onTouchStart={e => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
            isHolding={isHolding}
          />
          <div 
            className="w-full h-12"
            onMouseMove={e => handlePointerMove(e.clientX, e.clientY)}
            onTouchMove={e => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
          />
        </div>
      </div>
    </div>
  );
};

export default CharmCastingTool;
