// src/services/player.ts

import { Platform, PermissionsAndroid } from 'react-native';
import TrackPlayer, { PlayerCommand, type MediaItem } from '@rntp/player';
import type { Dispatch } from '@reduxjs/toolkit';

import {
    addsong,
    setPlaylistQueue,
    setPlaylistIndex,
} from '../auth/redux/authSlice';
import { saveLastPlayed, getLastPlayed } from './lastPlayed';
import ApiService from './api';
import apiUrls, { BASE_URL } from './apiUrls';
import { store } from '../app/store';

let initialized = false;
let isSwitchingSong = false;

/**
 * Normalizes an audio URL to an absolute URI that TrackPlayer can stream.
 */
export const getMediaAudioUrl = (url?: string | null): string => {
    if (!url || typeof url !== 'string') return '';
    const clean = url.trim();
    if (!clean || clean === 'null' || clean === 'undefined') return '';
    if (
        clean.startsWith('http://') ||
        clean.startsWith('https://') ||
        clean.startsWith('file://')
    ) {
        return clean;
    }
    const base = BASE_URL.replace(/\/$/, '');
    const path = clean.replace(/^\//, '');
    return `${base}/${path}`;
};

/**
 * Normalizes an artwork image URL to an absolute URL for lockscreen/notification display.
 */
export const getArtworkUrl = (url?: string | null): string | undefined => {
    if (!url || typeof url !== 'string') return undefined;
    const clean = url.trim();
    if (!clean || clean === 'null' || clean === 'undefined') return undefined;
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
        return clean;
    }
    const base = BASE_URL.replace(/\/$/, '');
    const path = clean.replace(/^\//, '');
    return `${base}/${path}`;
};

/**
 * Formats an individual song into a TrackPlayer MediaItem.
 */
export const formatSongToMediaItem = (
    song: any,
    index?: number,
): MediaItem | null => {
    if (!song?.id) return null;
    const rawAudio =
        song.original_song ||
        song.recording_url ||
        song.path ||
        song.url ||
        song.audio_url ||
        song.audio_file;
    const audioUrl = getMediaAudioUrl(rawAudio);
    if (!audioUrl) return null;

    const dur = Number(song.duration) || 0;
    const durationSec = dur > 1000 ? dur / 1000 : dur;
    const artwork = getArtworkUrl(
        song.cover_image_url ||
            song.cover_image ||
            song.image_url ||
            song.artwork ||
            (typeof song.image === 'string' ? song.image : undefined),
    );

    return {
        mediaId: song.id.toString(),
        url: audioUrl,
        title: song.title || song.song_name || song.name || 'Unknown Title',
        artist: song.artist || song.artist_name || song.singer || 'KarKab Music',
        artworkUrl: artwork,
        duration: durationSec > 0 ? durationSec : undefined,
        extras: {
            originalSong: song,
            queueIndex: typeof index === 'number' ? index : 0,
        },
    };
};

/**
 * Returns whether a track transition is currently active to prevent race conditions.
 */
export const isPlayerSwitching = () => isSwitchingSong;

/**
 * Initializes TrackPlayer for high-fidelity background music playback,
 * lock-screen controls, Bluetooth AVRCP, and Apple CarPlay / Android Auto.
 */
export const setupAudioPlayer = async () => {
    if (initialized) return true;

    try {
        // Request POST_NOTIFICATIONS permission on Android 13+ (API 33+)
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            try {
                const hasPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                );
                if (!hasPermission) {
                    await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                    );
                }
            } catch (permError) {
                console.log('Notification permission request error:', permError);
            }
        }

        TrackPlayer.setupPlayer({
            contentType: 'music',
            handleAudioBecomingNoisy: true, // Auto-pause on Bluetooth/headphone disconnect

            android: {
                wakeMode: 'network',
                // Keep playing even if user swipes app from recents
                taskRemovedBehavior: 'continue',

                notification: {
                    channelId: 'karkab-music',
                    channelName: 'KarKab Music',
                    smallIcon: 'ic_notification',
                },
            },
        });

        // Enable full lock-screen, notification bar, CarPlay & Bluetooth capabilities
        // Previous and Next occupy primary navigation slots (SLOT_BACK and SLOT_FORWARD)
        TrackPlayer.setCommands({
            capabilities: [
                PlayerCommand.PlayPause,
                PlayerCommand.Next,
                PlayerCommand.Previous,
                PlayerCommand.Seek,
                PlayerCommand.Stop,
            ],
            handling: 'js',
        });

        initialized = true;
        console.log('✅ TrackPlayer initialized successfully with album & playlist controls');
        return true;
    } catch (error) {
        console.log('❌ TrackPlayer setup error:', error);
        return false;
    }
};

