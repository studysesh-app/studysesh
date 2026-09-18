import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

interface PrivacyPolicyScreenProps {
    onBack: () => void;
}

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
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
                            Privacy Policy
                        </Text>
                    </View>
                    <View className="gap-6 pb-8">
                        <Text className="text-sm text-gray-500">
                            Last updated: November 19, 2025
                        </Text>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                1. Information We Collect
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white mb-3">
                                We collect information you provide directly to us, including:
                            </Text>
                            <View className="gap-2 pl-4">
                                <Text className="text-base text-gray-900 dark:text-white">• Name, email, and profile information</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Academic information (courses, program, year)</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Communication between students and tutors</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Booking and session history</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                2. How We Use Your Information
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white mb-3">
                                We use the information we collect to:
                            </Text>
                            <View className="gap-2 pl-4">
                                <Text className="text-base text-gray-900 dark:text-white">• Provide, maintain, and improve our services</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Connect students with appropriate tutors</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Send notifications about bookings and sessions</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Ensure platform safety and prevent fraud</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                3. Information Sharing
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white mb-3">
                                We do not sell your personal information. We share information only with:
                            </Text>
                            <View className="gap-2 pl-4">
                                <Text className="text-base text-gray-900 dark:text-white">• Other users as necessary to facilitate sessions</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Service providers who assist in operating our platform</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Law enforcement when required by law</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                4. Data Security
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white">
                                We implement appropriate security measures to protect your personal information. However, no system is 100% secure, and we cannot guarantee absolute security.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                5. Your Rights
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white mb-3">
                                You have the right to:
                            </Text>
                            <View className="gap-2 pl-4">
                                <Text className="text-base text-gray-900 dark:text-white">• Access and update your personal information</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Delete your account and associated data</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Opt out of marketing communications</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Request a copy of your data</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                6. Contact Us
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white">
                                If you have questions about this Privacy Policy, please contact us at ksmavai2005@gmail.com
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </GestureDetector>
    );
}
