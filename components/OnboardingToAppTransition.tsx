import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface OnboardingToAppTransitionProps {
    children: React.ReactNode;
    show: boolean;
}

const GL_EASING = Easing.bezier(0.16, 1, 0.3, 1);

export function OnboardingToAppTransition({ children, show }: OnboardingToAppTransitionProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Shared values for animations
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
        if (show) {
            setIsMounted(true);

            // Opacity: 0 -> 1 (0.8s)
            opacity.value = withTiming(1, {
                duration: 800,
                easing: GL_EASING,
            });

            // Scale: 0.8 -> 1 (1.2s)
            scale.value = withTiming(1, {
                duration: 1200,
                easing: GL_EASING,
            });
        }
    }, [show]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    if (!show && !isMounted) return null;

    return (
        <View style={styles.container}>
            {/* Main App Content */}
            <Animated.View style={[styles.content, containerStyle]}>
                {children}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Ensure background is white during transition
    },
    content: {
        flex: 1,
    },
});
