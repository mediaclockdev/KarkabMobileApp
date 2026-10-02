import React, { useEffect, useState } from 'react'

import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'

import AppText from '../components/AppText'
import AppImage from '../components/AppImage'
import { Images } from '../constants/media'
import color, { useAppColors } from '../constants/color'
import { Inter } from '../constants/fonts';
import Sound, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
  PlayBackType,
} from 'react-native-nitro-sound';
import { GlobalImage } from '../utils/GlobalImage';
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector';
import { isPausesd } from '../../auth/redux/authSlice'

type MusicCardProps = {
  data: any
};

const MusicCard: React.FC<MusicCardProps> = ({ data }) => {
  const color = useAppColors();
  const [play, setPlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const isPausedr = useAppSelector(state => state.auth.isPaused);
  const [isPaused, setIsPaused] = useState(isPausedr);
  const [loadings, setLoadings] = useState(false);
  const dispatch = useAppDispatch();
  const playsong = useAppSelector(
    (state: any) => state.auth.playsong
  );


  const playAudio = async () => {
    console.log('playsong', playsong.original_song);
    try {
      setLoadings(true)
      //  stopAudio()
      await Sound.removePlayBackListener();

      // stop previous player
      await Sound.stopPlayer();

      await Sound.startPlayer(
        playsong.original_song,
      );

      setLoadings(false);
      setIsPlaying(true);
      setIsPaused(false);
      dispatch(isPausesd(false));
      Sound.addPlayBackListener((e) => {
        const percentage =
          e.duration > 0
            ? (e.currentPosition / e.duration) * 100
            : 0;
        console.log(e.currentPosition, "MusicCard")
        setProgress(percentage);

        setCurrentTime(
          Sound.mmssss(Math.floor(e.currentPosition)),
        );

        setTotalTime(
          Sound.mmssss(Math.floor(e.duration)),
        );
        setLoadings(false)
        if (e.currentPosition >= e.duration) {
          stopAudio();
        }
      });
    } catch (error) {
      console.log(error);
      setLoadings(false);
    }
  };


  // useEffect(() => {
  //   // console.log('playsong', playsong);
  //   console.log('isPausedr', isPausedr);
  //   if (!playsong && isPausedr) return;

  //   playAudio();
  // }, [playsong]);

  useEffect(() => {
    if (!playsong) return;

    if (!isPausedr) {
      playAudio();
    }
  }, [playsong, isPausedr]);

  useEffect(() => {

    console.log('isPausedr', isPausedr);
  }, [isPausedr]);


  //  const playRecording = async (item: any) => {
  //       // setPlayingId(item.id);
  //      setPlay(true)
  //    console.log("dkdkbkdbkdb5")
  //   try {
  //     const result = await Sound.startPlayer('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

  //     console.log('Playing:', result);

  //    Sound.addPlayBackListener((e) => {
  //   const percentage =
  //     e.duration > 0
  //       ? (e.currentPosition / e.duration) * 100
  //       : 0;

  //   setProgress(percentage);

  //   setCurrentTime(
  //     Sound.mmssss(Math.floor(e.currentPosition))
  //   );

  //   setTotalTime(
  //     Sound.mmssss(Math.floor(e.duration))
  //   );

  //   if (e.currentPosition >= e.duration) {
  //     Sound.stopPlayer();
  //     Sound.removePlayBackListener();
  //     setPlay(false);
  //     setProgress(0);
  //   }
  // });
  //   } catch (error) {
  //     console.log('Play error:', error);
  //   }
  // };




  const pauseAudio = async () => {
    try {
      console.log({
        isPlaying,
        isPausedr,
      });
      console.log("PAUSE CLICKED");
      dispatch(isPausesd(true));
      await Sound.pausePlayer();
      setIsPlaying(false);
      setIsPaused(isPausedr);
      console.log("PAUSE SUCCESSfhfhfhfh ");


    } catch (error) {
      console.log("PAUSE ERROR", error);
    }
  };

  const resumeAudio = async () => {
    try {
      await Sound.resumePlayer();
      dispatch(isPausesd(false));
      setIsPlaying(true);
      setIsPaused(false);
    } catch (error) {
      console.log(error);
    }
  };
  const stopAudio = async () => {
    try {
      await Sound.stopPlayer();
      await Sound.removePlayBackListener();

      setIsPlaying(false);
      setIsPaused(false);

      setProgress(0);
      setCurrentTime('00:00');
      setTotalTime('00:00');
    } catch (error) {
      console.log(error);
    }
  };




  return (
    <View style={[styles.container, { backgroundColor: color.darkbackround, borderColor: color.homebordercolor }]}>
      {/* Left Image */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
      }}>


        {/* <AppImage
          source={GlobalImage(data?.cover_image_url)}
          width={58}
          height={58}
          radius={12}
        /> */}
        <View
          style={{
            width: 58,
            height: 58,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            borderWidth: 1,
            // borderColor: '#6D3202',
          }}>
          <AppImage
            source={GlobalImage(data?.cover_image_url)}
            width={58}
            height={100}
            radius={12}
            resizeMode="cover"
          />
        </View>

        {/* Center Content */}
        <View style={styles.content}>
          <View>
            <AppText
              fontSize={14}
              fontWeight="400"
              color={color.darkthemetext}
              fontFamily={Inter.regular}
              numberOfLines={1}

            >
              {data?.title}
            </AppText>

            <AppText
              fontSize={10}
              color={color.darkthemetext}
              fontWeight="400"
              marginTop={4}
              fontFamily={Inter.regular}
              numberOfLines={1}
            >
              {data?.artist}
            </AppText>

          </View>

          {/* Wave */}



        </View>

        {/* Right Controls */}
        <View style={styles.right}>
          {/* <AppImage
            source={Images.freq}
            width={94}
            height={12}

          /> */}
          <View style={styles.waveContainer}>
            {[...Array(18)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.wave,
                  {
                    height:
                      Math.floor(Math.random() * 18) + 1,
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.playButton} onPress={() => {
            if (isPlaying) {
              pauseAudio();
            } else if (isPausedr) {
              resumeAudio();
            } else {
              playAudio();
            }
          }}>

            {loadings ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                {
                  isPausedr ?
                    <AppImage
                      source={Images.playicon}
                      width={10}
                      height={10}
                      tintColor={color.darkthemetext}
                    />
                    :
                    <View style={styles.pauseContainer}>
                      <View style={[styles.pauseLine, { backgroundColor: color.darkthemetext }]} />
                      <View style={[styles.pauseLine, { backgroundColor: color.darkthemetext }]} />
                    </View>
                }

              </>)}


          </TouchableOpacity>

          <TouchableOpacity style={styles.menu}>
            <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
            <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
            <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
          </TouchableOpacity>
        </View>

      </View>
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>
    </View>
  )
}

export default MusicCard

const styles = StyleSheet.create({
  container: {
    //   backgroundColor: '#000',
    borderRadius: 18,
    padding: 10,

    // flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#6B320B80',
    marginBottom: 10,
    //elevation:2
  },

  content: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',

  },

  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 10,
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
    // justifyContent: 'flex-end',
    gap: 12,
    marginLeft: 5
  },

  playButton: {
    width: 34,
    height: 34,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#F84E07',

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
    marginLeft: 14,
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
  progressContainer: {
    width: '100%',
    height: 2,
    backgroundColor: '#2A2A2A',
    borderRadius: 100,
    overflow: 'hidden',
    marginTop: 12,
  },

  progressBar: {
    width: '45%',
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 100,
  },
})