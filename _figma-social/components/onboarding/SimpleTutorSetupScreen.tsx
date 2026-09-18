import { useState } from 'react';
import { ArrowLeft, Upload, Check, DollarSign, MapPin, Video } from 'lucide-react';
import { SkeuomorphicButton } from '../SkeuomorphicButton';
import { CourseChip } from '../CourseChip';

interface SimpleTutorSetupScreenProps {
  onBack: () => void;
  onComplete: (data: {
    courses: string[];
    proofUploaded: boolean;
    hourlyRate: number;
    availability: 'online' | 'in-person' | 'both';
  }) => void;
}

export function SimpleTutorSetupScreen({ onBack, onComplete }: SimpleTutorSetupScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [courses, setCourses] = useState<string[]>(['COMP 2402', 'SYSC 2006']);
  const [newCourse, setNewCourse] = useState('');
  const [proofUploaded, setProofUploaded] = useState(true);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [availability, setAvailability] = useState<'online' | 'in-person' | 'both'>('both');

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newCourse.trim().toUpperCase();
    if (formatted && !courses.includes(formatted)) {
      setCourses([...courses, formatted]);
      setNewCourse('');
    }
  };

  const handleRemoveCourse = (course: string) => {
    setCourses(courses.filter(c => c !== course));
  };

  const handleSubmit = () => {
    onComplete({ courses, proofUploaded, hourlyRate, availability });
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-6">
        <button
          onClick={step === 1 ? onBack : () => setStep((step - 1) as 1 | 2)}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1>Tutor Setup</h1>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
        <p className="text-muted-foreground mt-2" style={{ fontSize: 'var(--text-sm)' }}>
          Step {step} of 3
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-y-auto pb-6">
        <div className="max-w-md mx-auto w-full">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2">Courses you can tutor</h2>
                <p className="text-muted-foreground mb-4">
                  Add courses you're qualified to tutor. You can add more later.
                </p>
              </div>

              <form onSubmit={handleAddCourse} className="flex gap-2">
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="e.g. COMP 2402"
                  className="flex-1 px-4 py-3 rounded-xl bg-input-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all"
                  disabled={!newCourse.trim()}
                >
                  Add
                </button>
              </form>

              {courses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {courses.map((course) => (
                    <CourseChip
                      key={course}
                      course={course}
                      onRemove={() => handleRemoveCourse(course)}
                      removable
                    />
                  ))}
                </div>
              )}

              <SkeuomorphicButton
                onClick={() => setStep(2)}
                variant="primary"
                fullWidth
                disabled={courses.length === 0}
              >
                Continue
              </SkeuomorphicButton>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2">Proof of success</h2>
                <p className="text-muted-foreground mb-6">
                  Upload a screenshot of your transcript or audit showing your grades in the courses you selected.
                </p>
              </div>

              <button
                onClick={() => setProofUploaded(!proofUploaded)}
                className={`w-full p-8 rounded-2xl border-2 border-dashed transition-all ${
                  proofUploaded
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/30 hover:border-primary'
                }`}
              >
                {proofUploaded ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-primary">Transcript uploaded</p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      Click to upload a different file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p>Click to upload</p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      PNG, JPG, or PDF (max 10MB)
                    </p>
                  </div>
                )}
              </button>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  💡 Your submission will be reviewed by our team. You'll be notified once approved!
                </p>
              </div>

              <SkeuomorphicButton
                onClick={() => setStep(3)}
                variant="primary"
                fullWidth
                disabled={!proofUploaded}
              >
                Continue
              </SkeuomorphicButton>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-2">Set your rate & availability</h2>
                <p className="text-muted-foreground mb-6">
                  Choose your hourly rate and how you'd like to tutor.
                </p>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block mb-3">Hourly Rate</label>
                <div className="p-6 rounded-xl bg-card border-2 border-border">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <span className="text-primary" style={{ fontSize: '3rem', fontWeight: 'var(--font-weight-bold)' }}>
                      {hourlyRate}
                    </span>
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xl)' }}>/hr</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-muted-foreground mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                    <span>$10</span>
                    <span>$50</span>
                  </div>
                </div>
              </div>

              {/* Availability Mode */}
              <div>
                <label className="block mb-3">Tutoring Mode</label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setAvailability('online')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      availability === 'online'
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <Video className={`w-6 h-6 ${availability === 'online' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span>Online Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvailability('in-person')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      availability === 'in-person'
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <MapPin className={`w-6 h-6 ${availability === 'in-person' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span>In-Person Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvailability('both')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      availability === 'both'
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-2">
                      <Video className={`w-6 h-6 ${availability === 'both' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <MapPin className={`w-6 h-6 ${availability === 'both' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <span>Both</span>
                  </button>
                </div>
              </div>

              <SkeuomorphicButton
                onClick={handleSubmit}
                variant="primary"
                fullWidth
              >
                Submit Application
              </SkeuomorphicButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}