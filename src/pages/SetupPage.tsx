import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SCENARIO_QUESTIONS } from '../core/scenarioMatchEngine';
import { usePreferenceStore } from '../stores';

export default function SetupPage() {
  const navigate = useNavigate();
  const { step, setStep, scenarioAnswers, setScenarioAnswer } = usePreferenceStore();
  const question = SCENARIO_QUESTIONS[step - 1];
  const selectedAnswer = scenarioAnswers[question.id];
  const progress = (step / SCENARIO_QUESTIONS.length) * 100;
  const completedCount = useMemo(
    () => SCENARIO_QUESTIONS.filter((item) => scenarioAnswers[item.id]).length,
    [scenarioAnswers],
  );

  const chooseAnswer = (answerId: string) => setScenarioAnswer(question.id, answerId);

  const goNext = () => {
    if (!selectedAnswer) return;
    if (step < SCENARIO_QUESTIONS.length) {
      setStep((step + 1) as 1 | 2 | 3);
      return;
    }
    navigate('/match');
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#fff9fb]">
      <header className="flex items-center justify-between px-5 py-5">
        <Link
          to="/"
          aria-label="返回 BONDSHIFT 首页"
          className="flex min-h-11 items-center gap-2 rounded-xl font-black tracking-[0.08em] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl gradient-brand text-white">
            <Heart size={16} fill="currentColor" />
          </span>
          BONDSHIFT
        </Link>
        <span className="text-xs font-semibold text-[#6f6872]">{completedCount}/3 已选择</span>
      </header>

      <div className="h-1 bg-brand-50" aria-hidden="true">
        <motion.div className="h-full bg-brand-600" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
      </div>

      <section className="mx-auto flex w-full max-w-[680px] flex-1 flex-col px-5 pb-8 pt-10 sm:px-8 sm:pt-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">{question.eyebrow}</p>
            <h1 className="mt-4 text-[1.75rem] font-black leading-[1.3] tracking-[-0.035em] text-[#29252a] sm:text-4xl">
              {question.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6f6872]">{question.context}</p>

            <div className="mt-8 grid gap-3" role="radiogroup" aria-label={question.title}>
              {question.options.map((option, index) => {
                const selected = option.id === selectedAnswer;
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => chooseAnswer(option.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`group flex min-h-[82px] w-full items-center gap-4 rounded-[1.35rem] border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 sm:p-5 ${
                      selected
                        ? 'border-brand-500 bg-brand-50 shadow-[0_10px_28px_rgba(184,44,78,0.10)]'
                        : 'border-surface-300 bg-white hover:border-brand-200'
                    }`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-black ${selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-surface-400 text-[#6f6872]'}`}>
                      {selected ? <Check size={16} strokeWidth={3} /> : String.fromCharCode(65 + index)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-bold text-[#29252a]">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#6f6872] sm:text-sm">{option.description}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto flex gap-3 pt-8">
          {step > 1 && (
            <button type="button" onClick={() => setStep((step - 1) as 1 | 2 | 3)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-surface-300 bg-white px-5 text-sm font-bold text-[#4d474f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200">
              <ArrowLeft size={17} />上一题
            </button>
          )}
          <button type="button" onClick={goNext} disabled={!selectedAnswer} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#961e3e] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(150,30,62,0.22)] transition disabled:cursor-not-allowed disabled:bg-surface-300 disabled:text-text-tertiary disabled:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200">
            {step === 3 ? '查看我的陪伴匹配' : '下一题'}<ArrowRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}
