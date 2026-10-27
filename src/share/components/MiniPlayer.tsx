import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    AppStateStatus,
    Image,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import TrackPlayer, {
    useIsPlaying,
    usePlaybackState,
    useActiveMediaItem,
    PlaybackState,
} from '@rntp/player';

import AppText from './AppText';
import AppImage from './AppImage';
import { Images } from '../constants/media';
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector';
import { GlobalImage } from '../utils/GlobalImage';
import { addsong, openSongAction, setHideMiniPlayer } from '../../auth/redux/authSlice';
import {
    skipToNextTrack,
    skipToPreviousTrack,
    playTrackSong,
    isPlayerSwitching,
    restoreLastPlayedSong,
} from '../../services/player';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface MiniPlayerProps {
    onNext?: () => void;
    onPrevious?: () => void;
    bottomOffset?: number;
}

const MiniPlayer = ({ onNext, onPrevious, bottomOffset = 78 }: MiniPlayerProps) => {
    const dispatch = useAppDispatch();
    const playing = useIsPlaying();
    const activeMediaItem = useActiveMediaItem();
    const navigation = useNavigation<any>();
    const playbackState = usePlaybackState();

    const hideMiniPlayer = useAppSelector(
        (state: any) => state.auth.hideMiniPlayer
    );
    const playsong = useAppSelector((state: any) => state.auth.playsong);

    const buffering =
        playbackState === PlaybackState.Buffering ||
        (playbackState as any) === 'loading';

    // Derive current song from TrackPlayer active item with fallback to Redux playsong
    const displaySong = React.useMemo(() => {
        if (activeMediaItem) {
            const original = (activeMediaItem.extras as any)?.originalSong;
            if (original?.id) {
                return original;
            }
            return {
                ...playsong,
                id: activeMediaItem.mediaId,
                title: activeMediaItem.title || playsong?.title,
                artist: activeMediaItem.artist || playsong?.artist,
                cover_image_url: activeMediaItem.artworkUrl || playsong?.cover_image_url,
                album_picture_url: activeMediaItem.artworkUrl || playsong?.album_picture_url,
                duration: activeMediaItem.duration || playsong?.duration,
            };
        }
        return playsong;
    }, [activeMediaItem, playsong]);

    // Keep Redux in sync whenever TrackPlayer transitions to another media item
    useEffect(() => {
        if (activeMediaItem?.mediaId) {
            const activeId = activeMediaItem.mediaId.toString();
            if (playsong?.id?.toString() !== activeId) {
                const original = (activeMediaItem.extras as any)?.originalSong;
                if (original) {
                    lastLoadedIdRef.current = activeId;
                    dispatch(addsong(original));
                }
            }
        }
    }, [activeMediaItem?.mediaId, playsong?.id, dispatch]);

    // Real-time progress state
    const [currentPosition, setCurrentPosition] = useState(0);
    const [trackDuration, setTrackDuration] = useState(0);
    const [switchingTrack, setSwitchingTrack] = useState(false);
    const isAutoNextingRef = useRef(false);
    const isInitialMount = useRef(true);
    const isLoadingRef = useRef(false);          // NEW: prevents re-entry loop
    const appStateRef = useRef(AppState.currentState);  // NEW: tracks app state
    const lastLoadedIdRef = useRef<string | null>(null); // NEW: tracks last loaded song id

    /**
     * 0. RESTORE LAST PLAYED SONG ON MOUNT
     *    Loads the song into the player (paused) so the MiniPlayer shows it.
     */
    useEffect(() => {
        restoreLastPlayedSong();
    }, []);

    /**
     * 0b. PAUSE WHEN APP COMES BACK TO FOREGROUND
     *     Prevents audio from unexpectedly continuing after the user
     *     returns to the app.
     */
    useEffect(() => {
        const handleAppStateChange = async (nextState: AppStateStatus) => {
            if (
                appStateRef.current.match(/inactive|background/) &&
                nextState === 'active'
            ) {
                // App came to foreground — pause playback
                try {
                    await TrackPlayer.pause();
                } catch (e) {
                    // player may not be ready yet, safe to ignore
                }
            }
            appStateRef.current = nextState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, []);

    /**
     * 1. ACTIVE PROGRESS POLLING
     */
    useEffect(() => {
        const activeSongId = displaySong?.id || playsong?.id;
        if (!activeSongId || hideMiniPlayer) return;

        const interval = setInterval(async () => {
            try {
                const progress = await TrackPlayer.getProgress();
                if (progress) {
                    const pos = progress.position > 10000 ? progress.position / 1000 : progress.position;
                    const dur = progress.duration > 1000 ? progress.duration / 1000 : progress.duration;

                    setCurrentPosition(pos || 0);
                    if (dur && dur > 0) {
                        setTrackDuration(dur);
                    }
                }
            } catch (e) { }
        }, 250);

        return () => clearInterval(interval);
    }, [displaySong?.id, playsong?.id, hideMiniPlayer]);

    // Handle Playback State Ended (auto-advance)
    useEffect(() => {
        if (
            (playbackState === PlaybackState.Ended || (playbackState as any) === 'ended') &&
            !isAutoNextingRef.current &&
            !isPlayerSwitching()
        ) {
            handleNext();
        }
    }, [playbackState]);

    /**
     * 2. LOAD SONG WHEN REDUX SONG CHANGES
     *    Guards against re-entry and duplicate loads to prevent the
     *    "render song again and again" loop.
     */
    useEffect(() => {
        if (!playsong?.id) {
            pauseSongItem();
            lastLoadedIdRef.current = null;
            return;
        }

        const songIdStr = playsong.id.toString();

        // Skip if we already loaded this exact song id
        if (lastLoadedIdRef.current === songIdStr) {
            return;
        }

        // Skip if a track switch or load is already in progress
        if (isPlayerSwitching() || switchingTrack || isLoadingRef.current) {
            console.log('Track switch/load in progress, skipping playSongItem reload');
            lastLoadedIdRef.current = songIdStr;
            return;
        }

        // Check if TrackPlayer already has this song active
        let activeSong: any = null;
        try {
            activeSong = TrackPlayer.getActiveMediaItem();
        } catch (e) {
            // getActiveMediaItem can throw if player isn't ready — not an error
        }

        if (activeSong?.mediaId === songIdStr || activeMediaItem?.mediaId === songIdStr) {
            lastLoadedIdRef.current = songIdStr;
            const dur = Number(playsong.duration) || 0;
            if (dur > 0) {
                setTrackDuration(dur > 1000 ? dur / 1000 : dur);
            }
            return;
        }

        const autoPlay = !isInitialMount.current;
        isInitialMount.current = false;

        // Mark as loading to prevent re-entry
        isLoadingRef.current = true;
        lastLoadedIdRef.current = songIdStr;

        playSongItem(playsong, autoPlay).finally(() => {
            isLoadingRef.current = false;
        });
    }, [playsong?.id, activeMediaItem?.mediaId]);

    const pauseSongItem = async () => {
        try {
            await TrackPlayer.pause();
        } catch (e) { }
    };

    const playSongItem = async (song: any, autoPlay: boolean = true) => {
        try {
            if (!song?.id) return;

            // Double-check the active item to prevent duplicate loads
            let activeSong: any = null;
            try {
                activeSong = TrackPlayer.getActiveMediaItem();
            } catch (e) { }

            if (activeSong?.mediaId === song.id.toString()) {
                console.log('Track is already active in TrackPlayer, skipping reload');
                return;
            }

            const dur = Number(song.duration) || 0;
            if (dur > 0) {
                setTrackDuration(dur > 1000 ? dur / 1000 : dur);
            }

            await playTrackSong(song, autoPlay);
        } catch (error) {
            console.log('PLAY SONG ERROR:', error);
        }
    };

    /**
     * 3. PLAY / PAUSE
     */
    const handlePlayPause = async () => {
        if (buffering) return;
        try {
            if (playing) {
                await TrackPlayer.pause();
            } else {
                await TrackPlayer.play();
            }
        } catch (e) {
            console.log('handlePlayPause error:', e);
        }
    };

    /**
     * 4. PREVIOUS SONG
     */
    const handlePrevious = async () => {
        const currentId = displaySong?.id || playsong?.id;
        if (switchingTrack || !currentId || isPlayerSwitching()) return;

        try {
            setSwitchingTrack(true);
            await skipToPreviousTrack(dispatch);
            onPrevious?.();
        } catch (error) {
            console.log('PREVIOUS SONG ERROR:', error);
            onPrevious?.();
        } finally {
            setSwitchingTrack(false);
        }
    };

    /**
     * 5. CLOSE MINI PLAYER
     */
    const handleCloseMiniPlayer = async () => {
        try {
            await TrackPlayer.stop();
            lastLoadedIdRef.current = null;
            dispatch(setHideMiniPlayer(true))
            dispatch(addsong(''));
        } catch (error) {
            console.log('CLOSE MINI PLAYER ERROR:', error);
        }
    };

    /**
     * 6. NEXT SONG
     */
    const handleNext = async () => {
        const currentId = displaySong?.id || playsong?.id;
        if (switchingTrack || isAutoNextingRef.current || !currentId || isPlayerSwitching()) return;

        try {
            isAutoNextingRef.current = true;
            setSwitchingTrack(true);
            await skipToNextTrack(dispatch);
            onNext?.();
        } catch (error) {
            console.log('NEXT SONG ERROR:', error);
            onNext?.();
        } finally {
            setSwitchingTrack(false);
            setTimeout(() => {
                isAutoNextingRef.current = false;
            }, 1000);
        }
    };

    // Open song action sheet / detail
    const openFullPlayer = () => {
        const targetSong = displaySong?.id ? displaySong : playsong;
        if (targetSong?.id) {
            (navigation as any).navigate('.', {
                id: targetSong.id,
            });

            // dispatch(openSongAction(playsong));
        }
    };

    const currentSong = displaySong?.id ? displaySong : playsong;




    if (!currentSong?.id || hideMiniPlayer) return null;

    const effectiveDuration =
        trackDuration > 0
            ? trackDuration
            : Number(currentSong?.duration) > 0
                ? Number(currentSong.duration) > 1000
                    ? Number(currentSong.duration) / 1000
                    : Number(currentSong.duration)
                : 1;

    const progressPercent =
        effectiveDuration > 0
            ? Math.min(100, Math.max(0, (currentPosition / effectiveDuration) * 100))
            : 0;

    return (
        <View style={[styles.container, { bottom: bottomOffset }]}>
            {/* Clickable Info area */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={openFullPlayer}
                style={styles.infoTouchArea}
            >

                <Image
                    source={currentSong.cover_image_url ? GlobalImage(currentSong.cover_image_url) : GlobalImage(currentSong?.album_picture_url)}
                    style={styles.image}
                />

                <View style={styles.info}>
                    <AppText numberOfLines={1} style={styles.title}>
                        {currentSong.title || 'Unknown Song'}
                    </AppText>
                    <AppText numberOfLines={1} style={styles.artist}>
                        {currentSong.artist || currentSong.album_name || 'Unknown Artist'}
                    </AppText>
                </View>
            </TouchableOpacity>

            {/* Controls Row */}
            <View style={styles.actionsRow}>
                {/* Previous */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={handlePrevious}
                    disabled={switchingTrack}
                    hitSlop={{ top: 12, bottom: 12, left: 10, right: 8 }}
                >
                    <AppImage
                        source={Images.leftarrow}
                        width={12}
                        height={14}
                        tintColor="#FFFFFF"
                    />
                </TouchableOpacity>

                {/* Play / Pause */}
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayPause}
                    hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                >
                    {buffering || switchingTrack ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : playing ? (
                        <View style={styles.pauseContainer}>
                            <View style={styles.pauseLine} />
                            <View style={styles.pauseLine} />
                        </View>
                    ) : (
                        <AppImage
                            source={Images.playicon}
                            width={16}
                            height={16}
                            tintColor="#FFFFFF"
                        />
                    )}
                </TouchableOpacity>

                {/* Next */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={handleNext}
                    disabled={switchingTrack}
                    hitSlop={{ top: 12, bottom: 12, left: 8, right: 10 }}
                >
                    <View style={{ transform: [{ rotate: '180deg' }] }}>
                        <AppImage
                            source={Images.leftarrow}
                            width={12}
                            height={14}
                            tintColor="#FFFFFF"
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseMiniPlayer}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
            >
                <View style={styles.closeIcon}>
                    <View style={styles.closeLineOne} />
                    <View style={styles.closeLineTwo} />
                </View>
            </TouchableOpacity>

            {/* Live Progress Line */}
            <TouchableWithoutFeedback onPress={openFullPlayer}>
                <View style={styles.bottomProgressTrack}>
                    <View
                        style={[styles.bottomProgressFill, { width: `${progressPercent}%` }]}
                    />
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

export default MiniPlayer;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 10,
        right: 10,
        height: 58,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#181620',
        borderRadius: 14,
        paddingLeft: 10,
        paddingRight: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 999,
    },
    infoTouchArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#222',
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
        paddingRight: 6,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    artist: {
        color: 'rgba(255, 255, 255, 0.55)',
        fontSize: 11,
        marginTop: 2,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    controlButton: {
        padding: 8,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    pauseContainer: {
        flexDirection: 'row',
        gap: 3,
    },
    pauseLine: {
        width: 3,
        height: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 1.5,
    },
    bottomProgressTrack: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    bottomProgressFill: {
        height: 3,
        backgroundColor: '#FF2D55',
    },
    closeButton: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 2,
    },
    closeIcon: {
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeLineOne: {
        position: 'absolute',
        width: 14,
        height: 2,
        borderRadius: 1,
        backgroundColor: 'rgba(255,255,255,0.65)',
        transform: [{ rotate: '45deg' }],
    },
    closeLineTwo: {
        position: 'absolute',
        width: 14,
        height: 2,
        borderRadius: 1,
        backgroundColor: 'rgba(255,255,255,0.65)',
        transform: [{ rotate: '-45deg' }],
    },
});