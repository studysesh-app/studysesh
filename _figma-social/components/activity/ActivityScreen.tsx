import { Bell, Calendar, MessageCircle, UserPlus, Heart, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export interface ActivityItem {
  id: string;
  type: 'connection' | 'message' | 'like' | 'comment' | 'tutor-request' | 'tutor-accepted';
  title: string;
  message: string;
  timestamp: string;
  isUnread: boolean;
  data?: any;
}

interface ActivityScreenProps {
  activities: ActivityItem[];
  onActivityClick: (activity: ActivityItem) => void;
  onMarkAllRead: () => void;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'connection':
      return UserPlus;
    case 'message':
      return MessageCircle;
    case 'like':
      return Heart;
    case 'comment':
      return MessageCircle;
    case 'tutor-request':
      return Calendar;
    case 'tutor-accepted':
      return CheckCircle;
    default:
      return Bell;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'connection':
      return 'text-blue-500 bg-blue-500/10';
    case 'message':
      return 'text-green-500 bg-green-500/10';
    case 'like':
      return 'text-pink-500 bg-pink-500/10';
    case 'comment':
      return 'text-purple-500 bg-purple-500/10';
    case 'tutor-request':
    case 'tutor-accepted':
      return 'text-primary bg-primary/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export function ActivityScreen({
  activities,
  onActivityClick,
  onMarkAllRead,
}: ActivityScreenProps) {
  const unreadCount = activities.filter((a) => a.isUnread).length;

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h1>Activity</h1>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-primary hover:underline"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Mark all read
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activities.length > 0 ? (
          <div className="divide-y divide-border">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <motion.button
                  key={activity.id}
                  onClick={() => onActivityClick(activity)}
                  className={`w-full p-4 hover:bg-muted/50 transition-colors text-left ${
                    activity.isUnread ? 'bg-primary/5' : ''
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className="truncate"
                          style={{ fontWeight: activity.isUnread ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
                        >
                          {activity.title}
                        </h3>
                        <span
                          className="text-muted-foreground flex-shrink-0"
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          {activity.timestamp}
                        </span>
                      </div>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        {activity.message}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {activity.isUnread && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground mb-2">
              No activity yet
            </p>
            <p className="text-center text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              You'll see notifications here when students connect with you or interact with your posts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
