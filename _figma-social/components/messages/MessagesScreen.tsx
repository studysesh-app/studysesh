import { useState } from 'react';
import { Search, GraduationCap } from 'lucide-react';
import { ConversationItem } from '../ConversationItem';
import { Conversation } from '../ChatListScreen';

interface MessagesScreenProps {
  conversations: Conversation[];
  onConversationClick: (conversationId: string) => void;
}

export function MessagesScreen({
  conversations,
  onConversationClick,
}: MessagesScreenProps) {
  const [showTutorsOnly, setShowTutorsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data to distinguish tutors - in real app this would come from conversation metadata
  const tutorIds = ['2', '5']; // Example: these conversation IDs are with tutors

  const filteredConversations = conversations.filter((conv) => {
    // Filter by tutor status
    if (showTutorsOnly && !tutorIds.includes(conv.id)) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      return conv.tutorName.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="mb-6">Messages</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-input-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>

        {/* Tutor Filter Toggle */}
        <button
          onClick={() => setShowTutorsOnly(!showTutorsOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            showTutorsOnly
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Tutors Only</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onClick={() => onConversationClick(conversation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full -mt-20">
            <p className="text-muted-foreground text-center mb-2">
              {showTutorsOnly
                ? 'No tutor conversations yet'
                : searchQuery
                ? 'No messages found'
                : 'No conversations yet'}
            </p>
            <p className="text-muted-foreground text-center" style={{ fontSize: 'var(--text-sm)' }}>
              {showTutorsOnly
                ? 'Start a conversation with a tutor from your courses'
                : 'Connect with students and start chatting!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
