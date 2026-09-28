import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Images, Logo } from '../constants/media';
import AppImage from './AppImage';
import color from '../constants/color';
import AppText from './AppText';

interface Song {
  id: string;
  title: string;
  artist: string;
  image: any;
}

interface RecommendedSongsProps {
  songs?: Song[];
  onSeeAll?: () => void;
  onPlay?: (song: Song) => void;
  onMore?: (song: Song) => void;
}

const defaultSongs: Song[] = [
  {
    id: '1',
    title: 'أماكن السهر',
    artist: 'Amr Diab',
    image: Images.profile,
  },
  {
    id: '2',
    title: 'عيش الكلام',
    artist: 'Tamer Hosny',
    image: Images.profile,
  },
  {
    id: '3',
    title: 'الليلة دوب',
    artist: 'Mohamed Mounir',
    image: Images.profile,
  },
  {
    id: '4',
    title: 'أنت عمري',
    artist: 'Kadim Al Sahir',
    image: Images.profile,
  },
];

const RecommendedSongs = ({
  songs = defaultSongs,
  onSeeAll,
  onPlay,
  onMore,
}: RecommendedSongsProps) => {
  const renderSong = ({ item }: { item: Song }) => {
    return (
      <TouchableOpacity
        onPress={() => onPlay?.(item)}
      >


        <LinearGradient
          colors={['#1D1D1D', '#101010']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}>
          <View style={styles.songCard}>
            {/* Song Image */}
            <AppImage source={item?.cover_image_url} style={styles.songImage} />

            {/* Song Details */}
            <View style={styles.songInfo}>
              <Text
                numberOfLines={1}
                style={styles.songTitle}>
                {item.title}
              </Text>

              <Text
                numberOfLines={1}
                style={styles.artistName}>
                {item.artist}
              </Text>
            </View>

            {/* Play */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.playButton}
              onPress={() => onPlay?.(item)}>
              <View style={styles.playTriangle} />
            </TouchableOpacity>

            {/* More */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.moreButton}
              onPress={() => onMore?.(item)}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };
  const renderEmpty = () => {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
      }}>
        <AppImage
          source={Logo.ymusic}
          width={20}
          height={20}
        />
        <AppText
          color={color.darkthemetext}
          fontSize={14}
          marginTop={10}
        >
          No songs found
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}



      {/* Songs */}
      <FlatList
        data={songs?.slice(0, 10)}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={renderSong}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          songs.length === 0 && styles.emptyListContainer,
        ]}
      />
    </View>
  );
};

export default RecommendedSongs;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  seeAllText: {
    color: '#E51B23',
    fontSize: 14,
    fontWeight: '600',
  },

  arrow: {
    color: '#E51B23',
    fontSize: 25,
    lineHeight: 20,
    marginLeft: 4,
    marginTop: -2,
  },

  listContainer: {
    // paddingHorizontal: 20,
    gap: 10,
  },

  cardGradient: {
    width: 180,
    height: 66,
    borderRadius: 9,
    padding: 1,
  },

  songCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingHorizontal: 8,
  },

  songImage: {
    width: 38,
    height: 38,
    borderRadius: 7,
  },

  songInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
    justifyContent: 'center',
  },

  songTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'left',
  },

  artistName: {
    color: '#999999',
    fontSize: 10,
  },

  playButton: {
    width: 20,
    height: 20,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#5D5555',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },

  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    marginLeft: 2,
  },

  moreButton: {
    width: 20,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  emptyListContainer: {
    flexGrow: 1,
  },

  emptyContainer: {
    width: 250,
    height: 66,
    borderRadius: 9,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  emptyText: {
    color: '#777777',
    fontSize: 12,
  },
});