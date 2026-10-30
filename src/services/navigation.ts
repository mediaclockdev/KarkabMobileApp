import { navigate } from "../navigation/NavigationService";

/** Backend sends metadata as a JSON string. Notifee may return it already parsed. */
export function parseMetadata(data: any = {}) {
  const raw = data?.metadata;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function handleNotificationTap({ notification }: any) {
  // FCM: { data: {...} }   Notifee press: { data: {...} }   fallback: flat
  const data = notification?.data ?? notification ?? {};
  console.log('👆 TAP data:', data);

  const meta = parseMetadata(data);
  console.log('👆 TAP meta:', meta, '| type:', data.type);
  if (data.type === 'MESSAGE') {
    const senderId = meta.sender?.id;
    if (!senderId) {
      console.log('⛔ no sender id in', data);
      return;
    }

    navigate('ChatScreen', {
      conversation: {
        id: senderId,
        name: meta.sender?.name,
        avatarUrl: meta.sender?.avatarUrl,
      },
      conversationId: meta.conversationId,
    });
    return;
  }

  console.log('ℹ️ unhandled type:', data.type);
}