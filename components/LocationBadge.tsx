import { View, Text } from 'react-native';

interface LocationBadgeProps {
    location: string;
    isDarkMode?: boolean;
}

export function LocationBadge({ location, isDarkMode = false }: LocationBadgeProps) {
    const isOnline = location === 'online';

    return (
        <View className={`
      items-center px-3 py-1.5 rounded-full
      ${isOnline
                ? isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'
                : isDarkMode ? 'bg-orange-900' : 'bg-orange-100'
            }
    `}>
            <Text className={`
        text-xs font-medium
        ${isOnline
                    ? isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                    : isDarkMode ? 'text-orange-300' : 'text-orange-800'
                }
      `}>
                {isOnline ? 'Online' : 'In-Person'}
            </Text>
        </View>
    );
}
