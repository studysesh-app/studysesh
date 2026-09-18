import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CourseChipProps {
    code: string;
    selected?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'default' | 'large' | 'small' | 'compact';
    isDarkMode?: boolean;
}

export function CourseChip({ code, selected = false, onClick, disabled = false, variant = 'default', isDarkMode = false }: CourseChipProps) {
    // If selected and variant is default, use large variant
    const effectiveVariant = selected && variant === 'default' ? 'large' : variant;
    const baseClasses = `
    items-center justify-center rounded-full
    ${effectiveVariant === 'large' ? 'px-5 py-2.5' : effectiveVariant === 'small' ? 'px-2 py-1' : effectiveVariant === 'compact' ? 'px-1.5 py-0.5' : 'px-3 py-1.5'}
    ${disabled ? 'opacity-50' : ''}
  `;

    const textClasses = `
    font-medium
    ${effectiveVariant === 'large' ? 'text-base' : effectiveVariant === 'small' ? 'text-xs' : effectiveVariant === 'compact' ? 'text-xs' : 'text-sm'}
    ${selected ? 'text-white' : 'text-red-800 dark:text-red-300'}
  `;

    const backgroundClasses = selected
        ? ''
        : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800';

    const content = (
        <View style={[
            styles.container,
            effectiveVariant === 'large' ? styles.large : effectiveVariant === 'small' ? styles.small : effectiveVariant === 'compact' ? styles.compact : styles.default,
            selected ? styles.selectedBackground : (isDarkMode ? styles.unselectedBackgroundDark : styles.unselectedBackground),
            disabled && styles.disabled
        ]}>
            <Text style={[
                styles.text,
                effectiveVariant === 'large' ? styles.largeText : effectiveVariant === 'small' ? styles.smallText : effectiveVariant === 'compact' ? styles.compactText : styles.defaultText,
                selected ? styles.selectedText : (isDarkMode ? styles.unselectedTextDark : styles.unselectedText),
                disabled && styles.disabledText
            ]}>{code}</Text>
        </View>
    );

    if (onClick) {
        return (
            <TouchableOpacity onPress={onClick} disabled={disabled}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        overflow: 'hidden',
        alignSelf: 'flex-start',
    },
    default: {
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    large: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    small: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    compact: {
        paddingHorizontal: 8,
        paddingVertical: 5,
    },
    disabled: {
        opacity: 0.5,
    },
    selectedBackground: {
        backgroundColor: '#db2321',
    },
    unselectedBackground: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#db2321',
    },
    text: {
        fontWeight: '500',
        zIndex: 1,
    },
    defaultText: {
        fontSize: 14,
    },
    largeText: {
        fontSize: 19,
    },
    smallText: {
        fontSize: 14,
    },
    compactText: {
        fontSize: 15,
    },
    selectedText: {
        color: 'white',
    },
    unselectedText: {
        color: '#991b1b',
    },
    disabledText: {
        color: '#9ca3af',
    },
    unselectedBackgroundDark: {
        backgroundColor: '#450a0a',
        borderWidth: 1,
        borderColor: '#7f1d1d',
    },
    unselectedTextDark: {
        color: '#fca5a5',
    },
});
