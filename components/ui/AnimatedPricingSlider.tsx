import React, { useMemo } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';

interface AnimatedPricingSliderProps {
    min: number;
    max: number;
    step?: number;
    value: number;
    onValueChange: (value: number) => void;
    width?: number;
    color?: string;
    isDarkMode?: boolean;
}

const PICKER_SIZE = 35;
const SLIDER_HEIGHT = 6;

export function AnimatedPricingSlider({
    min,
    max,
    step = 1,
    value,
    onValueChange,
    width = 300,
    color = '#db2321', // Default red
    isDarkMode = false,
}: AnimatedPricingSliderProps) {
    // Shared values
    const sliderWidth = useSharedValue(width);
    const isDragging = useSharedValue(false);

    // Calculate initial progress based on value
    const initialProgress = (value - min) / (max - min);
    const translateX = useSharedValue(0);
    const contextX = useSharedValue(0);
    const scale = useSharedValue(1);

    // Update translateX when value changes externally (only if not dragging)
    useAnimatedReaction(
        () => value,
        (currentValue) => {
            if (!isDragging.value) {
                const progress = (currentValue - min) / (max - min);
                translateX.value = withSpring(progress * sliderWidth.value, { damping: 20, stiffness: 200 });
            }
        },
        [min, max, value] // Dependencies
    );

    // Update slider width if container changes (though we pass width prop usually)
    const onLayout = (event: LayoutChangeEvent) => {
        sliderWidth.value = event.nativeEvent.layout.width;
        // Re-calculate position based on current value
        const progress = (value - min) / (max - min);
        translateX.value = progress * event.nativeEvent.layout.width;
    };

    const clampedTranslateX = useDerivedValue(() => {
        return Math.min(Math.max(translateX.value, 0), sliderWidth.value);
    });

    useAnimatedReaction(
        () => clampedTranslateX.value,
        (translation) => {
            if (isDragging.value) {
                const rawProgress = translation / sliderWidth.value;
                const rawValue = min + rawProgress * (max - min);

                // Snap to step
                const steppedValue = Math.round(rawValue / step) * step;
                const clampedValue = Math.min(Math.max(steppedValue, min), max);

                runOnJS(onValueChange)(clampedValue);
            }
        }
    );

    const gesture = Gesture.Pan()
        .onBegin(() => {
            isDragging.value = true;
            scale.value = withSpring(1.2);
            contextX.value = clampedTranslateX.value;
        })
        .onUpdate((event) => {
            translateX.value = contextX.value + event.translationX;
        })
        .onFinalize(() => {
            isDragging.value = false;
            scale.value = withSpring(1);

            // Snap animation to the final step position
            const currentTranslation = clampedTranslateX.value;
            const rawProgress = currentTranslation / sliderWidth.value;
            const rawValue = min + rawProgress * (max - min);
            const steppedValue = Math.round(rawValue / step) * step;
            const finalProgress = (steppedValue - min) / (max - min);

            translateX.value = withSpring(finalProgress * sliderWidth.value);
        });

    const rPickerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: clampedTranslateX.value - PICKER_SIZE / 2 },
                { scale: scale.value },
            ],
        };
    });

    const rProgressBarStyle = useAnimatedStyle(() => {
        return {
            width: clampedTranslateX.value,
        };
    });

    return (
        <View
            onLayout={onLayout}
            style={{ height: 40, justifyContent: 'center', width: '100%' }}
        >
            <View
                style={{
                    height: SLIDER_HEIGHT,
                    backgroundColor: isDarkMode ? '#374151' : '#e5e7eb', // gray-700 in dark mode
                    borderRadius: SLIDER_HEIGHT / 2,
                    width: '100%',
                    overflow: 'visible',
                }}
            >
                <Animated.View
                    style={[
                        {
                            height: '100%',
                            backgroundColor: color,
                            borderRadius: SLIDER_HEIGHT / 2,
                            position: 'absolute',
                            left: 0,
                        },
                        rProgressBarStyle,
                    ]}
                />
                <GestureDetector gesture={gesture}>
                    <Animated.View
                        style={[
                            {
                                width: PICKER_SIZE,
                                height: PICKER_SIZE,
                                borderRadius: PICKER_SIZE / 2,
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: -PICKER_SIZE / 2 + SLIDER_HEIGHT / 2,
                                left: 0,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 4,
                                borderWidth: 4,
                                borderColor: color,
                            },
                            rPickerStyle,
                        ]}
                    />
                </GestureDetector>
            </View>
        </View>
    );
}
