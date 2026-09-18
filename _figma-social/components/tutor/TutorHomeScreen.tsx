import { Bell, Calendar, BookOpen, DollarSign, Edit, Eye } from 'lucide-react';
import { StatCard } from './StatCard';
import { TutorBookingCard } from './TutorBookingCard';
import { motion } from 'motion/react';

interface TutorHomeScreenProps {
  tutorName: string;
  stats: {
    sessionsBooked: number;
    studentsHelped: number;
  };
  recentBookings: Array<{
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
  }>;
  unreadNotifications: number;
  onNotificationsClick: () => void;
  onEditAvailability: () => void;
  onViewProfile: () => void;
  onBookingAction: (bookingId: string, action: 'accept' | 'decline' | 'message' | 'details') => void;
}

export function TutorHomeScreen({
  tutorName,
  stats,
  recentBookings,
  unreadNotifications,
  onNotificationsClick,
  onEditAvailability,
  onViewProfile,
  onBookingAction,
}: TutorHomeScreenProps) {
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground px-4 pt-12 pb-8 rounded-b-3xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Welcome back,</p>
            <h1 className="mt-1">{tutorName}</h1>
          </div>
          <button
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors relative"
            onClick={onNotificationsClick}
          >
            <Bell className="w-6 h-6" />
            {unreadNotifications > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span
                  className="text-white"
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {unreadNotifications}
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <StatCard
            icon={Calendar}
            label="Sessions Booked"
            value={stats.sessionsBooked}
          />
          <StatCard
            icon={BookOpen}
            label="Students Helped"
            value={stats.studentsHelped}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h3 className="mb-3 text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <button
            onClick={onEditAvailability}
            className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:bg-secondary transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <span
              className="text-center text-foreground"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Edit Availability
            </span>
          </button>

          <button
            onClick={onViewProfile}
            className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:bg-secondary transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <span
              className="text-center text-foreground"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              View Profile
            </span>
          </button>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground">Recent Bookings</h3>
          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {recentBookings.length} bookings
          </span>
        </div>
        <div className="space-y-3">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <TutorBookingCard
                key={booking.id}
                {...booking}
                onAccept={booking.status === 'Pending' ? () => onBookingAction(booking.id, 'accept') : undefined}
                onDecline={booking.status === 'Pending' ? () => onBookingAction(booking.id, 'decline') : undefined}
                onMessage={booking.status === 'Confirmed' ? () => onBookingAction(booking.id, 'message') : undefined}
                onViewDetails={() => onBookingAction(booking.id, 'details')}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                No bookings yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}