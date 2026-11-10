import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
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
  Dimensions,
} from 'react-native';
import { useAppColors } from '../share/constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppImage from '../share/components/AppImage';
import { Banner, BottomIcons, Images, Logo } from '../share/constants/media';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Sound from 'react-native-nitro-sound';
import { requestMicPermission } from '../share/utils/requestMicPermission';
import { useTranslation } from 'react-i18next';
import apiUrls, { BASE_URL } from '../services/apiUrls';
import ApiService from '../services/api';
import { openSongAction, setHideMiniPlayer, showToast } from '../auth/redux/authSlice';
import { useAppDispatch } from '../share/hooks/useAppSelector';
import TrackPlayer from '@rntp/player';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useIsHeadphonesConnected, DeviceInfo } from 'react-native-device-info';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Word & Lyric Line Types ──────────────────────────────────────────────────

interface LyricTimestamp {
  word: string;
  start: number;
  end: number;
  lineIndex: number;
  wordIndex: number;
}
type WordStamp = {
  word: string;
  start: number;
  end: number;
  wordIndex?: number;
};

type LyricLine = {
  lineIndex?: number;
  text: string;
  start: number;
  end: number;
  words: WordStamp[];
};
// ─── Animated waveform bar ────────────────────────────────────────────────────
const WaveBar = ({
  index,
  playing,
  color,
}: {
  index: number;
  playing: boolean;
  color: string;
}) => {
  const height = useRef(new Animated.Value(6)).current;
  const baseHeights = [8, 18, 26, 14, 22, 12, 20, 16, 10, 24, 18, 12, 22];
  const targetH = baseHeights[index % baseHeights.length];

  useEffect(() => {
    if (playing) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(height, {
            toValue: 6 + Math.random() * targetH,
            duration: 180 + (index % 5) * 40,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(height, {
            toValue: 6,
            duration: 180 + (index % 5) * 40,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      Animated.timing(height, { toValue: targetH * 0.45 + 4, duration: 200, useNativeDriver: false }).start();
    }
  }, [playing]);

  return (
    <Animated.View
      style={{
        width: 3,
        borderRadius: 2,
        backgroundColor: color,
        height,
        marginHorizontal: 1.8,
      }}
    />
  );
};

const DualWaveform = ({
  playing,
  progress = 0,
  count = 34,
}: {
  playing: boolean;
  progress?: number; // 0 to 1
  count?: number;
}) => {
  const activeCount = Math.max(1, Math.floor(count * Math.min(1, Math.max(0, progress))));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 36, justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => {
        const isPast = i <= activeCount;
        const barColor = isPast ? '#FC6027' : 'rgba(255, 255, 255, 0.22)';
        return <WaveBar key={i} index={i} playing={playing} color={barColor} />;
      })}
    </View>
  );
};

