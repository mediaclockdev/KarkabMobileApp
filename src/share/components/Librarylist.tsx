import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import AppText from '../components/AppText'
import AppImage from '../components/AppImage'
import { Banner, Images, Logo } from '../constants/media'
import { useAppColors } from '../constants/color'
import Sound from 'react-native-nitro-sound'
import { Inter } from '../constants/fonts'
import { GlobalImage } from '../utils/GlobalImage'
import apiUrls from '../../services/apiUrls'
import { useNavigation } from '@react-navigation/native'
import ApiService from '../../services/api'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import { addsong, isPausesd, openSongAction } from '../../auth/redux/authSlice'
import TrackPlayer from '@rntp/player'
import { playSongList, playTrackSong } from '../../services/player'

export type MusicItem = {
  id: string;
  title: string;
  artist: string;
  image?: any;
  cover_image_url?: string;
  album_picture_url?: string;
  badge?: string;
  duration?: string | number;
  original_song?: string;
  is_favorite?: boolean;
  recording_url?: string;
  file_path?: string;
  album_name?: string;
  status?: string;
  type?: string;
};

interface LibrarylistProps {
  data?: MusicItem[];
  musicData: MusicItem[];
  loading: boolean;
  onLikePress?: () => void;
  onDislikePress?: () => void;
  type?: string;
  ListHeaderComponent?: React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const Librarylist = ({
  musicData,
  loading,
  onLikePress,
  onDislikePress,
  type,
  ListHeaderComponent,
  refreshing = false,
  onRefresh,
  loadingMore = false,
  onLoadMore,
  hasMore = true,
}: LibrarylistProps) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const playsong = useAppSelector((state: any) => state.auth.playsong);
  const isPaused = useAppSelector((state: any) => state.auth.isPaused);
  const color = useAppColors();

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadings, setLoadings] = useState(false);
  const [songs, setSongs] = useState<MusicItem[]>(musicData || []);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([]);
  useEffect(() => {
    setSongs(musicData || []);
  }, [musicData]);

  useEffect(() => {
    if (playsong?.id) {
      setPlayingId(playsong.id.toString());
    } else {
      setPlayingId(null);
    }
  }, [playsong?.id]);

  const playRecording = async (item: any) => {
    try {
      await Sound.stopPlayer();
      await Sound.removePlayBackListener();
    } catch (e) { }

    setPlayingId(item.id?.toString());
    setLoadings(true);
    await dispatch(isPausesd(false));

    try {
      const list = songs.length > 0 ? songs : musicData || [];
      const songIndex = list.findIndex(
        (s: any) => s.id?.toString() === item.id?.toString()
      );
      const initialIndex = songIndex >= 0 ? songIndex : 0;
      if (list.length > 0) {
        await playSongList(list, initialIndex, true);
      } else {
        await playTrackSong(item, true);
      }
    } catch (error) {
      console.log('Librarylist play error:', error);
      dispatch(addsong({ ...item }));
    } finally {
      setLoadings(false);
    }
  };

  const stopRecording = async () => {
    try {
      await dispatch(isPausesd(true));
      await TrackPlayer.pause();
      try {
        await Sound.pausePlayer();
      } catch (e) { }
    } catch (error) {
      console.log('Stop Error:', error);
    }
  };

  const likefun = async (id: string) => {
    try {
      const response = await ApiService.post(apiUrls.addfavorite(id));
      const res = response.data;
      if (res.success) {
        setSongs(prev =>
          prev.map(song =>
            song.id === id ? { ...song, is_favorite: true } : song
          )
        );
        onLikePress?.();
      } else {
        //  Alert.alert("Error", res.error || res.message);
      }
    } catch (error: any) {
      // Alert.alert("Error", error?.response?.data?.message || "failed");
    }
  };

  const dislikefun = async (id: string) => {
    try {
      const response = await ApiService.delete(apiUrls.addfavorite(id));
      const res = response.data;
      if (res.success) {
        setSongs(prev =>
          prev.map(song =>
            song.id === id ? { ...song, is_favorite: false } : song
          )
        );
        onDislikePress?.();
      } else {
        // Alert.alert("Error", res.error || res.message);
      }
    } catch (error: any) {
      //Alert.alert("Error", error?.response?.data?.message || "failed");
    }
  };

  const handleFavorite = async (item: MusicItem) => {
    const id = item.id?.toString();

    if (!id || favoriteLoadingIds.includes(id)) {
      return;
    }

    const wasFavorite = !!item.is_favorite;
    const nextFavorite = !wasFavorite;

    // Update UI immediately
    setSongs(prev =>
      prev.map(song =>
        song.id?.toString() === id
          ? { ...song, is_favorite: nextFavorite }
          : song
      )
    );

    setFavoriteLoadingIds(prev => [...prev, id]);

    try {
      const response = nextFavorite
        ? await ApiService.post(apiUrls.addfavorite(id))
        : await ApiService.delete(apiUrls.addfavorite(id));

      const res = response.data;

      if (!res?.success) {
        throw new Error(res?.message || 'Favorite request failed');
      }

      if (nextFavorite) {
        onLikePress?.();
      } else {
        onDislikePress?.();
      }
    } catch (error: any) {
      // Restore the previous state if the API fails
      setSongs(prev =>
        prev.map(song =>
          song.id?.toString() === id
            ? { ...song, is_favorite: wasFavorite }
            : song
        )
      );

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
        error?.message ||
        'Unable to update favorite. Please try again.'
      );
    } finally {
      setFavoriteLoadingIds(prev => prev.filter(songId => songId !== id));
    }
  };


  const handleEndReached = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (!loading && !loadingMore && hasMore && onLoadMore) {
        onEndReachedCalledDuringMomentum.current = true;
        onLoadMore();
      }
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 100 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={color.mgyellow || '#BC4402'} />
        <AppText fontSize={12} color={color.darkthemetext} marginTop={6}>
          Loading more songs...
        </AppText>
      </View>
    );
  };

  const renderItem = ({ item }: { item: MusicItem }) => {
    return (
      <View style={[styles.card, { borderColor: '#1A1A1A' }]}>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('.', { id: item.id, type: type })}
        >
          <View style={styles.imageContainer}>
            {item?.cover_image_url ? (
              <AppImage
                source={GlobalImage(item?.cover_image_url)}
                width={62}
                height={114}
                resizeMode="cover"
              />
            ) : (
              <AppImage
                source={GlobalImage(item?.album_picture_url)}
                width={62}
                height={114}
                resizeMode="cover"
              />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => (navigation as any).navigate('.', { id: item.id, type: type })}
          style={styles.content}
        >
          <AppText
            fontSize={14}
            fontWeight="700"
            color={color.darkthemetext}
            numberOfLines={1}
          >
            {item.title}
          </AppText>
          <AppText
            fontSize={12}
            color={'#C0C2C1'}
            marginTop={4}
            numberOfLines={1}
          >
            {item?.artist || item?.album_name}
          </AppText>
        </TouchableOpacity>
        {/* {console.log(item, "kkkk")} */}
        {
          !item?.tags?.length || item?.tags?.length == 0 ?
            null :
            <>

              {item?.tags[0] && (
                <View
                  style={[
                    styles.badgeContainer,
                    { borderColor: item.badge === 'Trending' ? '#F86501' : item.badge === 'Popular' ? '#F8C706' : '#9AF332' }
                  ]}
                >
                  <AppImage
                    source={item.title === 'Trending' ? Images.lit : item.title === 'Popular' ? Images.star : Images.mic}
                    height={10}
                    width={10}
                    tintColor={item.title === 'Trending' ? '#F86501' : item.title === 'Popular' ? '#F8C706' : '#9AF332'}
                    resizeMode="contain"
                  />
                  <AppText
                    color={item.title === 'Trending' ? '#F86501' : item.title === 'Popular' ? '#F8C706' : '#9AF332'}
                    fontSize={10}
                    fontFamily={Inter.regular}
                    numberOfLines={1}
                  >
                    {item.title}
                  </AppText>
                </View>
              )}
            </>
        }



        <TouchableOpacity
          disabled={favoriteLoadingIds.includes(item.id?.toString() || '')}
          onPress={() => handleFavorite(item)}
          style={{ padding: 5 }}
        >
          {favoriteLoadingIds.includes(item.id?.toString() || '') ? (
            <ActivityIndicator
              size="small"
              color="#E10815"
            />
          ) : (
            <AppImage
              source={
                item.is_favorite
                  ? Banner.filllike
                  : Images.like
              }
              height={15}
              width={15}
              tintColor={
                item.is_favorite
                  ? '#E10815'
                  : '#CDCECB'
              }
              style={{ marginHorizontal: 5 }}
            />
          )}
        </TouchableOpacity>


        <AppText fontSize={10} color={'#CDCECB'} marginTop={4} style={{ marginBottom: 5 }}>
          {item.duration || '00:00'}
        </AppText>

        <View style={styles.right}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              playingId?.toString() === item.id?.toString() && !isPaused
                ? stopRecording()
                : playRecording(item);
            }}
          >
            {loadings && playingId?.toString() === item.id?.toString() ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                {playingId?.toString() === item.id?.toString() && !isPaused ? (
                  <View style={styles.pauseContainer}>
                    <View style={styles.pauseLine} />
                    <View style={styles.pauseLine} />
                  </View>
                ) : (
                  <AppImage
                    source={Images.playicon}
                    width={10}
                    height={10}
                    tintColor={color.darkthemetext}
                  />
                )}
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { dispatch(openSongAction(item)); }}
            style={styles.menu}
          >
            <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
            <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
            <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={songs}
      keyExtractor={(item, index) => (item?.id ? `${item.id}-${index}` : index.toString())}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[color.mgred]}
            progressBackgroundColor={color.darkgray}
          />



        ) : undefined
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onMomentumScrollBegin={() => {
        onEndReachedCalledDuringMomentum.current = false;
      }}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={() =>
        loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={color.mgyellow || '#BC4402'} />
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <AppImage source={Logo.ymusic} width={20} height={20} />
            <AppText color={color.darkthemetext} fontSize={14} marginTop={10}>
              No songs found
            </AppText>
          </View>
        )
      }
    />
  );
};

export default Librarylist;

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 10,
    marginBottom: 5,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    justifyContent: 'center',
    gap: 5,
  },
  imageContainer: {
    width: 62,
    height: 64,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6D3202',
  },
  content: {
    flex: 1,
    marginLeft: 5,
  },
  badgeContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    borderRadius: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: 100
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 15,
  },
  playButton: {
    width: 24,
    height: 24,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#BC4402',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pauseContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseLine: {
    width: 3,
    height: 14,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  menu: {
    marginLeft: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 2.4,
    height: 2.4,
    borderRadius: 100,
    backgroundColor: '#FFF',
    marginVertical: 1.5,
    marginRight: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
});