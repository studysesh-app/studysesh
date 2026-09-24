import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface Ripple {
    id: number;
    x: number;
    y: number;
}

interface RippleBackgroundProps {
    children: React.ReactNode;
    style?: any;
}

function RippleView({ x, y, onFinish }: { x: number; y: number; onFinish: () => void }) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0.3);

    React.useEffect(() => {
        scale.value = withTiming(20, { duration: 1000 });
        opacity.value = withTiming(0, { duration: 1000 }, (finished) => {
            if (finished) {
                runOnJS(onFinish)();
            }
        });
    }, []);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            left: x - 50,
            top: y - 50,
        };
    });

    return (
        <Animated.View
            style={[
                styles.ripple,
                rStyle,
            ]}
            pointerEvents="none"
        />
    );
}

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

// ... existing imports ...

export function RippleBackground({ children, style }: RippleBackgroundProps) {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const insets = useSafeAreaInsets();
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

    const addRipple = useCallback((x: number, y: number) => {
        // Create a cascading haptic pattern that mimics the ripple spreading
        // Start with a strong impact, then lighter pulses to simulate spreading
        const triggerRippleHaptics = async () => {
            // Initial strong impact
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            // First wave - medium intensity
            setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }, 100);

            // Second wave - light intensity
            setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }, 200);

            // Final subtle pulse
            setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }, 350);
        };

        triggerRippleHaptics();
        setRipples((prev) => [...prev, { id: Date.now(), x, y }]);
    }, []);

    const removeRipple = useCallback((id: number) => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const tap = Gesture.Tap()
        .onBegin((event) => {
            runOnJS(addRipple)(event.x, event.y);
        })
        .maxDuration(100000); // Allow long presses to still trigger ripples

    const background = (
        <LinearGradient
            colors={['#db2321', '#a01a18']}
            style={{
                position: 'absolute',
                top: -insets.top,
                left: -insets.left,
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
            }}
        />
    );

    // On web, GestureHandlerRootView's global pointer capture silently eats
    // clicks meant for plain TouchableOpacity children nested inside it, so
    // skip the decorative ripple gesture layer there entirely.
    if (Platform.OS === 'web') {
        return (
            <View style={{ flex: 1 }}>
                <View style={StyleSheet.absoluteFill}>{background}</View>
                <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]} pointerEvents="box-none">
                    {children}
                </View>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {/* Background Layer with Gesture Detection */}
                <GestureDetector gesture={tap}>
                    <Animated.View style={StyleSheet.absoluteFill}>
                        {background}
                        {ripples.map((r) => (
                            <RippleView key={r.id} x={r.x} y={r.y} onFinish={() => removeRipple(r.id)} />
                        ))}
                    </Animated.View>
                </GestureDetector>

                {/* Content Layer - allows touches to pass through to background if not handled by children */}
                <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]} pointerEvents="box-none">
                    {children}
                </View>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    ripple: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        zIndex: 0,
    },
});
