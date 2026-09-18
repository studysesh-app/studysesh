import { useState, useRef, useEffect } from 'react';

interface ConversationItemProps {
  tutorName: string;
  tutorInitial: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  onClick: () => void;
  onDelete?: () => void;
}

export function ConversationItem({
  tutorName,
  tutorInitial,
  lastMessage,
  timestamp,
  unreadCount = 0,
  onClick,
  onDelete,
}: ConversationItemProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const deleteThreshold = -150; // Pixels to drag left to delete

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Only allow left swipe (negative values)
    if (diff < 0) {
      // Add elastic resistance as you drag further
      const resistance = Math.abs(diff) > 100 ? 0.3 : 0.8;
      setDragOffset(diff * resistance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // If dragged past threshold, delete
    if (dragOffset < deleteThreshold && onDelete) {
      // Animate out fully
      setDragOffset(-400);
      setTimeout(() => {
        onDelete();
      }, 300);
    } else {
      // Snap back
      setDragOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    
    if (diff < 0) {
      const resistance = Math.abs(diff) > 100 ? 0.3 : 0.8;
      setDragOffset(diff * resistance);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (dragOffset < deleteThreshold && onDelete) {
      setDragOffset(-400);
      setTimeout(() => {
        onDelete();
      }, 300);
    } else {
      setDragOffset(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX, dragOffset]);

  const handleClick = () => {
    if (Math.abs(dragOffset) < 5) {
      onClick();
    }
  };

  const opacity = Math.max(0, 1 + dragOffset / 200);

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Delete background */}
      <div className="absolute inset-0 bg-primary flex items-center justify-end px-6">
        <span
          className="text-white"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
            opacity: Math.min(1, Math.abs(dragOffset) / 100),
          }}
        >
          Delete
        </span>
      </div>

      {/* Conversation item */}
      <div
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          opacity,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        className="bg-background"
      >
        <button
          onClick={handleClick}
          className="w-full flex items-start gap-3 px-4 py-4 hover:bg-secondary/30 transition-colors border-b border-border"
        >
          {/* Avatar with unread badge */}
          <div className="relative flex-shrink-0">
            <div
              className="w-12 h-12 rounded-full bg-[#500908] flex items-center justify-center text-white"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              {tutorInitial}
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span
                  className="text-white"
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span
                className="text-foreground truncate"
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                {tutorName}
              </span>
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
              className="text-muted-foreground line-clamp-2"
              style={{
                fontSize: 'var(--text-sm)',
              }}
            >
              {lastMessage}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}