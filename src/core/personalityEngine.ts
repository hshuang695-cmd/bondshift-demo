// ─── 人格计算引擎 (纯函数，零副作用) ───
// 职责: MBTI选择 + Trait滑块 + 风格偏好 → 4维人格 → 属性合成 → 文本描述

import type { MbtiType, TraitKey } from '../types';

// ─── 核心 4 维度性格模型 ───
export interface BoyfriendPersonality {
  dominance: number;          // 支配性 (0=顺从 100=掌控)
  emotionalStability: number; // 情绪稳定性 (0=敏感波动 100=稳定理性)
  communicationStyle: number; // 沟通风格 (0=含蓄内敛 100=外向直接)
  attachmentStyle: number;    // 依恋风格 (0=回避型 50=安全型 100=焦虑型)
}

// ─── MBTI → 4维度基础映射 (大五人格+MBTI对照) ───
const MBTI_PERSONALITY_MAP: Record<MbtiType, BoyfriendPersonality> = {
  INTJ: { dominance: 82, emotionalStability: 88, communicationStyle: 18, attachmentStyle: 22 },
  INTP: { dominance: 45, emotionalStability: 72, communicationStyle: 15, attachmentStyle: 28 },
  ENTJ: { dominance: 95, emotionalStability: 85, communicationStyle: 72, attachmentStyle: 35 },
  ENTP: { dominance: 68, emotionalStability: 62, communicationStyle: 80, attachmentStyle: 42 },
  INFJ: { dominance: 38, emotionalStability: 55, communicationStyle: 25, attachmentStyle: 55 },
  INFP: { dominance: 22, emotionalStability: 40, communicationStyle: 18, attachmentStyle: 58 },
  ENFJ: { dominance: 58, emotionalStability: 52, communicationStyle: 68, attachmentStyle: 48 },
  ENFP: { dominance: 42, emotionalStability: 45, communicationStyle: 82, attachmentStyle: 52 },
  ISTJ: { dominance: 72, emotionalStability: 90, communicationStyle: 30, attachmentStyle: 32 },
  ISFJ: { dominance: 48, emotionalStability: 78, communicationStyle: 28, attachmentStyle: 45 },
  ESTJ: { dominance: 88, emotionalStability: 82, communicationStyle: 55, attachmentStyle: 28 },
  ESFJ: { dominance: 55, emotionalStability: 65, communicationStyle: 62, attachmentStyle: 50 },
  ISTP: { dominance: 52, emotionalStability: 75, communicationStyle: 22, attachmentStyle: 18 },
  ISFP: { dominance: 28, emotionalStability: 48, communicationStyle: 20, attachmentStyle: 60 },
  ESTP: { dominance: 75, emotionalStability: 58, communicationStyle: 75, attachmentStyle: 25 },
  ESFP: { dominance: 48, emotionalStability: 42, communicationStyle: 85, attachmentStyle: 42 },
};

// ─── 风格 → 人格修正系数 ───
const STYLE_MODIFIERS: Record<string, Partial<BoyfriendPersonality>> = {
  '少年感': { dominance: -10, emotionalStability: -5, communicationStyle: +15, attachmentStyle: +10 },
  '成熟':   { dominance: +10, emotionalStability: +12, communicationStyle: -5, attachmentStyle: -15 },
  '艺术':   { dominance: -15, emotionalStability: -10, communicationStyle: -8, attachmentStyle: +8 },
  '精英':   { dominance: +15, emotionalStability: +8, communicationStyle: +5, attachmentStyle: -10 },
  '运动':   { dominance: +5, emotionalStability: +5, communicationStyle: +10, attachmentStyle: +5 },
  '学霸':   { dominance: +5, emotionalStability: +10, communicationStyle: -10, attachmentStyle: -5 },
};

// ─── TraitKey → 人格维度映射 (weight = 滑块偏离中性50时对维度的影响幅度) ───
const TRAIT_MAPPING: Record<TraitKey, { dimension: keyof BoyfriendPersonality; weight: number }> = {
  humor:        { dimension: 'communicationStyle', weight: 0.15 },
  romance:      { dimension: 'attachmentStyle',    weight: 0.15 },
  intelligence: { dimension: 'emotionalStability', weight: 0.10 },
  gentleness:   { dimension: 'attachmentStyle',    weight: 0.10 },
  adventurous:  { dimension: 'dominance',           weight: 0.10 },
  maturity:     { dimension: 'emotionalStability',  weight: 0.10 },
};

