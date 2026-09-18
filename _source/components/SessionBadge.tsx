type SessionStatus = 'Pending' | 'Confirmed' | 'Completed';

interface SessionBadgeProps {
  status: SessionStatus;
  size?: 'sm' | 'md';
}

export function SessionBadge({ status, size = 'md' }: SessionBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Pending':
        return 'bg-status-pending text-status-pending-foreground';
      case 'Confirmed':
        return 'bg-status-confirmed text-status-confirmed-foreground';
      case 'Completed':
        return 'bg-status-completed text-status-completed-foreground';
    }
  };

  return (
    <div
      className={`
        inline-flex items-center justify-center px-2.5 rounded-full
        ${getStatusStyles()}
        ${size === 'sm' ? 'py-0.5' : 'py-1'}
      `}
    >
      <span style={{ 
        fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)', 
        fontWeight: 'var(--font-weight-medium)' 
      }}>
        {status}
      </span>
    </div>
  );
}
