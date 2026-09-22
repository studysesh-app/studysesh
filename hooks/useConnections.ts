import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';
import { timeAgo } from '../lib/time';

export interface ConnectionProfile {
    id: string;
    name: string;
    photoUrl: string | undefined;
    year: string;
    major: string;
    sharedCourses: string[];
    connectedSince: string;
}

export function useConnections(userId: string | null) {
    const [friends, setFriends] = useState<Set<string>>(new Set());
    const [friendProfiles, setFriendProfiles] = useState<ConnectionProfile[]>([]);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [blocked, setBlocked] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (DEMO_MODE || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const [{ data: connRows }, { data: blockedRows }] = await Promise.all([
            supabase
                .from('connections')
                .select('id, requester_id, receiver_id, status, created_at')
                .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`),
            supabase.from('blocked_users').select('blocked_id').eq('blocker_id', userId),
        ]);

        const accepted = (connRows ?? []).filter((c) => c.status === 'accepted');
        const pendingSent = (connRows ?? []).filter((c) => c.status === 'pending' && c.requester_id === userId);
        const friendIds = accepted.map((c) => (c.requester_id === userId ? c.receiver_id : c.requester_id));

        setFriends(new Set(friendIds));
        setSentRequests(new Set(pendingSent.map((c) => c.receiver_id)));
        setBlocked(new Set((blockedRows ?? []).map((b: any) => b.blocked_id)));

        if (friendIds.length > 0) {
            const [{ data: users }, { data: myCourseRows }, { data: friendCourseRows }] = await Promise.all([
                supabase.from('users').select('id, name, photo_url, year, major').in('id', friendIds),
                supabase.from('user_courses').select('course_id').eq('user_id', userId),
                supabase.from('user_courses').select('user_id, course_id, courses(code)').in('user_id', friendIds),
            ]);

            const myCourseIds = new Set((myCourseRows ?? []).map((r: any) => r.course_id));
            const sharedByFriend = new Map<string, string[]>();
            for (const row of friendCourseRows ?? []) {
                if (!myCourseIds.has((row as any).course_id)) continue;
                const code = (row as any).courses?.code;
                if (!code) continue;
                if (!sharedByFriend.has((row as any).user_id)) sharedByFriend.set((row as any).user_id, []);
                sharedByFriend.get((row as any).user_id)!.push(code);
            }

            const connectedSinceByFriend = new Map(
                accepted.map((c) => [c.requester_id === userId ? c.receiver_id : c.requester_id, c.created_at])
            );

            setFriendProfiles(
                (users ?? []).map((u) => ({
                    id: u.id,
                    name: u.name,
                    photoUrl: u.photo_url ?? undefined,
                    year: u.year,
                    major: u.major,
                    sharedCourses: sharedByFriend.get(u.id) ?? [],
                    connectedSince: timeAgo(connectedSinceByFriend.get(u.id) ?? new Date().toISOString()),
                }))
            );
        } else {
            setFriendProfiles([]);
        }

        setLoading(false);
    }, [userId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const sendRequest = useCallback(
        async (otherUserId: string) => {
            if (DEMO_MODE || !userId) {
                setSentRequests((prev) => new Set(prev).add(otherUserId));
                return;
            }
            const { data, error } = await supabase
                .from('connections')
                .insert({ requester_id: userId, receiver_id: otherUserId, status: 'pending' })
                .select('id')
                .single();
            if (error) {
                console.error('Send connection request error:', error);
                return;
            }
            await supabase
                .from('activities')
                .insert({ user_id: otherUserId, actor_id: userId, type: 'connection_request', reference_id: data.id });
            setSentRequests((prev) => new Set(prev).add(otherUserId));
        },
        [userId]
    );

    const cancelRequest = useCallback(
        async (otherUserId: string) => {
            setSentRequests((prev) => {
                const next = new Set(prev);
                next.delete(otherUserId);
                return next;
            });
            if (DEMO_MODE || !userId) return;
            await supabase
                .from('connections')
                .delete()
                .eq('requester_id', userId)
                .eq('receiver_id', otherUserId)
                .eq('status', 'pending');
        },
        [userId]
    );

    const toggleConnect = useCallback(
        async (otherUserId: string) => {
            if (sentRequests.has(otherUserId)) {
                await cancelRequest(otherUserId);
            } else {
                await sendRequest(otherUserId);
            }
        },
        [sentRequests, sendRequest, cancelRequest]
    );

    /** Accepts a connection request given the *connection* row id (as referenced by an activity). */
    const acceptRequest = useCallback(
        async (connectionId: string) => {
            if (DEMO_MODE || !userId) return;
            const { data: conn } = await supabase
                .from('connections')
                .select('requester_id, receiver_id')
                .eq('id', connectionId)
                .single();
            if (!conn) return;

            await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId);
            await supabase
                .from('activities')
                .insert({ user_id: conn.requester_id, actor_id: userId, type: 'connection_accepted', reference_id: connectionId });
            await refresh();
        },
        [userId, refresh]
    );

    const declineRequest = useCallback(async (connectionId: string) => {
        if (DEMO_MODE) return;
        await supabase.from('connections').delete().eq('id', connectionId);
    }, []);

    const disconnect = useCallback(
        async (otherUserId: string) => {
            setFriends((prev) => {
                const next = new Set(prev);
                next.delete(otherUserId);
                return next;
            });
            if (DEMO_MODE || !userId) return;
            await supabase
                .from('connections')
                .delete()
                .or(
                    `and(requester_id.eq.${userId},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${userId})`
                );
        },
        [userId]
    );

    const block = useCallback(
        async (otherUserId: string) => {
            setBlocked((prev) => new Set(prev).add(otherUserId));
            setFriends((prev) => {
                const next = new Set(prev);
                next.delete(otherUserId);
                return next;
            });
            setSentRequests((prev) => {
                const next = new Set(prev);
                next.delete(otherUserId);
                return next;
            });
            if (DEMO_MODE || !userId) return;
            await supabase.from('blocked_users').insert({ blocker_id: userId, blocked_id: otherUserId });
            await supabase
                .from('connections')
                .delete()
                .or(
                    `and(requester_id.eq.${userId},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${userId})`
                );
        },
        [userId]
    );

    const unblock = useCallback(
        async (otherUserId: string) => {
            setBlocked((prev) => {
                const next = new Set(prev);
                next.delete(otherUserId);
                return next;
            });
            if (DEMO_MODE || !userId) return;
            await supabase.from('blocked_users').delete().eq('blocker_id', userId).eq('blocked_id', otherUserId);
        },
        [userId]
    );

    return {
        friends,
        friendProfiles,
        sentRequests,
        blocked,
        loading,
        refresh,
        toggleConnect,
        sendRequest,
        cancelRequest,
        acceptRequest,
        declineRequest,
        disconnect,
        block,
        unblock,
    };
}