// ─── Smooth countdown overlay ─────────────────────────────────────────────────
const SmoothCountdown = React.memo(({ count }: { count: number | string }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.parallel([
      Animated.spring(anim, { toValue: 1, friction: 6, tension: 85, useNativeDriver: true }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [count]);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1.6, 1.0] });
  const opacity = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.8, 1] });
  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        opacity,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={S.countdownNumber}>{count}</Text>
    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN RECORDING SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const Recording = () => {
  const navigation = useNavigation<any>();
  const color = useAppColors();
  const { t } = useTranslation('ar');
  const dispatch = useAppDispatch();
  const route = useRoute<any>();
  const { data } = route?.params ?? {};

  // Headphone state
  const { result: headphonesConnected } = useIsHeadphonesConnected();
  const [isHeadphoneConnected, setIsHeadphoneConnected] = useState(false);
  console.log(data, "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
  // Sync headphone hook result
  useEffect(() => {
    if (typeof headphonesConnected === 'boolean') {
      setIsHeadphoneConnected(headphonesConnected);
    }
  }, [headphonesConnected]);

  useFocusEffect(
    useCallback(() => {
      const checkAudioRoute = async () => {
        try {
          const connected = await DeviceInfo.isHeadphonesConnected();
          setIsHeadphoneConnected(connected);
        } catch (_) { }
      };
      checkAudioRoute();
    }, []),
  );

  // ── State Management ───────────────────────────────────────────────────────
  const [recording, setRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [path, setPath] = useState('');
  const [recordTime, setRecordTime] = useState('00:00');
  const [recPercentage, setRecPercentage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lyricFontSize, setLyricFontSize] = useState(0); // offset: -4 to +8
  const [autoScroll, setAutoScroll] = useState(true);
  const lyricsListRef = useRef<FlatList<LyricLine>>(null);
  // Recording name for review screen
  const [recordingName, setRecordingName] = useState('');

  // Modal & Save Form State
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [status, setStatus] = useState<'private' | 'public'>('private');
  const [albumPicture, setAlbumPicture] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lyrics with per-word timestamps
  const [lyricsLines, setLyricsLines] = useState<LyricLine[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const lyricsLinesRef = useRef<LyricLine[]>([]);

  // Playback preview state (review screen)
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // Helper to format & validate audio URLs
  const getCleanAudioUrl = (url?: any): string | undefined => {
    if (!url || typeof url !== 'string') return undefined;
    const clean = url.trim();
    if (!clean || clean === 'null' || clean === 'undefined') return undefined;
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('file://')) {
      return encodeURI(clean);
    }
    const base = BASE_URL.replace(/\/$/, '');
    const p = clean.replace(/^\//, '');
    return encodeURI(`${base}/${p}`);
  };

  // Song info
  const rawInstrumental =
    (typeof data?.instrumental_song === 'string' && data.instrumental_song.trim() !== 'null' && data.instrumental_song.trim() !== 'undefined' && data.instrumental_song.trim()) ||
    (typeof data?.instrumental_wav === 'string' && data.instrumental_wav.trim() !== 'null' && data.instrumental_wav.trim() !== 'undefined' && data.instrumental_wav.trim()) ||
    (typeof data?.instrumental === 'string' && data.instrumental.trim() !== 'null' && data.instrumental.trim() !== 'undefined' && data.instrumental.trim()) ||
    (typeof data?.instrumental_url === 'string' && data.instrumental_url.trim() !== 'null' && data.instrumental_url.trim() !== 'undefined' && data.instrumental_url.trim()) ||
    (typeof data?.karaoke_song === 'string' && data.karaoke_song.trim() !== 'null' && data.karaoke_song.trim() !== 'undefined' && data.karaoke_song.trim()) ||
    (typeof data?.karaoke_url === 'string' && data.karaoke_url.trim() !== 'null' && data.karaoke_url.trim() !== 'undefined' && data.karaoke_url.trim()) ||
    (typeof data?.song?.instrumental_song === 'string' && data.song.instrumental_song.trim() !== 'null' && data.song.instrumental_song.trim()) ||
    (typeof data?.song?.instrumental_wav === 'string' && data.song.instrumental_wav.trim() !== 'null' && data.song.instrumental_wav.trim());

  const instrumentalUrl = getCleanAudioUrl(rawInstrumental);
  const songTitle = data?.title || 'Freestyle Recording';
  const artistName = data?.artist || 'Unknown Artist';
  const coverImage = data?.cover_image_url;

  const parseDurationToMs = (dur: any): number => {
    if (!dur) return 0;
    if (typeof dur === 'number') return dur > 10000 ? dur : dur * 1000;
    if (typeof dur === 'string') {
      if (dur.includes(':')) {
        const parts = dur.split(':').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]))
          return (parts[0] * 60 + parts[1]) * 1000;
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2]))
          return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
      }
      const n = Number(dur);
      if (!isNaN(n) && n > 0) return n > 10000 ? n : n * 1000;
    }
    return 0;
  };

  const initialDurationMs = parseDurationToMs(data?.duration || 0);

  // Player state
  const [playbackPositionMs, setPlaybackPositionMs] = useState(0);
  const [instrumentalDurationMs, setInstrumentalDurationMs] = useState(initialDurationMs);
  const [instrumentalLoading, setInstrumentalLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const lastLyricEndMs = lyricsLines.length > 0 ? lyricsLines[lyricsLines.length - 1].end : 0;
  const targetDurationMs = initialDurationMs > 0
    ? initialDurationMs
    : lastLyricEndMs > 0
      ? lastLyricEndMs + 2000
      : 0;

  // Refs
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const playbackListenerRef = useRef(false);
  const hasStartedRef = useRef(false);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const instrumentalStartedAtRef = useRef<number>(0);
  const instrumentalOffsetMsRef = useRef<number>(0);

  const isRecorded = Boolean(path) && !recording;

  const formatAudioTime = (ms: number) => {
    const total = Math.floor(Math.max(0, ms) / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ── Cleanups ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      Sound.removeRecordBackListener();
      Sound.stopRecorder().catch(() => { });
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSaved(false);
      setPath('');
      setRecPercentage(0);
      setRecordTime('00:00');
      setPlaybackPositionMs(0);
      setActiveLyricIndex(0);
      setIsPaused(false);
      isPausedRef.current = false;
      pauseStartTimeRef.current = 0;
      isPlayingRef.current = false;
      hasStartedRef.current = false;
      setRecordingName(`Take 1 – ${songTitle}`);

      return () => {
        Sound.removeRecordBackListener();
        Sound.stopRecorder().catch(() => { });
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      };
    }, [data, songTitle]),
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(setHideMiniPlayer(true));
      const stopPreviousSong = async () => {
        try {
          await TrackPlayer.stop();
          await TrackPlayer.seekTo(0);
        } catch (_) { }
      };
      stopPreviousSong();
      return () => {
        dispatch(setHideMiniPlayer(false));
      };
    }, [dispatch]),
  );

  // Sound Playback Listener
  useFocusEffect(
    useCallback(() => {
      isPlayingRef.current = false;
      hasStartedRef.current = false;
      setPlaybackPositionMs(0);
      setActiveLyricIndex(0);

      const playbackListener = (event: any) => {
        const rawPos = Number(event.currentPosition ?? event.current_position);
        const pos = !isNaN(rawPos) && rawPos > 0 ? rawPos : 0;
        const dur = Number(event.duration) || 0;

        if (dur > 0) {
          setInstrumentalDurationMs(prev => (prev !== dur ? dur : prev));
        }

        // Slight drift synchronization with native audio if drift > 600ms
        if (pos > 0 && !isPausedRef.current && isRecordingRef.current) {
          const currentElapsed = Date.now() - recordStartTimeRef.current;
          if (Math.abs(currentElapsed - pos) > 600) {
            recordStartTimeRef.current = Date.now() - pos;
          }
        }

        if (dur > 0 && pos >= dur - 100) {
          isPlayingRef.current = false;
          hasStartedRef.current = false;
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
  useEffect(() => {
    if (!autoScroll || !lyricsLines.length || activeLyricIndex < 0) {
      return;
    }

    const timer = setTimeout(() => {
      lyricsListRef.current?.scrollToIndex({
        index: activeLyricIndex,
        animated: true,
        viewPosition: 0.35,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [activeLyricIndex, autoScroll, lyricsLines.length]);
  useFocusEffect(
    useCallback(() => {
      dispatch(setHideMiniPlayer(true));
      const onBackPress = () => {
        handleBack();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation, recording]),
  );

  // ── Lyrics & Data Sync ───────────────────────────────────────────────────
  useEffect(() => {
    console.log(
      'FIRST LYRICS TIMESTAMP:',
      JSON.stringify(data?.lyrics_timestamps?.[0], null, 2)
    );

    console.log(
      'SECOND LYRICS TIMESTAMP:',
      JSON.stringify(data?.lyrics_timestamps?.[1], null, 2)
    );
    console.log(data, "kkkkkkkmmmmmmmmmmmmmmmmkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
    prepareLyrics(data);
    const newDur = parseDurationToMs(data?.duration || 0);
    setInstrumentalDurationMs(newDur);
    setRecordingName(`Take 1 – ${data?.title || 'Freestyle Recording'}`);
  }, [data, navigation]);
  const prepareLyrics = async (song: any) => {
    console.log(song, "kkkllliiiikkkkkk")
    try {
      const timestamps: LyricTimestamp[] = Array.isArray(
        song?.lyrics_timestamps
      )
        ? song.lyrics_timestamps
        : [];

      if (timestamps.length > 0) {
        const grouped = new Map<number, LyricTimestamp[]>();

        timestamps.forEach(item => {
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

            const lyricWords: WordStamp[] = words.map(item => ({
              word: item.word,
              start: item.start,
              end: item.end,
              wordIndex: item.wordIndex,
            }));

            return {
              text: lyricWords.map(word => word.word).join(' '),
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
  // const prepareLyrics = (song: any) => {
  //   if (!song) {
  //     setLyricsLines([]);
  //     lyricsLinesRef.current = [];
  //     setActiveLyricIndex(0);
  //     return;
  //   }

  //   let rawTimestamps: any =
  //     song.lyrics_timestamps ??
  //     song.lyricsTimestamps ??
  //     song.timestamps ??
  //     (Array.isArray(song.lyrics) ? song.lyrics : null);

  //   if (!rawTimestamps && typeof song.lyrics === 'string') {
  //     try {
  //       const parsed = JSON.parse(song.lyrics);
  //       if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].word || parsed[0].text)) {
  //         rawTimestamps = parsed;
  //       }
  //     } catch (_) { }
  //   }

  //   if (typeof rawTimestamps === 'string') {
  //     try { rawTimestamps = JSON.parse(rawTimestamps); } catch (_) { }
  //   }

  //   if (Array.isArray(rawTimestamps) && rawTimestamps.length > 0 && rawTimestamps[0]?.word) {
  //     const lineMap = new Map<number, { words: WordStamp[]; minStart: number; maxEnd: number }>();

  //     rawTimestamps.forEach((item: any) => {
  //       const lineIdx = Number(item.lineIndex ?? 0);
  //       const start = Number(item.start ?? 0);
  //       const end = Number(item.end ?? start + 400);
  //       const word = String(item.word ?? '');

  //       if (!lineMap.has(lineIdx)) {
  //         lineMap.set(lineIdx, { words: [], minStart: start, maxEnd: end });
  //       }
  //       const lineObj = lineMap.get(lineIdx)!;
  //       lineObj.words.push({ word, start, end, wordIndex: item.wordIndex });
  //       if (start < lineObj.minStart) lineObj.minStart = start;
  //       if (end > lineObj.maxEnd) lineObj.maxEnd = end;
  //     });

  //     const sortedLineIndices = Array.from(lineMap.keys()).sort((a, b) => a - b);
  //     const lines: LyricLine[] = sortedLineIndices.map((idx, i) => {
  //       const lineObj = lineMap.get(idx)!;
  //       lineObj.words.sort((a, b) => a.start - b.start);
  //       const nextLineIdx = sortedLineIndices[i + 1];
  //       const nextLine = nextLineIdx !== undefined ? lineMap.get(nextLineIdx) : null;
  //       const start = lineObj.minStart;
  //       const end = nextLine ? nextLine.minStart : Math.max(lineObj.maxEnd, start + 3200);
  //       const text = lineObj.words.map(w => w.word).join(' ');
  //       return { lineIndex: idx, text, start, end, words: lineObj.words };
  //     });

  //     lyricsLinesRef.current = lines;
  //     setLyricsLines(lines);
  //     setActiveLyricIndex(0);
  //     return;
  //   }

  //   if (song.lyrics && typeof song.lyrics === 'string') {
  //     const lyricRows = String(song.lyrics).split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
  //     const parsed: { text: string; start: number }[] = [];
  //     lyricRows.forEach((line: string) => {
  //       const m = line.match(/^\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]\s*(.*)$/);
  //       if (!m) return;
  //       const start = (Number(m[1]) * 60 + Number(m[2])) * 1000;
  //       const text = m[3].trim();
  //       if (text) parsed.push({ text, start });
  //     });
  //     parsed.sort((a, b) => a.start - b.start);

  //     const lines: LyricLine[] = parsed.map((item, index) => {
  //       const next = parsed[index + 1];
  //       const lineEnd = next ? next.start : item.start + 3500;
  //       const rawWords = item.text.split(/\s+/).filter(Boolean);
  //       const dur = Math.max(lineEnd - item.start, 1000);
  //       const perWord = dur / Math.max(rawWords.length, 1);
  //       const words: WordStamp[] = rawWords.map((w, wi) => ({
  //         word: w,
  //         start: item.start + Math.round(wi * perWord),
  //         end: item.start + Math.round((wi + 1) * perWord),
  //       }));
  //       return { lineIndex: index, text: item.text, start: item.start, end: lineEnd, words };
  //     });

  //     lyricsLinesRef.current = lines;
  //     setLyricsLines(lines);
  //     setActiveLyricIndex(0);
  //     return;
  //   }

  //   setLyricsLines([]);
  //   lyricsLinesRef.current = [];
  //   setActiveLyricIndex(0);
  // };

  // ── Active Lyric Index Tracking (Always syncs with playbackPositionMs) ─────
  useEffect(() => {
    const lines = lyricsLinesRef.current;
    if (!lines.length) return;

    let index = -1;
    for (let i = 0; i < lines.length; i++) {
      if (playbackPositionMs >= lines[i].start && playbackPositionMs < lines[i].end) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      for (let i = lines.length - 1; i >= 0; i--) {
        if (playbackPositionMs >= lines[i].start) { index = i; break; }
      }
    }
    if (index === -1 && playbackPositionMs < lines[0].start) index = 0;

    if (index !== -1 && index !== activeLyricIndex) {
      setActiveLyricIndex(index);
    }
  }, [playbackPositionMs, activeLyricIndex]);

  // ── Pause / Resume Recording ───────────────────────────────────────────────
  const pauseRecording = async () => {
    try {
      await Sound.pauseRecorder();
      if (isPlayingRef.current) await Sound.pausePlayer().catch(() => { });
      pauseStartTimeRef.current = Date.now();
      isPausedRef.current = true;
      setIsPaused(true);
    } catch (e) {
      console.log('pauseRecorder error:', e);
    }
  };

  const resumeRecording = async () => {
    try {
      await Sound.resumeRecorder();
      if (instrumentalUrl && hasStartedRef.current) {
        await Sound.resumePlayer().catch(() => { });
        isPlayingRef.current = true;
      }
      if (pauseStartTimeRef.current > 0) {
        recordStartTimeRef.current += Date.now() - pauseStartTimeRef.current;
        pauseStartTimeRef.current = 0;
      }
      isPausedRef.current = false;
      setIsPaused(false);
    } catch (e) {
      console.log('resumeRecorder error:', e);
    }
  };

  const togglePauseRecording = async () => {
    if (isPausedRef.current) await resumeRecording();
    else await pauseRecording();
  };

  // ── Start Recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      await requestMicPermission();

      try { await Sound.stopRecorder(); Sound.removeRecordBackListener(); } catch (_) { }
      try { await Sound.stopPlayer(); } catch (_) { }
      try { await TrackPlayer.stop(); await TrackPlayer.seekTo(0); } catch (_) { }

      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }

      setSaved(false);
      setPath('');
      setRecPercentage(0);
      setRecordTime('00:00');
      setPlaybackPositionMs(0);
      setActiveLyricIndex(0);
      setIsPaused(false);
      isPausedRef.current = false;
      pauseStartTimeRef.current = 0;
      isPlayingRef.current = false;
      hasStartedRef.current = false;
      instrumentalStartedAtRef.current = 0;
      instrumentalOffsetMsRef.current = 0;

      // Start instrumental player if available
      if (instrumentalUrl) {
        setInstrumentalLoading(true);
        try {
          await Sound.startPlayer(instrumentalUrl);
          instrumentalStartedAtRef.current = Date.now();
          isPlayingRef.current = true;
          hasStartedRef.current = true;
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

      await Sound.startRecorder();
      setRecording(true);
      isRecordingRef.current = true;

      recordStartTimeRef.current = Date.now();
      instrumentalOffsetMsRef.current = instrumentalStartedAtRef.current > 0
        ? Math.max(0, recordStartTimeRef.current - instrumentalStartedAtRef.current)
        : 0;

      let lastReportedSec = -1;

      // Smooth 50ms interval for fluid word-by-word highlight and exact timer tracking
      recordTimerRef.current = setInterval(() => {
        if (isPausedRef.current) return;

        const elapsedMs = instrumentalStartedAtRef.current > 0
          ? Date.now() - instrumentalStartedAtRef.current
          : Date.now() - recordStartTimeRef.current;
        const elapsedSec = Math.floor(elapsedMs / 1000);

        // Fluid real-time playback position drives lyrics & progress bar
        setPlaybackPositionMs(elapsedMs);

        if (elapsedSec !== lastReportedSec) {
          lastReportedSec = elapsedSec;
          const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
          const secs = String(elapsedSec % 60).padStart(2, '0');
          setRecordTime(`${mins}:${secs}`);
        }

        if (targetDurationMs > 0) {
          setRecPercentage(Math.min(100, Math.floor((elapsedMs / targetDurationMs) * 100)));
        }
      }, 50);
    } catch (e) {
      console.log('startRecording error:', e);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setRecording(false);
      isRecordingRef.current = false;
      setIsPaused(false);
      isPausedRef.current = false;
      setInstrumentalLoading(false);
    }
  };

  // ── Stop Recording ─────────────────────────────────────────────────────────
  const stopRecording = async () => {
    try {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      const result = await Sound.stopRecorder();
      Sound.removeRecordBackListener();

      if (!result || typeof result !== 'string') {
        throw new Error('No vocal recording file created.');
      }

      setPath(result);
      setRecording(false);
      isRecordingRef.current = false;
      setIsPaused(false);
      isPausedRef.current = false;
      pauseStartTimeRef.current = 0;

      if (!data || !instrumentalDurationMs) {
        setRecPercentage(100);
      }

      try {
        await Sound.stopPlayer();
        isPlayingRef.current = false;
        hasStartedRef.current = false;
      } catch (_) { }
    } catch (e) {
      console.log('stopRecording error:', e);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setRecording(false);
      isRecordingRef.current = false;
      setIsPaused(false);
      isPausedRef.current = false;
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
      setPlaybackPositionMs(0);
      setActiveLyricIndex(0);
    } catch (_) { }
  };

  const startCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(3);
    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
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

  const handleBack = useCallback(async () => {
    try {
      if (isPlayingRef.current || hasStartedRef.current) {
        await Sound.stopPlayer();
        isPlayingRef.current = false;
        hasStartedRef.current = false;
        setPlaybackPositionMs(0);
      }
      if (previewPlaying) {
        await Sound.stopPlayer().catch(() => { });
        setPreviewPlaying(false);
      }
      if (recording || isRecordingRef.current) {
        await stopRecording();
      }
    } catch (error) {
      await stopRecording().catch(() => { });
    } finally {
      navigation.navigate('Library');
    }
  }, [navigation, recording, previewPlaying]);

  // ── Audio Preview in Review Screen ─────────────────────────────────────────
  const togglePlayPreview = async () => {
    if (!path) return;
    try {
      if (previewPlaying) {
        await Sound.stopPlayer();
        setPreviewPlaying(false);
      } else {
        await Sound.startPlayer(path);
        setPreviewPlaying(true);
      }
    } catch (e) {
      console.log('Error previewing recording:', e);
      setPreviewPlaying(false);
    }
  };

  // ── Image Source Handlers ──────────────────────────────────────────────────
  const handleSelectImageSource = () => {
    Alert.alert(
      t('Upload Album Picture') || 'Upload Album Picture',
      t('Choose an image source') || 'Choose an image source',
      [
        { text: t('Camera') || 'Camera', onPress: () => openCamera() },
        { text: t('Gallery') || 'Gallery', onPress: () => openGallery() },
        { text: t('Cancel') || 'Cancel', style: 'cancel' },
      ],
    );
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8 });
      if (result.didCancel) return;
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAlbumPicture({ uri: asset.uri || '', type: asset.type || 'image/jpeg', name: asset.fileName || 'album_picture.jpg' });
      }
    } catch (_) { }
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
      if (result.didCancel) return;
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAlbumPicture({ uri: asset.uri || '', type: asset.type || 'image/jpeg', name: asset.fileName || 'camera_picture.jpg' });
      }
    } catch (_) { }
  };

  // ── Upload Recording ───────────────────────────────────────────────────────
  const generateSongId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}-SONG`;

  const uploadRecording = async () => {
    if (!path || isUploading) return;
    if (!title.trim()) { setErrorMessage('Please enter a song title'); return; }
    if (!albumName.trim()) { setErrorMessage('Please enter an album name'); return; }
    if (!albumPicture?.uri) { setErrorMessage('Please select an album picture'); return; }

    try {
      setIsUploading(true);
      const formData = new FormData();
      const songId = data?.id ? String(data.id) : data?.song_id ? String(data.song_id) : generateSongId();

      formData.append('song_id', songId);
      formData.append('status', status || 'private');
      formData.append('album_name', albumName.trim());
      formData.append('title', title.trim());
      formData.append('is_headphone', isHeadphoneConnected ? 'yes' : 'no');
      formData.append('duration', recordTime ? recordTime.slice(0, 5) : '00:00');

      formData.append('recordingFile', {
        uri: Platform.OS === 'android' ? path : path.replace('file://', ''),
        type: 'audio/mp3',
        name: 'recording.mp3',
      } as any);

      if (instrumentalUrl) {
        formData.append('instrumental_url', instrumentalUrl);
        formData.append('instrumental_offset_ms', String(instrumentalOffsetMsRef.current));
        formData.append('mix_audio', 'true');
      } else {
        formData.append('mix_audio', 'false');
      }

      formData.append('album_picture', {
        uri: Platform.OS === 'android' ? albumPicture.uri : albumPicture.uri.replace('file://', ''),
        type: albumPicture.type || 'image/jpeg',
        name: albumPicture.name || 'album_picture.jpg',
      } as any);

      const response: any = await ApiService.post(apiUrls.uploadrecording, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response?.data?.success) {
        setSaved(true);
        setSaveModalVisible(false);
        setTitle('');
        setAlbumName('');
        setAlbumPicture(null);
        if (response.data.recording_url) setPath(response.data.recording_url);
        dispatch(showToast({ visible: true, message: t('Recording saved successfully.') || 'تم حفظ التسجيل بنجاح.', type: 'success' }));
      } else {
        setErrorMessage(response?.data?.message || 'Recording upload failed.');
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Recording upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDiscardRecording = () => {
    Alert.alert(
      'Discard Recording',
      'Are you sure you want to discard this recording? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            if (previewPlaying) {
              Sound.stopPlayer().catch(() => { });
              setPreviewPlaying(false);
            }
            setPath('');
            setRecPercentage(0);
            setRecordTime('00:00');
            setPlaybackPositionMs(0);
            setSaved(false);
            setRecordingName(`Take 1 – ${songTitle}`);
          },
        },
      ],
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COMPONENT RENDERS
  // ─────────────────────────────────────────────────────────────────────────

  // Top Song Card (matches image)
  const renderSongCard = () => (
    <View style={S.songCard}>
      <View style={S.coverWrapper}>
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={S.coverImage} />
        ) : (
          <LinearGradient colors={['#29251D', '#3A2F1E']} style={S.coverPlaceholder}>
            <Text style={{ fontSize: 22, color: '#F5BD55' }}>♫</Text>
          </LinearGradient>
        )}
      </View>

      <View style={S.songInfo}>
        <Text style={S.songTitle} numberOfLines={1}>
          {songTitle}
        </Text>
        <Text style={S.songArtist} numberOfLines={1}>
          {artistName}
        </Text>

        <View style={S.badgeRow}>
          {instrumentalUrl ? (
            <View style={[S.badge, S.instrumentalBadge]}>
              <Text style={S.instrumentalBadgeIcon}>♫</Text>
              <Text style={S.instrumentalBadgeText}>Instrumental</Text>
            </View>
          ) : (
            <View style={[S.badge, S.acapellaBadge]}>
              <Text style={S.acapellaBadgeIcon}>🎙️</Text>
              <Text style={S.acapellaBadgeText}>Acapella</Text>
            </View>
          )}

          <View style={[S.badge, S.recordingBadge]}>
            <View style={S.redRecordingDot} />
            <Text style={S.recordingBadgeText}>Recording</Text>
          </View>

          {isHeadphoneConnected && (
            <View style={[S.badge, S.headphoneBadge]}>
              <Text style={{ fontSize: 9 }}>🎧</Text>
              <Text style={S.headphoneBadgeText}>Headphones</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // Word-by-word karaoke renderer (Matches exact font/color of screenshot)
  const renderKaraokeWords = (line: LyricLine, isActive: boolean) => {
    const baseFontSize = 30 + lyricFontSize;
    const inactiveFontSize = 17 + lyricFontSize;

    if (!isActive || !line.words || line.words.length === 0) {
      return (
        <Text
          style={[
            S.lyricLineTextInactive,
            { fontSize: inactiveFontSize },
          ]}
          numberOfLines={2}
        >
          {line.text}
        </Text>
      );
    }

    return (
      <Text style={[S.karaokeContainer, { fontSize: baseFontSize }]}>
        {line.words.map((w, wIdx) => {
          const isCurrent = playbackPositionMs >= w.start && playbackPositionMs < w.end;
          const isPast = playbackPositionMs >= w.end;

          // In screenshot:
          // Active word being sung: Bright Orange (#FC6027)
          // Finished words: Pure White (#FFFFFF)
          // Upcoming words in active line: White / slightly dimmed
          const wordColor = isCurrent
            ? '#FC6027'
            : isPast
              ? '#FFFFFF'
              : '#FFFFFF';

          return (
            <Text
              key={`${wIdx}-${w.start}`}
              style={[
                {
                  color: wordColor,
                  fontSize: isCurrent ? baseFontSize + 2 : baseFontSize,
                  fontWeight: isCurrent ? '900' : isPast ? '800' : '700',
                  letterSpacing: 0.2,
                },
                isCurrent && {
                  textShadowColor: 'rgba(252, 96, 39, 0.75)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                },
              ]}
            >
              {w.word}
              {wIdx < line.words.length - 1 ? ' ' : ''}
            </Text>
          );
        })}
      </Text>
    );
  };

  // Center Lyrics Section with 3 stacked lines (previous, ACTIVE, next)

  const renderLyricsSection = () => {
    if (!lyricsLines.length) {
      return (
        <View style={S.emptyLyricsContainer}>
          <Text style={S.emptyLyricsIcon}>♪</Text>
          <Text style={S.emptyLyricsTitle}>
            {instrumentalUrl
              ? 'Instrumental Only'
              : 'Acapella Vocal Recording'}
          </Text>
          <Text style={S.emptyLyricsSubtitle}>
            {instrumentalUrl
              ? 'Enjoy the backing music and sing freely!'
              : 'Sing your melody with pure vocals and rhythm.'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={lyricsListRef}
        data={lyricsLines}
        extraData={playbackPositionMs}
        keyExtractor={(item, index) => `${item.start}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.fullLyricsScroll}
        initialNumToRender={15}
        windowSize={7}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            lyricsListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.35,
            });
          }, 200);
        }}
        renderItem={({ item, index }) => {
          const isActive = index === activeLyricIndex;

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const targetMs = item.start;

                setPlaybackPositionMs(targetMs);
                setActiveLyricIndex(index);

                // Keep recording timer and lyric synchronization aligned.
                if (recording && !isPausedRef.current) {
                  recordStartTimeRef.current = Date.now() - targetMs;
                }
              }}
              style={[
                S.fullLyricItem,
                isActive && S.fullLyricItemActive,
              ]}
            >
              {isActive && item.words?.length > 0 ? (
                <Text
                  style={[
                    S.karaokeContainer,
                    { fontSize: (24 + lyricFontSize) },
                  ]}
                >
                  {item.words.map((word, wordIndex) => {
                    const isCurrent =
                      playbackPositionMs >= word.start &&
                      playbackPositionMs < word.end;

                    const isPast = playbackPositionMs >= word.end;

                    return (
                      <Text
                        key={`${word.start}-${wordIndex}`}
                        style={{
                          color: isCurrent
                            ? '#FC6027'
                            : isPast
                              ? '#FFFFFF'
                              : 'rgba(255,255,255,0.35)',
                          fontSize:
                            (isCurrent ? 26 : 24) + lyricFontSize,
                          fontWeight: isCurrent
                            ? '900'
                            : isPast
                              ? '800'
                              : '600',
                          textShadowColor: isCurrent
                            ? 'rgba(252,96,39,0.75)'
                            : 'transparent',
                          textShadowRadius: isCurrent ? 8 : 0,
                        }}
                      >
                        {word.word}
                        {wordIndex < item.words.length - 1 ? ' ' : ''}
                      </Text>
                    );
                  })}
                </Text>
              ) : (
                <Text
                  style={[
                    S.lyricLineTextInactive,
                    {
                      fontSize:
                        20 + lyricFontSize,
                      color:
                        index < activeLyricIndex
                          ? 'rgba(255,255,255,0.45)'
                          : 'rgba(255,255,255,0.30)',
                    },
                  ]}
                >
                  {item.text}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    );
  };


  // Bottom Controls (Pause, Finish, Waveform, Progress)
  const renderBottomControls = () => {
    const totalMs = targetDurationMs > 0 ? targetDurationMs : parseDurationToMs(data?.duration) || 0;
    const progressRatio = totalMs > 0 ? Math.min(1, Math.max(0, playbackPositionMs / totalMs)) : 0;

    return (
      <View style={S.bottomControlsContainer}>
        {/* Time display: 00:09 / 11:02 */}
        <View style={S.timerRow}>
          <Text style={S.currentTimeText}>{formatAudioTime(playbackPositionMs)}</Text>
          <Text style={S.totalTimeText}> / {totalMs > 0 ? formatAudioTime(totalMs) : '--:--'}</Text>
        </View>

        {/* Scrubber track with orange fill and thumb */}
        <View style={S.scrubberTrackWrap}>
          <View style={S.scrubberTrackBg}>
            <View style={[S.scrubberTrackFill, { width: `${progressRatio * 100}%` }]} />
          </View>
          <View style={[S.scrubberThumb, { left: `${Math.max(0, Math.min(96, progressRatio * 100))}%` }]} />
        </View>

        {/* Dynamic Waveform */}
        <View style={{ marginVertical: 8, marginBottom: 10 }}>
          <DualWaveform playing={recording && !isPaused} progress={progressRatio} count={34} />
        </View>

        {/* Action Buttons: [ Pause ]  [ Finish ] */}
        <View style={S.buttonsRow}>
          {countdown !== null ? (
            <View style={S.countdownWrap}>
              <SmoothCountdown count={countdown} />
            </View>
          ) : recording ? (
            <>
              {/* Pause / Resume Button */}
              <TouchableOpacity
                onPress={togglePauseRecording}
                activeOpacity={0.85}
                style={S.pauseButton}
              >
                <View style={S.pauseIconBars}>
                  {isPaused ? (
                    <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>▶</Text>
                  ) : (
                    <>
                      <View style={S.pauseBar} />
                      <View style={S.pauseBar} />
                    </>
                  )}
                </View>
                <Text style={S.pauseButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
              </TouchableOpacity>

              {/* Finish Button */}
              <TouchableOpacity
                onPress={stopRecording}
                activeOpacity={0.85}
                style={S.finishButtonWrap}
              >
                <LinearGradient
                  colors={['#FF6315', '#D61A80', '#8500DC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={S.finishButtonGradient}
                >
                  <View style={S.stopSquareIcon} />
                  <Text style={S.finishButtonText}>Finish</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            /* Start Singing Button */
            <TouchableOpacity
              onPress={startCountdown}
              activeOpacity={0.85}
              style={S.finishButtonWrap}
              disabled={instrumentalLoading}
            >
              <LinearGradient
                colors={['#FF6315', '#D61A80', '#8500DC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={S.finishButtonGradient}
              >
                {instrumentalLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <AppImage source={Images.mic} height={25} width={20}
                      tintColor="#FFFFFF" resizeMode='cover' />
                    <Text style={S.finishButtonText}>Start Singing</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STATE: RECORDED — "Recording review" screen (Matches Right Image Exactly)
  // ─────────────────────────────────────────────────────────────────────────
  if (isRecorded) {
    const recordedDurationMs = parseDurationToMs(recordTime) || playbackPositionMs;
    const totalMs = targetDurationMs > 0 ? targetDurationMs : recordedDurationMs;
    const pct = totalMs > 0 ? Math.round((recordedDurationMs / totalMs) * 100) : recPercentage || 100;

    return (
      <View style={S.screenRoot}>
        <SafeAreaView style={S.safeContainer} edges={['top']}>
          {/* Header */}
          <View style={S.header}>
            <TouchableOpacity onPress={handleBack} style={S.headerIconBtn}>
              <AppImage source={Images.leftarrow} width={8} height={16} tintColor="#FFFFFF" />
            </TouchableOpacity>
            <Text style={S.headerTitle}>Recording review</Text>
            <TouchableOpacity
              onPress={() => {

                dispatch(openSongAction(data));
              }}
              style={S.headerIconBtn}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>⋮</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={R.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Stop Icon */}
            <View style={R.stopIconCircle}>
              <View style={R.stopIconInner} />
            </View>

            {/* Title & Subtitle */}
            <Text style={R.reviewTitle}>Recording stopped</Text>
            <Text style={R.reviewSubtitle}>You recorded part of this song</Text>

            {/* Compact Song Card */}
            <View style={R.songCardWrap}>
              <View style={S.coverWrapper}>
                {coverImage ? (
                  <Image source={{ uri: coverImage }} style={S.coverImage} />
                ) : (
                  <LinearGradient colors={['#29251D', '#3A2F1E']} style={S.coverPlaceholder}>
                    <Text style={{ fontSize: 22, color: '#F5BD55' }}>♫</Text>
                  </LinearGradient>
                )}
              </View>
              <View style={S.songInfo}>
                <Text style={S.songTitle} numberOfLines={1}>{songTitle}</Text>
                <Text style={S.songArtist} numberOfLines={1}>{artistName}</Text>
              </View>
            </View>

            {/* Stats Card: [ Clock 00:09 recorded ] | [ Pie 1% of song ] */}
            <View style={R.statsCard}>
              <View style={R.statItem}>
                <AppImage source={Logo.clock} height={20} width={20} tintColor="#FFFFFF" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={R.statValue}>{recordTime.slice(0, 5)}</Text>
                  <Text style={R.statLabel}>recorded</Text>
                </View>
              </View>

              <View style={R.statDivider} />

              <View style={R.statItem}>
                <View style={R.pieIconPlaceholder}>
                  <Text style={{ color: '#FFFFFF', fontSize: 16 }}>◔</Text>
                </View>
                <View style={{ marginLeft: 8 }}>
                  <Text style={R.statValue}>{pct}%</Text>
                  <Text style={R.statLabel}>of song</Text>
                </View>
              </View>
            </View>

            {/* Waveform Scrubber Card with Play Button */}
            <View style={R.waveformPlayerCard}>
              <DualWaveform playing={previewPlaying} progress={0.35} count={38} />

              <View style={R.waveTimeRow}>
                <Text style={R.waveTimeText}>00:00</Text>
                <Text style={R.waveTimeText}>{totalMs > 0 ? formatAudioTime(totalMs) : recordTime}</Text>
              </View>

              {/* Play/Pause Button */}
              <TouchableOpacity
                onPress={togglePlayPreview}
                style={R.playPreviewBtn}
                activeOpacity={0.8}
              >
                <Text style={R.playPreviewIcon}>{previewPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
            </View>

            {/* Recording Name Input */}
            <Text style={R.inputLabel}>Recording name</Text>
            <View style={R.inputBox}>
              <TextInput
                value={recordingName}
                onChangeText={setRecordingName}
                placeholderTextColor="#6E6B7B"
                style={R.textInputField}
              />
            </View>

            {/* 1. Save Recording Button (Gradient) */}
            <TouchableOpacity
              onPress={() => { setTitle(recordingName); setSaveModalVisible(true); }}
              activeOpacity={0.85}
              style={R.saveRecordingBtn}
            >
              <LinearGradient
                colors={saved ? ['#27AE60', '#2ECC71'] : ['#FF6315', '#D61A80', '#8500DC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={R.saveRecordingGradient}
              >
                <AppImage source={saved ? Logo.filltick : Images.import} height={18} width={18} tintColor="#FFFFFF" />
                <Text style={R.saveRecordingText}>
                  {saved ? 'Saved!' : 'Save recording'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 2. Sing Again Button (Dark outline) */}
            <TouchableOpacity
              onPress={startRecording}
              activeOpacity={0.85}
              style={R.singAgainBtn}
            >
              <Text style={R.singAgainIcon}>↺</Text>
              <Text style={R.singAgainText}>Sing again</Text>
            </TouchableOpacity>

            {/* 3. Discard Recording (Red text) */}
            <TouchableOpacity
              onPress={handleDiscardRecording}
              activeOpacity={0.85}
              style={R.discardBtn}
            >
              <AppImage source={Images.bstar} height={16} width={16} tintColor="#FF4B4B" style={{ display: 'none' }} />

              <AppImage source={Images.bin} height={16} width={16} tintColor="#FF4B4B" resizeMode='contain' />
              <Text style={R.discardText}>Discard recording</Text>
            </TouchableOpacity>

            {/* 4. Back to Library */}
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.8}
              style={R.backToLibraryBtn}
            >
              <Text style={R.backToLibraryIcon}>‹</Text>
              <Text style={R.backToLibraryText}>Back to Library</Text>
            </TouchableOpacity>
          </ScrollView>

          {renderSaveModal()}
        </SafeAreaView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE: NO DATA (Freestyle Studio Recording)
  // ─────────────────────────────────────────────────────────────────────────
  if (!data) {
    return (
      <View style={S.screenRoot}>
        <SafeAreaView style={S.safeContainer} edges={['top']}>
          <View style={S.header}>
            <TouchableOpacity onPress={handleBack} style={S.headerIconBtn}>
              <AppImage source={Images.leftarrow} width={8} height={16} tintColor="#FFFFFF" />
            </TouchableOpacity>
            <Text style={S.headerTitle}>{t('Studio Recording') || 'Studio Recording'}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <View style={S.noDataCard}>
              <LinearGradient colors={['#FF6315', '#D61A80', '#8500DC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 2, width: '100%' }} />
              <View style={{ padding: 22, alignItems: 'center' }}>
                <View style={S.glowCircle}>
                  <LinearGradient colors={['#8B00FF', '#E80360', '#FF6315']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.glowCircleGradient}>
                    <View style={S.glowCircleInner}>
                      <Text style={{ fontSize: 36 }}>🎙️</Text>
                    </View>
                  </LinearGradient>
                </View>
                <Text style={S.noDataTitle}>{t('Ready to Sing?') || 'Ready to Sing?'}</Text>
                <Text style={S.noDataSubtitle}>
                  {t('Choose a track from your library or start a freestyle vocal recording right now!') ||
                    'Choose a track from your library or start a freestyle vocal recording right now!'}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Library')} style={S.browseBtn} activeOpacity={0.85}>
                  <LinearGradient colors={['#5002AE', '#E80360']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.browseBtnGradient}>
                    <Text style={{ fontSize: 18 }}>🎵</Text>
                    <Text style={S.browseBtnText}>{t('Browse Library') || 'Browse Library'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={S.featureRow}>
              {[
                { icon: Images.mics, title: 'Freestyle Vocals', desc: 'Record clean vocals anytime' },
                { icon: Images.bstar, title: 'Word-Sync Lyrics', desc: 'Real-time karaoke highlights' },
                { icon: Logo.share, title: 'Save & Share', desc: 'Export and share your songs' },
              ].map(f => (
                <View key={f.title} style={S.featureCard}>
                  <AppImage source={f.icon} height={24} width={24} tintColor={color.darkthemetext} style={{ marginBottom: 6 }} resizeMode="contain" />
                  <Text style={S.featureTitle}>{f.title}</Text>
                  <Text style={S.featureDesc}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {renderBottomControls()}
          {renderSaveModal()}
        </SafeAreaView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE: MAIN RECORDING SCREEN (Matches Left Image Exactly)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={S.screenRoot}>
      <SafeAreaView style={S.safeContainer} edges={['top']}>
        {/* Header: < Singing ⋮ */}
        <View style={S.header}>
          <TouchableOpacity onPress={handleBack} style={S.headerIconBtn}>
            <AppImage source={Images.leftarrow} width={8} height={16} tintColor="#FFFFFF" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Singing</Text>
          <TouchableOpacity onPress={() => {

            dispatch(openSongAction(data));
          }}

            style={S.headerIconBtn}>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Song Info Card */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          {renderSongCard()}
        </View>

        {/* Center Lyrics Display Card */}
        <View style={S.lyricsContainerCard}>
          {renderLyricsSection()}

          {/* Auto-scroll on/off and Font Size Adjustment (A- / A+) */}
          <View style={S.lyricsControlsBar}>
            <TouchableOpacity
              onPress={() => setAutoScroll(v => !v)}
              style={S.autoScrollPill}
              activeOpacity={0.8}
            >
              <Text style={[S.autoScrollIcon, autoScroll && { color: '#FC6027' }]}>≡</Text>
              <Text style={[S.autoScrollText, autoScroll && { color: '#FC6027' }]}>
                Auto-scroll {autoScroll ? 'on' : 'off'}
              </Text>
            </TouchableOpacity>

            <View style={S.fontSizeControlsRow}>
              <TouchableOpacity
                onPress={() => setLyricFontSize(v => Math.max(-6, v - 2))}
                style={S.fontSizePill}
                activeOpacity={0.8}
              >
                <Text style={S.fontSizePillText}>A−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLyricFontSize(v => Math.min(8, v + 2))}
                style={S.fontSizePill}
                activeOpacity={0.8}
              >
                <Text style={[S.fontSizePillText, { fontSize: 15 }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Recording Controls: Timer, Scrubber, Waveform, [Pause] [Finish] */}
        {renderBottomControls()}

        {renderSaveModal()}
      </SafeAreaView>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL: SAVE RECORDING
  // ─────────────────────────────────────────────────────────────────────────
  function renderSaveModal() {
    return (
      <Modal
        visible={saveModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={M.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSaveModalVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={M.sheetContainer}>
            <LinearGradient
              colors={['#FF6315', '#D61A80', '#8500DC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 3 }}
            />

            <View style={M.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={M.headerIconWrap}>
                  <Text style={{ fontSize: 18 }}>🎵</Text>
                </View>
                <View>
                  <Text style={M.headerTitle}>{t('Save Recording') || 'Save Recording'}</Text>
                  <Text style={M.headerSubtitle}>{t('Add song details before saving') || 'Add song details before saving'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSaveModalVisible(false)} style={M.closeButton}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={M.sheetScrollContent}>
              {/* Album Picture */}
              <Text style={M.fieldLabel}>{t('Album Picture') || 'Album Picture'} *</Text>
              <TouchableOpacity onPress={handleSelectImageSource} style={M.imageTouchArea} activeOpacity={0.8}>
                {albumPicture?.uri ? (
                  <View style={M.imagePreviewContainer}>
                    <Image source={{ uri: albumPicture.uri }} style={M.imagePreview} />
                    <View style={M.changePhotoOverlay}>
                      <Text style={{ color: '#FC6027', fontSize: 10, fontWeight: '700' }}>{t('Change Photo') || 'Change Photo'} ✎</Text>
                    </View>
                  </View>
                ) : (
                  <View style={M.placeholderBox}>
                    <View style={M.uploadIconCircle}>
                      <AppImage source={Images.import} width={22} height={22} tintColor="#FC6027" />
                    </View>
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>{t('Upload Album Picture') || 'Upload Album Picture'}</Text>
                    <Text style={{ color: '#858178', fontSize: 10 }}>{t('Tap to choose from Gallery or Camera') || 'Tap to choose from Gallery or Camera'}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Song Title */}
              <Text style={[M.fieldLabel, { marginTop: 14 }]}>{t('Song Title') || 'Song Title'} *</Text>
              <View style={M.inputBox}>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('Enter title') || 'Enter title'}
                  placeholderTextColor="#6E6B7B"
                  style={M.textInput}
                />
              </View>

              {/* Album Name */}
              <Text style={[M.fieldLabel, { marginTop: 14 }]}>{t('Album Name') || 'Album Name'} *</Text>
              <View style={M.inputBox}>
                <TextInput
                  value={albumName}
                  onChangeText={setAlbumName}
                  placeholder={t('Enter album name') || 'Enter album name'}
                  placeholderTextColor="#6E6B7B"
                  style={M.textInput}
                />
              </View>

              {/* Visibility */}
              <Text style={[M.fieldLabel, { marginTop: 14 }]}>{t('Visibility') || 'Visibility'}</Text>
              <View style={M.statusPillRow}>
                {(['private', 'public'] as const).map(v => (
                  <TouchableOpacity key={v} onPress={() => setStatus(v)} style={[M.statusPill, status === v && M.statusPillActive]}>
                    <Text style={[M.statusPillText, status === v && M.statusPillTextActive]}>
                      {v === 'private' ? `🔒 ${t('Private') || 'Private'}` : `🌍 ${t('Public') || 'Public'}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Meta chips */}
              <View style={M.metaChipsRow}>
                {[
                  { label: 'DURATION', value: recordTime.slice(0, 5) },
                  { label: 'SONG ID', value: String(data?.id || data?.song_id || 'Freestyle') },
                  { label: 'STATUS', value: saved ? 'Saved' : 'Ready', color: saved ? '#27AE60' : '#FC6027' },
                ].map(chip => (
                  <View key={chip.label} style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#858178', fontSize: 9, fontWeight: '600' }}>{chip.label}</Text>
                    <Text style={{ color: chip.color || '#FFFFFF', fontSize: 12, fontWeight: '700', marginTop: 2 }}>{chip.value}</Text>
                  </View>
                ))}
              </View>

              {Boolean(errorMessage) && (
                <Text style={{ color: '#FF4B4C', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>{errorMessage}</Text>
              )}

              {/* Upload button */}
              <TouchableOpacity onPress={uploadRecording} disabled={isUploading} style={M.uploadButtonWrap} activeOpacity={0.85}>
                <LinearGradient
                  colors={saved ? ['#27AE60', '#2ECC71'] : ['#FF6315', '#D61A80', '#8500DC']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={M.uploadButtonGradient}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <AppImage source={saved ? Logo.filltick : Images.import} height={20} width={20} tintColor="#FFFFFF" />
                      <Text style={M.uploadButtonText}>
                        {saved ? t('Update & Save Again') || 'Update & Save Again' : t('Confirm & Upload Recording') || 'Confirm & Upload Recording'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — Main Recording Screen
// ─────────────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: '#0F0E13', // Clean solid dark background (no image)
  },
  safeContainer: {
    flex: 1,
  },
  fullLyricsScroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 30,
    justifyContent: 'center',
  },

  fullLyricItem: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullLyricItemActive: {
    transform: [{ scale: 1.02 }],
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Song Card Top
  songCard: {
    backgroundColor: '#1B1922',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverWrapper: {
    marginRight: 12,
  },
  coverImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  coverPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'left',
  },
  songArtist: {
    color: '#9E9AA7',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'left',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  instrumentalBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  instrumentalBadgeIcon: {
    color: '#CCCCCC',
    fontSize: 10,
  },
  instrumentalBadgeText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
  },
  acapellaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  acapellaBadgeIcon: {
    fontSize: 10,
  },
  acapellaBadgeText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
  },
  recordingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  redRecordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E82436',
  },
  recordingBadgeText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
  },
  headphoneBadge: {
    backgroundColor: 'rgba(252, 96, 39, 0.15)',
  },
  headphoneBadgeText: {
    color: '#FC6027',
    fontSize: 10,
    fontWeight: '600',
  },

  // Lyrics Container Card
  lyricsContainerCard: {
    flex: 1,
    backgroundColor: '#17151F',
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  lyricsDisplayWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  prevLineWrap: {
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.45,
  },
  activeLineWrap: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  nextLineWrap: {
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.45,
  },
  lyricLineTextInactive: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  karaokeContainer: {
    textAlign: 'center',
    lineHeight: 40,
  },
  emptyLyricsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyLyricsIcon: {
    fontSize: 40,
    color: 'rgba(252, 96, 39, 0.4)',
    marginBottom: 10,
  },
  emptyLyricsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyLyricsSubtitle: {
    color: '#858178',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Auto-scroll and Font controls bar
  lyricsControlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  autoScrollPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#221F2B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  autoScrollIcon: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '800',
  },
  autoScrollText: {
    color: '#CCCCCC',
    fontSize: 11,
    fontWeight: '600',
  },
  fontSizeControlsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizePill: {
    width: 36,
    height: 32,
    backgroundColor: '#221F2B',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizePillText: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '700',
  },

  // Bottom Controls
  bottomControlsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#0F0E13',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  currentTimeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  totalTimeText: {
    color: '#858178',
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  scrubberTrackWrap: {
    height: 10,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  scrubberTrackBg: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scrubberTrackFill: {
    height: '100%',
    backgroundColor: '#FC6027',
  },
  scrubberThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FC6027',
    top: 0,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  pauseButton: {
    flex: 1,
    height: 54,
    backgroundColor: '#201D28',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pauseIconBars: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBar: {
    width: 3.5,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  finishButtonWrap: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
  },
  finishButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stopSquareIcon: {
    width: 15,
    height: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  countdownWrap: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(80, 2, 174, 0.4)',
    borderRadius: 16,
  },
  countdownNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FC6027',
    textShadowColor: 'rgba(252, 96, 39, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    includeFontPadding: false,
  },

  // No-Data Screen
  noDataCard: {
    backgroundColor: '#1B1922',
    borderRadius: 20,
    width: '100%',
    overflow: 'hidden',
    marginTop: 10,
  },
  glowCircle: {
    marginBottom: 18,
  },
  glowCircleGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    backgroundColor: '#0F0E13',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  noDataSubtitle: {
    color: '#858178',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  browseBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
  },
  browseBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  featureRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 25,
    width: '100%',
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#17151F',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  featureDesc: {
    color: '#FF741D',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — Recording Review Screen (Matches Right Image)
// ─────────────────────────────────────────────────────────────────────────────
const R = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Stop Header
  stopIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(232, 36, 54, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(232, 36, 54, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  stopIconInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E82436',
  },
  reviewTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  reviewSubtitle: {
    color: '#9E9AA7',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },

  // Song Card
  songCardWrap: {
    backgroundColor: '#1B1922',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },

  // Stats Card
  statsCard: {
    backgroundColor: '#1B1922',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: '#858178',
    fontSize: 11,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pieIconPlaceholder: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Waveform Player Card
  waveformPlayerCard: {
    backgroundColor: '#1B1922',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  waveTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    marginBottom: 12,
  },
  waveTimeText: {
    color: '#858178',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  playPreviewBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#262330',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPreviewIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 2,
  },

  // Recording Name Field
  inputLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  inputBox: {
    width: '100%',
    height: 48,
    backgroundColor: '#1B1922',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 16,
  },
  textInputField: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },

  // 1. Save recording button
  saveRecordingBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  saveRecordingGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveRecordingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // 2. Sing again button
  singAgainBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1B1922',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  singAgainIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  singAgainText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // 3. Discard recording
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FF4B4B',
    width: '100%',
    height: 50,
    borderRadius: 14,
  },
  discardText: {
    color: '#FF4B4B',
    fontSize: 14,
    fontWeight: '600',
  },

  // 4. Back to library
  backToLibraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  backToLibraryIcon: {
    color: '#9E9AA7',
    fontSize: 20,
    fontWeight: '300',
  },
  backToLibraryText: {
    color: '#9E9AA7',
    fontSize: 14,
    fontWeight: '600',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — Save Modal
// ─────────────────────────────────────────────────────────────────────────────
const M = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#141118',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(252, 96, 39, 0.2)',
    maxHeight: '87%',
    overflow: 'hidden',
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
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(252, 96, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
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
  sheetScrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  fieldLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  imageTouchArea: {
    width: '100%',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    width: 120,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FC6027',
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
  placeholderBox: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(252, 96, 39, 0.35)',
    backgroundColor: 'rgba(252, 96, 39, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(252, 96, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 16,
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
    borderColor: '#FC6027',
    backgroundColor: 'rgba(252, 96, 39, 0.14)',
  },
  statusPillText: {
    color: '#858178',
    fontSize: 12,
    fontWeight: '600',
  },
  statusPillTextActive: {
    color: '#FC6027',
    fontWeight: '800',
  },
  metaChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 18,
    marginTop: 4,
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

export default Recording;
