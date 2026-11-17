import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';
import { timeAgo } from '../lib/time';
import type { BoardComment, SubscribeBoardEvents } from './usePosts';

interface CommentRow {
    id: string; author_id: string; author_name: string | null; author_year: string | null;
    parent_id: string | null; content: string; created_at: string; likes: number; is_liked: boolean;
}

function isCommentRow(value: unknown): value is CommentRow {
    if (typeof value !== 'object' || value === null) return false;
    const row: Record<string, unknown> = { ...value };
    const nullableString = (item: unknown) => item === null || typeof item === 'string';
    return typeof row.id === 'string' && typeof row.author_id === 'string'
        && nullableString(row.author_name) && nullableString(row.author_year) && nullableString(row.parent_id)
        && typeof row.content === 'string' && typeof row.created_at === 'string'
        && typeof row.likes === 'number' && typeof row.is_liked === 'boolean';
}

function mapComment(row: CommentRow): BoardComment {
    const name = row.author_name ?? 'Unknown';
    return { id: row.id, authorId: row.author_id, authorName: name, authorInitial: name.charAt(0),
        authorYear: row.author_year ?? '', timestamp: timeAgo(row.created_at), content: row.content,
        likes: row.likes, isLiked: row.is_liked, parentId: row.parent_id, createdAt: row.created_at };
}

export function useComments(postId: string | null, userId: string | null, subscribeBoardEvents: SubscribeBoardEvents) {
    const [comments, setComments] = useState<BoardComment[]>([]);
    const commentsRef = useRef(comments);
    commentsRef.current = comments;
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState<{ createdAt: string; id: string } | null>(null);
    const generation = useRef(0);
    const inFlight = useRef(false);
    const commentVersions = useRef(new Map<string, number>());
    const activeContext = useRef({ postId, userId });
    activeContext.current = { postId, userId };

    const fetchPage = useCallback(async (after: { createdAt: string; id: string } | null, version: number) => {
        if (!postId) return;
        const { data, error: queryError } = await supabase.rpc('board_comments_page', {
            p_post_id: postId, p_after_at: after?.createdAt ?? null, p_after_id: after?.id ?? null, p_limit: 30,
        });
        if (version !== generation.current) return;
        if (queryError || !Array.isArray(data) || !data.every(isCommentRow)) {
            throw new Error(queryError?.message ?? 'The comments returned an invalid response.');
        }
        const page = data.slice(0, 30);
        setComments((previous) => {
            const merged = new Map(previous.map((item) => [item.id, item]));
            page.map(mapComment).forEach((item) => { if (!merged.has(item.id)) merged.set(item.id, item); });
            return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
        });
        setHasMore(data.length > 30);
        const last = page[page.length - 1];
        setCursor(last ? { createdAt: last.created_at, id: last.id } : null);
    }, [postId]);

    const refresh = useCallback(async () => {
        const version = ++generation.current;
        inFlight.current = false;
        commentVersions.current.clear();
        setComments([]);
        setCursor(null);
        setHasMore(false);
        setLoadingMore(false);
        setError(null);
        setLoadMoreError(null);
        if (DEMO_MODE || !postId || !userId) { setLoading(false); return; }
        setLoading(true);
        try {
            await fetchPage(null, version);
        } catch (failure) {
            if (version === generation.current) {
                console.error('Fetch comments failed:', failure);
                setError(failure instanceof Error ? failure.message : 'Could not load comments.');
            }
        } finally {
            if (version === generation.current) setLoading(false);
        }
    }, [postId, userId, fetchPage]);

    useEffect(() => { refresh(); return () => { generation.current++; }; }, [refresh]);

    const loadMore = useCallback(async () => {
        if (!cursor || !hasMore || inFlight.current) return;
        const version = generation.current;
        inFlight.current = true;
        setLoadingMore(true);
        setLoadMoreError(null);
        try {
            await fetchPage(cursor, version);
        } catch (failure) {
            if (version === generation.current) {
                console.error('Load more comments failed:', failure);
                setLoadMoreError(failure instanceof Error ? failure.message : 'Could not load more comments.');
            }
        } finally {
            if (version === generation.current) { inFlight.current = false; setLoadingMore(false); }
        }
    }, [cursor, hasMore, fetchPage]);

    const loadOne = useCallback(async (commentId: string, source: 'own' | 'live' = 'own') => {
        if (DEMO_MODE || !postId || activeContext.current.postId !== postId || activeContext.current.userId !== userId) return;
        const version = generation.current;
        const commentVersion = (commentVersions.current.get(commentId) ?? 0) + 1;
        commentVersions.current.set(commentId, commentVersion);
        try {
            const { data, error: queryError } = await supabase.rpc('board_comments_page', {
                p_post_id: postId, p_only: commentId, p_limit: 1,
            });
            if (version !== generation.current || commentVersions.current.get(commentId) !== commentVersion
                || activeContext.current.postId !== postId || activeContext.current.userId !== userId) return;
            if (!queryError && Array.isArray(data) && data.length === 0 && source === 'live') {
                setComments((previous) => previous.filter((item) => item.id !== commentId));
                return;
            }
            if (queryError || !Array.isArray(data) || data.length !== 1 || !isCommentRow(data[0])) {
                throw new Error(queryError?.message ?? 'Could not refresh the new comment.');
            }
            const item = mapComment(data[0]);
            setComments((previous) => [...previous.filter((row) => row.id !== item.id), item]
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)));
        } catch (failure) {
            if (version === generation.current) {
                console.error('Refresh new comment failed:', failure);
                const message = failure instanceof Error ? failure.message : 'it could not be refreshed.';
                setError(source === 'own' ? `Your comment was saved, but ${message}` : `Could not refresh a live comment: ${message}`);
            }
        }
    }, [postId, userId]);

    useEffect(() => subscribeBoardEvents((event) => {
        if (event.postId !== postId || !event.commentId) return;
        if (event.kind === 'comment_remove') {
            commentVersions.current.set(event.commentId, (commentVersions.current.get(event.commentId) ?? 0) + 1);
            setComments((previous) => previous.filter((item) => item.id !== event.commentId));
        } else if (event.kind === 'comment_insert'
            || (event.kind === 'comment_change' && commentsRef.current.some((item) => item.id === event.commentId))) {
            loadOne(event.commentId, 'live');
        }
    }), [subscribeBoardEvents, postId, loadOne]);

    const setLike = useCallback((commentId: string, liked: boolean) => {
        setComments((previous) => previous.map((item) => item.id === commentId
            ? { ...item, isLiked: liked, likes: item.likes + (liked ? 1 : -1) } : item));
    }, []);

    return { comments, loading, loadingMore, error, loadMoreError, hasMore, refresh, loadMore, loadOne, setLike };
}
