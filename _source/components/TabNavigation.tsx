import { useState } from 'react';
import { Tabs, TabData } from './Tabs';
import { TutorCard } from './TutorCard';
import { BookingCard } from './BookingCard';
import { SessionBadge } from './SessionBadge';
import { PricingBubble } from './PricingBubble';
import { Star, TrendingUp, Clock } from 'lucide-react';

export function TabNavigation() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Mock data for tutors
  const topTutors = [
    {
      name: 'Sarah Chen',
      courses: ['SYSC 2006', 'COMP 2402'],
      rating: 4.9,
      reviewCount: 127,
      groupPrice: '15',
      individualPrice: '35',
      nextAvailable: '2h 15m'
    },
    {
      name: 'Marcus Johnson',
      courses: ['MATH 1004', 'PHYS 1004'],
      rating: 4.8,
      reviewCount: 89,
      groupPrice: '12',
      individualPrice: '30',
      nextAvailable: 'Tomorrow 2pm'
    }
  ];

  const newTutors = [
    {
      name: 'Emily Rodriguez',
      courses: ['CHEM 1001'],
      rating: 5.0,
      reviewCount: 23,
      groupPrice: '18',
      individualPrice: '40',
      nextAvailable: '4h 30m'
    },
    {
      name: 'David Park',
      courses: ['ELEC 2507'],
      rating: 4.7,
      reviewCount: 15,
      groupPrice: '14',
      individualPrice: '32',
      nextAvailable: '1h 45m'
    }
  ];

  const TABS_DATA: TabData[] = [
    {
      id: 'top-rated',
      title: '⭐ Top Rated',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              Best performing tutors this month
            </p>
          </div>
          {topTutors.map((tutor) => (
            <TutorCard key={tutor.name} {...tutor} />
          ))}
        </div>
      )
    },
    {
      id: 'new-tutors',
      title: '🎓 New Tutors',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              Fresh talent ready to help
            </p>
          </div>
          {newTutors.map((tutor) => (
            <TutorCard key={tutor.name} {...tutor} />
          ))}
        </div>
      )
    },
    {
      id: 'available-now',
      title: '⚡ Available Now',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              Tutors available within the next hour
            </p>
          </div>
          {topTutors.slice(0, 1).map((tutor) => (
            <TutorCard key={tutor.name} {...tutor} />
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <Tabs
        tabs={TABS_DATA}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        variant="default"
        size="md"
      />
    </div>
  );
}

// Demo component showing all variants
export function TabNavigationDemo() {
  const [defaultTabIndex, setDefaultTabIndex] = useState(0);
  const [pillTabIndex, setPillTabIndex] = useState(0);
  const [underlineTabIndex, setUnderlineTabIndex] = useState(0);

  const demoTabs: TabData[] = [
    {
      id: 'all',
      title: 'All Sessions',
      content: (
        <div className="space-y-3">
          <BookingCard
            tutorName="Sarah Chen"
            course="SYSC 2006"
            date="Nov 18, 2024"
            time="2:00 PM"
            location="Library Room 204"
            sessionType="individual"
            price="35"
            status="Confirmed"
          />
          <BookingCard
            tutorName="Marcus Johnson"
            course="MATH 1004"
            date="Nov 20, 2024"
            time="4:30 PM"
            location="Engineering Building"
            sessionType="group"
            price="12"
            status="Pending"
          />
        </div>
      )
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      content: (
        <div className="space-y-3">
          <BookingCard
            tutorName="Sarah Chen"
            course="SYSC 2006"
            date="Nov 18, 2024"
            time="2:00 PM"
            location="Library Room 204"
            sessionType="individual"
            price="35"
            status="Confirmed"
          />
        </div>
      )
    },
    {
      id: 'completed',
      title: 'Completed',
      content: (
        <div className="space-y-3">
          <BookingCard
            tutorName="Emily Rodriguez"
            course="CHEM 1001"
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
  ];

  const statusTabs: TabData[] = [
    {
      id: 'pending',
      title: 'Pending',
      content: (
        <div className="p-4 bg-status-pending/20 rounded-xl border border-status-pending">
          <SessionBadge status="Pending" />
          <p className="mt-2" style={{ fontSize: 'var(--text-sm)' }}>Waiting for tutor confirmation</p>
        </div>
      )
    },
    {
      id: 'confirmed',
      title: 'Confirmed',
      content: (
        <div className="p-4 bg-status-confirmed/20 rounded-xl border border-status-confirmed">
          <SessionBadge status="Confirmed" />
          <p className="mt-2" style={{ fontSize: 'var(--text-sm)' }}>Your session is confirmed!</p>
        </div>
      )
    },
    {
      id: 'completed',
      title: 'Completed',
      content: (
        <div className="p-4 bg-status-completed/20 rounded-xl border border-status-completed">
          <SessionBadge status="Completed" />
          <p className="mt-2" style={{ fontSize: 'var(--text-sm)' }}>Session completed successfully</p>
        </div>
      )
    }
  ];

  const pricingTabs: TabData[] = [
    {
      id: 'group',
      title: 'Group Sessions',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PricingBubble type="group" price="12-18" />
            <span style={{ fontSize: 'var(--text-sm)' }}>per student</span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)' }} className="text-muted-foreground">
            Group sessions with 3-10 students. Great for collaborative learning and making new friends!
          </p>
        </div>
      )
    },
    {
      id: 'individual',
      title: '1-on-1 Sessions',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PricingBubble type="individual" price="30-40" />
            <span style={{ fontSize: 'var(--text-sm)' }}>per hour</span>
          </div>
          <p style={{ fontSize: 'var(--text-sm)' }} className="text-muted-foreground">
            One-on-one personalized tutoring sessions. Get focused attention and customized learning.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Default Variant */}
      <div>
        <h3 className="mb-4">Default Tabs</h3>
        <Tabs
          tabs={demoTabs}
          activeTabIndex={defaultTabIndex}
          setActiveTabIndex={setDefaultTabIndex}
          variant="default"
          size="md"
        />
      </div>

      {/* Pill Variant */}
      <div>
        <h3 className="mb-4">Pill Tabs</h3>
        <Tabs
          tabs={statusTabs}
          activeTabIndex={pillTabIndex}
          setActiveTabIndex={setPillTabIndex}
          variant="pill"
          size="md"
        />
      </div>

      {/* Underline Variant */}
      <div>
        <h3 className="mb-4">Underline Tabs</h3>
        <Tabs
          tabs={pricingTabs}
          activeTabIndex={underlineTabIndex}
          setActiveTabIndex={setUnderlineTabIndex}
          variant="underline"
          size="md"
        />
      </div>
    </div>
  );
}
