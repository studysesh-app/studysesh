import { useState, useEffect, useCallback } from 'react';
import { View, Alert, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

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
import { getUserById, getUserByName } from '../components/mockData';

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

    // --- Universal Profile Viewer State ---
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [selectedProfileData, setSelectedProfileData] = useState<any>(null);

    // Mock Profile Data for User (Tutor & Student Modes)
    const studentProfile = {
        name: 'Kshitij',
        pronouns: 'He/Him',
        year: '2nd Year',
        program: 'Computer Science',
        bio: 'Passionate about learning!',
        photoUrl: null
    };

    const tutorProfile = {
        name: 'Kshitij',
        pronouns: 'He/Him',
        year: '3rd Year',
        program: 'Computer Science',
        bio: 'I help students ace their exams!',
        photoUrl: null
    };

    const handleViewProfile = (profileId: string) => {
        // Try to find the profile (using mockData utils)
        let profile = getUserById(profileId);

        if (!profile) {
            // Fallback: try by name if ID fails
            profile = getUserByName(profileId);
        }

        if (profile) {
            // Privacy Check
            if (profile.privacy === 'hidden') {
                Alert.alert(
                    "Profile Unavailable",
                    "This user has limited who can view their profile based on their visibility settings."
                );
                return;
            }

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

    // Tutor detail modal state
    const [selectedTutorForDetail, setSelectedTutorForDetail] = useState<any | null>(null);

    // Connection State
    const [sentConnectionRequests, setSentConnectionRequests] = useState<Set<string>>(new Set());

    const handleToggleConnect = (id: string) => {
        setSentConnectionRequests(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
                // Add to activity feed
                const user = getUserById(id) || getUserByName(id);
                if (user) {
                    const newActivity = {
                        id: `sent-${Date.now()}`,
                        type: 'connection_request' as const,
                        userName: user.name,
                        userInitial: user.name[0],
                        timestamp: 'Just now',
                        isUnread: false,
                        isPending: false,
                    };
                    setActivities(prevActs => [newActivity, ...prevActs] as typeof prevActs);
                }
            }
            return next;
        });
    };

    // Already Connected State
    const [connectedFriends, setConnectedFriends] = useState<Set<string>>(new Set(['1'])); // Sarah Chen ID='1'
    // Blocked Users State
    const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

    const handleDisconnectUser = (id: string, name: string) => {
        setConnectedFriends(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        Alert.alert('Disconnected', `You are no longer connected with ${name}.`);
    };

    const handleBlockUser = (id: string, name: string) => {
        console.log('Blocking user:', id, name);
        setBlockedUsers(prev => {
            const next = new Set(prev);
            next.add(id);
            console.log('New blocked set size:', next.size);
            return next;
        });
        setConnectedFriends(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        setSentConnectionRequests(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
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

    // Chat state
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<any[]>([
        {
            id: '1',
            tutorId: '1',
            tutorName: 'Sarah Chen',
            tutorInitial: 'S',
            lastMessage: 'Great! I can help you with SYSC 2006 this week. When works best for you?',
            timestamp: '2h ago',
            unreadCount: 0,
            type: 'tutor' as const,
        },
        {
            id: '2',
            tutorId: '2',
            tutorName: 'Marcus Johnson',
            tutorInitial: 'M',
            lastMessage: 'Thanks for booking! See you tomorrow at 2pm',
            timestamp: 'Yesterday',
            unreadCount: 0,
            type: 'tutor' as const,
        },
        {
            id: '3',
            tutorName: 'Jordan Lee',
            tutorInitial: 'J',
            lastMessage: 'You: Do you have any availability this weekend?',
            timestamp: 'Dec 15',
            unreadCount: 0,
            type: 'tutor' as const,
        },
        {
            id: '4',
            tutorName: 'Alex Rivera',
            tutorInitial: 'A',
            lastMessage: 'Hey! Are you going to the study session tomorrow?',
            timestamp: '1h ago',
            unreadCount: 2,
            type: 'student' as const,
        },
        {
            id: '5',
            tutorName: 'Emma Wilson',
            tutorInitial: 'E',
            lastMessage: 'You: Thanks for the notes! They were super helpful',
            timestamp: '3h ago',
            unreadCount: 0,
            type: 'student' as const,
        },
        {
            id: '6',
            tutorName: 'Chris Park',
            tutorInitial: 'C',
            lastMessage: 'Did you finish the assignment yet? I\'m stuck on question 3',
            timestamp: '5h ago',
            unreadCount: 1,
            type: 'student' as const,
        },
    ]);
    const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
        '1': [
            {
                id: '1',
                message: 'Hi! I saw you tutor SYSC 2006. Can you help me with pointers and memory management?',
                timestamp: '10:30 AM',
                isStudent: true,
                status: 'read',
            },
            {
                id: '2',
                message: 'Absolutely! Those are common topics students struggle with. I have great resources for that.',
                timestamp: '10:32 AM',
                isStudent: false,
            },
            {
                id: '3',
                message: 'Great! I can help you with SYSC 2006 this week. When works best for you?',
                timestamp: '10:33 AM',
                isStudent: false,
            },
        ],
        '2': [
            {
                id: '1',
                message: 'I just booked a session with you for tomorrow at 2pm. Looking forward to it!',
                timestamp: 'Yesterday 3:45 PM',
                isStudent: true,
                status: 'read',
            },
            {
                id: '2',
                message: 'Thanks for booking! See you tomorrow at 2pm',
                timestamp: 'Yesterday 3:50 PM',
                isStudent: false,
            },
        ],
        '3': [
            {
                id: '1',
                message: 'Hey Jordan! I need help with MATH 1004. Are you available?',
                timestamp: 'Dec 15 2:20 PM',
                isStudent: true,
                status: 'delivered',
            },
            {
                id: '2',
                message: 'Do you have any availability this weekend?',
                timestamp: 'Dec 15 2:22 PM',
                isStudent: true,
                status: 'delivered',
            },
        ],
        '4': [
            {
                id: '1',
                message: 'Hey! Are you going to the study session tomorrow?',
                timestamp: '1:15 PM',
                isStudent: false,
            },
            {
                id: '2',
                message: 'Yeah, I\'ll be there! What time does it start again?',
                timestamp: '1:20 PM',
                isStudent: true,
                status: 'read',
            },
            {
                id: '3',
                message: 'It starts at 3pm in the library. See you there!',
                timestamp: '1:22 PM',
                isStudent: false,
            },
        ],
        '5': [
            {
                id: '1',
                message: 'Thanks for the notes! They were super helpful',
                timestamp: '11:30 AM',
                isStudent: true,
                status: 'read',
            },
            {
                id: '2',
                message: 'No problem! Happy to help. Let me know if you need anything else',
                timestamp: '11:35 AM',
                isStudent: false,
            },
        ],
        '6': [
            {
                id: '1',
                message: 'Did you finish the assignment yet? I\'m stuck on question 3',
                timestamp: '9:00 AM',
                isStudent: false,
            },
            {
                id: '2',
                message: 'I\'m working on it now. What part of question 3 are you stuck on?',
                timestamp: '9:15 AM',
                isStudent: true,
                status: 'read',
            },
        ],
    });

    // Profile screen state and user data
    const [profileScreen, setProfileScreen] = useState<ProfileScreen>('main');

    const [myStudyingCourses, setMyStudyingCourses] = useState<string[]>(['COMP 1405', 'MATH 1007']);
    const [myTutoringCourses, setMyTutoringCourses] = useState<string[]>(['SYSC 2006']);
    const [tutorPricingSessionType, setTutorPricingSessionType] = useState<'online' | 'in-person' | 'both'>('both');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [userProfile, setUserProfile] = useState({
        name: 'Kshitij',
        pronouns: 'He/Him',
        year: '3rd Year',
        program: 'Computer Science',
        bio: 'Passionate about helping students excel in programming and systems courses.',
        email: 'kshitij@carleton.ca',
        phone: '+1 (613) 555-0123',
        courses: ['SYSC 2006', 'COMP 2402', 'ELEC 2507'],
        language: 'English',
    });

    const [paymentMethods, setPaymentMethods] = useState([
        { id: '1', type: 'card' as const, last4: '4242', brand: 'Visa' },
    ]);

    const tutors = [
        {
            id: '1',
            name: 'Sarah Chen',
            pronouns: 'she/her',
            courses: ['SYSC 2006', 'COMP 2402', 'ELEC 2507'],
            groupPrice: '15',
            individualPrice: '28',
            sessionTypes: ['1-on-1', 'group'],
            location: ['online', 'in-person'],
            nextAvailable: '2h 15m',
            bio: 'I\'m a 4th year Computer Systems Engineering student passionate about helping others understand complex programming concepts. I specialize in data structures, algorithms, and systems programming. I\'ve been tutoring for 2 years and love making difficult topics accessible and fun!'
        },
        {
            id: '2',
            name: 'Marcus Johnson',
            pronouns: 'he/him',
            courses: ['MATH 1004', 'PHYS 1004'],
            groupPrice: '12',
            individualPrice: '25',
            sessionTypes: ['1-on-1', 'group'],
            location: ['online'],
            nextAvailable: 'Tomorrow 2pm',
            bio: 'Mathematics and Physics tutor with a knack for breaking down complex problems into simple steps.'
        },
        {
            id: '3',
            name: 'Emily Rodriguez',
            pronouns: 'she/her',
            courses: ['SYSC 2006'],
            groupPrice: '18',
            individualPrice: '30',
            sessionTypes: ['1-on-1', 'group'],
            location: ['in-person'],
            nextAvailable: '4h 30m',
            bio: 'Software Engineering student who loves teaching C programming and debugging techniques.'
        },
        {
            id: '4',
            name: 'Alex Thompson',
            pronouns: 'they/them',
            courses: ['COMP 2402', 'MATH 1004'],
            groupPrice: '14',
            individualPrice: null,
            sessionTypes: ['group'],
            location: ['online', 'in-person'],
            nextAvailable: '5h 45m',
            bio: 'Specializing in algorithms and discrete mathematics with group study sessions.'
        },
        {
            id: '5',
            name: 'Priya Sharma',
            pronouns: 'she/her',
            courses: ['ELEC 2507', 'PHYS 1004'],
            groupPrice: null,
            individualPrice: '28',
            sessionTypes: ['1-on-1'],
            location: ['online'],
            nextAvailable: 'Tomorrow 10am',
            bio: 'Electrical Engineering student focusing on circuits and electromagnetics.'
        },
        {
            id: '6',
            name: 'Jordan Lee',
            pronouns: 'he/him',
            courses: ['SYSC 2006', 'COMP 2402', 'MATH 1004'],
            groupPrice: 'Free',
            individualPrice: 'Free',
            sessionTypes: ['1-on-1', 'group'],
            location: ['in-person'],
            nextAvailable: '3h 20m',
            bio: 'Offering free peer tutoring as part of my teaching assistant training program.'
        }
    ];

    // Mock classmates data for social features
    const mockClassmates = [
        {
            id: 'c1',
            name: 'Jamie Wilson',
            pronouns: 'they/them',
            year: '2nd Year',
            major: 'Computer Science',
            gender: 'Non-Binary' as const,
            photoUrl: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=2787&auto=format&fit=crop',
            sharedCourses: ['COMP 2402', 'SYSC 2006'],
            prompts: [
                { prompt: "I study best at...", answer: "Late night in MacOdrum Library with lo-fi beats" },
                { prompt: "I'm always down to...", answer: "Grab coffee and debug together" },
                { prompt: "My toxic study trait is...", answer: "Starting assignments 2 hours before deadline" },
            ],
        },
        {
            id: 'c2',
            name: 'Michael Chen',
            pronouns: 'he/him',
            year: '3rd Year',
            major: 'Software Engineering',
            gender: 'Man' as const,
            photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2662&auto=format&fit=crop',
            sharedCourses: ['SYSC 2006'],
            prompts: [
                { prompt: "Need someone to help me out with...", answer: "SYSC 2006 - C programming is killing me" },
                { prompt: "Best study spot on campus is...", answer: "The quiet floor in Richcraft Hall" },
                { prompt: "After exams, you'll find me...", answer: "At Mike's Place celebrating" },
            ],
        },
        {
            id: 'c3',
            name: 'Aisha Patel',
            pronouns: 'she/her',
            year: '2nd Year',
            major: 'Computer Science',
            gender: 'Woman' as const,
            photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2459&auto=format&fit=crop',
            sharedCourses: ['COMP 2402', 'MATH 1004'],
            prompts: [
                { prompt: "I'll buy you coffee if...", answer: "You explain recursion to me one more time" },
                { prompt: "My go-to study snack is...", answer: "Tim's iced coffee and a farmer's wrap" },
                { prompt: "I'm passionate about...", answer: "Making tech more accessible and inclusive" },
            ],
        },
        {
            id: 'c4',
            name: 'David Kim',
            pronouns: 'he/him',
            year: '4th Year',
            major: 'Electrical Engineering',
            gender: 'Man' as const,
            photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop',
            sharedCourses: ['ELEC 2507'],
            prompts: [
                { prompt: "I can teach you how to...", answer: "Solder, design PCBs, and not blow up circuits" },
                { prompt: "The class I'm dreading most is...", answer: "ELEC 4705 - RF Engineering" },
                { prompt: "I procrastinate by...", answer: "Building random Arduino projects instead of studying" },
            ],
        },
        {
            id: 'c5',
            name: 'Priya Sharma',
            pronouns: 'she/her',
            year: '3rd Year',
            major: 'Health Sciences',
            gender: 'Woman' as const,
            photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop',
            sharedCourses: ['PHYS 1004'],
            prompts: [
                { prompt: "My secret talent is...", answer: "Memorizing entire anatomy textbooks in one night" },
                { prompt: "Don't talk to me until...", answer: "I've had my morning matcha latte" },
                { prompt: "I'm looking for a study buddy who...", answer: "Can quiz me effectively on flashcards" },
            ],
        },
    ];

    // Mock activity/notifications data
    const [activities, setActivities] = useState<any[]>([
        {
            id: 'a0',
            type: 'connection_request' as const,
            userName: 'Jamie Wilson',
            userInitial: 'J',
            timestamp: '2h ago',
            isUnread: true,
            isPending: true,
        },
        {
            id: 'a1',
            type: 'connection_accepted' as const,
            userName: 'Sarah Chen',
            userInitial: 'S',
            timestamp: '1h ago',
            isUnread: true,
            isPending: false,
        },
        {
            id: 'a2',
            type: 'board_like' as const,
            userName: 'Marcus',
            userInitial: 'M',
            courseName: 'COMP 2402',
            timestamp: '3h ago',
            isUnread: true,
            isPending: false,
        },
        {
            id: 'a3',
            type: 'board_reply' as const,
            userName: 'Emily',
            userInitial: 'E',
            message: undefined,
            courseName: undefined,
            timestamp: 'Yesterday',
            isUnread: false,
            isPending: false,
        },
    ]);

    // Mock courses data for home screen
    const mockCourses = [
        { code: 'SYSC 2006', name: 'Foundations of Imperative Programming', activeCount: 5, tutorCount: 3, studentCount: 234 },
        { code: 'COMP 2402', name: 'Abstract Data Types and Algorithms', activeCount: 8, tutorCount: 2, studentCount: 187 },
        { code: 'MATH 1004', name: 'Calculus for Engineering or Physics', activeCount: 3, tutorCount: 2, studentCount: 312 },
        { code: 'ELEC 2507', name: 'Electronics I', activeCount: 2, tutorCount: 2, studentCount: 145 },
    ];

    // State for new social app tab
    const [socialActiveTab, setSocialActiveTab] = useState<SocialTabValue>('home');
    const [currentUserGender] = useState<'Man' | 'Woman' | 'Non-Binary' | 'Prefer not to say'>('Man'); // For demo
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
                            if (activity?.userName) {
                                const user = mockClassmates.find(u => u.name === activity.userName);
                                if (user) {
                                    setConnectedFriends(prev => {
                                        const next = new Set(prev);
                                        next.add(user.id);
                                        return next;
                                    });
                                }
                            }

                            setActivities(prev => prev.map(a =>
                                a.id === id ? { ...a, isPending: false, isUnread: false, type: 'connection_accepted' as const } : a
                            ));
                        }}
                        onDeclineConnection={(id) => {
                            setActivities(prev => prev.filter(a => a.id !== id));
                        }}
                        onActivityTap={(activity) => {
                            // Mark as read when tapped
                            setActivities(prev => prev.map(a =>
                                a.id === activity.id ? { ...a, isUnread: false } : a
                            ));

                            // Navigate based on activity type
                            if (activity.type === 'message') {
                                setActiveTutorTab('chat');
                            } else if (activity.type === 'board_reply' || activity.type === 'board_like') {
                                // Navigate to the course board
                                if (activity.courseName) {
                                    const course = mockCourses.find(c => c.code === activity.courseName);
                                    if (course) setSelectedCourse(course.code);
                                }
                            }
                        }}
                        onMarkAllRead={() => {
                            setActivities(prev => prev.map(a => ({ ...a, isUnread: false })));
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
                            console.log('View profile:', profile.name);
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
                            // Mark conversation as read when opened
                            setConversations(conversations.map(c =>
                                c.id === id ? { ...c, unreadCount: 0 } : c
                            ));
                        }}
                        onDeleteConversation={(conversationId) => {
                            setConversations(conversations.filter(c => c.id !== conversationId));
                            // Also clean up chat messages
                            const newChatMessages = { ...chatMessages };
                            delete newChatMessages[conversationId];
                            setChatMessages(newChatMessages);
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
                        onLogout={() => {
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
        const courseTutors = tutors.filter(t => t.courses.includes(selectedCourse));

        // Mock posts for the course
        const mockPosts = [
            {
                id: '1',
                authorName: 'Sarah Chen',
                authorInitial: 'S',
                authorYear: '4th Year',
                timestamp: '2h ago',
                content: "Does anyone have notes from today's lecture? I had to leave early for an appointment.",
                likes: 5,
                comments: 3,
                isLiked: false,
                type: 'post' as const,
            },
            {
                id: '2',
                authorName: 'Marcus Johnson',
                authorInitial: 'M',
                authorYear: '3rd Year',
                timestamp: '4h ago',
                content: "Can someone explain how pointers work in C? I'm really struggling with the assignment. 😭",
                likes: 8,
                comments: 12,
                isLiked: true,
                type: 'question' as const,
            },
            {
                id: '3',
                authorName: 'Emily Rodriguez',
                authorInitial: 'E',
                authorYear: '2nd Year',
                timestamp: '1d ago',
                content: "Study group meeting tomorrow at 3pm in the library! Drop a comment if you're coming.",
                likes: 15,
                comments: 7,
                isLiked: false,
                type: 'post' as const,
            },
        ];

        return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}>
                <CourseDetailScreen
                    courseCode={selectedCourse}
                    posts={mockPosts}
                    tutors={courseTutors.map(t => ({
                        id: t.id,
                        name: t.name,
                        courses: t.courses,
                        pronouns: t.pronouns,
                        groupPrice: t.groupPrice,
                        individualPrice: t.individualPrice,
                        location: t.location,
                    }))}
                    activeCount={course?.activeCount || 0}
                    studentCount={course?.studentCount || 0}
                    onBack={() => setSelectedCourse(null)}
                    onCreatePost={(content, type) => console.log('Create post:', content, type)}
                    onLikePost={(id) => console.log('Like post:', id)}
                    onCommentPost={(id) => console.log('Comment on post:', id)}
                    onMessageTutor={(id) => {
                        console.log('Message tutor:', id);

                        // 1. Close the course detail overlay
                        setSelectedCourse(null);

                        // 2. Switch to chat tab
                        setSocialActiveTab('chat');
                        if (userRole === 'tutor') {
                            setActiveTutorTab('chat');
                        }

                        // 3. Find or Create conversation
                        const existingConv = conversations.find(c => c.tutorId === id);

                        if (existingConv) {
                            console.log('Found existing conversation:', existingConv.id);
                            setSelectedConversationId(existingConv.id);
                        } else {
                            console.log('Creating new conversation for tutor:', id);
                            const tutor = tutors.find(t => t.id === id);
                            if (tutor) {
                                const newConv = {
                                    id: `conv-${Date.now()}`,
                                    tutorId: id,
                                    tutorName: tutor.name,
                                    tutorInitial: tutor.name[0],
                                    lastMessage: 'Start a conversation',
                                    timestamp: 'Now',
                                    unreadCount: 0,
                                    type: 'tutor' as const,
                                };
                                setConversations(prev => [newConv, ...prev]);
                                setSelectedConversationId(newConv.id);
                            } else {
                                console.warn('Tutor not found for id:', id);
                            }
                        }
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
        const needsSettingsBase = ['change-password', 'blocked-users', 'privacy-policy', 'terms-of-service'].includes(profileScreen);

        return (
            <>
                {needsSettingsBase && (
                    <View style={overlayStyle}>
                        <SettingsScreen
                            {...commonProps}
                            email="john.doe@carleton.ca"
                            isTutor={false}
                            theme={theme}
                            onChangePassword={() => setProfileScreen('change-password')}
                            onBlockedUsers={() => setProfileScreen('blocked-users')}
                            onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
                            onTermsOfService={() => setProfileScreen('terms-of-service')}
                            onThemeChange={(newTheme) => setTheme(newTheme)}
                            onLogout={() => {
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
                            name={userRole === 'tutor' ? tutorProfile.name : studentProfile.name}
                            pronouns={userRole === 'tutor' ? (tutorProfile.pronouns || 'He/Him') : (studentProfile.pronouns || 'He/Him')}
                            year={userRole === 'tutor' ? (tutorProfile.year || '3rd Year') : (studentProfile.year || '2nd Year')}
                            program={userRole === 'tutor' ? tutorProfile.program : studentProfile.program}
                            bio={userRole === 'tutor' ? tutorProfile.bio : studentProfile.bio}
                            initial={(userRole === 'tutor' ? tutorProfile.name : studentProfile.name).charAt(0)}
                            isTutor={userRole === 'tutor'}
                            onSave={(data) => {
                                // Update profile logic would go here
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
                            onSave={(courses) => {
                                setMyStudyingCourses(courses);
                                setProfileScreen('main');
                            }}
                            onSaveTutoring={(courses) => {
                                setMyTutoringCourses(courses);
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
                                console.log('Saved pricing:', data);
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
                            email="john.doe@carleton.ca"
                            isTutor={false}
                            theme={theme}
                            onChangePassword={() => setProfileScreen('change-password')}
                            onBlockedUsers={() => setProfileScreen('blocked-users')}
                            onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
                            onTermsOfService={() => setProfileScreen('terms-of-service')}
                            onThemeChange={(newTheme) => setTheme(newTheme)}
                            onLogout={() => {
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
                            onSave={() => setProfileScreen('settings')}
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
                            onUnblock={(userId) => {
                                setBlockedUsers(prev => {
                                    const next = new Set(prev);
                                    next.delete(userId);
                                    return next;
                                });
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
                            connections={Array.from(connectedFriends).map(friendId => {
                                const classmate = mockClassmates.find(c => c.id === friendId);
                                if (classmate) {
                                    return {
                                        id: classmate.id,
                                        name: classmate.name,
                                        photoUrl: classmate.photoUrl,
                                        year: classmate.year,
                                        major: classmate.major,
                                        sharedCourses: classmate.sharedCourses,
                                        connectedSince: '2 days ago',
                                    };
                                }
                                // Fallback for IDs not in mockClassmates
                                return {
                                    id: friendId,
                                    name: 'Sarah Chen',
                                    year: '4th Year',
                                    major: 'Computer Systems Engineering',
                                    sharedCourses: ['SYSC 2006'],
                                    connectedSince: '1 week ago',
                                };
                            })}
                            onBack={() => setProfileScreen('main')}
                            onMessage={(connectionId) => {
                                // Switch to chat tab based on user role
                                if (userRole === 'tutor') {
                                    setActiveTutorTab('chat');
                                } else {
                                    setSocialActiveTab('chat');
                                }
                                setProfileScreen('main');
                                // Find or create a conversation with this person
                                const connection = mockClassmates.find(c => c.id === connectionId);
                                const existingConv = conversations.find(c =>
                                    c.tutorName === connection?.name || c.id === connectionId
                                );
                                if (existingConv) {
                                    setSelectedConversationId(existingConv.id);
                                } else if (connection) {
                                    // Create a new conversation for this connection
                                    const newConvId = `conv-${connectionId}`;
                                    setConversations([
                                        {
                                            id: newConvId,
                                            tutorName: connection.name,
                                            tutorInitial: connection.name.charAt(0),
                                            lastMessage: 'Start a conversation!',
                                            timestamp: 'Now',
                                            courseTags: connection.sharedCourses || [],
                                            unreadCount: 0,
                                            type: 'dm',
                                        },
                                        ...conversations,
                                    ]);
                                    setSelectedConversationId(newConvId);
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
        const msgs = chatMessages[selectedConversationId] || [];

        return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}>
                <IndividualChatScreen
                    tutorName={conversation?.tutorName || ''}
                    tutorInitial={conversation?.tutorInitial || ''}
                    messages={msgs}
                    onBack={() => setSelectedConversationId(null)}
                    type={conversation?.type}
                    onViewProfile={() => {
                        const target = conversation?.tutorName || '';
                        handleViewProfile(target);
                    }}
                    onSendMessage={(text) => {
                        const newMessage: Message = {
                            id: Date.now().toString(),
                            message: text,
                            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                            isStudent: !isTutor,
                            status: 'sent',
                        };
                        setChatMessages({
                            ...chatMessages,
                            [selectedConversationId]: [...msgs, newMessage],
                        });

                        // Update conversation preview
                        setConversations(conversations.map(c =>
                            c.id === selectedConversationId
                                ? { ...c, lastMessage: `You: ${text}`, timestamp: 'Just now', unreadCount: 0 }
                                : c
                        ));
                    }}
                    isTutorView={isTutor}
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
                            console.log('View profile:', profile.name);
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
                            setConversations(prev =>
                                prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
                            );
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
                            if (activity?.userName) {
                                const user = mockClassmates.find(u => u.name === activity.userName);
                                if (user) {
                                    setConnectedFriends(prev => {
                                        const next = new Set(prev);
                                        next.add(user.id);
                                        return next;
                                    });
                                }
                            }

                            setActivities(prev => prev.map(a =>
                                a.id === id ? { ...a, isPending: false, isUnread: false, type: 'connection_accepted' as const } : a
                            ));
                        }}
                        onDeclineConnection={(id) => {
                            setActivities(prev => prev.filter(a => a.id !== id));
                        }}
                        onActivityTap={(activity) => {
                            // Mark as read when tapped
                            setActivities(prev => prev.map(a =>
                                a.id === activity.id ? { ...a, isUnread: false } : a
                            ));

                            // Navigate based on activity type
                            if (activity.type === 'message') {
                                setSocialActiveTab('chat');
                            } else if (activity.type === 'board_reply' || activity.type === 'board_like') {
                                // Navigate to the course board
                                if (activity.courseName) {
                                    const course = mockCourses.find(c => c.code === activity.courseName);
                                    if (course) setSelectedCourse(course.code);
                                }
                            }
                        }}
                        onMarkAllRead={() => {
                            setActivities(prev => prev.map(a => ({ ...a, isUnread: false })));
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
                        email="john.doe@carleton.ca"
                        role="Student"
                        connectionsCount={connectedFriends.size}
                        onEditProfile={() => setProfileScreen('edit-profile')}
                        onMyCourses={() => setProfileScreen('my-courses')}
                        onConnections={() => setProfileScreen('connections')}
                        onSettings={() => setProfileScreen('settings')}
                        onLogout={() => {
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


