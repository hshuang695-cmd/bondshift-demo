import { create } from 'zustand';
import type { MbtiType, TraitKey, ChatStyle } from '../types';

interface PreferenceState {
  step: 1 | 2 | 3;
  setStep: (s: 1 | 2 | 3) => void;

  selectedPersonalities: MbtiType[];
  togglePersonality: (type: MbtiType) => void;

  traits: Record<TraitKey, number>;
  setTrait: (key: TraitKey, value: number) => void;

  preferredStyle: string;
  setStyle: (s: string) => void;

  preferredHairColor: string;
  setHairColor: (c: string) => void;

  preferredEyeColor: string;
  setEyeColor: (c: string) => void;

  preferredHeight: 'short' | 'average' | 'tall';
  setHeight: (h: 'short' | 'average' | 'tall') => void;

  preferredBuild: 'slim' | 'athletic' | 'average';
  setBuild: (b: 'slim' | 'athletic' | 'average') => void;

  chatStyle: ChatStyle;
  setChatStyle: (s: ChatStyle) => void;

  resetAll: () => void;
}

const defaultTraits: Record<TraitKey, number> = {
  humor: 5, romance: 5, intelligence: 5,
  gentleness: 5, adventurous: 5, maturity: 5,
};

export const usePreferenceStore = create<PreferenceState>((set) => ({
  step: 1,
  setStep: (s) => set({ step: s }),

  selectedPersonalities: [],
  togglePersonality: (type) =>
    set((state) => ({
      selectedPersonalities: state.selectedPersonalities.includes(type)
        ? state.selectedPersonalities.filter((t) => t !== type)
        : [...state.selectedPersonalities, type],
    })),

  traits: { ...defaultTraits },
  setTrait: (key, value) =>
    set((state) => ({ traits: { ...state.traits, [key]: value } })),

  preferredStyle: '',
  setStyle: (s) => set({ preferredStyle: s }),

  preferredHairColor: '',
  setHairColor: (c) => set({ preferredHairColor: c }),

  preferredEyeColor: '',
  setEyeColor: (c) => set({ preferredEyeColor: c }),

  preferredHeight: 'average',
  setHeight: (h) => set({ preferredHeight: h }),

  preferredBuild: 'average',
  setBuild: (b) => set({ preferredBuild: b }),

  chatStyle: 'sweet',
  setChatStyle: (s) => set({ chatStyle: s }),

  resetAll: () =>
    set({
      step: 1,
      selectedPersonalities: [],
      traits: { ...defaultTraits },
      preferredStyle: '',
      preferredHairColor: '',
      preferredEyeColor: '',
      preferredHeight: 'average',
      preferredBuild: 'average',
      chatStyle: 'sweet',
    }),
}));
