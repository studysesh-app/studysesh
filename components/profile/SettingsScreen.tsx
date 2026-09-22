import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Dimensions } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SettingsScreenProps {
    email: string;
    isTutor: boolean;
    theme: 'light' | 'dark';
    onBack: () => void;
    onChangePassword: () => void;
    onChangeEmail: () => void;
    onDeleteAccount: () => void;
    onBlockedUsers: () => void;
    onPrivacyPolicy: () => void;
    onTermsOfService: () => void;
    onThemeChange: (theme: 'light' | 'dark') => void;
    onLogout: () => void;
    onNavigate: (screen: any) => void;
}

export function SettingsScreen({
    email,
    isTutor,
    theme,
    onBack,
    onChangePassword,
    onChangeEmail,
    onDeleteAccount,
    onBlockedUsers,
    onPrivacyPolicy,
    onTermsOfService,
    onThemeChange,
}: SettingsScreenProps) {
    const [messageNotifs, setMessageNotifs] = useState(true);

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
                <Animated.View style={[{ flex: 1, backgroundColor: theme === 'dark' ? '#111827' : '#fff' }, animatedStyle]}>
                    <ScrollView className="flex-1 px-4 pt-6">
                        <View className="flex-row items-center mb-6 relative">
                            <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                                <ArrowLeft size={24} color={theme === 'dark' ? '#fff' : '#000'} />
                            </TouchableOpacity>
                            <Text className={`flex-1 text-center text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Settings
                            </Text>
                        </View>
                        {/* Account Section */}
                        <View className="mb-8">
                            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Account Settings
                            </Text>
                            <View className={`border rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                {/* Email */}
                                <View className={`p-4 border-b flex-row items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <View>
                                        <Text className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            Email
                                        </Text>
                                        <Text className="text-sm text-gray-500">
                                            {email}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={onChangeEmail}>
                                        <Text className="text-red-600 text-sm font-medium">
                                            Change
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Password */}
                                <TouchableOpacity
                                    onPress={onChangePassword}
                                    className={`p-4 flex-row items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                    <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Change Password
                                    </Text>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Preferences Section */}
                        <View className="mb-8">
                            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                App Preferences
                            </Text>
                            <View className={`border rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                {/* Theme */}
                                <View className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <Text className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Theme
                                    </Text>
                                    <View className="flex-row gap-2">
                                        {(['light', 'dark'] as const).map((option) => (
                                            <TouchableOpacity
                                                key={option}
                                                onPress={() => onThemeChange(option)}
                                                className={`flex-1 py-2 px-3 rounded-lg border items-center justify-center ${theme === option
                                                    ? theme === 'dark' ? 'bg-red-900/40 border-red-800' : 'bg-red-50 border-red-200'
                                                    : theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-sm font-medium ${theme === option
                                                        ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                                        : theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                                                        }`}
                                                >
                                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Notifications */}
                                <View className="p-4 gap-4">
                                    <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                                        Notifications
                                    </Text>
                                    <View className="flex-row items-center justify-between">
                                        <Text className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            Message notifications
                                        </Text>
                                        <Switch
                                            value={messageNotifs}
                                            onValueChange={setMessageNotifs}
                                            trackColor={{ false: '#767577', true: '#db2321' }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>


                        {/* Privacy Section */}
                        <View className="mb-8">
                            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Privacy & Security
                            </Text>
                            <View className={`border rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <TouchableOpacity
                                    onPress={onBlockedUsers}
                                    className={`p-4 border-b flex-row items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                    <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Blocked Users
                                    </Text>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onPrivacyPolicy}
                                    className={`p-4 border-b flex-row items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                    <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Privacy Policy
                                    </Text>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onTermsOfService}
                                    className={`p-4 border-b flex-row items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                    <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Terms of Service
                                    </Text>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert(
                                            'Delete Account',
                                            'Are you sure you want to delete your account? This action cannot be undone.',
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Delete', style: 'destructive', onPress: onDeleteAccount }
                                            ]
                                        );
                                    }}
                                    className="p-4 flex-row items-center justify-center"
                                >
                                    <Text className="text-red-600 text-sm font-medium">
                                        Delete Account
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Support Section */}
                        <View className="mb-8">
                            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Help & Support
                            </Text>
                            <View className={`border rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <TouchableOpacity
                                    onPress={() => alert('Contact Support')}
                                    className={`p-4 border-b flex-row items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                    <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Contact Support
                                    </Text>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => alert('Report a Problem')}
                                    className={`p-4 border-b flex-row items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                    <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Report a Problem
                                    </Text>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </TouchableOpacity>
                                <View className="p-4 items-center">
                                    <Text className="text-xs text-gray-500">
                                        Version 1.0.0
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}
