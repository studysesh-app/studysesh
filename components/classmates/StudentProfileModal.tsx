import React, { useRef, useEffect, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Minus } from 'lucide-react-native';
import { ProfileCard } from './ProfileCard';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Re-using the interface from ClassmatesScreen/ProfileCard essentially
export interface StudentProfileData {
    id: string;
    name: string;
    pronouns: string;
    year: string;
    major: string;
    photoUrl?: string;
    sharedCourses?: string[];
    role?: 'student' | 'tutor'; // To potentially show different badges
    prompts: Array<{ prompt: string; answer: string }>;
    isConnected?: boolean;
    privacy?: 'public' | 'hidden';
}

interface StudentProfileModalProps {
    isVisible: boolean;
    onClose: () => void;
    studentData: StudentProfileData | null;
    onConnect: (studentId: string) => void;
    isConnected?: boolean;
    isFriend?: boolean;
    onBlock?: (studentId: string) => void;
    onDisconnect?: (studentId: string) => void;
    isDarkMode?: boolean;
}

export function StudentProfileModal({ isVisible, onClose, studentData, onConnect, isConnected, isFriend, onBlock, onDisconnect, isDarkMode = false }: StudentProfileModalProps) {
    // Animation values
    const modalSlide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // We keep a local state for visibility to handle the exit animation
    const [showModal, setShowModal] = useState(isVisible);

    // Sync prop visibility with local state and trigger animations
    useEffect(() => {
        if (isVisible) {
            setShowModal(true);
            // Animate In - just slide, opacity is interpolated
            Animated.spring(modalSlide, {
                toValue: 0,
                tension: 65,
                friction: 11,
                useNativeDriver: true,
            }).start();
        } else {
            // Animate Out
            Animated.timing(modalSlide, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setShowModal(false);
            });
        }
    }, [isVisible]);

    // Pan responder for swipe-to-close
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    modalSlide.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    onClose();
                } else {
                    Animated.spring(modalSlide, {
                        toValue: 0,
                        tension: 65,
                        friction: 11,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    // Interpolate backdrop opacity based on slide position
    // 0 = fully open (opacity 1), SCREEN_HEIGHT = fully closed (opacity 0)
    const backdropOpacity = modalSlide.interpolate({
        inputRange: [0, SCREEN_HEIGHT * 0.5], // fade out halfway through drag
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    if (!showModal && !isVisible) return null;

    return (
        <Modal
            visible={showModal}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <StatusBar style="light" />

                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Bottom Sheet */}
                <Animated.View
                    style={[
                        styles.sheet,
                        isDarkMode && styles.sheetDark,
                        { transform: [{ translateY: modalSlide }] }
                    ]}
                >
                    {/* Drag Handle Area */}
                    <View
                        style={[styles.handleContainer, isDarkMode && styles.handleContainerDark]}
                        {...panResponder.panHandlers}
                    >
                        <View style={[styles.handle, isDarkMode && styles.handleDark]} />
                    </View>

                    {/* Content */}
                    <View style={[styles.contentContainer, isDarkMode && styles.contentContainerDark]}>
                        {/* Header with Close Button */}
                        <View style={styles.header}>
                            <View style={{ width: 40 }} />
                            <TouchableOpacity onPress={onClose} style={[styles.closeButton, isDarkMode && styles.closeButtonDark]}>
                                <X size={24} color={isDarkMode ? '#e5e7eb' : '#9ca3af'} />
                            </TouchableOpacity>
                        </View>

                        {studentData && (
                            <ScrollView
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.cardWrapper}>
                                    <ProfileCard
                                        name={studentData.name}
                                        pronouns={studentData.pronouns}
                                        year={studentData.year}
                                        major={studentData.major}
                                        photoUrl={studentData.photoUrl}
                                        sharedCourses={studentData.sharedCourses}
                                        prompts={studentData.prompts}
                                        isConnected={isConnected ?? studentData.isConnected}
                                        isFriend={isFriend}
                                        onConnect={() => onConnect(studentData.id)}
                                        onBlock={() => onBlock && onBlock(studentData.id)}
                                        onDisconnect={() => onDisconnect && onDisconnect(studentData.id)}
                                        isDarkMode={isDarkMode}
                                    // Removed onViewProfile/onProfileTap as we are already viewing it
                                    />
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: '#f9fafb', // slightly off-white/gray to contrast with card if needed, or just white
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '92%', // "much bigger height"
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 20,
    },
    handleContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#d1d5db',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        position: 'absolute', // Floating close button
        right: 0,
        top: 0,
        zIndex: 10,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    scrollContent: {
        paddingTop: 40, // Space for header/close button
        paddingBottom: 40,
    },
    cardWrapper: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    // Dark Mode
    sheetDark: {
        backgroundColor: '#111827',
    },
    handleContainerDark: {
        backgroundColor: '#111827',
    },
    handleDark: {
        backgroundColor: '#4b5563',
    },
    contentContainerDark: {
        backgroundColor: '#111827',
    },
    closeButtonDark: {
        backgroundColor: '#1f2937',
    },
});
