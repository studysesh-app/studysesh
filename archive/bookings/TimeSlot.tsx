import { Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TimeSlotProps {
    time: string;
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}

export function TimeSlot({ time, selected = false, disabled = false, onClick }: TimeSlotProps) {
    const content = (
        <TouchableOpacity
            onPress={onClick}
            disabled={disabled}
            className={`
        px-4 py-2.5 rounded-2xl items-center justify-center overflow-hidden
        ${disabled ? 'opacity-40' : ''}
        ${!selected && !disabled ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700' : ''}
      `}
        >
            {selected && (
                <LinearGradient
                    colors={['#db2321', '#a01a18']}
                    className="absolute top-0 left-0 right-0 bottom-0"
                />
            )}
            <Text
                className={`
          text-sm font-medium
          ${selected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}
        `}
            >
                {time}
            </Text>
        </TouchableOpacity>
    );

    return content;
}
