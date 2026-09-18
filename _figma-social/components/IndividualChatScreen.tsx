import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ArrowLeft, User } from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface Message {
  id: string;
  message: string;
  timestamp: string;
  isStudent: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface IndividualChatScreenProps {
  tutorName: string;
  tutorInitial: string;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (message: string) => void;
  onViewProfile?: () => void;
  isTutorView?: boolean; // New prop to indicate if this is the tutor viewing
}

export function IndividualChatScreen({
  tutorName,
  tutorInitial,
  messages,
  onBack,
  onSendMessage,
  onViewProfile,
  isTutorView,
}: IndividualChatScreenProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom only when user sends a new message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only auto-scroll if the last message is from the student
      if (lastMessage.isStudent) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full hover:bg-secondary/30 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        
        <div className="flex-1 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-[#500908] flex items-center justify-center text-white flex-shrink-0"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            {tutorInitial}
          </div>
          <h1
            className="text-foreground"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            {tutorName}
          </h1>
        </div>

        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="px-3 py-1.5 rounded-full bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <span
              className="text-primary"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              View Profile
            </span>
          </button>
        )}
      </header>

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-auto px-4">
        <div className="max-w-2xl mx-auto py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-3">
                <User size={28} className="text-muted-foreground" />
              </div>
              <p
                className="text-muted-foreground text-center"
                style={{
                  fontSize: 'var(--text-sm)',
                }}
              >
                Start your conversation with {tutorName}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg.message}
                  timestamp={msg.timestamp}
                  isStudent={msg.isStudent}
                  status={msg.status}
                  isTutorView={isTutorView}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input area - Fixed at bottom */}
      <div className="bg-background border-t border-border flex-shrink-0">
        <ChatInput onSend={onSendMessage} />
      </div>
    </div>
  );
}