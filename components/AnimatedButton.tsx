import React, { useState, useRef } from 'react';
import { Text, StyleSheet, ViewStyle, GestureResponderEvent, Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface AnimatedButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary'; // primary = white (Get Started), secondary = red (Continue)
    containerStyle?: ViewStyle;
}

interface Ripple {
    id: number;
    x: number;
    y: number;
}

function RippleEffect({ x, y, color, onFinish }: { x: number; y: number; color: string; onFinish: () => void }) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0.5);

    React.useEffect(() => {
        scale.value = withTiming(4, { duration: 600 });
        opacity.value = withTiming(0, { duration: 600 }, (finished) => {
            if (finished) {
                runOnJS(onFinish)();
            }
        });
    }, []);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            style={[
                styles.ripple,
                {
                    left: x - 50, // Center the 100x100 ripple
                    top: y - 50,
                    backgroundColor: color,
                },
                rStyle,
            ]}
            pointerEvents="none"
        />
    );
}

export function AnimatedButton({ onPress, title, variant = 'primary', containerStyle }: AnimatedButtonProps) {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const scale = useSharedValue(1);

    // Configuration based on variant
    // Primary (Get Started) = White button, Red Text, Red Ripple
    // Secondary (Continue) = Red button, White Text, White Ripple
    const isPrimary = variant === 'primary';

    const rippleColor = isPrimary ? 'rgba(219, 35, 33, 0.4)' : 'rgba(255, 255, 255, 0.3)';
    const gradientColors = isPrimary
        ? ['#ffffff', '#f0f0f0', '#dcdcdc'] as const
        : ['#ff5e5b', '#db2321', '#8a1c1b'] as const; // Richer red gradient

    const textColor = isPrimary ? '#db2321' : '#ffffff';
    const borderColor = isPrimary ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';

    const handlePressIn = (event: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });

        const { locationX, locationY } = event.nativeEvent;
        setRipples(prev => [...prev, { id: Date.now(), x: locationX, y: locationY }]);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        // No immediate action here, we handle the action in onPress with delay
    };

    const handlePress = () => {
        // Trigger the action after a delay to allow animation to be seen
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        setTimeout(() => {
            onPress();
        }, 170); // 300ms delay for visibility
    };

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[containerStyle, animatedContainerStyle]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                style={styles.buttonContainer}
            >
                <LinearGradient
                    colors={gradientColors}
                    style={[
                        styles.gradient,
                        { borderColor: borderColor }
                    ]}
                >
                    {ripples.map(r => (
                        <RippleEffect
                            key={r.id}
                            x={r.x}
                            y={r.y}
                            color={rippleColor}
                            onFinish={() => setRipples(prev => prev.filter(item => item.id !== r.id))}
                        />
                    ))}
                    <Text style={[styles.text, { color: textColor }]}>
                        {title}
                    </Text>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: 9999,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    gradient: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        borderWidth: 2,
        position: 'relative', // Needed for absolute positioning of ripples
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        zIndex: 1, // Ensure text is above ripples
    },
    ripple: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        zIndex: 0,
    },
});
