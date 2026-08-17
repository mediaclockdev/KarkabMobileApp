import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native'

import AppText from '../components/AppText'
import color, { } from '../constants/color'
import { Icons, Logos } from '../constants/media';
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AppImage from './AppImage';
import ApiService from '../../services/api';
import { GlobalImage } from '../utils/GlobalImage';
import apiUrls from '../../services/apiUrls';
interface MainHeaderProps {
  user?: any
  headerName?: string
  profileImage?: string
  onNotificationPress?: () => void
  onProfilePress?: () => void
  setVisible: (visible: any) => void;
  title?: any;
  onbackpress?: () => void
}

const MainHeader: React.FC<MainHeaderProps> = ({
  user,
  headerName,
  profileImage,
  onNotificationPress,
  onProfilePress,
  setVisible,
  title,
  onbackpress,
}) => {
  const navigation = useNavigation<any>();
  const [cartCount, setCartcount] = useState<number>(0);


  useFocusEffect(
    useCallback(() => {
      getCartCount()
    }, []))


  const getCartCount = async () => {
    try {

      const response = await ApiService.get(apiUrls.cartcount);
      console.log(response, "getcartcount api response")
      if (response.status === 200) {
        const data = response.data;
        console.log(data, "dwhdkhwhdnwk")
        setCartcount(data.cartCount);
      }
    } catch (error: any) {
      console.log(error);
    } finally {

    }
  };

  return (

    <View style={[styles.header,]}>
      {/* {console.log(headerName)} */}
      {
        headerName == 'find' ?
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <TouchableOpacity
              onPress={onbackpress}
            >

              <AppImage
                source={Logos.rightarrow}
                width={16}
                height={16}
                resizeMode='contain'
                tintColor={"#6B5A60"}
              />
            </TouchableOpacity>
            <AppText fontSize={24} color='#6B5A60' fontWeight={500}>
              {"Find Agent"}
            </AppText>
          </View>


          :


          headerName == 'place' ?
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  //  setVisible('dash')
                  navigation.navigate('Home')
                }}
                style={{
                  height: 70,
                  //  backgroundColor: 'red',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36
                }}
              >
                <AppImage
                  source={Logos.rightarrow}
                  width={26}
                  height={16}
                  resizeMode='contain'
                  tintColor={"#6B5A60"}
                />
              </TouchableOpacity>
              <View
              // onPress={() => {
              //   //  setVisible('dash')
              //   navigation.navigate('Home')
              // }}
              >
                <AppText fontSize={24} color='#6B5A60' fontWeight={500}>
                  {"Place Order"}
                </AppText>
              </View>

            </View>


            :

            headerName == 'Product Details' ?
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <TouchableOpacity
                  onPress={() => {
                    //  setVisible('dash')
                    navigation.goBack()
                  }}
                >
                  <AppImage
                    source={Logos.rightarrow}
                    width={16}
                    height={16}
                    resizeMode='contain'
                    tintColor={"#6B5A60"}
                  />
                </TouchableOpacity>
                <AppText fontSize={24} color='#6B5A60' fontWeight={500}>
                  {"Product Details"}
                </AppText>
              </View>
              :

              headerName == 'ChatScreen' ?
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                  <TouchableOpacity
                    onPress={onbackpress}
                  >

                    <AppImage
                      source={Logos.rightarrow}
                      width={16}
                      height={16}
                      resizeMode='contain'
                      tintColor={"#6B5A60"}
                    />
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' }}>

                    <AppImage
                      source={profileImage}
                      width={40}
                      height={40}
                      resizeMode='cover'
                      //  tintColor={"#6B5A60"}
                      style={{
                        borderRadius: 20
                      }}
                    />
                    <View>

                      <AppText fontSize={16} color='#6B5A60' fontWeight={700}>
                        {user}
                      </AppText>
                      <AppText fontSize={10} color='#AB2C5D' fontWeight={700}>
                        {title}
                      </AppText>
                    </View>
                  </View>
                </View>

                :

                headerName == undefined || headerName == 'dash' || headerName == 'guid' ?
                  <AppImage
                    source={Logos.splashLogo}
                    height={60}
                    width={60}
                    resizeMethod='contain'
                    style={{ marginTop: 5 }}
                  />
                  :
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                    <TouchableOpacity
                      onPress={() => {
                        //  setVisible('dash')
                        navigation.navigate('Products')
                      }}
                    >


                      <AppImage
                        source={Logos.rightarrow}
                        width={16}
                        height={16}
                        resizeMode='contain'
                        tintColor={"#6B5A60"}
                      />
                    </TouchableOpacity>
                    <AppText fontSize={24} color='#6B5A60' fontWeight={700}>
                      {headerName}
                    </AppText>
                  </View>

      }

      <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('NotificationScreen')
          }}
        >
          <AppImage
            source={Icons.bell}
            height={20}
            width={16}
            resizeMethod='contain'
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartContainer}
          onPress={() => {
            navigation.navigate('PlaceOrder')
          }}
        >
          <AppImage
            source={Icons.cart}
            height={20}
            width={20}
            resizeMode="contain"
          />

          {cartCount > 0 && (
            <View style={styles.badge}>
              <AppText
                fontSize={9}
                color="#fff"
                fontWeight={700}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </AppText>
            </View>
          )}
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default MainHeader

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: color.white,

    // iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,

    // Android
    elevation: 6,
  },
  cartContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
})