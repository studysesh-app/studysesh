import { ArrowLeft, BookOpen, Users } from 'lucide-react';
import { RippleBackground } from '../RippleBackground';

interface RoleSelectionScreenProps {
  onBack: () => void;
  onSelectRole: (role: 'student' | 'tutor') => void;
}

export function RoleSelectionScreen({ onBack, onSelectRole }: RoleSelectionScreenProps) {
  return (
    <RippleBackground className="h-full bg-gradient-to-br from-primary to-primary-dark flex flex-col">
      {/* Header */}
      <header className="bg-transparent border-b border-white/10 px-4 py-4 flex items-center flex-shrink-0 relative z-10">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1
          className="flex-1 text-center text-white pr-10"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Choose Your Role
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <p
          className="text-center text-white/90 mb-8"
          style={{ fontSize: 'var(--text-base)' }}
        >
          How would you like to use studysesh?
        </p>

        {/* Student Card */}
        <button
          onClick={() => onSelectRole('student')}
          className="w-full max-w-sm mb-4 p-6 rounded-2xl hover:brightness-105 transition-all group"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(245, 245, 245, 1) 50%, rgba(235, 235, 235, 1) 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -4px 8px rgba(0, 0, 0, 0.1), 0 2px 3px rgba(255, 255, 255, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h3
                className="text-foreground mb-1"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                I'm a Student
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Find tutors and book sessions
              </p>
            </div>
          </div>
        </button>

        {/* Tutor Card */}
        <button
          onClick={() => onSelectRole('tutor')}
          className="w-full max-w-sm mb-6 p-6 rounded-2xl hover:brightness-105 transition-all group"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(245, 245, 245, 1) 50%, rgba(235, 235, 235, 1) 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -4px 8px rgba(0, 0, 0, 0.1), 0 2px 3px rgba(255, 255, 255, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h3
                className="text-foreground mb-1"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                I want to Tutor
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Help students and earn money
              </p>
            </div>
          </div>
        </button>

        <p className="text-white/70 text-center" style={{ fontSize: 'var(--text-xs)' }}>
          You can switch roles later in your profile
        </p>
      </div>
    </RippleBackground>
  );
}