import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, Check, Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';

interface SetNewPasswordScreenProps {
    onCancel: () => void | Promise<void>;
    onSubmit: (newPassword: string) => Promise<string | null>;
}

export function SetNewPasswordScreen({ onCancel, onSubmit }: SetNewPasswordScreenProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const meetsRequirements = newPassword.length >= 8;

    const handleSubmit = async () => {
        setError(null);
        if (!meetsRequirements) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setIsLoading(true);
        const submitError = await onSubmit(newPassword);
        setIsLoading(false);
        if (submitError) {
            setError(submitError);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onCancel} disabled={isLoading} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Set New Password
                        </Text>
                    </View>
                    <View className="max-w-sm mx-auto w-full">
                        <View className="items-center mb-8">
                            <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4">
                                <Lock size={40} color="#db2321" />
                            </View>
                            <Text className="text-base text-center text-gray-500 px-4">
                                Enter a new password for your account.
                            </Text>
                        </View>

                        <View className="mb-4">
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
                                    autoCapitalize="none"
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

                        <View className="mb-4">
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
                                    autoCapitalize="none"
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

                        <View className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Password Requirements
                            </Text>
                            <View className="flex-row items-center gap-2">
                                <View
                                    className={`w-4 h-4 rounded-full items-center justify-center ${
                                        meetsRequirements ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                >
                                    {meetsRequirements && <Check size={10} color="white" />}
                                </View>
                                <Text className={`text-sm ${meetsRequirements ? 'text-green-600' : 'text-gray-500'}`}>
                                    At least 8 characters
                                </Text>
                            </View>
                        </View>

                        {error && (
                            <Text className="text-sm text-red-600 text-center mb-4">
                                {error}
                            </Text>
                        )}

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isLoading || !newPassword || !confirmPassword}
                            className={`w-full py-4 rounded-full mb-4 shadow-lg ${
                                isLoading || !newPassword || !confirmPassword ? 'bg-gray-300 dark:bg-gray-700' : 'bg-red-600'
                            }`}
                        >
                            <Text className="text-white text-center text-base font-semibold">
                                {isLoading ? 'Updating Password...' : 'Update Password'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
