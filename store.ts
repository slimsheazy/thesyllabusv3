
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SyllabusState {
  calculationsRun: number;
  lastAccess: string;
  isEclipseMode: boolean;
  isCalibrated: boolean;
  userLocation: { lat: number; lng: number; name?: string } | null;
  userIdentity: string | null;
  userBirthday: string | null;
  userBirthTime: string | null;
  unlockedTerms: Record<string, { definition: string, etymology?: string, discoveredAt: string }>;
  recordCalculation: () => void;
  updateLastAccess: () => void;
  toggleEclipseMode: () => void;
  setUserLocation: (loc: { lat: number; lng: number; name?: string }) => void;
  setUserIdentity: (id: string) => void;
  setUserBirthday: (dob: string) => void;
  setUserBirthTime: (time: string) => void;
  unlockTerm: (word: string, definition: string, etymology?: string) => void;
}

export const useSyllabusStore = create<SyllabusState>()(
  persist(
    (set, get) => ({
      calculationsRun: 0,
      lastAccess: new Date().toISOString(),
      isEclipseMode: false,
      isCalibrated: false,
      userLocation: null,
      userIdentity: null,
      userBirthday: null,
      userBirthTime: '12:00',
      unlockedTerms: {},
      recordCalculation: () => set((state) => ({
        calculationsRun: state.calculationsRun + 1
      })),
      updateLastAccess: () => set({ lastAccess: new Date().toISOString() }),
      toggleEclipseMode: () => set((state) => ({ isEclipseMode: !state.isEclipseMode })),
      setUserLocation: (loc) => {
        set({ userLocation: loc });
        const { userIdentity, userBirthday } = get();
        if (userIdentity && userBirthday && loc) {
          set({ isCalibrated: true });
        }
      },
      setUserIdentity: (id) => {
        set({ userIdentity: id });
        const { userBirthday, userLocation } = get();
        if (id && userBirthday && userLocation) {
          set({ isCalibrated: true });
        }
      },
      setUserBirthday: (dob) => {
        set({ userBirthday: dob });
        const { userIdentity, userLocation } = get();
        if (userIdentity && dob && userLocation) {
          set({ isCalibrated: true });
        }
      },
      setUserBirthTime: (time) => set({ userBirthTime: time }),
      unlockTerm: (word, definition, etymology) => set((state) => {
        if (state.unlockedTerms[word]) {
          return state;
        }
        return {
          unlockedTerms: {
            ...state.unlockedTerms,
            [word]: { definition, etymology, discoveredAt: new Date().toISOString() }
          }
        };
      })
    }),
    {
      name: 'the-syllabus-state'
    }
  )
);
