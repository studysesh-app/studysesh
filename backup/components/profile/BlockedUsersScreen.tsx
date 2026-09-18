import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, UserX } from 'lucide-react-native';
import { useState } from 'react';

interface BlockedUser {
    id: string;
    name: string;
    initial: string;
}

interface BlockedUsersScreenProps {
    blockedUsers: BlockedUser[];
    onBack: () => void;
    onUnblock: (userId: string) => void;
}

export function BlockedUsersScreen({
    blockedUsers: initialBlockedUsers,
    onBack,
    onUnblock,
}: BlockedUsersScreenProps) {
    const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);

    const handleUnblock = (userId: string) => {
        setBlockedUsers(blockedUsers.filter((u) => u.id !== userId));
        onUnblock(userId);
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-gray-200 dark:border-gray-800 pt-12">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-bold pr-10 text-gray-900 dark:text-white">
                    Blocked Users
                </Text>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {blockedUsers.length === 0 ? (
                    <View className="items-center justify-center py-16">
                        <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                            <UserX size={32} color="#9ca3af" />
                        </View>
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                            No blocked users
                        </Text>
                        <Text className="text-sm text-gray-500 text-center max-w-xs">
                            Users you block will appear here
                        </Text>
                    </View>
                ) : (
                    <View className="gap-2">
                        {blockedUsers.map((user) => (
                            <View
                                key={user.id}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex-row items-center gap-3"
                            >
                                {/* Avatar */}
                                <View className="w-12 h-12 rounded-full bg-red-900 items-center justify-center">
                                    <Text className="text-white text-lg font-semibold">
                                        {user.initial}
                                    </Text>
                                </View>

                                {/* Name */}
                                <View className="flex-1">
                                    <Text className="text-base font-medium text-gray-900 dark:text-white">
                                        {user.name}
                                    </Text>
                                </View>

                                {/* Unblock Button */}
                                <TouchableOpacity
                                    onPress={() => handleUnblock(user.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20"
                                >
                                    <Text className="text-sm font-medium text-red-600 dark:text-red-400">
                                        Unblock
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
