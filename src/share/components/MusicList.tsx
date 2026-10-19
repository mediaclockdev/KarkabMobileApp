import React, { useState, useEffect, useCallback, useMemo } from 'react'

import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'

import AppText from '../components/AppText'
import AppImage from '../components/AppImage'
import { Images, Logo } from '../constants/media'
import color, { useAppColors } from '../constants/color'
import { Inter } from '../constants/fonts'
import Sound, {
} from 'react-native-nitro-sound';
import { GlobalImage } from '../utils/GlobalImage'
import { addsong, isPausesd, openSongAction } from '../../auth/redux/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import { useNavigation } from '@react-navigation/native'
import TrackPlayer from '@rntp/player'
import { playSongList, playTrackSong } from '../../services/player'

// ─── Static data (never changes, defined outside component) ───────────────────

const musicData = [
  {
    id: '1',
    title: 'Mabrook',
    artist: 'Hozan Yosif',
    image: Logo.sngerprofile,
    titcolor: '#B72C7F',
    path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: 'Dream Night',
    artist: 'Alan Walker',
    image: Logo.sngerprofile,
    titcolor: '#AE711C',
    path: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'
  },
  {
    id: '3',
    title: 'Feel The Beat',
    artist: 'DJ Snake',
    image: Logo.sngerprofile,
    titcolor: '#D3C36A',
    path: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
  },
]

const WAVE_COLORS = [
  '#B72C7F',
  '#AE711C',
  '#D3C36A',
  '#4CAF50',
  '#2196F3',
  '#9C27B0',
];

// ─── Memoized list item (only re-renders when its own props change) ───────────

interface SongItemProps {
  item: any;
  index: number;
  isPlaying: boolean;
  isLoading: boolean;
  isPaused: boolean;
  themeColor: any;
  onPlay: (item: any) => void;
  onStop: () => void;
  onOpenActions: (item: any) => void;
}

