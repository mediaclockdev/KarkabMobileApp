import React from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';
import { Inter } from '../constants/fonts';
import { useAppColors } from '../constants/color';
import { Images } from '../constants/media';

interface SelectedArtistMixProps {
  data: any[];
  onPress?: (item: any) => void;
  onPlay?: (item: any) => void;
}

const SelectedArtistMix = ({
  data = [],
  onPress,
  onPlay,
}: SelectedArtistMixProps) => {
  const colors = useAppColors();
  const selectedArtistMixData = [
    {
      id: 1,
      name: 'Mohamed Mounir',
      image: Images.profile,
    },
    {
      id: 2,
      name: 'Amr Diab',
      image: Images.profile,
    },
    {
      id: 3,
      name: 'Tamer Hosny',
      image: Images.profile,
    },
    {
      id: 4,
      name: 'Kadim Al Sahir',
      image: Images.profile,
    },
  ];

  return (
    <FlatList
      horizontal
      data={data?.slice(0, 10)}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) =>
        String(item?.id || index)
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <AppText
            color="#999"
            fontSize={14}
            fontFamily={Inter.medium}
          >
            No songs available
          </AppText>
        </View>
      }
      contentContainerStyle={[
        styles.listContainer,
        data.length === 0 && styles.emptyListContainer,
      ]}
      renderItem={({ item }) => {
        return (
          <TouchableOpacity
            //  activeOpacity={0.8}
            onPress={() => onPlay?.(item)}


            style={[
              styles.card,
              {
                borderColor: colors.homebordercolor,
              },
            ]}
          >
            <AppImage
              source={item.cover_image_url}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Dark overlay */}
            <View style={styles.overlay} />

            {/* Artist details */}
            <View style={styles.bottomContent}>
              <AppText
                color="#FFFFFF"
                fontSize={14}
                fontFamily={Inter.semibold}
                numberOfLines={1}
              >
                {item.name}
              </AppText>

              <AppText
                color="#D4AF37"
                fontSize={11}
                fontFamily={Inter.medium}
                marginTop={4}
              >
                Mix
              </AppText>
            </View>

            {/* Play button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onPlay?.(item)}
              style={styles.playButton}
            >
              <AppText
                color="#FFFFFF"
                fontSize={16}
                fontFamily={Inter.semibold}
                style={{ marginLeft: 2 }}
              >
                ▶
              </AppText>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    gap: 12,
    paddingRight: 10,
    marginBottom: 15
  },

  card: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  bottomContent: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    right: 50,
  },

  playButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 28,
    height: 28,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#6B625D',
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListContainer: {
    flexGrow: 1,
    width: '100%',

  },

  emptyContainer: {
    height: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',

  },

});

export default SelectedArtistMix;