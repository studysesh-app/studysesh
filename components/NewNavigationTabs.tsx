import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Home, MessageSquare, Users, Bell, User, LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';

type TabValue = 'home' | 'classmates' | 'chat' | 'activity' | 'profile';

interface TabConfig {
    value: TabValue;
    icon: LucideIcon;
    label: string;
    badge?: number;
}

interface NewNavigationTabsProps {
    activeTab: TabValue;
    onTabChange: (tab: TabValue) => void;
    unreadMessages?: number;
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

export function NewNavigationTabs({
    activeTab,
    onTabChange,
    unreadMessages = 0,
    unreadActivity = 0,
    isDarkMode = false,
}: NewNavigationTabsProps) {
    const { width: windowWidth } = useWindowDimensions();
    const tabs: TabConfig[] = [
        { value: 'home', icon: Home, label: 'Home' },
        { value: 'chat', icon: MessageSquare, label: 'Messages' },
        { value: 'classmates', icon: Users, label: 'Connect' },
        { value: 'activity', icon: Bell, label: 'Activity' },
        { value: 'profile', icon: User, label: 'Profile' },
    ];

    const gap = 6;
    const paddingHorizontal = 12;
    const tabsWidth = windowWidth - paddingHorizontal * 2 - gap * (tabs.length - 1);
    const minTabWidth = 50;
    const maxTabWidth = tabsWidth - (tabs.length - 1) * minTabWidth;

    const getBadge = (tabValue: TabValue): number | undefined => {
        if (tabValue === 'chat') return unreadMessages > 0 ? unreadMessages : undefined;
        if (tabValue === 'activity') return unreadActivity > 0 ? unreadActivity : undefined;
        return undefined;
    };

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
                        badge={getBadge(tab.value)}
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
        fontWeight: '500',
        zIndex: 100,
        color: '#6b7280',
    },
    activeLabel: {
        color: 'white',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#dc2626',
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        paddingHorizontal: 3,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: 'white',
    },
    wrapperDark: {
        backgroundColor: '#111827',
        borderTopColor: '#1f2937',
    },
    labelDark: {
        color: '#9ca3af',
    },
});

export type { TabValue };
