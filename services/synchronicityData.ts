
export interface NumericArchetype {
  coreMeaning: string;
  lifeArea: string;
  guidance: string;
  shadow: string;
}

// Helper to check for birthday resonance
export const checkBirthdayResonance = (numStr: string, birthDate?: string): boolean => {
  if (!birthDate) {
    return false;
  }
  const cleanBirth = birthDate.replace(/[^0-9]/g, ''); // 19900512
  const monthDay = cleanBirth.slice(4); // 0512
  const dayMonth = cleanBirth.slice(6) + cleanBirth.slice(4, 6); // 1205
  return numStr.includes(monthDay) || numStr.includes(dayMonth) || numStr.includes(cleanBirth.slice(2, 4));
};

// Logic-based interpretation for numbers 11-9999
export const decodeNumericalPattern = (numStr: string): NumericArchetype | null => {
  const n = parseInt(numStr);
  if (isNaN(n)) {
    return null;
  }

  // 1. MASTER & REPEATING NUMBERS
  const repeatingMap: Record<string, NumericArchetype> = {
    '11': {
      coreMeaning: 'The Gateway of Intuition. It represents a bridge between the conscious and unconscious mind, signaling a high-frequency alignment.',
      lifeArea: 'Spiritual Path / Identity',
      guidance: 'Trust your immediate downloads; your psychic receptors are wide open.',
      shadow: 'Hyper-sensitivity leading to anxiety or paralysis.'
    },
    '22': {
      coreMeaning: 'The Master Builder. It marks the transition of a dream into a structured, physical reality through disciplined action.',
      lifeArea: 'Career / Foundation',
      guidance: 'Think big, but plan meticulously. You have the power to manifest concrete results.',
      shadow: 'Overwhelming pressure or fear of failure on a grand scale.'
    },
    '33': {
      coreMeaning: 'The Master Teacher. A rare frequency of altruism and creative communication centered on the evolution of others.',
      lifeArea: 'Social Contribution / Expression',
      guidance: 'Lead by example. Your words carry the weight of ancient wisdom right now.',
      shadow: 'Martyrdom or emotional exhaustion from carrying others\' burdens.'
    },
    '111': {
      coreMeaning: 'The Spark of Intent. Your thoughts are acting as seeds in a highly fertile psychic field.',
      lifeArea: 'Mindset / New Projects',
      guidance: 'Monitor your mental dialogue; you are currently a magnet for your own beliefs.',
      shadow: 'Obsessive thinking or ego-centricity.'
    },
    '222': {
      coreMeaning: 'Dynamic Equilibrium. A reminder that while you are in a waiting period, the roots are growing deep.',
      lifeArea: 'Relationships / Patience',
      guidance: 'Stay the course. Harmony is being woven behind the scenes.',
      shadow: 'Indecision or stagnant complacency.'
    },
    '333': {
      coreMeaning: 'Trinity Realignment. Body, Mind, and Spirit are functioning as a single, unified vector.',
      lifeArea: 'Creativity / Vitality',
      guidance: 'Express yourself fully. The universe is collaborating with your creative urges.',
      shadow: 'Scattered energy or lack of focus.'
    },
    '444': {
      coreMeaning: 'Universal Architecture. You are being encased in a structure of protection and stability.',
      lifeArea: 'Home / Security',
      guidance: 'Feel the solidity of your path. You are supported by the logic of the universe.',
      shadow: 'Rigidity or resistance to necessary change.'
    },
    '555': {
      coreMeaning: 'The Chrysalis Shift. Significant, rapid transformation is occurring to clear old karmic debris.',
      lifeArea: 'Lifestyle / Change',
      guidance: 'Surrender to the momentum. Change is the only way to avoid stagnation.',
      shadow: 'Chaos or fear of losing control.'
    },
    '666': {
      coreMeaning: 'Material Recalibration. An invitation to shift focus from external gain to internal integrity.',
      lifeArea: 'Values / Finances',
      guidance: 'Re-center your thoughts on service rather than lack.',
      shadow: 'Materialism or fear-based attachment to outcomes.'
    },
    '777': {
      coreMeaning: 'Divine Synchrony. You are walking in total resonance with your soul\'s blueprint.',
      lifeArea: 'Luck / Spirituality',
      guidance: 'Acknowledge your progress. You are exactly where you need to be.',
      shadow: 'Spiritual bypassing or self-righteousness.'
    },
    '888': {
      coreMeaning: 'Infinite Flux. The harvest of past efforts is returning to you in the form of abundance.',
      lifeArea: 'Abundance / Karma',
      guidance: 'Prepare to receive. Ensure your \'containers\' are ready for the flow.',
      shadow: 'Greed or fear of future scarcity.'
    },
    '999': {
      coreMeaning: 'The Great Closing. A cycle is reaching its natural entropy to make room for the new.',
      lifeArea: 'Completion / Finality',
      guidance: 'Let go of the old \'skin.\' The next chapter cannot begin until this one is closed.',
      shadow: 'Grief-based clinging to a dead past.'
    }
  };

  // Check specific repeating patterns first
  const base = numStr[0];
  const allSame = numStr.split('').every(c => c === base);
  if (allSame && repeatingMap[numStr]) {
    return repeatingMap[numStr];
  }

  // 2. SEQUENCES
  if ('123456789'.includes(numStr)) {
    return {
      coreMeaning: 'Step-by-Step Ascension. This marks a period of orderly progress and systemic growth.',
      lifeArea: 'Path / Progression',
      guidance: 'Keep moving. Each step is necessary for the integrity of the whole.',
      shadow: 'Impatience to reach the end without doing the work.'
    };
  }

  // 3. MIRROR NUMBERS (e.g., 1221)
  const isMirror = numStr.length >= 4 && numStr === numStr.split('').reverse().join('');
  if (isMirror) {
    return {
      coreMeaning: 'The Hall of Mirrors. Your external reality is perfectly reflecting a specific internal state.',
      lifeArea: 'Self-Reflection / Introspection',
      guidance: 'Look at what is bothering or exciting you in others; it is a direct message about yourself.',
      shadow: 'Narcissistic loop or inability to see outside the self.'
    };
  }

  // 4. COMMON PAIRINGS (1010, 1111, 1212)
  const pairings: Record<string, NumericArchetype> = {
    '1010': { coreMeaning: 'Binary Awakening. The movement from zero (potential) to one (action).', lifeArea: 'Momentum', guidance: 'Take the first step.', shadow: 'Hesitation.' },
    '1111': { coreMeaning: 'The Master Manifestor. A profound alignment of thought and reality.', lifeArea: 'Manifestation', guidance: 'Focus your intent now.', shadow: 'Manifesting fear.' },
    '1212': { coreMeaning: 'The Threshold of Faith. Stepping out of your comfort zone into a higher frequency.', lifeArea: 'Growth', guidance: 'Trust the unknown.', shadow: 'Safe-bet stagnation.' },
    '1313': { coreMeaning: 'Lunar Transformation. Embracing the mystery and the cycles of death/rebirth.', lifeArea: 'Subconscious', guidance: 'Honor your intuition.', shadow: 'Fear of darkness.' }
  };
  if (pairings[numStr]) {
    return pairings[numStr];
  }

  // 5. GENERIC NUMEROLOGY (Reduction)
  const sum = numStr.split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  const reduced = sum > 9 ? (sum % 9 || 9) : sum;

  const digitMeanings: Record<number, NumericArchetype> = {
    1: { coreMeaning: 'Primal Initiation. The drive toward selfhood and independent action.', lifeArea: 'Leadership', guidance: 'Initiate now.', shadow: 'Aggression.' },
    2: { coreMeaning: 'Harmonious Union. The power of receptivity and partnership.', lifeArea: 'Cooperation', guidance: 'Seek balance.', shadow: 'Passivity.' },
    3: { coreMeaning: 'Creative Proliferation. The expansion of ideas through expression.', lifeArea: 'Joy', guidance: 'Create freely.', shadow: 'Superficiality.' },
    4: { coreMeaning: 'Stable Foundation. Building enduring structures through labor.', lifeArea: 'Stability', guidance: 'Stay grounded.', shadow: 'Rigidity.' },
    5: { coreMeaning: 'Kinetic Freedom. The necessity of change and sensory experience.', lifeArea: 'Adventure', guidance: 'Adapt quickly.', shadow: 'Recklessness.' },
    6: { coreMeaning: 'Social Nurture. The responsibility of home and service.', lifeArea: 'Community', guidance: 'Heal others.', shadow: 'Intrusiveness.' },
    7: { coreMeaning: 'Mystical Analysis. The pursuit of truth through solitude.', lifeArea: 'Knowledge', guidance: 'Go inward.', shadow: 'Isolation.' },
    8: { coreMeaning: 'Karmic Balance. The mastery of the material through spiritual law.', lifeArea: 'Power', guidance: 'Manage wisely.', shadow: 'Greed.' },
    9: { coreMeaning: 'Global Humanitarianism. The closure of cycles for the collective good.', lifeArea: 'Wisdom', guidance: 'Forgive and release.', shadow: 'Idealism.' }
  };

  return {
    ...digitMeanings[reduced],
    coreMeaning: `Resonance ${reduced}: ${digitMeanings[reduced].coreMeaning}`
  };
};
