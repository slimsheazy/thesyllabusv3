
import { useSyllabusStore } from '../store';
import { useMemo } from 'react';

export const useResonance = () => {
  const { userIdentity, userBirthday, userLocation } = useSyllabusStore();

  const isProfileComplete = useMemo(() => {
    return !!(userIdentity && userBirthday && userLocation);
  }, [userIdentity, userBirthday, userLocation]);

  const signature = useMemo(() => {
    if (!userIdentity) return "A curious student";
    const locStr = userLocation ? ` near ${userLocation.name || `${userLocation.lat.toFixed(2)}N, ${userLocation.lng.toFixed(2)}E`}` : "";
    const birthStr = userBirthday ? `, born on ${userBirthday}` : "";
    return `${userIdentity}${birthStr}${locStr}`;
  }, [userIdentity, userBirthday, userLocation]);

  // This string can be appended to any AI prompt to ground the "vibe"
  const resonancePrompt = useMemo(() => {
    if (!isProfileComplete) return "";
    return `\nRESONANCE CONTEXT: The user is ${signature}. Ensure the vibe of this result matches their personal frequency.`;
  }, [isProfileComplete, signature]);

  return {
    name: userIdentity,
    birthday: userBirthday,
    location: userLocation,
    isProfileComplete,
    signature,
    resonancePrompt
  };
};
