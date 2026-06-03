// ─── 关系状态持久化引擎 ───
// 职责: 将关键 store 状态序列化到 localStorage，支持断电恢复
// 所有页面不直接调用此引擎 —— 由 productBootstrap 统一调度

import type { BoyfriendProfile } from '../types';
import type { BoyfriendPersonality } from './personalityEngine';
import type { InteractionRecord } from './evolutionEngine';
import type { RelationshipScores } from './relationshipEngine';
import type { SwapRecord } from '../types';
import type { UserMemory } from './memoryEngine';

// ══════════════════════════════════════════════
// 持久化数据结构
// ══════════════════════════════════════════════

const STORAGE_KEY = 'bondshift_state_v1';
const STORAGE_VERSION = 1;

interface PersistedState {
  version: number;
  savedAt: number;
  boyfriend: {
    currentBoyfriend: BoyfriendProfile | null;
    personality: BoyfriendPersonality | null;
    relationshipLevel: number;
    interactionHistory: InteractionRecord[];
    relationshipScores: RelationshipScores;
  };
  swap: {
    swapHistory: SwapRecord[];
    totalSwapCount: number;
  };
  memory: UserMemory | null;
}

// ══════════════════════════════════════════════
// 保存
// ══════════════════════════════════════════════

export interface SaveInput {
  boyfriend: PersistedState['boyfriend'];
  swap: PersistedState['swap'];
  memory: UserMemory | null;
}

/** 将关系状态序列化并保存到 localStorage */
export function saveRelationshipState(input: SaveInput): boolean {
  try {
    const state: PersistedState = {
      version: STORAGE_VERSION,
      savedAt: Date.now(),
      boyfriend: input.boyfriend,
      swap: input.swap,
      memory: input.memory,
    };

    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (err) {
    console.warn('[PersistenceEngine] 保存失败:', err);
    return false;
  }
}

// ══════════════════════════════════════════════
// 加载
// ══════════════════════════════════════════════

export interface LoadResult {
  found: boolean;
  state: PersistedState | null;
  savedAt: number;
  age: number; // 距上次保存的毫秒数
}

/** 从 localStorage 加载关系状态 */
export function loadRelationshipState(): LoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { found: false, state: null, savedAt: 0, age: 0 };
    }

    const state: PersistedState = JSON.parse(raw);

    // 版本检查
    if (!state.version || state.version < STORAGE_VERSION) {
      return { found: false, state: null, savedAt: 0, age: 0 };
    }

    const age = Date.now() - state.savedAt;
    return { found: true, state, savedAt: state.savedAt, age };
  } catch (err) {
    console.warn('[PersistenceEngine] 加载失败:', err);
    return { found: false, state: null, savedAt: 0, age: 0 };
  }
}

// ══════════════════════════════════════════════
// 恢复
// ══════════════════════════════════════════════

export interface RecoverResult {
  recovered: boolean;
  boyfriendState: PersistedState['boyfriend'] | null;
  swapState: PersistedState['swap'] | null;
  memory: UserMemory | null;
}

/** 尝试恢复男友关系状态 */
export function recoverBoyfriendState(): RecoverResult {
  const result = loadRelationshipState();

  if (!result.found || !result.state) {
    return { recovered: false, boyfriendState: null, swapState: null, memory: null };
  }

  const state = result.state;

  // 检查数据完整性
  if (!state.boyfriend || !state.swap) {
    return { recovered: false, boyfriendState: null, swapState: null, memory: null };
  }

  return {
    recovered: true,
    boyfriendState: state.boyfriend,
    swapState: state.swap,
    memory: state.memory,
  };
}

// ══════════════════════════════════════════════
// 交互历史同步
// ══════════════════════════════════════════════

/** 同步交互历史（增量合并，避免重复） */
export function syncInteractionHistory(
  stored: InteractionRecord[],
  current: InteractionRecord[],
): InteractionRecord[] {
  const existingIds = new Set(current.map((r) => r.id));
  const merged = [...current];

  for (const record of stored) {
    if (!existingIds.has(record.id)) {
      merged.push(record);
      existingIds.add(record.id);
    }
  }

  // 按时间排序(新→旧)
  merged.sort((a, b) => b.timestamp - a.timestamp);

  return merged.slice(0, 500); // 最多保留500条
}

// ══════════════════════════════════════════════
// 工具
// ══════════════════════════════════════════════

/** 清除所有持久化数据 */
export function clearPersistence(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 静默忽略
  }
}

/** 获取上次保存时间 */
export function getLastSaveTime(): number {
  const result = loadRelationshipState();
  return result.savedAt;
}

/** 检查持久化数据是否存在 */
export function hasPersistedData(): boolean {
  const result = loadRelationshipState();
  return result.found;
}
