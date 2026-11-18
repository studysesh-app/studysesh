import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { View, LogBox, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../lib/alert';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import { usePosts } from '../hooks/usePosts';
import { useComments } from '../hooks/useComments';
import { useConnections } from '../hooks/useConnections';
import { useActivity } from '../hooks/useActivity';
import { useClassmates } from '../hooks/useClassmates';
import { useChat } from '../hooks/useChat';
import { useModeration } from '../hooks/useModeration';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { removeOwnedAvatar, uploadAvatar } from '../lib/storage';
import { isLocalImageReference } from '../lib/avatar';
import { supabase } from '../lib/supabase';
import { DEMO_MODE, displayName } from '../lib/demo';
import { ThemeProvider } from '../lib/theme';
import { colorScheme as nativewindColorScheme } from 'nativewind';

// Suppress SafeAreaView deprecation warning from Expo's internal packages
// We've already migrated all our code to use react-native-safe-area-context
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

// Import actual migrated components
import { NewNavigationTabs } from '../components/NewNavigationTabs';
import { ChatListScreen } from '../components/ChatListScreen';
import { IndividualChatScreen, Message } from '../components/IndividualChatScreen';
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
import { ModerationScreen } from '../components/profile/ModerationScreen';
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
import { SetNewPasswordScreen } from '../components/onboarding/SetNewPasswordScreen';
import { StudentProfileScreen } from '../components/StudentProfileScreen';
import { StudentProfileModal } from '../components/classmates/StudentProfileModal';
import { ReportUserModal } from '../components/classmates/ReportUserModal';

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
    | 'pricing-editor'
    | 'moderation'
    | 'become-tutor-courses'
    | 'become-tutor-proof'
    | 'become-tutor-pricing';

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
    | 'set-new-password';

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
    const [onboardingTutorPricing, setOnboardingTutorPricing] = useState<{
        prices: Record<string, { group: number; individual: number }>;
        sessionType: 'online' | 'in-person' | 'both';
    } | null>(null);
    const [onboardingTutorProofs, setOnboardingTutorProofs] = useState<Record<string, string>>({});

    const activeAccount = useRef<string | null>(null);
    // Auto-login: choose the initial mode once per account, unless a password recovery flow is active.
    useLayoutEffect(() => {
        if (auth.isPasswordRecovery) {
            setIsOnboarding(true);
            setOnboardingScreen('set-new-password');
            return;
        }
        if (!auth.loading && auth.session && auth.profile) {
            if (activeAccount.current !== auth.profile.id) {
                activeAccount.current = auth.profile.id;
                setUserRole(auth.profile.is_tutor ? 'tutor' : 'student');
            }
            setIsOnboarding(false);
        } else if (!auth.loading && auth.session && !auth.profile) {
            setOnboardingScreen((prev) => (prev === 'set-new-password' ? 'profile-basics' : prev));
        } else if (!auth.loading && !auth.session) {
            activeAccount.current = null;
            setOnboardingScreen((prev) => (prev === 'set-new-password' ? 'welcome' : prev));
        }
    }, [auth.loading, auth.session, auth.profile, auth.isPasswordRecovery]);

    const currentUserId = auth.profile?.id ?? null;
    const courses = useCourses(currentUserId);
    const connections = useConnections(currentUserId);
    const activityFeed = useActivity(currentUserId);
    const classmatesFeed = useClassmates(currentUserId);
    const chat = useChat(currentUserId);
    const moderation = useModeration(currentUserId);

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
    const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
    const profileRequestRevision = useRef(0);
    useEffect(() => {
        profileRequestRevision.current++;
        setSelectedProfileId(null);
        setSelectedProfileData(null);
        setReportTarget(null);
    }, [currentUserId]);

    // Real profile data (single profile shared across student/tutor views since is_tutor is one flag on one profile)
    const studentProfile = {
        name: displayName(auth.profile?.name),
        pronouns: (auth.profile?.pronouns ?? ['He', 'Him']).join('/'),
        year: auth.profile?.year ?? '',
        degreeLevel: auth.profile?.degree_level ?? '',
        gender: auth.profile?.gender ?? '',
        profileVisibility: (auth.profile?.profile_visibility ?? 'everyone') as 'everyone' | 'women-nb-only',
        program: auth.profile?.major ?? '',
        bio: auth.profile?.bio ?? '',
        photoUrl: auth.profile?.photo_url ?? null,
    };

    const tutorProfile = studentProfile;
    const profileSubtitle = [studentProfile.year, studentProfile.program].filter(Boolean).join(' ');

    const handleViewProfile = async (profileId: string) => {
        const revision = ++profileRequestRevision.current;
        const classmate = mockClassmates.find((person) => person.id === profileId || person.name === profileId);
        const friend = connections.friendProfiles.find((person) => person.id === profileId || person.name === profileId);
        const id = classmate?.id ?? friend?.id ?? profileId;
        if (!id || connections.blocked.has(id)) {
            showAlert('Profile unavailable', 'This profile cannot be viewed.');
            return;
        }
        if (DEMO_MODE) {
            if (classmate || friend) {
                setSelectedProfileData({ ...(classmate ?? friend), prompts: classmate?.prompts ?? [] });
                setSelectedProfileId(id);
            } else {
                showAlert('Profile unavailable', 'This profile cannot be viewed.');
            }
            return;
        }
        try {
            const [userResult, promptsResult] = await Promise.all([
                supabase.from('users').select('id, name, pronouns, year, major, photo_url, gender').eq('id', id).maybeSingle(),
                supabase.from('user_prompts').select('prompt, answer').eq('user_id', id).order('sort_order'),
            ]);
            if (revision !== profileRequestRevision.current) return;
            const error = userResult.error ?? promptsResult.error;
            if (error) {
                console.error('Fetch profile error:', error);
                showAlert('Could not load profile', error.message);
                return;
            }
            if (!userResult.data) {
                showAlert('Profile unavailable', 'This profile cannot be viewed.');
                return;
            }
            const person = userResult.data;
            setSelectedProfileData({
                id: person.id,
                name: person.name,
                pronouns: (person.pronouns ?? []).join('/').toLowerCase(),
                year: person.year ?? '',
                major: person.major ?? '',
                gender: person.gender,
                photoUrl: person.photo_url ?? undefined,
                sharedCourses: classmate?.sharedCourses ?? friend?.sharedCourses ?? [],
                prompts: promptsResult.data ?? [],
            });
            setSelectedProfileId(person.id);
        } catch (error) {
            if (revision !== profileRequestRevision.current) return;
            console.error('Fetch profile failed:', error);
            showAlert('Could not load profile', error instanceof Error ? error.message : 'Please try again.');
        }
    };

    const handleCloseProfile = () => {
        profileRequestRevision.current++;
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
        profileVisibility?: 'everyone' | 'women-nb-only';
        profileImage?: string | null;
    } | null>(null);
    const [onboardingPrompts, setOnboardingPrompts] = useState<Array<{ prompt: string; answer: string }>>([]);

    // Role toggle state
    const [userRole, setUserRole] = useState<UserRole>('student');
    const [activeTutorTab, setActiveTutorTab] = useState<TutorTabValue>('home');
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const boardPosts = usePosts(selectedCourse, currentUserId);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const commentsFeed = useComments(selectedPostId, currentUserId, boardPosts.subscribeBoardEvents);
    const [courseTutors, setCourseTutors] = useState<Array<{ id: string; name: string; pronouns: string; groupPrice: string | null; individualPrice: string | null; location: string[] }>>([]);
    const [courseTutorsLoading, setCourseTutorsLoading] = useState(false);
    const [courseTutorsError, setCourseTutorsError] = useState<string | null>(null);
    const [courseTutorRetry, setCourseTutorRetry] = useState(0);

    // Fetch tutors for the currently-open course board
    useEffect(() => {
        if (DEMO_MODE || !selectedCourse) {
            setCourseTutors([]);
            setCourseTutorsError(null);
            setCourseTutorsLoading(false);
            return;
        }
        let isCurrent = true;
        setCourseTutors([]);
        setCourseTutorsError(null);
        setCourseTutorsLoading(true);
        (async () => {
            const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', selectedCourse).single();
            if (courseError || !course) {
                const message = courseError?.message ?? `Course ${selectedCourse} was not found.`;
                console.error('Find course tutors error:', courseError ?? message);
                if (isCurrent) setCourseTutorsError(message);
                if (isCurrent) setCourseTutorsLoading(false);
                return;
            }
            const { data: rows, error: tutorsError } = await supabase
                .rpc('course_tutors', { p_course_id: course.id });
            if (tutorsError) {
                console.error('Fetch course tutors error:', tutorsError);
                if (isCurrent) setCourseTutorsError(tutorsError.message);
                if (isCurrent) setCourseTutorsLoading(false);
                return;
            }
            if (isCurrent) setCourseTutors(
                (rows ?? [])
                    .filter((r: any) => r.user_id !== currentUserId && !connections.blocked.has(r.user_id))
                    .map((r: any) => ({
                    id: r.user_id,
                    name: r.name,
                    pronouns: (r.pronouns ?? []).join('/').toLowerCase(),
                    groupPrice: r.group_price != null ? String(r.group_price) : null,
                    individualPrice: r.individual_price != null ? String(r.individual_price) : null,
                    location: r.session_type === 'both' ? ['online', 'in-person'] : [r.session_type ?? 'online'],
                }))
            );
            if (isCurrent) setCourseTutorsLoading(false);
        })().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred while loading tutors.';
            console.error('Fetch course tutors failed:', error);
            if (isCurrent) {
                setCourseTutorsError(message);
                setCourseTutorsLoading(false);
            }
        });
        return () => {
            isCurrent = false;
        };
    }, [selectedCourse, currentUserId, connections.blocked, courseTutorRetry]);

    // Tutor detail modal state
    const [selectedTutorForDetail, setSelectedTutorForDetail] = useState<any | null>(null);

    // Compatibility aliases: existing render code below reads/writes these names directly.
    const connectedFriends = connections.friends;
    const sentConnectionRequests = connections.sentRequests;
    const blockedUsers = connections.blocked;

    const handleToggleConnect = async (id: string) => {
        return await connections.toggleConnect(id);
    };

    const handleDisconnectUser = async (id: string, name: string) => {
        const error = await connections.disconnect(id);
        if (error) {
            showAlert('Could not disconnect', error);
            return;
        }
        showAlert('Disconnected', `You are no longer connected with ${name}.`);
    };

    const handleBlockUser = async (id: string, name: string) => {
        const error = await connections.block(id, name);
        if (error) {
            showAlert('Could not block user', error);
            return;
        }
        handleCloseProfile();
        showAlert('Blocked', `${name} has been blocked.`);
    };

    const saveSignupPhoto = async (local?: string | null) => {
        if (!local || DEMO_MODE || local.startsWith('http')) return local ?? null;
        const uid = auth.user?.id;
        if (!uid) return null;
        return await uploadAvatar(uid, local);
    };

    const handleReportUser = (id: string, name: string) => setReportTarget({ id, name });

    // Chat state — backed by the real-data useChat hook (see top of component).
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    // Compatibility alias: keeps `tutorId` field the older render code expects.
    const conversations = chat.conversations.map(c => ({ ...c, tutorId: c.otherUserId }));

    // Profile screen state and user data
    const [profileScreen, setProfileScreen] = useState<ProfileScreen>('main');
    const [tutorApplicationCourses, setTutorApplicationCourses] = useState<string[]>([]);
    const [tutorApplicationProofs, setTutorApplicationProofs] = useState<Record<string, string>>({});
    const [submittingTutorApplication, setSubmittingTutorApplication] = useState(false);

    useEffect(() => {
        if (profileScreen === 'connections') connections.refresh();
    }, [profileScreen, connections.refresh]);

    const myStudyingCourses = courses.studyingCourses;
    const myTutoringCourses = courses.tutoringCourses;
    const [tutorPricingSessionType, setTutorPricingSessionType] = useState<'online' | 'in-person' | 'both'>('both');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Restore locally-saved theme immediately (survives even if the profile row has no theme column).
    useEffect(() => {
        AsyncStorage.getItem('studysesh-theme').then((saved) => {
            if (saved === 'light' || saved === 'dark') setTheme(saved);
        }).catch(() => {});
    }, []);

    // Restore the saved theme whenever a profile loads (login, reload, profile refresh).
    useEffect(() => {
        const saved = auth.profile?.theme;
        if (saved === 'light' || saved === 'dark') {
            setTheme(saved);
        }
    }, [auth.profile?.theme]);

    // Keep NativeWind's `dark:` variants in sync with the in-app theme.
    useEffect(() => {
        try {
            nativewindColorScheme.set(theme);
        } catch (e) {
            console.warn('Could not apply colour scheme:', e);
        }
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }, [theme]);

    const handleThemeChange = async (newTheme: 'light' | 'dark') => {
        const previousTheme = theme;
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('studysesh-theme', newTheme);
        } catch (error) {
            console.error('Save local theme error:', error);
            showAlert('Could not save theme', error instanceof Error ? error.message : 'Please try again.');
        }
        const { error, saved, unknown } = await auth.updateProfile({ theme: newTheme });
        if (error) {
            if (!saved && !unknown) {
                setTheme(previousTheme);
                try {
                    await AsyncStorage.setItem('studysesh-theme', previousTheme);
                } catch (failure) {
                    console.error('Restore local theme failed:', failure);
                    showAlert('Could not restore local theme', 'Your saved theme may be inconsistent on this device.');
                }
            }
            showAlert(saved ? 'Theme saved' : 'Could not save theme', error);
        }
    };

    const handleLogout = async () => {
        setIsOnboarding(true);
        setOnboardingScreen('welcome');
        setProfileScreen('main');
        setTheme('light');
        const pushError = await push.unregisterCurrentDevice();
        if (pushError) {
            showAlert('Push device not removed', `You will be signed out, but this device may still receive generic notifications until it reconnects: ${pushError}`);
        }
        try {
            await auth.signOut();
        } catch (e) {
            console.warn('Logout failed:', e);
        }
    };
    const userProfile = {
        name: displayName(auth.profile?.name),
        pronouns: (auth.profile?.pronouns ?? ['He', 'Him']).join('/'),
        year: auth.profile?.year ?? '',
        program: auth.profile?.major ?? '',
        bio: auth.profile?.bio ?? '',
        email: auth.profile?.email ?? '',
        courses: myStudyingCourses,
    };

    // Real activity/notifications data (from useActivity)
    const activities = activityFeed.activities;

    // Real course catalog (the user's own studying/tutoring courses, with live counts)
    const mockCourses = courses.catalog;

    // State for new social app tab
    const [socialActiveTab, setSocialActiveTab] = useState<SocialTabValue>('home');
    const push = usePushNotifications(currentUserId, () => {
        setSelectedCourse(null);
        setSelectedPostId(null);
        setSelectedConversationId(null);
        if (userRole === 'tutor') setActiveTutorTab('activity');
        else setSocialActiveTab('activity');
        activityFeed.refresh();
    });
    const currentUserGender = (auth.profile?.gender ?? 'Prefer not to say') as 'Man' | 'Woman' | 'Non-Binary' | 'Prefer not to say';
    const [userStatus, setUserStatus] = useState(auth.profile?.status || 'Studying');

    useEffect(() => {
        if (auth.profile?.status) setUserStatus(auth.profile.status);
    }, [auth.profile?.status]);

    const handleStatusChange = (status: string) => {
        const previousStatus = userStatus;
        setUserStatus(status);
        auth.updateProfile({ status }).then(({ error, saved, unknown }) => {
            if (error) {
                if (!saved && !unknown) setUserStatus(previousStatus);
                showAlert(saved ? 'Status saved' : 'Could not save status', error);
            }
        });
    };

    // Tutor mode render function
    const renderTutorContent = () => {
        switch (activeTutorTab) {
            case 'home':
                return renderTutorHome();
            case 'activity':
                // Use same activity screen as students
                return (
                    <ActivityScreen
                        activities={activities}
                        unreadCount={activityFeed.unreadCount}
                        hasMore={activityFeed.hasMore}
                        loadingMore={activityFeed.loadingMore}
                        loadMoreError={activityFeed.loadMoreError}
                        onLoadMore={activityFeed.loadMore}
                        onAcceptConnection={async (id) => {
                            const activity = activities.find(a => a.id === id);
                            if (activity?.referenceId) {
                                const error = await connections.acceptRequest(activity.referenceId);
                                if (error) {
                                    showAlert('Could not accept request', error);
                                    return;
                                }
                            }
                            const error = await activityFeed.removeActivity(id);
                            if (error) showAlert('Could not clear activity', error);
                        }}
                        onDeclineConnection={async (id) => {
                            const activity = activities.find(a => a.id === id);
                            if (activity?.referenceId) {
                                const error = await connections.declineRequest(activity.referenceId);
                                if (error) {
                                    showAlert('Could not decline request', error);
                                    return;
                                }
                            }
                            const error = await activityFeed.removeActivity(id);
                            if (error) showAlert('Could not clear activity', error);
                        }}
                        onActivityTap={(activity) => {
                            activityFeed.markRead(activity.id);

                            // Navigate based on activity type
                            if (activity.type === 'message') {
                                setActiveTutorTab('chat');
                                if (activity.referenceId) {
                                    setSelectedConversationId(activity.referenceId);
                                    chat.fetchMessages(activity.referenceId);
                                }
                            } else if (activity.type === 'board_reply' || activity.type === 'board_like') {
                                if (activity.courseName) {
                                    setSelectedCourse(activity.courseName);
                                }
                            }
                        }}
                        onMarkAllRead={() => {
                            activityFeed.markAllRead();
                        }}
                        onViewProfile={(id) => handleViewProfile(id)}
                        loading={activityFeed.loading}
                        error={activityFeed.error}
                        onRetry={activityFeed.refresh}
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
                        onReport={handleReportUser}
                        onViewProfile={(profile) => {
                            handleViewProfile(profile.id);
                        }}
                        loading={classmatesFeed.loading || connections.loading}
                        error={classmatesFeed.error ?? connections.error}
                        onRetry={() => {
                            classmatesFeed.refresh();
                            connections.refresh();
                        }}
                        hasMore={classmatesFeed.hasMore}
                        loadingMore={classmatesFeed.loadingMore}
                        loadMoreError={classmatesFeed.loadMoreError}
                        onLoadMore={classmatesFeed.loadMore}
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
                        loading={chat.loading}
                        error={chat.error}
                        onRetry={chat.refreshConversations}
                        hasMore={chat.hasMoreConversations}
                        loadingMore={chat.loadingMoreConversations}
                        loadMoreError={chat.conversationPageError}
                        onLoadMore={chat.loadMoreConversations}
                        isTutor={true}
                        isDarkMode={theme === 'dark'}
                    />
                );
            case 'profile':
                return (
                    <TutorProfileScreen
                        tutorName={tutorProfile.name}
                        tutorInitial={tutorProfile.name.charAt(0)}
                        subtitle={profileSubtitle || (auth.profile?.email ?? '')}
                        role="tutor"
                        onEditProfile={() => setProfileScreen('edit-profile')}
                        onEditCourses={() => setProfileScreen('my-courses')}
                        onEditPricing={() => setProfileScreen('pricing-editor')}
                        onSettings={() => setProfileScreen('settings')}
                        onConnections={() => setProfileScreen('connections')}
                        onStudentMode={() => {
                            setProfileScreen('main');
                            setSocialActiveTab('profile');
                            setUserRole('student');
                        }}
                        connectionsCount={connectedFriends.size}
                        onLogout={handleLogout}
                        isDarkMode={theme === 'dark'}
                    />
                );
            default:
                return renderTutorHome();
        }
    };

    // Tutor home: real name and the user's own studying/tutoring courses from the catalog.
    const renderTutorHome = () => (
        <TutorHomeScreen
            tutorName={tutorProfile.name}
            courses={mockCourses.filter((c) => myStudyingCourses.includes(c.code))}
            tutoringCourses={mockCourses.filter((c) => myTutoringCourses.includes(c.code))}
            onCoursePress={(courseCode) => {
                setSelectedCourse(courseCode);
            }}
            userStatus={userStatus}
            onStatusChange={handleStatusChange}
            loading={courses.loading}
            error={courses.error}
            onRetry={courses.refresh}
            isDarkMode={theme === 'dark'}
        />
    );

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
                        if (connections.blocked.has(id)) {
                            showAlert('Message', "You can't message this person.");
                            return;
                        }
                        const convId = await chat.getOrCreateConversation(id);
                        if (!convId) {
                            showAlert('Message', "Couldn't start that conversation.");
                            return;
                        }
                        setSelectedConversationId(convId);
                        await chat.fetchMessages(convId);
                    }}
                    onViewProfile={handleViewProfile}
                    postsLoading={boardPosts.loading}
                    postsError={boardPosts.error}
                    onRetryPosts={boardPosts.refresh}
                    hasMorePosts={boardPosts.hasMore}
                    loadingMorePosts={boardPosts.loadingMore}
                    loadMorePostsError={boardPosts.loadMoreError}
                    onLoadMorePosts={boardPosts.loadMore}
                    tutorsLoading={courseTutorsLoading}
                    tutorsError={courseTutorsError}
                    onRetryTutors={() => setCourseTutorRetry((retry) => retry + 1)}
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
                    authorId={post.authorId}
                    authorName={post.authorName}
                    authorInitial={post.authorInitial}
                    authorYear={post.authorYear}
                    timestamp={post.timestamp}
                    content={post.content}
                    likes={post.likes}
                    comments={commentsFeed.comments}
                    totalComments={post.comments}
                    isLiked={post.isLiked}
                    type={post.type}
                    onBack={() => setSelectedPostId(null)}
                    onLikePost={() => boardPosts.toggleLike(post.id)}
                    onLikeComment={async (commentId) => {
                        const comment = commentsFeed.comments.find(c => c.id === commentId);
                        if (!comment) return false;
                        const success = await boardPosts.toggleCommentLike(commentId, comment.isLiked);
                        if (success) {
                            commentsFeed.setLike(commentId, !comment.isLiked);
                        }
                        return success;
                    }}
                    onAddComment={async (content, parentId) => {
                        const commentId = await boardPosts.addComment(post.id, content, parentId);
                        if (!commentId) return false;
                        await commentsFeed.loadOne(commentId);
                        return true;
                    }}
                    onViewProfile={handleViewProfile}
                    commentsError={commentsFeed.error ?? boardPosts.error}
                    commentsLoading={commentsFeed.loading}
                    onRetryComments={commentsFeed.refresh}
                    hasMoreComments={commentsFeed.hasMore}
                    loadingMoreComments={commentsFeed.loadingMore}
                    loadMoreCommentsError={commentsFeed.loadMoreError}
                    onLoadMoreComments={commentsFeed.loadMore}
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
        const needsSettingsBase = ['change-password', 'change-email', 'blocked-users', 'privacy-policy', 'terms-of-service', 'moderation'].includes(profileScreen);

        const handleDeleteAccount = async () => {
            const { error } = await auth.deleteAccount();
            if (error) {
                showAlert('Error', error);
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
                            theme={theme}
                            onChangePassword={() => setProfileScreen('change-password')}
                            onChangeEmail={() => setProfileScreen('change-email')}
                            onDeleteAccount={handleDeleteAccount}
                            onBlockedUsers={() => setProfileScreen('blocked-users')}
                            onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
                            onTermsOfService={() => setProfileScreen('terms-of-service')}
                            onThemeChange={handleThemeChange}
                            onLogout={handleLogout}
                            isModerator={moderation.isModerator}
                            moderatorError={moderation.accessError}
                            onModeration={() => setProfileScreen('moderation')}
                            onRetryModerator={moderation.checkAccess}
                            push={push}
                        />
                    </View>
                )}
                {profileScreen === 'edit-profile' && (
                    <View style={overlayStyle}>
                        <EditProfileScreen
                            {...commonProps}
                            name={studentProfile.name}
                            pronouns={studentProfile.pronouns}
                            year={studentProfile.year}
                            degreeLevel={studentProfile.degreeLevel}
                            gender={studentProfile.gender}
                            profileVisibility={studentProfile.profileVisibility}
                            program={studentProfile.program}
                            bio={studentProfile.bio}
                            initial={studentProfile.name.charAt(0)}
                            isTutor={userRole === 'tutor'}
                            profileImage={studentProfile.photoUrl}
                            initialPrompts={auth.profile?.prompts ?? []}
                            onSave={async (data) => {
                                let photoUrl = data.profileImage;
                                let uploadedPhoto: string | null = null;
                                if (photoUrl && photoUrl !== studentProfile.photoUrl && !DEMO_MODE) {
                                    try {
                                        if (!currentUserId) throw new Error('Your account is not ready to upload a profile photo.');
                                        if (!isLocalImageReference(photoUrl)) throw new Error('Choose a new photo from your device.');
                                        photoUrl = await uploadAvatar(currentUserId, photoUrl);
                                        uploadedPhoto = photoUrl;
                                    } catch (error) {
                                        console.error('Avatar upload failed:', error);
                                        showAlert('Photo upload failed', error instanceof Error ? error.message : 'Please try uploading your photo again.');
                                        return;
                                    }
                                }
                                const { error, saved } = await auth.updateProfile({
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
                                if (error && !saved) {
                                    showAlert('Profile update not confirmed', uploadedPhoto
                                        ? `${error} Reload before retrying. The uploaded file may remain until account deletion.`
                                        : error);
                                    return;
                                }
                                if (uploadedPhoto && currentUserId && studentProfile.photoUrl) {
                                    try {
                                        await removeOwnedAvatar(currentUserId, studentProfile.photoUrl);
                                    } catch (cleanupError) {
                                        console.error('Remove previous profile photo error:', cleanupError);
                                        showAlert('Photo updated', 'Your profile was saved, but the previous photo could not be removed.');
                                    }
                                }
                                if (error) showAlert('Profile saved', error);
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
                            onSave={(newCourses) => courses.setAllStudyingCourses(newCourses)}
                            onSaveTutoring={(newCourses, proofUris) => courses.setAllTutoringCourses(newCourses, proofUris)}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'become-tutor-courses' && (
                    <View style={overlayStyle}>
                        <TutorCourseApplicationScreen
                            initialCourses={tutorApplicationCourses}
                            onBack={() => setProfileScreen('main')}
                            onContinue={(selected) => {
                                setTutorApplicationCourses(selected);
                                setProfileScreen('become-tutor-proof');
                            }}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'become-tutor-proof' && (
                    <View style={overlayStyle}>
                        <TutorProofUploadScreen
                            courses={tutorApplicationCourses}
                            initialProofs={tutorApplicationProofs}
                            onProofsChange={setTutorApplicationProofs}
                            onBack={() => setProfileScreen('become-tutor-courses')}
                            onContinue={(proofs) => {
                                setTutorApplicationProofs(proofs);
                                setProfileScreen('become-tutor-pricing');
                            }}
                        />
                    </View>
                )}
                {profileScreen === 'become-tutor-pricing' && (
                    <View style={overlayStyle}>
                        <TutorPricingSetupScreen
                            courses={tutorApplicationCourses}
                            submitting={submittingTutorApplication}
                            onBack={() => setProfileScreen('become-tutor-proof')}
                            onContinue={async (prices, sessionType) => {
                                if (submittingTutorApplication) return;
                                setSubmittingTutorApplication(true);
                                try {
                                    const result = await auth.activateTutor(tutorApplicationCourses.map((code) => ({
                                        courseCode: code,
                                        proofUrl: tutorApplicationProofs[code] ?? '',
                                        groupPrice: prices[code].group,
                                        individualPrice: prices[code].individual,
                                        sessionType,
                                    })));
                                    if (result.error) {
                                        showAlert('Could not complete tutor setup', result.error);
                                        return;
                                    }
                                    if (DEMO_MODE) {
                                        await courses.setAllTutoringCourses(tutorApplicationCourses);
                                        const first = prices[tutorApplicationCourses[0]];
                                        await courses.saveTutoringPricing({
                                            applyToAll: true,
                                            globalGroupPrice: first.group,
                                            globalIndividualPrice: first.individual,
                                            perCoursePricing: prices,
                                            sessionType,
                                        });
                                    } else {
                                        await courses.refresh();
                                    }
                                    setProfileScreen('main');
                                    setActiveTutorTab('profile');
                                    setUserRole('tutor');
                                } finally {
                                    setSubmittingTutorApplication(false);
                                }
                            }}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'pricing-editor' && (
                    <View style={overlayStyle}>
                        <PricingEditorScreen
                            courses={myTutoringCourses}
                            initialGroupPrice={courses.tutorPricing[0]?.groupPrice ?? 6}
                            initialIndividualPrice={courses.tutorPricing[0]?.individualPrice ?? 20}
                            initialPerCoursePricing={Object.fromEntries(
                                courses.tutorPricing.map((p) => [
                                    p.code,
                                    {
                                        group: p.groupPrice ?? 6,
                                        individual: p.individualPrice ?? 20,
                                    },
                                ])
                            )}
                            initialSessionType={courses.tutorPricing[0]?.sessionType ?? tutorPricingSessionType}
                            onBack={() => setProfileScreen('main')}
                            onSave={async (data) => {
                                const error = await courses.saveTutoringPricing(data);
                                if (error) {
                                    showAlert('Could not save tutor pricing', error);
                                    return;
                                }
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
                            theme={theme}
                            onChangePassword={() => setProfileScreen('change-password')}
                            onChangeEmail={() => setProfileScreen('change-email')}
                            onDeleteAccount={handleDeleteAccount}
                            onBlockedUsers={() => setProfileScreen('blocked-users')}
                            onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
                            onTermsOfService={() => setProfileScreen('terms-of-service')}
                            onThemeChange={handleThemeChange}
                            onLogout={handleLogout}
                            isModerator={moderation.isModerator}
                            moderatorError={moderation.accessError}
                            onModeration={() => setProfileScreen('moderation')}
                            onRetryModerator={moderation.checkAccess}
                            push={push}
                        />
                    </View>
                )}
                {profileScreen === 'moderation' && (
                    <View style={overlayStyle}>
                        <ModerationScreen
                            reports={moderation.reports}
                            loading={moderation.loading}
                            loadingMore={moderation.loadingMore}
                            error={moderation.error}
                            hasMore={moderation.hasMore}
                            onBack={() => setProfileScreen('settings')}
                            onRefresh={moderation.refresh}
                            onLoadMore={moderation.loadMore}
                            onResolve={moderation.resolve}
                            isDarkMode={theme === 'dark'}
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
                                    showAlert('Error', error);
                                    return;
                                }
                                showAlert('Success', 'Your password has been updated.');
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
                                    showAlert('Error', error);
                                    return;
                                }
                                showAlert('Check your inbox', 'Confirm the change from a link sent to your new email address.');
                                setProfileScreen('settings');
                            }}
                            isDarkMode={theme === 'dark'}
                        />
                    </View>
                )}
                {profileScreen === 'blocked-users' && (
                    <View style={overlayStyle}>
                        <BlockedUsersScreen
                            blockedUsers={connections.blockedProfiles.map((person) => ({
                                id: person.id,
                                name: person.name,
                                initial: person.name.charAt(0) || '?',
                            }))}
                            onBack={() => setProfileScreen('settings')}
                            onUnblock={(id) => connections.unblock(id)}
                            loading={connections.loading}
                            error={connections.error}
                            onRetry={connections.refresh}
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
                            sentRequests={Array.from(connections.sentRequests, (id) => ({
                                id,
                                name: connections.sentRequestProfiles.find((person) => person.id === id)?.name
                                    ?? mockClassmates.find((person) => person.id === id)?.name
                                    ?? 'Unavailable user',
                            }))}
                            onBack={() => setProfileScreen('main')}
                            onMessage={async (connectionId) => {
                                // Switch to chat tab based on user role
                                if (userRole === 'tutor') {
                                    setActiveTutorTab('chat');
                                } else {
                                    setSocialActiveTab('chat');
                                }
                                setProfileScreen('main');
                                if (connections.blocked.has(connectionId)) {
                                    showAlert('Message', "You can't message this person.");
                                    return;
                                }
                                const convId = await chat.getOrCreateConversation(connectionId);
                                if (!convId) {
                                    showAlert('Message', "Couldn't start that conversation.");
                                    return;
                                }
                                setSelectedConversationId(convId);
                                await chat.fetchMessages(convId);
                            }}
                            onViewProfile={(connectionId) => handleViewProfile(connectionId)}
                            onDisconnect={(connectionId, name) => handleDisconnectUser(connectionId, name)}
                            onCancelRequest={async (id) => {
                                const error = await connections.cancelRequest(id);
                                if (error) {
                                    showAlert('Could not cancel request', error);
                                }
                                await classmatesFeed.refresh();
                            }}
                            loading={connections.loading}
                            error={connections.error}
                            onRetry={connections.refresh}
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
                    onSendMessage={(text) => chat.sendMessage(selectedConversationId, text)}
                    error={chat.error}
                    loadingMessages={chat.loadingMessages}
                    onRetry={() => chat.fetchMessages(selectedConversationId)}
                    hasOlderMessages={chat.historyByConversation[selectedConversationId]?.hasMore}
                    loadingOlderMessages={chat.historyByConversation[selectedConversationId]?.loadingMore}
                    olderMessagesError={chat.historyByConversation[selectedConversationId]?.error}
                    onLoadOlderMessages={() => chat.loadOlderMessages(selectedConversationId)}
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
                        onStatusChange={handleStatusChange}
                        loading={courses.loading}
                        error={courses.error}
                        onRetry={courses.refresh}
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
                        onReport={handleReportUser}
                        onViewProfile={(profile) => {
                            handleViewProfile(profile.id);
                        }}
                        loading={classmatesFeed.loading || connections.loading}
                        error={classmatesFeed.error ?? connections.error}
                        onRetry={() => {
                            classmatesFeed.refresh();
                            connections.refresh();
                        }}
                        hasMore={classmatesFeed.hasMore}
                        loadingMore={classmatesFeed.loadingMore}
                        loadMoreError={classmatesFeed.loadMoreError}
                        onLoadMore={classmatesFeed.loadMore}
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
                        loading={chat.loading}
                        error={chat.error}
                        onRetry={chat.refreshConversations}
                        hasMore={chat.hasMoreConversations}
                        loadingMore={chat.loadingMoreConversations}
                        loadMoreError={chat.conversationPageError}
                        onLoadMore={chat.loadMoreConversations}
                        isDarkMode={theme === 'dark'}
                    />
                );

            case 'activity':
                return (
                    <ActivityScreen
                        activities={activities}
                        unreadCount={activityFeed.unreadCount}
                        hasMore={activityFeed.hasMore}
                        loadingMore={activityFeed.loadingMore}
                        loadMoreError={activityFeed.loadMoreError}
                        onLoadMore={activityFeed.loadMore}
                        onAcceptConnection={async (id) => {
                            const activity = activities.find(a => a.id === id);
                            if (activity?.referenceId) {
                                const error = await connections.acceptRequest(activity.referenceId);
                                if (error) {
                                    showAlert('Could not accept request', error);
                                    return;
                                }
                            }
                            const error = await activityFeed.removeActivity(id);
                            if (error) showAlert('Could not clear activity', error);
                        }}
                        onDeclineConnection={async (id) => {
                            const activity = activities.find(a => a.id === id);
                            if (activity?.referenceId) {
                                const error = await connections.declineRequest(activity.referenceId);
                                if (error) {
                                    showAlert('Could not decline request', error);
                                    return;
                                }
                            }
                            const error = await activityFeed.removeActivity(id);
                            if (error) showAlert('Could not clear activity', error);
                        }}
                        onActivityTap={(activity) => {
                            activityFeed.markRead(activity.id);

                            // Navigate based on activity type
                            if (activity.type === 'message') {
                                setSocialActiveTab('chat');
                                if (activity.referenceId) {
                                    setSelectedConversationId(activity.referenceId);
                                    chat.fetchMessages(activity.referenceId);
                                }
                            } else if (activity.type === 'board_reply' || activity.type === 'board_like') {
                                if (activity.courseName) {
                                    setSelectedCourse(activity.courseName);
                                }
                            }
                        }}
                        onMarkAllRead={() => {
                            activityFeed.markAllRead();
                        }}
                        onViewProfile={(id) => handleViewProfile(id)}
                        loading={activityFeed.loading}
                        error={activityFeed.error}
                        onRetry={activityFeed.refresh}
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
                        isTutor={auth.profile?.is_tutor ?? false}
                        onTutorMode={() => {
                            if (auth.profile?.is_tutor) {
                                setActiveTutorTab('profile');
                                setUserRole('tutor');
                            } else {
                                setTutorApplicationCourses([]);
                                setTutorApplicationProofs({});
                                setProfileScreen('become-tutor-courses');
                            }
                        }}
                        onSettings={() => setProfileScreen('settings')}
                        onLogout={handleLogout}
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
                            const { error, needsVerification } = await auth.signUp(email, password);
                            setAuthLoading(false);
                            if (error) {
                                showAlert('Sign Up Error', error);
                                return;
                            }
                            setOnboardingEmail(email);
                            setOnboardingPassword(password);
                            setUserRole(selectedOnboardingRole || 'student');
                            // Auto-confirmed projects already return an active session — skip the email code step.
                            setOnboardingScreen(needsVerification ? 'code-verification' : 'profile-basics');
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
                                showAlert('Verification Error', error);
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
                                showAlert('Resend Error', error);
                            }
                        }}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'profile-basics'} zIndex={5}>
                    <ProfileBasicsScreen
                        onBack={() => setOnboardingScreen('code-verification')}
                        onContinue={(profileData) => {
                            setOnboardingProfileBasics(profileData);
                            setOnboardingScreen('profile-prompts');
                        }}
                        isDarkMode={theme === 'dark'}
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
                                showAlert('Reset Error', error);
                                return;
                            }
                            showAlert('Email Sent', 'Check your email for the password reset link.');
                            setOnboardingScreen('sign-in');
                        }}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'set-new-password'} zIndex={15}>
                    <SetNewPasswordScreen
                        onCancel={async () => {
                            await auth.cancelPasswordRecovery();
                            setOnboardingScreen('sign-in');
                        }}
                        onSubmit={async (newPassword) => {
                            const { error } = await auth.completePasswordRecovery(newPassword);
                            if (error) return error;
                            showAlert('Password Updated', 'Your password has been updated.');
                            return null;
                        }}
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
                                showAlert('Sign In Error', error);
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
                                let photoUrl: string | null;
                                try {
                                    photoUrl = await saveSignupPhoto(onboardingProfileBasics.profileImage);
                                } catch (error) {
                                    console.error('Signup avatar upload failed:', error);
                                    setAuthLoading(false);
                                    showAlert('Photo upload failed', error instanceof Error ? error.message : 'Please try uploading your photo again.');
                                    return;
                                }
                                const { error } = await auth.createProfile({
                                    name: onboardingProfileBasics.name,
                                    pronouns: onboardingProfileBasics.pronouns,
                                    gender: onboardingProfileBasics.gender,
                                    year: onboardingProfileBasics.year,
                                    degreeLevel: onboardingProfileBasics.degreeLevel,
                                    major: onboardingProfileBasics.major,
                                    profileVisibility: onboardingProfileBasics.profileVisibility,
                                    profileImage: photoUrl,
                                    prompts: onboardingPrompts,
                                    courses: onboardingCourses,
                                    isTutor: false,
                                });
                                setAuthLoading(false);
                                if (error) {
                                    showAlert('Profile Error', error);
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
                        courses={onboardingTutorCourses}
                        onBack={() => setOnboardingScreen('tutor-course-application')}
                        onContinue={(proofs) => {
                            setOnboardingTutorProofs(proofs);
                            setOnboardingScreen('tutor-pricing-setup');
                        }}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'tutor-pricing-setup'} zIndex={10}>
                    <TutorPricingSetupScreen
                        courses={onboardingTutorCourses}
                        onBack={() => setOnboardingScreen('tutor-proof-upload')}
                        onContinue={(pricing, sessionType) => {
                            setOnboardingTutorPricing({ prices: pricing, sessionType });
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
                                let photoUrl: string | null;
                                try {
                                    photoUrl = await saveSignupPhoto(onboardingProfileBasics.profileImage);
                                } catch (error) {
                                    console.error('Signup avatar upload failed:', error);
                                    setAuthLoading(false);
                                    showAlert('Photo upload failed', error instanceof Error ? error.message : 'Please try uploading your photo again.');
                                    return;
                                }
                                const tutorCourseData = onboardingTutorCourses.map((code) => {
                                    const pricing = onboardingTutorPricing?.prices?.[code] || { group: 6, individual: 20 };
                                    return {
                                        courseCode: code,
                                        groupPrice: pricing.group,
                                        individualPrice: pricing.individual,
                                        proofUrl: onboardingTutorProofs[code],
                                        sessionType: onboardingTutorPricing?.sessionType ?? 'both',
                                    };
                                });

                                const { error } = await auth.createProfile({
                                    name: onboardingProfileBasics.name,
                                    pronouns: onboardingProfileBasics.pronouns,
                                    gender: onboardingProfileBasics.gender,
                                    year: onboardingProfileBasics.year,
                                    degreeLevel: onboardingProfileBasics.degreeLevel,
                                    major: onboardingProfileBasics.major,
                                    profileVisibility: onboardingProfileBasics.profileVisibility,
                                    profileImage: photoUrl,
                                    prompts: onboardingPrompts,
                                    courses: onboardingCourses,
                                    isTutor: true,
                                    tutorCourses: tutorCourseData,
                                });
                                setAuthLoading(false);
                                if (error) {
                                    showAlert('Profile Error', error);
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
        <ThemeProvider value={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#111827' : 'white' }}>
                <StatusBar style={theme === 'dark' ? 'light' : 'auto'} />
                <View className="flex-1">
                    {auth.loading ? (
                        <View style={{ flex: 1 }} />
                    ) : isOnboarding ? (
                        renderOnboarding()
                    ) : (
                        <OnboardingToAppTransition show={true} isDarkMode={theme === 'dark'}>
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
                                            unreadCount={chat.unreadCount}
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
                                            unreadMessages={chat.unreadCount}
                                            unreadActivity={activityFeed.unreadCount}
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
                <ReportUserModal
                    target={reportTarget}
                    onClose={() => setReportTarget(null)}
                    onSubmit={connections.report}
                    isDarkMode={theme === 'dark'}
                />
            </SafeAreaView>
        </GestureHandlerRootView>
        </ThemeProvider>
    );
}
