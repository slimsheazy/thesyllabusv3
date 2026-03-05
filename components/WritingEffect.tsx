
import React, { useState, useEffect, useRef, memo } from 'react';
import { audioManager } from './AudioManager';

interface WritingEffectProps {
  text: string;
  className?: string;
  speed?: number;
  onComplete?: () => void;
  playAudio?: boolean;
}

const sanitize = (t: string) => {
  return t
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Remove inline code
    .replace(/`(.*?)`/g, '$1')
    // Remove links
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    // Remove brackets
    .replace(/[\[\]{}()]/g, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

export const WritingEffect: React.FC<WritingEffectProps> = memo(({
  text,
  className = '',
  speed = 3,
  onComplete,
  playAudio = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const indexRef = useRef(0);
  const cleanText = useRef(sanitize(text));

  useEffect(() => {
    cleanText.current = sanitize(text);
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;
    if (playAudio && cleanText.current.length > 0) {
      audioManager.playPenScratch(0.1);
    }

    const step = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const progress = time - lastTimeRef.current;

      if (progress >= speed) {
        if (indexRef.current < cleanText.current.length) {
          const chunk = Math.random() > 0.7 ? 4 : 3;
          const next = cleanText.current.slice(0, indexRef.current + chunk);
          setDisplayedText(next);
          indexRef.current += chunk;
          lastTimeRef.current = time;
        } else {
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
          return;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (playAudio) {
        audioManager.stopPenScratch();
      }
    };
  }, [text, speed, onComplete, playAudio]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-1 h-5 bg-marker-purple ml-0.5 animate-pulse align-middle"></span>
      )}
    </span>
  );
});
