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
}

/** Board posts/comments/likes for a single course. */
export function usePosts(courseCode: string | null, userId: string | null) {
    const [posts, setPosts] = useState<BoardPost[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (DEMO_MODE || !courseCode || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const { data: course } = await supabase.from('courses').select('id').eq('code', courseCode).single();
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
            setPosts([]);
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
        async (content: string, type: 'post' | 'question') => {
            if (DEMO_MODE || !courseCode || !userId) return;
            const { data: course } = await supabase.from('courses').select('id').eq('code', courseCode).single();
            if (!course) return;
            const { error } = await supabase.from('posts').insert({ author_id: userId, course_id: course.id, content, type });
            if (error) {
                console.error('Create post error:', error);
                return;
            }
            await refresh();
        },
        [courseCode, userId, refresh]
    );

    const toggleLike = useCallback(
        async (postId: string) => {
            if (DEMO_MODE || !userId) return;
            const post = posts.find((p) => p.id === postId);
            if (!post) return;

            const wasLiked = post.isLiked;
            setPosts((prev) =>
                prev.map((p) => (p.id === postId ? { ...p, isLiked: !wasLiked, likes: p.likes + (wasLiked ? -1 : 1) } : p))
            );

            if (wasLiked) {
                await supabase.from('post_likes').delete().eq('user_id', userId).eq('post_id', postId);
            } else {
                const { error } = await supabase.from('post_likes').insert({ user_id: userId, post_id: postId });
                if (!error && post.authorId !== userId) {
                    await supabase
                        .from('activities')
                        .insert({ user_id: post.authorId, actor_id: userId, type: 'board_like', reference_id: postId, course_code: courseCode });
                }
            }
        },
        [posts, userId, courseCode]
    );

    const fetchComments = useCallback(
        async (postId: string): Promise<BoardComment[]> => {
            if (DEMO_MODE) return [];
            const { data: rows } = await supabase
                .from('comments')
                .select('id, author_id, content, created_at, users(name, year), comment_likes(user_id)')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

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
            }));
        },
        [userId]
    );

    const addComment = useCallback(
        async (postId: string, content: string) => {
            if (DEMO_MODE || !userId) return;
            const post = posts.find((p) => p.id === postId);
            const { error } = await supabase.from('comments').insert({ post_id: postId, author_id: userId, content });
            if (error) {
                console.error('Add comment error:', error);
                return;
            }
            if (post && post.authorId !== userId) {
                await supabase
                    .from('activities')
                    .insert({ user_id: post.authorId, actor_id: userId, type: 'board_reply', reference_id: postId, course_code: courseCode });
            }
            setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
        },
        [userId, posts, courseCode]
    );

    const toggleCommentLike = useCallback(
        async (commentId: string, currentlyLiked: boolean) => {
            if (DEMO_MODE || !userId) return;
            if (currentlyLiked) {
                await supabase.from('comment_likes').delete().eq('user_id', userId).eq('comment_id', commentId);
            } else {
                await supabase.from('comment_likes').insert({ user_id: userId, comment_id: commentId });
            }
        },
        [userId]
    );

    return { posts, loading, refresh, createPost, toggleLike, fetchComments, addComment, toggleCommentLike };
}
