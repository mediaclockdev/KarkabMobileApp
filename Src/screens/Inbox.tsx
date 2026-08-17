import React, { useCallback, useState } from 'react';
import {

  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import ApiService from '../services/api';
import AppText from '../share/components/AppText';
import AppImage from '../share/components/AppImage';
import color from '../share/constants/color';
import { Icons, Logos } from '../share/constants/media';
import MainHeader from '../share/components/MainHeader';
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import apiUrls from '../services/apiUrls';

const chatData = [
  {
    id: '1',
    name: 'Agent Elena M.',
    message: 'Your quote for #SH-7835 is ready!',
    order: 'ORDER #SH-7835',
    time: '10:45 AM',
    unread: 2,
    active: true,
    image: Icons.agent,
    highlight: true,
  },
  {
    id: '2',
    name: 'Agent Marcus J.',
    message: "I've confirmed the shipping address for your gift.",
    order: 'ORDER #SH-1204',
    time: '09:12 AM',
    unread: 0,
    active: false,
    image: Icons.agent,
    highlight: false,
  },
  {
    id: '3',
    name: 'Agent Sarah L.',
    message: 'Found those limited edition sneakers you wanted!',
    order: 'ORDER #SH-9902',
    time: 'Yesterday',
    unread: 0,
    active: false,
    image: Icons.agent,
    highlight: false,
  },
  {
    id: '4',
    name: 'Agent David K.',
    message: 'Package is currently at customs for #SH-6621.',
    order: 'ORDER #SH-6621',
    time: 'Yesterday',
    unread: 1,
    active: false,
    image: Icons.agent,
    highlight: true,
  },
  {
    id: '5',
    name: 'Agent Julia W.',
    message: 'Let me know if you want to add anything else.',
    order: 'INQUIRY #SH-0012',
    time: 'Oct 24',
    unread: 0,
    active: false,
    image: Icons.agent,
    highlight: false,
  },
];

const Inbox = ({ }: any) => {

  const navigation = useNavigation<any>();
  const [inboxdata, setInboxdata] = useState([])
  const [loading, setLoading] = useState(false);





  const getInboxData = async () => {
    try {
      setLoading(true);

      const response = await ApiService.get(apiUrls.getinbox);
      console.log(response, "getInboxData api response")
      if (response.status === 200) {
        const data = response.data.data;
        setInboxdata(data)
        console.log(data, "getInboxData")

      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      getInboxData()

    }, [])
  )


  const formatInboxTime = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    if (isSameDay(messageDate, today)) {
      return messageDate.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    if (isSameDay(messageDate, yesterday)) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  };


  const EmptyInbox = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <AppImage
            source={Icons.agent}
            width={50}
            height={50}
            tintColor="#AB2C5D"
          />
        </View>

        <AppText
          fontSize={20}
          fontWeight={600}
          color="#6B5A60"
          style={styles.emptyTitle}
        >
          No Conversations Yet
        </AppText>

        <AppText
          fontSize={14}
          color="#7F7478"
          style={styles.emptyMessage}
        >
          Your conversations with agents will appear here.
        </AppText>
      </View>
    );
  };

  const renderItem = ({ item }: any) => {
    const lastMessage = item?.lastMessage;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>

          navigation.navigate('ChatScreen', { previousScreen: 'Inbox', conversation: item?.chatPartner, })
        }
        style={[
          styles.card,
          item.unreadCount > 0 && styles.activeCard,
        ]}
      >
        {item.unreadCount > 0 && <View style={styles.leftBorder} />}

        <View style={styles.avatarContainer}>
          <AppImage
            source={
              item.chatPartner.avatarUrl
                ? {
                  uri: `https://shelynx.mediaclocksoft.com.au${item.chatPartner.avatarUrl}`,
                }
                : Icons.agent
            }
            width={56}
            height={56}
            borderRadius={29}
            style={{
              borderRadius: 29
            }}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <AppText
              fontSize={18}
              fontWeight={600}
              color="#222">
              {item.chatPartner.name}
            </AppText>

            <AppText
              fontSize={12}
              fontWeight={600}
              color={
                item.unreadCount > 0
                  ? color.themetext
                  : '#666'
              }>
              {lastMessage?.createdAt ? formatInboxTime(lastMessage.createdAt) : ''}
            </AppText>
          </View>

          <AppText
            fontSize={14}
            color="#4D4447"
            numberOfLines={1}>
            {
              lastMessage
                ? lastMessage.messageType === 'TEXT'
                  ? lastMessage.content || 'No message'
                  : `📎 ${lastMessage.messageType || 'Attachment'}`
                : ''
            }
          </AppText>

          <View style={styles.bottomRow}>
            <View />

            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <AppText
                  fontSize={11}
                  color="#fff">
                  {item.unreadCount}
                </AppText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AppImage
            source={Icons.rightarrow}
            width={18}
            height={18}
          />
        </TouchableOpacity>

        <AppText
          fontSize={30}
          fontWeight={600}
          color="#6B5A60">
          Chat
        </AppText>

        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <AppImage
              source={Icons.notification}
              width={22}
              height={22}
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <AppImage
              source={Icons.cart}
              width={22}
              height={22}
            />
          </TouchableOpacity>
        </View>
      </View> */}
      <MainHeader

      />

      {
        loading ?
          <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
            <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
          </View>
          :
          <>
            <FlatList
              data={inboxdata}
              keyExtractor={item => item?.id?.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={<EmptyInbox />}
            />

          </>


      }
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F8',
  },

  header: {
    height: 72,
    backgroundColor: color.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  listContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 110,
  },

  card: {
    backgroundColor: color.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,

    flexDirection: 'row',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,

    overflow: 'hidden',
  },

  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: color.themetext,
  },

  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: color.themetext,
  },

  avatarContainer: {
    position: 'relative',
  },

  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,

    width: 12,
    height: 12,
    borderRadius: 6,

    backgroundColor: '#2ECC71',

    borderWidth: 2,
    borderColor: color.white,
  },

  content: {
    flex: 1,
    marginLeft: 15,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  orderChip: {
    backgroundColor: '#FCE4EC',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },

  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,

    backgroundColor: color.themetext,

    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomTab: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 95,

    backgroundColor: color.white,
    borderRadius: 18,

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    height: 72,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },

  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },

  activeTab: {
    alignItems: 'center',
    justifyContent: 'center',

    width: 70,
    height: 48,

    borderRadius: 14,
    backgroundColor: '#FDE3EC',
  },
  emptyListContainer: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyMessage: {
    textAlign: 'center',
    lineHeight: 21,
  },
});
export default Inbox;