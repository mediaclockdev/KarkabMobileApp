// src/services/player.ts

import TrackPlayer, { PlayerCommand } from '@rntp/player';

let initialized = false;

export const setupAudioPlayer = () => {
    if (initialized) {
        return true;
    }

    try {
        TrackPlayer.setupPlayer({
            contentType: 'music',
            handleAudioBecomingNoisy: true,

            android: {
                wakeMode: 'network',
                taskRemovedBehavior: 'continue',
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

        console.log('✅ TrackPlayer initialized');

        return true;
    } catch (error) {
        console.log('❌ TrackPlayer setup error:', error);
        return false;
    }
};