import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import StatusBar from './StatusBar';
import BottomNav from './BottomNav';

const FULL_SCREEN_ROUTES = ['/chat', '/vr', '/voice', '/compare'];

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

export default function AppShell() {
  const location = useLocation();
  const isFullScreen = FULL_SCREEN_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="w-full max-w-[430px] mx-auto bg-surface-50 min-h-screen flex flex-col relative shadow-2xl overflow-hidden">
      {!isFullScreen && <StatusBar />}

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 overflow-y-auto"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      {!isFullScreen && <BottomNav />}
    </div>
  );
}
