import { Linking } from 'react-native';

export const SUPPORT_EMAIL = 'studysesh.cu@gmail.com';

export function openSupportEmail(subject: string, body?: string): void {
    const query = [`subject=${encodeURIComponent(subject)}`];
    if (body) query.push(`body=${encodeURIComponent(body)}`);
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?${query.join('&')}`).catch(() => {});
}
