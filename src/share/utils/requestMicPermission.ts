import { PermissionsAndroid, Platform } from 'react-native';

export const requestMicPermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    // Check first to avoid Activity Context issues on Fast Refresh if already granted
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    
    if (alreadyGranted) {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'App needs access to your microphone',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Failed to request mic permission:', err);
    return false;
  }
};