/**
 * Plays an entire list of songs (album, playlist, artist mix, or search results)
 * starting at the specified index.
 * Fully registers the entire queue into TrackPlayer, enabling next/prev controls
 * on lock screen, Android notification bar, Apple CarPlay, and Bluetooth headsets/cars.
 */
export const playSongList = async (
    songs: any[],
    initialIndex: number = 0,
    autoPlay: boolean = true,
) => {
    try {
        if (!Array.isArray(songs) || songs.length === 0) {
            console.log('playSongList: Empty songs array provided');
            return null;
        }

        // Filter and map valid songs
        const mediaItems: MediaItem[] = [];
        const validSongs: any[] = [];

        songs.forEach((s, idx) => {
            const item = formatSongToMediaItem(s, idx);
            if (item) {
                mediaItems.push(item);
                validSongs.push(s);
            }
        });

        if (mediaItems.length === 0) {
            console.log('playSongList: No playable songs found in list');
            return null;
        }

        // Clamp initial index
        let targetIndex = initialIndex;
        if (targetIndex < 0 || targetIndex >= mediaItems.length) {
            targetIndex = 0;
        }

        console.log(
            `🎶 Loading queue of ${mediaItems.length} songs into TrackPlayer at index ${targetIndex} (${validSongs[targetIndex]?.title})`
        );

        // Load the full album / playlist queue into TrackPlayer
        await TrackPlayer.setMediaItems(mediaItems, targetIndex);

        if (autoPlay) {
            await TrackPlayer.play();
        } else {
            await TrackPlayer.pause();
        }

        // Synchronize Redux store
        const currentSong = validSongs[targetIndex];
        store.dispatch(
            setPlaylistQueue({
                songs: validSongs,
                initialIndex: targetIndex,
            })
        );
        store.dispatch(addsong(currentSong));
        saveLastPlayed(currentSong);

        return currentSong;
    } catch (error) {
        console.log('❌ playSongList error:', error);
        return null;
    }
};

/**
 * Plays a single song item. If a playlist queue is already in state,
 * checks if it belongs to that queue or falls back to queueing this song.
 */
export const playTrackSong = async (song: any, autoPlay: boolean = true) => {
    try {
        if (!song?.id) return null;

        // Check if Redux already has a queue containing this song
        const state = (store.getState() as any)?.auth;
        const currentQueue = state?.playlistQueue || [];
        if (Array.isArray(currentQueue) && currentQueue.length > 1) {
            const songIndex = currentQueue.findIndex(
                (s: any) => s.id?.toString() === song.id?.toString()
            );
            if (songIndex !== -1) {
                return await playSongList(currentQueue, songIndex, autoPlay);
            }
        }

        // Otherwise play as single item with full media item metadata
        const mediaItem = formatSongToMediaItem(song, 0);
        if (!mediaItem) {
            console.log('❌ playTrackSong: Could not format media item for song', song.title);
            return null;
        }

        await TrackPlayer.setMediaItem(mediaItem);

        if (autoPlay) {
            await TrackPlayer.play();
        } else {
            await TrackPlayer.pause();
        }

        store.dispatch(setPlaylistQueue({ songs: [song], initialIndex: 0 }));
        store.dispatch(addsong(song));
        saveLastPlayed(song);

        return song;
    } catch (error) {
        console.log('❌ playTrackSong error:', error);
        return null;
    }
};

/**
 * Handles skipping to the next song:
 * 1. Checks TrackPlayer's native queue (album / playlist).
 * 2. Checks Redux playlistQueue.
 * 3. Falls back to adjacent song API if at the end of the album/list.
 */
