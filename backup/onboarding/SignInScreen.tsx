import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';

interface SignInScreenProps {
    onBack: () => void;
    onSignIn: (email: string, password: string) => void;
    onSignUpLink: () => void;
}

export function SignInScreen({ onBack, onSignIn, onSignUpLink }: SignInScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = () => {
        onSignIn(email || 'demo@carleton.ca', password || 'password123');
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Sign In
                        </Text>
                    </View>
                    <View className="max-w-sm mx-auto w-full">
                        <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                            Welcome Back
                        </Text>
                        <Text className="text-base text-center text-gray-500 mb-8">
                            Sign in to continue learning
                        </Text>

                        {/* Email Field */}
                        <View className="mb-4">
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
                                    placeholder="your.email@carleton.ca"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                />
                            </View>
                        </View>

                        {/* Password Field */}
                        <View className="mb-2">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Password
                            </Text>
                            <View className="relative">
                                <View className="absolute left-4 top-3.5 z-10">
                                    <Lock size={20} color="#9ca3af" />
                                </View>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry={!showPassword}
                                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5"
                                >
                                    {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Forgot Password Link */}
                        <TouchableOpacity className="mb-6 items-end">
                            <Text className="text-red-600 text-sm">
                                Forgot password?
                            </Text>
                        </TouchableOpacity>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            onPress={handleSignIn}
                            className="w-full py-4 bg-red-600 rounded-full mb-4 shadow-lg"
                        >
                            <Text className="text-white text-center text-base font-semibold">
                                Sign In
                            </Text>
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <View className="flex-row justify-center">
                            <Text className="text-gray-500 text-sm">
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={onSignUpLink}>
                                <Text className="text-red-600 text-sm font-semibold">
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
