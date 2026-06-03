// ─── 轻量记忆引擎 (纯函数，零副作用) ───
// 职责: 记录用户偏好关键词 / 情绪倾向 → 影响后续回复语气

import type { EmotionTag } from '../types';

// ─── 记忆条目 ───
export interface MemoryEntry {
  keyword: string;
  category: 'topic' | 'preference' | 'person' | 'activity' | 'emotion';
  sentiment: number;        // -1 (负面) ~ +1 (正面)
  frequency: number;        // 提及次数
  lastMentioned: number;    // timestamp
}

export interface UserMemory {
  entries: MemoryEntry[];
  dominantMood: number;     // 累积情绪值 (-1 ~ +1)
  topTopics: string[];      // 最近热门话题
  knownFacts: string[];     // 用户提到过的事实
}

// ─── 情绪关键词检测 ───
const POSITIVE_WORDS = ['开心', '高兴', '喜欢', '爱', '好', '棒', '赞', '哈哈', '嘿嘿', '谢谢', '想你', '期待', '快乐', '幸福', '美好', '可爱', '好看', '好吃', '有趣', '厉害', '太棒了', '不错', 'yes', 'cool', 'nice'];
const NEGATIVE_WORDS = ['难过', '伤心', '累', '烦', '生气', '讨厌', '不好', '无聊', '焦虑', '压力', '痛苦', '失望', '不开心', '糟糕', '郁闷', '烦躁', '委屈', '害怕', '担心', '不开心'];

// ─── 关键词提取 ───
const TOPIC_INDICATORS: { pattern: RegExp; category: MemoryEntry['category'] }[] = [
  { pattern: /吃|喝|美食|咖啡|奶茶|甜品|蛋糕|火锅|烧烤|餐厅|做饭|下厨/, category: 'activity' },
  { pattern: /工作|上班|加班|开会|项目|老板|同事|公司|面试/, category: 'topic' },
  { pattern: /猫|狗|宠物|动物/, category: 'preference' },
  { pattern: /旅行|旅游|出去玩|度假|海边|山|城市/, category: 'activity' },
  { pattern: /电影|剧|综艺|音乐|歌|书|小说|画|展/, category: 'preference' },
  { pattern: /运动|健身|跑步|瑜伽|游泳|打球|篮球|足球/, category: 'activity' },
  { pattern: /朋友|闺蜜|家人|妈妈|爸爸|姐妹|兄弟/, category: 'person' },
  { pattern: /买|购物|逛街|衣服|化妆品|包包|鞋子/, category: 'activity' },
  { pattern: /学习|考试|课程|作业|读书|复习|图书馆/, category: 'topic' },
  { pattern: /游戏|打游戏|手游|电竞|Switch|PS5/, category: 'preference' },
  { pattern: /天气|下雨|晴天|下雪|冷|热/, category: 'topic' },
  { pattern: /睡觉|失眠|熬夜|困|梦/, category: 'topic' },
  { pattern: /照片|拍照|摄影|自拍|相机/, category: 'activity' },
  { pattern: /花|植物|花园|草|树/, category: 'preference' },
];

// ─── 公开 API ───

/** 创建空记忆 */
export function createMemory(): UserMemory {
  return { entries: [], dominantMood: 0, topTopics: [], knownFacts: [] };
}

/** 从用户消息中提取关键词和情绪 */
export function analyzeMessage(content: string): {
  sentiment: number;
  emotion: EmotionTag;
  keywords: string[];
  categories: MemoryEntry['category'][];
} {
  // 情绪检测
  let sentiment = 0;
  const lower = content.toLowerCase();

  for (const w of POSITIVE_WORDS) {
    if (lower.includes(w)) sentiment += 0.15;
  }
  for (const w of NEGATIVE_WORDS) {
    if (lower.includes(w)) sentiment -= 0.15;
  }
  sentiment = Math.max(-1, Math.min(1, sentiment));

  const emotion: EmotionTag =
    sentiment > 0.3 ? 'happy' :
    sentiment < -0.3 ? 'concerned' :
    content.includes('?') || content.includes('？') ? 'playful' : 'gentle';

  // 关键词提取
  const keywords: string[] = [];
  const categories: MemoryEntry['category'][] = [];

  for (const { pattern, category } of TOPIC_INDICATORS) {
    const match = content.match(pattern);
    if (match) {
      keywords.push(match[0]);
      if (!categories.includes(category)) categories.push(category);
    }
  }

  return { sentiment, emotion, keywords, categories };
}

/** 更新记忆: 将新消息合并到现有记忆中 */
export function updateMemory(memory: UserMemory, content: string): UserMemory {
  const analysis = analyzeMessage(content);
  const now = Date.now();

  // 更新 dominantMood (指数移动平均)
  const alpha = 0.3;
  const newMood = memory.dominantMood * (1 - alpha) + analysis.sentiment * alpha;

  // 更新 entries
  const entries = [...memory.entries];

  for (const kw of analysis.keywords) {
    const existing = entries.find((e) => e.keyword === kw);
    if (existing) {
      existing.frequency += 1;
      existing.sentiment = existing.sentiment * 0.7 + analysis.sentiment * 0.3;
      existing.lastMentioned = now;
    } else {
      const cat = analysis.categories[0] ?? 'topic';
      entries.push({
        keyword: kw,
        category: cat,
        sentiment: analysis.sentiment,
        frequency: 1,
        lastMentioned: now,
      });
    }
  }

  // 提取事实 (简单句式: "我喜欢/我是/我在...")
  const factPatterns = [
    /我喜欢(.+?)(?:[。！，]|$)/g,
    /我是(.+?)(?:[。！，]|$)/g,
    /我在(.+?)(?:[。！，]|$)/g,
    /我想(.+?)(?:[。！，]|$)/g,
  ];

  const knownFacts = [...memory.knownFacts];
  for (const pattern of factPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const fact = match[0].trim();
      if (!knownFacts.includes(fact) && fact.length < 30) {
        knownFacts.push(fact);
      }
    }
  }

  // 按频率排序 topTopics
  const sorted = entries
    .filter((e) => e.lastMentioned > now - 3600000) // 1小时内
    .sort((a, b) => b.frequency - a.frequency);

  return {
    entries,
    dominantMood: Math.round(newMood * 100) / 100,
    topTopics: sorted.slice(0, 5).map((e) => e.keyword),
    knownFacts: knownFacts.slice(-10),
  };
}

/** 获取记忆摘要 (供 chatEngine 使用) */
export function getMemoryContext(memory: UserMemory): string {
  const parts: string[] = [];

  if (memory.knownFacts.length > 0) {
    parts.push(`已知信息: ${memory.knownFacts.slice(-3).join('; ')}`);
  }

  if (memory.topTopics.length > 0) {
    parts.push(`最近话题: ${memory.topTopics.slice(0, 3).join('、')}`);
  }

  if (memory.dominantMood > 0.3) {
    parts.push('用户情绪: 积极开朗');
  } else if (memory.dominantMood < -0.3) {
    parts.push('用户情绪: 需要安慰');
  }

  return parts.join(' | ');
}
