import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { User, Star, MessageSquare } from 'lucide-react-native';

type ActivityType = 'connection_request' | 'connection_accepted' | 'message' | 'board_reply' | 'board_like';

interface ActivityItem {
    id: string;
    type: ActivityType;
    userName: string;
    userInitial: string;
    userPhotoUrl?: string;
    message?: string;
    courseName?: string;
    timestamp: string;
    isUnread: boolean;
    isPending?: boolean;
}

interface ActivityScreenProps {
    activities: ActivityItem[];
    onAcceptConnection: (activityId: string) => void;
    onDeclineConnection: (activityId: string) => void;
    onActivityTap: (activity: ActivityItem) => void;
    onMarkAllRead?: () => void;
    onViewProfile?: (studentId: string) => void;
    isDarkMode?: boolean;
}

export function ActivityScreen({
    activities,
    onAcceptConnection,
    onDeclineConnection,
    onActivityTap,
    onMarkAllRead,
    onViewProfile,
    isDarkMode = false,
}: ActivityScreenProps) {
    const unreadCount = activities.filter(a => a.isUnread).length;

    const getNotificationData = (activity: ActivityItem) => {
        switch (activity.type) {
            case 'connection_request':
                return {
                    title: 'Connection Request',
                    description: `${activity.userName} wants to connect with you.`,
                    icon: User,
                    iconBgColor: '#fee2e2', // Light red
                    iconColor: '#dc2626', // Darker red
                };
            case 'connection_accepted':
                return {
                    title: 'New Connection',
                    description: `${activity.userName} connected with you.`,
                    icon: User,
                    iconBgColor: '#fee2e2', // Light red
                    iconColor: '#db2321', // Red
                };
            case 'board_like':
                return {
                    title: 'Post Liked',
                    description: `${activity.userName} liked your post in ${activity.courseName}.`,
                    icon: Star,
                    iconBgColor: '#fecaca', // Medium red
                    iconColor: '#db2321', // Red
                };
            case 'board_reply':
                return {
                    title: 'New Comment',
                    description: `${activity.userName} commented on your question.`,
                    icon: MessageSquare,
                    iconBgColor: '#fee2e2', // Light red
                    iconColor: '#db2321', // Red
                };
            case 'message':
                return {
                    title: 'New Message',
                    description: `${activity.userName} sent you a message.`,
                    icon: MessageSquare,
                    iconBgColor: '#fee2e2', // Light red
                    iconColor: '#db2321', // Red
                };
            default:
                return {
                    title: 'Activity',
                    description: 'New activity',
                    icon: MessageSquare,
                    iconBgColor: '#fee2e2',
                    iconColor: '#db2321',
                };
        }
    };

    const handleNotificationPress = (activity: ActivityItem) => {
        // Mark as read when tapped
        if (activity.isUnread) {
            onActivityTap(activity);
        } else {
            onActivityTap(activity);
        }
    };

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            {/* Header */}
            <View style={[styles.header, isDarkMode && styles.headerDark]}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Activity</Text>
                    {unreadCount > 0 && (
                        <Text style={styles.unreadCount}>{unreadCount} unread notifications</Text>
                    )}
                </View>
                {unreadCount > 0 && onMarkAllRead && (
                    <TouchableOpacity onPress={onMarkAllRead} activeOpacity={0.7}>
                        <Text style={styles.markAllRead}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
                {activities.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No activity yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Connect with classmates and interact on The Board to see activity here
                        </Text>
                    </View>
                ) : (
                    <View style={styles.notificationsList}>
                        {activities.map((activity) => {
                            const notificationData = getNotificationData(activity);
                            const IconComponent = notificationData.icon;
                            const isConnectionRequest = activity.type === 'connection_request' && activity.isPending;

                            return (
                                <TouchableOpacity
                                    key={activity.id}
                                    style={[styles.notificationItem, isDarkMode && styles.notificationItemDark]}
                                    onPress={() => handleNotificationPress(activity)}
                                    activeOpacity={0.7}
                                >
                                    {/* Icon Circle - Clickable for Profile */}
                                    <TouchableOpacity
                                        style={[styles.iconCircle, { backgroundColor: notificationData.iconBgColor }]}
                                        onPress={() => {
                                            // TODO: ActivityItem needs a userId field ideally. 
                                            // For now we might just pass the name or ID. 
                                            // Let's assume we can try to look up by name if needed, but ID is better.
                                            // The text said "clicking a student's name or pfp icon".
                                            if (onViewProfile && activity.userName) {
                                                onViewProfile(activity.userName);
                                            }
                                        }}
                                    >
                                        <IconComponent size={20} color={notificationData.iconColor} fill={activity.type === 'board_like' ? notificationData.iconColor : 'none'} />
                                    </TouchableOpacity>

                                    {/* Content */}
                                    <View style={styles.notificationContent}>
                                        <Text style={[styles.notificationTitle, isDarkMode && styles.textDark]}>{notificationData.title}</Text>
                                        <Text style={[styles.notificationDescription, isDarkMode && styles.textGrayDark]}>{notificationData.description}</Text>
                                        {isConnectionRequest && (
                                            <View style={styles.connectionRequestActions}>
                                                <TouchableOpacity
                                                    style={[styles.declineButton, isDarkMode && styles.declineButtonDark]}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        onDeclineConnection(activity.id);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={[styles.declineButtonText, isDarkMode && styles.textGrayDark]}>Decline</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.acceptButton}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        onAcceptConnection(activity.id);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.acceptButtonText}>Accept</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>

                                    {/* Timestamp and Unread Indicator */}
                                    <View style={styles.rightSection}>
                                        <Text style={styles.timestamp}>{activity.timestamp}</Text>
                                        {activity.isUnread && <View style={styles.unreadDot} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    unreadCount: {
        fontSize: 14,
        color: '#6b7280',
    },
    markAllRead: {
        fontSize: 14,
        fontWeight: '600',
        color: '#db2321',
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    notificationsList: {
        backgroundColor: '#fff',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
        marginRight: 12,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    notificationDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        minWidth: 80,
    },
    timestamp: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#db2321',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    connectionRequestActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    declineButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    declineButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    acceptButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#db2321',
    },
    acceptButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    // Dark Mode
    containerDark: {
        backgroundColor: '#111827',
    },
    headerDark: {
        borderBottomColor: '#1f2937',
    },
    textDark: {
        color: '#f3f4f6',
    },
    textGrayDark: {
        color: '#9ca3af',
    },
    notificationItemDark: {
        borderBottomColor: '#1f2937',
        backgroundColor: '#111827',
    },
    declineButtonDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
});
