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
    <main className="min-h-screen overflow-hidden bg-[#2f292e] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-brand-700/30 blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-accent-700/25 blur-3xl" />
      </div>
      <header className="relative z-10 flex items-center justify-between px-5 py-5">
        <button type="button" onClick={() => { setStep(3); navigate('/setup'); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-white/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300">
          <ArrowLeft size={18} />修改答案
        </button>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-200">匹配完成</span>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-5xl items-center gap-10 px-5 pb-12 pt-4 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }} className="relative mx-auto w-full max-w-[360px]">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-500/30 to-accent-500/25 blur-xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
            <img src={avatar.primary} alt={`${boyfriend.name}头像`} className="aspect-[4/5] w-full rounded-[1.45rem] object-cover object-top" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = avatar.fallback; }} />
            <div className="absolute inset-x-3 bottom-3 rounded-b-[1.45rem] bg-gradient-to-t from-black/80 via-black/35 to-transparent px-5 pb-5 pt-20">
              <div className="flex items-end justify-between gap-3">
                <div><p className="text-2xl font-black">{boyfriend.name}</p><p className="mt-1 text-sm text-white/75">{boyfriend.mbti} · {result.styleLabel}</p></div>
                <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur"><p className="text-xl font-black text-brand-100">{result.score}%</p><p className="text-[10px] text-white/70">契合度</p></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-300/25 bg-brand-300/10 px-3 py-2 text-xs font-bold text-brand-100"><Sparkles size={14} />你的陪伴匹配</div>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.045em] sm:text-5xl">你更需要一段<br />{result.styleLabel}的关系。</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/72">{result.summary}</p>
          <div className="mt-7 rounded-[1.5rem] border border-white/12 bg-white/[0.07] p-5 backdrop-blur-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-200">为什么适合</p>
            <ul className="mt-4 space-y-3">
              {result.reasons.map((reason) => <li key={reason} className="flex gap-3 text-sm leading-6 text-white/82"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-200" /><span>{reason}</span></li>)}
            </ul>
          </div>
          <button type="button" onClick={startConversation} className="group mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-black text-[#302c31] shadow-[0_16px_40px_rgba(0,0,0,0.22)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 sm:w-auto">
            <Heart size={18} className="text-brand-600" fill="currentColor" />和 {boyfriend.name} 初次见面<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-3 text-xs leading-5 text-white/50">无需注册，进入后可使用快捷回复或自由输入。</p>
        </motion.div>
      </section>
    </main>
  );
}
