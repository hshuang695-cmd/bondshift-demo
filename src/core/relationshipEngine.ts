// ─── 长期关系进化引擎 (纯函数，零副作用) ───
// 职责: 信任/亲密/稳定三维评分、关系阶段分类、进化规则
// 让系统从"聊天AI"升级为"可持续演化的关系模拟系统"

import type { InteractionRecord } from './evolutionEngine';
import type { UserMemory } from './memoryEngine';

// ══════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════

export type RelationshipStage = 'stranger' | 'familiar' | 'close' | 'intimate' | 'deep_bond';

export interface RelationshipScores {
  trust: number;
  intimacy: number;
  stability: number;
  overall: number;
  stage: RelationshipStage;
}

export interface StageConfig {
  stage: RelationshipStage;
  label: string;
  emoji: string;
  description: string;
  toneModifier: 'formal' | 'polite' | 'warm' | 'affectionate' | 'deeply_bonded';
  unlockHint: string;
}

// ══════════════════════════════════════════════
// 阶段配置映射
// ══════════════════════════════════════════════

const STAGE_CONFIGS: Record<RelationshipStage, Omit<StageConfig, 'stage'>> = {
  stranger: {
    label: '初识阶段',
    emoji: '👋',
    description: '你们刚刚认识，还在互相了解的阶段',
    toneModifier: 'formal',
    unlockHint: '多聊聊天，让对方了解你',
  },
  familiar: {
    label: '熟悉阶段',
    emoji: '🌱',
    description: '开始熟悉彼此的习惯和性格',
    toneModifier: 'polite',
    unlockHint: '分享更多日常，增进了解',
  },
  close: {
    label: '亲近阶段',
    emoji: '💛',
    description: '关系逐渐升温，信任正在建立',
    toneModifier: 'warm',
    unlockHint: '保持互动频率，分享真实感受',
  },
  intimate: {
    label: '亲密阶段',
    emoji: '💕',
    description: '心与心的距离很近，彼此依赖',
    toneModifier: 'affectionate',
    unlockHint: '继续用心经营，探索更深连接',
  },
  deep_bond: {
    label: '深度羁绊',
    emoji: '💝',
    description: '灵魂级别的连接，无可替代的存在',
    toneModifier: 'deeply_bonded',
    unlockHint: '你已经找到了属于你的那个人',
  },
};

// ══════════════════════════════════════════════
// 初始值
// ══════════════════════════════════════════════

export function createRelationshipScores(): RelationshipScores {
  return {
    trust: 15,
    intimacy: 5,
    stability: 40,
    overall: 0,
    stage: 'stranger',
  };
}

// ══════════════════════════════════════════════
// 核心计算
// ══════════════════════════════════════════════

/** 根据交互历史计算关系三维分数 */
export function calculateRelationshipScores(
  history: InteractionRecord[],
  swapCount: number,
  memory?: UserMemory,
): RelationshipScores {
  if (history.length === 0) return createRelationshipScores();

  // 按时间排序(旧→新)用于渐进计算
  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);

  let trust = 15;
  let intimacy = 5;
  let stability = 40;

  // 按天分组，检测连续互动
  const DAY_MS = 24 * 3600 * 1000;
  const daysWithInteraction = new Set<string>();
  let lastInteractionDay = '';

  for (const record of sorted) {
    const day = new Date(record.timestamp).toISOString().slice(0, 10);
    daysWithInteraction.add(day);

    switch (record.type) {
      case 'chat': {
        intimacy += 2 + Math.random() * 1.5;
        trust += 0.8 + Math.random() * 0.8;

        const detail = record.detail ?? '';
        if (/正面|积极|开心/.test(detail)) {
          intimacy += 1.5;
          trust += 0.8;
          stability += 0.5;
        } else if (/负面|消极|难过/.test(detail)) {
          intimacy -= 0.5;
          stability -= 1.5;
        }
        break;
      }
      case 'voice_call': {
        intimacy += 3;
        trust += 1.5;
        stability += 1;
        break;
      }
      case 'vr_session': {
        intimacy += 4;
        trust += 2;
        stability += 1.5;
        break;
      }
      case 'swap_in': {
        stability -= 12 + swapCount * 2;
        intimacy -= 8;
        trust = Math.max(5, trust * 0.6);
        break;
      }
      case 'swap_out': {
        stability -= 8;
        break;
      }
      case 'page_view': {
        stability += 0.2;
        break;
      }
    }

    // 连续互动奖励
    if (lastInteractionDay && day !== lastInteractionDay) {
      const prevDate = new Date(lastInteractionDay);
      const currDate = new Date(day);
      const dayDiff = Math.round((currDate.getTime() - prevDate.getTime()) / DAY_MS);
      if (dayDiff <= 1) {
        stability += 0.5;
        trust += 0.3;
      } else if (dayDiff >= 3) {
        intimacy -= dayDiff * 0.3;
        stability -= dayDiff * 0.2;
      }
    }
    lastInteractionDay = day;
  }

  // swap 惩罚
  stability = Math.max(5, stability - swapCount * 3);
  intimacy = Math.max(3, intimacy - swapCount * 1.5);

  // 记忆加成
  if (memory) {
    if (memory.knownFacts.length > 3) {
      intimacy += 2;
      trust += 1;
    }
    if (memory.topTopics.length > 3) {
      intimacy += 1;
    }
    if (memory.dominantMood > 0.3) {
      stability += 2;
    } else if (memory.dominantMood < -0.3) {
      stability -= 1;
    }
  }

  // 约束到 0-100
  trust = Math.round(Math.max(0, Math.min(100, trust)));
  intimacy = Math.round(Math.max(0, Math.min(100, intimacy)));
  stability = Math.round(Math.max(0, Math.min(100, stability)));

  // 综合分: 信任30% + 亲密40% + 稳定30%
  const overall = Math.round(trust * 0.3 + intimacy * 0.4 + stability * 0.3);
  const stage = getStage(overall);

  return { trust, intimacy, stability, overall, stage };
}

