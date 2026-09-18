import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
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

    useEffect(() => {
        if (isVisible) {
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
            });
        }
    }, [isVisible, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                { zIndex },
                animatedStyle,
                style
            ]}
            pointerEvents={isVisible ? 'auto' : 'none'}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        // We don't enforce background color here to allow transparency if needed,
        // but usually the child screen should have a background.
    },
});
