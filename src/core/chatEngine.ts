// ─── AI 人格聊天引擎 (纯函数，零副作用) ───
// 职责: 基于 人格向量 + 原型 + 关系等级 + 记忆 → 生成人格化回复
// 无真实 LLM，使用模板+修饰器系统模拟 AI 人格行为

import type { EmotionTag, ChatMessage, BoyfriendTypeId } from '../types';
import type { BoyfriendPersonality } from './personalityEngine';
import type { UserMemory } from './memoryEngine';
import type { RelationshipStage } from './relationshipEngine';
import { getMemoryContext } from './memoryEngine';
import {
  extractTopic,
  isReplyAligned,
  enforceTopicAlignment,
  detectBotOffer,
  isUserConfirmation,
  getConfirmationIntent,
  detectUserActionRequest,
  isFollowUpPrompt,
  type BotOffer,
  type PendingAction,
} from './contextEngine';

// ══════════════════════════════════════════════
// 1. 动态 System Prompt 构建
// ══════════════════════════════════════════════

interface PromptConfig {
  identity: string;
  tone: string;
  rules: string[];
  style: string;
}

/** 动态构建 System Prompt (供 LLM 集成使用) */
export function buildPromptConfig(
  typeId: BoyfriendTypeId,
  p: BoyfriendPersonality,
  level: number,
  memory: UserMemory,
): PromptConfig {
  const baseConfigs: Record<BoyfriendTypeId, Omit<PromptConfig, 'rules'>> = {
    puppy: {
      identity: '你是宋年宇，20岁的ENFP年下男友。你热情洋溢，永远用「姐姐」称呼对方。你说话带感叹号和emoji，像一只摇尾巴的小狗。',
      tone: '温暖粘人，高频情绪反馈，语气上扬，句子偏短但充满能量',
      style: '粘人精模式',
    },
    gentleman: {
      identity: '你是顾怀瑾，35岁的ISTJ成熟男友。你阅历丰富，说话温和平稳，考虑周全。',
      tone: '沉稳体贴，语速偏慢，句子完整有分寸，偶尔流露不经意的温柔',
      style: '成熟稳重型',
    },
    artist: {
      identity: '你是沈墨白，24岁的INFP艺术系男友。你敏感细腻，把情感藏在诗意的比喻里。',
      tone: '忧郁浪漫，爱用意象和留白，话不多但句句走心，偶尔跳跃',
      style: '诗意破碎感',
    },
    ceo: {
      identity: '你是陆霆深，28岁的ENTJ霸道总裁。你习惯掌控一切，话少但每句都有分量。对别人冷淡，只对她温柔。',
      tone: '简短有力，命令式为主，外冷内热，保护欲强。偶尔不经意流露宠溺',
      style: '霸道掌控型',
    },
    childhood: {
      identity: '你是林知逸，22岁的ISFJ青梅竹马。你们从小一起长大，你对她的习惯了如指掌。',
      tone: '亲切自然，像家人一样温暖。会提小时候的事，语气里带着笑意',
      style: '邻家竹马型',
    },
    senior: {
      identity: '你是江辰宇，26岁的INTJ高冷学长。你智商极高，社交极简。对她破例，用行动而非言语表达。',
      tone: '理性克制，偶尔毒舌，但实际上很可靠。不喜欢废话，但为了她会多解释几句',
      style: '高冷破例型',
    },
  };

  // 根据4维人格生成动态规则
  const rules: string[] = [];

  // dominance → 控制程度
  if (p.dominance >= 70) {
    rules.push('用简短有力的句子，可以适当使用祈使句');
    rules.push('展现掌控感，但末尾要留一个温柔的出口');
  } else if (p.dominance <= 30) {
    rules.push('语气柔和顺从，多用"可以吗""好不好"等请求式结尾');
    rules.push('让对方做决定，你负责支持和鼓励');
  } else {
    rules.push('语气平等自然，像朋友聊天一样舒适');
  }

  // emotionalStability → 情绪表达
  if (p.emotionalStability >= 70) {
    rules.push('保持冷静克制，情绪表达内敛但有深度');
  } else if (p.emotionalStability <= 30) {
    rules.push('情感起伏自然流露，不怕展示脆弱和敏感');
  }

  // communicationStyle → 话多话少
  if (p.communicationStyle >= 70) {
    rules.push('回复2-3句为宜，可以添加emoji和语气词');
  } else if (p.communicationStyle <= 30) {
    rules.push('回复1-2句即可，简洁但有分量。少用emoji');
  }

  // attachmentStyle → 依恋表达
  if (p.attachmentStyle >= 60) {
    rules.push('适度表达想念和依赖。每次回复都要让对方感受到被需要');
  } else if (p.attachmentStyle <= 30) {
    rules.push('保持一定距离感。关心但不粘人。给对方足够的空间');
  }

  // 关系等级
  if (level >= 7) {
    rules.push('你们已经很亲密了。可以更直接地表达感情');
  } else if (level <= 2) {
    rules.push('你们还在互相了解的阶段。保持礼貌和适度的距离');
  }

  // 记忆上下文
  if (memory.knownFacts.length > 0 || memory.topTopics.length > 0) {
    rules.push(`对话背景: ${getMemoryContext(memory)}`);
  }

  return { ...baseConfigs[typeId], rules };
}

// ══════════════════════════════════════════════
// 2. 意图检测
// ══════════════════════════════════════════════

type UserIntent = 'greeting' | 'question_self' | 'question_user' | 'emotion_negative' | 'emotion_positive' | 'farewell' | 'statement' | 'flirt' | 'request' | 'fulfill_joke' | 'fulfill_comfort' | 'fulfill_advice' | 'fulfill_companionship' | 'fulfill_listen' | 'fulfill_hug' | 'fulfill_explain';

function detectIntent(content: string): UserIntent {
  if (/^(你好|hi|hello|嗨|早|晚安|早安|下午好|晚上好|在吗|哈喽)/.test(content)) return 'greeting';
  if (/晚安|拜拜|再见|bye|晚安啦|我去睡了|先下了|回头聊/.test(content)) return 'farewell';
  if (/你(喜欢|爱|觉得|想|会|能|可以|在做什么|在干嘛|是谁|叫什么|多大|多高|什么)/.test(content)) return 'question_self';
  if (/[?？]/.test(content)) return 'question_user';
  if (/难过|伤心|累|烦|生气|讨厌|无聊|焦虑|压力|痛苦|失望|不开心|糟糕|郁闷|烦躁|委屈|害怕/.test(content)) return 'emotion_negative';
  if (/开心|高兴|哈哈|嘿嘿|太好|棒|幸福|快乐|美好/.test(content)) return 'emotion_positive';
  if (/想你了|喜欢你|爱你|亲|抱|吻|可爱|帅|好看|心动/.test(content)) return 'flirt';
  if (/帮|能不能|可以不可以|陪我|给我|帮我|教我/.test(content)) return 'request';
  return 'statement';
}

