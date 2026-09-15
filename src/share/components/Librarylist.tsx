import React, { useEffect, useState } from 'react'

import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'

import AppText from '../components/AppText'
import AppImage from '../components/AppImage'
import { Banner, Images, Logo } from '../constants/media'
import color, { useAppColors } from '../constants/color';
import Sound, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
  PlayBackType,
} from 'react-native-nitro-sound';
import { Inter } from '../constants/fonts'
import { GlobalImage } from '../utils/GlobalImage'
import apiUrls, { BASE_URL } from '../../services/apiUrls'
import { useNavigation } from '@react-navigation/native'
import ApiService from '../../services/api';
import { useAppDispatch } from '../hooks/useAppSelector'
import { addsong, isPausesd } from '../../auth/redux/authSlice'

type MusicItem = {
  id: string;
  title: string;
  artist: string;
  image: any;
  song_url: string;
  onLikePress?: () => void;
  onDislikePress?: () => void;

};

interface LibrarylistProps {
  data?: MusicItem[];
  musicData: MusicItem[];
  loading: boolean;
  onLikePress?: () => void;
  onDislikePress?: () => void;
}

const musicDatas: MusicItem[] = [
  {
    id: '1',
    title: 'يا أغلى وطن',
    artist: 'محمد الأمين',
    image: Logo.sngerprofile,
    song_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: 'يا أغلى وطن',
    artist: 'محمد الأمين',
    image: require('../../../assets/HomeScreen/image141.png'),
    song_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'

  },
  {
    id: '3',
    title: 'يا أغلى وطن',
    artist: 'محمد الأمين',
    image: Logo.sngerprofile,
    song_url: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3'
  },
]

