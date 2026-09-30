/**
 * Demo mode: lets the app run fully offline with mock data — no Supabase needed.
 *
 * Toggle via .env → EXPO_PUBLIC_DEMO_MODE=true|false (restart Expo with -c after changing).
 * When true:
 *   - Auth accepts any email/password/OTP code (see hooks/useAuth.ts)
 *   - Course search uses the local courses.json instead of the courses table
 * When false, the app talks to the real Supabase project configured in .env.
 */
import coursesJson from '../courses.json';

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

/** Name shown in the UI. Uses the profile name when set; "Test User" only in demo. */
export function displayName(name?: string | null): string {
    const trimmed = name?.trim();
    if (trimmed) return trimmed;
    return DEMO_MODE ? 'Test User' : '';
}

export interface DemoCourse {
    id: string;
    code: string;
    name: string;
}

const allCourses = coursesJson as Array<{ code: string; name: string }>;

/** Mirrors the Supabase query in CourseInputModal: match code or name, sorted by code. */
export function searchCoursesDemo(query: string, limit = 20): DemoCourse[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return allCourses
        .filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
        .sort((a, b) => a.code.localeCompare(b.code))
        .slice(0, limit)
        .map((c) => ({ id: c.code, code: c.code, name: c.name }));
}
