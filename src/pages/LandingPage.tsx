import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Heart,
  MessageCircleHeart,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getAvatarByArchetype } from '../core/avatarEngine';
import { trackExperienceStart, trackLandingView } from '../core/analyticsEngine';
import type { BoyfriendTypeId } from '../types';

const companionStyles: Array<{
  typeId: BoyfriendTypeId;
  name: string;
  label: string;
  reply: string;
}> = [
  {
    typeId: 'puppy',
    name: '宋年宇',
    label: '热烈回应',
    reply: '先别硬撑。想说就说，我会一直听。',
  },
  {
    typeId: 'gentleman',
    name: '顾怀瑾',
    label: '沉稳陪伴',
    reply: '先坐下来。今天最让你累的是哪一件事？',
  },
];

const steps = [
  {
    icon: MessageCircleHeart,
    title: '说出你需要的陪伴',
    description: '完成偏好测试，不必先懂 MBTI。',
  },
  {
    icon: Heart,
    title: '遇见适合你的他',
    description: '从一次具体情境开始认识彼此。',
  },
  {
    icon: RefreshCcw,
    title: '留下，或者换乘',
    description: '每段关系与记忆都会分别保存。',
  },
];

function getLandingSource(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('utm_source') ?? params.get('source') ?? (document.referrer ? 'referral' : 'direct');
}

