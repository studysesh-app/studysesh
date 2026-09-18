import { CourseChip } from '../CourseChip';

interface StudentCardProps {
  name: string;
  initial: string;
  courses: string[];
  sessionsCount: number;
  lastSession?: string;
  onMessage: () => void;
  onClick?: () => void;
}

export function StudentCard({
  name,
  initial,
  courses,
  sessionsCount,
  lastSession,
  onMessage,
  onClick,
}: StudentCardProps) {
  const handleCardClick = () => {
    // Prioritize messaging over profile view
    onMessage();
  };

  return (
    <div
      className="rounded-2xl p-4 cursor-pointer transition-all hover:brightness-105 active:scale-[0.98]"
      onClick={handleCardClick}
      style={{
        background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%), linear-gradient(145deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%))',
        boxShadow: 'light-dark(0 4px 12px rgba(0, 0, 0, 0.08), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5), inset 1px 1px 2px rgba(50, 50, 50, 0.5), inset -1px -1px 2px rgba(0, 0, 0, 0.3))',
        border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Student Avatar */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #db2321 0%, #a01a18 100%)',
            boxShadow: '0 2px 8px rgba(219, 35, 33, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <span 
            className="text-white"
            style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
          >
            {initial}
          </span>
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <h4 className="mb-2 text-foreground">{name}</h4>
          
          {/* Courses */}
          <div className="flex flex-wrap gap-1 mb-2">
            {courses.slice(0, 3).map((course) => (
              <CourseChip key={course} code={course} variant="small" />
            ))}
            {courses.length > 3 && (
              <span
                className="px-2 py-1 rounded-full text-muted-foreground"
                style={{ 
                  fontSize: 'var(--text-xs)',
                  background: 'light-dark(linear-gradient(145deg, rgba(245, 245, 245, 1) 0%, rgba(235, 235, 235, 1) 100%), linear-gradient(145deg, rgba(35, 35, 35, 1) 0%, rgba(25, 25, 25, 1) 100%))',
                  boxShadow: 'light-dark(inset 1px 1px 2px rgba(0, 0, 0, 0.08), inset -1px -1px 2px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(50, 50, 50, 0.3))',
                }}
              >
                +{courses.length - 3} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {sessionsCount} {sessionsCount === 1 ? 'session' : 'sessions'}
            {lastSession && ` • Last: ${lastSession}`}
          </div>
        </div>
      </div>
    </div>
  );
}