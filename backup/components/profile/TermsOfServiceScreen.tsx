import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

interface TermsOfServiceScreenProps {
    onBack: () => void;
}

export function TermsOfServiceScreen({ onBack }: TermsOfServiceScreenProps) {
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
                            Terms of Service
                        </Text>
                    </View>
                    <View className="gap-6 pb-8">
                        <Text className="text-sm text-gray-500">
                            Last updated: November 19, 2025
                        </Text>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                1. Acceptance of Terms
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white">
                                By accessing and using this peer tutoring platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                2. User Eligibility
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white mb-3">
                                To use this platform, you must:
                            </Text>
                            <View className="gap-2 pl-4">
                                <Text className="text-base text-gray-900 dark:text-white">• Be a currently enrolled university student</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Provide accurate and truthful information</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Maintain the confidentiality of your account</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Be at least 18 years old or have parental consent</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                3. Tutor Responsibilities
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white mb-3">
                                Tutors agree to:
                            </Text>
                            <View className="gap-2 pl-4">
                                <Text className="text-base text-gray-900 dark:text-white">• Provide accurate information about their qualifications</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Submit proof of course completion for courses they tutor</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Maintain professional conduct during all sessions</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Honor confirmed bookings or provide reasonable notice of cancellation</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Not engage in academic dishonesty or assist students in cheating</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                4. Student Responsibilities
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white mb-3">
                                Students agree to:
                            </Text>
                            <View className="gap-2 pl-4">
                                <Text className="text-base text-gray-900 dark:text-white">• Treat tutors with respect</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Attend confirmed sessions or provide notice of cancellation</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Use tutoring services for learning support, not academic dishonesty</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Provide honest feedback about tutoring experiences</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                5. Prohibited Conduct
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white mb-3">
                                Users may not:
                            </Text>
                            <View className="gap-2 pl-4">
                                <Text className="text-base text-gray-900 dark:text-white">• Harass, threaten, or abuse other users</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Share inappropriate or offensive content</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Attempt to manipulate pricing or availability</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Use the platform for purposes other than legitimate tutoring</Text>
                                <Text className="text-base text-gray-900 dark:text-white">• Circumvent the platform to avoid service fees</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                6. Cancellation and Refunds
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white">
                                Cancellations made more than 24 hours before a session are eligible for a full refund. Cancellations within 24 hours may incur fees. No-shows without notice forfeit payment.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                7. Platform Fees
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white">
                                The platform may charge service fees on bookings. These fees will be clearly displayed before booking confirmation.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                8. Limitation of Liability
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white">
                                The platform facilitates connections between students and tutors but is not responsible for the quality of tutoring services, academic outcomes, or disputes between users.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                9. Termination
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white">
                                We reserve the right to suspend or terminate accounts that violate these terms or engage in inappropriate behavior.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                10. Contact
                            </Text>
                            <Text className="text-base text-gray-900 dark:text-white">
                                Questions about these Terms of Service? Contact us at ksmavai2005@gmail.com
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </GestureDetector>
    );
}
