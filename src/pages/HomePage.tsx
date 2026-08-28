import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Shuffle } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useBoyfriendStore } from '../stores';
import { recordInteraction } from '../core/bondshiftEngine';
import { getAvatarByArchetype, getTypeEmoji } from '../core/avatarEngine';
import { boyfriends } from '../data';
import { TRAIT_LABELS } from '../utils/constants';
import type { BoyfriendTypeId } from '../types';

function AvatarImg({
  typeId,
  className,
  loading = 'eager',
}: {
  typeId: BoyfriendTypeId;
  className?: string;
  loading?: 'eager' | 'lazy';
}) {
  const avatar = getAvatarByArchetype(typeId);
  return (
    <img
      src={avatar.primary}
      alt={typeId}
      className={className}
      loading={loading}
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget;
        if (el.src === avatar.primary) {
          el.src = avatar.fallback;
          return;
        }
        el.style.display = 'none';
        const fallback = el.nextElementSibling as HTMLElement | null;
        if (fallback) fallback.style.display = 'flex';
      }}
    />
  );
}

const PERSONALITY_LABELS: Record<string, { label: string; emoji: string }> = {
  dominance: { label: '支配性', emoji: '👑' },
  emotionalStability: { label: '情绪稳定', emoji: '🧘' },
  communicationStyle: { label: '沟通风格', emoji: '💬' },
  attachmentStyle: { label: '依恋风格', emoji: '💝' },
};

export default function HomePage() {
  const navigate = useNavigate();
  const currentBoyfriend = useBoyfriendStore((s) => s.currentBoyfriend);
  const personality = useBoyfriendStore((s) => s.personality);
  const relationshipLevel = useBoyfriendStore((s) => s.relationshipLevel);
  const bf = currentBoyfriend ?? boyfriends[0];

  useEffect(() => {
    recordInteraction('page_view');
  }, []);

  const quickActions = [
    { icon: MessageCircle, label: '聊天', color: 'text-accent-600', bg: 'bg-accent-100', path: `/chat/${bf.id}` },
    { icon: Shuffle, label: '换乘', color: 'text-brand-600', bg: 'bg-brand-100', path: '/swap' },
  ];

  return (
    <div className="flex flex-col min-h-full pb-4">
      <PageHeader
        title="BondShift"
        subtitle={personality ? `关系等级 Lv.${relationshipLevel}` : '你的 AI 男友已上线'}
      />

      {/* 桌面 12 栅格：主卡 col-span-7 / 侧列 col-span-5 */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="px-5 mb-5 lg:col-span-7 lg:px-0"
        >
          <div className="card overflow-hidden">
            <div className="h-36 gradient-brand relative flex items-end p-5">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 50%, #fbf7f4 0%, transparent 60%)',
                }}
              />
              <div className="relative z-10 flex items-end gap-4 w-full">
                <div className="w-20 h-20 rounded-2xl bg-surface-50/25 backdrop-blur flex items-center justify-center border-2 border-surface-50/40 flex-shrink-0 overflow-hidden">
                  <AvatarImg typeId={bf.typeId} className="w-full h-full object-cover" />
                  <span className="text-3xl" style={{ display: 'none' }}>{getTypeEmoji(bf.typeId)}</span>
                </div>
                <div className="text-surface-50 min-w-0">
                  <h2 className="text-xl font-bold leading-tight">{bf.name}</h2>
                  <p className="text-[13px] text-surface-50/80 mt-0.5">
                    {bf.mbti} · {bf.age}岁 · Lv.{relationshipLevel}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-text-secondary italic leading-relaxed">
                "{bf.greeting}"
              </p>

              <div className="space-y-2">
                {TRAIT_LABELS.slice(0, 4).map((trait) => {
                  const val = bf.attributes[trait.key] ?? 50;
                  return (
                    <div key={trait.key} className="flex items-center gap-2.5">
                      <span className="text-xs w-4 text-center">{trait.emoji}</span>
                      <span className="text-[11px] text-text-secondary w-12 flex-shrink-0">
                        {trait.label}
                      </span>
                      <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-brand rounded-full transition-all duration-500"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-brand-500 w-7 text-right">
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>

              {personality && (
                <div className="pt-2 border-t border-brand-100/70">
                  <p className="text-[10px] text-text-tertiary font-medium mb-2 uppercase tracking-wider">
                    人格画像
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(PERSONALITY_LABELS).map(([key, info]) => {
                      const val = personality[key as keyof typeof personality] ?? 50;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[10px] w-3">{info.emoji}</span>
                          <span className="text-[10px] text-text-tertiary w-12">{info.label}</span>
                          <div className="flex-1 h-1 bg-surface-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${val > 50 ? 'bg-accent-500' : 'bg-brand-400'}`}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-text-secondary w-6 text-right">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {bf.tags.map((tag) => (
                  <span
                    key={tag.key}
                    className="text-[10px] px-2.5 py-1 bg-brand-50 text-brand-600 rounded-full font-medium border border-brand-100"
                  >
                    {tag.emoji} {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 侧列：快捷操作 + 发现更多 */}
        <div className="lg:col-span-5 lg:flex lg:flex-col lg:gap-6">
          <div className="px-5 mb-5 lg:px-0 lg:mb-0">
            <p className="text-xs text-text-secondary font-semibold mb-3 uppercase tracking-wider">
              快捷操作
            </p>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    if (action.label === '聊天') recordInteraction('chat');
                    navigate(action.path);
                  }}
                  className="card-hover flex flex-col items-center gap-2 rounded-3xl py-4"
                >
                  <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center`}>
                    <action.icon size={22} className={action.color} />
                  </div>
                  <span className="text-[11px] font-medium text-text-secondary">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="px-5 lg:px-0 lg:flex-1">
            <p className="text-xs text-text-secondary font-semibold mb-3 uppercase tracking-wider">
              发现更多
            </p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible">
              {boyfriends.filter((b) => b.id !== bf.id).slice(0, 4).map((b, i) => (
                <motion.button
                  key={b.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate('/swap')}
                  className="flex-shrink-0 w-[100px] card card-hover p-3 text-center lg:w-auto"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    <AvatarImg typeId={b.typeId} className="w-full h-full object-cover" loading="lazy" />
                    <span className="text-xl" style={{ display: 'none' }}>{getTypeEmoji(b.typeId)}</span>
                  </div>
                  <p className="text-xs font-semibold text-text-primary truncate">{b.name}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">{b.mbti}</p>
                  <div className="mt-2 h-1 bg-surface-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-500 rounded-full"
                      style={{ width: `${b.compatibility.baseScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    匹配 {b.compatibility.baseScore}%
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
