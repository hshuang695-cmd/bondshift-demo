// ─── 发布控制引擎 ───
// 职责: 功能灰度标志管理、发布阶段控制、A/B分组
// 所有功能开关通过此引擎统一管理

import { APP_MODE, FEATURE_FLAGS, DEBUG_FLAGS, type AppMode } from '../config/env';

// ══════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export type ReleaseStage = 'alpha' | 'beta' | 'rc' | 'stable';

export interface ReleaseConfig {
  stage: ReleaseStage;
  version: string;
  mode: AppMode;
  features: Record<FeatureFlagKey, boolean>;
  overrides: Partial<Record<FeatureFlagKey, boolean>>;
}

// ══════════════════════════════════════════════
// 运行时功能标志状态 (可被覆盖)
// ══════════════════════════════════════════════

const runtimeOverrides: Partial<Record<FeatureFlagKey, boolean>> = {};

/** 当前发布配置 */
let currentStage: ReleaseStage = APP_MODE === 'prod' ? 'stable' : APP_MODE === 'staging' ? 'beta' : 'alpha';

// ══════════════════════════════════════════════
// 公开 API
// ══════════════════════════════════════════════

/** 检查功能是否启用 */
export function isFeatureEnabled(feature: FeatureFlagKey): boolean {
  // 运行时覆盖优先
  if (feature in runtimeOverrides) {
    return runtimeOverrides[feature]!;
  }
  // 回退到编译时配置
  return FEATURE_FLAGS[feature] ?? false;
}

/** 启用功能标志 (运行时覆盖) */
export function enableFeatureFlag(feature: FeatureFlagKey): void {
  runtimeOverrides[feature] = true;
}

/** 禁用功能标志 (运行时覆盖) */
export function disableFeatureFlag(feature: FeatureFlagKey): void {
  runtimeOverrides[feature] = false;
}

/** 重置功能标志到编译时默认值 */
export function resetFeatureFlag(feature: FeatureFlagKey): void {
  delete runtimeOverrides[feature];
}

/** 重置所有运行时覆盖 */
export function resetAllFeatureFlags(): void {
  for (const key of Object.keys(runtimeOverrides)) {
    delete runtimeOverrides[key as FeatureFlagKey];
  }
}

/** 获取当前发布阶段 */
export function getReleaseStage(): ReleaseStage {
  return currentStage;
}

/** 设置发布阶段 */
export function setReleaseStage(stage: ReleaseStage): void {
  currentStage = stage;
}

/** 获取完整发布配置 */
export function getReleaseConfig(): ReleaseConfig {
  const features = {} as Record<FeatureFlagKey, boolean>;
  for (const key of Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]) {
    features[key] = isFeatureEnabled(key);
  }

  return {
    stage: currentStage,
    version: '1.0.0',
    mode: APP_MODE,
    features,
    overrides: { ...runtimeOverrides },
  };
}

/** 判断是否应该显示调试信息 */
export function shouldShowDebugInfo(): boolean {
  return DEBUG_FLAGS.showBootstrapLogs;
}

/** 批量初始化：根据发布阶段自动开关功能 */
export function applyReleaseStage(stage: ReleaseStage): void {
  setReleaseStage(stage);
  resetAllFeatureFlags();

  switch (stage) {
    case 'alpha':
      // 内部测试：开所有功能
      break;
    case 'beta':
      // 公开测试：稳定功能全开，实验功能关闭
      disableFeatureFlag('simulatedPreview');
      break;
    case 'rc':
      // 候选发布：与生产一致
      disableFeatureFlag('simulatedPreview');
      break;
    case 'stable':
      // 生产环境：保守配置
      disableFeatureFlag('simulatedPreview');
      break;
  }
}
