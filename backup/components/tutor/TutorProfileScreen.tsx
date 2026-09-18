import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Edit, BookOpen, DollarSign, LogOut, ChevronRight, User, Settings } from 'lucide-react-native';

interface TutorProfileScreenProps {
    tutorName: string;
    tutorInitial: string;
    role: 'student' | 'tutor';
    onRoleChange: (role: 'student' | 'tutor') => void;
    onEditProfile: () => void;
    onEditCourses: () => void;
    onEditPricing: () => void;
    onSettings: () => void;
    onLogout: () => void;
}

export function TutorProfileScreen({
    tutorName,
    tutorInitial,
    role,
    onRoleChange,
    onEditProfile,
    onEditCourses,
    onEditPricing,
    onSettings,
    onLogout,
}: TutorProfileScreenProps) {
    const menuItems = [
        {
            icon: User,
            label: 'Edit Profile',
            onClick: onEditProfile,
        },
        {
            icon: BookOpen,
            label: 'My Courses',
            onClick: onEditCourses,
        },
        {
            icon: DollarSign,
            label: 'Pricing',
            onClick: onEditPricing,
        },
        {
            icon: Settings,
            label: 'Settings',
            onClick: onSettings,
        },
    ];

    return (
        <ScrollView className="flex-1 bg-white dark:bg-gray-900">
            <View className="items-center pt-8 pb-6">
                <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <Text className="text-3xl font-bold text-gray-500">{tutorName.charAt(0)}</Text>
                </View>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">{tutorName}</Text>
                <View className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Text className="text-blue-700 dark:text-blue-300 text-xs font-medium capitalize">{role}</Text>
                </View>
            </View>

            <View className="p-4">
                <View className="gap-3 mb-8">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <TouchableOpacity
                                key={item.label}
                                onPress={item.onClick}
                                className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm"
                                style={{ borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' }}
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
                    className="flex-row items-center justify-center p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 shadow-sm"
                >
                    <LogOut size={20} color="#DC2626" />
                    <Text className="ml-2 text-red-600 font-bold">Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
