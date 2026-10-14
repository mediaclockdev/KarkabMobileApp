import { AppRegistry } from 'react-native';
import RNRestart from 'react-native-restart';
import TrackPlayer from '@rntp/player';
import { setupAudioPlayer } from './src/services/player';
import { bootstrapLayoutDirection } from './src/localization/i18n';
import App from './App';
import { name as appName } from './app.json';
import playbackService from './service';

// 1. Register the process-scoped playback session BEFORE AppRegistry.registerComponent
TrackPlayer.registerPlaybackSession(playbackService);

const shouldRestart = bootstrapLayoutDirection();

// 2. Register App component
AppRegistry.registerComponent(appName, () => App);

// 3. Initialize background audio player engine
setupAudioPlayer();

if (shouldRestart) {
  setTimeout(() => {
    RNRestart.restart();
  }, 100);
}
