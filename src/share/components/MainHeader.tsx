import React from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native'

import AppText from '../components/AppText'
import color, { useAppColors } from '../constants/color'
import { Images, Logo } from '../constants/media';
import LinearGradient from 'react-native-linear-gradient';
import AppImage from './AppImage';
import { Inter } from '../constants/fonts';
import { GlobalImage } from '../utils/GlobalImage';
interface MainHeaderProps {
  user?: any
  userName?: string
  profileImage?: string
  onNotificationPress?: () => void
  onProfilePress?: () => void
}

const MainHeader: React.FC<MainHeaderProps> = ({
  user,
  userName = 'Kareena',
  profileImage = Images.profile,
  onProfilePress,
}) => {
  const color = useAppColors();
  return (

    <View style={[styles.header, { backgroundColor: color.darkbackround, }]}>
      {/* { console.log(user)} */}
      <View style={[styles.headerRow, { backgroundColor: color.darkbackround, }]}>
        {/* Left Notification */}
        <View style={styles.profilecontainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.right}
            onPress={onProfilePress}
          >
            <ImageBackground source={
              Images.profilelogo
            }
              style={styles.profileImage}>
              <Image
                source={
                  GlobalImage(user?.avatar_url)
                }
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 100,
                }}
              />
            </ImageBackground>

          </TouchableOpacity>
          <View style={{ flexDirection: 'column', gap: 0, }}>
            <AppImage
              source={Logo.mainlogo}
              width={38}
              height={29}

            />
            <AppText
              fontSize={16}
              color={color.darkthemetext}
              fontFamily={Inter.regular}
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ flexShrink: 1, width: 135, flexWrap: 'wrap', }}
            >
              {user?.name
                ? user.name.charAt(0).toUpperCase() +
                user.name.slice(1).toLowerCase()
                : ''}
            </AppText>
            <AppText
              fontSize={10}
              color={color.lgyellow}
              fontFamily={Inter.regular}
              marginTop={5}
            >
              {"Ready to sing today"}
            </AppText>
          </View>


        </View>


        <View style={{ gap: 10, flexDirection: 'row' }}>
          <LinearGradient
            colors={['#FDCD00', '#FF8300']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              height: 33,
              justifyContent: 'center',
            }}
          >

          </LinearGradient>

          <LinearGradient
            colors={['#FDCD00', '#FF8300']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 25,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 34,
                height: 34,
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: color.darkbackround,
                margin: 1
              }}
            >
              <Image
                source={Images.bell}
                style={styles.actionIcon}
              />
            </TouchableOpacity>


          </LinearGradient>

        </View>

      </View>
    </View >
  )
}

export default MainHeader

const styles = StyleSheet.create({
  header: {
    // height: 70,

    width: Dimensions.get('window').width,
    //paddingHorizontal: 6,
    //marginHorizontal:6,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'red'

  },
  profilecontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  }
  ,
  headerRow: {
    // alignSelf: 'flex-start',
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
    // backgroundColor: color.darkbackround,
    // padding: 20,

    // width: Dimensions.get('window').width,
    //flexWrap: 'wrap'
    backgroundColor: color.darkbackround,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  profileImage: {
    width: 51,
    height: 51,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },

  iconContainer: {
    width: 98,
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffff',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 5

  },

  actionIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  notificationView: {
    borderWidth: 1,
    borderColor: '#ffff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 34,
    width: 34,
    borderRadius: 50


  }
})