import { useState, useEffect, useCallback, useRef } from 'react';
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
    sortAt: string;
}

export interface ChatMessageItem {
    id: string;
    message: string;
    timestamp: string;
    /** True when the current viewer sent this message (see MessageBubble's isMyMessage logic). */
    isStudent: boolean;
    status: 'sent' | 'delivered';
    senderId: string;
    createdAt: string;
}

interface ChatHistory {
    cursor: { createdAt: string; id: string } | null;
    hasMore: boolean;
    loadingMore: boolean;
    error: string | null;
}

interface SummaryRow {
    id: string;
    other_user_id: string | null;
    other_name: string | null;
    other_is_tutor: boolean | null;
    last_content: string | null;
    last_sender: string | null;
    last_at: string | null;
    sort_at: string;
    unread_count: number;
}

function isSummaryRow(value: unknown): value is SummaryRow {
    if (typeof value !== 'object' || value === null) return false;
    const row: Record<string, unknown> = { ...value };
    const nullableString = (item: unknown) => item === null || typeof item === 'string';
    return typeof row.id === 'string' && nullableString(row.other_user_id)
        && nullableString(row.other_name) && (row.other_is_tutor === null || typeof row.other_is_tutor === 'boolean')
        && nullableString(row.last_content) && nullableString(row.last_sender) && nullableString(row.last_at)
        && typeof row.sort_at === 'string' && typeof row.unread_count === 'number';
}

function mapSummary(row: SummaryRow, userId: string): ChatConversationSummary {
    const name = row.other_name ?? 'Unknown';
    return {
        id: row.id, otherUserId: row.other_user_id ?? '', tutorName: name,
        tutorInitial: name.charAt(0), lastMessage: row.last_content === null
            ? 'Start a conversation' : `${row.last_sender === userId ? 'You: ' : ''}${row.last_content}`,
        timestamp: row.last_at ? timeAgo(row.last_at) : '', unreadCount: row.unread_count,
        type: row.other_is_tutor ? 'tutor' : 'student', sortAt: row.sort_at,
    };
}

function sortConversations(rows: ChatConversationSummary[]) {
    return rows.sort((a, b) => b.sortAt.localeCompare(a.sortAt) || b.id.localeCompare(a.id));
}

