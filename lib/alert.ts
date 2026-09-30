import { Alert, Platform } from 'react-native';

/** RN's Alert.alert() is a no-op on react-native-web, so errors silently vanish there. */
export function showAlert(title: string, message?: string): void {
    if (Platform.OS === 'web') {
        window.alert(message ? `${title}\n\n${message}` : title);
        return;
    }
    Alert.alert(title, message);
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText: string;
    destructive?: boolean;
    onConfirm: () => void;
}

/**
 * Cross-platform confirm dialog. Alert.alert() with buttons does nothing on web,
 * which is why confirm-gated actions (log out, block, delete) never fired there.
 */
export function showConfirm({ title, message, confirmText, destructive = false, onConfirm }: ConfirmOptions): void {
    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n\n${message}`)) {
            onConfirm();
        }
        return;
    }
    Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
    ]);
}
