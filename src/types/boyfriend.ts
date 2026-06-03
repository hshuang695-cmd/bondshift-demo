// ─── 男友人格 ID ───
export type BoyfriendTypeId =
  | 'puppy' | 'gentleman' | 'artist'
  | 'ceo' | 'childhood' | 'senior';

// ─── MBTI 16型人格 ───
export type MbtiType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

// ─── 性格属性 Key ───
export type TraitKey =
  | 'humor' | 'romance' | 'intelligence'
  | 'gentleness' | 'adventurous' | 'maturity';

// ─── 声线类型 ───
export type VoiceType = 'warm' | 'deep' | 'clear' | 'gentle' | 'magnetic';

// ─── AI 回复风格 ───
export type PromptStyle = 'sweet' | 'mature' | 'melancholy' | 'dominant' | 'familiar' | 'cool';

// ─── 聊天对话风格 ───
export type ChatStyle = 'sweet' | 'humorous' | 'deep' | 'casual';

// ─── 情绪标签 ───
export type EmotionTag =
  | 'happy' | 'shy' | 'serious' | 'gentle'
  | 'flirty' | 'concerned' | 'playful' | 'cool';

// ─── 粒子特效类型 ───
export type ParticleType = 'stars' | 'hearts' | 'petals' | 'fireflies' | 'snow' | 'bubbles';

// ─── VR 动画 ───
export type VRAnimation =
  | 'idle_breathing' | 'idle_sway' | 'wave_hand'
  | 'head_tilt' | 'blow_kiss' | 'shy_look_away'
  | 'reach_out' | 'laugh';

// ─── 换乘原因 ───
export type SwapReason =
  | 'personality_mismatch' | 'want_to_try_new'
  | 'curious_about_type' | 'recommendation' | 'completed_experience';

// ─── 底部 Tab ───
export type AppTab = 'setup' | 'home' | 'swap' | 'report' | 'settings';

// ─── 人格标签 ───
export interface PersonalityTag {
  key: string;
  label: string;
  emoji: string;
  color: string;
}

// ─── 外表配置 ───
export interface AppearanceConfig {
  style: string;
  hairColor: string;
  eyeColor: string;
  height: 'short' | 'average' | 'tall';
  build: 'slim' | 'athletic' | 'average';
}

// ─── 外表信息（男友档案中） ───
export interface BoyfriendAppearance {
  style: string;
  hairColor: string;
  eyeColor: string;
  height: number;
  build: 'slim' | 'athletic' | 'average' | 'tall';
  description: string;
}

// ─── 场景对话回复 ───
export interface SceneReplies {
  morning: string;
  comfort: string;
  praise: string;
  missing: string;
  goodnight: string;
}

// ─── 声音配置 ───
export interface VoiceConfig {
  type: VoiceType;
  sampleUrl: string;
  speed: number;
  pitch: number;
}

// ─── VR 场景配置 ───
export interface VRSceneConfig {
  background: string;
  ambientColor: string;
  particles: ParticleType;
  bgmUrl: string;
  idleAnimation: string;
}

// ─── MBTI 相性 ───
export interface Compatibility {
  baseScore: number;
  bestMbtiPairs: MbtiType[];
  description: string;
}

// ─── AI 男友完整档案 ───
export interface BoyfriendProfile {
  id: string;
  typeId: BoyfriendTypeId;
  name: string;
  age: number;
  mbti: MbtiType;
  avatar: string;
  coverImage: string;
  title: string;

  tags: PersonalityTag[];
  attributes: Record<TraitKey, number>;
  appearance: BoyfriendAppearance;
  voiceType: VoiceType;
  promptStyle: PromptStyle;

  greeting: string;
  signatureLines: [string, string, string];
  sceneReplies: SceneReplies;
  voice: VoiceConfig;
  vrScene: VRSceneConfig;

  isUnlocked: boolean;
  unlockProgress: number;
  popularity: number;
  rating: number;
  swapCount: number;
  compatibility: Compatibility;
}