export function useChat(userId: string | null) {
    const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
    const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessageItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyByConversation, setHistoryByConversation] = useState<Record<string, ChatHistory>>({});
    const loadingOlder = useRef(new Set<string>());
    const accountGeneration = useRef(0);
    const historyRevision = useRef(new Map<string, number>());
    const [conversationCursor, setConversationCursor] = useState<{ sortAt: string; id: string } | null>(null);
    const [hasMoreConversations, setHasMoreConversations] = useState(false);
    const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);
    const [conversationPageError, setConversationPageError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const listGeneration = useRef(0);
    const listInFlight = useRef(false);
    const unreadRequestVersion = useRef(0);
    const summaryVersions = useRef(new Map<string, number>());

    useEffect(() => {
        accountGeneration.current++;
        setMessagesByConversation({});
        setHistoryByConversation({});
        loadingOlder.current.clear();
        historyRevision.current.clear();
        summaryVersions.current.clear();
        return () => { accountGeneration.current++; };
    }, [userId]);

    const refreshConversations = useCallback(async () => {
        const version = ++listGeneration.current;
        const account = accountGeneration.current;
        listInFlight.current = false;
        setConversations([]);
        setConversationCursor(null);
        setHasMoreConversations(false);
        setLoadingMoreConversations(false);
        setConversationPageError(null);
        setError(null);
        if (DEMO_MODE || !userId) {
            setLoading(false);
            setUnreadCount(0);
            return;
        }
        setLoading(true);
        const countVersion = ++unreadRequestVersion.current;
        try {
            const [page, total] = await Promise.all([
                supabase.rpc('conversation_summary_page', { p_limit: 30 }),
                supabase.rpc('unread_message_count'),
            ]);
            if (version !== listGeneration.current || account !== accountGeneration.current) return;
            if (page.error || !Array.isArray(page.data) || !page.data.every(isSummaryRow)) {
                throw new Error(page.error?.message ?? 'The conversation list returned an invalid response.');
            }
            if (countVersion === unreadRequestVersion.current && (total.error || typeof total.data !== 'number')) {
                throw new Error(total.error?.message ?? 'Could not count unread messages.');
            }
            const rows = page.data.slice(0, 30);
            setConversations((previous) => {
                const merged = new Map(rows.map((row) => [row.id, mapSummary(row, userId)]));
                previous.forEach((row) => merged.set(row.id, row));
                return sortConversations([...merged.values()]);
            });
            setHasMoreConversations(page.data.length > 30);
            const last = rows[rows.length - 1];
            setConversationCursor(last ? { sortAt: last.sort_at, id: last.id } : null);
            if (countVersion === unreadRequestVersion.current && typeof total.data === 'number') setUnreadCount(total.data);
        } catch (failure) {
            if (version === listGeneration.current && account === accountGeneration.current) {
                console.error('Fetch conversation list error:', failure);
                setError(failure instanceof Error ? failure.message : 'Could not load messages.');
            }
        } finally {
            if (version === listGeneration.current && account === accountGeneration.current) setLoading(false);
        }
    }, [userId]);

    const refreshUnread = useCallback(async () => {
        if (DEMO_MODE || !userId) return;
        const account = accountGeneration.current;
        const version = ++unreadRequestVersion.current;
        try {
            const { data, error: countError } = await supabase.rpc('unread_message_count');
            if (account !== accountGeneration.current || version !== unreadRequestVersion.current) return;
            if (countError || typeof data !== 'number') {
                throw new Error(countError?.message ?? 'Could not count unread messages.');
            }
            setUnreadCount(data);
        } catch (failure) {
            if (account === accountGeneration.current && version === unreadRequestVersion.current) {
                console.error('Count unread messages error:', failure);
                setError(failure instanceof Error ? failure.message : 'Could not count unread messages.');
            }
        }
    }, [userId]);

    const refreshConversation = useCallback(async (conversationId: string) => {
        if (DEMO_MODE || !userId) return;
        const account = accountGeneration.current;
        const version = (summaryVersions.current.get(conversationId) ?? 0) + 1;
        summaryVersions.current.set(conversationId, version);
        try {
            const { data, error: summaryError } = await supabase.rpc('conversation_summary_page', { p_only: conversationId, p_limit: 1 });
            if (account !== accountGeneration.current || summaryVersions.current.get(conversationId) !== version) return;
            if (summaryError || !Array.isArray(data) || !data.every(isSummaryRow)) {
                throw new Error(summaryError?.message ?? 'The conversation returned an invalid response.');
            }
            const summary = data[0] ? mapSummary(data[0], userId) : null;
            setConversations((previous) => sortConversations([
                ...previous.filter((item) => item.id !== conversationId), ...(summary ? [summary] : []),
            ]));
            await refreshUnread();
        } catch (failure) {
            if (account === accountGeneration.current && summaryVersions.current.get(conversationId) === version) {
                console.error('Refresh conversation error:', failure);
                setError(failure instanceof Error ? failure.message : 'Could not refresh the conversation.');
            }
        }
    }, [userId, refreshUnread]);

    const loadMoreConversations = useCallback(async () => {
        if (!userId || !conversationCursor || !hasMoreConversations || listInFlight.current) return;
        const version = listGeneration.current;
        const account = accountGeneration.current;
        listInFlight.current = true;
        setLoadingMoreConversations(true);
        setConversationPageError(null);
        try {
            const { data, error: pageError } = await supabase.rpc('conversation_summary_page', {
                p_before_at: conversationCursor.sortAt, p_before_id: conversationCursor.id, p_limit: 30,
            });
            if (version !== listGeneration.current || account !== accountGeneration.current) return;
            if (pageError || !Array.isArray(data) || !data.every(isSummaryRow)) {
                throw new Error(pageError?.message ?? 'The conversation page returned an invalid response.');
            }
            const rows = data.slice(0, 30);
            setConversations((previous) => sortConversations([
                ...previous, ...rows.map((row) => mapSummary(row, userId)).filter((row) => !previous.some((item) => item.id === row.id)),
            ]));
            setHasMoreConversations(data.length > 30);
            const last = rows[rows.length - 1];
            setConversationCursor(last ? { sortAt: last.sort_at, id: last.id } : null);
        } catch (failure) {
            if (version === listGeneration.current && account === accountGeneration.current) {
                console.error('Load more conversations error:', failure);
                setConversationPageError(failure instanceof Error ? failure.message : 'Could not load more conversations.');
            }
        } finally {
            if (version === listGeneration.current && account === accountGeneration.current) {
                listInFlight.current = false;
                setLoadingMoreConversations(false);
            }
        }
    }, [userId, conversationCursor, hasMoreConversations]);

    useEffect(() => {
        refreshConversations();
    }, [refreshConversations]);

    const fetchMessages = useCallback(
        async (conversationId: string): Promise<boolean> => {
            if (DEMO_MODE || !userId) return true;
            const generation = accountGeneration.current;
            const revision = historyRevision.current.get(conversationId) ?? 0;
            const isCurrent = () => generation === accountGeneration.current
                && revision === (historyRevision.current.get(conversationId) ?? 0);
            setError(null);
            setLoadingMessages(true);
            try {
            const { data, error: fetchError } = await supabase
                .from('messages')
                .select('id, sender_id, content, status, created_at')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .order('id', { ascending: false })
                .limit(51);
            if (!isCurrent()) return false;
            if (fetchError) {
                console.error('Fetch messages error:', fetchError);
                setError(fetchError.message);
                setLoadingMessages(false);
                return false;
            }

            const page = (data ?? []).slice(0, 50);
            const msgs: ChatMessageItem[] = page.map((m: any) => ({
                id: m.id,
                message: m.content,
                timestamp: timeAgo(m.created_at),
                isStudent: m.sender_id === userId,
                status: m.status === 'sent' ? 'sent' : 'delivered',
                senderId: m.sender_id,
                createdAt: m.created_at,
            }));
            setMessagesByConversation((prev) => {
                const merged = new Map((prev[conversationId] ?? []).map((message) => [message.id, message]));
                msgs.forEach((message) => merged.set(message.id, message));
                return { ...prev, [conversationId]: [...merged.values()].sort((a, b) =>
                    a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)) };
            });
            setHistoryByConversation((prev) => {
                if (prev[conversationId]) return prev;
                const last = page[page.length - 1];
                return { ...prev, [conversationId]: {
                    cursor: last ? { createdAt: last.created_at, id: last.id } : null,
                    hasMore: (data ?? []).length > 50,
                    loadingMore: false,
                    error: null,
                } };
            });

            const { error: deliveryError } = await supabase
                .from('messages')
                .update({ status: 'delivered' })
                .eq('conversation_id', conversationId)
                .neq('sender_id', userId)
                .eq('status', 'sent');
            if (!isCurrent()) return false;
            if (deliveryError) {
                console.error('Mark messages delivered error:', deliveryError);
                setError(deliveryError.message);
            }
            const { error: readError } = await supabase
                .from('conversation_participants')
                .update({ last_read_at: new Date().toISOString() })
                .eq('conversation_id', conversationId)
                .eq('user_id', userId);
            if (!isCurrent()) return false;
            if (readError) {
                console.error('Update conversation read time error:', readError);
                setError(readError.message);
            }
            if (!readError) await refreshUnread();
            setLoadingMessages(false);
            return !deliveryError && !readError;
            } catch (failure) {
                if (isCurrent()) {
                    console.error('Fetch messages failed:', failure);
                    setError(failure instanceof Error ? failure.message : 'Could not load messages.');
                    setLoadingMessages(false);
                }
                return false;
            }
        },
        [userId, refreshUnread]
    );

    const loadOlderMessages = useCallback(async (conversationId: string) => {
        const history = historyByConversation[conversationId];
        if (!userId || !history?.hasMore || !history.cursor || loadingOlder.current.has(conversationId)) return;
        const generation = accountGeneration.current;
        const revision = historyRevision.current.get(conversationId) ?? 0;
        const isCurrent = () => generation === accountGeneration.current
            && revision === (historyRevision.current.get(conversationId) ?? 0);
        loadingOlder.current.add(conversationId);
        setHistoryByConversation((prev) => ({ ...prev, [conversationId]: { ...prev[conversationId], loadingMore: true, error: null } }));
        try {
        const { createdAt, id } = history.cursor;
        const { data, error: fetchError } = await supabase.from('messages')
            .select('id, sender_id, content, status, created_at')
            .eq('conversation_id', conversationId)
            .or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(51);
        if (!isCurrent()) return;
        if (fetchError) {
            console.error('Load older messages error:', fetchError);
            setHistoryByConversation((prev) => ({ ...prev, [conversationId]: { ...prev[conversationId], loadingMore: false, error: fetchError.message } }));
            return;
        }
        const page = (data ?? []).slice(0, 50);
        const msgs: ChatMessageItem[] = page.map((m: any) => ({
            id: m.id, message: m.content, timestamp: timeAgo(m.created_at),
            isStudent: m.sender_id === userId, status: m.status === 'sent' ? 'sent' : 'delivered', senderId: m.sender_id, createdAt: m.created_at,
        }));
        setMessagesByConversation((prev) => {
            const merged = new Map((prev[conversationId] ?? []).map((message) => [message.id, message]));
            msgs.forEach((message) => { if (!merged.has(message.id)) merged.set(message.id, message); });
            return { ...prev, [conversationId]: [...merged.values()].sort((a, b) =>
                a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)) };
        });
        const last = page[page.length - 1];
        setHistoryByConversation((prev) => ({ ...prev, [conversationId]: {
            cursor: last ? { createdAt: last.created_at, id: last.id } : null,
            hasMore: (data ?? []).length > 50, loadingMore: false, error: null,
        } }));
        } catch (failure) {
            if (isCurrent()) {
                console.error('Load older messages failed:', failure);
                const message = failure instanceof Error ? failure.message : 'Could not load older messages.';
                setHistoryByConversation((prev) => prev[conversationId]
                    ? { ...prev, [conversationId]: { ...prev[conversationId], loadingMore: false, error: message } } : prev);
            }
        } finally {
            if (isCurrent()) loadingOlder.current.delete(conversationId);
        }
    }, [userId, historyByConversation]);

    useEffect(() => {
        if (DEMO_MODE || !userId) return;
        const channel = supabase
            .channel(`messages-${userId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const m: any = payload.new;
                if (m.sender_id !== userId && m.status === 'sent') {
                    supabase
                        .from('messages')
                        .update({ status: 'delivered' })
                        .eq('id', m.id)
                        .then(({ error }) => {
                            if (error) {
                                console.error('Mark incoming message delivered error:', error);
                                setError(error.message);
                            }
                        });
                }
                setMessagesByConversation((prev) => {
                    if (!prev[m.conversation_id]) return prev;
                    if (prev[m.conversation_id].some((message) => message.id === m.id)) return prev;
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
                                createdAt: m.created_at,
                            },
                        ],
                    };
                });
                refreshConversation(m.conversation_id);
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
    }, [userId, refreshConversation]);

    const sendMessage = useCallback(
        async (conversationId: string, content: string) => {
            if (DEMO_MODE) return true;
            if (!userId) return false;
            setError(null);
            const { error } = await supabase
                .from('messages')
                .insert({ conversation_id: conversationId, sender_id: userId, content, status: 'sent' });
            if (error) {
                console.error('Send message error:', error);
                setError(error.message);
                return false;
            }
            try {
            let notificationError: string | null = null;
            const other = conversations.find((c) => c.id === conversationId);
            if (other?.otherUserId) {
                const { data: existing, error: activityLookupError } = await supabase
                    .from('activities')
                    .select('id')
                    .eq('user_id', other.otherUserId)
                    .eq('type', 'message')
                    .eq('reference_id', conversationId)
                    .eq('is_read', false)
                    .maybeSingle();
                if (activityLookupError) {
                    console.error('Check message notification error:', activityLookupError);
                    notificationError = `Your message was sent, but its notification could not be checked: ${activityLookupError.message}`;
                } else if (!existing) {
                    const { error: activityError } = await supabase.from('activities').insert({
                        user_id: other.otherUserId,
                        actor_id: userId,
                        type: 'message',
                        reference_id: conversationId,
                    });
                    if (activityError) {
                        console.error('Create message notification error:', activityError);
                        notificationError = `Your message was sent, but its notification failed: ${activityError.message}`;
                    }
                }
            }
            const messagesLoaded = await fetchMessages(conversationId);
            await refreshConversation(conversationId);
            if (notificationError) setError(notificationError);
            else if (!messagesLoaded) setError('Your message was sent, but the conversation could not be refreshed.');
            } catch (failure) {
                console.error('Refresh sent message failed:', failure);
                setError(`Your message was sent, but ${failure instanceof Error ? failure.message : 'the conversation could not be refreshed.'}`);
            }
            return true;
        },
        [userId, fetchMessages, refreshConversation, conversations]
    );

    const getOrCreateConversation = useCallback(
        async (otherUserId: string): Promise<string | null> => {
            if (DEMO_MODE || !userId) return null;
            setError(null);
            const { data, error } = await supabase.rpc('open_conversation', { p_other_user: otherUserId });
            if (error) {
                console.error('create-conversation error:', error);
                setError(error.message);
                return null;
            }
            if (!data || typeof data.conversationId !== 'string') {
                const message = 'The conversation could not be created.';
                setError(message);
                return null;
            }
            await refreshConversation(data.conversationId);
            return data.conversationId;
        },
        [userId, refreshConversation]
    );

    const deleteConversation = useCallback(
        async (conversationId: string) => {
            historyRevision.current.set(conversationId, (historyRevision.current.get(conversationId) ?? 0) + 1);
            summaryVersions.current.set(conversationId, (summaryVersions.current.get(conversationId) ?? 0) + 1);
            loadingOlder.current.delete(conversationId);
            setLoadingMessages(false);
            setConversations((prev) => prev.filter((c) => c.id !== conversationId));
            setMessagesByConversation((prev) => {
                const next = { ...prev };
                delete next[conversationId];
                return next;
            });
            setHistoryByConversation((prev) => {
                const next = { ...prev };
                delete next[conversationId];
                return next;
            });
            if (DEMO_MODE || !userId) return;
            setError(null);
            const { error } = await supabase.rpc('hide_conversation', { p_conversation_id: conversationId });
            if (error) {
                console.error('Delete conversation error:', error);
                await refreshConversations();
                setError(error.message);
            } else {
                summaryVersions.current.set(conversationId, (summaryVersions.current.get(conversationId) ?? 0) + 1);
                setConversations((prev) => prev.filter((conversation) => conversation.id !== conversationId));
                await refreshUnread();
            }
        },
        [userId, refreshConversations, refreshUnread]
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
                .then(async ({ error }) => {
                    if (error) {
                        console.error('Mark conversation read error:', error);
                        await refreshConversations();
                        setError(error.message);
                    } else {
                        await refreshUnread();
                    }
                });
        },
        [userId, refreshConversations, refreshUnread]
    );

    return {
        conversations,
        messagesByConversation,
        historyByConversation,
        loadOlderMessages,
        loading,
        loadingMessages,
        error,
        refreshConversations,
        hasMoreConversations,
        loadingMoreConversations,
        conversationPageError,
        loadMoreConversations,
        unreadCount,
        fetchMessages,
        sendMessage,
        getOrCreateConversation,
        deleteConversation,
        markConversationRead,
    };
}
