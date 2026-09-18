import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { CourseChip } from '../CourseChip';
import { CourseInputModal } from '../profile/CourseInputModal';

interface TutorCourseApplicationScreenProps {
    onBack: () => void;
    onContinue: (appliedCourses: string[]) => void;
    isDarkMode?: boolean;
}

export function TutorCourseApplicationScreen({ onBack, onContinue, isDarkMode = false }: TutorCourseApplicationScreenProps) {
    const [appliedCourses, setAppliedCourses] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddCourse = (courseCode: string) => {
        if (!appliedCourses.includes(courseCode)) {
            setAppliedCourses([...appliedCourses, courseCode]);
        }
    };

    const handleRemoveCourse = (course: string) => {
        setAppliedCourses(appliedCourses.filter((c) => c !== course));
    };

    const handleContinue = () => {
        onContinue(appliedCourses.length > 0 ? appliedCourses : ['SYSC 2006', 'COMP 2402']);
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1 px-4 pt-6">
                <View className="flex-row items-center mb-6 relative">
                    <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                        <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white" style={{ color: isDarkMode ? '#fff' : '#111827' }}>
                        Apply to Tutor
                    </Text>
                </View>

                {/* Progress - Step 3 of 6 */}
                <View className="flex-row gap-2 mb-4">
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                </View>
                <Text className="text-sm text-gray-500 mb-6">Step 3 of 6</Text>

                <Text className="text-base text-center text-gray-500 mb-6">
                    Add courses you want to tutor
                </Text>

                {/* Info Message */}
                <View className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <Text className="text-sm text-gray-900 dark:text-white">
                        You'll need to provide proof of success in these courses (transcripts, grade reports, etc.) on the next screen.
                    </Text>
                </View>

                {/* Applied Courses */}
                {appliedCourses.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                            Courses to Tutor ({appliedCourses.length})
                        </Text>
                        <View className="flex-row flex-wrap gap-3">
                            {appliedCourses.map((course) => (
                                <View key={course} className="relative">
                                    <CourseChip code={course} variant="large" isDarkMode={isDarkMode} />
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

                {appliedCourses.length === 0 && (
                    <View className="mt-8 items-center py-12">
                        <Text className="text-gray-500 text-sm">
                            No courses added yet
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Continue Button */}
            <View className="p-4 border-t border-gray-200 dark:border-gray-800">
                <TouchableOpacity
                    onPress={handleContinue}
                    className="w-full py-4 bg-red-600 rounded-full shadow-sm"
                >
                    <Text className="text-center text-white text-base font-semibold">
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Course Input Modal */}
            <CourseInputModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddCourse}
                requiresProof={false}
            />
        </View>
    );
}
