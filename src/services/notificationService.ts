import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import {
    getMessaging,
    onMessage,
    onNotificationOpenedApp,
    getInitialNotification,
} from '@react-native-firebase/messaging';
import { handleNotificationTap, parseMetadata } from './navigation';
import { getCurrentRouteName, getCurrentRouteParams } from '../navigation/NavigationService';
import { ensureFcmToken, listenToTokenRefresh } from './fcmToken';

const CHANNEL_ID = 'karkab_default_channel';

export async function ensureChannel() {
    return notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Default Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
    });
}

/**
 * Checks if the user is currently viewing the active conversation/screen.
 */
function isViewingScreen(targetScreen?: string) {
    if (!targetScreen) return false;
    const currentRoute = getCurrentRouteName();
    return currentRoute === targetScreen;
}

/**
 * Displays a local notification using Notifee when a push message is received.
 */
export async function displayNotification(remoteMessage: any) {
    try {
        const { data = {}, notification } = remoteMessage ?? {};
        const title = notification?.title || data.title;
        const body = notification?.body || data.body;

        // Skip silent data-only messages without display content
        if (!title && !body) {
            console.log('🔇 FCM: Silent data message (no title/body), skipping banner');
            return;
        }

        const channelId = await ensureChannel();

        await notifee.displayNotification({
            title: title || 'KarKab',
            body: body || '',
            data: data || {},
            android: {
                channelId,
                importance: AndroidImportance.HIGH,
                smallIcon: 'ic_launcher',
                pressAction: { id: 'default' },
            },
            ios: {
                foregroundPresentationOptions: {
                    alert: true,
                    sound: true,
                    badge: true,
                },
            },
        });
        console.log('✅ FCM notification displayed via Notifee');
    } catch (e) {
        console.log('❌ displayNotification error:', e);
    }
}

/**
 * Background FCM handler registered in index.js.
 */
export async function firebaseBackgroundMessageHandler(remoteMessage: any) {
    console.log('🌙 FCM background message received:', remoteMessage);
    // If it's a data-only payload and has title or body, display it via Notifee
    if (!remoteMessage?.notification && (remoteMessage?.data?.title || remoteMessage?.data?.body)) {
        await displayNotification(remoteMessage);
    }
}

/**
 * Initializes notification listeners and handlers during app runtime.
 */
export function initNotificationHandlers() {
    const messaging = getMessaging();
    ensureChannel();

    // 1. Foreground FCM message received
    const unsubOnMessage = onMessage(messaging, async remoteMessage => {
        try {
            const data = remoteMessage?.data ?? {};
            console.log('📩 FG FCM message received:', remoteMessage);

            const targetScreen = (data.screen || data.route) as string | undefined;
            if (targetScreen && isViewingScreen(targetScreen)) {
                console.log(`🔕 Notification suppressed — already on screen ${targetScreen}`);
                return;
            }

            await displayNotification(remoteMessage);
        } catch (e) {
            console.log('❌ onMessage error:', e);
        }
    });

    // 2. Notification opened from background (FCM)
    const unsubOpened = onNotificationOpenedApp(messaging, remoteMessage => {
        console.log('📲 Notification opened from background (FCM):', remoteMessage);
        handleNotificationTap({ notification: remoteMessage });
    });

    // 3. App launched from quit state (cold start via FCM notification)
    getInitialNotification(messaging).then(remoteMessage => {
        if (remoteMessage) {
            console.log('🚀 App launched from quit state via notification:', remoteMessage);
            handleNotificationTap({ notification: remoteMessage });
        }
    });

    // 4. Foreground banner pressed (Notifee)
    const unsubFg = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log('👆 Notifee foreground banner pressed:', detail.notification);
            handleNotificationTap({ notification: detail.notification });
        }
    });

    // 5. Listen to token rotation
    const unsubRefresh = listenToTokenRefresh(token => {
        console.log('♻️ New FCM token refreshed and saved:', token);
    });

    return () => {
        unsubOnMessage();
        unsubOpened();
        unsubFg();
        unsubRefresh();
    };
}