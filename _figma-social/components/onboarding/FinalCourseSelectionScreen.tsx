import { ArrowLeft, PartyPopper } from 'lucide-react';
import { SkeuomorphicButton } from '../SkeuomorphicButton';

interface FinalCourseSelectionScreenProps {
  onBack: () => void;
  onComplete: (courses: string[]) => void;
}

export function FinalCourseSelectionScreen({
  onBack,
  onComplete,
}: FinalCourseSelectionScreenProps) {
  const handleSubmit = () => {
    onComplete(['COMP 2402', 'SYSC 2006', 'MATH 1004']);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="max-w-md mx-auto w-full text-center">
          {/* Icon */}
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <PartyPopper className="w-16 h-16 text-primary" />
          </div>

          <h1 className="mb-4">You're All Set!</h1>
          <p className="text-muted-foreground mb-12" style={{ fontSize: 'var(--text-lg)' }}>
            Welcome to studysesh! Start connecting with your classmates.
          </p>

          <SkeuomorphicButton
            onClick={handleSubmit}
            variant="primary"
            fullWidth
          >
            Get Started
          </SkeuomorphicButton>
        </div>
      </div>
    </div>
  );
}