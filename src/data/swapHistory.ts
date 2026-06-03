import type { SwapRecord } from '../types';

export const swapHistory: SwapRecord[] = [
  {
    id: 'swap_001',
    fromBoyfriend: { id: 'bf_puppy_001', name: '宋年宇', avatar: '', typeId: 'puppy' },
    toBoyfriend: { id: 'bf_gentleman_002', name: '顾怀瑾', avatar: '', typeId: 'gentleman' },
    reason: 'want_to_try_new',
    timestamp: Date.now() - 2 * 24 * 3600 * 1000,
    duration: 340,
    rating: 4,
    highlightLine: '姐姐笑起来真好看，我能看一整天！',
  },
  {
    id: 'swap_002',
    fromBoyfriend: { id: 'bf_gentleman_002', name: '顾怀瑾', avatar: '', typeId: 'gentleman' },
    toBoyfriend: { id: 'bf_ceo_004', name: '陆霆深', avatar: '', typeId: 'ceo' },
    reason: 'curious_about_type',
    timestamp: Date.now() - 5 * 24 * 3600 * 1000,
    duration: 520,
    rating: 5,
    highlightLine: '你不用变完美。你已经足够好了。',
  },
  {
    id: 'swap_003',
    fromBoyfriend: { id: 'bf_ceo_004', name: '陆霆深', avatar: '', typeId: 'ceo' },
    toBoyfriend: { id: 'bf_artist_003', name: '沈墨白', avatar: '', typeId: 'artist' },
    reason: 'recommendation',
    timestamp: Date.now() - 7 * 24 * 3600 * 1000,
    duration: 280,
    rating: 4,
    highlightLine: '你是我的例外。',
  },
];

export const getRecentThreeSwaps = (): SwapRecord[] => swapHistory.slice(0, 3);
