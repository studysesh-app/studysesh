import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';
import { timeAgo } from '../lib/time';

export interface BoardPost {
    id: string;
    authorId: string;
    authorName: string;
    authorInitial: string;
    authorYear: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    type: 'post' | 'question';
    createdAt: string;
}

export interface BoardComment {
    id: string;
    authorId: string;
    authorName: string;
    authorInitial: string;
    authorYear: string;
    timestamp: string;
    content: string;
    likes: number;
    isLiked: boolean;
    parentId: string | null;
    createdAt: string;
}

interface PostRow {
    id: string; author_id: string; author_name: string | null; author_year: string | null;
    content: string; type: 'post' | 'question'; created_at: string; likes: number; comments: number; is_liked: boolean;
}

export interface BoardEvent {
    postId: string;
    commentId: string | null;
    kind: 'post_insert' | 'post_remove' | 'post_change' | 'comment_insert' | 'comment_remove' | 'comment_change';
}
export type SubscribeBoardEvents = (listener: (event: BoardEvent) => void) => () => void;

function isBoardEvent(value: unknown): value is { post_id: string; comment_id: string | null; kind: BoardEvent['kind'] } {
    if (typeof value !== 'object' || value === null) return false;
    const row: Record<string, unknown> = { ...value };
    return typeof row.post_id === 'string' && (row.comment_id === null || typeof row.comment_id === 'string')
        && typeof row.kind === 'string' && ['post_insert', 'post_remove', 'post_change', 'comment_insert', 'comment_remove', 'comment_change'].includes(row.kind);
}

function isPostRow(value: unknown): value is PostRow {
    if (typeof value !== 'object' || value === null) return false;
    const row: Record<string, unknown> = { ...value };
    const nullableString = (item: unknown) => item === null || typeof item === 'string';
    return typeof row.id === 'string' && typeof row.author_id === 'string'
        && nullableString(row.author_name) && nullableString(row.author_year)
        && typeof row.content === 'string' && (row.type === 'post' || row.type === 'question')
        && typeof row.created_at === 'string' && typeof row.likes === 'number'
        && typeof row.comments === 'number' && typeof row.is_liked === 'boolean';
}

function mapPost(row: PostRow): BoardPost {
    const name = row.author_name ?? 'Unknown';
    return { id: row.id, authorId: row.author_id, authorName: name, authorInitial: name.charAt(0),
        authorYear: row.author_year ?? '', timestamp: timeAgo(row.created_at), content: row.content,
        likes: row.likes, comments: row.comments, isLiked: row.is_liked, type: row.type, createdAt: row.created_at };
}

