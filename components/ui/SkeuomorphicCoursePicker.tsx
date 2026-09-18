import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useColorScheme, Animated, Easing, Modal, Pressable, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeuomorphicCoursePickerProps {
    courses: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    getItemLabel?: (course: string) => string;
    direction?: 'up' | 'down'; // Kept for backwards compatibility but not used anymore
    isDarkMode?: boolean;
}

const ITEM_HEIGHT = 56;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function SkeuomorphicCoursePicker({
    courses,
    selectedValue,
    onValueChange,
    placeholder = 'Select Course',
    getItemLabel,
    isDarkMode,
}: SkeuomorphicCoursePickerProps) {
    const scrollViewRef = useRef<ScrollView>(null);
    const [isOpen, setIsOpen] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = isDarkMode ?? colorScheme === 'dark';

    // Animation values
    const chevronRotation = useRef(new Animated.Value(0)).current;
    const modalSlide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isOpen) {
            // Reset to starting position before animating
            modalSlide.setValue(SCREEN_HEIGHT);
            backdropOpacity.setValue(0);
            chevronRotation.setValue(0);

            // Small delay to ensure reset is applied, then animate
            requestAnimationFrame(() => {
                // Animate chevron
                Animated.timing(chevronRotation, {
                    toValue: 1,
                    duration: 250,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }).start();

                // Animate modal slide up
                Animated.spring(modalSlide, {
                    toValue: 0,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }).start();

                // Animate backdrop
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            });

            // Scroll to selected item
            if (selectedValue) {
                const selectedIndex = courses.indexOf(selectedValue);
                if (selectedIndex !== -1 && scrollViewRef.current) {
                    setTimeout(() => {
                        scrollViewRef.current?.scrollTo({
                            y: Math.max(0, selectedIndex * ITEM_HEIGHT - 100),
                            animated: true,
                        });
                    }, 100);
                }
            }
        }
        // Close animation is now handled by closeSheet function
    }, [isOpen, selectedValue, courses]);

    const closeSheet = (callback?: () => void) => {
        // Animate close first, then set isOpen to false
        Animated.parallel([
            Animated.timing(chevronRotation, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(modalSlide, {
                toValue: SCREEN_HEIGHT,
                duration: 280,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsOpen(false);
            callback?.();
        });
    };

    const handleSelect = (course: string) => {
        // Close sheet with animation, then update value
        closeSheet(() => {
            onValueChange(course);
        });
    };

    const chevronRotate = chevronRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const styles = createStyles(isDark);

    // Calculate modal height based on number of items (max 50% of screen)
    const modalHeight = Math.min(courses.length * ITEM_HEIGHT + 80, SCREEN_HEIGHT * 0.5);

    return (
        <View style={styles.container}>
            {/* Trigger Button */}
            <TouchableOpacity
                onPress={() => setIsOpen(true)}
                style={[styles.trigger, isOpen && styles.triggerActive]}
                activeOpacity={0.9}
            >
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

            {/* Bottom Sheet Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={() => closeSheet()}
            >
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => closeSheet()} />
                </Animated.View>

                {/* Bottom Sheet */}
                <Animated.View
                    style={[
                        styles.bottomSheet,
                        { height: modalHeight, transform: [{ translateY: modalSlide }] },
                    ]}
                >
                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    {/* Title */}
                    <Text style={styles.sheetTitle}>{placeholder}</Text>

                    {/* Options */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
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
                                        index === courses.length - 1 && styles.itemLast,
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                                        {getItemLabel ? getItemLabel(course) : course}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.checkContainer}>
                                            <Check size={20} color="#db2321" strokeWidth={3} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>
            </Modal>
        </View>
    );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        position: 'relative',
    },
    trigger: {
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.4 : 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
    },
    triggerActive: {
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
    },
    triggerTextPlaceholder: {
        color: '#9ca3af',
        fontWeight: '400',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 20,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: isDark ? '#4b5563' : '#d1d5db',
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#f9fafb' : '#111827',
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    scrollView: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: ITEM_HEIGHT,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#f3f4f6',
    },
    itemLast: {
        borderBottomWidth: 0,
    },
    itemSelected: {
        backgroundColor: isDark ? 'rgba(219, 35, 33, 0.1)' : '#fef2f2',
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
        color: isDark ? '#e5e7eb' : '#374151',
    },
    itemTextSelected: {
        color: '#db2321',
        fontWeight: '600',
    },
    checkContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: isDark ? 'rgba(219, 35, 33, 0.2)' : '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
