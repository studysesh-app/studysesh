import React, { useState } from 'react';
import { StyleSheet, ViewStyle, GestureResponderEvent, Pressable, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface AnimatedCardProps {
    onPress: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
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
        scale.value = withTiming(8, { duration: 800 }); // Larger scale for cards
        opacity.value = withTiming(0, { duration: 800 }, (finished) => {
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
                    left: x - 100, // Center the 200x200 ripple
                    top: y - 100,
                    backgroundColor: color,
                },
                rStyle,
            ]}
            pointerEvents="none"
        />
    );
}

export function AnimatedCard({ onPress, children, style }: AnimatedCardProps) {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const scale = useSharedValue(1);

    // Red ripple for white cards
    const rippleColor = 'rgba(219, 35, 33, 0.4)';

    const handlePressIn = (event: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });

        const { locationX, locationY } = event.nativeEvent;
        setRipples(prev => [...prev, { id: Date.now(), x: locationX, y: locationY }]);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        setTimeout(() => {
            onPress();
        }, 170); // 170ms delay matching AnimatedButton
    };

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.wrapper, style, animatedContainerStyle]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                style={styles.pressable}
            >
                <LinearGradient
                    colors={['#ffffff', '#f5f5f5', '#e8e8e8']}
                    style={styles.card}
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
                    <View style={styles.content}>
                        {children}
                    </View>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        maxWidth: 400,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 25,
        elevation: 10,
    },
    pressable: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    card: {
        borderRadius: 16,
        borderWidth: 2,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderTopColor: 'rgba(255, 255, 255, 0.9)',
        borderLeftColor: 'rgba(255, 255, 255, 0.7)',
        borderRightColor: 'rgba(0, 0, 0, 0.08)',
        borderBottomColor: 'rgba(0, 0, 0, 0.15)',
        position: 'relative',
    },
    content: {
        zIndex: 1, // Ensure content is above ripples
    },
    ripple: {
        position: 'absolute',
        width: 200, // Larger ripple for cards
        height: 200,
        borderRadius: 100,
        zIndex: 0,
    },
});
