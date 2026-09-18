import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, Dimensions } from 'react-native';
import { ArrowLeft, MessageSquare, UserMinus } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Connection {
    id: string;
    name: string;
    photoUrl?: string;
    year: string;
    major: string;
    sharedCourses: string[];
    connectedSince: string;
}

interface ConnectionsListScreenProps {
    connections: Connection[];
    onBack: () => void;
    onMessage: (connectionId: string) => void;
    onViewProfile: (connectionId: string) => void;
    onDisconnect: (connectionId: string, name: string) => void;
    isDarkMode?: boolean;
}

export function ConnectionsListScreen({
    connections,
    onBack,
    onMessage,
    onViewProfile,
    onDisconnect,
    isDarkMode = false,
}: ConnectionsListScreenProps) {
    // Swipe gesture for back navigation
    const translateX = useSharedValue(0);

    const swipeGesture = Gesture.Pan()
        .activeOffsetX([10, 10])
        .onUpdate((event) => {
            if (event.translationX > 0) {
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            if (event.translationX > 80 || event.velocityX > 400) {
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

    const handleDisconnect = (connection: Connection) => {
        Alert.alert(
            'Disconnect',
            `Are you sure you want to disconnect from ${connection.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: () => onDisconnect(connection.id, connection.name)
                }
            ]
        );
    };

    return (
        <GestureDetector gesture={swipeGesture}>
            <Animated.View style={[styles.container, animatedStyle, isDarkMode && styles.containerDark]}>
                {/* Header */}
                <View style={[styles.header, isDarkMode && styles.headerDark]}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Connections</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
                    {connections.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyTitle, isDarkMode && styles.textDark]}>No connections yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Head to the Classmates tab to connect with people in your courses!
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.connectionsList}>
                            <Text style={[styles.sectionTitle, isDarkMode && styles.textGrayDark]}>
                                {connections.length} {connections.length === 1 ? 'Connection' : 'Connections'}
                            </Text>
                            {connections.map((connection) => (
                                <TouchableOpacity
                                    key={connection.id}
                                    style={[styles.connectionCard, isDarkMode && styles.connectionCardDark]}
                                    onPress={() => onViewProfile(connection.id)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.connectionLeft}>
                                        {connection.photoUrl ? (
                                            <Image
                                                source={{ uri: connection.photoUrl }}
                                                style={styles.avatar}
                                            />
                                        ) : (
                                            <View style={[styles.avatarPlaceholder, isDarkMode && styles.avatarPlaceholderDark]}>
                                                <Text style={styles.avatarText}>
                                                    {connection.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={styles.connectionInfo}>
                                            <Text style={[styles.connectionName, isDarkMode && styles.textDark]}>
                                                {connection.name}
                                            </Text>
                                            <Text style={styles.connectionMeta}>
                                                {connection.year} • {connection.major}
                                            </Text>
                                            <Text style={styles.connectionSince}>
                                                Connected {connection.connectedSince}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.connectionActions}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.messageButton, isDarkMode && styles.messageButtonDark]}
                                            onPress={() => onMessage(connection.id)}
                                        >
                                            <MessageSquare size={18} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.disconnectButton, isDarkMode && styles.disconnectButtonDark]}
                                            onPress={() => handleDisconnect(connection)}
                                        >
                                            <UserMinus size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerDark: {
        borderBottomColor: '#374151',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    headerSpacer: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    connectionsList: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
        marginBottom: 12,
    },
    connectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    connectionCardDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    connectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarPlaceholderDark: {
        backgroundColor: '#450a0a',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#db2321',
    },
    connectionInfo: {
        marginLeft: 12,
        flex: 1,
    },
    connectionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    connectionMeta: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 2,
    },
    connectionSince: {
        fontSize: 12,
        color: '#9ca3af',
    },
    connectionActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageButton: {
        backgroundColor: '#db2321',
    },
    messageButtonDark: {
        backgroundColor: '#991b1b', // Darker red for dark mode
    },
    disconnectButton: {
        backgroundColor: '#fef2f2',
    },
    disconnectButtonDark: {
        backgroundColor: '#450a0a',
    },
    textDark: {
        color: '#f3f4f6',
    },
    textGrayDark: {
        color: '#9ca3af',
    },
});
