import { User, Plus, MapPin } from 'lucide-react';
import { StudentProfile } from './ClassmatesScreen';
import { CourseChip } from '../CourseChip';
import { motion } from 'motion/react';
import { useState } from 'react';

interface ProfileCardProps {
  profile: StudentProfile;
  onConnect: () => void;
  onProfileClick: () => void;
}

export function ProfileCard({ profile, onConnect, onProfileClick }: ProfileCardProps) {
  const [showFullPrompts, setShowFullPrompts] = useState(false);

  return (
    <div className="h-full flex flex-col rounded-3xl bg-card border-2 border-border overflow-hidden shadow-lg">
      {/* Header with Photo */}
      <button
        onClick={onProfileClick}
        className="relative bg-gradient-to-br from-primary to-primary-dark p-6 pb-12 text-primary-foreground"
      >
        {/* Profile Photo Placeholder */}
        <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center mx-auto mb-3"
          style={{
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
          }}
        >
          {profile.photoUrl ? (
            <img 
              src={profile.photoUrl} 
              alt={profile.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-14 h-14 text-white" />
          )}
        </div>

        {/* Name & Basic Info */}
        <h1 className="text-center mb-1" style={{ color: 'white', fontSize: 'var(--text-xl)' }}>
          {profile.name}
        </h1>
        <p className="text-center text-white/80" style={{ fontSize: 'var(--text-sm)' }}>
          {profile.pronouns}
        </p>
        <p className="text-center text-white/60 mt-1" style={{ fontSize: 'var(--text-sm)' }}>
          {profile.yearOfStudy} • {profile.major}
        </p>
      </button>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Prompts */}
        <div className="space-y-3">
          {profile.prompts.slice(0, showFullPrompts ? undefined : 2).map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-muted/50 border border-border"
            >
              <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-sm)' }}>
                {item.prompt}
              </p>
              <p style={{ fontSize: 'var(--text-base)' }}>{item.answer}</p>
            </div>
          ))}

          {profile.prompts.length > 2 && !showFullPrompts && (
            <button
              onClick={() => setShowFullPrompts(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary bg-muted/30 hover:bg-muted/50 transition-all"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Show more prompts
            </button>
          )}
        </div>
      </div>

      {/* Swipe Hint and Connect Button - Fixed at bottom */}
      <div className="p-6 pt-3 space-y-3 border-t border-border bg-background">
        <p className="text-center text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
          ⬆️ Swipe up for next student
        </p>
        <motion.button
          onClick={onConnect}
          className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-dark text-primary-foreground flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          style={{
            fontWeight: 'var(--font-weight-semibold)',
            boxShadow: '0 4px 12px rgba(219, 35, 33, 0.3)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Connect
        </motion.button>
      </div>
    </div>
  );
}