import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  PanResponder,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import TrackPlayer, {
  useIsPlaying,
  usePlaybackState,
  PlaybackState,
} from '@rntp/player';

import { useAppColors } from '../share/constants/color';
import { Images } from '../share/constants/media';
import AppImage from '../share/components/AppImage';
import AppText from '../share/components/AppText';
import { Inter } from '../share/constants/fonts';
import ApiService from '../services/api';
import apiUrls from '../services/apiUrls';
import { GlobalImage } from '../share/utils/GlobalImage';
import { useAppDispatch, useAppSelector } from '../share/hooks/useAppSelector';
import { addsong, openSongAction, setHideMiniPlayer, showToast } from '../auth/redux/authSlice';
import { saveLastPlayed } from '../services/lastPlayed';
import {
  formatSongToMediaItem,
  prefetchNextSongForQueue,
  skipToNextTrack,
  skipToPreviousTrack,
  playTrackSong,
  parseDurationToSeconds,
} from '../services/player';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RepeatMode = 'off' | 'one' | 'all';

const AudioRec = () => {
  const color = useAppColors();
  const route = useRoute();
  const previousScreen = (route?.params as any)?.previousScreen;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const playsong = useAppSelector((state: any) => state.auth.playsong);
  const playlistQueue = useAppSelector((state: any) => state.auth.playlistQueue);
  const routeParams = (route?.params as {
    id?: number | string;
    type?: string;
  }) ?? {};
  const { id, type } = routeParams;

  // @rntp/player States
  const playing = useIsPlaying();
  const playbackState = usePlaybackState();

  const isBuffering =
    playbackState === PlaybackState.Loading ||
    playbackState === PlaybackState.Buffering;

  const isPlayingActive =
    playing ||
    playbackState === PlaybackState.Playing ||
    (playbackState as any) === 'playing';

  // Track position in SECONDS
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [trackDuration, setTrackDuration] = useState<number>(0);

  // Screen States
  const [songdetail, setSongDetail] = useState<any>(null);
  const [screenLoading, setScreenLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Toggle Between Rotating Disc & Full Lyrics
  const [showFullLyrics, setShowFullLyrics] = useState(false);

  const [adjectprevdata, setAdjectprevdata] = useState<any>(null);
  const [adjectnextdata, setAdjectnextvdata] = useState<any>(null);
  const adjectNextRef = useRef<any>(null);
  const repeatModeRef = useRef<RepeatMode>('off');
  const isShuffleRef = useRef(false);
  const isAutoNextingRef = useRef(false);

  // Scrubber & Lyrics
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const progressWidthRef = useRef(0);
  const isSeekingRef = useRef(false);
  const seekPositionRef = useRef(0);
  const progressPageXRef = useRef(0);
  const scrubberRef = useRef<View>(null);
  const dragProgressRef = useRef<number | null>(null);
  const effectiveDurationRef = useRef(0);

  const [audioMode, setAudioMode] = useState<'vocal' | 'instrumental'>(
    'vocal',
  );
  const [isSwitchingAudio, setIsSwitchingAudio] = useState(false);

  // 📝 Word-by-word synced lyrics data structures
  interface LyricWord {
    text: string;
    start: number; // in ms
    end: number;   // in ms
  }

  interface LyricLine {
    text: string;
    start: number; // in ms
    end: number;   // in ms
    words: LyricWord[];
  }

  const lyricsListRef = useRef<FlatList>(null);
  const [lyricsLines, setLyricsLines] = useState<LyricLine[]>([]);
  const lyricsLinesRef = useRef<LyricLine[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);

  // 💿 CONTINUOUS ROTATING VINYL CONTROLLER
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotationValue = useRef(0);
  const isSpinning = useRef(false);



  useFocusEffect(
    useCallback(() => {
      setShowFullLyrics(false)
    }, [])
  )



  const startSpinning = () => {
    isSpinning.current = true;
    Animated.timing(rotateAnim, {
      toValue: rotationValue.current + 1,
      duration: 12000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && isSpinning.current) {
        rotationValue.current += 1;
        startSpinning();
      }
    });
  };

  const stopSpinning = () => {
    isSpinning.current = false;
    rotateAnim.stopAnimation((value) => {
      rotationValue.current = value;
    });
  };

  useEffect(() => {
    if (isPlayingActive) {
      startSpinning();
    } else {
      stopSpinning();
    }

    return () => {
      stopSpinning();
    };
  }, [isPlayingActive, showFullLyrics]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Sync refs
  useEffect(() => {
    adjectNextRef.current = adjectnextdata;
  }, [adjectnextdata]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  // Hide MiniPlayer on focus
  useFocusEffect(
    useCallback(() => {
      dispatch(setHideMiniPlayer(true));
      return () => {
        dispatch(setHideMiniPlayer(false));
      };
    }, [dispatch])
  );

  useEffect(() => {
    console.log(id, type, "kkkkkkkkk");
    const activeSongId = id || playsong?.id;
    if (!activeSongId) {
      getrendomsong();
      return;
    }

    if (type === 'recordings') {
      getrecDetail(activeSongId);
    } else {
      getSongDetail(activeSongId);
    }
  }, [id, type]);

  // 🔄 Sync AudioRec state when song changes via remote controls (lock screen, notification, bluetooth, carplay)
  useEffect(() => {
    if (!playsong?.id) return;

    if (
      (!songdetail?.id && !screenLoading) ||
      (songdetail?.id && playsong.id.toString() !== songdetail.id.toString())
    ) {
      console.log('🎧 [AudioRec] Synchronizing with remote song switch:', playsong.title);
      setSongDetail(playsong);
      prepareLyrics(playsong);
      if (type !== 'recordings') {
        getSongadjacent(playsong.id);
      }
      setCurrentPosition(0);
      setActiveLyricIndex(0);
      const dur = parseDurationToSeconds(playsong.duration);
      if (dur > 0) {
        setTrackDuration(dur);
      }
    }
  }, [playsong?.id]);

  /**
   * 1. REPEAT / SHUFFLE / AUTO-NEXT CONTROLLER
   */
  const handleAutoNextSong = async () => {
    if (isAutoNextingRef.current) return;

    if (repeatModeRef.current === 'one') {
      try {
        isAutoNextingRef.current = true;
        setCurrentPosition(0);
        await TrackPlayer.seekTo(0);
        await TrackPlayer.play();
      } catch (e) {
      } finally {
        setTimeout(() => {
          isAutoNextingRef.current = false;
        }, 1000);
      }
      return;
    }

    try {
      isAutoNextingRef.current = true;
      await skipToNextTrack(dispatch);
    } catch (e) {
      console.log('AutoNext error:', e);
    } finally {
      setTimeout(() => {
        isAutoNextingRef.current = false;
      }, 1000);
    }
  };

  /**
   * 2. PROGRESS POLLING + AUTO-NEXT TRIGGER
   */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const progress = await TrackPlayer.getProgress();

        if (!progress) return;

        const posSec = Number(progress.position) || 0;
        const durSec = Number(progress.duration) || 0;

        if (!isDraggingRef.current) {
          setCurrentPosition(posSec);

          if (durSec > 0) {
            setTrackDuration(durSec);
          }

          if (
            durSec > 0 &&
            posSec >= durSec - 0.6 &&
            !isAutoNextingRef.current
          ) {
            handleAutoNextSong();
          }
        }
      } catch (e) {
        console.log('Progress error:', e);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // End event listener
  useEffect(() => {
    if (
      (playbackState === PlaybackState.Ended ||
        (playbackState as any) === 'ended') &&
      !isAutoNextingRef.current
    ) {
      handleAutoNextSong();
    }
  }, [playbackState]);

  /**
   * 3. SYNC LYRICS WITH POSITION
   */
  useEffect(() => {
    const lines = lyricsLinesRef.current;
    if (!lines || lines.length === 0 || isDraggingRef.current) return;

    const currentPosMs = currentPosition * 1000;

    // Find the matching line: within [start, end) or latest started line
    let index = lines.findIndex(
      (line) => currentPosMs >= line.start && currentPosMs < line.end
    );

    if (index === -1 && currentPosMs >= lines[0].start) {
      for (let i = lines.length - 1; i >= 0; i--) {
        if (currentPosMs >= lines[i].start) {
          index = i;
          break;
        }
      }
    }

    if (index !== -1 && index !== activeLyricIndex) {
      setActiveLyricIndex(index);
      if (showFullLyrics) {
        lyricsListRef?.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.35,
        });
      }
    }
  }, [currentPosition, activeLyricIndex, showFullLyrics]);

  /**
   * Helper: parses words within a lyric line and computes exact or character-weighted timestamps
   */
  const parseWordsForLine = (
    rawText: string,
    lineStart: number,
    lineEnd: number,
  ): LyricWord[] => {
    if (!rawText) return [];

    // 1. Check for Enhanced LRC inline timestamps: <mm:ss.xx>word
    const tagRegex = /<(\d{1,2}):(\d{2}(?:\.\d+)?)>([^<]*)/g;
    const taggedMatches: { start: number; text: string }[] = [];
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(rawText)) !== null) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const wordStart = (minutes * 60 + seconds) * 1000;
      const wordText = match[3].trim();
      if (wordText) {
        taggedMatches.push({ start: wordStart, text: wordText });
      }
    }

    if (taggedMatches.length > 0) {
      return taggedMatches.map((item, idx) => {
        const nextWord = taggedMatches[idx + 1];
        const wordEnd = nextWord
          ? nextWord.start
          : Math.max(lineEnd, item.start + 600);
        return {
          text: item.text,
          start: item.start,
          end: wordEnd,
        };
      });
    }

    // 2. Standard LRC: clean text & split by whitespace
    const cleanText = rawText.replace(/<[^>]+>/g, '').trim();
    const rawWords = cleanText.split(/\s+/).filter(Boolean);
    if (rawWords.length === 0) return [];

    const rawDuration = lineEnd - lineStart;
    const lineDuration = rawDuration > 400 ? rawDuration : rawWords.length * 600;

    // Phrasing: cap maximum singing duration so long pauses don't over-stretch words
    const maxSingDuration = Math.max(rawWords.length * 750, 3000);
    const effectiveSingDuration = Math.min(lineDuration, maxSingDuration);

    // Character-weighted distribution: longer words get more time than short words
    const totalWeight = rawWords.reduce(
      (sum, w) => sum + Math.max(w.length, 2),
      0,
    );

    let currentWordStart = lineStart;
    const words: LyricWord[] = [];

    rawWords.forEach((wordText, i) => {
      const weight = Math.max(wordText.length, 2);
      const wordDuration = Math.max(
        Math.round((weight / totalWeight) * effectiveSingDuration),
        180,
      );

      const isLast = i === rawWords.length - 1;
      const wordEnd = isLast
        ? lineStart + effectiveSingDuration
        : currentWordStart + wordDuration;

      words.push({
        text: wordText,
        start: currentWordStart,
        end: wordEnd,
      });

      currentWordStart = wordEnd;
    });

    return words;
  };

  const prepareLyrics = (song: any) => {
    if (!song?.lyrics) {
      setLyricsLines([]);
      lyricsLinesRef.current = [];
      return;
    }

    const lines: LyricLine[] = [];
    const lyricRows = song.lyrics
      .split('\n')
      .map((l: string) => l.trim())
      .filter(Boolean);

    lyricRows.forEach((line: string, index: number) => {
      const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)$/);
      if (!match) return;

      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const start = (minutes * 60 + seconds) * 1000;

      const nextLine = lyricRows[index + 1];
      let end = start + 3500;

      if (nextLine) {
        const nextMatch = nextLine.match(/^\[(\d{2}):(\d{2}(?:\.\d+)?)\]/);
        if (nextMatch) {
          end = (Number(nextMatch[1]) * 60 + Number(nextMatch[2])) * 1000;
        }
      }

      const rawText = match[3].trim();
      const cleanText = rawText.replace(/<[^>]+>/g, '').trim();
      if (cleanText) {
        const words = parseWordsForLine(rawText, start, end);
        lines.push({
          text: cleanText,
          start,
          end,
          words,
        });
      }
    });

    // Fallback: If song.lyrics exists but has no [mm:ss] timestamp tags
    if (lines.length === 0 && lyricRows.length > 0) {
      const totalDurSec = parseDurationToSeconds(song.duration) || 180;
      const durationMs = totalDurSec * 1000;
      const rowDuration = Math.max(durationMs / lyricRows.length, 3000);

      lyricRows.forEach((rowText: string, idx: number) => {
        const start = idx * rowDuration;
        const end = start + rowDuration;
        const cleanText = rowText.trim();
        if (cleanText) {
          const words = parseWordsForLine(cleanText, start, end);
          lines.push({
            text: cleanText,
            start,
            end,
            words,
          });
        }
      });
    }

    lyricsLinesRef.current = lines;
    setLyricsLines(lines);
    setActiveLyricIndex(0);
  };

  const playSongItem = async (song: any) => {
    if (!song?.id) return;

    try {
      const dur = parseDurationToSeconds(song.duration);
      if (dur > 0) {
        setTrackDuration(dur);
      }

      await playTrackSong(song, true);
    } catch (error) {
      console.log('PLAY ERROR:', error);
    }
  };

  const toggleAudioMode = async () => {
    if (!songdetail || isSwitchingAudio || type === 'recordings') {
      return;
    }

    const nextMode = audioMode === 'vocal' ? 'instrumental' : 'vocal';

    const audioUrl =
      nextMode === 'instrumental'
        ? songdetail?.instrumental_song || songdetail?.instrumental_wav
        : songdetail?.original_song;

    if (!audioUrl) {
      dispatch(
        showToast({
          visible: true,
          message:
            nextMode === 'instrumental'
              ? 'Instrumental audio is not available.'
              : 'Vocal audio is not available.',
          type: 'error',
        }),
      );
      return;
    }
    console.log('Audio mode:', nextMode);
    console.log('Original song:', songdetail?.original_song);
    console.log('Instrumental song:', songdetail?.instrumental_song);
    console.log('Instrumental WAV:', songdetail?.instrumental_wav);
    console.log('Selected audio URL:', audioUrl);
    try {
      setIsSwitchingAudio(true);

      const progress = await TrackPlayer.getProgress();
      const position = Number(progress?.position) || 0;
      const wasPlaying = isPlayingActive;

      // Pass the selected audio URL to your existing player service.
      await playTrackSong(
        {
          ...songdetail,
          original_song: audioUrl,
          file_path: audioUrl,
        },
        true,
      );

      setAudioMode(nextMode);

      if (position > 0) {
        await TrackPlayer.seekTo(position);
      }

      if (!wasPlaying) {
        await TrackPlayer.pause();
      }
    } catch (error) {
      console.log('Audio mode switch error:', error);
      dispatch(
        showToast({
          visible: true,
          message: 'Unable to switch audio mode.',
          type: 'error',
        }),
      );
    } finally {
      setIsSwitchingAudio(false);
    }
  };

  const getSongDetail = async (songid: any) => {
    try {
      setScreenLoading(true);
      const response = await ApiService.get(apiUrls.singlesongdetail(songid));
      if ((response as any).data?.success) {
        const song = (response as any).data.song;
        setSongDetail(song);
        prepareLyrics(song);

        let activeMediaId: string | null = null;
        try {
          activeMediaId = TrackPlayer.getActiveMediaItem()?.mediaId || null;
        } catch (e) { }

        if (activeMediaId !== song.id?.toString()) {
          await playSongItem(song);
        }
        getSongadjacent(song.id);
      }
    } catch (error: any) {
      getrendomsong()
      // dispatch(
      //   showToast({
      //     visible: true,
      //     message: error?.message || 'Failed to load track.',
      //     type: 'error',
      //   })
      // );
    } finally {

      setScreenLoading(false);
    }
  };

  const getrecDetail = async (songid: any) => {
    try {
      setScreenLoading(true);
      const response = await ApiService.get(apiUrls.singlerecdetail(songid));
      if ((response as any).data?.success) {
        const song = (response as any).data.recording;
        console.log(song, "llll");
        setSongDetail(song);
        prepareLyrics(song);
        const dur = parseDurationToSeconds(song?.duration);
        if (dur > 0) {
          setTrackDuration(dur);
        }
        let activeMediaId: string | null = null;
        try {
          activeMediaId = TrackPlayer.getActiveMediaItem()?.mediaId || null;
        } catch (e) { }

        if (activeMediaId !== song.id?.toString()) {
          await playSongItem(song);
        }
        setAdjectprevdata(null);
        setAdjectnextvdata(null);
        adjectNextRef.current = null;
      }
    } catch (error: any) {
      console.log('getrecDetail error:', error);
      // dispatch(
      //   showToast({
      //     visible: true,
      //     message: error?.message || 'Failed to load recording.',
      //     type: 'error',
      //   })
      // );
    } finally {
      setScreenLoading(false);
    }
  };


  const getrendomsong = async () => {
    try {
      setScreenLoading(true);
      const response = await ApiService.get(apiUrls.randomsong);
      if ((response as any).data?.success) {
        console.log(response, "hbbjbknk")
        const song = (response as any).data.songs[0];
        setSongDetail(song);
        prepareLyrics(song);
        await playSongItem(song);
        getSongadjacent(song.id);
      }
    } catch (error: any) {
      // dispatch(
      //   showToast({
      //     visible: true,
      //     message: error?.message || 'Failed to load track.',
      //     type: 'error',
      //   })
      // );
    } finally {
      setScreenLoading(false);
    }
  };

  const getSongadjacent = async (songid: any) => {
    try {
      const response = await ApiService.get(apiUrls.adjacentsong(songid));
      if ((response as any).data?.success) {
        const data = (response as any).data;
        setAdjectprevdata(data.previousSong);
        setAdjectnextvdata(data.nextSong);
        adjectNextRef.current = data.nextSong;
        if (data.nextSong?.id) {
          // prefetchNextSongForQueue(songid);
        }
      }
    } catch (e) { }
  };

  const handlePlayPause = () => {
    if (isBuffering) return;
    if (playing) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  };

  const toggleRepeatMode = () => {
    const nextMode: RepeatMode =
      repeatMode === 'off' ? 'one' : repeatMode === 'one' ? 'all' : 'off';
    setRepeatMode(nextMode);

    const label =
      nextMode === 'one'
        ? 'Repeat: Current Track'
        : nextMode === 'all'
          ? 'Repeat: All Tracks'
          : 'Repeat: Off';
    dispatch(showToast({ visible: true, message: label, type: 'info' }));
  };

  const toggleShuffle = () => {
    const nextState = !isShuffle;
    setIsShuffle(nextState);
    dispatch(
      showToast({
        visible: true,
        message: nextState ? 'Shuffle: On' : 'Shuffle: Off',
        type: 'info',
      })
    );
  };

  // Scrubber PanResponder
  // Scrubber PanResponder (updated)
  // ───────────────────────────────────────────────────────────────
  // Scrubber PanResponder (replace the previous definition entirely)
  // ───────────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────
  // Updated scrubber PanResponder (only the release handler changes)
  // ───────────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────
  // Scrubber PanResponder (replace the previous definition)
  // ───────────────────────────────────────────────────────────────
  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: async (evt) => {
        const width = progressWidthRef.current;

        if (!width || effectiveDuration <= 0) {
          return;
        }

        isDraggingRef.current = true;
        isSeekingRef.current = true;

        const x = Math.max(
          0,
          Math.min(width, evt.nativeEvent.locationX),
        );

        const percent = x / width;
        const position = percent * effectiveDuration;

        seekPositionRef.current = position;

        setDragProgress(percent * 100);
        setCurrentPosition(position);
      },

      onPanResponderMove: (evt) => {
        const width = progressWidthRef.current;

        if (!width || effectiveDuration <= 0) {
          return;
        }

        const x = Math.max(
          0,
          Math.min(width, evt.nativeEvent.locationX),
        );

        const percent = x / width;
        const position = percent * effectiveDuration;

        seekPositionRef.current = position;

        // Only update UI while dragging.
        setDragProgress(percent * 100);
        setCurrentPosition(position);
      },

      onPanResponderRelease: async (evt) => {
        const width = progressWidthRef.current;

        if (!width) return;

        const x = Math.max(
          0,
          Math.min(width, evt.nativeEvent.locationX),
        );

        const percent = x / width;

        isDraggingRef.current = true;
        isSeekingRef.current = true;

        try {
          const progress = await TrackPlayer.getProgress();

          const duration =
            Number(progress.duration) ||
            effectiveDuration;

          if (!duration) return;

          const seekPosition = percent * duration;

          console.log('Seeking to:', seekPosition);
          console.log('Duration:', duration);

          setCurrentPosition(seekPosition);
          setDragProgress(percent * 100);

          await TrackPlayer.seekTo(seekPosition);

          if (isPlayingActive) {
            await TrackPlayer.play();
          }

        } catch (error) {
          console.log('Seek error:', error);

        } finally {
          setTimeout(() => {
            isDraggingRef.current = false;
            isSeekingRef.current = false;
            setDragProgress(null);
          }, 150);
        }
      },

      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        isSeekingRef.current = false;
        setDragProgress(null);
      },
    }),
  ).current;

  const songDurationSec = parseDurationToSeconds(songdetail?.duration);
  const effectiveDuration =
    trackDuration > 0
      ? trackDuration
      : songDurationSec > 0
        ? songDurationSec
        : 1;

  const currentPercent =
    dragProgress !== null
      ? dragProgress
      : effectiveDuration > 0
        ? Math.min(100, (currentPosition / effectiveDuration) * 100)
        : 0;

  const formatSecs = (sec: number) => {
    if (!sec || isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const activeLyricLine =
    lyricsLines.length > 0 &&
      activeLyricIndex >= 0 &&
      activeLyricIndex < lyricsLines.length
      ? lyricsLines[activeLyricIndex]
      : null;

  const currentLyricLine =
    activeLyricLine?.text || songdetail?.title || 'Sing along...';

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#3B1425', '#010101', '#0D0814', '#000000']}
        locations={[0, 0.45, 0.8, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => {
              if (previousScreen === 'Search') {
                navigation.navigate('Search');
              } else {
                navigation.goBack();
              }
            }}
            style={styles.grabBarTouch}
          >
            <AppImage
              source={Images.arrow}
              tintColor="#FFFF"
              width={24}
              height={20}
              resizeMode='contain'
              style={{
                transform: [{ rotate: '180deg' }],
              }}
            />
          </TouchableOpacity>

          <View style={styles.audioFormatBadge}>
            <AppText
              color="#D1D1D6"
              fontSize={14}
              fontWeight="700"
              fontFamily={Inter.bold}
              style={{ letterSpacing: 1, textAlign: 'center' }}
            >
              LIVE SESSION • LOSSLESS
            </AppText>
          </View>

          <TouchableOpacity

            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >

          </TouchableOpacity>
          {(screenLoading || type === 'recordings') ? (
            null
          ) : (
            <TouchableOpacity

              activeOpacity={0.8}
              onPress={() => navigation.navigate('Recording', { prevScreen: '.', data: songdetail })}
              // onPress={() => navigation.navigate('Recording', { prevScreen: '.' })}
              style={styles.singAlongButton}
            >
              <AppText
                color="#FFFFFF"
                fontSize={12}
                fontWeight="700"
                fontFamily={Inter.bold}
              >
                ♫ Sing
              </AppText>
            </TouchableOpacity>)}
        </View>

        {screenLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FF2D55" />
          </View>
        ) : (
          <View style={styles.mainLayout}>
            {/* 🔄 MODE 1: ROTATING ARTIST PROFILE + SINGLE LINE (When showFullLyrics === false) */}
            {!showFullLyrics ? (
              <View style={styles.middleVisualArea}>
                {/* Spinning Vinyl Record */}
                <View style={styles.vinylContainer}>
                  <Animated.View
                    style={[
                      styles.vinylDisc,
                      { transform: [{ rotate: spin }] },
                    ]}
                  >
                    <View style={styles.grooveRing1} />
                    <View style={styles.grooveRing2} />
                    <View style={styles.grooveRing3} />

                    {/* Artist Profile Photo inside Vinyl */}
                    <View style={styles.profileCircleWrapper}>
                      <AppImage
                        source={GlobalImage(songdetail?.cover_image_url || songdetail?.album_picture_url)}
                        width={110}
                        height={110}
                      />
                      <View style={styles.centerPin} />
                    </View>
                  </Animated.View>
                </View>

                {/* Single Line Lyric Card */}
                <View style={styles.singleLyricCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowFullLyrics(true)}
                    style={styles.lyricTouchWrap}
                  >
                    {activeLyricLine &&
                      activeLyricLine.words &&
                      activeLyricLine.words.length > 0 ? (
                      <AppText
                        textAlign="center"
                        numberOfLines={3}
                        style={styles.singleLyricText}
                      >
                        {activeLyricLine.words.map((word, wIdx) => {
                          const currentPosMs = currentPosition * 1000;
                          const isCurrent =
                            currentPosMs >= word.start && currentPosMs < word.end;
                          const isPast = currentPosMs >= word.end;

                          const wordColor = isCurrent
                            ? '#FF2D55'
                            : isPast
                              ? '#FFFFFF'
                              : 'rgba(255, 255, 255, 0.35)';

                          return (
                            <AppText
                              key={wIdx}
                              color={wordColor}
                              fontSize={isCurrent ? 20 : 18}
                              fontWeight={
                                isCurrent ? '900' : isPast ? '800' : '600'
                              }
                              fontFamily={Inter.bold}
                              style={
                                isCurrent ? styles.activeWordHighlight : undefined
                              }
                            >
                              {word.text}
                              {wIdx < activeLyricLine.words.length - 1
                                ? ' '
                                : ''}
                            </AppText>
                          );
                        })}
                      </AppText>
                    ) : (
                      <AppText
                        color="#FFFFFF"
                        fontSize={18}
                        fontWeight="700"
                        fontFamily={Inter.bold}
                        textAlign="center"
                        numberOfLines={2}
                        style={styles.singleLyricText}
                      >
                        "{currentLyricLine}"
                      </AppText>
                    )}

                    {/* Button to switch to Full Lyrics */}
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

                    {/* {type !== 'recordings' && (
                      <View
                        style={{
                          flexDirection: 'row',
                          backgroundColor: '#252025',
                          borderRadius: 20,
                          padding: 3,
                          marginLeft: 6,
                          marginTop: 15
                        }}
                      >
                        {(['vocal', 'instrumental'] as const).map(mode => {
                          const isActive = audioMode === mode;

                          return (
                            <TouchableOpacity
                              key={mode}
                              disabled={isSwitchingAudio}
                              activeOpacity={0.8}
                              onPress={() => {
                                if (mode !== audioMode) {
                                  toggleAudioMode();
                                }
                              }}
                              style={{

                                paddingHorizontal: 9,
                                paddingVertical: 7,
                                borderRadius: 17,
                                backgroundColor: isActive ? '#FF2D55' : 'transparent',
                              }}
                            >
                              <AppText
                                color="#FFFFFF"
                                fontSize={10}
                                fontWeight="700"
                                numberOfLines={1}
                              >
                                {isSwitchingAudio && isActive
                                  ? '...'
                                  : mode === 'vocal'
                                    ? 'Vocal'
                                    : 'Instrumental'}
                              </AppText>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )} */}

                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* 📜 MODE 2: WHOLE TIME-SYNCED LYRICS (When showFullLyrics === true) */
              <View style={styles.fullLyricsContainer}>
                {/* Collapse / Less Header */}
                <View style={styles.lyricsModeHeader}>
                  <AppText
                    color="rgba(255,255,255,0.6)"
                    fontSize={12}
                    fontWeight="700"
                    fontFamily={Inter.bold}
                    style={{ letterSpacing: 1 }}
                  >
                    LYRICS
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowFullLyrics(false)}
                    style={styles.collapseBtn}
                  >
                    <AppText
                      color="#FF2D55"
                      fontSize={12}
                      fontWeight="700"
                      fontFamily={Inter.bold}
                    >
                      SHOW DISC 🗕
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* Synced Lyrics List */}
                {lyricsLines.length > 0 ? (
                  <FlatList
                    ref={lyricsListRef}
                    data={lyricsLines}
                    extraData={currentPosition}
                    keyExtractor={(item, idx) => `${item.start}-${idx}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.fullLyricsScroll}
                    onScrollToIndexFailed={(info) => {
                      setTimeout(() => {
                        lyricsListRef?.current?.scrollToIndex({
                          index: info.index,
                          animated: true,
                          viewPosition: 0.35,
                        });
                      }, 200);
                    }}
                    renderItem={({ item, index }) => {
                      const isActive = index === activeLyricIndex;
                      const currentPosMs = currentPosition * 1000;

                      return (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={async () => {
                            const targetSec = item.start / 1000;
                            setCurrentPosition(targetSec);
                            await TrackPlayer.seekTo(targetSec);
                            setActiveLyricIndex(index);
                          }}
                          style={[
                            styles.fullLyricItem,
                            isActive && styles.fullLyricItemActive,
                          ]}
                        >
                          <AppText
                            fontSize={isActive ? 25 : 21}
                            fontWeight={isActive ? '800' : '600'}
                            fontFamily={Inter.bold}
                            style={styles.fullLyricText}
                          >
                            {isActive && item.words && item.words.length > 0 ? (
                              item.words.map((word, wIdx) => {
                                const isCurrent =
                                  currentPosMs >= word.start &&
                                  currentPosMs < word.end;
                                const isPast = currentPosMs >= word.end;

                                const wordColor = isCurrent
                                  ? '#FF2D55'
                                  : isPast
                                    ? '#FFFFFF'
                                    : 'rgba(255, 255, 255, 0.35)';

                                return (
                                  <AppText
                                    key={wIdx}
                                    color={wordColor}
                                    fontSize={isCurrent ? 27 : 25}
                                    fontWeight={
                                      isCurrent
                                        ? '900'
                                        : isPast
                                          ? '800'
                                          : '600'
                                    }
                                    fontFamily={Inter.bold}
                                    style={
                                      isCurrent
                                        ? styles.activeWordHighlight
                                        : undefined
                                    }
                                  >
                                    {word.text}
                                    {wIdx < item.words.length - 1 ? ' ' : ''}
                                  </AppText>
                                );
                              })
                            ) : (
                              <AppText
                                color={
                                  index < activeLyricIndex
                                    ? 'rgba(255, 255, 255, 0.45)'
                                    : 'rgba(255, 255, 255, 0.25)'
                                }
                                fontSize={21}
                                fontWeight="600"
                                fontFamily={Inter.bold}
                              >
                                {item.text}
                              </AppText>
                            )}
                          </AppText>
                        </TouchableOpacity>
                      );
                    }}
                  />
                ) : (
                  <View style={styles.centerContainer}>
                    <AppText color="rgba(255,255,255,0.5)" fontSize={14}>
                      {type == 'recordings' ? "Lyrics are not available for the recorded song." : "Lyrics not available for this song."}
                    </AppText>
                  </View>
                )}
              </View>
            )}

            {/* Bottom Player Deck */}
            <View
              style={[
                styles.playerDeck,
                { paddingBottom: insets.bottom + 18 },
              ]}
            >
              {/* Song Meta Header */}
              <View style={styles.metaRow}>
                <View style={styles.miniArtwork}>
                  <AppImage
                    source={GlobalImage(songdetail?.cover_image_url || songdetail?.album_picture_url)}
                    width={48}
                    height={48}
                  />
                </View>
                <View style={styles.metaText}>
                  <TouchableOpacity
                    onPress={() => setShowFullLyrics(!showFullLyrics)}
                  >
                    <AppText
                      color="#FFFFFF"
                      fontSize={17}
                      fontWeight="700"
                      fontFamily={Inter.bold}
                      numberOfLines={1}
                    >
                      {songdetail?.title || 'Song Title'}
                    </AppText>
                  </TouchableOpacity>

                  <AppText
                    color="rgba(255, 255, 255, 0.55)"
                    fontSize={14}
                    fontWeight="500"
                    fontFamily={Inter.medium}
                    numberOfLines={1}
                    style={{ marginTop: 2 }}
                  >
                    {songdetail?.artist || songdetail?.album_name}
                  </AppText>
                </View>


                {/* Lyrics Toggle Button in Meta Row */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowFullLyrics(!showFullLyrics)}
                  style={[
                    styles.lyricsToggleBtn,
                    showFullLyrics && styles.lyricsToggleBtnActive,
                  ]}
                >
                  <AppText
                    color={showFullLyrics ? '#FF2D55' : '#FFFFFF'}
                    fontSize={14}
                    fontWeight="700"
                  >
                    ❝❞
                  </AppText>
                </TouchableOpacity>






                <TouchableOpacity
                  onPress={() => { dispatch(openSongAction(songdetail)); }}
                  style={styles.menu}>
                  <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
                  <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
                  <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
                </TouchableOpacity>
              </View>

              {/* Scrubber Slider */}

              <View style={[styles.scrubberContainer, { marginTop: 14 }]}>
                <View
                  ref={scrubberRef}
                  collapsable={false}
                  style={styles.scrubberHitArea}
                  onLayout={(e) => {
                    const width = e.nativeEvent.layout.width;

                    progressWidthRef.current = width;

                    scrubberRef.current?.measureInWindow(
                      (x, _y, measuredWidth) => {
                        progressPageXRef.current = x;

                        if (measuredWidth > 0) {
                          progressWidthRef.current = measuredWidth;
                        }
                      },
                    );
                  }}
                  {...progressPanResponder.panHandlers}
                >
                  <View style={styles.scrubberBg} />

                  <View
                    style={[
                      styles.scrubberFill,
                      { width: `${currentPercent}%` },
                    ]}
                  />

                  <View
                    style={[
                      styles.scrubberKnob,
                      {
                        left: `${currentPercent}%`,
                        transform: [{ translateX: -4 }],
                      },
                    ]}
                  />
                </View>

                <View style={styles.timeRow}>
                  <AppText
                    color="rgba(255,255,255,0.65)"
                    fontSize={11}
                    fontFamily={Inter.regular}
                  >
                    {formatSecs(
                      dragProgress !== null
                        ? (dragProgress / 100) * effectiveDuration
                        : currentPosition,
                    )}
                  </AppText>

                  <AppText
                    color="rgba(255,255,255,0.65)"
                    fontSize={11}
                    fontFamily={Inter.regular}
                  >
                    {formatSecs(effectiveDuration)}
                  </AppText>
                </View>
              </View>

              {/* Controls Row */}
              {!showFullLyrics ? (
                <View style={styles.controlsRow}>
                  {/* 🔀 Shuffle */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={toggleShuffle}
                    style={[
                      styles.featureBtn,
                      isShuffle && styles.featureBtnActive,
                    ]}
                  >
                    <AppText
                      color={isShuffle ? '#FF2D55' : 'rgba(255,255,255,0.45)'}
                      fontSize={18}
                      fontWeight="700"
                      fontFamily={Inter.bold}
                    >
                      ⇄
                    </AppText>
                  </TouchableOpacity>

                  {/* Previous */}
                  <TouchableOpacity
                    activeOpacity={0.6}
                    disabled={!adjectprevdata?.id && currentPosition <= 3 && (!playlistQueue || playlistQueue.length <= 1)}
                    onPress={async () => {
                      if (currentPosition > 3) {
                        setCurrentPosition(0);
                        await TrackPlayer.seekTo(0);
                        return;
                      }
                      if (adjectprevdata?.id && (!playlistQueue || playlistQueue.length <= 1)) {
                        getSongDetail(adjectprevdata.id);
                      } else {
                        await skipToPreviousTrack(dispatch);
                      }
                    }}
                    style={[
                      styles.navBtn,
                      !adjectprevdata?.id && currentPosition <= 3 && (!playlistQueue || playlistQueue.length <= 1) && { opacity: 0.3 },
                    ]}
                  >
                    <AppImage
                      source={Images.leftarrow}
                      width={20}
                      height={24}
                      tintColor="#FFFFFF"
                    />
                  </TouchableOpacity>

                  {/* Hero Play / Pause */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.heroPlayButton}
                    onPress={handlePlayPause}
                  >
                    {isBuffering ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : playing ? (
                      <View style={styles.pauseContainer}>
                        <View style={styles.pauseBar} />
                        <View style={styles.pauseBar} />
                      </View>
                    ) : (
                      <AppImage
                        source={Images.playicon}
                        width={28}
                        height={28}
                        tintColor="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>

                  {/* Next */}
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={async () => {
                      if (adjectnextdata?.id && (!playlistQueue || playlistQueue.length <= 1)) {
                        getSongDetail(adjectnextdata.id);
                      } else {
                        await skipToNextTrack(dispatch);
                      }
                    }}
                    style={[
                      styles.navBtn,
                      { transform: [{ rotate: '180deg' }] },
                    ]}
                  >
                    <AppImage
                      source={Images.leftarrow}
                      width={20}
                      height={24}
                      tintColor="#FFFFFF"
                    />
                  </TouchableOpacity>

                  {/* 🔁 Repeat */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={toggleRepeatMode}
                    style={[
                      styles.featureBtn,
                      repeatMode !== 'off' && styles.featureBtnActive,
                    ]}
                  >
                    <AppText
                      color={
                        repeatMode !== 'off' ? '#FF2D55' : 'rgba(255,255,255,0.45)'
                      }
                      fontSize={18}
                      fontWeight="700"
                      fontFamily={Inter.bold}
                    >
                      ↻
                    </AppText>
                    {repeatMode === 'one' && (
                      <View style={styles.repeatBadge}>
                        <AppText color="#FFFFFF" fontSize={8} fontWeight="800">
                          1
                        </AppText>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>) : null}

              {/* Bottom Quick Tools */}
              {!showFullLyrics ? (
                <View style={[
                  styles.bottomDock,
                  {
                    marginBottom: Platform.OS === 'ios' ? 10 : 60,
                  },
                ]}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={async () => {
                      setCurrentPosition(0);
                      await TrackPlayer.seekTo(0);
                    }}
                    style={styles.dockItem}
                  >
                    <AppImage
                      source={Images.restart}
                      width={18}
                      height={18}
                      tintColor="rgba(255,255,255,0.7)"
                    />
                    <AppText
                      color="rgba(255,255,255,0.7)"
                      fontSize={11}
                      fontFamily={Inter.medium}
                    >
                      Restart
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={async () => {
                      await TrackPlayer.stop();
                      navigation.goBack();
                    }}
                    style={styles.dockFinishPill}
                  >
                    <AppImage
                      source={Images.tick}
                      width={15}
                      height={15}
                      tintColor="#FFFFFF"
                    />
                    <AppText
                      color="#FFFFFF"
                      fontSize={12}
                      fontWeight="700"
                      fontFamily={Inter.bold}
                    >
                      Finish Session
                    </AppText>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default AudioRec;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 6,
  },
  grabBarTouch: {
    paddingVertical: 10,
    paddingRight: 10,
  },
  grabHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  audioFormatBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainLayout: {
    flex: 1,
    justifyContent: 'space-between',
  },
  // 📀 ROTATING DISC STYLES
  middleVisualArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  vinylContainer: {
    shadowColor: '#FF2D55',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 12,
    marginBottom: 16,
  },
  vinylDisc: {
    width: SCREEN_WIDTH * 0.58,
    height: SCREEN_WIDTH * 0.58,
    borderRadius: (SCREEN_WIDTH * 0.58) / 2,
    backgroundColor: '#111014',
    borderWidth: 5,
    borderColor: '#24202A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grooveRing1: {
    position: 'absolute',
    width: '88%',
    height: '88%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  grooveRing2: {
    position: 'absolute',
    width: '74%',
    height: '74%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  grooveRing3: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  profileCircleWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FF2D55',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  centerPin: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  singleLyricCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lyricTouchWrap: {
    alignItems: 'center',
  },
  singleLyricText: {
    lineHeight: 26,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(255, 45, 85, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  fullLyricsBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 45, 85, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  // 📜 FULL TIME-SYNCED LYRICS MODE STYLES
  fullLyricsContainer: {
    flex: 1,
    paddingHorizontal: 22,
  },
  lyricsModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  collapseBtn: {
    backgroundColor: 'rgba(255, 45, 85, 0.15)',
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
  },
  activeWordHighlight: {
    color: '#FF2D55',
    textShadowColor: 'rgba(255, 45, 85, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  // PLAYER DECK
  playerDeck: {
    backgroundColor: 'rgba(22, 19, 28, 0.85)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniArtwork: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  metaText: {
    flex: 1,
    marginLeft: 14,
  },
  lyricsToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lyricsToggleBtnActive: {
    backgroundColor: 'rgba(255, 45, 85, 0.2)',
  },
  scrubberContainer: {
    //    marginTop: 14,

  },
  scrubberHitArea: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  scrubberBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  scrubberFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
  },
  scrubberKnob: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  featureBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  featureBtnActive: {
    backgroundColor: 'rgba(255, 45, 85, 0.15)',
  },
  repeatBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF2D55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtn: {
    padding: 10,
  },
  heroPlayButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  pauseBar: {
    width: 6,
    height: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  bottomDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',

  },
  dockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  dockFinishPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF2D55',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  singAlongButton: {
    backgroundColor: '#FF2D55',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
    marginLeft: 8,
  },
  menu: {
    marginLeft: 20,
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
});