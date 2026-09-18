import { View, Text } from 'react-native';

interface PricingBubbleProps {
    type: 'group' | 'individual';
    price: string;
    size?: 'sm' | 'md';
}

export function PricingBubble({ type, price, size = 'md' }: PricingBubbleProps) {
    const isGroup = type === 'group';

    const containerClasses = `
    flex-row items-center rounded-full
    ${size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'}
    ${isGroup
            ? 'bg-[#d5e2f6] dark:bg-blue-900/30'
            : 'bg-[#c8e6c9] dark:bg-green-900/30'
        }
  `;

    const textClasses = `
    font-semibold
    ${size === 'sm' ? 'text-xs' : 'text-sm'}
    ${isGroup
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-green-700 dark:text-green-400'
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