export const skipToNextTrack = async (dispatch?: Dispatch) => {
    if (isSwitchingSong) return;

    isSwitchingSong = true;
    try {
        // 1. Check native TrackPlayer queue
        const queue = await TrackPlayer.getQueue();
        const activeIndex = await TrackPlayer.getActiveMediaItemIndex();

        if (
            queue &&
            queue.length > 1 &&
            activeIndex !== null &&
            activeIndex < queue.length - 1
        ) {
            console.log(`⏭️ [Queue] Skipping to next album track: ${activeIndex + 1}/${queue.length}`);
            await TrackPlayer.skipToNext();
            const nextIdx = activeIndex + 1;
            if (queue[nextIdx]) {
                await syncTrackTransition(queue[nextIdx], nextIdx);
            }
            return;
        }

        // 2. Check Redux playlist queue
        const authState = (store.getState() as any)?.auth;
        const reduxQueue = authState?.playlistQueue || [];
        let reduxIndex = authState?.playlistIndex ?? -1;

        if (Array.isArray(reduxQueue) && reduxQueue.length > 1) {
            if (reduxIndex < 0) {
                const currentId = (await TrackPlayer.getActiveMediaItem())?.mediaId || authState?.playsong?.id;
                if (currentId) {
                    reduxIndex = reduxQueue.findIndex(
                        (s: any) => s.id?.toString() === currentId.toString()
                    );
                }
            }

            if (reduxIndex >= 0 && reduxIndex < reduxQueue.length - 1) {
                const nextIdx = reduxIndex + 1;
                console.log(`⏭️ [ReduxQueue] Playing next track in list at index ${nextIdx}`);
                await playSongList(reduxQueue, nextIdx, true);
                return;
            }
        }

        // 3. Reached end of album/playlist: fallback to adjacent song recommendation API
        console.log('⏭️ [API] End of queue reached, querying adjacent song API...');
        await playAdjacentSong('next', dispatch);
    } catch (error) {
        console.log('❌ skipToNextTrack error:', error);
        await playAdjacentSong('next', dispatch);
    } finally {
        setTimeout(() => {
            isSwitchingSong = false;
        }, 600);
    }
};

/**
 * Handles skipping to the previous song:
 * 1. Restarts current track if > 3s in.
 * 2. Checks TrackPlayer's native queue (album / playlist).
 * 3. Checks Redux playlistQueue.
 * 4. Falls back to adjacent song API if at start.
 */
export const skipToPreviousTrack = async (dispatch?: Dispatch) => {
    if (isSwitchingSong) return;

    isSwitchingSong = true;
    try {
        // If more than 3 seconds in, restart track
        try {
            const progress = await TrackPlayer.getProgress();
            if (progress && progress.position > 3) {
                console.log('⏮️ Restarting current track (played > 3s)');
                await TrackPlayer.seekTo(0);
                return;
            }
        } catch (e) {}

        // 1. Check native TrackPlayer queue
        const queue = await TrackPlayer.getQueue();
        const activeIndex = await TrackPlayer.getActiveMediaItemIndex();

        if (
            queue &&
            queue.length > 1 &&
            activeIndex !== null &&
            activeIndex > 0
        ) {
            console.log(`⏮️ [Queue] Skipping to previous album track: ${activeIndex - 1}/${queue.length}`);
            await TrackPlayer.skipToPrevious();
            const prevIdx = activeIndex - 1;
            if (queue[prevIdx]) {
                await syncTrackTransition(queue[prevIdx], prevIdx);
            }
            return;
        }

        // 2. Check Redux playlist queue
        const authState = (store.getState() as any)?.auth;
        const reduxQueue = authState?.playlistQueue || [];
        let reduxIndex = authState?.playlistIndex ?? -1;

        if (Array.isArray(reduxQueue) && reduxQueue.length > 1) {
            if (reduxIndex < 0) {
                const currentId = (await TrackPlayer.getActiveMediaItem())?.mediaId || authState?.playsong?.id;
                if (currentId) {
                    reduxIndex = reduxQueue.findIndex(
                        (s: any) => s.id?.toString() === currentId.toString()
                    );
                }
            }

            if (reduxIndex > 0) {
                const prevIdx = reduxIndex - 1;
                console.log(`⏮️ [ReduxQueue] Playing previous track in list at index ${prevIdx}`);
                await playSongList(reduxQueue, prevIdx, true);
                return;
            }
        }

        // 3. Beginning of queue: fallback to adjacent song API
        console.log('⏮️ [API] Start of queue reached, querying adjacent song API...');
        await playAdjacentSong('prev', dispatch);
    } catch (error) {
        console.log('❌ skipToPreviousTrack error:', error);
        await playAdjacentSong('prev', dispatch);
    } finally {
        setTimeout(() => {
            isSwitchingSong = false;
        }, 600);
    }
};

