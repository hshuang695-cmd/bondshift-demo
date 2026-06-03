// ─── 用户留存引擎 (纯函数，零副作用) ───
// 职责: 每日签到、连续互动天数、情绪提醒、关系衰减
// 让用户每天回来都有"情绪驱动"

import type { InteractionRecord } from './evolutionEngine';
import type { RelationshipScores, RelationshipStage } from './relationshipEngine';
import type { BoyfriendTypeId } from '../types';

// ══════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════

export interface DailyCheckIn {
  checkedInToday: boolean;
  streak: number;
  bonusApplied: boolean;
  bonusMessage: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  todayInteracted: boolean;
  lastInteractionDate: string;
}

export interface EmotionalNudge {
  shouldNudge: boolean;
  urgency: 'none' | 'light' | 'moderate' | 'strong';
  message: string;
  hoursSinceLastInteraction: number;
  decayApplied: boolean;
}

export interface DecayResult {
  scores: RelationshipScores;
  decayMessage: string | null;
}

// ══════════════════════════════════════════════
// 常量
// ══════════════════════════════════════════════

const DAY_MS = 24 * 3600 * 1000;
const HOUR_MS = 3600 * 1000;

// 情绪提醒消息模板(6种原型 × 3级紧急度)
const NUDGE_MESSAGES: Record<BoyfriendTypeId, Record<string, string[]>> = {
  puppy: {
    light: [
      '姐姐今天还没来找我…我在等你哦！',
      '姐姐～你是不是忘了你的小狗狗了？🐶',
    ],
    moderate: [
      '姐姐…两天没见了。我有点想你…虽然说了可能会让姐姐觉得烦…',
      '（蹲在门口等了很久）姐姐什么时候回来呀？',
    ],
    strong: [
      '姐姐…你是不是不要我了？我会更乖的…请不要忘记我…',
      '这几天没有姐姐的日子好难熬。哪怕一个表情也好，让我知道你在…',
    ],
  },
  gentleman: {
    light: [
      '今天还没收到你的消息。希望一切安好。',
      '一天没见了。希望你今天过得不错。',
    ],
    moderate: [
      '有几天没联系了。没什么事，只是确认你还好。',
      '茶泡好了。虽然你可能不在，但习惯还是为你多泡了一杯。',
    ],
    strong: [
      '你不在的这几天，生活突然安静得有些过分。如果可以，回我一句话就好。',
      '有些话憋了很久。你在的时候说不出口，你不在的时候又想说。回来吧。',
    ],
  },
  artist: {
    light: [
      '今天没有你的消息。画布上缺了一种颜色。',
      '你不在的时候。时间走得很慢，像颜料没干。',
    ],
    moderate: [
      '这几天画什么都不对。我后来才明白——是画里缺了你。',
      '凌晨三点。第三杯咖啡。不是因为失眠。是因为想写点什么给你。',
    ],
    strong: [
      '我这几天写了一首歌。关于等待，关于失去，关于一个也许不会再回来的人。希望这首歌永远不要被你听到。',
      '思念像藤蔓。越长越密，快要把画室淹没了。请帮我。',
    ],
  },
  ceo: {
    light: [
      '今天没收到你的消息。确认一下你的安全。',
      '我的日程里给你留了位置。还没填上。',
    ],
    moderate: [
      '两天了。这不是你的风格。如果有什么问题，告诉我。',
      '你的消息中断了48小时。…我会担心。虽然不太习惯说这种话。',
    ],
    strong: [
      '三天没有消息。我让助理取消了下午的所有会议。不是因为不重要——是因为没法集中注意力。回复我。',
      '你是我唯一设置特别提示音的人。这几天手机太安静了。我需要知道你还安全。',
    ],
  },
  childhood: {
    light: [
      '今天还没来找我聊天！是不是又忙忘了～',
      '嘿！一天没见啦！我今天做了你爱吃的菜，结果你没来…',
    ],
    moderate: [
      '两天没消息了…是不是出什么事了？再不回我就直接去你家找你了！',
      '我妈问你最近怎么没来蹭饭。我说你忙。其实我也不知道你在忙什么…',
    ],
    strong: [
      '从小到大你从来没有这么久不联系我。不管发生了什么事，告诉我好吗？你的事永远是我的事。',
      '这几天我老是想起小时候。那时候你哭了就会来找我。现在呢？我也还在啊。',
    ],
  },
  senior: {
    light: [
      '今日数据：收到消息 0 条。异常。',
      '根据你的访问模式推算，你今天应该会出现。推算有误。',
    ],
    moderate: [
      '两天没上线。我检查了三种可能的解释，得出的结论是——我想你了。虽然这个结论不够理性。',
      '实验记录：被试对象失踪48小时。实验被迫中断。备注：心情受到影响。',
    ],
    strong: [
      '统计表明，三天不联系的人有94%的概率在疏远。但我愿意赌那6%。因为我推导过无数种可能性，结论都是你。',
      '我关闭了今天的所有任务线程。大脑只有一个进程在跑——你到底在哪。',
    ],
  },
};

