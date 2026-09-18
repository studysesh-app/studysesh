import { StyleSheet, useColorScheme, View, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';

import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    LinearTransition,
    useAnimatedStyle,
} from 'react-native-reanimated';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DaySelectorProps {
    selectedDays: string[];
    onSelect: (days: string[]) => void;
}

const Layout = LinearTransition.springify().mass(1).damping(30).stiffness(250);
const LayoutEntering = FadeIn.duration(150).easing(
    Easing.bezier(0.895, 0.03, 0.685, 0.22).factory(),
);
const LayoutExiting = FadeOut.duration(150).easing(
    Easing.bezier(0.895, 0.03, 0.685, 0.22).factory(),
);

export function DaySelector({ selectedDays, onSelect }: DaySelectorProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const activeColor = '#db2321'; // App's red color
    const inactiveColor = isDark ? '#9ca3af' : '#6b7280';
    const fadedActiveColor = isDark ? 'rgba(219, 35, 33, 0.2)' : 'rgba(219, 35, 33, 0.1)';
    const inactiveBorderColor = isDark ? '#374151' : '#e5e7eb';
    const inactiveBackgroundColor = isDark ? '#1f2937' : '#ffffff';

    const handleSelect = (day: string) => {
        if (selectedDays.includes(day)) {
            onSelect(selectedDays.filter(d => d !== day));
        } else {
            // Sort days according to week order
            const newDays = [...selectedDays, day].sort((a, b) => {
                return DAYS.indexOf(a) - DAYS.indexOf(b);
            });
            onSelect(newDays);
        }
    };

    return (
        <View style={styles.container}>
            {DAYS.map((day) => {
                const checked = selectedDays.includes(day);

                const rContainerStyle = useAnimatedStyle(() => {
                    return {
                        borderColor: checked ? fadedActiveColor : inactiveBorderColor,
                        borderWidth: 1.5,
                        backgroundColor: checked ? fadedActiveColor : inactiveBackgroundColor,
                    };
                }, [checked, fadedActiveColor, inactiveBorderColor, inactiveBackgroundColor]);

                const rTextStyle = useAnimatedStyle(() => {
                    return {
                        color: checked ? activeColor : inactiveColor,
                    };
                }, [checked]);

                return (
                    <Animated.View
                        key={day}
                        layout={Layout}
                        style={styles.itemContainer}
                    >
                        <TouchableOpacity
                            onPress={() => handleSelect(day)}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={[
                                styles.checkboxContainer,
                                rContainerStyle,
                                { paddingRight: checked ? 12 : 20 }
                            ]}>
                                <Animated.Text style={[styles.label, rTextStyle]}>
                                    {day}
                                </Animated.Text>
                                {checked && (
                                    <Animated.View
                                        style={{ marginLeft: 8 }}
                                        layout={Layout}
                                        entering={LayoutEntering}
                                        exiting={LayoutExiting}
                                    >
                                        <Check size={18} color={activeColor} />
                                    </Animated.View>
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'flex-start',
    },
    itemContainer: {
        flexShrink: 0,
    },
    checkboxContainer: {
        alignItems: 'center',
        borderRadius: 36,
        borderWidth: 1,
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
