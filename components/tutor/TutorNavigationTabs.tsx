import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Home, Calendar, Users, MessageSquare, User, Bell, LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';

type TutorTabValue = 'home' | 'connections' | 'chat' | 'activity' | 'profile';

interface TabConfig {
    value: TutorTabValue;
    icon: LucideIcon;
    label: string;
    badge?: number;
}

interface TutorNavigationTabsProps {
    activeTab: TutorTabValue;
    onTabChange: (tab: TutorTabValue) => void;
    unreadCount?: number; // For chat
    unreadActivity?: number;
    isDarkMode?: boolean;
}

const IconSize = 22;

function AnimatedTab({
    tab,
    isActive,
    onPress,
    minWidth,
    maxWidth,
    badge,
    isDarkMode,
}: {
    tab: TabConfig;
    isActive: boolean;
    onPress: () => void;
    minWidth: number;
    maxWidth: number;
    badge?: number;
    isDarkMode?: boolean;
}) {
    const Icon = tab.icon;

    const progress = useDerivedValue(() => {
        return withTiming(isActive ? 1 : 0, {
            duration: 200,
            easing: Easing.out(Easing.quad),
        });
    }, [isActive]);

    const rTabStyle = useAnimatedStyle(() => {
        return {
            width: interpolate(progress.value, [0, 1], [minWidth, maxWidth]),
        };
    }, [isActive]);

    const rTextStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
            marginLeft: interpolate(progress.value, [0, 1], [0, 6]),
            maxWidth: interpolate(progress.value, [0, 1], [0, 80]),
        };
    }, [isActive]);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={1}
            style={{ position: 'relative' }}
            delayPressIn={0}
        >
            <Animated.View style={[rTabStyle, styles.container]}>
                {isActive && (
                    <LinearGradient
                        colors={['#db2321', '#a01a18']}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                {!isActive && (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? '#1f2937' : '#f1f1f1' }]} />
                )}

                <View style={styles.innerContainer}>
                    <View style={styles.iconContainer}>
                        <Icon
                            size={IconSize}
                            color={isActive ? 'white' : (isDarkMode ? '#9ca3af' : '#6b7280')}
                            strokeWidth={2.5}
                        />
                    </View>
                    <Animated.Text
                        numberOfLines={1}
                        style={[styles.label, rTextStyle, isActive && styles.activeLabel, !isActive && isDarkMode && styles.labelDark]}>
                        {tab.label}
                    </Animated.Text>
                </View>
            </Animated.View>
            {/* Badge */}
            {badge !== undefined && badge > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {badge > 9 ? '9+' : badge}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

export function TutorNavigationTabs({
    activeTab,
    onTabChange,
    unreadCount = 0,
    unreadActivity = 0,
    isDarkMode = false,
}: TutorNavigationTabsProps) {
    const { width: windowWidth } = useWindowDimensions();
    const tabs: TabConfig[] = [
        { value: 'home', icon: Home, label: 'Home' },
        { value: 'chat', icon: MessageSquare, label: 'Messages' },
        { value: 'connections', icon: Users, label: 'Connect' },
        { value: 'activity', icon: Calendar, label: 'Activity' }, // Was 'Bookings' for tutor, now Activity
        { value: 'profile', icon: User, label: 'Profile' },
    ];

    const gap = 6;
    const paddingHorizontal = 12;
    const tabsWidth = windowWidth - paddingHorizontal * 2 - gap * (tabs.length - 1);
    const minTabWidth = 50;
    const maxTabWidth = tabsWidth - (tabs.length - 1) * minTabWidth;

    return (
        <View style={[styles.wrapper, { paddingHorizontal }, isDarkMode && styles.wrapperDark]}>
            <View style={[styles.tabsContainer, { gap }]}>
                {tabs.map((tab) => (
                    <AnimatedTab
                        key={tab.value}
                        tab={tab}
                        isActive={activeTab === tab.value}
                        onPress={() => onTabChange(tab.value)}
                        minWidth={minTabWidth}
                        maxWidth={maxTabWidth}
                        badge={
                            tab.value === 'chat' ? (unreadCount > 0 ? unreadCount : undefined) :
                                tab.value === 'activity' ? (unreadActivity > 0 ? unreadActivity : undefined) :
                                    undefined
                        }
                        isDarkMode={isDarkMode}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 10,
        paddingBottom: 4,
    },
    wrapperDark: {
        backgroundColor: '#111827',
        borderTopColor: '#374151',
    },
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        backgroundColor: '#f1f1f1',
        borderCurve: 'continuous',
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    innerContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100%',
    },
    iconContainer: {
        height: IconSize,
        width: IconSize,
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
        marginLeft: 0,
    },
    labelDark: {
        color: '#d1d5db',
    },
    activeLabel: {
        color: 'white',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
