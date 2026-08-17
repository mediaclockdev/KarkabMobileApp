import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  InteractionManager,
} from 'react-native';
import { pick } from '@react-native-documents/picker';
import ApiService from '../../services/api';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import ChatBubble from '../../share/components/ChatBubble';
import OrderProgressCard from '../../share/components/OrderProgressCard';
import AppImage from '../../share/components/AppImage';
import AppText from '../../share/components/AppText';
import { Icons } from '../../share/constants/media';
import MainHeader from '../../share/components/MainHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import apiUrls from '../../services/apiUrls';
import { connectSocket, getSocket } from '../../services/socket';
import { storage } from '../../share/storage/mmkv';
import { GlobalImage } from '../../share/utils/GlobalImage';
import axios from 'axios';

const MESSAGES = [
  {
    id: '1',
    type: 'sender',
    message:
      'Can you check if those sneakers are available in size 38?',
    time: '10:24 AM',
  },
  {
    id: '2',
    type: 'receiver',
    product: true,
    message:
      `I'm so sorry, but I've just been notified that the Limited Edition "Aura" Sneakers are now out of stock at the supplier.

Would you like to see similar alternatives, or should I remove this item from your batch?`,
    time: '11:15 AM',
  },
];




const ChatScreen = () => {
  const socket = getSocket();
  const [message, setMessage] = useState('');
  const route = useRoute<any>();
  const conversation = route.params?.conversation;
  const orderId = route.params?.order?.orderId || route.params?.order?.trackingNumber || '';
  var agentId = conversation?.id;
  const [conversationId, setconversationId] = useState(null)
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const handleBack = () => {
    const previous = route.params?.previousScreen;
    navigation.navigate('Inbox');
    // if (previous) {
    //   navigation.navigate(previous);
    // } else {
    //   navigation.goBack();
    // }
  };





  const createchat = async () => {
    try {
      console.log("📤 Creating chat...");
      console.log("Agent ID:", agentId);

      if (!agentId) {
        console.log("❌ Agent ID is missing");
        return null;
      }

      const res = await ApiService.post(apiUrls.getinbox, {
        agentId,
      });

      console.log(
        "📥 Create Chat Response:",
        JSON.stringify(res?.data, null, 2),
      );

      if (!res?.data?.data?.id) {
        console.log("❌ Conversation ID not found in response");
        return null;
      }

      const id = res.data.data.id;

      console.log("✅ Conversation Created:", id);

      setconversationId(id);

      return id;
    } catch (e: any) {
      console.log("❌ createChat Error");

      if (e.response) {
        console.log("Status:", e.response.status);
        console.log("Data:", JSON.stringify(e.response.data, null, 2));
      } else {
        console.log(e);
      }

      return null;
    }
  };


  useEffect(() => {
    const initSocket = async () => {
      const token = storage.getString("userToken");

      if (!token) {
        console.log("❌ Token not found");
        return;
      }

      const socket = connectSocket(token);

      socket.on("connect", () => {
        console.log("✅ Socket Connected");
        console.log("Socket ID:", socket.id);
      });

      socket.on("disconnect", reason => {
        console.log("❌ Socket Disconnected:", reason);
      });

      socket.on("connect_error", err => {
        console.log("❌ Socket Error:", err.message);
      });

      socket.onAny((event, ...args) => {
        console.log("📡 Socket Event:", event, args);
      });
    };

    initSocket();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();

    if (!socket) return;

    if (socket.connected) {
      joinConversation(socket);
    } else {
      socket.once("connect", () => {
        console.log("✅ Connected, now joining");

        joinConversation(socket);
      });
    }
  }, [conversationId]);

  const joinConversation = (socket: any) => {
    console.log("📤 Joining:", conversationId);

    socket.emit(
      "join_conversation",
      {
        conversationId,
      },
      (ack: any) => {
        console.log("Join ACK:", ack);
      },
    );

    socket.emit("mark_as_read", {
      conversationId,
    });
  };



  useFocusEffect(
    useCallback(() => {
      createchat();

      return () => {
        console.log("📴 Chat Screen Closed");
      };
    }, [agentId]),
  );


  // useEffect(() => {
  //   const socket = getSocket();
  //   if (!socket || !conversationId) return;
  //   const handleReceive = (newMessage) => {
  //     if (newMessage.conversationId === conversationId) {
  //       // Add the message to the screen
  //       setMessages((prev) => [...prev, newMessage]);

  //       // IMPORTANT: We MUST only emit mark_as_read if the message came from the customer.
  //       // If we emit it for our own message, the backend might broadcast a read receipt
  //       // and instantly turn our own checkmarks blue!
  //       if (newMessage.senderType == "AGENT") {
  //         socket.emit("mark_as_read", { conversationId: conversationId });
  //       }
  //     }
  //   };
  //   socket.on("receive_message", handleReceive);
  //   return () => socket.off("receive_message", handleReceive);
  // }, [conversationId, message]);

  useEffect(() => {
    if (!conversationId) {
      console.log("❌ conversationId missing");
      return;
    }

    const socket = getSocket();

    if (!socket) {
      console.log("❌ Socket not initialized");
      return;
    }

    console.log("📤 Joining Conversation:", conversationId);
    setLoadingMessages(true);
    socket.emit(
      "join_conversation",

      conversationId,

      (ack: any) => {
        console.log("✅ Join ACK:", ack);
      },
    );

    socket.emit("mark_as_read", {
      conversationId,
    });

    loadMessages();

    socket.off("receive_message", onReceiveMessage);
    socket.off("message_read", onReadMessage);

    socket.on("receive_message", onReceiveMessage);
    socket.on("message_read", onReadMessage);
    setLoadingMessages(false);
    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("message_read", onReadMessage);
    };
  }, [conversationId]);



  // useEffect(() => {
  //   const initializeChatRoom = async () => {
  //     let currentId = conversationId;
  //     // 1. If we don't have an ID, we MUST wait for the backend to create one first!
  //     if (!currentId) {
  //       try {
  //         const res = await ApiService.post(apiUrls.getinbox, {
  //           agentId: route.params?.agentId // Make sure they pass the agentId from the previous screen!
  //         });
  //         currentId = res?.data?.conversationId;
  //         conversationId = currentId// Ensure this matches your backend response!
  //         // setActiveConversationId(currentId);
  //       } catch (e) {
  //         console.log("Failed to create chat:", e);
  //         return; // Stop here if it fails
  //       }
  //     }

  //     // 2. Now that we 100% have a valid ID, fetch the history
  //     try {
  //       const res = await ApiService.get(`${apiUrls.getinbox}/${currentId}/messages`);
  //       setMessages(res.data.data || []);
  //     } catch (e) {
  //       console.log("Failed to load messages:", e);
  //     }

  //     // 3. ONLY NOW is it safe to connect the socket to the room!
  //     const socket = getSocket();
  //     if (socket && currentId) {
  //       socket.emit("join_conversation", currentId); // NOT an object! Just the ID.
  //       socket.emit("mark_as_read", { conversationId: currentId });

  //       const handleReceive = (newMessage) => {
  //         if (newMessage.conversationId === currentId) {
  //           setMessages((prev) => [...prev, newMessage]);
  //           if (newMessage.senderType === "AGENT") {
  //             socket.emit("mark_as_read", { conversationId: currentId });
  //           }
  //         }
  //       };

  //       const handleRead = (data) => {
  //         if (data.conversationId === currentId && data.readBy === 'AGENT') {
  //           setMessages(prev => prev.map(item => item.senderType === 'CUSTOMER' ? { ...item, isRead: true } : item));
  //         }
  //       };

  //       socket.on("receive_message", handleReceive);
  //       socket.on("message_read", handleRead);

  //       return () => {
  //         socket.off("receive_message", handleReceive);
  //         socket.off("message_read", handleRead);
  //       };
  //     }
  //   };

  //   initializeChatRoom();
  // }, []);




  //console.log(console.log(conversation, "jjj"))


  const loadMessages = async () => {
    try {

      console.log("📥 Loading Messages");

      const res = await ApiService.get(apiUrls.getmessages(conversationId));

      console.log("Messages Response:", JSON.stringify(res.data.data, null, 2));

      if (res?.data) {
        setMessages(res.data.data);
        console.log("✅ Messages Loaded:", res.data.data);
        socket?.emit("mark_as_read", {
          conversationId,
        });
      } else {
        setLoadingMessages(false);
        console.log("⚠️ No messages found");
      }
    } catch (e) {
      setLoadingMessages(false);
      console.log("❌ Load Messages Error:", e);
    }
  };

  const onReceiveMessage = (msg: any) => {
    setMessages(prev => [...prev, msg]);

    if (
      msg.senderType === "AGENT" &&
      msg.conversationId === conversationId
    ) {
      getSocket()?.emit("mark_as_read", {
        conversationId,
      });
    }
  };


  const onReadMessage = (data: any) => {
    console.log("👀 Read Receipt:", data);

    if (data.conversationId !== conversationId) {
      return;
    }

    // Agent has read our messages
    if (data.readBy === "AGENT") {
      setMessages(prev =>
        prev.map(item =>
          item.senderType === "CUSTOMER"
            ? {
              ...item,
              isRead: true,
            }
            : item,
        ),
      );
    }

    // Customer has read agent messages
    if (data.readBy === "CUSTOMER") {
      setMessages(prev =>
        prev.map(item =>
          item.senderType === "AGENT"
            ? {
              ...item,
              isRead: true,
            }
            : item,
        ),
      );
    }
  };

  const sendMessage = () => {

    if (!message.trim()) {
      console.log("⚠️ Message is empty");
      return;
    }

    if (!conversationId) {
      console.log("❌ conversationId missing");
      return;
    }

    const socket = getSocket();

    if (!socket) {
      console.log("❌ Socket not connected");
      return;
    }

    const payload = {
      conversationId,
      content: message.trim(),
      messageType: 'TEXT',
    };

    console.log("📤 Sending:", payload);

    socket.emit("send_message", payload, (ack: any) => {
      console.log("📥 Send ACK:", ack);
    });

    setMessage("");
  };

  useEffect(() => {
    const socket = getSocket();

    console.log("Socket Instance:", socket);

    if (!socket) {
      console.log("❌ Socket is null");
      return;
    }

    console.log("Socket Connected:", socket.connected);
    console.log("Socket ID:", socket.id);

    socket.onAny((event, ...args) => {
      console.log("📡 Event:", event);
      console.log("📦 Args:", args);
    });

    return () => {
      socket.offAny();
    };
  }, [conversationId]);


  const getDateLabel = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (isSameDay(messageDate, today)) {
      return 'Today';
    }

    if (isSameDay(messageDate, yesterday)) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const pickFile = async () => {
    console.log('📂 Opening file picker...');

    try {
      // 1. Dismiss keyboard
      Keyboard.dismiss();

      // 2. Wait for keyboard dismissal + current UI interaction
      await new Promise<void>(resolve => {
        InteractionManager.runAfterInteractions(() => {
          resolve();
        });
      });

      // 3. Small delay so Android Activity is available
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('📂 Calling native picker...');

      const result = await pick();

      console.log('📂 Picker result:', result);

      if (!result || result.length === 0) {
        console.log('⚠️ No file selected');
        return;
      }

      const file = result[0];

      console.log('✅ Selected File:', file);

      let messageType:
        | 'IMAGE'
        | 'VIDEO'
        | 'AUDIO'
        | 'DOCUMENT' = 'DOCUMENT';

      if (file.type?.startsWith('image/')) {
        messageType = 'IMAGE';
      } else if (file.type?.startsWith('video/')) {
        messageType = 'VIDEO';
      } else if (file.type?.startsWith('audio/')) {
        messageType = 'AUDIO';
      }

      await uploadFile(file, messageType);

    } catch (error: any) {
      console.log('❌ File picker error:', error);
    }
  };





  const uploadFile = async (file: any) => {
    const token = storage.getString('userToken');

    let messageType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' = 'DOCUMENT';

    if (file.type?.startsWith('image/')) {
      messageType = 'IMAGE';
    } else if (file.type?.startsWith('video/')) {
      messageType = 'VIDEO';
    } else if (file.type?.startsWith('audio/')) {
      messageType = 'AUDIO';
    }
    const formData = new FormData();

    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    formData.append('conversationId', String(conversationId));

    try {
      const res = await axios.post(
        'https://shelynx.mediaclocksoft.com.au/api/chat/upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      console.log('SUCCESS', res.data);
      if (res.data?.success) {
        // sendMessage(res.data.data.content, messageType);
      }
      else {

      }
    } catch (err: any) {
      console.log('UPLOAD ERROR', err);
      console.log('MESSAGE', err.message);
      console.log('RESPONSE', err.response?.data);
    }
  };
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  return (
    <SafeAreaView style={styles.container}>
      <MainHeader
        user={conversation?.name || "Agent Sarah L."}
        headerName="ChatScreen"
        profileImage={
          conversation?.avatarUrl
            ? {
              uri: `https://shelynx.mediaclocksoft.com.au${conversation.avatarUrl}`,
            }
            : Icons.agent
        }
        title={orderId || ''}
        onbackpress={handleBack}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {loadingMessages ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" color="#FF6B9B" />
            <AppText marginTop={12} color="#666">
              Loading messages...
            </AppText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            onLayout={scrollToBottom}
            data={messages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            )}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>

                <AppText
                  fontSize={18}
                  fontWeight={600}
                  marginTop={16}
                  color="#444">
                  No messages yet
                </AppText>

                <AppText
                  fontSize={14}
                  color="#888"
                  textAlign="center"
                  marginTop={6}>
                  Start the conversation by sending your first message.
                </AppText>
              </View>
            }
            ListHeaderComponent={
              <>
                {/* <View style={styles.todayChip}>
                <AppText color='#4D4447' fontSize={12}>Today</AppText>
              </View> */}

                {/* <OrderProgressCard /> */}
              </>
            }
            renderItem={({ item, index }) => {
              const currentLabel = getDateLabel(item.createdAt);

              const previousLabel =
                index > 0
                  ? getDateLabel(messages[index - 1].createdAt)
                  : null;

              const showHeader = currentLabel !== previousLabel;

              return (
                <>
                  {showHeader && (
                    <View style={styles.todayChip}>
                      <AppText color="#4D4447" fontSize={12}>
                        {currentLabel}
                      </AppText>
                    </View>
                  )}

                  <ChatBubble item={item} />
                </>
              );
            }}
          />)}

        {/* Bottom Input */}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            disabled={isPickingFile}
            onPress={pickFile}
            style={styles.plusButton}>
            {/* <AppText fontSize={28}>＋</AppText> */}
            <AppImage
              source={Icons.plus}
              width={14}
              height={14}
              tintColor="#4D4447"
            />
          </TouchableOpacity>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            style={styles.input}
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={styles.sendButton}>
            <AppImage
              source={Icons.send}
              width={19}
              height={16}
              tintColor="#fff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F8',
  },

  list: {
    padding: 18,
    paddingBottom: 120,
  },

  todayChip: {
    alignSelf: 'center',
    backgroundColor: '#F0EDED',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 30,
    marginBottom: 20,
  },

  inputContainer: {
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,

    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },

  plusButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5F5F5',

    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    marginHorizontal: 12,

    backgroundColor: '#F6F6F6',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 45,
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF6B9B',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#FF6B9B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default ChatScreen;