import { View, Text } from 'react-native';

interface PricingBubbleProps {
    type: 'group' | 'individual';
    price: string;
    size?: 'sm' | 'md';
    isDarkMode?: boolean;
}

export function PricingBubble({ type, price, size = 'md', isDarkMode = false }: PricingBubbleProps) {
    const isGroup = type === 'group';

    const containerClasses = `
    flex-row items-center rounded-full
    ${size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'}
    ${isGroup
            ? isDarkMode ? 'bg-blue-900' : 'bg-[#d5e2f6]'
            : isDarkMode ? 'bg-green-900' : 'bg-[#c8e6c9]'
        }
  `;

    const textClasses = `
    font-semibold
    ${size === 'sm' ? 'text-xs' : 'text-sm'}
    ${isGroup
            ? isDarkMode ? 'text-blue-300' : 'text-blue-600'
            : isDarkMode ? 'text-green-300' : 'text-green-700'
        }
  `;

    return (
        <View className={containerClasses}>
            <Text className={textClasses}>
                {price.toLowerCase() === 'free' ? 'Free' : `$${price}`}
            </Text>
            {size !== 'sm' && (
                <Text className={`${textClasses} font-normal opacity-70 ml-1`}>
                    / {type === 'group' ? 'group' : '1:1'}
                </Text>
            )}
        </View>
    );
}
