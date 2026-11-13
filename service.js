// // service.js
// import TrackPlayer, { Event, registerRemoteHandlers } from '@rntp/player';
// import {
//     skipToNextTrack,
//     skipToPreviousTrack,
//     syncTrackTransition,
// } from './src/services/player';
// import { store } from './src/app/store';

// /**
//  * Headless & background playback service for TrackPlayer.
//  * Handles lock screen controls, Android notification buttons,
//  * Bluetooth headphones / steering wheel buttons, and Apple CarPlay / Android Auto.
//  */
// export default async function playbackService() {
//     console.log('🎵 Initializing background playback service handlers...');

//     // 1. Register modern Remote Handlers (RNTP 5.11+)
//     try {
//         if (typeof registerRemoteHandlers === 'function') {
//             registerRemoteHandlers({
//                 play: async () => {
//                     console.log('🎧 [RemoteHandler] Play requested');
//                     await TrackPlayer.play();
//                 },
//                 pause: async () => {
//                     console.log('🎧 [RemoteHandler] Pause requested');
//                     await TrackPlayer.pause();
//                 },
//                 stop: async () => {
//                     console.log('🎧 [RemoteHandler] Stop requested');
//                     await TrackPlayer.stop();
//                 },
//                 next: async () => {
//                     console.log('🎧 [RemoteHandler] Next song requested');
//                     await skipToNextTrack(store.dispatch);
//                 },
//                 previous: async () => {
//                     console.log('🎧 [RemoteHandler] Previous song requested');
//                     await skipToPreviousTrack(store.dispatch);
//                 },
//                 seek: async (cmd) => {
//                     if (cmd && typeof cmd.position === 'number') {
//                         console.log('🎧 [RemoteHandler] Seek to:', cmd.position);
//                         await TrackPlayer.seekTo(cmd.position);
//                     }
//                 },
//                 skipForward: async () => {
//                     console.log('🎧 [RemoteHandler] Skip forward requested -> skipping to next track');
//                     await skipToNextTrack(store.dispatch);
//                 },
//                 skipBackward: async () => {
//                     console.log('🎧 [RemoteHandler] Skip backward requested -> skipping to prev track');
//                     await skipToPreviousTrack(store.dispatch);
//                 },
//             });
//         }
//     } catch (e) {
//         console.log('Notice: registerRemoteHandlers not available on this platform adapter:', e);
//     }

//     // 2. Register Universal Remote Event Listeners
//     TrackPlayer.addEventListener(Event.RemotePlay, async () => {
//         console.log('🎧 [RemoteEvent] Play');
//         await TrackPlayer.play();
//     });

//     TrackPlayer.addEventListener(Event.RemotePause, async () => {
//         console.log('🎧 [RemoteEvent] Pause');
//         await TrackPlayer.pause();
//     });

//     TrackPlayer.addEventListener(Event.RemoteNext, async () => {
//         console.log('🎧 [RemoteEvent] Next Track');
//         await skipToNextTrack(store.dispatch);
//     });

//     TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
//         console.log('🎧 [RemoteEvent] Previous Track');
//         await skipToPreviousTrack(store.dispatch);
//     });

//     TrackPlayer.addEventListener(Event.RemoteStop, async () => {
//         console.log('🎧 [RemoteEvent] Stop');
//         await TrackPlayer.stop();
//     });

//     TrackPlayer.addEventListener(Event.RemoteSeek, async (event) => {
//         if (event && typeof event.position === 'number') {
//             console.log('🎧 [RemoteEvent] Seek to:', event.position);
//             await TrackPlayer.seekTo(event.position);
//         }
//     });

//     TrackPlayer.addEventListener(Event.RemoteSkipForward, async () => {
//         console.log('🎧 [RemoteEvent] Skip Forward -> Next Track');
//         await skipToNextTrack(store.dispatch);
//     });

//     TrackPlayer.addEventListener(Event.RemoteSkipBackward, async () => {
//         console.log('🎧 [RemoteEvent] Skip Backward -> Previous Track');
//         await skipToPreviousTrack(store.dispatch);
//     });

//     // 3. Track transition listener: automatically synchronizes Redux & storage when track changes
//     let lastTransitionMediaId: string | null = null;
//     TrackPlayer.addEventListener(Event.MediaItemTransition, async (event) => {
//         if (event && event.item) {
//             // Deduplicate: skip if this is the same media item as the last transition
//             // (prevents double-firing when addMediaItem triggers MediaItemTransition)
//             const incomingId = event.item.mediaId?.toString() ?? null;
//             if (incomingId && incomingId === lastTransitionMediaId) {
//                 console.log('⚠️ [BackgroundService] Skipping duplicate MediaItemTransition for:', event.item.title);
//                 return;
//             }
//             lastTransitionMediaId = incomingId;

