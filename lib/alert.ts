import { Alert, Platform } from 'react-native';

/** RN's Alert.alert() is a no-op on react-native-web, so errors silently vanish there. */
export function showAlert(title: string, message?: string): void {
    if (Platform.OS === 'web') {
        window.alert(message ? `${title}\n\n${message}` : title);
        return;
    }
    Alert.alert(title, message);
}
