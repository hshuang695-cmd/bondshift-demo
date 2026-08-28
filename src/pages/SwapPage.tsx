import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Clock, TrendingUp, Shuffle } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useSwapStore, useBoyfriendStore } from '../stores';
import { swapBoyfriend } from '../core/bondshiftEngine';
import { getAvatarByArchetype, getTypeEmoji } from '../core/avatarEngine';
import { boyfriends } from '../data';
import type { BoyfriendTypeId } from '../types';

const reasons = ['想试试不同的性格', '当前匹配度不够', '好奇其它类型', '想体验新鲜感'];

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

export default function SwapPage() {
  const { recentThree, totalSwapCount, recommendations } = useSwapStore();
  const currentBoyfriend = useBoyfriendStore((s) => s.currentBoyfriend);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const currentBf = currentBoyfriend ?? boyfriends[0];
  const targetBf = selectedTo ? boyfriends.find((b) => b.id === selectedTo) : null;
  const maxBaseScore = boyfriends.reduce((max, b) => Math.max(max, b.compatibility.baseScore), 0);

  const handleSwap = () => {
    if (!selectedTo || !selectedReason) return;
    swapBoyfriend(currentBf.id, selectedTo, selectedReason);
    setShowConfirm(false);
    setSelectedTo(null);
    setSelectedReason('');
  };

  return (
    <div className="flex flex-col min-h-full pb-4">
      <PageHeader title="换乘男友" subtitle="探索最适合你的人格类型" />

      {/* 桌面两栏对比：当前男友 vs 候选列表 */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="px-5 mb-4 lg:px-0 lg:mb-0">
          <p className="text-xs text-text-secondary font-semibold mb-2.5 uppercase tracking-wider">
            当前男友
          </p>
          <div className="card p-4 flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-4 lg:p-6">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center flex-shrink-0 overflow-hidden lg:w-full lg:h-32 lg:rounded-3xl">
              <AvatarImg typeId={currentBf.typeId} className="w-full h-full object-cover" />
              <span className="text-2xl" style={{ display: 'none' }}>{getTypeEmoji(currentBf.typeId)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-text-primary lg:text-base">{currentBf.name}</p>
              <p className="text-xs text-text-secondary">{currentBf.mbti} · {currentBf.title}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentBf.tags.slice(0, 3).map((t) => (
                  <span key={t.key} className="text-[10px] px-1.5 py-0.5 bg-surface-200 text-text-secondary rounded-full">
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
            <ArrowRight size={18} className="text-text-tertiary flex-shrink-0 lg:hidden" />
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center flex-shrink-0 overflow-hidden lg:hidden">
              {targetBf ? (
                <>
                  <AvatarImg typeId={targetBf.typeId} className="w-full h-full object-cover" />
                  <span className="text-2xl" style={{ display: 'none' }}>{getTypeEmoji(targetBf.typeId)}</span>
                </>
              ) : (
                <span className="text-2xl">❓</span>
              )}
            </div>
          </div>

          {/* 换乘数据卡（移动端横向三卡 / 桌面纵向堆叠） */}
          <div className="mt-3 flex gap-3 lg:mt-4 lg:flex-col lg:gap-3">
            <div className="flex-1 card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                <Shuffle size={18} className="text-accent-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{totalSwapCount}</p>
                <p className="text-[10px] text-text-tertiary">总换乘次数</p>
              </div>
            </div>
            <div className="flex-1 card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center">
                <Clock size={18} className="text-warm-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{recentThree.length}</p>
                <p className="text-[10px] text-text-tertiary">最近换乘</p>
              </div>
            </div>
            <div className="flex-1 card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <TrendingUp size={18} className="text-brand-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{maxBaseScore}%</p>
                <p className="text-[10px] text-text-tertiary">最高匹配</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 flex-1 lg:px-0">
          <p className="text-xs text-text-secondary font-semibold mb-2.5 uppercase tracking-wider">
            推荐换乘
          </p>
          <div className="space-y-3">
            {recommendations.filter((b) => b.id !== currentBf.id).map((bf, i) => {
              const isSelected = selectedTo === bf.id;

              return (
                <motion.button
                  key={bf.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedTo(bf.id);
                    setShowConfirm(true);
                  }}
                  className={`w-full card card-hover p-4 flex items-center gap-4 transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-brand-500 ring-offset-1' : ''
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <AvatarImg typeId={bf.typeId} className="w-full h-full object-cover" loading="lazy" />
                    <span className="text-2xl" style={{ display: 'none' }}>{getTypeEmoji(bf.typeId)}</span>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-text-primary">{bf.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-accent-100 text-accent-700 rounded-full font-medium">
                        {bf.mbti}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                      {bf.greeting}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Heart size={12} className="text-brand-500" fill="currentColor" />
                      <span className="text-sm font-bold text-brand-500">{bf.compatibility.baseScore}%</span>
                    </div>
                    <span className="text-[10px] text-text-tertiary">推荐匹配</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {showConfirm && targetBf && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setShowConfirm(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-[430px] bg-surface-0 rounded-t-[28px] p-6 pb-8 shadow-rose-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-surface-300 rounded-full mx-auto mb-5" />

            <div className="text-center mb-5">
              <p className="text-lg font-bold text-text-primary">
                确认换乘到 {targetBf.name}？
              </p>
              <p className="text-sm text-text-secondary mt-1">
                换乘后将开始新的恋爱体验
              </p>
            </div>

            <div className="space-y-2 mb-5">
              <p className="text-xs text-text-secondary font-medium">换乘理由</p>
              <div className="grid grid-cols-2 gap-2">
                {reasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedReason(r)}
                    className={`text-xs p-2.5 rounded-full border transition-all ${
                      selectedReason === r
                        ? 'border-brand-500 bg-brand-50 text-brand-600 font-semibold'
                        : 'border-surface-200 text-text-secondary'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-full border-[1.5px] border-brand-500 text-brand-600 font-semibold text-sm transition-colors hover:bg-brand-50"
              >
                取消
              </button>
              <button
                onClick={handleSwap}
                disabled={!selectedReason}
                className={`flex-1 py-3 rounded-full font-semibold text-sm transition-all ${
                  selectedReason
                    ? 'border border-brand-500 gradient-brand text-surface-50 shadow-rose-md hover:shadow-rose-glow hover:brightness-110'
                    : 'bg-surface-300 text-text-tertiary cursor-not-allowed'
                }`}
              >
                确认换乘
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
