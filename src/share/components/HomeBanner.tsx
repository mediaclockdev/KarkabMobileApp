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
  useWindowDimensions,
} from 'react-native'
import AppText from './AppText'
import color from '../constants/color'
import { Images } from '../constants/media'
import { Inter } from '../constants/fonts'
import LinearGradient from 'react-native-linear-gradient';
import AppImage from './AppImage';
import { useNavigation } from '@react-navigation/native'
import { GlobalImage } from '../utils/GlobalImage';
import RenderHTML from 'react-native-render-html';
const { width } = Dimensions.get('window');


const HomeBanner = ({ data }: { data: any[] }) => {
  const flatListRef = useRef<FlatList>(null)
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();


  useEffect(() => {

    setActiveIndex(0);

    if (!data || data.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setActiveIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % (data?.length || 1);

        flatListRef?.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [data?.length]);

  const onScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / width,
    )

    setActiveIndex(slide)

  }
  const getHtmlStyles = (html: string) => {
    const normalizedHtml = String(html ?? '').replace(/\\"/g, '"');

    const colorMatch = normalizedHtml.match(
      /color\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)/i,
    );

    const weightMatch = normalizedHtml.match(
      /font-weight\s*:\s*(bold|[1-9]00)/i,
    );

    const sizeMatch = normalizedHtml.match(
      /font-size\s*:\s*(x-small|xx-small|small|medium|large|x-large|xx-large|[\d.]+(?:px|pt|em|rem|%)?)/i,
    );

    const sizeMap: Record<string, number> = {
      'xx-small': 8,
      'x-small': 10,
      small: 12,
      medium: 14,
      large: 18,
      'x-large': 24,
      'xx-large': 30,
    };

    const rawSize = sizeMatch?.[1]?.toLowerCase();

    let fontSize = 14;

    if (rawSize) {
      if (sizeMap[rawSize] !== undefined) {
        fontSize = sizeMap[rawSize];
      } else {
        const numericSize = parseFloat(rawSize);

        if (!Number.isNaN(numericSize)) {
          fontSize = rawSize.endsWith('pt')
            ? numericSize * (4 / 3)
            : numericSize;
        }
      }
    }

    return {
      html: normalizedHtml,
      color: colorMatch?.[1] ?? '#1e293b',
      fontWeight: weightMatch?.[1] ?? '400',
      fontSize,
    };
  };
  const getHtmlStyles1 = (html: string) => {
    const normalizedHtml = String(html ?? '')
      .replace(/\\"/g, '"')
      .replace(/\\n/g, ' ');

    const colorMatch = normalizedHtml.match(
      /<font[^>]*\bcolor=["'](#[0-9a-fA-F]{3,8}|[a-zA-Z]+)["']/i,
    );

    const cssColorMatch = normalizedHtml.match(
      /color\s*:\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/i,
    );

    const weightMatch = normalizedHtml.match(
      /font-weight\s*:\s*(bold|[1-9]00)/i,
    );

    return {
      html: normalizedHtml,
      color: colorMatch?.[1] ?? cssColorMatch?.[1] ?? '#1e293b',
      fontWeight: weightMatch?.[1] ?? '400',
    };
  };


  return (
    <View style={{
      marginBottom: 15
    }}>
      <FlatList
        ref={flatListRef}
        data={data || []}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => String(item.id ?? index)}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (

          <TouchableOpacity activeOpacity={0.9}>
            <ImageBackground
              source={
                item.image_url
                  ? GlobalImage(item.image_url)
                  : item.image || Images.banner1
              }
              resizeMode="cover"
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
                {/* <AppText
                  fontSize={24}

                  color={color.darkthemetext}
                  fontFamily={Inter.extrabold}
                >
                  {item.title}
                </AppText> */}
                {item.title ? (() => {
                  const { html, color: titleColor, fontWeight, fontSize } =
                    getHtmlStyles(item.title);

                  return (
                    <RenderHTML
                      contentWidth={screenWidth - 80}
                      source={{ html }}
                      baseStyle={{
                        fontSize: 24,
                        fontFamily: Inter.regular,
                      }}
                      tagsStyles={{
                        span: {
                          color: titleColor,
                          fontWeight,
                          fontSize
                        },
                      }}
                    />
                  );
                })() : null}
                {/* <Text style={styles.title}>
                  {item.title}
                </Text> */}

                {/* <AppText
                fontSize={12}
                fontWeight="400"
                color={color.lgyellow}
                fontFamily={Inter.regular}
              >
                {"Your stage is waiting."}
              </AppText> */}
                {/* {item.description ? (
                  <RenderHTML
                    contentWidth={screenWidth - 80}
                    source={{ html: item.description }}
                    baseStyle={{
                      fontSize: 12,
                      fontFamily: Inter.regular,
                      color: item.title_color || '#1e293b',
                    }}
                    tagsStyles={{
                      p: {
                        color: item.title_color || '#1e293b',
                      },
                      font: {
                        color: item.title_color || '#1e293b',
                      },
                    }}
                  />
                ) : null} */}

                {item.description ? (() => {
                  const { html, color: titleColor, fontWeight, fontSize } =
                    getHtmlStyles(item.description);

                  return (
                    <RenderHTML
                      contentWidth={screenWidth - 80}
                      source={{ html }}
                      baseStyle={{
                        // fontSize: 14,
                        fontFamily: Inter.regular,
                      }}
                      tagsStyles={{
                        span: {
                          color: titleColor,
                          fontWeight,
                          fontSize
                        },
                      }}
                    />
                  );
                })() : null}
                {/* {item.description ? (
                  <RenderHTML
                    contentWidth={screenWidth - 80}
                    source={{
                      html: item.description,
                    }}
                    baseStyle={{
                      fontSize: 24,
                      fontFamily: Inter.regular,
                    }}
                    tagsStyles={{
                      span: {
                        color: '#ffff',

                      },
                    }}
                  />
                ) : null} */}
                {/* onRightPress={() => {
                navigation.navigate('Recording');
              }} */}
                <TouchableOpacity onPress={() => {
                  (navigation as any).navigate('Recording', { prevScreen: 'Home' });
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
                      fontFamily={Inter.regular}
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
                  {data.map((_, index) => (
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
    // padding: 20,
    alignSelf: 'center',
    borderRadius: 20,
    // backgroundColor: 'red',

  },

  image: {
    //borderRadius: 20,
  },

  overlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
    flex: 1
  },

  title: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: Inter.bold,
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