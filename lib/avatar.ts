const AVATAR_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[^/]+$/i;

/** Accept current storage paths and legacy public URLs from this project's avatar bucket. */
export function avatarStoragePath(reference: string): string {
    let path = reference;
    if (/^https?:/i.test(reference)) {
        const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        if (!configuredUrl) throw new Error('Avatar storage is not configured.');
        const url = new URL(reference);
        if (url.origin !== new URL(configuredUrl).origin) throw new Error('The avatar URL is not from this project.');
        const prefix = '/storage/v1/object/public/avatars/';
        if (!url.pathname.startsWith(prefix)) throw new Error('The avatar URL is not a public avatar reference.');
        path = decodeURIComponent(url.pathname.slice(prefix.length));
    }
    if (!AVATAR_PATH.test(path) || path.includes('..')) throw new Error('The avatar storage path is invalid.');
    return path;
}

export function isLocalImageReference(reference: string): boolean {
    return /^(file:|content:|blob:|data:)/i.test(reference);
}
