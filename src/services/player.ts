// src/services/player.ts

import TrackPlayer, { PlayerCommand } from '@rntp/player';
import type { Dispatch } from '@reduxjs/toolkit';

import { addsong } from '../auth/redux/authSlice';
import { saveLastPlayed, getLastPlayed } from './lastPlayed';
import ApiService from './api';
import apiUrls from './apiUrls';

let initialized = false;

export const setupAudioPlayer = async () => {
    if (initialized) return true;

    try {
        TrackPlayer.setupPlayer({
            contentType: 'music',
            handleAudioBecomingNoisy: true,

            android: {
                wakeMode: 'network',

                //continue Continue playing when the app is swiped away stop
                taskRemovedBehavior: 'stop',

                notification: {
                    channelId: 'karkab-music',
                    channelName: 'KarKab Music',
                    smallIcon: 'ic_notification',
                },
            },
        });

        TrackPlayer.setCommands({
            capabilities: [
                PlayerCommand.PlayPause,
                PlayerCommand.Next,
                PlayerCommand.Previous,
                PlayerCommand.Seek,
            ],
        });

        initialized = true;

        console.log('✅ TrackPlayer initialized successfully');

        return true;
    } catch (error) {
        console.log('❌ TrackPlayer setup error:', error);
        return false;
    }
};

export const playAdjacentSong = async (
    direction: 'next' | 'prev',
    dispatch: Dispatch,
) => {
    try {
        const activeTrack = TrackPlayer.getActiveMediaItem();

        if (!activeTrack?.mediaId) {
            console.log('❌ No active track');
            return;
        }

        const currentId = activeTrack.mediaId;

        const res = await ApiService.get(
            apiUrls.adjacentsong(currentId),
        );

        if (!(res as any).data?.success) {
            console.log('❌ Adjacent song API failed');
            return;
        }

        const targetSongRef =
            direction === 'next'
                ? (res as any).data.nextSong
                : (res as any).data.previousSong;

        if (!targetSongRef?.id) {
            console.log(`No ${direction} song available`);
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

        TrackPlayer.setMediaItem({
            mediaId: song.id.toString(),
            url: song.original_song || song.recording_url,
            title: song.title || 'Unknown Title',
            artist: song.artist || 'Unknown Artist',
            artworkUrl: song.cover_image_url || undefined,
            duration: Number(song.duration) || undefined,
        });

        await TrackPlayer.play();

        dispatch(addsong(song));

        saveLastPlayed(song);

        console.log(
            `🎧 Switched to ${direction}:`,
            song.title,
        );

        return song;
    } catch (error) {
        console.log(
            `❌ Adjacent ${direction} error:`,
            error,
        );

        const lastSong = getLastPlayed();

        if (lastSong) {
            dispatch(addsong(lastSong));
            await TrackPlayer.pause();
        }
    }
};

export const pauseCurrentSong = async () => {
    try {
        const activeTrack = TrackPlayer.getActiveMediaItem();

        if (activeTrack?.mediaId) {
            await TrackPlayer.pause();

            console.log(
                '⏸️ Last played song paused:',
                activeTrack.mediaId,
            );
        }
    } catch (error) {
        console.log('❌ Pause current song error:', error);
    }
};