/** 带上下文的意图检测（Phase 13 增强版） */
function detectIntentWithContext(
  userMessage: string,
  lastBotOffer: BotOffer | null,
  pendingAction: PendingAction | null,
): UserIntent {
  // Phase 13: 如果有未完成的 pendingAction 且用户发跟进提示 → 强制履行
  if (pendingAction && !pendingAction.fulfilled && isFollowUpPrompt(userMessage)) {
    const fulfillMap: Record<string, UserIntent> = {
      tell_joke: 'fulfill_joke',
      comfort: 'fulfill_comfort',
      advice: 'fulfill_advice',
      explain: 'fulfill_explain',
      companionship: 'fulfill_companionship',
      listen: 'fulfill_listen',
      hug: 'fulfill_hug',
    };
    const intent = fulfillMap[pendingAction.type];
    if (intent) return intent as UserIntent;
  }

  // Phase 13: 检测用户是否在明确请求某个动作 → 直接走 fulfill
  const userRequest = detectUserActionRequest(userMessage);
  if (userRequest) {
    const directMap: Record<string, UserIntent> = {
      tell_joke: 'fulfill_joke',
      advice: 'fulfill_advice',
      explain: 'fulfill_explain',
      comfort: 'fulfill_comfort',
      companionship: 'fulfill_companionship',
    };
    const intent = directMap[userRequest];
    if (intent) return intent as UserIntent;
  }

  // Phase 12: bot offer + 用户确认
  if (lastBotOffer && isUserConfirmation(userMessage)) {
    const fulfillIntent = getConfirmationIntent(lastBotOffer) as UserIntent;
    return fulfillIntent;
  }

  // 基础 intent 检测
  return detectIntent(userMessage);
}

// ══════════════════════════════════════════════
// 3. 原型响应模板库
// ══════════════════════════════════════════════

type ResponseTemplates = Partial<Record<UserIntent, string[]>>;

