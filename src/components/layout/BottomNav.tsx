import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SlidersHorizontal, Home, Shuffle, BarChart3, Settings,
} from 'lucide-react';
import type { AppTab } from '../../types';
import { TAB_CONFIG } from '../../utils/constants';

const ICON_MAP: Record<string, typeof Home> = {
  Sliders: SlidersHorizontal,
  Home,
  Shuffle,
  BarChart3,
  Settings,
};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const getTabFromPath = (path: string): AppTab => {
    const tab = TAB_CONFIG.find((t) => `/${t.key}` === path);
    return tab?.key ?? 'home';
  };

  const activeTab = getTabFromPath(currentPath);

  return (
    <nav className="glass border-t border-surface-300/60 pb-safe">
      <div className="flex items-center justify-around relative">
        {TAB_CONFIG.map((tab) => {
          const isActive = tab.key === activeTab;
          const Icon = ICON_MAP[tab.icon] || Home;

          return (
            <button
              key={tab.key}
              onClick={() => navigate(`/${tab.key}`)}
              className="relative flex flex-col items-center gap-0.5 py-2.5 px-3 min-w-[56px]"
            >
              {isActive && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={{
                  scale: isActive ? 1.08 : 0.95,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  size={22}
                  className={
                    isActive ? 'text-brand-500' : 'text-text-tertiary'
                  }
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </motion.div>
              <motion.span
                className="text-[10px] font-semibold tracking-tight"
                animate={{
                  color: isActive ? '#e8547c' : '#b0b0b8',
                  opacity: isActive ? 1 : 0.8,
                }}
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
