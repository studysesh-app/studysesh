import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    iconColor?: string;
}

export function StatCard({ icon: Icon, label, value, iconColor = '#db2321' }: StatCardProps) {
    return (
        <View
            className="rounded-2xl p-4 items-center gap-2 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-gray-50 dark:bg-gray-800 shadow-sm">
                <Icon size={20} color={iconColor} />
            </View>
            <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {label}
                </Text>
            </View>
        </View>
    );
}
