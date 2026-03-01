
import React, { useState, useRef, memo, useCallback, useEffect } from 'react';
import { GlossaryTerm } from './GlossaryEngine';
import { getPhotoScryingReading } from '../services/geminiService';
import { audioManager } from './AudioManager';
import { logCalculation } from '../services/dbService';
import { useSyllabusStore } from '../store';
import { WritingEffect } from './WritingEffect';
import { PhotoScryerResult } from '../types';

const PhotoScryer: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<PhotoScryerResult | null>(null);
  const [focus, setFocus] = useState('General Patterns');
  const [camera, setCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { recordCalculation } = useSyllabusStore();

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setCamera(false);
  }, []);

  const handleCapture = useCallback(async() => {
    if (!videoRef.current) {
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const data = canvas.toDataURL('image/jpeg', 0.8);
    setImage(data); stop(); setLoading(true); audioManager.playRustle();
    const res = await getPhotoScryingReading(data, 'image/jpeg', focus);
    if (res) {
      setReading(res); recordCalculation(); logCalculation('SCRY', focus, res);
    }
    setLoading(false);
  }, [focus, recordCalculation, stop]);

  const start = async() => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = s; if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setCamera(true);
    } catch {
      alert('No camera.');
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center py-12 px-4 md:px-8 relative max-w-6xl mx-auto">
      <button onClick={() => {
        stop(); onBack();
      }} className="fixed top-4 right-4 brutalist-button !text-[10px] z-[100] bg-surface">Index</button>
      <div className="w-full flex flex-col lg:flex-row gap-10 items-start pt-12">
        <aside className="w-full lg:w-[400px] space-y-8 lg:sticky lg:top-20">
          <header className="space-y-4">
            <h2 className="heading-marker text-7xl text-marker-purple lowercase">Photo Scryer</h2>
            <p className="handwritten text-lg text-marker-purple opacity-50 font-bold uppercase italic tracking-widest">See Hidden Truth</p>
          </header>
          <select value={focus} onChange={e => setFocus(e.target.value)} className="w-full p-4 marker-border bg-surface italic font-bold">
            <option>General Patterns</option>
            <option>Room Vibe</option>
            <option>Aura Sight</option>
          </select>
          <div className="relative aspect-video bg-black marker-border overflow-hidden">
            {camera ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" /> : image && <img src={image} className="w-full h-full object-cover" />}
            {!camera && !image && <div className="flex h-full items-center justify-center text-white/20 uppercase text-[10px] font-bold">No Input</div>}
          </div>
          <button onClick={camera ? handleCapture : start} className="brutalist-button w-full !py-6 !bg-marker-purple text-white text-xl uppercase tracking-widest">{camera ? 'Capture' : 'Start Camera'}</button>
        </aside>
        <main className="flex-1 w-full pb-32">
          {loading ? <div className="text-center py-40 animate-pulse text-2xl italic">Reading Pixels...</div>
            : reading ? (
              <div className="space-y-12 animate-in fade-in">
                <div className="p-10 marker-border border-marker-purple bg-surface shadow-2xl relative">
                  <span className="handwritten text-[10px] uppercase font-bold block mb-4">Sight</span>
                  <p className="handwritten text-3xl italic">"{reading.primaryObservation}"</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 marker-border bg-surface/50">
                    <span className="handwritten text-[10px] font-bold uppercase block border-b pb-2">Objects</span>
                    {reading.artifactsDetected.map((a, i) => <p key={i} className="handwritten text-xl italic">{a}</p>)}
                  </div>
                  <div className="p-8 marker-border bg-surface/50">
                    <span className="handwritten text-[10px] font-bold uppercase block border-b pb-2">Room Vibe</span>
                    <p className="handwritten text-xl italic">{reading.spatialVibe}</p>
                  </div>
                </div>
              </div>
            ) : <div className="py-40 text-center opacity-10 text-8xl heading-marker">VOID</div>}
        </main>
      </div>
    </div>
  );
};
export default PhotoScryer;
