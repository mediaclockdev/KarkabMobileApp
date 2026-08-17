import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';


import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AppText from '../share/components/AppText';
import color from '../share/constants/color';
import AppImage from '../share/components/AppImage';
import { BottomIcons, Icons, Logos } from '../share/constants/media';
import apiUrls from '../services/apiUrls';
import ApiService from '../services/api';
import Toast from 'react-native-toast-message';
// const notifications = [
//   {
//     id: '1',
//     type: 'accepted',
//     title: 'Order Accepted',
//     message: 'Order #SH-9902 was accepted by Agent Sarah L.',
//     time: 'Just now',
//     border: '#C1285C',
//     icon: Icons.cart,
//     iconBg: '#FCE5ED',
//     iconColor: '#C1285C',
//   },
//   {
//     id: '2',
//     type: 'rejected',
//     title: 'Submission Rejected',
//     message:
//       "Link submission rejected due to 'Out of stock'. Please check alternatives.",
//     time: '22m ago',
//     border: '#D71F1F',
//     icon: Icons.cart,
//     iconBg: '#FFE7E7',
//     iconColor: '#D71F1F',
//     action: 'View Item',
//   },
//   {
//     id: '3',
//     type: 'progress',
//     title: 'Batch Progress',
//     message:
//       'Great news! "Your batch is now being purchased" by our logistics team.',
//     time: '1h ago',
//     border: '#7B6A6A',
//     icon: Icons.cart,
//     iconBg: '#F3EEEE',
//     iconColor: '#7B6A6A',
//   },
//   {
//     id: '4',
//     type: 'message',
//     title: 'New Message',
//     message:
//       `"Hi there! I've found a better shipping rate for your order #SH-9902..."`,
//     time: '3h ago',
//     border: '#A11266',
//     avatar:
//       'https://randomuser.me/api/portraits/women/44.jpg',
//   },
// ];

const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'ORDER_ACCEPTED':
      return {
        border: '#C1285C',
        icon: Icons.cart,
        iconBg: '#FCE5ED',
        iconColor: '#C1285C',
      };

    case 'ORDER_REJECTED':
      return {
        border: '#D71F1F',
        icon: Icons.cart,
        iconBg: '#FFE7E7',
        iconColor: '#D71F1F',
      };

    case 'BATCH_UPDATE':
      return {
        border: '#7B6A6A',
        icon: Icons.cart,
        iconBg: '#F3EEEE',
        iconColor: '#7B6A6A',
      };

    case 'MESSAGE':
      return {
        border: '#A11266',
        icon: Icons.agent,
        iconBg: '#F9E5F1',
        iconColor: '#A11266',
      };

    case 'SYSTEM_ALERT':
      return {
        border: '#D97706',
        icon: Icons.bell,
        iconBg: '#FFF4D6',
        iconColor: '#D97706',
      };

    default:
      return {
        border: '#999',
        icon: Icons.bell,
        iconBg: '#F3F3F3',
        iconColor: '#777',
      };
  }
};

