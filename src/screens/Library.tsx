import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native"
import Header from "../share/components/Header";
import color, { useAppColors } from "../share/constants/color";
import AppText from "../share/components/AppText";
import LinearGradient from 'react-native-linear-gradient';
import AppImage from "../share/components/AppImage";
import { Banner, BottomIcons, Images, Logo } from "../share/constants/media";
import Librarylist from "../share/components/Librarylist";
import { SafeAreaView } from "react-native-safe-area-context";
import { Inter } from "../share/constants/fonts";
import { pick, types } from '@react-native-documents/picker';
import apiUrls, { BASE_URL } from "../services/apiUrls";
import ApiService from '../services/api';
import { useCallback, useEffect, useState, type ComponentType } from "react";
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from "../share/hooks/useAppSelector";
import { loaderstate } from "../auth/redux/authSlice";
import Sound, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
  PlayBackType,
} from 'react-native-nitro-sound';
import { GlobalImage } from "../share/utils/GlobalImage";

const LibrarylistComponent = Librarylist as ComponentType<{ data: any | null }>;
const Library = () => {
  const color = useAppColors();
  const dispatch = useAppDispatch();
  const [favoritescount, setFavoritescount] = useState(0)
  const [recordingcount, setRecordingcount] = useState(0)
  const navigation = useNavigation();
  const [songdata, setSongdata] = useState(null)
  const [numberofsong, setNumberofsong] = useState(0)
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');
  const [recdata, setRecdata] = useState(null);
  const [play, setPlay] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [fill, setfill] = useState(false);
  const [storeid, setStoreid] = useState(0);
  const [progressMap, setProgressMap] = useState({});
  const [selectedTab, setSelectedTab] = useState('Songs');
  const [loadings, setLoadings] = useState(false);
  const playsong = useAppSelector(
    (state: any) => state.auth.playsong
  );
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loader, setLoader] = useState(false)
  const ferture = [
    {
      image: Images.music,
      title: 'Songs\nAvailable',
      number: numberofsong,
      bordercolor: '#8F4602',
    },
    {
      image: Images.like,
      title: 'Favourites\nSongs',
      number: favoritescount,
      bordercolor: '#9214699C',
    },
    {
      image: Images.mic,
      title: 'Karaoke\nSessions',
      number: recordingcount,
      bordercolor: '#8F4602',
    },
    {
      image: Logo.headponeicon,
      title: 'Recently\nSung',
      number: 18,
      bordercolor: '#9E8F1F',
    },
  ]

  useFocusEffect(
    useCallback(() => {
      console.log('AudioRec Focused');

      return async () => {
        console.log('AudioRec Unfocused');

        await Sound.stopPlayer();
        Sound.removePlayBackListener();
      };
    }, [])
  );


  useFocusEffect(
    useCallback(() => {
      songlist();
      getRecording();
      console.log(playsong?.title, "jjjjjj");
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  // useEffect(() => {
  //   console.log("playsong:", playsong);

  //   if (playsong) {
  //     playRecording(playsong);
  //   }
  // }, [playsong]);


  const songlist = async () => {
    console.log("songlist api called")
    try {
      setIsLoading(true)
      setLoader(true)

      const response = await ApiService.get(apiUrls.getsonglist);

      const data = response.data;
      console.log(data, 'songlistAPI RESPONSEdddd');

      if (data?.success) {
        setSongdata(data?.songs);
        setNumberofsong(data?.total_songs)
        setFavoritescount(data?.favorite_songs_count)
        setRecordingcount(data?.overall_recordings_count)
      }
    } catch (error) {
      console.log('songlist ERROR:', error);
    } finally {
      setIsLoading(false)
      setLoader(false)
    }
  };

  const singing = [
    {
      id: 1,
      image: Images.singericon,
      title: 'يا أغلى وطن',
      title1: 'محمد الأمين',
    },
    {
      id: 2,
      image: Images.singericon,
      title: 'يا أغلى وطن',
      title1: 'محمد الأمين',
    },
    {
      id: 3,
      image: Images.singericon,
      title: 'يا أغلى وطن',
      title1: 'محمد الأمين',
    },
    {
      id: 4,
      image: Images.singericon,
      title: 'يا أغلى وطن',
      title1: 'محمد الأمين',
    },
  ]


  const selectAudio = async () => {
    try {
      const result = await pick({
        allowMultiSelection: false,
        // type: [types.audio],
      });
      if (result.length > 0) {
        const file = result[0];
        console.log('Selected file:', file);
        uploadSong(file);
      }
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };


  // useEffect(() => {
  //   getFavorites();
  // }, [])

  //   const filteredSongs = songdata?.filter(item => {
  //   const search = searchText.toLowerCase();

  //   return (
  //     item.title?.toLowerCase().includes(search) ||
  //     item.artist?.toLowerCase().includes(search) ||
  //     item.category?.toLowerCase().includes(search)
  //   );
  // });


  const filteredSongs = songdata
    ?.filter(item => {
      const search = searchText.toLowerCase();

      return (
        item.title?.toLowerCase().includes(search) ||
        item.artist?.toLowerCase().includes(search) ||
        item.badge?.toLowerCase().includes(search)
      );
    })
    ?.sort((a, b) => {
      const comparison = (a.title || '').localeCompare(
        b.title || '',
        ['ar', 'en'],
        { sensitivity: 'base' }
      );

      return sortOrder === 'asc' ? comparison : -comparison;
    });





  const getFavorites = async () => {
    try {
      setIsLoading(true)
      const response = await ApiService.get(apiUrls.favorites)

      const data = response.data
      console.log(data, "favorate API RESPONSE")

      if (data?.success) {
        console.log(data.songs, "inside API RESPONSE")
        // setFavorites(data.favorites)
        setSongdata(data.songs)
      }

    } catch (error) {
      console.log("PROFILE ERROR:", error)
    }
    finally {
      setIsLoading(false)
      // dispatch(loaderstate(false));
    }
  }



  const uploadSong = async (file: any) => {
    try {
      const formData = new FormData();

      formData.append('title', 'Dil Se');
      formData.append('artist', 'A.R. Rahman');
      formData.append('duration', '5:12');
      formData.append('language', 'Hindi');
      formData.append('category_id', '2');
      formData.append('status', 'Published');


      formData.append('coverImage', {
        uri: 'content://com.android.providers.media.documents/document/image%3A1000256450',
        type: 'image/png',
        name: 'cover.png',
      } as any);


      formData.append('songFile', {
        uri: file.uri,
        type: 'audio/mp3',
        name: 'song.mp3',
      } as any);
      console.log(formData, "formdata")
      const response = await ApiService.post(
        apiUrls.uploadSong,
        formData
      );

      console.log('UPLOAD SUCCESS:', response.data);
    } catch (error: any) {
      console.log('UPLOAD ERROR:', error);
    }
  };



  const handlepages = (item) => {
    setSelectedTab(item);
    console.log(item, "ejdjdj")
    if (item == 'Favorites') {
      getFavorites()
      setVisible(false)
    }
    if (item == 'Songs') {
      songlist()
      setVisible(false)
    }


  }

  const getRecording = async () => {
    try {

      const response = await ApiService.get(apiUrls.getrecording)

      const data = response.data
      console.log(data, "getrecording API RESPONSE")

      if (data?.success) {
        console.log(data.recordings, "inside API RESPONSE")
        setRecdata(data.recordings)
      }

    } catch (error) {
      console.log("getrecording ERROR:", error)
    }
    finally {

    }
  }




  const playRecording = async (item: MusicItem) => {
    stopRecording()
    setPlayingId(item.id);
    setLoadings(true)
    console.log(item.id, item.recording_url, "dkdkbkdbkdb5")
    try {

      //  stopAudio()
      Sound.removePlayBackListener();

      // stop previous player
      await Sound.stopPlayer();
      const result = await Sound.startPlayer(item.song_url);

      console.log('Playing:', result);

      Sound.addPlayBackListener((e) => {
        console.log(
          'Current:',
          Sound.mmssss(Math.floor(e.currentPosition)),
        );
        const progress = (e.currentPosition / e.duration) * 100;
        setCurrentPosition(e.currentPosition);
        setDuration(e.duration);

        const percentage =
          e.duration > 0 ? (e.currentPosition / e.duration) * 100 : 0;

        setProgress(percentage);
        setProgressMap(prev => ({
          ...prev,
          [item.id]: progress,
        }));
        setLoadings(false)
        if (e.currentPosition >= e.duration) {
          Sound.stopPlayer();
          Sound.removePlayBackListener();
          setPlay(true)
          setPlayingId(null)
          setProgress(0);
          setCurrentPosition(0);
          setDuration(0);
        }
      });
    } catch (error) {
      console.log('Play error:', error);
    }
  };


  const stopRecording = async () => {
    console.log("dkdkbkdbkdb")
    await Sound.pausePlayer();
    console.log("PAUSE SUCCESSfhfhfhfh ");
    // Sound.stopPlayer();
    await Sound.removePlayBackListener();
    setPlay(true)
    setPlayingId(null)
    setProgress(0);
    setCurrentPosition(0);
    setDuration(0);
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color.darkbackround }]}>
      {/* <Text>Library Screen</Text> */}
      <Header
        rightIcon={Images.bell}
        onRightPress={() => { (navigation as any).navigate('NotificationScreen') }}
        rightView={

          <LinearGradient
            colors={['#845726', '#4D2001']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 8,

            }}
          >

            <TouchableOpacity style={{
              width: 62,
              height: 28,
              borderRadius: 8,
              flexDirection: 'row',
              // borderWidth: 1,
              // borderColor: color.brown,
              backgroundColor: color.darkbackround,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              margin: 1
              //borderRadius: 17
            }}

              //onPress={selectAudio}

              onPress={() => {
                navigation.navigate('Recording');
              }}
            >

              <AppImage
                source={Images.mic}
                width={15}
                height={15}
                tintColor={color.darkthemetext}
              />
              <AppText

                color={color.darkthemetext}
                fontSize={10}
                fontWeight="400"
                fontFamily={Inter.regular}
              >
                {"Rooms"}
              </AppText>
            </TouchableOpacity>
          </LinearGradient>

        }
      />
      {
        loader ?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#EFCB61" />
          </View> :
          <>

            <View style={[styles.toptitle, { backgroundColor: color.darkbackround, borderColor: '#302E2E' }]}>
              {['Songs', 'Playlists', 'Favorites', 'Recently Played'].map(
                (item, index) => {
                  return (
                    <TouchableOpacity
                      style={styles.tabItem}
                      onPress={() => { handlepages(item) }}>
                      <AppText
                        key={index}
                        color={color.darkthemetext}
                        fontSize={12}
                        fontWeight="500"
                        fontFamily={Inter.medium}
                      >
                        {item}
                      </AppText>
                      {selectedTab === item && (
                        <View style={styles.bottomLine} />
                      )}
                    </TouchableOpacity>

                  )
                },
              )}
            </View>


            <View style={styles.filterview}>


              <LinearGradient
                colors={['#8E6B3E', '#292727']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  borderRadius: 25,

                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    songlist()
                    setVisible(true)
                  }}
                  style={[
                    styles.filter,
                    {
                      backgroundColor: color.darkbackround,
                      borderWidth: 0,
                      gap: 13,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      alignSelf: 'center',
                      margin: 1
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', }}>
                    <AppImage
                      source={Images.music}
                      tintColor={"#ADA03E"}
                      height={10}
                      width={10}
                    />
                    <AppText
                      color={color.darkthemetext}
                      fontSize={8}
                      fontWeight="500"
                      fontFamily={Inter.medium}
                    >
                      All Genres
                    </AppText>
                  </View>


                  <AppImage
                    source={Logo.downarrow}
                    width={7}
                    height={4}
                    resizeMode="contain"
                    style={{ marginTop: 2 }}
                    tintColor={color.darkthemetext}
                  />
                </TouchableOpacity>
              </LinearGradient>

              <LinearGradient
                colors={['#8E6B3E', '#292727']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  borderRadius: 25,

                }}
              >
                <TouchableOpacity
                  style={[
                    styles.filter,
                    {
                      backgroundColor: color.darkbackround,
                      borderWidth: 0,
                      gap: 13,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      margin: 1
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', }}>
                    <AppImage
                      source={Logo.glob}

                      height={10}
                      width={10}
                    />
                    <AppText
                      color={color.darkthemetext}
                      fontSize={8}
                      fontWeight="500"
                      fontFamily={Inter.medium}
                    >
                      Sudanese Arabic
                    </AppText>
                  </View>


                  <AppImage
                    source={Logo.downarrow}
                    width={7}
                    height={4}
                    resizeMode="contain"
                    style={{ marginTop: 2 }}
                    tintColor={color.darkthemetext}
                  />
                </TouchableOpacity>
              </LinearGradient>

              <LinearGradient
                colors={['#8E6B3E', '#292727']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  borderRadius: 25,

                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  style={[
                    styles.filter,
                    {
                      backgroundColor: color.darkbackround,
                      borderWidth: 0,
                      gap: 13,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      margin: 1
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', }}>
                    <AppImage
                      source={Logo.sort}

                      height={10}
                      width={10}
                    />
                    <AppText
                      color={color.darkthemetext}
                      fontSize={8}
                      fontWeight="500"
                      fontFamily={Inter.medium}
                    >
                      Sort
                    </AppText>
                  </View>



                </TouchableOpacity>
              </LinearGradient>

              <LinearGradient
                colors={['#8E6B3E', '#292727']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  borderRadius: 25,

                }}
              >
                <TouchableOpacity
                  style={[
                    styles.filter,
                    {
                      backgroundColor: color.darkbackround,
                      borderWidth: 0,
                      gap: 13,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      margin: 1
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', }}>
                    <AppImage
                      source={Logo.lfilter}

                      height={10}
                      width={10}
                    />
                    <AppText
                      color={color.darkthemetext}
                      fontSize={8}
                      fontWeight="500"
                      fontFamily={Inter.medium}
                    >
                      Filter
                    </AppText>
                  </View>



                </TouchableOpacity>
              </LinearGradient>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{
                flex: 1,

              }}
              contentContainerStyle={{
                // paddingHorizontal: 16,
                paddingTop: 16,
                // paddingBottom: 30,
                gap: 20,
              }}
            >



              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {
                  ferture.map((item, index) => ((
                    <View style={{
                      borderColor: '#9D3F00',
                      borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '23.6%',
                      flexDirection: 'row',
                      gap: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      borderRadius: 8
                    }}>
                      <View style={{
                        borderWidth: 1,
                        borderColor: item.bordercolor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 6,
                        borderRadius: 50
                      }}>

                        <AppImage
                          source={item.image}
                          height={20}
                          width={20}
                        />
                      </View>

                      <View>
                        <AppText fontSize={7} fontFamily={Inter.regular} color={color.darkthemetext}>
                          {item.title}
                        </AppText>
                        <AppText fontSize={16} fontFamily={Inter.regular} color={color.darkthemetext}>
                          {item.number}
                        </AppText>
                      </View>

                    </View>
                  )))
                }

              </View>


              {
                visible ?
                  <>
                    <View style={[styles.titles, { width: '100%' }]}>
                      <View style={{ flexDirection: 'row', gap: 5, justifyContent: "center", alignItems: 'center' }}>
                        <AppText color={'#FB6B01'} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                          Continue Singing
                        </AppText>
                        <AppImage
                          source={Banner.brightstar}

                          height={12}
                          width={12}
                        />
                      </View>

                      <TouchableOpacity style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                          View all
                        </AppText>
                        <AppImage
                          source={Images.arrow}
                          width={5}
                          height={8}
                          tintColor={color.darkthemetext}
                        />
                      </TouchableOpacity>


                    </View>
                    {singing?.length ? (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {singing?.slice(0, 4)?.map((item, index) => (
                          <View
                            key={index}
                            style={{
                              borderWidth: 1,
                              borderColor: 'brown',
                              borderRadius: 8,
                              width: '23%',
                              height: 116,
                              overflow: 'hidden',
                            }}
                          >
                            <ImageBackground
                              source={Images.singericon}
                              resizeMode="cover"
                              style={{
                                flex: 1,
                                padding: 8,
                                justifyContent: 'space-between',
                              }}
                            >
                              {/* Play Button */}
                              <TouchableOpacity
                                // onPress={() => {
                                //   playingId === item.id
                                //     ? stopRecording()
                                //     : playRecording(item)
                                // }}
                                // onPress={() => {
                                //   playingId === item.id
                                //     ? pauseAudio()
                                //     : resumeAudio(item)
                                // }}
                                style={{
                                  height: 27,
                                  width: 27,
                                  borderRadius: 20,
                                  borderWidth: 1,
                                  borderColor: '#40413E',
                                  backgroundColor: '#050808',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'flex-end'
                                }}
                              >
                                {
                                  playingId == item.id ?
                                    <AppImage
                                      source={Images.playicon}
                                      height={10}
                                      width={10}
                                    />
                                    :

                                    <View style={styles.pauseContainer}>
                                      <View style={styles.pauseLine} />
                                      <View style={styles.pauseLine} />
                                    </View>
                                }
                              </TouchableOpacity>

                              {/* Bottom Content */}
                              <View>
                                <AppText
                                  fontSize={11}
                                  fontFamily={Inter.regular}
                                  color="#FFFFFF"
                                  numberOfLines={1}
                                >
                                  {item.title}
                                </AppText>

                                <AppText
                                  fontSize={10}
                                  fontFamily={Inter.regular}
                                  color="#C0C2C1"
                                  numberOfLines={1}
                                >
                                  {item.status}
                                </AppText>

                                {/* Progress Bar at Bottom-most */}
                                <View
                                  style={{
                                    height: 4,
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    borderRadius: 4,
                                    marginTop: 6,
                                  }}
                                >
                                  <View
                                    style={{

                                      width: `${progressMap[item.id] || 0}%`,

                                      height: '100%',
                                      backgroundColor: '#F3870C',
                                      borderRadius: 4,
                                    }}
                                  />
                                </View>
                              </View>
                            </ImageBackground>
                          </View>
                        ))}
                      </View>


                    ) : (
                      <AppText fontFamily={Inter.regular} fontSize={12} color="#C0C2C1">
                        [ No Data Found ]
                      </AppText>
                    )}




                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: 'brown',
                        height: 133,
                        borderRadius: 10,
                        overflow: 'hidden',
                      }}
                    >
                      <ImageBackground
                        source={Banner.addbanner}
                        resizeMode="cover"
                        style={{
                          flex: 1,
                          width: '100%',

                        }}
                      >

                        <View style={{ paddingVertical: 10, marginHorizontal: 35 }}>


                          <AppText color="#fff" fontSize={16} fontFamily={Inter.bold}>
                            Featured Sudanese
                          </AppText>
                          <AppText color="#F29803" fontSize={16} fontFamily={Inter.bold}>
                            Karaoke
                          </AppText>
                          <AppText color="#FFFFFF" fontSize={10} fontFamily={Inter.bold}>
                            Made for your next gathering
                          </AppText>

                          <TouchableOpacity
                            style={{ height: 29, width: 105, }}

                            onPress={() => {
                              navigation.navigate('Recording');
                            }}>
                            <LinearGradient
                              colors={['#F36902', '#E04A0F', '#BD1221']}
                              start={{ x: 0.2, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={{
                                width: 105,
                                height: 29,
                                borderRadius: 10,
                                // padding: 2,
                                overflow: 'hidden',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: '#D86F0C',

                                //paddingHorizontal: 8,
                                marginTop: 8


                              }}
                            >
                              <View style={{ paddingHorizontal: 8, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', width: 105, }}>
                                <AppImage
                                  source={Images.hmic}
                                  height={14.58}
                                  width={14.58}
                                />

                                <AppText color="#FFFFFF" fontSize={11} fontFamily={Inter.bold}>
                                  Sing Now
                                </AppText>
                                <AppImage
                                  source={Images.arrow}
                                  height={8}
                                  width={9}
                                  tintColor={"#FFFFFF"}
                                />
                              </View>

                            </LinearGradient>
                          </TouchableOpacity>

                        </View>
                      </ImageBackground>
                    </View>






                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row' }}>
                        <AppText color="#F46E00" fontSize={12} fontFamily={Inter.regular}>
                          {"All Songs"}
                        </AppText>
                        <AppText color="#CDCECB" fontSize={12} fontFamily={Inter.regular}>
                          {" (" + numberofsong + ")"}
                        </AppText>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 10, }}>
                        <View style={{
                          flexDirection: 'row',
                          borderWidth: 1,
                          borderColor: '#242424',
                          alignItems: 'center',
                          borderRadius: 12,
                          width: 204,
                          gap: 5,
                          paddingHorizontal: 10,

                        }}>
                          <AppImage
                            source={BottomIcons.search}
                            height={14}
                            width={14}
                            tintColor={"#CDCECB"}
                          />
                          <TextInput
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Search songs, artists..."
                            placeholderTextColor={"#CDCECB"}
                            style={{ fontSize: 10, color: '#FFFF', flex: 1 }}
                          />

                        </View>

                        <TouchableOpacity style={{ padding: 10, borderWidth: 1, borderColor: '#303030', borderRadius: 12 }}>
                          <AppImage
                            source={Logo.gfilter}
                            height={12}
                            width={25}
                          />
                        </TouchableOpacity>
                      </View>


                    </View>
                  </>
                  : null
              }

              <Librarylist
                onLikePress={() => {
                  songlist()
                }}
                onDislikePress={() => {
                  songlist()
                }}
                musicData={filteredSongs}
                loading={isLoading} />
              <View style={{ height: 100 }} />

            </ScrollView>
          </>}
      {/* {
        playsong?.id == null ?
          null :
          <LinearGradient
            colors={['#8A3000', '#541E01']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 10, position: "absolute",
              bottom: 80, width: '99%', justifyContent: 'center', alignItems: 'center',
              alignSelf: 'center'
            }}
          >

            <View
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: color.darkbackround, }]}
            >

              <View style={{ flexDirection: 'row' }}>
                <AppImage
                  source={GlobalImage(playsong?.cover_image_url)}
                  width={50}
                  height={46}
                  radius={8}
                  style={{ borderWidth: 1, borderColor: '#8A3000' }}

                />


                <View style={styles.content}>
                  <AppText
                    fontSize={8}
                    fontWeight="700"
                    color={color.darkthemetext}
                    fontFamily={Inter.bold}
                    //style={{ flex: 1 }}
                    numberOfLines={2}
                  >
                    {playsong?.title}
                  </AppText>

                  <AppText
                    fontSize={8}
                    color={'#C0C2C1'}
                    marginTop={4}
                    fontFamily={Inter.regular}
                    //  style={{ flex: 1 }}
                    numberOfLines={2}
                  >
                    {playsong?.artist}
                  </AppText>


                </View>


                <View style={styles.right}>
                  <View>
                    <AppImage
                      source={Images.freq}
                      width={94}
                      height={12}
                      tintColor={'#910D01'}
                      style={{ alignSelf: 'center' }}
                    />
                    <View style={{ flexDirection: 'row', gap: 5, marginTop: 13 }}>
                      <AppText
                        fontSize={8}
                        color={'#C0C2C1'}

                        fontFamily={Inter.regular}
                      >
                        {formatTime(currentPosition)}
                      </AppText>
                      <View style={{ width: 70 }}>

                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${progress}%`,
                              },
                            ]}
                          />

                       
                          <View
                            style={[
                              styles.progressDot,
                              {
                                left: `${progress}%`,
                              },
                            ]}
                          />
                        </View>

                      </View>
                      <AppText
                        fontSize={8}
                        color={'#C0C2C1'}

                        fontFamily={Inter.regular}
                      >
                        {playsong?.duration}
                      </AppText>
                    </View>
                  </View>


                  <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ height: 7.6, width: 1, backgroundColor: color.darkthemetext }} />
                      <AppImage
                        source={Images.playicon}
                        width={7.6}
                        height={7.6}
                        tintColor={color.darkthemetext}
                        style={{
                          transform: [{ rotate: '180deg' }],
                        }}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        playingId === playsong?.id
                          ? stopRecording()
                          : playRecording(playsong)
                      }}
                      style={styles.playButton}>
                      {
                        playingId == playsong?.id ?

                          <View style={styles.pauseContainer}>
                            <View style={styles.pauseLine} />
                            <View style={styles.pauseLine} />
                          </View>
                          :
                          <AppImage
                            source={Images.playicon}
                            width={11}
                            height={11}
                            tintColor={color.darkthemetext}

                          />

                      }

                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row' }}>

                      <AppImage
                        source={Images.playicon}
                        width={7.6}
                        height={7.6}
                        tintColor={color.darkthemetext}

                      />
                      <View style={{ height: 7.6, width: 1, backgroundColor: color.darkthemetext }} />
                    </View>
                    <TouchableOpacity style={styles.menu}>
                      <View style={{ flexDirection: "row", gap: 3, alignItems: 'center' }}>
                        <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
                        <View style={[styles.line, { backgroundColor: color.darkthemetext }]} />
                      </View>



                      <View style={{ flexDirection: "row", gap: 3, alignItems: 'center' }}>
                        <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
                        <View style={[styles.line, { backgroundColor: color.darkthemetext }]} />
                      </View>
                      <View style={{ flexDirection: "row", gap: 3, alignItems: 'center' }}>
                        <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
                        <View style={[styles.line, { backgroundColor: color.darkthemetext }]} />
                      </View>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>


            </View>
          </LinearGradient>
      } */}

    </SafeAreaView>

  )
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: color.darkbackround,
    flex: 1,
    paddingHorizontal: 10
  },
  toptitle: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#31200E',
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#080808',
    borderRadius: 11
  },
  filterview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    justifyContent: 'space-between',
    marginBottom: 10
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
  },
  addview: {
    borderWidth: 1,
    borderColor: '#38190A',
    width: '100%',
    borderRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#140A05',
    flexDirection: 'row',
    padding: 20,
    marginVertical: 10
  }


  ,
  listContainer: {
    paddingBottom: 20,
  },

  card: {

    borderRadius: 10,
    padding: 12,

    // width: '100%',
    // flexDirection: 'row',
    alignItems: 'center',

    //borderWidth: 1,
    //borderColor: '#38190A',

    //left: 0,
    //right: 0,
    margin: 1.2,
    height: 74,
    alignSelf: 'center',
  },

  content: {
    flex: 1,
    marginLeft: 8,
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
    gap: 20
  },

  playButton: {
    width: 30,
    height: 30,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#90511E',

    justifyContent: 'center',
    alignItems: 'center',
  },

  pauseContainer: {
    flexDirection: 'row',
    gap: 4,
  },

  pauseLine: {
    width: 3,
    height: 12,
    backgroundColor: color.darkthemetext,
    borderRadius: 10,
  },

  menu: {
    marginLeft: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    width: 2,
    height: 2,
    // borderRadius: 100,
    backgroundColor: color.darkthemetext,
    marginVertical: 1.5,
  },
  line: {
    width: 11,
    height: 1,
    backgroundColor: color.darkthemetext
  },
  titles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginVertical:10,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#3A3A3A',
    borderRadius: 10,
    position: 'relative',
    overflow: 'visible',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#F56800',
    borderRadius: 10,
  },

  progressDot: {
    position: 'absolute',
    top: -3,
    marginLeft: -5, // keeps dot centered
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F56800',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 8,
  },

  bottomLine: {
    position: 'absolute',
    bottom: -10,
    // marginTop: 8,
    width: '125%',
    height: 2,
    backgroundColor: '#F66A01',
    borderRadius: 2,
  },

})
export default Library;