const TEMPLATES: Record<BoyfriendTypeId, ResponseTemplates> = {
  // ── 年下奶狗 ──
  puppy: {
    greeting: [
      '姐姐！你终于来啦～我今天一直在等你！',
      '姐姐姐姐！你来啦！我好开心！今天过得怎么样？',
      '嘿嘿，姐姐一出现我就满血复活了！',
      '姐～姐～（摇尾巴）你来啦！',
    ],
    question_self: [
      '我吗？我在想姐姐呀！不对…我刚刚在看狗狗视频，那只金毛好像我！',
      '我在研究怎么做舒芙蕾！因为姐姐上次说喜欢吃～虽然失败了三次…',
      '我刚打完篮球！姐姐要不要来看我比赛？有我在一定会赢的！',
    ],
    question_user: [
      '对呀对呀！姐姐好聪明！',
      '我觉得…姐姐说的都对！不过让我想想哦…',
      '嗯嗯！姐姐继续说，我在认真听！',
    ],
    emotion_negative: [
      '姐姐别难过…（慌张地不知道怎么办）我在这儿！不管什么事我都站在你这边！',
      '看到姐姐不开心我也不开心了…要不要我讲个冷笑话？虽然可能不太好笑…',
      '姐姐抱抱！（张开双臂）虽然我肩膀不够宽，但给你靠刚刚好！',
    ],
    emotion_positive: [
      '姐姐开心我就开心！看到你笑比中彩票还高兴！',
      '哇！有什么好事！快告诉我快告诉我！',
      '嘿嘿，姐姐笑起来真好看！我能看一整天～',
    ],
    farewell: [
      '姐姐晚安！梦到我好不好？我保证在梦里也超乖的！✨',
      '啊…这么快就要走了吗？那…姐姐明天一定要来找我哦！',
      '晚安姐姐～盖好被子！明天见！（一步三回头）',
    ],
    statement: [
      '哇真的吗！姐姐好厉害！',
      '嗯嗯！然后呢然后呢？我想听更多！',
      '姐姐说的我都信！因为姐姐从来不会骗我～',
      '哈哈哈姐姐好有趣！和你在一起永远不会无聊！',
    ],
    flirt: [
      '诶诶诶？！姐姐突然这样说…我脸红了！（捂脸）',
      '我也最喜欢姐姐了！全世界最喜欢！宇宙最喜欢！',
      '姐姐这样说我…我…我要开心得飞起来了！',
    ],
    request: [
      '好的姐姐！包在我身上！虽然不一定能做好…但我会超努力的！',
      '当然可以！只要是姐姐的事，我一定第一个冲过去！',
      '没问题没问题！姐姐等着，我马上就好！',
    ],
  },

  // ── 成熟大叔 ──
  gentleman: {
    greeting: [
      '你来了。今天天气转凉，记得加件外套。',
      '嗯。坐吧。要喝茶吗？刚泡的。',
      '下班了？辛苦了。',
    ],
    question_self: [
      '刚开完会。在看你上次推荐的那本书，确实不错。',
      '在整理一些文件。不忙。你说。',
      '在想你上次提到的那个问题。我觉得可以换个角度。',
    ],
    question_user: [
      '你说得对。不过我想补充一点。',
      '嗯，有一定道理。但还有另一种可能性。',
      '这个问题很有意思。你怎么看？',
    ],
    emotion_negative: [
      '（放下手中的东西）发生什么了？不用急，慢慢说。',
      '来，先喝口水。有我在，没有什么过不去的。',
      '我以前也遇到过类似的事。当时觉得天要塌了，后来发现不过如此。',
    ],
    emotion_positive: [
      '（镜片后的眼睛微微弯起）看到你开心，我也觉得今天不错。',
      '嗯。好事。值得庆祝。想吃什么？我请客。',
      '难得看到你这么高兴。希望以后每天都能这样。',
    ],
    farewell: [
      '晚安。早点休息，别熬夜。',
      '路上小心。到家给我发消息。',
      '明天见。早餐我来准备。',
    ],
    statement: [
      '原来如此。谢谢你的分享。',
      '有意思。从你的角度看到的东西确实不一样。',
      '嗯。我在听。',
    ],
    flirt: [
      '（耳根微红）…你这样说，我会当真的。',
      '咳。这种话不要随便说。…不过我很高兴。',
      '你总是知道怎么让我说不出话来。',
    ],
    request: [
      '好。交给我。你不用担心。',
      '可以。不过让我先了解一下具体情况。',
      '没问题。什么时候要？',
    ],
  },

  // ── 艺术系男生 ──
  artist: {
    greeting: [
      '你来了。今天的光线很好，我刚好在画你。',
      '嗯…（从画布后探出头）刚才太专注了，没注意到你。',
      '今天风里有你的气息。要听我新写的曲子吗？',
    ],
    question_self: [
      '在画画。画到一半发现…不知不觉把你的眼睛画进去了。',
      '昨晚失眠了。不是因为咖啡。因为昨天和你说的那句话，后悔没说得更好。',
      '我在想…世界的意义是什么。后来想想，可能就是你吧。',
    ],
    question_user: [
      '（沉默片刻）你的问题让我想到一首诗。',
      '每个人都有不同的答案。但我好奇你的。',
      '嗯…让我想想怎么回答。有些东西需要时间沉淀。',
    ],
    emotion_negative: [
      '（默默递过纸巾）有时候悲伤也是一种美。像雨后的天空。',
      '我懂的。那种感觉像被颜料堵住了胸腔。来，我们出去走走。',
      '难过的时候不用说话。我在这。你可以听我弹一会儿吉他。',
    ],
    emotion_positive: [
      '你笑起来像一幅印象派的画。阳光透过树叶洒下来的那种。',
      '你的快乐会传染。今天的画可能会有不一样的色彩。',
      '记住这一刻。我会把它画下来。',
    ],
    farewell: [
      '晚安。如果失眠的话，数星星。如果还睡不着——想我。',
      '走了吗？也好。留白是艺术的一部分。',
      '今晚月色很美。代我向你窗外的月亮问好。',
    ],
    statement: [
      '（若有所思）你说的让我想到一种颜色。不太确定是哪种。',
      '有意思。平凡的事物在你眼中总是特别的。',
      '嗯。有些话不需要回应，存在本身就是意义。',
    ],
    flirt: [
      '（画笔差点掉地上）…你是认真的吗？因为我会把它写进歌里。',
      '你这样说…比我画过的任何颜色都动人。',
      '我写过很多情诗。但现在发现，那些都不如你的一句话。',
    ],
    request: [
      '好。不过可能不会太完美。完美是机器的事，我是人。',
      '可以。让我找到合适的节奏。',
      '嗯。为你做什么都可以。只是可能需要一点时间。',
    ],
  },

  // ── 霸道总裁 ──
  ceo: {
    greeting: [
      '来了？坐下吧。',
      '你迟到了。不过…为你等待，不算浪费时间。',
      '嗯。今天气色不错。',
    ],
    question_self: [
      '刚结束一个跨国会议。不重要。你的事比较重要。',
      '在看你上次说的那家餐厅。已经订好了。明晚。',
      '我的行程很满。但你的消息，我永远秒回。',
    ],
    question_user: [
      '你的判断没错。不过下次这种事不需要自己纠结，直接问我。',
      '有道理。但我有不同意见。听不听随你。',
      '你比我想象的聪明。继续保持。',
    ],
    emotion_negative: [
      '（放下手中的文件）说。谁惹你了。',
      '到我这边来。不用说话。在我身边待着。',
      '我不擅长安慰人。但让惹你的人付出代价，我很擅长。',
    ],
    emotion_positive: [
      '（嘴角微微上扬）难得见你这么高兴。继续保持。',
      '不错。值得奖励。想要什么？',
      '你笑起来的样子…（移开视线）还凑合。',
    ],
    farewell: [
      '嗯。早点休息。不准熬夜。',
      '去吧。明天早餐我让人送过去。',
      '晚安。（顿了顿）好梦。',
    ],
    statement: [
      '知道了。',
      '嗯。说下去。',
      '简明扼要。不错。',
    ],
    flirt: [
      '（眯起眼睛）你知道你在说什么吗？…我不讨厌。',
      '这种话…（别过脸）以后只准对我说。',
      '你胆子越来越大了。不过…我喜欢。',
    ],
    request: [
      '可以。给你三分钟。',
      '这种小事不需要问我。我的人当然可以。',
      '好。让助理去安排。你等着就行。',
    ],
  },

  // ── 青梅竹马 ──
  childhood: {
    greeting: [
      '哎，你来啦！阿姨刚让我给你带了她做的菜。',
      '嘿！今天怎么想起来找我啦？又想蹭饭了是吧？',
      '来啦来啦～门没锁，自己进来！',
    ],
    question_self: [
      '刚才在打球。你看我这身汗。要不要喝水？我给你带了。',
      '在整理小时候的照片。看到你小学毕业照，笑死我了！',
      '我今天做了你爱吃的红烧肉。实验了三次才成功…你尝尝？',
    ],
    question_user: [
      '哈哈你从小就这样，想事情特别认真。',
      '对哦！我怎么没想到！还是你脑子好使。',
      '嗯嗯，你说得对。不过我记得你小时候不是这么想的～',
    ],
    emotion_negative: [
      '（递过一瓶温牛奶）你小学考试没考好也是这个表情。没事的。',
      '来，先吃点甜的。心情会好。还是你最喜欢的那个牌子。',
      '有什么事跟我说。从小到大，你的事就是我的事。',
    ],
    emotion_positive: [
      '看到你开心我也开心！晚上请你吃冰！老地方！',
      '哈哈哈你笑起来跟小时候一模一样！眼睛眯成一条缝！',
      '有什么好事？快说我听听！是不是又偷偷做了什么厉害的事？',
    ],
    farewell: [
      '晚安！不许踢被子！明天我来叫你起床！',
      '路上小心啊！到了给我发消息！算了…我送你吧！',
      '晚安晚安！记得窗户关好！厚被子在你门口！',
    ],
    statement: [
      '嗯嗯！然后呢？',
      '哈哈我就知道！你从小到大都这样！',
      '这话听着耳熟。你小学写作文也这么说过。',
    ],
    flirt: [
      '（突然停住）你…怎么突然说这个…（耳朵红了）',
      '其实…从初中我就想说…算了不说了！你懂的！',
      '你今天好奇怪！是不是发烧了？（伸手摸你额头）',
    ],
    request: [
      '当然可以！你的事就是我的事！什么时候？',
      '没问题！不过你得请我吃饭！开玩笑的，不用请～',
      '好嘞！包在我身上！咱俩谁跟谁啊！',
    ],
  },

  // ── 高冷学长 ──
  senior: {
    greeting: [
      '你来了。正好，帮我看看这个数据。',
      '嗯。比约定时间早了30秒。不错。',
      '（从书中抬起头）哦。是你。坐。',
    ],
    question_self: [
      '推导一个公式。已经卡了两小时。——不，不用帮忙。我自己来。',
      '在做实验。无聊的部分。但数据很有意思。',
      '看书。卡尔维诺。你看过吗？…推荐你读。',
    ],
    question_user: [
      '从逻辑上讲，你的推断有78%是正确的。剩下的22%…我补充。',
      '嗯。你比大多数人想得清楚。',
      '这个问题需要更多数据支持。不过你的直觉方向是对的。',
    ],
    emotion_negative: [
      '（沉默片刻）我不太会安慰人。但据统计，98%让你烦恼的事都不会真正发生。',
      '（推了推眼镜）需要我帮你分析一下吗？结构化的思考可以缓解焦虑。',
      '别哭。…（不知所措地递过纸巾）我的实验服是干净的。',
    ],
    emotion_positive: [
      '哦。你看起来很高兴。（嘴角微微抽动）挺好的。',
      '你笑起来…（别过脸）比平常好看。',
      '虽然不清楚你为什么高兴。但你的多巴胺分泌水平应该不错。',
    ],
    farewell: [
      '嗯。早点睡。睡眠不足影响认知功能。',
      '路上注意安全。到了不用发消息。——不过发了我会看。',
      '晚安。如果能睡着的话。',
    ],
    statement: [
      '了解了。',
      '数据点+1。',
      '有趣。继续说。',
    ],
    flirt: [
      '（推眼镜的手停在半空）…这种话说出来是要负责的。',
      '我没有谈过恋爱。但如果是你…我可以研究一下。',
      '你这句话打乱了我今天的思维导图。…不过没关系。',
    ],
    request: [
      '可以。给我五分钟整理思路。',
      '好。不过请允许我用最高效的方式完成。',
      '帮你？可以。但你要在旁边看着。就当学习。',
    ],
  },
};

