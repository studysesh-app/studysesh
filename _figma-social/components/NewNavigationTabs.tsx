import { Home, MessageSquare, Users, Bell, User as UserIcon, LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

type TabValue = 'home' | 'messages' | 'classmates' | 'activity' | 'profile';

interface TabConfig {
  value: TabValue;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

interface NewNavigationTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  unreadMessages?: number;
  unreadActivity?: number;
}

export function NewNavigationTabs({
  activeTab,
  onTabChange,
  unreadMessages = 0,
  unreadActivity = 0,
}: NewNavigationTabsProps) {
  const tabs: TabConfig[] = [
    { value: 'home', icon: Home, label: 'Home' },
    { value: 'messages', icon: MessageSquare, label: 'Messages', badge: unreadMessages },
    { value: 'classmates', icon: Users, label: 'Classmates' },
    { value: 'activity', icon: Bell, label: 'Activity', badge: unreadActivity > 0 ? unreadActivity : undefined },
    { value: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-end justify-around px-2 pt-2 pb-2 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          const isClassmates = tab.value === 'classmates';

          // Special styling for Classmates tab (like Windows Media Player blue button)
          if (isClassmates) {
            return (
              <motion.button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className="relative flex flex-col items-center justify-center"
                style={{ flex: '0 0 auto', width: '80px' }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Distinctive skeuomorphic button */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center relative transition-all ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                  style={{
                    background: isActive
                      ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)'
                      : 'linear-gradient(180deg, #f87171 0%, #ef4444 50%, #dc2626 100%)',
                    boxShadow: isActive
                      ? '0 8px 24px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.2)'
                      : '0 6px 16px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Icon className="w-7 h-7 text-white drop-shadow-md" />
                </div>
                
                <span
                  className={`mt-1 text-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                  }}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          }

          // Regular tabs
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className="relative flex flex-col items-center justify-center gap-1.5 px-3 py-2 min-w-[60px]"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                {tab.badge && tab.badge > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary flex items-center justify-center">
                    <span
                      className="text-primary-foreground"
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  </div>
                )}
              </div>
              <span
                className={`text-center transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                style={{
                  fontSize: '0.65rem',
                  fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                }}
              >
                {tab.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}