import React from 'react';
import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';

import AppImage from './AppImage';
import AppText from './AppText';
import color from '../constants/color';

interface Props {
  item: any;
}

const BASE_URL = 'https://shelynx.mediaclocksoft.com.au';

const ChatBubble: React.FC<Props> = ({ item }) => {
  const isSender = item.senderType === 'CUSTOMER';

  const fileUrl = item.content?.startsWith('http')
    ? item.content
    : `${BASE_URL}${item.content}`;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = (textColor: string) => {
    switch (item.messageType) {
      case 'IMAGE':
        return (
          <TouchableOpacity
            onPress={() => Linking.openURL(fileUrl)}
            activeOpacity={0.8}
          >
            <AppImage
              source={{ uri: fileUrl }}
              width={220}
              height={220}
              resizeMode="cover"
              style={styles.image}
            />
          </TouchableOpacity>
        );

      case 'VIDEO':
        return (
          <Video
            source={{ uri: fileUrl }}
            style={styles.video}
            controls
            resizeMode="cover"
          />
        );

      case 'DOCUMENT':
      case 'FILE':
        return (
          <TouchableOpacity
            style={styles.documentContainer}
            onPress={() => {
              console.log('Opening document:', fileUrl);
              Linking.openURL(fileUrl);
            }}
            activeOpacity={0.7}
          >
            <AppText fontSize={26}>
              📄
            </AppText>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText
                color="#0A84FF"
                fontSize={14}
                fontWeight={600}
              >
                Open Document
              </AppText>

              <AppText
                color="#777"
                fontSize={11}
                marginTop={3}
                numberOfLines={1}
              >
                {item.fileName || 'Tap to open'}
              </AppText>
            </View>
          </TouchableOpacity>
        );

      case 'TEXT':
      default:
        return (
          <AppText
            fontSize={14}
            color={textColor}
            lineHeight={21}
          >
            {item.content}
          </AppText>
        );
    }
  };

  if (isSender) {
    return (
      <View style={styles.senderContainer}>
        <View style={styles.senderBubble}>
          {renderMessage('#FFFFFF')}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginTop: 6,
            }}
          >
            <AppText
              fontSize={10}
              color="#FFFFFF"
            >
              {formatTime(item.createdAt)}
            </AppText>

            <AppText
              fontSize={12}
              color={item.isRead ? '#2196F3' : '#999'}
              marginLeft={6}
              fontWeight={900}
            >
              {item.isRead ? '✓✓' : '✓'}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.receiverRow}>
      <View style={styles.receiverBubble}>
        {renderMessage(color.textcolor)}

        <AppText
          fontSize={10}
          color="#4D4447"
          marginTop={12}
        >
          {formatTime(item.createdAt)}
        </AppText>
      </View>
    </View>
  );
};

export default ChatBubble;

const styles = StyleSheet.create({
  senderContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },

  senderBubble: {
    backgroundColor: '#FD6C9C',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    padding: 16,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  receiverRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },

  receiverBubble: {
    flex: 1,
    backgroundColor: color.white,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    padding: 15,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },

  image: {
    borderRadius: 10,
  },

  video: {
    width: 220,
    height: 220,
    borderRadius: 10,
    backgroundColor: '#000',
  },

  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    minWidth: 180,
  },
});