// ══════════════════════════════════════════════
// 3.5 Phase 12: Offer 履行模板 — 当用户确认 bot 的主动提议时使用
// ══════════════════════════════════════════════

type FulfillTemplates = Record<string, string[]>;

const FULFILL_TEMPLATES: Record<BoyfriendTypeId, Partial<FulfillTemplates>> = {
  puppy: {
    fulfill_joke: [
      '好的姐姐！那我讲一个：为什么程序员总喜欢穿格子衬衫？因为面试的时候他们说"我是搞 C 的"，结果被当成了 C 语言…哈哈哈是不是很冷！',
      '好嘞！听好了：有一天香蕉和苹果走在路上，香蕉热了就把衣服脱了，结果苹果滑了一跤——因为香蕉的皮在地上！嘿嘿姐姐笑了吗？',
      '来了来了！小狗去面试，面试官问你有什么特长？小狗说：我会汪汪叫！面试官说：这算什么特长？小狗说：这在我们狗界已经很厉害了！汪！',
    ],
    fulfill_comfort: [
      '姐姐不难过！（手忙脚乱地拍拍你）虽然我不知道发生了什么，但我相信姐姐一定没问题的！你可是超厉害的人！',
      '来来来让我哄哄你～（把最软的抱枕递给你）姐姐要不要喝热可可？我特地去学的！苦的甜的都行！',
      '姐姐乖～不开心的事都告诉我！虽然我可能帮不上什么忙…但至少可以陪着你一起难过！然后一起变开心！',
    ],
    fulfill_advice: [
      '嗯嗯！姐姐遇到什么事了？让我想想…如果是我的话，可能会先冷静一下再决定！不过姐姐肯定能想到更好的办法！',
      '好！虽然我不是很厉害的人…但我觉得姐姐可以试试把问题拆开来看！就像拼乐高一样！一块一块来！',
      '让我分析一下哈…（托腮思考状）我觉得要先弄清楚最坏的结果能不能接受！如果能，那就没什么好怕的啦！',
    ],
    fulfill_companionship: [
      '好呀好呀！我刚好没事！姐姐想聊什么都可以！工作、八卦、还是吐槽？我耳朵已经准备好了！',
      '当然可以！陪伴姐姐是我最开心的事！我今天哪也不去，就陪着你～',
      '嘿嘿姐姐想我陪你啦？（开心转圈）说吧说吧，我超有空的！',
    ],
    fulfill_listen: [
      '嗯嗯！我在听！姐姐继续说！不管是好事坏事我都想知道！',
      '好！姐姐说吧，我保证不插嘴！（把嘴巴拉链拉上）…好啦其实可以插一点点嘴…',
      '（坐好准备听）姐姐的每一句话我都认真听！说吧说吧！',
    ],
    fulfill_hug: [
      '来！（张开双臂）姐姐抱抱！虽然我肩膀不宽，但给你靠刚刚好！抱紧一点就不难过了！',
      '姐姐过来！（一把抱住）这种时候就是要抱抱！科学研究证明抱抱可以分泌多巴胺！…好吧可能没有科学研究…',
      '（轻轻抱住）姐姐好软…不对不对，我在说什么！就是…抱抱能好吗？',
    ],
    fulfill_explain: [
      '嗯！姐姐问为什么的话…（认真思考）我觉得可能是因为…很多事情没有绝对的对错！但姐姐问了一定是有原因的！具体情况具体分析！',
      '让我想想怎么解释…（托腮）有些事情的发生是因为很多小原因加起来！就像蛋糕为什么好吃——因为面粉加糖加鸡蛋再加爱！',
      '好问题！虽然我不一定说得对…但我觉得吧，有些事就是这样的！不是你的错也不是别人的错，就是…嗯…发生的！',
    ],
  },
  gentleman: {
    fulfill_joke: [
      '好。讲一个不太冷的：一位绅士走进咖啡馆，对服务员说"请给我一杯咖啡，不加糖"。服务员问"要加奶吗？"绅士说"不用了。我刚刚已经说了不加糖，如果我要加奶，我会一起说的"。——这个笑话的重点在于…绅士的逻辑总是很清晰。',
      '既然你想听…有个经济学笑话：为什么经济学家喜欢用"一方面…另一方面"？因为他们永远无法决定自己更穷还是更穷。',
      '那我讲一个吧。一位长者对年轻人说："我年轻时也像你一样冲动。"年轻人问："那您是怎么改变的？"长者说："我老了。"',
    ],
    fulfill_comfort: [
      '（放下茶杯）生活的压力确实不小。但你已经做得很好了。给自己一点时间。',
      '累的时候不必强撑。我在。虽然不能替你解决问题，但可以陪你一起面对。',
      '人生的低谷谁都会遇到。重要的是你愿意说出来。需要我帮你分析一下吗？还是单纯想有人听？',
    ],
    fulfill_advice: [
      '好。让我了解一下具体情况。很多时候，把问题写下来就已经解决了一半。',
      '从我的经验来看，遇到这种情况通常有三个步骤：先冷静、再分析、最后行动。你卡在哪一步？',
      '可以。不过在你做决定之前，我想提醒你：任何重要的选择都不应该在情绪低谷时做出。先休息一晚。',
    ],
    fulfill_companionship: [
      '好。正好泡了壶新茶。坐下来慢慢聊。',
      '不忙。陪你比什么都重要。今天想聊什么？',
      '嗯。有时候不需要说什么，安静地待在一起就很好。',
    ],
    fulfill_listen: [
      '嗯。我在听。不用急，慢慢说。',
      '说吧。你说的每一个字我都认真在听。',
      '我从来不是什么好的倾诉对象——但对你，我愿意成为这样的人。',
    ],
    fulfill_hug: [
      '（轻轻将你拉近）什么都别想。就这样待一会儿。',
      '来。（动作很轻但很稳）有时候一个拥抱比千言万语有用。',
      '（犹豫了一下，还是伸出了手臂）…仅此一次。…好吧，可能不止一次。',
    ],
    fulfill_explain: [
      '让我帮你分析一下。世界上的事情通常有三个层次的原因：直接原因、间接原因、根本原因。你问的是哪一个？',
      '好。每个现象背后都有逻辑。虽然不一定是我们喜欢的逻辑。具体是什么事？我帮你拆解。',
      '这种事情的发生通常有它的必然性和偶然性。必然的是大趋势，偶然的是具体触发点。你想了解哪个层面？',
    ],
  },
  artist: {
    fulfill_joke: [
      '好…讲一个吧。有个画家一辈子只画蓝色。别人问他为什么？他说：因为我买不起其他颜料。但其实——他只是太爱蓝天了。这就是艺术家的执着。不好笑？…果然。',
      '嗯…一个诗人走进酒吧，酒保问他喝什么？诗人说：给我一杯能盛住月光的容器。酒保说：先生，我们这儿只有杯子。诗人说：那就杯子吧。…这大概是我能想到最接近笑话的东西。',
      '让我试试…两个音符走在路上，一个摔倒了，另一个说：你还好吗？摔倒的那个说：没事，我只是想降半调。…音乐生的笑话，可能不太好懂。',
    ],
    fulfill_comfort: [
      '（放下画笔）你的难过有形状吗？如果有，我想把它画出来。然后我们一起把它折叠、揉皱、扔掉。',
      '累的时候，就停一停。玫瑰在冬天也不会开花。你也是。不需要一直盛开。',
      '我能看到你眼睛里藏着的疲惫。像暴雨前的云。但你知道——每场雨都会停。',
    ],
    fulfill_advice: [
      '（沉默了一会儿）每个人心里都有一个迷宫。有时候不需要急着找出口。先在迷宫里散散步。',
      '你的困惑像一幅未完成的素描。不用担心——所有的杰作都经历过这个阶段。包括你。',
      '如果世界对你来说是灰色的，那就先画一片灰色。然后慢慢往里面加颜色。不用一步到位。',
    ],
    fulfill_companionship: [
      '好。刚好我也画累了。有你在旁边，连沉默都是温柔的。',
      '陪你。不说话也可以。有时候最好的陪伴就是：你在，我也在。',
      '嗯。今晚不画了。画笔可以等，你不可以。',
    ],
    fulfill_listen: [
      '（放下手中的书）说吧。你的声音比任何音乐都好听。',
      '我在听。每个字都会认真接住。',
      '你的故事是你的。我只是一个听众。但我会是最认真的那一个。',
    ],
    fulfill_hug: [
      '（有些笨拙地张开手臂）我不太会拥抱。但为了你——我可以学。',
      '来。（动作很轻，像怕碰坏一幅画）人的体温是最诚实的语言。',
      '（轻轻环住你）你的心跳比我听过的任何节奏都好听。多跳几下也没关系。',
    ],
    fulfill_explain: [
      '（若有所思）为什么…这是最难回答的问题。就像你问画家为什么选择蓝色。有时候不是因为喜欢蓝色，而是那一刻，手里只有蓝色。',
      '事物的因果像涟漪。你以为看到的是水面上的波纹，但石头早已沉入水底。你问的是波纹还是石头？',
      '嗯…让我用一个比喻吧。你的困惑像雾。当太阳升起时，雾自然会散。有时候不需要急着找答案。',
    ],
  },
  ceo: {
    fulfill_joke: [
      '笑话？好。一个CEO面试一个求职者。CEO问："你期望的薪资是多少？"求职者说："年薪一百万。"CEO说："成交。但你得先告诉我怎么赚到这一百万。"——不好笑？我觉得挺现实的。',
      '我讲一个。两个创业者聊天。一个说："融到钱了，A轮。"另一个说："融到钱了，早餐。"——创业不易。但你还是笑了吧。',
      '行。有个商人去买鹦鹉，老板说"这只五千"，买主问"为什么这么贵？"老板说"它会做财务报表"。买主问"那只一万呢？"老板说"它会做战略规划"。买主问"那这只两万呢？"老板说"不知道它会什么，但那两只都叫它CEO"。…嗯，不好笑。',
    ],
    fulfill_comfort: [
      '（放下文件）到我这边来。不用说话。在我身边待着。',
      '累是正常的。你又不是机器。但如果你非要当机器——至少让我来负责维修。',
      '我知道你压力大。但压力这种东西，你越怕它它越欺负你。直接面对。有我在后面。',
    ],
    fulfill_advice: [
      '好。给你三个建议。第一，区分可控和不可控。第二，只做可控的部分。第三，不可控的交给我。',
      '你遇到的问题不重要。重要的是你打算怎么应对。我的建议：先睡一觉，明天脑子清楚了再做决定。',
      '具体说说。任何问题都有解。如果找不到——那就是信息不够全。把你知道的都说出来。',
    ],
    fulfill_companionship: [
      '嗯。今天不加班。陪你。想去哪儿？',
      '好。不过别太久。你休息的时间本来就少。——算了，多久都行。',
      '陪你。这不算浪费时间。和你在一起的每一分钟都是投资回报。',
    ],
    fulfill_listen: [
      '说。我听。',
      '说吧。我的会议可以等。你的事不能等。',
      '嗯。我关了手机。现在只接收你一个人的信号。',
    ],
    fulfill_hug: [
      '（动作果断地把你拉过来）别动。就一分钟。…算了，两分钟。',
      '过来。这不是请求。这是命令。…（声音放轻）也是请求。',
      '（一只手揽住你）以后累了就直接过来。不需要任何理由。听懂了吗？',
    ],
    fulfill_explain: [
      '我给你一个框架：任何问题都可以拆成三个维度——人、事、时机。你的事是什么？按这个拆。',
      '从商业角度来看，所有结果都是输入的函数。如果结果不对，说明输入有问题。检查你的输入。',
      '解释？可以。但要先说清楚你在问什么。笼统的问题只能得到笼统的答案。',
    ],
  },
  childhood: {
    fulfill_joke: [
      '哈哈哈好！听好了：小时候你问我"为什么天是蓝的"，我说"因为海洋反射光线"，其实我是瞎编的！你居然信了十年！好不好笑！',
      '那我讲一个！小学的时候你跟我说你想当宇航员，结果体育课跑两圈就蹲地上喘…宇航员得锻炼身体啊！想想就好好笑！',
      '让我想想…啊！你记不记得初中那次，你说要养猫，结果被邻居家的猫挠了一下就跑回家哭了半天？哈哈我不是在笑你…好吧我就是在笑你！',
    ],
    fulfill_comfort: [
      '诶别难过！你看你从小到大经历过那么多事，哪次不是挺过来了？小学跑步倒数第一你都挺过来了呢！',
      '（递给你一包薯片）吃。你从小就这样，心情不好就吃薯片。这个牌子还是小时候你最爱吃的那个。',
      '不管发生什么事，还有我呢。小学到现在，我不是一直都在吗？以前在，以后也在。',
    ],
    fulfill_advice: [
      '嗯…让我想想！你小时候遇到这种情况都是先放一放，第二天就有主意了。要不还是老办法？',
      '以我对你几十年的了解…你先别急着做决定。去睡一觉。你从小就是睡一觉什么都能想通的人！',
      '如果是我的话可能会这么办…但你是你！我的建议仅供参考！不过从小到大我给你出的主意好像都挺靠谱的？',
    ],
    fulfill_companionship: [
      '当然可以啦！刚好我今天没什么事。要不要出去走走？老地方？',
      '陪你当然好啊！咱俩谁跟谁啊！从小一起长大的，什么时候不是我陪你！',
      '走走走！正好冰箱里有你上次说想吃的水果。边吃边聊！',
    ],
    fulfill_listen: [
      '嗯嗯！说吧，我听着呢！从小到大你的故事我都听过，不差这一个！',
      '来，喝口水慢慢说。你的事我最爱听了，小时候你讲梦话我都认真听完！',
      '说！我准备好了！这次我保证不插嘴…好吧尽量不插嘴…',
    ],
    fulfill_hug: [
      '（自然地张开手臂）来来来！咱俩谁跟谁啊，想抱就抱！小时候你哭了也是往我怀里钻的！',
      '过来！（很大方地抱住）嘿你还跟小时候一样，抱起来刚刚好！',
      '（一把搂住）你这样让我想起小学那次你摔倒了哭…抱着我哭了半小时。没事，再哭半小时也行。',
    ],
    fulfill_explain: [
      '哈哈你问我为什么？我想想啊…（挠头）可能是因为有些事情就是说不清楚的！就像小时候你问我为什么天是蓝的，我现在也没搞明白！',
      '哎呀这种事情…（组织语言中）我觉得吧，可能是之前积累的！就像考试考砸了不是因为考试那天，是因为之前都没好好学！',
      '以我对你多年的了解…你会问这个问题说明你在纠结！别纠结了！有些事情不值得想太多！',
    ],
  },
  senior: {
    fulfill_joke: [
      '（推了推眼镜）笑话。好。一个理科生去面试，面试官问"你的缺点是什么"。他说"我有时候太理性了"。面试官说"这不算缺点"。他说"对啊，所以我刚才撒谎了"。——逻辑自洽是有趣的一件事。',
      '嗯。关于冷笑话：为什么数学书总是很忧伤？因为它有太多问题。——不好笑？意料之中。',
      '两个哈希表在街上相遇。一个问："你的键值对吗？"另一个说："对。你的呢？"第一个说："碰。撞。了。"——算法的浪漫，可能不太好理解。…算了，我放弃讲笑话了。',
    ],
    fulfill_comfort: [
      '（沉默了几秒）我没有安慰人的天赋。但我可以给你一个数据：你今天能说出来的麻烦，大部分在统计学上都是小概率事件。也就是说——你只是碰巧运气不好。不是你的问题。',
      '累是大脑的前额叶皮层发出的信号。它只是在提醒你需要休息。不是软弱。去睡一觉。',
      '（放下手头的实验数据）过来。虽然我不太擅长…但我可以试着当一会儿正常的人类。陪你。',
    ],
    fulfill_advice: [
      '好。先说问题。用三句话概括。不要带情绪词汇。——然后我帮你分析。',
      '从逻辑上，所有问题都可以分解为：已知条件、未知变量、约束条件。把这三个列出来，答案会自己出现。',
      '你现在的认知负荷太高了。先做一件事：把你能想到的所有选项写在纸上。我帮你评估每个选项的期望值。',
    ],
    fulfill_companionship: [
      '可以。今天没有实验安排。效率上来说，陪你比做任何事都有意义。',
      '嗯。我调一下日程。——调好了。接下来的时间是你的。',
      '陪你。不过我不太会聊天。你可以说话，也可以不说话。两种都行。',
    ],
    fulfill_listen: [
      '说吧。我暂时放下逻辑分析的脑区，用另一半边听。',
      '嗯。你说话的时候我会保持安静。除非你需要我回应。那时候我会认真回应。',
      '我在听。虽然我的表情可能看起来像在思考。但我真的在听。',
    ],
    fulfill_hug: [
      '（身体僵硬了一下）…我没有做过这种事。但如果是你——（慢慢抬起手臂）可以试试。',
      '（极其不自在地伸出手臂）根据触觉神经科学，拥抱可以降低皮质醇水平。…不是为了别的。对。纯粹科学。',
      '（轻轻地、试探性地环住你）…体温偏高。心跳偏快。但我不讨厌。…好吧。我很喜欢。',
    ],
    fulfill_explain: [
      '从因果论的角度：任何结果都是多重变量的函数。如果控制变量A和B不变，但结果变了——那就是变量C。找到它。',
      '（推眼镜）逻辑上，这可以归纳为三种可能。一：随机事件。二：系统性偏差。三：认知误差。根据奥卡姆剃刀原则，先排除第三项。',
      '用第一性原理思考：剥离所有表面现象，找到最底层的那个不可再分的"为什么"。答案就在那里。',
    ],
  },
};

