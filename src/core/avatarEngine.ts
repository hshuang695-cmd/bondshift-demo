// ─── Avatar 图片引擎 ───
// 职责: archetype → 本地图片 → DiceBear fallback，统一管理所有头像资源
// 优先使用 public/avatars/ 本地图片，加载失败时降级到 DiceBear

import type { BoyfriendTypeId } from '../types';
import type { BoyfriendProfile } from '../types';

// ══════════════════════════════════════════════
// Archetype → 本地图片映射
// ══════════════════════════════════════════════

const AVATAR_IMAGE_MAP: Record<BoyfriendTypeId, string> = {
  puppy: '/avatars/golden_retriever.png',
  gentleman: '/avatars/mature_gentleman.png',
  artist: '/avatars/artist.png',
  ceo: '/avatars/cold_ceo.png',
  childhood: '/avatars/childhood_friend.png',
  senior: '/avatars/cold_senior.png',
};

// DiceBear fallback URL (本地图片加载失败时使用)
const DICEBEAR_SEEDS: Record<BoyfriendTypeId, string> = {
  puppy: 'golden-retriever-puppy-bf',
  gentleman: 'mature-gentleman-bf',
  artist: 'artistic-soul-bf',
  ceo: 'cold-ceo-bf',
  childhood: 'childhood-friend-bf',
  senior: 'cold-senior-bf',
};

// 降级: 每个类型的标志色
const TYPE_COLORS: Record<BoyfriendTypeId, string> = {
  puppy: '#FF8C42', gentleman: '#4A6FA5', artist: '#9B59B6',
  ceo: '#2C3E50', childhood: '#27AE60', senior: '#7F8C8D',
};

// 降级: emoji (仅用于 alt text 和极端 fallback)
const TYPE_EMOJI: Record<BoyfriendTypeId, string> = {
  puppy: '🐶', gentleman: '🍷', artist: '🎨',
  ceo: '👔', childhood: '🏡', senior: '❄️',
};

// ══════════════════════════════════════════════
// 视觉档案
// ══════════════════════════════════════════════

export interface AvatarVisualProfile {
  archetype: BoyfriendTypeId;
  label: string;
  imagePath: string;
  fallbackUrl: string;
  color: string;
  theme: string;
}

const VISUAL_PROFILES: Record<BoyfriendTypeId, AvatarVisualProfile> = {
  puppy: {
    archetype: 'puppy', label: '年下奶狗', imagePath: AVATAR_IMAGE_MAP.puppy,
    fallbackUrl: '', color: TYPE_COLORS.puppy, theme: 'warm',
  },
  gentleman: {
    archetype: 'gentleman', label: '成熟大叔', imagePath: AVATAR_IMAGE_MAP.gentleman,
    fallbackUrl: '', color: TYPE_COLORS.gentleman, theme: 'navy',
  },
  artist: {
    archetype: 'artist', label: '艺术系男生', imagePath: AVATAR_IMAGE_MAP.artist,
    fallbackUrl: '', color: TYPE_COLORS.artist, theme: 'purple',
  },
  ceo: {
    archetype: 'ceo', label: '霸道总裁', imagePath: AVATAR_IMAGE_MAP.ceo,
    fallbackUrl: '', color: TYPE_COLORS.ceo, theme: 'dark',
  },
  childhood: {
    archetype: 'childhood', label: '青梅竹马', imagePath: AVATAR_IMAGE_MAP.childhood,
    fallbackUrl: '', color: TYPE_COLORS.childhood, theme: 'fresh',
  },
  senior: {
    archetype: 'senior', label: '高冷学长', imagePath: AVATAR_IMAGE_MAP.senior,
    fallbackUrl: '', color: TYPE_COLORS.senior, theme: 'gray',
  },
};

// 初始化 fallbackUrl
for (const typeId of Object.keys(VISUAL_PROFILES) as BoyfriendTypeId[]) {
  const seed = DICEBEAR_SEEDS[typeId];
  VISUAL_PROFILES[typeId].fallbackUrl =
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&size=128&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

// ══════════════════════════════════════════════
// 公开 API
// ══════════════════════════════════════════════

/** 根据 archetype 获取本地头像路径（优先）和 DiceBear fallback */
export function getAvatarByArchetype(typeId: BoyfriendTypeId): {
  primary: string;
  fallback: string;
  color: string;
} {
  const profile = VISUAL_PROFILES[typeId] ?? VISUAL_PROFILES.puppy;
  return {
    primary: profile.imagePath,
    fallback: profile.fallbackUrl,
    color: profile.color,
  };
}

/** 根据男友对象获取头像 */
export function getAvatarByBoyfriend(bf: BoyfriendProfile): {
  primary: string;
  fallback: string;
  color: string;
} {
  return getAvatarByArchetype(bf.typeId);
}

/** 获取头像的 alt 文本（无障碍） */
export function getAvatarAltText(bf: BoyfriendProfile): string {
  const profile = VISUAL_PROFILES[bf.typeId];
  const label = profile?.label ?? '男友';
  return `${label} ${bf.name} 头像`;
}

/** 获取 archetype 的完整视觉档案 */
export function getAvatarVisualProfile(typeId: BoyfriendTypeId): AvatarVisualProfile {
  return VISUAL_PROFILES[typeId] ?? VISUAL_PROFILES.puppy;
}

/** 获取 DiceBear fallback URL */
export function getAvatarFallbackUrl(typeId: BoyfriendTypeId, size = 128): string {
  const seed = DICEBEAR_SEEDS[typeId] ?? 'default-bf';
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&size=${size}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

/** 获取类型专属颜色 */
export function getTypeColor(typeId: BoyfriendTypeId): string {
  return TYPE_COLORS[typeId] ?? '#e8547c';
}

/** 获取降级 emoji */
export function getTypeEmoji(typeId: BoyfriendTypeId): string {
  return TYPE_EMOJI[typeId] ?? '💝';
}

/** 兼容旧 API：返回图片 URL（优先本地） */
export function getAvatarUrl(typeId: BoyfriendTypeId, _personality?: unknown, _stage?: unknown, _size?: number): string {
  return AVATAR_IMAGE_MAP[typeId] ?? AVATAR_IMAGE_MAP.puppy;
}
