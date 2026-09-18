interface MessageBubbleProps {
  message: string;
  timestamp: string;
  isStudent: boolean;
  status?: 'sent' | 'delivered' | 'read';
  isTutorView?: boolean; // New prop to determine perspective
}

export function MessageBubble({
  message,
  timestamp,
  isStudent,
  status,
  isTutorView = false,
}: MessageBubbleProps) {
  // Determine if this message is from the current user
  // In student view: current user is student (isStudent === true means "my message")
  // In tutor view: current user is tutor (isStudent === false means "my message")
  const isMyMessage = isTutorView ? !isStudent : isStudent;

  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isMyMessage
              ? 'bg-[#500908] text-white rounded-br-sm'
              : 'bg-secondary/50 text-foreground rounded-bl-sm'
          }`}
        >
          <p
            style={{
              fontSize: 'var(--text-base)',
              lineHeight: '1.5',
            }}
          >
            {message}
          </p>
        </div>
        <div className="flex items-center gap-2 px-1">
          <span
            className="text-muted-foreground"
            style={{
              fontSize: 'var(--text-xs)',
            }}
          >
            {timestamp}
          </span>
          {isMyMessage && status && (
            <span
              className="text-muted-foreground"
              style={{
                fontSize: 'var(--text-xs)',
              }}
            >
              • {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}