/** 根据综合分判定关系阶段 */
export function getStage(overall: number): RelationshipStage {
  if (overall >= 81) return 'deep_bond';
  if (overall >= 61) return 'intimate';
  if (overall >= 41) return 'close';
  if (overall >= 21) return 'familiar';
  return 'stranger';
}

/** 获取阶段配置 */
export function getStageConfig(overall: number): StageConfig {
  const stage = getStage(overall);
  return { stage, ...STAGE_CONFIGS[stage] };
}

/** 获取阶段配置（直接传stage） */
export function getStageConfigByStage(stage: RelationshipStage): StageConfig {
  return { stage, ...STAGE_CONFIGS[stage] };
}

// ══════════════════════════════════════════════
// 单次事件进化 (增量更新)
// ══════════════════════════════════════════════

export interface RelationshipEvent {
  type: 'chat_positive' | 'chat_negative' | 'chat_neutral' | 'swap' | 'page_view' | 'voice_call' | 'vr_session';
  swapCount?: number;
}

/** 基于当前分数 + 单次事件 → 新分数 */
export function applyRelationshipEvent(
  current: RelationshipScores,
  event: RelationshipEvent,
): RelationshipScores {
  let { trust, intimacy, stability } = current;

  switch (event.type) {
    case 'chat_positive':
      intimacy += 3;
      trust += 1.5;
      stability += 1;
      break;
    case 'chat_negative':
      intimacy -= 1;
      stability -= 2;
      trust += 0.3;
      break;
    case 'chat_neutral':
      intimacy += 1.5;
      trust += 0.8;
      stability += 0.5;
      break;
    case 'swap':
      stability -= 15;
      intimacy -= 10;
      trust = Math.max(5, trust * 0.7);
      break;
    case 'voice_call':
      intimacy += 3;
      trust += 1.5;
      stability += 1;
      break;
    case 'vr_session':
      intimacy += 4;
      trust += 2;
      stability += 1.5;
      break;
    case 'page_view':
      stability += 0.3;
      break;
  }

  trust = Math.round(Math.max(0, Math.min(100, trust)));
  intimacy = Math.round(Math.max(0, Math.min(100, intimacy)));
  stability = Math.round(Math.max(0, Math.min(100, stability)));

  const overall = Math.round(trust * 0.3 + intimacy * 0.4 + stability * 0.3);
  const stage = getStage(overall);

  return { trust, intimacy, stability, overall, stage };
}

// ══════════════════════════════════════════════
// 关系趋势数据 (供报告页图表)
// ══════════════════════════════════════════════

export interface RelationshipTrendPoint {
  date: string;
  trust: number;
  intimacy: number;
  stability: number;
}

/** 根据交互历史生成关系趋势曲线 */
export function deriveRelationshipTrend(
  history: InteractionRecord[],
  swapCount: number,
  points = 7,
): RelationshipTrendPoint[] {
  if (history.length === 0) return [];

  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const now = Date.now();
  const DAY_MS = 24 * 3600 * 1000;

  return Array.from({ length: points }, (_, i) => {
    const cutoff = now - (points - i) * DAY_MS;
    const slice = sorted.filter((r) => r.timestamp <= cutoff);
    const scores = calculateRelationshipScores(slice, swapCount);
    const d = new Date(cutoff);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      trust: scores.trust,
      intimacy: scores.intimacy,
      stability: scores.stability,
    };
  });
}

/** 关系摘要文本 */
export function getRelationshipSummary(scores: RelationshipScores): string {
  const cfg = STAGE_CONFIGS[scores.stage];

  const parts: string[] = [
    `${cfg.emoji} ${cfg.label}`,
    `信任 ${scores.trust} · 亲密 ${scores.intimacy} · 稳定 ${scores.stability}`,
  ];

  if (scores.stage === 'deep_bond') parts.push('你们已经建立了无可替代的连接');
  else if (scores.stage === 'intimate') parts.push('关系正在持续升温中');
  else if (scores.stage === 'close') parts.push('信任正在稳固建立');
  else parts.push(cfg.unlockHint);

  return parts.join(' | ');
}