function CompanionReply({ typeId, name, label, reply }: (typeof companionStyles)[number]) {
  const avatar = getAvatarByArchetype(typeId);

  return (
    <div className="flex gap-3 rounded-2xl border border-brand-100/80 bg-surface-0/85 p-3.5 shadow-rose-sm backdrop-blur-sm">
      <img
        src={avatar.primary}
        alt={`${name}头像`}
        className="h-12 w-12 shrink-0 rounded-2xl object-cover"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = avatar.fallback;
        }}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-text-primary">{name}</span>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
            {label}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-6 text-text-secondary">{reply}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  useEffect(() => {
    trackLandingView(getLandingSource(), window.innerWidth < 768 ? 'mobile' : 'desktop');
  }, []);

  const handleExperienceStart = () => {
    trackExperienceStart(getLandingSource());
  };

  return (
    <main className="relative min-h-screen min-h-[100dvh] w-full overflow-hidden bg-surface-50 text-text-primary">
      {/* Hero 区：Sky Blush 渐变背景 + 柔光弥散 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] gradient-accent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-mint-100/50 blur-3xl" />
        <div className="absolute bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cream-100/60 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2.5 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          aria-label="BONDSHIFT 首页"
        >
          <span className="grid h-9 w-9 place-items-center rounded-2xl gradient-brand text-surface-50 shadow-rose-sm">
            <Heart size={18} fill="currentColor" />
          </span>
          {/* V-3 艺术字位置 1：Logo（Fraunces Italic + 玫瑰酒红） */}
          <span className="font-display text-lg font-semibold italic tracking-[0.08em] text-brand-500">
            BONDSHIFT
          </span>
        </Link>
        <span className="rounded-full border border-brand-100 bg-surface-0/75 px-3 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur-sm">
          作品集公开测试版
        </span>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20 lg:pb-28 lg:pt-20">
        <motion.div
          initial={{ y: 18 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="max-w-xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-surface-0/75 px-3 py-2 text-xs font-semibold text-brand-700 shadow-rose-sm backdrop-blur-sm">
            <Sparkles size={14} />
            为长期陪伴设计的 AI 关系体验
          </div>
          {/* V-3 艺术字位置 2：Hero 主标题（Cormorant Italic） */}
          <h1 className="font-serif text-[2.55rem] font-medium italic leading-[1.15] tracking-[-0.02em] text-ink sm:text-6xl">
            先聊过，
            <br />
            再决定谁更适合你。
          </h1>
          {/* V-3 艺术字位置 4：Script 副标语 */}
          <p className="mt-3 font-script text-lg text-brand-500">
            a new companion, every day
          </p>
          <p className="mt-4 max-w-lg text-base leading-8 text-text-secondary sm:text-lg sm:leading-9">
            花几分钟告诉我们你期待怎样被陪伴。BONDSHIFT 会为你匹配一位 AI 男友，也允许你换一种关系，继续了解自己。
          </p>
          <div className="mt-8">
            <Link
              to="/setup"
              onClick={handleExperienceStart}
              className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-brand-500 gradient-brand px-7 py-4 text-base font-bold text-surface-50 shadow-rose-md transition-all hover:shadow-rose-glow hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 active:scale-[0.96] sm:w-auto"
            >
              开始陪伴测试
              <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-3 text-center text-xs text-text-secondary sm:text-left">
              下一步完成 3 道情景题 · 无需注册 · 免费体验
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-[470px]"
        >
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-100/70 to-mint-100/60 blur-xl" />
          <div className="relative rounded-[2rem] border border-surface-0/90 bg-surface-0/65 p-4 shadow-rose-lg backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">同一种情绪</p>
                <p className="mt-1 text-lg font-bold text-text-primary">不同的陪伴方式</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-500">
                <MessageCircleHeart size={20} />
              </span>
            </div>
            {/* 用户消息：酒红渐变 + Cloud White 文字（手册 4.5） */}
            <div className="mb-3 ml-auto max-w-[82%] rounded-2xl rounded-tr-md gradient-brand px-4 py-3 text-sm leading-6 text-surface-50 shadow-rose-sm">
              今天真的很累。
            </div>
            <div className="space-y-3">
              {companionStyles.map((style) => (
                <CompanionReply key={style.typeId} {...style} />
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-accent-50/90 px-4 py-3 text-xs leading-5 text-accent-800">
              <Sparkles size={15} className="shrink-0" />
              不是寻找“最完美的人”，而是发现此刻更需要的关系。
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 border-y border-brand-100/70 bg-surface-0/50 px-5 py-20 backdrop-blur-sm sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-brand-600">体验只需要三步</p>
            {/* V-3 艺术字位置 3：章节分隔标题（Cormorant Italic） */}
            <h2 className="mt-3 font-serif text-3xl font-medium italic tracking-[-0.015em] text-ink sm:text-4xl">
              从被理解开始，而不是从选择人设开始。
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="card-hover rounded-[1.75rem] border border-brand-100/70 bg-surface-0 p-6 shadow-rose-sm">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                      <Icon size={21} />
                    </span>
                    <span className="font-script text-lg text-brand-500">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-100 text-accent-700">
            <ShieldCheck size={24} />
          </span>
          <h2 className="mt-5 font-serif text-3xl font-medium italic tracking-[-0.015em] text-ink">
            先安心体验，再决定要不要留下。
          </h2>
        </div>
        <div className="rounded-[1.75rem] border border-brand-100/70 bg-surface-0/75 p-6 shadow-rose-sm backdrop-blur-sm sm:p-8">
          <ul className="grid gap-4 text-sm leading-6 text-text-secondary sm:grid-cols-2">
            <li className="flex gap-3"><span className="font-bold text-brand-600">01</span><span>首次体验无需注册。</span></li>
            <li className="flex gap-3"><span className="font-bold text-brand-600">02</span><span>聊天数据默认保存在当前浏览器。</span></li>
            <li className="flex gap-3"><span className="font-bold text-brand-600">03</span><span>测试分析不记录完整聊天原文。</span></li>
            <li className="flex gap-3"><span className="font-bold text-brand-600">04</span><span>当前为功能测试版，部分回复使用安全降级内容。</span></li>
          </ul>
        </div>
      </section>

      {/* CTA 区：Paper Cream 底 + 墨绒紫文字（替代旧深色块） */}
      <section className="relative z-10 px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-brand-100/80 bg-surface-100 px-6 py-10 text-center shadow-rose-md sm:px-10 sm:py-14">
          <p className="text-sm font-semibold text-brand-600">你的需要，可以被认真区分。</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-medium italic tracking-[-0.015em] text-ink sm:text-4xl">
            今天，你更想被怎样陪伴？
          </h2>
          <Link
            to="/setup"
            onClick={handleExperienceStart}
            className="group mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-brand-500 gradient-brand px-7 py-4 text-base font-bold text-surface-50 shadow-rose-md transition-all hover:shadow-rose-glow hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 active:scale-[0.96] sm:w-auto"
          >
            开始陪伴测试
            <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-brand-100/70 px-5 py-7 text-center text-xs text-text-secondary sm:px-8">
        BONDSHIFT · 个人作品集公开测试版 · 2026
      </footer>
    </main>
  );
}
