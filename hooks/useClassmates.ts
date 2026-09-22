import { useState, useEffect, useCallback } from 'react';
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

/** Classmate discovery — calls the `classmates` Edge Function, which does the cross-user matching. */
export function useClassmates(userId: string | null) {
    const [classmates, setClassmates] = useState<ClassmateProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (DEMO_MODE || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke('classmates', { body: { limit: 30 } });
        if (fnError) {
            console.error('classmates function error:', fnError);
            setError(fnError.message);
            setClassmates([]);
        } else {
            setClassmates(
                (data?.classmates ?? []).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    pronouns: c.pronouns ?? [],
                    gender: c.gender,
                    year: c.year,
                    major: c.major,
                    photoUrl: c.photoUrl,
                    bio: c.bio,
                    sharedCourses: c.sharedCourses ?? [],
                    prompts: c.prompts ?? [],
                }))
            );
        }
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { classmates, loading, error, refresh };
}
