import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { CourseChip } from '../CourseChip';
import { CourseInputModal } from './CourseInputModal';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

interface MyCoursesScreenProps {
    selectedCourses: string[];
    isTutor: boolean;
    onBack: () => void;
    onSave: (courses: string[]) => void;
}

export function MyCoursesScreen({
    selectedCourses: initialCourses,
    isTutor,
    onBack,
    onSave,
}: MyCoursesScreenProps) {
    const [selectedCourses, setSelectedCourses] = useState<string[]>(initialCourses);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddCourse = (courseCode: string) => {
        if (!selectedCourses.includes(courseCode)) {
            setSelectedCourses([...selectedCourses, courseCode]);
        }
    };

    const handleRemoveCourse = (course: string) => {
        setSelectedCourses(selectedCourses.filter((c) => c !== course));
    };

    const handleSave = () => {
        onSave(selectedCourses);
    };

    const handleProofUpload = (file: any) => {
        console.log('Proof uploaded:', file.name);
    };

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
                            My Courses
                        </Text>
                    </View>
                    {/* Info Message */}
                    <View className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <Text className="text-gray-900 dark:text-white text-sm">
                            {isTutor
                                ? 'Add courses you want to tutor. You\'ll need to upload proof of course enrollment.'
                                : 'Add the courses you\'re currently taking to find relevant tutors.'}
                        </Text>
                    </View>

                    {/* Current Courses */}
                    {selectedCourses.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                                {isTutor ? 'Courses You Tutor' : 'Your Courses'}
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {selectedCourses.map((course) => (
                                    <View key={course} className="relative">
                                        <CourseChip code={course} />
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

                    {selectedCourses.length === 0 && (
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
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Course Input Modal */}
                <CourseInputModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddCourse}
                    requiresProof={isTutor}
                    onProofUpload={handleProofUpload}
                />
            </View>
        </GestureDetector>
    );
}
