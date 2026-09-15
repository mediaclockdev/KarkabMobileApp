import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppText from './AppText';
import AppImage from './AppImage';

import { Images } from '../constants/media';
import { color } from '../constants/color';
import { useAppSelector } from '../hooks/useAppSelector';
import { GlobalImage } from '../utils/GlobalImage';

import TrackPlayer, {
    useIsPlaying,
    usePlaybackState,
    PlaybackState,
} from '@rntp/player';

interface MiniPlayerProps {
    onNext?: () => void;
    onPrevious?: () => void;
}

const MiniPlayer = ({
    onNext,
    onPrevious,
}: MiniPlayerProps) => {
    const playing = useIsPlaying();
    const playbackState = usePlaybackState();

    const buffering =
        playbackState === PlaybackState.Loading ||
        playbackState === PlaybackState.Buffering;

    const playsong = useAppSelector(
        (state: any) => state.auth.playsong,
    );

    /**
     * Play the song selected in Redux.
     *
     * IMPORTANT:
     * Do not reset the entire queue here if you are
     * already maintaining a playlist queue.
     */
    useEffect(() => {
        if (!playsong?.id || !playsong?.song_url) {
            return;
        }

        const activeSong =
            TrackPlayer.getActiveMediaItem();

        if (
            activeSong?.mediaId ===
            playsong.id.toString()
        ) {
            return;
        }

        playNewSong();
    }, [playsong?.id]);

    const playNewSong = () => {
        try {
            if (!playsong?.id || !playsong?.song_url) {
                console.log('NO SONG DATA');
                return;
            }

            const mediaItem = {
                mediaId: playsong.id.toString(),
                url: playsong.song_url,
                title:
                    playsong.title ||
                    'Unknown Song',
                artist:
                    playsong.artist ||
                    'Unknown Artist',
                artworkUrl:
                    playsong.cover_image_url ||
                    undefined,
                duration:
                    Number(playsong.duration) ||
                    undefined,
            };

            console.log(
                'PLAYING SONG:',
                mediaItem,
            );

            /**
             * This creates a single-song queue.
             *
             * If you have a playlist, DO NOT use this.
             * Instead, load the complete playlist into
             * TrackPlayer.
             */
            TrackPlayer.setMediaItem(
                mediaItem,
            );

            TrackPlayer.play();
        } catch (error) {
            console.log(
                'PLAY SONG ERROR:',
                error,
            );
        }
    };

    /**
     * Play / Pause
     */
    const handlePlayPause = () => {
        try {
            if (buffering) {
                return;
            }

            if (playing) {
                TrackPlayer.pause();
            } else {
                TrackPlayer.play();
            }
        } catch (error) {
            console.log(
                'PLAY PAUSE ERROR:',
                error,
            );
        }
    };

    /**
     * Previous
     *
     * IMPORTANT:
     * Do NOT reset the player.
     */
    const handlePrevious = () => {
        try {
            const index =
                TrackPlayer.getActiveMediaItemIndex();

            const queue =
                TrackPlayer.getQueue();

            if (
                index !== null &&
                index > 0 &&
                queue.length > 1
            ) {
                TrackPlayer.skipToPrevious();
                return;
            }

            /**
             * Fallback to your existing app logic
             * if TrackPlayer has no previous item.
             */
            onPrevious?.();
        } catch (error) {
            console.log(
                'PREVIOUS SONG ERROR:',
                error,
            );
        }
    };

    /**
     * Next
     *
     * IMPORTANT:
     * Do NOT reset the player.
     */
    const handleNext = () => {
        try {
            const index =
                TrackPlayer.getActiveMediaItemIndex();

            const queue =
                TrackPlayer.getQueue();

            if (
                index !== null &&
                index < queue.length - 1 &&
                queue.length > 1
            ) {
                TrackPlayer.skipToNext();
                return;
            }

            /**
             * Fallback to your existing app logic
             * if TrackPlayer has no next item.
             */
            onNext?.();
        } catch (error) {
            console.log(
                'NEXT SONG ERROR:',
                error,
            );
        }
    };

    if (!playsong?.id) {
        return null;
    }

    return (
        <View style={styles.container}>

            {/* Album Image */}
            <Image
                source={
                    GlobalImage(
                        playsong.cover_image_url,
                    ) || Images.singericon
                }
                style={styles.image}
            />

            {/* Song Information */}
            <View style={styles.info}>
                <AppText
                    numberOfLines={1}
                    style={styles.title}
                >
                    {playsong.title ||
                        'Unknown Song'}
                </AppText>

                <AppText
                    numberOfLines={1}
                    style={styles.artist}
                >
                    {playsong.artist ||
                        'Unknown Artist'}
                </AppText>
            </View>

            {/* Like */}
            <TouchableOpacity
                style={styles.smallButton}
                activeOpacity={0.7}
            >
                <AppImage
                    source={Images.like}
                    height={16}
                    width={16}
                />
            </TouchableOpacity>

            {/* Previous */}
            <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePrevious}
                activeOpacity={0.7}
            >
                <AppText
                    style={styles.previousIcon}
                >
                    ‹
                </AppText>
            </TouchableOpacity>

            {/* Play / Pause */}
            <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                activeOpacity={0.8}
            >
                {buffering ? (
                    <ActivityIndicator
                        size="small"
                        color={
                            color.darkthemetext
                        }
                    />
                ) : playing ? (
                    <View
                        style={
                            styles.pauseContainer
                        }
                    >
                        <View
                            style={[
                                styles.pauseLine,
                                {
                                    backgroundColor:
                                        color.darkthemetext,
                                },
                            ]}
                        />

                        <View
                            style={[
                                styles.pauseLine,
                                {
                                    backgroundColor:
                                        color.darkthemetext,
                                },
                            ]}
                        />
                    </View>
                ) : (
                    <View
                        style={
                            styles.playTriangle
                        }
                    />
                )}
            </TouchableOpacity>

            {/* Next */}
            <TouchableOpacity
                style={styles.controlButton}
                onPress={handleNext}
                activeOpacity={0.7}
            >
                <AppText
                    style={styles.nextIcon}
                >
                    ›
                </AppText>
            </TouchableOpacity>
        </View>
    );
};

export default MiniPlayer;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 78,
        left: 8,
        right: 8,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111111',
        borderRadius: 12,
        paddingHorizontal: 10,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },

    image: {
        width: 36,
        height: 36,
        borderRadius: 6,
    },

    info: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },

    title: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
    },

    artist: {
        color: '#aaaaaa',
        fontSize: 11,
        marginTop: 1,
    },

    smallButton: {
        padding: 6,
        marginRight: 4,
    },

    controlButton: {
        padding: 8,
    },

    previousIcon: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '300',
    },

    nextIcon: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '300',
    },

    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },

    pauseContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 10,
        height: 12,
    },

    pauseLine: {
        width: 3,
        height: 12,
        borderRadius: 1,
    },

    playTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 12,
        borderTopWidth: 7,
        borderBottomWidth: 7,
        borderLeftColor: '#ffffff',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        marginLeft: 3,
    },
});