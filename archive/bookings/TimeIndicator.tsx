import { View, Text } from 'react-native';
import { Clock } from 'lucide-react-native';

interface TimeIndicatorProps {
    time: string;
    variant?: 'default' | 'compact';
}

export function TimeIndicator({ time, variant = 'default' }: TimeIndicatorProps) {
    return (
        <View className="flex-row items-center gap-1.5">
            <Clock
                size={variant === 'compact' ? 14 : 16}
                color="#6b7280"
            />
            <Text className={`text-gray-500 font-normal ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
                {time}
            </Text>
        </View>
    );
}
