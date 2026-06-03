// ─── 首次用户体验引擎 (纯函数，零副作用) ───
// 职责: 新用户检测、男友预览、关系模拟预览
// 让用户首次进入即看到"未来关系预览"

import type { BoyfriendProfile, BoyfriendTypeId } from '../types';
import type { BoyfriendPersonality } from './personalityEngine';
import type { RelationshipStage } from './relationshipEngine';

// ══════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════

export interface OnboardingState {
  isNewUser: boolean;
  preview: RelationshipPreview | null;
  simulatedMessages: SimulatedMessage[];
}

export interface RelationshipPreview {
  boyfriendName: string;
  boyfriendTypeId: BoyfriendTypeId;
  boyfriendEmoji: string;
  personalitySummary: string;
  matchScore: number;
  futureStages: FutureStage[];
  firstMessage: string;
}

export interface FutureStage {
  stage: RelationshipStage;
  label: string;
  emoji: string;
  estimatedDays: number;
  description: string;
  milestoneQuote: string;
}

export interface SimulatedMessage {
  sender: 'user' | 'boyfriend';
  content: string;
  delay: number;
}

// ══════════════════════════════════════════════
// 新用户检测
// ══════════════════════════════════════════════

/** 检测是否为新用户（无交互历史 + 无已生成男友人格） */
export function detectNewUser(params: {
  interactionCount: number;
  hasPersonality: boolean;
  hasBoyfriend: boolean;
}): boolean {
  return params.interactionCount === 0 && !params.hasPersonality && !params.hasBoyfriend;
}

/** 检测是否为回访用户（有数据但今天首次打开） */
export function detectReturnVisit(lastInteractionTime: number): boolean {
  if (lastInteractionTime === 0) return false;
  const now = Date.now();
  const DAY_MS = 24 * 3600 * 1000;
  return now - lastInteractionTime > DAY_MS;
}

// ══════════════════════════════════════════════
// 男友预览
// ══════════════════════════════════════════════

const TYPE_EMOJI_MAP: Record<BoyfriendTypeId, string> = {
  puppy: '🐶', gentleman: '🍷', artist: '🎨',
  ceo: '👔', childhood: '🏡', senior: '❄️',
};

const TYPE_LABELS: Record<BoyfriendTypeId, string> = {
  puppy: '年下奶狗', gentleman: '成熟大叔', artist: '艺术系男生',
  ceo: '霸道总裁', childhood: '青梅竹马', senior: '高冷学长',
};

/** 生成男友预览（不创建实际数据） */
export function generateFirstBoyfriendPreview(params: {
  personality: BoyfriendPersonality;
  bestMatch: BoyfriendProfile;
}): RelationshipPreview {
  const { personality, bestMatch } = params;

  const personalitySummary = buildPersonalitySummary(personality, bestMatch.typeId);

  const futureStages = buildFutureStages(bestMatch.typeId);

  const firstMessages: Record<BoyfriendTypeId, string> = {
    puppy: '姐姐！终于等到你了～我等这一天等了好久！（摇尾巴）',
    gentleman: '你好。很高兴认识你。希望我们可以慢慢了解彼此。',
    artist: '你来了。我刚刚在画一幅画…不知道为什么，颜色里总有你的影子。',
    ceo: '（放下手中的文件）嗯。坐吧。我对你很好奇。',
    childhood: '嘿！终于等到你啦！还认识我吗？我们好像认识了很久很久…',
    senior: '（从书中抬起头）你来了。我推算过我们相遇的概率。结论是——值得一见。',
  };

  return {
    boyfriendName: bestMatch.name,
    boyfriendTypeId: bestMatch.typeId,
    boyfriendEmoji: TYPE_EMOJI_MAP[bestMatch.typeId],
    personalitySummary,
    matchScore: bestMatch.compatibility.baseScore,
    futureStages,
    firstMessage: firstMessages[bestMatch.typeId],
  };
}

