import { create } from 'zustand';
import type { ChartRange, RelationshipScore, EmotionalDataPoint, InteractionStats, WeeklyStat } from '../types';

interface ReportState {
  timeRange: ChartRange;
  setTimeRange: (r: ChartRange) => void;

  relationshipScore: RelationshipScore | null;
  emotionalGrowth: EmotionalDataPoint[];
  interactionStats: InteractionStats | null;
  weeklyStats: WeeklyStat[];

  lastRecalcTime: number;
  isLoading: boolean;
}

export const useReportStore = create<ReportState>((set) => ({
  timeRange: 'month',
  setTimeRange: (r) => set({ timeRange: r }),

  relationshipScore: null,
  emotionalGrowth: [],
  interactionStats: null,
  weeklyStats: [],

  lastRecalcTime: 0,
  isLoading: false,
}));
