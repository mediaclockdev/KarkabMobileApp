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
import AudioRecSkeleton from '../share/components/AudioRecSkeleton';
import Svg, { Path, Circle } from 'react-native-svg';

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
  const playlistIndex = useAppSelector((state: any) => state.auth.playlistIndex ?? 0);
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
  const [textSizeMultiplier, setTextSizeMultiplier] = useState<number>(1);
  const cycleTextSize = () => {
    setTextSizeMultiplier(prev => (prev === 1 ? 1.15 : prev === 1.15 ? 1.3 : 1));
  };

  const [adjectprevdata, setAdjectprevdata] = useState<any>(null);
  const [adjectnextdata, setAdjectnextvdata] = useState<any>(null);
  const adjectNextRef = useRef<any>(null);
  const adjectPrevRef = useRef<any>(null);
  const repeatModeRef = useRef<RepeatMode>('off');
  const isShuffleRef = useRef(false);
  const isAutoNextingRef = useRef(false);
  const currentPositionRef = useRef<number>(0);
  const playlistQueueRef = useRef<any[]>([]);
  const playlistIndexRef = useRef<number>(0);

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
  interface LyricTimestamp {
    word: string;
    start: number;
    end: number;
    lineIndex: number;
    wordIndex: number;
  }

  interface LyricWord {
    text: string;
    start: number;
    end: number;
  }

  interface LyricLine {
    text: string;
    start: number;
    end: number;
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
      setShowFullLyrics(false);
    }, [])
  );



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
    adjectPrevRef.current = adjectprevdata;
  }, [adjectprevdata]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    currentPositionRef.current = currentPosition;
  }, [currentPosition]);

  useEffect(() => {
    playlistQueueRef.current = playlistQueue || [];
  }, [playlistQueue]);

  useEffect(() => {
    playlistIndexRef.current = playlistIndex || 0;
  }, [playlistIndex]);

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

    if (songdetail?.id && activeSongId.toString() === songdetail.id.toString()) {
      return;
    }

    const isRecording =
      type === 'recordings' ||
      playsong?.recording_url ||
      playsong?.recordingUrl ||
      playsong?.type === 'recordings';

    if (isRecording) {
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
      console.log('🎧 [AudioRec] Synchronizing with remote song switch:', playsong);
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
        currentPositionRef.current = 0;
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

    await handleNextTrack();
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
          currentPositionRef.current = posSec;

          if (durSec > 0) {
            setTrackDuration(durSec);
          }

          if (
            !screenLoading &&
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
  }, [screenLoading]);

  // End event listener
  useEffect(() => {
    if (
      !screenLoading &&
      (playbackState === PlaybackState.Ended ||
        (playbackState as any) === 'ended') &&
      !isAutoNextingRef.current
    ) {
      handleAutoNextSong();
    }
  }, [playbackState, screenLoading]);

  /**
   * 3. SYNC LYRICS WITH POSITION
   */
  useEffect(() => {
    const lines = lyricsLinesRef.current;
    // console.log(lines, "kkkkk")
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

  // const prepareLyrics = (song: any) => {
  //   if (!song?.lyrics) {
  //     setLyricsLines([]);
  //     lyricsLinesRef.current = [];
  //     return;
  //   }

  //   const lines: LyricLine[] = [];
  //   const lyricRows = song.lyrics
  //     .split('\n')
  //     .map((l: string) => l.trim())
  //     .filter(Boolean);

  //   lyricRows.forEach((line: string, index: number) => {
  //     const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)$/);
  //     if (!match) return;

  //     const minutes = Number(match[1]);
  //     const seconds = Number(match[2]);
  //     const start = (minutes * 60 + seconds) * 1000;

  //     const nextLine = lyricRows[index + 1];
  //     let end = start + 3500;

  //     if (nextLine) {
  //       const nextMatch = nextLine.match(/^\[(\d{2}):(\d{2}(?:\.\d+)?)\]/);
  //       if (nextMatch) {
  //         end = (Number(nextMatch[1]) * 60 + Number(nextMatch[2])) * 1000;
  //       }
  //     }

  //     const rawText = match[3].trim();
  //     const cleanText = rawText.replace(/<[^>]+>/g, '').trim();
  //     if (cleanText) {
  //       const words = parseWordsForLine(rawText, start, end);
  //       lines.push({
  //         text: cleanText,
  //         start,
  //         end,
  //         words,
  //       });
  //     }
  //   });

  //   // Fallback: If song.lyrics exists but has no [mm:ss] timestamp tags
  //   if (lines.length === 0 && lyricRows.length > 0) {
  //     const totalDurSec = parseDurationToSeconds(song.duration) || 180;
  //     const durationMs = totalDurSec * 1000;
  //     const rowDuration = Math.max(durationMs / lyricRows.length, 3000);

  //     lyricRows.forEach((rowText: string, idx: number) => {
  //       const start = idx * rowDuration;
  //       const end = start + rowDuration;
  //       const cleanText = rowText.trim();
  //       if (cleanText) {
  //         const words = parseWordsForLine(cleanText, start, end);
  //         lines.push({
  //           text: cleanText,
  //           start,
  //           end,
  //           words,
  //         });
  //       }
  //     });
  //   }

  //   lyricsLinesRef.current = lines;
  //   setLyricsLines(lines);
  //   setActiveLyricIndex(0);
  // };



  const prepareLyrics = async (song: any) => {
    console.log(song, "kkkkkkkkk")
    try {
      const timestamps: LyricTimestamp[] = Array.isArray(
        song?.lyrics_timestamps
      )
        ? song.lyrics_timestamps
        : [];

      if (timestamps.length > 0) {
        const grouped = new Map<number, LyricTimestamp[]>();

        await timestamps.forEach(item => {
          if (
            typeof item.word !== 'string' ||
            !Number.isFinite(Number(item.start)) ||
            !Number.isFinite(Number(item.end)) ||
            !Number.isFinite(Number(item.lineIndex))
          ) {
            return;
          }

          const lineIndex = Number(item.lineIndex);
          const words = grouped.get(lineIndex) ?? [];

          words.push({
            ...item,
            start: Number(item.start),
            end: Number(item.end),
            lineIndex,
            wordIndex: Number(item.wordIndex ?? 0),
          });

          grouped.set(lineIndex, words);
        });

        const parsedLines: LyricLine[] = Array.from(grouped.entries())
          .sort(([a], [b]) => a - b)
          .map(([, words]) => {
            words.sort((a, b) => a.wordIndex - b.wordIndex);

            const lyricWords: LyricWord[] = words.map(item => ({
              text: item.word,
              start: item.start,
              end: item.end,
            }));

            return {
              text: lyricWords.map(word => word.text).join(' '),
              start: Math.min(...lyricWords.map(word => word.start)),
              end: Math.max(...lyricWords.map(word => word.end)),
              words: lyricWords,
            };
          })
          .filter(line => line.words.length > 0);

        lyricsLinesRef.current = parsedLines;
        setLyricsLines(parsedLines);
        setActiveLyricIndex(0);

        console.log('Parsed timestamped lyrics:', parsedLines.length);

        return;
      }
      else {
        // Fallback if this song has no word timestamps.
        lyricsLinesRef.current = [];
        setLyricsLines([]);
        setActiveLyricIndex(0);

        console.log('No lyrics_timestamps available for song:', song?.id);
      }


    } catch (error) {
      console.error('Error preparing lyrics:', error);

      lyricsLinesRef.current = [];
      setLyricsLines([]);
      setActiveLyricIndex(0);
    }
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
    if (!songid) {
      console.log('getSongDetail: No song id provided, fetching random song');
      getrendomsong();
      return;
    }

    try {
      setScreenLoading(true);
      const response = await ApiService.get(apiUrls.singlesongdetail(songid));
      console.log(response, 'kkkknnnnmmsssss');
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
        } else {
          try {
            await TrackPlayer.play();
          } catch (e) { }
        }
        dispatch(addsong(song));
        getSongadjacent(song.id);
        try {
          navigation.setParams({ id: song.id });
        } catch (e) { }
      } else {
        await getrecDetail(songid);
      }
    } catch (error: any) {
      try {
        await getrecDetail(songid);
      } catch (recErr) {
        getrendomsong();
      }
    } finally {
      setScreenLoading(false);
    }
  };

  const getrecDetail = async (songid: any) => {
    if (!songid) {
      getrendomsong();
      return;
    }

    try {
      setScreenLoading(true);
      const response = await ApiService.get(apiUrls.singlerecdetail(songid));
      if ((response as any).data?.success) {
        const song = (response as any).data.recording;
        console.log(song, 'llll');
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
        } else {
          try {
            await TrackPlayer.play();
          } catch (e) { }
        }
        setAdjectprevdata(null);
        setAdjectnextvdata(null);
        adjectNextRef.current = null;
        adjectPrevRef.current = null;
        dispatch(addsong(song));
      } else {
        getrendomsong();
      }
    } catch (error: any) {
      console.log('getrecDetail error:', error);
      getrendomsong();
    } finally {
      setScreenLoading(false);
    }
  };

  const getrendomsong = async () => {
    try {
      setScreenLoading(true);

      const response = await ApiService.get(apiUrls.randomsong);

      if ((response as any).data?.success) {
        const rawSongs = (response as any).data?.songs;
        let song =
          Array.isArray(rawSongs) && rawSongs.length > 0
            ? rawSongs[0]
            : (response as any).data?.song;

        if (!song?.id) {
          console.log('No random song found in response');
          dispatch(
            showToast({
              visible: true,
              message: 'No songs available right now.',
              type: 'error',
            }),
          );
          return;
        }

        // Fetch full song details if lyrics timestamps or audio links are missing
        if (!song.lyrics_timestamps || (!song.original_song && !song.file_path)) {
          try {
            const detailRes = await ApiService.get(
              apiUrls.singlesongdetail(song.id),
            );
            if ((detailRes as any).data?.success && (detailRes as any).data?.song) {
              song = (detailRes as any).data.song;
            }
          } catch (detailErr) {
            console.log('Notice: Could not fetch detail for random song, using base object');
          }
        }

        // Update current song
        setSongDetail(song);
        prepareLyrics(song);

        // Reset playback UI
        setCurrentPosition(0);
        currentPositionRef.current = 0;
        setActiveLyricIndex(0);
        setAudioMode('vocal');

        // Play random song
        await playSongItem(song);

        // Update Redux player state
        dispatch(addsong(song));

        // Get previous and next adjacent songs
        await getSongadjacent(song.id);
        try {
          navigation.setParams({ id: song.id });
        } catch (e) { }

        console.log('Random song loaded:', song.id);
      } else {
        dispatch(
          showToast({
            visible: true,
            message: 'Unable to load random song.',
            type: 'error',
          }),
        );
      }
    } catch (error: any) {
      console.log('Random song error:', error);
      dispatch(
        showToast({
          visible: true,
          message: error?.message || 'Failed to load random song.',
          type: 'error',
        }),
      );
    } finally {
      setScreenLoading(false);
    }
  };

  const getSongadjacent = async (songid: any) => {
    if (!songid) return;

    try {
      const response = await ApiService.get(apiUrls.adjacentsong(songid));

      if ((response as any).data?.success) {
        const data = (response as any).data;

        const previousSong = data.previousSong || null;
        const nextSong = data.nextSong || null;

        setAdjectprevdata(previousSong);
        setAdjectnextvdata(nextSong);

        adjectNextRef.current = nextSong;
        adjectPrevRef.current = previousSong;

        if (nextSong?.id) {
          await prefetchNextSongForQueue(songid);
        }
      } else {
        setAdjectprevdata(null);
        setAdjectnextvdata(null);
        adjectNextRef.current = null;
        adjectPrevRef.current = null;
      }
    } catch (error) {
      console.log('Adjacent song error:', error);
      setAdjectprevdata(null);
      setAdjectnextvdata(null);
      adjectNextRef.current = null;
      adjectPrevRef.current = null;
    }
  };

  const handlePlayPause = async () => {
    if (isBuffering) return;
    try {
      if (isPlayingActive) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (e) {
      console.log('Play/pause error:', e);
    }
  };

  const handlePreviousTrack = async () => {
    if (isBuffering || isAutoNextingRef.current) return;

    try {
      isAutoNextingRef.current = true;

      // 1. If playing for more than 3 seconds, restart current track from beginning
      if (currentPositionRef.current > 3 || currentPosition > 3) {
        await TrackPlayer.seekTo(0);
        setCurrentPosition(0);
        currentPositionRef.current = 0;
        setActiveLyricIndex(0);
        await TrackPlayer.play();
        return;
      }

      // 2. Shuffle enabled: load a random song
      if (isShuffleRef.current) {
        await getrendomsong();
        return;
      }

      // 3. Playlist queue has previous song
      const q = playlistQueueRef.current;
      const qIndex = playlistIndexRef.current;
      if (Array.isArray(q) && q.length > 1 && qIndex > 0) {
        await skipToPreviousTrack(dispatch);
        return;
      }

      // 4. Play previous adjacent song if available
      if (adjectprevdata?.id) {
        await getSongDetail(adjectprevdata.id);
        return;
      }

      // 5. Playlist queue fallback
      if (Array.isArray(q) && q.length > 1) {
        await skipToPreviousTrack(dispatch);
        return;
      }

      // 6. When no previous song gets: load a random song
      console.log('No previous song available, fetching random song...');
      await getrendomsong();
    } catch (error) {
      console.log('Previous track error:', error);
      await getrendomsong();
    } finally {
      setTimeout(() => {
        isAutoNextingRef.current = false;
      }, 800);
    }
  };

  const handleNextTrack = async () => {
    if (isBuffering || isAutoNextingRef.current) return;

    try {
      isAutoNextingRef.current = true;

      // 1. Shuffle enabled: load a random song
      if (isShuffleRef.current) {
        await getrendomsong();
        return;
      }

      // 2. Playlist queue has next song
      const q = playlistQueueRef.current;
      const qIndex = playlistIndexRef.current;
      if (Array.isArray(q) && q.length > 1 && qIndex < q.length - 1) {
        await skipToNextTrack(dispatch);
        return;
      }

      // 3. Playlist queue at end and repeat mode is 'all'
      if (Array.isArray(q) && q.length > 1 && repeatModeRef.current === 'all') {
        await skipToNextTrack(dispatch);
        return;
      }

      // 4. Play next adjacent song if available
      if (adjectnextdata?.id) {
        await getSongDetail(adjectnextdata.id);
        return;
      }

      // 5. Playlist queue fallback
      if (Array.isArray(q) && q.length > 1) {
        await skipToNextTrack(dispatch);
        return;
      }

      // 6. When no next song gets: load a random song
      console.log('No next song available, fetching random song...');
      await getrendomsong();
    } catch (error) {
      console.log('Next track error:', error);
      await getrendomsong();
    } finally {
      setTimeout(() => {
        isAutoNextingRef.current = false;
      }, 800);
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

  const nextLyricLine =
    lyricsLines.length > 0 &&
      activeLyricIndex >= 0 &&
      activeLyricIndex + 1 < lyricsLines.length
      ? lyricsLines[activeLyricIndex + 1].text
      : '';

  const artworkSize = Math.min(SCREEN_WIDTH * 0.58, 230);

  const handleBack = () => {
    if (previousScreen) {
      navigation.navigate(previousScreen);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#14131A', '#0D0D11', '#08080B']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.headerLeftBtn}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18l-6-6 6-6"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <AppText
              color="#FFFFFF"
              fontSize={15}
              fontWeight="500"
              fontFamily={Inter.medium}
              style={{ marginLeft: 4 }}
            >
              {previousScreen || 'Library'}
            </AppText>
          </TouchableOpacity>

          <AppText
            color="#FFFFFF"
            fontSize={15}
            fontWeight="600"
            fontFamily={Inter.semibold}
          >
            Now playing
          </AppText>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => dispatch(openSongAction(songdetail))}
            style={styles.headerRightBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Circle cx="5" cy="12" r="2" fill="#FFFFFF" />
              <Circle cx="12" cy="12" r="2" fill="#FFFFFF" />
              <Circle cx="19" cy="12" r="2" fill="#FFFFFF" />
            </Svg>
          </TouchableOpacity>
        </View>

        {screenLoading ? (
          <AudioRecSkeleton />
        ) : (
          <View style={styles.mainLayout}>
            {!showFullLyrics ? (
              <View style={styles.contentArea}>
                {/* Artwork */}
                <View style={styles.artworkContainer}>
                  <View style={styles.artworkWrapper}>
                    <AppImage
                      source={GlobalImage(
                        songdetail?.cover_image_url || songdetail?.album_picture_url,
                      )}
                      width={artworkSize}
                      height={artworkSize}
                      style={styles.artworkImage}
                    />
                  </View>
                </View>

                {/* Song Meta Title & Artist */}
                <View style={styles.titleContainer}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowFullLyrics(true)}
                  >
                    <AppText
                      color="#FFFFFF"
                      fontSize={18}
                      fontWeight="700"
                      fontFamily={Inter.bold}
                      textAlign="center"
                      numberOfLines={1}
                      style={styles.songTitle}
                    >
                      {songdetail?.title || 'Song Title'}
                    </AppText>
                  </TouchableOpacity>

                  <AppText
                    color="rgba(255, 255, 255, 0.55)"
                    fontSize={14}
                    fontWeight="500"
                    fontFamily={Inter.medium}
                    textAlign="center"
                    numberOfLines={1}
                    style={styles.artistName}
                  >
                    {songdetail?.artist || songdetail?.album_name || ''}
                  </AppText>
                </View>

                {/* Lyric Preview Card */}
                <View style={styles.lyricCard}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setShowFullLyrics(true)}
                    style={styles.lyricCardContent}
                  >
                    {activeLyricLine &&
                      activeLyricLine.words &&
                      activeLyricLine.words.length > 0 ? (
                      <AppText
                        textAlign="center"
                        numberOfLines={2}
                        style={[
                          styles.primaryLyricText,
                          {
                            fontSize: 19 * textSizeMultiplier,
                            lineHeight: 26 * textSizeMultiplier,
                          },
                        ]}
                      >
                        {activeLyricLine.words.map((word, wIdx) => {
                          const currentPosMs = currentPosition * 1000;
                          const isCurrent =
                            currentPosMs >= word.start &&
                            currentPosMs < word.end;
                          const isPast = currentPosMs >= word.end;

                          const wordColor = isCurrent
                            ? '#FF6B35'
                            : isPast
                              ? '#FFFFFF'
                              : 'rgba(255, 255, 255, 0.35)';

                          return (
                            <AppText
                              key={wIdx}
                              color={wordColor}
                              fontSize={
                                (isCurrent ? 20 : 19) * textSizeMultiplier
                              }
                              fontWeight={isCurrent ? '800' : '700'}
                              fontFamily={Inter.bold}
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
                        fontSize={19 * textSizeMultiplier}
                        lineHeight={26 * textSizeMultiplier}
                        fontWeight="700"
                        fontFamily={Inter.bold}
                        textAlign="center"
                        numberOfLines={2}
                        style={styles.primaryLyricText}
                      >
                        {currentLyricLine}
                      </AppText>
                    )}

                    <AppText
                      color="rgba(255, 255, 255, 0.45)"
                      fontSize={15 * textSizeMultiplier}
                      fontWeight="500"
                      fontFamily={Inter.medium}
                      textAlign="center"
                      numberOfLines={1}
                      style={styles.secondaryLyricText}
                    >
                      {nextLyricLine ||
                        (activeLyricLine ? '' : songdetail?.artist || '')}
                    </AppText>
                  </TouchableOpacity>

                  {/* Card Pill Buttons */}
                  <View style={styles.cardPillsRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowFullLyrics(true)}
                      style={styles.cardPillBtn}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Path
                          d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                      <AppText
                        color="#FFFFFF"
                        fontSize={12}
                        fontWeight="600"
                        fontFamily={Inter.semibold}
                      >
                        Full lyrics
                      </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={cycleTextSize}
                      style={styles.cardPillBtn}
                    >
                      <AppText
                        color="#FFFFFF"
                        fontSize={12}
                        fontWeight="800"
                        fontFamily={Inter.bold}
                      >
                        AA
                      </AppText>
                      <AppText
                        color="#FFFFFF"
                        fontSize={12}
                        fontWeight="600"
                        fontFamily={Inter.semibold}
                      >
                        Text size
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              /* Full Lyrics View */
              <View style={styles.fullLyricsContainer}>
                <View style={styles.lyricsModeHeader}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowFullLyrics(false)}
                    style={styles.lyricsBackBtn}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M15 18l-6-6 6-6"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <AppText
                      color="#FFFFFF"
                      fontSize={14}
                      fontWeight="600"
                      fontFamily={Inter.semibold}
                      style={{ marginLeft: 4 }}
                    >
                      Now playing
                    </AppText>
                  </TouchableOpacity>

                  <AppText
                    color="rgba(255,255,255,0.7)"
                    fontSize={13}
                    fontWeight="700"
                    fontFamily={Inter.bold}
                    style={{ letterSpacing: 1 }}
                  >
                    LYRICS
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={cycleTextSize}
                    style={styles.cardPillBtn}
                  >
                    <AppText
                      color="#FFFFFF"
                      fontSize={11}
                      fontWeight="800"
                      fontFamily={Inter.bold}
                    >
                      AA
                    </AppText>
                  </TouchableOpacity>
                </View>

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
                            fontSize={(isActive ? 24 : 20) * textSizeMultiplier}
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
                                  ? '#FF6B35'
                                  : isPast
                                    ? '#FFFFFF'
                                    : 'rgba(255, 255, 255, 0.35)';

                                return (
                                  <AppText
                                    key={wIdx}
                                    color={wordColor}
                                    fontSize={
                                      (isCurrent ? 26 : 24) * textSizeMultiplier
                                    }
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
                                fontSize={20 * textSizeMultiplier}
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
                      {type === 'recordings'
                        ? 'Lyrics are not available for the recorded song.'
                        : 'Lyrics not available for this song.'}
                    </AppText>
                  </View>
                )}
              </View>
            )}

            {/* Bottom Controls Section: Scrubber + Controls + Sing CTA */}
            <View style={styles.bottomSection}>
              {/* Scrubber Slider */}
              <View style={styles.scrubberContainer}>
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
                  <LinearGradient
                    colors={['#FF6239', '#AF35EB']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[
                      styles.scrubberFillGradient,
                      { width: `${currentPercent}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.scrubberKnob,
                      {
                        left: `${currentPercent}%`,
                        transform: [{ translateX: -5 }],
                      },
                    ]}
                  />
                </View>

                <View style={styles.timeRow}>
                  <AppText
                    color="rgba(255, 255, 255, 0.5)"
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
                    color="rgba(255, 255, 255, 0.5)"
                    fontSize={11}
                    fontFamily={Inter.regular}
                  >
                    {formatSecs(effectiveDuration)}
                  </AppText>
                </View>
              </View>

              {/* Playback Controls Row */}
              <View style={styles.controlsRow}>
                {/* 🔀 Shuffle */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={toggleShuffle}
                  style={styles.featureBtn}
                >
                  <AppText
                    color={
                      isShuffle ? '#FF6239' : 'rgba(255, 255, 255, 0.35)'
                    }
                    fontSize={17}
                    fontWeight="700"
                    fontFamily={Inter.bold}
                  >
                    ⇄
                  </AppText>
                </TouchableOpacity>

                {/* Previous */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={handlePreviousTrack}
                  style={styles.navBtn}
                >
                  <Svg width={36} height={36} viewBox="0 0 24 24" fill="#FFFFFF">
                    <Path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </Svg>
                </TouchableOpacity>

                {/* Hero Play / Pause */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.heroPlayButton}
                  onPress={handlePlayPause}
                >
                  {isBuffering ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : isPlayingActive ? (
                    <View style={styles.pauseContainer}>
                      <View style={styles.pauseBar} />
                      <View style={styles.pauseBar} />
                    </View>
                  ) : (
                    // <Svg
                    //   width={28}
                    //   height={28}
                    //   viewBox="0 0 24 24"
                    //   fill="#FFFFFF"
                    //   style={{ marginLeft: 3 }}
                    // >
                    //   <Path d="M8 5v14l11-7z" />
                    // </Svg>
                    <AppImage
                      source={Images.playicon}
                      height={28}
                      width={28}

                    />
                  )}
                </TouchableOpacity>

                {/* Next */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={handleNextTrack}
                  style={styles.navBtn}
                >
                  <Svg width={36} height={36} viewBox="0 0 24 24" fill="#FFFFFF">
                    <Path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
                  </Svg>
                </TouchableOpacity>

                {/* 🔁 Repeat */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={toggleRepeatMode}
                  style={styles.featureBtn}
                >
                  <AppText
                    color={
                      repeatMode !== 'off'
                        ? '#FF6239'
                        : 'rgba(255, 255, 255, 0.35)'
                    }
                    fontSize={17}
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
              </View>

              {/* Sing This Song CTA Button */}
              <View style={[styles.ctaWrapper, { paddingBottom: Platform.OS == 'ios' ? Math.max(insets.bottom - 30) : Math.max(insets.bottom, 12) }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={screenLoading || type === 'recordings'}
                  onPress={() => {
                    if (type !== 'recordings') {
                      navigation.navigate('Recording', {
                        prevScreen: '.',
                        data: songdetail,
                      });
                    }
                  }}
                  style={[
                    styles.ctaTouch,
                    (screenLoading || type === 'recordings') && {
                      opacity: 0.6,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#FF5E36', '#A334E9']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.ctaGradient}
                  >
                    <View style={styles.ctaMicBadge}>
                      {/* <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                          fill="#FFFFFF"
                        />
                        <Path
                          d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg> */}
                      <AppImage
                        source={Images.mics}
                        height={22}
                        width={22}
                        tintColor={"#FFFFFF"}
                        resizeMode="contain"
                      />
                      <AppText
                        color="#FFFFFF"
                        fontSize={16}
                        fontWeight="700"
                        fontFamily={Inter.bold}
                        style={{ marginLeft: 8 }}
                      >
                        Sing this song
                      </AppText>
                    </View>

                  </LinearGradient>
                </TouchableOpacity>

                <AppText
                  color="rgba(255, 255, 255, 0.45)"
                  fontSize={11}
                  fontFamily={Inter.regular}
                  textAlign="center"
                  style={{ marginTop: 8 }}
                >
                  Prepare instrumental and lyrics
                </AppText>
              </View>
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
    backgroundColor: '#0D0D11',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 4 : 10,
    paddingBottom: 8,
  },
  headerLeftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 10,
  },
  headerRightBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainLayout: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  artworkWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#1E1E26',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  artworkImage: {
    borderRadius: 22,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 28,
    marginBottom: 12,
  },
  songTitle: {
    letterSpacing: -0.2,
  },
  artistName: {
    letterSpacing: -0.1,
    marginTop: 4,
  },
  lyricCard: {
    backgroundColor: '#17171F',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginHorizontal: 22,
    marginBottom: 6,
  },
  lyricCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  primaryLyricText: {
    letterSpacing: -0.2,
  },
  secondaryLyricText: {
    marginTop: 6,
    letterSpacing: -0.1,
  },
  cardPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  cardPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25252E',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  // Full Lyrics Mode
  fullLyricsContainer: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  lyricsModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  lyricsBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullLyricsScroll: {
    paddingTop: 16,
    paddingBottom: 28,
  },
  fullLyricItem: {
    paddingVertical: 10,
  },
  fullLyricItemActive: {
    paddingVertical: 14,
  },
  fullLyricText: {
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  activeWordHighlight: {
    color: '#FF6239',
    textShadowColor: 'rgba(255, 98, 57, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom Section
  bottomSection: {
    paddingTop: 2,
  },
  scrubberContainer: {
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 4,
  },
  scrubberHitArea: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  scrubberBg: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  scrubberFillGradient: {
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    left: 0,
  },
  scrubberKnob: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AF35EB',
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#AF35EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    marginVertical: 8,
  },
  featureBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  repeatBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5E36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtn: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlayButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#24232C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  pauseContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  pauseBar: {
    width: 5.5,
    height: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  ctaWrapper: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  ctaTouch: {
    borderRadius: 27,
    overflow: 'hidden',
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    width: SCREEN_WIDTH - 25,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  ctaGradient: {
    height: 52,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    //  paddingHorizontal: 20,
    width: SCREEN_WIDTH - 20,
  },
  ctaMicBadge: {
    width: '100%',
    height: 52,
    borderRadius: 13,
    // backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
  },
});