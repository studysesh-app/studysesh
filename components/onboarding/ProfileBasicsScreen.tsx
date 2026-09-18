import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager, Image } from 'react-native';
import { ArrowLeft, User, UserCircle, BookOpen, Eye } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { SkeuomorphicCoursePicker } from '../ui/SkeuomorphicCoursePicker';
import { PronounSelector } from '../ui/PronounSelector';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProfileBasicsScreenProps {
    onBack: () => void;
    onContinue: (profileData: {
        name: string;
        pronouns: string[];
        gender: string;
        year: string;
        degreeLevel: string;
        major: string;
        profileVisibility?: 'everyone' | 'women-nb-only';
        profileImage?: string | null;
    }) => void;
}

const GENDER_OPTIONS = [
    { label: 'Man', value: 'Man' },
    { label: 'Woman', value: 'Woman' },
    { label: 'Non-Binary', value: 'Non-Binary' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
];

const PRONOUN_OPTIONS = [
    { label: 'he', value: 'He' },
    { label: 'him', value: 'Him' },
    { label: 'she', value: 'She' },
    { label: 'her', value: 'Her' },
    { label: 'they', value: 'They' },
    { label: 'them', value: 'Them' },
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+'];
const DEGREE_OPTIONS = ["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'];

const VISIBILITY_OPTIONS = [
    { label: 'Everyone', value: 'everyone' },
    { label: 'Women & Non-Binary only', value: 'women-nb-only' },
];

export function ProfileBasicsScreen({ onBack, onContinue }: ProfileBasicsScreenProps) {
    const [name, setName] = useState('');
    const [pronouns, setPronouns] = useState<string[]>([]);
    const [gender, setGender] = useState<string[]>([]); // Array for PronounSelector compatibility
    const [year, setYear] = useState('');
    const [degreeLevel, setDegreeLevel] = useState('');
    const [major, setMajor] = useState('');
    const [profileVisibility, setProfileVisibility] = useState<string[]>(['everyone']);
    const [image, setImage] = useState<string | null>(null);

    const scrollViewRef = useRef<ScrollView>(null);

    // Check if user selected Woman or Non-Binary
    const showVisibilityOption = gender.length > 0 && (gender[0] === 'Woman' || gender[0] === 'Non-Binary');

    // Animate visibility section appearance/disappearance
    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [showVisibilityOption]);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // Handle gender selection - single select (max 1)
    const handleGenderSelect = (values: string[]) => {
        // Only keep the last selected value (single select behavior)
        if (values.length > 1) {
            setGender([values[values.length - 1]]);
        } else {
            setGender(values);
        }
    };

    // Handle visibility selection - single select (max 1)
    const handleVisibilitySelect = (values: string[]) => {
        if (values.length > 1) {
            setProfileVisibility([values[values.length - 1]]);
        } else if (values.length === 0) {
            setProfileVisibility(['everyone']); // Default to everyone if deselected
        } else {
            setProfileVisibility(values);
        }
    };

    const isValid = name.trim() && pronouns.length > 0 && gender.length > 0 && year && degreeLevel && major.trim();

    const handleContinue = () => {
        // DEV: bypassed validation for testing (was: if (isValid))
        if (true) {
            onContinue({
                name: name.trim() || 'Test User', // DEV: fallback
                pronouns: pronouns.length > 0 ? pronouns : ['they/them'], // DEV: fallback
                gender: gender[0] || 'Prefer not to say', // DEV: fallback
                year: year || '1st Year', // DEV: fallback
                degreeLevel: degreeLevel || "Bachelor's", // DEV: fallback
                major: major.trim() || 'Computer Science', // DEV: fallback
                profileVisibility: showVisibilityOption ? (profileVisibility[0] as 'everyone' | 'women-nb-only') : undefined,
                profileImage: image
            });
        }
    };

    // Scroll to input when focused - scrolls to end to ensure visibility
    const handleMajorFocus = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-4 pt-6"
                    contentContainerStyle={{ paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Complete Profile
                        </Text>
                    </View>

                    {/* Progress */}
                    <View className="flex-row gap-2 mb-4">
                        <View className="flex-1 h-1 rounded-full bg-red-600" />
                        <View className="flex-1 h-1 rounded-full bg-gray-200" />
                        <View className="flex-1 h-1 rounded-full bg-gray-200" />
                    </View>
                    <Text className="text-sm text-gray-500 mb-6">Step 1 of 3</Text>

                    {/* Avatar Placeholder */}
                    <View className="items-center mb-8">
                        <TouchableOpacity onPress={pickImage} className="relative">
                            <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center overflow-hidden">
                                {image ? (
                                    <Image source={{ uri: image }} className="w-full h-full" />
                                ) : (
                                    <UserCircle size={80} color="#9ca3af" />
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full items-center justify-center border-2 border-white dark:border-gray-900">
                                <Text className="text-white text-lg font-bold">+</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Name Field */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Full Name
                        </Text>
                        <View className="relative">
                            <View className="absolute left-4 top-3.5 z-10">
                                <User size={20} color="#9ca3af" />
                            </View>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor="#9ca3af"
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                            />
                        </View>
                    </View>

                    {/* Pronouns Field */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Pronouns <Text className="text-gray-400">(select up to 2)</Text>
                        </Text>
                        <PronounSelector
                            options={PRONOUN_OPTIONS}
                            selectedValues={pronouns}
                            onSelect={setPronouns}
                        />
                    </View>

                    {/* Gender Identity Field - Using PronounSelector with single-select logic */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Gender Identity
                        </Text>
                        <PronounSelector
                            options={GENDER_OPTIONS}
                            selectedValues={gender}
                            onSelect={handleGenderSelect}
                        />
                    </View>

                    {/* Profile Visibility - Only shown for Women and Non-Binary */}
                    {showVisibilityOption && (
                        <View className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                            <View className="flex-row items-center mb-3">
                                <Eye size={18} color="#db2321" />
                                <Text className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                                    Who can see your profile?
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                Control who can view your profile and send you connection requests
                            </Text>
                            <PronounSelector
                                options={VISIBILITY_OPTIONS}
                                selectedValues={profileVisibility}
                                onSelect={handleVisibilitySelect}
                            />
                        </View>
                    )}

                    {/* Year Dropdown */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Year of Study
                        </Text>
                        <SkeuomorphicCoursePicker
                            courses={YEAR_OPTIONS}
                            selectedValue={year}
                            onValueChange={(itemValue: string) => setYear(itemValue)}
                            placeholder="Select year"
                        />
                    </View>

                    {/* Degree Level Dropdown */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Degree Level
                        </Text>
                        <SkeuomorphicCoursePicker
                            courses={DEGREE_OPTIONS}
                            selectedValue={degreeLevel}
                            onValueChange={(itemValue: string) => setDegreeLevel(itemValue)}
                            placeholder="Select degree"
                        />
                    </View>

                    {/* Major/Program Field - Text input */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Major / Program
                        </Text>
                        <View className="relative">
                            <View className="absolute left-4 top-3.5 z-10">
                                <BookOpen size={20} color="#9ca3af" />
                            </View>
                            <TextInput
                                value={major}
                                onChangeText={setMajor}
                                placeholder="e.g. Computer Science, Engineering"
                                placeholderTextColor="#9ca3af"
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                onFocus={handleMajorFocus}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Continue Button - Fixed at bottom */}
                <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <TouchableOpacity
                        onPress={handleContinue}
                        disabled={false} // DEV: bypassed for testing
                        className={`w-full py-4 rounded-full shadow-sm ${isValid ? 'bg-red-600' : 'bg-red-600' // DEV: always red for testing
                            }`}
                    >
                        <Text className="text-center text-white text-base font-semibold">
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
