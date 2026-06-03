export interface RelationshipScore {
  overall: number;
  communication: number;
  emotionalBond: number;
  growth: number;
  fun: number;
  rank: string;
  summary: string;
}

export interface EmotionalDataPoint {
  date: string;
  intimacy: number;
  understanding: number;
  compatibility: number;
  satisfaction: number;
}

export interface InteractionStats {
  totalSessions: number;
  totalDuration: number;
  totalMessages: number;
  voiceCallCount: number;
  vrSessionCount: number;
}

export interface PersonalityMatchRecord {
  boyfriendId: string;
  boyfriendName: string;
  mbti: string;
  matchScore: number;
  startedAt: string;
  endedAt: string | null;
  highlightMoments: string[];
}

export interface WeeklyStat {
  week: string;
  sessions: number;
  duration: number;
  messages: number;
}

export interface RadarDataPoint {
  axis: string;
  value: number;
  maxValue: number;
}

export interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

export type ChartRange = 'week' | 'month' | 'year';
