// ─── BondShift 统一引擎入口 ───
// 所有页面通过此入口调用核心逻辑，避免 store 间直接耦合。
// 读操作: 页面直接用 useXxxStore hook (Zustand 原生模式)
// 写操作: 页面调用 bondshiftEngine.xxx() (协调多 store)

import type { BoyfriendProfile, SwapRecord } from '../types';
import type { BoyfriendPersonality } from './personalityEngine';
import type { InteractionRecord } from './evolutionEngine';
import type { RelationshipScores, RelationshipStage } from './relationshipEngine';
import type { RelationshipPreview } from './onboardingEngine';
import type { DailyCheckIn, StreakInfo, EmotionalNudge } from './engagementEngine';

// ─── 纯引擎导入 ───
import { computePersonality, synthesizeAttributes, describePersonality } from './personalityEngine';
import { findBestMatch } from './compatibilityEngine';
import { isDuplicate, deriveFullReport, type DerivedReport } from './evolutionEngine';
import {
  calculateRelationshipScores,
  getStageConfig,
  getRelationshipSummary,
  createRelationshipScores,
} from './relationshipEngine';
import {
  detectNewUser,
  detectReturnVisit,
  generateFirstBoyfriendPreview,
  simulateRelationshipPreview,
} from './onboardingEngine';
import {
  dailyCheckIn,
  getStreakInfo,
  generateEmotionalNudge,
  applyRelationshipDecay,
  applyStreakBonus,
} from './engagementEngine';

// ─── Store 导入 (仅通过 getState/setState 交互，不做 hook 调用) ───
import { usePreferenceStore } from '../stores/preferenceStore';
import { useBoyfriendStore } from '../stores/boyfriendStore';
import { useSwapStore } from '../stores/swapStore';
import { useReportStore } from '../stores/reportStore';
import { boyfriends } from '../data';

// ─── 持久化 (自动保存) ───
import { autoSave } from './productBootstrap';

// ─── 分析埋点 ───
import {
  trackBoyfriendCreated,
  trackBoyfriendSwapped,
  trackRelationshipGrowth,
} from './analyticsEngine';

// ══════════════════════════════════════════════
// 公开 API
// ══════════════════════════════════════════════

/** 从偏好设置生成男友 → 写入 boyfriendStore → 返回生成的 profile */
export function createBoyfriend(): BoyfriendProfile | null {
  const prefs = usePreferenceStore.getState();

  const personality = computePersonality({
    mbtiSelections: prefs.selectedPersonalities,
    traits: prefs.traits,
    preferredStyle: prefs.preferredStyle,
  });

  const bestMatch = findBestMatch(personality);
  const attrs = synthesizeAttributes(personality);
  const desc = describePersonality(personality);

  const generated: BoyfriendProfile = {
    ...bestMatch,
    attributes: attrs,
    compatibility: { ...bestMatch.compatibility, description: desc },
  };

  useBoyfriendStore.setState({
    personality,
    currentBoyfriend: generated,
    relationshipLevel: 1,
    interactionHistory: [],
    relationshipScores: createRelationshipScores(),
  });

  // 记录初次生成
  _addInteraction('page_view', generated.id, '初次生成男友');

  // 分析埋点
  trackBoyfriendCreated(generated.typeId, generated.compatibility.baseScore);

  // 自动持久化
  autoSave();

  return generated;
}

/** 执行换乘: 记录swap → 切换当前男友 → 记录交互 → 更新关系分 */
export function swapBoyfriend(fromId: string, toId: string, reason: string): void {
  const fromBf = boyfriends.find((b) => b.id === fromId);
  const toBf = boyfriends.find((b) => b.id === toId);
  if (!fromBf || !toBf || fromId === toId) return;

  const newRecord: SwapRecord = {
    id: `swap_${Date.now()}`,
    fromBoyfriend: { id: fromBf.id, name: fromBf.name, avatar: fromBf.avatar, typeId: fromBf.typeId },
    toBoyfriend: { id: toBf.id, name: toBf.name, avatar: toBf.avatar, typeId: toBf.typeId },
    reason,
    timestamp: Date.now(),
    duration: Math.floor(Math.random() * 600),
    rating: 0,
    highlightLine: fromBf.signatureLines[0],
  };

  // 更新 swapStore
  const swapState = useSwapStore.getState();
  const newHistory = [newRecord, ...swapState.swapHistory];
  useSwapStore.setState({
    swapHistory: newHistory,
    recentThree: newHistory.slice(0, 3),
    totalSwapCount: swapState.totalSwapCount + 1,
    recommendations: swapState.recommendations.filter((b) => b.id !== toId),
  });

  // 更新 boyfriendStore → 换人 + 重置关系分
  useBoyfriendStore.setState({
    currentBoyfriend: toBf,
    relationshipScores: createRelationshipScores(),
  });

  // 记录交互 (新男友的swap_in)
  _addInteraction('swap_in', toId, `换乘理由: ${reason}`);
  _addInteraction('swap_out', fromId, `换出原因: ${reason}`);

  // 重新计算新男友的关系分
  _recalcScores();

  // 分析埋点
  trackBoyfriendSwapped(fromBf.typeId, toBf.typeId, reason);

  // 自动持久化
  autoSave();
}

