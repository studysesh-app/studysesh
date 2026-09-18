import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Dimensions, LayoutAnimation, UIManager, Modal, Animated, PanResponder, Easing, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { ArrowLeft, Camera, User, BookOpen, Eye, X, Plus, Minus, ChevronLeft, Check } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import AnimatedReanimated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing as ReanimatedEasing } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { SkeuomorphicCoursePicker } from '../ui/SkeuomorphicCoursePicker';
import { PronounSelector } from '../ui/PronounSelector';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
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

const AVAILABLE_PROMPTS = [
    "I'll buy you coffee if...",
    "I study best at...",
    "Need someone to help me out with...",
    "My go-to study snack is...",
    "I'm always down to...",
    "Best study spot on campus is...",
    "I'm looking for someone who...",
    "My study playlist is...",
    "After exams, you'll find me...",
    "I'm passionate about...",
    "My biggest pet peeve is...",
    "I can teach you how to...",
    "My toxic study trait is...",
    "The class I'm dreading most is...",
    "I procrastinate by...",
];

const MAX_ANSWER_LENGTH = 150;
type SheetView = 'list' | 'edit';

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
        pronouns: string[];
        gender: string;
        year: string;
        degreeLevel: string;
        program: string;
        bio?: string;
        profileVisibility?: 'everyone' | 'women-nb-only';
        prompts?: Array<{ prompt: string; answer: string }>;
        profileImage?: string | null;
    }) => void;
    isDarkMode?: boolean;
    profileImage?: string | null;
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
    isDarkMode = false,
    profileImage: initialProfileImage,
}: EditProfileScreenProps) {
    // Parse initial pronouns (e.g., "he/him" -> ["He", "Him"])
    const parsePronouns = (pronounsStr: string): string[] => {
        if (!pronounsStr) return [];
        const parts = pronounsStr.split('/').map(p => {
            const trimmed = p.trim();
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        });
        return parts.filter(p => PRONOUN_OPTIONS.some(opt => opt.value === p));
    };

    const [name, setName] = useState(initialName);
    const [pronouns, setPronouns] = useState<string[]>(parsePronouns(initialPronouns));
    const [gender, setGender] = useState<string[]>([]); // Will be set from props if available
    const [year, setYear] = useState(initialYear);
    const [degreeLevel, setDegreeLevel] = useState('');
    const [program, setProgram] = useState(initialProgram);
    const [bio, setBio] = useState(initialBio || '');
    const [profileVisibility, setProfileVisibility] = useState<string[]>(['everyone']);
    const [prompts, setPrompts] = useState<Array<{ prompt: string; answer: string }>>([]);
    const [profileImage, setProfileImage] = useState<string | null>(initialProfileImage || null);

    const scrollViewRef = useRef<ScrollView>(null);
    const programInputRef = useRef<TextInput>(null);
    const bioInputRef = useRef<TextInput>(null);
    const answerInputRef = useRef<TextInput>(null);

    // Prompt picker modal state
    const [showPromptPicker, setShowPromptPicker] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [sheetView, setSheetView] = useState<SheetView>('list');
    const [selectedPrompt, setSelectedPrompt] = useState<string>('');
    const [draftAnswer, setDraftAnswer] = useState<string>('');

    // Animation values for prompt picker modal
    const modalSlide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const viewTransition = useRef(new Animated.Value(0)).current;

    // Check if user selected Woman or Non-Binary
    const showVisibilityOption = gender.length > 0 && (gender[0] === 'Woman' || gender[0] === 'Non-Binary');

    // Animate visibility section appearance/disappearance
    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [showVisibilityOption]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // Handle gender selection - single select (max 1)
    const handleGenderSelect = (values: string[]) => {
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
            setProfileVisibility(['everyone']);
        } else {
            setProfileVisibility(values);
        }
    };

    // Pan responder for swipe-to-close prompt picker
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    modalSlide.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 80 || gestureState.vy > 0.5) {
                    closePromptModal();
                } else {
                    Animated.spring(modalSlide, {
                        toValue: 0,
                        tension: 65,
                        friction: 11,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const openPromptModal = (existingPrompt?: string, existingAnswer?: string) => {
        if (existingPrompt) {
            setSelectedPrompt(existingPrompt);
            setDraftAnswer(existingAnswer || '');
            setSheetView('edit');
            viewTransition.setValue(1);
        } else {
            setSelectedPrompt('');
            setDraftAnswer('');
            setSheetView('list');
            viewTransition.setValue(0);
        }

        setShowPromptPicker(true);
        modalSlide.setValue(SCREEN_HEIGHT);
        backdropOpacity.setValue(0);

        requestAnimationFrame(() => {
            Animated.parallel([
                Animated.spring(modalSlide, {
                    toValue: 0,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (existingPrompt) {
                    setTimeout(() => answerInputRef.current?.focus(), 100);
                }
            });
        });
    };

    const closePromptModal = () => {
        Animated.parallel([
            Animated.timing(modalSlide, {
                toValue: SCREEN_HEIGHT,
                duration: 280,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowPromptPicker(false);
            setEditingIndex(null);
            setSheetView('list');
            setSelectedPrompt('');
            setDraftAnswer('');
        });
    };

    const transitionToEdit = (prompt: string) => {
        setSelectedPrompt(prompt);
        setDraftAnswer('');
        setSheetView('edit');

        Animated.timing(viewTransition, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => answerInputRef.current?.focus(), 50);
        });
    };

    const transitionToList = () => {
        setSheetView('list');

        Animated.timing(viewTransition, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    };

    const usedPromptTexts = prompts.map((p) => p.prompt);
    const availablePrompts = AVAILABLE_PROMPTS.filter((p) => {
        if (editingIndex !== null && prompts[editingIndex]?.prompt === p) {
            return true;
        }
        return !usedPromptTexts.includes(p);
    });

    const handleSavePrompt = () => {
        if (!selectedPrompt || !draftAnswer.trim()) return;

        if (editingIndex !== null) {
            const updated = [...prompts];
            updated[editingIndex] = { prompt: selectedPrompt, answer: draftAnswer.trim() };
            setPrompts(updated);
        } else {
            setPrompts([...prompts, { prompt: selectedPrompt, answer: draftAnswer.trim() }]);
        }
        closePromptModal();
    };

    const handleRemovePrompt = (index: number) => {
        setPrompts(prompts.filter((_, i) => i !== index));
    };

    const canSavePrompt = selectedPrompt && draftAnswer.trim().length > 0;

    // Animation interpolations for prompt picker
    const listTranslateX = viewTransition.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50],
    });
    const listOpacity = viewTransition.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });
    const editTranslateX = viewTransition.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
    });
    const editOpacity = viewTransition.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const handleSave = () => {
        const pronounsStr = pronouns.length > 0 ? pronouns.join('/') : initialPronouns;
        onSave({
            name,
            pronouns: pronouns,
            gender: gender[0] || 'Prefer not to say',
            year,
            degreeLevel: degreeLevel || "Bachelor's",
            program,
            bio: isTutor ? bio : undefined,
            profileVisibility: showVisibilityOption ? (profileVisibility[0] as 'everyone' | 'women-nb-only') : undefined,
            prompts: prompts.length > 0 ? prompts : undefined,
        });
    };

    // Scroll to input when focused
    const handleProgramFocus = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
    };

    const handleBioFocus = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
    };

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
                    { duration: 250, easing: ReanimatedEasing.out(ReanimatedEasing.cubic) },
                    () => {
                        runOnJS(onBack)();
                    }
                );
            } else {
                translateX.value = withTiming(0, { duration: 200, easing: ReanimatedEasing.out(ReanimatedEasing.cubic) });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <>
            <GestureDetector gesture={swipeGesture}>
                <AnimatedReanimated.View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} style={animatedStyle}>
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
                            contentContainerStyle={{ paddingBottom: 120 }}
                        >
                            <View className="flex-row items-center mb-6 relative">
                                <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                                    <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                                </TouchableOpacity>
                                <Text className={`flex-1 text-center text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Edit Profile
                                </Text>
                            </View>

                            {/* Photo Section */}
                            <View className="items-center mb-8">
                                <View className="relative mb-3">
                                    <View className="w-24 h-24 rounded-full bg-[#fee2e2] items-center justify-center overflow-hidden">
                                        {profileImage ? (
                                            <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <Text className="text-4xl font-semibold text-[#991b1b]">
                                                {initial}
                                            </Text>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        className={`absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full items-center justify-center border-2 ${isDarkMode ? 'border-gray-900' : 'border-white'}`}
                                        onPress={pickImage}
                                    >
                                        <Camera size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={pickImage}>
                                    <Text className="text-red-600 text-sm font-medium">
                                        Change Photo
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Name Field */}
                            <View className="mb-5">
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
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
                                        className={`w-full pl-12 pr-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl`}
                                    />
                                </View>
                            </View>

                            {/* Pronouns Field */}
                            <View className="mb-5">
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Pronouns <Text className="text-gray-400">(select up to 2)</Text>
                                </Text>
                                <PronounSelector
                                    options={PRONOUN_OPTIONS}
                                    selectedValues={pronouns}
                                    onSelect={setPronouns}
                                    isDarkMode={isDarkMode}
                                />
                            </View>

                            {/* Gender Identity Field */}
                            <View className="mb-5">
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Gender Identity
                                </Text>
                                <PronounSelector
                                    options={GENDER_OPTIONS}
                                    selectedValues={gender}
                                    onSelect={handleGenderSelect}
                                    isDarkMode={isDarkMode}
                                />
                            </View>

                            {/* Profile Visibility - Only shown for Women and Non-Binary */}
                            {showVisibilityOption && (
                                <View className={`mb-5 p-4 rounded-2xl border ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'}`}>
                                    <View className="flex-row items-center mb-3">
                                        <Eye size={18} color="#db2321" />
                                        <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} ml-2`}>
                                            Who can see your profile?
                                        </Text>
                                    </View>
                                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                                        Control who can view your profile and send you connection requests
                                    </Text>
                                    <PronounSelector
                                        options={VISIBILITY_OPTIONS}
                                        selectedValues={profileVisibility}
                                        onSelect={handleVisibilitySelect}
                                        isDarkMode={isDarkMode}
                                    />
                                </View>
                            )}

                            {/* Year Dropdown */}
                            <View className="mb-5">
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Year of Study
                                </Text>
                                <SkeuomorphicCoursePicker
                                    courses={YEAR_OPTIONS}
                                    selectedValue={year}
                                    onValueChange={(itemValue: string) => setYear(itemValue)}
                                    placeholder="Select year"
                                    isDarkMode={isDarkMode}
                                />
                            </View>

                            {/* Degree Level Dropdown */}
                            <View className="mb-5">
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Degree Level
                                </Text>
                                <SkeuomorphicCoursePicker
                                    courses={DEGREE_OPTIONS}
                                    selectedValue={degreeLevel}
                                    onValueChange={(itemValue: string) => setDegreeLevel(itemValue)}
                                    placeholder="Select degree"
                                    isDarkMode={isDarkMode}
                                />
                            </View>

                            {/* Major/Program Field */}
                            <View className="mb-5">
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Major / Program
                                </Text>
                                <View className="relative">
                                    <View className="absolute left-4 top-3.5 z-10">
                                        <BookOpen size={20} color="#9ca3af" />
                                    </View>
                                    <TextInput
                                        ref={programInputRef}
                                        value={program}
                                        onChangeText={setProgram}
                                        placeholder="e.g. Computer Science, Engineering"
                                        placeholderTextColor="#9ca3af"
                                        className={`w-full pl-12 pr-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl`}
                                        onFocus={handleProgramFocus}
                                    />
                                </View>
                            </View>

                            {/* Bio (Tutor only) */}
                            {isTutor && (
                                <View className="mb-5">
                                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
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
                                        className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl min-h-[120px] text-top`}
                                        textAlignVertical="top"
                                        onFocus={handleBioFocus}
                                    />
                                    <Text className="text-right text-xs text-gray-500 mt-1">
                                        {bio.length}/300
                                    </Text>
                                </View>
                            )}

                            {/* Prompts Section */}
                            <View className="mb-6">
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    Prompts <Text className="text-gray-400">({prompts.length}/3)</Text>
                                </Text>
                                <Text className="text-xs text-gray-500 mb-4">
                                    Select up to 3 prompts to show your personality
                                </Text>

                                {/* Selected Prompts */}
                                <View className="gap-4 mb-4">
                                    {prompts.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                setEditingIndex(index);
                                                openPromptModal(item.prompt, item.answer);
                                            }}
                                            activeOpacity={0.8}
                                            className={`p-5 rounded-2xl border-2 ${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50/50 border-red-200'}`}
                                        >
                                            <View className="flex-row items-start justify-between mb-2">
                                                <Text className={`flex-1 text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} pr-2`}>
                                                    {item.prompt}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleRemovePrompt(index);
                                                    }}
                                                    className="p-1"
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    <X size={20} color="#9ca3af" />
                                                </TouchableOpacity>
                                            </View>
                                            <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-6`}>
                                                {item.answer}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Add Prompt Button */}
                                {prompts.length < 3 && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setEditingIndex(null);
                                            openPromptModal();
                                        }}
                                        className={`py-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}
                                    >
                                        <View className="flex-row items-center justify-center gap-2">
                                            <Plus size={20} color="#9ca3af" />
                                            <Text className="text-gray-500 font-medium">Add Prompt</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>

                    {/* Save Button */}
                    <View className={`absolute bottom-0 left-0 right-0 p-4 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t`}>
                        <TouchableOpacity
                            onPress={handleSave}
                            className="w-full py-4 bg-red-600 rounded-full shadow-sm"
                        >
                            <Text className="text-center text-white text-base font-semibold">
                                Save Changes
                            </Text>
                        </TouchableOpacity>
                    </View>
                </AnimatedReanimated.View>
            </GestureDetector>

            {/* Prompt Picker Modal */}
            <Modal
                transparent={true}
                visible={showPromptPicker}
                animationType="none"
                onRequestClose={closePromptModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    {/* Backdrop */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            opacity: backdropOpacity,
                        }}
                    >
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={closePromptModal}
                            activeOpacity={1}
                        />
                    </Animated.View>

                    {/* Modal Content */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: SCREEN_HEIGHT * 0.75,
                            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            transform: [{ translateY: modalSlide }],
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -5 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 20,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Drag Handle */}
                        <View
                            {...panResponder.panHandlers}
                            style={{
                                width: '100%',
                                paddingVertical: 12,
                                alignItems: 'center',
                                borderBottomWidth: 1,
                                borderBottomColor: isDarkMode ? '#374151' : '#e5e7eb',
                            }}
                        >
                            <Minus size={24} color="#9ca3af" />
                        </View>

                        {/* View Container */}
                        <View style={{ flex: 1, position: 'relative' }}>
                            {/* List View */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    opacity: listOpacity,
                                    transform: [{ translateX: listTranslateX }],
                                }}
                                pointerEvents={sheetView === 'list' ? 'auto' : 'none'}
                            >
                                <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
                                    <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Choose a Prompt
                                    </Text>
                                    <TouchableOpacity
                                        onPress={closePromptModal}
                                        className="p-2"
                                    >
                                        <X size={24} color={isDarkMode ? '#fff' : '#000'} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
                                    <View className="gap-3 pb-8">
                                        {availablePrompts.map((prompt) => (
                                            <TouchableOpacity
                                                key={prompt}
                                                onPress={() => transitionToEdit(prompt)}
                                                className={`p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                                                style={{
                                                    borderWidth: 1.5,
                                                    borderColor: isDarkMode ? '#374151' : '#d1d5db',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.08,
                                                    shadowRadius: 6,
                                                    elevation: 3,
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text className={`text-lg font-medium leading-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                                    {prompt}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </Animated.View>

                            {/* Edit View */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    opacity: editOpacity,
                                    transform: [{ translateX: editTranslateX }],
                                }}
                                pointerEvents={sheetView === 'edit' ? 'auto' : 'none'}
                            >
                                <View className="flex-row items-center px-4 pt-4 pb-3">
                                    <TouchableOpacity
                                        onPress={transitionToList}
                                        className="p-2 -ml-2 mr-2"
                                    >
                                        <ChevronLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                                    </TouchableOpacity>
                                    <Text className={`flex-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Your Answer
                                    </Text>
                                    <TouchableOpacity
                                        onPress={closePromptModal}
                                        className="p-2"
                                    >
                                        <X size={24} color={isDarkMode ? '#fff' : '#000'} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                    <View style={{ flex: 1 }}>
                                        <ScrollView
                                            className="flex-1"
                                            contentContainerStyle={{ paddingBottom: 20 }}
                                            keyboardShouldPersistTaps="handled"
                                            showsVerticalScrollIndicator={false}
                                        >
                                            <View className="px-4 pb-4">
                                                <TouchableOpacity
                                                    onPress={transitionToList}
                                                    activeOpacity={0.7}
                                                    className={`p-4 rounded-xl border ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}
                                                >
                                                    <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {selectedPrompt}
                                                    </Text>
                                                    <Text className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                                        Tap to change prompt
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>

                                            <View className="px-4">
                                                <TextInput
                                                    ref={answerInputRef}
                                                    value={draftAnswer}
                                                    onChangeText={(text) => {
                                                        if (text.length <= MAX_ANSWER_LENGTH) {
                                                            setDraftAnswer(text);
                                                        }
                                                    }}
                                                    placeholder="Write your answer here..."
                                                    placeholderTextColor="#9ca3af"
                                                    multiline
                                                    blurOnSubmit={true}
                                                    returnKeyType="done"
                                                    onSubmitEditing={Keyboard.dismiss}
                                                    className={`p-4 border rounded-xl text-base ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                                    style={{
                                                        textAlignVertical: 'top',
                                                        minHeight: 120,
                                                    }}
                                                />
                                                <Text className="text-right text-xs text-gray-400 mt-2">
                                                    {draftAnswer.length}/{MAX_ANSWER_LENGTH}
                                                </Text>
                                            </View>

                                            <View className="px-4 pt-4">
                                                <TouchableOpacity
                                                    onPress={handleSavePrompt}
                                                    disabled={!canSavePrompt}
                                                    className={`w-full py-4 rounded-full flex-row items-center justify-center gap-2 ${canSavePrompt ? 'bg-red-600' : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <Check size={20} color="#fff" />
                                                    <Text className="text-center text-white text-base font-semibold">
                                                        {editingIndex !== null ? 'Save Changes' : 'Add Prompt'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </ScrollView>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Animated.View>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal >
        </>
    );
}
