import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { SkeuomorphicButton } from '../SkeuomorphicButton';
import { useState } from 'react';

interface PrivacySettingsScreenProps {
  onBack: () => void;
  onContinue: (limitVisibility: boolean) => void;
  gender: string; // To determine if this screen should even show
}

export function PrivacySettingsScreen({
  onBack,
  onContinue,
  gender,
}: PrivacySettingsScreenProps) {
  const [limitVisibility, setLimitVisibility] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(limitVisibility);
  };

  // This screen should only show for Women and Non-Binary users
  // but we'll handle that check in the parent component

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
        <h1>Privacy Settings</h1>
      </div>

      {/* Progress indicator */}
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-muted" />
        </div>
        <p className="text-muted-foreground mt-2" style={{ fontSize: 'var(--text-sm)' }}>
          Step 3 of 4
        </p>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 overflow-y-auto pb-6">
        <div className="max-w-md mx-auto w-full">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-center mb-4">Who can see your profile?</h2>
          <p className="text-center text-muted-foreground mb-8">
            You have the option to limit your profile visibility for a safer experience.
          </p>

          {/* Toggle Options */}
          <div className="space-y-4 mb-8">
            <button
              type="button"
              onClick={() => setLimitVisibility(false)}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                !limitVisibility
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  !limitVisibility ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Eye className={`w-6 h-6 ${!limitVisibility ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">Everyone</h3>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    All students on studysesh can discover and connect with you.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLimitVisibility(true)}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                limitVisibility
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  limitVisibility ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <EyeOff className={`w-6 h-6 ${limitVisibility ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">Women & Non-Binary Only</h3>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    Only women and non-binary students can discover and connect with you.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border mb-8">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              💡 You can always change this setting later in your profile privacy settings.
            </p>
          </div>

          {/* Submit Button */}
          <SkeuomorphicButton
            type="submit"
            variant="primary"
            fullWidth
          >
            Continue
          </SkeuomorphicButton>
        </div>
      </form>
    </div>
  );
}
