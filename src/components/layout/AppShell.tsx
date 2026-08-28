import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StatusBar from './StatusBar';
import BottomNav from './BottomNav';
import SideNav from './SideNav';

const FULL_SCREEN_ROUTES = ['/setup', '/match', '/chat', '/vr', '/voice', '/compare'];

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.995,
    transition: { duration: 0.18 },
  },
};

/**
 * 应用外壳（双形态容器，lg 为唯一分界线）：
 * - <1024px：居中窄容器 max-w-[430px] + StatusBar + BottomNav（移动形态）
 * - ≥1024px：全宽 + SideNav + 内容区 max-w-6xl（桌面形态）
 * 全屏路由（/setup /match /chat 等）下导航全部隐藏，保持沉浸式。
 */
export default function AppShell() {
  const location = useLocation();
  const isFullScreen = FULL_SCREEN_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="w-full min-h-screen lg:flex">
      {!isFullScreen && <SideNav />}

      <div className="flex w-full justify-center">
        <div className="relative flex w-full max-w-[430px] min-h-screen flex-col bg-surface-50 shadow-rose-md overflow-hidden lg:max-w-none lg:shadow-none">
          {!isFullScreen && <StatusBar />}

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 overflow-y-auto w-full"
            >
              <div className="lg:mx-auto lg:w-full lg:max-w-6xl lg:px-8">
                <Outlet />
              </div>
            </motion.div>
          </AnimatePresence>

          {!isFullScreen && <BottomNav />}
        </div>
      </div>
    </div>
  );
}
