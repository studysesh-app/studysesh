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

function isBlockedProfile(value: unknown): value is { id: string; name: string } {
    return typeof value === 'object' && value !== null
        && 'id' in value && typeof value.id === 'string'
        && 'name' in value && typeof value.name === 'string';
}

export function useConnections(userId: string | null) {
    const [friends, setFriends] = useState<Set<string>>(new Set());
    const [friendProfiles, setFriendProfiles] = useState<ConnectionProfile[]>([]);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [sentRequestProfiles, setSentRequestProfiles] = useState<Array<{ id: string; name: string }>>([]);
    const [blocked, setBlocked] = useState<Set<string>>(new Set());
    const [blockedProfiles, setBlockedProfiles] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (DEMO_MODE || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        const [connectionsResult, blockedResult] = await Promise.all([
            supabase
                .from('connections')
                .select('id, requester_id, receiver_id, status, created_at')
                .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`),
            supabase.from('blocked_users').select('blocked_id').eq('blocker_id', userId),
        ]);
        const initialError = connectionsResult.error ?? blockedResult.error;
        if (initialError) {
            console.error('Fetch connections error:', initialError);
            setError(initialError.message);
            setLoading(false);
            return;
        }
        const connRows = connectionsResult.data;
        const blockedRows = blockedResult.data;

        const accepted = (connRows ?? []).filter((c) => c.status === 'accepted');
        const pendingSent = (connRows ?? []).filter((c) => c.status === 'pending' && c.requester_id === userId);
        const friendIds = accepted.map((c) => (c.requester_id === userId ? c.receiver_id : c.requester_id));

        setFriends(new Set(friendIds));
        setSentRequests(new Set(pendingSent.map((c) => c.receiver_id)));
        if (pendingSent.length > 0) {
            const { data: recipients, error: recipientsError } = await supabase
                .from('users').select('id, name').in('id', pendingSent.map((c) => c.receiver_id));
            if (recipientsError) {
                console.error('Fetch pending request profiles error:', recipientsError);
                setError(recipientsError.message);
                setLoading(false);
                return;
            }
            setSentRequestProfiles(pendingSent.map((request) => ({
                id: request.receiver_id,
                name: recipients?.find((person) => person.id === request.receiver_id)?.name ?? 'Unavailable user',
            })));
        } else {
            setSentRequestProfiles([]);
        }
        const blockedIds = (blockedRows ?? []).map((b: any) => b.blocked_id as string);
        setBlocked(new Set(blockedIds));
        if (blockedIds.length > 0) {
            const { data: blockedUsers, error: blockedUsersError } = await supabase.rpc('my_blocked_profiles');
            if (blockedUsersError) {
                console.error('Fetch blocked profiles error:', blockedUsersError);
                setError(blockedUsersError.message);
                setLoading(false);
                return;
            }
            if (!Array.isArray(blockedUsers) || !blockedUsers.every(isBlockedProfile)) {
                console.error('Fetch blocked profiles returned an invalid response');
                setError('Could not load blocked users. Please try again.');
                setLoading(false);
                return;
            }
            setBlockedProfiles((prev) =>
                blockedIds.map((id) => ({
                    id,
                    name:
                        blockedUsers?.find((u) => u.id === id)?.name ||
                        prev.find((p) => p.id === id)?.name ||
                        'Unknown User',
                }))
            );
        } else {
            setBlockedProfiles([]);
        }

        if (friendIds.length > 0) {
            const [usersResult, myCoursesResult, friendCoursesResult] = await Promise.all([
                supabase.from('users').select('id, name, photo_url, year, major').in('id', friendIds),
                supabase.from('user_courses').select('course_id').eq('user_id', userId),
                supabase.from('user_courses').select('user_id, course_id, courses(code)').in('user_id', friendIds),
            ]);
            const friendError = usersResult.error ?? myCoursesResult.error ?? friendCoursesResult.error;
            if (friendError) {
                console.error('Fetch connection profiles error:', friendError);
                setError(friendError.message);
                setLoading(false);
                return;
            }
            const users = usersResult.data;
            const myCourseRows = myCoursesResult.data;
            const friendCourseRows = friendCoursesResult.data;

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
                await refresh();
                return null;
            }
            setError(null);
            const { error } = await supabase.rpc('send_connection_request', { p_receiver_id: otherUserId });
            if (error) {
                console.error('Send connection request error:', error);
                const message = error.code === '23505'
                    ? 'A connection or request already exists. Check Activity and Connections.'
                    : error.message;
                setError(message);
                return message;
            }
            await refresh();
            return null;
        },
        [userId, refresh]
    );

    const cancelRequest = useCallback(
        async (otherUserId: string) => {
            setSentRequests((prev) => {
                const next = new Set(prev);
                next.delete(otherUserId);
                return next;
            });
            if (DEMO_MODE || !userId) return null;
            setError(null);
            const { data: pending, error: lookupError } = await supabase
                .from('connections')
                .select('id')
                .eq('requester_id', userId)
                .eq('receiver_id', otherUserId)
                .eq('status', 'pending')
                .maybeSingle();
            if (lookupError) {
                console.error('Find pending connection error:', lookupError);
                setError(lookupError.message);
                await refresh();
                return lookupError.message;
            }
            if (!pending) {
                await refresh();
                return 'The request has already changed. Refresh your connections and try again.';
            }
            const { data: deleted, error: deleteError } = await supabase.from('connections')
                .delete()
                .eq('id', pending.id)
                .eq('requester_id', userId)
                .eq('status', 'pending')
                .select('id')
                .maybeSingle();
            if (deleteError) {
                console.error('Cancel connection request error:', deleteError);
                setError(deleteError.message);
                await refresh();
                return deleteError.message;
            }
            if (!deleted) {
                await refresh();
                return 'The request has already changed. Refresh your connections and try again.';
            }
            await refresh();
            return null;
        },
        [userId, refresh]
    );

    const toggleConnect = useCallback(
        async (otherUserId: string): Promise<string | null> => {
            if (sentRequests.has(otherUserId)) {
                return await cancelRequest(otherUserId);
            } else {
                return await sendRequest(otherUserId);
            }
        },
        [sentRequests, sendRequest, cancelRequest]
    );

    /** Accepts a connection request given the *connection* row id (as referenced by an activity). */
    const acceptRequest = useCallback(
        async (connectionId: string): Promise<string | null> => {
            if (DEMO_MODE || !userId) return null;
            setError(null);
            const { data: accepted, error: acceptError } = await supabase.from('connections')
                .update({ status: 'accepted' })
                .eq('id', connectionId)
                .eq('receiver_id', userId)
                .eq('status', 'pending')
                .select('id')
                .maybeSingle();
            if (acceptError) {
                console.error('Accept connection request error:', acceptError);
                setError(acceptError.message);
                return acceptError.message;
            }
            if (!accepted) {
                await refresh();
                return 'The request has already changed. Refresh Activity and try again.';
            }
            await refresh();
            return null;
        },
        [userId, refresh]
    );

    const declineRequest = useCallback(async (connectionId: string): Promise<string | null> => {
        if (DEMO_MODE || !userId) return null;
        setError(null);
        const { data: deleted, error: connectionError } = await supabase.from('connections')
            .delete()
            .eq('id', connectionId)
            .eq('receiver_id', userId)
            .eq('status', 'pending')
            .select('id')
            .maybeSingle();
        if (connectionError) {
            console.error('Decline connection request error:', connectionError);
            setError(connectionError.message);
            return connectionError.message;
        }
        if (!deleted) {
            await refresh();
            return 'The request has already changed. Refresh Activity and try again.';
        }
        return null;
    }, [userId, refresh]);

    const disconnect = useCallback(
        async (otherUserId: string): Promise<string | null> => {
            setFriends((prev) => {
                const next = new Set(prev);
                next.delete(otherUserId);
                return next;
            });
            if (DEMO_MODE || !userId) return null;
            setError(null);
            const { error } = await supabase
                .from('connections')
                .delete()
                .or(
                    `and(requester_id.eq.${userId},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${userId})`
                );
            if (error) {
                console.error('Disconnect user error:', error);
                setError(error.message);
                await refresh();
                return error.message;
            }
            return null;
        },
        [userId, refresh]
    );

    const block = useCallback(
        async (otherUserId: string, name?: string): Promise<string | null> => {
            setBlocked((prev) => new Set(prev).add(otherUserId));
            setBlockedProfiles((prev) => [
                ...prev.filter((p) => p.id !== otherUserId),
                { id: otherUserId, name: name || prev.find((p) => p.id === otherUserId)?.name || 'Unknown User' },
            ]);
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
            if (DEMO_MODE || !userId) return null;
            setError(null);
            const { error: blockError } = await supabase.from('blocked_users').insert({ blocker_id: userId, blocked_id: otherUserId });
            if (blockError) {
                console.error('Block user error:', blockError);
                setError(blockError.message);
                await refresh();
                return blockError.message;
            }
            const { error: connectionError } = await supabase
                .from('connections')
                .delete()
                .or(
                    `and(requester_id.eq.${userId},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${userId})`
                );
            if (connectionError) {
                console.error('Remove connection after block error:', connectionError);
                setError(`The user was blocked, but the connection could not be removed: ${connectionError.message}`);
                await refresh();
                return connectionError.message;
            }
            return null;
        },
        [userId, refresh]
    );

    const unblock = useCallback(
        async (otherUserId: string): Promise<string | null> => {
            setBlocked((prev) => {
                const next = new Set(prev);
                next.delete(otherUserId);
                return next;
            });
            setBlockedProfiles((prev) => prev.filter((p) => p.id !== otherUserId));
            if (DEMO_MODE || !userId) return null;
            setError(null);
            const { error } = await supabase.from('blocked_users').delete().eq('blocker_id', userId).eq('blocked_id', otherUserId);
            if (error) {
                console.error('Unblock user error:', error);
                setError(error.message);
                await refresh();
                return error.message;
            }
            return null;
        },
        [userId, refresh]
    );

    const report = useCallback(
        async (otherUserId: string, reason?: string): Promise<string | null> => {
            if (DEMO_MODE) return null;
            if (!userId) return 'Sign in before submitting a report.';
            setError(null);
            const { error } = await supabase.from('reports').insert({
                reporter_id: userId,
                reported_id: otherUserId,
                reason: reason ?? null,
            });
            if (error) {
                console.error('Submit user report error:', error);
                setError(error.message);
                return error.message;
            }
            return null;
        },
        [userId]
    );

    return {
        friends,
        friendProfiles,
        sentRequests,
        sentRequestProfiles,
        blocked,
        blockedProfiles,
        loading,
        error,
        refresh,
        toggleConnect,
        sendRequest,
        cancelRequest,
        acceptRequest,
        declineRequest,
        disconnect,
        block,
        unblock,
        report,
    };
}