const SongItem = React.memo(({
  item,
  index,
  isPlaying,
  isLoading,
  isPaused,
  themeColor,
  onPlay,
  onStop,
  onOpenActions,
}: SongItemProps) => {

  const handlePress = useCallback(() => {
    if (isPlaying && !isPaused) {
      onStop();
    } else {
      onPlay(item);
    }
  }, [isPlaying, isPaused, onStop, onPlay, item]);

  const handleOpenActions = useCallback(() => {
    onOpenActions(item);
  }, [onOpenActions, item]);

  return (
    <View style={[styles.card, { borderColor: themeColor.homebordercolor }]}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <AppImage
          source={GlobalImage(item?.cover_image_url)}
          width={49}
          height={89}
          resizeMode="cover"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <AppText
          fontSize={12}
          fontWeight="700"
          color={themeColor.darkthemetext}
          fontFamily={Inter.bold}
          numberOfLines={1}
        >
          {item.title}
        </AppText>

        <AppText
          fontSize={10}
          color={themeColor.darkthemetext}
          marginTop={4}
          fontFamily={Inter.regular}
          numberOfLines={1}
        >
          {item.artist}
        </AppText>
      </View>

      {/* Right Side */}
      <View style={styles.right}>
        <AppImage
          source={Images.freq}
          width={94}
          height={12}
          tintColor={WAVE_COLORS[index % WAVE_COLORS.length]}
        />
        {/* Play Button */}
        <TouchableOpacity style={styles.playButton} onPress={handlePress}>
          {isLoading && isPlaying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              {isPlaying && !isPaused ? (
                <View style={styles.pauseContainer}>
                  <View style={styles.pauseLine} />
                  <View style={styles.pauseLine} />
                </View>
              ) : (
                <AppImage
                  source={Images.playicon}
                  width={10}
                  height={10}
                  tintColor={themeColor.darkthemetext}
                />
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Menu */}
        <TouchableOpacity onPress={handleOpenActions} style={styles.menu}>
          <View style={[styles.dot, { backgroundColor: themeColor.darkthemetext }]} />
          <View style={[styles.dot, { backgroundColor: themeColor.darkthemetext }]} />
          <View style={[styles.dot, { backgroundColor: themeColor.darkthemetext }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─── Main MusicList component ─────────────────────────────────────────────────

const MusicList: React.FC<{
  data?: any[];
  loading?: boolean;
}> = ({ data = [], loading = false }) => {

  const themeColor = useAppColors();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadings, setLoadings] = useState(false);
  const dispatch = useAppDispatch();
  const playsong = useAppSelector(
    (state: any) => state.auth.playsong
  );
  const isPaused = useAppSelector(
    (state: any) => state.auth.isPaused
  );

  // Sync playingId with Redux playsong so active track highlight updates automatically
  useEffect(() => {
    if (playsong?.id) {
      setPlayingId(playsong.id.toString());
    } else {
      setPlayingId(null);
    }
  }, [playsong?.id]);

  // ── Stabilize the data array reference ──
  // data.slice(0, 8) was creating a brand-new array every render,
  // making FlatList think the data changed and re-render all items.
  const displayData = useMemo(() => {
    const source = Array.isArray(data) && data.length > 0 ? data : musicData;
    return source.slice(0, 8);
  }, [data]);

  // ── Memoized callbacks (stable references) ──

  const playRecording = useCallback(async (item: any) => {
    try {
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
    } catch (e) { }

    setPlayingId(item.id?.toString());
    setLoadings(true);
    dispatch(isPausesd(false));

    try {
      const list = Array.isArray(data) && data.length > 0 ? data : [item];
      const songIndex = list.findIndex(
        (s: any) => s.id?.toString() === item.id?.toString()
      );
      const initialIndex = songIndex >= 0 ? songIndex : 0;
      await playSongList(list, initialIndex, true);
    } catch (error) {
      console.log('MusicList play error:', error);
      dispatch(addsong({ ...item }));
    } finally {
      setLoadings(false);
    }
  }, [data, dispatch]);

  const stopRecording = useCallback(async () => {
    try {
      console.log('Stopping player in MusicList');
      dispatch(isPausesd(true));
      await TrackPlayer.pause();
      try {
        await Sound.pausePlayer();
      } catch (e) { }
    } catch (error) {
      console.log('Stop Error:', error);
    }
  }, [dispatch]);

  const handleOpenActions = useCallback((item: any) => {
    dispatch(openSongAction(item));
  }, [dispatch]);

  // ── Stable keyExtractor ──
  const keyExtractor = useCallback((item: any) => item.id?.toString(), []);

  // ── Memoized renderItem ──
  const renderItem = useCallback(({ item, index }: any) => {
    const itemIdStr = item.id?.toString();
    const isThisPlaying = playingId === itemIdStr;

    return (
      <SongItem
        item={item}
        index={index}
        isPlaying={isThisPlaying}
        isLoading={loadings}
        isPaused={isPaused}
        themeColor={themeColor}
        onPlay={playRecording}
        onStop={stopRecording}
        onOpenActions={handleOpenActions}
      />
    );
  }, [playingId, loadings, isPaused, themeColor, playRecording, stopRecording, handleOpenActions]);

  // ── Memoized empty component ──
  const ListEmpty = useMemo(() => (
    <View style={styles.emptyContainer}>
      <AppImage
        source={Logo.ymusic}
        width={20}
        height={20}
      />
      <AppText
        color={themeColor.darkthemetext}
        fontSize={14}
        marginTop={10}
      >
        No songs found
      </AppText>
    </View>
  ), [themeColor.darkthemetext]);

  return (
    <View style={{
      backgroundColor: themeColor.darkbackround,
      borderWidth: 1,
      borderColor: themeColor.homebordercolor,
      borderRadius: 12,
      marginBottom: 15
    }}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="small"
            color={themeColor.mgyellow}
          />
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={ListEmpty}
          // Prevent unnecessary re-renders when scrolling
          removeClippedSubviews={true}
          // Tell FlatList which props changed to avoid full list re-render
          extraData={playingId}
        />
      )}
    </View>
  );
}

export default MusicList

const styles = StyleSheet.create({
  listContainer: {
    // paddingBottom: 20,
  },

  card: {
    borderRadius: 20,
    padding: 12,
    marginVertical: 3,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#1F1F1F',
  },

  imageContainer: {
    width: 49,
    height: 49,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  wave: {
    width: 2,
    borderRadius: 10,
    backgroundColor: '#FF003C',
    marginRight: 3,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 15
  },

  playButton: {
    width: 34,
    height: 34,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#FF5A00',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 100,
    backgroundColor: '#FFF',
    marginVertical: 1.5,
  },
  loaderContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
})