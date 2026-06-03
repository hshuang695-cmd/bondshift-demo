import { create } from 'zustand';
import type { VRState, VRMode } from '../types';
import { boyfriends } from '../data';

interface VRStore extends VRState {
  activate: (boyfriendId: string) => void;
  deactivate: () => void;
  setMode: (mode: VRMode) => void;
  toggleBgm: () => void;
  toggleSpatialAudio: () => void;
  setQuality: (q: 'low' | 'medium' | 'high') => void;
}

export const useVRStore = create<VRStore>((set) => ({
  isActive: false,
  currentScene: null,
  boyfriend: null,
  mode: 'idle',
  boyfriendPosition: { x: 0.5, y: 0.5, scale: 1 },
  bgmPlaying: false,
  spatialAudioEnabled: true,
  fps: 60,
  quality: 'high',

  activate: (boyfriendId) => {
    const bf = boyfriends.find((b) => b.id === boyfriendId);
    if (!bf) return;
    set({
      isActive: true,
      boyfriend: bf,
      currentScene: {
        id: `vr_${bf.typeId}`,
        name: `${bf.name}的场景`,
        backgroundType: 'gradient',
        backgroundUrl: bf.vrScene.background,
        ambientLightColor: bf.vrScene.ambientColor,
        particlesType: bf.vrScene.particles,
        particleColor: bf.vrScene.ambientColor,
        particleDensity: 50,
        bgmUrl: bf.vrScene.bgmUrl,
        bgmVolume: 0.5,
      },
      mode: 'idle',
      bgmPlaying: true,
    });
  },

  deactivate: () => set({ isActive: false, currentScene: null, boyfriend: null, mode: 'idle' }),

  setMode: (mode) => set({ mode }),

  toggleBgm: () => set((state) => ({ bgmPlaying: !state.bgmPlaying })),

  toggleSpatialAudio: () => set((state) => ({ spatialAudioEnabled: !state.spatialAudioEnabled })),

  setQuality: (q) => set({ quality: q }),
}));
