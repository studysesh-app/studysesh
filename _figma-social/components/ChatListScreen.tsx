import { ConversationItem } from './ConversationItem';
import { MessageSquare } from 'lucide-react';

export interface Conversation {
  id: string;
  tutorName: string;
  tutorInitial: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface ChatListScreenProps {
  conversations: Conversation[];
  onConversationClick: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

export function ChatListScreen({ conversations, onConversationClick, onDeleteConversation }: ChatListScreenProps) {
  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex-shrink-0">
        <h1
          className="text-center text-foreground"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Messages
        </h1>
      </header>

      {/* Conversations list or empty state */}
      {conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
            <MessageSquare size={40} className="text-muted-foreground" />
          </div>
          <h2
            className="text-foreground mb-2 text-center"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            No messages yet
          </h2>
          <p
            className="text-muted-foreground text-center max-w-xs"
            style={{
              fontSize: 'var(--text-sm)',
            }}
          >
            Start a conversation with a tutor to get help with your courses
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              tutorName={conversation.tutorName}
              tutorInitial={conversation.tutorInitial}
              lastMessage={conversation.lastMessage}
              timestamp={conversation.timestamp}
              unreadCount={conversation.unreadCount}
              onClick={() => onConversationClick(conversation.id)}
              onDelete={onDeleteConversation ? () => onDeleteConversation(conversation.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}