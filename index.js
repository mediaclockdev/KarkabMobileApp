// import { AppRegistry } from 'react-native';
// import RNRestart from 'react-native-restart';
// import TrackPlayer from '@rntp/player';
// import {
//   getMessaging,
//   setBackgroundMessageHandler,
// } from '@react-native-firebase/messaging';
// import notifee, { EventType } from '@notifee/react-native';
// import { setupAudioPlayer } from './src/services/player';
// import { bootstrapLayoutDirection } from './src/localization/i18n';
// import { firebaseBackgroundMessageHandler } from './src/services/notificationService';
// import { handleNotificationTap } from './src/services/navigation';
// import App from './App';
// import { name as appName } from './app.json';
// import playbackService from './service';

// // 1. Register background FCM message handler
// setBackgroundMessageHandler(getMessaging(), firebaseBackgroundMessageHandler);

// // 2. Register Notifee background event handler
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS && detail.notification) {
//     console.log('🔔 Notifee background event press:', detail.notification);
//     handleNotificationTap({ notification: detail.notification });
//   }
// });

// setBackgroundMessageHandler(
//   getMessaging(),
//   async remoteMessage => {
//     console.log(
//       '📩 Background FCM message:',
//       remoteMessage,
//     );

//     // Handle background data if required.
//   },
// );

// // 3. Register the process-scoped playback session BEFORE AppRegistry.registerComponent
// TrackPlayer.registerPlaybackSession(playbackService);

// const shouldRestart = bootstrapLayoutDirection();

// // 4. Register App component
// AppRegistry.registerComponent(appName, () => App);

// // 5. Initialize background audio player engine
// setupAudioPlayer();

// if (shouldRestart) {
//   setTimeout(() => {
//     RNRestart.restart();
//   }, 100);
// }


// import { AppRegistry } from 'react-native';
// import RNRestart from 'react-native-restart';
// import TrackPlayer from '@rntp/player';
// import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
// import notifee, { EventType } from '@notifee/react-native';
// import { setupAudioPlayer } from './src/services/player';
// import { bootstrapLayoutDirection } from './src/localization/i18n';
// import { firebaseBackgroundMessageHandler } from './src/services/notificationService';
// import App from './App';
// import { name as appName } from './app.json';
// import playbackService from './service';

// // 1. Register background FCM message handler
// setBackgroundMessageHandler(getMessaging(), firebaseBackgroundMessageHandler);

// // 2. Register Notifee background event handler
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   if (type === EventType.PRESS) {
//     console.log('🔔 Notifee background event press:', detail.notification);
//   }
// });

// // 3. Register the process-scoped playback session BEFORE AppRegistry.registerComponent
// TrackPlayer.registerPlaybackSession(playbackService);

// const shouldRestart = bootstrapLayoutDirection();

// // 4. Register App component
// AppRegistry.registerComponent(appName, () => App);

// // 5. Initialize background audio player engine
// setupAudioPlayer();

// if (shouldRestart) {
//   setTimeout(() => {
//     RNRestart.restart();
//   }, 100);
// }

// index.js
import { AppRegistry } from 'react-native';
import RNRestart from 'react-native-restart';
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

// 5. RTL / LTR layout
const shouldRestart = bootstrapLayoutDirection();

// 6. App
AppRegistry.registerComponent(appName, () => App);

// 7. Restart if layout direction changed
if (shouldRestart) {
  setTimeout(() => {
    RNRestart.restart();
  }, 100);
}