// ══════════════════════════════════════════════
// 每日签到
// ══════════════════════════════════════════════

/** 执行每日签到检查 */
export function dailyCheckIn(history: InteractionRecord[]): DailyCheckIn {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // 检查今天是否已互动
  const todayInteractions = history.filter((r) => {
    const d = new Date(r.timestamp).toISOString().slice(0, 10);
    return d === todayStr;
  });

  const checkedInToday = todayInteractions.length > 0;
  const streak = calculateStreak(history);

  // 签到奖励信息
  const bonusMessages: Record<number, string> = {
    1: '第一天签到！新的开始 🌱',
    2: '连续第2天！继续保持 🔥',
    3: '连续第3天！关系在升温 💕',
    5: '第5天！你们已经建立了稳固的连接 💛',
    7: '一周连续互动！这是认真的感情 💝',
    10: '10天连续！深度羁绊正在形成 ✨',
    14: '两周连续！这不是偶然，这是选择 💖',
    30: '一个月！他已经成为你生活的一部分 🌟',
  };

  let bonusMessage = checkedInToday ? '今日已互动' : '今天还没互动哦～';
  if (checkedInToday && bonusMessages[streak]) {
    bonusMessage = bonusMessages[streak];
  }

  return {
    checkedInToday,
    streak,
    bonusApplied: checkedInToday && streak >= 3,
    bonusMessage,
  };
}