/** 记录一次用户交互 (带去重 + 自动升级 + 关系进化) */
export function recordInteraction(
  type: InteractionRecord['type'],
  boyfriendId?: string,
  detail?: string,
): void {
  const bfStore = useBoyfriendStore.getState();
  const bfId = boyfriendId ?? bfStore.currentBoyfriend?.id ?? '';

  const record: InteractionRecord = {
    id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    boyfriendId: bfId,
    timestamp: Date.now(),
    detail,
  };

  // 去重检查
  if (isDuplicate(record, bfStore.interactionHistory)) return;

  const newHistory = [record, ...bfStore.interactionHistory];
  const newLevel = Math.min(10, 1 + Math.floor(newHistory.length / 5));

  // 重新计算关系分
  const swapCount = useSwapStore.getState().totalSwapCount;
  const newScores = calculateRelationshipScores(newHistory, swapCount);

  // 检测关系阶段变化
  const prevStage = bfStore.relationshipScores.stage;

  useBoyfriendStore.setState({
    interactionHistory: newHistory,
    relationshipLevel: newLevel,
    relationshipScores: newScores,
  });

  // 分析埋点: 关系阶段变化
  if (newScores.stage !== prevStage) {
    trackRelationshipGrowth(newScores, prevStage);
  }

  // 自动持久化 (聊天等高频操作，debounced)
  _scheduleAutoSave();
}

// ─── 防抖自动保存 ───
let _saveTimer: ReturnType<typeof setTimeout> | null = null;
function _scheduleAutoSave(): void {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    autoSave();
    _saveTimer = null;
  }, 2000); // 2秒防抖
}

/** 获取完整报告数据 (从当前 store 状态派生) */
export function getReportData(): DerivedReport {
  const bf = useBoyfriendStore.getState();
  const swap = useSwapStore.getState();

  return deriveFullReport({
    personality: bf.personality,
    interactionHistory: bf.interactionHistory,
    swapCount: swap.totalSwapCount,
  });
}

/** 刷新报告 store (供 ReportPage 调用) */
export function refreshReport(): void {
  const data = getReportData();
  useReportStore.setState({ ...data, isLoading: false });
}

/** 获取当前男友 (便利方法) */
export function getCurrentBoyfriend(): BoyfriendProfile | null {
  return useBoyfriendStore.getState().currentBoyfriend;
}

/** 获取当前人格 (便利方法) */
export function getPersonality(): BoyfriendPersonality | null {
  return useBoyfriendStore.getState().personality;
}

/** 获取当前关系等级 */
export function getRelationshipLevel(): number {
  return useBoyfriendStore.getState().relationshipLevel;
}

/** 获取当前关系评分 */
export function getRelationshipScores(): RelationshipScores {
  return useBoyfriendStore.getState().relationshipScores;
}

/** 获取当前关系阶段 */
export function getRelationshipStage(): RelationshipStage {
  return useBoyfriendStore.getState().relationshipScores.stage;
}

/** 获取关系阶段配置 */
export function getCurrentStageConfig() {
  const scores = useBoyfriendStore.getState().relationshipScores;
  return getStageConfig(scores.overall);
}

/** 获取关系摘要文本 */
export function getCurrentRelationshipSummary(): string {
  const scores = useBoyfriendStore.getState().relationshipScores;
  return getRelationshipSummary(scores);
}

/** 获取交互历史 */
export function getInteractionHistory(): InteractionRecord[] {
  return useBoyfriendStore.getState().interactionHistory;
}

/** 获取换乘历史 */
export function getSwapHistory(): SwapRecord[] {
  return useSwapStore.getState().swapHistory;
}

