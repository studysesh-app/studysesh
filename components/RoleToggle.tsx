import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { GraduationCap, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface RoleToggleProps {
    role: 'student' | 'tutor';
    onChange: (role: 'student' | 'tutor') => void;
}

export function RoleToggle({ role, onChange }: RoleToggleProps) {
    const handlePress = (newRole: 'student' | 'tutor') => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onChange(newRole);
    };

    return (
        <View className="flex-row items-center p-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TouchableOpacity
                onPress={() => handlePress('student')}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full overflow-hidden ${role !== 'student' ? 'opacity-60' : ''}`}
            >
                {role === 'student' && (
                    <LinearGradient
                        colors={['#db2321', '#a01a18']}
                        className="absolute top-0 left-0 right-0 bottom-0"
                    />
                )}
                <GraduationCap size={16} color={role === 'student' ? 'white' : '#6b7280'} />
                <Text className={`text-sm font-medium ${role === 'student' ? 'text-white' : 'text-gray-500'}`}>
                    Student
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => handlePress('tutor')}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full overflow-hidden ${role !== 'tutor' ? 'opacity-60' : ''}`}
            >
                {role === 'tutor' && (
                    <LinearGradient
                        colors={['#db2321', '#a01a18']}
                        className="absolute top-0 left-0 right-0 bottom-0"
                    />
                )}
                <Users size={16} color={role === 'tutor' ? 'white' : '#6b7280'} />
                <Text className={`text-sm font-medium ${role === 'tutor' ? 'text-white' : 'text-gray-500'}`}>
                    Tutor
                </Text>
            </TouchableOpacity>
        </View>
    );
}
