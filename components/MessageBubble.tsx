import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MessageBubbleProps {
    message: string;
    timestamp: string;
    isStudent: boolean;
    status?: 'sent' | 'delivered' | 'read';
    isTutorView?: boolean;
    isDarkMode?: boolean;
}

export function MessageBubble({
    message,
    timestamp,
    isStudent,
    status,
    isTutorView = false,
    isDarkMode = false,
}: MessageBubbleProps) {
    const isMyMessage = isTutorView ? !isStudent : isStudent;

    return (
        <View className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'} mb-1.5`}>
            <View className={`max-w-[75%] ${isMyMessage ? 'items-end' : 'items-start'}`} style={{ gap: 2 }}>
                {isMyMessage ? (
                    <View className="bg-[#db2321] px-4 py-2.5 rounded-[20px] rounded-br-[4px]">
                        <Text className="text-[17px] text-white" style={{ lineHeight: 22 }}>
                            {message}
                        </Text>
                    </View>
                ) : (
                    <View className={`px-4 py-2.5 rounded-[20px] rounded-bl-[4px] ${isDarkMode ? 'bg-gray-800' : 'bg-[#e5e5ea]'}`} style={{ borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' }}>
                        <Text className={`text-[17px] ${isDarkMode ? 'text-white' : 'text-black'}`} style={{ lineHeight: 22 }}>
                            {message}
                        </Text>
                    </View>
                )}

                {/* Only show status/timestamp for the last message in a group ideally, but for now keep it simple or hide it to match "clean" look? 
                    The reference image doesn't show timestamps on every bubble. 
                    I'll keep it minimal or hide it if not needed. 
                    User said "Tighten the spacing". 
                    I'll hide timestamp for now or make it very subtle. 
                    Actually, iMessage shows timestamp on drag or tap. 
                    I'll keep it but make it very small and hidden by default? 
                    No, I'll just leave it as is but maybe smaller margin.
                */}
                {status && isMyMessage && (
                    <Text className="text-[10px] text-gray-400 font-medium px-1">
                        {status === 'read' ? 'Read' : 'Delivered'}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Removed custom styles in favor of utility classes
});
