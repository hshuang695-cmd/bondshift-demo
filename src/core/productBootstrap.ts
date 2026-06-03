// ─── 产品启动引导器 ───
// 职责: 统一 App 启动流程 —— 加载持久化 → 检测用户状态 → 恢复/初始化 → hydrate stores
// 所有页面启动必须经过此入口

import type { BoyfriendPersonality } from './personalityEngine';
import type { InteractionRecord } from './evolutionEngine';
import type { RelationshipScores } from './relationshipEngine';
import type { UserMemory } from './memoryEngine';

// ─── 持久化引擎 ───
import {
  loadRelationshipState,
  recoverBoyfriendState,
  syncInteractionHistory,
  saveRelationshipState,
} from './persistenceEngine';

// ─── 校验引擎 ───
import {
  validateStoresSync,
  checkRelationshipData,
  isReadyForProduction,
  type ValidationResult,
} from './validationEngine';

// ─── 关系引擎 ───
import { calculateRelationshipScores } from './relationshipEngine';

// ─── Store ───
import { useBoyfriendStore } from '../stores/boyfriendStore';
import { useSwapStore } from '../stores/swapStore';
import { useChatStore } from '../stores/chatStore';

// ══════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════

export type UserState = 'new' | 'returning' | 'restored';

export interface BootstrapResult {
  userState: UserState;
  restored: boolean;
  validation: ValidationResult;
  readyScore: number; // 0-100 就绪度
  message: string;
}

// ══════════════════════════════════════════════
// 主入口
// ══════════════════════════════════════════════

/**
 * 初始化 App（启动时必须调用）
 * 流程: 检测用户状态 → 加载持久化 → 恢复/初始化 → hydrate → 校验
 */
export function initializeApp(): BootstrapResult {
  // Step 1: 检测当前 store 状态
  const bfStore = useBoyfriendStore.getState();
  const hasBoyfriend = bfStore.currentBoyfriend !== null;
  const hasPersonality = bfStore.personality !== null;
  const hasHistory = bfStore.interactionHistory.length > 0;

  // Step 2: 检测用户状态
  const userState = detectUserState({
    hasBoyfriend,
    hasPersonality,
    hasHistory,
  });

  let restored = false;
  let message = '';

  switch (userState) {
    case 'new':
      message = '欢迎来到 BondShift！开始你的关系旅程吧。';
      break;

    case 'returning': {
      // 检查是否有持久化备份
      const recovered = recoverBoyfriendState();
      if (recovered.recovered && recovered.boyfriendState && recovered.swapState) {
        // 恢复持久化数据
        hydrateStores(recovered.boyfriendState, recovered.swapState, recovered.memory);
        restored = true;
        message = '欢迎回来！关系状态已恢复。';
      } else {
        message = '欢迎回来！正在继续你的关系旅程。';
      }
      break;
    }

    case 'restored':
      restored = true;
      message = '关系状态已从备份中恢复。';
      break;
  }

  // Step 4: 校验
  const validation = validateCurrentState();

  // Step 5: 生产就绪评分
  const readiness = isReadyForProduction({
    storesSynced: validation.valid,
    relationshipDataValid: checkCurrentRelationshipData().valid,
    hasBoyfriend,
    hasPersonality,
    interactionCount: bfStore.interactionHistory.length,
    persistenceAvailable: checkPersistenceAvailable(),
  });

  return {
    userState,
    restored,
    validation,
    readyScore: readiness.score,
    message,
  };
}

/**
 * 检测用户状态
 * - new: 无男友 + 无人格 + 无历史
 * - returning: 有数据但未持久化（或内存中的数据）
 * - restored: 从持久化恢复
 */
