// service.js
import TrackPlayer, { Event, registerRemoteHandlers } from '@rntp/player';
import { playAdjacentSong } from './src/services/player';
import { store } from './src/app/store';

/**
 * Headless & background playback service for TrackPlayer.
 * Handles lock screen controls, Android notification buttons,
 * Bluetooth headphones / steering wheel buttons, and Apple CarPlay / Android Auto.
 */
export default async function playbackService() {
    console.log('🎵 Initializing background playback service handlers...');

    // 1. Register modern Remote Handlers (RNTP 5.11+)
    try {
        if (typeof registerRemoteHandlers === 'function') {
            registerRemoteHandlers({
                play: async () => {
                    console.log('🎧 [RemoteHandler] Play requested');
                    await TrackPlayer.play();
                },
                pause: async () => {
                    console.log('🎧 [RemoteHandler] Pause requested');
                    await TrackPlayer.pause();
                },
                stop: async () => {
                    console.log('🎧 [RemoteHandler] Stop requested');
                    await TrackPlayer.stop();
                },
                next: async () => {
                    console.log('🎧 [RemoteHandler] Next song requested');
                    await playAdjacentSong('next', store.dispatch);
                },
                previous: async () => {
                    console.log('🎧 [RemoteHandler] Previous song requested');
                    await playAdjacentSong('prev', store.dispatch);
                },
                seek: async (cmd) => {
                    if (cmd && typeof cmd.position === 'number') {
                        console.log('🎧 [RemoteHandler] Seek to:', cmd.position);
                        await TrackPlayer.seekTo(cmd.position);
                    }
                },
                skipForward: async (cmd) => {
                    const interval = cmd?.interval || 15;
                    console.log('🎧 [RemoteHandler] Skip forward:', interval);
                    await TrackPlayer.seekBy(interval);
                },
                skipBackward: async (cmd) => {
                    const interval = cmd?.interval || 15;
                    console.log('🎧 [RemoteHandler] Skip backward:', interval);
                    await TrackPlayer.seekBy(-interval);
                },
            });
        }
    } catch (e) {
        console.log('Notice: registerRemoteHandlers not available on this platform adapter:', e);
    }

    // 2. Register Universal Remote Event Listeners
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        console.log('🎧 [RemoteEvent] Play');
        await TrackPlayer.play();
    });

    TrackPlayer.addEventListener(Event.RemotePause, async () => {
        console.log('🎧 [RemoteEvent] Pause');
        await TrackPlayer.pause();
    });

    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        console.log('🎧 [RemoteEvent] Next Track');
        await playAdjacentSong('next', store.dispatch);
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        console.log('🎧 [RemoteEvent] Previous Track');
        await playAdjacentSong('prev', store.dispatch);
    });

    TrackPlayer.addEventListener(Event.RemoteStop, async () => {
        console.log('🎧 [RemoteEvent] Stop');
        await TrackPlayer.stop();
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
        if (event && typeof event.position === 'number') {
            console.log('🎧 [RemoteEvent] Seek to:', event.position);
            await TrackPlayer.seekTo(event.position);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteSkipForward, async (event) => {
        const interval = event?.interval || 15;
        console.log('🎧 [RemoteEvent] Skip Forward:', interval);
        await TrackPlayer.seekBy(interval);
    });

    TrackPlayer.addEventListener(Event.RemoteSkipBackward, async (event) => {
        const interval = event?.interval || 15;
        console.log('🎧 [RemoteEvent] Skip Backward:', interval);
        await TrackPlayer.seekBy(-interval);
    });

    // 3. Auto-advance to next song when current track finishes playing in background / lock screen
    TrackPlayer.addEventListener(Event.PlaybackStateChanged, async (event) => {
        if (event && event.state === 'ended') {
            console.log('🎵 [BackgroundService] Track ended, auto-advancing to next song...');
            await playAdjacentSong('next', store.dispatch);
        }
    });
}

export { playbackService, playbackService as PlaybackService };
