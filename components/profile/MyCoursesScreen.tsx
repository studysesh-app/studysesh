import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { CourseChip } from '../CourseChip';
import { CourseInputModal } from './CourseInputModal';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';
import { AnimatedTabs, TabData } from '../../reference/AnimatedTabs';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface MyCoursesScreenProps {
    selectedCourses: string[]; // Courses they are taking (studying)
    tutoringCourses?: string[]; // Courses they are tutoring
    isTutor: boolean;
    onBack: () => void;
    onSave: (courses: string[]) => void;
    onSaveTutoring?: (courses: string[]) => void;
    isDarkMode?: boolean;
}

export function MyCoursesScreen({
    selectedCourses: initialCourses,
    tutoringCourses: initialTutoringCourses = [],
    isTutor,
    onBack,
    onSave,
    onSaveTutoring,
    isDarkMode = false,
}: MyCoursesScreenProps) {
    const [activeTabIndex, setActiveTabIndex] = useState(isTutor ? 1 : 0);
    const activeList = activeTabIndex === 0 ? 'studying' : 'tutoring';
    const [coursesStudying, setCoursesStudying] = useState<string[]>(initialCourses);
    const [coursesTutoring, setCoursesTutoring] = useState<string[]>(initialTutoringCourses);
    const [showAddModal, setShowAddModal] = useState(false);

    // Tabs for AnimatedTabs (matching CourseDetailScreen pattern exactly)
    const courseTabs: TabData[] = [
        { id: 'studying', title: 'Studying', content: null },
        { id: 'tutoring', title: 'Tutoring', content: null },
    ];


    // Determines which list we are currently editing
    const currentList = activeList === 'studying' ? coursesStudying : coursesTutoring;
    const isEditingTutoring = activeList === 'tutoring';

    const handleAddCourse = (courseCode: string) => {
        if (!currentList.includes(courseCode)) {
            if (activeList === 'studying') {
                setCoursesStudying([...coursesStudying, courseCode]);
            } else {
                setCoursesTutoring([...coursesTutoring, courseCode]);
            }
        }
    };

    const handleRemoveCourse = (course: string) => {
        if (activeList === 'studying') {
            setCoursesStudying(coursesStudying.filter((c) => c !== course));
        } else {
            setCoursesTutoring(coursesTutoring.filter((c) => c !== course));
        }
    };

    const handleSave = () => {
        // Save both or just the relevant one? 
        // Simpler to just trigger callbacks for both if they changed, or just call onSave for studying and onSaveTutoring for tutoring
        // But the "Save" button usually implies saving the whole screen state.

        // We'll call both available callbacks with current state
        onSave(coursesStudying);
        if (onSaveTutoring) {
            onSaveTutoring(coursesTutoring);
        }

        onBack(); // Or just give feedback? Usually save closes the screen.
    };

    const handleProofUpload = (file: any) => {
        console.log('Proof uploaded:', file.name);
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
        <GestureDetector gesture={swipeGesture}>
            <Animated.View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} style={animatedStyle}>
                <ScrollView className="flex-1 px-4 pt-6">
                    <View className="flex-row items-center mb-6 relative">
                        <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                            <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                        </TouchableOpacity>
                        <Text className={`flex-1 text-center text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            My Courses
                        </Text>
                    </View>

                    {/* Segmented Control for Tutors - with AnimatedTabs */}
                    {isTutor && (
                        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                            <AnimatedTabs
                                tabs={courseTabs}
                                activeTabIndex={activeTabIndex}
                                onTabChange={setActiveTabIndex}
                                variant="pill"
                                isDarkMode={isDarkMode}
                            />
                        </View>
                    )}

                    {/* Info Message */}
                    <View className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <Text className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {isEditingTutoring
                                ? 'Add courses you want to tutor. You\'ll need to upload proof of course enrollment.'
                                : 'Add the courses you\'re currently taking to find relevant tutors.'}
                        </Text>
                    </View>

                    {/* Current Courses */}
                    {currentList.length > 0 && (
                        <View className="mb-6">
                            <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {isEditingTutoring ? 'Courses You Tutor' : 'Your Courses'}
                            </Text>
                            <View className="flex-row flex-wrap gap-3">
                                {currentList.map((course) => (
                                    <View key={course} className="relative">
                                        <CourseChip code={course} selected={false} variant="large" isDarkMode={isDarkMode} />
                                        <TouchableOpacity
                                            onPress={() => handleRemoveCourse(course)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full items-center justify-center shadow-sm"
                                        >
                                            <X size={12} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Add Course Button */}
                    <TouchableOpacity
                        onPress={() => setShowAddModal(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl items-center justify-center flex-row gap-2"
                    >
                        <Plus size={20} color="#db2321" />
                        <Text className="text-red-600 font-semibold">
                            Add Course
                        </Text>
                    </TouchableOpacity>

                    {currentList.length === 0 && (
                        <View className="mt-8 items-center py-12">
                            <Text className="text-gray-500 text-sm">
                                No courses added yet
                            </Text>
                        </View>
                    )}
                </ScrollView>

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

                {/* Course Input Modal */}
                <CourseInputModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddCourse}
                    requiresProof={isEditingTutoring}
                    onProofUpload={handleProofUpload}
                    isDarkMode={isDarkMode}
                />
            </Animated.View>
        </GestureDetector>
    );
}
