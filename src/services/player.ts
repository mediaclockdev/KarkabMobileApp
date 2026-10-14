// src/services/player.ts

import { Platform, PermissionsAndroid } from 'react-native';
import TrackPlayer, { PlayerCommand } from '@rntp/player';
import type { Dispatch } from '@reduxjs/toolkit';

import { addsong } from '../auth/redux/authSlice';
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
 * Initializes TrackPlayer for high-fidelity background music playback,
 * lock-screen controls, Bluetooth AVRCP, and Apple CarPlay / Android Auto.
 */
export const setupAudioPlayer = async () => {
    if (initialized) return true;

    try {
        // Request POST_NOTIFICATIONS permission on Android 13+ (API 33+)
        // Required for MediaStyle notification and lock screen playback controls.
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
            handleAudioBecomingNoisy: true, // Pauses audio when Bluetooth/headphones disconnect

            android: {
                wakeMode: 'network',
<<<<<<< Updated upstream

                //continue Continue playing when the app is swiped away stop
                taskRemovedBehavior: 'stop',
=======
                // Keep playing even if user swipes the app away from recents
                taskRemovedBehavior: 'continue',
>>>>>>> Stashed changes

                notification: {
                    channelId: 'karkab-music',
                    channelName: 'KarKab Music',
                    smallIcon: 'ic_notification',
                },
            },
        });

        // Set capabilities for Lock Screen, Notification shade, Bluetooth, and CarPlay
        TrackPlayer.setCommands({
            capabilities: [
                PlayerCommand.PlayPause,
                PlayerCommand.Next,
                PlayerCommand.Previous,
                PlayerCommand.Seek,
                PlayerCommand.Stop,
                PlayerCommand.SkipForward,
                PlayerCommand.SkipBackward,
            ],
            handling: 'js',
            forwardInterval: 15,
            backwardInterval: 15,
        });

        initialized = true;
        console.log('✅ TrackPlayer initialized successfully for background & car play');
        return true;
    } catch (error) {
        console.log('❌ TrackPlayer setup error:', error);
        return false;
    }
};

/**
 * Directly plays a given song object using TrackPlayer.
 * Updates TrackPlayer media item, Redux state, and lastPlayed cache.
 */
export const playTrackSong = async (song: any, autoPlay: boolean = true) => {
    try {
        if (!song?.id) return null;

        const rawAudio = song.original_song || song.recording_url;
        const audioUrl = getMediaAudioUrl(rawAudio);
        if (!audioUrl) {
            console.log('❌ playTrackSong: No valid audio URL for song', song.id, song.title);
            return null;
        }

        const dur = Number(song.duration) || 0;
        const durationSec = dur > 1000 ? dur / 1000 : dur;
        const artwork = getArtworkUrl(song.cover_image_url);

        await TrackPlayer.setMediaItem({
            mediaId: song.id.toString(),
            url: audioUrl,
            title: song.title || 'Unknown Title',
            artist: song.artist || 'KarKab Music',
            artworkUrl: artwork,
            duration: durationSec > 0 ? durationSec : undefined,
        });

        if (autoPlay) {
            await TrackPlayer.play();
        } else {
            await TrackPlayer.pause();
        }

        store.dispatch(addsong(song));
        saveLastPlayed(song);

        return song;
    } catch (error) {
        console.log('❌ playTrackSong error:', error);
        return null;
    }
};

/**
 * Switches to adjacent track (next or previous) using the KarKab API.
 * Works seamlessly in foreground, background, lockscreen, CarPlay, and Bluetooth.
 */
export const playAdjacentSong = async (
    direction: 'next' | 'prev',
    dispatch?: Dispatch,
) => {
    if (isSwitchingSong) {
        console.log(`⏳ Track switch already in progress, ignoring duplicate ${direction}`);
        return;
    }

    // If recording screen is active (mini player hidden), do not advance
    const currentAuthState = (store.getState() as any)?.auth;
    if (currentAuthState?.hideMiniPlayer) {
        console.log('⚠️ Skipping adjacent song switch because recording is active');
        return;
    }

    isSwitchingSong = true;
    try {
        let currentId: string | number | null = null;

        try {
            const activeTrack = TrackPlayer.getActiveMediaItem();
            if (activeTrack?.mediaId) {
                currentId = activeTrack.mediaId;
            }
        } catch (e) {
            console.log('Error reading active media item:', e);
        }

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
            console.log(`⚠️ No ${direction} song available in playlist/queue`);
            return;
        }

        const detailRes = await ApiService.get(
            apiUrls.singlesongdetail(targetSongRef.id),
        );

        if (!(detailRes as any).data?.success) {
            console.log('❌ Song detail API failed');
            return;
        }

        const song = (detailRes as any).data.song;

        await playTrackSong(song, true);

        if (dispatch) {
            dispatch(addsong(song));
        }

        console.log(`🎧 Switched to ${direction}:`, song.title);
        return song;
    } catch (error) {
        console.log(`❌ Adjacent ${direction} error:`, error);
        const lastSong = getLastPlayed();
        if (lastSong) {
            const d = dispatch || store.dispatch;
            d(addsong(lastSong));
        }
    } finally {
        setTimeout(() => {
            isSwitchingSong = false;
        }, 800);
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