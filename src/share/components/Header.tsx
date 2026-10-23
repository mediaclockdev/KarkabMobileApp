import React from 'react'

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native'

import AppText from '../components/AppText'
import color, { useAppColors } from '../constants/color'
import { Images, Logo } from '../constants/media'
import { Inter } from '../constants/fonts'
import AppImage from './AppImage'
import LinearGradient from 'react-native-linear-gradient'
import { navigate } from '../../navigation/NavigationService'
import { useTranslation } from 'react-i18next'

interface HeaderProps {
  headername?: string
  headertitle?: string
  rightIcon?: any
  onRightPress?: () => void
  rightView?: any
  backpress?: () => void
}
const { t } = useTranslation();
const Header: React.FC<HeaderProps> = ({
  headername = 'Library',
  headertitle = t('Library.Yourmusiccollection'),
  rightIcon,
  onRightPress,
  rightView,
  backpress,
}) => {
  const color = useAppColors();
  return (
    <View style={{ paddingHorizontal: 5, paddingVertical: 14, }}>


      {headername == 'Search' || headername == 'Library' || headername == 'Profile' ?
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <AppImage
            source={Logo.mainlogo}
            height={30}
            width={38}
            resizeMode='cover'

          />
          {/* <View>
  <AppText
  fontSize={14}
  color={color.darkthemetext}
  fontFamily={Inter.regular}
  >
    {"كركاب"}
    </AppText>
      <AppText
  fontSize={12}
  color={color.darkthemetext}
  fontFamily={Inter.regular}
  >
    {"KARKAB"}
    </AppText>
  </View> */}

        </View>

        : null}
      <View style={[styles.header]}>
        {/* Left Content */}

        {
          headername == 'Playlists' || headername == 'Downloads' ?
            <TouchableOpacity
              onPress={backpress}
            >
              <AppImage
                source={
                  Logo.arrowline
                }
                height={25}
                width={19}
                resizeMode="cover"
                tintColor="#FFFF"
                style={{ marginRight: 20 }}
              />
            </TouchableOpacity> : null
        }



        <View style={styles.leftContainer}>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>

            <AppText
              fontSize={headername == 'Library' ? 22 : headername == 'Profile' ? 22 : 22}
              fontWeight="700"
              color={color.darkthemetext}
              fontFamily={Inter.bold}
            >
              {headername}
            </AppText>
            {
              headername == 'Library' ?
                <AppImage
                  source={Logo.ymusic}
                  height={28}
                  width={28}
                  resizeMode='contain'
                  style={{
                    marginTop: 5,
                  }}
                /> :
                headername == 'Profile' ?
                  <AppImage
                    source={Logo.person}
                    height={19}
                    width={16}
                    resizeMode='contain'
                    style={{
                      marginTop: 5,
                    }}
                  />


                  : null
            }

          </View>

          <AppText
            fontSize={14}
            color={headername == 'Search' ? '#FFF195' : '#FFF195'}
            marginTop={1}
            fontFamily={Inter.regular}
            style={{ alignItems: 'flex-start', alignSelf: 'flex-start' }}
          >
            {headertitle}
          </AppText>
        </View>


        {headername == 'Library' ?
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            {/* <View>
              <AppText
                fontSize={16}
                color={'#FFC526'}
                fontFamily={Inter.regular}
              >
                {"كركاب"}
              </AppText>
              <AppText
                fontSize={8}
                color={color.darkthemetext}
                fontFamily={Inter.regular}
              >
                {"KARKAB"}
              </AppText>
            </View> */}
            {/* <AppImage
              source={Logo.mainlogo}
              height={46}
              width={68}
              resizeMode='contain'

            /> */}


          </View>

          : null}


        {/* Right Icon */}
        <View style={{ gap: 15, flexDirection: 'row', alignItems: 'center' }}>
          {
            headername == 'Search' ?
              <LinearGradient
                colors={['#D15F5F', '#B47031']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 25,
                  // padding: 1,
                }}
              >
                <TouchableOpacity
                  onPress={onRightPress}
                  activeOpacity={0.8}
                  style={{
                    width: 43,
                    height: 43,
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: color.darkbackround,
                    margin: 1
                  }}
                >
                  <Image
                    source={rightIcon}
                    style={{
                      width: 15,
                      height: 26,
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>


              </LinearGradient> :
              headername == 'Library' ?
                <View style={{ position: 'relative' }}>
                  <LinearGradient
                    colors={['#FDCD00', '#FF8300']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 25,
                    }}
                  >
                    <TouchableOpacity
                      onPress={onRightPress}
                      activeOpacity={0.8}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: color.darkbackround,
                        margin: 1,
                      }}
                    >
                      <Image
                        source={rightIcon}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>
                  </LinearGradient>

                  {/* Notification Badge */}
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: '#FC6101',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 3,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFF',
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      3
                    </Text>
                  </View>
                </View> :

                <LinearGradient
                  colors={['#FDCD00', '#FF8300']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 25,
                    // padding: 1,
                  }}
                >
                  <TouchableOpacity
                    onPress={onRightPress}
                    activeOpacity={0.8}
                    style={{
                      width: 39,
                      height: 39,
                      borderRadius: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: color.darkbackround,
                      margin: 1
                    }}
                  >
                    <Image
                      source={rightIcon}
                      style={{
                        width: 14,
                        height: 19,
                        resizeMode: 'contain',
                      }}
                    />
                  </TouchableOpacity>


                </LinearGradient>
          }
          {/* <TouchableOpacity
        onPress={onRightPress}
        style={styles.iconButton}
      >
        <Image
          source={rightIcon}
          style={styles.icon}
        />
      </TouchableOpacity> */}


          <View style={{}}>
            {rightView}
          </View>
        </View>

      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  header: {
    //  backgroundColor: color.darkbackround,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',



  },

  leftContainer: {
    flex: 1,
  },

  iconButton: {
    width: 43,
    height: 43,
    borderRadius: 100,

    justifyContent: 'center',
    alignItems: 'center',

    //  backgroundColor: '#1A1A1A',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: color.brown
  },

  icon: {
    width: 15,
    height: 26,
    resizeMode: 'contain',
    tintColor: color.mgyellow,
  },
  actionIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
})