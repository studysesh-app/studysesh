import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { ConversationItem } from './ConversationItem';
import { useState } from 'react';

export interface Conversation {
    id: string;
    tutorName: string;
    tutorInitial: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    type?: 'tutor' | 'student'; // Add type field
}

interface ChatListScreenProps {
    conversations: Conversation[];
    onConversationClick: (conversationId: string) => void;
    onDeleteConversation?: (conversationId: string) => void;
    isDarkMode?: boolean;
    isTutor?: boolean; // Add isTutor prop
}

export function ChatListScreen({ conversations, onConversationClick, onDeleteConversation, isDarkMode = false, isTutor = false }: ChatListScreenProps) {
    const [filterActive, setFilterActive] = useState(false);

    // For students: filter to show only tutors when active
    // For tutors: filter to show only students when active
    const filteredConversations = filterActive
        ? conversations.filter(c => isTutor ? c.type === 'student' : (c.type === 'tutor' || !c.type))
        : conversations;

    // Filter button label
    const filterLabel = isTutor ? 'Students' : 'Tutors';

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            {/* Header - matches Activity screen */}
            <View style={[styles.header, isDarkMode && styles.headerDark]}>
                <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Messages</Text>
                <TouchableOpacity
                    style={[styles.toggleButton, isDarkMode && styles.toggleButtonDark, filterActive && styles.toggleButtonActive]}
                    onPress={() => setFilterActive(!filterActive)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.toggleText, isDarkMode && styles.textGrayDark, filterActive && styles.toggleTextActive]}>
                        {filterLabel}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 100, flexGrow: 1, paddingHorizontal: 16, paddingTop: 16 }}
            >

                {filteredConversations.length === 0 ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
                        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <MessageSquare size={40} color="#9ca3af" />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: isDarkMode ? '#fff' : '#111827', marginBottom: 8, textAlign: 'center' }}>
                            No messages yet
                        </Text>
                        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', maxWidth: 300 }}>
                            Start a conversation to get help with your courses
                        </Text>
                    </View>
                ) : (
                    <View>
                        {filteredConversations.map((conversation) => (
                            <ConversationItem
                                key={conversation.id}
                                tutorName={conversation.tutorName}
                                tutorInitial={conversation.tutorInitial}
                                lastMessage={conversation.lastMessage}
                                timestamp={conversation.timestamp}
                                unreadCount={conversation.unreadCount}
                                onClick={() => onConversationClick(conversation.id)}
                                onDelete={onDeleteConversation ? () => onDeleteConversation(conversation.id) : undefined}
                                type={conversation.type}
                                isDarkMode={isDarkMode}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    toggleButtonActive: {
        backgroundColor: '#db2321',
        borderColor: '#db2321',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    toggleTextActive: {
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    // Dark Mode
    containerDark: {
        backgroundColor: '#111827',
    },
    headerDark: {
        borderBottomColor: '#1f2937',
    },
    textDark: {
        color: '#f3f4f6',
    },
    textGrayDark: {
        color: '#9ca3af',
    },
    toggleButtonDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
});
