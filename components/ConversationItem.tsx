import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ConversationItemProps {
    tutorName: string;
    tutorInitial: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    onClick: () => void;
    onDelete?: () => void;
    type?: 'tutor' | 'student';
    isDarkMode?: boolean;
}

export function ConversationItem({
    tutorName,
    tutorInitial,
    lastMessage,
    timestamp,
    unreadCount = 0,
    onClick,
    onDelete,
    type = 'tutor',
    isDarkMode = false,
}: ConversationItemProps) {
    const isTutor = type === 'tutor';

    return (
        <TouchableOpacity
            onPress={onClick}
            onLongPress={onDelete}
            style={[styles.container, isDarkMode && styles.containerDark]}
            activeOpacity={0.8}
        >
            {/* Avatar with unread badge */}
            <View className="relative">
                {isTutor ? (
                    <View className="w-14 h-14 rounded-full overflow-hidden">
                        <LinearGradient
                            colors={['#db2321', '#a01a18']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <View className="absolute inset-0 items-center justify-center">
                            <Text className="text-white text-xl font-semibold">
                                {tutorInitial}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View className="w-14 h-14 rounded-full bg-[#fee2e2] items-center justify-center">
                        <Text className="text-[#991b1b] text-xl font-semibold">
                            {tutorInitial}
                        </Text>
                    </View>
                )}
                {unreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 items-center justify-center border border-white dark:border-gray-900">
                        <Text className="text-white text-[10px] font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                    </View>
                )}
            </View>

            {/* Message content */}
            <View className="flex-1 pt-0.5">
                <View className="flex-row items-baseline justify-between mb-1">
                    <Text className="text-lg font-bold truncate flex-1 mr-2" style={{ color: isDarkMode ? '#fff' : '#111827' }}>
                        {tutorName}
                    </Text>
                    <Text className="text-xs" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                        {timestamp}
                    </Text>
                </View>
                <Text
                    className="text-base"
                    style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    numberOfLines={2}
                >
                    {lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        marginBottom: 12,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    containerDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
});