// ─── 工具 ───
function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function avgPersonality(list: BoyfriendPersonality[]): BoyfriendPersonality {
  const n = list.length || 1;
  return {
    dominance:          clamp(list.reduce((s, p) => s + p.dominance, 0) / n),
    emotionalStability: clamp(list.reduce((s, p) => s + p.emotionalStability, 0) / n),
    communicationStyle: clamp(list.reduce((s, p) => s + p.communicationStyle, 0) / n),
    attachmentStyle:    clamp(list.reduce((s, p) => s + p.attachmentStyle, 0) / n),
  };
}

// ─── 公开 API ───

/** 主计算: MBTI + 滑块 + 风格 → 最终4维人格 */
export function computePersonality(params: {
  mbtiSelections: MbtiType[];
  traits: Record<TraitKey, number>;
  preferredStyle: string;
}): BoyfriendPersonality {
  const { mbtiSelections, traits, preferredStyle } = params;

  // 1) MBTI基向量 (无选择时默认ENFP)
  const bases = mbtiSelections.length > 0
    ? mbtiSelections.map((m) => MBTI_PERSONALITY_MAP[m])
    : [MBTI_PERSONALITY_MAP['ENFP']];
  const p = avgPersonality(bases);

  // 2) Trait滑块修正 (滑块值-50为偏离中性量, *weight)
  for (const [key, val] of Object.entries(traits) as [TraitKey, number][]) {
    const map = TRAIT_MAPPING[key];
    if (!map) continue;
    p[map.dimension] = clamp(p[map.dimension] + (val - 50) * map.weight);
  }

  // 3) 风格修正
  const mod = STYLE_MODIFIERS[preferredStyle];
  if (mod) {
    for (const dim of Object.keys(mod) as (keyof BoyfriendPersonality)[]) {
      p[dim] = clamp(p[dim] + (mod[dim] ?? 0));
    }
  }

  return p;
}

/** 从人格反推6个Trait属性值 */
export function synthesizeAttributes(p: BoyfriendPersonality): Record<TraitKey, number> {
  return {
    humor:        clamp(30 + p.communicationStyle * 0.5 + (100 - p.emotionalStability) * 0.2),
    romance:      clamp(20 + p.attachmentStyle * 0.5 + p.communicationStyle * 0.3),
    intelligence: clamp(50 + p.emotionalStability * 0.4),
    gentleness:   clamp(40 + (100 - p.dominance) * 0.4 + p.attachmentStyle * 0.2),
    adventurous:  clamp(25 + p.dominance * 0.3 + p.communicationStyle * 0.4),
    maturity:     clamp(30 + p.emotionalStability * 0.5 + (100 - p.attachmentStyle) * 0.2),
  };
}

/** 生成人格中文描述 */
export function describePersonality(p: BoyfriendPersonality): string {
  const parts: string[] = [];

  if (p.dominance >= 70)           parts.push('主导型人格，习惯掌控节奏');
  else if (p.dominance <= 30)      parts.push('顺从型人格，愿意倾听与跟随');
  else                             parts.push('平衡的自主性，懂得适时进退');

  if (p.emotionalStability >= 70)  parts.push('情绪稳定理性，泰山崩于前而色不变');
  else if (p.emotionalStability <= 30) parts.push('情感细腻丰富，容易受到氛围感染');
  else                             parts.push('感性与理性兼具，能共情也能冷静分析');

  if (p.communicationStyle >= 70)  parts.push('热情外向，善于表达与分享');
  else if (p.communicationStyle <= 30) parts.push('内敛含蓄，偏爱默默陪伴与行动表达');
  else                             parts.push('张弛有度，话不多但句句入心');

  if (p.attachmentStyle >= 60)     parts.push('依恋需求较高，渴望频繁的亲密互动');
  else if (p.attachmentStyle <= 30) parts.push('独立自持，需要较多个人空间');
  else                             parts.push('安全型依恋，不粘不腻恰到好处');

  return parts.join('。');
}
