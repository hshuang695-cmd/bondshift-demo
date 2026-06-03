// ─── 数据校验引擎 ───
// 职责: 校验 store 同步状态、数据一致性、生产就绪判断
// 由 productBootstrap 在启动时调用，确保系统处于健康状态

import type { InteractionRecord } from './evolutionEngine';
import type { RelationshipScores } from './relationshipEngine';

// ══════════════════════════════════════════════
// 校验结果类型
// ══════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
  warnings: string[];
  readyForProduction: boolean;
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

// ══════════════════════════════════════════════
// Store 同步校验
// ══════════════════════════════════════════════

export interface SyncCheckInput {
  hasBoyfriend: boolean;
  hasPersonality: boolean;
  hasInteractionHistory: boolean;
  hasRelationshipScores: boolean;
  swapCount: number;
  relationshipLevel: number;
  interactionCount: number;
}

/** 校验多个 store 之间的数据是否同步一致 */
export function validateStoresSync(input: SyncCheckInput): ValidationResult {
  const checks: ValidationCheck[] = [];
  const warnings: string[] = [];

  // 1) 男友与人格一致性
  if (input.hasBoyfriend && !input.hasPersonality) {
    checks.push({ name: '男友-人格一致性', passed: false, detail: '有当前男友但缺少人格数据' });
    warnings.push('男友数据与人格数据不同步');
  } else if (!input.hasBoyfriend && input.hasPersonality) {
    checks.push({ name: '男友-人格一致性', passed: false, detail: '有人格数据但缺少当前男友' });
    warnings.push('人格数据与男友数据不同步');
  } else {
    checks.push({ name: '男友-人格一致性', passed: true, detail: '数据同步' });
  }

  // 2) 关系等级与交互历史一致性
  if (input.interactionCount > 0 && input.relationshipLevel < 1) {
    checks.push({ name: '等级-历史一致性', passed: false, detail: '有交互历史但关系等级为0' });
    warnings.push('关系等级与交互历史不一致');
  } else if (input.interactionCount === 0 && input.relationshipLevel > 1) {
    checks.push({ name: '等级-历史一致性', passed: false, detail: '无交互历史但关系等级>1' });
    warnings.push('关系等级异常：无历史但等级偏高');
  } else {
    checks.push({ name: '等级-历史一致性', passed: true, detail: '数据一致' });
  }

  // 3) 关系评分存在性
  if (input.hasBoyfriend && !input.hasRelationshipScores) {
    checks.push({ name: '关系评分完整性', passed: false, detail: '有男友但缺少关系评分' });
    warnings.push('关系评分数据缺失');
  } else {
    checks.push({ name: '关系评分完整性', passed: true, detail: '评分数据完整' });
  }

  // 4) 换乘计数合理性
  if (input.swapCount < 0) {
    checks.push({ name: '换乘计数合理性', passed: false, detail: '换乘次数为负数' });
    warnings.push('换乘计数异常');
  } else {
    checks.push({ name: '换乘计数合理性', passed: true, detail: '计数正常' });
  }

  const allPassed = checks.every((c) => c.passed);

  return {
    valid: allPassed,
    checks,
    warnings,
    readyForProduction: allPassed && warnings.length === 0,
  };
}

// ══════════════════════════════════════════════
// 关系数据校验
// ══════════════════════════════════════════════

/** 校验关系评分与交互历史是否匹配 */
export function checkRelationshipData(
  scores: RelationshipScores,
  history: InteractionRecord[],
): ValidationResult {
  const checks: ValidationCheck[] = [];
  const warnings: string[] = [];

  // 1) 分数范围检查
  const inRange = (v: number) => v >= 0 && v <= 100;
  if (!inRange(scores.trust) || !inRange(scores.intimacy) || !inRange(scores.stability)) {
    checks.push({ name: '分数范围', passed: false, detail: '存在超出0-100范围的分数' });
    warnings.push('关系评分超出有效范围');
  } else {
    checks.push({ name: '分数范围', passed: true, detail: '所有分数在有效范围内' });
  }

  // 2) 综合分计算校验
  const expectedOverall = Math.round(scores.trust * 0.3 + scores.intimacy * 0.4 + scores.stability * 0.3);
  if (Math.abs(scores.overall - expectedOverall) > 2) {
    checks.push({ name: '综合分计算', passed: false, detail: `期望${expectedOverall}，实际${scores.overall}` });
    warnings.push('综合分计算不一致');
  } else {
    checks.push({ name: '综合分计算', passed: true, detail: '计算正确' });
  }

  // 3) 阶段一致性
  const stageOrder = ['stranger', 'familiar', 'close', 'intimate', 'deep_bond'];
  const expectedStageIdx = scores.overall >= 81 ? 4 : scores.overall >= 61 ? 3 : scores.overall >= 41 ? 2 : scores.overall >= 21 ? 1 : 0;
  if (stageOrder[expectedStageIdx] !== scores.stage) {
    checks.push({ name: '阶段一致性', passed: false, detail: `期望${stageOrder[expectedStageIdx]}，实际${scores.stage}` });
    warnings.push('关系阶段与综合分不匹配');
  } else {
    checks.push({ name: '阶段一致性', passed: true, detail: '阶段匹配' });
  }

  // 4) 历史长度合理性
  if (history.length > 0 && scores.intimacy <= 5 && scores.trust <= 15) {
    checks.push({ name: '历史-分值合理性', passed: false, detail: '有交互历史但关系分值处于初始状态' });
    warnings.push('关系分值未随历史更新');
  } else {
    checks.push({ name: '历史-分值合理性', passed: true, detail: '合理' });
  }

  const allPassed = checks.every((c) => c.passed);

  return {
    valid: allPassed,
    checks,
    warnings,
    readyForProduction: allPassed && warnings.length === 0,
  };
}

// ══════════════════════════════════════════════
// 生产就绪判断
// ══════════════════════════════════════════════

export interface ReadinessInput {
  storesSynced: boolean;
  relationshipDataValid: boolean;
  hasBoyfriend: boolean;
  hasPersonality: boolean;
  interactionCount: number;
  persistenceAvailable: boolean;
}

/** 判断系统是否 ready for production */
export function isReadyForProduction(input: ReadinessInput): {
  ready: boolean;
  blockers: string[];
  score: number; // 0-100 就绪度
} {
  const blockers: string[] = [];
  let score = 100;

  if (!input.storesSynced) {
    blockers.push('Store数据不同步');
    score -= 25;
  }
  if (!input.relationshipDataValid) {
    blockers.push('关系数据校验未通过');
    score -= 25;
  }
  if (!input.hasBoyfriend) {
    blockers.push('尚未创建男友');
    score -= 20;
  }
  if (!input.hasPersonality) {
    blockers.push('人格数据缺失');
    score -= 15;
  }
  if (!input.persistenceAvailable) {
    blockers.push('持久化不可用（数据无法保存）');
    score -= 15;
  }

  return {
    ready: blockers.length === 0,
    blockers,
    score: Math.max(0, score),
  };
}
