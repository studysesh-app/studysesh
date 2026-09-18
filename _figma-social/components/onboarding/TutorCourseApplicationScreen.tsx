import { ArrowLeft, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { CourseChip } from '../CourseChip';
import { CourseInputModal } from '../profile/CourseInputModal';

interface TutorCourseApplicationScreenProps {
  onBack: () => void;
  onContinue: (appliedCourses: string[]) => void;
}

export function TutorCourseApplicationScreen({ onBack, onContinue }: TutorCourseApplicationScreenProps) {
  const [appliedCourses, setAppliedCourses] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddCourse = (courseCode: string) => {
    if (!appliedCourses.includes(courseCode)) {
      setAppliedCourses([...appliedCourses, courseCode]);
    }
  };

  const handleRemoveCourse = (course: string) => {
    setAppliedCourses(appliedCourses.filter((c) => c !== course));
  };

  const handleContinue = () => {
    onContinue(appliedCourses.length > 0 ? appliedCourses : ['SYSC 2006', 'COMP 2402']);
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
          Apply to Tutor Courses
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p
          className="text-muted-foreground mb-6 text-center"
          style={{ fontSize: 'var(--text-base)' }}
        >
          Add courses you want to tutor
        </p>

        {/* Info Message */}
        <div className="mb-6 p-4 bg-secondary/30 border border-border rounded-xl">
          <p className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            You'll need to provide proof of success in these courses (transcripts, grade reports, etc.) on the next screen.
          </p>
        </div>

        {/* Applied Courses */}
        {appliedCourses.length > 0 && (
          <div className="mb-6">
            <h3
              className="mb-3 text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Courses to Tutor ({appliedCourses.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {appliedCourses.map((course) => (
                <div key={course} className="relative group">
                  <CourseChip code={course} />
                  <button
                    onClick={() => handleRemoveCourse(course)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Course Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 text-primary" />
          <span
            className="text-primary"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Add Course
          </span>
        </button>

        {appliedCourses.length === 0 && (
          <div className="mt-8 text-center py-12">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              No courses added yet
            </p>
          </div>
        )}
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

      {/* Course Input Modal */}
      <CourseInputModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCourse}
        requiresProof={false}
      />
    </div>
  );
}