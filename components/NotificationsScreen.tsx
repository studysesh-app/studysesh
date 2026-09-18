import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ArrowLeft, Bell, CheckCircle2, Clock } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    isUnread: boolean;
    data?: any;
}

interface NotificationsScreenProps {
    notifications: Notification[];
    onBack: () => void;
    onMarkAsRead: (id: string) => void;
    onNotificationClick?: (notification: Notification) => void;
}

export function NotificationsScreen({ notifications, onBack, onMarkAsRead, onNotificationClick }: NotificationsScreenProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'accepted':
                return <CheckCircle2 size={24} color="#22c55e" />;
            case 'reminder':
                return <Clock size={24} color="#3b82f6" />;
            default:
                return <CheckCircle2 size={24} color="#6b7280" />;
        }
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
                <Animated.View className="flex-1 bg-white dark:bg-gray-900" style={animatedStyle}>
                <ScrollView className="flex-1 px-4 pt-6">
                    {/* Header matching SettingsScreen */}
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Notifications
                        </Text>
                    </View>

                    <View className="pb-8">
                        {notifications.map((notification) => (
                            <TouchableOpacity
                                key={notification.id}
                                onPress={() => {
                                    onMarkAsRead(notification.id);
                                    if (onNotificationClick) {
                                        onNotificationClick(notification);
                                    }
                                }}
                                activeOpacity={0.7}
                                className={`mb-3 p-4 rounded-2xl border ${notification.isUnread
                                        ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                    } shadow-sm`}
                                style={!notification.isUnread ? {
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 3,
                                    elevation: 2,
                                } : {}}
                            >
                                <View className="flex-row gap-3 items-start">
                                    {/* Icon Bubble */}
                                    <View className={`w-10 h-10 rounded-full items-center justify-center flex-shrink-0 ${notification.type === 'accepted' ? 'bg-green-100 dark:bg-green-900/30' :
                                            notification.type === 'reminder' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        {getIcon(notification.type)}
                                    </View>

                                    {/* Content */}
                                    <View className="flex-1 pt-0.5">
                                        <View className="flex-row items-start justify-between mb-1">
                                            <Text className={`text-base font-bold flex-1 mr-2 ${notification.isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {notification.title}
                                            </Text>
                                            <Text className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap mt-1">
                                                {notification.timestamp}
                                            </Text>
                                        </View>

                                        <Text className="text-sm text-gray-600 dark:text-gray-400 leading-5">
                                            {notification.message}
                                        </Text>
                                    </View>

                                    {/* Unread Dot */}
                                    {notification.isUnread && (
                                        <View className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}

                        {notifications.length === 0 && (
                            <View className="items-center justify-center py-20">
                                <View className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 items-center justify-center mb-4">
                                    <Bell size={32} color="#d1d5db" />
                                </View>
                                <Text className="text-gray-500 font-medium">No notifications yet</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </Animated.View>
        </GestureDetector>
        </View>
    );
}
