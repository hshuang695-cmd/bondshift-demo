import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}

export default function PageHeader({ title, subtitle, leftAction, rightAction }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between px-5 pt-3 pb-4"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {leftAction && (
          <motion.div
            whileTap={{ scale: 0.92 }}
            className="flex-shrink-0"
          >
            {leftAction}
          </motion.div>
        )}
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold text-text-primary tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-text-secondary mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightAction && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightAction}
        </div>
      )}
    </motion.div>
  );
}
