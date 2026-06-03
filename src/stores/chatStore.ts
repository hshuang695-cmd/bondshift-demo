import { create } from 'zustand';
import type { ChatMessage, TypingStatus } from '../types';
import type { UserMemory } from '../core/memoryEngine';
import type { BoyfriendPersonality } from '../core/personalityEngine';
import { generateReply } from '../core/chatEngine';
import { createMemory, updateMemory } from '../core/memoryEngine';
import {
  type PendingAction,
  type PendingActionType,
  createPendingAction,
  isPendingActionExpired,
  detectUserActionRequest,
  isFollowUpPrompt,
} from '../core/contextEngine';
import { useBoyfriendStore } from './boyfriendStore';

// 默认人格回退（personality 为 null 时使用）
const FALLBACK_PERSONALITY: BoyfriendPersonality = {
  dominance: 50, emotionalStability: 50,
  communicationStyle: 50, attachmentStyle: 50,
};

const DEBUG = import.meta.env.DEV;

function log(msg: string, data?: unknown) {
  if (!DEBUG) return;
  if (data !== undefined) console.log(`[Chat] ${msg}`, data);
  else console.log(`[Chat] ${msg}`);
}

function logError(msg: string, err: unknown) {
  if (!DEBUG) return;
  console.error(`[Chat Error] ${msg}`, err);
}

/** 判断 bot 回复是否真正履行了动作（而非仅承诺/确认） */
function isReplyFulfillment(replyContent: string, actionType: PendingActionType): boolean {
  const text = replyContent;
  // 如果回复太短，大概率只是确认/承诺
  if (text.length < 15) return false;

  // 承诺/确认类关键词（说明没真正执行）
  const promiseOnly = /^(好的|好|行|可以|没问题|当然|包在我身上|我马上|等着|来了|嗯嗯).{0,10}$/;

  // 如果整个回复就是承诺，说明没履行
  if (promiseOnly.test(text.trim())) return false;

  // 对于笑话：回复应该包含幽默故事内容（长度>20且包含语气词/转折）
  if (actionType === 'tell_joke') {
    return text.length > 20 && !/^(好的|好|行|可以|没问题|包在我身上|我马上|等着|嗯嗯)/.test(text);
  }

  // 对于建议：应该包含具体的建议内容
  if (actionType === 'advice') {
    return text.length > 20 && /建议|可以|试试|应该|第一步|考虑|不妨|或者|先|再|最后|觉得/.test(text);
  }

  // 对于解释：应该包含因果/分析
  if (actionType === 'explain') {
    return text.length > 20 && /因为|所以|原因|导致|可能|或许|其实|一般|往往|通常/.test(text);
  }

  // 对于安慰/陪伴/倾听/拥抱：只要有实质性内容就算履行
  return text.length > 20;
}

interface ChatState {
  messages: ChatMessage[];
  typingStatus: TypingStatus;
  memory: UserMemory;
  lastContext: string;
  pendingAction: PendingAction | null;

  addUserMessage: (content: string) => void;
  generateAndAddReply: () => void;
  clearChat: () => void;
  setTypingStatus: (status: TypingStatus) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  typingStatus: 'idle',
  memory: createMemory(),
  lastContext: '',
  pendingAction: null,

  addUserMessage: (content) => {
    log('user message added', content.slice(0, 30));

    const bf = useBoyfriendStore.getState().currentBoyfriend;
    const bfId = bf?.id ?? '';
    const currentPending = get().pendingAction;

    // Phase 13: 检测用户是否在发起新请求 → 创建/更新 pendingAction
    const userRequest = detectUserActionRequest(content);
    if (userRequest) {
      const newAction = createPendingAction(userRequest, 'user_request', content.slice(0, 20));
      log('pending action created from user request', { type: newAction.type });
      set({ pendingAction: newAction });
    }
    // 如果是跟进提示且有未完成的 pendingAction → 标记以便强制履行
    else if (currentPending && !currentPending.fulfilled && isFollowUpPrompt(content)) {
      log('follow-up prompt detected, pending action remains active', {
        type: currentPending.type,
        turns: currentPending.turnCount,
      });
      // pendingAction 保持不变，turnCount 会在 generateAndAddReply 中增加
    }
    // 其他情况：如果有过期或已履行的 pendingAction → 清除
    else if (currentPending && (currentPending.fulfilled || isPendingActionExpired(currentPending))) {
      log('pending action cleared', { type: currentPending.type, fulfilled: currentPending.fulfilled });
      set({ pendingAction: null });
    }

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      sessionId: bfId,
      sender: 'user',
      type: 'text',
      content,
      timestamp: Date.now(),
      isRead: true,
    };

