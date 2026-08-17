import { Platform, PermissionsAndroid } from 'react-native';

import {
    getMessaging,
    getToken,
    onMessage,
    requestPermission,
    AuthorizationStatus,
    onTokenRefresh
} from '@react-native-firebase/messaging';

import notifee, {
    AndroidImportance,
    EventType,
} from '@notifee/react-native';
import apiUrls from './apiUrls';
import ApiService from './api'
const CHANNEL_ID = 'default';


// -----------------------------------------
// CREATE ANDROID CHANNEL
// -----------------------------------------

export const createNotificationChannel = async () => {
    try {
        if (Platform.OS === 'android') {
            await notifee.createChannel({
                id: CHANNEL_ID,
                name: 'Default Notifications',
                importance: AndroidImportance.HIGH,
                sound: 'default',
            });

            console.log('✅ Notification channel created');
        }
    } catch (error) {
        console.log(
            '❌ Notification channel error:',
            error,
        );
    }
};


// -----------------------------------------
// REQUEST PERMISSION
// -----------------------------------------

export const requestNotificationPermission = async () => {
    try {
        // ANDROID
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                const result =
                    await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS
                            .POST_NOTIFICATIONS,
                    );

                const granted =
                    result ===
                    PermissionsAndroid.RESULTS.GRANTED;

                console.log(
                    '🔔 Android notification permission:',
                    granted,
                );

                return granted;
            }

            return true;
        }

        // IOS
        const messaging = getMessaging();

        const authStatus =
            await requestPermission(messaging);

        const enabled =
            authStatus ===
            AuthorizationStatus.AUTHORIZED ||
            authStatus ===
            AuthorizationStatus.PROVISIONAL;

        console.log(
            '🔔 iOS notification permission:',
            enabled,
        );

        return enabled;

    } catch (error) {
        console.log(
            '❌ Notification permission error:',
            error,
        );

        return false;
    }
};


// -----------------------------------------
// GET FCM TOKEN
// -----------------------------------------

export const getFCMToken = async () => {
    try {
        const messaging = getMessaging();

        console.log(
            '🔥 getToken:',
            typeof getToken,
        );

        const token = await getToken(
            messaging,
        );

        console.log(
            '🔥🔥 FCM TOKEN:',
            token,
        );

        return token;

    } catch (error) {
        console.log(
            '❌ FCM token error:',
            error,
        );

        return null;
    }
};


// -----------------------------------------
// DISPLAY NOTIFICATION
// -----------------------------------------

export const displayNotification = async (
    remoteMessage: any,
) => {
    try {
        console.log(
            '🔔 Displaying notification:',
            remoteMessage,
        );

        const title =
            remoteMessage?.notification?.title ||
            remoteMessage?.data?.title ||
            'Shelynx';

        const body =
            remoteMessage?.notification?.body ||
            remoteMessage?.data?.body ||
            '';

        await notifee.displayNotification({
            title,
            body,

            data: remoteMessage?.data || {},

            android: {
                channelId: CHANNEL_ID,

                importance:
                    AndroidImportance.HIGH,

                smallIcon: 'ic_launcher',

                pressAction: {
                    id: 'default',
                },
            },

            ios: {
                sound: 'default',
            },
        });

        console.log(
            '✅ Notification displayed',
        );

    } catch (error) {
        console.log(
            '❌ Display notification error:',
            error,
        );
    }
};


// -----------------------------------------
// INITIALIZE NOTIFICATIONS
// -----------------------------------------

export const initializeNotifications =
    async () => {
        try {
            console.log(
                '🔔 Initializing notifications...',
            );

            await createNotificationChannel();

            const permissionGranted =
                await requestNotificationPermission();

            if (!permissionGranted) {
                console.log(
                    '❌ Notification permission denied',
                );

                return null;
            }

            const token =
                await getFCMToken();

            if (!token) {
                console.log(
                    '❌ FCM token unavailable',
                );

                return null;
            }

            console.log(
                '✅ Notification initialization completed',
            );

            return token;

        } catch (error) {
            console.log(
                '❌ Notification initialization error:',
                error,
            );

            return null;
        }
    };


// -----------------------------------------
// FOREGROUND LISTENER
// -----------------------------------------

export const setupForegroundNotificationListener =
    () => {
        try {
            console.log(
                '🔔 Setting up foreground listener',
            );

            const messaging = getMessaging();

            const unsubscribe = onMessage(
                messaging,
                async remoteMessage => {
                    console.log(
                        '📩 Foreground notification:',
                        remoteMessage,
                    );

                    await displayNotification(
                        remoteMessage,
                    );
                },
            );

            console.log(
                '✅ Foreground listener registered',
            );

            return unsubscribe;

        } catch (error) {
            console.log(
                '❌ Foreground listener error:',
                error,
            );

            return undefined;
        }
    };


// -----------------------------------------
// NOTIFICATION PRESS
// -----------------------------------------

export const setupNotificationEvents = (
    onNotificationPress?: (
        data: any,
    ) => void,
) => {
    try {
        return notifee.onForegroundEvent(
            ({ type, detail }) => {
                if (
                    type === EventType.PRESS
                ) {
                    console.log(
                        '🔔 Notification pressed:',
                        detail.notification?.data,
                    );

                    onNotificationPress?.(
                        detail.notification?.data ||
                        {},
                    );
                }
            },
        );
    } catch (error) {
        console.log(
            '❌ Notification event error:',
            error,
        );

        return undefined;
    }
};

export const setupFCMTokenRefresh = () => {
    const messaging = getMessaging();

    return onTokenRefresh(messaging, async newToken => {
        console.log('🔄 FCM TOKEN REFRESHED:', newToken);

        const apptoken = storage.getString('userToken');

        if (!apptoken) {
            console.log('❌ User not logged in');
            return;
        }

        try {
            await ApiService.post(
                apiUrls.fcmtoken,
                {
                    fcmToken: newToken,
                },
            );

            console.log('✅ Refreshed FCM token sent to backend');
        } catch (error: any) {
            console.log(
                '❌ Failed to update refreshed FCM token:',
                error.response?.data || error,
            );
        }
    });
};