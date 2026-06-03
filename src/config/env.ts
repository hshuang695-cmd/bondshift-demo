// ─── BondShift 环境配置 ───
// 控制应用运行模式、调试开关、功能灰度、日志级别

// ══════════════════════════════════════════════
// 运行模式
// ══════════════════════════════════════════════

export type AppMode = 'dev' | 'staging' | 'prod';

/** 从 Vite 环境变量或 URL 参数推断当前运行模式 */
export function detectAppMode(): AppMode {
  // Vite 环境变量
  if (import.meta.env.MODE === 'production') {
    // 检查 URL 参数 ?mode=staging
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'staging') return 'staging';
    }
    return 'prod';
  }
  return 'dev';
}

export const APP_MODE: AppMode = detectAppMode();

export const IS_DEV = APP_MODE === 'dev';
export const IS_STAGING = APP_MODE === 'staging';
export const IS_PROD = APP_MODE === 'prod';

// ══════════════════════════════════════════════
// 调试标志
// ══════════════════════════════════════════════

export const DEBUG_FLAGS = {
  /** 显示启动引导日志 */
  showBootstrapLogs: IS_DEV || IS_STAGING,

  /** 显示分析埋点日志 */
  showAnalyticsLogs: IS_DEV,

  /** 显示关系演化详细日志 */
  showRelationshipLogs: IS_DEV,

  /** 显示持久化读写日志 */
  showPersistenceLogs: IS_DEV,

  /** 启用性能监控 */
  enablePerformanceMonitor: IS_DEV,

  /** 显示校验详情 */
  showValidationDetails: IS_DEV || IS_STAGING,

  /** 强制模拟新用户 (仅 dev) */
  forceNewUser: false,
} as const;

// ══════════════════════════════════════════════
// 功能灰度标志
// ══════════════════════════════════════════════

export const FEATURE_FLAGS = {
  /** 关系预测模块 */
  relationshipPrediction: true,

  /** 情绪提醒 (nudge) */
  emotionalNudge: true,

  /** 连续签到系统 */
  streakSystem: true,

  /** 关系衰减系统 */
  relationshipDecay: true,

  /** 自动持久化 */
  autoPersistence: true,

  /** 分析埋点 */
  analyticsTracking: true,

  /** 产品指标收集 */
  metricsCollection: true,

  /** Onboarding 流程 */
  onboardingFlow: true,

  /** 模拟对话预览 */
  simulatedPreview: IS_DEV || IS_STAGING,

  /** 详细报告页面 */
  detailedReport: true,
} as const;

// ══════════════════════════════════════════════
// 日志级别
// ══════════════════════════════════════════════

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

export const LOG_LEVEL: LogLevel = IS_DEV ? 'debug' : IS_STAGING ? 'info' : 'warn';

// ══════════════════════════════════════════════
// 产品版本
// ══════════════════════════════════════════════

export const APP_VERSION = '1.0.0';
export const BUILD_TIME = '__BUILD_TIME__'; // Vite 构建时替换
