export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  level: number;
  experience: number;
  joinDate: string;
  mbtiPreference: string[];
  totalSwaps: number;
  totalUnlocked: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}
