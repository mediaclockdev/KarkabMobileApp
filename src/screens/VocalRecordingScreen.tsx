import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  ImageBackground,
  ImageSourcePropType,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Sound from 'react-native-nitro-sound';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RecordBackType } from 'react-native-nitro-sound';
import type { SavedRecording } from './types/recording';
import { Banner } from '../share/constants/media';
import { useNavigation } from '@react-navigation/native';

const MAX_RECORDING_MS = 5 * 60 * 1000;
const RECORDINGS_INDEX =
  `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/karkab_recordings.json`;

type Props = {
  /** Pass the existing concert artwork here. Keep text/buttons out of the image. */
  heroImage: ImageSourcePropType;
  /** Connect this to your app's navigation goBack action. */
  onBack?: () => void;
};

type Mode = 'idle' | 'recording' | 'paused' | 'saving' | 'playing';

const formatTime = (ms: number): string => {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60,
  ).padStart(2, '0')}`;
};

const cleanPath = (value: string): string =>
  value.startsWith('file://') ? value.slice(7) : value;

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unexpected error occurred.';

async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    // iOS prompts via NSMicrophoneUsageDescription when recording starts.
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone permission',
      message: 'KarKab needs microphone access to record your vocals.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function loadSavedRecordings(): Promise<SavedRecording[]> {
  try {
    if (!(await ReactNativeBlobUtil.fs.exists(RECORDINGS_INDEX))) {
      return [];
    }

    const raw = await ReactNativeBlobUtil.fs.readFile(RECORDINGS_INDEX, 'utf8');
    const data: unknown = JSON.parse(raw);

    if (!Array.isArray(data)) {
      return [];
    }

    const results: SavedRecording[] = [];
    for (const item of data) {
      if (
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.path === 'string' &&
        typeof item.durationMs === 'number' &&
        typeof item.createdAt === 'number' &&
        (await ReactNativeBlobUtil.fs.exists(cleanPath(item.path)))
      ) {
        results.push(item as SavedRecording);
      }
    }

    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.warn('[KarKab] Could not load recording index:', error);
    return [];
  }
}

async function writeSavedRecordings(items: SavedRecording[]): Promise<void> {
  const temp = `${RECORDINGS_INDEX}.tmp`;
  await ReactNativeBlobUtil.fs.writeFile(temp, JSON.stringify(items), 'utf8');

  // Keep the old index until the replacement has been written successfully.
  if (await ReactNativeBlobUtil.fs.exists(RECORDINGS_INDEX)) {
    await ReactNativeBlobUtil.fs.unlink(RECORDINGS_INDEX);
  }
  await ReactNativeBlobUtil.fs.mv(temp, RECORDINGS_INDEX);
}

export default function VocalRecordingScreen({ heroImage, onBack }: Props) {
  const [mode, setMode] = useState<Mode>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [meter, setMeter] = useState(0);

  const mountedRef = useRef(true);
  const modeRef = useRef<Mode>('idle');
  const busyRef = useRef(false);
  const elapsedRef = useRef(0);
  const recorderPathRef = useRef('');
  const autoSaveStartedRef = useRef(false);
  const playingIdRef = useRef<string | null>(null);
  const recordingsRef = useRef<SavedRecording[]>([]);
  const finishRef = useRef<(automatic?: boolean) => Promise<void>>(
    async () => undefined,
  );
  const pauseRef = useRef<() => Promise<void>>(async () => undefined);

  const setModeSafe = useCallback((next: Mode) => {
    modeRef.current = next;
    if (mountedRef.current) setMode(next);
  }, []);

  const setBusySafe = useCallback((next: boolean) => {
    busyRef.current = next;
    if (mountedRef.current) setBusy(next);
  }, []);

  const setElapsedSafe = useCallback((next: number) => {
    const safe = Math.max(0, Math.min(next, MAX_RECORDING_MS));
    elapsedRef.current = safe;
    if (mountedRef.current) setElapsedMs(safe);
  }, []);

  const refreshRecordings = useCallback(async () => {
    const items = await loadSavedRecordings();
    recordingsRef.current = items;
    if (mountedRef.current) setRecordings(items);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refreshRecordings();

    return () => {
      mountedRef.current = false;
      // Listeners are removed when operations finish. Do not stop an in-flight
      // native recorder from an unmount cleanup without awaiting the stop.
      Sound.removeRecordBackListener();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
    };
  }, [refreshRecordings]);

  const stopPlayback = useCallback(async () => {
    try {
      await Sound.stopPlayer();
    } catch {
      // It may already have reached the end.
    } finally {
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      playingIdRef.current = null;
      if (mountedRef.current) setPlayingId(null);
      if (modeRef.current === 'playing') setModeSafe('idle');
    }
  }, [setModeSafe]);

  const finishAndSave = useCallback(async (automatic = false) => {
    if (busyRef.current || !['recording', 'paused'].includes(modeRef.current)) {
      return;
    }

    setBusySafe(true);
    setModeSafe('saving');

    // Native recording progress is the timer source, so this value is not
    // accumulated by JS intervals and does not drift when the UI is busy.
    const durationMs = Math.min(elapsedRef.current, MAX_RECORDING_MS);

    try {
      const returnedPath = await Sound.stopRecorder();
      Sound.removeRecordBackListener();

      const path = cleanPath(
        returnedPath && !returnedPath.includes('already stopped')
          ? returnedPath
          : recorderPathRef.current,
      );

      if (!path || !(await ReactNativeBlobUtil.fs.exists(path))) {
        throw new Error('The audio file was not created. Please record again.');
      }

      const newItem: SavedRecording = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: `My Recording ${recordingsRef.current.length + 1}`,
        path,
        durationMs,
        createdAt: Date.now(),
      };

      const next = [newItem, ...recordingsRef.current];
      await writeSavedRecordings(next);

      recordingsRef.current = next;
      if (mountedRef.current) setRecordings(next);

      recorderPathRef.current = '';
      autoSaveStartedRef.current = false;
      setElapsedSafe(0);
      setModeSafe('idle');

      if (automatic && mountedRef.current) {
        Alert.alert('Recording saved', 'You reached the 5-minute recording limit.');
      }
    } catch (error) {
      // If indexing failed, preserve the audio file rather than deleting it.
      setModeSafe('idle');
      Alert.alert(
        'Could not save recording',
        `${getErrorMessage(error)} The audio file may still be on this device.`,
      );
    } finally {
      setBusySafe(false);
    }
  }, [setBusySafe, setElapsedSafe, setModeSafe]);

  useEffect(() => {
    finishRef.current = finishAndSave;
  }, [finishAndSave]);

  const onRecordProgress = useCallback((event: RecordBackType) => {
    if (typeof event.currentPosition === 'number') {
      const next = Math.max(0, Math.min(event.currentPosition, MAX_RECORDING_MS));
      elapsedRef.current = next;
      if (mountedRef.current) setElapsedMs(next);

      if (next >= MAX_RECORDING_MS && !autoSaveStartedRef.current) {
        autoSaveStartedRef.current = true;
        void finishRef.current(true);
      }
    }

    if (typeof event.currentMetering === 'number' && mountedRef.current) {
      setMeter(Math.max(0, Math.min(1, (event.currentMetering + 60) / 60)));
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (busyRef.current || modeRef.current !== 'idle') return;

    setBusySafe(true);
    try {
      if (playingIdRef.current) {
        await stopPlayback();
      }

      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        Alert.alert(
          'Microphone access required',
          'Allow microphone access in Settings to record your vocals.',
        );
        return;
      }

      setElapsedSafe(0);
      autoSaveStartedRef.current = false;

      const extension = Platform.OS === 'ios' ? 'm4a' : 'm4a';
      const targetPath =
        `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/karkab_${Date.now()}.${extension}`;
      recorderPathRef.current = targetPath;

      Sound.removeRecordBackListener();
      Sound.addRecordBackListener(onRecordProgress);

      const audioSet = {
        AudioSamplingRate: 44100,
        AudioEncodingBitRate: 128000,
        AudioChannels: 1,
      };

      try {
        const startedPath = await Sound.startRecorder(targetPath, audioSet, true);
        if (startedPath && !startedPath.includes('already')) {
          recorderPathRef.current = cleanPath(startedPath);
        }
        setModeSafe('recording');
      } catch (error) {
        Sound.removeRecordBackListener();
        recorderPathRef.current = '';
        throw error;
      }
    } catch (error) {
      setModeSafe('idle');
      Alert.alert(
        'Unable to start recording',
        `${getErrorMessage(error)} Check microphone permission and try again.`,
      );
    } finally {
      setBusySafe(false);
    }
  }, [
    onRecordProgress,
    setBusySafe,
    setElapsedSafe,
    setModeSafe,
    stopPlayback,
  ]);

  const togglePause = useCallback(async () => {
    if (busyRef.current) return;

    if (modeRef.current === 'recording') {
      setBusySafe(true);
      try {
        await Sound.pauseRecorder();
        setModeSafe('paused');
      } catch (error) {
        Alert.alert('Could not pause recording', getErrorMessage(error));
      } finally {
        setBusySafe(false);
      }
      return;
    }

    if (modeRef.current === 'paused') {
      setBusySafe(true);
      try {
        await Sound.resumeRecorder();
        setModeSafe('recording');
      } catch (error) {
        Alert.alert('Could not resume recording', getErrorMessage(error));
      } finally {
        setBusySafe(false);
      }
    }
  }, [setBusySafe, setModeSafe]);

  useEffect(() => {
    pauseRef.current = async () => {
      if (modeRef.current !== 'recording' || busyRef.current) return;

      setBusySafe(true);
      try {
        await Sound.pauseRecorder();
        setModeSafe('paused');
      } catch (error) {
        console.warn('[KarKab] Could not pause on app state change:', error);
      } finally {
        setBusySafe(false);
      }
    };
  }, [setBusySafe, setModeSafe]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state !== 'active') void pauseRef.current();
      },
    );
    return () => subscription.remove();
  }, []);

  const discardRecording = useCallback(() => {
    Alert.alert('Discard recording?', 'This take will not be saved.', [
      { text: 'Keep recording', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          if (busyRef.current || !['recording', 'paused'].includes(modeRef.current)) {
            return;
          }

          setBusySafe(true);
          setModeSafe('saving');
          try {
            const stoppedPath = await Sound.stopRecorder();
            Sound.removeRecordBackListener();

            const path = cleanPath(
              stoppedPath && !stoppedPath.includes('already stopped')
                ? stoppedPath
                : recorderPathRef.current,
            );

            if (path && (await ReactNativeBlobUtil.fs.exists(path))) {
              await ReactNativeBlobUtil.fs.unlink(path);
            }

            recorderPathRef.current = '';
            autoSaveStartedRef.current = false;
            setElapsedSafe(0);
            setModeSafe('idle');
          } catch (error) {
            Alert.alert('Could not discard recording', getErrorMessage(error));
            setModeSafe('idle');
          } finally {
            setBusySafe(false);
          }
        },
      },
    ]);
  }, [setBusySafe, setElapsedSafe, setModeSafe]);

  const playRecording = useCallback(async (item: SavedRecording) => {
    if (busyRef.current) return;

    if (playingIdRef.current === item.id && modeRef.current === 'playing') {
      await stopPlayback();
      return;
    }

    if (['recording', 'paused', 'saving'].includes(modeRef.current)) {
      Alert.alert('Finish recording first', 'Save or discard your current take before playback.');
      return;
    }

    setBusySafe(true);
    try {
      if (playingIdRef.current) await stopPlayback();

      const path = cleanPath(item.path);
      if (!(await ReactNativeBlobUtil.fs.exists(path))) {
        throw new Error('This recording file is no longer available.');
      }

      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();

      Sound.addPlaybackEndListener(() => {
        playingIdRef.current = null;
        if (mountedRef.current) {
          setPlayingId(null);
          setMode('idle');
        }
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
      });

      await Sound.startPlayer(path);
      playingIdRef.current = item.id;
      setPlayingId(item.id);
      setModeSafe('playing');
    } catch (error) {
      playingIdRef.current = null;
      setPlayingId(null);
      setModeSafe('idle');
      Alert.alert('Could not play recording', getErrorMessage(error));
    } finally {
      setBusySafe(false);
    }
  }, [setBusySafe, setModeSafe, stopPlayback]);

  const deleteRecording = useCallback((item: SavedRecording) => {
    Alert.alert('Delete recording?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (busyRef.current) return;
          setBusySafe(true);
          try {
            if (playingIdRef.current === item.id) await stopPlayback();

            const path = cleanPath(item.path);
            if (await ReactNativeBlobUtil.fs.exists(path)) {
              await ReactNativeBlobUtil.fs.unlink(path);
            }

            const next = recordingsRef.current.filter(recording => recording.id !== item.id);
            await writeSavedRecordings(next);
            recordingsRef.current = next;
            if (mountedRef.current) setRecordings(next);
          } catch (error) {
            Alert.alert('Could not delete recording', getErrorMessage(error));
          } finally {
            setBusySafe(false);
          }
        },
      },
    ]);
  }, [setBusySafe, stopPlayback]);

  const isRecording = mode === 'recording';
  const isPaused = mode === 'paused';
  const isSaving = busy || mode === 'saving';

  const micAction = () => {
    if (isRecording || isPaused) {
      void finishRef.current(false);
    } else {
      void startRecording();
    }
  };
    const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#050407" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              navigation.goBack()
            }}
            disabled={ isRecording || isPaused || isSaving}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[styles.backButton,  styles.disabled]}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        </View>

        <ImageBackground
          source={Banner?.recbackground}
          style={styles.hero}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heading}>
              Ready to <Text style={styles.headingAccent}>Sing?</Text>
            </Text>


            {/* <ImageBackground source={req} */}

            <Pressable
              onPress={micAction}
              disabled={isSaving || mode === 'playing'}
              accessibilityRole="button"
              accessibilityLabel={
                isRecording || isPaused ? 'Finish and save recording' : 'Start recording'
              }
              style={[
                styles.micRing,
                (isRecording || isPaused) && styles.micRingActive,
              ]}
            >
              <View style={styles.micCircle}>
                <Text style={styles.micIcon}>
                  {isRecording ? '■' : isPaused ? '▶' : '🎙'}
                </Text>
              </View>
            </Pressable>

            <Text style={styles.heroHint}>
              {isRecording
                ? 'Recording your voice…'
                : isPaused
                  ? 'Recording paused · tap to save'
                  : isSaving
                    ? 'Please wait…'
                    : mode === 'playing'
                      ? 'Playing your recording'
                      : 'Tap to Start Recording'}
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.recordCard}>
          <View style={styles.timerRow}>
            <View style={styles.statusLabel}>
              <View style={[styles.statusDot, isRecording && styles.statusDotLive]} />
              <Text style={styles.statusText}>
                {isRecording
                  ? 'Recording'
                  : isPaused
                    ? 'Paused'
                    : isSaving
                      ? 'Saving…'
                      : mode === 'playing'
                        ? 'Playing'
                        : 'Ready to record'}
              </Text>
            </View>
            <Text style={styles.timer}>
              {formatTime(elapsedMs)}
              <Text style={styles.timerLimit}> / {formatTime(MAX_RECORDING_MS)}</Text>
            </Text>
          </View>

          <View style={styles.waveform} accessibilityLabel="Recording level indicator">
            {Array.from({ length: 43 }, (_, index) => {
              const height = 8 + ((index * 17 + 13) % 39);
              const lit = isRecording && index < 24 + meter * 19;
              return (
                <View
                  key={index}
                  style={[
                    styles.waveBar,
                    { height },
                    lit ? styles.waveBarActive : styles.waveBarIdle,
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.controls}>
            {(isRecording || isPaused) && (
              <Pressable
                style={styles.secondaryControl}
                disabled={isSaving}
                onPress={discardRecording}
              >
                <Text style={styles.secondaryIcon}>×</Text>
                <Text style={styles.controlLabel}>Discard</Text>
              </Pressable>
            )}

            {isSaving ? (
              <View style={styles.primaryControl}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.controlLabel}>Saving</Text>
              </View>
            ) : isRecording || isPaused ? (
              <Pressable
                style={styles.primaryControl}
                onPress={() => void togglePause()}
                accessibilityRole="button"
                accessibilityLabel={isRecording ? 'Pause recording' : 'Resume recording'}
              >
                <Text style={styles.primaryIcon}>{isRecording ? 'Ⅱ' : '▶'}</Text>
                <Text style={styles.controlLabel}>{isRecording ? 'Pause' : 'Resume'}</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.primaryControl}
                onPress={startRecording}
                disabled={mode === 'playing'}
              >
                <Text style={styles.primaryIcon}>●</Text>
                <Text style={styles.controlLabel}>Record again</Text>
              </Pressable>
            )}

            {(isRecording || isPaused) && (
              <Pressable
                style={styles.secondaryControl}
                disabled={isSaving}
                onPress={() => void finishRef.current(false)}
              >
                <Text style={styles.saveIcon}>✓</Text>
                <Text style={styles.controlLabel}>Save</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Recordings</Text>
          <Text style={styles.recordingCount}>{recordings.length}</Text>
        </View>

        {recordings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>♫</Text>
            <Text style={styles.emptyTitle}>Your voice, your moment</Text>
            <Text style={styles.emptyDescription}>
              Saved recordings will appear here.
            </Text>
          </View>
        ) : (
          recordings.map(item => (
            <View key={item.id} style={styles.recordingItem}>
              <Pressable
                style={styles.playButton}
                onPress={() => void playRecording(item)}
                disabled={isSaving || isRecording || isPaused}
                accessibilityRole="button"
                accessibilityLabel={`${playingId === item.id ? 'Stop' : 'Play'} ${item.title}`}
              >
                <Text style={styles.playIcon}>{playingId === item.id ? '■' : '▶'}</Text>
              </Pressable>

              <Pressable
                style={styles.recordingInfo}
                onPress={() => void playRecording(item)}
                disabled={isSaving || isRecording || isPaused}
              >
                <Text style={styles.recordingTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.recordingMeta}>
                  {formatTime(item.durationMs)} · {new Date(item.createdAt).toLocaleString()}
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => deleteRecording(item)}
                disabled={isSaving || isRecording || isPaused}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.title}`}
              >
                <Text style={styles.deleteText}>•••</Text>
              </Pressable>
            </View>
          ))
        )}

        <Text style={styles.footer}>~ KarKab ~</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#050407' },
  screen: { flex: 1, backgroundColor: '#050407' },
  content: { paddingHorizontal: 2, paddingBottom: 36 },
  topBar: { height: 58, justifyContent: 'center' },
  backButton: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    borderColor: '#38303F', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#100C16',
  },
  disabled: { opacity: 0.55 },
  backText: { color: '#FFFFFF', fontSize: 35, lineHeight: 38, marginTop: -4 },
  hero: {
    height: 400, overflow: 'hidden', justifyContent: 'center', marginHorizontal: -4,
    backgroundColor: '#16051F', borderRadius: 25,
  },
  heroImage: { borderRadius: 25 },
  heroOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 28, paddingBottom: 24, backgroundColor: 'rgba(4,0,12,0.16)',
  },
  heading: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', textAlign: 'center' },
  headingAccent: { color: '#FF25C8' },
  micRing: {
    width: 214, height: 214, borderRadius: 107, borderWidth: 5,
    borderColor: '#F22ACB', backgroundColor: 'rgba(255,38,188,0.12)',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#FF21D4',
    shadowOpacity: 0.8, shadowRadius: 22, shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  micRingActive: { borderColor: '#FF4D68', shadowColor: '#FF375C' },
  micCircle: {
    width: 188, height: 188, borderRadius: 94, backgroundColor: '#05020A',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#75205D',
  },
  micIcon: { fontSize: 57, color: '#FF31C8' },
  heroHint: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  recordCard: {
    marginTop: 12, borderRadius: 25, padding: 20, backgroundColor: '#100C18',
    borderWidth: 1, borderColor: '#47205B',
  },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  statusLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#7B7188' },
  statusDotLive: { backgroundColor: '#FF365F' },
  statusText: { color: '#F5F0FA', fontSize: 14, fontWeight: '600' },
  timer: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  timerLimit: { color: '#A9A0C6', fontSize: 14, fontWeight: '400' },
  waveform: {
    height: 100, marginVertical: 10, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 3,
  },
  waveBar: { flex: 1, maxWidth: 5, minWidth: 2, borderRadius: 4 },
  waveBarActive: { backgroundColor: '#FF36C8' },
  waveBarIdle: { backgroundColor: '#413448' },
  controls: {
    minHeight: 95, flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', gap: 12,
  },
  primaryControl: { alignItems: 'center', justifyContent: 'center', minWidth: 88, minHeight: 80, gap: 7 },
  primaryIcon: {
    width: 62, height: 62, textAlign: 'center', textAlignVertical: 'center',
    overflow: 'hidden', borderRadius: 31, borderWidth: 3, borderColor: '#FF3C91',
    backgroundColor: '#A80D69', color: '#FFFFFF', fontSize: 28, fontWeight: '800',
    includeFontPadding: false,
  },
  secondaryControl: { minWidth: 68, alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryIcon: {
    width: 48, height: 48, borderRadius: 24, textAlign: 'center',
    textAlignVertical: 'center', borderWidth: 1, borderColor: '#474052',
    color: '#D8CFEA', fontSize: 31,
  },
  saveIcon: {
    width: 48, height: 48, borderRadius: 24, textAlign: 'center',
    textAlignVertical: 'center', borderWidth: 2, borderColor: '#C000FF',
    backgroundColor: '#6505A8', color: '#FFFFFF', fontSize: 28, fontWeight: '700',
  },
  controlLabel: { color: '#E9E0F5', fontSize: 13, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 28, marginBottom: 14,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  recordingCount: { color: '#E42AE8', fontSize: 15 },
  emptyCard: {
    alignItems: 'center', paddingVertical: 28, borderRadius: 20,
    borderWidth: 1, borderColor: '#282032', backgroundColor: '#0D0A12',
  },
  emptyIcon: { color: '#EC28DF', fontSize: 32 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 8 },
  emptyDescription: { color: '#A9A0B8', fontSize: 13, marginTop: 6 },
  recordingItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 12,
    minHeight: 82, borderRadius: 20, borderWidth: 1, borderColor: '#292035',
    backgroundColor: '#100C18', gap: 12,
  },
  playButton: {
    width: 46, height: 46, borderRadius: 23, alignItems: 'center',
    justifyContent: 'center', borderWidth: 2, borderColor: '#D52CE8',
    backgroundColor: '#21102F',
  },
  playIcon: { color: '#FFFFFF', fontSize: 17 },
  recordingInfo: { flex: 1 },
  recordingTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  recordingMeta: { color: '#AAA0C6', fontSize: 11, marginTop: 6 },
  deleteButton: { paddingHorizontal: 6, paddingVertical: 10 },
  deleteText: { color: '#C6B8E9', fontSize: 20, letterSpacing: 2 },
  footer: { color: '#ED20E5', textAlign: 'center', fontSize: 18, marginTop: 24 },
});
