import { useState, useEffect, useCallback } from 'react';
import { View, Alert, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import { usePosts } from '../hooks/usePosts';
import { useConnections } from '../hooks/useConnections';
import { useActivity } from '../hooks/useActivity';
import { useClassmates } from '../hooks/useClassmates';
import { useChat } from '../hooks/useChat';
import { uploadAvatar } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';

// Suppress SafeAreaView deprecation warning from Expo's internal packages
// We've already migrated all our code to use react-native-safe-area-context
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

// Import actual migrated components
import { NewNavigationTabs } from '../components/NewNavigationTabs';
import { ChatListScreen } from '../components/ChatListScreen';
import { IndividualChatScreen, Message } from '../components/IndividualChatScreen';
import { NotificationsScreen } from '../components/NotificationsScreen';
import { OnboardingToAppTransition } from '../components/OnboardingToAppTransition';

// New social features
import { ClassmatesScreen } from '../components/classmates/ClassmatesScreen';
import { ActivityScreen } from '../components/activity/ActivityScreen';
import { CourseDetailScreen } from '../components/courses/CourseDetailScreen';
import { PostDetailScreen } from '../components/courses/PostDetailScreen';
import { StudentHomeScreen } from '../components/home/StudentHomeScreen';

// Tutor components
import { TutorNavigationTabs } from '../components/tutor/TutorNavigationTabs';
import { TutorHomeScreen } from '../components/tutor/TutorHomeScreen';
import { TutorProfileScreen } from '../components/tutor/TutorProfileScreen';

// Profile components
import { EditProfileScreen } from '../components/profile/EditProfileScreen';
import { MyCoursesScreen } from '../components/profile/MyCoursesScreen';
import { SettingsScreen } from '../components/profile/SettingsScreen';
import { ChangePasswordScreen } from '../components/profile/ChangePasswordScreen';
import { ChangeEmailScreen } from '../components/profile/ChangeEmailScreen';
import { BlockedUsersScreen } from '../components/profile/BlockedUsersScreen';
import { PrivacyPolicyScreen } from '../components/profile/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../components/profile/TermsOfServiceScreen';
import { ConnectionsListScreen } from '../components/profile/ConnectionsListScreen';
import { PricingEditorScreen } from '../components/tutor/PricingEditorScreen';
import { TutorDetailModal } from '../components/TutorDetailModal';

// Onboarding components
import { WelcomeScreen } from '../components/onboarding/WelcomeScreen';
import { FadeTransition } from '../components/FadeTransition';
import { RoleSelectionScreen } from '../components/onboarding/RoleSelectionScreen';
import { SignUpScreen } from '../components/onboarding/SignUpScreen';
import { SignInScreen } from '../components/onboarding/SignInScreen';
import { CodeVerificationScreen } from '../components/onboarding/CodeVerificationScreen';
import { ProfileBasicsScreen } from '../components/onboarding/ProfileBasicsScreen';
import { ProfilePromptsScreen } from '../components/onboarding/ProfilePromptsScreen';
import { StudentCourseSelectionScreen } from '../components/onboarding/StudentCourseSelectionScreen';
import { StudentOnboardingSuccessScreen } from '../components/onboarding/StudentOnboardingSuccessScreen';
import { TutorCourseApplicationScreen } from '../components/onboarding/TutorCourseApplicationScreen';
import { TutorPricingSetupScreen } from '../components/onboarding/TutorPricingSetupScreen';
import { TutorOnboardingSuccessScreen } from '../components/onboarding/TutorOnboardingSuccessScreen';
import { TutorProofUploadScreen } from '../components/onboarding/TutorProofUploadScreen';
import { ForgotPasswordScreen } from '../components/onboarding/ForgotPasswordScreen';
import { PhoneInputScreen } from '../components/onboarding/PhoneInputScreen';
import { StudentProfileScreen } from '../components/StudentProfileScreen';
import { StudentProfileModal } from '../components/classmates/StudentProfileModal';

type SocialTabValue = 'home' | 'classmates' | 'chat' | 'activity' | 'profile';
type TutorTabValue = 'home' | 'connections' | 'chat' | 'activity' | 'profile';
type UserRole = 'student' | 'tutor';
type ProfileScreen =
    | 'main'
    | 'edit-profile'
    | 'my-courses'
    | 'connections'
    | 'notifications'
    | 'settings'
    | 'change-password'
    | 'change-email'
    | 'blocked-users'
    | 'privacy-policy'
    | 'terms-of-service'
    | 'pricing-editor';

type OnboardingScreen =
    | 'welcome'
    | 'role-selection'
    | 'sign-up'
    | 'sign-in'
    | 'code-verification'
    | 'profile-basics'
    | 'profile-prompts'
    | 'student-course-selection'
    | 'student-profile-completion'
    | 'student-success'
    | 'tutor-course-application'
    | 'tutor-profile-completion'
    | 'tutor-proof-upload'
    | 'tutor-pricing-setup'
    | 'tutor-success'
    | 'forgot-password'
    | 'phone-input'
    | 'code-verification-phone';

type Booking = {
    id: string;
    tutorName?: string;
    tutorInitial?: string;
    studentName?: string;
    studentInitial?: string;
    course: string;
    date: string;
    time: string;
    location: string;
    sessionType: 'group' | 'individual';
    price?: string;
    earnings?: string;
    status: 'Pending' | 'Confirmed' | 'Completed';
    studentsJoined?: number;
    maxStudents?: number;
};

export default function App() {
    // Auth hook
    const auth = useAuth();
    const [authLoading, setAuthLoading] = useState(false);

    // Onboarding state
    const [isOnboarding, setIsOnboarding] = useState(true);
    const [onboardingScreen, setOnboardingScreen] = useState<OnboardingScreen>('welcome');
    const [selectedOnboardingRole, setSelectedOnboardingRole] = useState<'student' | 'tutor' | null>(null);
    const [onboardingCourses, setOnboardingCourses] = useState<string[]>([]);
    const [onboardingPassword, setOnboardingPassword] = useState('');
    const [onboardingTutorCourses, setOnboardingTutorCourses] = useState<string[]>([]);
    const [onboardingTutorPricing, setOnboardingTutorPricing] = useState<any>(null);

    // Auto-login: if user has session + profile, skip onboarding
    useEffect(() => {
        if (!auth.loading && auth.session && auth.profile) {
            setUserRole(auth.profile.is_tutor ? 'tutor' : 'student');
            setIsOnboarding(false);
        }
    }, [auth.loading, auth.session, auth.profile]);

    const currentUserId = auth.profile?.id ?? null;
    const courses = useCourses(currentUserId);
    const connections = useConnections(currentUserId);
    const activityFeed = useActivity(currentUserId);
    const classmatesFeed = useClassmates(currentUserId);
    const chat = useChat(currentUserId);

    // Map real classmate profiles to the shape ClassmatesScreen/ActivityScreen/etc. expect.
    const mockClassmates = classmatesFeed.classmates.map((c) => ({
        id: c.id,
        name: c.name,
        pronouns: (c.pronouns ?? []).join('/').toLowerCase() || 'they/them',
        year: c.year,
        major: c.major,
        gender: (c.gender ?? 'Prefer not to say') as 'Man' | 'Woman' | 'Non-Binary' | 'Prefer not to say',
        photoUrl: c.photoUrl ?? undefined,
        sharedCourses: c.sharedCourses,
        prompts: c.prompts,
    }));

    // --- Universal Profile Viewer State ---
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [selectedProfileData, setSelectedProfileData] = useState<any>(null);

    // Real profile data (single profile shared across student/tutor views since is_tutor is one flag on one profile)
    const studentProfile = {
        name: auth.profile?.name ?? 'Student',
        pronouns: (auth.profile?.pronouns ?? ['He', 'Him']).join('/'),
        year: auth.profile?.year ?? '',
        program: auth.profile?.major ?? '',
        bio: auth.profile?.bio ?? '',
        photoUrl: auth.profile?.photo_url ?? null,
    };

    const tutorProfile = studentProfile;

    const handleViewProfile = (profileId: string) => {
        // Search classmates first, then connections (accepted friends may no longer appear as "classmates")
        let profile: any = mockClassmates.find((u) => u.id === profileId || u.name === profileId);
        if (!profile) {
            profile = connections.friendProfiles.find((u) => u.id === profileId || u.name === profileId);
        }

        if (profile) {
            setSelectedProfileData(profile);
            setSelectedProfileId(profile.id);
        }
    };

    const handleCloseProfile = () => {
        setSelectedProfileId(null);
        setSelectedProfileData(null);
    };
    const [onboardingEmail, setOnboardingEmail] = useState('');
    const [onboardingProfileBasics, setOnboardingProfileBasics] = useState<{
        name: string;
        pronouns: string[];
        gender: string;
        year: string;
        degreeLevel: string;
        major: string;
    } | null>(null);
    const [onboardingPrompts, setOnboardingPrompts] = useState<Array<{ prompt: string; answer: string }>>([]);

    // Role toggle state
    const [userRole, setUserRole] = useState<UserRole>('student');
    const [activeTutorTab, setActiveTutorTab] = useState<TutorTabValue>('home');
    const [tutorBookingTabIndex, setTutorBookingTabIndex] = useState(0);

    const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);

    // Clear highlighted booking after navigation
    useEffect(() => {
        if (highlightedBookingId) {
            const timer = setTimeout(() => {
                setHighlightedBookingId(null);
            }, 3000); // Clear after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [highlightedBookingId]);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const boardPosts = usePosts(selectedCourse, currentUserId);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [postComments, setPostComments] = useState<Awaited<ReturnType<typeof boardPosts.fetchComments>>>([]);
    const [courseTutors, setCourseTutors] = useState<Array<{ id: string; name: string; pronouns: string; groupPrice: string | null; individualPrice: string | null; location: string[] }>>([]);

    // Fetch tutors for the currently-open course board
    useEffect(() => {
        if (DEMO_MODE || !selectedCourse) {
            setCourseTutors([]);
            return;
        }
        (async () => {
            const { data: course } = await supabase.from('courses').select('id').eq('code', selectedCourse).single();
            if (!course) return;
            const { data: rows } = await supabase
                .from('tutor_courses')
                .select('user_id, group_price, individual_price, session_type, users(name, pronouns)')
                .eq('course_id', course.id)
                .eq('is_approved', true);
            setCourseTutors(
                (rows ?? []).map((r: any) => ({
                    id: r.user_id,
                    name: r.users?.name ?? 'Unknown',
                    pronouns: (r.users?.pronouns ?? []).join('/').toLowerCase(),
                    groupPrice: r.group_price != null ? String(r.group_price) : null,
                    individualPrice: r.individual_price != null ? String(r.individual_price) : null,
                    location: r.session_type === 'both' ? ['online', 'in-person'] : [r.session_type ?? 'online'],
                }))
            );
        })();
    }, [selectedCourse]);

    // Load comments whenever a post is opened
    useEffect(() => {
        if (!selectedPostId) {
            setPostComments([]);
            return;
        }
        boardPosts.fetchComments(selectedPostId).then(setPostComments);
    }, [selectedPostId]);

    // Tutor detail modal state
    const [selectedTutorForDetail, setSelectedTutorForDetail] = useState<any | null>(null);

    // Compatibility aliases: existing render code below reads/writes these names directly.
    const connectedFriends = connections.friends;
    const sentConnectionRequests = connections.sentRequests;
    const blockedUsers = connections.blocked;

    const handleToggleConnect = (id: string) => {
        connections.toggleConnect(id);
    };

    const handleDisconnectUser = (id: string, name: string) => {
        connections.disconnect(id);
        Alert.alert('Disconnected', `You are no longer connected with ${name}.`);
    };

    const handleBlockUser = (id: string, name: string) => {
        connections.block(id);
        Alert.alert('Blocked', `${name} has been blocked.`);
    };

    // Bookings state
    const [bookings, setBookings] = useState<Booking[]>([
        {
            id: '1',
            tutorName: 'Sarah Chen',
            tutorInitial: 'SC',
            studentName: 'Alex Martinez',
            studentInitial: 'A',
            course: 'SYSC 2006',
            date: 'Nov 20, 2024',
            time: '2:00 PM',
            sessionType: 'group',
            status: 'Confirmed',
            location: 'online',
            earnings: '$15.00',
            price: '$15'
        },
        {
            id: '2',
            tutorName: 'Marcus Johnson',
            tutorInitial: 'MJ',
            studentName: 'Maya Patel',
            studentInitial: 'M',
            course: 'MATH 1004',
            date: 'Tomorrow',
            time: '2:00 PM',
            sessionType: 'individual',
            status: 'Confirmed',
            location: 'online',
            earnings: '$30.00',
            price: '$30'
        },
        {
            id: '3',
            tutorName: 'Emily Rodriguez',
            tutorInitial: 'ER',
            studentName: 'Jordan Kim',
            studentInitial: 'J',
            course: 'SYSC 2006',
            date: 'Nov 22, 2024',
            time: '3:00 PM',
            sessionType: 'group',
            status: 'Pending',
            location: 'Science Building',
            earnings: '$18.00',
            price: '$18'
        }
    ]);

    // Notifications state
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([
        {
            id: '1',
            type: 'accepted',
            title: 'Booking Accepted',
            message: 'Sarah Chen accepted your booking for SYSC 2006 on Nov 20',
            timestamp: '2h ago',
            isUnread: true,
            data: { bookingId: '1' }
        },
        {
            id: '2',
            type: 'reminder',
            title: 'Session Tomorrow',
            message: 'Reminder: You have a session with Marcus Johnson tomorrow at 2:00 PM',
            timestamp: 'Yesterday',
            isUnread: false,
            data: { bookingId: '2' }
        }
    ]);

    // Chat state — backed by the real-data useChat hook (see top of component).
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    // Compatibility alias: keeps `tutorId` field the older render code expects.
    const conversations = chat.conversations.map(c => ({ ...c, tutorId: c.otherUserId }));

    // Profile screen state and user data
    const [profileScreen, setProfileScreen] = useState<ProfileScreen>('main');

    const myStudyingCourses = courses.studyingCourses;
    const myTutoringCourses = courses.tutoringCourses;
    const [tutorPricingSessionType, setTutorPricingSessionType] = useState<'online' | 'in-person' | 'both'>('both');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const userProfile = {
        name: auth.profile?.name ?? 'Student',
        pronouns: (auth.profile?.pronouns ?? ['He', 'Him']).join('/'),
        year: auth.profile?.year ?? '',
        program: auth.profile?.major ?? '',
        bio: auth.profile?.bio ?? '',
        email: auth.profile?.email ?? '',
        phone: '',
        courses: myStudyingCourses,
        language: 'English',
    };

    const [paymentMethods, setPaymentMethods] = useState([
        { id: '1', type: 'card' as const, last4: '4242', brand: 'Visa' },
    ]);

    // Mock classmates data for social features
    // Real activity/notifications data (from useActivity)
    const activities = activityFeed.activities;

    // Real course catalog (the user's own studying/tutoring courses, with live counts)
    const mockCourses = courses.catalog;

    // State for new social app tab
    const [socialActiveTab, setSocialActiveTab] = useState<SocialTabValue>('home');
    const currentUserGender = (auth.profile?.gender ?? 'Prefer not to say') as 'Man' | 'Woman' | 'Non-Binary' | 'Prefer not to say';
    const [userStatus, setUserStatus] = useState('Cramming');

    // Tutor mode render function
    const renderTutorContent = () => {
        if (showNotifications) {
            return (
                <NotificationsScreen
                    notifications={notifications}
                    onBack={() => setShowNotifications(false)}
                    onMarkAsRead={(id) => {
                        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
                    }}
                    onNotificationClick={(notification) => {
                        setShowNotifications(false);
                        if (notification.data?.bookingId) {
                            // Find which tab the booking is in
                            const booking = bookings.find(b => b.id === notification.data.bookingId);
                            if (booking) {
                                if (booking.status === 'Confirmed' || booking.status === 'Pending') {
                                    setTutorBookingTabIndex(1); // Confirmed
                                } else if (booking.status === 'Completed') {
                                    setTutorBookingTabIndex(2); // Past
                                } else {
                                    setTutorBookingTabIndex(0); // Pending
                                }
                                setHighlightedBookingId(booking.id);
                                setActiveTutorTab('activity');
                            }
                        }
                    }}
                />
            );
        }

        switch (activeTutorTab) {
            case 'home':
                return (
                    <TutorHomeScreen
                        tutorName="Jane"
                        courses={mockCourses}
                        tutoringCourses={[
                            { code: 'SYSC 2006', name: 'Systems Programming', activeCount: 8, tutorCount: 1, studentCount: 42 },
                            { code: 'COMP 1405', name: 'Intro to Computer Science', activeCount: 15, tutorCount: 1, studentCount: 78 },
                        ]}
                        onCoursePress={(courseCode) => {
                            setSelectedCourse(courseCode);
                        }}
                        userStatus={userStatus}
                        onStatusChange={(status) => setUserStatus(status)}
                        isDarkMode={theme === 'dark'}
                    />
                );
            case 'activity':
                // Use same activity screen as students
                return (
                    <ActivityScreen
                        activities={activities}
                        onAcceptConnection={(id) => {
                            const activity = activities.find(a => a.id === id);
                            if (activity?.referenceId) {
                                connections.acceptRequest(activity.referenceId);
                            }
                            activityFeed.markRead(id);
                        }}
                        onDeclineConnection={(id) => {
                            const activity = activities.find(a => a.id === id);
                            if (activity?.referenceId) {
                                connections.declineRequest(activity.referenceId);
                            }
                            activityFeed.removeActivity(id);
                        }}
                        onActivityTap={(activity) => {
                            activityFeed.markRead(activity.id);

                            // Navigate based on activity type
                            if (activity.type === 'message') {
                                setActiveTutorTab('chat');
                            } else if (activity.type === 'board_reply' || activity.type === 'board_like') {
                                if (activity.courseName) {
                                    setSelectedCourse(activity.courseName);
                                }
                            }
                        }}
                        onMarkAllRead={() => {
                            activityFeed.markAllRead();
                        }}
                        onViewProfile={(name) => {
                            const user = mockClassmates.find(u => u.name === name);
                            if (user) {
                                setSelectedProfileId(user.id);
                                setSelectedProfileData(user);
                            }
                        }}
                        isDarkMode={theme === 'dark'}
                    />
                );
            case 'connections':
                // Use same ClassmatesScreen as students
                return (
                    <ClassmatesScreen
                        profiles={mockClassmates.filter(p => !blockedUsers.has(p.id))}
                        currentUserGender={currentUserGender}
                        onConnect={handleToggleConnect}
                        connectedProfiles={sentConnectionRequests}
                        friends={connectedFriends}
                        onBlock={(id) => handleBlockUser(id, mockClassmates.find(c => c.id === id)?.name || 'User')}
                        onDisconnect={(id) => handleDisconnectUser(id, mockClassmates.find(c => c.id === id)?.name || 'User')}
                        onViewProfile={(profile) => {
                            handleViewProfile(profile.id);
                        }}
                        isDarkMode={theme === 'dark'}
                    />
                );
            case 'chat':
                return (
                    <ChatListScreen
                        conversations={conversations}
                        onConversationClick={(id) => {
                            setSelectedConversationId(id);
                            chat.markConversationRead(id);
                            chat.fetchMessages(id);
                        }}
                        onDeleteConversation={(conversationId) => {
                            chat.deleteConversation(conversationId);
                        }}
                        isTutor={true}
                        isDarkMode={theme === 'dark'}
                    />
                );
            case 'profile':
                return (
                    <TutorProfileScreen
                        tutorName={tutorProfile.name}
                        tutorInitial={tutorProfile.name.charAt(0)}
                        role="tutor"
                        onEditProfile={() => setProfileScreen('edit-profile')}
                        onEditCourses={() => setProfileScreen('my-courses')}
                        onEditPricing={() => setProfileScreen('pricing-editor')}
                        onSettings={() => setProfileScreen('settings')}
                        onConnections={() => setProfileScreen('connections')}
                        connectionsCount={connectedFriends.size}
                        onLogout={async () => {
                            await auth.signOut();
                            setIsOnboarding(true);
                            setOnboardingScreen('welcome');
                            setTheme('light');
                        }}
                        isDarkMode={theme === 'dark'}
                    />
                );
            default:
                return (
                    <TutorHomeScreen
                        tutorName="Jane"
                        courses={mockCourses}
                        tutoringCourses={[
                            { code: 'SYSC 2006', name: 'Systems Programming', activeCount: 8, tutorCount: 1, studentCount: 42 },
                            { code: 'COMP 1405', name: 'Intro to Computer Science', activeCount: 15, tutorCount: 1, studentCount: 78 },
                        ]}
                        onCoursePress={(courseCode) => {
                            setSelectedCourse(courseCode);
                        }}
                        userStatus={userStatus}
                        onStatusChange={(status) => setUserStatus(status)}
                        isDarkMode={theme === 'dark'}
                    />
                );
        }
    };

    // Helper to render CourseDetailScreen overlay
    const renderCourseDetailOverlay = () => {
        if (!selectedCourse) return null;

        const course = mockCourses.find(c => c.code === selectedCourse);

        return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}>
                <CourseDetailScreen
                    courseCode={selectedCourse}
                    posts={boardPosts.posts}
                    tutors={courseTutors.map(t => ({
                        id: t.id,
                        name: t.name,
                        courses: [selectedCourse],
                        pronouns: t.pronouns,
                        groupPrice: t.groupPrice,
                        individualPrice: t.individualPrice,
                        location: t.location,
                    }))}
                    activeCount={course?.activeCount || 0}
                    studentCount={course?.studentCount || 0}
                    onBack={() => setSelectedCourse(null)}
                    onCreatePost={(content, type) => boardPosts.createPost(content, type)}
                    onLikePost={(id) => boardPosts.toggleLike(id)}
                    onCommentPost={(id) => setSelectedPostId(id)}
                    onMessageTutor={async (id) => {
                        // 1. Close the course detail overlay
                        setSelectedCourse(null);

                        // 2. Switch to chat tab
                        setSocialActiveTab('chat');
                        if (userRole === 'tutor') {
                            setActiveTutorTab('chat');
                        }

                        // 3. Find or create the conversation with this tutor
                        const convId = await chat.getOrCreateConversation(id);
                        if (convId) {
                            setSelectedConversationId(convId);
                            await chat.fetchMessages(convId);
                        }
                    }}
                    onViewProfile={handleViewProfile}
                    isDarkMode={theme === 'dark'}
                />
            </View>
        );
    };

    // Helper to render the post detail (comments) overlay
    const renderPostDetailOverlay = () => {
        if (!selectedPostId) return null;
        const post = boardPosts.posts.find(p => p.id === selectedPostId);
        if (!post) return null;

        return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}>
                <PostDetailScreen
                    postId={post.id}
                    authorName={post.authorName}
                    authorInitial={post.authorInitial}
                    authorYear={post.authorYear}
                    timestamp={post.timestamp}
                    content={post.content}
                    likes={post.likes}
                    comments={postComments}
                    isLiked={post.isLiked}
                    type={post.type}
                    onBack={() => setSelectedPostId(null)}
                    onLikePost={() => boardPosts.toggleLike(post.id)}
                    onLikeComment={(commentId) => {
                        const comment = postComments.find(c => c.id === commentId);
                        if (!comment) return;
                        setPostComments(prev => prev.map(c => c.id === commentId ? { ...c, isLiked: !c.isLiked, likes: c.likes + (c.isLiked ? -1 : 1) } : c));
                        boardPosts.toggleCommentLike(commentId, comment.isLiked);
                    }}
                    onAddComment={async (content) => {
                        await boardPosts.addComment(post.id, content);
                        const updated = await boardPosts.fetchComments(post.id);
                        setPostComments(updated);
                    }}
                    onViewProfile={handleViewProfile}
                    isDarkMode={theme === 'dark'}
                />
            </View>
        );
    };

    // Helper to render profile overlay screens
    const renderProfileOverlay = () => {
        const isTutor = userRole === 'tutor';
        const currentTab = isTutor ? activeTutorTab : socialActiveTab;
        if (currentTab !== 'profile' || profileScreen === 'main') return null;

        const commonProps = {
            onBack: () => setProfileScreen('main'),
        };

        const overlayStyle = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' };

        // Render settings as base overlay if we're on a nested screen
        const needsSettingsBase = ['change-password', 'change-email', 'blocked-users', 'privacy-policy', 'terms-of-service'].includes(profileScreen);

        const handleDeleteAccount = async () => {
            const { error } = await auth.deleteAccount();
            if (error) {
                Alert.alert('Error', error);
                return;
            }
            setIsOnboarding(true);
            setOnboardingScreen('welcome');
        };

        return (
            <>
                {needsSettingsBase && (
                    <View style={overlayStyle}>
                        <SettingsScreen
                            {...commonProps}
                            email={auth.profile?.email ?? ''}
                            isTutor={userRole === 'tutor'}
                            theme={theme}
                            onChangePassword={() => setProfileScreen('change-password')}
                            onChangeEmail={() => setProfileScreen('change-email')}
                            onDeleteAccount={handleDeleteAccount}
                            onBlockedUsers={() => setProfileScreen('blocked-users')}
                            onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
                            onTermsOfService={() => setProfileScreen('terms-of-service')}
                            onThemeChange={(newTheme) => setTheme(newTheme)}
                            onLogout={async () => {
                                await auth.signOut();
                                setIsOnboarding(true);
                                setOnboardingScreen('welcome');
                            }}
                            onNavigate={(screen) => console.log('Navigate to', screen)}
                        />
                    </View>
                )}
                {profileScreen === 'edit-profile' && (
                    <View style={overlayStyle}>
                        <EditProfileScreen
                            {...commonProps}
                            name={studentProfile.name}
                            pronouns={studentProfile.pronouns || 'He/Him'}
                            year={studentProfile.year || '2nd Year'}
                            program={studentProfile.program}
                            bio={studentProfile.bio}
                            initial={studentProfile.name.charAt(0)}
                            isTutor={userRole === 'tutor'}
                            profileImage={studentProfile.photoUrl}
                            onSave={async (data) => {
                                let photoUrl = data.profileImage;
                                if (photoUrl && photoUrl.startsWith('file:')) {
                                    try {
                                        photoUrl = currentUserId ? await uploadAvatar(currentUserId, photoUrl) : photoUrl;
                                    } catch (e) {
                                        console.error('Avatar upload failed:', e);
                                    }
                                }
                                const { error } = await auth.updateProfile({
                                    name: data.name,
                                    pronouns: data.pronouns,
                                    gender: data.gender,
                                    year: data.year,
                                    degreeLevel: data.degreeLevel,
                                    major: data.program,
                                    bio: data.bio,
                                    profileVisibility: data.profileVisibility,
                                    photoUrl,
                                    prompts: data.prompts,
                                });
                                if (error) {
                                    Alert.alert('Error', error);
                                    return;
                                }
                                setProfileScreen('main');
                            }}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'my-courses' && (
                    <View style={overlayStyle}>
                        <MyCoursesScreen
                            {...commonProps}
                            selectedCourses={myStudyingCourses}
                            tutoringCourses={myTutoringCourses}
                            isTutor={isTutor}
                            onSave={(newCourses) => {
                                courses.setAllStudyingCourses(newCourses);
                                setProfileScreen('main');
                            }}
                            onSaveTutoring={(newCourses, proofUris) => {
                                courses.setAllTutoringCourses(newCourses, proofUris);
                                setProfileScreen('main');
                            }}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'pricing-editor' && (
                    <View style={overlayStyle}>
                        <PricingEditorScreen
                            courses={myTutoringCourses}
                            initialGroupPrice={20}
                            initialIndividualPrice={40}
                            initialSessionType={tutorPricingSessionType}
                            onBack={() => setProfileScreen('main')}
                            onSave={(data) => {
                                setTutorPricingSessionType(data.sessionType);
                                setProfileScreen('main');
                            }}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'settings' && !needsSettingsBase && (
                    <View style={overlayStyle}>
                        <SettingsScreen
                            {...commonProps}
                            email={auth.profile?.email ?? ''}
                            isTutor={userRole === 'tutor'}
                            theme={theme}
                            onChangePassword={() => setProfileScreen('change-password')}
                            onChangeEmail={() => setProfileScreen('change-email')}
                            onDeleteAccount={handleDeleteAccount}
                            onBlockedUsers={() => setProfileScreen('blocked-users')}
                            onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
                            onTermsOfService={() => setProfileScreen('terms-of-service')}
                            onThemeChange={(newTheme) => setTheme(newTheme)}
                            onLogout={async () => {
                                await auth.signOut();
                                setIsOnboarding(true);
                                setOnboardingScreen('welcome');
                            }}
                            onNavigate={(screen) => console.log('Navigate to', screen)}
                        />
                    </View>
                )}
                {profileScreen === 'change-password' && (
                    <View style={overlayStyle}>
                        <ChangePasswordScreen
                            onBack={() => setProfileScreen('settings')}
                            onSave={async (currentPassword, newPassword) => {
                                const { error } = await auth.updatePassword(currentPassword, newPassword);
                                if (error) {
                                    Alert.alert('Error', error);
                                    return;
                                }
                                Alert.alert('Success', 'Your password has been updated.');
                                setProfileScreen('settings');
                            }}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'change-email' && (
                    <View style={overlayStyle}>
                        <ChangeEmailScreen
                            currentEmail={auth.profile?.email ?? ''}
                            onBack={() => setProfileScreen('settings')}
                            onSave={async (newEmail, currentPassword) => {
                                const { error } = await auth.updateEmail(currentPassword, newEmail);
                                if (error) {
                                    Alert.alert('Error', error);
                                    return;
                                }
                                Alert.alert('Check your inbox', 'Confirm the change from a link sent to your new email address.');
                                setProfileScreen('settings');
                            }}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'blocked-users' && (
                    <View style={overlayStyle}>
                        <BlockedUsersScreen
                            blockedUsers={Array.from(blockedUsers).map(id => {
                                const classmate = mockClassmates.find(c => c.id === id);
                                return {
                                    id,
                                    name: classmate?.name || 'Unknown User',
                                    initial: classmate?.name?.charAt(0) || '?',
                                };
                            })}
                            onBack={() => setProfileScreen('settings')}
                            onUnblock={(id) => {
                                connections.unblock(id);
                            }}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'privacy-policy' && (
                    <View style={overlayStyle}>
                        <PrivacyPolicyScreen
                            onBack={() => setProfileScreen('settings')}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'terms-of-service' && (
                    <View style={overlayStyle}>
                        <TermsOfServiceScreen
                            onBack={() => setProfileScreen('settings')}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'connections' && (
                    <View style={overlayStyle}>
                        <ConnectionsListScreen
                            connections={connections.friendProfiles}
                            onBack={() => setProfileScreen('main')}
                            onMessage={async (connectionId) => {
                                // Switch to chat tab based on user role
                                if (userRole === 'tutor') {
                                    setActiveTutorTab('chat');
                                } else {
                                    setSocialActiveTab('chat');
                                }
                                setProfileScreen('main');
                                const convId = await chat.getOrCreateConversation(connectionId);
                                if (convId) {
                                    setSelectedConversationId(convId);
                                    await chat.fetchMessages(convId);
                                }
                            }}
                            onViewProfile={(connectionId) => handleViewProfile(connectionId)}
                            onDisconnect={(connectionId, name) => handleDisconnectUser(connectionId, name)}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
            </>
        );
    };

    // Helper to render chat overlay
    const renderChatOverlay = () => {
        const isTutor = userRole === 'tutor';
        const currentTab = isTutor ? activeTutorTab : socialActiveTab;
        if (currentTab !== 'chat' || !selectedConversationId) return null;

        const conversation = conversations.find(c => c.id === selectedConversationId);
        const msgs = chat.messagesByConversation[selectedConversationId] || [];

        return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}>
                <IndividualChatScreen
                    tutorName={conversation?.tutorName || ''}
                    tutorInitial={conversation?.tutorInitial || ''}
                    messages={msgs}
                    onBack={() => setSelectedConversationId(null)}
                    type={conversation?.type}
                    onViewProfile={() => {
                        const target = conversation?.otherUserId || conversation?.tutorName || '';
                        handleViewProfile(target);
                    }}
                    onSendMessage={(text) => {
                        chat.sendMessage(selectedConversationId, text);
                    }}
                    isTutorView={false}
                    isDarkMode={theme === 'dark'}
                />
            </View>
        );
    };

    // NEW: Social app render function
    const renderSocialContent = () => {
        switch (socialActiveTab) {
            case 'home':
                return (
                    <StudentHomeScreen
                        userName={userProfile.name}
                        userStatus={userStatus}
                        courses={mockCourses}
                        onCoursePress={(code) => setSelectedCourse(code)}
                        onStatusChange={(status) => setUserStatus(status)}
                        isDarkMode={theme === 'dark'}
                    />
                );

            case 'classmates':
                return (
                    <ClassmatesScreen
                        profiles={mockClassmates.filter(p => !blockedUsers.has(p.id))}
                        currentUserGender={currentUserGender}
                        onConnect={handleToggleConnect}
                        connectedProfiles={sentConnectionRequests}
                        friends={connectedFriends}
                        onBlock={(id) => handleBlockUser(id, mockClassmates.find(c => c.id === id)?.name || 'User')}
                        onDisconnect={(id) => handleDisconnectUser(id, mockClassmates.find(c => c.id === id)?.name || 'User')}
                        onViewProfile={(profile) => {
                            handleViewProfile(profile.id);
                        }}
                        isDarkMode={theme === 'dark'}
                    />
                );

            case 'chat':
                return (
                    <ChatListScreen
                        conversations={conversations}
                        onConversationClick={(id) => {
                            setSelectedConversationId(id);
                            chat.markConversationRead(id);
                            chat.fetchMessages(id);
                        }}
                        onDeleteConversation={(conversationId) => {
                            chat.deleteConversation(conversationId);
                        }}
                        isDarkMode={theme === 'dark'}
                    />
                );

            case 'activity':
                return (
                    <ActivityScreen
                        activities={activities}
                        onAcceptConnection={(id) => {
                            const activity = activities.find(a => a.id === id);
                            if (activity?.referenceId) {
                                connections.acceptRequest(activity.referenceId);
                            }
                            activityFeed.markRead(id);
                        }}
                        onDeclineConnection={(id) => {
                            const activity = activities.find(a => a.id === id);
                            if (activity?.referenceId) {
                                connections.declineRequest(activity.referenceId);
                            }
                            activityFeed.removeActivity(id);
                        }}
                        onActivityTap={(activity) => {
                            activityFeed.markRead(activity.id);

                            // Navigate based on activity type
                            if (activity.type === 'message') {
                                setSocialActiveTab('chat');
                            } else if (activity.type === 'board_reply' || activity.type === 'board_like') {
                                if (activity.courseName) {
                                    setSelectedCourse(activity.courseName);
                                }
                            }
                        }}
                        onMarkAllRead={() => {
                            activityFeed.markAllRead();
                        }}
                        onViewProfile={(name) => {
                            const user = mockClassmates.find(u => u.name === name);
                            if (user) {
                                setSelectedProfileId(user.id);
                                setSelectedProfileData(user);
                            }
                        }}
                        isDarkMode={theme === 'dark'}
                    />
                );

            case 'profile':
                return (
                    <StudentProfileScreen
                        name={userProfile.name}
                        email={auth.profile?.email ?? ''}
                        role="Student"
                        connectionsCount={connectedFriends.size}
                        onEditProfile={() => setProfileScreen('edit-profile')}
                        onMyCourses={() => setProfileScreen('my-courses')}
                        onConnections={() => setProfileScreen('connections')}
                        onSettings={() => setProfileScreen('settings')}
                        onLogout={async () => {
                            await auth.signOut();
                            setIsOnboarding(true);
                            setOnboardingScreen('welcome');
                            setTheme('light');
                        }}
                        isDarkMode={theme === 'dark'}
                    />
                );

            default:
                return <View />;
        }
    };

    // Onboarding render function
    const renderOnboarding = () => {
        return (
            <View style={{ flex: 1 }}>
                <FadeTransition isVisible={onboardingScreen === 'welcome'} zIndex={1}>
                    <WelcomeScreen
                        onGetStarted={() => setOnboardingScreen('role-selection')}
                        onSignIn={() => setOnboardingScreen('sign-in')}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'role-selection'} zIndex={2}>
                    <RoleSelectionScreen
                        onBack={() => setOnboardingScreen('welcome')}
                        onSelectRole={(role) => {
                            setSelectedOnboardingRole(role);
                            setOnboardingScreen('sign-up');
                        }}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'sign-up'} zIndex={3}>
                    <SignUpScreen
                        role={selectedOnboardingRole || 'student'}
                        onBack={() => setOnboardingScreen('role-selection')}
                        onSignUp={async (email, password) => {
                            setAuthLoading(true);
                            const { error } = await auth.signUp(email, password);
                            setAuthLoading(false);
                            if (error) {
                                Alert.alert('Sign Up Error', error);
                                return;
                            }
                            setOnboardingEmail(email);
                            setOnboardingPassword(password);
                            setUserRole(selectedOnboardingRole || 'student');
                            setOnboardingScreen('code-verification');
                        }}
                        onSignInLink={() => setOnboardingScreen('sign-in')}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'code-verification'} zIndex={4}>
                    <CodeVerificationScreen
                        target={onboardingEmail}
                        method="email"
                        onBack={() => setOnboardingScreen('sign-up')}
                        onVerify={async (code) => {
                            setAuthLoading(true);
                            const { error } = await auth.verifyOtp(onboardingEmail, code);
                            setAuthLoading(false);
                            if (error) {
                                Alert.alert('Verification Error', error);
                                return;
                            }
                            // OTP verified — now sign in to get session
                            if (onboardingPassword) {
                                await auth.signIn(onboardingEmail, onboardingPassword);
                            }
                            setOnboardingScreen('profile-basics');
                        }}
                        onResendCode={async () => {
                            const { error } = await auth.resendOtp(onboardingEmail);
                            if (error) {
                                Alert.alert('Resend Error', error);
                            }
                        }}
                        onPhoneVerify={() => setOnboardingScreen('phone-input')}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'profile-basics'} zIndex={5}>
                    <ProfileBasicsScreen
                        onBack={() => setOnboardingScreen('code-verification')}
                        onContinue={(profileData) => {
                            setOnboardingProfileBasics(profileData);
                            setOnboardingScreen('profile-prompts');
                        }}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'profile-prompts'} zIndex={6}>
                    <ProfilePromptsScreen
                        onBack={() => setOnboardingScreen('profile-basics')}
                        onContinue={(prompts) => {
                            setOnboardingPrompts(prompts);
                            setOnboardingScreen('student-course-selection');
                        }}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'forgot-password'} zIndex={4}>
                    <ForgotPasswordScreen
                        onBack={() => setOnboardingScreen('sign-in')}
                        onSendCode={async (email) => {
                            const { error } = await auth.resetPassword(email);
                            if (error) {
                                Alert.alert('Reset Error', error);
                                return;
                            }
                            Alert.alert('Email Sent', 'Check your email for the password reset link.');
                            setOnboardingScreen('sign-in');
                        }}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'phone-input'} zIndex={4}>
                    <PhoneInputScreen
                        onBack={() => setOnboardingScreen('code-verification')}
                        onSendCode={(phone) => {
                            // Assume simplified flow for now - reuse code struct
                            setOnboardingScreen('code-verification-phone');
                            // In a real app we'd save the phone number
                        }}
                    />
                </FadeTransition>

                {/* New: Phone Code Verification */}
                <FadeTransition isVisible={onboardingScreen === 'code-verification-phone'} zIndex={4}>
                    <CodeVerificationScreen
                        target="(613) 555-0123" // Mock phone
                        method="phone"
                        onBack={() => setOnboardingScreen('phone-input')}
                        onVerify={(code) => {
                            // Code verified, go to profile basics
                            setOnboardingScreen('profile-basics');
                        }}
                        onResendCode={() => console.log('Resending SMS')}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'sign-in'} zIndex={3}>
                    <SignInScreen
                        onBack={() => setOnboardingScreen('welcome')}
                        onSignIn={async (email, password) => {
                            setAuthLoading(true);
                            const { error, needsProfile } = await auth.signIn(email, password);
                            setAuthLoading(false);
                            if (error) {
                                Alert.alert('Sign In Error', error);
                                return;
                            }
                            if (needsProfile) {
                                // User verified but hasn't completed profile
                                setOnboardingEmail(email);
                                setOnboardingScreen('profile-basics');
                                return;
                            }
                            // Signed in with complete profile — profile auto-loads via useAuth effect
                        }}
                        onSignUpLink={() => setOnboardingScreen('role-selection')}
                        onForgotPassword={() => setOnboardingScreen('forgot-password')}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'student-course-selection'} zIndex={7}>
                    <StudentCourseSelectionScreen
                        onBack={() => setOnboardingScreen('profile-prompts')}
                        onContinue={(courses) => {
                            setOnboardingCourses(courses);
                            // If tutor role selected, go to tutor course application
                            // Otherwise go to success
                            if (selectedOnboardingRole === 'tutor') {
                                setOnboardingScreen('tutor-course-application');
                            } else {
                                setOnboardingScreen('student-success');
                            }
                        }}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'student-success'} zIndex={12}>
                    <StudentOnboardingSuccessScreen
                        onComplete={async () => {
                            if (onboardingProfileBasics) {
                                setAuthLoading(true);
                                const { error } = await auth.createProfile({
                                    name: onboardingProfileBasics.name,
                                    pronouns: onboardingProfileBasics.pronouns,
                                    gender: onboardingProfileBasics.gender,
                                    year: onboardingProfileBasics.year,
                                    degreeLevel: onboardingProfileBasics.degreeLevel,
                                    major: onboardingProfileBasics.major,
                                    prompts: onboardingPrompts,
                                    courses: onboardingCourses,
                                    isTutor: false,
                                });
                                setAuthLoading(false);
                                if (error) {
                                    Alert.alert('Profile Error', error);
                                    return;
                                }
                            }
                            setUserRole('student');
                            setIsOnboarding(false);
                        }}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'tutor-course-application'} zIndex={8}>
                    <TutorCourseApplicationScreen
                        onBack={() => setOnboardingScreen('student-course-selection')}
                        onContinue={(courses) => {
                            setOnboardingTutorCourses(courses);
                            setOnboardingScreen('tutor-proof-upload');
                        }}
                        isDarkMode={theme === 'dark'}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'tutor-proof-upload'} zIndex={9}>
                    <TutorProofUploadScreen
                        courses={onboardingCourses}
                        onBack={() => setOnboardingScreen('tutor-course-application')}
                        onContinue={() => setOnboardingScreen('tutor-pricing-setup')}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'tutor-pricing-setup'} zIndex={10}>
                    <TutorPricingSetupScreen
                        courses={onboardingTutorCourses.length > 0 ? onboardingTutorCourses : onboardingCourses}
                        onBack={() => setOnboardingScreen('tutor-proof-upload')}
                        onContinue={(pricing) => {
                            setOnboardingTutorPricing(pricing);
                            setOnboardingScreen('tutor-success');
                        }}
                        isDarkMode={theme === 'dark'}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'tutor-success'} zIndex={11}>
                    <TutorOnboardingSuccessScreen
                        onComplete={async () => {
                            if (onboardingProfileBasics) {
                                setAuthLoading(true);
                                // Build tutor course data with pricing
                                const tutorCourseData = (onboardingTutorCourses.length > 0 ? onboardingTutorCourses : onboardingCourses).map((code) => {
                                    const pricing = onboardingTutorPricing?.[code] || {};
                                    return {
                                        courseCode: code,
                                        groupPrice: pricing.groupPrice ?? null,
                                        individualPrice: pricing.individualPrice ?? null,
                                    };
                                });

                                const { error } = await auth.createProfile({
                                    name: onboardingProfileBasics.name,
                                    pronouns: onboardingProfileBasics.pronouns,
                                    gender: onboardingProfileBasics.gender,
                                    year: onboardingProfileBasics.year,
                                    degreeLevel: onboardingProfileBasics.degreeLevel,
                                    major: onboardingProfileBasics.major,
                                    prompts: onboardingPrompts,
                                    courses: onboardingCourses,
                                    isTutor: true,
                                    tutorCourses: tutorCourseData,
                                });
                                setAuthLoading(false);
                                if (error) {
                                    Alert.alert('Profile Error', error);
                                    return;
                                }
                            }
                            setUserRole('tutor');
                            setIsOnboarding(false);
                        }}
                    />
                </FadeTransition>
            </View>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#111827' : 'white' }}>
                <StatusBar style={theme === 'dark' ? 'light' : 'auto'} />
                <View className="flex-1">
                    {isOnboarding ? (
                        renderOnboarding()
                    ) : (
                        <OnboardingToAppTransition show={true}>
                            <View className="flex-1">
                                {userRole === 'tutor' ? (
                                    <>
                                        <View className="flex-1">
                                            {renderTutorContent()}
                                            {renderCourseDetailOverlay()}
                                            {renderPostDetailOverlay()}
                                            {renderChatOverlay()}
                                            {renderProfileOverlay()}
                                        </View>
                                        <TutorNavigationTabs
                                            activeTab={activeTutorTab}
                                            onTabChange={(tab) => {
                                                setShowNotifications(false);
                                                setSelectedCourse(null); // Reset course detail view
                                                // If clicking chat tab, go back to chat list
                                                if (tab === 'chat') {
                                                    setSelectedConversationId(null);
                                                }
                                                // If clicking profile tab, go back to main profile
                                                if (tab === 'profile') {
                                                    setProfileScreen('main');
                                                }
                                                setActiveTutorTab(tab);
                                            }}
                                            unreadCount={conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)}
                                            isDarkMode={theme === 'dark'}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <View className="flex-1" style={{ position: 'relative' }}>
                                            {renderSocialContent()}
                                            {renderCourseDetailOverlay()}
                                            {renderPostDetailOverlay()}
                                            {renderChatOverlay()}
                                            {renderProfileOverlay()}
                                        </View>
                                        <NewNavigationTabs
                                            activeTab={socialActiveTab}
                                            onTabChange={(tab) => {
                                                setSelectedCourse(null); // Reset course detail view
                                                // If clicking chat tab, go back to chat list
                                                if (tab === 'chat') {
                                                    setSelectedConversationId(null);
                                                }
                                                // If clicking profile tab, go back to main profile
                                                if (tab === 'profile') {
                                                    setProfileScreen('main');
                                                }
                                                setSocialActiveTab(tab);
                                            }}
                                            unreadMessages={conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)}
                                            unreadActivity={activities.filter(a => a.isUnread).length}
                                            isDarkMode={theme === 'dark'}
                                        />
                                    </>
                                )}
                            </View>
                        </OnboardingToAppTransition>
                    )}

                    {/* Modals */}
                    {selectedTutorForDetail && (
                        <TutorDetailModal
                            isOpen={!!selectedTutorForDetail}
                            onClose={() => setSelectedTutorForDetail(null)}
                            tutor={selectedTutorForDetail}
                        />
                    )}
                </View>
                {/* Universal Profile Viewer Modal */}
                <StudentProfileModal
                    isVisible={!!selectedProfileId}
                    onClose={handleCloseProfile}
                    studentData={selectedProfileData}
                    onConnect={handleToggleConnect}
                    isConnected={selectedProfileId ? sentConnectionRequests.has(selectedProfileId) : false}
                    isFriend={selectedProfileId ? connectedFriends.has(selectedProfileId) : false}
                    onBlock={(id) => {
                        handleBlockUser(id, selectedProfileData?.name || 'User');
                        handleCloseProfile();
                    }}
                    onDisconnect={(id) => {
                        handleDisconnectUser(id, selectedProfileData?.name || 'User');
                        handleCloseProfile();
                    }}
                    isDarkMode={theme === 'dark'}
                />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}