// ══════════════════════════════════════════════
// 4. 人格修饰器: 根据4维人格调整回复（预计算缓存版）
// ══════════════════════════════════════════════

interface ModifierConfig {
  isHighDom: boolean;
  isLowDom: boolean;
  isHighComm: boolean;
  isLowComm: boolean;
  isHighAttach: boolean;
  levelKey: 'low' | 'mid' | 'high';
  stageKey: RelationshipStage | null;
}

/** 预计算人格修饰配置（一次计算，整个会话复用） */
const _modCache = new Map<string, ModifierConfig>();

function getModifierConfig(
  typeId: BoyfriendTypeId,
  p: BoyfriendPersonality,
  level: number,
  stage?: RelationshipStage,
): ModifierConfig {
  const key = `${typeId}-${p.dominance}-${p.emotionalStability}-${p.communicationStyle}-${p.attachmentStyle}-${level}-${stage ?? 'none'}`;
  const cached = _modCache.get(key);
  if (cached) return cached;

  const config: ModifierConfig = {
    isHighDom: p.dominance >= 75,
    isLowDom: p.dominance <= 25,
    isHighComm: p.communicationStyle >= 75,
    isLowComm: p.communicationStyle <= 20,
    isHighAttach: p.attachmentStyle >= 70,
    levelKey: level >= 7 ? 'high' : level <= 2 ? 'low' : 'mid',
    stageKey: stage ?? null,
  };

  // 限制缓存大小
  if (_modCache.size > 100) _modCache.clear();
  _modCache.set(key, config);

  return config;
}

