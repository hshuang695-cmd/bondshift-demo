// ─── 产品指标引擎 ───
// 职责: 计算产品核心指标——DAU/留存率/关系健康度/换乘率
// 数据来源为 store 状态 + interaction history，纯函数计算，零副作用

import type { InteractionRecord } from './evolutionEngine';
import type { RelationshipScores, RelationshipStage } from './relationshipEngine';
import type { SwapRecord } from '../types';
import { isFeatureEnabled } from './releaseEngine';

// ══════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════

export interface ProductMetrics {
  // 用户健康度
  averageRelationshipScore: number;
  relationshipStageDistribution: Record<RelationshipStage, number>; // 百分比
  engagementHealthScore: number; // 0-100 综合健康分

  // 活跃度 (基于交互历史的模拟)
  dailyActiveUsers: number;       // 当天有交互的用户数 (模拟单用户=1)
  weeklyActiveUsers: number;
  interactionFrequency: number;   // 日均交互次数

  // 留存
  dailyRetentionRate: number;     // 模拟日留存率 (%)
  returningUserRate: number;      // 回访率

  // 换乘
  totalSwaps: number;
  swapRate: number;               // 每个用户的换乘次数
  mostSwappedToType: string;

  // 聊天
  totalMessagesExchanged: number;
  avgMessagesPerSession: number;
  chatSessionCount: number;

  // 趋势
  relationshipGrowthRate: number; // 关系增速 (%/天)
  streakRetentionCorrelation: number; // 连续签到与留存相关性 (0-1)
}

// ══════════════════════════════════════════════
// 主入口: 计算全部指标
// ══════════════════════════════════════════════

export interface MetricsInput {
  interactionHistory: InteractionRecord[];
  relationshipScores: RelationshipScores;
  swapHistory: SwapRecord[];
  totalSwapCount: number;
  memoryKnownFacts: number;
  currentStreak: number;
}

export function computeProductMetrics(input: MetricsInput): ProductMetrics {
  if (!isFeatureEnabled('metricsCollection')) {
    return getEmptyMetrics();
  }

  const {
    interactionHistory,
    relationshipScores,
    swapHistory,
    totalSwapCount,
    memoryKnownFacts,
    currentStreak,
  } = input;

  const now = Date.now();
  const DAY_MS = 24 * 3600 * 1000;

  // ── 活跃度 ──
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayInteractions = interactionHistory.filter((r) => r.timestamp >= todayStart);
  const dailyActiveUsers = todayInteractions.length > 0 ? 1 : 0;

  const weekAgo = now - 7 * DAY_MS;
  const weekInteractions = interactionHistory.filter((r) => r.timestamp >= weekAgo);
  const weeklyActiveUsers = weekInteractions.length > 0 ? 1 : 0;

  // 日均交互次数 (取最近7天)
  const historyDays = interactionHistory.length > 0
    ? Math.max(1, Math.ceil((now - interactionHistory[interactionHistory.length - 1].timestamp) / DAY_MS))
    : 1;
  const interactionFrequency = Math.round((interactionHistory.length / Math.min(historyDays, 30)) * 10) / 10;

  // ── 关系阶段分布 (单用户模拟=当前阶段100%) ──
  const stageDistribution: Record<RelationshipStage, number> = {
    stranger: 0, familiar: 0, close: 0, intimate: 0, deep_bond: 0,
  };
  stageDistribution[relationshipScores.stage] = 100;

  // ── 综合健康分 ──
  const engagementHealthScore = calculateEngagementHealth({
    relationshipScore: relationshipScores.overall,
    streak: currentStreak,
    interactionCount: interactionHistory.length,
    memoryFacts: memoryKnownFacts,
    swapCount: totalSwapCount,
  });

  // ── 留存率 ──
  const dailyRetentionRate = calculateRetentionRate(interactionHistory, 1);
  const returningUserRate = interactionHistory.length > 0 ? Math.min(100, 60 + currentStreak * 5) : 0;

  // ── 聊天指标 ──
  const chatInteractions = interactionHistory.filter((r) => r.type === 'chat');
  const totalMessagesExchanged = chatInteractions.length * 2; // 用户+AI各一条
  const chatDays = getUniqueDays(chatInteractions);
  const chatSessionCount = chatDays.length || 1;
  const avgMessagesPerSession = Math.round(totalMessagesExchanged / chatSessionCount);

  // ── 换乘指标 ──
  const swapRate = totalSwapCount;
  const mostSwappedToType = findMostSwappedType(swapHistory);

  // ── 关系增速 ──
  const relationshipGrowthRate = calculateGrowthRate(interactionHistory);

  // ── 签到-留存相关性 ──
  const streakRetentionCorrelation = Math.min(1, currentStreak * 0.15);

  return {
    averageRelationshipScore: relationshipScores.overall,
    relationshipStageDistribution: stageDistribution,
    engagementHealthScore,
    dailyActiveUsers,
    weeklyActiveUsers,
    interactionFrequency,
    dailyRetentionRate,
    returningUserRate,
    totalSwaps: totalSwapCount,
    swapRate,
    mostSwappedToType,
    totalMessagesExchanged,
    avgMessagesPerSession,
    chatSessionCount,
    relationshipGrowthRate,
    streakRetentionCorrelation,
  };
}