/** Board posts/comments/likes for a single course. */
export function usePosts(courseCode: string | null, userId: string | null) {
    const [posts, setPosts] = useState<BoardPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [cursor, setCursor] = useState<{ createdAt: string; id: string } | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
    const generation = useRef(0);
    const inFlight = useRef(false);
    const boardListeners = useRef(new Set<(event: BoardEvent) => void>());
    const eventVersions = useRef(new Map<string, number>());
    const subscribeBoardEvents = useCallback<SubscribeBoardEvents>((listener) => {
        boardListeners.current.add(listener);
        return () => { boardListeners.current.delete(listener); };
    }, []);

    const refresh = useCallback(async () => {
        const version = ++generation.current;
        inFlight.current = false;
        eventVersions.current.clear();
        setPosts([]);
        setCourseId(null);
        setCursor(null);
        setHasMore(false);
        setLoadingMore(false);
        setLoadMoreError(null);
        setError(null);
        if (DEMO_MODE || !courseCode || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
        const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', courseCode).single();
        if (version !== generation.current) return;
        if (courseError) {
            console.error('Fetch course for posts error:', courseError);
            setError(courseError.message);
            setLoading(false);
            return;
        }
        if (!course) {
            setPosts([]);
            setLoading(false);
            return;
        }

        const { data: rows, error } = await supabase.rpc('board_posts_page', { p_course_id: course.id, p_limit: 30 });
        if (version !== generation.current) return;

        if (error || !Array.isArray(rows) || !rows.every(isPostRow)) {
            const message = error?.message ?? 'The board returned an invalid response.';
            console.error('Fetch posts error:', error ?? message);
            setError(message);
            setLoading(false);
            return;
        }

        const page = rows.slice(0, 30);
        setPosts(page.map(mapPost));
        setCourseId(course.id);
        setHasMore(rows.length > 30);
        const last = page[page.length - 1];
        setCursor(last ? { createdAt: last.created_at, id: last.id } : null);
        setLoading(false);
        } catch (failure) {
            if (version === generation.current) {
                console.error('Fetch board failed:', failure);
                setError(failure instanceof Error ? failure.message : 'Could not load the board.');
                setLoading(false);
            }
        }
    }, [courseCode, userId]);

    useEffect(() => {
        refresh();
        return () => { generation.current++; };
    }, [refresh]);

    useEffect(() => {
        if (DEMO_MODE || !courseId || !userId) return;
        let active = true;
        let subscribed = false;
        let disconnected = false;
        const channel = supabase.channel(`board:${courseId}:${userId}`, { config: { private: true } })
            .on('broadcast', { event: 'board_change' }, async (payload) => {
                if (!isBoardEvent(payload.payload)) {
                    console.error('Invalid live board event');
                    setError('A live board update was invalid. Use Refresh board.');
                    return;
                }
                const { post_id: id, comment_id: commentId, kind } = payload.payload;
                const version = generation.current;
                const eventVersion = (eventVersions.current.get(id) ?? 0) + 1;
                eventVersions.current.set(id, eventVersion);
                boardListeners.current.forEach((listener) => listener({ postId: id, commentId, kind }));
                if (kind === 'post_remove') {
                    setPosts((previous) => previous.filter((item) => item.id !== id));
                    return;
                }
                try {
                    const { data, error: detailError } = await supabase.rpc('board_posts_page', {
                        p_course_id: courseId, p_only: id, p_limit: 1,
                    });
                    if (!active || version !== generation.current || eventVersions.current.get(id) !== eventVersion) return;
                    if (detailError || !Array.isArray(data) || !data.every(isPostRow)) {
                        throw new Error(detailError?.message ?? 'Could not refresh the new post.');
                    }
                    if (data.length === 0) {
                        setPosts((previous) => previous.filter((item) => item.id !== id));
                        return;
                    }
                    const post = mapPost(data[0]);
                    setPosts((previous) => {
                        const exists = previous.some((item) => item.id === post.id);
                        if (!exists && kind !== 'post_insert') return previous;
                        return [post, ...previous.filter((item) => item.id !== post.id)]
                            .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
                    });
                } catch (failure) {
                    if (active && version === generation.current) {
                        console.error('Refresh live post failed:', failure);
                        setError(failure instanceof Error ? failure.message : 'Could not refresh the board.');
                    }
                }
            })
            .subscribe((status) => {
                if (!active) return;
                if (status === 'SUBSCRIBED') {
                    if (subscribed && disconnected) setError('Live updates reconnected. Refresh the board to catch up.');
                    subscribed = true;
                    disconnected = false;
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                    disconnected = true;
                    setError('Live board updates are unavailable. Use Refresh board to retry.');
                }
            });
        return () => { active = false; supabase.removeChannel(channel); };
    }, [courseId, userId]);

    const loadMore = useCallback(async () => {
        if (!courseId || !cursor || !hasMore || inFlight.current) return;
        const version = generation.current;
        inFlight.current = true;
        setLoadingMore(true);
        setLoadMoreError(null);
        try {
            const { data, error: pageError } = await supabase.rpc('board_posts_page', {
                p_course_id: courseId, p_before_at: cursor.createdAt, p_before_id: cursor.id, p_limit: 30,
            });
            if (version !== generation.current) return;
            if (pageError || !Array.isArray(data) || !data.every(isPostRow)) {
                throw new Error(pageError?.message ?? 'The board page returned an invalid response.');
            }
            const page = data.slice(0, 30);
            setPosts((previous) => [...previous, ...page.map(mapPost).filter((post) => !previous.some((item) => item.id === post.id))]);
            setHasMore(data.length > 30);
            const last = page[page.length - 1];
            setCursor(last ? { createdAt: last.created_at, id: last.id } : null);
        } catch (failure) {
            if (version === generation.current) {
                console.error('Load more posts failed:', failure);
                setLoadMoreError(failure instanceof Error ? failure.message : 'Could not load more posts.');
            }
        } finally {
            if (version === generation.current) {
                inFlight.current = false;
                setLoadingMore(false);
            }
        }
    }, [courseId, cursor, hasMore]);

    const createPost = useCallback(
        async (content: string, type: 'post' | 'question'): Promise<boolean> => {
            if (DEMO_MODE) return true;
            if (!courseCode || !userId) return false;
            const version = generation.current;
            setError(null);
            const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', courseCode).single();
            if (version !== generation.current) return false;
            if (courseError || !course) {
                const message = courseError?.message ?? 'The selected course could not be found.';
                console.error('Find course for post error:', courseError ?? message);
                setError(message);
                return false;
            }
            const { data: created, error } = await supabase.from('posts')
                .insert({ author_id: userId, course_id: course.id, content, type }).select('id').single();
            if (error || !created) {
                const message = error?.message ?? 'Could not create the post.';
                console.error('Create post error:', error ?? message);
                setError(message);
                return false;
            }
            if (version !== generation.current) return true;
            try {
                const { data: rows, error: detailError } = await supabase.rpc('board_posts_page', {
                    p_course_id: course.id, p_only: created.id, p_limit: 1,
                });
                if (version !== generation.current) return true;
                if (detailError || !Array.isArray(rows) || rows.length !== 1 || !isPostRow(rows[0])) {
                    throw new Error(detailError?.message ?? 'could not refresh the new post.');
                }
                const post = mapPost(rows[0]);
                setPosts((previous) => [post, ...previous.filter((item) => item.id !== post.id)]);
            } catch (failure) {
                if (version === generation.current) {
                    console.error('Refresh new post error:', failure);
                    setError(`Your post was saved, but ${failure instanceof Error ? failure.message : 'it could not be refreshed.'}`);
                }
            }
            return true;
        },
        [courseCode, userId]
    );

    const toggleLike = useCallback(
        async (postId: string): Promise<boolean> => {
            if (DEMO_MODE) return true;
            if (!userId) return false;
            setError(null);
            const post = posts.find((p) => p.id === postId);
            if (!post) return false;

            const wasLiked = post.isLiked;
            setPosts((prev) =>
                prev.map((p) => (p.id === postId ? { ...p, isLiked: !wasLiked, likes: p.likes + (wasLiked ? -1 : 1) } : p))
            );

            if (wasLiked) {
                const { error } = await supabase.from('post_likes').delete().eq('user_id', userId).eq('post_id', postId);
                if (error) {
                    console.error('Unlike post error:', error);
                    setPosts((prev) =>
                        prev.map((p) => (p.id === postId ? { ...p, isLiked: wasLiked, likes: p.likes + 1 } : p))
                    );
                    setError(error.message);
                    return false;
                }
            } else {
                const { error } = await supabase.from('post_likes').insert({ user_id: userId, post_id: postId });
                if (error) {
                    console.error('Like post error:', error);
                    setPosts((prev) =>
                        prev.map((p) => (p.id === postId ? { ...p, isLiked: wasLiked, likes: p.likes - 1 } : p))
                    );
                    setError(error.message);
                    return false;
                }
                if (post.authorId !== userId) {
                    const { error: activityError } = await supabase
                        .from('activities')
                        .insert({ user_id: post.authorId, actor_id: userId, type: 'board_like', reference_id: postId, course_code: courseCode });
                    if (activityError) {
                        console.error('Create post-like activity error:', activityError);
                        setError(`Your like was saved, but its notification failed: ${activityError.message}`);
                    }
                }
            }
            return true;
        },
        [posts, userId, courseCode]
    );

    const addComment = useCallback(
        async (postId: string, content: string, parentId?: string | null): Promise<string | null> => {
            if (DEMO_MODE) return 'demo-comment';
            if (!userId) return null;
            setError(null);
            const post = posts.find((p) => p.id === postId);
            const { data, error } = await supabase.from('comments').insert({
                post_id: postId,
                author_id: userId,
                content,
                parent_id: parentId ?? null,
            }).select('id').single();
            if (error || !data) {
                const message = error?.message ?? 'Could not create the comment.';
                console.error('Add comment error:', error ?? message);
                setError(message);
                return null;
            }
            if (post && post.authorId !== userId) {
                try {
                    const { error: activityError } = await supabase
                        .from('activities')
                        .insert({ user_id: post.authorId, actor_id: userId, type: 'board_reply', reference_id: postId, course_code: courseCode });
                    if (activityError) throw new Error(activityError.message);
                } catch (failure) {
                    console.error('Create comment activity error:', failure);
                    setError(`Your comment was saved, but its notification failed: ${failure instanceof Error ? failure.message : 'Please try again later.'}`);
                }
            }
            setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
            return data.id;
        },
        [userId, posts, courseCode]
    );

    const toggleCommentLike = useCallback(
        async (commentId: string, currentlyLiked: boolean): Promise<boolean> => {
            if (DEMO_MODE) return true;
            if (!userId) return false;
            setError(null);
            if (currentlyLiked) {
                const { error } = await supabase.from('comment_likes').delete().eq('user_id', userId).eq('comment_id', commentId);
                if (error) {
                    console.error('Unlike comment error:', error);
                    setError(error.message);
                    return false;
                }
            } else {
                const { error } = await supabase.from('comment_likes').insert({ user_id: userId, comment_id: commentId });
                if (error) {
                    console.error('Like comment error:', error);
                    setError(error.message);
                    return false;
                }
            }
            return true;
        },
        [userId]
    );

    return { posts, loading, error, refresh, hasMore, loadingMore, loadMoreError, loadMore,
        createPost, toggleLike, addComment, toggleCommentLike, subscribeBoardEvents };
}