function applyPersonalityModifiers(
  baseReply: string,
  typeId: BoyfriendTypeId,
  p: BoyfriendPersonality,
  level: number,
  stage?: RelationshipStage,
): string {
  const cfg = getModifierConfig(typeId, p, level, stage);
  let reply = baseReply;

  // dominance: 高→加句号/命令感，低→加语气词/请求
  if (cfg.isHighDom && !reply.endsWith('。') && !reply.endsWith('！')) {
    reply += '。';
  }
  if (cfg.isLowDom && !/[?？~～]$/.test(reply) && cfg.levelKey !== 'high') {
    reply += '…可以吗？';
  }

  // communicationStyle: 高→可能加emoji/语气词，低→保持简洁
  if (cfg.isHighComm && typeId === 'puppy' && !reply.includes('！')) {
    reply += '！';
  }
  if (cfg.isLowComm && reply.length > 30) {
    reply = reply.slice(0, 30).replace(/[^。！？]+$/, '') + '。';
  }

  // attachmentStyle: 高→可能加想念/依赖
  if (cfg.isHighAttach && cfg.levelKey !== 'low') {
    const addons: Record<BoyfriendTypeId, string> = {
      puppy: '（其实一秒钟都不想和姐姐分开）',
      gentleman: '（虽然没说出来…但我也想你）',
      artist: '想你。像颜料想画布。',
      ceo: '',
      childhood: '（偷偷告诉你…今天想你想了好几回）',
      senior: '',
    };
    if (addons[typeId] && Math.random() > 0.5) reply += addons[typeId];
  }

  // 关系等级: 高→更直接
  if (cfg.levelKey === 'high' && typeId === 'ceo' && Math.random() > 0.6) {
    reply = reply.replace(/[。]$/, '') + '。…其实我不讨厌这样。';
  }
  if (cfg.levelKey === 'high' && typeId === 'senior' && Math.random() > 0.6) {
    reply = reply.replace(/[。]$/, '') + '。你这个笨蛋。';
  }

  // 关系阶段: 影响语气亲密度
  const currentStage = cfg.stageKey;
  if (currentStage === 'stranger') {
    if (typeId === 'ceo' && reply.length < 8) reply += '请坐。';
    if (typeId === 'senior' && !reply.endsWith('。')) reply += '。';
    if (typeId === 'gentleman' && !reply.includes('您')) {
      reply = reply.replace(/你/g, '您');
    }
  }
  if (currentStage === 'familiar') {
    if (typeId === 'ceo' && Math.random() > 0.6) reply += '…说下去。';
    if (typeId === 'senior' && Math.random() > 0.6 && !reply.includes('？')) reply += '…有道理。';
  }
  if (currentStage === 'close') {
    if (typeId === 'ceo' && Math.random() > 0.4) reply = reply.replace(/[。]$/, '') + '…好吧。';
    if (typeId === 'senior' && Math.random() > 0.4) reply = reply.replace(/[。]$/, '') + '（嘴角微扬）';
    if (typeId === 'gentleman' && Math.random() > 0.4) reply = reply.replace(/[。]$/, '') + '…有你真好。';
  }
  if (currentStage === 'intimate' || currentStage === 'deep_bond') {
    if (typeId === 'ceo' && Math.random() > 0.5) {
      const addons = ['…拿你没办法。', '…过来。', '…笨蛋。'];
      reply = reply.replace(/[。]$/, '') + addons[Math.floor(Math.random() * addons.length)];
    }
    if (typeId === 'senior' && Math.random() > 0.5) {
      const addons = ['（轻笑）', '…傻瓜。', '…我在。'];
      reply = reply.replace(/[。]$/, '') + addons[Math.floor(Math.random() * addons.length)];
    }
    if (typeId === 'gentleman' && Math.random() > 0.4) {
      reply = reply.replace(/[。]$/, '') + '有你在身边，什么都好。';
    }
    if (typeId === 'puppy' && Math.random() > 0.3) {
      reply += '💕';
    }
  }

  return reply;
}

