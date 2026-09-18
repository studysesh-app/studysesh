import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
}

export function TutorCard({
    name,
    avatar,
    courses,
    pronouns,
    groupPrice,
    individualPrice,
    location,
    onClick
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
            >
                {/* Header */}
                <View className="flex-row items-start gap-3 mb-3">
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={['#db2321', '#a01a18']}
                            style={StyleSheet.absoluteFillObject}
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
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
                            {name}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {pronouns}
                        </Text>
                    </View>
                </View>

                {/* Courses */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                    {courses.slice(0, 3).map((course) => (
                        <CourseChip key={course} code={course} />
                    ))}
                    {courses.length > 3 && (
                        <Text className="text-sm text-gray-500 self-center">
                            +{courses.length - 3} more
                        </Text>
                    )}
                </View>

                {/* Pricing */}
                <View className="flex-row flex-wrap gap-2 mb-2">
                    {groupPrice && <PricingBubble type="group" price={groupPrice} />}
                    {individualPrice && <PricingBubble type="individual" price={individualPrice} />}
                </View>

                {/* Location */}
                <View className="flex-row items-center mt-1">
                    <View className="flex-row gap-2">
                        {location.map((loc) => (
                            <LocationBadge key={loc} location={loc} />
                        ))}
                    </View>
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
});