const formatNotificationTime = (
  createdAt: string,
) => {
  if (!createdAt) {
    return '';
  }

  const created = new Date(createdAt);
  const now = new Date();

  const diff =
    Math.floor(
      (now.getTime() - created.getTime()) / 1000,
    );

  if (diff < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(diff / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return created.toLocaleDateString();
};
const earlier = {
  id: '5',
  title: 'Welcome to SheLynx',
  message: 'Your concierge logistics journey starts here.',
};

const NotificationCard = ({
  item,
  onPress,
}: {
  item: any;
  onPress: (item: any) => void;
}) => {
  const notificationStyle = getNotificationStyle(item.type);

  const handleReply = () => {
    if (item.metadata?.conversationId) {
      onPress(item);
    }
  };






  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(item)}
      style={[
        styles.card,
        !item.isRead && styles.unreadCard,
      ]}
    >
      <View
        style={[
          styles.leftBar,
          {
            backgroundColor: notificationStyle.border,
          },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.row}>
          {/* Notification Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  notificationStyle.iconBg,
              },
            ]}
          >
            {
              item.type === 'MESSAGE' ?
                <AppImage
                  source={
                    item?.metadata?.sender?.avatarUrl
                      ? {
                        uri: `https://shelynx.mediaclocksoft.com.au${item.metadata.sender.avatarUrl}`,
                      }
                      : Icons.agent
                  }
                  height={24}
                  width={24}
                  borderRadius={12}
                /> :
                <AppImage
                  source={notificationStyle.icon}
                  height={24}
                  width={24}
                  tintColor={notificationStyle.iconColor}
                />
            }

          </View>

          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                {!item.isRead && (
                  <View style={styles.unreadDot} />
                )}

                <AppText style={styles.title}>
                  {item.title}
                </AppText>
              </View>

              <AppText style={styles.time}>
                {formatNotificationTime(
                  item.createdAt,
                )}
              </AppText>
            </View>

            {/* Message */}
            <AppText style={styles.message}>
              {item.body}
            </AppText>

            {/* Reply button ONLY for MESSAGE */}
            {item.type === 'MESSAGE' && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.replyBtn}
                onPress={handleReply}
              >
                <AppImage
                  source={BottomIcons.library}
                  height={16}
                  width={16}
                  tintColor="#C1285C"
                />

                <AppText style={styles.replyText}>
                  Reply
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const NotificationScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([])
  useFocusEffect(
    useCallback(() => {
      const loadNotifications = async () => {
        await getnotificationfun();
        await markAllNotificationsRead();
      };

      loadNotifications();
    }, [])
  );


  const getnotificationfun = async () => {
    console.log(apiUrls.getnotification, "djdjj")
    try {
      setLoading(true)

      const response = await ApiService.get(
        apiUrls.getnotification

      );

      console.log('getnotificationfun Status:', response.status);
      console.log('getnotificationfun Response:', response.data);

      if (response.status === 200) {
        setNotifications(response?.data?.data)


      }
    } catch (error: any) {
      setLoading(false)
      console.log('Error:', error.response?.data || error);

      Alert.alert(
        'Error',
        error.response?.data?.message || error.message
      );
    }
    finally {
      setLoading(false);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const response = await ApiService.patch(
        apiUrls.allread,
      );

      console.log(
        'Mark all notifications read:',
        response.data,
      );

      if (response.status === 200) {
        setNotifications(prev =>
          prev.map(item => ({
            ...item,
            isRead: true,
          })),
        );
      }
    } catch (error: any) {
      console.log(
        'Mark read error:',
        error.response?.data || error,
      );
    }
  };

  const handleNotificationPress = async (
    item: any,
  ) => {
    // Mark single notification as read
    try {
      const response = await ApiService.patch(
        apiUrls.singleread(item.id),
      );
      console.log(response?.data)
    } catch (error) {
      console.log(
        'Mark notification read error:',
        error,
      );
    }

    // Update local state
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === item.id
          ? {
            ...notification,
            isRead: true,
          }
          : notification,
      ),
    );

    const metadata = item.metadata;

    // MESSAGE
    if (metadata?.conversationId) {
      const conversationIds = metadata?.sender


      navigation.navigate('ChatScreen', { previousScreen: 'Home', conversation: conversationIds, })

      return;
    }

    // ORDER
    if (metadata?.orderId) {
      //       navigation.navigate('OrderDetails', {
      //         orderId: metadata.orderId,
      //         displayId: metadata.displayId,
      //       });
      const data = metadata.orderId


      navigation.navigate('OrderDetails', {
        item: data,
        previousScreen: 'Home',
      });

      return;
    }
  };



  const ClearNotification = async (id: number) => {
    try {
      const response = await ApiService.delete(
        apiUrls.clearnotification
      );

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Success',
          text2: 'Notifications cleared successfully',
          visibilityTime: 3000,
          bottomOffset: 30,
        });
        getnotificationfun()



      }
    } catch (error) {
      console.log('Notifications cleared Error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.navigate('Home');
        }}>

          <AppImage
            source={Logos.rightarrow}
            height={16}
            width={24}
          //  tintColor={item.iconColor}
          />
        </TouchableOpacity>

        <AppText style={styles.headerTitle}>
          Notifications
        </AppText>

        <TouchableOpacity
          onPress={ClearNotification}
        >
          <AppText style={styles.clear}>
            Clear All
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />
      {
        loading ?
          <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
            <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
          </View>
          :
          <FlatList
            data={notifications}
            keyExtractor={item =>
              String(item.id)
            }
            contentContainerStyle={{
              padding: 20,
            }}
            renderItem={({ item }) => (
              <NotificationCard
                item={item}
                onPress={handleNotificationPress}
              />
            )}
            ListEmptyComponent={<View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 80,
              }}
            >

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  marginTop: 16,
                  color: '#333',
                }}
              >
                No Notifications
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#888',
                  marginTop: 8,
                  textAlign: 'center',
                  paddingHorizontal: 30,
                }}
              >
                You're all caught up. New notifications will appear here.
              </Text>
            </View>}
          />}
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F7',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#78555E',
  },

  clear: {
    color: '#AB2C5D',
    fontSize: 14,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#ECE6E6',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 18,
    marginBottom: 18,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  leftBar: {
    width: 5,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  row: {
    flexDirection: 'row',
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 14,
    fontWeight: '500',
    color: color.textcolor,
  },

  time: {
    color: '#7F7478',
    fontSize: 10,
  },

  message: {
    marginTop: 6,
    fontSize: 14,
    color: '#4D4447',
    lineHeight: 20,
  },

  link: {
    color: '#C1285C',
    marginTop: 10,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  replyBtn: {
    marginTop: 14,
    backgroundColor: '#FFD9E7',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  replyText: {
    color: '#C1285C',
    marginLeft: 6,
    fontWeight: '700',
  },

  section: {
    marginVertical: 12,
    color: '#857575',
    fontWeight: '700',
    fontSize: 16,
  },
  unreadCard: {
    backgroundColor: '#FFF9FB',
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C1285C',
    marginRight: 7,
  },
});