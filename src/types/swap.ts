import type { BoyfriendTypeId, TraitKey, VoiceType } from './boyfriend';

export type { SwapReason } from './boyfriend';

export interface SwapRecord {
  id: string;
  fromBoyfriend: {
    id: string;
    name: string;
    avatar: string;
    typeId: BoyfriendTypeId;
  };
  toBoyfriend: {
    id: string;
    name: string;
    avatar: string;
    typeId: BoyfriendTypeId;
  };
  reason: string;
  timestamp: number;
  duration: number;
  rating: number;
  highlightLine: string;
}

export interface RecommendationScore {
  boyfriendId: string;
  totalScore: number;
  breakdown: {
    mbtiMatch: number;
    traitMatch: number;
    appearanceMatch: number;
    voiceMatch: number;
    popularity: number;
    novelty: number;
  };
  reason: string;
}

export interface UserPreferenceProfile {
  preferredMbti: string[];
  traitWeights: Record<TraitKey, number>;
  appearancePreference: {
    style: string;
    hairColor: string;
    eyeColor: string;
    height: 'short' | 'average' | 'tall';
    build: 'slim' | 'athletic' | 'average';
  };
  preferredVoiceTypes: VoiceType[];
  swapHistory: SwapRecord[];
  chatDurations: Record<string, number>;
  ratedBoyfriends: Record<string, number>;
}
