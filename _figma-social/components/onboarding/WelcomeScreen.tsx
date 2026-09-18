import { GraduationCap } from 'lucide-react';
import { RippleBackground } from '../RippleBackground';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <RippleBackground className="h-full bg-gradient-to-br from-primary to-primary-dark flex flex-col items-center justify-center px-6 text-white">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* App Name */}
        <h1 className="mb-3 text-white" style={{ fontSize: '3rem', fontWeight: 'var(--font-weight-bold)', letterSpacing: '-0.02em' }}>
          studysesh
        </h1>

        {/* Tagline */}
        <p
          className="text-center text-white/90 mb-16 max-w-sm"
          style={{ fontSize: 'var(--text-lg)' }}
        >
          Connect with top students. Master your courses. Excel together.
        </p>

        {/* Get Started Button - Enhanced Skeuomorphic Y2K */}
        <button
          onClick={onGetStarted}
          className="w-full max-w-sm py-4 rounded-full hover:brightness-105 transition-all mb-4"
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
        </button>

        {/* Sign In Link */}
        <button
          onClick={onSignIn}
          className="text-white/80 hover:text-white transition-colors"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          Already have an account? <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Sign In</span>
        </button>
      </div>
    </RippleBackground>
  );
}