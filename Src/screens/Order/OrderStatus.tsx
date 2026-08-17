import React, { useCallback, useEffect, useState } from 'react';
import {

  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import color from '../../share/constants/color';
import { BottomIcons, Icons, Logos } from '../../share/constants/media';
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const timeline = [
  {
    id: 1,
    title: 'Order Received',
    time: 'Apr 12, 2026 • 09:42 AM',
    completed: true,
  },
  {
    id: 2,
    title: 'Payment Confirmed',
    time: 'Apr 12, 2026 • 10:15 AM',
    completed: true,
  },
  {
    id: 3,
    title: 'Ordered from SHEIN',
    time: 'Apr 13, 2026 • 08:20 PM',
    completed: true,
  },
  {
    id: 4,
    title: 'Arrived at Warehouse',
    time: 'Apr 16, 2026 • 11:05 AM',
    description:
      'Your package has been scanned and is being prepared for export.',
    active: true,
  },
];

const OrderStatus = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const item = route.params?.items ?? '';
  const [trackingdata, setTrackingData] = useState(null)
  const journey = trackingdata?.journey ?? [];
  const [loading, setLoading] = useState(false);


  useFocusEffect(
    useCallback(() => {
      const id = route.params?.items?.id;

      if (id) {
        gettrackingdata(id);
      }
    }, [route.params?.items?.id])
  );


  // console.log(item, "jjdjdfjf")


  const gettrackingdata = async (id) => {
    console.log(id)
    try {
      setLoading(true);

      const response = await ApiService.get(apiUrls.gettrackingdata(id));
      console.log(response, "gettrackingdata api response")
      if (response.status === 200) {
        const data = response.data.data;
        console.log(data)
        setTrackingData(data)
        //   setProfile(data);

      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });




  const handleBack = () => {
    const previous = route.params?.previousScreen;

    if (previous) {
      navigation.navigate(previous);
    } else {
      navigation.navigate('Order');
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <AppImage
            source={Logos.rightarrow}
            width={22}
            height={16}
          />
        </TouchableOpacity>

        <AppText style={styles.headerTitle}>
          Order Journey
        </AppText>

        <View style={styles.rightIcons}>
          <TouchableOpacity>
            <AppImage
              source={Icons.bell}
              width={16}
              height={20}
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <AppImage
              source={Icons.cart}
              width={20}
              height={20}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}

        {
          loading ?
            <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center', height: Dimensions.get('window').height }}>
              <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
            </View> :
            <>


              {/* Tracking Card */}

              <View style={styles.card}>
                <View style={styles.topRow}>
                  <View>
                    <AppText style={styles.label}>
                      TRACKING NUMBER
                    </AppText>

                    <AppText style={styles.tracking}>
                      {trackingdata?.trackingNumber}
                    </AppText>
                  </View>

                  <View style={styles.badge}>
                    <AppText style={styles.badgeText}>
                      {trackingdata?.status}
                    </AppText>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View>
                    <AppText style={styles.infoLabel}>
                      Your Agent
                    </AppText>

                    <View style={styles.agentRow}>
                      <AppImage
                        source={
                          trackingdata?.agent?.avatarUrl
                            ? { uri: `https://shelynx.mediaclocksoft.com.au${trackingdata?.agent?.avatarUrl}` }
                            : Icons.agent
                        }
                        width={32}
                        height={32}
                        borderRadius={16}
                      />

                      <AppText style={styles.agentName}>
                        {trackingdata?.agent?.name}.
                      </AppText>
                    </View>
                  </View>

                  <View>
                    <AppText style={styles.infoLabel}>
                      Est. Arrival
                    </AppText>

                    <AppText style={styles.arrival}>
                      {formatDate(trackingdata?.estimatedDeliveryDate) || ''}
                    </AppText>
                  </View>
                </View>
              </View>

              <AppText style={styles.heading}>
                Tracking Journey
              </AppText>

              {/* Timeline */}

              const journey = trackingdata?.journey ?? [];

              {journey.map((item, index) => {
                const isActive = index === journey.length - 1; // Latest status

                return (
                  <View key={item.id} style={styles.timelineContainer}>
                    {/* Left */}
                    <View style={styles.left}>
                      <View
                        style={[
                          styles.circle,
                          isActive && styles.activeCircle,
                        ]}>
                        {!isActive && (
                          <View
                            style={{
                              backgroundColor: '#AB2C5D',
                              borderRadius: 60,
                              height: 15,
                              width: 15,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <AppImage
                              source={Icons.tick}
                              height={5.69}
                              width={7.46}
                            />
                          </View>
                        )}
                      </View>

                      {index !== journey.length - 1 && (
                        <View style={styles.line} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      {isActive ? (
                        <View style={styles.activeCard}>
                          <AppText style={styles.activeTitle}>
                            {item.title}
                          </AppText>

                          <AppText style={styles.time}>
                            {new Date(item.createdAt)
                              .toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                                timeZone: 'Asia/Kolkata',
                              })
                              .replace(',', ' •')}
                          </AppText>

                          <AppText style={styles.description}>
                            {item.description}
                          </AppText>
                        </View>
                      ) : (
                        <>
                          <AppText style={styles.title}>
                            {item.title}
                          </AppText>

                          <AppText style={styles.time}>
                            {new Date(item.createdAt)
                              .toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                                timeZone: 'Asia/Kolkata',
                              })
                              .replace(',', ' •')}
                          </AppText>

                          <AppText style={styles.description}>
                            {item.description}
                          </AppText>
                        </>
                      )}
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('ChatScreen', { previousScreen: 'OrderStatus', conversation: trackingdata?.agent, order: trackingdata })
                }}

                style={styles.contactBtn}>
                <AppImage
                  source={BottomIcons.library}
                  width={18}
                  height={18}
                  tintColor={'#7A5761'}
                />

                <AppText style={styles.contactText}>
                  Contact Agent
                </AppText>
              </TouchableOpacity>
            </>}

      </ScrollView>
    </SafeAreaView>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F6',
  },

  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B5A60',
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  card: {
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AB2C5D',
    letterSpacing: 1,
  },

  tracking: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '600',
    color: color.textcolor,
  },

  badge: {
    backgroundColor: '#FCE4EC',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },

  badgeText: {
    color: '#76646B',
    fontSize: 12,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#D0C3C74D',
    marginVertical: 18,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  infoLabel: {
    fontSize: 12,
    color: '#4D4447',
    marginBottom: 8,
  },

  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  agentName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: color.textcolor,
  },

  arrival: {
    fontSize: 14,
    fontWeight: '500',
    color: color.textcolor,
  },

  heading: {
    marginTop: 28,
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '400',
    color: color.textcolor,
  },

  /* Timeline */

  timelineContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
  },

  left: {
    width: 34,
    alignItems: 'center',
  },

  circle: {
    width: 18.02,
    height: 18,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FBF9F8',
    backgroundColor: '#FFF',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },

  activeCircle: {
    width: 24,
    height: 24,
    borderRadius: 20,
    backgroundColor: '#AB2C5D',
    borderWidth: 0,
  },

  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#AB2C5D',
    marginTop: 2,
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textcolor,
    marginBottom: 3,
  },

  time: {
    fontSize: 12,
    color: '#4D4447',
    marginBottom: 24,
  },

  activeCard: {
    backgroundColor: '#FCE4EC66',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCE4EC',
    padding: 16,
    marginBottom: 20,
  },

  activeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AB2C5D',
    marginBottom: 6,
  },

  description: {
    marginTop: 10,
    color: color.textcolor,
    fontSize: 12,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  contactBtn: {
    height: 56,
    marginHorizontal: 22,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#FFD1DC',

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  contactText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#7A5761',
  },
});





export default OrderStatus;