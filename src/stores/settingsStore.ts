import { create } from 'zustand';
import type { UserProfile } from '../types';

interface SettingsState {
  userProfile: UserProfile | null;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  privacyMode: boolean;
  language: 'zh-CN' | 'en-US';
  cacheSize: string;

  toggleNotification: () => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  togglePrivacy: () => void;
  setLanguage: (l: 'zh-CN' | 'en-US') => void;
  clearCache: () => void;
  logout: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  userProfile: {
    id: 'user_001',
    nickname: '小星星',
    avatar: '',
    level: 12,
    experience: 3420,
    joinDate: '2026-01-15',
    mbtiPreference: ['ENFP', 'INFJ', 'INTJ'],
    totalSwaps: 3,
    totalUnlocked: 3,
  },
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  privacyMode: false,
  language: 'zh-CN',
  cacheSize: '128 MB',

  toggleNotification: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
  togglePrivacy: () => set((s) => ({ privacyMode: !s.privacyMode })),
  setLanguage: (l) => set({ language: l }),
  clearCache: () => set({ cacheSize: '0 MB' }),
  logout: () => set({ userProfile: null }),
}));
