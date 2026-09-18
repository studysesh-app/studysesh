import React, { useEffect, useMemo, useState, createContext, useContext } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    useAnimatedReaction,
    SharedValue,
    runOnUI,
    runOnJS,
    useDerivedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { TutorCard } from './TutorCard';
import * as Haptics from 'expo-haptics';

// Get window dimensions - use 'window' to get the actual usable area (accounts for SafeAreaView)
// This will be the size of our container
const getDimensions = () => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
};

// Get screen dimensions - full screen including safe areas
const getScreenDimensions = () => {
    const { width, height } = Dimensions.get('screen');
    return { width, height };
};

interface FloatingCard {
    id: number;
    x: SharedValue<number>;
    y: SharedValue<number>;
    rotation: SharedValue<number>;
    vx: SharedValue<number>;
    vy: SharedValue<number>;
    tutorData: {
        name: string;
        courses: string[];
        pronouns: string;
        groupPrice: string | null;
        individualPrice: string | null;
        location: string[];
        nextAvailable: string;
    };
}

interface ZeroGravityTutorCardsProps {
    children: React.ReactNode;
    style?: any;
}

// Context to provide card overlap state to children
const CardOverlapContext = createContext<{ hasOverlap: boolean }>({ hasOverlap: false });
export const useCardOverlap = () => useContext(CardOverlapContext);

// 📝 CARD DETAILS: Edit the tutor cards here!
// Add/remove/modify tutor data in this array
const SAMPLE_TUTORS = [
    { id: 't1', name: 'Alex Chen', courses: ['ECOR 1031', 'ECOR 1032'], pronouns: 'they/them', groupPrice: '5', individualPrice: '20', location: ['online', 'Campus'], nextAvailable: 'Tomorrow 2pm' },
    { id: 't2', name: 'Sarah Johnson', courses: ['PHYS 2202', 'CHEM 2103'], pronouns: 'she/her', groupPrice: '3', individualPrice: null, location: ['online'], nextAvailable: '3:30 PM' },
    { id: 't3', name: 'Jaylen Davis', courses: ['MATH 1104', 'MATH 1004'], pronouns: 'he/him', groupPrice: null, individualPrice: '25', location: ['online', 'Campus'], nextAvailable: '1:00 PM' },
    { id: 't4', name: 'Emma Liu', courses: ['COMP 1805', 'COMP 2804'], pronouns: 'she/her', groupPrice: '6', individualPrice: '15', location: ['online'], nextAvailable: 'Wednesday 4pm' },
    { id: 't5', name: 'Jordan Lee', courses: ['SYSC 2006', 'SYSC 2310'], pronouns: 'they/them', groupPrice: '5', individualPrice: null, location: ['online'], nextAvailable: '5:00 PM' },
    { id: 't6', name: 'Riya Jain', courses: ['BUSI 1005', 'STAT 2601'], pronouns: 'he/him', groupPrice: '7', individualPrice: '22', location: ['Campus'], nextAvailable: 'Tomorrow 10am' },
    { id: 't7', name: 'Mahad Qureshi', courses: ['ECON 1001', 'ECON 1002'], pronouns: 'she/her', groupPrice: null, individualPrice: '18', location: ['online', 'Campus'], nextAvailable: '3:00 PM' },
    { id: 't8', name: 'Casey Flanders', courses: ['COMP 1405', 'COMP 1406'], pronouns: 'they/them', groupPrice: '8', individualPrice: '24', location: ['Campus'], nextAvailable: '4:30 PM' },
];

// Use a scale factor to make cards smaller while maintaining exact proportions
const CARD_SCALE = 0.65; // 65% of original size
const BASE_CARD_WIDTH = 350; // Approximate full-width card size
const CARD_WIDTH = BASE_CARD_WIDTH * CARD_SCALE; // Scaled width

