import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';

interface CodeVerificationScreenProps {
    target: string; // email or phone number
    method: 'email' | 'phone';
    onBack: () => void;
    onVerify: (code: string) => void | Promise<void>;
    onResendCode: () => void | Promise<void>;
    onPhoneVerify?: () => void;
}

export function CodeVerificationScreen({ target, method, onBack, onVerify, onResendCode, onPhoneVerify }: CodeVerificationScreenProps) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleCodeChange = (text: string, index: number) => {
        // Only allow digits
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        const newCode = [...code];
        newCode[index] = digit;
        setCode(newCode);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        // No auto-submit - user must click Verify button
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        if (canResend) {
            setCanResend(false);
            setResendTimer(60);
            onResendCode();
        }
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            alert('Please enter the full 6-digit code.');
            return;
        }
        setIsLoading(true);
        await onVerify(fullCode);
        setIsLoading(false);
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
                    {/* Header */}
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Verify {method === 'email' ? 'Email' : 'Phone'}
                        </Text>
                    </View>

                    <View className="max-w-sm mx-auto w-full flex-1">
                        {/* Icon */}
                        <View className="items-center mb-6">
                            <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center">
                                {method === 'email' ? (
                                    <Mail size={40} color="#db2321" />
                                ) : (
                                    <MessageSquare size={40} color="#db2321" />
                                )}
                            </View>
                        </View>

                        {/* Instructions */}
                        <Text className="text-base text-center text-gray-500 mb-2">
                            We've sent a 6-digit code to
                        </Text>
                        <Text className="text-base text-center text-gray-900 dark:text-white font-semibold mb-8">
                            {target}
                        </Text>

                        {/* Code Input */}
                        <View className="flex-row justify-center gap-2 mb-6">
                            {code.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref: TextInput | null) => {
                                        if (ref) inputRefs.current[index] = ref;
                                    }}
                                    value={digit}
                                    onChangeText={(text) => handleCodeChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    className="w-12 h-14 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center text-2xl font-bold text-gray-900 dark:text-white"
                                    style={{ fontSize: 24 }}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {/* Spam notice */}
                        <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-6">
                            <Text className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                                💡 Check your spam/junk folder if you don't see the email
                            </Text>
                        </View>

                        {/* Resend */}
                        <View className="items-center mb-8">
                            {canResend ? (
                                <TouchableOpacity
                                    onPress={handleResend}
                                    className="flex-row items-center gap-2"
                                >
                                    <Text className="text-red-600 font-semibold">
                                        Resend Code
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <Text className="text-gray-500 text-sm">
                                    Resend code in {resendTimer}s
                                </Text>
                            )}
                        </View>

                        {/* Verify Button */}
                        <TouchableOpacity
                            onPress={handleVerify}
                            disabled={code.join('').length !== 6 || isLoading}
                            className={`w-full py-4 rounded-full shadow-lg ${code.join('').length === 6 && !isLoading
                                ? 'bg-red-600'
                                : 'bg-gray-300'
                                }`}
                        >
                            <Text className="text-white text-center text-base font-semibold">
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </Text>
                        </TouchableOpacity>

                        {/* Alternative method */}
                        <TouchableOpacity className="mt-6" onPress={onPhoneVerify}>
                            <Text className="text-center text-gray-500 text-sm">
                                Didn't receive it?{' '}
                                <Text className="text-red-600 font-semibold">Try phone verification</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
