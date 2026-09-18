import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ConversationItemProps {
    tutorName: string;
    tutorInitial: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    onClick: () => void;
    onDelete?: () => void;
}

export function ConversationItem({
    tutorName,
    tutorInitial,
    lastMessage,
    timestamp,
    unreadCount = 0,
    onClick,
    onDelete,
}: ConversationItemProps) {
    return (
        <TouchableOpacity
            onPress={onClick}
            onLongPress={onDelete}
            className="flex-row items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-3 border border-[#eceef3] dark:border-gray-700/70 mx-1"
        >
            {/* Avatar with unread badge */}
            <View className="relative">
                <View className="w-14 h-14 rounded-full bg-[#db2321] items-center justify-center">
                    <Text className="text-white text-xl font-semibold">
                        {tutorInitial}
                    </Text>
                </View>
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
                    <Text className="text-lg font-bold text-gray-900 dark:text-white truncate flex-1 mr-2">
                        {tutorName}
                    </Text>
                    <Text className="text-xs text-gray-500">
                        {timestamp}
                    </Text>
                </View>
                <Text
                    className="text-base text-gray-500 dark:text-gray-400"
                    numberOfLines={2}
                >
                    {lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
