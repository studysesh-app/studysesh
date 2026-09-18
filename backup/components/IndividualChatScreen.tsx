import { View, Text, TouchableOpacity, ScrollView, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import { ArrowLeft, User, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

export interface Message {
    id: string;
    message: string;
    timestamp: string;
    isStudent: boolean;
    status?: 'sent' | 'delivered' | 'read';
}

interface IndividualChatScreenProps {
    tutorName: string;
    tutorInitial: string;
    messages: Message[];
    onBack: () => void;
    onSendMessage: (message: string) => void;
    onViewProfile?: () => void;
    isTutorView?: boolean;
}

export function IndividualChatScreen({
    tutorName,
    tutorInitial,
    messages,
    onBack,
    onSendMessage,
    onViewProfile,
    isTutorView,
}: IndividualChatScreenProps) {
    const scrollViewRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();

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

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Re-added keyboard listener to ensure visibility
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );

        return () => {
            keyboardWillShow.remove();
        };
    }, []);

    return (
        <GestureDetector gesture={swipeGesture}>
            <View className="flex-1 bg-white dark:bg-gray-900">
                {/* Header - Gradient Fade */}
                <View className="absolute top-0 left-0 right-0 z-20">
                    {/* Gradient Background Layer - Independent of content */}
                    <LinearGradient
                        // EDIT HERE: Gradient Colors - Solid white then smooth fade
                        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
                        // EDIT HERE: Locations - Solid until 60% (150px), then fade
                        locations={[0, 0.6, 1]}
                        // EDIT HERE: Height - Increased to 250px for longer smooth fade
                        style={{
                            height: 170,
                            width: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0
                        }}
                    />

                    {/* Header Content Layer */}
                    <View
                        className="px-4 pb-4"
                        style={{ paddingTop: insets.top - 25 }} // Reduced padding to move name up
                    >
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={onBack}
                                className="w-10 h-10 rounded-full items-center justify-center bg-gray-100 dark:bg-gray-800"
                            >
                                <ArrowLeft size={24} color="#000" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onViewProfile}
                                disabled={!onViewProfile}
                                className="flex-col items-center justify-center"
                                style={{ gap: 6 }}
                            >
                                <View className="w-14 h-14 rounded-full items-center justify-center shadow-sm bg-[#db2321]">
                                    <Text className="text-white font-bold text-xl">
                                        {tutorInitial}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-1.5">
                                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                        {tutorName}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View className="w-10" />
                        </View>
                    </View>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 55 : 0}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-4"
                        contentContainerStyle={{
                            paddingTop: 140, // Increased to ensure no overlap with solid header
                            paddingBottom: 10 // Reduced padding below last message
                        }}
                    >
                        {messages.length === 0 ? (
                            <View className="items-center justify-center py-12">
                                <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
                                    <User size={28} color="#9ca3af" />
                                </View>
                                <Text className="text-sm text-gray-500 text-center">
                                    Start your conversation with {tutorName}
                                </Text>
                            </View>
                        ) : (
                            messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg.message}
                                    timestamp={msg.timestamp}
                                    isStudent={msg.isStudent}
                                    status={msg.status}
                                    isTutorView={isTutorView}
                                />
                            ))
                        )}
                    </ScrollView>

                    <ChatInput onSend={onSendMessage} />
                </KeyboardAvoidingView>
            </View>
        </GestureDetector>
    );
}
