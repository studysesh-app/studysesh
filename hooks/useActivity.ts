import { useState, useEffect, useCallback } from 'react';
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
}

function mapRow(r: any): ActivityItem {
    return {
        id: r.id,
        type: r.type,
        userName: r.actor?.name ?? 'Someone',
        userInitial: (r.actor?.name ?? '?').charAt(0),
        userId: r.actor_id,
        referenceId: r.reference_id,
        courseName: r.course_code ?? undefined,
        timestamp: timeAgo(r.created_at),
        isUnread: !r.is_read,
        isPending: r.type === 'connection_request',
    };
}

export function useActivity(userId: string | null) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (DEMO_MODE || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        const { data, error } = await supabase
            .from('activities')
            .select('id, type, actor_id, reference_id, course_code, is_read, created_at, actor:actor_id(name)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) {
            console.error('Fetch activities error:', error);
            setErrorMessage(error.message);
            setLoading(false);
            return;
        }
        setActivities((data ?? []).map(mapRow));
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (DEMO_MODE || !userId) return;
        const channel = supabase
            .channel(`activities-${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `user_id=eq.${userId}` }, () => {
                refresh();
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, refresh]);

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
        return null;
    }, [activities]);

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
        return null;
    }, [activities, userId]);

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
        return null;
    }, [activities]);

    return { activities, loading, error: errorMessage, refresh, markRead, markAllRead, removeActivity };
}