export function detectUserState(params: {
  hasBoyfriend: boolean;
  hasPersonality: boolean;
  hasHistory: boolean;
}): UserState {
  const { hasBoyfriend, hasPersonality, hasHistory } = params;

  // 完全空状态 → 新用户
  if (!hasBoyfriend && !hasPersonality && !hasHistory) {
    // 但检查是否有持久化备份
    const persisted = loadRelationshipState();
    if (persisted.found && persisted.state) {
      return 'restored';
    }
    return 'new';
  }

  // 有部分数据 → 返回用户
  return 'returning';
}

// ══════════════════════════════════════════════
// Store 注水
// ══════════════════════════════════════════════

interface BoyfriendSnapshot {
  currentBoyfriend: import('../types').BoyfriendProfile | null;
  personality: BoyfriendPersonality | null;
  relationshipLevel: number;
  interactionHistory: InteractionRecord[];
  relationshipScores: RelationshipScores;
}

interface SwapSnapshot {
  swapHistory: import('../types').SwapRecord[];
  totalSwapCount: number;
}

/**
 * 将持久化数据写入 store
 */
export function hydrateStores(
  boyfriendState: BoyfriendSnapshot,
  swapState: SwapSnapshot,
  memory: UserMemory | null,
): void {
  // 男友 store
  const bfStore = useBoyfriendStore.getState();

  // 合并交互历史（内存中的 + 持久化的，去重）
  const mergedHistory = syncInteractionHistory(
    boyfriendState.interactionHistory,
    bfStore.interactionHistory,
  );

  // 基于合并后的历史重新计算关系分
  const recalculatedScores = mergedHistory.length > 0
    ? calculateRelationshipScores(mergedHistory, swapState.totalSwapCount)
    : boyfriendState.relationshipScores;

  useBoyfriendStore.setState({
    currentBoyfriend: boyfriendState.currentBoyfriend,
    personality: boyfriendState.personality,
    relationshipLevel: boyfriendState.relationshipLevel,
    interactionHistory: mergedHistory,
    relationshipScores: recalculatedScores,
  });

  // Swap store
  useSwapStore.setState({
    swapHistory: swapState.swapHistory,
    totalSwapCount: swapState.totalSwapCount,
  });

  // Chat store (memory)
  if (memory) {
    useChatStore.setState({ memory });
  }
}

// ══════════════════════════════════════════════
// 自动保存 (在关键操作后调用)
// ══════════════════════════════════════════════

/** 自动保存当前关系状态到 localStorage */
export function autoSave(): boolean {
  const bf = useBoyfriendStore.getState();
  const swap = useSwapStore.getState();
  const chat = useChatStore.getState();

  return saveRelationshipState({
    boyfriend: {
      currentBoyfriend: bf.currentBoyfriend,
      personality: bf.personality,
      relationshipLevel: bf.relationshipLevel,
      interactionHistory: bf.interactionHistory,
      relationshipScores: bf.relationshipScores,
    },
    swap: {
      swapHistory: swap.swapHistory,
      totalSwapCount: swap.totalSwapCount,
    },
    memory: chat.memory,
  });
}

// ══════════════════════════════════════════════
// 校验辅助
// ══════════════════════════════════════════════

function validateCurrentState(): ValidationResult {
  const bf = useBoyfriendStore.getState();
  const swap = useSwapStore.getState();

  return validateStoresSync({
    hasBoyfriend: bf.currentBoyfriend !== null,
    hasPersonality: bf.personality !== null,
    hasInteractionHistory: bf.interactionHistory.length > 0,
    hasRelationshipScores: bf.relationshipScores.overall > 0 || bf.relationshipScores.stage !== 'stranger',
    swapCount: swap.totalSwapCount,
    relationshipLevel: bf.relationshipLevel,
    interactionCount: bf.interactionHistory.length,
  });
}

function checkCurrentRelationshipData(): ValidationResult {
  const bf = useBoyfriendStore.getState();
  return checkRelationshipData(bf.relationshipScores, bf.interactionHistory);
}

function checkPersistenceAvailable(): boolean {
  try {
    const testKey = '__bondshift_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
