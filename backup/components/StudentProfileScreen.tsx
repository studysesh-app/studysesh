import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { User, Settings, BookOpen, LogOut, ChevronRight } from 'lucide-react-native';

interface StudentProfileScreenProps {
    name: string;
    email: string;
    role: string;
    onEditProfile: () => void;
    onMyCourses: () => void;
    onSettings: () => void;
    onLogout: () => void;
}

export function StudentProfileScreen({
    name,
    email,
    role,
    onEditProfile,
    onMyCourses,
    onSettings,
    onLogout
}: StudentProfileScreenProps) {
    const menuItems = [
        { icon: User, label: 'Edit Profile', onPress: onEditProfile },
        { icon: BookOpen, label: 'My Courses', onPress: onMyCourses },
        { icon: Settings, label: 'Settings', onPress: onSettings },
    ];

    return (
        <ScrollView className="flex-1 bg-white dark:bg-gray-900">
            <View className="items-center pt-8 pb-6">
                <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <Text className="text-3xl font-bold text-gray-500">{name.charAt(0)}</Text>
                </View>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">{name}</Text>
                <Text className="text-gray-500 dark:text-gray-400">{email}</Text>
                <View className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Text className="text-blue-700 dark:text-blue-300 text-xs font-medium capitalize">{role}</Text>
                </View>
            </View>

            <View className="p-4">
                <View className="gap-4 mb-8">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <TouchableOpacity
                                key={item.label}
                                onPress={item.onPress}
                                className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-[#eceef3] dark:border-gray-700/70"
                            >
                                <View className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center mr-3">
                                    <Icon size={20} color="#374151" />
                                </View>
                                <Text className="flex-1 text-base text-gray-900 dark:text-white font-bold">{item.label}</Text>
                                <View className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 items-center justify-center">
                                    <ChevronRight size={16} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    onPress={onLogout}
                    className="flex-row items-center justify-center p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-[#f8dede] dark:border-red-900/40 shadow-sm"
                >
                    <LogOut size={20} color="#DC2626" />
                    <Text className="ml-2 text-red-600 font-bold">Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
