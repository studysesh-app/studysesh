import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  keyProp?: string | number;
}

export function PageTransition({ children, keyProp }: PageTransitionProps) {
  return (
    <motion.div
      key={keyProp}
      initial={{ 
        opacity: 0,
        scale: 0.98,
        filter: 'blur(8px)',
      }}
      animate={{ 
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
      }}
      exit={{ 
        opacity: 0,
        scale: 0.96,
        filter: 'blur(8px)',
      }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1], // Custom easing for smooth, natural feel
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
