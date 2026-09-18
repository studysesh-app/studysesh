import { ArrowLeft, BellOff } from 'lucide-react';
import { NotificationItem, NotificationType } from './NotificationItem';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isUnread: boolean;
  data?: any;
}

interface NotificationsScreenProps {
  notifications: Notification[];
  onBack: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead?: () => void;
}

export function NotificationsScreen({
  notifications,
  onBack,
  onNotificationClick,
  onMarkAllRead,
}: NotificationsScreenProps) {
  const hasUnread = notifications.some((n) => n.isUnread);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full hover:bg-secondary/30 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        <h1
          className="flex-1 text-foreground"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Notifications
        </h1>
        {hasUnread && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="text-primary hover:text-primary-dark transition-colors"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            Mark all read
          </button>
        )}
      </header>

      {/* Notifications list or empty state */}
      {notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
          <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
            <BellOff size={40} className="text-muted-foreground" />
          </div>
          <h2
            className="text-foreground mb-2 text-center"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            No notifications
          </h2>
          <p
            className="text-muted-foreground text-center max-w-xs"
            style={{
              fontSize: 'var(--text-sm)',
            }}
          >
            You're all caught up! We'll notify you when there's something new.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-24">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              timestamp={notification.timestamp}
              isUnread={notification.isUnread}
              onClick={() => onNotificationClick(notification)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