// ══════════════════════════════════════════════
// 辅助计算函数
// ══════════════════════════════════════════════

interface HealthInput {
  relationshipScore: number;
  streak: number;
  interactionCount: number;
  memoryFacts: number;
  swapCount: number;
}

function calculateEngagementHealth(input: HealthInput): number {
  let score = 50; // 基准

  // 关系分贡献 (最多+20)
  score += Math.round(input.relationshipScore * 0.2);

  // 连续签到贡献 (最多+15)
  score += Math.min(15, input.streak * 3);

  // 互动量贡献 (最多+10)
  score += Math.min(10, Math.floor(input.interactionCount / 5));

  // 记忆深度贡献 (最多+5)
  score += Math.min(5, input.memoryFacts);

  // 换乘惩罚 (最多-10)
  score -= Math.min(10, input.swapCount * 2);

  return Math.max(0, Math.min(100, score));
}

function calculateRetentionRate(history: InteractionRecord[], days: number): number {
  const now = Date.now();
  const DAY_MS = 24 * 3600 * 1000;
  const uniqueDays = new Set<string>();

  for (const r of history) {
    const d = new Date(r.timestamp).toISOString().slice(0, 10);
    uniqueDays.add(d);
  }

  if (uniqueDays.size === 0) return 0;

  // 检查最近 N 天的活跃情况
  let recentActiveDays = 0;
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(now - i * DAY_MS);
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (uniqueDays.has(dateStr)) recentActiveDays++;
  }

  return Math.round((recentActiveDays / days) * 100);
}

function getUniqueDays(records: InteractionRecord[]): string[] {
  const days = new Set<string>();
  for (const r of records) {
    days.add(new Date(r.timestamp).toISOString().slice(0, 10));
  }
  return [...days].sort();
}

function findMostSwappedType(swapHistory: SwapRecord[]): string {
  if (swapHistory.length === 0) return '无';

  const counts: Record<string, number> = {};
  for (const swap of swapHistory) {
    const type = swap.toBoyfriend.typeId;
    counts[type] = (counts[type] ?? 0) + 1;
  }

  let maxType = '';
  let maxCount = 0;
  for (const [type, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxType = type;
    }
  }

  return maxType;
}

function calculateGrowthRate(history: InteractionRecord[]): number {
  if (history.length < 5) return 0;

  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const oldest = sorted[0].timestamp;
  const newest = sorted[sorted.length - 1].timestamp;
  const daysDiff = Math.max(1, Math.ceil((newest - oldest) / (24 * 3600 * 1000)));

  return Math.round((sorted.length / daysDiff) * 10) / 10;
}

function getEmptyMetrics(): ProductMetrics {
  return {
    averageRelationshipScore: 0,
    relationshipStageDistribution: { stranger: 100, familiar: 0, close: 0, intimate: 0, deep_bond: 0 },
    engagementHealthScore: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    interactionFrequency: 0,
    dailyRetentionRate: 0,
    returningUserRate: 0,
    totalSwaps: 0,
    swapRate: 0,
    mostSwappedToType: '无',
    totalMessagesExchanged: 0,
    avgMessagesPerSession: 0,
    chatSessionCount: 0,
    relationshipGrowthRate: 0,
    streakRetentionCorrelation: 0,
  };
}

// ══════════════════════════════════════════════
// 健康度诊断
// ══════════════════════════════════════════════

export interface HealthDiagnosis {
  score: number;
  status: 'critical' | 'needs_attention' | 'healthy' | 'excellent';
  recommendations: string[];
}

export function diagnoseHealth(metrics: ProductMetrics): HealthDiagnosis {
  const score = metrics.engagementHealthScore;

  let status: HealthDiagnosis['status'];
  if (score >= 80) status = 'excellent';
  else if (score >= 60) status = 'healthy';
  else if (score >= 30) status = 'needs_attention';
  else status = 'critical';

  const recommendations: string[] = [];

  if (metrics.averageRelationshipScore < 30) {
    recommendations.push('关系评分偏低：建议增加每日互动频率');
  }
  if (metrics.interactionFrequency < 1) {
    recommendations.push('互动频率不足：每天至少互动一次可保持关系温度');
  }
  if (metrics.totalSwaps > 5) {
    recommendations.push('换乘次数较多：频繁换乘会降低关系稳定性');
  }
  if (metrics.avgMessagesPerSession < 3) {
    recommendations.push('聊天深度偏浅：尝试延长每次聊天的轮次');
  }
  if (score >= 80) {
    recommendations.push('关系健康度优秀！继续保持当前的互动节奏');
  }

  return { score, status, recommendations };
}
