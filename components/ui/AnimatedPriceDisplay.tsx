import React, { useMemo } from 'react';
import { StyleSheet, Text, View, StyleProp, TextStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
    withTiming,
    SharedValue,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

const TEXT_DIGIT_HEIGHT = 40;
const TEXT_DIGIT_WIDTH = 24;

interface AnimatedDigitProps {
    index: number;
    count: SharedValue<number>;
    height: number;
    width: number;
    textStyle: StyleProp<TextStyle>;
    maxDigits: number;
}

const getDigitByIndex = (digitIndex: number, count: number, maxDigits: number) => {
    'worklet';
    const paddedValue = Math.round(count).toString().padStart(maxDigits, '0');
    return parseInt(paddedValue.split('')[maxDigits - 1 - digitIndex] ?? '0', 10);
};

const AnimatedDigit = React.memo(({ height, width, textStyle, index, count, maxDigits }: AnimatedDigitProps) => {
    const digit = useDerivedValue(() => {
        return getDigitByIndex(index, count.value, maxDigits);
    }, [index, maxDigits]);

    // Calculate if this digit is a leading zero that should be hidden
    const isLeadingZero = useDerivedValue(() => {
        const numString = Math.round(count.value).toString();
        const activeDigits = numString.length;
        // index 0 is the ones place, index 1 is tens place, etc.
        // If maxDigits is 2, index 0 is ones, index 1 is tens.
        // If number is 5 (length 1), index 1 is a leading zero.
        return index >= activeDigits;
    }, [maxDigits]);

    const rTextStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: withSpring(-height * digit.value, {
                        damping: 20,
                        stiffness: 200,
                    }),
                },
            ],
        };
    });

    const rContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isLeadingZero.value ? 0 : 1, { duration: 200 }),
            width: withTiming(isLeadingZero.value ? 0 : width, { duration: 200 }),
            transform: [
                { scale: withTiming(isLeadingZero.value ? 0 : 1, { duration: 200 }) }
            ]
        };
    });

    const flattenedTextStyle = useMemo(() => StyleSheet.flatten(textStyle), [textStyle]);

    return (
        <Animated.View style={[{ height, overflow: 'hidden' }, rContainerStyle]}>
            <Animated.View style={rTextStyle}>
                {new Array(10).fill(0).map((_, i) => (
                    <Text
                        key={i}
                        style={[
                            flattenedTextStyle,
                            {
                                height,
                                width,
                                textAlign: 'center',
                                textAlignVertical: 'center',
                                lineHeight: height, // Ensure vertical centering
                            },
                        ]}
                    >
                        {i}
                    </Text>
                ))}
            </Animated.View>
        </Animated.View>
    );
});

interface AnimatedPriceDisplayProps {
    value: number;
    maxDigits?: number;
    color?: string;
    fontSize?: number;
}

export function AnimatedPriceDisplay({
    value,
    maxDigits = 2,
    color = '#000',
    fontSize = 30,
}: AnimatedPriceDisplayProps) {
    // Convert prop to shared value for animation
    const count = useDerivedValue(() => {
        return value;
    }, [value]);

    const digitHeight = fontSize * 1.2;
    const digitWidth = fontSize * 0.6;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize, color, fontWeight: 'bold', marginRight: 2 }}>$</Text>

            <View style={{ flexDirection: 'row-reverse' }}>
                {new Array(maxDigits).fill(0).map((_, index) => (
                    <AnimatedDigit
                        key={index}
                        index={index}
                        count={count}
                        maxDigits={maxDigits}
                        height={digitHeight}
                        width={digitWidth}
                        textStyle={{
                            fontSize,
                            color,
                            fontWeight: 'bold',
                        }}
                    />
                ))}
            </View>

            <Text style={{ fontSize, color, fontWeight: 'bold' }}>.00</Text>
        </View>
    );
}
