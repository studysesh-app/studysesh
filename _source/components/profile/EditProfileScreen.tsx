import { ArrowLeft, Camera } from 'lucide-react';
import { useState } from 'react';

interface EditProfileScreenProps {
  name: string;
  pronouns: string;
  year: string;
  program: string;
  bio?: string;
  initial: string;
  isTutor: boolean;
  onBack: () => void;
  onSave: (data: {
    name: string;
    pronouns: string;
    year: string;
    program: string;
    bio?: string;
  }) => void;
}

export function EditProfileScreen({
  name: initialName,
  pronouns: initialPronouns,
  year: initialYear,
  program: initialProgram,
  bio: initialBio,
  initial,
  isTutor,
  onBack,
  onSave,
}: EditProfileScreenProps) {
  const [name, setName] = useState(initialName);
  const [pronouns, setPronouns] = useState(initialPronouns);
  const [year, setYear] = useState(initialYear);
  const [program, setProgram] = useState(initialProgram);
  const [bio, setBio] = useState(initialBio || '');

  const handleSave = () => {
    onSave({ name, pronouns, year, program, bio: isTutor ? bio : undefined });
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
          Edit Profile
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Photo Section */}
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-3">
            <div className="w-24 h-24 rounded-full bg-primary-dark text-primary-foreground flex items-center justify-center">
              <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-semibold)' }}>
                {initial}
              </span>
            </div>
            <button
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors"
              onClick={() => alert('Photo picker would open here')}
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <button
            onClick={() => alert('Photo picker would open here')}
            className="text-primary hover:text-primary/80 transition-colors"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Change Photo
          </button>
        </div>

        {/* Personal Info */}
        <div className="space-y-6 mb-6">
          {/* Name */}
          <div>
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              placeholder="Your name"
              style={{ fontSize: 'var(--text-base)' }}
            />
          </div>

          {/* Pronouns */}
          <div>
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Pronouns
            </label>
            <div className="flex gap-2">
              {['He/Him', 'She/Her', 'They/Them'].map((option) => (
                <button
                  key={option}
                  onClick={() => setPronouns(option)}
                  className={`flex-1 py-2.5 px-4 rounded-full border transition-colors ${
                    pronouns === option
                      ? 'bg-primary text-white border-primary'
                      : 'bg-card border-border text-foreground hover:bg-secondary'
                  }`}
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Year */}
          <div>
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              What year are you?
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-foreground"
              style={{ fontSize: 'var(--text-base)' }}
            >
              <option value="">Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>

          {/* Program */}
          <div>
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              What program are you in?
            </label>
            <input
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              placeholder="e.g., Computer Science"
              style={{ fontSize: 'var(--text-base)' }}
            />
          </div>

          {/* Bio (Tutor only) */}
          {isTutor && (
            <div>
              <label
                className="block mb-2 text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                About
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none text-foreground"
                placeholder="Tell students about yourself..."
                style={{ fontSize: 'var(--text-base)' }}
                maxLength={300}
              />
              <div className="mt-1 text-right">
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                  {bio.length}/300
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="px-4 py-4 bg-background border-t border-border flex-shrink-0">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}