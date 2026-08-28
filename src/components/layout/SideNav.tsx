import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, SlidersHorizontal, Home, Shuffle, BarChart3, Settings } from 'lucide-react';
import type { AppTab } from '../../types';
import { TAB_CONFIG } from '../../utils/constants';

const ICON_MAP: Record<string, typeof Home> = {
  Sliders: SlidersHorizontal,
  Home,
  Shuffle,
  BarChart3,
  Settings,
};

/** 与 services/chatApi.ts 共用的匿名 ID 存储键（只读，不修改服务层） */
const ANONYMOUS_ID_KEY = 'bondshift_anonymous_id_v1';

function readAnonymousId(): string {
  try {
    return localStorage.getItem(ANONYMOUS_ID_KEY) ?? '';
  } catch {
    return '';
  }
}

/**
 * 桌面端左侧导航（≥1024px）：
 * Cloud White 底 + Petal Pink 右缘分隔线 + 左侧 3px 圆角竖条激活态，
 * 复用 TAB_CONFIG 与 ICON_MAP，与移动端 BottomNav 保持同一视觉语言。
 */
export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const anonymousId = useMemo(() => readAnonymousId(), []);

  const getTabFromPath = (path: string): AppTab => {
    const tab = TAB_CONFIG.find((t) => `/${t.key}` === path);
    return tab?.key ?? 'home';
  };

  const activeTab = getTabFromPath(location.pathname);

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-brand-200/70 bg-surface-50 lg:flex">
      <button
        type="button"
        onClick={() => navigate('/home')}
        className="flex min-h-11 items-center gap-2.5 px-6 py-7 text-left"
        aria-label="BONDSHIFT 首页"
      >
        <span className="grid h-9 w-9 place-items-center rounded-2xl gradient-brand text-surface-50 shadow-rose-sm">
          <Heart size={18} fill="currentColor" />
        </span>
        <span className="font-display text-lg font-semibold italic tracking-[0.08em] text-brand-500">
          BONDSHIFT
        </span>
      </button>

      <nav className="flex-1 space-y-1 px-3" aria-label="主导航">
        {TAB_CONFIG.map((tab) => {
          const isActive = tab.key === activeTab;
          const Icon = ICON_MAP[tab.icon] || Home;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(`/${tab.key}`)}
              className={`relative flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'text-brand-500'
                  : 'text-text-secondary hover:bg-brand-50 hover:text-text-primary'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-brand-500"
                />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {anonymousId && (
        <div className="border-t border-brand-100/60 px-6 py-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">
            匿名 ID
          </p>
          <p
            className="mt-1 truncate text-[11px] font-medium text-text-secondary"
            title={anonymousId}
          >
            {anonymousId}
          </p>
          <p className="mt-1 text-[10px] leading-4 text-text-tertiary">
            数据仅保存在当前浏览器
          </p>
        </div>
      )}
    </aside>
  );
}
