import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';
import { timeAgo } from '../lib/time';

export interface ChatConversationSummary {
    id: string;
    otherUserId: string;
    tutorName: string;
    tutorInitial: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    type: 'tutor' | 'student';
}

export interface ChatMessageItem {
    id: string;
    message: string;
    timestamp: string;
    /** True when the current viewer sent this message (see MessageBubble's isMyMessage logic). */
    isStudent: boolean;
    status: 'sent' | 'delivered';
    senderId: string;
}

export function useChat(userId: string | null) {
    const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
    const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessageItem[]>>({});
    const [loading, setLoading] = useState(true);

    const refreshConversations = useCallback(async () => {
        if (DEMO_MODE || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const { data: myParticipantRows } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId);
        const convIds = (myParticipantRows ?? []).map((r) => r.conversation_id);
        if (convIds.length === 0) {
            setConversations([]);
            setLoading(false);
            return;
        }

        const [{ data: otherParticipants }, { data: lastMessages }, { data: myParticipantMeta }] = await Promise.all([
            supabase
                .from('conversation_participants')
                .select('conversation_id, user_id, users(name, is_tutor)')
                .in('conversation_id', convIds)
                .neq('user_id', userId),
            supabase
                .from('messages')
                .select('id, conversation_id, sender_id, content, status, created_at')
                .in('conversation_id', convIds)
                .order('created_at', { ascending: false }),
            supabase
                .from('conversation_participants')
                .select('conversation_id, last_read_at')
                .in('conversation_id', convIds)
                .eq('user_id', userId),
        ]);

        const otherByConv = new Map(
            (otherParticipants ?? []).map((r: any) => [
                r.conversation_id,
                { id: r.user_id, name: r.users?.name ?? 'Unknown', isTutor: !!r.users?.is_tutor },
            ])
        );

        const lastReadByConv = new Map(
            (myParticipantMeta ?? []).map((r: any) => [r.conversation_id as string, r.last_read_at as string | null])
        );

        const lastByConv = new Map<string, any>();
        const unreadByConv = new Map<string, number>();
        for (const m of lastMessages ?? []) {
            if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m);
            const lastRead = lastReadByConv.get(m.conversation_id);
            if (m.sender_id !== userId && (!lastRead || m.created_at > lastRead)) {
                unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) ?? 0) + 1);
            }
        }

        const summaries = convIds
            .map((id) => {
                const other = otherByConv.get(id);
                const last = lastByConv.get(id);
                return {
                    id,
                    otherUserId: other?.id ?? '',
                    tutorName: other?.name ?? 'Unknown',
                    tutorInitial: (other?.name ?? '?').charAt(0),
                    lastMessage: last ? (last.sender_id === userId ? `You: ${last.content}` : last.content) : 'Start a conversation',
                    timestamp: last ? timeAgo(last.created_at) : '',
                    unreadCount: unreadByConv.get(id) ?? 0,
                    type: other?.isTutor ? 'tutor' : 'student',
                    _sortKey: last?.created_at ?? '',
                };
            })
            .sort((a, b) => b._sortKey.localeCompare(a._sortKey))
            .map(({ _sortKey, ...rest }) => rest);

        setConversations(summaries);
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        refreshConversations();
    }, [refreshConversations]);

    const fetchMessages = useCallback(
        async (conversationId: string) => {
            if (DEMO_MODE || !userId) return;
            const { data } = await supabase
                .from('messages')
                .select('id, sender_id, content, status, created_at')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            const msgs = (data ?? []).map((m: any) => ({
                id: m.id,
                message: m.content,
                timestamp: timeAgo(m.created_at),
                isStudent: m.sender_id === userId,
                status: m.status,
                senderId: m.sender_id,
            }));
            setMessagesByConversation((prev) => ({ ...prev, [conversationId]: msgs }));

            await supabase
                .from('messages')
                .update({ status: 'delivered' })
                .eq('conversation_id', conversationId)
                .neq('sender_id', userId)
                .eq('status', 'sent');
            await supabase
                .from('conversation_participants')
                .update({ last_read_at: new Date().toISOString() })
                .eq('conversation_id', conversationId)
                .eq('user_id', userId);
        },
        [userId]
    );

    useEffect(() => {
        if (DEMO_MODE || !userId) return;
        const channel = supabase
            .channel(`messages-${userId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const m: any = payload.new;
                if (m.sender_id !== userId && m.status === 'sent') {
                    supabase.from('messages').update({ status: 'delivered' }).eq('id', m.id).then(() => {});
                }
                setMessagesByConversation((prev) => {
                    if (!prev[m.conversation_id]) return prev;
                    return {
                        ...prev,
                        [m.conversation_id]: [
                            ...prev[m.conversation_id],
                            {
                                id: m.id,
                                message: m.content,
                                timestamp: timeAgo(m.created_at),
                                isStudent: m.sender_id === userId,
                                status: m.sender_id === userId ? 'sent' : 'delivered',
                                senderId: m.sender_id,
                            },
                        ],
                    };
                });
                refreshConversations();
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
                const m: any = payload.new;
                setMessagesByConversation((prev) => {
                    if (!prev[m.conversation_id]) return prev;
                    return {
                        ...prev,
                        [m.conversation_id]: prev[m.conversation_id].map((msg) =>
                            msg.id === m.id ? { ...msg, status: m.status } : msg
                        ),
                    };
                });
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, refreshConversations]);

    const sendMessage = useCallback(
        async (conversationId: string, content: string) => {
            if (DEMO_MODE) return true;
            if (!userId) return false;
            const { error } = await supabase
                .from('messages')
                .insert({ conversation_id: conversationId, sender_id: userId, content, status: 'sent' });
            if (error) {
                console.error('Send message error:', error);
                return false;
            }
            const other = conversations.find((c) => c.id === conversationId);
            if (other?.otherUserId) {
                const { data: existing } = await supabase
                    .from('activities')
                    .select('id')
                    .eq('user_id', other.otherUserId)
                    .eq('type', 'message')
                    .eq('reference_id', conversationId)
                    .eq('is_read', false)
                    .maybeSingle();
                if (!existing) {
                    await supabase.from('activities').insert({
                        user_id: other.otherUserId,
                        actor_id: userId,
                        type: 'message',
                        reference_id: conversationId,
                    });
                }
            }
            await fetchMessages(conversationId);
            await refreshConversations();
            return true;
        },
        [userId, fetchMessages, refreshConversations, conversations]
    );

    const getOrCreateConversation = useCallback(
        async (otherUserId: string): Promise<string | null> => {
            if (DEMO_MODE || !userId) return null;
            const { data, error } = await supabase.functions.invoke('create-conversation', { body: { otherUserId } });
            if (error) {
                console.error('create-conversation error:', error);
                return null;
            }
            await refreshConversations();
            return data?.conversationId ?? null;
        },
        [userId, refreshConversations]
    );

    const deleteConversation = useCallback(
        async (conversationId: string) => {
            setConversations((prev) => prev.filter((c) => c.id !== conversationId));
            setMessagesByConversation((prev) => {
                const next = { ...prev };
                delete next[conversationId];
                return next;
            });
            if (DEMO_MODE || !userId) return;
            await supabase.from('conversation_participants').delete().eq('conversation_id', conversationId).eq('user_id', userId);
        },
        [userId]
    );

    const markConversationRead = useCallback(
        (conversationId: string) => {
            setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)));
            if (DEMO_MODE || !userId) return;
            supabase
                .from('conversation_participants')
                .update({ last_read_at: new Date().toISOString() })
                .eq('conversation_id', conversationId)
                .eq('user_id', userId)
                .then(() => {});
        },
        [userId]
    );

    return {
        conversations,
        messagesByConversation,
        loading,
        refreshConversations,
        fetchMessages,
        sendMessage,
        getOrCreateConversation,
        deleteConversation,
        markConversationRead,
    };
}
