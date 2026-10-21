import { useState, useEffect, useCallback } from 'react';
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
}

/** Board posts/comments/likes for a single course. */
export function usePosts(courseCode: string | null, userId: string | null) {
    const [posts, setPosts] = useState<BoardPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (DEMO_MODE || !courseCode || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', courseCode).single();
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

        const { data: rows, error } = await supabase
            .from('posts')
            .select('id, author_id, content, type, created_at, users(name, year), post_likes(user_id), comments(id)')
            .eq('course_id', course.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch posts error:', error);
            setError(error.message);
            setLoading(false);
            return;
        }

        setPosts(
            (rows ?? []).map((r: any) => ({
                id: r.id,
                authorId: r.author_id,
                authorName: r.users?.name ?? 'Unknown',
                authorInitial: (r.users?.name ?? '?').charAt(0),
                authorYear: r.users?.year ?? '',
                timestamp: timeAgo(r.created_at),
                content: r.content,
                likes: (r.post_likes ?? []).length,
                comments: (r.comments ?? []).length,
                isLiked: (r.post_likes ?? []).some((l: any) => l.user_id === userId),
                type: r.type,
            }))
        );
        setLoading(false);
    }, [courseCode, userId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const createPost = useCallback(
        async (content: string, type: 'post' | 'question'): Promise<boolean> => {
            if (DEMO_MODE) return true;
            if (!courseCode || !userId) return false;
            setError(null);
            const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', courseCode).single();
            if (courseError || !course) {
                const message = courseError?.message ?? 'The selected course could not be found.';
                console.error('Find course for post error:', courseError ?? message);
                setError(message);
                return false;
            }
            const { error } = await supabase.from('posts').insert({ author_id: userId, course_id: course.id, content, type });
            if (error) {
                console.error('Create post error:', error);
                setError(error.message);
                return false;
            }
            await refresh();
            return true;
        },
        [courseCode, userId, refresh]
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

    const fetchComments = useCallback(
        async (postId: string): Promise<BoardComment[]> => {
            if (DEMO_MODE) return [];
            setError(null);
            const { data: rows, error } = await supabase
                .from('comments')
                .select('id, author_id, parent_id, content, created_at, users(name, year), comment_likes(user_id)')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });
            if (error) {
                console.error('Fetch comments error:', error);
                setError(error.message);
                return [];
            }

            return (rows ?? []).map((r: any) => ({
                id: r.id,
                authorId: r.author_id,
                authorName: r.users?.name ?? 'Unknown',
                authorInitial: (r.users?.name ?? '?').charAt(0),
                authorYear: r.users?.year ?? '',
                timestamp: timeAgo(r.created_at),
                content: r.content,
                likes: (r.comment_likes ?? []).length,
                isLiked: (r.comment_likes ?? []).some((l: any) => l.user_id === userId),
                parentId: r.parent_id ?? null,
            }));
        },
        [userId]
    );

    const addComment = useCallback(
        async (postId: string, content: string, parentId?: string | null): Promise<boolean> => {
            if (DEMO_MODE) return true;
            if (!userId) return false;
            setError(null);
            const post = posts.find((p) => p.id === postId);
            const { error } = await supabase.from('comments').insert({
                post_id: postId,
                author_id: userId,
                content,
                parent_id: parentId ?? null,
            });
            if (error) {
                console.error('Add comment error:', error);
                setError(error.message);
                return false;
            }
            if (post && post.authorId !== userId) {
                const { error: activityError } = await supabase
                    .from('activities')
                    .insert({ user_id: post.authorId, actor_id: userId, type: 'board_reply', reference_id: postId, course_code: courseCode });
                if (activityError) {
                    console.error('Create comment activity error:', activityError);
                    setError(`Your comment was saved, but its notification failed: ${activityError.message}`);
                }
            }
            setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
            return true;
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

    return { posts, loading, error, refresh, createPost, toggleLike, fetchComments, addComment, toggleCommentLike };
}
