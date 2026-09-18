import { View, Text } from 'react-native';

interface LocationBadgeProps {
    location: string;
}

export function LocationBadge({ location }: LocationBadgeProps) {
    const isOnline = location === 'online';

    return (
        <View className={`
      items-center px-3 py-1.5 rounded-full
      ${isOnline ? 'bg-yellow-100' : 'bg-orange-100'}
    `}>
            <Text className={`
        text-xs font-medium
        ${isOnline ? 'text-yellow-800' : 'text-orange-800'}
      `}>
                {isOnline ? 'Online' : 'In-Person'}
            </Text>
        </View>
    );
}
