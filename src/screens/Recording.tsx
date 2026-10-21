
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  FlatList,
  Text,
  Image,
  BackHandler,
  Animated,
  Easing,
  TextInput,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import color, { useAppColors } from '../share/constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppImage from '../share/components/AppImage';
import { Banner, Images, Logo } from '../share/constants/media';
import AppText from '../share/components/AppText';
import { Inter } from '../share/constants/fonts';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Sound, { RecordBackType } from 'react-native-nitro-sound';
import { requestMicPermission } from '../share/utils/requestMicPermission';
import { useTranslation } from 'react-i18next';
import apiUrls from '../services/apiUrls';
import ApiService from '../services/api';
import { addsong, setHideMiniPlayer, showToast } from '../auth/redux/authSlice';
import { useAppDispatch } from '../share/hooks/useAppSelector';
import TrackPlayer from '@rntp/player';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const EqualizerBar = ({ delay, playing }: { delay: number; playing: boolean }) => {
  const height = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    if (playing) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(height, {
            toValue: 16 + Math.random() * 8,
            duration: 300 + delay * 80,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(height, {
            toValue: 4,
            duration: 300 + delay * 80,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      Animated.timing(height, {
        toValue: 4,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [playing]);

  return (
    <Animated.View
      style={{
        width: 3,
        borderRadius: 2,
        backgroundColor: '#F5BD55',
        height,
      }}
    />
  );
};

const Equalizer = ({ playing }: { playing: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 24 }}>
    {[0, 1, 2, 3, 4].map(i => (
      <EqualizerBar key={i} delay={i} playing={playing} />
    ))}
  </View>
);

const Recording = () => {
  const navigation = useNavigation<any>();
  const color = useAppColors();
  const { t } = useTranslation('ar');
  const dispatch = useAppDispatch();
  const route = useRoute<any>();
  const { prevScreen, data } = route?.params ?? {};
  const scrollViewRef = useRef<ScrollView>(null);
  const saveRecordingRef = useRef<View>(null);

  // State Management
  const [recording, setRecording] = useState(false);
  const [path, setPath] = useState('');
  const [recordTime, setRecordTime] = useState('00:00');
  const [recPercentage, setRecPercentage] = useState('0');
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showFullLyrics, setShowFullLyrics] = useState(false);

  // Modal & Save Form State
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [title, setTitle] = useState(data?.title || 'Song 1');
  const [albumName, setAlbumName] = useState(
    data?.album_name || data?.category?.title || 'Love Songs',
  );
  const [status, setStatus] = useState<'private' | 'public'>('private');
  const [albumPicture, setAlbumPicture] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);

  const [lyricsLines, setLyricsLines] = useState<
    { text: string; start: number; end: number }[]
  >([]);

  const [activeLyricIndex, setActiveLyricIndex] = useState(0);

  const lyricsListRef = useRef<FlatList>(null);
  const lyricsLinesRef = useRef<
    { text: string; start: number; end: number }[]
  >([]);

  const instrumentalUrl = data?.instrumental_song || data?.instrumental_wav;
  const songTitle = data?.title || 'Untitled Song';
  const artistName = data?.artist || 'Unknown Artist';
  const coverImage = data?.cover_image_url;
  const songDuration = Number(data?.duration) || 0;

  // Player state
  const [instrumentalPlaying, setInstrumentalPlaying] = useState(false);
  const [playbackPositionMs, setPlaybackPositionMs] = useState(0);
  const [instrumentalDurationMs, setInstrumentalDurationMs] = useState(
    songDuration * 1000,
  );
  const [instrumentalLoading, setInstrumentalLoading] = useState(false);

  const isRecordingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const playbackListenerRef = useRef(false);

  const isStartingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lyricsCardRef = useRef<View>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartTimeRef = useRef<number>(0);
  const [errormessgae, setErrormessage] = useState(null);

  useEffect(() => {
    return () => {
      Sound.removeRecordBackListener();
      Sound.stopRecorder().catch(() => { });
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Recording screen focused, stopping previous song if any');
      dispatch(setHideMiniPlayer(true));
      const stopPreviousSong = async () => {
        try {
          await TrackPlayer.stop();
          await TrackPlayer.seekTo(0);
          dispatch(setHideMiniPlayer(true));
          console.log('Previous TrackPlayer song stopped');
        } catch (error) {
          console.log('Error stopping previous song:', error);
        }
      };

      stopPreviousSong();

      return () => {
        dispatch(setHideMiniPlayer(false));
      };
    }, [dispatch, data]),
  );

  useEffect(() => {
    if (data?.title) {
      setTitle(data.title);
    }
    if (data?.album_name || data?.category?.title) {
      setAlbumName(data.album_name || data?.category?.title || '');
    }
    if (data?.lyrics) {
      prepareLyrics(data);
    } else {
      setLyricsLines([]);
      lyricsLinesRef.current = [];
    }
  }, [data]);

  const scrollToLyrics = () => {
    requestAnimationFrame(() => {
      lyricsCardRef.current?.measureLayout(
        scrollViewRef.current as any,
        (_x, y) => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, y - 10),
            animated: true,
          });
        },
        () => {
          console.log('Unable to measure lyrics section');
        },
      );
    });
  };

  const prepareLyrics = (song: any) => {
    if (!song?.lyrics) {
      setLyricsLines([]);
      lyricsLinesRef.current = [];
      setActiveLyricIndex(0);
      return;
    }

    const lyricRows = String(song.lyrics)
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter(Boolean);

    const parsedLines: { text: string; start: number }[] = [];

    lyricRows.forEach((line: string) => {
      const match = line.match(/^\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]\s*(.*)$/);
      if (!match) return;

      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const start = (minutes * 60 + seconds) * 1000;
      const text = match[3].trim();

      if (text) {
        parsedLines.push({ text, start });
      }
    });

    parsedLines.sort((a, b) => a.start - b.start);

    const lines = parsedLines.map((line, index) => {
      const nextLine = parsedLines[index + 1];
      return {
        text: line.text,
        start: line.start,
        end: nextLine ? nextLine.start : line.start + 3500,
      };
    });

    lyricsLinesRef.current = lines;
    setLyricsLines(lines);
    setActiveLyricIndex(0);
  };

  useEffect(() => {
    if (!lyricsLines.length) return;

    const currentPositionMs = playbackPositionMs;
    let index = -1;

    for (let i = 0; i < lyricsLines.length; i++) {
      const line = lyricsLines[i];
      if (currentPositionMs >= line.start && currentPositionMs < line.end) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      for (let i = lyricsLines.length - 1; i >= 0; i--) {
        if (currentPositionMs >= lyricsLines[i].start) {
          index = i;
          break;
        }
      }
    }

    if (index !== -1 && index !== activeLyricIndex) {
      setActiveLyricIndex(index);
      if (showFullLyrics) {
        requestAnimationFrame(() => {
          lyricsListRef?.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.35,
          });
        });
      }
    }
  }, [playbackPositionMs, lyricsLines, activeLyricIndex, showFullLyrics]);

  const isRecorded = Boolean(path) && !recording;

  const progressViews = [
    {
      id: 'duration',
      image: Logo.clock,
      title: t('Duration'),
      color: '#D4AF37',
      number: recordTime.slice(0, 5),
      tintcolor: '',
    },
    {
      id: 'completion',
      image: Logo.ymusic,
      title: t('Song completion'),
      color: '#C552E6',
      number: `${recPercentage}%`,
      tintcolor: '#C552E6',
    },
    {
      id: 'status',
      image: Logo.filltick,
      title: t('Status'),
      color: '#FFFFFF',
      number: saved ? t('Saved') || 'تم الحفظ' : t('Not Saved') || 'غير محفوظ',
      tintcolor: saved ? '#27AE60' : '#E74C3C',
    },
  ];

  const onShare = async () => {
    if (!path) {
      dispatch(
        showToast({
          visible: true,
          message: t('Please record audio first') || 'يرجى التسجيل أولاً',
          type: 'error',
        }),
      );
      return;
    }

    try {
      await Share.share({
        message: `Check out this song!\n${path}`,
        url: path,
        title: 'Share Song',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  useEffect(() => {
    return () => {
      Sound.removeRecordBackListener();
      Sound.stopRecorder().catch(() => { });
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, []);

  // 1. Load instrumental first, then start native recording & smooth clock
  const startRecording = async () => {
    try {
      // 1. Stop any lingering previous session
      try {
        await Sound.stopRecorder();
        Sound.removeRecordBackListener();
      } catch (_) { }

      try {
        await Sound.stopPlayer();
      } catch (_) { }

      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }

      // 2. Reset states back to 00:00
      setSaved(false);
      setPath('');
      setRecPercentage('0');
      setRecordTime('00:00');
      setPlaybackPositionMs(0);
      setActiveLyricIndex(0);

      isPlayingRef.current = false;
      hasStartedRef.current = false;
      isStartingRef.current = false;
      setInstrumentalPlaying(false);

      // 3. LOAD INSTRUMENTAL SONG FIRST
      if (instrumentalUrl) {
        await setInstrumentalLoading(true);
        // dispatch(
        //   showToast({
        //     visible: true,
        //     message: t('Loading instrumental music...') || 'جاري تحميل الموسيقى...',
        //     type: 'info',
        //   }),
        // );

        try {
          await Sound.startPlayer(instrumentalUrl);
          isPlayingRef.current = true;
          hasStartedRef.current = true;
          setInstrumentalPlaying(true);
        } catch (audioErr) {
          console.log('Error starting instrumental:', audioErr);
          dispatch(
            showToast({
              visible: true,
              message: t('Failed to load instrumental music') || 'فشل تحميل الموسيقى',
              type: 'error',
            }),
          );
        } finally {
          setInstrumentalLoading(false);
        }
      }

      // 4. START NATIVE RECORDER (Starts only after instrumental is loaded & playing)
      const result = await Sound.startRecorder();
      setRecording(true);
      isRecordingRef.current = true;

      // 5. Start smooth clock at the exact time recording starts
      recordStartTimeRef.current = Date.now();
      recordTimerRef.current = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - recordStartTimeRef.current) / 1000);
        const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const secs = String(elapsedSec % 60).padStart(2, '0');
        setRecordTime(`${mins}:${secs}`);

        // Smooth real-time completion percentage
        if (instrumentalDurationMs > 0) {
          const pct = Math.min(100, Math.floor(((elapsedSec * 1000) / instrumentalDurationMs) * 100));
          setRecPercentage(String(pct));
        }
      }, 500);

    } catch (e) {
      console.log('Error starting recording:', e);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setRecording(false);
      isRecordingRef.current = false;
      setInstrumentalLoading(false);
    }
  };

  // Stop recording and stop timer
  const stopRecording = async () => {
    try {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }

      const result = await Sound.stopRecorder();
      Sound.removeRecordBackListener();

      setPath(result);
      setRecording(false);
      isRecordingRef.current = false;
      setRecPercentage('100');

      try {
        await Sound.stopPlayer();
        isPlayingRef.current = false;
        hasStartedRef.current = false;
        setInstrumentalPlaying(false);
      } catch (err) {
        console.log('Error stopping player:', err);
      }

      setTimeout(() => {
        scrollToSaveRecording();
      }, 150);
    } catch (e) {
      console.log('Error stopping recording:', e);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setRecording(false);
      isRecordingRef.current = false;
    }
  };

  const cancelCountdown = async () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    setInstrumentalLoading(false);

    try {
      await Sound.stopPlayer();
      isPlayingRef.current = false;
      hasStartedRef.current = false;
      setInstrumentalPlaying(false);
      setPlaybackPositionMs(0);
      setActiveLyricIndex(0);
    } catch (_) { }
  };

  const handleMicPress = async () => {
    if (recording) {
      await stopRecording();
    } else if (countdown !== null) {
      await cancelCountdown();
    } else if (instrumentalLoading) {
      return;
    } else {
      startCountdown();
    }
  };

  useEffect(() => {
    if (!isRecorded) return;
    const timer = setTimeout(() => {
      scrollToSaveRecording();
    }, 200);
    return () => clearTimeout(timer);
  }, [isRecorded]);

  const generateSongId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}-SONG`;
  };

  // Image Selection Handlers
  const handleSelectImageSource = () => {
    Alert.alert(
      t('Upload Album Picture') || 'تحميل صورة الألبوم',
      t('Choose an image source') || 'اختر مصدراً للصورة',
      [
        {
          text: t('Camera') || 'الكاميرا',
          onPress: () => openCamera(),
        },
        {
          text: t('Gallery') || 'المعرض',
          onPress: () => openGallery(),
        },
        {
          text: t('Cancel') || 'إلغاء',
          style: 'cancel',
        },
      ],
    );
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      if (result.didCancel) return;
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAlbumPicture({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'album_picture.jpg',
        });
      }
    } catch (error) {
      console.log('Error choosing image from gallery:', error);
      dispatch(
        showToast({
          visible: true,
          message: t('Failed to pick image') || 'فشل اختيار الصورة',
          type: 'error',
        }),
      );
    }
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel) return;
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAlbumPicture({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'camera_picture.jpg',
        });
      }
    } catch (error) {
      console.log('Error capturing camera image:', error);
      dispatch(
        showToast({
          visible: true,
          message: t('Failed to capture image') || 'فشل التقاط الصورة',
          type: 'error',
        }),
      );
    }
  };

  // Upload Recording Handler
  const uploadRecording = async () => {
    if (!path || isUploading) return;

    if (!title.trim()) {
      setErrormessage('Please enter a song title');
      return;
    }

    if (!albumName.trim()) {
      // dispatch(
      //   showToast({
      //     visible: true,
      //     message: t('Please enter an album name') || 'يرجى إدخال اسم الألبوم',
      //     type: 'error',
      //   }),
      // );
      setErrormessage('Please enter an album name');
      return;
    }
    if (!albumPicture?.uri) {
      setErrormessage('Please select an album picture');
      return;
    }
    try {
      setIsUploading(true);
      const formData = new FormData();

      const songId = data?.id
        ? String(data.id)
        : data?.song_id
          ? String(data.song_id)
          : generateSongId();

      // Form fields matching the curl specification
      formData.append('song_id', songId);
      formData.append('status', status || 'private');
      formData.append('album_name', albumName.trim());
      formData.append('title', title.trim());

      // Duration (e.g. "4:50")
      const durationFormatted = recordTime ? recordTime.slice(0, 5) : '00:00';
      formData.append('duration', durationFormatted);

      // recordingFile
      formData.append('recordingFile', {
        uri: Platform.OS === 'android' ? path : path.replace('file://', ''),
        type: 'audio/mp3',
        name: 'recording.mp3',
      } as any);

      // album_picture
      formData.append('album_picture', {
        uri:
          Platform.OS === 'android'
            ? albumPicture.uri
            : albumPicture.uri.replace('file://', ''),
        type: albumPicture.type || 'image/jpeg',
        name: albumPicture.name || 'album_picture.jpg',
      } as any);

      const response: any = await ApiService.post(
        apiUrls.uploadrecording,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response?.data?.success) {
        setSaved(true);
        setSaveModalVisible(false); // Close modal on success
        if (response.data.recording_url) {
          setPath(response.data.recording_url);
        }
        dispatch(
          showToast({
            visible: true,
            message:
              t('Recording saved successfully.') || 'تم حفظ التسجيل بنجاح.',
            type: 'success',
          }),
        );
      } else {
        setErrormessage(response?.data?.message || 'Recording upload failed.');
        dispatch(
          showToast({
            visible: true,
            message: response?.data?.message || 'Recording upload failed.',
            type: 'error',
          }),
        );
      }
    } catch (error: any) {
      console.log('UPLOAD ERROR:', error);
      setErrormessage(error?.response?.data?.message || 'Recording upload failed.');
      dispatch(
        showToast({
          visible: true,
          message:
            error?.response?.data?.message ||
            'Unable to upload recording. Please try again.',
          type: 'error',
        }),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatAudioTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0',
    )}`;
  };

  useFocusEffect(
    useCallback(() => {
      isPlayingRef.current = false;
      hasStartedRef.current = false;
      isStartingRef.current = false;
      setInstrumentalPlaying(false);
      setPlaybackPositionMs(0);
      setActiveLyricIndex(0);

      const playbackListener = (event: any) => {
        const position = Number(event.currentPosition) || 0;
        const duration = Number(event.duration) || 0;

        setPlaybackPositionMs(position);

        if (duration > 0) {
          setInstrumentalDurationMs(duration);
        }

        if (duration > 0 && position >= duration - 100) {
          isPlayingRef.current = false;
          hasStartedRef.current = false;
          setInstrumentalPlaying(false);
          setPlaybackPositionMs(0);
          setActiveLyricIndex(0);
        }
      };

      Sound.addPlayBackListener(playbackListener);
      playbackListenerRef.current = true;

      return () => {
        Sound.removePlayBackListener();
        playbackListenerRef.current = false;

        if (isPlayingRef.current || hasStartedRef.current) {
          Sound.stopPlayer().catch(() => { });
          isPlayingRef.current = false;
          hasStartedRef.current = false;
        }
      };
    }, []),
  );

  const toggleInstrumentalPlayback = async () => {
    if (!instrumentalUrl || instrumentalLoading || isStartingRef.current) return;
    if (isRecordingRef.current) return;

    try {
      if (isPlayingRef.current) {
        await Sound.pausePlayer();
        isPlayingRef.current = false;
        setInstrumentalPlaying(false);
        return;
      }

      isStartingRef.current = true;
      setInstrumentalLoading(true);

      if (hasStartedRef.current) {
        await Sound.resumePlayer();
      } else {
        await Sound.startPlayer(instrumentalUrl);
        hasStartedRef.current = true;
      }

      isPlayingRef.current = true;
      setInstrumentalPlaying(true);
    } catch (error) {
      console.error('Instrumental playback error:', error);
    } finally {
      isStartingRef.current = false;
      setInstrumentalLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation, stopRecording]),
  );

  const handleBack = useCallback(async () => {
    try {
      if (isPlayingRef.current || hasStartedRef.current) {
        await Sound.stopPlayer();
        isPlayingRef.current = false;
        hasStartedRef.current = false;
        setInstrumentalPlaying(false);
        setPlaybackPositionMs(0);
      }

      if (recording || isRecordingRef.current) {
        await stopRecording();
      }
    } catch (error) {
      console.log('Error stopping audio:', error);
    } finally {
      navigation.navigate('Library');
    }
  }, [navigation, recording, stopRecording]);

  const scrollToSaveRecording = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        saveRecordingRef.current?.measureLayout(
          scrollViewRef.current as any,
          (_x, y) => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - 20),
              animated: true,
            });
          },
          () => {
            console.log('Unable to measure Save Recording section');
          },
        );
      }, 100);
    });
  };

  const startCountdown = useCallback(() => {
    // Clear any existing timer to prevent double-speed ticking
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setCountdown(3);
    let currentCount = 3;

    countdownTimerRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setCountdown(null);
        startRecording();
      }
    }, 1000);
  }, [startRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: color.darkbackround }]}
      edges={['top']}
    >
      {/* Top Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <AppImage
            source={Images.leftarrow}
            width={8}
            height={16}
            tintColor={color.darkthemetext}
          />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {lyricsLines.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const next = !showFullLyrics;
                setShowFullLyrics(next);
                setTimeout(() => scrollToLyrics(), 150);
              }}
              style={[
                styles.lyricsHeaderButton,
                showFullLyrics && styles.lyricsHeaderButtonActive,
              ]}
            >
              <AppText
                fontFamily={Inter.bold}
                color={showFullLyrics ? '#FF2D55' : color.darkthemetext}
                fontSize={12}
              >
                ❝❞ Lyrics
              </AppText>
            </TouchableOpacity>
          )}

          {isRecorded && (
            <TouchableOpacity onPress={onShare} style={styles.shareHeaderButton}>
              <AppImage
                source={Banner.shareicon}
                height={16}
                width={16}
                tintColor="#FFFFFF"
              />
              <AppText
                fontFamily={Inter.regular}
                color={color.darkthemetext}
                fontSize={14}
              >
                {t('Share') || 'Share'}
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Background Area */}
        <ImageBackground
          source={Banner.recbackground}
          resizeMode="cover"
          style={styles.heroBackground}
        >
          {/* Header Title depending on state */}
          {isRecorded ? (
            <>
              <View style={styles.completionTitleRow}>
                <AppImage source={Images.bstar} width={29} height={32.5} />
                <AppText fontSize={44} color="#FEC749" fontFamily={Inter.extrabold}>
                  {'أبدعت!'}
                </AppText>
                <AppImage source={Images.bstar} width={29} height={32.5} />
              </View>
              <AppText
                fontSize={18}
                color="#FEC749"
                fontFamily={Inter.extrabold}
                style={{ marginTop: 4 }}
              >
                {'لقد اكتمل أداؤك'}
              </AppText>
            </>
          ) : (
            <AppText
              fontSize={28}
              color="#FFFFFF"
              fontFamily={Inter.extrabold}
              style={{ marginTop: 12 }}
            >
              {countdown !== null
                ? t('Get Ready!') || 'استعد!'
                : instrumentalLoading
                  ? t('Loading Instrumental...') || 'جاري تحميل الموسيقى...'
                  : recording
                    ? t('Recording in Progress...') || 'جاري التسجيل...'
                    : t('Ready to Sing?') || 'جاهز للغناء؟'}
            </AppText>
          )}

          {/* SONG DETAILS */}
          {data && (
            <View style={eStyles.card}>
              <LinearGradient
                colors={['#F5BD55', '#E80360', '#5002AE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={eStyles.accentLine}
              />

              <View style={eStyles.songRow}>
                <View style={eStyles.coverWrap}>
                  {coverImage ? (
                    <Image source={{ uri: coverImage }} style={eStyles.cover} />
                  ) : (
                    <LinearGradient
                      colors={['#29251D', '#3A2F1E']}
                      style={eStyles.coverPlaceholder}
                    >
                      <Text style={{ fontSize: 28, color: '#F5BD55' }}>♫</Text>
                    </LinearGradient>
                  )}
                  <View style={eStyles.coverGlow} />
                </View>

                <View style={eStyles.songDetails}>
                  <Text style={eStyles.title} numberOfLines={2}>
                    {songTitle}
                  </Text>
                  <Text style={eStyles.artist}>{artistName}</Text>

                  <View style={eStyles.metaRow}>
                    <View style={eStyles.metaTag}>
                      <Text style={eStyles.metaTagText}>
                        {data?.language || 'Arabic'}
                      </Text>
                    </View>
                    <Text style={eStyles.metaDot}>·</Text>
                    <View style={eStyles.metaTag}>
                      <Text style={eStyles.metaTagText}>
                        {data?.category?.title || 'Music'}
                      </Text>
                    </View>
                  </View>

                  <View style={eStyles.instrumentalBadge}>
                    <Text style={eStyles.instrumentalBadgeIcon}>♫</Text>
                    <Text style={eStyles.instrumentalBadgeText}>INSTRUMENTAL</Text>
                  </View>
                </View>
              </View>

              <View style={eStyles.divider}>
                <LinearGradient
                  colors={['transparent', 'rgba(245,189,85,0.3)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, height: 1 }}
                />
              </View>

              <View style={eStyles.playerSection}>
                <View style={eStyles.playerRow}>
                  <View style={eStyles.playerLeft}>
                    <Equalizer playing={instrumentalPlaying} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <View style={eStyles.playerTitleRow}>
                        <Text style={eStyles.playerTitle}>Instrumental</Text>
                        {instrumentalPlaying && (
                          <View style={eStyles.nowPlayingBadge}>
                            <Text style={eStyles.nowPlayingText}>LIVE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={eStyles.playerSubtitle}>
                        {instrumentalLoading
                          ? t('Loading instrumental music...') || 'جاري تحميل الموسيقى...'
                          : 'Sing along with the music'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={eStyles.progressWrap}>
                  <View style={eStyles.progressTrack}>
                    <LinearGradient
                      colors={['#F5BD55', '#E8A020']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        eStyles.progressFill,
                        {
                          width: `${instrumentalDurationMs > 0
                            ? Math.min(
                              100,
                              (playbackPositionMs / instrumentalDurationMs) *
                              100,
                            )
                            : 0
                            }%`,
                        },
                      ]}
                    />
                    {instrumentalDurationMs > 0 && (
                      <View
                        style={[
                          eStyles.progressThumb,
                          {
                            left: `${Math.min(
                              100,
                              (playbackPositionMs / instrumentalDurationMs) * 100,
                            )}%`,
                          },
                        ]}
                      />
                    )}
                  </View>
                </View>

                <View style={eStyles.timeRow}>
                  <Text style={eStyles.timeText}>
                    {formatAudioTime(playbackPositionMs)}
                  </Text>
                  <Text style={eStyles.timeDuration}>
                    {formatAudioTime(instrumentalDurationMs)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Central Mic & Record Action Button */}
          <ImageBackground
            source={Banner.circleview}
            resizeMode="contain"
            style={styles.circleContainer}
          >
            {countdown !== null ? (
              <View style={styles.countdownContainer}>
                <SmoothCountdown count={countdown} />
                <AppText
                  fontSize={14}
                  color="#FFFFFF"
                  fontFamily={Inter.regular}
                  style={{ marginTop: 8 }}
                >
                  {t('Get Ready...') || 'استعد...'}
                </AppText>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleMicPress}
                  activeOpacity={0.7}
                  style={styles.micTouchArea}
                >
                  {recording ? (
                    <View style={styles.stopIconContainer}>
                      <View style={styles.stopIconSquare} />
                    </View>
                  ) : (
                    <AppImage source={Logo.linmic} height={89} width={51} />
                  )}
                </TouchableOpacity>

                <AppText
                  fontSize={14}
                  color="#FFFFFF"
                  fontFamily={Inter.extrabold}
                  style={{ marginTop: -5 }}
                >
                  {instrumentalLoading
                    ? t('Loading Music...') || 'جاري التحميل...'
                    : recording
                      ? t('Tap to Stop') || 'اضغط للإيقاف'
                      : isRecorded
                        ? t('Tap to Re-record') || 'اضغط لإعادة التسجيل'
                        : t('Tap to Start') || 'اضغط للبدء'}
                </AppText>

                {recording && (
                  <View style={styles.recordTimeBadge}>
                    <AppText
                      fontSize={15}
                      color="#FEC749"
                      fontFamily={Inter.bold}
                      style={{ letterSpacing: 1 }}
                    >
                      {recordTime ? recordTime.slice(0, 5) : '00:00'}
                    </AppText>
                  </View>
                )}
              </>
            )}
          </ImageBackground>

          {/* Lyrics Section */}
          {data && (
            <View ref={lyricsCardRef} collapsable={false} style={lStyles.card}>
              <LinearGradient
                colors={['#F5BD55', '#E80360', '#5002AE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={lStyles.accentLine}
              />

              <View style={lStyles.header}>
                <View style={lStyles.headerLeft}>
                  <View style={lStyles.lyricsIcon}>
                    <Text style={lStyles.lyricsIconText}>❝</Text>
                  </View>
                  <View>
                    <Text style={lStyles.headerTitle}>Lyrics</Text>
                    {lyricsLines.length > 0 && (
                      <Text style={lStyles.headerSubtitle}>
                        {lyricsLines.length} lines · {data?.language || 'Arabic'}
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowFullLyrics(value => !value)}
                  style={[
                    lStyles.toggleBtn,
                    showFullLyrics && lStyles.toggleBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      lStyles.toggleBtnText,
                      showFullLyrics && lStyles.toggleBtnTextActive,
                    ]}
                  >
                    {showFullLyrics ? '⌃ Show less' : 'View all ⌄'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={lStyles.dividerWrap}>
                <LinearGradient
                  colors={['transparent', 'rgba(245,189,85,0.25)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, height: 1 }}
                />
              </View>

              {/* 🎤 Word-by-Word Karaoke Lyrics */}
              {!showFullLyrics ? (
                <View style={lStyles.compactBody}>
                  {lyricsLines.length > 0 ? (
                    <>
                      {lyricsLines
                        .slice(
                          Math.max(0, activeLyricIndex - 1),
                          activeLyricIndex + 3,
                        )
                        .map((line: any, index) => {
                          const actualIndex =
                            Math.max(0, activeLyricIndex - 1) + index;
                          const active = actualIndex === activeLyricIndex;
                          const distance = Math.abs(actualIndex - activeLyricIndex);

                          if (!line._cachedWords) {
                            const raw = line.rawText || line.text || '';
                            const tagRegex = /<(\d{1,2}):(\d{2}(?:\.\d+)?)>([^<]*)/g;
                            const tagged: { text: string; start: number }[] = [];
                            let m: RegExpExecArray | null;

                            while ((m = tagRegex.exec(raw)) !== null) {
                              const min = Number(m[1]);
                              const sec = Number(m[2]);
                              const wStart = (min * 60 + sec) * 1000;
                              const wText = m[3].trim();
                              if (wText) tagged.push({ text: wText, start: wStart });
                            }

                            if (tagged.length > 0) {
                              line._cachedWords = tagged.map((t, idx) => {
                                const next = tagged[idx + 1];
                                return {
                                  text: t.text,
                                  start: t.start,
                                  end: next ? next.start : Math.max(line.end || line.start + 3500, t.start + 600),
                                };
                              });
                            } else {
                              const clean = raw.replace(/<[^>]+>/g, '').trim();
                              const words = clean.split(/\s+/).filter(Boolean);
                              const lineDur = Math.max((line.end || line.start + 3500) - line.start, words.length * 400);
                              const maxSing = Math.min(lineDur, Math.max(words.length * 650, 2800));
                              const totalWeight = words.reduce((acc: number, w: string) => acc + Math.max(w.length, 2), 0);
                              let curStart = line.start;

                              line._cachedWords = words.map((w: string, idx: number) => {
                                const weight = Math.max(w.length, 2);
                                const dur = Math.max(Math.round((weight / (totalWeight || 1)) * maxSing), 200);
                                const isLast = idx === words.length - 1;
                                const end = isLast ? line.start + maxSing : curStart + dur;
                                const item = { text: w, start: curStart, end };
                                curStart = end;
                                return item;
                              });
                            }
                          }

                          const lineWords = line._cachedWords || [];

                          return (
                            <View
                              key={`${line.start}-${actualIndex}`}
                              style={[
                                lStyles.lineWrap,
                                active && lStyles.lineWrapActive,
                              ]}
                            >
                              {active && <View style={lStyles.activeDot} />}
                              <Text
                                style={[
                                  lStyles.line,
                                  !active && {
                                    opacity: distance === 1 ? 0.45 : 0.25,
                                  },
                                ]}
                              >
                                {active && lineWords.length > 0 ? (
                                  lineWords.map((word: any, wIdx: number) => {
                                    const isCurrent =
                                      playbackPositionMs >= word.start &&
                                      playbackPositionMs < word.end;
                                    const isPast =
                                      playbackPositionMs >= word.end;

                                    const wordColor = isCurrent
                                      ? '#F5BD55'
                                      : isPast
                                        ? '#FFFFFF'
                                        : 'rgba(255, 255, 255, 0.35)';

                                    return (
                                      <Text
                                        key={wIdx}
                                        style={[
                                          {
                                            color: wordColor,
                                            fontSize: isCurrent ? 20 : 18,
                                            fontWeight: isCurrent
                                              ? '900'
                                              : isPast
                                                ? '800'
                                                : '600',
                                            letterSpacing: 0.2,
                                          },
                                          isCurrent && {
                                            textShadowColor:
                                              'rgba(245, 189, 85, 0.95)',
                                            textShadowOffset: { width: 0, height: 0 },
                                            textShadowRadius: 12,
                                          },
                                        ]}
                                      >
                                        {word.text}
                                        {wIdx < lineWords.length - 1 ? ' ' : ''}
                                      </Text>
                                    );
                                  })
                                ) : (
                                  <Text
                                    style={[
                                      lStyles.line,
                                      active && lStyles.lineActive,
                                    ]}
                                  >
                                    {line.text}
                                  </Text>
                                )}
                              </Text>
                            </View>
                          );
                        })}

                      <View style={lStyles.dotsRow}>
                        {lyricsLines.map((_, i) => (
                          <View
                            key={i}
                            style={[
                              lStyles.dot,
                              i === activeLyricIndex && lStyles.dotActive,
                              i < activeLyricIndex && lStyles.dotPast,
                            ]}
                          />
                        ))}
                      </View>
                    </>
                  ) : (
                    <View style={lStyles.emptyState}>
                      <Text style={lStyles.emptyIcon}>♪</Text>
                      <Text style={lStyles.emptyTitle}>No Lyrics Available</Text>
                      <Text style={lStyles.emptySubtitle}>
                        Lyrics are not available for this song.
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <FlatList
                  ref={lyricsListRef}
                  data={lyricsLines}
                  extraData={playbackPositionMs}
                  keyExtractor={(item, index) => `${item.start}-${index}`}
                  scrollEnabled={false}
                  contentContainerStyle={lStyles.fullList}
                  onScrollToIndexFailed={(info) => {
                    setTimeout(() => {
                      lyricsListRef?.current?.scrollToIndex({
                        index: info.index,
                        animated: true,
                        viewPosition: 0.35,
                      });
                    }, 200);
                  }}
                  renderItem={({ item, index }: { item: any; index: number }) => {
                    const active = index === activeLyricIndex;
                    const distance = Math.abs(index - activeLyricIndex);

                    if (!item._cachedWords) {
                      const raw = item.rawText || item.text || '';
                      const tagRegex = /<(\d{1,2}):(\d{2}(?:\.\d+)?)>([^<]*)/g;
                      const tagged: { text: string; start: number }[] = [];
                      let m: RegExpExecArray | null;

                      while ((m = tagRegex.exec(raw)) !== null) {
                        const min = Number(m[1]);
                        const sec = Number(m[2]);
                        const wStart = (min * 60 + sec) * 1000;
                        const wText = m[3].trim();
                        if (wText) tagged.push({ text: wText, start: wStart });
                      }

                      if (tagged.length > 0) {
                        item._cachedWords = tagged.map((t, idx) => {
                          const next = tagged[idx + 1];
                          return {
                            text: t.text,
                            start: t.start,
                            end: next ? next.start : Math.max(item.end || item.start + 3500, t.start + 600),
                          };
                        });
                      } else {
                        const clean = raw.replace(/<[^>]+>/g, '').trim();
                        const words = clean.split(/\s+/).filter(Boolean);
                        const lineDur = Math.max((item.end || item.start + 3500) - item.start, words.length * 400);
                        const maxSing = Math.min(lineDur, Math.max(words.length * 650, 2800));
                        const totalWeight = words.reduce((acc: number, w: string) => acc + Math.max(w.length, 2), 0);
                        let curStart = item.start;

                        item._cachedWords = words.map((w: string, idx: number) => {
                          const weight = Math.max(w.length, 2);
                          const dur = Math.max(Math.round((weight / (totalWeight || 1)) * maxSing), 200);
                          const isLast = idx === words.length - 1;
                          const end = isLast ? item.start + maxSing : curStart + dur;
                          const wordObj = { text: w, start: curStart, end };
                          curStart = end;
                          return wordObj;
                        });
                      }
                    }

                    const lineWords = item._cachedWords || [];

                    return (
                      <View
                        style={[
                          lStyles.fullLineWrap,
                          active && lStyles.fullLineWrapActive,
                        ]}
                      >
                        <Text
                          style={[
                            lStyles.lineNumber,
                            active && lStyles.lineNumberActive,
                          ]}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </Text>

                        <View
                          style={[
                            lStyles.lineBar,
                            active && lStyles.lineBarActive,
                          ]}
                        />

                        <Text
                          style={[
                            lStyles.fullLine,
                            !active && {
                              opacity: distance <= 1 ? 0.5 : 0.3,
                            },
                          ]}
                        >
                          {active && lineWords.length > 0 ? (
                            lineWords.map((word: any, wIdx: number) => {
                              const isCurrent =
                                playbackPositionMs >= word.start &&
                                playbackPositionMs < word.end;
                              const isPast = playbackPositionMs >= word.end;

                              const wordColor = isCurrent
                                ? '#F5BD55'
                                : isPast
                                  ? '#FFFFFF'
                                  : 'rgba(255, 255, 255, 0.35)';

                              return (
                                <Text
                                  key={wIdx}
                                  style={[
                                    {
                                      color: wordColor,
                                      fontSize: isCurrent ? 20 : 18,
                                      fontWeight: isCurrent
                                        ? '900'
                                        : isPast
                                          ? '800'
                                          : '600',
                                      letterSpacing: 0.2,
                                    },
                                    isCurrent && {
                                      textShadowColor:
                                        'rgba(245, 189, 85, 0.95)',
                                      textShadowOffset: { width: 0, height: 0 },
                                      textShadowRadius: 12,
                                    },
                                  ]}
                                >
                                  {word.text}
                                  {wIdx < lineWords.length - 1 ? ' ' : ''}
                                </Text>
                              );
                            })
                          ) : (
                            <Text
                              style={[
                                lStyles.fullLine,
                                active && lStyles.fullLineActive,
                              ]}
                            >
                              {item.text}
                            </Text>
                          )}
                        </Text>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          )}

          {/* Saved Notification Banner */}
          {saved && (
            <View style={styles.savedSuccessRow}>
              <AppImage source={Logo.tick} width={18} height={18} />
              <AppText fontSize={16} color="#EA8721" fontFamily={Inter.extrabold}>
                {'تم حفظ ادائك بنجاح'}
              </AppText>
            </View>
          )}

          {/* Progress & Duration Cards */}
          {isRecorded && (
            <View style={styles.statsContainer}>
              {progressViews.map(item => (
                <View key={item.id} style={styles.statCard}>
                  <AppImage
                    source={item.image}
                    height={28}
                    width={28}
                    tintColor={item.tintcolor || undefined}
                  />
                  <AppText
                    fontSize={12}
                    fontFamily={Inter.regular}
                    color={item.color}
                  >
                    {item.title}
                  </AppText>
                  <AppText
                    fontSize={18}
                    fontFamily={Inter.bold}
                    color={color.darkthemetext}
                  >
                    {item.number}
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </ImageBackground>

        {/* Action Controls when Recorded */}
        {isRecorded && (
          <View
            ref={saveRecordingRef}
            collapsable={false}
            style={styles.actionButtonsRow}
          >
            {/* Sing Again */}
            <TouchableOpacity onPress={startRecording} style={styles.actionBtn}>
              <LinearGradient
                colors={['#FC5B01', '#E80360']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                <AppImage source={Logo.round} height={24} width={24} />
                <AppText fontSize={12} fontFamily={Inter.regular} color="#FFFF">
                  {t('Sing Again') || 'Sing Again'}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>

            {/* Save / Upload - Tapping opens the Save Recording Modal */}
            <TouchableOpacity
              onPress={() => setSaveModalVisible(true)}
              style={styles.actionBtn}
            >
              <LinearGradient
                colors={
                  saved
                    ? ['#27AE60', '#2ECC71']
                    : ['#5002AE', '#160146']
                }
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                <AppImage
                  source={saved ? Logo.filltick : Images.import}
                  height={24}
                  width={24}
                  tintColor={'#FFFF'}
                />
                <AppText fontSize={12} fontFamily={Inter.regular} color="#FFFF">
                  {saved ? t('Saved') || 'Saved' : t('Save Recording') || 'Save Recording'}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
              <LinearGradient
                colors={['#FC5B01', '#E80360']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                <AppImage
                  source={Logo.share}
                  height={24}
                  width={24}
                  tintColor={color.darkthemetext}
                />
                <AppText fontSize={12} fontFamily={Inter.regular} color="#FFFF">
                  {t('Share') || 'Share'}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Next Song Banner */}
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.8}
          style={styles.nextSongContainer}
        >
          <ImageBackground
            source={Banner.btnview}
            resizeMode="stretch"
            style={styles.nextSongBg}
          >
            <View style={styles.nextSongInner}>
              <AppImage source={Images.music} height={30} width={30} />
              <View style={{ alignItems: 'center' }}>
                <AppText color="#fff" fontSize={14} fontFamily={Inter.regular}>
                  {'Another One'}
                </AppText>
              </View>
              <AppImage
                source={Images.arrow}
                height={16}
                width={10}
                tintColor={'#FFFFFF'}
              />
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Back to Library Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.dividerRow}>
            <LinearGradient
              colors={['#7F142C', '#E52450']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.dividerLine}
            />
            <AppText fontSize={16} fontFamily={Inter.regular} color="#D900D5">
              {`~ ${t('Karkab')} ~`}
            </AppText>
            <LinearGradient
              colors={['#E52450', '#7F142C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.dividerLine}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Library')}
            style={{ marginTop: 8 }}
          >
            <AppText fontSize={16} fontFamily={Inter.regular} color="#D900D5">
              {t('Back to Library') || 'Back to Library'}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── SAVE RECORDING MODAL (OPENS ON CLICKING SAVE RECORDINGS) ─── */}
      <Modal
        visible={saveModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={mStyles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSaveModalVisible(false)}
            style={mStyles.backdrop}
          />

          <View style={mStyles.sheetContainer}>
            {/* Accent Line */}
            <LinearGradient
              colors={['#F5BD55', '#E80360', '#5002AE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={mStyles.accentLine}
            />

            {/* Modal Header */}
            <View style={mStyles.sheetHeader}>
              <View style={mStyles.headerLeft}>
                <View style={mStyles.headerIconWrap}>
                  <Text style={mStyles.headerIconText}>🎵</Text>
                </View>
                <View>
                  <Text style={mStyles.headerTitle}>
                    {t('Save Recording') || 'حفظ التسجيل'}
                  </Text>
                  <Text style={mStyles.headerSubtitle}>
                    {t('Add song details before saving') ||
                      'أضف تفاصيل الأغنية قبل الحفظ'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setSaveModalVisible(false)}
                style={mStyles.closeButton}
              >
                <Text style={mStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={mStyles.sheetScrollContent}
            >
              {/* 1. Upload Album Picture */}
              <View style={mStyles.sectionGroup}>
                <Text style={mStyles.fieldLabel}>
                  {t('Album Picture') || 'صورة الألبوم'} *
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSelectImageSource}
                  style={mStyles.imageTouchArea}
                >
                  {albumPicture?.uri ? (
                    <View style={mStyles.imagePreviewContainer}>
                      <Image
                        source={{ uri: albumPicture.uri }}
                        style={mStyles.imagePreview}
                      />
                      <View style={mStyles.changePhotoOverlay}>
                        <Text style={mStyles.changePhotoText}>
                          {t('Change Photo') || 'تغيير الصورة'} ✎
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={mStyles.placeholderBox}>
                      <View style={mStyles.uploadIconCircle}>
                        <AppImage
                          source={Images.import}
                          width={22}
                          height={22}
                          tintColor="#F5BD55"
                        />
                      </View>
                      <Text style={mStyles.placeholderTitle}>
                        {t('Upload Album Picture') || 'رفع صورة الألبوم'}
                      </Text>
                      <Text style={mStyles.placeholderSubtitle}>
                        {t('Tap to choose from Gallery or Camera') ||
                          'اضغط لاختيار صورة (JPG, PNG)'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* 2. Song Title */}
              <View style={mStyles.sectionGroup}>
                <Text style={mStyles.fieldLabel}>
                  {t('Song Title') || 'عنوان الأغنية'} *
                </Text>
                <View style={mStyles.inputBox}>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder={
                      t('Enter title (e.g. Song 1)') || 'أدخل عنوان الأغنية'
                    }
                    placeholderTextColor="#6E6B7B"
                    style={mStyles.textInput}
                  />
                </View>
              </View>

              {/* 3. Album Name */}
              <View style={mStyles.sectionGroup}>
                <Text style={mStyles.fieldLabel}>
                  {t('Album Name') || 'اسم الألبوم'} *
                </Text>
                <View style={mStyles.inputBox}>
                  <TextInput
                    value={albumName}
                    onChangeText={setAlbumName}
                    placeholder={
                      t('Enter album name (e.g. Love Songs)') ||
                      'أدخل اسم الألبوم'
                    }
                    placeholderTextColor="#6E6B7B"
                    style={mStyles.textInput}
                  />
                </View>
              </View>

              {/* 4. Visibility Status */}
              <View style={mStyles.sectionGroup}>
                <Text style={mStyles.fieldLabel}>
                  {t('Visibility / Status') || 'الحالة'}
                </Text>
                <View style={mStyles.statusPillRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setStatus('private')}
                    style={[
                      mStyles.statusPill,
                      status === 'private' && mStyles.statusPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        mStyles.statusPillText,
                        status === 'private' && mStyles.statusPillTextActive,
                      ]}
                    >
                      🔒 {t('Private') || 'خاص'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setStatus('public')}
                    style={[
                      mStyles.statusPill,
                      status === 'public' && mStyles.statusPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        mStyles.statusPillText,
                        status === 'public' && mStyles.statusPillTextActive,
                      ]}
                    >
                      🌍 {t('Public') || 'عام'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Meta Summary Chips */}
              <View style={mStyles.metaChipsRow}>
                <View style={mStyles.metaChipItem}>
                  <Text style={mStyles.metaChipLabel}>{t('DURATION')}</Text>
                  <Text style={mStyles.metaChipValue}>
                    {recordTime.slice(0, 5)}
                  </Text>
                </View>
                <View style={mStyles.metaChipItem}>
                  <Text style={mStyles.metaChipLabel}>{t('SONG ID')}</Text>
                  <Text style={mStyles.metaChipValue}>
                    {String(data?.id || data?.song_id || '669')}
                  </Text>
                </View>
                <View style={mStyles.metaChipItem}>
                  <Text style={mStyles.metaChipLabel}>{t('STATUS')}</Text>
                  <Text
                    style={[
                      mStyles.metaChipValue,
                      { color: saved ? '#27AE60' : '#FEC749' },
                    ]}
                  >
                    {saved ? t('Saved') || 'Saved' : t('Ready') || 'Ready'}
                  </Text>
                </View>
              </View>

              {/* Final Confirm Button */}
              <TouchableOpacity
                onPress={uploadRecording}
                disabled={isUploading}
                style={mStyles.uploadButtonWrap}
              >
                <LinearGradient
                  colors={
                    saved
                      ? ['#27AE60', '#2ECC71']
                      : ['#5002AE', '#160146']
                  }
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={mStyles.uploadButtonGradient}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <AppImage
                        source={saved ? Logo.filltick : Images.import}
                        height={22}
                        width={22}
                        tintColor={'#FFFFFF'}
                      />
                      <Text style={mStyles.uploadButtonText}>
                        {saved
                          ? t('Update & Save Again') || 'تحديث وحفظ مجدداً'
                          : t('Confirm & Upload Recording') ||
                          'تأكيد وحفظ التسجيل'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <AppText fontSize={14} fontFamily={Inter.regular} color={color.mgred} style={{ textAlign: 'center', marginTop: 10 }}>
                {errormessgae}
              </AppText>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#373534',
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    width: 42,
    borderRadius: 21,
  },
  shareHeaderButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#373534',
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 35,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroBackground: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  completionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  micTouchArea: {
    padding: 8,
  },
  savedSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3D3B38',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: 110,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 70,
  },
  gradientBtn: {
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  nextSongContainer: {
    marginTop: 20,
  },
  nextSongBg: {
    height: 64,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextSongInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lyricsHeaderButton: {
    height: 35,
    paddingHorizontal: 12,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  lyricsHeaderButtonActive: {
    backgroundColor: 'rgba(255,45,85,0.15)',
    borderColor: '#FF2D55',
  },

  stopIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(232, 3, 96, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIconSquare: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#E80360',
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  countdownNumber: {
    fontSize: 78,
    fontWeight: '900',
    color: '#FEC749',
    textAlign: 'center',
    minHeight: 90,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textShadowColor: 'rgba(254, 199, 73, 0.75)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 18,
  },
  recordTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    marginTop: 6,
    gap: 6,
  },
  recordingRedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF2D55',
    shadowColor: '#FF2D55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 3,
  },
  recordTimeText: {
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
    minWidth: 46,
    textAlign: 'center',
  },
});

const mStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: '#141118',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 189, 85, 0.2)',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  accentLine: {
    height: 3,
    width: '100%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 189, 85, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 18,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#858178',
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetScrollContent: {
    padding: 18,
    paddingBottom: 32,
  },
  sectionGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  imageTouchArea: {
    width: '100%',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    width: 130,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#F5BD55',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changePhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#F5BD55',
    fontSize: 10,
    fontWeight: '700',
  },
  placeholderBox: {
    width: '100%',
    height: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(245, 189, 85, 0.4)',
    backgroundColor: 'rgba(245, 189, 85, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 189, 85, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  placeholderSubtitle: {
    color: '#858178',
    fontSize: 10,
  },
  inputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  statusPillRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  statusPill: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillActive: {
    borderColor: '#F5BD55',
    backgroundColor: 'rgba(245, 189, 85, 0.14)',
  },
  statusPillText: {
    color: '#858178',
    fontSize: 12,
    fontWeight: '600',
  },
  statusPillTextActive: {
    color: '#F5BD55',
    fontWeight: '800',
  },
  metaChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  metaChipItem: {
    alignItems: 'center',
  },
  metaChipLabel: {
    color: '#858178',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaChipValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadButtonWrap: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

const eStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(12, 10, 8, 0.85)',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 20,
    width: '95%',
    borderWidth: 1,
    borderColor: 'rgba(245, 189, 85, 0.12)',
    overflow: 'hidden',
  },
  accentLine: {
    height: 2,
    width: '100%',
  },
  songRow: {
    flexDirection: 'row',
    padding: 14,
    paddingBottom: 0,
  },
  coverWrap: {
    position: 'relative',
  },
  cover: {
    width: 72,
    height: 72,
    borderRadius: 14,
    zIndex: 1,
  },
  coverPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  coverGlow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 189, 85, 0.08)',
    zIndex: 0,
  },
  songDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  artist: {
    color: '#B8B4AA',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 6,
  },
  metaTag: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metaTagText: {
    color: '#858178',
    fontSize: 10,
    fontWeight: '600',
  },
  metaDot: {
    color: '#858178',
    fontSize: 10,
  },
  instrumentalBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 189, 85, 0.12)',
    gap: 4,
  },
  instrumentalBadgeIcon: {
    color: '#F5BD55',
    fontSize: 9,
  },
  instrumentalBadgeText: {
    color: '#F5BD55',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  divider: {
    paddingHorizontal: 14,
    marginVertical: 12,
  },
  playerSection: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  nowPlayingBadge: {
    backgroundColor: 'rgba(232, 3, 96, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(232, 3, 96, 0.4)',
  },
  nowPlayingText: {
    color: '#E80360',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  playerSubtitle: {
    color: '#858178',
    fontSize: 10,
    marginTop: 2,
  },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5BD55',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  playBtnActive: {
    backgroundColor: 'rgba(245, 189, 85, 0.15)',
    borderWidth: 2,
    borderColor: '#F5BD55',
  },
  playBtnText: {
    color: '#17130B',
    fontSize: 15,
    fontWeight: '900',
  },
  playBtnTextActive: {
    color: '#F5BD55',
    fontSize: 12,
  },
  progressWrap: {
    marginTop: 14,
    position: 'relative',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -4,
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F5BD55',
    borderWidth: 2,
    borderColor: '#17130B',
    shadowColor: '#F5BD55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    color: '#F5BD55',
    fontSize: 10,
    fontWeight: '600',
  },
  timeDuration: {
    color: '#8D897F',
    fontSize: 10,
    fontWeight: '500',
  },
});

const lStyles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
    marginTop: 0,
    marginBottom: 50,
    borderRadius: 20,
    backgroundColor: 'rgba(12, 10, 8, 0.85)',
    width: '95%',
    borderWidth: 1,
    borderColor: 'rgba(245, 189, 85, 0.12)',
    overflow: 'hidden',
  },
  accentLine: {
    height: 2,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lyricsIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 189, 85, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lyricsIconText: {
    fontSize: 18,
    color: '#F5BD55',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#858178',
    fontSize: 10,
    marginTop: 1,
    fontWeight: '500',
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 189, 85, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 189, 85, 0.2)',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(232, 3, 96, 0.12)',
    borderColor: 'rgba(232, 3, 96, 0.3)',
  },
  toggleBtnText: {
    color: '#F5BD55',
    fontSize: 11,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#E80360',
  },
  dividerWrap: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  compactBody: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 6,
  },
  lineWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  lineWrapActive: {
    backgroundColor: 'rgba(245, 189, 85, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 189, 85, 0.12)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5BD55',
    marginRight: 10,
    shadowColor: '#F5BD55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  line: {
    color: '#AAA8B4',
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
    writingDirection: 'rtl',
    flex: 1,
  },
  lineActive: {
    color: '#F5BD55',
    fontSize: 19,
    fontWeight: '800',
    textShadowColor: 'rgba(245, 189, 85, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 3,
    flexWrap: 'wrap',
    maxWidth: '80%',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dotActive: {
    width: 14,
    backgroundColor: '#F5BD55',
    borderRadius: 4,
  },
  dotPast: {
    backgroundColor: 'rgba(245, 189, 85, 0.3)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  emptyIcon: {
    fontSize: 32,
    color: 'rgba(245, 189, 85, 0.3)',
    marginBottom: 4,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#92909D',
    fontSize: 12,
    textAlign: 'center',
  },
  fullList: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  fullLineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 2,
  },
  fullLineWrapActive: {
    backgroundColor: 'rgba(245, 189, 85, 0.08)',
  },
  lineNumber: {
    width: 22,
    color: 'rgba(255,255,255,0.12)',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'right',
  },
  lineNumberActive: {
    color: '#F5BD55',
  },
  lineBar: {
    width: 2,
    height: '80%',
    minHeight: 16,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 10,
  },
  lineBarActive: {
    backgroundColor: '#F5BD55',
    shadowColor: '#F5BD55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  fullLine: {
    flex: 1,
    color: '#AAA8B4',
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  fullLineActive: {
    color: '#F5BD55',
    fontSize: 19,
    fontWeight: '800',
    textShadowColor: 'rgba(245, 189, 85, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});

export default Recording;

const SmoothCountdown = React.memo(({ count }: { count: number | string }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.parallel([
      Animated.spring(anim, {
        toValue: 1,
        friction: 6,
        tension: 85,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [count]);
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.6, 1.0],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.8, 1],
  });
  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        opacity,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={styles.countdownNumber}>{count}</Text>
    </Animated.View>
  );
});
