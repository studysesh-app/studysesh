import { supabase } from './supabase';
import { avatarStoragePath } from './avatar';

async function uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return await response.blob();
}

function extFromUri(uri: string, fallback: string): string {
    const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    return match ? match[1].toLowerCase() : fallback;
}

/** Uploads a local image URI and returns its private avatar storage path. */
export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
    const blob = await uriToBlob(localUri);
    const ext = extFromUri(localUri, 'jpg');
    const path = `${userId}/avatar-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const { error } = await supabase.storage.from('avatars').upload(path, blob, {
        contentType: blob.type || `image/${ext}`,
        upsert: false,
    });
    if (error) throw error;

    return path;
}

export async function removeOwnedAvatar(userId: string, reference: string): Promise<void> {
    const path = avatarStoragePath(reference);
    if (!path.startsWith(`${userId}/`)) throw new Error('The previous photo does not belong to this account.');
    const { error } = await supabase.storage.from('avatars').remove([path]);
    if (error) throw error;
}

/** Uploads a local file URI to the private `proofs` bucket and returns its storage path. */
export async function uploadTutorProof(userId: string, courseCode: string, localUri: string, mimeType?: string): Promise<string> {
    const blob = await uriToBlob(localUri);
    if (blob.size > 10 * 1024 * 1024) throw new Error('Choose a file no larger than 10 MB.');
    const type = mimeType || blob.type;
    if (type !== 'application/pdf' && !type.startsWith('image/')) {
        throw new Error('Choose a PDF or an image file.');
    }
    const ext = extFromUri(localUri, type === 'application/pdf' ? 'pdf' : 'jpg');
    const path = `${userId}/${courseCode.replace(/\s+/g, '_')}.${ext}`;

    const { error } = await supabase.storage.from('proofs').upload(path, blob, {
        contentType: type,
        upsert: true,
    });
    if (error) throw error;

    return path;
}

/** Creates a temporary signed URL for a private proof file (e.g. for admin review). */
export async function getProofSignedUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
    const { data, error } = await supabase.storage.from('proofs').createSignedUrl(path, expiresInSeconds);
    if (error) return null;
    return data.signedUrl;
}
