import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,

  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import apiUrls from "../../services/apiUrls";
import ApiService from '../../services/api';
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import color from '../../share/constants/color';
import { Banners, BottomIcons, Icons, Logos } from '../../share/constants/media';
import OrderItemCard from '../../share/components/OrderItemCard';
import CartSummary from '../../share/components/CartSummary';
import MainHeader from '../../share/components/MainHeader';
import Toast from 'react-native-toast-message';
import PaymentAlertModal from '../../share/components/PaymentAlertModal';
import { SafeAreaView } from 'react-native-safe-area-context';

const PlaceOrder = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [cartitem, setCartItem] = useState<any>(null);
  const [cartSummary, setCartSummary] = useState<any>(null);
  const [loadings, setLoadings] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [summaryY, setSummaryY] = useState(0);
  const [paymentModal, setPaymentModal] = useState({
    visible: false,
    title: 'Proceed to Payment',
    message: '',
    cancelText: 'Cancel',
    confirmText: 'Continue',
    onCancel: () => { },
    onConfirm: () => { },
  });
  const [items, setItems] = useState([
    {
      id: 1,
      image: Banners.costume,
      title: 'Ruched Silk Summer Dress',
      ref: 'SH-90210-BL',
      weight: '0.4kg',
      price: 34.99,
      quantity: 1,
    },
    {
      id: 2,
      image: Banners.costume,
      title: 'Abstract Gold Hoop Earrings',
      ref: 'SH-44582-GD',
      weight: '0.1kg',
      price: 12.5,
      quantity: 2,
    },
    {
      id: 3,
      image: Banners.costume,
      title: 'Minimalist Oversized Tote',
      ref: 'SH-11209-BG',
      weight: '0.8kg',
      price: 28,
      quantity: 1,
    },
  ]);

  const increase = (id: any) => {
    console.log(id, "dd");

    setCartItem(prev =>
      prev.map(item => {
        if (item.id === id?.id) {
          const newQuantity = item.quantity + 1;

          // Check available quantity
          if (newQuantity > id?.availableQuantity) {
            Toast.show({
              type: 'error',
              text1: 'Product out of stock',
              text2: `Only ${id?.availableQuantity} item(s) available`,
              position: 'bottom',
            });

            // Don't increase quantity
            return item;
          }

          const updatedItem = {
            ...item,
            quantity: newQuantity,
          };

          updatecart(updatedItem);

          return updatedItem;
        }

        return item;
      }),
    );
  };



  const decrease = (id: number) => {
    const item = cartitem.find(item => item.id === id);

    if (!item) return;

    if (item.quantity <= 1) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              deleteCartItem(id)
              // Remove from local state
              // setCartItem(prev => prev.filter(item => item.id !== id));

              // // Call remove/update cart API
              // const updatedItem = {
              //   ...item,
              //   quantity: 0,
              // };

              // await updatecart(updatedItem);

              // Or if you have a separate remove API
              // await removeCartItem(id);
            },
          },
        ],
        { cancelable: false },
      );

      return;
    }



    setCartItem(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            quantity: item.quantity - 1,
          };

          updatecart(updatedItem);
          return updatedItem;
        }

        return item;
      }),
    );
  };


  const deleteCartItem = async (id: number) => {
    try {
      const response = await ApiService.delete(
        apiUrls.deletecartitem(id)
      );

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Success',
          text2: 'Item removed from cart successfully.',
          visibilityTime: 3000,
          bottomOffset: 30,
        });


        // Refresh cart
        getCartitem();
      }
    } catch (error) {
      console.log('Delete Cart Item Error:', error);
    }
  };


  const itemTotal = cartitem?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shipping = 18.5;
  const serviceFee = 4.4;

  const grandTotal =
    itemTotal + shipping + serviceFee;




  useFocusEffect(
    useCallback(() => {
      getProfile();
      getCartitem();

    }, [])
  );







  const getProfile = async () => {
    try {
      //setLoading(true);

      const response = await ApiService.get(apiUrls.getprofile);
      console.log(response, "profileplaceplaceorder api response")
      if (response.status === 200) {
        const data = response.data.data;

        setProfile(data);
        //   setFaceId(data.faceIdEnabled);
        //   setLanguage(data.language === 'ar' ? 'Arabic' : 'English');
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      //setLoading(false);
    }
  };


  const getCartitem = async () => {
    try {
      setLoading(true);

      const response = await ApiService.get(apiUrls.getcartitem);
      console.log(response, "getcartitem api response")
      if (response.status === 200) {
        const data = response.data.data;

        setCartItem(data.items)
        // console.log(data.cartSummary, "wdwjdb")
        setCartSummary(data.cartSummary)
        //   setFaceId(data.faceIdEnabled);
        //   setLanguage(data.language === 'ar' ? 'Arabic' : 'English');
      }
    } catch (error: any) {

      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const deletecartitem = async (item: any) => {
    console.log(item)
    try {


      const response = await ApiService.delete(
        apiUrls.updatecartitems(item.id)
      );

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Cart item deleted successfully',
          position: 'bottom',
        });
        console.log('Cart item deleted successfully');
        getCartitem();
      }
    } catch (error) {
      console.log(error);
    }
  };


  const updatecart = async (item: any) => {
    try {
      const body = {
        quantity: item.quantity,
      };

      const response = await ApiService.put(
        apiUrls.updatecartitems(item.id),
        body,
      );

      if (response.status === 200) {
        console.log('Cart updated successfully');
        // Optional: refresh summary from server
        getCartitem();
      }
    } catch (error) {
      console.log(error);
    }
  };


  const handleconfirmorder = () => {
    if (profile?.addresses?.length == 0) {
      Toast.show({
        type: 'error',
        text1: 'Please add a shipping address before placing your order.',
        position: 'bottom',
        bottomOffset: 40,
      });
      navigation.navigate('ChangeAddress', { type: 'FindAgent', previousScreen: 'PlaceOrder' })
      return
    }

    if (
      !profile?.agent ||
      Object.keys(profile.agent).length == 0
    ) {
      navigation.navigate('FindAgent', { type: 'Submitorder', previousScreen: 'PlaceOrder' })
    } else {
      handleSubmitOrder({})
      // Agent exists, don't navigate
    }


  }



  const handleSubmitOrder = async (data: any) => {

    console.log("profile.shippingAddress:", profile?.addresses);
    console.log("adddressdata:",);
    const shippingAddress =

      JSON.stringify(profile.addresses[0])

    const body = {
      shippingAddress,
      customerMessage: "Thanks buddy!",
      couponBucket: "SUMMER_SALE",
    };

    console.log("Request Body:", JSON.stringify(body, null, 2));
    try {
      setLoadings(true)
      const response = await ApiService.post(apiUrls.createorder, body);

      console.log(response.data.success, "kkkkkkkkkkkkk");

      if (response.data.success) {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Success',
          text2: 'Order created successfully',
          visibilityTime: 3000,
          bottomOffset: 30,
        });
        // if (type == 'change') {
        // navigation.navigate('OrderDetails', { item: response.data.data, previousScreen: 'FindAgent', })
        // Alert.alert(
        //   'Proceed to Payment',
        //   'Your order has been created successfully. Would you like to continue to payment?',
        //   [
        //     {
        //       text: 'Cancel',
        //       style: 'cancel',
        //       onPress: () => {
        //         Alert.alert(
        //           'Order Cancelled',
        //           'Your order has been cancelled.',
        //           [
        //             {
        //               text: 'OK',
        //               onPress: () => {
        //                 getCartitem()
        //                 // navigation.navigate('PlaceOrder');
        //               },
        //             },
        //           ]
        //         );
        //       },
        //     },
        //     {
        //       text: 'Continue',
        //       onPress: () => {
        //         getCartitem()
        //         navigation.navigate('OrderDetails', { item: response?.data?.data, previousScreen: 'PlaceOrder', })
        //         //navigation.navigate('PlaceOrder');
        //       },
        //     },
        //   ],
        //   { cancelable: false }
        // );
        setPaymentModal({
          visible: true,
          title: 'Proceed to Payment',
          message:
            'Your order has been created successfully. Would you like to continue to payment?',
          cancelText: 'Cancel',
          confirmText: 'Continue',
          onCancel: () => {
            setPaymentModal(prev => ({ ...prev, visible: false }));
            getCartitem();
            navigation.navigate('OrderDetails', {
              item: response?.data?.data,
              previousScreen: 'PlaceOrder',
            });
          },
          onConfirm: () => {
            setPaymentModal(prev => ({ ...prev, visible: false }));
            getCartitem();
            navigation.navigate('OrderDetails', {
              item: response?.data?.data,
              previousScreen: 'PlaceOrder',
            });
          },
        });
        // }
        // else {
        //   navigation.navigate('FindAgent', { type: 'Submitorder' })
        // }

        // Alert.alert("Success", "Order created successfully");
      }
    } catch (error: any) {
      console.log(error.response?.data || error);
      const backendMessage = error.response?.data?.message || 'Something went wrong. Please try again.';

      Toast.show({
        type: 'error',
        text1: 'Checkout Failed', // 👈 Fixed text
        text2: backendMessage,
        position: 'bottom',
      });
      // Toast.show({
      //   type: 'error',
      //   text1: 'Unable to Add Item',
      //   text2:
      //     error.response?.data?.message ||
      //     'Something went wrong. Please try again.',
      //   position: 'bottom',
      // });
    }
    finally {
      setLoadings(false);
    }
  };



  return (
    <SafeAreaView
      edges={['top', 'bottom']}

      style={styles.container}>
      <MainHeader
        headerName={'place'}

      />
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />

      {/* Header */}
      {
        loading ?
          <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
            <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
          </View> :
          <>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 35,
              }}>
              {/* Verify */}
              {cartitem?.length > 0 ? (
                <>
                  <View style={styles.section}>
                    <AppText
                      color={color.textcolor}
                      fontSize={20}
                      fontWeight={700}>
                      Verify Your Items
                    </AppText>

                    <AppText
                      fontWeight={400}
                      fontSize={16}
                      color="#4D4447"
                      marginTop={5}>
                      Review your SHEIN cart items before
                      submitting them to your SheLynx agent.
                    </AppText>
                  </View>

                  {/* Product List */}

                  {cartitem?.map(item => (
                    <OrderItemCard
                      key={item.id}
                      item={item}
                      onPlus={() => increase(item)}
                      onMinus={() => decrease(item.id)}
                      onDelete={() => deletecartitem(item)}
                    />
                  ))}
                </>)
                :
                (

                  <View style={styles.section}>
                    <AppText
                      color={color.textcolor}
                      fontSize={20}
                      fontWeight={700}>
                      Your Cart is Empty
                    </AppText>

                    <AppText
                      fontWeight={400}
                      fontSize={16}
                      color="#4D4447"
                      marginTop={5}>
                      Add items from SHEIN to get started with your order.
                    </AppText>
                  </View>
                )}

              {/* Add Item */}

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Createorder', { previousScreen: 'PlaceOrder' })
                }}
                style={[styles.addButton, { flexDirection: 'row', gap: 8 }]}>
                <AppText
                  fontSize={13}
                  color="#7A5761"
                  fontWeight={700}
                  style={{ lineHeight: 16 }}
                >
                  Add Item
                </AppText>
                <AppImage
                  source={Logos.arrow}
                  height={16}
                  width={16}
                />
              </TouchableOpacity>

              {/* Address */}
              {
                profile?.addresses?.length > 0 ? (
                  <>
                    <View style={styles.section}>
                      <AppText
                        fontSize={20}
                        fontWeight={700}
                        color={color.textcolor}
                      >
                        Delivery Address
                      </AppText>
                    </View>
                    <TouchableOpacity style={styles.addressCard}>
                      <View style={{ flexDirection: 'row', flex: 1 }}>
                        <View style={styles.homeIcon}>
                          <AppImage
                            source={
                              profile?.addresses[profile.addresses.length - 1]?.tag == 'Home' ?
                                BottomIcons.home : profile?.addresses[profile.addresses.length - 1]?.tag == 'Work' ?
                                  Icons.work : Icons.location}
                            width={20}
                            height={20}
                            resizeMode='contain'
                          />
                        </View>

                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <AppText
                            fontSize={14}
                            fontWeight={500}
                            color={color.textcolor}
                          >
                            {profile?.addresses[profile.addresses.length - 1]?.tag}
                          </AppText>

                          <AppText
                            fontSize={12}
                            color="#777"
                            fontWeight={600}
                            marginRight={2}
                            numberOfLines={2}
                            style={{
                              flexWrap: 'wrap',
                            }}
                          >
                            {profile?.addresses[profile.addresses.length - 1]?.addressLine},{profile?.addresses[profile.addresses.length - 1]?.city}
                          </AppText>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate("ChangeAddress", { type: 'change', previousScreen: 'PlaceOrder' })
                        }}
                      >
                        <AppText
                          fontSize={15}
                          color="#C73765"
                          fontWeight={700}

                        >
                          Change
                        </AppText>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </>

                )
                  : null
              }




              {/* Summary */}
              {cartitem?.length > 0 ? (
                <View
                  onLayout={(e) => {
                    setSummaryY(e.nativeEvent.layout.y);
                  }}
                >
                  <CartSummary
                    // itemCount={items.reduce(
                    //   (a, b) => a + b.quantity,
                    //   0,
                    // )}
                    itemCount={cartSummary?.totalItemsCount}
                    itemTotal={cartSummary?.itemsTotal}
                    shipping={cartSummary?.shippingFee}
                    serviceFee={cartSummary?.serviceFee}
                    grandTotal={cartSummary?.grandTotal}
                    deliveryFee={cartSummary?.deliveryFee}
                    totalPromotionalDiscount={cartSummary?.totalPromotionalDiscount}
                    customFee={cartSummary?.customFee}
                  />

                </View>
              )
                : null}
            </ScrollView>
            {cartitem?.length > 0 ? (
              <View style={styles.bottomcontainer}>
                <AppText
                  fontSize={12}
                  color={color.textcolor}
                  fontWeight={600}>
                  Estimated Price Quote
                </AppText>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText
                    fontSize={24}
                    color={color.textcolor}
                    fontWeight={700}>
                    ${cartSummary?.grandTotal.toFixed(2)}
                  </AppText>
                  <TouchableOpacity
                    onPress={() => {
                      scrollViewRef.current?.scrollTo({
                        y: summaryY - 20,
                        animated: true,
                      });
                    }}
                  >
                    <AppText
                      fontSize={14}
                      color={"#AB2C5D"}
                      fontWeight={600}>
                      View Details
                    </AppText>
                  </TouchableOpacity>

                </View>
                <AppText
                  fontSize={12}
                  color={'#4D4447'}
                  fontWeight={600}
                  marginTop={10}
                >
                  Taxes & Shipping to be calculated once order is approved
                </AppText>
                <TouchableOpacity
                  onPress={() => {
                    handleconfirmorder()

                  }}
                  style={styles.button}>
                  {loadings ? (
                    <ActivityIndicator size="small" color="#78555E" />
                  ) : (
                    <>
                      <AppText
                        fontSize={13}
                        color={"#7A5761"}
                        fontWeight={700}>
                        Confirm & Send to Agent
                      </AppText>
                      <AppImage
                        source={Logos.arrow}
                        height={16}
                        width={16}
                      />
                    </>)}

                </TouchableOpacity>

              </View>) : null}

          </>

      }
      <PaymentAlertModal
        visible={paymentModal.visible}
        title={paymentModal.title}
        message={paymentModal.message}
        cancelText={paymentModal.cancelText}
        confirmText={paymentModal.confirmText}
        onCancel={paymentModal.onCancel}
        onConfirm={paymentModal.onConfirm}
      />

    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F5',
  },

  header: {
    height: 60,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rightIcons: {
    flexDirection: 'row',
    gap: 16,
  },

  section: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },

  addButton: {
    height: 48,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFD5DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  addressCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFF',
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  homeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFE4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomcontainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  },
  button: {
    marginTop: 20,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFD1DC',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
});
export default PlaceOrder;