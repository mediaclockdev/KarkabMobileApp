// index.js
import { AppRegistry } from 'react-native';
import RNRestart from 'react-native-restart';
import { bootstrapLayoutDirection } from './src/localization/i18n';
import App from './App';
import { name as appName } from './app.json';

// Returns true if the native direction was wrong and has been corrected.
if (bootstrapLayoutDirection()) {
  RNRestart.restart();
} else {
  AppRegistry.registerComponent(appName, () => App);
}