import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import color, { useAppColors } from "../share/constants/color";
import { Banner, Images } from "../share/constants/media";
import AppImage from "../share/components/AppImage";
import AppText from "../share/components/AppText";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Inter } from "../share/constants/fonts";
// import AudioRecorderPlayer from 'react-native-nitro-sound';
import { useCallback, useEffect, useState } from "react";
import Sound, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
  PlayBackType,
} from 'react-native-nitro-sound';
import { requestMicPermission } from "../share/utils/requestMicPermission";
import ApiService from '../services/api';
import apiUrls, { BASE_URL } from "../services/apiUrls";
import { GlobalImage } from "../share/utils/GlobalImage";
import { useFocusEffect, useNavigation, useRoute, useRoutePath } from "@react-navigation/native";
import GradientText from '../share/components/GradientText'
import { useAppDispatch } from "../share/hooks/useAppSelector";
import { addsong, isPausesd } from "../auth/redux/authSlice";

const AudioRec = () => {
  const color = useAppColors();
  const route = useRoute();

  const { id } = route?.params as {
    id: number;
  } || 1;

  // console.log(id, "djehehejdhhdhdeh")
  const lyrics = [
    "Mabrook mabrook ya alel hob",
    "Mabrook mabrook ya game",
    "Wajamal ya sabah el khair",
    "Dumtek hiya ya amar",
    "Mabrook mabrook",
    "Alf mabrook ya habibi",
  ];
  const dispatch = useAppDispatch();
  const [recording, setRecording] = useState(false);
  const [path, setPath] = useState('')
  const [songdetail, setSongDetail] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('00:00');
  const navigation = useNavigation();
  const [loadings, setLoadings] = useState(false);
  const [loadingst, setLoadingst] = useState(false);

  useEffect(() => {
    getSongDetail()
  }, [id])


  const playAudio = async (path) => {
    setLoadings(true)
    console.log("path", path?.song_url)
    //  stopAudio()

    await dispatch(isPausesd(true));
    await dispatch(
      addsong({
        ...path,
      }),)
    await Sound.removePlayBackListener();

    // stop previous player
    await Sound.stopPlayer();


    try {
      await Sound.startPlayer(
        path?.song_url
      );

      setIsPlaying(true);
      setIsPaused(false);
      setLoadings(false)
      Sound.removePlayBackListener();
      Sound.addPlayBackListener((e) => {
        const percentage =
          e.duration > 0
            ? (e.currentPosition / e.duration) * 100
            : 0;
        console.log(e.currentPosition, "lll")
        setProgress(percentage);

        setCurrentTime(
          Sound.mmssss(Math.floor(e.currentPosition)),
        );

        setTotalTime(
          Sound.mmssss(Math.floor(e.duration)),
        );


        if (e.currentPosition >= e.duration) {
          stopAudio();
        }
      });
    } catch (error) {
      console.log(error);
      setIsPlaying(false);
      setLoadings(false);
    }
  };

  const stopAudio = async () => {
    try {
      await setLoadingst(true)
      console.log('Stopping player');
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
      await dispatch(isPausesd(true));
      setIsPlaying(false);
      setIsPaused(false);

      setProgress(0);
      setCurrentTime('00:00');
      setTotalTime('00:00');
      await setLoadingst(false)
    } catch (error) {
      console.log(error);
    }
  };



  const pauseAudio = async () => {
    try {
      console.log({
        isPlaying,
        isPaused,
      });
      console.log("PAUSE CLICKED");
      await Sound.pausePlayer();
      console.log("PAUSE SUCCESSfhfhfhfh ");

      setIsPlaying(false);
      setIsPaused(true);
    } catch (error) {
      console.log("PAUSE ERROR", error);
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestMicPermission();

    if (!hasPermission) {
      console.log('Microphone permission denied');
      return;
    }

    // Set up recording progress listener
    try {
      Sound.addRecordBackListener((e: RecordBackType) => {
        console.log('Recording progress:', e.currentPosition, e.currentMetering);

        // setRecordSecs(e.currentPosition);
        // setRecordTime(Sound.mmssss(Math.floor(e.currentPosition)));
      });

      const result = await Sound.startRecorder();
      setRecording(true);
      console.log('Recording started:', result);
    }
    catch (e) {
      console.log(e);
    }
  };

  const stopRecording = async () => {
    const result = await Sound.stopRecorder();
    Sound.removeRecordBackListener();
    console.log('Recording stopped:', result);
    setPath(result)
    setRecording(false);
    Sound.removeRecordBackListener();
    Sound.stopPlayer();
    Sound.removePlayBackListener();
    Sound.removePlaybackEndListener();
  };

  // const playRecording = async () => {
  //   try {
  //     await Sound.startPlayer(
  //       'file:///data/user/0/com.karkab/files/sound_1780969747801.mp4'
  //     );

  //     Sound.addPlayBackListener((e) => {
  //       console.log('Current:', e.currentPosition);
  //       console.log('Duration:', e.duration);

  //       if (e.currentPosition >= e.duration) {
  //         Sound.stopPlayer();
  //         Sound.removePlayBackListener();
  //       }
  //     });
  //   } catch (error) {
  //     console.log('Play Error:', error);
  //   }
  // };

  const playRecording = async () => {
    console.log("path", BASE_URL + '/uploads/songs/songFile-1781140344510-316584059.mp3')
    try {
      const result = await Sound.startPlayer(
        BASE_URL + '/uploads/songs/songFile-1781140272878-969611845.mp3'
      );

      console.log('Playing:', result);

      Sound.addPlayBackListener((e) => {
        console.log(
          'Current:',
          Sound.mmssss(Math.floor(e.currentPosition)),
        );

        if (e.currentPosition >= e.duration) {
          Sound.stopPlayer();
          Sound.removePlayBackListener();
        }
      });
    } catch (error) {
      console.log('Play error:', error);
    }
  };


  const resumeAudio = async () => {
    try {
      await Sound.resumePlayer();

      setIsPlaying(true);
      setIsPaused(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getSongDetail = async () => {
    try {
      const response = await ApiService.get(
        apiUrls.singlesongdetail(id)
      );

      console.log('Song Detail:', response.data);
      if (response.data.success) {
        await setSongDetail(response.data.song)
        playAudio(response.data.song)
      }
    } catch (error: any) {
      console.log('Error:', error);
      // Alert.alert('Error', error.message);
    }
  };




  const activeIndex = 1;
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color.darkbackround }]}>
      {/* <Text>AudioRec Screen</Text> */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { navigation.goBack() }}
          style={styles.sideButton}>
          <AppImage
            source={Images.leftarrow}
            width={8}
            height={16}
          />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <AppText
            color={color.darkthemetext}
            fontSize={19}
            fontWeight="500"
            fontFamily={Inter.medium}
          >
            Live Session
          </AppText>

          <LinearGradient
            colors={['#D4344F', '#E79156']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lineview}
          />
        </View>

        <TouchableOpacity style={styles.effectsButton}>
          <AppImage
            source={Images.playlist}
            width={15}
            height={15}
            tintColor="#F34C2B"
          />

          <AppText
            color={color.darkthemetext}
            fontSize={10}
            fontWeight="400"
            fontFamily={Inter.regular}

          >
            Effects
          </AppText>
        </TouchableOpacity>
      </View>


      <View style={styles.songview}>
        <LinearGradient
          colors={['#8A5300', '#F47921', '#BA5100']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.songBorder}
        >
          <View style={{ backgroundColor: color.darkbackround, margin: 1, borderRadius: 17 }}>
            <View style={[styles.songContent, { backgroundColor: color.darkbackround, }]}>
              {/* Music Icon */}
              {/* <View
        style={styles.iconview}
      > */}
              {/* <AppImage
                source={GlobalImage(songdetail?.cover_image_url)}
                width={57}
                height={61}
              // tintColor="#FFFFFF"
              /> */}
              <View
                style={{
                  width: 57,
                  height: 61,
                  borderRadius: 8,
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AppImage
                  source={GlobalImage(songdetail?.cover_image_url)}
                  width={57}
                  height={100}
                // tintColor="#FFFFFF"
                />
              </View>

              {/* Center Content */}
              <View style={styles.songInfo}>
                <AppText
                  color={color.darkthemetext}
                  fontSize={14}
                  fontWeight="600"
                  fontFamily={Inter.bold}
                >
                  {songdetail?.artist || 'Mabrook'}
                </AppText>

                <AppText
                  color={'#FA8744'}
                  fontSize={12}
                  fontWeight="400"
                  fontFamily={Inter.regular}
                >
                  {songdetail?.title || 'Hozan Yosif'}
                </AppText>



                <View style={styles.progressRow}>
                  <AppText color={color.darkthemetext} fontSize={10} fontFamily={Inter.regular}>
                    {currentTime.slice(0, 5) || "00:00"}
                  </AppText>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%`, }]} />
                    <View
                      style={[
                        styles.progressThumb,
                        {
                          left: `${progress}%`,
                          transform: [{ translateX: -5 }], // half of thumb width
                        },
                      ]}
                    />
                  </View>

                  <AppText color={color.darkthemetext} fontSize={10} fontFamily={Inter.regular}>
                    {songdetail?.duration}
                  </AppText>
                </View>
              </View>

              {/* Right Icons */}
              <View style={styles.rightIcons}>
                <TouchableOpacity>
                  <AppImage
                    source={Images.like}
                    width={18}
                    height={18}
                    tintColor={"#EB0836"}
                  />
                </TouchableOpacity>


                <AppImage
                  source={Images.equalizer}
                  width={18}
                  height={18}
                />
              </View>


            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#4A4A4A',
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 7,
              margin: 10,
            }} >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ height: 6, width: 6, backgroundColor: '#DA3B58', borderRadius: 20 }} />
                <AppText color="#FFF" fontSize={10} fontFamily={Inter.regular}>
                  Verse 2
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <AppText color="#FFF" fontSize={10} fontFamily={Inter.regular}>
                  {currentTime.slice(0, 5) || "00:00"} /
                </AppText>
                <AppText color="#F1A03F" fontSize={10} fontFamily={Inter.regular}>
                  {songdetail?.duration || "00:00"}
                </AppText>
              </View>
              <AppText color="#F1A03F" fontSize={10} fontFamily={Inter.regular}>
                {`${Number(progress).toFixed(0)}%`}
              </AppText>
            </View>
          </View>


        </LinearGradient>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          paddingHorizontal: 10,
          position: 'relative',
        }}
      >
        <AppText
          color="#8D8D8D"
          fontSize={13}
          fontWeight="400"
          fontFamily={Inter.regular}
        >
          PREVIOUS
        </AppText>

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <AppText
            color="#8D8D8D"
            fontSize={13}
            fontWeight="400"
            fontFamily={Inter.regular}
          >
            Mabrook mabrook ya gamel
          </AppText>
        </View>
      </View>



      <LinearGradient
        colors={['#1D1916', '#FF8F03', '#1D1916']}
        locations={[0, 0.5, 1]} // yellow at center
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ height: 1, borderRadius: 1, }}
      />
      <View style={{ alignSelf: 'center' }}>


        <GradientText>
          Mabrook mabrook ya game
        </GradientText>
      </View>
      <TouchableOpacity>
        <AppText

          style={{
            fontSize: 16,
            color: '#7A7A7A',
            //  marginVertical: 5,
            textAlign: "left",
          }}
        >
          {"Next"}
        </AppText>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          //paddingVertical: 100,
          alignItems: 'center',
        }}
      >

        <>
          {lyrics.map((item, index) => (
            <AppText
              key={index}
              style={{
                fontSize: index === activeIndex ? 18 : 16,
                color: index === activeIndex ? color.darkthemetext : '#7A7A7A',
                // marginVertical: 5,
                textAlign: 'center',
              }}
            >
              {item}
            </AppText>
          ))}
        </>

      </ScrollView>

      {/* <View style={{flexDirection:'row',alignItems:'center',alignSelf:'center',gap:4}}>
  <View style={{height:7,width:7,borderRadius:7,backgroundColor:'#DA3B58'}} />


 <AppText color="#FFF" fontSize={14}  fontFamily={Inter.regular}>
            01:24
          </AppText>
</View> */}


      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'center', }}>
        {/* <AppImage
          source={Images.wavesl}
          width={88}
          height={88}
          //tintColor={"#DFB355"}
        /> */}
        <AppImage
          source={Banner.linewave}
          width={'100%'}
          height={88}
          resizeMode="cover"

        />
        {/* <AppImage
          source={Images.wavesr}
          width={88}
          height={88}
          
        /> */}
      </View>




      <AppText
        color={"#EBC975"}
        fontSize={14}
        fontWeight="400"
        textAlign={"center"}
        fontFamily={Inter.regular}
      >Own the moment</AppText>

      <View style={styles.commandview}>
        <View style={{ justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity style={styles.viewicon}

            //  onPress={()=>{playRecording()}
            onPress={() => { playAudio(songdetail) }

            }>
            {loadings ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppImage
                source={Images.restart}
                width={24}
                height={24}
                tintColor="#CB4F00"
              />)}
          </TouchableOpacity>
          <AppText
            color={color.darkthemetext}
            fontSize={10}
            fontWeight="400"
            fontFamily={Inter.regular}
          >
            Restart
          </AppText>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity

            //  onPress={recording ? stopRecording : startRecording}
            onPress={() => {
              if (isPlaying) {
                pauseAudio();
              } else if (isPaused) {
                resumeAudio();
              } else {
                playAudio(songdetail);
              }
            }}
          >
            <LinearGradient
              colors={['#C30050', '#DF551A']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: 58, width: 58, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center' }}
            >

              {isPaused ?
                <AppImage
                  source={Images.playicon}
                  width={21}
                  height={21}
                  tintColor={color.darkthemetext}
                />
                :
                <View style={{ height: 21, width: 21, backgroundColor: '#ffff', borderRadius: 3 }}>

                </View>
              }


            </LinearGradient>
          </TouchableOpacity>

          <AppText
            color={color.darkthemetext}
            fontSize={10}
            fontWeight="400"
            fontFamily={Inter.regular}
          >
            {isPaused ?
              "PLay" :
              "Pause"}
          </AppText>

        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity style={styles.viewicon}

            // onPress={() => stopRecording()}

            onPress={() => stopAudio()}

          >
            {loadingst ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppImage
                source={Images.tick}
                width={24}
                height={24}
                tintColor="#CB4F00"
              />)}
          </TouchableOpacity>
          <AppText
            color={color.darkthemetext}
            fontSize={10}
            fontWeight="400"
            fontFamily={Inter.regular}
          >
            Finish
          </AppText>
        </View>

      </View>
      <View style={{ height: 60 }} />
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: color.darkbackround,
    flex: 1,
    paddingHorizontal: 10,
    gap: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    // paddingBottom: 10,
  },

  sideButton: {
    width: 70,
    justifyContent: 'center',
  },

  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  effectsButton: {
    width: 70,
    height: 33,
    borderWidth: 1,
    borderColor: '#642F08',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  lineview: {
    width: 87,
    height: 4,
    marginTop: 4,
    borderRadius: 2,
  },
  songview: {
    marginTop: 20,
  },

  songBorder: {
    borderRadius: 18,
    //padding: 1,
  },

  songContent: {

    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,

  },

  iconview: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  songInfo: {
    flex: 1,
    marginLeft: 12,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: '#433A34',
    marginHorizontal: 8,
    position: 'relative',
  },

  progressFill: {
    //width: '40%',
    height: 2,
    backgroundColor: '#FF6B8A',
  },

  progressThumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F1B465',
    position: 'absolute',
    left: '40%',
    top: -4,
  },

  rightIcons: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    marginLeft: 12,
  },

  commandview: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  viewicon: {
    borderWidth: 1,
    borderColor: '#CB4F00',
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    height: 58,
    width: 58
  }
})
export default AudioRec;
