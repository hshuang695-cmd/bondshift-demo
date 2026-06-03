// ─── 关系进化引擎 (纯函数，零副作用) ───
// 职责: 交互历史 → 关系等级 / 成长曲线 / 互动统计 / 周报数据

import type { RelationshipScore, EmotionalDataPoint, InteractionStats, WeeklyStat } from '../types';
import type { BoyfriendPersonality } from './personalityEngine';

// ─── 交互记录类型 (与store中一致) ───
export interface InteractionRecord {
  id: string;
  type: 'page_view' | 'swap_in' | 'swap_out' | 'vr_session' | 'voice_call' | 'chat';
  boyfriendId: string;
  timestamp: number;
  detail?: string;
}

// ─── 去重 ───

/** 检查是否与最近记录重复 (同type+同bfId在windowMs内) */
export function isDuplicate(
  record: InteractionRecord,
  history: InteractionRecord[],
  windowMs = 2000,
): boolean {
  return history.some(
    (r) =>
      r.type === record.type &&
      r.boyfriendId === record.boyfriendId &&
      Math.abs(r.timestamp - record.timestamp) < windowMs,
  );
}

// ─── 等级 ───

/** 根据交互历史计算关系等级 (1-10) */
export function deriveLevel(history: InteractionRecord[]): number {
  return Math.min(10, 1 + Math.floor(history.length / 5));
}

// ─── 综合评分 ───

export function deriveRelationshipScore(params: {
  personality: BoyfriendPersonality | null;
  level: number;
  historyLength: number;
  swapCount: number;
}): RelationshipScore {
  const { personality, level, historyLength, swapCount } = params;

  const personalityBonus = personality
    ? 100 - Math.abs(personality.dominance - 50) / 2 - Math.abs(personality.attachmentStyle - 50) / 2
    : 50;
  const overall = Math.min(99, Math.round(level * 7 + personalityBonus * 0.2));

  const rank =
    level >= 8 ? '灵魂伴侣' :
    level >= 5 ? '热恋中人' :
    level >= 3 ? '感情升温中' : '初识阶段';

  const summary = personality
    ? `你的专属 AI 男友人格已生成。关系等级 Lv.${level}，已进行 ${swapCount} 次换乘探索。`
    : '前往「偏好设置」生成你的专属 AI 男友。';

  return {
    overall,
    communication:  Math.round(40 + (personality?.communicationStyle ?? 50) * 0.4 + level * 2),
    emotionalBond:  Math.round(30 + (personality ? 100 - Math.abs(personality.attachmentStyle - 50) : 50) * 0.4 + level * 3),
    growth:         Math.round(20 + level * 6 + historyLength * 0.5),
    fun:            Math.round(50 + (personality?.communicationStyle ?? 50) * 0.3 + swapCount * 2),
    rank,
    summary,
  };
}

// ─── 情感成长曲线 ───

const WEEK_MS = 7 * 24 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;

export function deriveEmotionalGrowth(
  history: InteractionRecord[],
  weeks = 4,
): EmotionalDataPoint[] {
  const now = Date.now();

  return Array.from({ length: weeks }, (_, i) => {
    const weekStart = now - (weeks - i) * WEEK_MS;
    const count = history.filter(
      (r) => r.timestamp >= weekStart && r.timestamp < weekStart + WEEK_MS,
    ).length;
    const base = 20 + i * 10;
    const bonus = count * 2;

    return {
      date: `第${i + 1}周`,
      intimacy:       Math.min(100, base + bonus),
      understanding:  Math.min(100, base + bonus + 5),
      compatibility:  Math.min(100, base + bonus - 5),
      satisfaction:   Math.min(100, base + bonus + 10),
    };
  });
}

// ─── 互动统计 ───

export function deriveInteractionStats(
  history: InteractionRecord[],
  swapCount: number,
  level: number,
): InteractionStats {
  return {
    totalSessions:   history.length,
    totalDuration:   history.length * 15 + swapCount * 30,
    totalMessages:   history.length * 3 + level * 10,
    voiceCallCount:  history.filter((r) => r.type === 'voice_call').length,
    vrSessionCount:  history.filter((r) => r.type === 'vr_session').length,
  };
}

// ─── 周报 ───

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export function deriveWeeklyStats(history: InteractionRecord[]): WeeklyStat[] {
  const now = Date.now();

  return WEEKDAY_LABELS.map((label, i) => {
    const dayStart = now - (6 - i) * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const count = history.filter(
      (r) => r.timestamp >= dayStart && r.timestamp < dayEnd,
    ).length;
    const sessions = count;

    return {
      week: label,
      sessions,
      duration: sessions * 15,
      messages: sessions * 3,
    };
  });
}

// ─── 全量派生 (一键) ───

export interface DerivedReport {
  relationshipScore: RelationshipScore;
  emotionalGrowth: EmotionalDataPoint[];
  interactionStats: InteractionStats;
  weeklyStats: WeeklyStat[];
}

export function deriveFullReport(params: {
  personality: BoyfriendPersonality | null;
  interactionHistory: InteractionRecord[];
  swapCount: number;
}): DerivedReport {
  const { personality, interactionHistory, swapCount } = params;
  const level = deriveLevel(interactionHistory);

  return {
    relationshipScore: deriveRelationshipScore({
      personality,
      level,
      historyLength: interactionHistory.length,
      swapCount,
    }),
    emotionalGrowth: deriveEmotionalGrowth(interactionHistory),
    interactionStats: deriveInteractionStats(interactionHistory, swapCount, level),
    weeklyStats: deriveWeeklyStats(interactionHistory),
  };
}
