import { useEffect, useState } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { supabase } from '../lib/supabase';
import { avatarStoragePath, isLocalImageReference } from '../lib/avatar';

interface PrivateAvatarProps {
    reference: string;
    style: StyleProp<ImageStyle>;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    fallback: (state: { loading: boolean; error: string | null; retry: () => void }) => React.ReactNode;
}

export function PrivateAvatar({ reference, style, resizeMode = 'cover', fallback }: PrivateAvatarProps) {
    const [uri, setUri] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout> | undefined;
        setUri(null);
        setError(null);
        setLoading(true);
        if (isLocalImageReference(reference)) {
            setUri(reference);
            setLoading(false);
            return () => { active = false; };
        }
        const load = async () => {
            try {
                const path = avatarStoragePath(reference);
                const { data, error: signingError } = await supabase.storage.from('avatars').createSignedUrl(path, 300);
                if (signingError || !data?.signedUrl) throw new Error(signingError?.message ?? 'Could not load the avatar.');
                if (!active) return;
                setUri(data.signedUrl);
                setError(null);
                setLoading(false);
                timer = setTimeout(load, 240000);
            } catch (failure) {
                if (!active) return;
                const message = failure instanceof Error ? failure.message : 'Could not load the avatar.';
                console.error('Load avatar failed:', failure);
                setUri(null);
                setError(message);
                setLoading(false);
            }
        };
        load();
        return () => { active = false; if (timer) clearTimeout(timer); };
    }, [reference, retryCount]);

    if (!uri) return fallback({ loading, error, retry: () => setRetryCount((count) => count + 1) });
    return (
        <Image
            source={{ uri }}
            style={style}
            resizeMode={resizeMode}
            onError={(event) => {
                console.error('Render avatar failed:', event.nativeEvent.error);
                setUri(null);
                setError('Could not display this photo.');
                setLoading(false);
            }}
        />
    );
}
