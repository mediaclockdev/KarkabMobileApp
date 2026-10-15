import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import TrackPlayer, {
    useIsPlaying,
    usePlaybackState,
    PlaybackState,
} from '@rntp/player';

import AppText from './AppText';
import AppImage from './AppImage';
import { Images } from '../constants/media';
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector';
import { GlobalImage } from '../utils/GlobalImage';
import { addsong, openSongAction } from '../../auth/redux/authSlice';
import {
    skipToNextTrack,
    skipToPreviousTrack,
    playTrackSong,
    isPlayerSwitching,
} from '../../services/player';

interface MiniPlayerProps {
    onNext?: () => void;
    onPrevious?: () => void;
    bottomOffset?: number;
}

const MiniPlayer = ({ onNext, onPrevious, bottomOffset = 78 }: MiniPlayerProps) => {
    const dispatch = useAppDispatch();
    const playing = useIsPlaying();
    const playbackState = usePlaybackState();

    const hideMiniPlayer = useAppSelector(
        (state: any) => state.auth.hideMiniPlayer
    );
    const playsong = useAppSelector((state: any) => state.auth.playsong);

    const buffering =
        playbackState === PlaybackState.Buffering ||
        (playbackState as any) === 'loading';

    // Real-time progress state
    const [currentPosition, setCurrentPosition] = useState(0);
    const [trackDuration, setTrackDuration] = useState(0);
    const [switchingTrack, setSwitchingTrack] = useState(false);
    const isAutoNextingRef = useRef(false);
    const isInitialMount = useRef(true);

    /**
     * 1. ACTIVE PROGRESS POLLING
     */
    useEffect(() => {
        if (!playsong?.id || hideMiniPlayer) return;

        const interval = setInterval(async () => {
            try {
                const progress = await TrackPlayer.getProgress();
                if (progress) {
                    const pos = progress.position > 10000 ? progress.position / 1000 : progress.position;
                    const dur = progress.duration > 10000 ? progress.duration / 1000 : progress.duration;

                    setCurrentPosition(pos || 0);
                    if (dur && dur > 0) {
                        setTrackDuration(dur);
                    }
                }
            } catch (e) {}
        }, 250);

        return () => clearInterval(interval);
    }, [playsong?.id, hideMiniPlayer]);

    // Handle Playback State Ended (auto-advance)
    useEffect(() => {
        if (
            (playbackState === PlaybackState.Ended || (playbackState as any) === 'ended') &&
            !isAutoNextingRef.current
        ) {
            handleNext();
        }
    }, [playbackState]);

    /**
     * 2. LOAD SONG WHEN REDUX SONG CHANGES OR ON APP MOUNT
     */
    useEffect(() => {
        if (!playsong?.id) {
            pauseSongItem();
            return;
        }

        // Avoid re-triggering playback if a track switch is already in progress
        if (isPlayerSwitching() || switchingTrack) {
            console.log('Track switch in progress, skipping playSongItem reload');
            return;
        }

        try {
            const activeSong = TrackPlayer.getActiveMediaItem();
            if (activeSong?.mediaId === playsong.id.toString()) {
                const dur = Number(playsong.duration) || 0;
                if (dur > 0) {
                    setTrackDuration(dur > 1000 ? dur / 1000 : dur);
                }
                return;
            }

            const autoPlay = !isInitialMount.current;
            isInitialMount.current = false;

            playSongItem(playsong, autoPlay);
        } catch (e) {
            const autoPlay = !isInitialMount.current;
            isInitialMount.current = false;

            playSongItem(playsong, autoPlay);
        }
    }, [playsong?.id]);

    const pauseSongItem = async () => {
        try {
            await TrackPlayer.pause();
        } catch (e) {}
    };

    const playSongItem = async (song: any, autoPlay: boolean = true) => {
        try {
            if (!song?.id) return;

            const activeSong = TrackPlayer.getActiveMediaItem();
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
        if (switchingTrack || !playsong?.id) return;

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
            dispatch(addsong(''));
        } catch (error) {
            console.log('CLOSE MINI PLAYER ERROR:', error);
        }
    };

    /**
     * 6. NEXT SONG
     */
    const handleNext = async () => {
        if (switchingTrack || isAutoNextingRef.current || !playsong?.id) return;

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
        if (playsong?.id) {
            dispatch(openSongAction(playsong));
        }
    };

    if (!playsong?.id || hideMiniPlayer) return null;

    const effectiveDuration =
        trackDuration > 0
            ? trackDuration
            : Number(playsong?.duration) > 0
                ? Number(playsong.duration) > 1000
                    ? Number(playsong.duration) / 1000
                    : Number(playsong.duration)
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
                    source={GlobalImage(playsong.cover_image_url) || Images.singericon}
                    style={styles.image}
                />

                <View style={styles.info}>
                    <AppText numberOfLines={1} style={styles.title}>
                        {playsong.title || 'Unknown Song'}
                    </AppText>
                    <AppText numberOfLines={1} style={styles.artist}>
                        {playsong.artist || 'Unknown Artist'}
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