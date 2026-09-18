import { Clock } from 'lucide-react';
import { RippleBackground } from '../RippleBackground';

interface TutorOnboardingSuccessScreenProps {
  onComplete: () => void;
}

export function TutorOnboardingSuccessScreen({ onComplete }: TutorOnboardingSuccessScreenProps) {
  return (
    <RippleBackground className="h-full bg-gradient-to-br from-primary to-primary-dark flex flex-col items-center justify-center px-6 text-white">
      {/* Pending Icon */}
      <div className="mb-8 relative z-10">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Clock className="w-14 h-14 text-white" />
        </div>
      </div>

      {/* Success Message */}
      <h1 className="mb-3 text-white text-center relative z-10" style={{ fontSize: '2rem', fontWeight: 'var(--font-weight-bold)' }}>
        Applications Submitted!
      </h1>

      <p
        className="text-center text-white/90 mb-4 max-w-sm relative z-10"
        style={{ fontSize: 'var(--text-base)' }}
      >
        Your course applications are pending approval. Our team will review your qualifications and notify you within 2-3 business days.
      </p>

      <p
        className="text-center text-white/80 mb-12 max-w-sm relative z-10"
        style={{ fontSize: 'var(--text-sm)' }}
      >
        We'll send you an email when your applications are approved.
      </p>

      {/* Continue Button */}
      <button
        onClick={onComplete}
        className="w-full max-w-sm py-4 rounded-full hover:brightness-105 transition-all relative z-10"
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
        Go to Profile
      </button>
    </RippleBackground>
  );
}