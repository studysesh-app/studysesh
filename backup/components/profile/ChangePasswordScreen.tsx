import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react-native';
import { useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

interface ChangePasswordScreenProps {
    onBack: () => void;
    onSave: (currentPassword: string, newPassword: string) => void;
}

export function ChangePasswordScreen({ onBack, onSave }: ChangePasswordScreenProps) {
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
                            Change Password
                        </Text>
                    </View>
                    <View className="gap-6">
                        {/* Current Password */}
                        <View>
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Current Password
                            </Text>
                            <View className="relative">
                                <TextInput
                                    secureTextEntry={!showCurrent}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor="#9ca3af"
                                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
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
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                New Password
                            </Text>
                            <View className="relative">
                                <TextInput
                                    secureTextEntry={!showNew}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#9ca3af"
                                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
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
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Confirm New Password
                            </Text>
                            <View className="relative">
                                <TextInput
                                    secureTextEntry={!showConfirm}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#9ca3af"
                                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
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
                        <View className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
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
                <View className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!currentPassword || !newPassword || !confirmPassword || !meetsRequirements}
                        className={`w-full py-4 rounded-full shadow-sm ${!currentPassword || !newPassword || !confirmPassword || !meetsRequirements
                            ? 'bg-gray-300 dark:bg-gray-700'
                            : 'bg-red-600'
                            }`}
                    >
                        <Text className="text-center text-white text-base font-semibold">
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GestureDetector>
    );
}
