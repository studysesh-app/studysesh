import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';

export type NotificationType = 'accepted' | 'declined' | 'reminder' | 'message';

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isUnread?: boolean;
  onClick: () => void;
}

export function NotificationItem({
  type,
  title,
  message,
  timestamp,
  isUnread = false,
  onClick,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'accepted':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'declined':
        return <XCircle size={20} className="text-red-600" />;
      case 'reminder':
        return <Clock size={20} className="text-blue-600" />;
      case 'message':
        return <MessageSquare size={20} className="text-primary" />;
      default:
        return <CheckCircle size={20} className="text-primary" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-4 hover:bg-secondary/30 transition-colors border-b border-border ${
        isUnread ? 'bg-primary/5' : ''
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3
            className="text-foreground truncate"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            {title}
          </h3>
          <span
            className="text-muted-foreground flex-shrink-0"
            style={{
              fontSize: 'var(--text-xs)',
            }}
          >
            {timestamp}
          </span>
        </div>
        <p
          className="text-muted-foreground"
          style={{
            fontSize: 'var(--text-sm)',
            lineHeight: '1.5',
          }}
        >
          {message}
        </p>
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </button>
  );
}
