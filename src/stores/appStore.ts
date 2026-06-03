import { create } from 'zustand';
import type { AppTab } from '../types';

interface AppState {
  activeTab: AppTab;
  previousTab: AppTab | null;
  setActiveTab: (tab: AppTab) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  previousTab: null,
  setActiveTab: (tab) =>
    set((state) => ({ previousTab: state.activeTab, activeTab: tab })),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