/** 获取换乘总次数 */
export function getTotalSwapCount(): number {
  return useSwapStore.getState().totalSwapCount;
}

// ══════════════════════════════════════════════
// Onboarding API
// ══════════════════════════════════════════════

/** 检测当前用户是否为新用户 */
export function checkIsNewUser(): boolean {
  const bf = useBoyfriendStore.getState();
  return detectNewUser({
    interactionCount: bf.interactionHistory.length,
    hasPersonality: bf.personality !== null,
    hasBoyfriend: bf.currentBoyfriend !== null && bf.currentBoyfriend.id !== boyfriends[0].id,
  });
}

/** 检测是否为回访用户 */
export function checkIsReturnVisit(): boolean {
  const history = useBoyfriendStore.getState().interactionHistory;
  if (history.length === 0) return false;
  const lastTime = history[0].timestamp;
  return detectReturnVisit(lastTime);
}

/** 生成男友预览（基于当前偏好，不创建实际数据） */
export function getBoyfriendPreview(): RelationshipPreview | null {
  const prefs = usePreferenceStore.getState();
  if (prefs.selectedPersonalities.length === 0) return null;

  const personality = computePersonality({
    mbtiSelections: prefs.selectedPersonalities,
    traits: prefs.traits,
    preferredStyle: prefs.preferredStyle,
  });
  const bestMatch = findBestMatch(personality);

  return generateFirstBoyfriendPreview({ personality, bestMatch });
}

/** 获取模拟对话 */
export function getSimulatedMessages() {
  const prefs = usePreferenceStore.getState();
  const personality = computePersonality({
    mbtiSelections: prefs.selectedPersonalities,
    traits: prefs.traits,
    preferredStyle: prefs.preferredStyle,
  });
  const bestMatch = findBestMatch(personality);
  return simulateRelationshipPreview(bestMatch.typeId);
}

// ══════════════════════════════════════════════
// Engagement API
// ══════════════════════════════════════════════

/** 执行每日签到 */
export function checkIn(): DailyCheckIn {
  const history = useBoyfriendStore.getState().interactionHistory;
  const result = dailyCheckIn(history);

  // 应用签到加成
  if (result.bonusApplied) {
    const scores = useBoyfriendStore.getState().relationshipScores;
    const bonusResult = applyStreakBonus(scores, result.streak);
    useBoyfriendStore.setState({ relationshipScores: bonusResult.scores });
  }

  return result;
}

/** 获取连续互动信息 */
export function getStreak(): StreakInfo {
  const history = useBoyfriendStore.getState().interactionHistory;
  return getStreakInfo(history);
}

/** 获取情绪提醒 */
export function getNudge(): EmotionalNudge {
  const bf = useBoyfriendStore.getState();
  if (!bf.currentBoyfriend) {
    return {
      shouldNudge: false,
      urgency: 'none',
      message: '',
      hoursSinceLastInteraction: 0,
      decayApplied: false,
    };
  }

  return generateEmotionalNudge({
    history: bf.interactionHistory,
    typeId: bf.currentBoyfriend.typeId,
    relationshipStage: bf.relationshipScores.stage,
  });
}

/** 检查并应用关系衰减 */
export function checkDecay(): void {
  const bf = useBoyfriendStore.getState();
  const result = applyRelationshipDecay(bf.relationshipScores, bf.interactionHistory);

  if (result.decayMessage) {
    useBoyfriendStore.setState({ relationshipScores: result.scores });
  }
}

// ─── 内部工具 ───

function _addInteraction(
  type: InteractionRecord['type'],
  boyfriendId: string,
  detail?: string,
): void {
  const bfStore = useBoyfriendStore.getState();
  const record: InteractionRecord = {
    id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    boyfriendId,
    timestamp: Date.now(),
    detail,
  };
  if (isDuplicate(record, bfStore.interactionHistory)) return;
  const newHistory = [record, ...bfStore.interactionHistory];
  const newLevel = Math.min(10, 1 + Math.floor(newHistory.length / 5));
  useBoyfriendStore.setState({
    interactionHistory: newHistory,
    relationshipLevel: newLevel,
  });
}

function _recalcScores(): void {
  const bfStore = useBoyfriendStore.getState();
  const swapCount = useSwapStore.getState().totalSwapCount;
  const newScores = calculateRelationshipScores(bfStore.interactionHistory, swapCount);
  useBoyfriendStore.setState({ relationshipScores: newScores });
}
