// // index.js
// import { AppRegistry } from 'react-native';
// import RNRestart from 'react-native-restart';
// import { bootstrapLayoutDirection } from './src/localization/i18n';
// import App from './App';
// import { name as appName } from './app.json';

// // Returns true if the native direction was wrong and has been corrected.
// if (bootstrapLayoutDirection()) {
//   RNRestart.restart();
// } else {
//   AppRegistry.registerComponent(appName, () => App);
// }

import { AppRegistry } from 'react-native';
import RNRestart from 'react-native-restart';
import TrackPlayer from '@rntp/player';
import { setupAudioPlayer } from './src/services/player';
import { bootstrapLayoutDirection } from './src/localization/i18n';
import App from './App';
import { name as appName } from './app.json';

// Import the playback function directly as a named import
import { PlaybackService } from './service';

const shouldRestart = bootstrapLayoutDirection();

// Register App layout
AppRegistry.registerComponent(appName, () => App);

// Link the background service cleanly without using require()
// TrackPlayer.registerPlaybackService(() => PlaybackService);



setupAudioPlayer();

if (shouldRestart) {
  setTimeout(() => {
    RNRestart.restart();
  }, 100);
}
