import { useState } from 'react';
// New Onboarding imports
import { SplashScreen } from './components/onboarding/SplashScreen';
import { EmailVerificationScreen } from './components/onboarding/EmailVerificationScreen';
import { ProfileBasicsScreen } from './components/onboarding/ProfileBasicsScreen';
import { ProfilePromptsScreen } from './components/onboarding/ProfilePromptsScreen';
import { PrivacySettingsScreen } from './components/onboarding/PrivacySettingsScreen';
import { TutorSignupPromptScreen } from './components/onboarding/TutorSignupPromptScreen';
import { SimpleTutorSetupScreen } from './components/onboarding/SimpleTutorSetupScreen';
import { FinalCourseSelectionScreen } from './components/onboarding/FinalCourseSelectionScreen';

// Main App imports
import { HomeScreen } from './components/home/HomeScreen';
import { CourseDetailScreen } from './components/home/CourseDetailScreen';
import { PostDetailScreen } from './components/home/PostDetailScreen';
import { MessagesScreen } from './components/messages/MessagesScreen';
import { IndividualChatScreen, Message } from './components/IndividualChatScreen';
import { ClassmatesScreen, StudentProfile } from './components/classmates/ClassmatesScreen';
import { ActivityScreen, ActivityItem } from './components/activity/ActivityScreen';
import { StudentProfileScreen } from './components/StudentProfileScreen';
import { NewNavigationTabs } from './components/NewNavigationTabs';

// Profile imports
import { EditProfileScreen } from './components/profile/EditProfileScreen';
import { MyCoursesScreen } from './components/profile/MyCoursesScreen';
import { SettingsScreen } from './components/profile/SettingsScreen';

// Conversation type
import { Conversation } from './components/ChatListScreen';

type OnboardingScreen =
  | 'splash'
  | 'email-verification'
  | 'profile-basics'
  | 'profile-prompts'
  | 'privacy-settings'
  | 'tutor-signup-prompt'
  | 'tutor-setup'
  | 'course-selection';

type MainTab = 'home' | 'messages' | 'classmates' | 'activity' | 'profile';

type ProfileScreen = 'main' | 'edit-profile' | 'my-courses' | 'settings';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  pronouns: string;
  gender: string;
  yearOfStudy: string;
  major: string;
  prompts: Array<{ prompt: string; answer: string }>;
  courses: string[];
  limitVisibility: boolean;
  isTutor: boolean;
  tutorData?: {
    courses: string[];
    hourlyRate: number;
    availability: 'online' | 'in-person' | 'both';
  };
}

