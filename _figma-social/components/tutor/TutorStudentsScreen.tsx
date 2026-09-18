import { Search, Users } from 'lucide-react';
import { StudentCard } from './StudentCard';
import { useState } from 'react';

interface Student {
  id: string;
  name: string;
  initial: string;
  courses: string[];
  sessionsCount: number;
  lastSession?: string;
}

interface TutorStudentsScreenProps {
  students: Student[];
  onStudentClick: (studentId: string) => void;
  onMessageStudent: (studentId: string) => void;
}

export function TutorStudentsScreen({
  students,
  onStudentClick,
  onMessageStudent,
}: TutorStudentsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 pb-4">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ fontSize: 'var(--text-base)' }}
          />
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              name={student.name}
              initial={student.initial}
              courses={student.courses}
              sessionsCount={student.sessionsCount}
              lastSession={student.lastSession}
              onMessage={() => onMessageStudent(student.id)}
              onClick={() => onStudentClick(student.id)}
            />
          ))
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              No students yet
            </p>
            <p
              className="text-muted-foreground mt-1"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              Students will appear here after they book sessions
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              No students match "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}