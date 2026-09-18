import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';

interface SignInScreenProps {
    onBack: () => void;
    onSignIn: (email: string, password: string) => void | Promise<void>;
    onSignUpLink: () => void;
    onForgotPassword: () => void;
}

export function SignInScreen({ onBack, onSignIn, onSignUpLink, onForgotPassword }: SignInScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setError(null);
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        setIsLoading(true);
        await onSignIn(email.trim().toLowerCase(), password);
        setIsLoading(false);
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

                        {/* Error Message */}
                        {error && (
                            <View className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                                <Text className="text-red-600 text-center text-sm font-medium">
                                    {error}
                                </Text>
                            </View>
                        )}

                        {/* Email Field */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Email Address
                            </Text>
                            <View className="relative">
                                <View className="absolute left-4 top-3.5 z-10">
                                    <Mail size={20} color={error ? '#ef4444' : '#9ca3af'} />
                                </View>
                                <TextInput
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setError(null);
                                    }}
                                    placeholder="your.name@cmail.carleton.ca"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
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
                                    <Lock size={20} color={error ? '#ef4444' : '#9ca3af'} />
                                </View>
                                <TextInput
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setError(null);
                                    }}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry={!showPassword}
                                    className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
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
                        <TouchableOpacity onPress={onForgotPassword} className="mb-6 items-end">
                            <Text className="text-red-600 text-sm">
                                Forgot password?
                            </Text>
                        </TouchableOpacity>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            onPress={handleSignIn}
                            className={`w-full py-4 rounded-full mb-4 shadow-lg ${isLoading ? 'bg-gray-300' : 'bg-red-600'}`}
                            disabled={isLoading}
                        >
                            <Text className="text-white text-center text-base font-semibold">
                                {isLoading ? 'Signing In...' : 'Sign In'}
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
