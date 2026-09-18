import { useState } from 'react';
import { TutorCard } from './components/TutorCard';
import { CourseChip } from './components/CourseChip';
import { PricingBubble } from './components/PricingBubble';
import { TimeIndicator } from './components/TimeIndicator';
import { SessionBadge } from './components/SessionBadge';
import { CalendarPicker } from './components/CalendarPicker';
import { TimeSlot } from './components/TimeSlot';
import { BookingCard } from './components/BookingCard';
import { NavigationTabs } from './components/NavigationTabs';
import { Tabs, TabData } from './components/Tabs';
import { FilterDropdown } from './components/FilterDropdown';
import { ChatListScreen, Conversation } from './components/ChatListScreen';
import { IndividualChatScreen, Message } from './components/IndividualChatScreen';
import { TutorDetailModal } from './components/TutorDetailModal';
import { BookingConfirmationScreen } from './components/BookingConfirmationScreen';
import { NotificationsScreen, Notification } from './components/NotificationsScreen';
import { StudentProfileScreen } from './components/StudentProfileScreen';
import { Bell, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PageTransition } from './components/PageTransition';
import { OnboardingToAppTransition } from './components/OnboardingToAppTransition';
// Tutor imports
import { TutorNavigationTabs } from './components/tutor/TutorNavigationTabs';
import { TutorHomeScreen } from './components/tutor/TutorHomeScreen';
import { TutorBookingsScreen } from './components/tutor/TutorBookingsScreen';
import { TutorStudentsScreen } from './components/tutor/TutorStudentsScreen';
import { TutorProfileScreen } from './components/tutor/TutorProfileScreen';
import { TutorChatScreen } from './components/tutor/TutorChatScreen';
// Profile imports
import { EditProfileScreen } from './components/profile/EditProfileScreen';
import { MyCoursesScreen } from './components/profile/MyCoursesScreen';
import { SettingsScreen } from './components/profile/SettingsScreen';
import { ChangePasswordScreen } from './components/profile/ChangePasswordScreen';
import { LanguageSelectionScreen } from './components/profile/LanguageSelectionScreen';
import { BlockedUsersScreen } from './components/profile/BlockedUsersScreen';
import { PaymentMethodsScreen } from './components/profile/PaymentMethodsScreen';
import { PrivacyPolicyScreen } from './components/profile/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './components/profile/TermsOfServiceScreen';
import { PricingEditorScreen } from './components/tutor/PricingEditorScreen';
import { AvailabilityEditorScreen } from './components/tutor/AvailabilityEditorScreen';
// Onboarding imports
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { RoleSelectionScreen } from './components/onboarding/RoleSelectionScreen';
import { SignUpScreen } from './components/onboarding/SignUpScreen';
import { SignInScreen } from './components/onboarding/SignInScreen';
import { StudentCourseSelectionScreen } from './components/onboarding/StudentCourseSelectionScreen';
import { StudentProfileCompletionScreen } from './components/onboarding/StudentProfileCompletionScreen';
import { StudentOnboardingSuccessScreen } from './components/onboarding/StudentOnboardingSuccessScreen';
import { TutorCourseApplicationScreen } from './components/onboarding/TutorCourseApplicationScreen';
import { TutorPricingSetupScreen } from './components/onboarding/TutorPricingSetupScreen';
import { TutorAvailabilitySetupScreen } from './components/onboarding/TutorAvailabilitySetupScreen';
import { TutorOnboardingSuccessScreen } from './components/onboarding/TutorOnboardingSuccessScreen';
import { TutorProofUploadScreen } from './components/onboarding/TutorProofUploadScreen';

type TabValue = 'home' | 'chat' | 'bookings' | 'profile';
type TutorTabValue = 'home' | 'bookings' | 'chat' | 'profile';
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
  | 'pricing-editor'
  | 'availability-editor';

type OnboardingScreen =
  | 'welcome'
  | 'role-selection'
  | 'sign-up'
  | 'sign-in'
  | 'student-course-selection'
  | 'student-profile-completion'
  | 'student-success'
  | 'tutor-course-application'
  | 'tutor-proof-upload'
  | 'tutor-pricing-setup'
  | 'tutor-availability-setup'
  | 'tutor-success';

type Booking = {
  id: string;
  tutorName: string;
  tutorInitial: string;
  course: string;
  date: string;
  time: string;
  location: string;
  sessionType: 'group' | 'individual';
  price: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
};

