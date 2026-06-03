import type { MbtiType, TraitKey, BoyfriendTypeId } from '../types';

export const TAB_CONFIG = [
  { key: 'setup' as const, label: '偏好', icon: 'Sliders' },
  { key: 'home' as const, label: '首页', icon: 'Home' },
  { key: 'swap' as const, label: '换乘', icon: 'Shuffle' },
  { key: 'report' as const, label: '报告', icon: 'BarChart3' },
  { key: 'settings' as const, label: '设置', icon: 'Settings' },
];

export const MBTI_TYPES: { type: MbtiType; label: string; emoji: string; color: string }[] = [
  { type: 'INTJ', label: '建筑师', emoji: '🏛️', color: '#4a6fa5' },
  { type: 'INTP', label: '逻辑学家', emoji: '🔬', color: '#5b8c85' },
  { type: 'ENTJ', label: '指挥官', emoji: '👑', color: '#3d48b8' },
  { type: 'ENTP', label: '辩论家', emoji: '💡', color: '#f5a623' },
  { type: 'INFJ', label: '提倡者', emoji: '🌿', color: '#6b8e6b' },
  { type: 'INFP', label: '调停者', emoji: '🦋', color: '#c06c84' },
  { type: 'ENFJ', label: '主人公', emoji: '🌟', color: '#e8a87c' },
  { type: 'ENFP', label: '竞选者', emoji: '🎉', color: '#f490b0' },
  { type: 'ISTJ', label: '物流师', emoji: '📋', color: '#5c6b7a' },
  { type: 'ISFJ', label: '守卫者', emoji: '🛡️', color: '#98c1a2' },
  { type: 'ESTJ', label: '总经理', emoji: '📊', color: '#4a708b' },
  { type: 'ESFJ', label: '执政官', emoji: '🤝', color: '#d4956b' },
  { type: 'ISTP', label: '鉴赏家', emoji: '🔧', color: '#6d6875' },
  { type: 'ISFP', label: '探险家', emoji: '🎨', color: '#b5838d' },
  { type: 'ESTP', label: '企业家', emoji: '🔥', color: '#e07a3d' },
  { type: 'ESFP', label: '表演者', emoji: '🎭', color: '#e8547c' },
];

export const TRAIT_LABELS: { key: TraitKey; label: string; emoji: string }[] = [
  { key: 'humor', label: '幽默感', emoji: '😂' },
  { key: 'romance', label: '浪漫值', emoji: '💕' },
  { key: 'intelligence', label: '智商', emoji: '🧠' },
  { key: 'gentleness', label: '温柔度', emoji: '🤗' },
  { key: 'adventurous', label: '冒险精神', emoji: '🚀' },
  { key: 'maturity', label: '成熟度', emoji: '🧐' },
];

export const STYLE_OPTIONS = [
  { key: '少年感', emoji: '☀️' },
  { key: '成熟', emoji: '🍷' },
  { key: '艺术', emoji: '🎨' },
  { key: '精英', emoji: '💼' },
  { key: '运动', emoji: '🏃' },
  { key: '学霸', emoji: '📖' },
];

export const HAIR_COLORS = ['黑色', '深棕色', '栗色', '银灰色', '亚麻色'];
export const EYE_COLORS = ['黑色', '深棕色', '琥珀色', '浅灰色', '冰蓝色'];

export const BOYFRIEND_TYPE_LABELS: Record<BoyfriendTypeId, { label: string; emoji: string }> = {
  puppy: { label: '年下奶狗', emoji: '🐶' },
  gentleman: { label: '成熟大叔', emoji: '🍷' },
  artist: { label: '艺术系男生', emoji: '🎨' },
  ceo: { label: '霸道总裁', emoji: '👔' },
  childhood: { label: '青梅竹马', emoji: '🏡' },
  senior: { label: '高冷学长', emoji: '❄️' },
};
