// index.js
import { AppRegistry } from 'react-native';
import TrackPlayer from '@rntp/player';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

import { setupAudioPlayer } from './src/services/player';
import { bootstrapLayoutDirection } from './src/localization/i18n';
import { firebaseBackgroundMessageHandler } from './src/services/notificationService';

import App from './App';
import { name as appName } from './app.json';
import playbackService from './service';

// Global error handler to prevent sudden app crash/closure on unhandled exceptions
if (typeof global !== 'undefined' && global.ErrorUtils) {
  const defaultHandler = global.ErrorUtils.getGlobalHandler
    ? global.ErrorUtils.getGlobalHandler()
    : null;
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('[GlobalErrorHandler] Uncaught error:', error, 'isFatal:', isFatal);
    if (!isFatal && defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

// 1. Background Firebase messages
setBackgroundMessageHandler(getMessaging(), firebaseBackgroundMessageHandler);

// 2. Notifee background events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('Notifee background event press:', detail.notification);
  }
});

// 3. Playback service — must be registered before AppRegistry
TrackPlayer.registerPlaybackSession(playbackService);

// 4. Player setup (no permission prompt inside — safe to run at launch)
setupAudioPlayer();

// 5. RTL / LTR layout direction alignment
bootstrapLayoutDirection();

// 6. App
AppRegistry.registerComponent(appName, () => App);
