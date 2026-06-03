// ─── 对话上下文引擎 ───
// 职责: 提取话题、维护对话上下文、确保回复语义对齐用户输入
// Phase 12: lastBotOffer / userConfirmation
// Phase 13: PendingAction 多轮任务状态

import type { ChatMessage, BoyfriendTypeId } from '../types';

// ══════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════

export type TopicCategory =
  | 'food' | 'work' | 'emotion' | 'relationship'
  | 'daily' | 'hobby' | 'question' | 'social' | 'greeting' | 'other';

// Phase 13: 多轮任务状态
export type PendingActionType = 'tell_joke' | 'comfort' | 'advice' | 'explain' | 'companionship' | 'listen' | 'hug';

export interface PendingAction {
  type: PendingActionType;
  source: 'user_request' | 'bot_offer';
  createdAt: number;
  expiresAfterTurns: number;
  fulfilled: boolean;
  turnCount: number;
  topic?: string;
}

/** 创建新的 pending action */
export function createPendingAction(type: PendingActionType, source: 'user_request' | 'bot_offer', topic?: string): PendingAction {
  return {
    type,
    source,
    createdAt: Date.now(),
    expiresAfterTurns: 4,
    fulfilled: false,
    turnCount: 0,
    topic,
  };
}

/** 判断 pendingAction 是否已过期 */
export function isPendingActionExpired(action: PendingAction): boolean {
  return action.turnCount >= action.expiresAfterTurns;
}

export interface ConversationTopic {
  category: TopicCategory;
  subject: string;
  keywords: string[];
  isQuestion: boolean;
  sentiment: number;
  turnIndex: number;
}

export interface ConversationContext {
  currentTopic: ConversationTopic;
  previousTopics: ConversationTopic[];
  turnCount: number;
  isNewTopic: boolean;
  topicPersistence: number;
}

// ══════════════════════════════════════════════
// Phase 12: Bot Offer 识别
// ══════════════════════════════════════════════

export type BotOfferType = 'tell_joke' | 'comfort' | 'advice' | 'companionship' | 'listen' | 'hug';

export interface BotOffer {
  type: BotOfferType;
  text: string;
  detected: boolean;
}

/** 从上一条 bot 消息中识别它主动提出了什么 */
export function detectBotOffer(lastBotMessage: ChatMessage | undefined): BotOffer | null {
  if (!lastBotMessage || lastBotMessage.sender !== 'boyfriend') return null;

  const text = lastBotMessage.content;

  // 冷笑话相关
  if (/冷笑话|讲个笑话|笑话|逗你|好笑|搞笑的/.test(text)) {
    return { type: 'tell_joke', text, detected: true };
  }

  // 安慰/哄
  if (/安慰|别难过|哄哄|哄你|不难过|开心起来|心情好/.test(text)) {
    return { type: 'comfort', text, detected: true };
  }

  // 建议/想办法/出主意
  if (/建议|办法|想办法|帮你想|出主意|分析|方案/.test(text)) {
    return { type: 'advice', text, detected: true };
  }

  // 陪伴/聊聊/陪你
  if (/陪你|聊聊|聊一聊|陪你聊|陪你聊聊|和我说|跟我说/.test(text)) {
    return { type: 'companionship', text, detected: true };
  }

  // 倾听/说说/告诉我
  if (/说说|告诉我|发生了什么|怎么了|讲讲|什么事/.test(text)) {
    return { type: 'listen', text, detected: true };
  }

  // 抱抱
  if (/抱抱|抱一下|拥抱|给你抱/.test(text)) {
    return { type: 'hug', text, detected: true };
  }

  // 疑问句+建议性质 → 可能是 offer
  if (/要不要|想不想|要不要我|要不我|不如我/.test(text)) {
    if (/讲|说|告诉/.test(text)) return { type: 'tell_joke', text, detected: true };
    if (/安慰|哄/.test(text)) return { type: 'comfort', text, detected: true };
    if (/帮|建议|办法/.test(text)) return { type: 'advice', text, detected: true };
    if (/陪|聊/.test(text)) return { type: 'companionship', text, detected: true };
  }

  return null;
}

// ══════════════════════════════════════════════
// Phase 12: 用户确认检测
// ══════════════════════════════════════════════

