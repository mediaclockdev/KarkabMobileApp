import {
    getMessaging,
    getToken,
    onTokenRefresh,
    requestPermission,
    registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee from '@notifee/react-native';
import { storage } from '../share/storage/mmkv';

const FCM_KEY = 'fcm_token';

/**
 * Requests notification permissions across iOS and Android (Android 13+ POST_NOTIFICATIONS).
 */
export async function requestNotificationPermission(): Promise<boolean> {
    try {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            return true;
        } else if (Platform.OS === 'ios') {
            const messaging = getMessaging();
            try {
                await registerDeviceForRemoteMessages(messaging);
            } catch (err) {
                console.log('registerDeviceForRemoteMessages notice:', err);
            }
            const authStatus = await requestPermission(messaging);
            const enabled = authStatus === 1 || authStatus === 2; // Authorized or Provisional

            // Also request via Notifee for local notification permissions
            await notifee.requestPermission();
            return enabled;
        }
    } catch (e) {
        console.log('❌ requestNotificationPermission error:', e);
    }
    return false;
}

/**
 * Reads from storage; fetches + saves if missing or forced.
 */
export async function ensureFcmToken(force = false): Promise<string | null> {
    if (!force) {
        const cached = storage.getString(FCM_KEY);
        if (cached) {
            console.log('🔑 FCM (cached):', cached);
            return cached;
        }
    }

    try {
        await requestNotificationPermission();
        const messaging = getMessaging();

        if (Platform.OS === 'ios') {
            try {
                await registerDeviceForRemoteMessages(messaging);
            } catch {}
        }

        const token = await getToken(messaging);
        if (token) {
            storage.set(FCM_KEY, token);
            console.log('🔑 FCM (new, saved):', token);
            return token;
        }
        return storage.getString(FCM_KEY) ?? null;
    } catch (e) {
        console.log('❌ getToken failed:', e);
        return storage.getString(FCM_KEY) ?? null;
    }
}

export function getCachedFcmToken(): string | null {
    return storage.getString(FCM_KEY) ?? null;
}

/**
 * Apple/Google DO rotate tokens. If you never update, pushes silently
 * die later. So we overwrite storage on refresh and notify backend.
 */
export function listenToTokenRefresh(onNewToken?: (t: string) => void) {
    return onTokenRefresh(getMessaging(), async token => {
        console.log('♻️ Token refreshed:', token);
        storage.set(FCM_KEY, token);
        onNewToken?.(token);
    });
}