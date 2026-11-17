import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { DEMO_MODE } from '../lib/demo';

export interface PushPreferences {
    messages: boolean;
    connections: boolean;
    board: boolean;
}

const EMPTY: PushPreferences = { messages: false, connections: false, board: false };
const TOKEN_KEY = 'studysesh-push-token';
export const PUSH_AVAILABLE = process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true'
    && !DEMO_MODE && (Platform.OS === 'ios' || Platform.OS === 'android');

if (PUSH_AVAILABLE) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
        }),
    });
}

function isPreferences(value: unknown): value is PushPreferences {
    return typeof value === 'object' && value !== null
        && 'messages' in value && typeof value.messages === 'boolean'
        && 'connections' in value && typeof value.connections === 'boolean'
        && 'board' in value && typeof value.board === 'boolean';
}

export function usePushNotifications(userId: string | null, onOpenActivity: () => void) {
    const [preferences, setPreferences] = useState<PushPreferences>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const generation = useRef(0);
    const savingRef = useRef(false);
    const registrationAllowed = useRef(true);
    const pendingRegistration = useRef<Promise<void> | null>(null);
    const onOpenRef = useRef(onOpenActivity);
    onOpenRef.current = onOpenActivity;

    const refresh = useCallback(async () => {
        const version = ++generation.current;
        setPreferences(EMPTY);
        setReady(false);
        setError(null);
        if (!PUSH_AVAILABLE || !userId) { setLoading(false); return; }
        setLoading(true);
        try {
            const { data, error: queryError } = await supabase.from('push_preferences')
                .select('messages, connections, board').eq('user_id', userId).maybeSingle();
            if (version !== generation.current) return;
            if (queryError || (data !== null && !isPreferences(data))) {
                throw new Error(queryError?.message ?? 'Notification preferences were invalid.');
            }
            setPreferences(data ?? EMPTY);
            setReady(true);
        } catch (failure) {
            if (version === generation.current) {
                console.error('Load notification preferences failed:', failure);
                setError(failure instanceof Error ? failure.message : 'Could not load notification preferences.');
            }
        } finally {
            if (version === generation.current) setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        registrationAllowed.current = true;
        refresh();
        return () => { registrationAllowed.current = false; generation.current++; };
    }, [refresh]);

    const unregisterDevice = useCallback(async (suspend: boolean): Promise<string | null> => {
        if (DEMO_MODE || !userId || (Platform.OS !== 'ios' && Platform.OS !== 'android')) return null;
        registrationAllowed.current = false;
        try {
            if (pendingRegistration.current) {
                try { await pendingRegistration.current; } catch (failure) { console.error('Pending push registration failed:', failure); }
            }
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (!token) return null;
            const { error: unregisterError } = await supabase.rpc('unregister_push_device', { p_expected_user: userId, p_token: token });
            if (unregisterError) throw new Error(unregisterError.message);
            await AsyncStorage.removeItem(TOKEN_KEY);
            return null;
        } catch (failure) {
            console.error('Unregister push device failed:', failure);
            return failure instanceof Error ? failure.message : 'Could not unregister this device.';
        } finally {
            if (!suspend) registrationAllowed.current = true;
        }
    }, [userId]);
    const unregisterCurrentDevice = useCallback(() => unregisterDevice(true), [unregisterDevice]);

    useEffect(() => {
        if (PUSH_AVAILABLE || DEMO_MODE || !userId || (Platform.OS !== 'ios' && Platform.OS !== 'android')) return;
        let active = true;
        unregisterDevice(false).then((failure) => {
            if (active && failure) setError(`This device could not be removed from push delivery: ${failure}`);
        });
        return () => { active = false; };
    }, [userId, unregisterDevice]);

    const registerDevice = useCallback(async (requestPermission: boolean) => {
        if (!PUSH_AVAILABLE || !userId) throw new Error('Push notifications are not available on this device.');
        if (!registrationAllowed.current) throw new Error('Push registration is temporarily unavailable.');
        if (pendingRegistration.current) return pendingRegistration.current;
        const operation = (async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'studysesh', importance: Notifications.AndroidImportance.DEFAULT,
            });
        }
        let permission = await Notifications.getPermissionsAsync();
        if (!permission.granted && requestPermission) permission = await Notifications.requestPermissionsAsync();
        if (!permission.granted) throw new Error('Allow notifications in your device settings to enable push.');
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (typeof projectId !== 'string' || !projectId) throw new Error('The Expo project is not configured for push notifications.');
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        const oldToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (!registrationAllowed.current) throw new Error('Push registration was canceled.');
        const { error: registerError } = await supabase.rpc('register_push_device', {
            p_expected_user: userId, p_token: token, p_platform: Platform.OS, p_previous_token: oldToken,
        });
        if (registerError) throw new Error(registerError.message);
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (failure) {
            try {
                const { error: rollbackError } = await supabase.rpc('unregister_push_device', { p_expected_user: userId, p_token: token });
                if (rollbackError) throw new Error(rollbackError.message);
            } catch (rollbackFailure) {
                console.error('Push registration rollback failed:', rollbackFailure);
                throw new Error('This device was registered, but local storage and registration cleanup failed.');
            }
            throw failure;
        }
        })();
        pendingRegistration.current = operation;
        try {
            await operation;
        } finally {
            if (pendingRegistration.current === operation) pendingRegistration.current = null;
        }
    }, [userId]);

    const save = useCallback(async (next: PushPreferences): Promise<string | null> => {
        if (!PUSH_AVAILABLE || !userId) return 'Push notifications are unavailable.';
        if (!ready) return 'Load notification preferences before changing them.';
        if (savingRef.current) return 'Notification preferences are already being saved.';
        const version = generation.current;
        savingRef.current = true;
        setSaving(true);
        setError(null);
        try {
            const enabling = (next.messages && !preferences.messages)
                || (next.connections && !preferences.connections) || (next.board && !preferences.board);
            if (enabling) await registerDevice(true);
            const { error: saveError } = await supabase.rpc('set_push_preferences', {
                p_expected_user: userId, p_messages: next.messages, p_connections: next.connections, p_board: next.board,
            });
            if (saveError) throw new Error(saveError.message);
            if (version === generation.current) setPreferences(next);
            if (!next.messages && !next.connections && !next.board) {
                const unregisterError = await unregisterDevice(false);
                if (unregisterError) return `Preferences were saved, but this device could not be unregistered: ${unregisterError}`;
            }
            return null;
        } catch (failure) {
            console.error('Save notification preferences failed:', failure);
            return failure instanceof Error ? failure.message : 'Could not save notification preferences.';
        } finally {
            savingRef.current = false;
            if (version === generation.current) setSaving(false);
        }
    }, [userId, ready, preferences, registerDevice, unregisterDevice]);

    useEffect(() => {
        if (!PUSH_AVAILABLE || !userId || loading || !(preferences.messages || preferences.connections || preferences.board)) return;
        let active = true;
        const register = () => registerDevice(false).catch((failure) => {
            if (active) {
                console.error('Refresh push registration failed:', failure);
                setError(failure instanceof Error ? failure.message : 'Could not register this device for push.');
            }
        });
        register();
        const subscription = Notifications.addPushTokenListener(register);
        return () => { active = false; subscription.remove(); };
    }, [userId, loading, preferences.messages, preferences.connections, preferences.board, registerDevice]);

    useEffect(() => {
        if (!PUSH_AVAILABLE || !userId) return;
        const handle = (response: Notifications.NotificationResponse | null) => {
            const activityId = response?.notification.request.content.data?.activityId;
            if (typeof activityId !== 'string') return;
            onOpenRef.current();
            Notifications.clearLastNotificationResponse();
        };
        const subscription = Notifications.addNotificationResponseReceivedListener(handle);
        try {
            handle(Notifications.getLastNotificationResponse());
        } catch (failure) {
            console.error('Open last notification failed:', failure);
            setError(failure instanceof Error ? failure.message : 'Could not open the notification.');
        }
        return () => subscription.remove();
    }, [userId]);

    return { available: PUSH_AVAILABLE, preferences, loading, ready, saving, error, refresh, save, unregisterCurrentDevice };
}
