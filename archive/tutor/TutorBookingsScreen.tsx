import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { AnimatedTabs, TabData } from '../AnimatedTabs';
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
    earnings?: string;
}

interface TutorBookingsScreenProps {
    bookings: Booking[];
    activeTabIndex: number;
    onTabChange: (index: number) => void;
    onBookingAction: (bookingId: string, action: 'accept' | 'decline' | 'message' | 'details') => void;
    onViewStudents: () => void;
}

export function TutorBookingsScreen({
    bookings,
    activeTabIndex,
    onTabChange,
    onBookingAction,
    onViewStudents,
}: TutorBookingsScreenProps) {
    const pendingBookings = bookings.filter(b => b.status === 'Pending');
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
    const pastBookings = bookings.filter(b => b.status === 'Completed');

    const renderBookingsList = (list: Booking[], emptyMessage: string) => (
        <ScrollView className="mt-4" contentContainerStyle={{ paddingBottom: 100 }}>
            {list.length > 0 ? (
                list.map((booking) => (
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
                <View className="items-center py-12">
                    <Text className="text-gray-500">{emptyMessage}</Text>
                </View>
            )}
        </ScrollView>
    );

    const tabs: TabData[] = [
        {
            id: 'pending',
            title: 'Pending',
            content: renderBookingsList(pendingBookings, 'No pending bookings'),
        },
        {
            id: 'confirmed',
            title: 'Confirmed',
            content: renderBookingsList(confirmedBookings, 'No confirmed bookings'),
        },
        {
            id: 'past',
            title: 'Past',
            content: renderBookingsList(pastBookings, 'No past bookings'),
        },
    ];

    return (
        <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-6">
            <View className="items-center mb-6">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    My Bookings
                </Text>
            </View>
            <AnimatedTabs tabs={tabs} activeTabIndex={activeTabIndex} onTabChange={onTabChange} variant="pill" />
        </View>
    );
}
