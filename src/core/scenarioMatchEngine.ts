import type { BoyfriendPersonality } from './personalityEngine';
import type { BoyfriendTypeId } from '../types';

export type ScenarioAnswerId = string;
export type ScenarioAnswers = Record<string, ScenarioAnswerId>;

interface ScenarioOption {
  id: ScenarioAnswerId;
  label: string;
  description: string;
  weights: Partial<Record<BoyfriendTypeId, number>>;
  reason: string;
}

export interface ScenarioQuestion {
  id: string;
  eyebrow: string;
  title: string;
  context: string;
  options: ScenarioOption[];
}

export interface ScenarioMatchResult {
  typeId: BoyfriendTypeId;
  score: number;
  styleLabel: string;
  summary: string;
  reasons: string[];
  firstMessage: string;
  quickReplies: string[];
  personality: BoyfriendPersonality;
}

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: 'overwhelmed',
    eyebrow: '情景 01 · 很累的一天',
    title: '当你说“今天真的撑不住了”，你更希望他怎么回应？',
    context: '不用选最正确的，只选此刻最让你放松的方式。',
    options: [
      {
        id: 'listen',
        label: '先听我慢慢说',
        description: '不急着分析，先接住情绪和委屈。',
        weights: { artist: 5, childhood: 4, puppy: 2 },
        reason: '你需要情绪先被看见，而不是立刻得到答案',
      },
      {
        id: 'steady',
        label: '陪我把事情理清',
        description: '一起拆解压力，找到下一步能做的小事。',
        weights: { gentleman: 5, senior: 4, ceo: 2 },
        reason: '混乱时，你更安心于清晰、稳定的陪伴',
      },
      {
        id: 'protect',
        label: '坚定地站在我这边',
        description: '先给我安全感，再一起面对问题。',
        weights: { ceo: 5, gentleman: 3, puppy: 2 },
        reason: '压力来临时，你希望关系给出明确的支持感',
      },
      {
        id: 'lift',
        label: '把我从低气压里拉出来',
        description: '逗我笑、转移一下注意力，让身体先松下来。',
        weights: { puppy: 5, childhood: 3, artist: 1 },
        reason: '你会被主动、明亮的回应重新充电',
      },
    ],
  },
  {
    id: 'silence',
    eyebrow: '情景 02 · 想独处的时候',
    title: '如果你突然很安静，哪种陪伴距离更舒服？',
    context: '这决定了他靠近你的节奏，而不是谁更在乎你。',
    options: [
      {
        id: 'checkin',
        label: '偶尔来确认我还好吗',
        description: '给我空间，但别让我觉得被忘记。',
        weights: { childhood: 5, puppy: 4, gentleman: 2 },
        reason: '你偏好有回应、但不过度侵入的连接',
      },
      {
        id: 'quiet',
        label: '安静待在身边就好',
        description: '不用找话题，沉默本身也可以是陪伴。',
        weights: { artist: 5, senior: 4, gentleman: 2 },
        reason: '你能在低压力的沉默里感受到亲密',
      },
      {
        id: 'space',
        label: '等我主动回来',
        description: '尊重我的边界，不把独处理解成疏远。',
        weights: { senior: 5, gentleman: 4, artist: 2 },
        reason: '被尊重边界，会让你更愿意主动靠近',
      },
      {
        id: 'anchor',
        label: '直接把我带回当下',
        description: '给一个具体安排，帮我停止反复内耗。',
        weights: { ceo: 5, gentleman: 3, childhood: 1 },
        reason: '你会从果断、可依靠的行动中获得安全感',
      },
    ],
  },
  {
    id: 'conflict',
    eyebrow: '情景 03 · 出现分歧以后',
    title: '关系里意见不同，你最在意他先做什么？',
    context: '选择你愿意继续沟通的前提。',
    options: [
      {
        id: 'reassure',
        label: '先告诉我关系不会因此改变',
        description: '确认在乎彼此，再讨论谁对谁错。',
        weights: { puppy: 5, childhood: 4, artist: 2 },
        reason: '分歧中，你需要先确认关系依然安全',
      },
      {
        id: 'clarify',
        label: '冷静听完彼此的理由',
        description: '不抢答、不回避，把误会一层层说清。',
        weights: { gentleman: 5, senior: 4, childhood: 2 },
        reason: '你重视稳定沟通和被认真理解的过程',
      },
      {
        id: 'reflect',
        label: '给彼此一点时间再聊',
        description: '先消化情绪，避免在气头上互相伤害。',
        weights: { artist: 5, senior: 3, gentleman: 2 },
        reason: '你更相信经过沉淀的真诚表达',
      },
      {
        id: 'direct',
        label: '直说问题，也给出解决办法',
        description: '不猜、不拖，让冲突有明确出口。',
        weights: { ceo: 5, senior: 3, gentleman: 2 },
        reason: '你欣赏不回避冲突、愿意承担的关系',
      },
    ],
  },
];

