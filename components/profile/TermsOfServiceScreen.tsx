import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface TermsOfServiceScreenProps {
    onBack: () => void;
    isDarkMode?: boolean;
}

export function TermsOfServiceScreen({ onBack, isDarkMode = false }: TermsOfServiceScreenProps) {
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
                                Terms of Service
                            </Text>
                        </View>
                        <View className="gap-6 pb-8">
                            <Text className="text-sm text-gray-500">
                                Last updated: March 11, 2026
                            </Text>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    1. Acceptance of Terms
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    By creating an account and using studysesh, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    2. User Eligibility
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    To use studysesh, you must:
                                </Text>
                                <View className="gap-2 pl-4">
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Be a currently enrolled student at Carleton University</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Have a valid @cmail.carleton.ca email address</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Provide accurate and truthful information in your profile</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Maintain the confidentiality of your account credentials</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Be at least 17 years of age</Text>
                                </View>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    3. User Conduct
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    All users agree to:
                                </Text>
                                <View className="gap-2 pl-4">
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Treat all other users with respect and courtesy</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Not post offensive, discriminatory, or inappropriate content on course boards</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Not use the messaging system to harass, spam, or threaten other users</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Not create fake accounts or impersonate other students</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Not use studysesh to facilitate academic dishonesty or cheating</Text>
                                </View>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    4. Tutor Responsibilities
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    Users who register as tutors additionally agree to:
                                </Text>
                                <View className="gap-2 pl-4">
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Provide truthful proof of qualification for courses they wish to tutor</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Set fair and accurate pricing for their services</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Not assist students with graded assignments, exams, or any form of academic fraud</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Maintain professional conduct in all interactions</Text>
                                </View>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    5. Payments and Pricing
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    studysesh does not process payments. Tutor pricing displayed in the app is for informational purposes only. All payment arrangements between students and tutors (e-transfer, cash, etc.) are made independently and at the users' own risk. studysesh is not responsible for payment disputes between users.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    6. Content and Posts
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    By posting content on course boards, you grant studysesh a non-exclusive license to display that content within the app. You retain ownership of your content. We reserve the right to remove any content that violates these terms or is reported by other users.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    7. Connections and Blocking
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    studysesh allows you to connect with classmates and block users you do not wish to interact with. Blocked users cannot see your profile, send you messages, or view your posts. You can unblock users at any time.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    8. Limitation of Liability
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    studysesh facilitates connections between students but is not responsible for the quality of tutoring services, academic outcomes, payment disputes, or any interactions that occur between users outside the app.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    9. Account Termination
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    We reserve the right to suspend or permanently delete accounts that violate these terms, submit fraudulent tutor verification documents, engage in harassment, or are reported by multiple users. You may also delete your own account at any time through Settings.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    10. Changes to Terms
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    We may update these Terms of Service from time to time. Continued use of studysesh after changes are posted constitutes acceptance of the updated terms.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    11. Contact
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Questions about these Terms of Service? Contact us at ksmavai2005@gmail.com
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}
