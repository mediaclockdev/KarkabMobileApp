
import { Dimensions, FlatList, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native"

import color, { useAppColors } from "../share/constants/color";
import MainHeader from "../share/components/MainHeader";
import AppText from "../share/components/AppText";
import AppImage from "../share/components/AppImage";
import { BottomIcons, Icons, Logos } from "../share/constants/media";
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useEffect, useState } from "react";
import apiUrls from "../services/apiUrls";
import ApiService from '../services/api';
import { GlobalImage } from "../share/utils/GlobalImage";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Order = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [orderdetaildata, setOrderDetailData] = useState<any>(null);


  useFocusEffect(
    useCallback(() => {
      getorderdetail()
    }, [navigation])
  )
  const getorderdetail = async () => {

    try {
      setLoading(true);

      const response = await ApiService.get(apiUrls.getOrderHistory(10));
      console.log(response, "getOrderHistory api response")
      if (response.status === 200) {
        const data = (response as any)?.data?.data;
        console.log(data.orders, "jcjcb")
        setOrderDetailData(data.orders);

      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
  //       <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
  //     </View>)

  // }


  return (
    <SafeAreaView style={styles.container}>
      <MainHeader />

      {
        loading ?
          <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
            <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
          </View> :
          <>
            <View style={{
              flex: 1,
              paddingHorizontal: 15,
            }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Createorder', { previousScreen: 'Order' })
                }}

                style={[styles.btnview, { flexDirection: 'row', gap: 8 }]}>
                {/* <View
                  style={{
                    height: 15,
                    width: 15,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: color.btntextcolor,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <AppText
                    fontSize={12}
                    color={color.btntextcolor}
                    style={{ lineHeight: 12 }}>
                    +
                  </AppText>
                </View> */}
                <AppText
                  fontSize={13}
                  fontWeight={600}
                  color={color.btntextcolor}
                >
                  {"Create New Order"}
                </AppText>
                {/* <AppImage
                  source={Logos.arrow}
                  height={16}
                  width={16}
                /> */}
                <View
                  style={{
                    height: 15,
                    width: 15,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: color.btntextcolor,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <AppText
                    fontSize={12}
                    color={color.btntextcolor}
                    style={{ lineHeight: 12 }}>
                    +
                  </AppText>
                </View>
              </TouchableOpacity>
              {orderdetaildata?.length > 0 ? (
                <>

                  <AppText
                    fontSize={24}
                    fontWeight={600}
                    style={{ marginVertical: 15 }}
                    color={"#1B1C1C"}
                  >
                    {"Recent Orders"}
                  </AppText>
                  <FlatList
                    data={orderdetaildata || []}
                    keyExtractor={(item, index) =>
                      item?.orderId?.toString() || index.toString()
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingBottom: 90,
                      flexGrow: 1,
                      // marginTop: 15
                    }}
                    style={{ flex: 1 }}
                    renderItem={({ item, index }) => {
                      return (

                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('OrderDetails', { item: item, previousScreen: 'Order', })
                          }}
                          style={styles.card}>
                          {/* {console.log(item, "widhh")} */}
                          <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                            <View>
                              <AppText fontSize={12}
                                fontWeight={600}
                                color={"#7F7478"}>
                                {item.orderId}
                              </AppText>
                              <AppText fontSize={20}
                                fontWeight={600}
                                color={"#1B1C1C"}>
                                {`${item.itemCount}\nItems`}
                              </AppText>
                            </View>

                            <TouchableOpacity
                              onPress={() => {
                                navigation.navigate('OrderStatus', {
                                  previousScreen: 'Order',
                                  items: item,
                                })
                              }}
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: color.btncolor,
                                borderRadius: 10,
                                padding: 5,
                                alignSelf: 'flex-start',
                                gap: 5,
                                paddingHorizontal: 10,
                              }}>
                              <AppImage
                                source={Icons.truck}
                                width={13}
                                height={9}
                                resizeMode="contain"
                              // marginTop={5}
                              />
                              <AppText fontSize={12}
                                fontWeight={600}
                                color={color.btntextcolor}>
                                {item.status}
                              </AppText>
                            </TouchableOpacity>
                          </View>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#F5F3F3" }} />

                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                              <AppImage
                                source={
                                  item?.agent?.avatarUrl
                                    ? { uri: `https://shelynx.mediaclocksoft.com.au${item.agent.avatarUrl}` }
                                    : Icons.agent
                                }
                                width={40}
                                height={40}
                                resizeMode="cover"
                                borderRadius={30}
                              />

                              <View style={{ gap: 5 }}>
                                <AppText
                                  fontSize={12}
                                  fontWeight={600}
                                  numberOfLines={1}
                                >
                                  {item.agent.name}
                                </AppText>
                                <View style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 5, backgroundColor: "#F0EDED",
                                  borderRadius: 8, padding: 5,
                                  justifyContent: 'center',
                                  width: 55
                                }}>
                                  <AppImage
                                    source={Icons.star}
                                    width={14}
                                    height={12}
                                    resizeMode="contain" />

                                  <AppText fontSize={12} color={"#1B1C1C"} fontWeight={700}>
                                    {item.agent.rating}
                                  </AppText>
                                </View>
                              </View>
                            </View>

                            <AppText fontSize={20} color={color.themetext} fontWeight={700}>
                              {"$" + item.grandTotal}
                            </AppText>
                          </View>

                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#F5F3F3" }} />

                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%' }}>
                            <TouchableOpacity
                              onPress={() => {
                                navigation.navigate('ChatScreen', { previousScreen: 'Order', conversation: item?.agent, order: item })


                              }}
                              style={[styles.btn1view, {
                                backgroundColor: "#F0EDED",

                                flexDirection: 'row',
                                paddingHorizontal: 10,
                                gap: 10,
                                width: "75%",

                                borderWidth: 0,

                              }]}>
                              <AppImage
                                source={BottomIcons.library}
                                width={20}
                                height={20}
                                resizeMode="contain"
                              // marginTop={5}
                              />
                              <AppText fontSize={14} fontWeight={600} color={"#1B1C1C"}>
                                {"Message Agent"}
                              </AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                Toast.show({
                                  type: 'info',
                                  text1: 'Feature coming soon',

                                  position: 'bottom',
                                });
                              }}
                              style={styles.btn1view}>
                              <View style={styles.dotview}>
                                <View style={styles.dots}></View>
                                <View style={styles.dots}></View>
                                <View style={styles.dots}></View>
                              </View>
                            </TouchableOpacity>

                          </View>
                        </TouchableOpacity>

                      );
                    }}
                  />
                </>
              ) :
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

                  <AppText
                    fontSize={13}
                    fontWeight={600}
                    textAlign="center"
                    color={color.btntextcolor}
                  >
                    {"No Order Found ,Create New Order"}
                  </AppText>
                </View>
              }
            </View>
            {/* <View style={{ height: 100 }} /> */}
          </>

      }

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.appcolor,


  },
  btnview: {
    height: 52,
    width: "100%",
    backgroundColor: color.btncolor,
    borderRadius: 10,
    shadowColor: color.darkbackround,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20


  },
  card: {
    padding: 20,
    borderRadius: 10,
    paddingVertical: 30,
    backgroundColor: color.white,
    marginHorizontal: 5,
    //borderWidth:1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12, // Blur 24 ≈ Radius 12

    // Android
    elevation: 5,
    marginVertical: 10,
  }
  ,
  btn1view: {
    width: '20%',
    alignSelf: 'flex-end',
    marginTop: 10,
    backgroundColor: color.white,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#D0C3C7"
  },
  dotview: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#7F7478',
    marginHorizontal: 2,
  }



})
export default Order;