const Librarylist = ({ musicData,
  loading,
  onLikePress,
  onDislikePress, }: LibrarylistProps) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const color = useAppColors();
  const [play, setPlay] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [fill, setfill] = useState(false);
  const [storeid, setStoreid] = useState(0)
  const [loadings, setLoadings] = useState(false);
  const [songs, setSongs] = useState(musicData || []);

  useEffect(() => {
    setSongs(musicData || []);
  }, [musicData]);




  const playRecording = async (item: any) => {
    await Sound.stopPlayer();
    await Sound.removePlayBackListener();
    setPlayingId(item.id);
    setLoadings(true)
    await dispatch(isPausesd(false));
    console.log(item.id, item.song_url, "dkdkbkdbkdb5")
    // try {
    //   const result = await Sound.startPlayer(item.song_url);

    //   console.log('Playing:', result);
    //   await Sound.removePlayBackListener();
    //   Sound.addPlayBackListener((e) => {
    //     setLoadings(false)
    //     console.log(
    //       'Current:',
    //       Sound.mmssss(Math.floor(e.currentPosition)),
    //     );

    await dispatch(
      addsong({
        ...item,
      }),)
    setLoadings(false)
    // console.log(playsong, "dkdkbkdbkdb5")
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


  // const playRecording = async (item: MusicItem) => {
  //   setPlayingId(item.id);
  //   setLoadings(true)
  //   await Sound.stopPlayer();
  //   Sound.removePlayBackListener();

  //   console.log(item.id, "dkdkbkdbkdb5")
  //   try {
  //     const result = await Sound.startPlayer(item.song_url);

  //     console.log('Playing:', result);
  //     await Sound.removePlayBackListener();
  //     await Sound.addPlayBackListener((e) => {
  //       console.log(
  //         'Current:',
  //         Sound.mmssss(Math.floor(e.currentPosition)),
  //       );

  //       setLoadings(false)
  //       dispatch(
  //         addsong(item))
  //       if (e.currentPosition >= e.duration) {
  //         Sound.stopPlayer();
  //         Sound.removePlayBackListener();
  //         setPlay(true)
  //         setPlayingId(null)
  //       }
  //     });
  //   } catch (error) {
  //     stopRecording()
  //     console.log('Play error:', error);
  //   }
  // };


  const stopRecording = async () => {
    try {
      console.log('Stopping player');

      //   await Sound.stopPlayer();
      //  await Sound.removePlayBackListener();
      await Sound.pausePlayer();
      // await Sound.stopPlayer();
      // Sound.removePlayBackListener();
      await dispatch(isPausesd(true));
      setPlay(true);
      setPlayingId(null);
    } catch (error) {
      console.log('Stop Error:', error);
    }
  };


  const likefun = async (id: string) => {
    console.log("like song", id);
    try {
      //setLoading(true);
      const response = await ApiService.post(
        apiUrls.addfavorite(id),

      );

      const res = response.data;

      console.log("like api Response:", res);

      if (res.success) {
        setfill(!fill)
        setStoreid(id)
        setSongs(prev =>
          prev.map(song =>
            song.id === id
              ? { ...song, is_favorite: true }
              : song
          )
        );
        onLikePress?.();
        console.log(res)
      } else {
        Alert.alert("Error", res.error || res.message);
      }
    } catch (error: any) {
      console.log(
        "API Error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "failed"
      );
    }
    finally {
      //setLoading(false);
    }
  };

  const dislikefun = async (id: string) => {
    console.log("dislike song", id);
    try {
      //setLoading(true);
      const response = await ApiService.delete(
        apiUrls.addfavorite(id),

      );

      const res = response.data;

      console.log("dislike api Response:", res);

      if (res.success) {
        setfill(!fill)
        setSongs(prev =>
          prev.map(song =>
            song.id === id
              ? { ...song, is_favorite: false }
              : song
          )
        );
        onDislikePress?.();
        console.log(res)
      } else {
        Alert.alert("Error", res.error || res.message);
      }
    } catch (error: any) {
      console.log(
        "API Error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "failed"
      );
    }
    finally {
      //setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <View

        //  activeOpacity={0.8}
        style={[styles.card, { borderColor: '#1A1A1A' }]}
      >
        {/* Image */}
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('.', {
            id: item.id,
          })}
        >

          <View
            style={{
              width: 62,
              height: 64,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#6D3202',
            }}>
            <AppImage
              source={GlobalImage(item?.cover_image_url)}
              width={62}
              height={114}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
        {/* Content */}
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('.', {
            id: item.id,
          })}
          style={styles.content}>
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
            {item.artist}
          </AppText>






        </TouchableOpacity>
        {/* {console.log(item, "hdhdg")} */}
        <View style={{
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: item.badge === 'Trending' ? '#F86501' : item.badge === 'Popular' ? '#F8C706' : '#9AF332',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          borderRadius: 11,
          paddingHorizontal: 6,
          paddingVertical: 2
        }}>
          <AppImage
            source={item.badge == 'Trending' ? Images.lit : item.badge === 'Popular' ? Images.star : Images.mic}
            height={10}
            width={10}
            tintColor={item.badge == 'Trending' ? '#F86501' : item.badge === 'Popular' ? '#F8C706' : '#9AF332'}
            resizeMode='contain'
          />
          <AppText color={item.badge == 'Trending' ? '#F86501' : item.badge === 'Popular' ? '#F8C706' : '#9AF332'} fontSize={10} fontFamily={Inter.regular}>
            {item.badge}
          </AppText>
        </View>

        <TouchableOpacity onPress={() => {
          if (item.is_favorite === false) {
            likefun(item.id);

          } else {
            dislikefun(item.id);
          }
        }}>

          <AppImage
            source={item.is_favorite === false ? Images.like : Banner.filllike}
            height={15}
            width={15}
            tintColor={item.is_favorite === false ? '#CDCECB' : '#E10815'}
            style={{ marginHorizontal: 5 }}
          />
        </TouchableOpacity>

        <AppText
          fontSize={10}
          color={'#CDCECB'}
          marginTop={4}
          style={{
            marginBottom: 5
          }}
        >
          {Number(item.duration || 0).toFixed(2) || '00:00'}
        </AppText>


        {/* Right Side */}
        <View style={styles.right}>
          {/* <AppImage
  source={Images.freq}
  width={94}
  height={12}
 
/> */}
          {/* Play Button */}
          <TouchableOpacity style={styles.playButton} onPress={() => {
            playingId === item.id
              ? stopRecording()
              : playRecording(item)
          }}>
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
          {/* <TouchableOpacity style={styles.menu}>
            <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
            <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
            <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
          </TouchableOpacity> */}
        </View>
      </View>
    )
  }

  return (

    <FlatList
      data={songs}

      // data={musicDatas}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={() =>
        loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={color.mgyellow} />
          </View>
        ) : (
          <View style={styles.centerContainer}>
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
        )
      }
    />


  )
}

export default Librarylist

const styles = StyleSheet.create(

  {
    listContainer: {
      //paddingBottom: 20,
    },

    card: {
      //  backgroundColor: '#07080A',
      borderRadius: 10,
      //padding: 12,
      marginBottom: 5,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
      borderWidth: 1,
      borderColor: '#1A1A1A',
      justifyContent: 'center',
      gap: 5
    },

    content: {
      flex: 1,
      marginLeft: 5,
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
      width: 24,
      height: 24,
      borderRadius: 100,
      borderWidth: 1.5,
      borderColor: '#BC4402',

      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10
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
      //marginLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    dot: {
      width: 2.4,
      height: 2.4,
      borderRadius: 100,
      backgroundColor: '#FFF',
      marginVertical: 1.5,
      marginRight: 8
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
  })