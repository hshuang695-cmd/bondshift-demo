// ─── 分析埋点引擎 ───
// 职责: 所有核心用户行为埋点追踪
// 当前为 console 输出模式，结构化为后续接入真实分析平台 (Firebase/Mixpanel/Amplitude)
// 不影响 UI，对用户完全透明

import type { BoyfriendTypeId } from '../types';
import type { RelationshipScores } from './relationshipEngine';
import { isFeatureEnabled } from './releaseEngine';
import { DEBUG_FLAGS, APP_MODE } from '../config/env';

// ══════════════════════════════════════════════
// 事件类型
// ══════════════════════════════════════════════

export type AnalyticsEvent =
  | 'app_launch'
  | 'app_bootstrap'
  | 'user_onboarding_start'
  | 'user_onboarding_complete'
  | 'boyfriend_created'
  | 'boyfriend_swapped'
  | 'chat_message_sent'
  | 'chat_message_received'
  | 'chat_session_start'
  | 'chat_session_end'
  | 'relationship_stage_change'
  | 'relationship_score_milestone'
  | 'daily_check_in'
  | 'streak_milestone'
  | 'emotional_nudge_shown'
  | 'emotional_nudge_clicked'
  | 'page_view'
  | 'report_viewed'
  | 'settings_viewed'
  | 'retention_return'
  | 'swap_explored'
  | 'swap_completed';

// ══════════════════════════════════════════════
// 事件载荷
// ══════════════════════════════════════════════

interface AnalyticsPayload {
  event: AnalyticsEvent;
  timestamp: number;
  sessionId: string;
  metadata: Record<string, unknown>;
}

// ══════════════════════════════════════════════
// 会话管理
// ══════════════════════════════════════════════

let currentSessionId = '';
const eventBuffer: AnalyticsPayload[] = [];
const MAX_BUFFER = 50;

function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return currentSessionId;
}

function resetSession(): void {
  currentSessionId = '';
}

// ══════════════════════════════════════════════
// 核心追踪
// ══════════════════════════════════════════════

function track(event: AnalyticsEvent, metadata: Record<string, unknown> = {}): void {
  if (!isFeatureEnabled('analyticsTracking')) return;

  const payload: AnalyticsPayload = {
    event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    metadata: {
      ...metadata,
      appMode: APP_MODE,
    },
  };

  // 缓冲事件
  eventBuffer.push(payload);
  if (eventBuffer.length > MAX_BUFFER) {
    eventBuffer.shift();
  }

  // 开发环境输出
  if (DEBUG_FLAGS.showAnalyticsLogs) {
    const emoji = EVENT_EMOJI[event] ?? '📊';
    console.log(
      `%c${emoji} [Analytics] %c${event} %c${JSON.stringify(metadata)}`,
      'font-size:14px',
      'color:#4f5fcf;font-weight:bold',
      'color:#8e8e93',
    );
  }
}

// ══════════════════════════════════════════════
// 事件图标映射
// ══════════════════════════════════════════════

const EVENT_EMOJI: Partial<Record<AnalyticsEvent, string>> = {
  app_launch: '🚀',
  app_bootstrap: '⚡',
  user_onboarding_start: '👋',
  user_onboarding_complete: '✅',
  boyfriend_created: '💝',
  boyfriend_swapped: '🔄',
  chat_message_sent: '💬',
  chat_message_received: '💌',
  chat_session_start: '📱',
  relationship_stage_change: '💕',
  relationship_score_milestone: '🎯',
  daily_check_in: '📅',
  streak_milestone: '🔥',
  emotional_nudge_shown: '🔔',
  emotional_nudge_clicked: '💡',
  page_view: '👁️',
  report_viewed: '📊',
  swap_explored: '🔍',
  swap_completed: '✈️',
  retention_return: '🏠',
};

// ══════════════════════════════════════════════
// 公开 API
// ══════════════════════════════════════════════

/** App 启动 */
export function trackAppLaunch(userState: string, readyScore: number): void {
  track('app_launch', { userState, readyScore });
}

/** 启动引导完成 */
export function trackBootstrap(result: { userState: string; restored: boolean; readyScore: number }): void {
  track('app_bootstrap', result);
}

/** Onboarding 流程 */
export function trackOnboardingStart(): void {
  track('user_onboarding_start', {});
}
export function trackOnboardingComplete(preferences: { styleCount: number; personalityCount: number }): void {
  track('user_onboarding_complete', preferences);
}

/** 男友创建/换乘 */
export function trackBoyfriendCreated(typeId: BoyfriendTypeId, matchScore: number): void {
  track('boyfriend_created', { typeId, matchScore });
}
export function trackBoyfriendSwapped(fromType: string, toType: string, reason: string): void {
  track('boyfriend_swapped', { fromType, toType, reason });
}

/** 聊天行为 */
export function trackChatMessageSent(intent: string, sessionMsgCount: number): void {
  track('chat_message_sent', { intent, sessionMsgCount });
}
export function trackChatMessageReceived(emotion: string, typeId: string, stage: string): void {
  track('chat_message_received', { emotion, typeId, stage });
}
export function trackChatSessionStart(boyfriendId: string, typeId: string): void {
  track('chat_session_start', { boyfriendId, typeId });
}
export function trackChatSessionEnd(messageCount: number, durationMinutes: number): void {
  track('chat_session_end', { messageCount, durationMinutes });
}

/** 关系演化 */
export function trackRelationshipGrowth(scores: RelationshipScores, previousStage: string): void {
  track('relationship_stage_change', {
    stage: scores.stage,
    previousStage,
    overall: scores.overall,
    trust: scores.trust,
    intimacy: scores.intimacy,
    stability: scores.stability,
  });
}
export function trackScoreMilestone(score: number, milestone: string): void {
  track('relationship_score_milestone', { score, milestone });
}

/** 留存 */
export function trackDailyCheckIn(streak: number): void {
  track('daily_check_in', { streak });
}
export function trackStreakMilestone(streak: number): void {
  track('streak_milestone', { streak });
}
export function trackNudgeShown(urgency: string, hoursSinceLastInteraction: number): void {
  track('emotional_nudge_shown', { urgency, hoursSinceLastInteraction });
}
export function trackNudgeClicked(urgency: string): void {
  track('emotional_nudge_clicked', { urgency });
}
export function trackRetentionReturn(daysSinceLastVisit: number): void {
  track('retention_return', { daysSinceLastVisit });
}

/** 页面浏览 */
export function trackPageView(page: string): void {
  track('page_view', { page });
}

/** 报告/设置 */
export function trackReportViewed(overallScore: number, stage: string): void {
  track('report_viewed', { overallScore, stage });
}
export function trackSettingsViewed(relationshipLevel: number): void {
  track('settings_viewed', { relationshipLevel });
}

/** 换乘探索 */
export function trackSwapExplored(filterType: string | null, resultCount: number): void {
  track('swap_explored', { filterType, resultCount });
}
export function trackSwapCompleted(fromType: string, toType: string): void {
  track('swap_completed', { fromType, toType });
}

// ══════════════════════════════════════════════
// 批量上报
// ══════════════════════════════════════════════

/** 获取当前缓冲区中的事件 (供外部上报) */
export function getEventBuffer(): ReadonlyArray<AnalyticsPayload> {
  return eventBuffer;
}

/** 清空缓冲区 */
export function flushEventBuffer(): void {
  eventBuffer.length = 0;
}

/** 获取当前会话 ID */
export function getAnalyticsSessionId(): string {
  return getSessionId();
}

/** 重置会话 (用于手动重置) */
export function resetAnalyticsSession(): void {
  resetSession();
}
