import { useState, useRef } from 'react';
import { ProfileCard } from './ProfileCard';
import { motion, AnimatePresence, PanInfo } from 'motion/react';

export interface StudentProfile {
  id: string;
  name: string;
  pronouns: string;
  yearOfStudy: string;
  major: string;
  courses: string[];
  prompts: Array<{ prompt: string; answer: string }>;
  photoUrl?: string;
}

interface ClassmatesScreenProps {
  profiles: StudentProfile[];
  onConnect: (profileId: string) => void;
  onProfileView: (profileId: string) => void;
}

export function ClassmatesScreen({
  profiles,
  onConnect,
  onProfileView,
}: ClassmatesScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);

  const currentProfile = profiles[currentIndex];

  const handleNext = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDragEnd = (info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    
    // Swipe up to next profile
    if (info.offset.y < -threshold || velocity < -500) {
      handleNext();
    }
    // Swipe down to previous profile
    else if (info.offset.y > threshold || velocity > 500) {
      handlePrevious();
    }
    
    setDragDirection(null);
  };

  if (profiles.length === 0) {
    return (
      <div className="h-full bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">
            No students to discover right now.
          </p>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background relative overflow-hidden">
      {/* Profile indicator */}
      <div className="absolute top-0 left-0 right-0 px-6 pt-12 pb-4 bg-gradient-to-b from-background to-transparent z-10">
        <div className="flex gap-1">
          {profiles.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary'
                  : index < currentIndex
                  ? 'bg-primary/40'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-2" style={{ fontSize: 'var(--text-sm)' }}>
          {currentIndex + 1} of {profiles.length}
        </p>
      </div>

      {/* Profile Cards */}
      <div className="h-full flex items-center justify-center p-4 pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfile.id}
            className="w-full max-w-md h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => handleDragEnd(info)}
            onDrag={(_, info) => {
              if (info.offset.y < -20) {
                setDragDirection('up');
              } else if (info.offset.y > 20) {
                setDragDirection('down');
              } else {
                setDragDirection(null);
              }
            }}
          >
            <ProfileCard
              profile={currentProfile}
              onConnect={() => onConnect(currentProfile.id)}
              onProfileClick={() => onProfileView(currentProfile.id)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe Hint */}
      {currentIndex === 0 && (
        <motion.div
          className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: [1, 0.5, 1], y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              ⬆️ Swipe up for next student
            </p>
          </div>
        </motion.div>
      )}

      {/* Visual feedback during drag */}
      {dragDirection && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
        >
          <div className={`h-full ${
            dragDirection === 'up' 
              ? 'bg-gradient-to-t from-primary to-transparent' 
              : 'bg-gradient-to-b from-primary to-transparent'
          }`} />
        </motion.div>
      )}
    </div>
  );
}
