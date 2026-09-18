import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    WithTimingConfig,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WipeTransitionProps {
    children: React.ReactNode;
    isVisible: boolean;
    zIndex?: number;
    style?: ViewStyle;
}

export function WipeTransition({ children, isVisible, zIndex = 1, style }: WipeTransitionProps) {
    // Start off-screen to the right (SCREEN_WIDTH)
    // If visible, slide to 0
    const translateX = useSharedValue(isVisible ? 0 : SCREEN_WIDTH);
    const opacity = useSharedValue(isVisible ? 1 : 0);

    useEffect(() => {
        const config: WithTimingConfig = {
            duration: 500, // Cinematic speed
            easing: Easing.out(Easing.cubic), // Smooth deceleration
        };

        if (isVisible) {
            translateX.value = withTiming(0, config);
            opacity.value = withTiming(1, config);
        } else {
            // If hiding, slide back out to the right (or left if we wanted a full stack flow, 
            // but for "wipe left" usually we just reverse or keep it there if covered)
            // For now, let's slide it out to the right if it becomes invisible
            translateX.value = withTiming(SCREEN_WIDTH, config);
            opacity.value = withTiming(0, config);
        }
    }, [isVisible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
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
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill, // Cover the entire screen
        backgroundColor: 'white', // Ensure opaque background for the "wipe" effect
        shadowColor: '#000',
        shadowOffset: { width: -5, height: 0 }, // Shadow on the left edge for depth
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
});
