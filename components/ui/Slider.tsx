import React, { useRef, useState, useEffect } from 'react';
import { View, PanResponder, PanResponderInstance, LayoutChangeEvent, Dimensions } from 'react-native';

interface SliderProps {
    min: number;
    max: number;
    step?: number;
    value: number;
    onValueChange: (value: number) => void;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
}

export function Slider({
    min,
    max,
    step = 1,
    value,
    onValueChange,
    minimumTrackTintColor = '#db2321',
    maximumTrackTintColor = '#e5e7eb',
    thumbTintColor = '#db2321'
}: SliderProps) {
    const [containerWidth, setContainerWidth] = useState(0);
    const [thumbX, setThumbX] = useState(0);
    const panResponder = useRef<PanResponderInstance>(null);

    // Update thumb position when value or width changes
    useEffect(() => {
        if (containerWidth > 0) {
            const percentage = (value - min) / (max - min);
            setThumbX(percentage * containerWidth);
        }
    }, [value, containerWidth, min, max]);

    const handlePan = (_: any, gestureState: any) => {
        if (containerWidth === 0) return;

        // Calculate new value based on gesture
        // We need to know the start position. 
        // A simpler way is to just use moveX and subtract the container's absolute x, but getting absolute x is async.
        // Instead, let's accumulate dx.

        // Actually, let's just use the current thumbX + dx, but we need to be careful not to drift.
        // Better: calculate value from position.
    };

    // Let's use a simpler PanResponder that updates value directly
    const pan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            // Optional: visual feedback
        },
        onPanResponderMove: (_, gestureState) => {
            if (containerWidth === 0) return;

            // We need the initial position of the thumb or the touch.
            // This is getting complicated to do perfectly without Reanimated.
            // Let's try a different approach: Just use the locationX from the event if possible?
            // No, PanResponderMove gives accumulated distance.

            // Let's assume the user taps/drags relative to the container.
            // But we don't have the container's absolute position easily.

            // Alternative: Just use simple buttons for now if Slider is too hard to get right quickly?
            // User said "replace with sliders".

            // Let's try a simple implementation:
            // We track the *change* in value.

            const dx = gestureState.dx;
            // But dx is cumulative from start of gesture.
            // We need to know the value at start of gesture.
        },
        onPanResponderRelease: () => {
            // Snap to step?
        }
    })).current;

    // Let's try a different implementation that is robust enough.
    // We will store the initial value on grant.
    const initialValueRef = useRef(value);

    const robustPan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            initialValueRef.current = value;
        },
        onPanResponderMove: (_, gestureState) => {
            if (containerWidth === 0) return;

            const dx = gestureState.dx;
            const deltaValue = (dx / containerWidth) * (max - min);
            let newValue = initialValueRef.current + deltaValue;

            // Clamp
            newValue = Math.max(min, Math.min(max, newValue));

            // Step
            if (step) {
                newValue = Math.round(newValue / step) * step;
            }

            if (newValue !== value) {
                onValueChange(newValue);
            }
        }
    })).current;

    return (
        <View
            className="h-10 justify-center"
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {/* Track */}
            <View className="h-2 rounded-full bg-gray-200 overflow-hidden relative">
                <View
                    style={{
                        width: `${((value - min) / (max - min)) * 100}%`,
                        backgroundColor: minimumTrackTintColor
                    }}
                    className="h-full"
                />
            </View>

            {/* Thumb */}
            <View
                {...robustPan.panHandlers}
                style={{
                    position: 'absolute',
                    left: thumbX - 12, // Center thumb (width 24)
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: 'white',
                    borderWidth: 2,
                    borderColor: thumbTintColor,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
            />
        </View>
    );
}