const CONFIRMATION_PATTERNS = [
  /^(好|好的|好啊|好呀|好啦|好吧|好哦|嗯嗯|嗯嗯嗯|嗯!|嗯！|嗯呢|ok|OK|行|行吧|可以|可|对|对的|是的|是|要|想|需要)$/,
  /^(那你|那你快|快|快给我|给我|你|你就|请|请开始|现在)(讲|讲讲|讲一下|说说|说一下|说来听听|说|说吧|来|来吧|开始)/,
  /^(继续|继续啊|然后|然后呢|接下来|接着|接着呢|往下|往下说)/,
  /^(我要听|我想听|我要|我想|我想看|我要看|说来听听|洗耳恭听)/,
  /^(真的吗|是吗|真的假的|真的？|是吗？)/,  // 半信半疑也是确认
];

/** 检测用户消息是否是对 bot offer 的确认/承接 */
export function isUserConfirmation(userMessage: string): boolean {
  const trimmed = userMessage.trim();
  if (trimmed.length > 15) return false; // 太长的是新话题，不是确认

  for (const pattern of CONFIRMATION_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  return false;
}

/** 获取确认后的 intent：继承 bot offer 的类型 */
export function getConfirmationIntent(offer: BotOffer): string {
  switch (offer.type) {
    case 'tell_joke': return 'fulfill_joke';
    case 'comfort': return 'fulfill_comfort';
    case 'advice': return 'fulfill_advice';
    case 'companionship': return 'fulfill_companionship';
    case 'listen': return 'fulfill_listen';
    case 'hug': return 'fulfill_hug';
    default: return 'fulfill_listen';
  }
}

// ══════════════════════════════════════════════
// Phase 13: 用户主动请求检测
// ══════════════════════════════════════════════

/** 检测用户是否在明确请求某个动作（不是"帮我"这种泛化请求） */
export function detectUserActionRequest(userMessage: string): PendingActionType | null {
  const msg = userMessage.trim();

  // 明确请求讲笑话
  if (/讲.*笑话|说.*笑话|讲个.*笑|说个.*笑|给.*讲.*笑|来.*个.*笑|讲段子|说段子/.test(msg)) {
    return 'tell_joke';
  }

  // 明确请求建议/办法
  if (/怎么办|我该怎么办|怎么处理|怎么解决|出个主意|给.*建议|帮.*想办法|教.*怎么|有什么办法/.test(msg)) {
    return 'advice';
  }

  // 明确请求解释/原因
  if (/为什么|怎么会|怎么会这样|什么原因|什么理由|解释一下|解释|怎么回事|怎么会呢/.test(msg)) {
    return 'explain';
  }

  // 明确请求安慰
  if (/安慰|哄哄|哄我|抱抱|给我抱|抱一下|求安慰/.test(msg)) {
    return 'comfort';
  }

  // 明确请求陪伴
  if (/陪我|陪陪我|陪我说|聊聊天|跟我说|听我说|陪着我/.test(msg)) {
    return 'companionship';
  }

  return null;
}

// ══════════════════════════════════════════════
// Phase 13: 跟进提示检测（"你说/快讲/怎么不讲"等）
// ══════════════════════════════════════════════

const FOLLOW_UP_PATTERNS = [
  /^(你说|你讲|说吧|讲吧|讲啊|说啊|快讲|快说|说呀|讲呀)$/,
  /^(你倒是|倒是)(说|讲|说话)/,
  /^(怎么|怎么还|为啥|为什么)(不讲|不说|不讲呢|不说呢|不讲啊)/,
  /^(然后|然后呢|继续|继续啊|接着说|往下|往下说|接下来)/,
  /^(还没讲|还没说|没讲完|没说完)/,
  /^(我等着|等着|等你讲|等你|在等|还在等)/,
  /^(说话|说话啊|出声|出声啊|在不在|还在吗)/,
];

/** 检测用户消息是否是催促/跟进 bot 执行某动作 */
export function isFollowUpPrompt(userMessage: string): boolean {
  const trimmed = userMessage.trim();
  if (trimmed.length > 12) return false;

  for (const pattern of FOLLOW_UP_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  return false;
}

// ══════════════════════════════════════════════
// 话题提取 (保持原有功能)
// ══════════════════════════════════════════════

const TOPIC_PATTERNS: { pattern: RegExp; category: TopicCategory; subjectHint: string }[] = [
  { pattern: /吃|喝|美食|咖啡|奶茶|甜品|蛋糕|火锅|烧烤|餐厅|做饭|下厨|好吃|早餐|午餐|晚餐|饿了|饱了|外卖|零食|水果|饮料|茶|酒/, category: 'food', subjectHint: '食物/饮食' },
  { pattern: /工作|上班|加班|开会|项目|老板|同事|公司|面试|辞职|升职|工资|任务|报告|PPT|Excel|邮件|客户|出差|下班/, category: 'work', subjectHint: '工作' },
  { pattern: /难过|伤心|不开心|焦虑|压力|痛苦|失望|郁闷|烦躁|委屈|害怕|担心|生气|讨厌|无聊|累了|累了|开心|高兴|快乐|幸福|兴奋|期待|感动/, category: 'emotion', subjectHint: '情绪/感受' },
  { pattern: /我们|在一起|恋爱|喜欢|爱|想你|思念|约会|表白|牵手|拥抱|亲|吻|分手|复合|信任|依赖|陪伴|在一起|永远/, category: 'relationship', subjectHint: '感情/关系' },
  { pattern: /天气|下雨|晴天|下雪|冷|热|睡觉|失眠|熬夜|困|梦|醒了|起床|出门|回家|路上|堵车|地铁|公交|打车/, category: 'daily', subjectHint: '日常生活' },
  { pattern: /运动|健身|跑步|瑜伽|游泳|打球|篮球|足球|游戏|音乐|歌|电影|剧|综艺|书|小说|画|展|拍照|摄影|旅行|旅游|出去玩|逛街|购物|买/, category: 'hobby', subjectHint: '兴趣爱好' },
  { pattern: /朋友|闺蜜|家人|妈妈|爸爸|父母|姐妹|兄弟|同学|室友|同事|邻居|亲戚/, category: 'social', subjectHint: '社交/人际关系' },
  { pattern: /^(你好|hi|hello|嗨|早|晚安|早安|下午好|晚上好|在吗|哈喽|拜拜|再见|bye)/, category: 'greeting', subjectHint: '问候' },
];

export function extractTopic(message: string, turnIndex = 0): ConversationTopic {
  const isQuestion = /[?？]/.test(message) || /(吗|呢|吧|什么|怎么|为什么|谁|哪|多少|能不能|可以吗)/.test(message);
  const sentiment = analyzeSentiment(message);

  let bestMatch: { category: TopicCategory; subjectHint: string; matchLen: number } = {
    category: 'other', subjectHint: '', matchLen: 0,
  };

  for (const { pattern, category, subjectHint } of TOPIC_PATTERNS) {
    const match = message.match(pattern);
    if (match && match[0].length > bestMatch.matchLen) {
      bestMatch = { category, subjectHint, matchLen: match[0].length };
    }
  }

  if (bestMatch.category === 'other' && isQuestion) {
    bestMatch.category = 'question';
    bestMatch.subjectHint = '提问';
  }

  const keywords = extractKeywords(message);

  return {
    category: bestMatch.category,
    subject: bestMatch.subjectHint || message.slice(0, 15),
    keywords,
    isQuestion,
    sentiment,
    turnIndex,
  };
}

export function getConversationContext(
  recentMessages: ChatMessage[],
  currentMessage: string,
): ConversationContext {
  const userMessages = recentMessages.filter((m) => m.sender === 'user');
  const currentTopic = extractTopic(currentMessage, userMessages.length);

  const previousTopics = userMessages.slice(-3).map((m, i) =>
    extractTopic(m.content, i),
  );

  const lastTopic = previousTopics[previousTopics.length - 1];
  const isNewTopic = lastTopic
    ? lastTopic.category !== currentTopic.category
    : true;

  const recentCategories = [...previousTopics.map((t) => t.category), currentTopic.category];
  let sameCount = 0;
  for (let i = recentCategories.length - 1; i >= 0; i--) {
    if (recentCategories[i] === currentTopic.category) sameCount++;
    else break;
  }
  const topicPersistence = Math.min(1, sameCount / Math.max(1, recentCategories.length));

  return {
    currentTopic,
    previousTopics: previousTopics.slice(-3),
    turnCount: userMessages.length + 1,
    isNewTopic,
    topicPersistence,
  };
}

export function maintainConversationContext(
  context: ConversationContext,
): { shouldFollowTopic: boolean; topicAnchor: string } {
  const { currentTopic } = context;
  const shouldFollowTopic = true;
  const topicAnchor = currentTopic.category !== 'other' ? currentTopic.subject : '';
  return { shouldFollowTopic, topicAnchor };
}

// ══════════════════════════════════════════════
// 回复对齐校验
// ══════════════════════════════════════════════

export function isReplyAligned(
  reply: string,
  topic: ConversationTopic,
): { aligned: boolean; score: number; reason: string } {
  if (topic.category === 'greeting') return { aligned: true, score: 100, reason: '问候无需话题对齐' };

  if (topic.category === 'emotion') {
    const emotionWords = /安慰|没事|别难过|开心|笑|难过|心疼|懂你|理解|陪|在|抱|加油|坚强|会好的|放松/;
    const hasEmotionResponse = emotionWords.test(reply);
    if (!hasEmotionResponse) {
      return { aligned: false, score: 30, reason: '情绪类消息需要情绪回应' };
    }
    return { aligned: true, score: 85, reason: '有情绪回应' };
  }

  if (topic.category === 'question' || topic.isQuestion) {
    const answerIndicators = /是|不是|对|不对|可以|不行|能|不能|会|不会|因为|所以|应该|可能|大概|我觉得|我认为|让我|好|没问题/;
    const hasAnswer = answerIndicators.test(reply);
    if (!hasAnswer) {
      return { aligned: false, score: 25, reason: '用户提问需要回答' };
    }
    return { aligned: true, score: 80, reason: '有回答内容' };
  }

  if (topic.category === 'relationship') {
    const relationshipWords = /喜欢|爱|想|你|我们|在一起|永远|陪|心动|甜|幸福|开心|重要|特别|唯一|宝贝|亲爱的/;
    const hasRelationshipResponse = relationshipWords.test(reply);
    if (!hasRelationshipResponse) {
      return { aligned: false, score: 30, reason: '关系类消息需要感情回应' };
    }
    return { aligned: true, score: 85, reason: '有感情回应' };
  }

  if (topic.keywords.length > 0) {
    const replyLower = reply.toLowerCase();
    const overlapCount = topic.keywords.filter((kw) => replyLower.includes(kw.toLowerCase())).length;
    const overlapRatio = overlapCount / topic.keywords.length;

    if (overlapRatio >= 0.3) {
      return { aligned: true, score: 70 + Math.round(overlapRatio * 30), reason: '关键词匹配' };
    }
    if (overlapRatio === 0 && topic.keywords.length >= 2) {
      return { aligned: false, score: 15, reason: '回复未涉及用户提到的内容' };
    }
  }

  return { aligned: true, score: 60, reason: '通用回复' };
}

export function enforceTopicAlignment(
  reply: string,
  topic: ConversationTopic,
  typeId: BoyfriendTypeId,
): string {
  if (topic.category === 'greeting') return reply;

  const alreadyAligned = topic.keywords.some((kw) => reply.includes(kw));
  if (alreadyAligned) return reply;

  const anchors: Record<TopicCategory, Record<string, string[]>> = {
    greeting: {
      puppy: ['嗨！', '姐姐！'],
      gentleman: ['你好。', '嗯。'],
      artist: ['嗨…', '你好…'],
      ceo: ['你好。', '嗯。'],
      childhood: ['嗨！', '嘿嘿！'],
      senior: ['你好。', '嗯。'],
    },
    food: {
      puppy: ['说到吃…', '姐姐说到吃的…', '关于美食…'],
      gentleman: ['说到饮食…', '你提到的…'],
      artist: ['食物是生活的艺术…', '你说的让我想到…'],
      ceo: ['关于你提到的…', '切换到食物话题…'],
      childhood: ['哎说到吃的！', '你一说吃的…'],
      senior: ['关于你提到的食物…', '饮食相关…'],
    },
    work: {
      puppy: ['姐姐说到工作…', '工作的事…'],
      gentleman: ['工作方面…', '你提到的事情…'],
      artist: ['工作是生活的颜料…', '你说的让我在想…'],
      ceo: ['关于工作…', '你的事…'],
      childhood: ['工作的事啊！', '说到工作…'],
      senior: ['关于你的工作…', '职场相关…'],
    },
    emotion: {
      puppy: ['姐姐的心情…', '姐姐现在…'],
      gentleman: ['你的心情…', '你现在感觉…'],
      artist: ['你的情绪像…', '我能感受到…'],
      ceo: ['你的状态…', '你现在…'],
      childhood: ['你现在的感觉…', '你心情…'],
      senior: ['你的情绪状态…', '关于你的感受…'],
    },
    relationship: {
      puppy: ['关于我们…', '姐姐和我…'],
      gentleman: ['我们之间…', '关于我们的关系…'],
      artist: ['我们的关系像…', '你和我之间…'],
      ceo: ['我们…', '关于你和我…'],
      childhood: ['咱俩…', '我们之间…'],
      senior: ['关于我们的关系…', '你和我…'],
    },
    daily: {
      puppy: ['日常的话…', '姐姐说的这个…'],
      gentleman: ['生活方面…', '你说的这个…'],
      artist: ['生活是…', '日常的点滴…'],
      ceo: ['日常。', '你的事。'],
      childhood: ['这个啊！', '你说的这个…'],
      senior: ['生活中…', '你说的这个…'],
    },
    hobby: {
      puppy: ['姐姐喜欢…', '你说的这个…'],
      gentleman: ['兴趣方面…', '你说的…'],
      artist: ['兴趣让你的灵魂发光…', '你说的…'],
      ceo: ['你的兴趣…', '那个。'],
      childhood: ['这个我有经验！', '说到这个…'],
      senior: ['关于这个爱好…', '你提到的…'],
    },
    social: {
      puppy: ['姐姐说到朋友…', '身边的人…'],
      gentleman: ['人际关系方面…', '你提到的人…'],
      artist: ['人是复杂的颜色…', '你身边的人…'],
      ceo: ['关于你提到的人…', '社交。'],
      childhood: ['你说的人我认识吗？', '身边的人…'],
      senior: ['关于社交关系…', '你提到的人…'],
    },
    question: {
      puppy: ['姐姐问得好！', '这个问题…'],
      gentleman: ['好问题。', '关于你的问题…'],
      artist: ['你的问题像…', '让我想想…'],
      ceo: ['问得好。', '直接回答…'],
      childhood: ['哈哈你问对人了！', '这个问题…'],
      senior: ['分析你的问题…', '关于这个…'],
    },
    other: {
      puppy: ['嗯！', '对对…'],
      gentleman: ['嗯。', '你说的…'],
      artist: ['…', '让我想想…'],
      ceo: ['嗯。', '说下去。'],
      childhood: ['嗯嗯！', '对对…'],
      senior: ['了解。', '继续。'],
    },
  };

  const typeAnchors = anchors[topic.category] ?? anchors.other;
  const options = typeAnchors[typeId] ?? typeAnchors.puppy ?? ['你说的…'];
  const anchor = options[Math.floor(Math.random() * options.length)];

  return `${anchor} ${reply}`;
}

// ══════════════════════════════════════════════
// 辅助
// ══════════════════════════════════════════════

const POSITIVE_WORDS = ['开心', '高兴', '喜欢', '爱', '好', '棒', '赞', '哈哈', '嘿嘿', '谢谢', '想你', '期待', '快乐', '幸福', '美好', '可爱', '好看', '好吃', '有趣', '厉害'];
const NEGATIVE_WORDS = ['难过', '伤心', '累', '烦', '生气', '讨厌', '不好', '无聊', '焦虑', '压力', '痛苦', '失望', '不开心', '糟糕', '郁闷', '烦躁', '委屈', '害怕', '担心'];

function analyzeSentiment(message: string): number {
  let score = 0;
  for (const w of POSITIVE_WORDS) { if (message.includes(w)) score += 0.2; }
  for (const w of NEGATIVE_WORDS) { if (message.includes(w)) score -= 0.2; }
  return Math.max(-1, Math.min(1, score));
}

function extractKeywords(message: string): string[] {
  const chineseWords = message.match(/[一-龥]{2,4}/g) ?? [];
  const stopWords = new Set(['什么', '怎么', '为什么', '可以', '能不能', '是不是', '有没有', '怎么样', '这个', '那个', '我觉得', '好像', '其实', '就是', '不过', '然后', '但是', '所以', '因为', '一定', '真的']);
  return [...new Set(chineseWords.filter((w) => !stopWords.has(w)))].slice(0, 5);
}
