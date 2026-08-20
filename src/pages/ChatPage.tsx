import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useBoyfriendStore } from '../stores';
import { useChatStore } from '../stores/chatStore';
import { recordInteraction } from '../core/bondshiftEngine';
import { getAvatarByArchetype, getTypeEmoji } from '../core/avatarEngine';
import type { BoyfriendTypeId } from '../types';

function AvatarImg({ typeId, className }: { typeId: BoyfriendTypeId; className?: string }) {
  const avatar = getAvatarByArchetype(typeId);
  return (
    <img
      src={avatar.primary}
      alt={typeId}
      className={className}
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget;
        if (el.src === avatar.primary) {
          el.src = avatar.fallback;
          return;
        }
        // DiceBear 也失败了，显示颜色背景 + emoji
        el.style.display = 'none';
        const fallback = el.nextElementSibling as HTMLElement | null;
        if (fallback) fallback.style.display = 'flex';
      }}
    />
  );
}

export default function ChatPage() {
  const { boyfriendId } = useParams<{ boyfriendId: string }>();
  const navigate = useNavigate();
  const bf = useBoyfriendStore((s) =>
    s.availableBoyfriends.find((b) => b.id === boyfriendId),
  );

  const allMessages = useChatStore((state) => state.messages);
  const typingStatus = useChatStore(
    (state) => state.typingByBoyfriend[boyfriendId ?? ''] ?? 'idle',
  );
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const messages = useMemo(
    () => allMessages.filter((message) => message.sessionId === boyfriendId),
    [allMessages, boyfriendId],
  );
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 进入聊天记录交互
  useEffect(() => {
    recordInteraction('chat', boyfriendId);
  }, [boyfriendId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingStatus]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || typingStatus === 'typing') return;
    addUserMessage(trimmed, boyfriendId);
    setInput('');
    inputRef.current?.focus();
  }, [input, typingStatus, addUserMessage, boyfriendId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  if (!bf) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center">
        <p className="text-text-tertiary text-sm">男友未找到</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-brand-500 text-sm font-medium">
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 bg-white/80 backdrop-blur">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-xl hover:bg-surface-100"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </motion.button>

        <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden bg-surface-200">
          <AvatarImg typeId={bf.typeId} className="w-full h-full object-cover" />
          <span className="w-full h-full flex items-center justify-center text-base" style={{ display: 'none' }}>
            {getTypeEmoji(bf.typeId)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text-primary leading-tight">{bf.name}</p>
          <p className="text-[11px] text-text-tertiary">
            {typingStatus === 'typing' ? '正在输入…' : '在线'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mb-3 overflow-hidden">
              <AvatarImg typeId={bf.typeId} className="w-full h-full object-cover" />
              <span className="text-2xl" style={{ display: 'none' }}>{getTypeEmoji(bf.typeId)}</span>
            </div>
            <p className="text-sm text-text-secondary font-medium">{bf.greeting}</p>
            <p className="text-xs text-text-tertiary mt-1">开始你们的第一次对话吧</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => {
            const isUser = msg.sender === 'user';
            const showAvatar = !isUser && (i === 0 || messages[i - 1]?.sender !== 'boyfriend');

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}
              >
                {!isUser && showAvatar && (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-200 flex-shrink-0">
                    <AvatarImg typeId={bf.typeId} className="w-full h-full object-cover" />
                    <span className="w-full h-full flex items-center justify-center text-xs" style={{ display: 'none' }}>
                      {getTypeEmoji(bf.typeId)}
                    </span>
                  </div>
                )}
                {!isUser && !showAvatar && <div className="w-7 flex-shrink-0" />}

                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'gradient-brand text-white rounded-br-md'
                      : 'bg-white text-text-primary rounded-bl-md shadow-sm border border-surface-100'
                  }`}
                >
                  {msg.content}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs flex-shrink-0 overflow-hidden">
                    <span className="text-xs">💝</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {typingStatus === 'typing' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-2"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-200 flex-shrink-0">
              <AvatarImg typeId={bf.typeId} className="w-full h-full object-cover" />
              <span className="w-full h-full flex items-center justify-center text-xs" style={{ display: 'none' }}>
                {getTypeEmoji(bf.typeId)}
              </span>
            </div>
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-surface-100">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-brand-300"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-surface-200 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2 bg-surface-50 rounded-2xl px-4 py-2 border border-surface-200">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说点什么…"
            disabled={typingStatus === 'typing'}
            className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-tertiary"
            autoFocus
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleSend}
            disabled={!input.trim() || typingStatus === 'typing'}
            className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
              input.trim() && typingStatus !== 'typing'
                ? 'bg-brand-500 text-white'
                : 'bg-surface-200 text-text-tertiary'
            }`}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
