import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, MessageSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CourseChip } from './CourseChip';
import { PricingBubble } from './PricingBubble';
import { SessionBadge } from './SessionBadge';

interface BookingCardProps {
    tutorName: string;
    course: string;
    date: string;
    time: string;
    location: string;
    sessionType: 'group' | 'individual';
    price: string;
    status: 'Pending' | 'Confirmed' | 'Completed';
    onClick?: () => void;
    onMessageTutor?: () => void;
    onCancel?: () => void;
    highlighted?: boolean;
}

export function BookingCard({
    tutorName,
    course,
    date,
    time,
    location,
    sessionType,
    price,
    status,
    onClick,
    onMessageTutor,
    highlighted = false
}: BookingCardProps) {
    // Format location display
    const locationDisplay = location === 'online' ? 'Online via Zoom' : location;

    // Determine price bubble color based on price
    const priceNum = parseInt(price.replace('$', ''));
    const priceColor = priceNum >= 30 ? 'bg-green-100 border-green-200' : 'bg-blue-100 border-blue-200';
    const priceTextColor = priceNum >= 30 ? 'text-green-700' : 'text-blue-700';

    return (
        <TouchableOpacity
            onPress={onClick}
            activeOpacity={onClick ? 0.7 : 1}
            className="w-full rounded-2xl mb-4 bg-white"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                borderWidth: highlighted ? 2 : 0,
                borderColor: highlighted ? '#db2321' : 'transparent',
            }}
        >
            <View className="p-4 rounded-2xl">
                {/* Header with Status Badge */}
                <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="text-base font-semibold text-gray-900 mb-2">
                            {tutorName}
                        </Text>
                        <View style={{ alignSelf: 'flex-start' }}>
                            <CourseChip code={course} variant="compact" />
                        </View>
                    </View>
                    <SessionBadge status={status} size="md" />
                </View>

                {/* Details */}
                <View className="mb-4 gap-3">
                    <View className="flex-row items-center gap-2">
                        <Calendar size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-700">
                            {date} • {time}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <MapPin size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-700">{locationDisplay}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
                    <View className="flex-row items-center gap-3">
                        <View className={`px-2.5 py-1 rounded-full border ${priceColor}`}>
                            <Text className={`text-xs font-semibold ${priceTextColor}`}>
                                {price}
                            </Text>
                        </View>
                        <Text className="text-xs text-gray-500">
                            {sessionType === 'group' ? '3-10 students' : 'One-on-one'}
                        </Text>
                    </View>
                    {onMessageTutor && status === 'Confirmed' && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onMessageTutor();
                            }}
                            className="px-3 py-1.5 rounded-full border border-red-600"
                        >
                            <Text className="text-xs font-semibold text-red-600">
                                Message
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
