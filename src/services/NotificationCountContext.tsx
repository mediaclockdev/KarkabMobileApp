import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import {
    AppState,
    AppStateStatus,
} from 'react-native';

import messaging from '@react-native-firebase/messaging';

import ApiService from '../services/api';
import apiUrls from '../services/apiUrls';

type NotificationCountContextType = {
    unreadCount: number;
    refreshNotificationCount: () => Promise<void>;
};

const NotificationCountContext =
    createContext<NotificationCountContextType>({
        unreadCount: 0,
        refreshNotificationCount: async () => { },
    });

export const NotificationCountProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshNotificationCount = useCallback(async () => {
        try {
            const response = await ApiService.get(apiUrls.notificationcount);
            const result = (response as any)?.data;

            // Adjust this extraction if your count API uses a different response key.
            const count =
                result?.unreadCount ??
                result?.count ??
                result?.data?.unreadCount ??
                result?.data?.count ??
                0;

            setUnreadCount(Number(count) || 0);
        } catch (error) {
            console.log('Notification count API error:', error);
        }
    }, []);

    useEffect(() => {
        // Get the latest count when the app starts.
        refreshNotificationCount();

        // Notification received while app is in foreground.
        const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
            console.log('Foreground notification:', remoteMessage);

            // Give the backend a moment to save the notification.
            setTimeout(() => {
                refreshNotificationCount();
            }, 500);
        });

        // User taps a notification while app is in background.
        const unsubscribeOpened = messaging().onNotificationOpenedApp(() => {
            refreshNotificationCount();
        });

        // User opens the app by tapping a notification from quit state.
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    refreshNotificationCount();
                }
            });

        // Refresh count when the app returns to foreground.
        const appStateListener = AppState.addEventListener(
            'change',
            (nextState: AppStateStatus) => {
                if (nextState === 'active') {
                    refreshNotificationCount();
                }
            },
        );

        return () => {
            unsubscribeMessage();
            unsubscribeOpened();
            appStateListener.remove();
        };
    }, [refreshNotificationCount]);

    return (
        <NotificationCountContext.Provider
            value={{ unreadCount, refreshNotificationCount }}
        >
            {children}
        </NotificationCountContext.Provider>
    );
};

export const useNotificationCount = () =>
    useContext(NotificationCountContext);