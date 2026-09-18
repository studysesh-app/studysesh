import { motion } from 'motion/react';
import { GraduationCap, Users } from 'lucide-react';

interface RoleToggleProps {
  role: 'student' | 'tutor';
  onChange: (role: 'student' | 'tutor') => void;
}

export function RoleToggle({ role, onChange }: RoleToggleProps) {
  return (
    <div 
      className="inline-flex items-center gap-2 p-1 rounded-full dark:border-[rgba(60,60,60,0.8)]"
      style={{
        background: 'light-dark(linear-gradient(145deg, rgba(240, 240, 240, 1) 0%, rgba(220, 220, 220, 1) 100%), linear-gradient(145deg, rgba(40, 40, 40, 1) 0%, rgba(30, 30, 30, 1) 100%))',
        boxShadow: 'light-dark(inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.9), inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -2px -2px 5px rgba(60, 60, 60, 0.5))',
        border: '1px solid light-dark(rgba(200, 200, 200, 0.5), rgba(60, 60, 60, 0.5))',
      }}
    >
      <button
        onClick={() => onChange('student')}
        className="relative px-4 py-2 rounded-full transition-all flex items-center gap-2"
      >
        {role === 'student' && (
          <motion.div
            layoutId="role-toggle-bg"
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
              boxShadow: '0 4px 12px rgba(219, 35, 33, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
            }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
          />
        )}
        <GraduationCap className={`w-4 h-4 relative z-10 ${role === 'student' ? 'text-white' : 'text-muted-foreground'}`} />
        <span
          className={`relative z-10 ${role === 'student' ? 'text-white' : 'text-muted-foreground'}`}
          style={{ 
            fontSize: 'var(--text-sm)', 
            fontWeight: 'var(--font-weight-medium)',
            textShadow: role === 'student' ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
          }}
        >
          Student
        </span>
      </button>
      
      <button
        onClick={() => onChange('tutor')}
        className="relative px-4 py-2 rounded-full transition-all flex items-center gap-2"
      >
        {role === 'tutor' && (
          <motion.div
            layoutId="role-toggle-bg"
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
              boxShadow: '0 4px 12px rgba(219, 35, 33, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
            }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
          />
        )}
        <Users className={`w-4 h-4 relative z-10 ${role === 'tutor' ? 'text-white' : 'text-muted-foreground'}`} />
        <span
          className={`relative z-10 ${role === 'tutor' ? 'text-white' : 'text-muted-foreground'}`}
          style={{ 
            fontSize: 'var(--text-sm)', 
            fontWeight: 'var(--font-weight-medium)',
            textShadow: role === 'tutor' ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
          }}
        >
          Tutor
        </span>
      </button>
    </div>
  );
}