import { ArrowLeft, User, UserCircle } from 'lucide-react';
import { useState } from 'react';

interface StudentProfileCompletionScreenProps {
  onBack: () => void;
  onContinue: (profileData: { name: string; pronouns: string; year: string }) => void;
  onSkip: () => void;
}

export function StudentProfileCompletionScreen({ onBack, onContinue, onSkip }: StudentProfileCompletionScreenProps) {
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [year, setYear] = useState('');

  const handleContinue = () => {
    onContinue({
      name: name || 'Student',
      pronouns: pronouns || 'They/Them',
      year: year || '1st Year',
    });
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
          Complete Your Profile
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto">
          <p
            className="text-muted-foreground mb-6 text-center"
            style={{ fontSize: 'var(--text-base)' }}
          >
            Help tutors get to know you better
          </p>

          {/* Avatar Placeholder */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center">
                <UserCircle className="w-20 h-20 text-muted-foreground" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                <span style={{ fontSize: 'var(--text-lg)' }}>+</span>
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div className="mb-4">
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
          </div>

          {/* Pronouns Field */}
          <div className="mb-4">
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Pronouns
            </label>
            <input
              type="text"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
              placeholder="e.g., He/Him, She/Her, They/Them"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              style={{ fontSize: 'var(--text-base)' }}
            />
          </div>

          {/* Year Dropdown */}
          <div className="mb-6">
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Year of Study
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              style={{ fontSize: 'var(--text-base)' }}
            >
              <option value="">Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year+">5th Year+</option>
            </select>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all mb-3"
            style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-semibold)',
              boxShadow: '0 6px 12px rgba(219, 35, 33, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            Continue
          </button>

          {/* Skip Button */}
          <button
            onClick={onSkip}
            className="w-full py-4 text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}