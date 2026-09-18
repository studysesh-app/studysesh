import { ArrowLeft, GraduationCap, Users } from 'lucide-react';
import { SkeuomorphicButton } from '../SkeuomorphicButton';

interface TutorSignupPromptScreenProps {
  onBack: () => void;
  onYes: () => void;
  onNo: () => void;
}

export function TutorSignupPromptScreen({
  onBack,
  onYes,
  onNo,
}: TutorSignupPromptScreenProps) {
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
        <h1>One more thing...</h1>
      </div>

      {/* Progress indicator */}
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-primary" />
        </div>
        <p className="text-muted-foreground mt-2" style={{ fontSize: 'var(--text-sm)' }}>
          Step 4 of 4
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col justify-center pb-20">
        <div className="max-w-md mx-auto w-full">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-center mb-4">Want to sign up as a tutor?</h2>
          <p className="text-center text-muted-foreground mb-12">
            Help other students and connect with them through tutoring. You can set this up later if you change your mind.
          </p>

          {/* Options */}
          <div className="space-y-4">
            <button
              onClick={onYes}
              className="w-full p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">Yes, I want to tutor</h3>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    Set up your tutoring profile and start helping students.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={onNo}
              className="w-full p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">No, just studying</h3>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    Skip tutoring setup and start connecting with other students.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-muted-foreground mt-8" style={{ fontSize: 'var(--text-sm)' }}>
            Don't worry, you can always become a tutor later from your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}