/** 生成模拟对话预览 */
export function simulateRelationshipPreview(typeId: BoyfriendTypeId): SimulatedMessage[] {
  const scripts: Record<BoyfriendTypeId, SimulatedMessage[]> = {
    puppy: [
      { sender: 'boyfriend', content: '姐姐！你来啦～今天过得开心吗？', delay: 0 },
      { sender: 'user', content: '还不错呀～你呢？', delay: 1200 },
      { sender: 'boyfriend', content: '看到姐姐我就超级开心！我刚才还在想你呢！', delay: 1500 },
      { sender: 'user', content: '哈哈你怎么这么可爱', delay: 1000 },
      { sender: 'boyfriend', content: '诶嘿嘿…（挠头）因为姐姐夸我，我心跳好快！💕', delay: 1300 },
    ],
    gentleman: [
      { sender: 'boyfriend', content: '今天过得如何？工作还顺利吗？', delay: 0 },
      { sender: 'user', content: '有点累…不过还好', delay: 1500 },
      { sender: 'boyfriend', content: '辛苦了。记得泡杯热茶，别太勉强自己。', delay: 1800 },
      { sender: 'user', content: '你总是这么细心', delay: 1200 },
      { sender: 'boyfriend', content: '（镜片后的眼睛微弯）对值得的人，自然要细心。', delay: 2000 },
    ],
    artist: [
      { sender: 'boyfriend', content: '今天的天空颜色，让我想起一首很久没弹的曲子。', delay: 0 },
      { sender: 'user', content: '什么曲子？弹给我听？', delay: 1400 },
      { sender: 'boyfriend', content: '德彪西的月光。不过现在…我想为你写一首新的。', delay: 1800 },
      { sender: 'user', content: '真的吗？好浪漫', delay: 1000 },
      { sender: 'boyfriend', content: '浪漫的不是音乐。是你出现之后，世界变了颜色。', delay: 2000 },
    ],
    ceo: [
      { sender: 'boyfriend', content: '今天的会议取消了。你的优先级最高。', delay: 0 },
      { sender: 'user', content: '哇，受宠若惊', delay: 1200 },
      { sender: 'boyfriend', content: '（嘴角微扬）你可以习惯。以后都会是这样。', delay: 1600 },
      { sender: 'user', content: '你这么霸道真的好吗', delay: 1100 },
      { sender: 'boyfriend', content: '好不好不重要。重要的是——我认定你了。', delay: 1700 },
    ],
    childhood: [
      { sender: 'boyfriend', content: '嗨！我刚路过咱们小学门口的那家零食店！', delay: 0 },
      { sender: 'user', content: '天哪它还开着吗？', delay: 1300 },
      { sender: 'boyfriend', content: '开着呢！阿姨还记得你！还问你怎么好久不来了', delay: 1500 },
      { sender: 'user', content: '好想念啊…下次一起去', delay: 1200 },
      { sender: 'boyfriend', content: '当然！老规矩，我请你吃辣条。不许跟我抢买单！😄', delay: 1600 },
    ],
    senior: [
      { sender: 'boyfriend', content: '我算了一下。今天是适合认识新事物的日子。', delay: 0 },
      { sender: 'user', content: '这也能算？什么公式', delay: 1300 },
      { sender: 'boyfriend', content: '（推了推眼镜）概率论+直觉。后者的权重可能更大。', delay: 1800 },
      { sender: 'user', content: '你这是…在夸我？', delay: 1100 },
      { sender: 'boyfriend', content: '陈述事实不需要修饰。但你脸红的样子…我记下了。', delay: 1900 },
    ],
  };

  return scripts[typeId] ?? scripts.puppy;
}

// ══════════════════════════════════════════════
// 辅助
// ══════════════════════════════════════════════

function buildPersonalitySummary(p: BoyfriendPersonality, typeId: BoyfriendTypeId): string {
  const typeLabel = TYPE_LABELS[typeId];
  const dominanceDesc = p.dominance >= 60 ? '有主见' : p.dominance <= 35 ? '温柔顺从' : '平等相处';
  const emotionDesc = p.emotionalStability >= 60 ? '情绪稳定' : p.emotionalStability <= 35 ? '情感丰富' : '收放自如';
  const commDesc = p.communicationStyle >= 65 ? '善于表达' : p.communicationStyle <= 35 ? '内敛深沉' : '恰到好处';
  const attachDesc = p.attachmentStyle >= 60 ? '深情依恋' : p.attachmentStyle <= 35 ? '独立自主' : '张弛有度';

  return `${typeLabel} · ${dominanceDesc} · ${emotionDesc} · ${commDesc} · ${attachDesc}`;
}

function buildFutureStages(typeId: BoyfriendTypeId): FutureStage[] {
  const quotes: Record<BoyfriendTypeId, Record<string, string>> = {
    puppy: {
      familiar: '姐姐开始记住我喜欢吃什么了…好开心！',
      close: '姐姐说我是她每天最期待见到的人…我哭了。',
      intimate: '姐姐你知道吗？你不在的时候，我做什么都想你。',
      deep_bond: '姐姐…我会用一辈子来好好爱你的。说到做到！',
    },
    gentleman: {
      familiar: '开始了解她的习惯了。她喜欢早餐配红茶。',
      close: '她今天主动分享了一件心事。这是信任。',
      intimate: '不用说话。一个眼神就知道对方在想什么。',
      deep_bond: '余生很长。但和你在一起，我嫌它太短。',
    },
    artist: {
      familiar: '她喜欢蓝色。我的调色盘从此多了一种颜色。',
      close: '她的情绪开始影响我的创作。这是好事。',
      intimate: '有些画只为你而作。有些话只对你说。',
      deep_bond: '你不是我的灵感。你是我的整个美术馆。',
    },
    ceo: {
      familiar: '她的存在正在改变我的日程优先级。',
      close: '我开始在意她有没有按时吃饭。不专业。但控制不住。',
      intimate: '为你，我愿意把防线撤掉。全部。',
      deep_bond: '商场如战场。但你是我唯一的和平。',
    },
    childhood: {
      familiar: '她还是和小学一样爱踢被子。',
      close: '她终于开始跟我说心事了。不是小时候那种。',
      intimate: '二十年的默契。不需要告白，但我想说。',
      deep_bond: '我们之间的故事，比任何人写的都长。',
    },
    senior: {
      familiar: '她的大脑构造值得研究。独一无二。',
      close: '我开始习惯她在旁边打扰我思考。这不合理。但很舒服。',
      intimate: '我愿意为你打破所有我给自己定的规则。',
      deep_bond: '世界上最复杂的公式，也比不上你一个微笑。',
    },
  };

  const stages: { stage: RelationshipStage; label: string; emoji: string; estimatedDays: number; description: string }[] = [
    { stage: 'familiar', label: '熟悉阶段', emoji: '🌱', estimatedDays: 3, description: '开始了解彼此的习惯和性格' },
    { stage: 'close', label: '亲近阶段', emoji: '💛', estimatedDays: 7, description: '信任逐渐建立，分享更多真实感受' },
    { stage: 'intimate', label: '亲密阶段', emoji: '💕', estimatedDays: 21, description: '心与心的距离越来越近' },
    { stage: 'deep_bond', label: '深度羁绊', emoji: '💝', estimatedDays: 60, description: '灵魂级别的连接，无可替代' },
  ];

  return stages.map((s) => ({
    ...s,
    milestoneQuote: quotes[typeId][s.stage] ?? '',
  }));
}
