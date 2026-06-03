import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { usePreferenceStore } from '../stores';
import { createBoyfriend } from '../core/bondshiftEngine';
import { MBTI_TYPES, TRAIT_LABELS, STYLE_OPTIONS } from '../utils/constants';

const stepTitles = ['选择人格类型', '调整属性偏好', '定制外观风格'];

export default function SetupPage() {
  const navigate = useNavigate();
  const {
    step, selectedPersonalities, traits, preferredStyle,
    setStep, togglePersonality, setStyle, setTrait,
  } = usePreferenceStore();

  const selectedMbtiCount = selectedPersonalities.length;

  const handleComplete = useCallback(() => {
    if (step === 3) {
      createBoyfriend();
      navigate('/home');
    } else {
      setStep((step + 1) as 1 | 2 | 3);
    }
  }, [step, navigate, setStep]);

  const handleSliderClick = useCallback(
    (traitKey: Parameters<typeof setTrait>[0], e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.round((x / rect.width) * 100);
      setTrait(traitKey, Math.max(0, Math.min(100, pct)));
    },
    [setTrait],
  );

  return (
    <div className="flex flex-col min-h-full pb-4">
      <PageHeader title="偏好设置" subtitle="定制你的专属 AI 男友" />

      <div className="flex items-center justify-center gap-3 px-5 mb-6">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s as 1 | 2 | 3)}
            className="flex items-center gap-2"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step === s
                  ? 'gradient-brand text-white shadow-lg shadow-brand-500/25'
                  : step > s
                  ? 'bg-brand-100 text-brand-500'
                  : 'bg-surface-200 text-text-tertiary'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                step === s ? 'text-brand-500' : 'text-text-tertiary'
              }`}
            >
              {stepTitles[s - 1]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 px-5">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <p className="text-sm text-text-secondary font-medium">
              选择你感兴趣的性格类型（可多选）
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {MBTI_TYPES.map((mbti) => {
                const selected = selectedPersonalities.includes(mbti.type);
                return (
                  <motion.button
                    key={mbti.type}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => togglePersonality(mbti.type)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all duration-200 ${
                      selected
                        ? 'bg-brand-50 border border-brand-300 shadow-sm'
                        : 'bg-white border border-surface-200'
                    }`}
                  >
                    <span className="text-lg">{mbti.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary leading-tight">
                        {mbti.type}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate">
                        {mbti.label}
                      </p>
                    </div>
                    {selected && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <p className="text-sm text-text-secondary font-medium">
              点击拖动滑块调整你理想男友的属性值
            </p>
            {TRAIT_LABELS.map((trait) => (
              <div key={trait.key} className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{trait.emoji}</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {trait.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-brand-500">
                    {traits[trait.key]}%
                  </span>
                </div>
                <div
                  className="relative h-2 bg-surface-200 rounded-full cursor-pointer"
                  onClick={(e) => handleSliderClick(trait.key, e)}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 gradient-brand rounded-full pointer-events-none"
                    animate={{ width: `${traits[trait.key]}%` }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <p className="text-sm text-text-secondary font-medium">
              选择你喜欢的风格气质
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {STYLE_OPTIONS.map((style) => {
                const selected = preferredStyle === style.key;
                return (
                  <motion.button
                    key={style.key}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setStyle(style.key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 ${
                      selected
                        ? 'bg-brand-50 border border-brand-300 shadow-sm'
                        : 'bg-white border border-surface-200'
                    }`}
                  >
                    <span className="text-2xl">{style.emoji}</span>
                    <span
                      className={`text-xs font-semibold ${
                        selected ? 'text-brand-500' : 'text-text-secondary'
                      }`}
                    >
                      {style.key}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-5 mt-4"
            >
              <p className="text-xs text-text-secondary font-medium mb-3">
                你的理想男友预览
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💝</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {preferredStyle ? `${preferredStyle}系男友` : '选择风格后生成'}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {selectedMbtiCount > 0
                      ? `MBTI: ${selectedPersonalities.slice(0, 3).join(' · ')}`
                      : '等待人格选择'}
                  </p>
                  <div className="flex gap-1 mt-1.5">
                    {TRAIT_LABELS.slice(0, 3).map((t) => (
                      <span
                        key={t.key}
                        className="text-[10px] px-2 py-0.5 bg-brand-50 text-brand-500 rounded-full font-medium"
                      >
                        {t.emoji} {traits[t.key]}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <div className="px-5 pt-4 flex gap-3">
        {step > 1 && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setStep((step - 1) as 1 | 2 | 3)}
            className="flex-1 py-3 rounded-2xl border border-surface-300 text-text-secondary font-semibold text-sm"
          >
            上一步
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleComplete}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white gradient-brand shadow-lg shadow-brand-500/20"
        >
          {step === 3 ? '✓ 完成设置' : '下一步'}
        </motion.button>
      </div>
    </div>
  );
}
