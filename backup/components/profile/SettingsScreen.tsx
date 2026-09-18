import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

interface SettingsScreenProps {
    email: string;
    isTutor: boolean;
    theme: 'light' | 'dark';
    onBack: () => void;
    onChangePassword: () => void;
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
    onPrivacyPolicy,
    onTermsOfService,
    onThemeChange,
}: SettingsScreenProps) {
    const [messageNotifs, setMessageNotifs] = useState(true);

    // Swipe gesture handler
    const translateX = useSharedValue(0);

    const swipeGesture = Gesture.Pan()
        .activeOffsetX(10) // Only activate when swiping horizontally
        .failOffsetY([-10, 10]) // Fail if swiping vertically more than 10px
        .onUpdate((e) => {
            // Only allow right swipe (positive translationX)
            if (e.translationX > 0) {
                translateX.value = e.translationX;
            }
        })
        .onEnd((e) => {
            // If swiped right more than 100px, trigger back
            if (e.translationX > 100) {
                runOnJS(onBack)();
            }
            translateX.value = 0;
        });

    return (
        <GestureDetector gesture={swipeGesture}>
            <View className="flex-1 bg-white dark:bg-gray-900">
                <ScrollView className="flex-1 px-4 pt-6">
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Settings
                        </Text>
                    </View>
                    {/* Account Section */}
                    <View className="mb-8">
                        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Account Settings
                        </Text>
                        <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                            {/* Email */}
                            <View className="p-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between">
                                <View>
                                    <Text className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                        Email
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        {email}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => alert('Change email flow')}>
                                    <Text className="text-red-600 text-sm font-medium">
                                        Change
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Password */}
                            <TouchableOpacity
                                onPress={onChangePassword}
                                className="p-4 flex-row items-center justify-between"
                            >
                                <Text className="text-sm font-medium text-gray-900 dark:text-white">
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
                        <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                            {/* Theme */}
                            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                    Theme
                                </Text>
                                <View className="flex-row gap-2">
                                    {(['light', 'dark'] as const).map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            onPress={() => onThemeChange(option)}
                                            className={`flex-1 py-2 px-3 rounded-lg border items-center justify-center ${theme === option
                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-600'
                                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm font-medium ${theme === option ? 'text-red-600' : 'text-gray-900 dark:text-white'
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
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                    Notifications
                                </Text>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-sm text-gray-900 dark:text-white">
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
                        <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                            <TouchableOpacity
                                onPress={onPrivacyPolicy}
                                className="p-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
                            >
                                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                                    Privacy Policy
                                </Text>
                                <ChevronRight size={20} color="#9ca3af" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onTermsOfService}
                                className="p-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
                            >
                                <Text className="text-sm font-medium text-gray-900 dark:text-white">
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
                                            { text: 'Delete', style: 'destructive', onPress: () => alert('Delete account flow') }
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
                        <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                            <TouchableOpacity
                                onPress={() => alert('Contact Support')}
                                className="p-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
                            >
                                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                                    Contact Support
                                </Text>
                                <ChevronRight size={20} color="#9ca3af" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => alert('Report a Problem')}
                                className="p-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
                            >
                                <Text className="text-sm font-medium text-gray-900 dark:text-white">
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
            </View>
        </GestureDetector>
    );
}
