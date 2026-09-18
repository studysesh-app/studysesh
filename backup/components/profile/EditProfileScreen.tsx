import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useState, useRef } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

interface EditProfileScreenProps {
    name: string;
    pronouns: string;
    year: string;
    program: string;
    bio?: string;
    initial: string;
    isTutor: boolean;
    onBack: () => void;
    onSave: (data: {
        name: string;
        pronouns: string;
        year: string;
        program: string;
        bio?: string;
    }) => void;
}

export function EditProfileScreen({
    name: initialName,
    pronouns: initialPronouns,
    year: initialYear,
    program: initialProgram,
    bio: initialBio,
    initial,
    isTutor,
    onBack,
    onSave,
}: EditProfileScreenProps) {
    const [name, setName] = useState(initialName);
    const [pronouns, setPronouns] = useState(initialPronouns);
    const [year, setYear] = useState(initialYear);
    const [program, setProgram] = useState(initialProgram);
    const [bio, setBio] = useState(initialBio || '');
    const scrollViewRef = useRef<ScrollView>(null);
    const programInputRef = useRef<TextInput>(null);
    const bioInputRef = useRef<TextInput>(null);

    const handleSave = () => {
        onSave({ name, pronouns, year, program, bio: isTutor ? bio : undefined });
    };

    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];
    const pronounOptions = ['He/Him', 'She/Her', 'They/Them'];

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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-4 pt-6"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        <View className="flex-row items-center mb-6 relative">
                            <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                                <ArrowLeft size={24} color="#000" />
                            </TouchableOpacity>
                            <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                                Edit Profile
                            </Text>
                        </View>
                        {/* Photo Section */}
                        <View className="items-center mb-8">
                            <View className="relative mb-3">
                                <View className="w-24 h-24 rounded-full bg-[#500908] items-center justify-center">
                                    <Text className="text-4xl font-semibold text-white">
                                        {initial}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full items-center justify-center border-2 border-white dark:border-gray-900"
                                    onPress={() => alert('Photo picker would open here')}
                                >
                                    <Camera size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => alert('Photo picker would open here')}>
                                <Text className="text-red-600 text-sm font-medium">
                                    Change Photo
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Personal Info */}
                        <View className="gap-6 mb-6">
                            {/* Name */}
                            <View>
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Name
                                </Text>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Your name"
                                    placeholderTextColor="#9ca3af"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                />
                            </View>

                            {/* Pronouns */}
                            <View>
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Pronouns
                                </Text>
                                <View className="flex-row gap-2">
                                    {pronounOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            onPress={() => setPronouns(option)}
                                            className={`flex-1 py-2.5 px-2 rounded-full border items-center justify-center ${pronouns === option
                                                ? 'bg-red-600 border-red-600'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <Text
                                                className={`text-xs font-medium ${pronouns === option ? 'text-white' : 'text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Year */}
                            <View>
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    What year are you?
                                </Text>
                                <View className="flex-row gap-2 flex-wrap">
                                    {years.map((y) => (
                                        <TouchableOpacity
                                            key={y}
                                            onPress={() => setYear(y)}
                                            className={`py-2 px-4 rounded-full border ${year === y
                                                ? 'bg-red-600 border-red-600'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm font-medium ${year === y ? 'text-white' : 'text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                {y}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Program */}
                            <View>
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    What program are you in?
                                </Text>
                                <TextInput
                                    ref={programInputRef}
                                    value={program}
                                    onChangeText={setProgram}
                                    placeholder="e.g., Computer Science"
                                    placeholderTextColor="#9ca3af"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                />
                            </View>

                            {/* Bio (Tutor only) */}
                            {isTutor && (
                                <View>
                                    <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        About
                                    </Text>
                                    <TextInput
                                        ref={bioInputRef}
                                        value={bio}
                                        onChangeText={setBio}
                                        placeholder="Tell students about yourself..."
                                        placeholderTextColor="#9ca3af"
                                        multiline
                                        numberOfLines={4}
                                        maxLength={300}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white min-h-[120px] text-top"
                                        textAlignVertical="top"
                                        onFocus={() => {
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollToEnd({ animated: true });
                                            }, 300);
                                        }}
                                    />
                                    <Text className="text-right text-xs text-gray-500 mt-1">
                                        {bio.length}/300
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Save Button */}
                <View className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="w-full py-4 bg-red-600 rounded-full shadow-sm"
                    >
                        <Text className="text-center text-white text-base font-semibold">
                            Save Changes
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GestureDetector>
    );
}
