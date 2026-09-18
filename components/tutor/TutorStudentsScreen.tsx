import { View, Text, TextInput, ScrollView } from 'react-native';
import { Search, Users } from 'lucide-react-native';
import { StudentCard } from './StudentCard';
import { useState } from 'react';

interface Student {
    id: string;
    name: string;
    initial: string;
    courses: string[];
    sessionsCount: number;
    lastSession?: string;
}

interface TutorStudentsScreenProps {
    students: Student[];
    onStudentClick: (studentId: string) => void;
    onMessageStudent: (studentId: string) => void;
}

export function TutorStudentsScreen({
    students,
    onStudentClick,
    onMessageStudent,
}: TutorStudentsScreenProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View className="bg-white dark:bg-gray-900">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="px-4 pt-4">
                    {/* Title */}
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Your Students
                    </Text>

                    {/* Search Bar */}
                    <View className="mb-6 relative">
                        <View className="absolute left-4 top-3.5 z-10">
                            <Search size={20} color="#9ca3af" />
                        </View>
                        <TextInput
                            placeholder="Search students..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-base"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Students List */}
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <StudentCard
                                key={student.id}
                                name={student.name}
                                initial={student.initial}
                                courses={student.courses}
                                sessionsCount={student.sessionsCount}
                                lastSession={student.lastSession}
                                onMessage={() => onMessageStudent(student.id)}
                                onClick={() => onStudentClick(student.id)}
                            />
                        ))
                    ) : students.length === 0 ? (
                        <View className="items-center py-12">
                            <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
                                <Users size={32} color="#9ca3af" />
                            </View>
                            <Text className="text-sm text-gray-500 mb-1">
                                No students yet
                            </Text>
                            <Text className="text-xs text-gray-400">
                                Students will appear here after they book sessions
                            </Text>
                        </View>
                    ) : (
                        <View className="items-center py-12">
                            <Text className="text-sm text-gray-500">
                                No students match "{searchQuery}"
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

