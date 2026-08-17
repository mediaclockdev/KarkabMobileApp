import React, { useEffect } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import {
  initializeNotifications,
  setupForegroundNotificationListener,
  setupNotificationEvents,
  setupFCMTokenRefresh
} from '../services/notificationService'
import Providers from './providers'
import RootNavigator from '../navigation/RootNavigator'
import { LogBox, StatusBar } from 'react-native';
import AppAlertModal from '../share/components/AppAlertModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  getApp,
} from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
} from '@react-native-firebase/messaging';
import { storage } from '../share/storage/mmkv'
import apiUrls from '../services/apiUrls';
import ApiService from '../services/api'
LogBox.ignoreAllLogs(true);


const App = () => {
  const token = storage.getString('userToken');
  useEffect(() => {
    let foregroundUnsubscribe: (() => void) | undefined;
    let eventUnsubscribe: (() => void) | undefined;
    let tokenRefreshUnsubscribe: (() => void) | undefined;

    const initialize = async () => {
      try {
        // 1. Initialize Firebase notifications
        const fcmToken = await initializeNotifications();

        console.log('🔥 Device FCM Token:', fcmToken);

        // 2. Send current token to backend
        const apptoken = storage.getString('userToken');

        console.log('🔐 App Token exists:', apptoken);

        if (apptoken && fcmToken) {
          await sendfcmtoken(fcmToken);
        } else {
          console.log('❌ Missing auth token or FCM token');
        }

        // 3. Foreground listener
        foregroundUnsubscribe =
          setupForegroundNotificationListener();

        // 4. Notification press listener
        eventUnsubscribe =
          setupNotificationEvents(data => {
            console.log('🔔 Notification data:', data);
          });

        // 5. FCM token refresh listener
        tokenRefreshUnsubscribe =
          setupFCMTokenRefresh();

        console.log('✅ All notification listeners registered');
      } catch (error) {
        console.log(
          '❌ Notification setup error:',
          error,
        );
      }
    };

    initialize();

    return () => {
      foregroundUnsubscribe?.();
      eventUnsubscribe?.();
      tokenRefreshUnsubscribe?.();
    };
  }, [token]);

  const sendfcmtoken = async (
    token: string | null,
  ) => {
    try {
      const apptoken =
        storage.getString('userToken');

      if (apptoken == '' || apptoken == null || apptoken == undefined || !token) {
        console.log(
          '❌ Missing auth token or FCM token',
        );
        return;
      }

      const response = await ApiService.post(
        apiUrls.fcmtoken,
        {
          fcmToken: token,
        },
      );

      console.log(
        '✅ FCM API Status:',
        response.status,
      );

      console.log(
        '✅ FCM API Response:',
        response.data,
      );
    } catch (error: any) {
      console.log(
        '❌ FCM STATUS:',
        error.response?.status,
      );

      console.log(
        '❌ FCM DATA:',
        error.response?.data,
      );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <Providers>
        <RootNavigator />
      </Providers>
    </SafeAreaProvider>
  );
};

export default App



