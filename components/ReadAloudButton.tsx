
import React, { useState, useRef, useEffect } from 'react';

interface ReadAloudProps {
  text: string;
  className?: string;
  label?: string;
}

export const ReadAloudButton: React.FC<ReadAloudProps> = ({ text, className, label }) => {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const speechRef = useRef<any>(null);

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playSpeech = async() => {
    if (!text || !window.speechSynthesis) {
      return;
    }

    if (isPlaying) {
      stopSpeech();
      return;
    }

    setLoading(true);

    try {
      // Cancel any existing speech
      window.speechSynthesis.cancel();

      const utterance = new (window as any).SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event: any) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } catch (error) {
      console.error('Speech Playback Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  return (
    <button
      onClick={playSpeech}
      disabled={loading || !text}
      className={`brutalist-button flex items-center gap-2 !py-2 !px-4 !text-sm group hover:scale-105 transition-all ${className || ''}`}
      title="Read Aloud"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-marker-black border-t-transparent animate-spin rounded-full"></div>
      ) : isPlaying ? (
        <div className="flex gap-1 items-end h-4">
          <div className="w-1 bg-marker-black h-2 animate-[bounce_0.8s_infinite]"></div>
          <div className="w-1 bg-marker-black h-4 animate-[bounce_0.6s_infinite]"></div>
          <div className="w-1 bg-marker-black h-3 animate-[bounce_1.0s_infinite]"></div>
        </div>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      )}
      <span className="handwritten font-bold uppercase tracking-wider">{isPlaying ? 'Stop' : (label || 'Read')}</span>
    </button>
  );
};
