import { Home, MessageSquare, Calendar, User, LucideIcon } from 'lucide-react';
import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

type TabValue = 'home' | 'chat' | 'bookings' | 'profile';

interface TabConfig {
  value: TabValue;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

interface NavigationTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  unreadCount?: number;
}

interface AnimatedTabProps {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
  minWidth: number;
  maxWidth: number;
  badge?: number;
}

const ICON_SIZE = 24;

function AnimatedTab({ tab, isActive, onPress, minWidth, maxWidth, badge }: AnimatedTabProps) {
  const Icon = tab.icon;
  
  // Progress value that animates between 0 and 1
  const progress = useSpring(0, {
    damping: 20,
    stiffness: 400,
  });

  useEffect(() => {
    progress.set(isActive ? 1 : 0);
  }, [isActive, progress]);

  // Animate width between minWidth and maxWidth
  const width = useTransform(progress, [0, 1], [minWidth, maxWidth]);
  
  // Animate gap between icon and text
  const gap = useTransform(progress, [0, 1], [0, 20]);
  
  // Animate text opacity with cubic easing
  const textOpacity = useTransform(progress, (value) => Math.pow(value, 3));
  
  // Animate icon position from center to left
  const iconLeft = useTransform(
    progress,
    [0, 1],
    [(minWidth - ICON_SIZE) / 2, 16]
  );

  return (
    <motion.button
      onClick={onPress}
      style={{ width }}
      className="relative h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:brightness-105"
    >
      {/* Background styling */}
      {isActive ? (
        <motion.div 
          layoutId="nav-tab-bg"
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
            boxShadow: '0 4px 12px rgba(219, 35, 33, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        />
      ) : (
        <div 
          className="absolute inset-0 rounded-2xl bg-secondary/50"
        />
      )}
      
      {/* Unread badge */}
      {(badge ?? 0) > 0 && (
        <div 
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-20"
          style={{
            background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
            boxShadow: '0 2px 6px rgba(219, 35, 33, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <span
            className="text-white"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              textShadow: '0 1px 1px rgba(0, 0, 0, 0.3)',
            }}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-center w-full h-full relative">
        {/* Icon */}
        <motion.div
          style={{ left: iconLeft }}
          className="absolute flex items-center justify-center"
        >
          <Icon 
            className={`transition-colors ${isActive ? 'text-white' : 'text-muted-foreground'}`}
            size={ICON_SIZE}
            strokeWidth={2.5}
          />
        </motion.div>
        
        {/* Label */}
        <motion.span
          style={{ 
            opacity: textOpacity,
            marginLeft: gap,
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-semibold)',
            textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
          }}
          className={`z-10 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
        >
          {tab.label}
        </motion.span>
      </div>
    </motion.button>
  );
}

export function NavigationTabs({ activeTab, onTabChange, unreadCount = 0 }: NavigationTabsProps) {
  const tabs: TabConfig[] = [
    { value: 'home', icon: Home, label: 'Home' },
    { value: 'chat', icon: MessageSquare, label: 'Chat' },
    { value: 'bookings', icon: Calendar, label: 'Bookings' },
    { value: 'profile', icon: User, label: 'Profile' },
  ];

  // Calculate responsive widths
  const gap = 8;
  const paddingHorizontal = 12;
  const maxTabWidth = 140;
  
  // Calculate min width based on available space
  // This ensures all tabs fit perfectly in the container
  const minTabWidth = 60;

  return (
    <div className="bg-card border-t border-border px-3 py-3">
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        {tabs.map((tab) => (
          <AnimatedTab
            key={tab.value}
            tab={tab}
            isActive={activeTab === tab.value}
            onPress={() => onTabChange(tab.value)}
            minWidth={minTabWidth}
            maxWidth={maxTabWidth}
            badge={tab.value === 'chat' ? unreadCount : undefined}
          />
        ))}
      </div>
    </div>
  );
}