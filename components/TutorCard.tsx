import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle } from 'lucide-react-native';
import { CourseChip } from './CourseChip';
import { PricingBubble } from './PricingBubble';
import { LocationBadge } from './LocationBadge';

interface TutorCardProps {
    name: string;
    avatar?: string;
    courses: string[];
    pronouns: string;
    groupPrice: string | null;
    individualPrice: string | null;
    location: string[];
    onClick?: () => void;
    showMessageButton?: boolean;
    onMessagePress?: () => void;
    isDarkMode?: boolean;
}

export function TutorCard({
    name,
    avatar,
    courses,
    pronouns,
    groupPrice,
    individualPrice,
    location,
    onClick,
    showMessageButton = false,
    onMessagePress,
    isDarkMode = false,
}: TutorCardProps) {
    return (
        <TouchableOpacity
            onPress={onClick}
            activeOpacity={onClick ? 0.7 : 1}
            className="w-full rounded-2xl mb-4 shadow-sm"
            style={{
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            <View
                className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"
                style={isDarkMode ? styles.cardContentDark : undefined}
            >
                {/* Header */}
                <View className="flex-row items-start gap-3 mb-3">
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={['#db2321', '#a01a18']}
                            style={StyleSheet.absoluteFill}
                        />
                        {avatar ? (
                            <Image
                                source={{ uri: avatar }}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={styles.avatarText}>
                                {name.charAt(0)}
                            </Text>
                        )}
                    </View>

                    {/* Name and Pronouns */}
                    <View className="flex-1">
                        <Text className="text-lg font-bold mb-0.5" style={{ color: isDarkMode ? '#fff' : '#111827' }}>
                            {name}
                        </Text>
                        <Text className="text-sm" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                            {pronouns}
                        </Text>
                    </View>
                </View>

                {/* Courses */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                    {courses.slice(0, 3).map((course) => (
                        <CourseChip key={course} code={course} isDarkMode={isDarkMode} />
                    ))}
                    {courses.length > 3 && (
                        <Text className="text-sm self-center" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                            +{courses.length - 3} more
                        </Text>
                    )}
                </View>

                {/* Pricing */}
                <View className="flex-row flex-wrap gap-2 mb-2">
                    {groupPrice && <PricingBubble type="group" price={groupPrice} isDarkMode={isDarkMode} />}
                    {individualPrice && <PricingBubble type="individual" price={individualPrice} isDarkMode={isDarkMode} />}
                </View>

                {/* Location and Message Button */}
                <View className="flex-row items-center justify-between mt-1">
                    <View className="flex-row gap-2">
                        {location.map((loc) => (
                            <LocationBadge key={loc} location={loc} isDarkMode={isDarkMode} />
                        ))}
                    </View>

                    {/* Message Button */}
                    {showMessageButton && onMessagePress && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onMessagePress();
                            }}
                            style={[styles.messageButton, isDarkMode && styles.messageButtonDark]}
                            activeOpacity={0.7}
                        >
                            <MessageCircle size={14} color={isDarkMode ? '#fca5a5' : '#db2321'} />
                            <Text style={[styles.messageButtonText, isDarkMode && styles.messageButtonTextDark]}>Message</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        zIndex: 1,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#fef2f2',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    messageButtonText: {
        color: '#db2321',
        fontSize: 12,
        fontWeight: '600',
    },
    cardContentDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    messageButtonDark: {
        backgroundColor: '#450a0a',
        borderColor: '#7f1d1d',
    },
    messageButtonTextDark: {
        color: '#fca5a5',
    },
});
