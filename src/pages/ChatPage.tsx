import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, RefreshCw, Send } from 'lucide-react';
import { useBoyfriendStore } from '../stores';
import { useChatStore } from '../stores/chatStore';
import { recordInteraction } from '../core/bondshiftEngine';
import { getAvatarByArchetype, getTypeEmoji } from '../core/avatarEngine';
import type { BoyfriendTypeId } from '../types';

const EMPTY_QUICK_REPLIES: string[] = [];

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
  const relationshipLevel = useBoyfriendStore((s) => s.relationshipLevel);
  const relationshipScores = useBoyfriendStore((s) => s.relationshipScores);

  const allMessages = useChatStore((state) => state.messages);
  const typingStatus = useChatStore(
    (state) => state.typingByBoyfriend[boyfriendId ?? ''] ?? 'idle',
  );
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const quickReplies = useChatStore(
    (state) => state.quickRepliesByBoyfriend[boyfriendId ?? ''],
  ) ?? EMPTY_QUICK_REPLIES;
  const serviceError = useChatStore(
    (state) => state.errorByBoyfriend[boyfriendId ?? ''] ?? null,
  );
  const retryLastReply = useChatStore((state) => state.retryLastReply);
  const messages = useMemo(
    () => allMessages.filter((message) => message.sessionId === boyfriendId),
    [allMessages, boyfriendId],
  );
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasUserMessage = messages.some((message) => message.sender === 'user');

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
        <button onClick={() => navigate('/home')} className="mt-3 text-brand-500 text-sm font-medium">
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="viewport-full flex w-full justify-center bg-surface-50">
      {/* 对话主列：移动全宽 → lg 居中 max-w-3xl */}
      <div className="flex h-full w-full flex-col bg-surface-50 lg:max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-100/70 bg-surface-0/80 backdrop-blur">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/home')}
            className="rounded-full p-1.5 transition-colors hover:bg-brand-50"
            aria-label="返回上一页"
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
          {serviceError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-brand-200 bg-brand-50 px-3.5 py-3 text-xs leading-5 text-brand-800" role="status">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>DeepSeek 暂时未连接，本轮已使用安全降级回复，你的消息仍已保存。</p>
                <button type="button" onClick={() => boyfriendId && retryLastReply(boyfriendId)} className="mt-1 inline-flex items-center gap-1 font-bold text-brand-600 underline underline-offset-2">
                  <RefreshCw size={12} />重试真实 AI
                </button>
              </div>
            </div>
          )}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-3 overflow-hidden">
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

                  {/* 手册 4.5：角色消息（左）Paper Cream + 玫瑰描边；用户消息（右）酒红渐变 + Cloud White 文字 */}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'gradient-brand text-surface-50 rounded-br-md shadow-rose-sm'
                        : 'bg-surface-100 text-text-primary rounded-bl-md border border-brand-200/70 shadow-rose-sm'
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
              <div className="bg-surface-100 rounded-2xl rounded-bl-md px-4 py-3 border border-brand-200/70 shadow-rose-sm">
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

        {!hasUserMessage && quickReplies.length > 0 && (
          <div className="border-t border-brand-100/70 bg-surface-0 px-4 pt-3">
            <p className="mb-2 text-[11px] font-semibold text-text-secondary">可以这样开始，也可以自由输入</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickReplies.map((reply) => (
                <button key={reply} type="button" onClick={() => addUserMessage(reply, boyfriendId)} className="min-h-10 shrink-0 rounded-full border-[1.5px] border-brand-500 bg-brand-50 px-3.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200">
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-brand-100/70 bg-surface-0/80 backdrop-blur">
          <div className="flex items-center gap-2 bg-surface-50 rounded-full px-4 py-2 border border-brand-100/80">
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
              className={`rounded-full p-2 flex-shrink-0 transition-colors ${
                input.trim() && typingStatus !== 'typing'
                  ? 'bg-brand-500 text-surface-50'
                  : 'bg-surface-200 text-text-tertiary'
              }`}
              aria-label="发送消息"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* xl 信息栏：当前男友头像 / 关系分 / 标签（xl 以下隐藏，渐进披露） */}
      <aside className="hidden w-72 shrink-0 flex-col border-l border-brand-100/70 bg-surface-0/60 px-6 py-8 xl:flex" aria-label="当前男友信息">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-3xl border-2 border-brand-200/70 bg-surface-100 shadow-rose-sm">
          <AvatarImg typeId={bf.typeId} className="h-full w-full object-cover" />
          <span className="h-full w-full items-center justify-center text-3xl" style={{ display: 'none' }}>
            {getTypeEmoji(bf.typeId)}
          </span>
        </div>
        <p className="mt-4 text-center font-serif text-xl font-medium italic text-text-primary">
          {bf.name}
        </p>
        <p className="mt-1 text-center text-xs text-text-secondary">
          {bf.mbti} · {bf.title}
        </p>

        <div className="mt-6 rounded-2xl bg-surface-100 p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">
            关系分
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-600">
            {relationshipScores.overall}
            <span className="ml-1 text-xs font-medium text-text-secondary">/ 100</span>
          </p>
          <p className="mt-0.5 text-[11px] text-text-secondary">关系等级 Lv.{relationshipLevel}</p>
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">
            他的标签
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {bf.tags.map((tag) => (
              <span
                key={tag.key}
                className="rounded-full border border-brand-200/80 bg-brand-50 px-2.5 py-1 text-[10px] font-medium text-brand-700"
              >
                {tag.emoji} {tag.label}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
