import { View, Text, ScrollView } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { ConversationItem } from '../ConversationItem';
import { IndividualChatScreen, Message } from '../IndividualChatScreen';

interface Student {
    id: string;
    name: string;
    initial: string;
    courses: string[];
    sessionsCount: number;
    lastSession?: string;
}

interface Conversation {
    id: string;
    tutorName: string;
    tutorInitial: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
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

    // Recent Chats content
    const renderRecentChats = () => {
        if (conversations.length === 0) {
            return (
                <View className="items-center justify-center px-6 py-12">
                    <View className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                        <MessageSquare size={40} color="#9ca3af" />
                    </View>
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        No messages yet
                    </Text>
                    <Text className="text-sm text-gray-500 text-center max-w-xs">
                        Find students in Bookings to start a chat
                    </Text>
                </View>
            );
        }

        return (
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
            </ScrollView>
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-6">
            <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    Messages
                </Text>
            </View>
            {renderRecentChats()}
        </View>
    );
}

