import { Tabs, TabData } from '../Tabs';
import { TutorBookingCard } from './TutorBookingCard';

interface Booking {
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
}

interface TutorBookingsScreenProps {
  bookings: Booking[];
  activeTabIndex: number;
  onTabChange: (index: number) => void;
  onBookingAction: (bookingId: string, action: 'accept' | 'decline' | 'message' | 'details') => void;
}

export function TutorBookingsScreen({
  bookings,
  activeTabIndex,
  onTabChange,
  onBookingAction,
}: TutorBookingsScreenProps) {
  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
  const pastBookings = bookings.filter(b => b.status === 'Completed');

  const tabs: TabData[] = [
    {
      id: 'pending',
      title: 'Pending',
      content: (
        <div className="space-y-3">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking) => (
              <TutorBookingCard
                key={booking.id}
                {...booking}
                onAccept={() => onBookingAction(booking.id, 'accept')}
                onDecline={() => onBookingAction(booking.id, 'decline')}
                onViewDetails={() => onBookingAction(booking.id, 'details')}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending bookings</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'confirmed',
      title: 'Confirmed',
      content: (
        <div className="space-y-3">
          {confirmedBookings.length > 0 ? (
            confirmedBookings.map((booking) => (
              <TutorBookingCard
                key={booking.id}
                {...booking}
                onMessage={() => onBookingAction(booking.id, 'message')}
                onViewDetails={() => onBookingAction(booking.id, 'details')}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No confirmed bookings</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'past',
      title: 'Past',
      content: (
        <div className="space-y-3">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <TutorBookingCard
                key={booking.id}
                {...booking}
                onViewDetails={() => onBookingAction(booking.id, 'details')}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past bookings</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      <h2 className="mb-6 text-center text-foreground">My Bookings</h2>
      <Tabs tabs={tabs} activeTabIndex={activeTabIndex} onTabChange={onTabChange} variant="pill" />
    </div>
  );
}