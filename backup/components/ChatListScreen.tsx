import { View, Text, ScrollView } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { ConversationItem } from './ConversationItem';

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
        <View className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
            >
                <Text className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                    Messages
                </Text>

                {conversations.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <View className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                            <MessageSquare size={40} color="#9ca3af" />
                        </View>
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                            No messages yet
                        </Text>
                        <Text className="text-sm text-gray-500 text-center max-w-xs">
                            Start a conversation with a tutor to get help with your courses
                        </Text>
                    </View>
                ) : (
                    <View>
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
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
