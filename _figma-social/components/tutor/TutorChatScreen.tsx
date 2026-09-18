import { useState } from 'react';
import { Users } from 'lucide-react';
import { TutorStudentsScreen } from './TutorStudentsScreen';
import { ChatListScreen, Conversation } from '../ChatListScreen';
import { IndividualChatScreen, Message } from '../IndividualChatScreen';

interface Student {
  id: string;
  name: string;
  initial: string;
  courses: string[];
  sessionsCount: number;
  lastSession?: string;
}

interface TutorChatScreenProps {
  students: Student[];
  conversations: Conversation[];
  chatMessages: Record<string, Message[]>;
  selectedConversationId: string | null;
  onStudentClick: (studentId: string) => void;
  onMessageStudent: (studentId: string) => void;
  onConversationClick: (id: string) => void;
  onSendMessage: (message: string) => void;
  onBackFromChat: () => void;
  onDeleteConversation?: (conversationId: string) => void;
}

export function TutorChatScreen({
  students,
  conversations,
  chatMessages,
  selectedConversationId,
  onStudentClick,
  onMessageStudent,
  onConversationClick,
  onSendMessage,
  onBackFromChat,
  onDeleteConversation,
}: TutorChatScreenProps) {
  const [showStudentsList, setShowStudentsList] = useState(false);

  // If a conversation is selected, show individual chat
  if (selectedConversationId) {
    const conversation = conversations.find((c) => c.id === selectedConversationId);
    const messages = chatMessages[selectedConversationId] || [];
    
    return (
      <IndividualChatScreen
        tutorName={conversation?.tutorName || ''}
        tutorInitial={conversation?.tutorInitial || ''}
        messages={messages}
        onBack={onBackFromChat}
        onSendMessage={onSendMessage}
        isTutorView={true}
      />
    );
  }

  // Show students list or chat list based on toggle
  if (showStudentsList) {
    return (
      <div>
        {/* Toggle Button */}
        <div className="px-4 pt-6 pb-2">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowStudentsList(false)}
              className="flex-1 py-2 px-4 rounded-full border border-border hover:bg-secondary transition-colors text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Recent Chats
            </button>
            <button
              onClick={() => setShowStudentsList(true)}
              className="flex-1 py-2 px-4 rounded-full bg-primary text-primary-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              All Students
            </button>
          </div>
        </div>
        
        <div className="px-4">
          <h2 className="mb-6 text-foreground">Your Students</h2>
        </div>
        
        <TutorStudentsScreen
          students={students}
          onStudentClick={onStudentClick}
          onMessageStudent={onMessageStudent}
        />
      </div>
    );
  }

  // Show chat list
  return (
    <div>
      {/* Toggle Button */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowStudentsList(false)}
            className="flex-1 py-2 px-4 rounded-full bg-primary text-primary-foreground"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Recent Chats
          </button>
          <button
            onClick={() => setShowStudentsList(true)}
            className="flex-1 py-2 px-4 rounded-full border border-border hover:bg-secondary transition-colors text-foreground"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            All Students
          </button>
        </div>
      </div>

      {conversations.length > 0 ? (
        <ChatListScreen
          conversations={conversations}
          onConversationClick={onConversationClick}
          onDeleteConversation={onDeleteConversation}
        />
      ) : (
        <div className="px-4">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-sm)' }}>
              No messages yet
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              Message your students from the "All Students" tab
            </p>
          </div>
        </div>
      )}
    </div>
  );
}