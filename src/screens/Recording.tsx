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

  const [lyricsLines, setLyricsLines] = useState<
    { text: string; start: number; end: number }[]
  >([]);

  const [activeLyricIndex, setActiveLyricIndex] = useState(0);

  const lyricsListRef = useRef<FlatList>(null);
  const lyricsLinesRef = useRef<
    { text: string; start: number; end: number }[]
  >([]);


  const instrumentalUrl =
    data?.instrumental_song || data?.instrumental_wav;

  const songTitle = data?.title || 'Untitled Song';
  const artistName = data?.artist || 'Unknown Artist';
  const coverImage = data?.cover_image_url;
  const songDuration = Number(data?.duration) || 0;

  // Connect these to your actual player state and functions.
  const [instrumentalPlaying, setInstrumentalPlaying] =
    useState(false);

  const [playbackPositionMs, setPlaybackPositionMs] =
    useState(0);

  const [instrumentalDurationMs, setInstrumentalDurationMs] =
    useState(songDuration * 1000);
  const [instrumentalLoading, setInstrumentalLoading] = useState(false);

  const isRecordingRef = useRef(false);
  const isStartingPlayerRef = useRef(false);
  const isPlayingRef = useRef(false);
  const playbackListenerRef = useRef(false);

  const isStartingRef = useRef(false);
  const hasStartedRef = useRef(false);

  // Clean up listeners and recording when component unmounts
  useEffect(() => {

    return () => {
      Sound.removeRecordBackListener();
      Sound.stopRecorder().catch(() => { });
    };
  }, []);




  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      console.log('Recording screen focused, stopping previous song if any');
      dispatch(setHideMiniPlayer(true));
      const stopPreviousSong = async () => {
        try {
          // Stop the song playing through @rntp/player
          await TrackPlayer.stop();

          // Reset the previous song's position
          await TrackPlayer.seekTo(0);
          dispatch(setHideMiniPlayer(true));
          console.log('Previous TrackPlayer song stopped');
        } catch (error) {
          console.log('Error stopping previous song:', error);
        }
      };

      // dispatch(setHideMiniPlayer(true));

      // Stop the previous song immediately when Recording gets focus
      stopPreviousSong();

      return () => {
        isActive = false;
        dispatch(setHideMiniPlayer(false));
      };
    }, [dispatch, data]),
  );

  useEffect(() => {
    if (data?.lyrics) {
      prepareLyrics(data);
    } else {
      setLyricsLines([]);
      lyricsLinesRef.current = [];
    }
  }, [data]);


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

    const parsedLines: {
      text: string;
      start: number;
    }[] = [];

    lyricRows.forEach((line: string) => {
      const match = line.match(
        /^\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]\s*(.*)$/
      );

      if (!match) {
        return;
      }

      const minutes = Number(match[1]);
      const seconds = Number(match[2]);

      const start = (minutes * 60 + seconds) * 1000;
      const text = match[3].trim();

      if (text) {
        parsedLines.push({
          text,
          start,
        });
      }
    });

    // Make sure lyrics are ordered by timestamp
    parsedLines.sort((a, b) => a.start - b.start);

    const lines = parsedLines.map((line, index) => {
      const nextLine = parsedLines[index + 1];

      return {
        text: line.text,
        start: line.start,

        // End when next lyric starts
        // Otherwise keep it active for 3.5 seconds
        end: nextLine
          ? nextLine.start
          : line.start + 3500,
      };
    });

    lyricsLinesRef.current = lines;
    setLyricsLines(lines);
    setActiveLyricIndex(0);
  };


  const getRecordingSeconds = () => {
    if (!recordTime) return 0;

    const parts = recordTime.split(':');

    if (parts.length !== 2) return 0;

    const minutes = Number(parts[0]) || 0;
    const seconds = Number(parts[1]) || 0;

    return minutes * 60 + seconds;
  };

  useEffect(() => {
    if (!lyricsLines.length) {
      return;
    }

    const currentPositionMs = playbackPositionMs;

    // Find the lyric whose time range contains current playback position
    let index = -1;

    for (let i = 0; i < lyricsLines.length; i++) {
      const line = lyricsLines[i];

      if (
        currentPositionMs >= line.start &&
        currentPositionMs < line.end
      ) {
        index = i;
        break;
      }
    }

    // If we're between lines, use the latest lyric that has started
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
          lyricsListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.35,
          });
        });
      }
    }
  }, [
    playbackPositionMs,
    lyricsLines,
    activeLyricIndex,
    showFullLyrics,
  ]);


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
        })
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

  const startRecording = async () => {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      dispatch(
        showToast({
          visible: true,
          message: t('Microphone permission denied') || 'تم رفض إذن الميكروفون',
          type: 'error',
        })
      );
      return;
    }

    try {
      // Reset prior recording states
      setSaved(false);
      setPath('');
      setRecPercentage('0');
      setRecordTime('00:00');

      Sound.addRecordBackListener((e: RecordBackType) => {
        setRecordTime(Sound.mmssss(Math.floor(e.currentPosition)));
      });

      const result = await Sound.startRecorder();
      setRecording(true);
      console.log('Recording started:', result);
    } catch (e) {
      console.log('Error starting recording:', e);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await Sound.stopRecorder();

      Sound.removeRecordBackListener();

      setPath(result);
      setRecording(false);
      setRecPercentage('100');

      console.log('Recording stopped at path:', result);

      // Wait until isRecorded UI is rendered, then scroll
      setTimeout(() => {
        scrollToSaveRecording();
      }, 150);

    } catch (e) {
      console.log('Error stopping recording:', e);
      setRecording(false);
    }
  };

  useEffect(() => {
    if (!isRecorded) {
      return;
    }

    const timer = setTimeout(() => {
      scrollToSaveRecording();
    }, 200);

    return () => clearTimeout(timer);
  }, [isRecorded]);

  const handleMicPress = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const generateSongId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}-SONG`;
  };

  const uploadRecording = async () => {
    if (!path || saved || isUploading) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('song_id', generateSongId());
      formData.append('status', 'review');
      formData.append('recordingFile', {
        uri: path,
        type: 'audio/mp3',
        name: 'song.mp3',
      } as any);

      const response: any = await ApiService.post(apiUrls.uploadrecording, formData);

      if (response?.data?.success) {
        setSaved(true);
        if (response.data.recording_url) {
          setPath(response.data.recording_url);
        }
        dispatch(
          showToast({
            visible: true,
            message: t('Recording saved successfully.') || 'تم حفظ التسجيل بنجاح.',
            type: 'success',
          })
        );
      } else {
        dispatch(
          showToast({
            visible: true,
            message: response?.data?.message || 'Recording upload failed.',
            type: 'error',
          })
        );
      }
    } catch (error: any) {
      console.log('UPLOAD ERROR:', error);
      dispatch(
        showToast({
          visible: true,
          message:
            error?.response?.data?.message ||
            'Unable to upload recording. Please try again.',
          type: 'error',
        })
      );
    } finally {
      setIsUploading(false);
    }
  };

  const lyrics = data?.lyrics;

  const lyricsText = Array.isArray(lyrics)
    ? lyrics
      .map((item: any) =>
        typeof item === 'string'
          ? item
          : item?.text || item?.lyric || item?.line || ''
      )
      .filter(Boolean)
      .join('\n')
    : typeof lyrics === 'string'
      ? lyrics.trim()
      : '';


  useEffect(() => {
    return () => {
      Sound.removeRecordBackListener();

      Sound.stopRecorder().catch(() => { });
    };
  }, [data]);



  const isRecorded = Boolean(path) && !recording;

  const formatAudioTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(
      Math.max(0, milliseconds) / 1000,
    );

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      seconds,
    ).padStart(2, '0')}`;
  };

  useEffect(() => {
    const playbackListener = (event: any) => {
      const position = Number(event.currentPosition) || 0;
      const duration = Number(event.duration) || 0;

      setPlaybackPositionMs(position);

      if (duration > 0) {
        setInstrumentalDurationMs(duration);
      }

      // Song finished
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
    };
  }, []);



  const toggleInstrumentalPlayback = async () => {
    if (!instrumentalUrl || instrumentalLoading || isStartingRef.current) {
      return;
    }

    if (isRecordingRef.current) {
      return;
    }

    try {
      // PAUSE the current track
      if (isPlayingRef.current) {
        await Sound.pausePlayer();

        isPlayingRef.current = false;
        setInstrumentalPlaying(false);
        return;
      }

      isStartingRef.current = true;
      setInstrumentalLoading(true);

      // RESUME from the paused position, not from the beginning
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
        handleBack()
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color.darkbackround }]} edges={['top']}>
      {/* Top Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
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
              onPress={() =>
                setShowFullLyrics(!showFullLyrics)
              }
              style={[
                styles.lyricsHeaderButton,
                showFullLyrics &&
                styles.lyricsHeaderButtonActive,
              ]}
            >
              <AppText
                fontFamily={Inter.bold}
                color={
                  showFullLyrics
                    ? '#FF2D55'
                    : color.darkthemetext
                }
                fontSize={12}
              >
                ❝❞ Lyrics
              </AppText>
            </TouchableOpacity>
          )}

          {isRecorded && (
            <TouchableOpacity
              onPress={onShare}
              style={styles.shareHeaderButton}
            >
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

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>


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
              <AppText fontSize={18} color="#FEC749" fontFamily={Inter.extrabold} style={{ marginTop: 4 }}>
                {'لقد اكتمل أداؤك'}
              </AppText>
            </>
          ) : (
            <AppText fontSize={28} color="#FFFFFF" fontFamily={Inter.extrabold} style={{ marginTop: 12 }}>
              {recording ? t('Recording in Progress...') || 'جاري التسجيل...' : t('Ready to Sing?') || 'جاهز للغناء؟'}
            </AppText>
          )}


          {/* SONG DETAILS */}
          {data && (
            <View style={styles.songMainCard}>
              {/* SONG INFO */}
              <View style={styles.songInfoCard}>
                {coverImage ? (
                  <Image
                    source={{ uri: coverImage }}
                    style={styles.songCover}
                  />
                ) : (
                  <View style={styles.songCoverPlaceholder}>
                    <Text style={styles.placeholderIcon}>♫</Text>
                  </View>
                )}

                <View style={styles.songInfo}>
                  <Text style={styles.songTitle} numberOfLines={2}>
                    {songTitle}
                  </Text>

                  <Text style={styles.artistName}>
                    {artistName}
                  </Text>

                  <Text style={styles.songMeta}>
                    {data?.language || 'Arabic'} ·{' '}
                    {data?.category?.title || 'Music'}
                  </Text>

                  <View style={styles.instrumentalBadge}>
                    <Text style={styles.instrumentalBadgeText}>
                      ♫ INSTRUMENTAL
                    </Text>
                  </View>
                </View>
              </View>

              {/* DIVIDER */}
              <View style={styles.cardDivider} />

              {/* INSTRUMENTAL PLAYER */}
              <View style={styles.playerCard}>
                <View style={styles.playerHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.playerTitle}>
                      Instrumental
                    </Text>

                    <Text style={styles.playerSubtitle}>
                      Sing along with the music
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.playButton,
                      instrumentalLoading && { opacity: 0.7 },
                    ]}
                    onPress={toggleInstrumentalPlayback}
                    disabled={instrumentalLoading || !instrumentalUrl}
                  >
                    {instrumentalLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="#17130B"
                      />
                    ) : (
                      <Text style={styles.playButtonText}>
                        {instrumentalPlaying ? 'Ⅱ' : '▶'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* PROGRESS */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${instrumentalDurationMs > 0
                          ? Math.min(
                            100,
                            (playbackPositionMs /
                              instrumentalDurationMs) *
                            100,
                          )
                          : 0
                          }%`,
                      },
                    ]}
                  />
                </View>

                {/* TIME */}
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>
                    {formatAudioTime(playbackPositionMs)}
                  </Text>

                  <Text style={styles.timeText}>
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
            {saved && (
              <View style={styles.savedBadge}>
                <AppImage source={Logo.tick} width={18} height={18} />
                <AppText fontSize={16} color="#FFFFFF" fontFamily={Inter.extrabold}>
                  {'تم الحفظ'}
                </AppText>
              </View>
            )}

            <TouchableOpacity onPress={handleMicPress} activeOpacity={0.7} style={styles.micTouchArea}>
              <AppImage
                source={recording ? Images.playicon : Logo.linmic}
                height={recording ? 60 : 89}
                width={recording ? 60 : 51}
              />
            </TouchableOpacity>

            <AppText fontSize={14} color="#FFFFFF" fontFamily={Inter.extrabold} style={{ marginTop: 8 }}>
              {recording ? t('Tap to Stop') || 'اضغط للإيقاف' : isRecorded ? t('Tap to Re-record') || 'اضغط لإعادة التسجيل' : t('Tap to Start') || 'اضغط للبدء'}
            </AppText>

            {recording && (
              <AppText fontSize={16} color="#FEC749" fontFamily={Inter.bold} style={{ marginTop: 4 }}>
                {recordTime}
              </AppText>
            )}
          </ImageBackground>



          {/* Lyrics Section - show only when lyrics exist */}
          {/* Current Lyric */}

          {
            data && (
              <>
                {/* {lyricsLines.length > 0 && !showFullLyrics && (
                  <View style={styles.singleLyricCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowFullLyrics(true)}
                      style={styles.lyricTouchWrap}
                    >
                      <AppText
                        color="#FFFFFF"
                        fontSize={18}
                        fontWeight="700"
                        fontFamily={Inter.bold}
                        textAlign="center"
                        numberOfLines={2}
                        style={styles.singleLyricText}
                      >
                        "{lyricsLines[activeLyricIndex]?.text || 'Sing along...'}"
                      </AppText>

                      <View style={styles.fullLyricsBadge}>
                        <AppText
                          color="#FF2D55"
                          fontSize={11}
                          fontWeight="700"
                          fontFamily={Inter.bold}
                        >
                          FULL LYRICS ↗
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  </View>
                )} */}

                <View style={styles.lyricsCard}>
                  <View style={styles.lyricsHeaderRow}>
                    <Text style={styles.lyricsTitle}>Lyrics</Text>

                    <TouchableOpacity
                      onPress={() => setShowFullLyrics(value => !value)}
                    >
                      <Text style={styles.expandLyricsText}>
                        {showFullLyrics ? 'Show less' : 'View all'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {!showFullLyrics ? (
                    <View style={styles.currentLyrics}>
                      {lyricsLines.length > 0 ? (
                        <>
                          {lyricsLines
                            .slice(
                              Math.max(0, activeLyricIndex - 1),
                              activeLyricIndex + 3,
                            )
                            .map((line, index) => {
                              const actualIndex =
                                Math.max(0, activeLyricIndex - 1) + index;

                              const active =
                                actualIndex === activeLyricIndex;

                              return (
                                <Text
                                  key={`${line.start}-${actualIndex}`}
                                  style={[
                                    styles.lyricLine,
                                    active && styles.activeLyricLine,
                                  ]}
                                >
                                  {line.text}
                                </Text>
                              );
                            })}
                        </>
                      ) : (
                        <Text style={styles.noLyricsText}>
                          Lyrics are not available for this song.
                        </Text>
                      )}
                    </View>
                  ) : (
                    <FlatList
                      ref={lyricsListRef}
                      data={lyricsLines}
                      keyExtractor={(item, index) =>
                        `${item.start}-${index}`
                      }
                      scrollEnabled={false}
                      renderItem={({ item, index }) => (
                        <Text
                          style={[
                            styles.lyricLine,
                            index === activeLyricIndex &&
                            styles.activeLyricLine,
                          ]}
                        >
                          {item.text}
                        </Text>
                      )}
                    />
                  )}
                </View>
              </>)}


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
              {progressViews.map((item) => (
                <View key={item.id} style={styles.statCard}>
                  <AppImage
                    source={item.image}
                    height={28}
                    width={28}
                    tintColor={item.tintcolor || undefined}
                  />
                  <AppText fontSize={12} fontFamily={Inter.regular} color={item.color}>
                    {item.title}
                  </AppText>
                  <AppText fontSize={18} fontFamily={Inter.bold} color={color.darkthemetext}>
                    {item.number}
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </ImageBackground>

        {/* Full Lyrics */}





        {/* Action Controls when Recorded */}
        {isRecorded && (
          <View
            ref={saveRecordingRef}
            collapsable={false}
            style={styles.actionButtonsRow}>
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

            {/* Save / Upload */}
            <TouchableOpacity
              onPress={uploadRecording}
              disabled={saved || isUploading}
              style={[styles.actionBtn, saved && { opacity: 0.6 }]}
            >
              <LinearGradient
                colors={saved ? ['#27AE60', '#2ECC71'] : ['#5002AE', '#160146']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <AppImage
                      source={saved ? Logo.filltick : Images.import}
                      height={24}
                      width={24}
                      tintColor={'#FFFF'}
                    />
                    <AppText fontSize={12} fontFamily={Inter.regular} color="#FFFF">
                      {saved ? t('Saved') || 'Saved' : t('Save Recording') || 'Save Recording'}
                    </AppText>
                  </>
                )}
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
                <AppImage source={Logo.share} height={24} width={24} tintColor={color.darkthemetext} />
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
          activeOpacity={0.8} style={styles.nextSongContainer}>
          <ImageBackground source={Banner.btnview} resizeMode="stretch" style={styles.nextSongBg}>
            <View style={styles.nextSongInner}>
              <AppImage source={Images.music} height={30} width={30} />
              <View style={{ alignItems: 'center' }}>
                <AppText color="#fff" fontSize={14} fontFamily={Inter.regular}>
                  {t('Next Song') || 'Next Song'}
                </AppText>
                <AppText color="#FFFF00" fontSize={16} fontFamily={Inter.bold}>
                  {'يا ليالي الخرطوم'}
                </AppText>
              </View>
              <AppImage source={Images.arrow} height={16} width={10} tintColor={'#FFFFFF'} />
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
  songMainCard: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    //   marginVertical: 8,
    width: '95%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 20,
  },

  songInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  songCover: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },

  songCoverPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#29251D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderIcon: {
    fontSize: 26,
    color: '#F5BD55',
  },

  songInfo: {
    flex: 1,
    marginLeft: 10,
  },

  songTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  artistName: {
    color: '#B8B4AA',
    fontSize: 12,
    marginTop: 2,
  },

  songMeta: {
    color: '#858178',
    fontSize: 10,
    marginTop: 2,
  },

  instrumentalBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(245,189,85,0.12)',
  },

  instrumentalBadgeText: {
    color: '#F5BD55',
    fontSize: 8,
    fontWeight: '800',
  },

  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 10,
  },

  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  playerSubtitle: {
    color: '#858178',
    fontSize: 10,
    marginTop: 1,
  },

  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5BD55',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  playButtonText: {
    color: '#17130B',
    fontSize: 16,
    fontWeight: '900',
  },

  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#39352D',
    overflow: 'hidden',
    marginTop: 12,
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  timeText: {
    color: '#8D897F',
    fontSize: 9,
  },






  playerCard: {
    padding: 0,
  },



  completionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleContainer: {
    width: 280,
    height: 280,
    marginVertical: 5,
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
  lyricsContainer: {
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#17131F',
    borderWidth: 1,
    borderColor: '#39303F',
  },

  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  lyricsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(254, 199, 73, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lyricsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(254, 199, 73, 0.12)',
  },

  lyricsDivider: {
    height: 1,
    backgroundColor: '#39303F',
    marginVertical: 16,
  },

  lyricsScroll: {
    maxHeight: 240,
  },

  lyricsContent: {
    paddingBottom: 8,
  },

  lyricsText: {
    lineHeight: 32,
    textAlign: 'center',
    writingDirection: 'rtl',
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
  singleLyricCard: {
    width: '92%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: 8,
  },

  lyricTouchWrap: {
    alignItems: 'center',
  },

  singleLyricText: {
    lineHeight: 27,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(255,45,85,0.4)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 6,
  },

  fullLyricsBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,45,85,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  fullLyricsContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 22,
    marginTop: 12,
    minHeight: 300,
  },

  lyricsModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  collapseBtn: {
    backgroundColor: 'rgba(255,45,85,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },

  fullLyricsScroll: {
    paddingTop: 24,
    paddingBottom: 40,
  },

  fullLyricItem: {
    paddingVertical: 12,
  },

  fullLyricItemActive: {
    paddingVertical: 16,
  },

  fullLyricText: {
    lineHeight: 32,
    letterSpacing: -0.3,
    textAlign: 'center',
  },



  lyricsCard: {
    marginHorizontal: 10,
    marginTop: 0,
    marginBottom: 50,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.8)',
    width: '95%',
  },
  lyricsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  lyricsTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  expandLyricsText: {
    color: '#F5BD55',
    fontSize: 13,
    fontWeight: '600',
  },
  currentLyrics: {
    alignItems: 'center',
    gap: 15,
    paddingVertical: 12,
  },
  lyricLine: {
    color: '#AAA8B4',
    fontSize: 17,
    lineHeight: 32,
    textAlign: 'center',
    paddingVertical: 5,
    writingDirection: 'rtl',
  },
  activeLyricLine: {
    color: '#F5BD55',
    fontSize: 21,
    fontWeight: '800',
  },
  noLyricsText: {
    color: '#92909D',
    textAlign: 'center',
    paddingVertical: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F5BD55',
    borderRadius: 2,
  },
});

export default Recording;