export default function App() {
  // Onboarding state
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [onboardingScreen, setOnboardingScreen] = useState<OnboardingScreen>('splash');
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});

  // Main app state
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Home screen state
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Messages state
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      tutorName: 'Sarah Chen',
      tutorInitial: 'S',
      lastMessage: 'Hey! Did you get the notes from today?',
      timestamp: '2h ago',
      unreadCount: 1,
    },
    {
      id: '2',
      tutorName: 'Marcus (Tutor)',
      tutorInitial: 'M',
      lastMessage: 'Sure, I can help with that topic.',
      timestamp: 'Yesterday',
      unreadCount: 0,
    },
  ]);
  
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        message: 'Hey! Did you get the notes from today?',
        timestamp: '2:30 PM',
        isStudent: false,
      },
    ],
    '2': [
      {
        id: '1',
        message: 'Hi! Can you help me with pointers in C?',
        timestamp: 'Yesterday 3:00 PM',
        isStudent: true,
        status: 'read',
      },
      {
        id: '2',
        message: 'Sure, I can help with that topic.',
        timestamp: 'Yesterday 3:15 PM',
        isStudent: false,
      },
    ],
  });

  // Classmates state
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([
    {
      id: '1',
      name: 'Emily Rodriguez',
      pronouns: 'she/her',
      yearOfStudy: '2nd Year',
      major: 'Computer Science',
      courses: ['COMP 2402', 'SYSC 2006', 'MATH 1004'],
      prompts: [
        { prompt: "I'll buy you coffee if...", answer: "you help me debug my code at 2am 😅" },
        { prompt: "I study best at...", answer: "the library with my noise-cancelling headphones on" },
        { prompt: "My go-to study snack is...", answer: "dark chocolate and green tea" },
      ],
    },
    {
      id: '2',
      name: 'Jordan Lee',
      pronouns: 'they/them',
      yearOfStudy: '3rd Year',
      major: 'Software Engineering',
      courses: ['SYSC 2006', 'ELEC 2507'],
      prompts: [
        { prompt: "I'm always down to...", answer: "form a study group for group projects!" },
        { prompt: "Best study spot on campus is...", answer: "4th floor MacOdrum, by the window" },
        { prompt: "After exams, you'll find me...", answer: "at the gym finally getting back in shape lol" },
      ],
    },
  ]);

  // Activity state
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'connection',
      title: 'New Connection',
      message: 'Sarah Chen connected with you',
      timestamp: '1h ago',
      isUnread: true,
    },
    {
      id: '2',
      type: 'like',
      title: 'Post Liked',
      message: 'Marcus liked your post in COMP 2402',
      timestamp: '3h ago',
      isUnread: true,
    },
    {
      id: '3',
      type: 'comment',
      title: 'New Comment',
      message: 'Emily commented on your question',
      timestamp: 'Yesterday',
      isUnread: false,
    },
  ]);

  // Profile screen state
  const [profileScreen, setProfileScreen] = useState<ProfileScreen>('main');

  // Mock course data
  const courses = [
    { id: '1', name: 'COMP 2402', activeDiscussions: 5, totalStudents: 234 },
    { id: '2', name: 'SYSC 2006', activeDiscussions: 8, totalStudents: 189 },
    { id: '3', name: 'MATH 1004', activeDiscussions: 3, totalStudents: 312 },
  ];

  // ===== ONBOARDING HANDLERS =====
  const handleSplashGetStarted = () => {
    setOnboardingScreen('email-verification');
  };

  const handleEmailVerified = (email: string) => {
    setUserProfile({ ...userProfile, email });
    setOnboardingScreen('profile-basics');
  };

  const handleProfileBasicsComplete = (data: any) => {
    setUserProfile({ ...userProfile, ...data });
    setOnboardingScreen('profile-prompts');
  };

  const handlePromptsComplete = (prompts: any[]) => {
    setUserProfile({ ...userProfile, prompts });
    
    // Skip privacy screen if user is Man
    if (userProfile.gender === 'Man') {
      setOnboardingScreen('tutor-signup-prompt');
    } else {
      setOnboardingScreen('privacy-settings');
    }
  };

  const handlePrivacyComplete = (limitVisibility: boolean) => {
    setUserProfile({ ...userProfile, limitVisibility });
    setOnboardingScreen('tutor-signup-prompt');
  };

  const handleTutorYes = () => {
    setOnboardingScreen('tutor-setup');
  };

  const handleTutorNo = () => {
    setUserProfile({ ...userProfile, isTutor: false });
    setOnboardingScreen('course-selection');
  };

  const handleTutorSetupComplete = (tutorData: any) => {
    setUserProfile({ 
      ...userProfile, 
      isTutor: true,
      tutorData,
    });
    setOnboardingScreen('course-selection');
  };

  const handleFinalCoursesComplete = (courses: string[]) => {
    setUserProfile({ ...userProfile, courses });
    setIsOnboarding(false);
  };

  // ===== MAIN APP HANDLERS =====
  const handleConnect = (profileId: string) => {
    const profile = studentProfiles.find(p => p.id === profileId);
    if (profile) {
      // Add to conversations
      const newConv: Conversation = {
        id: Date.now().toString(),
        tutorName: profile.name,
        tutorInitial: profile.name.charAt(0),
        lastMessage: '',
        timestamp: 'Just now',
        unreadCount: 0,
      };
      setConversations([newConv, ...conversations]);
      
      // Add activity
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: 'connection',
        title: 'New Connection',
        message: `You connected with ${profile.name}`,
        timestamp: 'Just now',
        isUnread: true,
      };
      setActivities([newActivity, ...activities]);
    }
  };

  // ===== RENDER =====
  
  if (isOnboarding) {
    switch (onboardingScreen) {
      case 'splash':
        return <SplashScreen onGetStarted={handleSplashGetStarted} />;
      
      case 'email-verification':
        return (
          <EmailVerificationScreen
            onBack={() => setOnboardingScreen('splash')}
            onVerify={handleEmailVerified}
            onSendCode={(email) => console.log('Send code to:', email)}
          />
        );
      
      case 'profile-basics':
        return (
          <ProfileBasicsScreen
            onBack={() => setOnboardingScreen('email-verification')}
            onContinue={handleProfileBasicsComplete}
          />
        );
      
      case 'profile-prompts':
        return (
          <ProfilePromptsScreen
            onBack={() => setOnboardingScreen('profile-basics')}
            onContinue={handlePromptsComplete}
          />
        );
      
      case 'privacy-settings':
        return (
          <PrivacySettingsScreen
            onBack={() => setOnboardingScreen('profile-prompts')}
            onContinue={handlePrivacyComplete}
            gender={userProfile.gender || ''}
          />
        );
      
      case 'tutor-signup-prompt':
        return (
          <TutorSignupPromptScreen
            onBack={() => {
              if (userProfile.gender === 'Man') {
                setOnboardingScreen('profile-prompts');
              } else {
                setOnboardingScreen('privacy-settings');
              }
            }}
            onYes={handleTutorYes}
            onNo={handleTutorNo}
          />
        );
      
      case 'tutor-setup':
        return (
          <SimpleTutorSetupScreen
            onBack={() => setOnboardingScreen('tutor-signup-prompt')}
            onComplete={handleTutorSetupComplete}
          />
        );
      
      case 'course-selection':
        return (
          <FinalCourseSelectionScreen
            onBack={() => {
              if (userProfile.isTutor) {
                setOnboardingScreen('tutor-setup');
              } else {
                setOnboardingScreen('tutor-signup-prompt');
              }
            }}
            onComplete={handleFinalCoursesComplete}
          />
        );
    }
  }

  // Main app
  const renderMainContent = () => {
    // Individual chat view
    if (selectedConversationId) {
      const conversation = conversations.find(c => c.id === selectedConversationId);
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
              timestamp: 'Just now',
              isStudent: true,
            };
            setChatMessages({
              ...chatMessages,
              [selectedConversationId]: [...messages, newMessage],
            });
            
            // Update conversation
            setConversations(conversations.map(c =>
              c.id === selectedConversationId
                ? { ...c, lastMessage: message, timestamp: 'Just now' }
                : c
            ));
          }}
        />
      );
    }

    // Course detail view
    if (selectedCourseId) {
      return (
        <CourseDetailScreen
          courseName={courses.find(c => c.id === selectedCourseId)?.name || ''}
          onBack={() => setSelectedCourseId(null)}
          onPostClick={(postId) => console.log('Post clicked:', postId)}
          onAuthorClick={(authorId) => console.log('Author clicked:', authorId)}
          onTutorsClick={() => console.log('Tutors clicked')}
        />
      );
    }

    // Profile sub-screens
    if (activeTab === 'profile' && profileScreen !== 'main') {
      switch (profileScreen) {
        case 'edit-profile':
          return (
            <EditProfileScreen
              name={`${userProfile.firstName} ${userProfile.lastName}`}
              pronouns={userProfile.pronouns || ''}
              year={userProfile.yearOfStudy || ''}
              program={userProfile.major || ''}
              bio=""
              initial={userProfile.firstName?.charAt(0) || 'U'}
              isTutor={userProfile.isTutor || false}
              onBack={() => setProfileScreen('main')}
              onSave={(data) => {
                console.log('Profile updated:', data);
                setProfileScreen('main');
              }}
            />
          );
        
        case 'my-courses':
          return (
            <MyCoursesScreen
              selectedCourses={userProfile.courses || []}
              isTutor={false}
              onBack={() => setProfileScreen('main')}
              onSave={(courses) => {
                setUserProfile({ ...userProfile, courses });
                setProfileScreen('main');
              }}
            />
          );
        
        case 'settings':
          return (
            <SettingsScreen
              email={userProfile.email || ''}
              isTutor={false}
              theme={theme}
              onBack={() => setProfileScreen('main')}
              onChangePassword={() => console.log('Change password')}
              onPrivacyPolicy={() => console.log('Privacy policy')}
              onTermsOfService={() => console.log('Terms')}
              onThemeChange={setTheme}
            />
          );
      }
    }

    // Main tabs
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            userName={userProfile.firstName || 'Student'}
            courses={courses}
            onCourseClick={setSelectedCourseId}
            onNotificationsClick={() => setActiveTab('activity')}
            unreadNotifications={activities.filter(a => a.isUnread).length}
          />
        );
      
      case 'messages':
        return (
          <MessagesScreen
            conversations={conversations}
            onConversationClick={setSelectedConversationId}
          />
        );
      
      case 'classmates':
        return (
          <ClassmatesScreen
            profiles={studentProfiles}
            onConnect={handleConnect}
            onProfileView={(id) => console.log('View profile:', id)}
          />
        );
      
      case 'activity':
        return (
          <ActivityScreen
            activities={activities}
            onActivityClick={(activity) => {
              setActivities(activities.map(a =>
                a.id === activity.id ? { ...a, isUnread: false } : a
              ));
              console.log('Activity clicked:', activity);
            }}
            onMarkAllRead={() => {
              setActivities(activities.map(a => ({ ...a, isUnread: false })));
            }}
          />
        );
      
      case 'profile':
        return (
          <StudentProfileScreen
            name={`${userProfile.firstName} ${userProfile.lastName}`}
            pronouns={userProfile.pronouns || ''}
            year={userProfile.yearOfStudy || ''}
            program={userProfile.major || ''}
            bio=""
            initial={userProfile.firstName?.charAt(0) || 'U'}
            onEditProfile={() => setProfileScreen('edit-profile')}
            onMyCourses={() => setProfileScreen('my-courses')}
            onNotifications={() => setActiveTab('activity')}
            onSettings={() => setProfileScreen('settings')}
            onAbout={() => console.log('About')}
            onSignOut={() => {
              setIsOnboarding(true);
              setOnboardingScreen('splash');
            }}
          />
        );
    }
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="h-screen overflow-hidden">
        {renderMainContent()}
        
        {/* Bottom Navigation - only show when not in sub-screens */}
        {!selectedConversationId && !selectedCourseId && profileScreen === 'main' && (
          <NewNavigationTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setProfileScreen('main');
            }}
            unreadMessages={conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            unreadActivity={activities.filter(a => a.isUnread).length}
          />
        )}
      </div>
    </div>
  );
}