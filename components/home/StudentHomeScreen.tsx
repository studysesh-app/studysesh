import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Keyboard } from 'react-native';
import { Users, GraduationCap, Pencil, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';

interface Course {
    code: string;
    name: string;
    activeCount: number;
    tutorCount: number;
    studentCount: number;
}

interface StudentHomeScreenProps {
    userName: string;
    userStatus?: string;
    courses: Course[];
    onCoursePress: (courseCode: string) => void;
    onStatusChange?: (status: string) => void;
    isDarkMode?: boolean;
}

export function StudentHomeScreen({
    userName,
    userStatus = 'Studying',
    courses,
    onCoursePress,
    onStatusChange,
    isDarkMode = false,
}: StudentHomeScreenProps) {
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [statusText, setStatusText] = useState(userStatus);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        setStatusText(userStatus);
    }, [userStatus]);

    const handleStatusSubmit = () => {
        const trimmed = statusText.trim();
        if (trimmed && trimmed !== userStatus) {
            onStatusChange?.(trimmed);
        } else {
            setStatusText(userStatus);
        }
        setIsEditingStatus(false);
        Keyboard.dismiss();
    };

    const handleStatusTap = () => {
        setIsEditingStatus(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };
    // Format course code without spaces (e.g., "COMP 2402" -> "COMP2402")
    const formatCourseCode = (code: string) => code.replace(/\s+/g, '');

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Gradient Header Card */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={['#db2321', '#500908']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientHeader}
                    >
                        {/* Welcome Text */}
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.userName}>{userName}</Text>

                        {/* Editable Status Bubble */}
                        {isEditingStatus ? (
                            <View style={styles.statusBubbleEditing}>
                                <View style={styles.statusDot} />
                                <TextInput
                                    ref={inputRef}
                                    style={styles.statusInput}
                                    value={statusText}
                                    onChangeText={(text) => setStatusText(text.slice(0, 24))}
                                    onSubmitEditing={handleStatusSubmit}
                                    onBlur={handleStatusSubmit}
                                    returnKeyType="done"
                                    maxLength={24}
                                    autoFocus
                                    selectTextOnFocus
                                />
                                <TouchableOpacity onPress={handleStatusSubmit} hitSlop={8}>
                                    <Check size={16} color="#fff" strokeWidth={3} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.statusBubble}
                                onPress={handleStatusTap}
                                activeOpacity={0.7}
                            >
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>{userStatus}</Text>
                                <Pencil size={12} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        )}
                    </LinearGradient>
                </View>

                {/* My Courses Section */}
                <View style={styles.coursesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>My Courses</Text>
                        <Text style={[styles.courseCount, isDarkMode && styles.textGrayDark]}>{courses.length} courses</Text>
                    </View>

                    <View style={styles.coursesList}>
                        {courses.map((course) => (
                            <TouchableOpacity
                                key={course.code}
                                style={[styles.courseCard, isDarkMode && styles.courseCardDark]}
                                onPress={() => onCoursePress(course.code)}
                                activeOpacity={0.8}
                            >
                                {/* Course Code */}
                                <Text style={[styles.courseCode, isDarkMode && styles.courseCodeDark]}>{formatCourseCode(course.code)}</Text>

                                {/* Stats Row: Active | Tutors | Students */}
                                <View style={styles.statsRow}>
                                    {/* Active */}
                                    <View style={styles.statItem}>
                                        <View style={styles.activeDot} />
                                        <Text style={[styles.statText, isDarkMode && styles.textGrayDark]}>{course.activeCount} active</Text>
                                    </View>

                                    {/* Tutors */}
                                    <View style={styles.statItem}>
                                        <GraduationCap size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                        <Text style={[styles.statText, isDarkMode && styles.textGrayDark]}>
                                            {course.tutorCount} {course.tutorCount === 1 ? 'tutor' : 'tutors'}
                                        </Text>
                                    </View>

                                    {/* Students */}
                                    <View style={styles.statItem}>
                                        <Users size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                        <Text style={[styles.statText, isDarkMode && styles.textGrayDark]}>
                                            {course.studentCount} {course.studentCount === 1 ? 'student' : 'students'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    headerContainer: {
        marginBottom: 24,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    gradientHeader: {
        borderRadius: 24,
        padding: 24,
        paddingBottom: 20,
        minHeight: 140,
        shadowColor: '#db2321',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    welcomeText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 16,
        marginBottom: 2,
    },
    userName: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 16,
    },
    statusBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    statusBubbleEditing: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    statusInput: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        minWidth: 60,
        maxWidth: 160,
        paddingVertical: 2,
        paddingHorizontal: 0,
    },
    coursesSection: {
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    courseCount: {
        fontSize: 14,
        color: '#6b7280',
    },
    coursesList: {
        gap: 12,
    },
    courseCard: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    courseCode: {
        fontSize: 20,
        fontWeight: '700',
        color: '#db2321',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
    },
    statText: {
        fontSize: 13,
        color: '#6b7280',
    },
    // Dark Mode
    containerDark: {
        backgroundColor: '#111827',
    },
    textDark: {
        color: '#f3f4f6',
    },
    textGrayDark: {
        color: '#9ca3af',
    },
    courseCardDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    courseCodeDark: {
        color: '#fca5a5',
    },
});