//             console.log('🎵 [BackgroundService] MediaItemTransition to:', event.item.title, 'index:', event.index);
//             await syncTrackTransition(event.item, event.index);
//         }
//     });

//     // 4. Auto-advance to next song when current track finishes playing in background / lock screen
//     TrackPlayer.addEventListener(Event.PlaybackStateChanged, async (event) => {
//         if (event && event.state === 'ended') {
//             console.log('🎵 [BackgroundService] Track ended, advancing to next song...');
//             await skipToNextTrack(store.dispatch);
//         }
//     });
// }

// export { playbackService, playbackService as PlaybackService };




// service.js
import TrackPlayer, { Event, PlaybackState } from '@rntp/player';
import * as RNTP from '@rntp/player';

import {
  handlePlaybackQueueEnded,
  pauseCurrentSong,
  resumeCurrentSong,
  seekTo,
  markPlaybackStarted,
  tryAudioFallback,
  skipToNextTrack,
  skipToPreviousTrack,
  stopCurrentSong,
  syncTrackTransition,
} from './src/services/player';
import { timingPlayerState } from './src/services/playbackTimings';

let serviceRegistered = false;

/**
 * Background playback service.
 * - Remote controls (lock screen, notification, Bluetooth, CarPlay) — registered ONCE
 * - MediaItemTransition → Redux sync + prefetch of the next song (inside syncTrackTransition)
 * - Ended → only at the end of the queue, ask the API for another song
 */
const playbackService = async () => {
  if (serviceRegistered) return;
  serviceRegistered = true;

  const handlers = {
    play: () => resumeCurrentSong(),
    pause: () => pauseCurrentSong(),
    stop: () => stopCurrentSong(),
    next: () => skipToNextTrack(undefined, 'lock screen next'),
    previous: () => skipToPreviousTrack(undefined, 'lock screen previous'),
    seek: command => {
      const position = Number(command?.position);
      if (Number.isFinite(position)) return seekTo(position);
    },
  };

  // 1. Remote controls — use ONE registration method, never both.
  const registerRemoteHandlers =
    TrackPlayer.registerRemoteHandlers || RNTP.registerRemoteHandlers;

  if (typeof registerRemoteHandlers === 'function') {
    registerRemoteHandlers.call(TrackPlayer, handlers);
  } else {
    TrackPlayer.addEventListener(Event.RemotePlay, handlers.play);
    TrackPlayer.addEventListener(Event.RemotePause, handlers.pause);
    TrackPlayer.addEventListener(Event.RemoteStop, handlers.stop);
    TrackPlayer.addEventListener(Event.RemoteNext, handlers.next);
    TrackPlayer.addEventListener(Event.RemotePrevious, handlers.previous);
    TrackPlayer.addEventListener(Event.RemoteSeek, handlers.seek);
  }

  // 2. Track changed → sync Redux (this also queues the next song).
  TrackPlayer.addEventListener(Event.MediaItemTransition, async event => {
    try {
      await syncTrackTransition(
        event?.item ?? null,
        Number.isInteger(event?.index) ? event.index : -1,
        event?.reason,
      );
    } catch (error) {
      console.warn('[KarKab] MediaItemTransition error:', error);
    }
  });

  // 3. A file failed to load → retry the song with its next URL.
  const errorEvent = Event.PlaybackError || Event.PlayerError;
  if (errorEvent) {
    TrackPlayer.addEventListener(errorEvent, error => {
      console.warn('[KarKab] Playback error:', error);
      tryAudioFallback('error');
    });
  }

  // 4. Queue finished → fetch another song. Mid-queue songs advance natively.
  TrackPlayer.addEventListener(Event.PlaybackStateChanged, async event => {
    const state = event?.state;

    // Every native state change goes into the current switch's timing log.
    timingPlayerState(String(state));

    if (state === PlaybackState.Playing || String(state).toLowerCase() === 'playing') {
      markPlaybackStarted();
    }

    const ended =
      state === PlaybackState.Ended || String(state).toLowerCase() === 'ended';
    if (!ended) return;

    try {
      await handlePlaybackQueueEnded();
    } catch (error) {
      console.warn('[KarKab] Queue ended error:', error);
    }
  });

  console.log('[KarKab] Playback service initialized');
};

export default playbackService;
export { playbackService, playbackService as PlaybackService };