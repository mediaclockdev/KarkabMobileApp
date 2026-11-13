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
const APNS_RETRIES = 15;
const APNS_RETRY_DELAY = 500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Polls for the iOS APNs device token before requesting the FCM token.
 * On real iOS devices, Apple generates an APNs token asynchronously.
 */
export async function waitForApnsToken(
    retries = APNS_RETRIES,
    retryDelay = APNS_RETRY_DELAY,
): Promise<string | null> {
    const messaging = getMessaging();
    for (let i = 0; i < retries; i++) {
        try {
            const apnsToken = await getAPNSToken(messaging);
            if (apnsToken) {
                console.log('🍎 APNs Token received:', apnsToken);
                return apnsToken;
            }
        } catch (error) {
            console.log(`⚠️ APNs fetch attempt ${i + 1}/${retries}:`, error);
        }

        if (i < retries - 1) {
            await delay(retryDelay);
        }
    }

    console.log('⚠️ APNs token not received yet after retries (check physical device & network)');
    return null;
}

/**
 * Requests push notification permissions on iOS and Android.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    try {
        if (Platform.OS === 'android') {
            await createChannels();

            let granted = true;
            if (Platform.Version >= 33) {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                );
                granted = result === PermissionsAndroid.RESULTS.GRANTED;
            }

            if (!granted) {
                console.log('❌ Android notification permission denied');
                return false;
            }

            console.log('✅ Android notification permission granted');
            await ensureFcmToken(true);
            return true;
        }

        if (Platform.OS === 'ios') {
            const messaging = getMessaging();

            // 1. Explicitly register device for remote messages with APNs
            try {
                await registerDeviceForRemoteMessages(messaging);
                console.log('✅ iOS registerDeviceForRemoteMessages called');
            } catch (err) {
                console.log('⚠️ registerDeviceForRemoteMessages note:', err);
            }

            // 2. Request user authorization for alerts, badges, and sounds
            const authStatus = await requestPermission(messaging, {
                alert: true,
                badge: true,
                sound: true,
                announcement: true,
                carPlay: true,
                provisional: false,
            });

            // 1 = AUTHORIZED, 2 = PROVISIONAL
            const enabled = authStatus === 1 || authStatus === 2;
            console.log('🍎 iOS Notification Auth Status:', authStatus, enabled ? '(Granted)' : '(Denied)');

            // Also request Notifee local notification permissions
            try {
                await notifee.requestPermission();
                await createChannels();
            } catch (err) {
                console.log('⚠️ Notifee permission note:', err);
            }

            if (!enabled) {
                console.log('❌ iOS push notification permission denied by user');
                return false;
            }

            // 3. Obtain and cache FCM token
            const token = await ensureFcmToken(true);
            console.log('🍎 iOS FCM Token result:', token ? 'Success' : 'Pending APNs');
            return true;
        }
    } catch (error) {
        console.log('❌ Notification permission request failed:', error);
    }
    return false;
}

/**
 * Retrieves the device FCM token.
 * On iOS, verifies APNs availability before requesting from Firebase.
 */
export async function ensureFcmToken(force = false): Promise<string | null> {
    try {
        if (!force) {
            const cachedToken = storage.getString(FCM_KEY);
            if (cachedToken) {
                console.log('🔑 Cached FCM token available:', cachedToken);
                return cachedToken;
            }
        }

        const messaging = getMessaging();

        if (Platform.OS === 'ios') {
            try {
                await registerDeviceForRemoteMessages(messaging);
            } catch (err) {
                console.log('⚠️ registerDeviceForRemoteMessages note:', err);
            }

            // Wait for APNs token to avoid "No APNS token specified" Firebase error
            const apnsToken = await waitForApnsToken();
            if (!apnsToken) {
                console.log('⚠️ Proceeding with FCM token fetch (APNs token pending or simulator)...');
            }
        }

        const token = await getToken(messaging);
        if (!token) {
            console.log('❌ Firebase returned an empty FCM token');
            return null;
        }

        storage.set(FCM_KEY, token);
        console.log('🔥 FCM Token generated successfully:', token);
        return token;
    } catch (error) {
        console.log('❌ FCM token generation failed:', error);
        return storage.getString(FCM_KEY) ?? null;
    }
}

export const getFcmTokenAndSave = ensureFcmToken;

/**
 * Returns the cached FCM token synchronously from MMKV storage.
 */
export function getCachedFcmToken(): string | null {
    return storage.getString(FCM_KEY) ?? null;
}

/**
 * Listens for FCM token rotation from Apple / Google.
 */
export function listenToTokenRefresh(onNewToken?: (token: string) => void) {
    return onTokenRefresh(getMessaging(), async token => {
        try {
            console.log('♻️ FCM token rotated by provider:', token);
            storage.set(FCM_KEY, token);
            onNewToken?.(token);
        } catch (error) {
            console.log('❌ Token refresh handling failed:', error);
        }
    });
}
