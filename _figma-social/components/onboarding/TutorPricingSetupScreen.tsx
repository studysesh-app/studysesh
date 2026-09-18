import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface TutorPricingSetupScreenProps {
  courses: string[];
  onBack: () => void;
  onContinue: (pricing: Record<string, { group: number; individual: number }>) => void;
}

export function TutorPricingSetupScreen({ courses, onBack, onContinue }: TutorPricingSetupScreenProps) {
  const [groupPrice, setGroupPrice] = useState(15);
  const [individualPrice, setIndividualPrice] = useState(28);

  const handleContinue = () => {
    // Apply same pricing to all courses for simplicity in onboarding
    const pricing: Record<string, { group: number; individual: number }> = {};
    courses.forEach((course) => {
      pricing[course] = { group: groupPrice, individual: individualPrice };
    });
    onContinue(pricing);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex items-center flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1
          className="flex-1 text-center text-foreground pr-10"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Set Your Pricing
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p
          className="text-muted-foreground mb-8 text-center"
          style={{ fontSize: 'var(--text-base)' }}
        >
          Set your default hourly rates for tutoring sessions
        </p>

        {/* Applied Courses Preview */}
        <div className="mb-8 p-4 bg-secondary/30 border border-border rounded-xl">
          <h4
            className="mb-2 text-foreground"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Applied Courses ({courses.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {courses.map((course) => (
              <span
                key={course}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {course}
              </span>
            ))}
          </div>
        </div>

        {/* Group Session Pricing */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label
              className="text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Group Session Rate
            </label>
            <div className="px-3 py-1 bg-[#d5e2f6] dark:bg-[#d5e2f6]/20 rounded-full">
              <span
                className="text-[#d5e2f6] dark:text-[#d5e2f6]"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
              >
                ${groupPrice}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={groupPrice}
            onChange={(e) => setGroupPrice(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <div className="flex justify-between mt-2">
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              $5/hr
            </span>
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              $25/hr
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-center" style={{ fontSize: 'var(--text-xs)' }}>
            3-10 students per session
          </p>
        </div>

        {/* Individual Session Pricing */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label
              className="text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              1-on-1 Session Rate
            </label>
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <span
                className="text-green-700 dark:text-green-400"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
              >
                ${individualPrice}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="10"
            max="50"
            step="1"
            value={individualPrice}
            onChange={(e) => setIndividualPrice(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <div className="flex justify-between mt-2">
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              $10/hr
            </span>
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              $50/hr
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-center" style={{ fontSize: 'var(--text-xs)' }}>
            Private tutoring session
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-muted-foreground text-center" style={{ fontSize: 'var(--text-sm)' }}>
            💡 You can customize pricing per course later in your profile settings
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-4 py-4 bg-background border-t border-border flex-shrink-0">
        <button
          onClick={handleContinue}
          className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
          style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: 'var(--font-weight-semibold)',
            boxShadow: '0 6px 12px rgba(219, 35, 33, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}