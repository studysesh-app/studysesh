import { supabase } from './supabase';

async function uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return await response.blob();
}

function extFromUri(uri: string, fallback: string): string {
    const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    return match ? match[1].toLowerCase() : fallback;
}

/** Uploads a local image URI (from ImagePicker) to the public `avatars` bucket and returns a cache-busted public URL. */
export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
    const blob = await uriToBlob(localUri);
    const ext = extFromUri(localUri, 'jpg');
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage.from('avatars').upload(path, blob, {
        contentType: blob.type || `image/${ext}`,
        upsert: true,
    });
    if (error) throw error;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
}

/** Uploads a local file URI to the private `proofs` bucket and returns its storage path. */
export async function uploadTutorProof(userId: string, courseCode: string, localUri: string): Promise<string> {
    const blob = await uriToBlob(localUri);
    const ext = extFromUri(localUri, 'jpg');
    const path = `${userId}/${courseCode.replace(/\s+/g, '_')}.${ext}`;

    const { error } = await supabase.storage.from('proofs').upload(path, blob, {
        contentType: blob.type || 'application/octet-stream',
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