function FloatingTutorCard({ card, containerWidth, containerHeight }: { card: FloatingCard; containerWidth: number; containerHeight: number }) {
    const isDragging = useSharedValue(false);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const offsetRotation = useSharedValue(0);
    const timer = useSharedValue(0);

    // Track previous collision state to prevent repeated haptics
    const wasAtLeftEdge = useSharedValue(false);
    const wasAtRightEdge = useSharedValue(false);
    const wasAtTopEdge = useSharedValue(false);
    const wasAtBottomEdge = useSharedValue(false);

    // Haptic feedback functions
    const triggerPickupHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const triggerBounceHaptic = (velocity: number) => {
        // Variable intensity based on bounce strength for smoother feel
        const speed = Math.abs(velocity);
        if (speed > 15) {
            // Hard bounce - strong haptic
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (speed > 8) {
            // Medium bounce
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (speed > 3) {
            // Soft bounce
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        // Below 3: no haptic (too gentle)
    };

    const triggerDragEdgeHaptic = () => {
        // Stronger haptic for manual edge hits
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    };

    const triggerReleaseHaptic = (velocityX: number, velocityY: number) => {
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        if (speed > 800) {
            // Strong throw - add a satisfying "whoosh" feeling
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (speed > 300) {
            // Medium throw
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (speed > 50) {
            // Gentle release
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    // Physics update loop using timer
    useEffect(() => {
        const interval = setInterval(() => {
            timer.value = timer.value + 1;
        }, 32); // ~30fps to reduce lag
        return () => clearInterval(interval);
    }, []);

    // Update physics when timer changes and not dragging
    useAnimatedReaction(
        () => timer.value,
        () => {
            'worklet';
            if (!isDragging.value) {
                // ⚙️ FRICTION SETTING: Controls how fast cards slow down when floating
                // Lower value = more friction (slower), Higher value = less friction (faster)
                // Current: 0.98 means cards lose 2% of velocity per frame
                const friction = 0.98; // Reduced friction for more movement

                // Apply friction to velocity
                card.vx.value *= friction;
                card.vy.value *= friction;

                // Update position
                card.x.value += card.vx.value;
                card.y.value += card.vy.value;

                // Calculate actual scaled card dimensions
                const scaledCardWidth = BASE_CARD_WIDTH * CARD_SCALE;
                const estimatedCardHeight = BASE_CARD_WIDTH * 0.85 * CARD_SCALE;

                // Cards are positioned relative to container
                const minX = 0; // Left edge of container
                const maxX = containerWidth - scaledCardWidth; // Right edge accounting for card width
                const minY = -50; // Allow floating slightly off-screen at top  
                // For bottom, use a smaller height estimate to allow cards closer to bottom
                // The actual card height might be smaller than estimated
                // BOTTOM BOUNDARY: Increase this number to raise cards up, decrease to let them go lower
                const maxY = containerHeight - (estimatedCardHeight * 0.95); // Adjusted to be slightly lower than before

                // Bounce off walls with damping - allow cards to reach very edges
                // Left edge: x can be negative (accounting for safe area)
                const atLeftEdge = card.x.value <= minX;
                if (atLeftEdge) {
                    card.x.value = minX;
                    const bounceVelocity = Math.abs(card.vx.value);
                    card.vx.value *= -0.7;
                    // Trigger haptic on bounce (when NOT dragging)
                    if (!wasAtLeftEdge.value && !isDragging.value) {
                        runOnJS(triggerBounceHaptic)(bounceVelocity);
                    }
                }
                wasAtLeftEdge.value = atLeftEdge;

                // Right edge: x can reach beyond screen width (accounting for safe area)
                const atRightEdge = card.x.value >= maxX;
                if (atRightEdge) {
                    card.x.value = maxX;
                    const bounceVelocity = Math.abs(card.vx.value);
                    card.vx.value *= -0.7;
                    // Trigger haptic on bounce (when NOT dragging)
                    if (!wasAtRightEdge.value && !isDragging.value) {
                        runOnJS(triggerBounceHaptic)(bounceVelocity);
                    }
                }
                wasAtRightEdge.value = atRightEdge;

                // Top edge: y can be negative (accounting for safe area)
                const atTopEdge = card.y.value <= minY;
                if (atTopEdge) {
                    card.y.value = minY;
                    const bounceVelocity = Math.abs(card.vy.value);
                    card.vy.value *= -0.7;
                    // Trigger haptic on bounce (when NOT dragging)
                    if (!wasAtTopEdge.value && !isDragging.value) {
                        runOnJS(triggerBounceHaptic)(bounceVelocity);
                    }
                }
                wasAtTopEdge.value = atTopEdge;

                // Bottom edge: y can reach beyond screen height (accounting for safe area)
                const atBottomEdge = card.y.value >= maxY;
                if (atBottomEdge) {
                    card.y.value = maxY;
                    const bounceVelocity = Math.abs(card.vy.value);
                    card.vy.value *= -0.7;
                    // Trigger haptic on bounce (when NOT dragging)
                    if (!wasAtBottomEdge.value && !isDragging.value) {
                        runOnJS(triggerBounceHaptic)(bounceVelocity);
                    }
                }
                wasAtBottomEdge.value = atBottomEdge;

                // Stop if velocity is very small
                if (Math.abs(card.vx.value) < 0.1) card.vx.value = 0;
                if (Math.abs(card.vy.value) < 0.1) card.vy.value = 0;
            }
        }
    );

    // Two-finger rotation gesture
    const rotation = Gesture.Rotation()
        .onStart(() => {
            isDragging.value = true;
            offsetRotation.value = card.rotation.value;
        })
        .onUpdate((event) => {
            // Convert rotation from radians to degrees and apply
            card.rotation.value = offsetRotation.value + (event.rotation * (180 / Math.PI));
        })
        .onEnd(() => {
            isDragging.value = false;
        });

    // Single-finger pan gesture for dragging
    const pan = Gesture.Pan()
        .onStart(() => {
            isDragging.value = true;
            offsetX.value = card.x.value;
            offsetY.value = card.y.value;
            offsetRotation.value = card.rotation.value;
            card.vx.value = 0;
            card.vy.value = 0;
            // Reset edge tracking when picking up card
            wasAtLeftEdge.value = false;
            wasAtRightEdge.value = false;
            wasAtTopEdge.value = false;
            wasAtBottomEdge.value = false;
            // Haptic feedback when picking up card
            runOnJS(triggerPickupHaptic)();
        })
        .onUpdate((event) => {
            // ⚙️ DRAG FRICTION: Controls resistance while dragging
            // Lower value = more friction (harder to drag), Higher value = less friction (easier to drag)
            // Current: 0.85 means drag movement is reduced by 15% (more friction)
            const dragFriction = 0.85; // Increased drag friction

            const scaledCardWidth = BASE_CARD_WIDTH * CARD_SCALE;
            const estimatedCardHeight = BASE_CARD_WIDTH * 0.85 * CARD_SCALE;

            // Cards are positioned relative to container
            const minX = 0; // Left edge of container
            const maxX = containerWidth - scaledCardWidth; // Right edge accounting for card width
            const minY = -50; // Allow floating slightly off-screen at top
            // For bottom, use a smaller height estimate to allow cards closer to bottom
            // BOTTOM BOUNDARY: Increase this number to raise cards up, decrease to let them go lower
            const maxY = containerHeight - (estimatedCardHeight * 0.95); // Adjusted to be slightly lower than before

            // Calculate new position with friction applied
            let newX = offsetX.value + event.translationX * dragFriction;
            let newY = offsetY.value + event.translationY * dragFriction;

            // Check if we're hitting edges BEFORE clamping
            const hitLeftEdge = newX <= minX && !wasAtLeftEdge.value;
            const hitRightEdge = newX >= maxX && !wasAtRightEdge.value;
            const hitTopEdge = newY <= minY && !wasAtTopEdge.value;
            const hitBottomEdge = newY >= maxY && !wasAtBottomEdge.value;

            // Trigger haptics for edge collisions
            if (hitLeftEdge || hitRightEdge || hitTopEdge || hitBottomEdge) {
                runOnJS(triggerDragEdgeHaptic)();
            }

            // Update edge tracking
            wasAtLeftEdge.value = newX <= minX;
            wasAtRightEdge.value = newX >= maxX;
            wasAtTopEdge.value = newY <= minY;
            wasAtBottomEdge.value = newY >= maxY;

            // Allow cards to reach ALL edges - clamp to boundaries accounting for safe area
            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));

            card.x.value = newX;
            card.y.value = newY;

            // Add rotation based on drag (only if single finger)
            if (event.numberOfPointers === 1) {
                card.rotation.value = offsetRotation.value + event.translationX * 0.1;
            }
        })
        .onEnd((event) => {
            isDragging.value = false;

            // ⚙️ THROW VELOCITY MULTIPLIER: Controls how fast cards fly when released
            // Lower value = weaker throws, Higher value = stronger throws
            // Current: 0.3 means throws are reduced to 30% of original velocity (more friction)
            const throwMultiplier = 0.3; // Reduced from 0.5 for more friction

            card.vx.value = event.velocityX * throwMultiplier;
            card.vy.value = event.velocityY * throwMultiplier;

            // Keep the rotation at the current angle instead of resetting
            // Add some rotation based on throw velocity for more dynamic movement
            const rotationFromVelocity = event.velocityX * 0.0005; // Small rotation based on throw speed
            card.rotation.value = card.rotation.value + rotationFromVelocity;

            // Haptic feedback when releasing card (intensity based on throw speed)
            runOnJS(triggerReleaseHaptic)(event.velocityX, event.velocityY);
        });

    // Combine pan and rotation gestures - allow both simultaneously
    const combinedGesture = Gesture.Simultaneous(pan, rotation);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            left: card.x.value,
            top: card.y.value,
            transform: [
                { rotate: `${card.rotation.value}deg` },
                { scale: CARD_SCALE }, // Scale to maintain exact proportions
            ],
            transformOrigin: 'top left', // Ensure scaling happens from top-left corner
            zIndex: isDragging.value ? 1000 : 1,
        };
    });

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View style={animatedStyle} collapsable={false}>
                <View style={{ width: BASE_CARD_WIDTH }}>
                    <TutorCard
                        name={card.tutorData.name}
                        courses={card.tutorData.courses}
                        pronouns={card.tutorData.pronouns}
                        groupPrice={card.tutorData.groupPrice}
                        individualPrice={card.tutorData.individualPrice}
                        location={card.tutorData.location}
                    />
                </View>
            </Animated.View>
        </GestureDetector>
    );
}

// Helper to generate evenly spaced positions at VERY top or VERY bottom with slight overlap
function getRandomPosition(index: number, containerWidth: number, containerHeight: number) {
    const scaledCardWidth = BASE_CARD_WIDTH * CARD_SCALE;
    const estimatedCardHeight = BASE_CARD_WIDTH * 0.85 * CARD_SCALE;

    // Split cards evenly: first half go to top, second half go to bottom
    const totalCards = 8; // SAMPLE_TUTORS.length
    const isTop = index < totalCards / 2;

    // Calculate X position: Evenly spread across the container
    // We want 4 columns: Left, Mid-Left, Mid-Right, Right
    const cardIndexInRow = isTop ? index : index - (totalCards / 2); // 0, 1, 2, 3

    // Spread width: slightly wider than screen to ensure edges are covered
    const spreadWidth = containerWidth * 1.1;
    const startX = (containerWidth - spreadWidth) / 2;
    const stepX = spreadWidth / 3; // Divide into 3 segments for 4 points (0, 1/3, 2/3, 1)

    // Base X position
    let x = startX + (cardIndexInRow * stepX);
    // Add slight random jitter to X so it's not a perfect grid
    x += (Math.random() * 30 - 15);

    // Y position: Structured "Bowl/Arch" layout
    // Outer cards (0 and 3) are closer to the screen edges (Top/Bottom)
    // Inner cards (1 and 2) are closer to the center text
    const isOuter = cardIndexInRow === 0 || cardIndexInRow === 3;

    // Boundaries
    // BOTTOM BOUNDARY: Increase this number to raise cards up, decrease to let them go lower
    const maxY = containerHeight - (estimatedCardHeight * 0.95);
    const minY = -50;

    // Layer Offset: How much closer to the center the inner cards are
    const layerOffset = 90;

    let y;
    if (isTop) {
        // Top Section
        // Outer (0,3) -> Higher (minY)
        // Inner (1,2) -> Lower (minY + offset)
        y = isOuter ? minY : minY + layerOffset;
        // Add slight random jitter
        y += (Math.random() * 30 - 15);
    } else {
        // Bottom Section
        // Outer (0,3) -> Lower (maxY)
        // Inner (1,2) -> Higher (maxY - offset)
        y = isOuter ? maxY : maxY - layerOffset;
        // Add slight random jitter
        y += (Math.random() * 30 - 15);
    }

    return { x, y };
}

export function ZeroGravityTutorCards({ children, style }: ZeroGravityTutorCardsProps) {
    // Get safe area insets to account for status bar, notch, etc.
    const insets = useSafeAreaInsets();

    // Get actual container dimensions (window size, which accounts for SafeAreaView)
    const { width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT } = getDimensions();

    // Get full screen dimensions for gradient
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getScreenDimensions();

    // Track if any card is overlapping the center text area
    const [hasCardOverlap, setHasCardOverlap] = useState(false);
    const isReady = useSharedValue(false);
    const previousOverlap = useSharedValue(false); // Track previous state on UI thread to reduce JS calls
    const updateCounter = useSharedValue(0); // Counter for throttling overlap checks

    // Mark as ready after a small delay to ensure cards are positioned
    useEffect(() => {
        const timer = setTimeout(() => {
            isReady.value = true;
        }, 500); // Increased delay to ensure initial positioning is complete
        return () => clearTimeout(timer);
    }, []);

    // Initialize all cards with shared values - must call hooks at top level
    const pos0 = getRandomPosition(0, CONTAINER_WIDTH, CONTAINER_HEIGHT);
    const pos1 = getRandomPosition(1, CONTAINER_WIDTH, CONTAINER_HEIGHT);
    const pos2 = getRandomPosition(2, CONTAINER_WIDTH, CONTAINER_HEIGHT);
    const pos3 = getRandomPosition(3, CONTAINER_WIDTH, CONTAINER_HEIGHT);
    const pos4 = getRandomPosition(4, CONTAINER_WIDTH, CONTAINER_HEIGHT);
    const pos5 = getRandomPosition(5, CONTAINER_WIDTH, CONTAINER_HEIGHT);
    const pos6 = getRandomPosition(6, CONTAINER_WIDTH, CONTAINER_HEIGHT);
    const pos7 = getRandomPosition(7, CONTAINER_WIDTH, CONTAINER_HEIGHT);

    const card0: FloatingCard = {
        id: 0,
        x: useSharedValue(pos0.x),
        y: useSharedValue(pos0.y),
        rotation: useSharedValue((Math.random() - 0.5) * 15),
        vx: useSharedValue((Math.random() - 0.5) * 6),
        vy: useSharedValue((Math.random() - 0.5) * 6),
        tutorData: SAMPLE_TUTORS[0],
    };

    const card1: FloatingCard = {
        id: 1,
        x: useSharedValue(pos1.x),
        y: useSharedValue(pos1.y),
        rotation: useSharedValue((Math.random() - 0.5) * 15),
        vx: useSharedValue((Math.random() - 0.5) * 1),
        vy: useSharedValue((Math.random() - 0.5) * 1),
        tutorData: SAMPLE_TUTORS[1],
    };

    const card2: FloatingCard = {
        id: 2,
        x: useSharedValue(pos2.x),
        y: useSharedValue(pos2.y),
        rotation: useSharedValue((Math.random() - 0.5) * 15),
        vx: useSharedValue((Math.random() - 0.5) * 1),
        vy: useSharedValue((Math.random() - 0.5) * 1),
        tutorData: SAMPLE_TUTORS[2],
    };

    const card3: FloatingCard = {
        id: 3,
        x: useSharedValue(pos3.x),
        y: useSharedValue(pos3.y),
        rotation: useSharedValue((Math.random() - 0.5) * 15),
        vx: useSharedValue((Math.random() - 0.5) * 1),
        vy: useSharedValue((Math.random() - 0.5) * 1),
        tutorData: SAMPLE_TUTORS[3],
    };

    const card4: FloatingCard = {
        id: 4,
        x: useSharedValue(pos4.x),
        y: useSharedValue(pos4.y),
        rotation: useSharedValue((Math.random() - 0.5) * 15),
        vx: useSharedValue((Math.random() - 0.5) * 1),
        vy: useSharedValue((Math.random() - 0.5) * 1),
        tutorData: SAMPLE_TUTORS[4],
    };

    const card5: FloatingCard = {
        id: 5,
        x: useSharedValue(pos5.x),
        y: useSharedValue(pos5.y),
        rotation: useSharedValue((Math.random() - 0.5) * 15),
        vx: useSharedValue((Math.random() - 0.5) * 1),
        vy: useSharedValue((Math.random() - 0.5) * 1),
        tutorData: SAMPLE_TUTORS[5],
    };

    const card6: FloatingCard = {
        id: 6,
        x: useSharedValue(pos6.x),
        y: useSharedValue(pos6.y),
        rotation: useSharedValue((Math.random() - 0.5) * 15),
        vx: useSharedValue((Math.random() - 0.5) * 1),
        vy: useSharedValue((Math.random() - 0.5) * 1),
        tutorData: SAMPLE_TUTORS[6],
    };

    const card7: FloatingCard = {
        id: 7,
        x: useSharedValue(pos7.x),
        y: useSharedValue(pos7.y),
        rotation: useSharedValue((Math.random() - 0.5) * 15),
        vx: useSharedValue((Math.random() - 0.5) * 1),
        vy: useSharedValue((Math.random() - 0.5) * 1),
        tutorData: SAMPLE_TUTORS[7],
    };

    const cards = [card0, card1, card2, card3, card4, card5, card6, card7];

    // Watch for overlap changes and update state
    // Check overlap directly in the reaction by watching all card positions
    useAnimatedReaction(
        () => {
            // Watch all card positions to ensure we catch movement from ANY card
            return [
                card0.x.value, card0.y.value,
                card1.x.value, card1.y.value,
                card2.x.value, card2.y.value,
                card3.x.value, card3.y.value,
                card4.x.value, card4.y.value,
                card5.x.value, card5.y.value,
                card6.x.value, card6.y.value,
                card7.x.value, card7.y.value,
            ];
        },
        (current, previous) => {
            'worklet';
            // Don't check until component is ready
            if (!isReady.value) {
                return;
            }

            // Throttle: Only check every 10th update to save performance
            // This reduces the check frequency to about 3-6 times per second, which is enough for this effect
            updateCounter.value += 1;
            if (updateCounter.value % 10 !== 0) return;

            // Check for overlap directly here
            const scaledCardWidth = BASE_CARD_WIDTH * CARD_SCALE;
            const estimatedCardHeight = BASE_CARD_WIDTH * 0.85 * CARD_SCALE;

            // Define center text area bounds - make it very precise (smaller area)
            // The text is roughly in the center, so we'll check a smaller area
            const centerX = CONTAINER_WIDTH / 2;
            const centerY = CONTAINER_HEIGHT / 2;
            const textAreaWidth = CONTAINER_WIDTH * 0.3; // Further reduced width
            const textAreaHeight = CONTAINER_HEIGHT * 0.01; // Almost a line to prevent false positives
            // Define text area bounds with extended detection range
            // Add buffer to detect cards that are close, not just overlapping
            const detectionBuffer = 70; // pixels - increase this to detect cards further away
            const textAreaLeft = centerX - textAreaWidth / 2 - detectionBuffer;
            const textAreaRight = centerX + textAreaWidth / 2 + detectionBuffer;
            const textAreaTop = centerY - textAreaHeight / 2 - detectionBuffer;
            const textAreaBottom = centerY + textAreaHeight / 2 + detectionBuffer;

            // Check all cards for overlap
            // Access values directly from the shared values in the closure
            const cardList = [card0, card1, card2, card3, card4, card5, card6, card7];
            let hasOverlap = false;
            for (const card of cardList) {
                const cardLeft = card.x.value;
                const cardRight = card.x.value + scaledCardWidth;
                const cardTop = card.y.value;
                const cardBottom = card.y.value + estimatedCardHeight;

                // Check if card overlaps with extended text area (including buffer)
                if (!(cardRight < textAreaLeft || cardLeft > textAreaRight ||
                    cardBottom < textAreaTop || cardTop > textAreaBottom)) {
                    hasOverlap = true;
                    break;
                }
            }

            // Only update JS state if the value actually changed
            if (hasOverlap !== previousOverlap.value) {
                previousOverlap.value = hasOverlap;
                runOnJS(setHasCardOverlap)(hasOverlap);
            }
        },
        [false] // Initial value
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, style]}>
                <LinearGradient
                    colors={['#db2321', '#a01a18']}
                    style={{
                        // Position gradient to fill entire screen including safe areas
                        position: 'absolute',
                        top: -insets.top,
                        left: -insets.left,
                        width: SCREEN_WIDTH,
                        height: SCREEN_HEIGHT,
                    }}
                />
                <View style={styles.cardsContainer} pointerEvents="box-none">
                    {cards.map((card) => (
                        <FloatingTutorCard key={card.id} card={card} containerWidth={CONTAINER_WIDTH} containerHeight={CONTAINER_HEIGHT} />
                    ))}
                </View>
                {/* Gradient overlay to make cards semi-visible behind text - similar to Amie */}
                {/* Vertical gradient - stronger and narrower, positioned higher where "studysesh" text is */}
                <LinearGradient
                    colors={[
                        'rgba(219, 35, 33, 0)',      // Fully transparent at top
                        'rgba(219, 35, 33, 0.2)',   // Quick fade
                        'rgba(219, 35, 33, 0.65)',  // Stronger opacity where "studysesh" text is (higher up)
                        'rgba(219, 35, 33, 0.25)',  // Gradual fade
                        'rgba(219, 35, 33, 0.1)',   // Light fade
                        'rgba(219, 35, 33, 0)'       // Fully transparent at bottom
                    ]}
                    locations={[0, 0.25, 0.4, 0.55, 0.75, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 1,
                    }}
                />
                <CardOverlapContext.Provider value={{ hasOverlap: hasCardOverlap }}>
                    <View style={[styles.contentContainer, { zIndex: 2 }]} pointerEvents="box-none">
                        {children}
                    </View>
                </CardOverlapContext.Provider>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'visible', // Changed to allow cards at edges
    },
    cardsContainer: {
        ...StyleSheet.absoluteFill,
        zIndex: 1,
        overflow: 'visible', // Allow cards to be visible at edges
    },
    contentContainer: {
        flex: 1,
        zIndex: 10,
    },
});
