import { create } from 'zustand';
import type { SwapRecord, BoyfriendProfile } from '../types';
import { boyfriends } from '../data';

interface SwapState {
  recommendations: BoyfriendProfile[];
  swapHistory: SwapRecord[];
  recentThree: SwapRecord[];
  totalSwapCount: number;

  filterType: string | null;
  setFilterType: (t: string | null) => void;

  // 纯状态写入 (协调逻辑在 bondshiftEngine)
  addSwapRecord: (record: SwapRecord, toId: string) => void;
}

export const useSwapStore = create<SwapState>((set) => ({
  recommendations: boyfriends.filter((b) => b.id !== 'bf_puppy_001'),
  swapHistory: [],
  recentThree: [],
  totalSwapCount: 0,

  filterType: null,
  setFilterType: (t) => set({ filterType: t }),

  addSwapRecord: (record, toId) => {
    set((state) => {
      const newHistory = [record, ...state.swapHistory];
      return {
        swapHistory: newHistory,
        recentThree: newHistory.slice(0, 3),
        totalSwapCount: state.totalSwapCount + 1,
        recommendations: state.recommendations.filter((b) => b.id !== toId),
      };
    });
  },
}));
