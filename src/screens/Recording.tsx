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
  ImageBackground,
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
import { setHideMiniPlayer, showToast } from '../auth/redux/authSlice';
import { useAppDispatch } from '../share/hooks/useAppSelector';
import TrackPlayer from '@rntp/player';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Word & Lyric Line Types ──────────────────────────────────────────────────
type WordStamp = {
  word: string;
  start: number;
  end: number;
  wordIndex?: number;
};

type LyricLine = {
  lineIndex: number;
  text: string;
  start: number;
  end: number;
  words: WordStamp[];
};

// ─── Waveform bars for bottom recording control ───────────────────────────────
const WaveBar = ({
  index,
  playing,
  isLeft,
}: {
  index: number;
  playing: boolean;
  isLeft: boolean;
}) => {
  const height = useRef(new Animated.Value(4)).current;
  const baseHeights = [8, 16, 24, 14, 22, 12, 20, 16, 10];
  const targetH = baseHeights[index % baseHeights.length];

  useEffect(() => {
    if (playing) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(height, {
            toValue: 4 + Math.random() * targetH,
            duration: 220 + index * 50,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(height, {
            toValue: 4,
            duration: 220 + index * 50,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      Animated.timing(height, { toValue: 4, duration: 200, useNativeDriver: false }).start();
    }
  }, [playing]);

  const barColor = isLeft ? 'rgba(232, 3, 96, 0.85)' : 'rgba(245, 189, 85, 0.85)';

  return (
    <Animated.View
      style={{
        width: 3,
        borderRadius: 2,
        backgroundColor: barColor,
        height,
        marginHorizontal: 2,
      }}
    />
  );
};

const Waveform = ({ playing, side }: { playing: boolean; side: 'left' | 'right' }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', height: 38 }}>
    {Array.from({ length: 9 }).map((_, i) => (
      <WaveBar key={i} index={i} playing={playing} isLeft={side === 'left'} />
    ))}
  </View>
);

// ─── Circular progress ring for completion screen ─────────────────────────────
const CircularProgress = ({ percentage }: { percentage: number }) => {
  const size = 164;
  const strokeWidth = 10;
  const p = Math.min(100, Math.max(0, percentage));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 1. Ambient soft backlight glow */}
      <LinearGradient
        colors={['rgba(245,189,85,0.20)', 'rgba(232,3,96,0.22)', 'rgba(80,2,174,0.18)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          width: size + 24,
          height: size + 24,
          borderRadius: (size + 24) / 2,
        }}
      />

      {/* 2. Outer track border ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      />

      {/* 3. Outer gradient ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          transform: [{ rotate: '-90deg' }],
        }}
      >
        <LinearGradient
          colors={['#F5BD55', '#FC5B01', '#E80360', '#8B00FF', '#5002AE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />

        {/* Center cutout to carve out the ring thickness */}
        <View
          style={{
            position: 'absolute',
            top: strokeWidth,
            left: strokeWidth,
            right: strokeWidth,
            bottom: strokeWidth,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: '#0D0A14',
          }}
        />
      </View>

      {/* 4. Inner subtle gradient disc */}
      <View
        style={{
          position: 'absolute',
          width: size - strokeWidth * 2 - 12,
          height: size - strokeWidth * 2 - 12,
          borderRadius: (size - strokeWidth * 2 - 12) / 2,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(245,189,85,0.22)',
        }}
      >
        <LinearGradient
          colors={['rgba(245,189,85,0.12)', 'rgba(232,3,96,0.08)', 'rgba(80,2,174,0.25)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </View>

      {/* 5. Center completion metrics (no padding) */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 34,
            fontWeight: '900',
            letterSpacing: -0.5,
            textShadowColor: 'rgba(245,189,85,0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 10,
          }}
        >
          {p}%
        </Text>

        <Text
          style={{
            color: '#D4C7E8',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.8,
            marginTop: 2,
            textTransform: 'uppercase',
          }}
        >
          Song Completion
        </Text>

        <Text style={{ fontSize: 20, marginTop: 4 }}>👑</Text>
      </View>
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

// ─── Animated pulse ring for pause button ─────────────────────────────────────
const PulseRing = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.55, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 600, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 2,
        borderColor: '#E80360',
        transform: [{ scale }],
        opacity,
        zIndex: 0,
      }}
    />
  );
};

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

  const scrollViewRef = useRef<ScrollView>(null);

  // ── State Management ───────────────────────────────────────────────────────
  const [recording, setRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [path, setPath] = useState('');
  const [recordTime, setRecordTime] = useState('00:00');
  const [recPercentage, setRecPercentage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showFullLyrics, setShowFullLyrics] = useState(false);

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
  const lyricsListRef = useRef<FlatList>(null);
  const lyricsLinesRef = useRef<LyricLine[]>([]);
  const lyricsCardRef = useRef<View>(null);

  // Helper to format & validate audio URLs (handles relative paths, "null" strings, and encoded spaces)
  const getCleanAudioUrl = (url?: any): string | undefined => {
    if (!url || typeof url !== 'string') return undefined;
    const clean = url.trim();
    if (!clean || clean === 'null' || clean === 'undefined') return undefined;
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('file://')) {
      return encodeURI(clean);
    }
    const base = BASE_URL.replace(/\/$/, '');
    const path = clean.replace(/^\//, '');
    return encodeURI(`${base}/${path}`);
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

  // Helper to parse duration string (e.g. "04:18", 258, etc.) to milliseconds
  const parseDurationToMs = (dur: any): number => {
    if (!dur) return 0;
    if (typeof dur === 'number') {
      return dur > 10000 ? dur : dur * 1000;
    }
    if (typeof dur === 'string') {
      if (dur.includes(':')) {
        const parts = dur.split(':').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return (parts[0] * 60 + parts[1]) * 1000;
        }
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
        }
      }
      const n = Number(dur);
      if (!isNaN(n) && n > 0) {
        return n > 10000 ? n : n * 1000;
      }
    }
    return 0;
  };

  const initialDurationMs = parseDurationToMs(data?.duration || 0);

  // Player state
  const [instrumentalPlaying, setInstrumentalPlaying] = useState(false);
  const [playbackPositionMs, setPlaybackPositionMs] = useState(0);
  const [instrumentalDurationMs, setInstrumentalDurationMs] = useState(initialDurationMs);
  const [instrumentalLoading, setInstrumentalLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Dynamic target duration: uses instrumental length, song duration, or last lyric timestamp
  const lastLyricEndMs =
    lyricsLines.length > 0 ? lyricsLines[lyricsLines.length - 1].end : 0;

  const targetDurationMs =
    initialDurationMs > 0
      ? initialDurationMs
      : initialDurationMs > 0
        ? initialDurationMs
        : lastLyricEndMs > 0
          ? lastLyricEndMs + 2000
          : 0;

  // Refs
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const playbackListenerRef = useRef(false);
  const isStartingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);

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
      isStartingRef.current = false;
      setInstrumentalPlaying(false);

      return () => {
        Sound.removeRecordBackListener();
        Sound.stopRecorder().catch(() => { });
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      };
    }, [data]),
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

  useFocusEffect(
    useCallback(() => {
      isPlayingRef.current = false;
      hasStartedRef.current = false;
      isStartingRef.current = false;
      setInstrumentalPlaying(false);
      setPlaybackPositionMs(0);
      setActiveLyricIndex(0);

      const playbackListener = (event: any) => {
        const rawPos = Number(event.currentPosition ?? event.current_position);
        const pos = !isNaN(rawPos) && rawPos > 0 ? rawPos : 0;
        const dur = Number(event.duration) || 0;

        if (pos >= 0 && !isPausedRef.current) {
          setPlaybackPositionMs(pos);
        }

        if (dur > 0) {
          setInstrumentalDurationMs(prev => (prev !== dur ? dur : prev));
        }

        if (dur > 0 && pos >= dur - 100) {
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

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation, recording]),
  );

  // ── Lyrics Parsing (handles lyrics_timestamps array & legacy string) ───────
  useEffect(() => {
    prepareLyrics(data);
  }, [data]);

  const prepareLyrics = (song: any) => {
    if (!song) {
      setLyricsLines([]);
      lyricsLinesRef.current = [];
      setActiveLyricIndex(0);
      return;
    }

    // Check for word-level lyrics_timestamps in all variations
    let rawTimestamps: any =
      song.lyrics_timestamps ??
      song.lyricsTimestamps ??
      song.timestamps ??
      (Array.isArray(song.lyrics) ? song.lyrics : null);

    // If lyrics is stringified JSON
    if (!rawTimestamps && typeof song.lyrics === 'string') {
      try {
        const parsed = JSON.parse(song.lyrics);
        if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].word || parsed[0].text)) {
          rawTimestamps = parsed;
        }
      } catch (_) { }
    }

    if (typeof rawTimestamps === 'string') {
      try {
        rawTimestamps = JSON.parse(rawTimestamps);
      } catch (_) { }
    }

    // ── Priority 1: Exact word-level timestamps provided by API ──────────────
    if (Array.isArray(rawTimestamps) && rawTimestamps.length > 0 && rawTimestamps[0]?.word) {
      const lineMap = new Map<
        number,
        { words: WordStamp[]; minStart: number; maxEnd: number }
      >();

      rawTimestamps.forEach((item: any) => {
        const lineIdx = Number(item.lineIndex ?? 0);
        const start = Number(item.start ?? 0);
        const end = Number(item.end ?? start + 400);
        const word = String(item.word ?? '');

        if (!lineMap.has(lineIdx)) {
          lineMap.set(lineIdx, { words: [], minStart: start, maxEnd: end });
        }
        const lineObj = lineMap.get(lineIdx)!;
        lineObj.words.push({ word, start, end, wordIndex: item.wordIndex });
        if (start < lineObj.minStart) lineObj.minStart = start;
        if (end > lineObj.maxEnd) lineObj.maxEnd = end;
      });

      const sortedLineIndices = Array.from(lineMap.keys()).sort((a, b) => a - b);
      const lines: LyricLine[] = sortedLineIndices.map((idx, i) => {
        const lineObj = lineMap.get(idx)!;
        lineObj.words.sort((a, b) => a.start - b.start);
        const nextLineIdx = sortedLineIndices[i + 1];
        const nextLine = nextLineIdx !== undefined ? lineMap.get(nextLineIdx) : null;
        const start = lineObj.minStart;
        const end = nextLine ? nextLine.minStart : Math.max(lineObj.maxEnd, start + 3200);
        const text = lineObj.words.map(w => w.word).join(' ');

        return {
          lineIndex: idx,
          text,
          start,
          end,
          words: lineObj.words,
        };
      });

      lyricsLinesRef.current = lines;
      setLyricsLines(lines);
      setActiveLyricIndex(0);
      return;
    }

    // ── Priority 2: Standard [mm:ss] text format ────────────────────────────
    if (song.lyrics && typeof song.lyrics === 'string') {
      const lyricRows = String(song.lyrics)
        .split(/\r?\n/)
        .map((l: string) => l.trim())
        .filter(Boolean);

      const parsed: { text: string; start: number }[] = [];
      lyricRows.forEach((line: string) => {
        const m = line.match(/^\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]\s*(.*)$/);
        if (!m) return;
        const minutes = Number(m[1]);
        const seconds = Number(m[2]);
        const start = (minutes * 60 + seconds) * 1000;
        const text = m[3].trim();
        if (text) parsed.push({ text, start });
      });

      parsed.sort((a, b) => a.start - b.start);

      const lines: LyricLine[] = parsed.map((item, index) => {
        const next = parsed[index + 1];
        const lineEnd = next ? next.start : item.start + 3500;
        const rawWords = item.text.split(/\s+/).filter(Boolean);
        const dur = Math.max(lineEnd - item.start, 1000);
        const perWord = dur / Math.max(rawWords.length, 1);

        const words: WordStamp[] = rawWords.map((w, wi) => ({
          word: w,
          start: item.start + Math.round(wi * perWord),
          end: item.start + Math.round((wi + 1) * perWord),
        }));

        return {
          lineIndex: index,
          text: item.text,
          start: item.start,
          end: lineEnd,
          words,
        };
      });

      lyricsLinesRef.current = lines;
      setLyricsLines(lines);
      setActiveLyricIndex(0);
      return;
    }

    setLyricsLines([]);
    lyricsLinesRef.current = [];
    setActiveLyricIndex(0);
  };

  // ── Real-time Active Lyric Line & Auto-scroll ─────────────────────────────
  useEffect(() => {
    const lines = lyricsLinesRef.current;
    if (!lines.length) return;

    const currentPosition = playbackPositionMs;
    let index = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (currentPosition >= line.start && currentPosition < line.end) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      for (let i = lines.length - 1; i >= 0; i--) {
        if (currentPosition >= lines[i].start) {
          index = i;
          break;
        }
      }
    }

    if (index === -1 && currentPosition < lines[0].start) {
      index = 0;
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
  }, [playbackPositionMs, showFullLyrics, activeLyricIndex]);

  // ── Pause / Resume Recording Feature ──────────────────────────────────────
  const pauseRecording = async () => {
    try {
      await Sound.pauseRecorder();
      if (isPlayingRef.current) {
        await Sound.pausePlayer().catch(() => { });
      }
      pauseStartTimeRef.current = Date.now();
      isPausedRef.current = true;
      setIsPaused(true);
    } catch (e) {
      console.log('Error pausing recorder:', e);
    }
  };

  const resumeRecording = async () => {
    try {
      await Sound.resumeRecorder();
      if (instrumentalUrl && hasStartedRef.current) {
        await Sound.resumePlayer().catch(() => { });
        isPlayingRef.current = true;
        setInstrumentalPlaying(true);
      }
      if (pauseStartTimeRef.current > 0) {
        recordStartTimeRef.current += Date.now() - pauseStartTimeRef.current;
        pauseStartTimeRef.current = 0;
      }
      isPausedRef.current = false;
      setIsPaused(false);
    } catch (e) {
      console.log('Error resuming recorder:', e);
    }
  };

  const togglePauseRecording = async () => {
    if (isPausedRef.current) {
      await resumeRecording();
    } else {
      await pauseRecording();
    }
  };

  // ── Start / Stop Recording ─────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      requestMicPermission();

      try {
        await Sound.stopRecorder();
        Sound.removeRecordBackListener();
      } catch (_) { }

      try {
        await Sound.stopPlayer();
      } catch (_) { }

      try {
        await TrackPlayer.stop();
        await TrackPlayer.seekTo(0);
      } catch (_) { }

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
      isStartingRef.current = false;
      setInstrumentalPlaying(false);

      // Start instrumental player if available
      if (instrumentalUrl) {
        console.log('Starting instrumental playback:', instrumentalUrl);
        setInstrumentalLoading(true);
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

      const result = await Sound.startRecorder();
      setRecording(true);
      isRecordingRef.current = true;

      recordStartTimeRef.current = Date.now();
      let lastReportedSec = -1;

      recordTimerRef.current = setInterval(() => {
        // While paused, do not advance timer or playback position
        if (isPausedRef.current) {
          return;
        }

        const elapsedMs = Date.now() - recordStartTimeRef.current;
        const elapsedSec = Math.floor(elapsedMs / 1000);

        // Smooth continuous playback position for lyrics & progress bar
        if (!instrumentalUrl || !isPlayingRef.current) {
          setPlaybackPositionMs(elapsedMs);
        }

        // Only update text timer when the second actually changes (prevents stutter/jumping)
        if (elapsedSec !== lastReportedSec) {
          lastReportedSec = elapsedSec;
          const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
          const secs = String(elapsedSec % 60).padStart(2, '0');
          setRecordTime(`${mins}:${secs}`);
        }

        if (targetDurationMs > 0) {
          const pct = Math.min(100, Math.floor((elapsedMs / targetDurationMs) * 100));
          setRecPercentage(pct);
        }
      }, 100); // smooth 100ms interval for fluid word-by-word highlights
    } catch (e) {
      console.log('Error starting recording:', e);
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
        setInstrumentalPlaying(false);
      } catch (err) {
        console.log('Error stopping player:', err);
      }
    } catch (e) {
      console.log('Error stopping recording:', e);
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
      setInstrumentalPlaying(false);
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
      stopRecording();
      console.log('Error stopping audio:', error);
    } finally {
      stopRecording();
      navigation.navigate('Library');
    }
  }, [navigation, recording]);

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
        setAlbumPicture({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'album_picture.jpg',
        });
      }
    } catch (_) { }
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
      if (result.didCancel) return;
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAlbumPicture({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'camera_picture.jpg',
        });
      }
    } catch (_) { }
  };

  // ── Upload Recording Handler ───────────────────────────────────────────────
  const generateSongId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}-SONG`;

  const uploadRecording = async () => {
    if (!path || isUploading) return;

    if (!title.trim()) {
      setErrorMessage('Please enter a song title');
      return;
    }
    if (!albumName.trim()) {
      setErrorMessage('Please enter an album name');
      return;
    }
    if (!albumPicture?.uri) {
      setErrorMessage('Please select an album picture');
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

      formData.append('song_id', songId);
      formData.append('status', status || 'private');
      formData.append('album_name', albumName.trim());
      formData.append('title', title.trim());

      const durationFormatted = recordTime ? recordTime.slice(0, 5) : '00:00';
      formData.append('duration', durationFormatted);

      formData.append('recordingFile', {
        uri: Platform.OS === 'android' ? path : path.replace('file://', ''),
        type: 'audio/mp3',
        name: 'recording.mp3',
      } as any);

      formData.append('album_picture', {
        uri:
          Platform.OS === 'android'
            ? albumPicture.uri
            : albumPicture.uri.replace('file://', ''),
        type: albumPicture.type || 'image/jpeg',
        name: albumPicture.name || 'album_picture.jpg',
      } as any);

      const response: any = await ApiService.post(apiUrls.uploadrecording, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response?.data?.success) {
        setSaved(true);
        setSaveModalVisible(false);
        setTitle('')
        setAlbumName('')
        setAlbumPicture(null)
        if (response.data.recording_url) {
          setPath(response.data.recording_url);
        }
        dispatch(
          showToast({
            visible: true,
            message: t('Recording saved successfully.') || 'تم حفظ التسجيل بنجاح.',
            type: 'success',
          }),
        );
      } else {
        setErrorMessage(response?.data?.message || 'Recording upload failed.');
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Recording upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

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
    } catch (_) { }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COMPONENT RENDERS
  // ─────────────────────────────────────────────────────────────────────────

  // 1. Song Card at top
  const renderSongCard = () => (
    <View style={S.songCard}>
      <View style={S.songCardRow}>
        <View style={S.coverWrapper}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={S.coverImage} />
          ) : (
            <LinearGradient colors={['#29251D', '#3A2F1E']} style={S.coverPlaceholder}>
              <Text style={{ fontSize: 28, color: '#F5BD55' }}>♫</Text>
            </LinearGradient>
          )}
        </View>

        <View style={S.songInfo}>
          <Text style={S.songTitle} numberOfLines={2}>
            {songTitle}
          </Text>
          <Text style={S.songArtist}>{artistName}</Text>

          <View style={S.badgeRow}>
            <View style={S.badge}>
              <Text style={S.badgeText}>{data?.language || 'Arabic'}</Text>
            </View>

            {instrumentalUrl ? (
              <View style={[S.badge, S.instrumentalBadge]}>
                <Text style={S.instrumentalBadgeIcon}>♫</Text>
                <Text style={S.instrumentalBadgeText}>INSTRUMENTAL</Text>
              </View>
            ) : (
              <View style={[S.badge, S.acapellaBadge]}>
                <Text style={S.acapellaBadgeIcon}>🎙️</Text>
                <Text style={S.acapellaBadgeText}>VOCAL / ACAPELLA</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  // 2. Karaoke Word-by-word Renderer
  const renderKaraokeWords = (line: LyricLine, isActive: boolean) => {
    if (!isActive || !line.words || line.words.length === 0) {
      return (
        <Text
          style={[S.lyricLineText, isActive && S.lyricLineTextActive]}
          numberOfLines={2}
        >
          {line.text}
        </Text>
      );
    }

    return (
      <Text style={S.karaokeContainer}>
        {line.words.map((w, wIdx) => {
          const isCurrent =
            playbackPositionMs >= w.start && playbackPositionMs < w.end;
          const isPast = playbackPositionMs >= w.end;

          const wordColor = isCurrent
            ? '#F5BD55'
            : isPast
              ? '#FFFFFF'
              : 'rgba(255, 255, 255, 0.35)';

          return (
            <Text
              key={`${wIdx}-${w.start}`}
              style={[
                {
                  color: wordColor,
                  fontSize: isCurrent ? 20 : 17,
                  fontWeight: isCurrent ? '900' : isPast ? '800' : '600',
                  letterSpacing: 0.2,
                },
                isCurrent && {
                  textShadowColor: 'rgba(245, 189, 85, 0.95)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 14,
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

  // 3. Lyrics Section
  const renderLyricsSection = () => {
    if (!lyricsLines.length) {
      return (
        <View style={S.emptyLyricsContainer}>
          <Text style={S.emptyLyricsIcon}>♪</Text>
          <Text style={S.emptyLyricsTitle}>
            {instrumentalUrl ? 'Instrumental Only' : 'Acapella Vocal Recording'}
          </Text>
          <Text style={S.emptyLyricsSubtitle}>
            {instrumentalUrl
              ? 'Enjoy the backing music and sing freely!'
              : 'Sing your melody with pure vocals and rhythm.'}
          </Text>
        </View>
      );
    }

    if (!showFullLyrics) {
      const sliceStart = Math.max(0, activeLyricIndex - 1);
      const visibleLines = lyricsLines.slice(sliceStart, activeLyricIndex + 7);

      return (
        <View style={S.compactLyricsWrap}>
          {visibleLines.map((line, idx) => {
            const actualIndex = sliceStart + idx;
            const active = actualIndex === activeLyricIndex;
            const distance = Math.abs(actualIndex - activeLyricIndex);

            return (
              <View
                key={`${line.lineIndex}-${line.start}`}
                style={[S.lyricRow, active && S.lyricRowActive]}
              >
                {active && <View style={S.activeLyricDot} />}
                <View
                  style={{
                    flex: 1,
                    opacity: active ? 1 : distance === 1 ? 0.45 : 0.22,
                  }}
                >
                  {renderKaraokeWords(line, active)}
                </View>
              </View>
            );
          })}

          {/* Dots Indicator */}
          <View style={S.dotsRow}>
            {lyricsLines.map((_, i) => (
              <View
                key={i}
                style={[
                  S.dot,
                  i === activeLyricIndex && S.dotActive,
                  i < activeLyricIndex && S.dotPast,
                ]}
              />
            ))}
          </View>
        </View>
      );
    }

    return (
      <FlatList
        ref={lyricsListRef}
        data={lyricsLines}
        extraData={`${activeLyricIndex}-${playbackPositionMs}`}
        keyExtractor={(item, index) => `${item.start}-${index}`}
        scrollEnabled={false}
        contentContainerStyle={S.fullLyricsList}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            lyricsListRef?.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.35,
            });
          }, 200);
        }}
        renderItem={({ item, index }) => {
          const active = index === activeLyricIndex;
          const distance = Math.abs(index - activeLyricIndex);

          return (
            <View style={[S.fullLineWrap, active && S.fullLineWrapActive]}>
              <Text style={[S.lineNumber, active && S.lineNumberActive]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
              <View style={[S.lineBar, active && S.lineBarActive]} />
              <View style={[{ flex: 1 }, !active && { opacity: distance <= 1 ? 0.5 : 0.25 }]}>
                {renderKaraokeWords(item, active)}
              </View>
            </View>
          );
        }}
      />
    );
  };

  // 4. Fixed Bottom Recording Controls
  const renderBottomControls = () => {
    return (
      <View style={S.bottomControlBar}>
        {/* ── Paused Banner ── shown when recording is paused */}
        {isPaused && (
          <View style={S.pausedBanner}>
            <LinearGradient
              colors={['rgba(232,3,96,0.18)', 'rgba(80,2,174,0.22)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={S.pausedBannerGradient}
            >
              <View style={{
                height: '100%', width: '100%', flexDirection: 'row',
                alignItems: 'center',

                gap: 8,

                paddingHorizontal: 12
              }}>


                <View style={S.pausedDot} />
                <Text style={S.pausedBannerText}>⏸  PAUSED  —  Tap ▶ to Resume</Text>
                <Text style={S.pausedTimerText}>{recordTime}</Text>
              </View>
            </LinearGradient>

          </View>
        )}

        {/* Real-time Progress Bar */}
        {recording && (
          <View style={S.progressContainer}>
            <View style={S.progressTrack}>
              <LinearGradient
                colors={isPaused ? ['#888', '#555'] : ['#F5BD55', '#E80360']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  S.progressFill,
                  {
                    width: `${targetDurationMs > 0
                      ? Math.min(100, Math.max(1, (playbackPositionMs / targetDurationMs) * 100))
                      : 100
                      }%`,
                  },
                ]}
              />
            </View>
            <View style={S.progressTimeRow}>
              <Text style={[S.progressTimeCurrent, isPaused && { color: '#888' }]}>
                {formatAudioTime(playbackPositionMs)}
              </Text>
              <Text style={S.progressTimeDuration}>
                {targetDurationMs > 0 ? formatAudioTime(targetDurationMs) : 'Vocal'}
              </Text>
            </View>
          </View>
        )}

        {/* Waveforms & Mic / Pause Buttons */}
        <View style={S.waveAndMicRow}>
          <Waveform playing={recording && !isPaused} side="left" />

          {/* Pause / Resume Button (Visible only while recording) */}
          {recording && (
            <View style={S.pauseBtnWrapper}>
              {/* Animated glow ring — only shown when active (not paused) */}
              {!isPaused && (
                <PulseRing />
              )}
              <TouchableOpacity
                onPress={togglePauseRecording}
                activeOpacity={0.8}
                style={S.pauseSideBtn}
              >
                <LinearGradient
                  colors={isPaused ? ['#27AE60', '#1E8449'] : ['#5002AE', '#E80360']}
                  style={S.pauseSideGradient}
                >
                  <Text style={S.pauseIconText}>{isPaused ? '▶' : '⏸'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Center Mic / Stop / Countdown Button */}
          <TouchableOpacity
            onPress={handleMicPress}
            activeOpacity={0.8}
            style={S.centerMicBtn}
            disabled={instrumentalLoading && countdown === null && !recording}
          >
            {countdown !== null ? (
              <View style={S.countdownWrap}>
                <SmoothCountdown count={countdown} />
              </View>
            ) : recording ? (
              <LinearGradient colors={['#E80360', '#FF4B4B']} style={S.centerMicGradient}>
                <View style={S.stopSquare} />
              </LinearGradient>
            ) : (
              <LinearGradient colors={['#8B00FF', '#E80360']} style={S.centerMicGradient}>
                {instrumentalLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <AppImage source={Logo.linmic} height={34} width={20} />
                )}
              </LinearGradient>
            )}
          </TouchableOpacity>

          <Waveform playing={recording && !isPaused} side="right" />
        </View>

        <Text style={[S.micActionLabel, isPaused && { color: '#E80360' }]}>
          {countdown !== null
            ? 'Get Ready...'
            : instrumentalLoading
              ? 'Loading Music...'
              : isPaused
                ? '⏸  Recording Paused'
                : recording
                  ? 'Tap ■ to Stop  •  Tap ⏸ to Pause'
                  : isRecorded
                    ? 'Tap to Re-record'
                    : 'Tap to Start Singing'}
        </Text>

        <View style={S.bottomHintRow}>
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>🔒</Text>
          <Text style={S.bottomHintText}>Controls stay fixed while lyrics scroll</Text>
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STATE: RECORDED (Completion screen)
  // ─────────────────────────────────────────────────────────────────────────
  if (isRecorded) {
    return (
      <ImageBackground
        source={Banner.recbackground}
        style={S.container}
        resizeMode="cover"
      >
        <View style={S.bgOverlay} />
        <SafeAreaView style={S.container} edges={['top']}>
          {/* Header */}
          <View style={S.header}>
            <TouchableOpacity onPress={handleBack} style={S.headerIconBtn}>
              <AppImage source={Images.leftarrow} width={8} height={16} tintColor="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Library')}
              style={[
                S.headerIconBtn,
                { paddingHorizontal: 14, width: 'auto', flexDirection: 'row', gap: 6 },
              ]}
            >
              <AppImage
                source={BottomIcons.home}
                height={12}
                width={12}
                tintColor={color.darkthemetext}
              />
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
                {t('Home') || 'Home'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Great Job Heading */}
            <View style={S.completionHeader}>
              <Text style={S.completionStar}>✨</Text>
              <Text style={S.completionTitle}>Great Job!</Text>
              <Text style={S.completionStar}>✨</Text>
            </View>
            <Text style={S.completionSubtitle}>You completed the song</Text>

            {/* Circular Progress Ring */}
            <View style={{ alignItems: 'center', marginVertical: 22 }}>
              <CircularProgress percentage={recPercentage || 100} />
            </View>

            {/* Song Card Summary */}
            {renderSongCard()}

            {/* Stats Row */}
            <View style={S.statsRow}>
              <View style={S.statItem}>
                <AppImage
                  source={Logo.clock}
                  height={22}
                  width={22}

                />
                <Text style={S.statValue}>{recordTime.slice(0, 5)}</Text>
                <Text style={S.statLabel}>Duration</Text>
              </View>
              <View style={S.statDivider} />
              <View style={S.statItem}>
                <AppImage
                  source={Logo.ymusic}
                  height={22}
                  width={22}

                />
                <Text style={S.statValue}>{recPercentage || 100}%</Text>
                <Text style={S.statLabel}>Completion</Text>
              </View>
              <View style={S.statDivider} />
              <View style={S.statItem}>
                <AppImage
                  source={Logo.filltick}
                  height={22}
                  width={22}

                />
                <Text style={S.statValue}>
                  {recPercentage >= 80 ? 'Great' : recPercentage >= 50 ? 'Good' : 'Good'}
                </Text>
                <Text style={S.statLabel}>Performance</Text>
              </View>
            </View>

            {/* Save Recording Button */}
            <TouchableOpacity
              onPress={() => setSaveModalVisible(true)}
              style={S.saveActionBtn}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={saved ? ['#27AE60', '#2ECC71'] : ['#5002AE', '#8B00FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={S.saveActionGradient}
              >
                {/* <Text style={{ fontSize: 18 }}>{saved ? '✓' : '⬆'}</Text> */}
                <AppImage
                  source={saved ? Logo.filltick : Images.import}
                  height={24}
                  width={24}
                  tintColor={'#FFFF'}
                />
                <Text style={S.saveActionText}>
                  {saved ? t('Saved!') || 'Saved!' : t('Save Recording') || 'Save Recording'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sing Again & Share Row */}
            <View style={S.actionRow}>
              <TouchableOpacity
                onPress={startRecording}
                style={[S.actionHalf, { marginRight: 6 }]}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#FC5B01', '#E80360']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={S.actionHalfGradient}
                >
                  <AppImage source={Logo.round} height={20} width={20} />
                  <Text style={S.actionHalfText}>{t('Sing Again') || 'Sing Again'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onShare}
                style={[S.actionHalf, { marginLeft: 6 }]}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#5002AE', '#160146']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={S.actionHalfGradient}
                >
                  <AppImage
                    source={Logo.share}
                    height={22}
                    width={22}
                    tintColor={color.darkthemetext}
                  />
                  <Text style={S.actionHalfText}>{t('Share') || 'Share'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Back to Home Button */}
            <TouchableOpacity
              onPress={handleBack}
              style={S.backHomeBtn}
              activeOpacity={0.8}
            >
              <AppImage
                source={BottomIcons.home}
                height={14}
                width={14}
                tintColor={color.darkthemetext}
              />
              <Text style={S.backHomeText}>{t('Back to Home') || 'Back to Home'}</Text>
            </TouchableOpacity>
          </ScrollView>

          {renderSaveModal()}
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE: NO DATA PASSED (Navigated directly from Tab Bar)
  // ─────────────────────────────────────────────────────────────────────────
  if (!data) {
    return (
      <ImageBackground
        source={Banner.recbackground}
        style={S.container}
        resizeMode="cover"
      >
        <View style={S.bgOverlay} />
        <SafeAreaView style={S.container} edges={['top']}>
          {/* Header */}
          <View style={S.header}>
            <TouchableOpacity onPress={handleBack} style={S.headerIconBtn}>
              <AppImage source={Images.leftarrow} width={8} height={16} tintColor="#FFFFFF" />
            </TouchableOpacity>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>
              {t('Studio Recording') || 'Studio Recording'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            {/* Glowing Studio Banner */}
            <View style={S.noDataCard}>
              <LinearGradient
                colors={['#F5BD55', '#E80360', '#5002AE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 2, width: '100%' }}
              />

              <View style={{ padding: 22, alignItems: 'center' }}>
                <View style={S.glowCircle}>
                  <LinearGradient
                    colors={['#8B00FF', '#E80360', '#F5BD55']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={S.glowCircleGradient}
                  >
                    <View style={S.glowCircleInner}>
                      <Text style={{ fontSize: 36 }}>🎙️</Text>
                    </View>
                  </LinearGradient>
                </View>

                <Text style={S.noDataTitle}>
                  {t('Ready to Sing?') || 'جاهز للغناء؟'}
                </Text>
                <Text style={S.noDataSubtitle}>
                  {t('Choose a track from your library with synced lyrics, or start a freestyle vocal recording right now!') ||
                    'اختر أغنية من المكتبة للغناء مع الكلمات والموسيقى، أو ابدأ تسجيلاً صوتياً حراً الآن!'}
                </Text>

                {/* Browse Songs Button */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('Library')}
                  style={S.browseBtn}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#5002AE', '#E80360']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={S.browseBtnGradient}
                  >
                    <Text style={{ fontSize: 18 }}>🎵</Text>
                    <Text style={S.browseBtnText}>
                      {t('Browse Library') || 'تصفح الأغاني والمكتبة'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Feature Highlights */}
            <View style={S.featureRow}>
              {[
                { icon: Images.mics, title: 'Freestyle Vocals', desc: 'Record clean vocals anytime' },
                { icon: Images.bstar, title: 'Word-Sync Lyrics', desc: 'Real-time karaoke highlights' },
                { icon: Logo.share, title: 'Save & Share', desc: 'Export and share your songs' },
              ].map(f => (
                <View key={f.title} style={S.featureCard}>
                  <AppImage
                    source={f.icon}
                    height={24}
                    width={24}
                    tintColor={color.darkthemetext}
                    style={{ marginBottom: 6 }}
                    resizeMode='contain'
                  />
                  {/* <Text style={{ fontSize: 22, marginBottom: 4 }}>{f.icon}</Text> */}
                  <Text style={S.featureTitle}>{f.title}</Text>
                  <Text style={S.featureDesc}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Fixed recording bar so user can do freestyle recording even with no song! */}
          {renderBottomControls()}

          {renderSaveModal()}
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE: MAIN RECORDING SCREEN (Song Ready / Recording)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={Banner.recbackground}
      style={S.container}
      resizeMode="cover"
    >
      <View style={S.bgOverlay} />
      <SafeAreaView style={S.container} edges={['top']}>
        {/* Top Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={handleBack} style={S.headerIconBtn}>
            <AppImage source={Images.leftarrow} width={8} height={16} tintColor="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {lyricsLines.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowFullLyrics(v => !v)}
                style={[S.headerPill, showFullLyrics && S.headerPillActive]}
              >
                <Text style={{ fontSize: 12 }}>❝❞</Text>
                <Text style={[S.headerPillText, showFullLyrics && { color: '#FF2D55' }]}>
                  {t('Lyrics') || 'Lyrics'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onShare} style={S.headerPill}>
              <AppImage source={Banner.shareicon} height={14} width={14} tintColor="#FFFFFF" />
              <Text style={S.headerPillText}>{t('Share') || 'Share'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Scroll Content */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {renderSongCard()}

          {/* Lyrics Card */}
          <View ref={lyricsCardRef} collapsable={false} style={S.lyricsCard}>
            <LinearGradient
              colors={['#F5BD55', '#E80360', '#5002AE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 2 }}
            />

            <View style={S.lyricsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={S.lyricsIconWrap}>
                  <Text style={{ color: '#F5BD55', fontSize: 16 }}>❝</Text>
                </View>
                <View>
                  <Text style={S.lyricsTitle}>Lyrics</Text>
                  {lyricsLines.length > 0 && (
                    <Text style={S.lyricsSubtitle}>
                      {lyricsLines.length} lines · {data?.language || 'Arabic'}
                    </Text>
                  )}
                </View>
              </View>

              {lyricsLines.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowFullLyrics(v => !v)}
                  style={[S.toggleBtn, showFullLyrics && S.toggleBtnActive]}
                >
                  <Text style={[S.toggleBtnText, showFullLyrics && { color: '#E80360' }]}>
                    {showFullLyrics ? '⌃ Show less' : 'View all ⌄'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: 'rgba(245,189,85,0.1)',
                marginHorizontal: 16,
                marginBottom: 12,
              }}
            />

            {renderLyricsSection()}
          </View>
        </ScrollView>

        {/* Fixed Bottom Control Bar */}
        {renderBottomControls()}

        {renderSaveModal()}
      </SafeAreaView>
    </ImageBackground>
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
            style={StyleSheet.absoluteFillObject}
          />
          <View style={M.sheetContainer}>
            <LinearGradient
              colors={['#F5BD55', '#E80360', '#5002AE']}
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
                  <Text style={M.headerTitle}>{t('Save Recording') || 'حفظ التسجيل'}</Text>
                  <Text style={M.headerSubtitle}>
                    {t('Add song details before saving') || 'أضف تفاصيل الأغنية قبل الحفظ'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSaveModalVisible(false)}
                style={M.closeButton}
              >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={M.sheetScrollContent}
            >
              {/* Album Picture */}
              <Text style={M.fieldLabel}>{t('Album Picture') || 'صورة الألبوم'} *</Text>
              <TouchableOpacity
                onPress={handleSelectImageSource}
                style={M.imageTouchArea}
                activeOpacity={0.8}
              >
                {albumPicture?.uri ? (
                  <View style={M.imagePreviewContainer}>
                    <Image source={{ uri: albumPicture.uri }} style={M.imagePreview} />
                    <View style={M.changePhotoOverlay}>
                      <Text style={{ color: '#F5BD55', fontSize: 10, fontWeight: '700' }}>
                        {t('Change Photo') || 'تغيير الصورة'} ✎
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={M.placeholderBox}>
                    <View style={M.uploadIconCircle}>
                      <AppImage source={Images.import} width={22} height={22} tintColor="#F5BD55" />
                    </View>
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                      {t('Upload Album Picture') || 'رفع صورة الألبوم'}
                    </Text>
                    <Text style={{ color: '#858178', fontSize: 10 }}>
                      {t('Tap to choose from Gallery or Camera') || 'اضغط لاختيار صورة'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Title Input */}
              <Text style={[M.fieldLabel, { marginTop: 14 }]}>
                {t('Song Title') || 'عنوان الأغنية'} *
              </Text>
              <View style={M.inputBox}>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('Enter title (e.g. Song 1)') || 'أدخل عنوان الأغنية'}
                  placeholderTextColor="#6E6B7B"
                  style={M.textInput}
                />
              </View>

              {/* Album Name Input */}
              <Text style={[M.fieldLabel, { marginTop: 14 }]}>
                {t('Album Name') || 'اسم الألبوم'} *
              </Text>
              <View style={M.inputBox}>
                <TextInput
                  value={albumName}
                  onChangeText={setAlbumName}
                  placeholder={t('Enter album name (e.g. Love Songs)') || 'أدخل اسم الألبوم'}
                  placeholderTextColor="#6E6B7B"
                  style={M.textInput}
                />
              </View>

              {/* Visibility / Status */}
              <Text style={[M.fieldLabel, { marginTop: 14 }]}>
                {t('Visibility / Status') || 'الحالة'}
              </Text>
              <View style={M.statusPillRow}>
                {(['private', 'public'] as const).map(v => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setStatus(v)}
                    style={[M.statusPill, status === v && M.statusPillActive]}
                  >
                    <Text style={[M.statusPillText, status === v && M.statusPillTextActive]}>
                      {v === 'private'
                        ? `🔒 ${t('Private') || 'خاص'}`
                        : `🌍 ${t('Public') || 'عام'}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Meta Summary Chips */}
              <View style={M.metaChipsRow}>
                {[
                  { label: t('DURATION') || 'DURATION', value: recordTime.slice(0, 5) },
                  {
                    label: t('SONG ID') || 'SONG ID',
                    value: String(data?.id || data?.song_id || 'Freestyle'),
                  },
                  {
                    label: t('STATUS') || 'STATUS',
                    value: saved ? t('Saved') || 'Saved' : t('Ready') || 'Ready',
                    color: saved ? '#27AE60' : '#FEC749',
                  },
                ].map(chip => (
                  <View key={chip.label} style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#858178', fontSize: 9, fontWeight: '600' }}>
                      {chip.label}
                    </Text>
                    <Text
                      style={{
                        color: chip.color || '#FFFFFF',
                        fontSize: 12,
                        fontWeight: '700',
                        marginTop: 2,
                      }}
                    >
                      {chip.value}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Error Message */}
              {Boolean(errorMessage) && (
                <Text style={{ color: '#FF4B4C', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>
                  {errorMessage}
                </Text>
              )}

              {/* Confirm / Upload Button */}
              <TouchableOpacity
                onPress={uploadRecording}
                disabled={isUploading}
                style={M.uploadButtonWrap}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={saved ? ['#27AE60', '#2ECC71'] : ['#5002AE', '#160146']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={M.uploadButtonGradient}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <AppImage
                        source={saved ? Logo.filltick : Images.import}
                        height={20}
                        width={20}
                        tintColor="#FFFFFF"
                      />
                      <Text style={M.uploadButtonText}>
                        {saved
                          ? t('Update & Save Again') || 'تحديث وحفظ مجدداً'
                          : t('Confirm & Upload Recording') || 'تأكيد وحفظ التسجيل'}
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
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Full-screen dark overlay on top of background image so content stays readable
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,4,18,0.72)',
    zIndex: 0,
  },

  // Paused Banner (above progress bar)
  pausedBanner: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,3,96,0.35)',
    justifyContent: 'center',
  },
  pausedBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 8,
    width: '100%',

  },
  pausedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E80360',
    shadowColor: '#E80360',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  pausedBannerText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  pausedTimerText: {
    color: '#F5BD55',
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },

  // Pause button wrapper (holds the pulse ring + button)
  pauseBtnWrapper: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerPillActive: {
    borderColor: '#FF2D55',
    backgroundColor: 'rgba(255,45,85,0.14)',
  },
  headerPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Song Card Top
  songCard: {
    backgroundColor: 'rgba(20,14,30,0.92)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,189,85,0.14)',
  },
  songCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverWrapper: {
    marginRight: 12,
  },
  coverImage: {
    width: 68,
    height: 68,
    borderRadius: 12,
  },
  coverPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  songArtist: {
    color: '#B8B4AA',
    fontSize: 12,
    marginTop: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#AAA',
    fontSize: 10,
    fontWeight: '600',
  },
  instrumentalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245,189,85,0.14)',
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
  acapellaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(232,3,96,0.15)',
  },
  acapellaBadgeIcon: {
    fontSize: 9,
  },
  acapellaBadgeText: {
    color: '#E80360',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Lyrics Card
  lyricsCard: {
    backgroundColor: 'rgba(12,9,20,0.88)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245,189,85,0.1)',
    overflow: 'hidden',
    marginTop: 16,
  },
  lyricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  lyricsIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(245,189,85,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lyricsTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  lyricsSubtitle: {
    color: '#858178',
    fontSize: 10,
    marginTop: 1,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(245,189,85,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,189,85,0.2)',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(232,3,96,0.1)',
    borderColor: 'rgba(232,3,96,0.3)',
  },
  toggleBtnText: {
    color: '#F5BD55',
    fontSize: 10,
    fontWeight: '700',
  },

  // Compact Lyrics View
  compactLyricsWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 6,
  },
  lyricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    minHeight: 44,
  },
  lyricRowActive: {
    backgroundColor: 'rgba(245,189,85,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(245,189,85,0.14)',
  },
  activeLyricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5BD55',
    marginRight: 8,
    shadowColor: '#F5BD55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  lyricLineText: {
    color: '#AAA',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    writingDirection: 'rtl',
    flex: 1,
  },
  lyricLineTextActive: {
    color: '#F5BD55',
    fontSize: 18,
    fontWeight: '800',
  },
  karaokeContainer: {
    textAlign: 'center',
    writingDirection: 'rtl',
    flex: 1,
    lineHeight: 28,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 14,
    flexWrap: 'wrap',
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
    backgroundColor: 'rgba(245,189,85,0.3)',
  },

  // Full Lyrics List
  fullLyricsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    backgroundColor: 'rgba(245,189,85,0.07)',
  },
  lineNumber: {
    width: 22,
    color: 'rgba(255,255,255,0.15)',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'right',
  },
  lineNumberActive: {
    color: '#F5BD55',
  },
  lineBar: {
    width: 2,
    height: 20,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
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

  // Empty Lyrics State
  emptyLyricsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyLyricsIcon: {
    fontSize: 36,
    color: 'rgba(245,189,85,0.3)',
  },
  emptyLyricsTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyLyricsSubtitle: {
    color: '#858178',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },

  // Fixed Bottom Bar
  bottomControlBar: {
    backgroundColor: 'rgba(6,3,14,0.88)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(232,3,96,0.18)',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressTimeCurrent: {
    color: '#F5BD55',
    fontSize: 11,
    fontWeight: '600',
  },
  progressTimeDuration: {
    color: '#666',
    fontSize: 11,
  },
  waveAndMicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 10
  },
  pauseSideBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(232,3,96,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#E80360',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    zIndex: 1,
  },
  pauseSideGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
  },
  pauseIconText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  centerMicBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#8B00FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
  },
  centerMicGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
  },
  stopSquare: {
    width: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  countdownWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(80,2,174,0.5)',
    borderRadius: 36,
  },
  countdownNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FEC749',
    textShadowColor: 'rgba(254,199,73,0.7)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
    includeFontPadding: false,
  },
  micActionLabel: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  bottomHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  bottomHintText: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 12,
  },

  // Completion Screen
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  completionStar: {
    fontSize: 28,
  },
  completionTitle: {
    color: '#F5BD55',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  completionSubtitle: {
    color: '#B8B4AA',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,14,30,0.9)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,189,85,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#858178',
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  saveActionBtn: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  saveActionGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionHalf: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionHalfGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionHalfText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  backHomeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // No-Data Screen (When opened without selecting a song)
  noDataCard: {
    backgroundColor: 'rgba(20,14,30,0.92)',
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(245,189,85,0.14)',
    overflow: 'hidden',
    marginTop: 10,
  },
  glowCircle: {
    marginBottom: 18,
    shadowColor: '#8B00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
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
    backgroundColor: '#0D0A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
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
    marginTop: 20,
    width: '100%',
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(20,14,30,0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,189,85,0.1)',
    padding: 12,
    alignItems: 'center',
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  featureDesc: {
    color: '#858178',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────
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
    borderColor: 'rgba(245, 189, 85, 0.2)',
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
    backgroundColor: 'rgba(245, 189, 85, 0.12)',
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
    width: 120,
    height: 120,
    borderRadius: 14,
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
  placeholderBox: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(245, 189, 85, 0.35)',
    backgroundColor: 'rgba(245, 189, 85, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 189, 85, 0.12)',
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
