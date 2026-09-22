import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';
import { uploadTutorProof } from '../lib/storage';

export interface CourseSummary {
    code: string;
    name: string;
    activeCount: number;
    tutorCount: number;
    studentCount: number;
}

export function useCourses(userId: string | null) {
    const [studyingCourses, setStudyingCourses] = useState<string[]>([]);
    const [tutoringCourses, setTutoringCourses] = useState<string[]>([]);
    const [catalog, setCatalog] = useState<CourseSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (DEMO_MODE || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const [{ data: myCourseRows }, { data: myTutorRows }] = await Promise.all([
            supabase.from('user_courses').select('courses(code)').eq('user_id', userId),
            supabase.from('tutor_courses').select('courses(code)').eq('user_id', userId),
        ]);

        const studying = (myCourseRows ?? []).map((r: any) => r.courses?.code).filter(Boolean);
        const tutoring = (myTutorRows ?? []).map((r: any) => r.courses?.code).filter(Boolean);
        setStudyingCourses(studying);
        setTutoringCourses(tutoring);

        const codes = [...new Set([...studying, ...tutoring])];
        if (codes.length > 0) {
            const { data: courseRows } = await supabase.from('courses').select('id, code, name').in('code', codes);
            const summaries = await Promise.all(
                (courseRows ?? []).map(async (c) => {
                    const [{ count: studentCount }, { count: tutorCount }, { count: activeCount }] = await Promise.all([
                        supabase.from('user_courses').select('*', { count: 'exact', head: true }).eq('course_id', c.id),
                        supabase.from('tutor_courses').select('*', { count: 'exact', head: true }).eq('course_id', c.id),
                        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('course_id', c.id),
                    ]);
                    return {
                        code: c.code,
                        name: c.name,
                        studentCount: studentCount ?? 0,
                        tutorCount: tutorCount ?? 0,
                        activeCount: activeCount ?? 0,
                    };
                })
            );
            setCatalog(summaries);
        } else {
            setCatalog([]);
        }

        setLoading(false);
    }, [userId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addStudyingCourse = useCallback(async (code: string) => {
        if (DEMO_MODE || !userId) {
            setStudyingCourses((prev) => [...new Set([...prev, code])]);
            return;
        }
        const { data: course } = await supabase.from('courses').select('id').eq('code', code).single();
        if (!course) return;
        await supabase.from('user_courses').insert({ user_id: userId, course_id: course.id });
        await refresh();
    }, [userId, refresh]);

    const removeStudyingCourse = useCallback(async (code: string) => {
        if (DEMO_MODE || !userId) {
            setStudyingCourses((prev) => prev.filter((c) => c !== code));
            return;
        }
        const { data: course } = await supabase.from('courses').select('id').eq('code', code).single();
        if (!course) return;
        await supabase.from('user_courses').delete().eq('user_id', userId).eq('course_id', course.id);
        await refresh();
    }, [userId, refresh]);

    const setAllStudyingCourses = useCallback(async (codes: string[]) => {
        if (DEMO_MODE || !userId) {
            setStudyingCourses(codes);
            return;
        }
        const toAdd = codes.filter((c) => !studyingCourses.includes(c));
        const toRemove = studyingCourses.filter((c) => !codes.includes(c));
        await Promise.all([...toAdd.map((c) => addStudyingCourse(c)), ...toRemove.map((c) => removeStudyingCourse(c))]);
    }, [studyingCourses, addStudyingCourse, removeStudyingCourse]);

    const addTutoringCourse = useCallback(
        async (code: string, opts?: { groupPrice?: number; individualPrice?: number; proofUrl?: string }) => {
            if (DEMO_MODE || !userId) {
                setTutoringCourses((prev) => [...new Set([...prev, code])]);
                return;
            }
            const { data: course } = await supabase.from('courses').select('id').eq('code', code).single();
            if (!course) return;
            await supabase.from('tutor_courses').insert({
                user_id: userId,
                course_id: course.id,
                group_price: opts?.groupPrice ?? null,
                individual_price: opts?.individualPrice ?? null,
                proof_url: opts?.proofUrl ?? null,
                is_approved: true,
            });
            await refresh();
        },
        [userId, refresh]
    );

    const removeTutoringCourse = useCallback(async (code: string) => {
        if (DEMO_MODE || !userId) {
            setTutoringCourses((prev) => prev.filter((c) => c !== code));
            return;
        }
        const { data: course } = await supabase.from('courses').select('id').eq('code', code).single();
        if (!course) return;
        await supabase.from('tutor_courses').delete().eq('user_id', userId).eq('course_id', course.id);
        await refresh();
    }, [userId, refresh]);

    /** Saves the full tutoring course list, uploading any newly-picked proof files (keyed by course code). */
    const setAllTutoringCourses = useCallback(
        async (codes: string[], proofUris?: Record<string, string>) => {
            if (DEMO_MODE || !userId) {
                setTutoringCourses(codes);
                return;
            }
            const toAdd = codes.filter((c) => !tutoringCourses.includes(c));
            const toRemove = tutoringCourses.filter((c) => !codes.includes(c));

            for (const code of toAdd) {
                let proofUrl: string | undefined;
                const uri = proofUris?.[code];
                if (uri) {
                    try {
                        proofUrl = await uploadTutorProof(userId, code, uri);
                    } catch (e) {
                        console.error('Proof upload failed:', e);
                    }
                }
                await addTutoringCourse(code, { proofUrl });
            }
            await Promise.all(toRemove.map((c) => removeTutoringCourse(c)));
        },
        [tutoringCourses, addTutoringCourse, removeTutoringCourse, userId]
    );

    return {
        studyingCourses,
        tutoringCourses,
        catalog,
        loading,
        addStudyingCourse,
        removeStudyingCourse,
        setAllStudyingCourses,
        addTutoringCourse,
        removeTutoringCourse,
        setAllTutoringCourses,
        refresh,
    };
}
