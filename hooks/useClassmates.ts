import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';

export interface ClassmateProfile {
    id: string;
    name: string;
    pronouns: string[];
    gender: string;
    year: string;
    major: string;
    photoUrl: string | null;
    bio: string | null;
    sharedCourses: string[];
    prompts: Array<{ prompt: string; answer: string }>;
}

interface ClassmateRow {
    id: string;
    name: string;
    pronouns: string[] | null;
    gender: string;
    year: string | null;
    major: string | null;
    photo_url: string | null;
    bio: string | null;
    shared_courses: string[];
    prompts: Array<{ prompt: string; answer: string }>;
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isClassmateRow(value: unknown): value is ClassmateRow {
    if (typeof value !== 'object' || value === null) return false;
    const row: Record<string, unknown> = { ...value };
    const nullableString = (item: unknown) => item === null || typeof item === 'string';
    return typeof row.id === 'string' && typeof row.name === 'string'
        && (row.pronouns === null || isStringArray(row.pronouns))
        && typeof row.gender === 'string' && nullableString(row.year) && nullableString(row.major)
        && nullableString(row.photo_url) && nullableString(row.bio) && isStringArray(row.shared_courses)
        && Array.isArray(row.prompts) && row.prompts.every((item: unknown) =>
            typeof item === 'object' && item !== null && 'prompt' in item && typeof item.prompt === 'string'
            && 'answer' in item && typeof item.answer === 'string');
}

const PAGE_SIZE = 30;

export function useClassmates(userId: string | null) {
    const [classmates, setClassmates] = useState<ClassmateProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const generation = useRef(0);
    const inFlight = useRef(false);

    const fetchPage = useCallback(async (after: string | null, version: number) => {
        const { data, error: queryError } = await supabase.rpc('classmate_page', {
            p_after: after, p_limit: PAGE_SIZE,
        });
        if (version !== generation.current) return;
        if (queryError || !Array.isArray(data) || !data.every(isClassmateRow)) {
            const message = queryError?.message ?? 'The classmate list returned an invalid response.';
            console.error('Fetch classmates error:', queryError ?? message);
            if (after) setLoadMoreError(message);
            else setError(message);
            return;
        }

        const page = data.slice(0, PAGE_SIZE);
        const mapped = page.map((row): ClassmateProfile => ({
            id: row.id,
            name: row.name,
            pronouns: row.pronouns ?? [],
            gender: row.gender,
            year: row.year ?? '',
            major: row.major ?? '',
            photoUrl: row.photo_url,
            bio: row.bio,
            sharedCourses: row.shared_courses,
            prompts: row.prompts,
        }));
        setClassmates((previous) => after
            ? [...previous, ...mapped.filter((item) => !previous.some((existing) => existing.id === item.id))]
            : mapped);
        setHasMore(data.length > PAGE_SIZE);
        setCursor(page.length > 0 ? page[page.length - 1].id : null);
    }, []);

    const refresh = useCallback(async () => {
        const version = ++generation.current;
        inFlight.current = false;
        setLoadMoreError(null);
        setError(null);
        setCursor(null);
        setHasMore(false);
        setLoadingMore(false);
        setClassmates([]);
        if (DEMO_MODE || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            await fetchPage(null, version);
        } catch (err) {
            if (version === generation.current) {
                console.error('Fetch classmates failed:', err);
                setError(err instanceof Error ? err.message : 'Could not load classmates.');
            }
        } finally {
            if (version === generation.current) setLoading(false);
        }
    }, [userId, fetchPage]);

    const loadMore = useCallback(async () => {
        if (!userId || !hasMore || !cursor || inFlight.current) return;
        const version = generation.current;
        inFlight.current = true;
        setLoadingMore(true);
        setLoadMoreError(null);
        try {
            await fetchPage(cursor, version);
        } catch (err) {
            if (version === generation.current) {
                console.error('Load more classmates failed:', err);
                setLoadMoreError(err instanceof Error ? err.message : 'Could not load more classmates.');
            }
        } finally {
            if (version === generation.current) {
                inFlight.current = false;
                setLoadingMore(false);
            }
        }
    }, [userId, hasMore, cursor, fetchPage]);

    useEffect(() => {
        refresh();
        return () => { generation.current++; };
    }, [refresh]);

    return { classmates, loading, error, refresh, hasMore, loadingMore, loadMoreError, loadMore };
}
