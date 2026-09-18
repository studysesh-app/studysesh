import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Calendar, Clock, Users, User, Video, MapPin, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
    earnings?: string;
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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const LocationIcon = location === 'online' ? Video : MapPin;
    const SessionIcon = sessionType === 'group' ? Users : User;

    const getStatusStyle = () => {
        if (status === 'Pending') {
            return { backgroundColor: '#FEF3C7', color: '#92400E' }; // bg-yellow-100 with text-yellow-800
        } else if (status === 'Confirmed') {
            return { backgroundColor: '#D1FAE5', color: '#065F46' }; // bg-green-100 with text-green-800
        }
        return { backgroundColor: '#E5E7EB', color: '#374151' };
    };

    const statusStyle = getStatusStyle();

    return (
        <View style={[styles.cardContainer, { marginBottom: 16 }]}>
            {/* Main Card with Gradient Background */}
            <LinearGradient
                colors={isDark ? ['rgba(30, 30, 30, 1)', 'rgba(20, 20, 20, 1)'] : ['rgba(255, 255, 255, 1)', 'rgba(248, 248, 248, 1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cardGradient, { borderColor: isDark ? '#374151' : '#f3f4f6', borderWidth: 1 }]}
            >
                <View style={styles.cardContent}>
                    {/* Status Badge - Top Right */}
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusStyle.backgroundColor }
                        ]}
                    >
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {status}
                        </Text>
                    </View>

                    {/* Header */}
                    <View style={styles.headerContainer}>
                        {/* Student Avatar */}
                        <View style={styles.avatarContainer}>
                            <Text style={[styles.avatarText, { zIndex: 10, elevation: 10 }]}>
                                {studentInitial}
                            </Text>
                        </View>

                        {/* Student Info */}
                        <View style={styles.studentInfo}>
                            <Text style={[styles.studentName, { zIndex: 10, color: isDark ? '#fafafa' : '#000000' }]} numberOfLines={1}>
                                {studentName}
                            </Text>
                            <View style={styles.courseBadge}>
                                <Text style={styles.courseText}>{course}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Details */}
                    <View style={styles.detailsContainer}>
                        {/* Date & Time */}
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Calendar size={16} color={isDark ? '#a1a1aa' : '#6b7280'} />
                                <Text style={[styles.detailText, { color: isDark ? '#fafafa' : '#111827' }]}>{date}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Clock size={16} color={isDark ? '#a1a1aa' : '#6b7280'} />
                                <Text style={[styles.detailText, { color: isDark ? '#fafafa' : '#111827' }]}>{time}</Text>
                            </View>
                        </View>

                        {/* Session Type & Location */}
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <SessionIcon size={16} color={isDark ? '#a1a1aa' : '#6b7280'} />
                                <Text style={[styles.detailText, { color: isDark ? '#fafafa' : '#111827' }]}>
                                    {sessionType === 'group' ? 'Group Session' : 'One-on-One'}
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <LocationIcon size={16} color={isDark ? '#a1a1aa' : '#6b7280'} />
                                <Text style={[styles.detailText, { color: isDark ? '#fafafa' : '#111827' }]}>
                                    {location === 'online' ? 'Online' : 'In-person'}
                                </Text>
                            </View>
                        </View>

                        {/* Group Info */}
                        {sessionType === 'group' && studentsJoined !== undefined && maxStudents !== undefined && (
                            <View style={styles.progressContainer}>
                                <View style={[styles.progressTrack, { backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb' }]}>
                                    <LinearGradient
                                        colors={['#db2321', '#a01a18']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.progressBar, { width: `${(studentsJoined / maxStudents) * 100}%` }]}
                                    />
                                </View>
                                <Text style={[styles.progressText, { color: isDark ? '#a1a1aa' : '#4b5563' }]}>
                                    {studentsJoined}/{maxStudents} students
                                </Text>
                            </View>
                        )}

                        {/* Earnings */}
                        {earnings && (
                            <View style={styles.earningsContainer}>
                                <Text style={[styles.earningsLabel, { color: isDark ? '#a1a1aa' : '#000000' }]}>Earnings:</Text>
                                <Text style={styles.earningsAmount}>
                                    {earnings}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        {status === 'Pending' && onAccept && onDecline && (
                            <>
                                <TouchableOpacity
                                    onPress={onAccept}
                                    activeOpacity={0.95}
                                    style={styles.acceptButtonWrapper}
                                >
                                    <LinearGradient
                                        colors={['#db2321', '#a01a18']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                        style={styles.acceptButton}
                                    >
                                        <Text style={styles.acceptButtonText}>Accept</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onDecline}
                                    activeOpacity={0.98}
                                    style={styles.secondaryButtonWrapper}
                                >
                                    <LinearGradient
                                        colors={isDark ? ['rgba(35, 35, 35, 1)', 'rgba(25, 25, 25, 1)'] : ['rgba(255, 255, 255, 1)', 'rgba(245, 245, 245, 1)']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                        style={styles.declineButton}
                                    >
                                        <Text style={[styles.declineButtonText, { color: isDark ? '#fafafa' : '#374151' }]}>Decline</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {status === 'Confirmed' && onMessage && (
                            <TouchableOpacity
                                onPress={onMessage}
                                activeOpacity={0.95}
                                style={[styles.acceptButtonWrapper, { shadowColor: '#db2321', shadowOpacity: 0.2 }]}
                            >
                                <LinearGradient
                                    colors={['#fee2e2', '#fecaca']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={[styles.messageButton, { borderColor: '#fca5a5' }]}
                                >
                                    <MessageCircle size={18} color="#db2321" />
                                    <Text style={[styles.acceptButtonText, { color: '#db2321', textShadowColor: 'rgba(255,255,255,0.5)' }]}>Message Student</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    cardGradient: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardContent: {
        padding: 16,
        position: 'relative',
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#db2321',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    studentInfo: {
        flex: 1,
        marginTop: 2,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    courseBadge: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#fecaca',
        marginVertical: 4,
    },
    courseText: {
        color: '#991b1b',
        fontSize: 12,
        fontWeight: '600',
    },
    detailsContainer: {
        gap: 8,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    progressTrack: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '500',
    },
    earningsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    earningsLabel: {
        fontSize: 14,
    },
    earningsAmount: {
        fontSize: 18,
        fontWeight: '600',
        color: '#db2321',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    acceptButtonWrapper: {
        flex: 1,
        borderRadius: 12,
        shadowColor: '#db2321',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    acceptButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(160, 26, 24, 0.5)',
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    secondaryButtonWrapper: {
        flex: 1,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    declineButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(229, 231, 235, 0.8)',
    },
    declineButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    messageButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(229, 231, 235, 0.8)',
    },
    messageButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
