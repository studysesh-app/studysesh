import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';
import { timeAgo } from '../lib/time';

export type ActivityType = 'connection_request' | 'connection_accepted' | 'message' | 'board_like' | 'board_reply';

export interface ActivityItem {
    id: string;
    type: ActivityType;
    userName: string;
    userInitial: string;
    userId: string;
    referenceId: string | null;
    courseName?: string;
    timestamp: string;
    isUnread: boolean;
    isPending: boolean;
    createdAt: string;
}

function mapRow(r: any): ActivityItem {
    return {
        id: r.id,
        type: r.type,
        userName: r.actor?.name ?? 'Someone',
        userInitial: (r.actor?.name ?? '?').charAt(0),
        userId: r.actor_id ?? '',
        referenceId: r.reference_id,
        courseName: r.course_code ?? undefined,
        timestamp: timeAgo(r.created_at),
        isUnread: !r.is_read,
        isPending: r.type === 'connection_request',
        createdAt: r.created_at,
    };
}

export function useActivity(userId: string | null) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState<{ createdAt: string; id: string } | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const generation = useRef(0);
    const unreadRequestVersion = useRef(0);
    const moreInFlight = useRef(false);
    const deletedIds = useRef(new Set<string>());
    const eventVersions = useRef(new Map<string, number>());

    const refreshUnreadCount = useCallback(async (version: number) => {
        if (DEMO_MODE || !userId) return;
        const requestVersion = ++unreadRequestVersion.current;
        const { count, error } = await supabase.from('activities')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId).eq('is_read', false);
        if (version !== generation.current || requestVersion !== unreadRequestVersion.current) return;
        if (error || count === null) {
            const message = error?.message ?? 'Could not count unread activity.';
            console.error('Count unread activities error:', error ?? message);
            setErrorMessage(message);
            return;
        }
        setUnreadCount(count);
    }, [userId]);

    const fetchPage = useCallback(async (after: { createdAt: string; id: string } | null, version: number) => {
        if (!userId) return;
        let query = supabase.from('activities')
            .select('id, type, actor_id, reference_id, course_code, is_read, created_at, actor:actor_id(name)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(31);
        if (after) {
            query = query.or(`created_at.lt.${after.createdAt},and(created_at.eq.${after.createdAt},id.lt.${after.id})`);
        }
        const { data, error } = await query;
        if (version !== generation.current) return;
        if (error) {
            console.error('Fetch activities error:', error);
            if (after) setLoadMoreError(error.message);
            else setErrorMessage(error.message);
            return;
        }
        const page = (data ?? []).slice(0, 30).map(mapRow);
        setActivities((previous) => {
            const merged = new Map(previous.map((item) => [item.id, item]));
            for (const item of page) {
                if (!deletedIds.current.has(item.id) && !merged.has(item.id)) merged.set(item.id, item);
            }
            return [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
        });
        setHasMore((data ?? []).length > 30);
        const last = page[page.length - 1];
        setCursor(last ? { createdAt: last.createdAt, id: last.id } : null);
    }, [userId]);

    const refresh = useCallback(async () => {
        const version = ++generation.current;
        moreInFlight.current = false;
        deletedIds.current.clear();
        eventVersions.current.clear();
        setActivities([]);
        setCursor(null);
        setHasMore(false);
        setLoadingMore(false);
        setLoadMoreError(null);
        setErrorMessage(null);
        if (DEMO_MODE || !userId) {
            setLoading(false);
            setUnreadCount(0);
            return;
        }
        setLoading(true);
        try {
            await Promise.all([fetchPage(null, version), refreshUnreadCount(version)]);
        } catch (error) {
            if (version === generation.current) {
                console.error('Fetch activities failed:', error);
                setErrorMessage(error instanceof Error ? error.message : 'Could not load activity.');
            }
        } finally {
            if (version === generation.current) setLoading(false);
        }
    }, [userId, fetchPage, refreshUnreadCount]);

    const loadMore = useCallback(async () => {
        if (!userId || !cursor || !hasMore || moreInFlight.current) return;
        const version = generation.current;
        moreInFlight.current = true;
        setLoadingMore(true);
        setLoadMoreError(null);
        try {
            await fetchPage(cursor, version);
        } catch (error) {
            if (version === generation.current) {
                console.error('Load more activities failed:', error);
                setLoadMoreError(error instanceof Error ? error.message : 'Could not load more activity.');
            }
        } finally {
            if (version === generation.current) {
                moreInFlight.current = false;
                setLoadingMore(false);
            }
        }
    }, [userId, cursor, hasMore, fetchPage]);

    useEffect(() => {
        refresh();
        return () => { generation.current++; };
    }, [refresh]);

    useEffect(() => {
        if (DEMO_MODE || !userId) return;
        let active = true;
        const channel = supabase
            .channel(`activities-${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `user_id=eq.${userId}` }, async (payload) => {
                const version = generation.current;
                if (!active) return;
                const id = payload.eventType === 'DELETE' ? payload.old.id : payload.new.id;
                if (typeof id !== 'string') return;
                const eventVersion = (eventVersions.current.get(id) ?? 0) + 1;
                eventVersions.current.set(id, eventVersion);
                if (payload.eventType === 'DELETE') {
                    deletedIds.current.add(id);
                    setActivities((previous) => previous.filter((item) => item.id !== id));
                } else {
                    const { data, error } = await supabase.from('activities')
                        .select('id, type, actor_id, reference_id, course_code, is_read, created_at, actor:actor_id(name)')
                        .eq('id', id).eq('user_id', userId).maybeSingle();
                    if (!active || version !== generation.current || eventVersions.current.get(id) !== eventVersion) return;
                    if (error) {
                        console.error('Refresh activity error:', error);
                        setErrorMessage(error.message);
                        return;
                    }
                    if (data) {
                        if (payload.eventType === 'UPDATE' && deletedIds.current.has(id)) return;
                        if (payload.eventType === 'INSERT') deletedIds.current.delete(id);
                        const item = mapRow(data);
                        setActivities((previous) => {
                            if (payload.eventType === 'UPDATE' && !previous.some((row) => row.id === id)) return previous;
                            return [item, ...previous.filter((row) => row.id !== id)]
                                .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
                        });
                    } else {
                        deletedIds.current.add(id);
                        setActivities((previous) => previous.filter((item) => item.id !== id));
                    }
                }
                await refreshUnreadCount(version);
            })
            .subscribe();
        return () => {
            active = false;
            supabase.removeChannel(channel);
        };
    }, [userId, refreshUnreadCount]);

    const markRead = useCallback(async (id: string): Promise<string | null> => {
        setErrorMessage(null);
        const previous = activities.find((a) => a.id === id)?.isUnread;
        setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, isUnread: false } : a)));
        if (DEMO_MODE) return null;
        const { error } = await supabase.from('activities').update({ is_read: true }).eq('id', id);
        if (error) {
            console.error('Mark activity read error:', error);
            if (previous) setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, isUnread: true } : a)));
            setErrorMessage(error.message);
            return error.message;
        }
        await refreshUnreadCount(generation.current);
        return null;
    }, [activities, refreshUnreadCount]);

    const markAllRead = useCallback(async (): Promise<string | null> => {
        setErrorMessage(null);
        const previous = activities;
        setActivities((prev) => prev.map((a) => ({ ...a, isUnread: false })));
        if (DEMO_MODE || !userId) return null;
        const { error } = await supabase.from('activities').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
        if (error) {
            console.error('Mark all activities read error:', error);
            setActivities(previous);
            setErrorMessage(error.message);
            return error.message;
        }
        await refreshUnreadCount(generation.current);
        return null;
    }, [activities, userId, refreshUnreadCount]);

    const removeActivity = useCallback(async (id: string): Promise<string | null> => {
        setErrorMessage(null);
        const previous = activities;
        setActivities((prev) => prev.filter((a) => a.id !== id));
        if (DEMO_MODE) return null;
        const { error } = await supabase.from('activities').delete().eq('id', id);
        if (error) {
            console.error('Delete activity error:', error);
            setActivities(previous);
            setErrorMessage(error.message);
            return error.message;
        }
        await refreshUnreadCount(generation.current);
        return null;
    }, [activities, refreshUnreadCount]);

    return { activities, loading, error: errorMessage, refresh, markRead, markAllRead, removeActivity,
        unreadCount, hasMore, loadingMore, loadMoreError, loadMore };
}
