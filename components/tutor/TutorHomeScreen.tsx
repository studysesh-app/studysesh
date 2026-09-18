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

interface TutorHomeScreenProps {
    tutorName: string;
    courses: Course[]; // Courses they're enrolled in as a student
    tutoringCourses: Course[]; // Courses they're tutoring
    onCoursePress: (courseCode: string) => void;
    userStatus?: string;
    onStatusChange?: (status: string) => void;
    isDarkMode?: boolean;
}

export function TutorHomeScreen({
    tutorName,
    courses,
    tutoringCourses,
    onCoursePress,
    userStatus = 'Teaching',
    onStatusChange,
    isDarkMode = false,
}: TutorHomeScreenProps) {
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

    const renderCourseCard = (course: Course, isTutoring: boolean = false) => (
        <TouchableOpacity
            key={course.code}
            style={[styles.courseCard, isDarkMode && styles.courseCardDark]}
            onPress={() => onCoursePress(course.code)}
            activeOpacity={0.8}
        >
            {/* Course Code */}
            <View style={styles.courseHeader}>
                <Text style={[styles.courseCode, isDarkMode && styles.courseCodeDark]}>
                    {formatCourseCode(course.code)}
                </Text>
                {isTutoring && (
                    <View style={styles.tutoringBadge}>
                        <GraduationCap size={12} color="#fff" />
                        <Text style={styles.tutoringBadgeText}>Tutoring</Text>
                    </View>
                )}
            </View>

            {/* Stats Row: Active | Students */}
            <View style={styles.statsRow}>
                {/* Active */}
                <View style={styles.statItem}>
                    <View style={styles.activeDot} />
                    <Text style={[styles.statText, isDarkMode && styles.textGrayDark]}>{course.activeCount} active</Text>
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
    );

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
                        <Text style={styles.userName}>{tutorName}</Text>

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

                {/* Tutoring Courses Section */}
                {
                    tutoringCourses.length > 0 && (
                        <View style={styles.coursesSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Tutoring Courses</Text>
                                <Text style={[styles.courseCount, isDarkMode && styles.textGrayDark]}>
                                    {tutoringCourses.length} {tutoringCourses.length === 1 ? 'course' : 'courses'}
                                </Text>
                            </View>

                            <View style={styles.coursesList}>
                                {tutoringCourses.map((course) => renderCourseCard(course, true))}
                            </View>
                        </View>
                    )
                }

                {/* My Courses Section (as student) */}
                {
                    courses.length > 0 && (
                        <View style={[styles.coursesSection, { marginTop: tutoringCourses.length > 0 ? 24 : 0 }]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>My Courses</Text>
                                <Text style={[styles.courseCount, isDarkMode && styles.textGrayDark]}>
                                    {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                                </Text>
                            </View>

                            <View style={styles.coursesList}>
                                {courses.map((course) => renderCourseCard(course, false))}
                            </View>
                        </View>
                    )
                }
            </ScrollView >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#111827',
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
        justifyContent: 'center',
        shadowColor: '#db2321',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
    },
    welcomeSection: {
        flex: 1,
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 2,
    },
    userName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 24,
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
    bellButton: {
        padding: 8,
    },
    bellContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#db2321',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
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
    courseCardDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    courseCode: {
        fontSize: 20,
        fontWeight: '700',
        color: '#db2321',
    },
    courseCodeDark: {
        color: '#fca5a5',
    },
    tutoringBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#db2321',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    tutoringBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
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
    textDark: {
        color: '#f3f4f6',
    },
    textGrayDark: {
        color: '#9ca3af',
    },
});
