import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform, Animated, Dimensions, PanResponder, Easing, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { ArrowLeft, X, Plus, Minus, ChevronLeft, Check } from 'lucide-react-native';
import { useState, useRef } from 'react';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ProfilePromptsScreenProps {
    onBack: () => void;
    onContinue: (prompts: Array<{ prompt: string; answer: string }>) => void;
}

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

export function ProfilePromptsScreen({ onBack, onContinue }: ProfilePromptsScreenProps) {
    const [prompts, setPrompts] = useState<Array<{ prompt: string; answer: string }>>([]);
    const [showPromptPicker, setShowPromptPicker] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const answerInputRef = useRef<TextInput>(null);

    // Bottom sheet state
    const [sheetView, setSheetView] = useState<SheetView>('list');
    const [selectedPrompt, setSelectedPrompt] = useState<string>('');
    const [draftAnswer, setDraftAnswer] = useState<string>('');

    // Animation values for prompt picker modal
    const modalSlide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const viewTransition = useRef(new Animated.Value(0)).current; // 0 = list, 1 = edit

    // Pan responder for swipe-to-close
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
                    closeModal();
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

    const openModal = (existingPrompt?: string, existingAnswer?: string) => {
        // If editing existing, go directly to edit view
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
                // Focus the input if in edit mode
                if (existingPrompt) {
                    setTimeout(() => answerInputRef.current?.focus(), 100);
                }
            });
        });
    };

    const closeModal = () => {
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
    // When editing, include the current prompt in available list
    const availablePrompts = AVAILABLE_PROMPTS.filter((p) => {
        if (editingIndex !== null && prompts[editingIndex]?.prompt === p) {
            return true; // Show current prompt when editing
        }
        return !usedPromptTexts.includes(p);
    });

    const handleSavePrompt = () => {
        if (!selectedPrompt || !draftAnswer.trim()) return;

        if (editingIndex !== null) {
            // Updating existing prompt
            const updated = [...prompts];
            updated[editingIndex] = { prompt: selectedPrompt, answer: draftAnswer.trim() };
            setPrompts(updated);
        } else {
            // Adding new prompt
            setPrompts([...prompts, { prompt: selectedPrompt, answer: draftAnswer.trim() }]);
        }
        closeModal();
    };

    const handleRemovePrompt = (index: number) => {
        setPrompts(prompts.filter((_, i) => i !== index));
    };

    const isValid = prompts.length === 3 && prompts.every((p) => p.answer.trim().length > 0);
    const canSavePrompt = selectedPrompt && draftAnswer.trim().length > 0;

    const handleContinue = () => {
        // DEV: bypassed validation for testing (was: if (isValid))
        if (true) {
            // DEV: fallback prompts if none filled
            const fallbackPrompts = prompts.length > 0 ? prompts : [
                { prompt: "I study best at...", answer: "the library" },
                { prompt: "I'm always down to...", answer: "grab coffee" },
                { prompt: "My go-to study snack is...", answer: "chips" },
            ];
            onContinue(fallbackPrompts);
        }
    };

    // Animation interpolations
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
                    contentContainerStyle={{ paddingBottom: 140 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                            Show Your Personality
                        </Text>
                    </View>

                    {/* Progress */}
                    <View className="flex-row gap-2 mb-4">
                        <View className="flex-1 h-1 rounded-full bg-red-600" />
                        <View className="flex-1 h-1 rounded-full bg-red-600" />
                        <View className="flex-1 h-1 rounded-full bg-gray-200" />
                    </View>
                    <Text className="text-sm text-gray-500 mb-2">Step 2 of 3</Text>
                    <Text className="text-sm text-gray-500 mb-6">{prompts.length}/3 prompts</Text>

                    {/* Instructions */}
                    <Text className="text-base text-gray-500 mb-6">
                        Select 3 prompts and write your answers. This helps other students get to know you!
                    </Text>

                    {/* Selected Prompts - Now just display cards that open sheet on tap */}
                    <View className="gap-4 mb-4">
                        {prompts.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setEditingIndex(index);
                                    openModal(item.prompt, item.answer);
                                }}
                                activeOpacity={0.8}
                                className="p-5 rounded-2xl border-2 border-red-200 bg-red-50/50 dark:bg-red-900/10"
                            >
                                {/* Prompt header with remove button */}
                                <View className="flex-row items-start justify-between mb-2">
                                    <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white pr-2">
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

                                {/* Answer display */}
                                <Text className="text-base text-gray-700 dark:text-gray-300 leading-6">
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
                                openModal();
                            }}
                            className="py-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800"
                        >
                            <View className="flex-row items-center justify-center gap-2">
                                <Plus size={20} color="#9ca3af" />
                                <Text className="text-gray-500 font-medium">Add Prompt</Text>
                            </View>
                        </TouchableOpacity>
                    )}
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

            {/* Prompt Picker Modal */}
            <Modal
                transparent={true}
                visible={showPromptPicker}
                animationType="none"
                onRequestClose={closeModal}
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
                            onPress={closeModal}
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
                            backgroundColor: '#ffffff',
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
                                borderBottomColor: '#e5e7eb',
                            }}
                        >
                            <Minus size={24} color="#9ca3af" />
                        </View>

                        {/* View Container - holds both views */}
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
                                    pointerEvents: sheetView === 'list' ? 'auto' : 'none',
                                }}
                            >
                                {/* Modal Header */}
                                <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
                                    <Text className="text-xl font-bold text-gray-900">
                                        Choose a Prompt
                                    </Text>
                                    <TouchableOpacity
                                        onPress={closeModal}
                                        className="p-2"
                                    >
                                        <X size={24} color="#000" />
                                    </TouchableOpacity>
                                </View>

                                {/* Prompt List */}
                                <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
                                    <View className="gap-3 pb-8">
                                        {availablePrompts.map((prompt) => (
                                            <TouchableOpacity
                                                key={prompt}
                                                onPress={() => transitionToEdit(prompt)}
                                                className="p-5 rounded-2xl bg-white"
                                                style={{
                                                    borderWidth: 1.5,
                                                    borderColor: '#d1d5db',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.08,
                                                    shadowRadius: 6,
                                                    elevation: 3,
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text className="text-lg font-medium text-gray-800 leading-6">
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
                                    pointerEvents: sheetView === 'edit' ? 'auto' : 'none',
                                }}
                            >
                                {/* Edit Header with back button */}
                                <View className="flex-row items-center px-4 pt-4 pb-3">
                                    <TouchableOpacity
                                        onPress={transitionToList}
                                        className="p-2 -ml-2 mr-2"
                                    >
                                        <ChevronLeft size={24} color="#000" />
                                    </TouchableOpacity>
                                    <Text className="flex-1 text-xl font-bold text-gray-900">
                                        Your Answer
                                    </Text>
                                    <TouchableOpacity
                                        onPress={closeModal}
                                        className="p-2"
                                    >
                                        <X size={24} color="#000" />
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
                                            {/* Selected Prompt Display */}
                                            <View className="px-4 pb-4">
                                                <TouchableOpacity
                                                    onPress={transitionToList}
                                                    activeOpacity={0.7}
                                                    className="p-4 rounded-xl bg-red-50 border border-red-200"
                                                >
                                                    <Text className="text-base font-semibold text-gray-900">
                                                        {selectedPrompt}
                                                    </Text>
                                                    <Text className="text-xs text-red-600 mt-1">
                                                        Tap to change prompt
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>

                                            {/* Answer Input */}
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
                                                    className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-base"
                                                    style={{
                                                        textAlignVertical: 'top',
                                                        minHeight: 120,
                                                    }}
                                                />
                                                <Text className="text-right text-xs text-gray-400 mt-2">
                                                    {draftAnswer.length}/{MAX_ANSWER_LENGTH}
                                                </Text>
                                            </View>

                                            {/* Save Button - inside scroll so it's always accessible */}
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
            </Modal>
        </View>
    );
}
