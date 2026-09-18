import { CourseChip } from './CourseChip';
import { PricingBubble } from './PricingBubble';
import { TimeIndicator } from './TimeIndicator';
import { SessionBadge } from './SessionBadge';
import { Calendar, MapPin, MessageSquare } from 'lucide-react';

interface BookingCardProps {
  tutorName: string;
  course: string;
  date: string;
  time: string;
  location: string;
  sessionType: 'group' | 'individual';
  price: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  onClick?: () => void;
  onMessageTutor?: () => void;
}

export function BookingCard({
  tutorName,
  course,
  date,
  time,
  location,
  sessionType,
  price,
  status,
  onClick,
  onMessageTutor
}: BookingCardProps) {
  return (
    <div
      onClick={onClick}
      className={`w-full rounded-2xl p-4 transition-all duration-200 text-left ${onClick ? 'cursor-pointer hover:brightness-105 active:scale-[0.98]' : ''}`}
      style={{
        background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%), linear-gradient(145deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%))',
        boxShadow: 'light-dark(0 4px 12px rgba(0, 0, 0, 0.08), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5), inset 1px 1px 2px rgba(50, 50, 50, 0.5), inset -1px -1px 2px rgba(0, 0, 0, 0.3))',
        border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="mb-1 text-foreground">{tutorName}</h4>
          <CourseChip code={course} />
        </div>
        <SessionBadge status={status} size="sm" />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span style={{ fontSize: 'var(--text-sm)' }}>{date}</span>
          <span style={{ fontSize: 'var(--text-sm)' }}>•</span>
          <span style={{ fontSize: 'var(--text-sm)' }}>{time}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span style={{ fontSize: 'var(--text-sm)' }}>{location}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <PricingBubble type={sessionType} price={price} size="sm" />
          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
            {sessionType === 'group' ? '3-10 students' : 'One-on-one'}
          </span>
        </div>
        {onMessageTutor && status === 'Confirmed' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMessageTutor();
            }}
            className="px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 hover:brightness-105 active:scale-95"
            style={{
              background: 'linear-gradient(145deg, rgba(254, 242, 242, 1) 0%, rgba(254, 202, 202, 1) 100%)',
              boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.08), inset -1px -1px 2px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(254, 202, 202, 0.5)',
            }}
          >
            <MessageSquare size={14} className="text-primary" />
            <span
              className="text-primary"
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              Message
            </span>
          </button>
        )}
      </div>
    </div>
  );
}