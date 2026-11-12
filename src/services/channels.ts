import notifee, { AndroidImportance } from '@notifee/react-native';

export async function createChannels() {
  await notifee.requestPermission();

  await notifee.createChannel({
    id: 'default',
    name: 'General',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  await notifee.createChannel({
    id: 'chat',
    name: 'Chat',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}
