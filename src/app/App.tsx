import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Providers from './providers';
import RootNavigator from '../navigation/RootNavigator';
import { NotificationCountProvider } from '../services/NotificationCountContext';
import { setupAudioPlayer } from '../services/player';
import { initNotificationHandlers } from '../services/notificationService';
import {
    requestNotificationPermission,
    ensureFcmToken,
    getCachedFcmToken,
} from '../services/fcmToken';

const App = () => {
    useEffect(() => {
        let mounted = true;

        // 1. Initialize audio player
        const initializePlayer = async () => {
            try {
                const initialized = await setupAudioPlayer();
                if (mounted && initialized) {
                    console.log('🎧 Audio background engine initialized');
                }
            } catch (error) {
                console.log('❌ Audio player initialization failed:', error);
            }
        };

        // 2. Initialize notification listeners (foreground, background, quit state)
        const unsubscribeNotifications = initNotificationHandlers();

        // 3. Request permissions and fetch FCM token on iOS & Android
        const initializeNotifications = async () => {
            try {
                const granted = await requestNotificationPermission();
                if (!mounted) return;

                if (granted) {
                    const token = await ensureFcmToken();
                    if (token) {
                        console.log('🔥 Ready FCM token for iOS/Android:', token);
                    } else {
                        console.log('⚠️ FCM token pending APNs generation');
                    }
                } else {
                    console.log('⚠️ Push notification permission not granted');
                }
            } catch (error) {
                console.log('❌ Push initialization error:', error);
            }
        };

        initializePlayer();
        initializeNotifications();

        return () => {
            mounted = false;
            if (typeof unsubscribeNotifications === 'function') {
                unsubscribeNotifications();
            }
        };
    }, []);

    return (
        <SafeAreaProvider>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#000000"
            />
            <Providers>
                <NotificationCountProvider>
                    <RootNavigator />
                </NotificationCountProvider>
            </Providers>
        </SafeAreaProvider>
    );
};

export default App;
