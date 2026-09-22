import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    Easing,
} from 'react-native-reanimated';

interface FadeTransitionProps {
    children: React.ReactNode;
    isVisible: boolean;
    duration?: number;
    style?: ViewStyle;
    zIndex?: number;
}

export function FadeTransition({
    children,
    isVisible,
    duration = 200,
    style,
    zIndex = 1
}: FadeTransitionProps) {
    const opacity = useSharedValue(isVisible ? 1 : 0);
    // Fully unmount hidden screens once their fade-out finishes — relying on
    // pointerEvents/CSS alone let invisible screens keep intercepting taps on web.
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            // Enter fast
            opacity.value = withTiming(1, {
                duration: duration,
                easing: Easing.inOut(Easing.ease),
            });
        } else {
            // Exit slow to prevent background bleed
            opacity.value = withTiming(0, {
                duration: duration * 3,
                easing: Easing.inOut(Easing.ease),
            }, (finished) => {
                if (finished) runOnJS(setShouldRender)(false);
            });
        }
    }, [isVisible, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (!shouldRender) return null;

    return (
        <View style={[styles.container, { zIndex }]} pointerEvents={isVisible ? 'auto' : 'none'}>
            <Animated.View style={[styles.container, animatedStyle, style]}>
                {children}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        // We don't enforce background color here to allow transparency if needed,
        // but usually the child screen should have a background.
    },
});
