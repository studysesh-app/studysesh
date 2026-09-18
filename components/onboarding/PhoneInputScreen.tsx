import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, MessageSquare as Phone } from 'lucide-react-native';
import { useState } from 'react';

interface PhoneInputScreenProps {
    onBack: () => void;
    onSendCode: (phone: string) => void;
}

export function PhoneInputScreen({ onBack, onSendCode }: PhoneInputScreenProps) {
    const [phone, setPhone] = useState('');

    const handleSendCode = () => {
        // Mock validation
        onSendCode(phone || '613-555-0123');
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Verify Phone
                        </Text>
                    </View>
                    <View className="max-w-sm mx-auto w-full">
                        <View className="items-center mb-8">
                            <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4">
                                <Phone size={40} color="#db2321" />
                            </View>
                            <Text className="text-base text-center text-gray-500 px-4">
                                Enter your phone number to receive a verification code.
                            </Text>
                        </View>

                        {/* Phone Field */}
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Phone Number
                            </Text>
                            <View className="relative flex-row gap-2">
                                <View className="w-20 justify-center items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                                    <Text className="text-gray-900 dark:text-white font-medium">+1</Text>
                                </View>
                                <View className="flex-1 relative">
                                    <TextInput
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder="(613) 555-0123"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="phone-pad"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Send Button */}
                        <TouchableOpacity
                            onPress={handleSendCode}
                            className="w-full py-4 bg-red-600 rounded-full mb-4 shadow-lg"
                        >
                            <Text className="text-white text-center text-base font-semibold">
                                Send Verification Code
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-xs text-gray-400 text-center mt-4">
                            Standard message and data rates may apply.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
