import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useState } from 'react';

interface ForgotPasswordScreenProps {
    onBack: () => void;
    onSendCode: (email: string) => void | Promise<void>;
}

export function ForgotPasswordScreen({ onBack, onSendCode }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendCode = async () => {
        setError(null);
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setIsLoading(true);
        await onSendCode(email.trim().toLowerCase());
        setIsLoading(false);
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
                            Reset Password
                        </Text>
                    </View>
                    <View className="max-w-sm mx-auto w-full">
                        <View className="items-center mb-8">
                            <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4">
                                <Mail size={40} color="#db2321" />
                            </View>
                            <Text className="text-base text-center text-gray-500 px-4">
                                Enter your email address and we'll send you a code to reset your password.
                            </Text>
                        </View>

                        {/* Email Field */}
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Email Address
                            </Text>
                            <View className="relative">
                                <View className="absolute left-4 top-3.5 z-10">
                                    <Mail size={20} color="#9ca3af" />
                                </View>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="your.name@cmail.carleton.ca"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                />
                            </View>
                        </View>

                        {/* Send Button */}
                        <TouchableOpacity
                            onPress={handleSendCode}
                            className="w-full py-4 bg-red-600 rounded-full mb-4 shadow-lg"
                        >
                            <Text className="text-white text-center text-base font-semibold">
                                Send Reset Code
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
