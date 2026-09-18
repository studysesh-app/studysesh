import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useColorScheme, Dimensions, DimensionValue, Platform } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    interpolate,
    Extrapolation,
    runOnJS,
    SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const ITEM_HEIGHT = 32;
const VISIBLE_ITEMS = 5;

interface WheelPickerProps {
    items: (string | number)[];
    value: string | number;
    onChange: (value: string | number) => void;
    hasDivider?: boolean;
}

function WheelPicker({ items, value, onChange, hasDivider = false }: WheelPickerProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const scrollY = useSharedValue(0);
    const isScrolling = useSharedValue(false);

    // Calculate initial index
    const initialIndex = items.indexOf(value);
    const safeInitialIndex = initialIndex !== -1 ? initialIndex : 0;

    // Initialize scroll position
    useEffect(() => {
        scrollY.value = safeInitialIndex * ITEM_HEIGHT;
    }, []);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
        onBeginDrag: () => {
            isScrolling.value = true;
        },
        onMomentumEnd: (event) => {
            isScrolling.value = false;
            const index = Math.round(event.contentOffset.y / ITEM_HEIGHT);
            if (index >= 0 && index < items.length) {
                runOnJS(onChange)(items[index]);
            }
        },
    });

    return (
        <View style={[styles.columnContainer, hasDivider && styles.divider]}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingVertical: ITEM_HEIGHT * 2, // 2 items padding top/bottom to center the first/last item
                }}
                contentOffset={{ x: 0, y: safeInitialIndex * ITEM_HEIGHT }}
            >
                {items.map((item, index) => {
                    return (
                        <PickerItem
                            key={index}
                            item={item}
                            index={index}
                            scrollY={scrollY}
                            isDark={isDark}
                        />
                    );
                })}
            </Animated.ScrollView>
        </View>
    );
}

interface PickerItemProps {
    item: string | number;
    index: number;
    scrollY: SharedValue<number>;
    isDark: boolean;
}

function PickerItem({ item, index, scrollY, isDark }: PickerItemProps) {
    const rStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 2) * ITEM_HEIGHT,
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
            (index + 2) * ITEM_HEIGHT,
        ];

        const scale = interpolate(
            scrollY.value,
            inputRange,
            [0.7, 0.85, 1.0, 0.85, 0.7],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollY.value,
            inputRange,
            [0.3, 0.7, 1.0, 0.7, 0.3],
            Extrapolation.CLAMP
        );

        const rotateX = interpolate(
            scrollY.value,
            inputRange,
            [25, 15, 0, -15, -25],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { scale },
                { perspective: 1000 },
                { rotateX: `${rotateX}deg` },
            ],
            opacity,
        };
    });

    // Check if selected for font weight
    const isSelected = useAnimatedStyle(() => {
        const diff = Math.abs(scrollY.value - index * ITEM_HEIGHT);
        return {
            fontWeight: diff < ITEM_HEIGHT / 2 ? '600' : '400',
        };
    });

    return (
        <Animated.View style={[styles.item, rStyle]}>
            <Animated.Text style={[
                styles.itemText,
                { color: isDark ? '#ffffff' : '#000000' },
                isSelected
            ]}>
                {item}
            </Animated.Text>
        </Animated.View>
    );
}

interface IOSTimePickerProps {
    value: string; // "HH:MM AM/PM" or "HH:MM" (24h)
    onChange: (value: string) => void;
}

export function IOSTimePicker({ value, onChange }: IOSTimePickerProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [hours24, minutes] = value.split(':').map(Number);

    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hour12 = hours24 % 12 || 12;
    const minuteStr = String(minutes).padStart(2, '0');

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const mins = ['00', '15', '30', '45'];
    const periods = ['AM', 'PM'];

    const handleChange = (type: 'hour' | 'minute' | 'period', newVal: string | number) => {
        let newH = hour12;
        let newM = minuteStr;
        let newP = period;

        if (type === 'hour') newH = Number(newVal);
        if (type === 'minute') newM = String(newVal);
        if (type === 'period') newP = String(newVal);

        // Convert back to 24h
        let h24 = newH;
        if (newP === 'PM' && newH !== 12) h24 += 12;
        if (newP === 'AM' && newH === 12) h24 = 0;

        const timeStr = `${String(h24).padStart(2, '0')}:${newM}`;
        onChange(timeStr);
    };

    return (
        <View style={styles.wrapper}>
            <BlurView
                intensity={20}
                tint={isDark ? 'dark' : 'light'}
                style={styles.container}
            >
                <View style={[
                    styles.innerContainer,
                    {
                        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.6)' : 'rgba(242, 242, 247, 0.6)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                    }
                ]}>
                    <WheelPicker
                        items={hours}
                        value={hour12}
                        onChange={(v) => handleChange('hour', v)}
                        hasDivider
                    />
                    <WheelPicker
                        items={mins}
                        value={minuteStr}
                        onChange={(v) => handleChange('minute', v)}
                        hasDivider
                    />
                    <WheelPicker
                        items={periods}
                        value={period}
                        onChange={(v) => handleChange('period', v)}
                    />

                    {/* Selection Indicator */}
                    <View style={[
                        styles.selectionIndicator,
                        {
                            borderColor: isDark ? 'rgba(84, 84, 88, 0.65)' : 'rgba(60, 60, 67, 0.29)',
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                        }
                    ]} pointerEvents="none" />

                    {/* Gradients */}
                    <LinearGradient
                        colors={isDark
                            ? ['rgba(28, 28, 30, 1)', 'rgba(28, 28, 30, 0)']
                            : ['rgba(242, 242, 247, 1)', 'rgba(242, 242, 247, 0)']}
                        style={styles.topGradient}
                        pointerEvents="none"
                    />
                    <LinearGradient
                        colors={isDark
                            ? ['rgba(28, 28, 30, 0)', 'rgba(28, 28, 30, 1)']
                            : ['rgba(242, 242, 247, 0)', 'rgba(242, 242, 247, 1)']}
                        style={styles.bottomGradient}
                        pointerEvents="none"
                    />
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        // Inset shadow simulation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    container: {
        height: ITEM_HEIGHT * 5,
        width: '100%',
    },
    innerContainer: {
        flexDirection: 'row',
        height: '100%',
        borderWidth: 1,
        borderRadius: 12,
    },
    columnContainer: {
        flex: 1,
        height: '100%',
        overflow: 'hidden',
    },
    divider: {
        borderRightWidth: 1,
        borderRightColor: 'rgba(128, 128, 128, 0.1)',
    },
    item: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 18,
        fontVariant: ['tabular-nums'],
    },
    selectionIndicator: {
        position: 'absolute',
        top: ITEM_HEIGHT * 2,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        zIndex: 10,
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT * 2,
        zIndex: 20,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT * 2,
        zIndex: 20,
    },
});
