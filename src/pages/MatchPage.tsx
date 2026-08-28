import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, Sparkles } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { boyfriends } from '../data';
import { createScenarioBoyfriend } from '../core/bondshiftEngine';
import { calculateScenarioMatch } from '../core/scenarioMatchEngine';
import { getAvatarByArchetype } from '../core/avatarEngine';
import { useChatStore, usePreferenceStore } from '../stores';

export default function MatchPage() {
  const navigate = useNavigate();
  const answers = usePreferenceStore((state) => state.scenarioAnswers);
  const setStep = usePreferenceStore((state) => state.setStep);
  const result = useMemo(() => calculateScenarioMatch(answers), [answers]);
  const seedFirstMeeting = useChatStore((state) => state.seedFirstMeeting);

  if (!result) return <Navigate to="/setup" replace />;
  const boyfriend = boyfriends.find((item) => item.typeId === result.typeId);
  if (!boyfriend) return <Navigate to="/setup" replace />;
  const avatar = getAvatarByArchetype(result.typeId);

  const startConversation = () => {
    const matched = createScenarioBoyfriend(result);
    if (!matched) return;
    seedFirstMeeting(matched.id, result.firstMessage, result.quickReplies);
    navigate(`/chat/${matched.id}`);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-surface-50 text-text-primary">
      {/* 柔光弥散：樱花粉 × 薄荷云 */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-mint-100/60 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cream-100/60 blur-3xl" />
      </div>
      <header className="relative z-10 flex items-center justify-between px-5 py-5">
        <button type="button" onClick={() => { setStep(3); navigate('/setup'); }} className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-brand-500/70 bg-surface-0/60 px-4 text-sm font-semibold text-brand-600 backdrop-blur transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200">
          <ArrowLeft size={18} />修改答案
        </button>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">匹配完成</span>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-5xl items-center gap-10 px-5 pb-12 pt-4 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }} className="relative mx-auto w-full max-w-[360px]">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-200/80 to-mint-100/70 blur-xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-100/80 bg-surface-0 p-3 shadow-rose-lg">
            <img src={avatar.primary} alt={`${boyfriend.name}头像`} className="aspect-[4/5] w-full rounded-[1.45rem] object-cover object-top" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = avatar.fallback; }} />
            <div className="absolute inset-x-3 bottom-3 rounded-b-[1.45rem] bg-gradient-to-t from-ink/80 via-ink/35 to-transparent px-5 pb-5 pt-20">
              <div className="flex items-end justify-between gap-3">
                <div><p className="text-2xl font-black text-surface-50">{boyfriend.name}</p><p className="mt-1 text-sm text-surface-50/75">{boyfriend.mbti} · {result.styleLabel}</p></div>
                <div className="rounded-2xl bg-surface-0/85 px-3 py-2 text-center shadow-rose-sm backdrop-blur"><p className="text-xl font-black text-brand-600">{result.score}%</p><p className="text-[10px] text-text-secondary">契合度</p></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700"><Sparkles size={14} />你的陪伴匹配</div>
          <h1 className="mt-5 font-serif text-4xl font-medium italic leading-tight tracking-[-0.02em] text-ink sm:text-5xl">你更需要一段<br />{result.styleLabel}的关系。</h1>
          {/* V-3 艺术字位置 5：角色签名（Script） */}
          <p className="mt-2 font-script text-xl text-brand-500">— {boyfriend.name}</p>
          <p className="mt-4 max-w-xl text-base leading-8 text-text-secondary">{result.summary}</p>
          <div className="mt-7 rounded-[1.5rem] border border-brand-100/80 bg-surface-100 p-5 shadow-rose-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-600">为什么适合</p>
            <ul className="mt-4 space-y-3">
              {result.reasons.map((reason) => <li key={reason} className="flex gap-3 text-sm leading-6 text-text-primary"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-500" /><span>{reason}</span></li>)}
            </ul>
          </div>
          <button type="button" onClick={startConversation} className="group mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-brand-500 gradient-brand px-6 text-base font-black text-surface-50 shadow-rose-md transition-all hover:shadow-rose-glow hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 active:scale-[0.96] sm:w-auto">
            <Heart size={18} fill="currentColor" />和 {boyfriend.name} 初次见面<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-3 text-xs leading-5 text-text-tertiary">无需注册，进入后可使用快捷回复或自由输入。</p>
        </motion.div>
      </section>
    </main>
  );
}
