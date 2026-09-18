import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LogBox, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SlidersHorizontal, Bell } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// Suppress SafeAreaView deprecation warning from Expo's internal packages
// We've already migrated all our code to use react-native-safe-area-context
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

// Import actual migrated components
import { TutorCard } from '../components/TutorCard';
import { NavigationTabs } from '../components/NavigationTabs';
import { AnimatedTabs, TabData as AnimatedTabData } from '../components/AnimatedTabs';
import { FilterDropdown } from '../components/FilterDropdown';
import { ChatListScreen } from '../components/ChatListScreen';
import { IndividualChatScreen, Message } from '../components/IndividualChatScreen';
import { NotificationsScreen } from '../components/NotificationsScreen';
import { PageTransition } from '../components/PageTransition';
import { OnboardingToAppTransition } from '../components/OnboardingToAppTransition';

// Tutor components
import { TutorNavigationTabs } from '../components/tutor/TutorNavigationTabs';
import { TutorHomeScreen } from '../components/tutor/TutorHomeScreen';
import { TutorStudentsScreen } from '../components/tutor/TutorStudentsScreen';
import { TutorProfileScreen } from '../components/tutor/TutorProfileScreen';

// Profile components
import { EditProfileScreen } from '../components/profile/EditProfileScreen';
import { MyCoursesScreen } from '../components/profile/MyCoursesScreen';
import { SettingsScreen } from '../components/profile/SettingsScreen';
import { ChangePasswordScreen } from '../components/profile/ChangePasswordScreen';
import { LanguageSelectionScreen } from '../components/profile/LanguageSelectionScreen';
import { BlockedUsersScreen } from '../components/profile/BlockedUsersScreen';
import { PaymentMethodsScreen } from '../components/profile/PaymentMethodsScreen';
import { PrivacyPolicyScreen } from '../components/profile/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../components/profile/TermsOfServiceScreen';
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
import { StudentProfileCompletionScreen } from '../components/onboarding/StudentProfileCompletionScreen';
import { StudentOnboardingSuccessScreen } from '../components/onboarding/StudentOnboardingSuccessScreen';
import { TutorCourseApplicationScreen } from '../components/onboarding/TutorCourseApplicationScreen';
import { TutorProfileCompletionScreen } from '../components/onboarding/TutorProfileCompletionScreen';
import { TutorPricingSetupScreen } from '../components/onboarding/TutorPricingSetupScreen';
import { TutorOnboardingSuccessScreen } from '../components/onboarding/TutorOnboardingSuccessScreen';
import { TutorProofUploadScreen } from '../components/onboarding/TutorProofUploadScreen';
import { StudentProfileScreen } from '../components/StudentProfileScreen';

// Placeholder components for those not yet migrated
const Tabs = () => <View><Text>Tabs Placeholder</Text></View>;


