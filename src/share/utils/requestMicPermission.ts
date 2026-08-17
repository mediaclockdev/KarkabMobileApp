import { PermissionsAndroid, Platform } from 'react-native';

export const requestMicPermission = async () => {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone Permission',
      message: 'App needs access to your microphone',
      buttonPositive: 'OK',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};