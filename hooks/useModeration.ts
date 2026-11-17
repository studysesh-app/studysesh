import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';

export interface ModerationReport {
    id: string;
    reporter_id: string;
    reporter_name: string | null;
    reported_id: string;
    reported_name: string | null;
    reason: string | null;
    created_at: string;
}

function isReport(value: unknown): value is ModerationReport {
    if (typeof value !== 'object' || value === null) return false;
    const row: Record<string, unknown> = { ...value };
    const nullableString = (item: unknown) => item === null || typeof item === 'string';
    return typeof row.id === 'string' && typeof row.reporter_id === 'string'
        && nullableString(row.reporter_name) && typeof row.reported_id === 'string'
        && nullableString(row.reported_name) && nullableString(row.reason) && typeof row.created_at === 'string';
}

export function useModeration(userId: string | null) {
    const [isModerator, setIsModerator] = useState(false);
    const [accessError, setAccessError] = useState<string | null>(null);
    const [reports, setReports] = useState<ModerationReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState<{ createdAt: string; id: string } | null>(null);
    const generation = useRef(0);
    const inFlight = useRef(false);

    const checkAccess = useCallback(async () => {
        const version = ++generation.current;
        setIsModerator(false);
        setAccessError(null);
        setReports([]);
        if (DEMO_MODE || !userId) return;
        try {
            const { data, error: accessFailure } = await supabase.rpc('is_moderator');
            if (version !== generation.current) return;
            if (accessFailure || typeof data !== 'boolean') {
                throw new Error(accessFailure?.message ?? 'Could not verify moderator access.');
            }
            setIsModerator(data);
        } catch (failure) {
            if (version === generation.current) {
                console.error('Moderator access check failed:', failure);
                setAccessError(failure instanceof Error ? failure.message : 'Could not verify moderator access.');
            }
        }
    }, [userId]);

    useEffect(() => {
        checkAccess();
        return () => { generation.current++; };
    }, [checkAccess]);

    const fetchPage = useCallback(async (after: { createdAt: string; id: string } | null, version: number) => {
        const { data, error: queryError } = await supabase.rpc('report_queue', {
            p_before_at: after?.createdAt ?? null, p_before_id: after?.id ?? null, p_limit: 30,
        });
        if (version !== generation.current) return;
        if (queryError || !Array.isArray(data) || !data.every(isReport)) {
            throw new Error(queryError?.message ?? 'The report queue returned an invalid response.');
        }
        const page = data.slice(0, 30);
        setReports((previous) => after
            ? [...previous, ...page.filter((row) => !previous.some((item) => item.id === row.id))]
            : page);
        setHasMore(data.length > 30);
        const last = page[page.length - 1];
        setCursor(last ? { createdAt: last.created_at, id: last.id } : null);
    }, []);

    const refresh = useCallback(async () => {
        if (!isModerator) return;
        const version = ++generation.current;
        inFlight.current = false;
        setLoading(true);
        setLoadingMore(false);
        setError(null);
        setReports([]);
        setCursor(null);
        setHasMore(false);
        try {
            await fetchPage(null, version);
        } catch (failure) {
            if (version === generation.current) {
                console.error('Fetch reports failed:', failure);
                setError(failure instanceof Error ? failure.message : 'Could not load reports.');
            }
        } finally {
            if (version === generation.current) setLoading(false);
        }
    }, [isModerator, fetchPage]);

    const loadMore = useCallback(async () => {
        if (!isModerator || !hasMore || !cursor || inFlight.current) return;
        const version = generation.current;
        inFlight.current = true;
        setLoadingMore(true);
        setError(null);
        try {
            await fetchPage(cursor, version);
        } catch (failure) {
            if (version === generation.current) {
                console.error('Load more reports failed:', failure);
                setError(failure instanceof Error ? failure.message : 'Could not load more reports.');
            }
        } finally {
            if (version === generation.current) {
                inFlight.current = false;
                setLoadingMore(false);
            }
        }
    }, [isModerator, hasMore, cursor, fetchPage]);

    const resolve = useCallback(async (reportId: string, decision: 'reviewed' | 'dismissed'): Promise<string | null> => {
        if (!isModerator) return 'Moderator access required.';
        const version = generation.current;
        try {
            const { error: resolveError } = await supabase.rpc('resolve_report', { p_report_id: reportId, p_decision: decision });
            if (resolveError) throw new Error(resolveError.message);
            if (version !== generation.current) return 'The report was saved, but the queue changed. Refresh to see the result.';
            setReports((previous) => previous.filter((report) => report.id !== reportId));
            return null;
        } catch (failure) {
            console.error('Resolve report failed:', failure);
            return failure instanceof Error ? failure.message : 'Could not resolve the report.';
        }
    }, [isModerator]);

    return { isModerator, accessError, checkAccess, reports, loading, loadingMore, error, hasMore, refresh, loadMore, resolve };
}
