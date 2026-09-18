import { StyleSheet, useColorScheme, View, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

type PronounOption = {
    label: string;
    value: string;
};

interface PronounSelectorProps {
    options: PronounOption[];
    selectedValues: string[];
    onSelect: (values: string[]) => void;
    isDarkMode?: boolean;
}

const ANIMATION_CONFIG = {
    duration: 200,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
};

export function PronounSelector({ options, selectedValues, onSelect, isDarkMode }: PronounSelectorProps) {
    const colorScheme = useColorScheme();
    const isDark = isDarkMode ?? colorScheme === 'dark';

    const activeColor = '#db2321';
    const inactiveColor = isDark ? '#9ca3af' : '#6b7280';
    const fadedActiveColor = isDark ? 'rgba(219, 35, 33, 0.2)' : 'rgba(219, 35, 33, 0.1)';
    const inactiveBorderColor = isDark ? '#374151' : '#e5e7eb';
    const inactiveBackgroundColor = isDark ? '#1f2937' : '#ffffff';

    const handleSelect = (value: string) => {
        if (selectedValues.includes(value)) {
            onSelect(selectedValues.filter(v => v !== value));
        } else {
            if (selectedValues.length < 2) {
                onSelect([...selectedValues, value]);
            }
        }
    };

    return (
        <View style={styles.container}>
            {options.map((option) => {
                const checked = selectedValues.includes(option.value);
                const isDisabled = !checked && selectedValues.length >= 2;

                const rContainerStyle = useAnimatedStyle(() => {
                    return {
                        borderColor: withTiming(
                            checked ? fadedActiveColor : inactiveBorderColor,
                            ANIMATION_CONFIG
                        ),
                        backgroundColor: withTiming(
                            checked ? fadedActiveColor : inactiveBackgroundColor,
                            ANIMATION_CONFIG
                        ),
                        paddingRight: withTiming(checked ? 12 : 20, ANIMATION_CONFIG),
                    };
                }, [checked]);

                const rTextStyle = useAnimatedStyle(() => {
                    return {
                        color: withTiming(checked ? activeColor : inactiveColor, ANIMATION_CONFIG),
                    };
                }, [checked]);

                const rCheckmarkStyle = useAnimatedStyle(() => {
                    return {
                        opacity: withTiming(checked ? 1 : 0, ANIMATION_CONFIG),
                        transform: [
                            { scale: withTiming(checked ? 1 : 0.5, ANIMATION_CONFIG) },
                        ],
                        marginLeft: 8,
                        width: withTiming(checked ? 18 : 0, ANIMATION_CONFIG),
                    };
                }, [checked]);

                return (
                    <View key={option.value} style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                if (!isDisabled) {
                                    handleSelect(option.value);
                                }
                            }}
                            activeOpacity={0.7}
                            disabled={isDisabled}
                            style={{ opacity: isDisabled ? 0.5 : 1 }}
                        >
                            <Animated.View
                                style={[styles.checkboxContainer, rContainerStyle]}
                                pointerEvents="none"
                            >
                                <Animated.Text style={[styles.label, rTextStyle]}>
                                    {option.label}
                                </Animated.Text>
                                <Animated.View style={rCheckmarkStyle}>
                                    <Check size={18} color={activeColor} />
                                </Animated.View>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    itemContainer: {
        flexShrink: 0,
    },
    checkboxContainer: {
        alignItems: 'center',
        borderCurve: 'continuous',
        borderRadius: 36,
        borderWidth: 1.5,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingVertical: 14,
        paddingRight: 20,
    },
    label: {
        fontWeight: '600',
        fontSize: 16,
    },
});