    const currentMemory = get().memory;
    const newMemory = updateMemory(currentMemory, content);

    set((state) => ({
      messages: [...state.messages, userMsg],
      memory: newMemory,
      typingStatus: 'typing',
    }));

    log('typing started');

    const delay = 100 + Math.random() * 250;

    setTimeout(() => {
      get().generateAndAddReply();
    }, delay);
  },

  generateAndAddReply: () => {
    log('reply generation started');

    const state = get();
    const bf = useBoyfriendStore.getState();

    if (!bf.currentBoyfriend) {
      logError('no current boyfriend', null);
      set({ typingStatus: 'idle' });
      return;
    }

    const personality: BoyfriendPersonality = bf.personality ?? FALLBACK_PERSONALITY;
    if (!bf.personality) {
      log('personality is null, using fallback');
    }

    const lastUserMsg = [...state.messages].reverse().find((m) => m.sender === 'user');
    if (!lastUserMsg) {
      logError('no user message found', null);
      set({ typingStatus: 'idle' });
      return;
    }

    const lastBotMsg = [...state.messages].reverse().find((m) => m.sender === 'boyfriend');
    if (lastBotMsg) {
      log('last bot message', lastBotMsg.content.slice(0, 40));
    }

    // Phase 13: 更新 pendingAction 的 turnCount
    let currentPending = state.pendingAction;
    if (currentPending && !currentPending.fulfilled) {
      currentPending = { ...currentPending, turnCount: currentPending.turnCount + 1 };
      log('pending action incremented', { type: currentPending.type, turn: currentPending.turnCount });
    }

    // 如果 pending 已过期，清除它
    if (currentPending && isPendingActionExpired(currentPending)) {
      log('pending action expired, clearing');
      currentPending = null;
    }

    try {
      const reply = generateReply({
        userMessage: lastUserMsg.content,
        typeId: bf.currentBoyfriend.typeId,
        personality,
        relationshipLevel: bf.relationshipLevel,
        relationshipStage: bf.relationshipScores.stage,
        memory: state.memory,
        boyfriendId: bf.currentBoyfriend.id,
        recentMessages: state.messages.slice(-6),
        lastBotMessage: lastBotMsg,
        pendingAction: currentPending,
      });

      log('reply generated', reply.content.slice(0, 40));

      // Phase 13: 判断回复是否真正履行了 pendingAction
      let updatedPending = currentPending;
      if (currentPending && !currentPending.fulfilled) {
        const fulfilled = isReplyFulfillment(reply.content, currentPending.type);
        if (fulfilled) {
          log('pending action fulfilled', { type: currentPending.type });
          updatedPending = null; // 履行完成，清除
        } else {
          log('pending action NOT yet fulfilled, keeping active', { type: currentPending.type });
          updatedPending = currentPending; // 保持未完成状态
        }
      }

      set((s) => ({
        messages: [...s.messages, reply],
        typingStatus: 'idle',
        lastContext: reply.content.slice(0, 50),
        pendingAction: updatedPending,
      }));

      log('reply added to messages');
      log('typing ended');
    } catch (err) {
      logError('generateReply threw exception', err);

      const fallbackReply: ChatMessage = {
        id: `msg_${Date.now()}_fallback`,
        sessionId: bf.currentBoyfriend.id,
        sender: 'boyfriend',
        type: 'text',
        content: '嗯…我在听。',
        timestamp: Date.now(),
        isRead: false,
      };

      set((s) => ({
        messages: [...s.messages, fallbackReply],
        typingStatus: 'idle',
        pendingAction: null,
      }));

      log('fallback reply added');
    }
  },

  clearChat: () => {
    set({
      messages: [],
      memory: createMemory(),
      typingStatus: 'idle',
      lastContext: '',
      pendingAction: null,
    });
  },

  setTypingStatus: (status) => set({ typingStatus: status }),
}));
