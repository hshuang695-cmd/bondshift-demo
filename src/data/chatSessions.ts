import type { ChatSession } from '../types';

export const mockChatSessions: ChatSession[] = [
  {
    id: 'session_puppy',
    boyfriendId: 'bf_puppy_001',
    boyfriendName: '宋年宇',
    boyfriendAvatar: '',
    messages: [
      { id: 'msg_1', sessionId: 'session_puppy', sender: 'boyfriend', type: 'text', content: '姐姐！今天过得怎么样？', emotion: 'happy', timestamp: Date.now() - 3600000, isRead: true },
      { id: 'msg_2', sessionId: 'session_puppy', sender: 'user', type: 'text', content: '还不错，你呢？', timestamp: Date.now() - 3500000, isRead: true },
      { id: 'msg_3', sessionId: 'session_puppy', sender: 'boyfriend', type: 'text', content: '我今天去了新的咖啡店！拍了好多照片想给你看～☕', emotion: 'playful', timestamp: Date.now() - 3400000, isRead: true },
      { id: 'msg_4', sessionId: 'session_puppy', sender: 'boyfriend', type: 'text', content: '姐姐明天有空吗？我想带你去！他们家的草莓蛋糕超好吃！', emotion: 'happy', timestamp: Date.now() - 3300000, isRead: false },
    ],
    lastMessage: { id: 'msg_4', sessionId: 'session_puppy', sender: 'boyfriend', type: 'text', content: '姐姐明天有空吗？我想带你去！他们家的草莓蛋糕超好吃！', emotion: 'happy', timestamp: Date.now() - 3300000, isRead: false },
    unreadCount: 1,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3300000,
    isActive: true,
  },
  {
    id: 'session_gentleman',
    boyfriendId: 'bf_gentleman_002',
    boyfriendName: '顾怀瑾',
    boyfriendAvatar: '',
    messages: [
      { id: 'msg_5', sessionId: 'session_gentleman', sender: 'boyfriend', type: 'text', content: '今天下午有空吗？有场不错的音乐会。', emotion: 'gentle', timestamp: Date.now() - 7200000, isRead: true },
      { id: 'msg_6', sessionId: 'session_gentleman', sender: 'user', type: 'text', content: '好啊，几点？', timestamp: Date.now() - 7000000, isRead: true },
      { id: 'msg_7', sessionId: 'session_gentleman', sender: 'boyfriend', type: 'text', content: '七点。我会提前在你公司楼下等你。', timestamp: Date.now() - 6800000, isRead: true },
    ],
    lastMessage: { id: 'msg_7', sessionId: 'session_gentleman', sender: 'boyfriend', type: 'text', content: '七点。我会提前在你公司楼下等你。', timestamp: Date.now() - 6800000, isRead: true },
    unreadCount: 0,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 6800000,
    isActive: false,
  },
];
