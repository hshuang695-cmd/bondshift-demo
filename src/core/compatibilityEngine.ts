// ─── 匹配度计算引擎 (纯函数，零副作用) ───
// 职责: 用户人格 ↔ 模板男友匹配打分 → 排序推荐 → 最佳匹配

import type { BoyfriendProfile, BoyfriendTypeId } from '../types';
import type { BoyfriendPersonality } from './personalityEngine';
import { boyfriends } from '../data';

// ─── 各男友类型 → 期望人格中心点 ───
const TYPE_CENTERS: Record<BoyfriendTypeId, BoyfriendPersonality> = {
  puppy:     { dominance: 35, emotionalStability: 40, communicationStyle: 82, attachmentStyle: 58 },
  gentleman: { dominance: 65, emotionalStability: 88, communicationStyle: 35, attachmentStyle: 28 },
  artist:    { dominance: 25, emotionalStability: 38, communicationStyle: 22, attachmentStyle: 62 },
  ceo:       { dominance: 92, emotionalStability: 82, communicationStyle: 45, attachmentStyle: 30 },
  childhood: { dominance: 48, emotionalStability: 72, communicationStyle: 45, attachmentStyle: 48 },
  senior:    { dominance: 70, emotionalStability: 85, communicationStyle: 18, attachmentStyle: 20 },
};

const DIMS: (keyof BoyfriendPersonality)[] = [
  'dominance', 'emotionalStability', 'communicationStyle', 'attachmentStyle',
];

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

// ─── 公开 API ───

/** 计算用户人格与某个模板男友的匹配度 (0-100) */
export function computeCompatibility(
  personality: BoyfriendPersonality,
  boyfriend: BoyfriendProfile,
): number {
  const center = TYPE_CENTERS[boyfriend.typeId];
  if (!center) return 50;

  const avgDiff = DIMS.reduce((sum, d) => sum + Math.abs(personality[d] - center[d]), 0) / DIMS.length;
  return clamp(100 - avgDiff * 2);
}

/** 按匹配度降序排列所有模板男友 */
export function rankBoyfriends(
  personality: BoyfriendPersonality,
): (BoyfriendProfile & { matchScore: number })[] {
  return boyfriends
    .map((bf) => ({ ...bf, matchScore: computeCompatibility(personality, bf) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/** 找出最佳匹配模板 (返回boyfriends中的引用) */
export function findBestMatch(personality: BoyfriendPersonality): BoyfriendProfile {
  return rankBoyfriends(personality)[0];
}

/** 获取某类型的期望人格中心 (供外部调试/展示) */
export function getTypeCenter(typeId: BoyfriendTypeId): BoyfriendPersonality | undefined {
  return TYPE_CENTERS[typeId];
}
