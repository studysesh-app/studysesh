import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CourseChip } from '../CourseChip';

interface StudentCardProps {
    name: string;
    initial: string;
    courses: string[];
    sessionsCount: number;
    lastSession?: string;
    onMessage: () => void;
    onClick?: () => void;
}

export function StudentCard({
    name,
    initial,
    courses,
    sessionsCount,
    lastSession,
    onMessage,
    onClick,
}: StudentCardProps) {
    const handleCardClick = () => {
        onMessage();
    };

    return (
        <TouchableOpacity
            onPress={handleCardClick}
            activeOpacity={0.7}
            className="rounded-2xl mb-3 shadow-sm"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            <LinearGradient
                colors={['#ffffff', '#f8f8f8']}
                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800"
            >
                <View className="flex-row items-start gap-3">
                    {/* Student Avatar */}
                    <View className="w-12 h-12 rounded-full items-center justify-center shadow-sm">
                        <LinearGradient
                            colors={['#db2321', '#a01a18']}
                            className="absolute w-full h-full rounded-full"
                        />
                        <Text
                            className="text-white text-lg font-semibold"
                            style={{ zIndex: 10 }}
                        >
                            {initial}
                        </Text>
                    </View>

                    {/* Student Info */}
                    <View className="flex-1">
                        <Text
                            className="text-base font-semibold mb-2"
                            style={{ color: '#111827' }}
                        >
                            {name}
                        </Text>

                        {/* Courses */}
                        <View className="flex-row flex-wrap gap-1 mb-2">
                            {courses.slice(0, 3).map((course) => (
                                <CourseChip key={course} code={course} variant="small" />
                            ))}
                            {courses.length > 3 && (
                                <View className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <Text className="text-xs text-gray-500">
                                        +{courses.length - 3} more
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Stats */}
                        <Text className="text-sm text-gray-500">
                            {sessionsCount} {sessionsCount === 1 ? 'session' : 'sessions'}
                            {lastSession && ` • Last: ${lastSession}`}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}
