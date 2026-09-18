import { Bell } from 'lucide-react';
import { CourseCard } from './CourseCard';

interface Course {
  id: string;
  name: string;
  activeDiscussions: number;
  totalStudents: number;
}

interface HomeScreenProps {
  userName: string;
  userStatus?: string;
  courses: Course[];
  onCourseClick: (courseId: string) => void;
  onNotificationsClick: () => void;
  unreadNotifications: number;
}

export function HomeScreen({
  userName,
  userStatus = 'Cramming',
  courses,
  onCourseClick,
  onNotificationsClick,
  unreadNotifications,
}: HomeScreenProps) {
  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground px-6 pt-12 pb-8 rounded-b-3xl mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Hey there,</p>
            <h1 className="mt-1">{userName}</h1>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span style={{ fontSize: 'var(--text-sm)' }}>{userStatus}</span>
        </div>
      </div>

      {/* Course List */}
      <div className="flex-1 px-6 overflow-y-auto pb-24">
        <h2 className="mb-4">Your Courses</h2>
        <div className="space-y-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              courseName={course.name}
              activeDiscussions={course.activeDiscussions}
              totalStudents={course.totalStudents}
              onClick={() => onCourseClick(course.id)}
            />
          ))}
        </div>
        
        {courses.length === 0 && (
          <div className="p-8 rounded-2xl bg-muted/30 border-2 border-dashed border-border text-center">
            <p className="text-muted-foreground">
              No courses yet. Add courses from your profile to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}