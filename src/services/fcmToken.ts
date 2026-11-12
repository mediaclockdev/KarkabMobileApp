import {
    getMessaging,
    getToken,
    getAPNSToken,
    onTokenRefresh,
    requestPermission,
    registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee from '@notifee/react-native';
import { storage } from '../share/storage/mmkv';
import { createChannels } from './channels';

const FCM_KEY = 'fcm_token';

/**
 * Polls for the iOS APNs device token before requesting the FCM token.
 * On iOS, Firebase requires the APNs token to be available first.
 */
export async function waitForApnsToken(retries = 10, delay = 500): Promise<string | null> {
    const messaging = getMessaging();
    for (let i = 0; i < retries; i++) {
        try {
            const apns = await getAPNSToken(messaging);
            if (apns) {
                console.log('🍎 APNS TOKEN =>', apns);
                return apns;
            }
        } catch (err) {
            console.log(`⚠️ APNS token fetch retry ${i + 1}/${retries}:`, err);
        }
        await new Promise(r => setTimeout(r, delay));
    }
    console.log('❌ APNS token unavailable after retries');
    return null;
}

/**
 * Requests notification permissions across iOS and Android (Android 13+ POST_NOTIFICATIONS).
 */
export async function requestNotificationPermission(): Promise<boolean> {
    try {
        if (Platform.OS === 'android') {
            await createChannels();
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

            const authStatus = await requestPermission(messaging, {
                alert: true,
                announcement: true,
                badge: true,
                carPlay: true,
                provisional: false,
                sound: true,
            });

            const enabled = authStatus === 1 || authStatus === 2; // Authorized or Provisional

            // Also request via Notifee for local notification permissions and create channels
            await notifee.requestPermission();
            await createChannels();

            if (enabled) {
                console.log('✅ Notification permission granted');
                await ensureFcmToken(true);
            }

            return enabled;
        }
    } catch (e) {
        console.log('❌ requestNotificationPermission error:', e);
    }
    return false;
}

/**
 * Reads from storage; fetches + saves if missing or forced.
 * On iOS, waits for APNs token first to prevent token fetch errors.
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
        const messaging = getMessaging();

        if (Platform.OS === 'ios') {
            try {
                await registerDeviceForRemoteMessages(messaging);
            } catch (err) {
                console.log('registerDeviceForRemoteMessages error:', err);
            }

            // Wait for APNs token before requesting FCM token
            const apnsToken = await waitForApnsToken();
            if (!apnsToken) {
                console.log('⚠️ APNS token was null; attempting FCM token fetch anyway...');
            }
        }

        const token = await getToken(messaging);
        if (token) {
            storage.set(FCM_KEY, token);
            console.log('🔥 FCM Token =>', token);
            return token;
        }
        return storage.getString(FCM_KEY) ?? null;
    } catch (e) {
        console.log('❌ Error getting FCM token:', e);
        return storage.getString(FCM_KEY) ?? null;
    }
}

export const getFcmTokenAndSave = ensureFcmToken;

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
