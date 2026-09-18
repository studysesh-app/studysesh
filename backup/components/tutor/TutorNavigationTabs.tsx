import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Home, MessageSquare, Calendar, User, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
} from 'react-native-reanimated';

type TutorTabValue = 'home' | 'bookings' | 'chat' | 'profile' | 'students';

interface TabConfig {
    value: TutorTabValue;
    icon: any;
    label: string;
    badge?: number;
}

interface TutorNavigationTabsProps {
    activeTab: TutorTabValue;
    onTabChange: (tab: TutorTabValue) => void;
    unreadCount?: number;
}

const IconSize = 24;

function AnimatedTab({
    tab,
    isActive,
    onPress,
    minWidth,
    maxWidth,
    badge,
}: {
    tab: TabConfig;
    isActive: boolean;
    onPress: () => void;
    minWidth: number;
    maxWidth: number;
    badge?: number;
}) {
    const Icon = tab.icon;

    // Create an animated progress value that transitions between 0 and 1
    const progress = useDerivedValue(() => {
        return withSpring(isActive ? 1 : 0, {
            dampingRatio: 1,
            duration: 400,
        });
    }, [isActive]);

    // Animate the tab width between minWidth and maxWidth based on the progress
    const rTabStyle = useAnimatedStyle(() => {
        return {
            width: interpolate(progress.value, [0, 1], [minWidth, maxWidth]),
        };
    }, [isActive]);

    // Animate the text opacity, margin, and max-width
    const rTextStyle = useAnimatedStyle(() => {
        return {
            opacity: progress.value ** 3, // Cubic easing for opacity
            marginLeft: interpolate(progress.value, [0, 1], [0, 8]), // Dynamic left margin
            maxWidth: interpolate(progress.value, [0, 1], [0, 120]), // Animate width
        };
    }, [isActive]);

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ position: 'relative' }}>
            <Animated.View style={[rTabStyle, styles.container]}>
                {isActive && (
                    <LinearGradient
                        colors={['#db2321', '#a01a18']}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                {!isActive && (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#f1f1f1' }]} />
                )}

                <View style={styles.innerContainer}>
                    <View style={styles.iconContainer}>
                        <Icon
                            size={IconSize}
                            color={isActive ? 'white' : '#6b7280'}
                            strokeWidth={2.5}
                        />
                    </View>
                    <Animated.Text
                        numberOfLines={1}
                        style={[styles.label, rTextStyle, isActive && styles.activeLabel]}>
                        {tab.label}
                    </Animated.Text>
                </View>
            </Animated.View>
            {/* Badge - outside container to avoid clipping while keeping rounded corners */}
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

export function TutorNavigationTabs({ activeTab, onTabChange, unreadCount = 0 }: TutorNavigationTabsProps) {
    const { width: windowWidth } = useWindowDimensions();
    const tabs: TabConfig[] = [
        { value: 'home', icon: Home, label: 'Home' },
        { value: 'chat', icon: MessageSquare, label: 'Chat' },
        { value: 'bookings', icon: Calendar, label: 'Bookings' },
        { value: 'profile', icon: User, label: 'Profile' },
    ];

    const gap = 10;
    const paddingHorizontal = 16;
    const tabsWidth = windowWidth - paddingHorizontal * 2 - gap * (tabs.length - 1);
    const minTabWidth = 60;
    const maxTabWidth = tabsWidth - (tabs.length - 1) * minTabWidth;

    return (
        <View style={[styles.wrapper, { paddingHorizontal }]}>
            <View style={[styles.tabsContainer, { gap }]}>
                {tabs.map((tab) => (
                    <AnimatedTab
                        key={tab.value}
                        tab={tab}
                        isActive={activeTab === tab.value}
                        onPress={() => onTabChange(tab.value)}
                        minWidth={minTabWidth}
                        maxWidth={maxTabWidth}
                        badge={tab.value === 'chat' ? unreadCount : undefined}
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
        paddingTop: 12,
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
        borderRadius: 15,
        height: 60,
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
        fontSize: 16,
        fontWeight: '500',
        zIndex: 100,
        color: '#6b7280',
    },
    activeLabel: {
        color: 'white',
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#dc2626',
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
});