type TabValue = 'home' | 'chat' | 'bookings' | 'profile';
type TutorTabValue = 'home' | 'bookings' | 'chat' | 'profile' | 'students';
type UserRole = 'student' | 'tutor';
type ProfileScreen =
    | 'main'
    | 'edit-profile'
    | 'my-courses'
    | 'notifications'
    | 'settings'
    | 'change-password'
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
    | 'tutor-success';

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
    // Onboarding state
    const [isOnboarding, setIsOnboarding] = useState(true);
    const [onboardingScreen, setOnboardingScreen] = useState<OnboardingScreen>('welcome');
    const [selectedOnboardingRole, setSelectedOnboardingRole] = useState<UserRole | null>(null);
    const [onboardingCourses, setOnboardingCourses] = useState<string[]>([]);
    const [showTransitionToApp, setShowTransitionToApp] = useState(false);
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

    // Student states
    const [activeTab, setActiveTab] = useState<TabValue>('home');
    const [bookingsTabIndex, setBookingsTabIndex] = useState(0);
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
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [bookingTabIndex, setBookingTabIndex] = useState(0);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [isClosingFilters, setIsClosingFilters] = useState(false);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
        'session-type': [],
        'price-range': [],
        'location': []
    });

    // Tutor detail modal state
    const [selectedTutorForDetail, setSelectedTutorForDetail] = useState<any | null>(null);

    // Booking confirmation state
    const [bookingToConfirm, setBookingToConfirm] = useState<any | null>(null);

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
            tutorName: 'Sarah Chen',
            tutorInitial: 'S',
            lastMessage: 'Great! I can help you with SYSC 2006 this week. When works best for you?',
            timestamp: '2h ago',
            unreadCount: 0,
        },
        {
            id: '2',
            tutorName: 'Marcus Johnson',
            tutorInitial: 'M',
            lastMessage: 'Thanks for booking! See you tomorrow at 2pm',
            timestamp: 'Yesterday',
            unreadCount: 0,
        },
        {
            id: '3',
            tutorName: 'Jordan Lee',
            tutorInitial: 'J',
            lastMessage: 'You: Do you have any availability this weekend?',
            timestamp: 'Dec 15',
            unreadCount: 0,
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
    });

    // Tutor students mock data
    const students = [
        {
            id: '1',
            name: 'John Smith',
            initial: 'JS',
            courses: ['COMP 1405'],
            sessionsCount: 5,
            lastSession: '2 days ago'
        },
        {
            id: '2',
            name: 'Emily Davis',
            initial: 'ED',
            courses: ['MATH 1007'],
            sessionsCount: 3,
            lastSession: '1 week ago'
        }
    ];

    // Student's enrolled courses (from onboarding)
    const myCourses = ['SYSC 2006', 'COMP 2402', 'MATH 1004', 'PHYS 1004', 'ELEC 2507'];

    // Profile screen state and user data
    const [profileScreen, setProfileScreen] = useState<ProfileScreen>('main');
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
    const [blockedUsers, setBlockedUsers] = useState([
        { id: '1', name: 'John Doe', initial: 'J' },
    ]);
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

    // Mock available dates and time slots (in real app, fetch from backend)
    const availableDates = [
        new Date(2024, 10, 20),
        new Date(2024, 10, 21),
        new Date(2024, 10, 22),
        new Date(2024, 10, 23),
        new Date(2024, 10, 24),
    ];

    const timeSlots = ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

    // Filter logic
    const activeFilterCount = Object.values(activeFilters).reduce((sum, filters) => sum + filters.length, 0);

    const handleFilterSelect = (filterId: string, value: string) => {
        setActiveFilters(prev => {
            const currentFilters = prev[filterId] || [];
            const isSelected = currentFilters.includes(value);

            // Single select per category: if selecting, replace array; if deselecting, empty array
            const newFilters = {
                ...prev,
                [filterId]: isSelected ? [] : [value]
            };

            // If deselecting and array becomes empty, ensure the category highlight clears
            if (isSelected) {
                // Clear the filter completely
                return newFilters;
            }

            return newFilters;
        });
    };



    // All available tutors
    const allTutors = [
        {
            id: '1',
            name: 'Sarah Chen',
            courses: ['SYSC 2006', 'COMP 2402', 'ELEC 2507'],
            pronouns: 'she/her',
            groupPrice: '15',
            individualPrice: '28',
            location: ['online', 'in-person'],
            nextAvailable: '2h 15m',
            rating: 4.8,
            reviews: 12
        },
        {
            id: '2',
            name: 'Marcus Johnson',
            courses: ['MATH 1004', 'PHYS 1004'],
            pronouns: 'he/him',
            groupPrice: '12',
            individualPrice: '25',
            location: ['online'],
            nextAvailable: 'Tomorrow 2pm',
            rating: 4.9,
            reviews: 28
        },
        {
            id: '3',
            name: 'Emily Rodriguez',
            courses: ['SYSC 2006'],
            pronouns: 'she/her',
            groupPrice: '18',
            individualPrice: '30',
            location: ['in-person'],
            nextAvailable: '4h 30m',
            rating: 4.7,
            reviews: 15
        },
        {
            id: '4',
            name: 'Alex Thompson',
            courses: ['COMP 2402', 'MATH 1004'],
            pronouns: 'they/them',
            groupPrice: '14',
            individualPrice: null,
            location: ['online', 'in-person'],
            nextAvailable: '5h 45m',
            rating: 4.6,
            reviews: 22
        },
        {
            id: '5',
            name: 'Priya Sharma',
            courses: ['ELEC 2507', 'PHYS 1004'],
            pronouns: 'she/her',
            groupPrice: null,
            individualPrice: '28',
            location: ['online'],
            nextAvailable: 'Tomorrow 10am',
            rating: 4.9,
            reviews: 19
        },
        {
            id: '6',
            name: 'Jordan Lee',
            courses: ['SYSC 2006', 'COMP 2402', 'MATH 1004'],
            pronouns: 'he/him',
            groupPrice: 'Free',
            individualPrice: 'Free',
            location: ['in-person'],
            nextAvailable: '3h 20m',
            rating: 5.0,
            reviews: 8
        }
    ];

    // Helper to get filtered tutors with all filters applied
    const getFilteredTutors = () => {
        let filtered = [...allTutors];

        // Filter by selected course
        if (selectedCourseFilter) {
            filtered = filtered.filter(tutor => tutor.courses.includes(selectedCourseFilter));
        }

        // Filter by session type
        const sessionTypeFilters = activeFilters['session-type'] || [];
        if (sessionTypeFilters.length > 0) {
            filtered = filtered.filter(tutor => {
                const selectedType = sessionTypeFilters[0]; // Single select
                if (selectedType === '1-on-1') {
                    // Only show tutors with individual pricing
                    return !!tutor.individualPrice;
                } else if (selectedType === 'group') {
                    // Only show tutors with group pricing
                    return !!tutor.groupPrice;
                } else if (selectedType === 'both') {
                    // Show tutors with either individual or group pricing
                    return !!tutor.individualPrice || !!tutor.groupPrice;
                }
                return true;
            });
        }

        // Filter by location
        const locationFilters = activeFilters['location'] || [];
        if (locationFilters.length > 0) {
            filtered = filtered.filter(tutor => {
                return locationFilters.some(filterLoc =>
                    tutor.location.some(tutorLoc =>
                        tutorLoc.toLowerCase().includes(filterLoc.toLowerCase())
                    )
                );
            });
        }

        // Filter by price range
        const priceFilters = activeFilters['price-range'] || [];
        if (priceFilters.length > 0) {
            filtered = filtered.filter(tutor => {
                const selectedRange = priceFilters[0]; // Single select

                // Check if tutor's prices match the selected range
                const groupPriceNum = tutor.groupPrice && tutor.groupPrice !== 'Free' ? Number(tutor.groupPrice) : null;
                const individualPriceNum = tutor.individualPrice && tutor.individualPrice !== 'Free' ? Number(tutor.individualPrice) : null;
                const hasFreePrice = tutor.groupPrice === 'Free' || tutor.individualPrice === 'Free';

                if (selectedRange === 'free-10') {
                    // Free to $10: show tutors with Free price OR prices <= 10
                    return hasFreePrice ||
                        (groupPriceNum !== null && groupPriceNum <= 10) ||
                        (individualPriceNum !== null && individualPriceNum <= 10);
                } else if (selectedRange === '10-20') {
                    // $10 to $20: show tutors with prices in this range
                    return (groupPriceNum !== null && groupPriceNum >= 10 && groupPriceNum <= 20) ||
                        (individualPriceNum !== null && individualPriceNum >= 10 && individualPriceNum <= 20);
                } else if (selectedRange === '20-30') {
                    // $20 to $30: show tutors with prices in this range
                    return (groupPriceNum !== null && groupPriceNum >= 20 && groupPriceNum <= 30) ||
                        (individualPriceNum !== null && individualPriceNum >= 20 && individualPriceNum <= 30);
                }
                return true;
            });
        }

        return filtered;
    };

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
                                setActiveTutorTab('bookings');
                            }
                        }
                    }}
                />
            );
        }

        // Handle profile sub-screens for tutors
        if (activeTutorTab === 'profile' && profileScreen !== 'main') {
            const commonProps = {
                onBack: () => setProfileScreen('main'),
            };

            switch (profileScreen) {
                case 'edit-profile':
                    return (
                        <EditProfileScreen
                            {...commonProps}
                            name="Jane Doe"
                            pronouns="she/her"
                            year="3rd Year"
                            program="Computer Science"
                            bio="Passionate about teaching code!"
                            initial="JD"
                            isTutor={true}
                            onSave={(data) => setProfileScreen('main')}
                        />
                    );
                case 'my-courses':
                    return (
                        <MyCoursesScreen
                            {...commonProps}
                            selectedCourses={['COMP 1405', 'COMP 1406']}
                            isTutor={true}
                            onSave={(courses) => setProfileScreen('main')}
                        />
                    );
                case 'pricing-editor':
                    return (
                        <PricingEditorScreen
                            {...commonProps}
                            courses={['COMP 1405', 'COMP 1406']}
                            initialGroupPrice={20}
                            initialIndividualPrice={30}
                            onSave={(pricing) => setProfileScreen('main')}
                        />
                    );
                case 'settings':
                    return (
                        <SettingsScreen
                            {...commonProps}
                            email="jane.doe@example.com"
                            isTutor={true}
                            theme={theme}
                            onChangePassword={() => setProfileScreen('change-password')}
                            onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
                            onTermsOfService={() => setProfileScreen('terms-of-service')}
                            onThemeChange={(newTheme) => setTheme(newTheme)}
                            onLogout={() => {
                                setIsOnboarding(true);
                                setOnboardingScreen('welcome');
                            }}
                            onNavigate={(screen) => console.log('Navigate to', screen)}
                        />
                    );
                case 'change-password':
                    return (
                        <ChangePasswordScreen
                            onBack={() => setProfileScreen('settings')}
                            onSave={() => setProfileScreen('settings')}
                        />
                    );
                case 'privacy-policy':
                    return <PrivacyPolicyScreen onBack={() => setProfileScreen('settings')} />;
                case 'terms-of-service':
                    return <TermsOfServiceScreen onBack={() => setProfileScreen('settings')} />;
            }
        }

        switch (activeTutorTab) {
            case 'home':
                return (
                    <TutorHomeScreen
                        tutorName="Jane"
                        unreadNotifications={notifications.filter(n => n.isUnread).length}
                        onNotificationsClick={() => setShowNotifications(true)}
                    />
                );
            case 'bookings':
                // Tutor bookings - blank page with just tabs for now
                const tutorBookingTabs: AnimatedTabData[] = [
                    { id: 'all', title: 'All', content: <View className="items-center py-12"><Text className="text-gray-500">No bookings</Text></View> },
                    { id: 'upcoming', title: 'Upcoming', content: <View className="items-center py-12"><Text className="text-gray-500">No upcoming bookings</Text></View> },
                    { id: 'past', title: 'Past', content: <View className="items-center py-12"><Text className="text-gray-500">No past bookings</Text></View> },
                ];
                return (
                    <View className="flex-1 bg-white">
                        <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 20 }}>
                            <Text className="text-2xl font-bold mb-6 text-center text-gray-900">Schedule</Text>
                            <AnimatedTabs
                                tabs={tutorBookingTabs}
                                activeTabIndex={tutorBookingTabIndex}
                                onTabChange={setTutorBookingTabIndex}
                                variant="pill"
                            />
                        </ScrollView>
                    </View>
                );
            case 'chat':
                return selectedConversationId ? (
                    (() => {
                        const conversation = conversations.find((c) => c.id === selectedConversationId);
                        const messages = chatMessages[selectedConversationId] || [];

                        return (
                            <IndividualChatScreen
                                tutorName={conversation?.tutorName || ''}
                                tutorInitial={conversation?.tutorInitial || ''}
                                messages={messages}
                                onBack={() => setSelectedConversationId(null)}
                                onSendMessage={(text) => {
                                    const newMessage: Message = {
                                        id: Date.now().toString(),
                                        message: text,
                                        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                                        isStudent: false,
                                        status: 'sent',
                                    };
                                    setChatMessages({
                                        ...chatMessages,
                                        [selectedConversationId]: [...messages, newMessage],
                                    });

                                    // Update conversation preview
                                    setConversations(conversations.map(c =>
                                        c.id === selectedConversationId
                                            ? { ...c, lastMessage: `You: ${text}`, timestamp: 'Just now', unreadCount: 0 }
                                            : c
                                    ));
                                }}
                                isTutorView={true}
                            />
                        );
                    })()
                ) : (
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
                    />
                );
            case 'profile':
                return (
                    <TutorProfileScreen
                        tutorName="Jane Doe"
                        tutorInitial="J"
                        role="tutor"
                        onRoleChange={() => setUserRole('student')}
                        onEditProfile={() => setProfileScreen('edit-profile')}
                        onEditCourses={() => setProfileScreen('my-courses')}
                        onEditPricing={() => setProfileScreen('pricing-editor')}
                        onSettings={() => setProfileScreen('settings')}
                        onLogout={() => {
                            setIsOnboarding(true);
                            setOnboardingScreen('welcome');
                        }}
                    />
                );
            case 'students':
                return (
                    <TutorStudentsScreen
                        students={students}
                        onStudentClick={(id: string) => console.log('Student clicked', id)}
                        onMessageStudent={(id: string) => setActiveTutorTab('chat')}
                    />
                );
            default:
                return (
                    <TutorHomeScreen
                        tutorName="Jane"
                        unreadNotifications={notifications.filter(n => n.isUnread).length}
                        onNotificationsClick={() => setShowNotifications(true)}
                    />
                );
        }
    };

    // Student mode render function
    const renderStudentContent = () => {
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
                                    setBookingsTabIndex(1); // Upcoming
                                } else if (booking.status === 'Completed') {
                                    setBookingsTabIndex(2); // Past
                                } else {
                                    setBookingsTabIndex(0); // All
                                }
                                setHighlightedBookingId(booking.id);
                                setActiveTab('bookings');
                            }
                        }
                    }}
                />
            );
        }

        // Handle profile sub-screens
        if (activeTab === 'profile' && profileScreen !== 'main') {
            const commonProps = {
                onBack: () => setProfileScreen('main'),
            };

            switch (profileScreen) {
                case 'edit-profile':
                    return (
                        <EditProfileScreen
                            {...commonProps}
                            name="John Doe"
                            pronouns="he/him"
                            year="2nd Year"
                            program="Computer Science"
                            bio="Passionate about learning!"
                            initial="JD"
                            isTutor={false}
                            onSave={(data) => setProfileScreen('main')}
                        />
                    );
                case 'my-courses':
                    return (
                        <MyCoursesScreen
                            {...commonProps}
                            selectedCourses={['COMP 1405', 'MATH 1007']}
                            isTutor={false}
                            onSave={(courses) => setProfileScreen('main')}
                        />
                    );
                case 'settings':
                    return (
                        <SettingsScreen
                            {...commonProps}
                            email="john.doe@example.com"
                            isTutor={false}
                            theme={theme}
                            onChangePassword={() => setProfileScreen('change-password')}
                            onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
                            onTermsOfService={() => setProfileScreen('terms-of-service')}
                            onThemeChange={(newTheme) => setTheme(newTheme)}
                            onLogout={() => {
                                setIsOnboarding(true);
                                setOnboardingScreen('welcome');
                            }}
                            onNavigate={(screen) => console.log('Navigate to', screen)}
                        />
                    );
                case 'change-password':
                    return (
                        <ChangePasswordScreen
                            onBack={() => setProfileScreen('settings')}
                            onSave={() => setProfileScreen('settings')}
                        />
                    );
                case 'privacy-policy':
                    return <PrivacyPolicyScreen onBack={() => setProfileScreen('settings')} />;
                case 'terms-of-service':
                    return <TermsOfServiceScreen onBack={() => setProfileScreen('settings')} />;
            }
        }

        switch (activeTab) {
            case 'home':
                const unreadCount = notifications.filter(n => n.isUnread).length;

                return (
                    <ScrollView className="flex-1" style={{ backgroundColor: '#fff' }}>
                        {/* Gradient Header Card */}
                        <View style={styles.headerContainer}>
                            <LinearGradient
                                colors={['#db2321', '#500908']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientHeader}
                            >
                                <View style={styles.headerContent}>
                                    {/* Left Section - Welcome Text */}
                                    <View style={styles.welcomeSection}>
                                        <Text style={styles.welcomeText}>Welcome back,</Text>
                                        <Text style={styles.userName}>{userProfile.name}</Text>
                                    </View>

                                    {/* Right Section - Notification Bell */}
                                    <TouchableOpacity
                                        style={styles.bellButton}
                                        onPress={() => {
                                            setShowNotifications(true);
                                            setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.bellContainer}>
                                            <Bell size={24} color="white" />
                                            {unreadCount > 0 && (
                                                <View style={styles.badge}>
                                                    <Text style={styles.badgeText}>{unreadCount}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </View>

                        <View style={styles.contentContainer}>
                            {/* Available Tutors Section */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Available Tutors</Text>
                                <TouchableOpacity
                                    onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                                    style={styles.filterButton}
                                >
                                    <SlidersHorizontal size={20} color="#6b7280" />
                                </TouchableOpacity>
                                <Text style={styles.tutorCount}>
                                    {getFilteredTutors().length} {getFilteredTutors().length === 1 ? 'tutor' : 'tutors'}
                                </Text>
                            </View>

                            {showFilterDropdown && (
                                <FilterDropdown
                                    onSelect={handleFilterSelect}
                                    selectedFilters={activeFilters}
                                    visible={showFilterDropdown}
                                    onClose={() => setShowFilterDropdown(false)}
                                />
                            )}

                            {/* Tutors List */}
                            <View style={styles.tutorsList}>
                                {getFilteredTutors().map(tutor => (
                                    <TutorCard
                                        key={tutor.id}
                                        name={tutor.name}
                                        courses={tutor.courses}
                                        pronouns={tutor.pronouns}
                                        groupPrice={tutor.groupPrice}
                                        individualPrice={tutor.individualPrice}
                                        location={tutor.location}
                                        onClick={() => setSelectedTutorForDetail(tutor)}
                                    />
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                );
            case 'chat':
                return selectedConversationId ? (
                    (() => {
                        const conversation = conversations.find((c) => c.id === selectedConversationId);
                        const messages = chatMessages[selectedConversationId] || [];

                        return (
                            <IndividualChatScreen
                                tutorName={conversation?.tutorName || ''}
                                tutorInitial={conversation?.tutorInitial || ''}
                                messages={messages}
                                onBack={() => setSelectedConversationId(null)}
                                onSendMessage={(text) => {
                                    const newMessage: Message = {
                                        id: Date.now().toString(),
                                        message: text,
                                        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                                        isStudent: true,
                                        status: 'sent',
                                    };
                                    setChatMessages({
                                        ...chatMessages,
                                        [selectedConversationId]: [...messages, newMessage],
                                    });

                                    // Update conversation preview
                                    setConversations(conversations.map(c =>
                                        c.id === selectedConversationId
                                            ? { ...c, lastMessage: `You: ${text}`, timestamp: 'Just now', unreadCount: 0 }
                                            : c
                                    ));
                                }}
                            />
                        );
                    })()
                ) : (
                    <ChatListScreen
                        conversations={conversations}
                        onConversationClick={(id) => {
                            setSelectedConversationId(id);
                            // Mark conversation as read when opened
                            setConversations(conversations.map(c =>
                                c.id === id ? { ...c, unreadCount: 0 } : c
                            ));
                        }}
                    />
                );
            case 'bookings':
                // Student bookings - blank page with just tabs for now
                const studentBookingTabs: AnimatedTabData[] = [
                    { id: 'all', title: 'All', content: <View className="items-center py-12"><Text className="text-gray-500">No bookings</Text></View> },
                    { id: 'upcoming', title: 'Upcoming', content: <View className="items-center py-12"><Text className="text-gray-500">No upcoming bookings</Text></View> },
                    { id: 'past', title: 'Past', content: <View className="items-center py-12"><Text className="text-gray-500">No past bookings</Text></View> },
                ];

                return (
                    <View className="flex-1 bg-white">
                        <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 20 }}>
                            <Text className="text-2xl font-bold mb-6 text-center text-gray-900">Schedule</Text>
                            <AnimatedTabs
                                tabs={studentBookingTabs}
                                activeTabIndex={bookingsTabIndex}
                                onTabChange={setBookingsTabIndex}
                                variant="pill"
                            />
                        </ScrollView>
                    </View>
                );
            case 'profile':
                return (
                    <StudentProfileScreen
                        name="John Doe"
                        email="john.doe@example.com"
                        role="Student"
                        onEditProfile={() => setProfileScreen('edit-profile')}
                        onMyCourses={() => setProfileScreen('my-courses')}
                        onSettings={() => setProfileScreen('settings')}
                        onLogout={() => {
                            setIsOnboarding(true);
                            setOnboardingScreen('welcome');
                        }}
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
                        onSignUp={(email, password) => {
                            setOnboardingEmail(email || 'demo@carleton.ca');
                            setUserRole(selectedOnboardingRole || 'student');
                            setOnboardingScreen('code-verification');
                        }}
                        onSignInLink={() => setOnboardingScreen('sign-in')}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'code-verification'} zIndex={4}>
                    <CodeVerificationScreen
                        email={onboardingEmail}
                        onBack={() => setOnboardingScreen('sign-up')}
                        onVerify={(code) => {
                            // Code verified, go to profile basics
                            setOnboardingScreen('profile-basics');
                        }}
                        onResendCode={() => {
                            // Mock resend
                            console.log('Resending code to', onboardingEmail);
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

                <FadeTransition isVisible={onboardingScreen === 'sign-in'} zIndex={3}>
                    <SignInScreen
                        onBack={() => setOnboardingScreen('welcome')}
                        onSignIn={(email, password) => {
                            // Mock sign in - determine role based on email or random for demo
                            setIsOnboarding(false);
                        }}
                        onSignUpLink={() => setOnboardingScreen('role-selection')}
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
                        onComplete={() => setIsOnboarding(false)}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'tutor-course-application'} zIndex={8}>
                    <TutorCourseApplicationScreen
                        onBack={() => setOnboardingScreen('student-course-selection')}
                        onContinue={(courses) => {
                            // Store tutor courses separately or merge
                            setOnboardingScreen('tutor-proof-upload');
                        }}
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
                        courses={onboardingCourses}
                        onBack={() => setOnboardingScreen('tutor-proof-upload')}
                        onContinue={(pricing) => setOnboardingScreen('tutor-success')}
                    />
                </FadeTransition>

                <FadeTransition isVisible={onboardingScreen === 'tutor-success'} zIndex={11}>
                    <TutorOnboardingSuccessScreen
                        onComplete={() => setIsOnboarding(false)}
                    />
                </FadeTransition>
            </View>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                <StatusBar style="auto" />
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
                                        </View>
                                        <TutorNavigationTabs
                                            activeTab={activeTutorTab === 'students' ? 'bookings' : activeTutorTab}
                                            onTabChange={(tab) => {
                                                setShowNotifications(false);
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
                                        />
                                    </>
                                ) : (
                                    <>
                                        <View className="flex-1">
                                            {renderStudentContent()}
                                        </View>
                                        <NavigationTabs
                                            activeTab={activeTab}
                                            onTabChange={(tab) => {
                                                setShowNotifications(false);
                                                // If clicking chat tab, go back to chat list
                                                if (tab === 'chat') {
                                                    setSelectedConversationId(null);
                                                }
                                                // If clicking profile tab, go back to main profile
                                                if (tab === 'profile') {
                                                    setProfileScreen('main');
                                                }
                                                setActiveTab(tab);
                                            }}
                                            unreadCount={conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)}
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
                    {bookingToConfirm && (
                        <BookingConfirmationScreen
                            isOpen={!!bookingToConfirm}
                            onClose={() => setBookingToConfirm(null)}
                            booking={bookingToConfirm}
                            onConfirm={() => {
                                setBookingToConfirm(null);
                                // Add notification logic here
                                setNotifications(prev => [{
                                    id: Date.now().toString(),
                                    type: 'accepted',
                                    title: 'Booking Confirmed',
                                    message: `Your session with ${bookingToConfirm.tutorName} has been confirmed.`,
                                    timestamp: 'Just now',
                                    isUnread: true,
                                    data: { bookingId: bookingToConfirm.id }
                                }, ...prev]);
                            }}
                            onCancel={() => setBookingToConfirm(null)}
                        />
                    )}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        marginBottom: 24,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    gradientHeader: {
        borderRadius: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        padding: 24,
        minHeight: 140,
        justifyContent: 'center',
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
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },
    userName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
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
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    tutorCount: {
        fontSize: 14,
        color: '#6b7280',
    },
    filterButton: {
        padding: 8,
    },
    tutorsList: {
        gap: 16,
        paddingBottom: 20,
    },
});
