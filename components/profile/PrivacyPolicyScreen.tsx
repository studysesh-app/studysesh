import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface PrivacyPolicyScreenProps {
    onBack: () => void;
    isDarkMode?: boolean;
}

export function PrivacyPolicyScreen({ onBack, isDarkMode = false }: PrivacyPolicyScreenProps) {
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
                                Privacy Policy
                            </Text>
                        </View>
                        <View className="gap-6 pb-8">
                            <Text className="text-sm text-gray-500">
                                Last updated: March 11, 2026
                            </Text>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    1. Information We Collect
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    studysesh collects information you provide directly to us, including:
                                </Text>
                                <View className="gap-2 pl-4">
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Name, university email (@cmail.carleton.ca), and profile information</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Academic information (courses, program, year of study)</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Gender identity and pronouns (used for profile visibility preferences)</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Profile prompts and personality answers</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Messages exchanged between users</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Posts, comments, and interactions on course boards</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Profile photos and tutor proof documents</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Connection and blocking history</Text>
                                </View>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    2. How We Use Your Information
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    We use the information we collect to:
                                </Text>
                                <View className="gap-2 pl-4">
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Provide, maintain, and improve studysesh</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Match you with classmates who share your courses</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Display course-specific tutors and their pricing</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Enforce profile visibility preferences (e.g., women and non-binary only)</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Send push notifications about connections, messages, and activity</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Ensure platform safety and prevent abuse</Text>
                                </View>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    3. Information Sharing
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    We do not sell your personal information. We share information only:
                                </Text>
                                <View className="gap-2 pl-4">
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• With other users as part of normal app functionality (e.g., your profile card, posts, messages)</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• With service providers (Supabase for data hosting, Expo for push notifications)</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• With law enforcement when required by applicable law</Text>
                                </View>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    4. Gender and Visibility
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    studysesh allows users who identify as women or non-binary to restrict their profile visibility to other women and non-binary users only. Your gender identity is used solely for this purpose and is never shared publicly or sold to third parties.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    5. Data Security
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Your data is stored securely using Supabase (hosted on AWS). We use row-level security policies, encrypted connections, and authentication tokens to protect your information. However, no system is 100% secure, and we cannot guarantee absolute security.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    6. Your Rights
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    You have the right to:
                                </Text>
                                <View className="gap-2 pl-4">
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Access and update your personal information at any time</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Delete your account and all associated data</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Block other users and control who can see your profile</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Opt out of push notifications</Text>
                                    <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>• Request a copy of your data</Text>
                                </View>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    7. Data Retention
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    We retain your data for as long as your account is active. When you delete your account, all your personal data, posts, messages, and connections are permanently removed within 30 days.
                                </Text>
                            </View>

                            <View>
                                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                                    8. Contact Us
                                </Text>
                                <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    If you have questions about this Privacy Policy, please contact us at ksmavai2005@gmail.com
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}
