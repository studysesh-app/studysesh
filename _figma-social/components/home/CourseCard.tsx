import { ChevronRight, MessageSquare, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface CourseCardProps {
  courseName: string;
  activeDiscussions: number;
  totalStudents: number;
  onClick: () => void;
}

export function CourseCard({
  courseName,
  activeDiscussions,
  totalStudents,
  onClick,
}: CourseCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full p-5 rounded-2xl bg-primary/5 border border-border hover:bg-primary/10 transition-all text-left"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-semibold" style={{ fontSize: 'var(--text-lg)' }}>
          {courseName}
        </h3>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {activeDiscussions} active
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {totalStudents} students
          </span>
        </div>
      </div>
    </motion.button>
  );
}