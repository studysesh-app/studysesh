import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { ArrowLeft, UserX, ShieldOff } from 'lucide-react-native';
import { useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface BlockedUser {
    id: string;
    name: string;
    initial: string;
}

interface BlockedUsersScreenProps {
    blockedUsers: BlockedUser[];
    onBack: () => void;
    onUnblock: (userId: string) => void;
    isDarkMode?: boolean;
}

export function BlockedUsersScreen({
    blockedUsers: initialBlockedUsers,
    onBack,
    onUnblock,
    isDarkMode = false,
}: BlockedUsersScreenProps) {
    const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);

    const handleUnblock = (userId: string) => {
        setBlockedUsers(blockedUsers.filter((u) => u.id !== userId));
        onUnblock(userId);
    };

    // Swipe gesture handler
    const translateX = useSharedValue(0);

    const swipeGesture = Gesture.Pan()
        .activeOffsetX([10, 10])
        .onUpdate((e) => {
            if (e.translationX > 0) {
                translateX.value = e.translationX;
            }
        })
        .onEnd((e) => {
            if (e.translationX > 80 || e.velocityX > 400) {
                translateX.value = withTiming(
                    SCREEN_WIDTH,
                    { duration: 250, easing: Easing.out(Easing.cubic) },
                    () => {
                        runOnJS(onBack)();
                    }
                );
            } else {
                translateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <GestureDetector gesture={swipeGesture}>
                <Animated.View style={[{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#fff' }, animatedStyle]}>
                    <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                                <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>
                                Blocked Users
                            </Text>
                        </View>

                        {blockedUsers.length === 0 ? (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIcon, isDarkMode && styles.emptyIconDark]}>
                                    <UserX size={32} color="#9ca3af" />
                                </View>
                                <Text style={[styles.emptyTitle, isDarkMode && styles.textDark]}>
                                    No blocked users
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    Users you block will appear here. You can unblock them at any time.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.usersList}>
                                {blockedUsers.map((user) => (
                                    <View
                                        key={user.id}
                                        style={[styles.userCard, isDarkMode && styles.userCardDark]}
                                    >
                                        {/* Avatar */}
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>
                                                {user.initial}
                                            </Text>
                                        </View>

                                        {/* Name */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.userName, isDarkMode && styles.textDark]}>
                                                {user.name}
                                            </Text>
                                        </View>

                                        {/* Unblock Button */}
                                        <TouchableOpacity
                                            onPress={() => handleUnblock(user.id)}
                                            style={[styles.unblockButton, isDarkMode && styles.unblockButtonDark]}
                                            activeOpacity={0.7}
                                        >
                                            <ShieldOff size={14} color={isDarkMode ? '#fca5a5' : '#db2321'} />
                                            <Text style={[styles.unblockText, isDarkMode && styles.unblockTextDark]}>
                                                Unblock
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        zIndex: 10,
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyIconDark: {
        backgroundColor: '#1f2937',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        maxWidth: 260,
    },
    usersList: {
        gap: 12,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        gap: 12,
    },
    userCardDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#991b1b',
        fontSize: 18,
        fontWeight: '700',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    unblockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#fef2f2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    unblockButtonDark: {
        backgroundColor: '#450a0a',
        borderColor: '#7f1d1d',
    },
    unblockText: {
        color: '#db2321',
        fontSize: 13,
        fontWeight: '600',
    },
    unblockTextDark: {
        color: '#fca5a5',
    },
    textDark: {
        color: '#f3f4f6',
    },
});
