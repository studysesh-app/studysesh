import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  onGetStarted: () => void;
}

export function SplashScreen({ onGetStarted }: SplashScreenProps) {
  return (
    <div className="h-full bg-gradient-to-br from-primary to-primary-dark flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Floating orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="mb-16"
        >
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/40"
            style={{
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
            }}
          >
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* App Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white mb-20"
          style={{
            fontSize: '3.5rem',
            fontWeight: 'var(--font-weight-bold)',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          studysesh
        </motion.h1>

        {/* Get Started Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onGetStarted}
          className="w-full max-w-sm py-4 rounded-full hover:brightness-105 active:scale-95 transition-all"
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-semibold)',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(240, 240, 240, 1) 50%, rgba(220, 220, 220, 1) 100%)',
            color: '#db2321',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -3px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(255, 255, 255, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            textShadow: '0 1px 1px rgba(255, 255, 255, 0.8)',
          }}
        >
          Get Started
        </motion.button>
      </div>
    </div>
  );
}