/**
 * Synchronizes Redux store when TrackPlayer transitions tracks in a queue
 * (e.g., auto-advancing at the end of a track, or lockscreen/CarPlay skip).
 */
export const syncTrackTransition = async (
    item: MediaItem | null,
    index: number,
) => {
    if (!item) return;

    try {
        console.log(`🔄 Syncing track transition at index ${index}:`, item.title);

        let song = (item.extras as any)?.originalSong;

        if (!song) {
            const queue = (store.getState() as any)?.auth?.playlistQueue || [];
            song =
                queue[index] ||
                queue.find(
                    (s: any) => s.id?.toString() === item.mediaId?.toString()
                );
        }

        if (song) {
            store.dispatch(setPlaylistIndex(index));
            store.dispatch(addsong(song));
            saveLastPlayed(song);
        }
    } catch (e) {
        console.log('❌ syncTrackTransition error:', e);
    }
};

/**
 * Switches to adjacent track using the KarKab API.
 */
export const playAdjacentSong = async (
    direction: 'next' | 'prev',
    dispatch?: Dispatch,
) => {
    try {
        let currentId: string | number | null = null;

        try {
            const activeTrack = TrackPlayer.getActiveMediaItem();
            if (activeTrack?.mediaId) {
                currentId = activeTrack.mediaId;
            }
        } catch (e) {}

        const currentAuthState = (store.getState() as any)?.auth;
        if (!currentId) {
            currentId = currentAuthState?.playsong?.id;
        }

        if (!currentId) {
            const last = getLastPlayed();
            currentId = last?.id;
        }

        if (!currentId) {
            console.log(`❌ No active song ID found for ${direction}`);
            return;
        }

        console.log(`🔄 Fetching ${direction} song for ID:`, currentId);

        const res = await ApiService.get(apiUrls.adjacentsong(currentId));

        if (!(res as any).data?.success) {
            console.log('❌ Adjacent song API failed');
            return;
        }

        const targetSongRef =
            direction === 'next'
                ? (res as any).data.nextSong
                : (res as any).data.previousSong;

        if (!targetSongRef?.id) {
            console.log(`⚠️ No ${direction} song available from adjacent API, querying random song fallback...`);
            const randomRes = await ApiService.get(apiUrls.randomsong);
            if ((randomRes as any).data?.success && (randomRes as any).data.songs?.length > 0) {
                const randomSong = (randomRes as any).data.songs[0];
                await playTrackSong(randomSong, true);
                const d = dispatch || store.dispatch;
                d(addsong(randomSong));
                return randomSong;
            }
            return;
        }

        const detailRes = await ApiService.get(
            apiUrls.singlesongdetail(targetSongRef.id),
        );

        if (!(detailRes as any).data?.success) {
            console.log('❌ Song detail API failed');
            return;
        }

        const song = (detailRes as any).data.song || (detailRes as any).data.recording;

        if (!song) {
            console.log('❌ Song object missing in API response');
            return;
        }

        await playTrackSong(song, true);

        const d = dispatch || store.dispatch;
        d(addsong(song));

        console.log(`🎧 Switched to ${direction}:`, song.title);
        return song;
    } catch (error) {
        console.log(`❌ Adjacent ${direction} error:`, error);
        const lastSong = getLastPlayed();
        if (lastSong) {
            const d = dispatch || store.dispatch;
            d(addsong(lastSong));
        }
    }
};

export const pauseCurrentSong = async () => {
    try {
        await TrackPlayer.pause();
        console.log('⏸️ Audio playback paused');
    } catch (error) {
        console.log('❌ Pause current song error:', error);
    }
};

export const resumeCurrentSong = async () => {
    try {
        await TrackPlayer.play();
        console.log('▶️ Audio playback resumed');
    } catch (error) {
        console.log('❌ Resume current song error:', error);
    }
};

export const togglePlayPause = async () => {
    try {
        const isPlaying = TrackPlayer.isPlaying();
        if (isPlaying) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    } catch (error) {
        console.log('❌ Toggle play/pause error:', error);
    }
};