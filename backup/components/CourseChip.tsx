import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CourseChipProps {
    code: string;
    selected?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'default' | 'large' | 'small' | 'compact';
}

export function CourseChip({ code, selected = false, onClick, disabled = false, variant = 'default' }: CourseChipProps) {
    const baseClasses = `
    items-center justify-center rounded-full
    ${variant === 'large' ? 'px-5 py-2.5' : variant === 'small' ? 'px-2 py-1' : variant === 'compact' ? 'px-1.5 py-0.5' : 'px-3 py-1.5'}
    ${disabled ? 'opacity-50' : ''}
  `;

    const textClasses = `
    font-medium
    ${variant === 'large' ? 'text-base' : variant === 'small' ? 'text-xs' : variant === 'compact' ? 'text-xs' : 'text-sm'}
    ${selected ? 'text-white' : 'text-red-800 dark:text-red-300'}
  `;

    const backgroundClasses = selected
        ? ''
        : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800';

    const content = (
        <View style={[
            styles.container,
            variant === 'large' ? styles.large : variant === 'small' ? styles.small : variant === 'compact' ? styles.compact : styles.default,
            disabled && styles.disabled
        ]}>
            {selected ? (
                <LinearGradient
                    colors={['#db2321', '#a01a18']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            ) : (
                <View style={styles.unselectedBackground} />
            )}
            <Text style={[
                styles.text,
                variant === 'large' ? styles.largeText : variant === 'small' ? styles.smallText : variant === 'compact' ? styles.compactText : styles.defaultText,
                selected ? styles.selectedText : styles.unselectedText,
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
    unselectedBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 9999,
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
});
