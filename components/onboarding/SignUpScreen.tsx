import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react-native';
import { useState } from 'react';
import { DEMO_MODE } from '../../lib/demo';

interface SignUpScreenProps {
    role: 'student' | 'tutor';
    onBack: () => void;
    onSignUp: (email: string, password: string) => void | Promise<void>;
    onSignInLink: () => void;
}

export function SignUpScreen({ role, onBack, onSignUp, onSignInLink }: SignUpScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        setError(null);
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (!DEMO_MODE && !email.trim().toLowerCase().endsWith('@cmail.carleton.ca')) {
            setError('Please use your @cmail.carleton.ca email address.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!agreedToTerms) {
            setError('Please agree to the Terms of Service.');
            return;
        }
        setIsLoading(true);
        await onSignUp(email.trim().toLowerCase(), password);
        setIsLoading(false);
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Sign Up
                        </Text>
                    </View>
                    <View className="max-w-sm mx-auto w-full">
                        {/* Role Badge */}
                        <View className="mb-6 items-center">
                            <View className="px-4 py-2 bg-red-50 rounded-full">
                                <Text className="text-red-600 text-sm font-medium">
                                    {role === 'student' ? 'Student Account' : 'Tutor Account'}
                                </Text>
                            </View>
                        </View>

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
                        <View className="mb-4">
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

                        {/* Confirm Password Field */}
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Confirm Password
                            </Text>
                            <View className="relative">
                                <View className="absolute left-4 top-3.5 z-10">
                                    <Lock size={20} color="#9ca3af" />
                                </View>
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry={!showConfirmPassword}
                                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-3.5"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Terms Agreement Checkbox */}
                        <TouchableOpacity
                            onPress={() => setAgreedToTerms(!agreedToTerms)}
                            className="flex-row items-start mb-6"
                        >
                            <View className={`w-5 h-5 rounded border ${agreedToTerms ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'} items-center justify-center mr-3 mt-0.5`}>
                                {agreedToTerms && <Check size={14} color="#fff" />}
                            </View>
                            <Text className="flex-1 text-gray-600 text-sm leading-5">
                                I agree to the <Text className="text-red-600 font-medium">Terms of Service</Text> and <Text className="text-red-600 font-medium">Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            onPress={handleSignUp}
                            className={`w-full py-4 rounded-full mb-4 shadow-lg ${agreedToTerms && !isLoading ? 'bg-red-600' : 'bg-gray-300'}`}
                            disabled={!agreedToTerms || isLoading}
                        >
                            <Text className={`text-center text-base font-semibold ${agreedToTerms ? 'text-white' : 'text-gray-500'}`}>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        {/* Sign In Link */}
                        <View className="flex-row justify-center">
                            <Text className="text-gray-500 text-sm">
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={onSignInLink}>
                                <Text className="text-red-600 text-sm font-semibold">
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
