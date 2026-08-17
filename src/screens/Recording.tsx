import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import color, { useAppColors } from '../share/constants/color';
import { SafeAreaView } from "react-native-safe-area-context";
import AppImage from '../share/components/AppImage';
import { Banner, Images, Logo } from '../share/constants/media';
import AppText from '../share/components/AppText';
import { Inter } from '../share/constants/fonts';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from 'react-native-image-picker';
import Sound, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
  PlayBackType,
} from 'react-native-nitro-sound';
import { requestMicPermission } from "../share/utils/requestMicPermission";
import { useTranslation } from 'react-i18next';
import apiUrls from '../services/apiUrls';
import ApiService from '../services/api';

const Recording = () => {
  const navigation = useNavigation();
  const [recording, setRecording] = useState(false);
  const [path, setPath] = useState('');
  const [recordTime, setRecordTime] = useState('00:00');
  const [recpercentage, setRecpercentage] = useState('...')
  const color = useAppColors();
  const { t } = useTranslation("ar");
  const [saved, setSaved] = useState(false)
  //const[complete,setComplete]=useState(false)

  const progressviews = [
    {
      image: Logo.clock,
      title: t("Duration"),
      color: '#D4AF37',
      number: recordTime.slice(0, 5),
      tintcolor: ''
    },
    {
      image: Logo.ymusic,
      title: t("Song completion"),
      color: '#C552E6',
      number: `${recpercentage}%`,
      tintcolor: '#C552E6'
    },
    {
      image: Logo.filltick,
      title: t("Status"),
      color: '#FFFFFF',
      number: saved ? 'تم الحفظ' : 'Not Saved',
      tintcolor: ''
    },
  ]

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out this song!\n${path}`,
        url: path, // works on iOS
        title: 'Share Song',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) {
          console.log('Cancelled');
        } else if (response.errorCode) {
          console.log(response.errorMessage);
        } else {
          const asset = response.assets?.[0];

          console.log(asset);
          console.log(asset?.uri);
        }
      },
    );
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
        setRecordTime(Sound.mmssss(Math.floor(e.currentPosition)));
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
    setRecpercentage('100')
    Sound.removeRecordBackListener();
    Sound.stopPlayer();
    Sound.removePlayBackListener();
    Sound.removePlaybackEndListener();
  };

  const generateSongId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}-SONG`;
  };

  const uploadrecordingfun = async (file: any) => {
    console.log(file, "ffjbjfjfbjfbjfb");
    try {
      const formData = new FormData();


      formData.append('song_id', generateSongId());
      formData.append('status', 'review');





      formData.append('recordingFile', {
        uri: file,
        type: 'audio/mp3',
        name: 'song.mp3',
      } as any);
      console.log(formData, "formdata")
      const response = await ApiService.post(
        apiUrls.uploadrecording,
        formData
      );
      console.log('UPLOAD SUCCESS:', response.data);
      if (response.data.success) {
        setSaved(true)
        setPath(response.data.recording_url)
        console.log('Recording URL:', response.data.recording_url);
      }
      else {
        Alert.alert(
          'Upload Failed',
          response?.data?.message || 'Something went wrong'
        );
      }


    } catch (error: any) {
      console.log('UPLOAD ERROR:', error);
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color.darkbackround, }]} edges={['top']} >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'

      }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Library')}
          style={{
            borderWidth: 1,
            borderColor: '#373534',
            justifyContent: 'center',
            alignItems: 'center',
            height: 43,
            width: 43,
            borderRadius: 40
          }}>
          <AppImage
            source={Images.leftarrow}
            width={8}
            height={16}
            tintColor={color.darkthemetext}
          />
        </TouchableOpacity>


        <TouchableOpacity
          onPress={onShare}
          style={{
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: '#373534',
            borderRadius: 17.5,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            width: 84,
            height: 35
          }}>
          <AppImage
            source={Banner.shareicon}
            height={16}
            width={16}
            tintColor={'#FFFFFF'}
          />
          <AppText fontFamily={Inter.regular} color={color.darkthemetext} fontSize={14}>
            {"Share"}
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <ImageBackground
          source={Banner.recbackground}
          resizeMode="cover"
          style={{
            width: '100%',
            height: 595,
            alignItems: 'center',
            //paddingTop: 40,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppImage
              source={Images.bstar}
              width={29}
              height={32.5}
            />
            <AppText
              fontSize={48}
              color="#FEC749"
              fontFamily={Inter.extrabold}
            >
              {"أبدعت!"}
            </AppText>
            <AppImage
              source={Images.bstar}
              width={29}
              height={32.5}
            />
          </View>


          <AppText
            fontSize={20}
            color="#FEC749"
            fontFamily={Inter.extrabold}
            style={{ marginTop: 8 }}
          >
            {"لقد اكتمل أداؤك"}
          </AppText>


          <ImageBackground
            source={Banner.circleview}
            resizeMode="cover"
            style={{
              width: 304,
              height: 304,
              //marginTop: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {
              saved ?
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <AppImage
                    source={Logo.tick}
                    width={18}
                    height={18}
                  />
                  <AppText
                    fontSize={20}
                    color="#FFFFFF"
                    fontFamily={Inter.extrabold}
                    style={{ marginTop: 8 }}
                  >
                    {"تم الحفظ"}
                  </AppText>
                </View>
                : null
            }

            <TouchableOpacity
              onPress={recording ? stopRecording : startRecording}
            >


              <AppImage
                source={Logo.linmic}
                height={89}
                width={51}
              />
            </TouchableOpacity>
            <AppText
              fontSize={14}
              color="#FFFFFF"
              fontFamily={Inter.extrabold}
              style={{ marginTop: 8, flexWrap: 'wrap' }}
            >
              {/* {'اكتمل الأداء'} */}
              {"Tap to Start"}
            </AppText>

          </ImageBackground>
          {
            saved ?
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <AppImage
                  source={Logo.tick}
                  width={18}
                  height={18}
                />
                <AppText
                  fontSize={16}
                  color='#EA8721'
                  fontFamily={Inter.extrabold}
                  style={{}}
                >
                  {'تم حفظ ادائك بنجاح'}
                </AppText>
              </View> :
              null
          }

          <AppText
            numberOfLines={2}
            ellipsizeMode="tail"
            fontSize={31}
            color='#FFFFFF'
            fontFamily={Inter.bold}
            style={{ marginTop: 8 }}
          >
            {recording ? t("Sing Again") : t("Start Singing")}

          </AppText>
          {
            path != '' ?
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
                {
                  progressviews.map((item, index) => ((
                    <View style={{
                      borderWidth: 1,
                      borderColor: '#3D3B38',
                      borderRadius: 17,
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '32%',
                      height: 146,
                      gap: 5
                    }}>
                      <AppImage
                        source={item.image}
                        height={31}
                        width={31}
                        tintColor={item.tintcolor}
                      />
                      <AppText fontSize={12} fontFamily={Inter.regular} color={item.color}>
                        {item.title}
                      </AppText>
                      <AppText fontSize={22} fontFamily={Inter.regular} color={color.darkthemetext}>
                        {item.number}
                      </AppText>
                    </View>
                  )))
                }
              </View> :
              null
          }

        </ImageBackground>

        {
          path != '' ?
            <View style={{ flexDirection: 'row', marginTop: 100, gap: 8, }}>
              <TouchableOpacity
                onPress={recording ? stopRecording : startRecording}
                style={{
                  width: '32%',
                  height: 76,

                }}
              >


                <LinearGradient
                  colors={['#FC5B01', '#E80360']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    // width: '32%',
                    height: 76,
                    borderRadius: 17,
                    // padding: 2,
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 5
                  }}
                >


                  <AppImage
                    source={recording ? Images.playicon : Logo.round}
                    height={28}
                    width={28}
                  //  tintColor={'#FFFF'}
                  />
                  <AppText fontSize={12} fontFamily={Inter.regular} color='#FFFF'>
                    {recording ? 'Stop' : 'Sing Again'}

                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                //onPress={pickImage}
                onPress={() => { uploadrecordingfun(path) }}
                style={{
                  width: '32%',
                  height: 76,
                  // borderRadius: 17,
                  // // padding: 2,
                  // overflow: 'hidden',
                  // justifyContent: 'center',
                  // alignItems: 'center',
                  // gap:5
                }}
              >
                <LinearGradient
                  colors={['#5002AE', '#160146']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    // width: '32%',
                    height: 76,
                    borderRadius: 17,
                    // padding: 2,
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 5
                  }}
                >

                  <AppImage
                    source={Images.import}
                    height={28}
                    width={28}
                    tintColor={'#FFFF'}
                  />
                  <AppText fontSize={12} fontFamily={Inter.regular} color='#FFFF'>
                    {'Save Recording'}

                  </AppText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onShare}

                style={{
                  width: '32%',
                  height: 76,
                  // borderRadius: 17,
                  // // padding: 2,
                  // overflow: 'hidden',
                  // justifyContent: 'center',
                  // alignItems: 'center',
                  // gap:5
                }}>
                <LinearGradient
                  colors={['#FC5B01', '#E80360']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    // width: '32%',
                    height: 76,
                    borderRadius: 17,
                    // padding: 2,
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 5
                  }}
                >


                  <AppImage
                    source={Logo.share}
                    height={28}
                    width={28}
                    tintColor={color.darkthemetext}
                  />
                  <AppText fontSize={12} fontFamily={Inter.regular} color='#FFFF'>
                    {'Share'}

                  </AppText>
                </LinearGradient>
              </TouchableOpacity>


            </View>
            : null}
        <TouchableOpacity activeOpacity={0.8} >
          <ImageBackground
            source={Banner.btnview}
            resizeMode="stretch"
            style={{
              height: 62,
              width: '100%',
              marginTop: 30,
              //   justifyContent: 'space-between',
              //   alignItems: 'center',
              //   flexDirection:'row',

            }}
          >
            <View style={{
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
              height: 62,
              paddingHorizontal: 20
            }}>
              <AppImage
                source={Images.music}
                height={30}
                width={30}
              />
              <View>
                <AppText color="#fff" fontSize={16} fontFamily={Inter.regular}>
                  {t("Next Song")}
                </AppText>
                <AppText color="#FFFF00" fontSize={16} fontFamily={Inter.regular}>
                  {"يا ليالي الخرطوم"}
                </AppText>
              </View>
              <AppImage
                source={Images.arrow}
                height={16}
                width={10}
                tintColor={"#FFFFFF"}
              />
            </View>


          </ImageBackground>
        </TouchableOpacity>



        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <LinearGradient
              colors={['#7F142C', '#E52450']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                flex: 1,
                height: 1,
                marginRight: 10,
                borderTopLeftRadius: 10,
                //  borderTopLeftRadius:10,
                borderBottomLeftRadius: 10
              }}
            />

            <AppText
              fontSize={16}
              fontFamily={Inter.regular}
              color="#D900D5"
            >
              {`~ ${t("Karkab")} ~`}
            </AppText>

            <LinearGradient
              colors={['#E52450', '#7F142C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                flex: 1,
                height: 1,
                marginLeft: 10,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Library')}
          >
            <AppText fontSize={16} fontFamily={Inter.regular} color='#D900D5'>
              {t("Back to Library")}

            </AppText>
          </TouchableOpacity>

        </View>

      </ScrollView>



    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {

    flex: 1,
    paddingHorizontal: 10
  },
})

export default Recording;