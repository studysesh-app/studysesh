import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react-native';
import { useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ChangePasswordScreenProps {
    onBack: () => void;
    onSave: (currentPassword: string, newPassword: string) => void;
    isDarkMode?: boolean;
}

export function ChangePasswordScreen({ onBack, onSave, isDarkMode = false }: ChangePasswordScreenProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSave = () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }
        onSave(currentPassword, newPassword);
    };

    const meetsRequirements = newPassword.length >= 8;

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
                <Animated.View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} style={animatedStyle}>
                    <ScrollView className="flex-1 px-4 pt-6">
                        <View className="flex-row items-center mb-6 relative">
                            <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                                <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                            </TouchableOpacity>
                            <Text className={`flex-1 text-center text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Change Password
                            </Text>
                        </View>
                        <View className="gap-6">
                            {/* Current Password */}
                            <View>
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Current Password
                                </Text>
                                <View className="relative">
                                    <TextInput
                                        secureTextEntry={!showCurrent}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        placeholder="Enter current password"
                                        placeholderTextColor="#9ca3af"
                                        className={`w-full px-4 py-3 pr-12 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl`}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-3.5"
                                    >
                                        {showCurrent ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* New Password */}
                            <View>
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    New Password
                                </Text>
                                <View className="relative">
                                    <TextInput
                                        secureTextEntry={!showNew}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="Enter new password"
                                        placeholderTextColor="#9ca3af"
                                        className={`w-full px-4 py-3 pr-12 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl`}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-3.5"
                                    >
                                        {showNew ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View>
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Confirm New Password
                                </Text>
                                <View className="relative">
                                    <TextInput
                                        secureTextEntry={!showConfirm}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Confirm new password"
                                        placeholderTextColor="#9ca3af"
                                        className={`w-full px-4 py-3 pr-12 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl`}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-3.5"
                                    >
                                        {showConfirm ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Password Requirements */}
                            <View className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border rounded-xl p-4`}>
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Password Requirements
                                </Text>
                                <View className="flex-row items-center gap-2">
                                    <View
                                        className={`w-4 h-4 rounded-full items-center justify-center ${meetsRequirements ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                    >
                                        {meetsRequirements && <Check size={10} color="white" />}
                                    </View>
                                    <Text className={`text-sm ${meetsRequirements ? 'text-green-600' : 'text-gray-500'}`}>
                                        At least 8 characters
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Save Button */}
                    <View className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={!currentPassword || !newPassword || !confirmPassword || !meetsRequirements}
                            className={`w-full py-4 rounded-full shadow-sm ${!currentPassword || !newPassword || !confirmPassword || !meetsRequirements
                                ? isDarkMode ? 'bg-gray-800' : 'bg-gray-300'
                                : 'bg-red-600'
                                }`}
                        >
                            <Text className={`text-center text-base font-semibold ${!currentPassword || !newPassword || !confirmPassword || !meetsRequirements
                                ? 'text-gray-500'
                                : 'text-white'
                                }`}>
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}
