import React, { useState } from 'react'

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
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
  PlayBackType,
} from 'react-native-nitro-sound';
import { GlobalImage } from '../utils/GlobalImage'
import { addsong, isPausesd, openSongAction } from '../../auth/redux/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import { useNavigation } from '@react-navigation/native'
import SongActionSheet from '../../screens/SongActionSheet'

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



const MusicList: React.FC<{
  data?: any[];
  loading?: boolean;
}> = ({ data = [],
  loading = false, }) => {

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const color = useAppColors();
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [loadings, setLoadings] = useState(false);
    const dispatch = useAppDispatch();
    const playsong = useAppSelector(
      (state: any) => state.auth.playsong
    );
    const navigation = useNavigation();
    const [selectedSong, setSelectedSong] = useState<any>(null);
    const [showActions, setShowActions] = useState(false);

    const openSongActions = (song: any) => {
      setSelectedSong(song);
      setShowActions(true);
    };

    const closeSongActions = () => {
      setShowActions(false);
      setSelectedSong(null);
    };

    const playRecording = async (item: any) => {
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
      setPlayingId(item.id);
      setLoadings(true)
      await dispatch(isPausesd(false));
      console.log(item.id, item.original_song, "dkdkbkdbkdb5")
      // try {
      //   const result = await Sound.startPlayer(item.original_song);

      //   console.log('Playing:', result);
      //   await Sound.removePlayBackListener();
      //   Sound.addPlayBackListener((e) => {
      //     setLoadings(false)
      //     console.log(
      //       'Current:',
      //       Sound.mmssss(Math.floor(e.currentPosition)),
      //     );

      dispatch(
        addsong({
          ...item,
        }),)
      setLoadings(false)
      console.log(playsong, "dkdkbkdbkdb5")
      //     if (e.currentPosition >= e.duration) {
      //       Sound.stopPlayer();
      //       Sound.removePlayBackListener();
      //       setPlay(true)
      //       setPlayingId(null)
      //     }
      //   });
      // } catch (error) {
      //   console.log('Play error:', error);
      // }
    };

    const stopRecording = async () => {
      try {
        console.log('Stopping player');
        await dispatch(isPausesd(true));
        await Sound.pausePlayer();

        setPlayingId(null);
      } catch (error) {
        console.log('Stop Error:', error);
      }
    };
    const waveColors = [
      '#B72C7F',
      '#AE711C',
      '#D3C36A',
      '#4CAF50',
      '#2196F3',
      '#9C27B0',
    ];

    const renderWave = (waveColor: string) => {
      return (
        <View style={styles.waveContainer}>
          {[...Array(18)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.wave,
                {
                  height: Math.floor(Math.random() * 18) + 6,
                  backgroundColor: waveColor,
                },
              ]}
            />
          ))}
        </View>
      );
    };


    const renderItem = ({ item, index }: any) => {
      return (
        <View

          style={[styles.card, { borderColor: color.homebordercolor }]}
        >
          {/* Image */}
          <View
            style={{
              width: 49,
              height: 49,
              borderRadius: 8,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
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
              color={color.darkthemetext}
              fontFamily={Inter.bold}
              numberOfLines={1}
            >
              {item.title}
            </AppText>

            <AppText
              fontSize={10}
              color={color.darkthemetext}
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
              tintColor={waveColors[index % waveColors.length]}
            />
            {/* Play Button */}
            <TouchableOpacity style={styles.playButton} onPress={() => {
              playingId === item.id
                ? stopRecording()
                : playRecording(item)
            }}
            >
              {loadings && playingId == item.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  {
                    playingId == item.id ?
                      <View style={styles.pauseContainer}>
                        <View style={styles.pauseLine} />
                        <View style={styles.pauseLine} />
                      </View> :
                      <AppImage
                        source={Images.playicon}
                        width={10}
                        height={10}
                        tintColor={color.darkthemetext}
                      />
                  }
                </>)}




            </TouchableOpacity>

            {/* Menu */}
            {/* <TouchableOpacity
              onPress={() => { dispatch(openSongAction(item)); }}
              style={styles.menu}>
              <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
              <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
              <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
            </TouchableOpacity> */}
          </View>
        </View>
      )
    }

    return (
      <>

        <View style={{
          backgroundColor: color.darkbackround,
          borderWidth: 1,
          borderColor: color.homebordercolor,
          borderRadius: 12,
          marginBottom: 15
        }}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator
                size="small"
                color={color.mgyellow}
              />
            </View>
          ) : (
            <FlatList
              data={data?.slice(0, 8) || musicData}
              // data={musicData}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={() =>

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

              }
            />)}


        </View>

      </>
    )
  }

export default MusicList

const styles = StyleSheet.create({
  listContainer: {
    // paddingBottom: 20,
  },

  card: {
    //  backgroundColor: '#000',
    borderRadius: 20,
    padding: 12,
    marginVertical: 3,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',

    // borderWidth: 1,
    borderColor: '#1F1F1F',
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
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
})