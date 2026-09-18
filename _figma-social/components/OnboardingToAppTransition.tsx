import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface OnboardingToAppTransitionProps {
  children: ReactNode;
  show: boolean;
}

/**
 * Dramatic GL-transition inspired effect for completing onboarding
 * Uses radial blur, scale, and opacity for a "zooming into the app" feel
 */
export function OnboardingToAppTransition({ children, show }: OnboardingToAppTransitionProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ 
        opacity: 0,
        scale: 0.8,
        filter: 'blur(20px)',
      }}
      animate={{ 
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
      }}
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1], // Dramatic easing curve
        opacity: { duration: 0.8 },
        scale: { 
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1]
        },
        filter: { 
          duration: 1.0,
        }
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