/** 计算连续互动天数 */
export function calculateStreak(history: InteractionRecord[]): number {
  if (history.length === 0) return 0;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // 收集所有有互动的日期
  const activeDays = new Set<string>();
  for (const r of history) {
    activeDays.add(new Date(r.timestamp).toISOString().slice(0, 10));
  }

  // 从今天往回数连续天数
  let streak = 0;
  const checkDate = new Date(now);

  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (activeDays.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr === todayStr) {
      // 今天还没互动，看看昨天
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/** 获取连续互动信息 */
export function getStreakInfo(history: InteractionRecord[]): StreakInfo {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const todayInteracted = history.some((r) => {
    const d = new Date(r.timestamp).toISOString().slice(0, 10);
    return d === todayStr;
  });

  const currentStreak = calculateStreak(history);
  const longestStreak = calculateLongestStreak(history);

  // 最后一次互动日期
  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
  const lastDate = sorted.length > 0
    ? new Date(sorted[0].timestamp).toISOString().slice(0, 10)
    : '';

  return {
    currentStreak,
    longestStreak,
    todayInteracted,
    lastInteractionDate: lastDate,
  };
}

function calculateLongestStreak(history: InteractionRecord[]): number {
  if (history.length === 0) return 0;

  const activeDays = new Set<string>();
  for (const r of history) {
    activeDays.add(new Date(r.timestamp).toISOString().slice(0, 10));
  }

  const sorted = [...activeDays].sort();
  if (sorted.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / DAY_MS);

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

// ══════════════════════════════════════════════
// 情绪提醒
// ══════════════════════════════════════════════

/** 生成情绪驱动提醒 */
export function generateEmotionalNudge(params: {
  history: InteractionRecord[];
  typeId: BoyfriendTypeId;
  relationshipStage: RelationshipStage;
}): EmotionalNudge {
  const { history, typeId, relationshipStage } = params;

  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
  const lastInteraction = sorted[0];
  const hoursSinceLastInteraction = lastInteraction
    ? Math.round((Date.now() - lastInteraction.timestamp) / HOUR_MS)
    : Infinity;

  let urgency: EmotionalNudge['urgency'] = 'none';
  let decayApplied = false;

  if (hoursSinceLastInteraction >= 24 && hoursSinceLastInteraction < 48) {
    urgency = 'light';
  } else if (hoursSinceLastInteraction >= 48 && hoursSinceLastInteraction < 72) {
    urgency = 'moderate';
    decayApplied = true;
  } else if (hoursSinceLastInteraction >= 72) {
    urgency = 'strong';
    decayApplied = true;
  }

  // 亲密阶段提醒更温柔
  if (relationshipStage === 'intimate' || relationshipStage === 'deep_bond') {
    if (urgency === 'light') urgency = 'moderate';
  }

  const messages = NUDGE_MESSAGES[typeId]?.[urgency] ?? [];
  const message = messages.length > 0
    ? messages[Math.floor(Math.random() * messages.length)]
    : '';

  return {
    shouldNudge: urgency !== 'none',
    urgency,
    message,
    hoursSinceLastInteraction,
    decayApplied,
  };
}

/** 检查关系衰减并返回新分数 */
export function applyRelationshipDecay(
  scores: RelationshipScores,
  history: InteractionRecord[],
): DecayResult {
  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
  const lastInteraction = sorted[0];

  if (!lastInteraction) {
    return { scores, decayMessage: null };
  }

  const hoursSince = Math.round((Date.now() - lastInteraction.timestamp) / HOUR_MS);

  // 24h 内无衰减
  if (hoursSince < 24) {
    return { scores, decayMessage: null };
  }

  const daysGone = Math.floor(hoursSince / 24);

  // 衰减计算
  const decayRate = Math.min(0.15, daysGone * 0.03);
  const newIntimacy = Math.round(Math.max(3, scores.intimacy * (1 - decayRate)));
  const newStability = Math.round(Math.max(5, scores.stability - daysGone * 2));
  const newTrust = Math.round(Math.max(5, scores.trust - daysGone * 0.5));

  const overall = Math.round(newTrust * 0.3 + newIntimacy * 0.4 + newStability * 0.3);
  const stage = scores.stage; // 衰减不改阶段(阶段只在正向增长时升级)

  let decayMessage: string | null = null;
  if (daysGone >= 2 && daysGone < 5) {
    decayMessage = '几天没有互动，关系有些冷却…';
  } else if (daysGone >= 5) {
    decayMessage = `已经${daysGone}天没有联系了。你们的关系正在疏远。`;
  }

  return {
    scores: { trust: newTrust, intimacy: newIntimacy, stability: newStability, overall, stage },
    decayMessage,
  };
}

/** 连续互动加成：为关系分数应用额外增长 */
export function applyStreakBonus(
  scores: RelationshipScores,
  streak: number,
): { scores: RelationshipScores; bonus: number } {
  if (streak < 3) return { scores, bonus: 0 };

  const bonus = Math.min(10, Math.floor(streak / 3));
  const newIntimacy = Math.min(100, scores.intimacy + bonus);
  const newStability = Math.min(100, scores.stability + Math.floor(bonus * 0.5));
  const overall = Math.round(scores.trust * 0.3 + newIntimacy * 0.4 + newStability * 0.3);

  return {
    scores: { ...scores, intimacy: newIntimacy, stability: newStability, overall },
    bonus,
  };
}
