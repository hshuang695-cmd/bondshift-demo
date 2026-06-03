import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { pageTransitionVariants } from '../../hooks/usePageTransition';

interface Props {
  children: ReactNode;
}

export default function PageTransition({ children }: Props) {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 overflow-y-auto"
    >
      {children}
    </motion.div>
  );
}