export default function App() {
  // Onboarding state
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [onboardingScreen, setOnboardingScreen] = useState<OnboardingScreen>('welcome');
  const [selectedOnboardingRole, setSelectedOnboardingRole] = useState<UserRole | null>(null);
  const [onboardingCourses, setOnboardingCourses] = useState<string[]>([]);
  const [showTransitionToApp, setShowTransitionToApp] = useState(false);
  
  // Role toggle state
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [activeTutorTab, setActiveTutorTab] = useState<TutorTabValue>('home');
  const [tutorBookingTabIndex, setTutorBookingTabIndex] = useState(0);
  
  // Student states
  const [activeTab, setActiveTab] = useState<TabValue>('home');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookingTabIndex, setBookingTabIndex] = useState(0);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isClosingFilters, setIsClosingFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    'session-type': [],
    'price-range': [],
    'location': []
  });

  // Tutor detail modal state
  const [selectedTutorForDetail, setSelectedTutorForDetail] = useState<any | null>(null);
  
  // Booking confirmation state
  const [bookingToConfirm, setBookingToConfirm] = useState<any | null>(null);
  
  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
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
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      tutorName: 'Sarah Chen',
      tutorInitial: 'S',
      lastMessage: 'Great! I can help you with SYSC 2006 this week. When works best for you?',
      timestamp: '2h ago',
      unreadCount: 2,
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

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      tutorName: 'Sarah Chen',
      tutorInitial: 'S',
      course: 'SYSC 2006',
      date: 'Nov 20, 2024',
      time: '2:00 PM',
      location: 'Online via Zoom',
      sessionType: 'group',
      price: '15',
      status: 'Confirmed'
    },
    {
      id: '2',
      tutorName: 'Marcus Johnson',
      tutorInitial: 'M',
      course: 'MATH 1004',
      date: 'Tomorrow',
      time: '2:00 PM',
      location: 'Online via Zoom',
      sessionType: 'individual',
      price: '30',
      status: 'Confirmed'
    },
    {
      id: '3',
      tutorName: 'Emily Rodriguez',
      tutorInitial: 'E',
      course: 'SYSC 2006',
      date: 'Nov 22, 2024',
      time: '3:00 PM',
      location: 'Science Building',
      sessionType: 'group',
      price: '18',
      status: 'Pending'
    }
  ]);

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
      
      return {
        ...prev,
        [filterId]: isSelected
          ? currentFilters.filter(v => v !== value)
          : [...currentFilters, value]
      };
    });
  };

  const getFilteredTutors = () => {
    return tutors.filter(tutor => {
      // Course filter
      if (selectedCourse && !tutor.courses.includes(selectedCourse)) {
        return false;
      }

      const hasSessionTypeFilter = activeFilters['session-type']?.length > 0;
      const hasPriceFilter = activeFilters['price-range']?.length > 0;

      // Combined Session type + Price range filter logic
      if (hasSessionTypeFilter || hasPriceFilter) {
        const sessionTypes = activeFilters['session-type'] || [];
        const priceRanges = activeFilters['price-range'] || [];
        
        // Get which session types to check based on filter
        const checkGroup = !hasSessionTypeFilter || sessionTypes.includes('group');
        const checkIndividual = !hasSessionTypeFilter || sessionTypes.includes('1-on-1');
        
        // Helper to check if a price matches a filter
        const priceMatchesFilter = (price: string | null, filter: string): boolean => {
          if (!price) return false;
          
          if (filter === 'free-10') {
            if (price === 'Free') return true;
            const numPrice = parseFloat(price);
            return numPrice <= 10;
          }
          
          if (price === 'Free') return false;
          const numPrice = parseFloat(price);
          
          if (filter === '10-20') {
            return numPrice > 10 && numPrice <= 20;
          }
          if (filter === '20-30') {
            return numPrice > 20 && numPrice <= 30;
          }
          return false;
        };
        
        // Check session type availability first
        if (hasSessionTypeFilter) {
          const hasSessionType = sessionTypes.some(filter => {
            if (filter === 'group') return tutor.groupPrice !== null;
            if (filter === '1-on-1') return tutor.individualPrice !== null;
            if (filter === 'both') return tutor.groupPrice !== null && tutor.individualPrice !== null;
            return false;
          });
          if (!hasSessionType) return false;
        }
        
        // Check price ranges against appropriate session types
        if (hasPriceFilter) {
          const hasPriceMatch = priceRanges.some(priceFilter => {
            let matches = false;
            
            // Check group price if applicable
            if (checkGroup && tutor.groupPrice !== null) {
              matches = matches || priceMatchesFilter(tutor.groupPrice, priceFilter);
            }
            
            // Check individual price if applicable
            if (checkIndividual && tutor.individualPrice !== null) {
              matches = matches || priceMatchesFilter(tutor.individualPrice, priceFilter);
            }
            
            return matches;
          });
          
          if (!hasPriceMatch) return false;
        }
      }

      // Location filter
      if (activeFilters['location']?.length > 0) {
        const hasMatch = activeFilters['location'].some(filter => {
          if (filter === 'online') return tutor.location.includes('online');
          if (filter === 'in-person') return tutor.location.includes('in-person');
          if (filter === 'both') return tutor.location.includes('online') && tutor.location.includes('in-person');
          return false;
        });
        if (!hasMatch) return false;
      }

      return true;
    });
  };

  // Helper function to open chat with a tutor
  const openChatWithTutor = (tutorName: string) => {
    const tutorInitial = tutorName.charAt(0);
    // Check if conversation already exists
    const existingConversation = conversations.find(c => c.tutorName === tutorName);
    
    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
    } else {
      // Create new conversation
      const newConversationId = (conversations.length + 1).toString();
      const newConversation: Conversation = {
        id: newConversationId,
        tutorName,
        tutorInitial,
        lastMessage: '',
        timestamp: 'Just now',
        unreadCount: 0,
      };
      setConversations([newConversation, ...conversations]);
      setChatMessages({ ...chatMessages, [newConversationId]: [] });
      setSelectedConversationId(newConversationId);
    }
    
    setActiveTab('chat');
  };

  // Mock tutor data (for tutor view)
  const tutorMockBookings = [
    {
      id: '1',
      studentName: 'Alex Kim',
      studentInitial: 'A',
      course: 'SYSC 2006',
      date: 'Nov 20, 2024',
      time: '2:00 PM',
      sessionType: 'group' as const,
      status: 'Pending' as const,
      location: 'online' as const,
      studentsJoined: 3,
      maxStudents: 8,
      earnings: '45',
    },
    {
      id: '2',
      studentName: 'Maria Garcia',
      studentInitial: 'M',
      course: 'COMP 2402',
      date: 'Tomorrow',
      time: '10:00 AM',
      sessionType: 'individual' as const,
      status: 'Confirmed' as const,
      location: 'online' as const,
      earnings: '28',
    },
    {
      id: '3',
      studentName: 'James Wilson',
      studentInitial: 'J',
      course: 'SYSC 2006',
      date: 'Nov 22, 2024',
      time: '3:00 PM',
      sessionType: 'group' as const,
      status: 'Confirmed' as const,
      location: 'in-person' as const,
      studentsJoined: 5,
      maxStudents: 8,
      earnings: '75',
    },
    {
      id: '4',
      studentName: 'Lisa Chen',
      studentInitial: 'L',
      course: 'ELEC 2507',
      date: 'Nov 18, 2024',
      time: '2:00 PM',
      sessionType: 'individual' as const,
      status: 'Completed' as const,
      location: 'online' as const,
      earnings: '28',
    },
  ];

  const tutorMockStudents = [
    {
      id: '1',
      name: 'Alex Kim',
      initial: 'A',
      courses: ['SYSC 2006'],
      sessionsCount: 2,
      lastSession: 'Nov 15',
    },
    {
      id: '2',
      name: 'Maria Garcia',
      initial: 'M',
      courses: ['COMP 2402', 'SYSC 2006'],
      sessionsCount: 4,
      lastSession: 'Nov 18',
    },
    {
      id: '3',
      name: 'James Wilson',
      initial: 'J',
      courses: ['SYSC 2006'],
      sessionsCount: 1,
    },
  ];

  // Tutor mode render function
  const renderTutorContent = () => {
    if (showNotifications) {
      return (
        <NotificationsScreen
          notifications={notifications}
          onBack={() => setShowNotifications(false)}
          onNotificationClick={(notification) => {
            setNotifications(notifications.map(n => 
              n.id === notification.id ? { ...n, isUnread: false } : n
            ));
            setShowNotifications(false);
            if (notification.type === 'accepted' || notification.type === 'reminder') {
              setActiveTutorTab('bookings');
            }
          }}
          onMarkAllRead={() => {
            setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
          }}
        />
      );
    }

    // Handle profile sub-screens for tutors
    if (activeTutorTab === 'profile' && profileScreen !== 'main') {
      switch (profileScreen) {
        case 'edit-profile':
          return (
            <EditProfileScreen
              name={userProfile.name}
              pronouns={userProfile.pronouns}
              year={userProfile.year}
              program={userProfile.program}
              bio={userProfile.bio}
              initial={userProfile.name.charAt(0)}
              isTutor={true}
              onBack={() => setProfileScreen('main')}
              onSave={(data) => {
                setUserProfile({ ...userProfile, ...data });
                setProfileScreen('main');
                alert('Profile updated!');
              }}
            />
          );
        
        case 'my-courses':
          return (
            <MyCoursesScreen
              selectedCourses={userProfile.courses}
              isTutor={true}
              onBack={() => setProfileScreen('main')}
              onSave={(courses) => {
                setUserProfile({ ...userProfile, courses });
                setProfileScreen('main');
                alert('Courses updated!');
              }}
            />
          );
        
        case 'pricing-editor':
          return (
            <PricingEditorScreen
              courses={userProfile.courses}
              initialGroupPrice={15}
              initialIndividualPrice={28}
              onBack={() => setProfileScreen('main')}
              onSave={(data) => {
                console.log('Pricing saved:', data);
                alert('Pricing updated successfully!');
                setProfileScreen('main');
              }}
            />
          );
        
        case 'availability-editor':
          return (
            <AvailabilityEditorScreen
              onBack={() => setProfileScreen('main')}
              onSave={(data) => {
                console.log('Availability saved:', data);
                alert('Availability updated successfully!');
                setProfileScreen('main');
              }}
            />
          );
        
        case 'settings':
          return (
            <SettingsScreen
              email={userProfile.email}
              isTutor={true}
              theme={theme}
              onBack={() => setProfileScreen('main')}
              onChangePassword={() => setProfileScreen('change-password')}
              onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
              onTermsOfService={() => setProfileScreen('terms-of-service')}
              onThemeChange={(newTheme) => setTheme(newTheme)}
            />
          );
        
        case 'change-password':
          return (
            <ChangePasswordScreen
              onBack={() => setProfileScreen('settings')}
              onSave={(currentPassword, newPassword) => {
                alert('Password changed successfully!');
                setProfileScreen('settings');
              }}
            />
          );
        
        case 'privacy-policy':
          return (
            <PrivacyPolicyScreen
              onBack={() => setProfileScreen('settings')}
            />
          );
        
        case 'terms-of-service':
          return (
            <TermsOfServiceScreen
              onBack={() => setProfileScreen('settings')}
            />
          );
      }
    }

    switch (activeTutorTab) {
      case 'home':
        return (
          <TutorHomeScreen
            tutorName="Kshitij"
            stats={{
              sessionsBooked: 8,
              studentsHelped: 12,
            }}
            recentBookings={tutorMockBookings.slice(0, 3)}
            unreadNotifications={notifications.filter(n => n.isUnread).length}
            onNotificationsClick={() => {
              setShowNotifications(true);
              setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
            }}
            onEditAvailability={() => {
              setProfileScreen('availability-editor');
              setActiveTutorTab('profile');
            }}
            onViewProfile={() => {
              setProfileScreen('main');
              setActiveTutorTab('profile');
            }}
            onBookingAction={(bookingId, action) => {
              if (action === 'details') {
                alert(`View details for booking ${bookingId}`);
              } else if (action === 'accept') {
                alert(`Accepted booking ${bookingId}`);
              } else if (action === 'decline') {
                alert(`Declined booking ${bookingId}`);
              } else if (action === 'message') {
                alert(`Message student from booking ${bookingId}`);
              }
            }}
          />
        );

      case 'bookings':
        return (
          <TutorBookingsScreen
            bookings={tutorMockBookings}
            activeTabIndex={tutorBookingTabIndex}
            onTabChange={setTutorBookingTabIndex}
            onBookingAction={(bookingId, action) => {
              if (action === 'details') {
                alert(`Booking Details:\nID: ${bookingId}\nThis would show full booking information.`);
              } else if (action === 'accept') {
                // Find booking and update status
                const booking = tutorMockBookings.find(b => b.id === bookingId);
                if (booking) {
                  alert(`✓ Accepted booking from ${booking.studentName} for ${booking.course} on ${booking.date} at ${booking.time}`);
                  // In real app, this would update the booking status in the backend
                }
              } else if (action === 'decline') {
                // Find booking and decline
                const booking = tutorMockBookings.find(b => b.id === bookingId);
                if (booking) {
                  if (confirm(`Are you sure you want to decline the booking from ${booking.studentName}?`)) {
                    alert(`Declined booking from ${booking.studentName}`);
                    // In real app, this would update the booking status in the backend
                  }
                }
              } else if (action === 'message') {
                // Find booking and open chat
                const booking = tutorMockBookings.find(b => b.id === bookingId);
                if (booking) {
                  alert(`Opening chat with ${booking.studentName}...`);
                  // In real app, this would navigate to chat with the student
                  setActiveTutorTab('chat');
                }
              }
            }}
          />
        );

      case 'chat':
        return (
          <TutorChatScreen
            students={tutorMockStudents}
            conversations={conversations}
            chatMessages={chatMessages}
            selectedConversationId={selectedConversationId}
            onStudentClick={(studentId) => alert(`View student profile ${studentId}`)}
            onMessageStudent={(studentId) => {
              // Find the student and open chat with them
              const student = tutorMockStudents.find(s => s.id === studentId);
              if (student) {
                const existingConversation = conversations.find(c => c.tutorName === student.name);
                
                if (existingConversation) {
                  setSelectedConversationId(existingConversation.id);
                } else {
                  // Create new conversation
                  const newConversationId = (conversations.length + 1).toString();
                  const newConversation: Conversation = {
                    id: newConversationId,
                    tutorName: student.name,
                    tutorInitial: student.initial,
                    lastMessage: '',
                    timestamp: 'Just now',
                    unreadCount: 0,
                  };
                  setConversations([newConversation, ...conversations]);
                  setChatMessages({ ...chatMessages, [newConversationId]: [] });
                  setSelectedConversationId(newConversationId);
                }
              }
            }}
            onConversationClick={(id) => {
              setSelectedConversationId(id);
              // Mark as read
              setConversations(conversations.map(c => 
                c.id === id ? { ...c, unreadCount: 0 } : c
              ));
            }}
            onSendMessage={(message) => {
              if (selectedConversationId) {
                const messages = chatMessages[selectedConversationId] || [];
                const newMessage: Message = {
                  id: Date.now().toString(),
                  message,
                  timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                  isStudent: false, // Tutor is sending, so isStudent = false
                  status: 'sent',
                };
                setChatMessages({
                  ...chatMessages,
                  [selectedConversationId]: [...messages, newMessage],
                });
                
                // Update conversation preview
                setConversations(conversations.map(c => 
                  c.id === selectedConversationId 
                    ? { ...c, lastMessage: message, timestamp: 'Just now', unreadCount: 0 }
                    : c
                ));
              }
            }}
            onBackFromChat={() => setSelectedConversationId(null)}
            onDeleteConversation={(conversationId) => {
              setConversations(conversations.filter(c => c.id !== conversationId));
              // Also clean up chat messages
              const newChatMessages = { ...chatMessages };
              delete newChatMessages[conversationId];
              setChatMessages(newChatMessages);
            }}
          />
        );

      case 'students':
        return (
          <TutorStudentsScreen
            students={tutorMockStudents}
            onStudentClick={(studentId) => alert(`View student profile ${studentId}`)}
            onMessageStudent={(studentId) => alert(`Message student ${studentId}`)}
          />
        );

      case 'profile':
        return (
          <TutorProfileScreen
            tutorName="Kshitij"
            tutorInitial="K"
            role={userRole}
            onRoleChange={(role) => {
              setUserRole(role);
              if (role === 'student') {
                setActiveTab('home');
              }
            }}
            onEditProfile={() => setProfileScreen('edit-profile')}
            onEditCourses={() => setProfileScreen('my-courses')}
            onEditPricing={() => setProfileScreen('pricing-editor')}
            onEditAvailability={() => {
              setProfileScreen('availability-editor');
              setActiveTutorTab('profile');
            }}
            onSettings={() => setProfileScreen('settings')}
            onLogout={() => alert('Logout - Coming soon!')}
          />
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (userRole === 'tutor') {
      return renderTutorContent();
    }

    // Show notifications screen
    if (showNotifications) {
      return (
        <NotificationsScreen
          notifications={notifications}
          onBack={() => setShowNotifications(false)}
          onNotificationClick={(notification) => {
            setNotifications(notifications.map(n => 
              n.id === notification.id ? { ...n, isUnread: false } : n
            ));
            setShowNotifications(false);
            // Navigate to relevant screen based on notification type
            if (notification.type === 'accepted' || notification.type === 'reminder') {
              setActiveTab('bookings');
            }
          }}
          onMarkAllRead={() => {
            setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="pb-4">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground px-4 pt-12 pb-8 rounded-b-3xl mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>Welcome back,</p>
                  <h1 className="mt-1">Kshitij</h1>
                </div>
                <button 
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors relative"
                  onClick={() => {
                    setShowNotifications(true);
                    // Mark all notifications as read when opening the panel
                    setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
                  }}
                >
                  <Bell className="w-6 h-6" />
                  {notifications.filter(n => n.isUnread).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span
                        className="text-white"
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-bold)',
                        }}
                      >
                        {notifications.filter(n => n.isUnread).length}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* My Courses Filter */}
            <div className="px-4 mb-6 relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground">My Courses</h3>
                <div className="relative">
                  <button 
                    className="p-2 hover:bg-secondary rounded-lg transition-colors z-50 relative"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <SlidersHorizontal className="w-5 h-5 text-foreground" />
                    {/* Filter Count Badge */}
                    {activeFilterCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                        style={{ fontSize: '10px', fontWeight: 'var(--font-weight-semibold)' }}
                      >
                        {activeFilterCount}
                      </motion.div>
                    )}
                  </button>
                  
                  {/* Filter Dropdown - Absolutely positioned overlay */}
                  <AnimatePresence>
                    {showFilterDropdown && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="fixed inset-0 bg-black/20 z-40"
                          onClick={() => setShowFilterDropdown(false)}
                        />
                        
                        {/* Dropdown */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="fixed top-32 left-1/2 -translate-x-1/2 w-80 z-50"
                        >
                          <FilterDropdown 
                            onSelect={handleFilterSelect}
                            selectedFilters={activeFilters}
                          />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-3 pt-2 -mx-4 px-4 scrollbar-hide" style={{ clipPath: 'inset(0 -100vw -100vw -100vw)' }}>
                {myCourses.map((course) => (
                  <CourseChip
                    key={course}
                    code={course}
                    variant="large"
                    selected={selectedCourse === course}
                    onClick={() => setSelectedCourse(course === selectedCourse ? '' : course)}
                  />
                ))}
              </div>
            </div>

            {/* All Tutors */}
            <div className="px-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground">Available Tutors</h3>
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  {getFilteredTutors().length} tutors
                </span>
              </div>
              <div className="space-y-4">
                {getFilteredTutors().map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    name={tutor.name}
                    pronouns={tutor.pronouns}
                    courses={tutor.courses}
                    groupPrice={tutor.groupPrice}
                    individualPrice={tutor.individualPrice}
                    location={tutor.location}
                    nextAvailable={tutor.nextAvailable}
                    onClick={() => setSelectedTutorForDetail(tutor)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'chat':
        if (selectedConversationId) {
          const conversation = conversations.find((c) => c.id === selectedConversationId);
          const messages = chatMessages[selectedConversationId] || [];
          
          return (
            <IndividualChatScreen
              tutorName={conversation?.tutorName || ''}
              tutorInitial={conversation?.tutorInitial || ''}
              messages={messages}
              onBack={() => setSelectedConversationId(null)}
              onSendMessage={(message) => {
                const newMessage: Message = {
                  id: Date.now().toString(),
                  message,
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
                    ? { ...c, lastMessage: `You: ${message}`, timestamp: 'Just now', unreadCount: 0 }
                    : c
                ));
              }}
            />
          );
        }
        
        return (
          <ChatListScreen
            conversations={conversations}
            onConversationClick={(id) => {
              setSelectedConversationId(id);
              // Mark as read
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

      case 'bookings':
        return (
          <div className="px-4 pt-6 pb-4">
            {/* Header */}
            <h2 className="mb-6 text-center text-foreground">Schedule</h2>
            
            {/* Tabs for Bookings */}
            <Tabs
              variant="pill"
              tabs={[
                {
                  id: 'all',
                  title: 'All',
                  content: (
                    <div className="space-y-3">
                      {bookings.map((booking) => (
                        <BookingCard 
                          key={booking.id} 
                          {...booking}
                          onMessageTutor={booking.status === 'Confirmed' ? () => openChatWithTutor(booking.tutorName) : undefined}
                        />
                      ))}
                    </div>
                  )
                },
                {
                  id: 'upcoming',
                  title: 'Upcoming',
                  content: (
                    <div className="space-y-3">
                      {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').map((booking) => (
                        <BookingCard 
                          key={booking.id} 
                          {...booking}
                          onMessageTutor={booking.status === 'Confirmed' ? () => openChatWithTutor(booking.tutorName) : undefined}
                        />
                      ))}
                    </div>
                  )
                },
                {
                  id: 'past',
                  title: 'Past',
                  content: (
                    <div className="space-y-3">
                      {bookings.filter(b => b.status === 'Completed').map((booking) => (
                        <BookingCard 
                          key={booking.id} 
                          {...booking}
                        />
                      ))}
                      <BookingCard
                        tutorName="Emily Rodriguez"
                        tutorInitial="E"
                        course="SYSC 2006"
                        date="Nov 10, 2024"
                        time="3:00 PM"
                        location="Science Building"
                        sessionType="group"
                        price="18"
                        status="Completed"
                      />
                    </div>
                  )
                }
              ]}
              activeTabIndex={bookingTabIndex}
              onTabChange={setBookingTabIndex}
            />
          </div>
        );

      case 'profile':
        // Render profile screens based on profileScreen state
        switch (profileScreen) {
          case 'edit-profile':
            return (
              <EditProfileScreen
                name={userProfile.name}
                pronouns={userProfile.pronouns}
                year={userProfile.year}
                program={userProfile.program}
                bio={userProfile.bio}
                initial={userProfile.name.charAt(0)}
                isTutor={false}
                onBack={() => setProfileScreen('main')}
                onSave={(data) => {
                  setUserProfile({ ...userProfile, ...data });
                  setProfileScreen('main');
                  alert('Profile updated!');
                }}
              />
            );
          
          case 'my-courses':
            return (
              <MyCoursesScreen
                selectedCourses={userProfile.courses}
                isTutor={false}
                onBack={() => setProfileScreen('main')}
                onSave={(courses) => {
                  setUserProfile({ ...userProfile, courses });
                  setProfileScreen('main');
                  alert('Courses updated!');
                }}
              />
            );
          
          case 'notifications':
            return (
              <NotificationsScreen
                notifications={notifications}
                onBack={() => setProfileScreen('main')}
                onNotificationClick={(notification) => {
                  setNotifications(notifications.map(n => 
                    n.id === notification.id ? { ...n, isUnread: false } : n
                  ));
                  setProfileScreen('main');
                  if (notification.type === 'accepted' || notification.type === 'reminder') {
                    setActiveTab('bookings');
                  }
                }}
                onMarkAllRead={() => {
                  setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
                }}
              />
            );
          
          case 'settings':
            return (
              <SettingsScreen
                email={userProfile.email}
                isTutor={false}
                theme={theme}
                onBack={() => setProfileScreen('main')}
                onChangePassword={() => setProfileScreen('change-password')}
                onPrivacyPolicy={() => setProfileScreen('privacy-policy')}
                onTermsOfService={() => setProfileScreen('terms-of-service')}
                onThemeChange={(newTheme) => setTheme(newTheme)}
              />
            );
          
          case 'change-password':
            return (
              <ChangePasswordScreen
                onBack={() => setProfileScreen('settings')}
                onSave={(currentPassword, newPassword) => {
                  alert('Password changed successfully!');
                  setProfileScreen('settings');
                }}
              />
            );
          
          case 'privacy-policy':
            return (
              <PrivacyPolicyScreen
                onBack={() => setProfileScreen('main')}
              />
            );
          
          case 'terms-of-service':
            return (
              <TermsOfServiceScreen
                onBack={() => setProfileScreen('main')}
              />
            );
          
          case 'pricing-editor':
            return (
              <PricingEditorScreen
                courses={userProfile.courses}
                initialGroupPrice={15}
                initialIndividualPrice={28}
                onBack={() => setProfileScreen('main')}
                onSave={(data) => {
                  console.log('Pricing saved:', data);
                  alert('Pricing updated successfully!');
                  setProfileScreen('main');
                }}
              />
            );
          
          case 'availability-editor':
            return (
              <AvailabilityEditorScreen
                onBack={() => setProfileScreen('main')}
                onSave={(data) => {
                  console.log('Availability saved:', data);
                  alert('Availability updated successfully!');
                  setProfileScreen('main');
                }}
              />
            );
          
          case 'main':
          default:
            return (
              <StudentProfileScreen
                studentName={userProfile.name}
                studentInitial={userProfile.name.charAt(0)}
                role={userRole}
                onRoleChange={(role) => {
                  setUserRole(role);
                  if (role === 'tutor') {
                    setActiveTutorTab('home');
                  }
                }}
                onEditProfile={() => setProfileScreen('edit-profile')}
                onMyCourses={() => setProfileScreen('my-courses')}
                onSettings={() => setProfileScreen('settings')}
                onLogout={() => alert('Logout - Coming soon!')}
              />
            );
        }

      default:
        return null;
    }
  };

  // Onboarding render function
  const renderOnboarding = () => {
    switch (onboardingScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onGetStarted={() => setOnboardingScreen('role-selection')}
            onSignIn={() => setOnboardingScreen('sign-in')}
          />
        );

      case 'role-selection':
        return (
          <RoleSelectionScreen
            onBack={() => setOnboardingScreen('welcome')}
            onSelectRole={(role) => {
              setSelectedOnboardingRole(role);
              setOnboardingScreen('sign-up');
            }}
          />
        );

      case 'sign-up':
        return (
          <SignUpScreen
            role={selectedOnboardingRole || 'student'}
            onBack={() => setOnboardingScreen('role-selection')}
            onSignUp={(email, password) => {
              // Auto-accept logic
              if (selectedOnboardingRole === 'student') {
                setOnboardingScreen('student-course-selection');
              } else {
                setOnboardingScreen('tutor-course-application');
              }
            }}
            onSignInLink={() => setOnboardingScreen('sign-in')}
          />
        );

      case 'sign-in':
        return (
          <SignInScreen
            onBack={() => setOnboardingScreen('welcome')}
            onSignIn={(email, password) => {
              // Auto-accept - go directly to app
              setUserRole(selectedOnboardingRole || 'student');
              setIsOnboarding(false);
            }}
            onSignUpLink={() => setOnboardingScreen('role-selection')}
          />
        );

      // Student onboarding path
      case 'student-course-selection':
        return (
          <StudentCourseSelectionScreen
            onBack={() => setOnboardingScreen('sign-up')}
            onContinue={(courses) => {
              setOnboardingCourses(courses);
              setUserProfile({ ...userProfile, courses });
              setOnboardingScreen('student-profile-completion');
            }}
          />
        );

      case 'student-profile-completion':
        return (
          <StudentProfileCompletionScreen
            onBack={() => setOnboardingScreen('student-course-selection')}
            onContinue={(profileData) => {
              setUserProfile({ ...userProfile, ...profileData });
              setOnboardingScreen('student-success');
            }}
            onSkip={() => setOnboardingScreen('student-success')}
          />
        );

      case 'student-success':
        return (
          <StudentOnboardingSuccessScreen
            onComplete={() => {
              setUserRole('student');
              setShowTransitionToApp(true);
              // Delay to show the transition effect
              setTimeout(() => {
                setIsOnboarding(false);
              }, 100);
            }}
          />
        );

      // Tutor onboarding path
      case 'tutor-course-application':
        return (
          <TutorCourseApplicationScreen
            onBack={() => setOnboardingScreen('sign-up')}
            onContinue={(courses) => {
              setOnboardingCourses(courses);
              setUserProfile({ ...userProfile, courses });
              setOnboardingScreen('tutor-proof-upload');
            }}
          />
        );

      case 'tutor-proof-upload':
        return (
          <TutorProofUploadScreen
            courses={onboardingCourses}
            onBack={() => setOnboardingScreen('tutor-course-application')}
            onContinue={() => {
              setOnboardingScreen('tutor-pricing-setup');
            }}
          />
        );

      case 'tutor-pricing-setup':
        return (
          <TutorPricingSetupScreen
            courses={onboardingCourses}
            onBack={() => setOnboardingScreen('tutor-proof-upload')}
            onContinue={(pricing) => {
              // Save pricing data
              setOnboardingScreen('tutor-availability-setup');
            }}
          />
        );

      case 'tutor-availability-setup':
        return (
          <TutorAvailabilitySetupScreen
            onBack={() => setOnboardingScreen('tutor-pricing-setup')}
            onContinue={() => {
              setOnboardingScreen('tutor-success');
            }}
          />
        );

      case 'tutor-success':
        return (
          <TutorOnboardingSuccessScreen
            onComplete={() => {
              setUserRole('tutor');
              setShowTransitionToApp(true);
              // Delay to show the transition effect
              setTimeout(() => {
                setIsOnboarding(false);
                setActiveTutorTab('profile');
              }, 100);
            }}
          />
        );

      default:
        return null;
    }
  };

  // Show onboarding if needed
  if (isOnboarding) {
    return (
      <div className={`min-h-screen bg-background ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="max-w-md mx-auto bg-background min-h-screen relative">
          <div className="h-screen overflow-y-auto">
            <AnimatePresence mode="wait">
              <PageTransition keyProp={onboardingScreen}>
                {renderOnboarding()}
              </PageTransition>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-md mx-auto bg-background min-h-screen relative">
        {/* Main content */}
        <div className="h-screen pb-24 overflow-y-auto">
          <OnboardingToAppTransition show={showTransitionToApp}>
            {renderContent()}
          </OnboardingToAppTransition>
        </div>

        {/* Navigation - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
          {userRole === 'tutor' ? (
            <TutorNavigationTabs 
              activeTab={activeTutorTab} 
              onTabChange={(tab) => {
                setActiveTutorTab(tab);
                setShowNotifications(false);
              }}
              unreadCount={conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            />
          ) : (
            <NavigationTabs 
              activeTab={activeTab} 
              onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab !== 'chat') {
                  setSelectedConversationId(null);
                }
                setShowNotifications(false);
              }}
              unreadCount={conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            />
          )}
        </div>

        {/* Tutor Detail Modal */}
        {selectedTutorForDetail && (
          <TutorDetailModal
            isOpen={!!selectedTutorForDetail}
            onClose={() => setSelectedTutorForDetail(null)}
            tutorName={selectedTutorForDetail.name}
            pronouns={selectedTutorForDetail.pronouns}
            courses={selectedTutorForDetail.courses}
            groupPrice={selectedTutorForDetail.groupPrice}
            individualPrice={selectedTutorForDetail.individualPrice}
            location={selectedTutorForDetail.location}
            bio={selectedTutorForDetail.bio}
            onMessageTutor={() => {
              openChatWithTutor(selectedTutorForDetail.name);
              setSelectedTutorForDetail(null);
            }}
            onBookSession={(date, timeSlot) => {
              // Create booking details for confirmation
              const formatDate = (d: Date) => {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                if (d.toDateString() === today.toDateString()) return 'Today';
                if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
                
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              };

              // Use the actual time slot's location, not the tutor's general preference
              const locationDetails = timeSlot.location === 'online' 
                ? 'Online via Zoom' 
                : 'Science Building, Room 3110';

              setBookingToConfirm({
                tutorName: selectedTutorForDetail.name,
                tutorInitial: selectedTutorForDetail.name.charAt(0),
                course: selectedTutorForDetail.courses[0],
                date: formatDate(date),
                time: timeSlot.time,
                sessionType: timeSlot.type,
                price: timeSlot.price,
                location: timeSlot.location, // Use the slot's actual location
                locationDetails: locationDetails,
                spotsLeft: timeSlot.spotsLeft,
                totalSpots: timeSlot.totalSpots,
              });
              setSelectedTutorForDetail(null);
            }}
          />
        )}

        {/* Booking Confirmation Screen */}
        {bookingToConfirm && (
          <BookingConfirmationScreen
            isOpen={!!bookingToConfirm}
            onClose={() => setBookingToConfirm(null)}
            booking={bookingToConfirm}
            onConfirm={() => {
              // Create new booking
              const newBooking: Booking = {
                id: (bookings.length + 1).toString(),
                tutorName: bookingToConfirm.tutorName,
                tutorInitial: bookingToConfirm.tutorInitial,
                course: bookingToConfirm.course,
                date: bookingToConfirm.date,
                time: bookingToConfirm.time,
                location: bookingToConfirm.locationDetails,
                sessionType: bookingToConfirm.sessionType,
                price: bookingToConfirm.price,
                status: 'Pending'
              };
              setBookings([newBooking, ...bookings]);
              
              // Show success notification (in real app, this would come from backend when tutor accepts)
              const newNotification: Notification = {
                id: (notifications.length + 1).toString(),
                type: 'reminder',
                title: 'Booking Request Sent',
                message: `Your booking request has been sent to ${bookingToConfirm.tutorName}. You'll be notified once they accept.`,
                timestamp: 'Just now',
                isUnread: true,
                data: { bookingId: newBooking.id }
              };
              setNotifications([newNotification, ...notifications]);
              
              setBookingToConfirm(null);
              setActiveTab('bookings');
            }}
            onCancel={() => setBookingToConfirm(null)}
          />
        )}
      </div>
    </div>
  );
}