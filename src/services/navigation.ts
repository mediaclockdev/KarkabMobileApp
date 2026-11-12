import { navigate } from "../navigation/NavigationService";

const handledRequestIds = new Set<string>();

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

export function handleNotificationTap({
  notification,
  dispatch,
  serviceProvider,
}: {
  notification: any;
  dispatch?: any;
  serviceProvider?: any;
}) {
  try {
    // FCM: { data: {...} }   Notifee press: { data: {...} }   fallback: flat
    const data = notification?.data ?? notification ?? {};
    if (!data) return;

    // Deduplication check if messageId or requestId exists
    const notifId = data.messageId || notification?.messageId || data.requestId;
    if (notifId) {
      if (handledRequestIds.has(notifId)) {
        console.log('🔄 Notification tap already handled for id:', notifId);
        return;
      }
      handledRequestIds.add(notifId);
    }

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

    if (data.screen || data.route) {
      navigate(data.screen || data.route, meta);
      return;
    }

    console.log('ℹ️ unhandled notification type:', data.type);
  } catch (err) {
    console.log('❌ Notification tap error:', err);
  }
}
