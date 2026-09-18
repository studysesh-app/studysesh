import { View, Text } from 'react-native';

type SessionStatus = 'Pending' | 'Confirmed' | 'Completed';

interface SessionBadgeProps {
    status: SessionStatus;
    size?: 'sm' | 'md';
}

export function SessionBadge({ status, size = 'md' }: SessionBadgeProps) {
    const getStatusStyles = () => {
        switch (status) {
            case 'Pending':
                return {
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    text: 'text-yellow-800 dark:text-yellow-300'
                };
            case 'Confirmed':
                return {
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    text: 'text-green-800 dark:text-green-300'
                };
            case 'Completed':
                return {
                    bg: 'bg-gray-100 dark:bg-gray-800',
                    text: 'text-gray-800 dark:text-gray-300'
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <View
            className={`
        items-center justify-center rounded-full
        ${styles.bg}
        ${size === 'sm' ? 'px-2.5 py-0.5' : 'px-3 py-1.5'}
      `}
        >
            <Text
                className={`
          font-medium
          ${size === 'sm' ? 'text-xs' : 'text-sm font-semibold'}
          ${styles.text}
        `}
            >
                {status}
            </Text>
        </View>
    );
}
