import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ChangeEmailScreenProps {
    currentEmail: string;
    onBack: () => void;
    onSave: (newEmail: string, currentPassword: string) => void;
    isDarkMode?: boolean;
}

export function ChangeEmailScreen({ currentEmail, onBack, onSave, isDarkMode = false }: ChangeEmailScreenProps) {
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);

    const handleSave = () => {
        if (!isValidEmail) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }
        if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
            Alert.alert('Error', 'That is already your current email');
            return;
        }
        onSave(newEmail, currentPassword);
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
                    <ScrollView className="flex-1 px-4 pt-6">
                        <View className="flex-row items-center mb-6 relative">
                            <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                                <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                            </TouchableOpacity>
                            <Text className={`flex-1 text-center text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Change Email
                            </Text>
                        </View>
                        <View className="gap-6">
                            <View>
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Current Email
                                </Text>
                                <Text className="text-sm text-gray-500">{currentEmail}</Text>
                            </View>

                            <View>
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    New Email
                                </Text>
                                <View className="relative flex-row items-center">
                                    <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, zIndex: 1 }} />
                                    <TextInput
                                        value={newEmail}
                                        onChangeText={setNewEmail}
                                        placeholder="your.name@cmail.carleton.ca"
                                        placeholderTextColor="#9ca3af"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        className={`w-full pl-11 pr-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl`}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Current Password
                                </Text>
                                <View className="relative">
                                    <TextInput
                                        secureTextEntry={!showPassword}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        placeholder="Confirm with your current password"
                                        placeholderTextColor="#9ca3af"
                                        className={`w-full px-4 py-3 pr-12 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl`}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5"
                                    >
                                        {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={!newEmail || !currentPassword}
                            className={`w-full py-4 rounded-full shadow-sm ${!newEmail || !currentPassword
                                ? isDarkMode ? 'bg-gray-800' : 'bg-gray-300'
                                : 'bg-red-600'
                                }`}
                        >
                            <Text className={`text-center text-base font-semibold ${!newEmail || !currentPassword ? 'text-gray-500' : 'text-white'
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
