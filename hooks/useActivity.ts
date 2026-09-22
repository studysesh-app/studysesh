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

    const refresh = useCallback(async () => {
        if (DEMO_MODE || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('activities')
            .select('id, type, actor_id, reference_id, course_code, is_read, created_at, actor:actor_id(name)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) {
            console.error('Fetch activities error:', error);
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

    const markRead = useCallback(async (id: string) => {
        setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, isUnread: false } : a)));
        if (!DEMO_MODE) await supabase.from('activities').update({ is_read: true }).eq('id', id);
    }, []);

    const markAllRead = useCallback(async () => {
        setActivities((prev) => prev.map((a) => ({ ...a, isUnread: false })));
        if (!DEMO_MODE && userId) {
            await supabase.from('activities').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
        }
    }, [userId]);

    const removeActivity = useCallback((id: string) => {
        setActivities((prev) => prev.filter((a) => a.id !== id));
    }, []);

    return { activities, loading, refresh, markRead, markAllRead, removeActivity };
}
