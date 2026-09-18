import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Animated as RNAnimated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.78; // Slightly reduced

interface ProfilePrompt {
    prompt: string;
    answer: string;
}

interface ProfileCardProps {
    name: string;
    pronouns: string;
    year: string;
    major: string;
    photoUrl?: string;
    sharedCourses?: string[];
    isConnected?: boolean;
    isFriend?: boolean;
    prompts: ProfilePrompt[];
    onConnect: () => void;
    onProfileTap?: () => void;
    onBlock?: () => void;
    onDisconnect?: () => void;
    onReport?: () => void;
    isDarkMode?: boolean;
}

export function ProfileCard({
    name,
    pronouns,
    year,
    major,
    photoUrl,
    sharedCourses = [],
    isConnected = false,
    isFriend = false,
    prompts,
    onConnect,
    onProfileTap,
    onBlock,
    onDisconnect,
    onReport,
    isDarkMode = false,
}: ProfileCardProps) {
    const scaleValue = useRef(new RNAnimated.Value(1)).current;
    const [menuVisible, setMenuVisible] = useState(false);

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleConnectPress = () => {
        if (isFriend) return; // Do nothing if already friend (or maybe open menu?)

        // Toggle animation
        RNAnimated.sequence([
            RNAnimated.timing(scaleValue, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            RNAnimated.timing(scaleValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        onConnect();
    };

    const handleMenuPress = () => {
        setMenuVisible(true);
    };

    const handleDisconnectAction = () => {
        setMenuVisible(false);
        // Small delay to allow menu to close before alert, optional but good for UI
        setTimeout(() => {
            Alert.alert(
                'Disconnect',
                `Are you sure you want to disconnect from ${name}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Disconnect', style: 'destructive', onPress: onDisconnect }
                ]
            );
        }, 100);
    };

    const handleBlockAction = () => {
        setMenuVisible(false);
        setTimeout(() => {
            Alert.alert(
                'Block User',
                `Are you sure you want to block ${name}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Block', style: 'destructive', onPress: onBlock }
                ]
            );
        }, 100);
    };

    const handleReportAction = () => {
        setMenuVisible(false);
        setTimeout(() => {
            Alert.alert(
                'Report User',
                `Why are you reporting ${name}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Inappropriate Content', onPress: () => onReport?.() },
                    { text: 'Harassment', onPress: () => onReport?.() },
                    { text: 'Spam', onPress: () => onReport?.() },
                ]
            );
        }, 100);
    };

    return (
        <View style={styles.cardContainer}>
            <View style={[styles.card, isDarkMode && styles.cardDark]}>
                {/* Photo Section - Fixed at top */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onProfileTap}
                    style={styles.photoSection}
                >
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.initials}>{initials}</Text>
                        </View>
                    )}
                    {/* Gradient overlay for text readability */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.photoGradient}
                    />

                    {/* Menu Button */}
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={handleMenuPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuButtonBg}>
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 20 }}>⋮</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Name and basic info overlay */}
                    <View style={styles.photoOverlay}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.pronounsText}>{pronouns}</Text>
                        <Text style={styles.yearMajor}>{year} • {major}</Text>
                    </View>
                </TouchableOpacity>

                {/* Scrollable Content Section */}
                <ScrollView
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Shared Courses Section */}
                    {sharedCourses.length > 0 && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>SHARED COURSES</Text>
                            <View style={styles.coursesContainer}>
                                {sharedCourses.map((course, index) => (
                                    <View key={index} style={[styles.coursePill, isDarkMode && styles.coursePillDark]}>
                                        <Text style={[styles.coursePillText, isDarkMode && styles.coursePillTextDark]}>{course}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Prompts Section */}
                    <View style={styles.promptsContainer}>
                        {prompts.map((item, index) => (
                            <View key={index} style={[styles.promptItem, isDarkMode && styles.promptItemDark]}>
                                <Text style={[styles.promptQuestion, isDarkMode && styles.promptQuestionDark]}>{item.prompt}</Text>
                                <Text style={[styles.promptAnswer, isDarkMode && styles.promptAnswerDark]}>{item.answer}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Connect Button - Inside ScrollView */}
                    <View style={styles.buttonWrapper}>
                        <RNAnimated.View style={{ transform: [{ scale: scaleValue }] }}>
                            <TouchableOpacity
                                style={[
                                    styles.connectButton,
                                    isConnected && styles.connectButtonSuccess,
                                    isFriend && styles.connectButtonFriend
                                ]}
                                onPress={handleConnectPress}
                                activeOpacity={isFriend ? 1 : 0.8}
                            >
                                <Text style={styles.connectButtonText}>
                                    {isFriend ? "Connection" : (isConnected ? "Request Sent" : "Connect")}
                                </Text>
                            </TouchableOpacity>
                        </RNAnimated.View>
                    </View>

                    {/* Extra padding at very bottom */}
                    <View style={{ height: 40 }} />
                </ScrollView>
                {/* Custom Popover Menu */}
                {menuVisible && (
                    <>
                        <TouchableOpacity
                            style={styles.menuBackdrop}
                            activeOpacity={1}
                            onPress={() => setMenuVisible(false)}
                        />
                        <View style={[styles.menuPopover, isDarkMode && styles.menuPopoverDark]}>
                            {isFriend && (
                                <TouchableOpacity style={styles.menuItem} onPress={handleDisconnectAction}>
                                    <Text style={styles.menuItemTextDestructive}>Disconnect</Text>
                                </TouchableOpacity>
                            )}
                            {isFriend && <View style={[styles.menuSeparator, isDarkMode && styles.menuSeparatorDark]} />}

                            <TouchableOpacity style={styles.menuItem} onPress={handleReportAction}>
                                <Text style={styles.menuItemText}>Report</Text>
                            </TouchableOpacity>
                            <View style={[styles.menuSeparator, isDarkMode && styles.menuSeparatorDark]} />

                            <TouchableOpacity style={styles.menuItem} onPress={handleBlockAction}>
                                <Text style={styles.menuItemTextDestructive}>Block</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: SCREEN_WIDTH - 24, // Slightly wider
        height: CARD_HEIGHT,
        alignSelf: 'center',
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 28, // Rounder corners
        overflow: 'hidden',
        // Skeuomorphic borders and shadow
        borderWidth: 1.5, // Slightly thicker
        borderColor: 'rgba(0,0,0,0.12)', // More defined border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 }, // Deeper shadow
        shadowOpacity: 0.15, // stronger opacity
        shadowRadius: 24,
        elevation: 12,
    },
    photoSection: {
        height: '45%', // Reduce photo height slightly to give more room for content
        position: 'relative',
    },
    menuButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    menuButtonBg: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 8,
    },
    // ... (photo styles same as before) ...
    photo: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        fontSize: 72,
        fontWeight: '700',
        color: '#9ca3af',
    },
    photoGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        width: '100%',
        paddingRight: 60, // Avoid overlapping menu if it were bottom, but it's top. 
        // Actually, name might be long. Menu is top, name is bottom. No overlap.
    },
    name: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    pronounsText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.95)',
        marginBottom: 4,
        fontWeight: '500',
    },
    yearMajor: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 20,
        paddingBottom: 0, // Padding handled by spacer
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#9ca3af',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    coursesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    coursePill: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    coursePillText: {
        color: '#db2321', // Primary red
        fontSize: 13,
        fontWeight: '600',
    },
    promptsContainer: {
        gap: 14,
    },
    promptItem: {
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    promptQuestion: {
        fontSize: 11,
        fontWeight: '700',
        color: '#db2321',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    promptAnswer: {
        fontSize: 16,
        color: '#1f2937',
        lineHeight: 22,
        fontWeight: '500',
    },
    buttonWrapper: {
        marginTop: 10,
    },
    connectButton: {
        backgroundColor: '#db2321',
        borderRadius: 16, // More like a UI button than a pill
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#db2321',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        transform: [{ scale: 1 }],
    },
    connectButtonSuccess: {
        backgroundColor: '#22c55e', // Green
        shadowColor: '#22c55e',
    },
    connectButtonFriend: {
        backgroundColor: '#9ca3af', // Gray
        shadowColor: '#9ca3af',
    },
    connectButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    menuBackdrop: {
        ...StyleSheet.absoluteFill,
        zIndex: 20,
    },
    menuPopover: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 21,
        minWidth: 140,
        paddingVertical: 4,
    },
    menuItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuSeparator: {
        height: 1,
        backgroundColor: '#f3f4f6',
    },
    menuItemText: {
        color: '#111827',
        fontWeight: '500',
        fontSize: 15,
    },
    menuItemTextDestructive: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 15,
    },
    // Dark Mode
    cardDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    coursePillDark: {
        backgroundColor: '#450a0a',
        borderColor: '#7f1d1d',
    },
    coursePillTextDark: {
        color: '#fca5a5',
    },
    promptItemDark: {
        backgroundColor: '#111827',
        borderColor: '#374151',
    },
    promptQuestionDark: {
        color: '#fca5a5',
    },
    promptAnswerDark: {
        color: '#f3f4f6',
    },
    menuPopoverDark: {
        backgroundColor: '#1f2937',
    },
    menuSeparatorDark: {
        backgroundColor: '#374151',
    },
});

