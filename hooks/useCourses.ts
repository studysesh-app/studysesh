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

export interface TutorCoursePricing {
    code: string;
    groupPrice: number | null;
    individualPrice: number | null;
    sessionType: 'online' | 'in-person' | 'both';
}

export function useCourses(userId: string | null) {
    const [studyingCourses, setStudyingCourses] = useState<string[]>([]);
    const [tutoringCourses, setTutoringCourses] = useState<string[]>([]);
    const [tutorPricing, setTutorPricing] = useState<TutorCoursePricing[]>([]);
    const [catalog, setCatalog] = useState<CourseSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (DEMO_MODE || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        const [myCoursesResult, myTutorsResult] = await Promise.all([
            supabase.from('user_courses').select('courses(code)').eq('user_id', userId),
            supabase.from('tutor_courses').select('group_price, individual_price, session_type, courses(code)').eq('user_id', userId),
        ]);
        if (myCoursesResult.error || myTutorsResult.error) {
            const queryError = myCoursesResult.error ?? myTutorsResult.error!;
            console.error('Fetch enrolled courses error:', queryError);
            setError(queryError.message);
            setLoading(false);
            return;
        }
        const myCourseRows = myCoursesResult.data;
        const myTutorRows = myTutorsResult.data;

        const studying = (myCourseRows ?? []).map((r: any) => r.courses?.code).filter(Boolean);
        const tutoring = (myTutorRows ?? []).map((r: any) => r.courses?.code).filter(Boolean);
        setStudyingCourses(studying);
        setTutoringCourses(tutoring);
        setTutorPricing(
            (myTutorRows ?? [])
                .filter((r: any) => r.courses?.code)
                .map((r: any) => ({
                    code: r.courses.code as string,
                    groupPrice: r.group_price != null ? Number(r.group_price) : null,
                    individualPrice: r.individual_price != null ? Number(r.individual_price) : null,
                    sessionType: (r.session_type as TutorCoursePricing['sessionType']) || 'both',
                }))
        );

        const codes = [...new Set([...studying, ...tutoring])];
        if (codes.length > 0) {
            const { data: courseRows, error: courseError } = await supabase.from('courses').select('id, code, name').in('code', codes);
            if (courseError) {
                console.error('Fetch course catalog error:', courseError);
                setError(courseError.message);
                setLoading(false);
                return;
            }
            const summaryResults = await Promise.all(
                (courseRows ?? []).map(async (c) => {
                    const counts = await Promise.all([
                        supabase.from('user_courses').select('*', { count: 'exact', head: true }).eq('course_id', c.id),
                        supabase.from('tutor_courses').select('*', { count: 'exact', head: true }).eq('course_id', c.id),
                        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('course_id', c.id),
                    ]);
                    const countError = counts.find((result) => result.error)?.error;
                    if (countError) return { error: countError.message, summary: null };
                    return {
                        error: null,
                        summary: {
                            code: c.code,
                            name: c.name,
                            studentCount: counts[0].count ?? 0,
                            tutorCount: counts[1].count ?? 0,
                            activeCount: counts[2].count ?? 0,
                        },
                    };
                })
            );
            const countError = summaryResults.find((result) => result.error)?.error;
            if (countError) {
                console.error('Fetch course counts error:', countError);
                setError(countError);
                setLoading(false);
                return;
            }
            setCatalog(summaryResults.flatMap((result) => result.summary ? [result.summary] : []));
        } else {
            setCatalog([]);
        }

        setLoading(false);
    }, [userId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addStudyingCourse = useCallback(async (code: string): Promise<string | null> => {
        if (DEMO_MODE || !userId) {
            setStudyingCourses((prev) => [...new Set([...prev, code])]);
            return null;
        }
        setError(null);
        const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', code).single();
        if (courseError || !course) {
            const message = courseError?.message ?? `Course ${code} was not found.`;
            setError(message);
            return message;
        }
        const { error } = await supabase.from('user_courses').insert({ user_id: userId, course_id: course.id });
        if (error) {
            console.error('Enroll in course error:', error);
            setError(error.message);
            return error.message;
        }
        await refresh();
        return null;
    }, [userId, refresh]);

    const removeStudyingCourse = useCallback(async (code: string): Promise<string | null> => {
        if (DEMO_MODE || !userId) {
            setStudyingCourses((prev) => prev.filter((c) => c !== code));
            return null;
        }
        setError(null);
        const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', code).single();
        if (courseError || !course) {
            const message = courseError?.message ?? `Course ${code} was not found.`;
            setError(message);
            return message;
        }
        const { error } = await supabase.from('user_courses').delete().eq('user_id', userId).eq('course_id', course.id);
        if (error) {
            console.error('Unenroll from course error:', error);
            setError(error.message);
            return error.message;
        }
        await refresh();
        return null;
    }, [userId, refresh]);

    const setAllStudyingCourses = useCallback(async (codes: string[]): Promise<string | null> => {
        if (DEMO_MODE || !userId) {
            setStudyingCourses(codes);
            return null;
        }
        const toAdd = codes.filter((c) => !studyingCourses.includes(c));
        const toRemove = studyingCourses.filter((c) => !codes.includes(c));
        const results = await Promise.all([...toAdd.map(addStudyingCourse), ...toRemove.map(removeStudyingCourse)]);
        return results.find((result) => result !== null) ?? null;
    }, [studyingCourses, addStudyingCourse, removeStudyingCourse]);

    const addTutoringCourse = useCallback(
        async (code: string, opts?: { groupPrice?: number; individualPrice?: number; proofUrl?: string }): Promise<string | null> => {
            if (DEMO_MODE || !userId) {
                setTutoringCourses((prev) => [...new Set([...prev, code])]);
                return null;
            }
            setError(null);
            const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', code).single();
            if (courseError || !course) {
                const message = courseError?.message ?? `Course ${code} was not found.`;
                setError(message);
                return message;
            }
            const { error } = await supabase.from('tutor_courses').insert({
                user_id: userId,
                course_id: course.id,
                group_price: opts?.groupPrice ?? null,
                individual_price: opts?.individualPrice ?? null,
                proof_url: opts?.proofUrl ?? null,
                is_approved: true,
            });
            if (error) {
                console.error('Add tutoring course error:', error);
                setError(error.message);
                return error.message;
            }
            await refresh();
            return null;
        },
        [userId, refresh]
    );

    const removeTutoringCourse = useCallback(async (code: string): Promise<string | null> => {
        if (DEMO_MODE || !userId) {
            setTutoringCourses((prev) => prev.filter((c) => c !== code));
            return null;
        }
        setError(null);
        const { data: course, error: courseError } = await supabase.from('courses').select('id').eq('code', code).single();
        if (courseError || !course) {
            const message = courseError?.message ?? `Course ${code} was not found.`;
            setError(message);
            return message;
        }
        const { error } = await supabase.from('tutor_courses').delete().eq('user_id', userId).eq('course_id', course.id);
        if (error) {
            console.error('Remove tutoring course error:', error);
            setError(error.message);
            return error.message;
        }
        await refresh();
        return null;
    }, [userId, refresh]);

    /** Saves the full tutoring course list, uploading any newly-picked proof files (keyed by course code). */
    const setAllTutoringCourses = useCallback(
        async (codes: string[], proofUris?: Record<string, string>) => {
            if (DEMO_MODE || !userId) {
                setTutoringCourses(codes);
                return null;
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
                        const message = e instanceof Error ? e.message : 'Tutor proof upload failed.';
                        setError(message);
                        return message;
                    }
                }
                const error = await addTutoringCourse(code, { proofUrl });
                if (error) return error;
            }
            const results = await Promise.all(toRemove.map(removeTutoringCourse));
            return results.find((result) => result !== null) ?? null;
        },
        [tutoringCourses, addTutoringCourse, removeTutoringCourse, userId]
    );

    const saveTutoringPricing = useCallback(
        async (data: {
            applyToAll: boolean;
            globalGroupPrice: number;
            globalIndividualPrice: number;
            perCoursePricing: Record<string, { group: number; individual: number }>;
            sessionType: 'online' | 'in-person' | 'both';
        }): Promise<string | null> => {
            if (DEMO_MODE || !userId) {
                setTutorPricing((prev) =>
                    prev.map((p) => ({
                        ...p,
                        sessionType: data.sessionType,
                        groupPrice: data.applyToAll ? data.globalGroupPrice : (data.perCoursePricing[p.code]?.group ?? p.groupPrice),
                        individualPrice: data.applyToAll
                            ? data.globalIndividualPrice
                            : (data.perCoursePricing[p.code]?.individual ?? p.individualPrice),
                    }))
                );
                return null;
            }
            setError(null);
            const { data: rows, error: rowsError } = await supabase
                .from('tutor_courses')
                .select('course_id, courses(code)')
                .eq('user_id', userId);
            if (rowsError) {
                console.error('Load tutoring courses for pricing error:', rowsError);
                setError(rowsError.message);
                return rowsError.message;
            }
            for (const row of rows ?? []) {
                const code = (row as any).courses?.code as string | undefined;
                if (!code) continue;
                const group = data.applyToAll ? data.globalGroupPrice : (data.perCoursePricing[code]?.group ?? data.globalGroupPrice);
                const individual = data.applyToAll
                    ? data.globalIndividualPrice
                    : (data.perCoursePricing[code]?.individual ?? data.globalIndividualPrice);
                const { error } = await supabase
                    .from('tutor_courses')
                    .update({
                        group_price: group,
                        individual_price: individual,
                        session_type: data.sessionType,
                    })
                    .eq('user_id', userId)
                    .eq('course_id', (row as any).course_id);
                if (error) {
                    console.error('Save tutor pricing error:', error);
                    setError(error.message);
                    return error.message;
                }
            }
            await refresh();
            return null;
        },
        [userId, refresh]
    );

    return {
        studyingCourses,
        tutoringCourses,
        catalog,
        loading,
        error,
        addStudyingCourse,
        removeStudyingCourse,
        setAllStudyingCourses,
        addTutoringCourse,
        removeTutoringCourse,
        setAllTutoringCourses,
        tutorPricing,
        saveTutoringPricing,
        refresh,
    };
}
