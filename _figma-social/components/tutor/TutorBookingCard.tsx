import { Calendar, Clock, Users, User, Video, MapPin, MessageCircle } from 'lucide-react';
import { CourseChip } from '../CourseChip';
import { SessionBadge } from '../SessionBadge';

interface TutorBookingCardProps {
  id: string;
  studentName: string;
  studentInitial: string;
  course: string;
  date: string;
  time: string;
  sessionType: 'group' | 'individual';
  status: 'Pending' | 'Confirmed' | 'Completed';
  location: 'online' | 'in-person';
  studentsJoined?: number;
  maxStudents?: number;
  earnings: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onMessage?: () => void;
  onViewDetails?: () => void;
}

export function TutorBookingCard({
  studentName,
  studentInitial,
  course,
  date,
  time,
  sessionType,
  status,
  location,
  studentsJoined,
  maxStudents,
  earnings,
  onAccept,
  onDecline,
  onMessage,
  onViewDetails,
}: TutorBookingCardProps) {
  const LocationIcon = location === 'online' ? Video : MapPin;
  const SessionIcon = sessionType === 'group' ? Users : User;

  return (
    <div 
      className="rounded-2xl p-4"
      style={{
        background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%), linear-gradient(145deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%))',
        boxShadow: 'light-dark(0 4px 12px rgba(0, 0, 0, 0.08), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5), inset 1px 1px 2px rgba(50, 50, 50, 0.5), inset -1px -1px 2px rgba(0, 0, 0, 0.3))',
        border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
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
            {studentInitial}
          </span>
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="truncate text-foreground">{studentName}</h4>
            <SessionBadge status={status} size="sm" />
          </div>
          <CourseChip code={course} variant="small" />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        {/* Date & Time */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span style={{ fontSize: 'var(--text-sm)' }}>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span style={{ fontSize: 'var(--text-sm)' }}>{time}</span>
          </div>
        </div>

        {/* Session Type & Location */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <SessionIcon className="w-4 h-4" />
            <span style={{ fontSize: 'var(--text-sm)' }}>
              {sessionType === 'group' ? 'Group Session' : 'One-on-One'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <LocationIcon className="w-4 h-4" />
            <span style={{ fontSize: 'var(--text-sm)' }}>
              {location === 'online' ? 'Online' : 'In-person'}
            </span>
          </div>
        </div>

        {/* Group Info */}
        {sessionType === 'group' && studentsJoined !== undefined && maxStudents !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(studentsJoined / maxStudents) * 100}%` }}
              />
            </div>
            <span
              className="text-muted-foreground"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              {studentsJoined}/{maxStudents} students
            </span>
          </div>
        )}

        {/* Earnings */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span
              className="text-muted-foreground"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Earnings:
            </span>
            <span
              className="text-primary"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              ${earnings}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {status === 'Pending' && onAccept && onDecline && (
          <>
            <button
              onClick={onAccept}
              className="flex-1 py-2 px-4 rounded-full transition-all hover:brightness-105 active:scale-95"
              style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
                boxShadow: '0 4px 12px rgba(219, 35, 33, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(160, 26, 24, 0.5)',
                color: 'white',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              Accept
            </button>
            <button
              onClick={onDecline}
              className="flex-1 py-2 px-4 rounded-full transition-all hover:brightness-105 active:scale-95 text-foreground"
              style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--font-weight-medium)',
                background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(245, 245, 245, 1) 100%), linear-gradient(145deg, rgba(35, 35, 35, 1) 0%, rgba(25, 25, 25, 1) 100%))',
                boxShadow: 'light-dark(inset 1px 1px 3px rgba(0, 0, 0, 0.1), inset -1px -1px 3px rgba(255, 255, 255, 0.9), 0 2px 6px rgba(0, 0, 0, 0.08), inset 1px 1px 3px rgba(0, 0, 0, 0.4), inset -1px -1px 3px rgba(50, 50, 50, 0.5), 0 2px 6px rgba(0, 0, 0, 0.5))',
                border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
              }}
            >
              Decline
            </button>
          </>
        )}

        {status === 'Confirmed' && onMessage && (
          <button
            onClick={onMessage}
            className="w-full py-2 px-4 rounded-full transition-all hover:brightness-105 active:scale-95 flex items-center justify-center gap-2 text-foreground"
            style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: 'var(--font-weight-medium)',
              background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(245, 245, 245, 1) 100%), linear-gradient(145deg, rgba(35, 35, 35, 1) 0%, rgba(25, 25, 25, 1) 100%))',
              boxShadow: 'light-dark(inset 1px 1px 3px rgba(0, 0, 0, 0.1), inset -1px -1px 3px rgba(255, 255, 255, 0.9), 0 2px 6px rgba(0, 0, 0, 0.08), inset 1px 1px 3px rgba(0, 0, 0, 0.4), inset -1px -1px 3px rgba(50, 50, 50, 0.5), 0 2px 6px rgba(0, 0, 0, 0.5))',
              border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
        )}
      </div>
    </div>
  );
}