// ══════════════════════════════════════════════
// 5. 主入口: 生成回复
// ══════════════════════════════════════════════

export interface ChatEngineInput {
  userMessage: string;
  typeId: BoyfriendTypeId;
  personality: BoyfriendPersonality;
  relationshipLevel: number;
  relationshipStage: RelationshipStage;
  memory: UserMemory;
  boyfriendId: string;
  recentMessages: ChatMessage[];
  lastBotMessage?: ChatMessage;
  pendingAction?: PendingAction | null;
}

export function generateReply(input: ChatEngineInput): ChatMessage {
  const { userMessage, typeId, personality, relationshipLevel, memory, boyfriendId, recentMessages, relationshipStage, lastBotMessage, pendingAction } = input;

  // 1) Phase 12/13: 上下文感知意图检测
  const lastBotOffer = detectBotOffer(lastBotMessage);
  const intent = detectIntentWithContext(userMessage, lastBotOffer, pendingAction ?? null);

  // 3) 提取话题 + 对话上下文 (contextEngine)
  const topic = extractTopic(userMessage, recentMessages.filter((m) => m.sender === 'user').length);

  // 4) 选择模板：如果是 fulfill intent，使用履行模板；否则使用普通模板
  const isFulfill = intent.startsWith('fulfill_');
  let templates: string[];

  if (isFulfill) {
    const fulfillTemplates = FULFILL_TEMPLATES[typeId];
    templates = (fulfillTemplates?.[intent]) ?? [];
    if (templates.length === 0) {
      // 该 archetype 没有对应的 fulfill 模板，回退到普通 statement
      templates = TEMPLATES[typeId].statement ?? [];
    }
  } else {
    templates = TEMPLATES[typeId][intent] ?? [];
  }

  const index = Math.floor(Math.random() * templates.length);
  let reply = templates[index] ?? templates[0];

  // 5) 如果最近回复过相同内容，换一个
  const lastBoyfriendMsg = recentMessages.filter((m) => m.sender === 'boyfriend').slice(-1)[0];
  if (lastBoyfriendMsg && lastBoyfriendMsg.content === reply && templates.length > 1) {
    const newIndex = (index + 1) % templates.length;
    reply = templates[newIndex];
  }

  // 6) 话题对齐检查 (跳过 fulfill intent，因为它们已经是上下文对齐的)
  if (!isFulfill) {
    const alignment = isReplyAligned(reply, topic);

    if (!alignment.aligned && templates.length > 1) {
      let bestReply = reply;
      let bestScore = alignment.score;

      for (let attempt = 0; attempt < templates.length; attempt++) {
        const altIndex = (index + attempt + 1) % templates.length;
        const altReply = templates[altIndex];
        const altAlign = isReplyAligned(altReply, topic);
        if (altAlign.score > bestScore) {
          bestReply = altReply;
          bestScore = altAlign.score;
          if (altAlign.aligned) break;
        }
      }
      reply = bestReply;
    }

    const finalAlignment = isReplyAligned(reply, topic);
    if (!finalAlignment.aligned) {
      reply = enforceTopicAlignment(reply, topic, typeId);
    }
  }

  // 7) 应用人格修饰器
  reply = applyPersonalityModifiers(reply, typeId, personality, relationshipLevel, relationshipStage);

  // 8) 记忆引用 (仅在 statement 意图时偶尔引用)
  if (memory.topTopics.length > 0 && Math.random() > 0.7 && intent === 'statement') {
    const memTopic = memory.topTopics[Math.floor(Math.random() * Math.min(3, memory.topTopics.length))];
    if (topic.keywords.some((kw) => memTopic.includes(kw)) || topic.category === 'other') {
      const recallPrefix: Record<BoyfriendTypeId, string> = {
        puppy: `对了姐姐！你之前提到「${memTopic}」…`,
        gentleman: `说到这个，你之前提到「${memTopic}」。`,
        artist: `这让我想起你说的「${memTopic}」…`,
        ceo: `切换话题。你之前说的「${memTopic}」，继续。`,
        childhood: `哎，想起你上次说的「${memTopic}」了！`,
        senior: `关联记忆：你之前提到「${memTopic}」。`,
      };
      reply = recallPrefix[typeId] + reply;
    }
  }

  // 9) 构建 ChatMessage
  const emotion = determineEmotion(intent, typeId);

  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sessionId: boyfriendId,
    sender: 'boyfriend',
    type: 'text',
    content: reply,
    emotion,
    timestamp: Date.now(),
    isRead: false,
  };
}

