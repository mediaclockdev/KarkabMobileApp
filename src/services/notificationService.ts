import notifee, {
    AndroidImportance,
    EventType,
    type Notification,
} from '@notifee/react-native';
import {
    getMessaging,
    onMessage,
    onNotificationOpenedApp,
    getInitialNotification,
} from '@react-native-firebase/messaging';
import { handleNotificationTap } from './navigation';
import { getCurrentRouteName } from '../navigation/NavigationService';
import { listenToTokenRefresh } from './fcmToken';
import { createChannels } from './channels';

export { createChannels };

type NotificationParams = {
    dispatch?: any;
    serviceProvider?: any;
};

/**
 * Checks if the user is currently viewing the active conversation/screen.
 */
function isViewingScreen(targetScreen?: string): boolean {
    if (!targetScreen) return false;
    const currentRoute = getCurrentRouteName();
    return currentRoute === targetScreen;
}

/**
 * Displays a local notification using Notifee when a push message is received in the foreground.
 */
export async function displayNotification(remoteMessage: any): Promise<void> {
    try {
        const { data = {}, notification } = remoteMessage ?? {};
        const title = notification?.title || data?.title || 'KarKab';
        const body = notification?.body || data?.body || '';

        // Skip silent data-only messages without display text
        if (!title && !body) {
            console.log('🔇 FCM: Silent data message (no title/body), skipping banner');
            return;
        }

        const channelId = data?.channelId || 'default';

        await notifee.displayNotification({
            title,
            body,
            data: data ?? {},
            android: {
                channelId,
                importance: AndroidImportance.HIGH,
                smallIcon: 'ic_launcher',
                pressAction: { id: 'default' },
            },
            ios: {
                sound: 'default',
                foregroundPresentationOptions: {
                    alert: true,
                    banner: true,
                    list: true,
                    sound: true,
                    badge: true,
                },
            },
        });
        console.log('✅ FCM notification displayed via Notifee banner');
    } catch (e) {
        console.log('❌ displayNotification error:', e);
    }
}

/**
 * Sends a local test notification to immediately verify that the iOS banner & sound work.
 */
export async function sendLocalTestNotification(): Promise<void> {
    try {
        await notifee.displayNotification({
            title: 'KarKab Test Notification',
            body: 'If you see this banner, iOS notification display is working perfectly!',
            android: {
                channelId: 'default',
                importance: AndroidImportance.HIGH,
                smallIcon: 'ic_launcher',
                pressAction: { id: 'default' },
            },
            ios: {
                sound: 'default',
                foregroundPresentationOptions: {
                    alert: true,
                    banner: true,
                    list: true,
                    sound: true,
                    badge: true,
                },
            },
        });
        console.log('✅ Local test notification triggered successfully');
    } catch (err) {
        console.log('❌ Failed to trigger test notification:', err);
    }
}

/**
 * Background FCM handler registered in index.js.
 */
export async function firebaseBackgroundMessageHandler(remoteMessage: any): Promise<void> {
    try {
        console.log('🌙 FCM background message received:', remoteMessage);
        // If it's a data-only payload and has title or body, display it via Notifee
        if (!remoteMessage?.notification && (remoteMessage?.data?.title || remoteMessage?.data?.body)) {
            await displayNotification(remoteMessage);
        }
    } catch (e) {
        console.log('❌ firebaseBackgroundMessageHandler error:', e);
    }
}

/**
 * Initializes notification listeners and tap handlers during app runtime.
 */
export function initNotificationHandlers(params?: NotificationParams) {
    const { dispatch, serviceProvider } = params ?? {};
    const messaging = getMessaging();

    createChannels().catch(err => {
        console.log('⚠️ createChannels warning:', err);
    });

    // 1. Foreground FCM message received
    const unsubOnMessage = onMessage(messaging, async remoteMessage => {
        try {
            const data = remoteMessage?.data ?? {};
            console.log('📩 Foreground FCM message received:', remoteMessage);

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
        handleNotificationTap({
            notification: remoteMessage,
            dispatch,
            serviceProvider,
        });
    });

    // 3. App launched from quit state (cold start via FCM notification)
    getInitialNotification(messaging).then(remoteMessage => {
        if (remoteMessage) {
            console.log('🚀 App launched from quit state via FCM notification:', remoteMessage);
            handleNotificationTap({
                notification: remoteMessage,
                dispatch,
                serviceProvider,
            });
        }
    }).catch(err => {
        console.log('❌ getInitialNotification error:', err);
    });

    // 4. Foreground banner pressed (Notifee)
    const unsubFg = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS && detail.notification) {
            console.log('👆 Notifee foreground banner pressed:', detail.notification);
            handleNotificationTap({
                notification: detail.notification,
                dispatch,
                serviceProvider,
            });
        }
    });

    // 5. App launched from quit state via Notifee notification
    notifee.getInitialNotification().then(initialNotification => {
        if (initialNotification?.notification) {
            console.log('🚀 App launched from quit state via Notifee:', initialNotification.notification);
            handleNotificationTap({
                notification: initialNotification.notification,
                dispatch,
                serviceProvider,
            });
        }
    }).catch(err => {
        console.log('❌ notifee.getInitialNotification error:', err);
    });

    // 6. Listen to token rotation
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
