import React, { useEffect, useRef, useState } from 'react'

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'
import AppText from './AppText'
import color from '../constants/color'
import { Images } from '../constants/media'

import LinearGradient from 'react-native-linear-gradient'
import AppImage from './AppImage'
import { useNavigation } from '@react-navigation/native'

const { width } = Dimensions.get('window')

const banners = [
  {
    id: '1',
    title: 'Your voice\nYour spotlight.',
    image: require('../../../assets/HomeScreen/image141.png'),
  },
  {
    id: '2',
    title: 'Feel The Beat',
    image: Images.banner1,
  },
  {
    id: '3',
    title: 'Enjoy Your Playlist',
    image: require('../../../assets/HomeScreen/image141.png'),
  },
]

const HomeBanner = () => {
  const flatListRef = useRef<FlatList>(null)
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        activeIndex === banners.length - 1
          ? 0
          : activeIndex + 1

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      })

      setActiveIndex(nextIndex)
    }, 3000)

    return () => clearInterval(interval)
  }, [activeIndex])

  const onScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / width,
    )

    setActiveIndex(slide)
  }

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9}>
            <ImageBackground
              source={item.image}
              resizeMode="contain"
              style={styles.banner}
              imageStyle={styles.image}
            >
              {/* Overlay */}
              <View style={styles.overlay}>
                {/* <AppText
            fontSize={16}
            fontWeight="400"
            color={color.darkthemetext}
          >
            {item.title}
          </AppText> */}
                <AppText
                  fontSize={24}
                  fontWeight="400"
                  color={color.darkthemetext}
                 
                >
                  {item.title}
                </AppText>
                {/* <Text style={styles.title}>
                  {item.title}
                </Text> */}
              </View>
              <AppText
                fontSize={12}
                fontWeight="400"
                color={color.lgyellow}
               
              >
                {"Your stage is waiting."}
              </AppText>
              <AppText
                fontSize={16}
                fontWeight="400"
                color={color.lgyellow}
              
              >
                {" الصوت ليك.. والمسرح بانتظارك"}
              </AppText>
              {/* onRightPress={() => {
                navigation.navigate('Recording');
              }} */}
              <TouchableOpacity onPress={() => {
                navigation.navigate('Recording');
              }}>
                <LinearGradient
                  colors={['#FF9A01', '#CF7D00', '#A96600']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 143,
                    height: 33,
                    borderRadius: 22,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 8,
                    marginTop: 8
                  }}
                >



                  <AppText
                    fontSize={12}
                    fontWeight="400"
                    color={"#FFFF"}
                   
                  >
                    {"Sing Now"}
                  </AppText>
                  <AppImage
                    source={Images.bannerdots}
                    width={12}
                    height={13}
                    tintColor={color.darkthemetext}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Dots Inside Banner */}
              <View style={styles.dotContainer}>
                {banners.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      activeIndex === index &&
                      styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

export default HomeBanner

const styles = StyleSheet.create({
  banner: {
    width: width - 40,
    height: 220,
    //marginHorizontal: 20,
    // justifyContent: 'flex-end',
    overflow: 'hidden',
    // borderRadius: 20,
    padding: 20
  },

  image: {
    //borderRadius: 20,
  },

  overlay: {
    // backgroundColor: 'rgba(0,0,0,0.35)',
    // padding: 20,
  },

  title: {
    color: '#FFF',
    fontSize: 24,
  
    fontWeight: '700',
  },

  dotContainer: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    width: 10,
    height: 3,
    borderRadius: 100,
    backgroundColor: '#FFF',
    opacity: 0.5,
    marginHorizontal: 4,
  },

  activeDot: {
    width: 22,
    opacity: 1,
    backgroundColor: '#EF323B',
  },
})