const RESULT_COPY: Record<BoyfriendTypeId, Omit<ScenarioMatchResult, 'typeId' | 'score' | 'reasons'>> = {
  puppy: {
    styleLabel: '热烈回应型',
    summary: '你更容易在明确、及时的爱意里放松下来。',
    firstMessage: '你来啦。刚才那几道题里，我记住了：你不需要一个只会说“别难过”的人。今天想先从哪件事说起？',
    quickReplies: ['今天有点累，想被哄一下', '先随便聊聊吧', '你会怎么陪我？'],
    personality: { dominance: 35, emotionalStability: 45, communicationStyle: 84, attachmentStyle: 60 },
  },
  gentleman: {
    styleLabel: '沉稳承接型',
    summary: '你期待的不是说教，而是让情绪和问题都慢慢落地。',
    firstMessage: '你来了。刚才的选择我认真看完了——你更需要被稳稳接住，而不是被催着振作。先坐一会，今天最消耗你的是什么？',
    quickReplies: ['有件事想慢慢说', '我现在脑子很乱', '先陪我安静一会'],
    personality: { dominance: 62, emotionalStability: 88, communicationStyle: 38, attachmentStyle: 30 },
  },
  artist: {
    styleLabel: '细腻共情型',
    summary: '你在意情绪被辨认，也珍惜不必急着解释的空间。',
    firstMessage: '看到你的选择时，我想到雨停以后还留在窗上的水痕。你不必马上变好，也不用把每件事都说完整。此刻想让我听见什么？',
    quickReplies: ['我有一种说不清的难过', '今天只想有人听着', '先讲讲你吧'],
    personality: { dominance: 25, emotionalStability: 40, communicationStyle: 25, attachmentStyle: 62 },
  },
  ceo: {
    styleLabel: '坚定守护型',
    summary: '你会被清晰的态度和可靠的行动感打动。',
    firstMessage: '测试结果我看了。你需要的不是空泛安慰，而是有人明确站在你这边。现在，把最麻烦的那件事告诉我，我们一起处理。',
    quickReplies: ['今天有人让我很生气', '我需要一个解决办法', '先让我靠一会'],
    personality: { dominance: 90, emotionalStability: 82, communicationStyle: 48, attachmentStyle: 30 },
  },
  childhood: {
    styleLabel: '熟悉陪伴型',
    summary: '你喜欢自然、持续的关心，让关系像回到熟悉的地方。',
    firstMessage: '你回来啦。看完你的选择，我更确定一件事：你想独处时我不会追问，但也不会消失。今天要先说说发生了什么，还是就这样待一会？',
    quickReplies: ['就陪我待一会吧', '今天发生了一件小事', '你怎么知道我需要什么？'],
    personality: { dominance: 48, emotionalStability: 74, communicationStyle: 48, attachmentStyle: 50 },
  },
  senior: {
    styleLabel: '克制理解型',
    summary: '你重视边界、理性和真正有内容的交流。',
    firstMessage: '你的选择很一致：你不喜欢被过度打扰，但也不接受敷衍。我会尊重你的节奏。现在想聊一个具体问题，还是先安静一会？',
    quickReplies: ['帮我理清一个问题', '先安静陪我一会', '我想听你的真实看法'],
    personality: { dominance: 70, emotionalStability: 86, communicationStyle: 22, attachmentStyle: 22 },
  },
};

const TYPE_ORDER: BoyfriendTypeId[] = ['gentleman', 'childhood', 'artist', 'puppy', 'senior', 'ceo'];

export function calculateScenarioMatch(answers: ScenarioAnswers): ScenarioMatchResult | null {
  if (SCENARIO_QUESTIONS.some((question) => !answers[question.id])) return null;

  const scores = Object.fromEntries(TYPE_ORDER.map((typeId) => [typeId, 0])) as Record<BoyfriendTypeId, number>;
  const reasons: string[] = [];

  for (const question of SCENARIO_QUESTIONS) {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option) return null;
    reasons.push(option.reason);
    for (const typeId of TYPE_ORDER) scores[typeId] += option.weights[typeId] ?? 0;
  }

  const typeId = [...TYPE_ORDER].sort((a, b) => scores[b] - scores[a])[0];
  const maxPossible = 15;
  const score = Math.min(94, Math.round(76 + (scores[typeId] / maxPossible) * 18));

  return { typeId, score, reasons, ...RESULT_COPY[typeId] };
}

export function getScenarioOption(questionId: string, answerId: string): ScenarioOption | undefined {
  return SCENARIO_QUESTIONS.find((question) => question.id === questionId)?.options.find(
    (option) => option.id === answerId,
  );
}
