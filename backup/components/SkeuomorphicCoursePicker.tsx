import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useColorScheme, Animated, Easing } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeuomorphicCoursePickerProps {
    courses: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    getItemLabel?: (course: string) => string;
    direction?: 'up' | 'down';
}

const ITEM_HEIGHT = 50;

export function SkeuomorphicCoursePicker({
    courses,
    selectedValue,
    onValueChange,
    placeholder = 'Select Course',
    getItemLabel,
    direction = 'down',
}: SkeuomorphicCoursePickerProps) {
    const scrollViewRef = useRef<ScrollView>(null);
    const [isOpen, setIsOpen] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Animation values
    const dropdownOpacity = useRef(new Animated.Value(0)).current;
    const dropdownScale = useRef(new Animated.Value(0.9)).current;
    const dropdownTranslateY = useRef(new Animated.Value(direction === 'down' ? -10 : 10)).current;
    const chevronRotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isOpen && selectedValue) {
            const selectedIndex = courses.indexOf(selectedValue);
            if (selectedIndex !== -1 && scrollViewRef.current) {
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                        y: selectedIndex * ITEM_HEIGHT,
                        animated: true,
                    });
                }, 200);
            }
        }
    }, [isOpen, selectedValue, courses]);

    useEffect(() => {
        const initialTranslateY = direction === 'down' ? -10 : 10;

        // Always reset to initial state first, then animate
        if (isOpen) {
            // Reset to initial closed state
            dropdownOpacity.setValue(0);
            dropdownScale.setValue(0.9);
            dropdownTranslateY.setValue(initialTranslateY);
            chevronRotation.setValue(0);

            // Small delay to ensure reset is applied
            requestAnimationFrame(() => {
                // Open animation
                Animated.parallel([
                    Animated.timing(dropdownOpacity, {
                        toValue: 1,
                        duration: 250,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.spring(dropdownScale, {
                        toValue: 1,
                        tension: 50,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dropdownTranslateY, {
                        toValue: 0,
                        duration: 250,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(chevronRotation, {
                        toValue: 1,
                        duration: 250,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        } else {
            // Close animation
            Animated.parallel([
                Animated.timing(dropdownOpacity, {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(dropdownScale, {
                    toValue: 0.9,
                    duration: 200,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(dropdownTranslateY, {
                    toValue: initialTranslateY,
                    duration: 200,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(chevronRotation, {
                    toValue: 0,
                    duration: 200,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isOpen, direction]);

    const handleSelect = (course: string) => {
        onValueChange(course);
        setIsOpen(false);
    };

    const chevronRotate = chevronRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const styles = createStyles(isDark, direction);

    return (
        <View style={styles.container}>
            {/* Trigger Button - Skeuomorphic */}
            <TouchableOpacity
                onPress={() => setIsOpen(!isOpen)}
                style={[
                    styles.trigger,
                    isOpen && styles.triggerActive,
                ]}
                activeOpacity={0.9}
            >
                {/* Inner gradient for depth */}
                <LinearGradient
                    colors={isOpen
                        ? (isDark ? ['#2a1a1a', '#1a0f0f'] : ['#fff5f5', '#fee2e2'])
                        : (isDark ? ['#2a2a2a', '#1f1f1f'] : ['#ffffff', '#f9fafb'])
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.triggerGradient}
                >
                    <Text
                        style={[
                            styles.triggerText,
                            !selectedValue && styles.triggerTextPlaceholder,
                        ]}
                        numberOfLines={1}
                    >
                        {selectedValue ? (getItemLabel ? getItemLabel(selectedValue) : selectedValue) : placeholder}
                    </Text>
                    <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                        <ChevronDown size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </Animated.View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Dropdown - Animated & Skeuomorphic - Always rendered for consistent animations */}
            <Animated.View
                style={[
                    styles.dropdown,
                    {
                        opacity: dropdownOpacity,
                        transform: [
                            { scale: dropdownScale },
                            { translateY: dropdownTranslateY },
                        ],
                        pointerEvents: isOpen ? 'auto' : 'none',
                    },
                ]}
            >
                {/* Outer shadow layer */}
                <View style={styles.dropdownShadowOuter} />

                {/* Main container with gradient */}
                <LinearGradient
                    colors={isDark ? ['#2a2a2a', '#1f1f1f'] : ['#ffffff', '#f9fafb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.dropdownGradient}
                >
                    {/* Inner highlight */}
                    <View style={styles.dropdownHighlight} />

                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        nestedScrollEnabled={true}
                    >
                        {courses.map((course, index) => {
                            const isSelected = course === selectedValue;
                            return (
                                <TouchableOpacity
                                    key={course}
                                    onPress={() => handleSelect(course)}
                                    style={[
                                        styles.item,
                                        isSelected && styles.itemSelected,
                                        index === 0 && styles.itemFirst,
                                        index === courses.length - 1 && styles.itemLast,
                                    ]}
                                    activeOpacity={0.8}
                                >
                                    {/* Item gradient for selected state */}
                                    {isSelected && (
                                        <LinearGradient
                                            colors={isDark ? ['#7f1d1d', '#5a1414'] : ['#fee2e2', '#fecaca']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                            style={StyleSheet.absoluteFill}
                                        />
                                    )}

                                    <Text
                                        style={[
                                            styles.itemText,
                                            isSelected && styles.itemTextSelected,
                                        ]}
                                    >
                                        {getItemLabel ? getItemLabel(course) : course}
                                    </Text>

                                    {isSelected && (
                                        <View style={styles.checkmarkContainer}>
                                            <LinearGradient
                                                colors={['#db2321', '#b91c1c']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 0, y: 1 }}
                                                style={styles.checkmark}
                                            >
                                                <Text style={styles.checkmarkText}>✓</Text>
                                            </LinearGradient>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </LinearGradient>
            </Animated.View>
        </View>
    );
}

const createStyles = (isDark: boolean, direction: 'up' | 'down') => StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 10,
    },
    trigger: {
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        // Outer shadow (raised effect)
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: isDark ? 0.4 : 0.15,
        shadowRadius: 8,
        elevation: 8,
        // Inner shadow (inset effect)
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
    },
    triggerActive: {
        // Enhanced shadow when active
        shadowColor: '#db2321',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
        borderColor: '#db2321',
    },
    triggerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    triggerText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: isDark ? '#f9fafb' : '#111827',
        textShadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    triggerTextPlaceholder: {
        color: isDark ? '#9ca3af' : '#9ca3af',
        fontWeight: '400',
    },
    dropdown: {
        position: 'absolute',
        top: direction === 'down' ? 60 : undefined,
        bottom: direction === 'up' ? 60 : undefined,
        left: 0,
        right: 0,
        maxHeight: 200,
        borderRadius: 16,
        overflow: 'visible',
    },
    dropdownShadowOuter: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 18,
        backgroundColor: 'transparent',
        // Multiple shadow layers for depth
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: isDark ? 0.6 : 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    dropdownGradient: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: isDark ? '#db2321' : '#db2321',
        overflow: 'hidden',
        // Inner shadow for inset effect
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
        zIndex: 1,
    },
    scrollView: {
        maxHeight: 200,
    },
    scrollContent: {
        paddingVertical: 4,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: ITEM_HEIGHT,
        paddingHorizontal: 16,
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)',
    },
    itemFirst: {
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    itemLast: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
    },
    itemSelected: {
        // Selected state handled by gradient overlay
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
        color: isDark ? '#e5e7eb' : '#374151',
        zIndex: 1,
        textShadowColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0.5 },
        textShadowRadius: 1,
    },
    itemTextSelected: {
        color: '#db2321',
        fontWeight: '700',
    },
    checkmarkContainer: {
        zIndex: 2,
        // Outer glow
        shadowColor: '#db2321',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
    },
    checkmark: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        // Inner highlight
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    checkmarkText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