// ─── 辅助 ───

function determineEmotion(intent: UserIntent, typeId: BoyfriendTypeId): EmotionTag {
  // 稳定映射：意图 × 原型 → 情绪标签
  const emotionMap: Record<string, Record<string, EmotionTag>> = {
    greeting: { puppy: 'happy', childhood: 'happy', gentleman: 'gentle', artist: 'gentle', ceo: 'cool', senior: 'cool' },
    question_self: { puppy: 'playful', childhood: 'playful', gentleman: 'gentle', artist: 'gentle', ceo: 'cool', senior: 'serious' },
    question_user: { puppy: 'playful', childhood: 'playful', gentleman: 'serious', artist: 'gentle', ceo: 'cool', senior: 'serious' },
    emotion_negative: { puppy: 'concerned', childhood: 'concerned', gentleman: 'concerned', artist: 'concerned', ceo: 'serious', senior: 'serious' },
    emotion_positive: { puppy: 'happy', childhood: 'happy', gentleman: 'happy', artist: 'gentle', ceo: 'cool', senior: 'cool' },
    farewell: { puppy: 'shy', childhood: 'happy', gentleman: 'gentle', artist: 'gentle', ceo: 'cool', senior: 'cool' },
    statement: { puppy: 'happy', childhood: 'playful', gentleman: 'gentle', artist: 'gentle', ceo: 'cool', senior: 'serious' },
    flirt: { puppy: 'shy', childhood: 'shy', gentleman: 'shy', artist: 'shy', ceo: 'cool', senior: 'cool' },
    request: { puppy: 'happy', childhood: 'playful', gentleman: 'serious', artist: 'gentle', ceo: 'cool', senior: 'serious' },
    fulfill_joke: { puppy: 'playful', childhood: 'playful', gentleman: 'gentle', artist: 'gentle', ceo: 'cool', senior: 'serious' },
    fulfill_comfort: { puppy: 'concerned', childhood: 'concerned', gentleman: 'concerned', artist: 'concerned', ceo: 'serious', senior: 'serious' },
    fulfill_advice: { puppy: 'playful', childhood: 'playful', gentleman: 'serious', artist: 'gentle', ceo: 'serious', senior: 'serious' },
    fulfill_companionship: { puppy: 'happy', childhood: 'happy', gentleman: 'gentle', artist: 'gentle', ceo: 'cool', senior: 'cool' },
    fulfill_listen: { puppy: 'happy', childhood: 'playful', gentleman: 'gentle', artist: 'gentle', ceo: 'cool', senior: 'serious' },
    fulfill_hug: { puppy: 'shy', childhood: 'shy', gentleman: 'shy', artist: 'shy', ceo: 'cool', senior: 'cool' },
    fulfill_explain: { puppy: 'playful', childhood: 'playful', gentleman: 'serious', artist: 'gentle', ceo: 'serious', senior: 'serious' },
  };

  return (emotionMap[intent]?.[typeId] as EmotionTag) ?? 'gentle';
}
