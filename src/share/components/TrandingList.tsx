
import React from 'react';
import {
  FlatList,
  ImageBackground,
  ImageSourcePropType,
  TouchableOpacity,
  View,
} from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';
import { Inter } from '../constants/fonts';
import color from '../constants/color';
import { Images, Logo } from '../constants/media';
import { GlobalImage } from '../utils/GlobalImage';
import { useNavigation } from '@react-navigation/native';

type TrandingListItem = {
  id: number;
  title: string;
  artist: string;
  image?: ImageSourcePropType;
  cover_image_url?: string;
  likes_count?: number;
};

type TrandingListProps = {
  data?: TrandingListItem[];
};

export default function TrandingList({
  data = [],
}: TrandingListProps) {
  const navigation = useNavigation();

  return (
    <View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 15,
        }}
        ItemSeparatorComponent={() => (
          <View style={{ width: 10 }} />
        )}

        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              (navigation as any).navigate('.', {
                id: item.id,
              });
            }}
            style={{
              width: 125,
              height: 164,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#211513',
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#1A1919',
            }}
          >
            {/* Background Image */}
            <ImageBackground
              source={
                item?.cover_image_url
                  ? GlobalImage(item.cover_image_url)
                  : item?.image
              }
              resizeMode="cover"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
              }}
            />

            {/* Dark overlay */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.35)',
              }}
            />

            {/* Play Button */}
            <View
              style={{
                borderWidth: 2,
                borderColor: '#BC4402',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.8)',
                height: 38,
                width: 38,
                borderRadius: 19,
                marginTop: 15,
              }}
            >
              <AppImage
                source={Images.playicon}
                width={12}
                height={12}
                resizeMode="contain"
              />
            </View>

            {/* Song Title */}
            <AppText
              color="#FFFFFF"
              fontSize={12}
              fontFamily={Inter.regular}
              textAlign="center"
              numberOfLines={1}
              style={{
                marginTop: 10,
                paddingHorizontal: 8,
              }}
            >
              {item?.title}
            </AppText>

            {/* Artist */}
            <AppText
              color="#FFFFFF"
              fontSize={12}
              fontFamily={Inter.regular}
              textAlign="center"
              marginTop={4}
              numberOfLines={1}
              style={{
                paddingHorizontal: 8,
              }}
            >
              {item?.artist}
            </AppText>

            {/* Likes */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 6,
              }}
            >
              <AppImage
                source={Images.ylit}
                width={12}
                height={12}
                resizeMode="contain"
              />

              <AppText
                color="#E52450"
                fontSize={12}
                fontFamily={Inter.regular}
                marginLeft={4}
              >
                {item?.likes_count ?? 0}
              </AppText>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

