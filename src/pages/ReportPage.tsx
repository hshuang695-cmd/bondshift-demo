import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Clock, Zap, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useReportStore, useBoyfriendStore, useSwapStore, useChatStore } from '../stores';
import { refreshReport } from '../core/bondshiftEngine';
import { dailyCheckIn, getStreakInfo } from '../core/engagementEngine';
import { deriveRelationshipTrend, getStageConfig } from '../core/relationshipEngine';
import { EMPTY_USER_MEMORY } from '../stores/chatStore';

const weekDayLabels = ['一', '二', '三', '四', '五', '六', '日'];

export default function ReportPage() {
  const { relationshipScore, interactionStats, weeklyStats } = useReportStore();
  const relationshipLevel = useBoyfriendStore((s) => s.relationshipLevel);
  const currentBoyfriendId = useBoyfriendStore((s) => s.currentBoyfriend?.id ?? '');
  const totalSwapCount = useSwapStore((s) => s.totalSwapCount);
  const allInteractionHistory = useBoyfriendStore((s) => s.interactionHistory);
  const relationshipScores = useBoyfriendStore((s) => s.relationshipScores);
  const memoriesByBoyfriend = useChatStore((s) => s.memoriesByBoyfriend);
  const interactionHistory = useMemo(
    () => allInteractionHistory.filter((record) => record.boyfriendId === currentBoyfriendId),
    [allInteractionHistory, currentBoyfriendId],
  );
  const historyLen = interactionHistory.length;
  const memory = memoriesByBoyfriend[currentBoyfriendId] ?? EMPTY_USER_MEMORY;

  // 依赖变化时刷新报告
  useEffect(() => {
    refreshReport();
  }, [relationshipLevel, totalSwapCount, historyLen]);

  // 关系趋势数据
  const trendData = useMemo(
    () => deriveRelationshipTrend(interactionHistory, totalSwapCount, 7),
    [interactionHistory, totalSwapCount],
  );

  // 连续签到信息
  const streak = useMemo(() => getStreakInfo(interactionHistory), [interactionHistory]);
  const checkInResult = useMemo(() => dailyCheckIn(interactionHistory), [interactionHistory]);

  // 未来预测
  const prediction = useMemo(() => {
    const stage = relationshipScores.stage;
    const currentOverall = relationshipScores.overall;
    const stages = ['stranger', 'familiar', 'close', 'intimate', 'deep_bond'];
    const currentIdx = stages.indexOf(stage);
    const nextStage = currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;
    const nextStageConfig = nextStage ? getStageConfig(
      stages.indexOf(nextStage) * 20 + 10
    ) : null;

    // 基于当前趋势估算到达下一阶段天数
    const dailyGain = streak.currentStreak >= 3 ? 2.5 : 1.2;
    const pointsNeeded = nextStage
      ? Math.max(5, (stages.indexOf(nextStage) * 20 + 10) - currentOverall)
      : 0;
    const estimatedDays = pointsNeeded > 0 ? Math.round(pointsNeeded / dailyGain) : 0;

    return {
      currentStageLabel: getStageConfig(currentOverall).label,
      nextStageLabel: nextStageConfig?.label ?? null,
      nextStageEmoji: nextStageConfig?.emoji ?? null,
      estimatedDays,
      dailyGain,
      predictionText: nextStage
        ? `如果继续保持当前的互动频率，你们预计将在 ${estimatedDays} 天后进入「${nextStageConfig?.label}」阶段`
        : '你们已经达到了关系的最高阶段。继续用心经营，让这份羁绊更加深厚。',
    };
  }, [relationshipScores, streak]);

  // 关系时间线
  const timelineMilestones = useMemo(() => {
    const milestones: { date: string; emoji: string; label: string; detail: string }[] = [];

    if (interactionHistory.length >= 1) {
      milestones.push({
        date: new Date(interactionHistory[interactionHistory.length - 1].timestamp).toLocaleDateString('zh-CN'),
        emoji: '🌟',
        label: '初次相遇',
        detail: '你们的第一次对话开启了这段关系',
      });
    }

    if (interactionHistory.length >= 10) {
      milestones.push({
        date: new Date(interactionHistory[Math.floor(interactionHistory.length / 2)].timestamp).toLocaleDateString('zh-CN'),
        emoji: '💬',
        label: '第10次互动',
        detail: '你们已经开始习惯彼此的存在',
      });
    }

    if (totalSwapCount > 0) {
      milestones.push({
        date: '探索中',
        emoji: '🔄',
        label: `第${totalSwapCount}次换乘`,
        detail: '每一次选择都让你更了解自己',
      });
    }

    if (memory.knownFacts.length >= 3) {
      milestones.push({
        date: '进行中',
        emoji: '🧠',
        label: '深刻了解',
        detail: `对方记住了你${memory.knownFacts.length}个细节`,
      });
    }

    return milestones;
  }, [interactionHistory, totalSwapCount, memory]);

  // 依恋增长可视化数据
  const attachmentGrowth = useMemo(() => {
    return trendData.map((pt) => ({
      ...pt,
      attachment: Math.round(pt.intimacy * 0.6 + pt.trust * 0.4),
    }));
  }, [trendData]);

  const maxWeeklySessions = useMemo(
    () => Math.max(...weeklyStats.map((w) => w.sessions), 1),
    [weeklyStats],
  );

  const radarDimensions = relationshipScore ? [
    { key: 'communication', label: '沟通力', emoji: '💬', value: relationshipScore.communication },
    { key: 'emotionalBond', label: '情感纽带', emoji: '🔗', value: relationshipScore.emotionalBond },
    { key: 'growth', label: '成长度', emoji: '🌱', value: relationshipScore.growth },
    { key: 'fun', label: '趣味性', emoji: '🎯', value: relationshipScore.fun },
  ] : [];

  const avgSessionMin = interactionStats
    ? Math.round(Math.max(1, interactionStats.totalDuration / Math.max(1, interactionStats.totalSessions)))
    : 0;

  return (
    <div className="flex flex-col min-h-full pb-4">
      <PageHeader
        title="成长报告"
        subtitle={relationshipScore ? `综合评级 ${relationshipScore.rank}` : '加载中...'}
      />

      {/* 综合分大卡（全宽） */}
      <div className="px-5 mb-5">
        <div className="card p-5 text-center">
          <div className="relative inline-flex items-center justify-center mb-3">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-surface-300)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(relationshipScore?.overall ?? 0) * 2.64} 264`}
                initial={{ strokeDasharray: '0 264' }}
                animate={{ strokeDasharray: `${(relationshipScore?.overall ?? 0) * 2.64} 264` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-brand-500)" />
                  <stop offset="100%" stopColor="var(--color-brand-200)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-text-primary">
                {relationshipScore?.overall ?? 0}
              </span>
              <span className="text-[10px] text-text-tertiary">综合分</span>
            </div>
          </div>
          <p className="text-xs text-text-secondary font-medium">
            {relationshipScore?.summary ?? '前往「偏好设置」生成你的 AI 男友'}
          </p>
        </div>
      </div>

      {/* 桌面图表两列网格 */}
      <div className="px-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">

      <div className="mb-5 lg:mb-0">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Heart, label: '互动会话', value: interactionStats?.totalSessions ?? 0, color: 'text-brand-500', bg: 'bg-brand-50' },
            { icon: MessageCircle, label: '消息总数', value: interactionStats?.totalMessages ?? 0, color: 'text-accent-600', bg: 'bg-accent-100' },
            { icon: Clock, label: '平均时长', value: `${avgSessionMin}min`, color: 'text-warm-500', bg: 'bg-cream-100' },
            { icon: Zap, label: '语音通话', value: `${interactionStats?.voiceCallCount ?? 0}次`, color: 'text-accent-600', bg: 'bg-accent-100' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="card p-4"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2.5`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-5 lg:mb-0">
        <div className="card p-5">
          <p className="text-xs text-text-secondary font-semibold mb-4 uppercase tracking-wider">
            关系进化三维
          </p>
          {[
            { key: 'trust', label: '信任值', emoji: '🛡️', value: relationshipScores.trust, color: 'var(--color-accent-500)' },
            { key: 'intimacy', label: '亲密度', emoji: '💕', value: relationshipScores.intimacy, color: 'var(--color-brand-500)' },
            { key: 'stability', label: '稳定性', emoji: '⚓', value: relationshipScores.stability, color: 'var(--color-warm-500)' },
          ].map((dim, i) => (
            <div key={dim.key} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-sm w-5">{dim.emoji}</span>
              <span className="text-xs text-text-secondary w-12">{dim.label}</span>
              <div className="flex-1 h-2.5 bg-surface-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dim.value}%` }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: dim.color }}
                />
              </div>
              <span className="text-xs font-bold text-text-primary w-8 text-right">{dim.value}</span>
            </div>
          ))}
          <p className="text-[10px] text-text-tertiary mt-3 pt-3 border-t border-surface-100 text-center">
            {relationshipScores.stage === 'deep_bond' && '💝 你们已建立无可替代的深度羁绊'}
            {relationshipScores.stage === 'intimate' && '💕 关系正在持续升温，彼此依赖'}
            {relationshipScores.stage === 'close' && '💛 信任正在稳固建立，感情逐渐加深'}
            {relationshipScores.stage === 'familiar' && '🌱 开始熟悉彼此，关系正在萌芽'}
            {relationshipScores.stage === 'stranger' && '👋 初识阶段，多聊天让彼此更了解'}
          </p>
        </div>
      </div>

      <div className="mb-5 lg:mb-0">
        <div className="card p-5">
          <p className="text-xs text-text-secondary font-semibold mb-4 uppercase tracking-wider">
            本周互动
          </p>
          <div className="flex items-end justify-between gap-2 h-24">
            {weeklyStats.map((stat, i) => {
              const height = Math.max(5, (stat.sessions / maxWeeklySessions) * 100);
              return (
                <div key={stat.week} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.4 + i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-t-lg mt-auto"
                    style={{
                      background: i === weeklyStats.length - 1
                        ? 'linear-gradient(180deg, var(--color-brand-500) 0%, var(--color-brand-300) 100%)'
                        : 'linear-gradient(180deg, var(--color-accent-500) 0%, var(--color-accent-300) 100%)',
                    }}
                  />
                  <span className="text-[10px] text-text-tertiary">
                    {weekDayLabels[i] ?? stat.week}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-5 lg:mb-0">
        <div className="card p-5">
          <p className="text-xs text-text-secondary font-semibold mb-3 uppercase tracking-wider">
            记忆话题
          </p>
          {memory.topTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {memory.topTopics.map((topic) => (
                <span key={topic} className="text-xs px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 font-medium">
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-tertiary">暂无记忆话题，多聊聊天吧</p>
          )}
          {memory.knownFacts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-100">
              <p className="text-[10px] text-text-tertiary mb-1.5">已知信息</p>
              {memory.knownFacts.slice(-3).map((fact, i) => (
                <p key={i} className="text-xs text-text-secondary">"{fact}"</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 lg:mb-0">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-brand-500" />
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
              关系时间线
            </p>
          </div>
          <div className="space-y-3">
            {timelineMilestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-lg">{m.emoji}</span>
                  {i < timelineMilestones.length - 1 && (
                    <div className="w-0.5 h-5 bg-surface-200 mt-0.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{m.label}</p>
                  <p className="text-[11px] text-text-tertiary">{m.detail}</p>
                </div>
                <span className="text-[10px] text-text-tertiary flex-shrink-0">{m.date}</span>
              </div>
            ))}
            {timelineMilestones.length === 0 && (
              <p className="text-xs text-text-tertiary text-center py-2">开始互动后，这里将记录你们的每一个重要时刻</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5 lg:mb-0">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-accent-600" />
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
              依恋增长曲线
            </p>
          </div>
          <div className="flex items-end justify-between gap-1 h-28">
            {attachmentGrowth.map((point, i) => {
              const height = Math.max(8, (point.attachment / 100) * 100);
              return (
                <div key={point.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-t-lg mt-auto"
                    style={{
                      background: i === attachmentGrowth.length - 1
                        ? 'linear-gradient(180deg, var(--color-brand-500) 0%, var(--color-brand-300) 100%)'
                        : 'linear-gradient(180deg, var(--color-accent-500) 0%, var(--color-accent-300) 100%)',
                    }}
                  />
                  <span className="text-[10px] text-text-tertiary">{point.date}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-100/70">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-500" />
              <span className="text-[10px] text-text-tertiary">依恋度</span>
            </div>
            <span className="text-[10px] text-text-tertiary">
              连续互动 {streak.currentStreak} 天
              {streak.currentStreak >= 3 && <span className="text-brand-500 ml-1">🔥加成中</span>}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-5 lg:mb-0">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-warm-500" />
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
              关系预测
            </p>
          </div>
          <div className="text-center mb-3">
            <span className="text-3xl">{prediction.nextStageEmoji ?? '💝'}</span>
            <p className="text-sm font-bold text-text-primary mt-1">
              {prediction.nextStageLabel
                ? `距离「${prediction.nextStageLabel}」还有 ${prediction.estimatedDays} 天`
                : '已达到最高阶段'}
            </p>
            <p className="text-[11px] text-text-tertiary mt-1">{prediction.predictionText}</p>
          </div>
          <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, relationshipScores.overall)}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full gradient-brand rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-text-tertiary">当前 {prediction.currentStageLabel}</span>
            <span className="text-[10px] text-text-tertiary">
              {prediction.nextStageLabel ?? '深度羁绊'}
            </span>
          </div>
          {checkInResult.streak >= 3 && (
            <p className="text-[10px] text-brand-500 text-center mt-2 font-medium">
              🔥 连续{checkInResult.streak}天互动 · 增长速度+{Math.round((prediction.dailyGain - 1.2) * 100 / 1.2)}%
            </p>
          )}
        </div>
      </div>

      <div className="lg:mb-0">
        <div className="card p-5">
          <p className="text-xs text-text-secondary font-semibold mb-4 uppercase tracking-wider">
            能力雷达
          </p>
          <div className="space-y-3">
            {radarDimensions.map((dim, i) => (
              <div key={dim.key} className="flex items-center gap-3">
                <span className="text-xs w-4">{dim.emoji}</span>
                <span className="text-xs text-text-secondary w-14">{dim.label}</span>
                <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.value}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full gradient-brand rounded-full"
                  />
                </div>
                <span className="text-xs font-bold text-text-primary w-7 text-right">{dim.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      </div>{/* /lg:grid-cols-2 */}
    </div>
  );
}
