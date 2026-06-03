import { create } from 'zustand';
import type { BoyfriendProfile } from '../types';
import type { BoyfriendPersonality } from '../core/personalityEngine';
import type { InteractionRecord } from '../core/evolutionEngine';
import type { RelationshipScores } from '../core/relationshipEngine';
import { createRelationshipScores } from '../core/relationshipEngine';
import { boyfriends } from '../data';

interface BoyfriendState {
  currentBoyfriend: BoyfriendProfile | null;
  availableBoyfriends: BoyfriendProfile[];
  unlockedIds: string[];
  personality: BoyfriendPersonality | null;
  relationshipLevel: number;
  interactionHistory: InteractionRecord[];
  relationshipScores: RelationshipScores;
  isLoading: boolean;

  // 简单操作 (不涉及其他 store)
  setCurrent: (bf: BoyfriendProfile | null) => void;
  fetchAll: () => void;
  unlock: (id: string) => void;
  reset: () => void;
}

export const useBoyfriendStore = create<BoyfriendState>((set) => ({
  currentBoyfriend: boyfriends.find((b) => b.id === 'bf_puppy_001') ?? null,
  availableBoyfriends: boyfriends,
  unlockedIds: boyfriends.filter((b) => b.isUnlocked).map((b) => b.id),
  personality: null,
  relationshipLevel: 1,
  interactionHistory: [],
  relationshipScores: createRelationshipScores(),
  isLoading: false,

  setCurrent: (bf) => set({ currentBoyfriend: bf }),

  fetchAll: () => {
    set({ isLoading: true });
    setTimeout(() => set({ availableBoyfriends: boyfriends, isLoading: false }), 300);
  },

  unlock: (id) => {
    set((state) => ({
      unlockedIds: state.unlockedIds.includes(id)
        ? state.unlockedIds
        : [...state.unlockedIds, id],
    }));
  },

  reset: () =>
    set({
      personality: null,
      relationshipLevel: 1,
      interactionHistory: [],
      relationshipScores: createRelationshipScores(),
    }),
}));
