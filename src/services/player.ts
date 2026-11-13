// // src/services/player.ts

// import { Platform, PermissionsAndroid } from 'react-native';
// import TrackPlayer, { PlayerCommand, type MediaItem } from '@rntp/player';
// import type { Dispatch } from '@reduxjs/toolkit';
// import ReactNativeBlobUtil from 'react-native-blob-util';

// import {
//     addsong,
//     setPlaylistQueue,
//     setPlaylistIndex,
//     isPausesd,
// } from '../auth/redux/authSlice';
// import { saveLastPlayed, getLastPlayed } from './lastPlayed';
// import ApiService from './api';
// import apiUrls, { BASE_URL } from './apiUrls';
// import { store } from '../app/store';

// let initialized = false;
// let isSwitchingSong = false;
// let isSyncingTransition = false; // Guard against re-entrant MediaItemTransition calls

// /**
//  * Normalizes an audio URL to an absolute URI that TrackPlayer can stream.
//  */
// export const getMediaAudioUrl = (url?: string | null): string => {
//     if (!url || typeof url !== 'string') return '';
//     const clean = url.trim();
//     if (!clean || clean === 'null' || clean === 'undefined') return '';
//     let fullUrl = clean;
//     if (
//         !clean.startsWith('http://') &&
//         !clean.startsWith('https://') &&
//         !clean.startsWith('file://')
//     ) {
//         if (clean.includes('uploads/recordings/')) {
//             const cfBase = 'https://d2ycnbqrkk31pf.cloudfront.net';
//             const path = clean.replace(/^\//, '');
//             fullUrl = `${cfBase}/${path}`;
//         } else {
//             const base = BASE_URL.replace(/\/$/, '');
//             const path = clean.replace(/^\//, '');
//             fullUrl = `${base}/${path}`;
//         }
//     }
//     try {
//         return encodeURI(decodeURI(fullUrl));
//     } catch (e) {
//         return fullUrl;
//     }
// };

// /**
//  * Normalizes an artwork image URL to an absolute URL for lockscreen/notification display.
//  */
// export const getArtworkUrl = (url?: string | null): string | undefined => {
//     if (!url || typeof url !== 'string') return undefined;
//     const clean = url.trim();
//     if (!clean || clean === 'null' || clean === 'undefined') return undefined;
//     if (clean.startsWith('http://') || clean.startsWith('https://')) {
//         return clean;
//     }
//     const base = BASE_URL.replace(/\/$/, '');
//     const path = clean.replace(/^\//, '');
//     return `${base}/${path}`;
// };

// /**
//  * Resolves recording audio URLs on iOS so that TrackPlayer / AVPlayer
//  * can stream them with the correct M4A/AAC container parser.
//  */
// export const resolvePlayableAudioUrl = async (song: any): Promise<string | null> => {
//     try {
//         if (Platform.OS !== 'ios' || !song) return null;

//         const rawUrl =
//             song._resolvedAudioUrl ||
//             song.recording_url ||
//             song.recordingUrl ||
//             (song.file_path && String(song.file_path).includes('uploads/recordings/') ? song.file_path : null);

//         if (!rawUrl || typeof rawUrl !== 'string') return null;

//         const cleanUrl = getMediaAudioUrl(rawUrl);
//         if (!cleanUrl || !cleanUrl.includes('uploads/recordings/')) return null;

//         const { fs } = ReactNativeBlobUtil;
//         const filename = cleanUrl.split('/').pop()?.split('?')[0] || `rec_${song.id}.mp3`;
//         const m4aFilename = filename.replace(/\.(mp3|wav)$/i, '') + '.m4a';
//         const targetDir = `${fs.dirs.CacheDir}/recordings`;
//         const targetPath = `${targetDir}/${m4aFilename}`;

//         const exists = await fs.exists(targetPath);
//         if (exists) {
//             return `file://${targetPath}`;
//         }

//         const dirExists = await fs.exists(targetDir);
//         if (!dirExists) {
//             await fs.mkdir(targetDir);
//         }

//         const res = await ReactNativeBlobUtil.config({
//             path: targetPath,
//         }).fetch('GET', cleanUrl);

//         if (res.info().status === 200) {
//             return `file://${targetPath}`;
//         }
//     } catch (e) {
//         console.log('resolvePlayableAudioUrl error:', e);
//     }
//     return null;
// };

// /**
//  * Converts various duration formats (e.g., "00:06", "02:45", "01:23:45", raw seconds or ms)
//  * into numeric seconds.
//  */
// export const parseDurationToSeconds = (duration: any): number => {
//     if (duration == null || duration === '') return 0;
//     if (typeof duration === 'number') {
//         if (isNaN(duration) || duration <= 0) return 0;
//         return duration > 1000 ? duration / 1000 : duration;
//     }
//     if (typeof duration === 'string') {
//         const trimmed = duration.trim();
//         if (trimmed.includes(':')) {
//             const parts = trimmed.split(':').map((p) => parseFloat(p));
//             if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
//                 return parts[0] * 60 + parts[1];
//             } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
//                 return parts[0] * 3600 + parts[1] * 60 + parts[2];
//             }
//         }
//         const num = parseFloat(trimmed);
//         if (!isNaN(num) && num > 0) {
//             return num > 1000 ? num / 1000 : num;
//         }
//     }
//     return 0;
// };

// /**
//  * Formats an individual song into a TrackPlayer MediaItem.
//  */
// export const formatSongToMediaItem = (
//     song: any,
//     index?: number,
// ): MediaItem | null => {
//     if (!song?.id) return null;
//     const rawAudio =
//         song._resolvedAudioUrl ||
//         song.recording_url ||
//         song.recordingUrl ||
//         song.original_song ||
//         song.file_path ||
//         song.path ||
//         song.url ||
//         song.audio_url ||
//         song.audio_file ||
//         song.song_url ||
//         song.file ||
//         song.media_url ||
//         song.audio ||
//         song.song_file;
//     const audioUrl = getMediaAudioUrl(rawAudio);
//     if (!audioUrl) return null;

//     const durationSec = parseDurationToSeconds(song.duration);
//     const artwork = getArtworkUrl(
//         song.cover_image_url ||
//         song.cover_image ||
//         song.image_url ||
//         song.artwork ||
//         song.album_picture_url ||
//         song.album_picture ||
//         (typeof song.image === 'string' ? song.image : undefined),
//     );

//     return {
//         mediaId: song.id.toString(),
//         url: audioUrl,
//         title: song.title || song.song_name || song.name || 'Unknown Title',
//         artist:
//             song.artist ||
//             song.artist_name ||
//             song.singer ||
//             song.user?.name ||
//             song.album_name ||
//             'KarKab Music',
//         albumTitle: song.album_name || undefined,
//         artworkUrl: artwork,
//         duration: durationSec > 0 ? durationSec : undefined,
//         extras: {
//             originalSong: song,
//             queueIndex: typeof index === 'number' ? index : 0,
//         },
//     };
// };

// /**
//  * Returns whether a track transition is currently active to prevent race conditions.
//  */
// export const isPlayerSwitching = () => isSwitchingSong;

// /**
//  * Initializes TrackPlayer for high-fidelity background music playback,
//  * lock-screen controls, Bluetooth AVRCP, and Apple CarPlay / Android Auto.
//  */
// export const setupAudioPlayer = async () => {
//     if (initialized) return true;

//     try {
//         // Request POST_NOTIFICATIONS permission on Android 13+ (API 33+)
//         if (Platform.OS === 'android' && Platform.Version >= 33) {
//             try {
//                 const hasPermission = await PermissionsAndroid.check(
//                     PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//                 );
//                 if (!hasPermission) {
//                     await PermissionsAndroid.request(
//                         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//                     );
//                 }
//             } catch (permError) {
//                 console.log('Notification permission request error:', permError);
//             }
//         }

//         TrackPlayer.setupPlayer({
//             contentType: 'music',
//             handleAudioBecomingNoisy: true, // Auto-pause on Bluetooth/headphone disconnect

//             android: {
//                 wakeMode: 'network',
//                 // Stop playback when the app is force-killed (swiped from recents).
//                 // Background mode (app minimised but still in recents) is unaffected —
//                 // audio continues to play there.
//                 taskRemovedBehavior: 'stop',

//                 notification: {
//                     channelId: 'karkab-music',
//                     channelName: 'KarKab Music',
//                     smallIcon: 'ic_notification',
//                 },
//             },
//         });

//         // Enable full lock-screen, notification bar, CarPlay & Bluetooth capabilities
//         // Previous, Next, SkipForward, and SkipBackward ensure system controls
//         // on both Android (Media3 notification tracker) and iOS (MPRemoteCommandCenter) show the Next button
//         TrackPlayer.setCommands({
//             capabilities: [
//                 PlayerCommand.PlayPause,
//                 PlayerCommand.Next,
//                 PlayerCommand.Previous,
//                 PlayerCommand.Seek,
//                 PlayerCommand.Stop,
//                 PlayerCommand.SkipForward,
//                 PlayerCommand.SkipBackward,
//             ],
//             handling: 'js',
//             forwardInterval: 15,
//             backwardInterval: 15,
//         });

//         initialized = true;
//         console.log('✅ TrackPlayer initialized successfully with album & playlist controls');
//         return true;
//     } catch (error) {
//         console.log('❌ TrackPlayer setup error:', error);
//         return false;
//     }
// };

// /**
//  * Restores the last played song on app launch.
//  * Loads it into TrackPlayer PAUSED so the MiniPlayer shows the track info
//  * without auto-playing audio.
//  */
// export const restoreLastPlayedSong = async () => {
//     try {
//         await setupAudioPlayer();

//         // Check if TrackPlayer already has an active media item (e.g. background session still alive)
//         let activeSong: any = null;
//         try {
//             activeSong = TrackPlayer.getActiveMediaItem();
//         } catch (e) { }

//         // If TrackPlayer already has an active song playing in background, don't interrupt it!
//         if (activeSong?.mediaId) {
//             console.log('🎵 TrackPlayer already active in background, keeping playback intact');
//             return;
//         }

//         // App launched from killed state: Native TrackPlayer is empty.
//         // Retrieve the last played song from Redux or MMKV storage.
//         const authState = (store.getState() as any)?.auth;
//         const lastSong = authState?.playsong?.id ? authState.playsong : getLastPlayed();

//         if (!lastSong?.id) {
//             console.log('ℹ️ No last-played song found to restore');
//             return;
//         }

//         console.log('🔄 Loading last played song (paused) from killed state:', lastSong.title);

//         const mediaItem = formatSongToMediaItem(lastSong, 0);
//         if (!mediaItem) {
//             console.log('❌ Could not format last-played song into media item');
//             return;
//         }

//         // Set into TrackPlayer and keep PAUSED
//         await TrackPlayer.setMediaItem(mediaItem);
//         await TrackPlayer.pause();

//         // Ensure Redux state is set to PAUSED so UI shows play button, not pause button
//         store.dispatch(isPausesd(true));
//         store.dispatch(setPlaylistQueue({ songs: [lastSong], initialIndex: 0 }));
//         store.dispatch(addsong(lastSong));

//         console.log('✅ Last played song restored in PAUSED state on fresh app launch:', lastSong.title);
//     } catch (error) {
//         console.log('❌ restoreLastPlayedSong error:', error);
//     }
// };

// /**
// /**
//  * Prefetch helper.
//  * Note: Dynamic runtime queue appending via addMediaItem is disabled during active playback
//  * because adding items asynchronously triggers premature MediaItemTransition events in
//  * @rntp/player, which caused the player to immediately jump to the adjacent song on play.
//  */
// export const prefetchNextSongForQueue = async (
//     _currentSongId?: string | number | null,
// ) => {
//     return;
// };

// /**
//  * Plays an entire list of songs (album, playlist, artist mix, or search results)
//  * starting at the specified index.
//  * Fully registers the entire queue into TrackPlayer, enabling next/prev controls
//  * on lock screen, Android notification bar, Apple CarPlay, and Bluetooth headsets/cars.
//  */
// export const playSongList = async (
//     songs: any[],
//     initialIndex: number = 0,
//     autoPlay: boolean = true,
// ) => {
//     try {
//         await setupAudioPlayer();

//         if (!Array.isArray(songs) || songs.length === 0) {
//             console.log('playSongList: Empty songs array provided');
//             return null;
//         }

//         // Resolve target recording URL on iOS if needed
//         const requestedSong = songs[initialIndex] || songs[0];
//         const resolvedTargetUrl = await resolvePlayableAudioUrl(requestedSong);

//         // Filter and map valid songs
//         const mediaItems: MediaItem[] = [];
//         const validSongs: any[] = [];

//         songs.forEach((s, idx) => {
//             const isTarget = s.id?.toString() === requestedSong?.id?.toString();
//             const songToFormat = isTarget && resolvedTargetUrl
//                 ? { ...s, _resolvedAudioUrl: resolvedTargetUrl }
//                 : s;
//             const item = formatSongToMediaItem(songToFormat, idx);
//             if (item) {
//                 mediaItems.push(item);
//                 validSongs.push(songToFormat);
//             }
//         });

//         if (mediaItems.length === 0) {
//             console.log('playSongList: No playable songs found in list');
//             return null;
//         }

//         // Locate the target song by ID to avoid index shifting if any preceding item was filtered out
//         let targetIndex = validSongs.findIndex(
//             (s) => s.id?.toString() === requestedSong?.id?.toString(),
//         );
//         if (targetIndex < 0) {
//             targetIndex =
//                 initialIndex >= 0 && initialIndex < validSongs.length
//                     ? initialIndex
//                     : 0;
//         }

//         console.log(
//             `🎶 Loading queue of ${mediaItems.length} songs into TrackPlayer at index ${targetIndex} (${validSongs[targetIndex]?.title})`
//         );

//         isSwitchingSong = true;

//         // Load the full album / playlist queue into TrackPlayer
//         await TrackPlayer.setMediaItems(mediaItems, targetIndex);

//         if (autoPlay) {
//             await TrackPlayer.play();
//         } else {
//             await TrackPlayer.pause();
//         }

//         // Synchronize Redux store
//         const currentSong = validSongs[targetIndex];
//         store.dispatch(
//             setPlaylistQueue({
//                 songs: validSongs,
//                 initialIndex: targetIndex,
//             })
//         );
//         store.dispatch(addsong(currentSong));
//         saveLastPlayed(currentSong);

//         return currentSong;
//     } catch (error) {
//         console.log('❌ playSongList error:', error);
//         return null;
//     } finally {
//         setTimeout(() => {
//             isSwitchingSong = false;
//         }, 500);
//     }
// };

// /**
//  * Fetches and plays all songs in a playlist by playlistId.
//  * Supports both user-created custom playlists and curated app playlists.
//  */
// export const playPlaylistById = async (
//     playlistId: string | number,
//     initialIndex: number = 0,
//     isUserPlaylist: boolean = true,
// ): Promise<any> => {
//     try {
//         console.log(`🎶 Fetching playlist ${playlistId} to play...`);
//         let songs: any[] = [];

//         if (isUserPlaylist) {
//             try {
//                 const response = await ApiService.get(apiUrls.playlistDetail(playlistId));
//                 const data = (response as any)?.data;
//                 songs = data?.playlist?.songs || data?.playlist?.playlist_songs || data?.songs || [];
//             } catch (userErr) {
//                 console.log('playlistDetail fetch notice, trying app playlist endpoint:', userErr);
//                 const response = await ApiService.get(apiUrls.getplaylistsongs(playlistId));
//                 const data = (response as any)?.data;
//                 songs = data?.playlist?.songs || data?.songs || [];
//             }
//         } else {
//             const response = await ApiService.get(apiUrls.getplaylistsongs(playlistId));
//             const data = (response as any)?.data;
//             songs = data?.playlist?.songs || data?.songs || [];
//         }

//         if (!Array.isArray(songs) || songs.length === 0) {
//             console.log('playPlaylistById: No songs found in playlist', playlistId);
//             return null;
//         }

//         return await playSongList(songs, initialIndex, true);
//     } catch (error) {
//         console.log('❌ playPlaylistById error:', error);
//         return null;
//     }
// };

// /**
//  * Plays a single song item. If a playlist queue is already in state,
//  * checks if it belongs to that queue or falls back to queueing this song.
//  */
// export const playTrackSong = async (song: any, autoPlay: boolean = true) => {
//     try {
//         if (!song?.id) return null;

//         await setupAudioPlayer();

//         // Check if Redux already has a queue containing this song
//         const state = (store.getState() as any)?.auth;
//         const currentQueue = state?.playlistQueue || [];
//         if (Array.isArray(currentQueue) && currentQueue.length > 1) {
//             const songIndex = currentQueue.findIndex(
//                 (s: any) => s.id?.toString() === song.id?.toString()
//             );
//             if (songIndex !== -1) {
//                 return await playSongList(currentQueue, songIndex, autoPlay);
//             }
//         }

//         const resolvedUrl = await resolvePlayableAudioUrl(song);
//         const songToPlay = resolvedUrl ? { ...song, _resolvedAudioUrl: resolvedUrl } : song;

//         // Otherwise play as single item with full media item metadata
//         const mediaItem = formatSongToMediaItem(songToPlay, 0);
//         if (!mediaItem) {
//             console.log('❌ playTrackSong: Could not format media item for song', song.title);
//             return null;
//         }

//         isSwitchingSong = true;

//         await TrackPlayer.setMediaItem(mediaItem);

//         if (autoPlay) {
//             await TrackPlayer.play();
//         } else {
//             await TrackPlayer.pause();
//         }

//         store.dispatch(setPlaylistQueue({ songs: [song], initialIndex: 0 }));
//         store.dispatch(addsong(song));
//         saveLastPlayed(song);

//         return song;
//     } catch (error) {
//         console.log('❌ playTrackSong error:', error);
//         return null;
//     } finally {
//         setTimeout(() => {
//             isSwitchingSong = false;
//         }, 500);
//     }
// };

// /**
//  * Handles skipping to the next song:
//  * 1. Checks TrackPlayer's native queue (album / playlist).
//  * 2. Checks Redux playlistQueue.
//  * 3. Falls back to adjacent song API if at the end of the album/list.
//  */
// export const skipToNextTrack = async (dispatch?: Dispatch) => {
//     if (isSwitchingSong) return;

//     isSwitchingSong = true;
//     try {
//         // 1. Check native TrackPlayer queue
//         const queue = await TrackPlayer.getQueue();
//         const activeIndex = await TrackPlayer.getActiveMediaItemIndex();

//         if (
//             queue &&
//             queue.length > 1 &&
//             activeIndex !== null &&
//             activeIndex < queue.length - 1
//         ) {
//             console.log(`⏭️ [Queue] Skipping to next album track: ${activeIndex + 1}/${queue.length}`);
//             await TrackPlayer.skipToNext();
//             const nextIdx = activeIndex + 1;
//             if (queue[nextIdx]) {
//                 await syncTrackTransition(queue[nextIdx], nextIdx);
//             }
//             return;
//         }

//         // 2. Check Redux playlist queue
//         const authState = (store.getState() as any)?.auth;
//         const reduxQueue = authState?.playlistQueue || [];
//         let reduxIndex = authState?.playlistIndex ?? -1;

//         if (Array.isArray(reduxQueue) && reduxQueue.length > 1) {
//             if (reduxIndex < 0) {
//                 const currentId = (await TrackPlayer.getActiveMediaItem())?.mediaId || authState?.playsong?.id;
//                 if (currentId) {
//                     reduxIndex = reduxQueue.findIndex(
//                         (s: any) => s.id?.toString() === currentId.toString()
//                     );
//                 }
//             }

//             if (reduxIndex >= 0 && reduxIndex < reduxQueue.length - 1) {
//                 const nextIdx = reduxIndex + 1;
//                 console.log(`⏭️ [ReduxQueue] Playing next track in list at index ${nextIdx}`);
//                 await playSongList(reduxQueue, nextIdx, true);
//                 return;
//             }
//         }

//         // 3. Reached end of album/playlist: fallback to adjacent song recommendation API
//         console.log('⏭️ [API] End of queue reached, querying adjacent song API...');
//         await playAdjacentSong('next', dispatch);
//     } catch (error) {
//         console.log('❌ skipToNextTrack error:', error);
//         await playAdjacentSong('next', dispatch);
//     } finally {
//         setTimeout(() => {
//             isSwitchingSong = false;
//         }, 600);
//     }
// };

// /**
//  * Handles skipping to the previous song:
//  * 1. Restarts current track if > 3s in.
//  * 2. Checks TrackPlayer's native queue (album / playlist).
//  * 3. Checks Redux playlistQueue.
//  * 4. Falls back to adjacent song API if at start.
//  */
// export const skipToPreviousTrack = async (dispatch?: Dispatch) => {
//     if (isSwitchingSong) return;

//     isSwitchingSong = true;
//     try {
//         // If more than 3 seconds in, restart track
//         try {
//             const progress = await TrackPlayer.getProgress();
//             if (progress && progress.position > 3) {
//                 console.log('⏮️ Restarting current track (played > 3s)');
//                 await TrackPlayer.seekTo(0);
//                 return;
//             }
//         } catch (e) { }

//         // 1. Check native TrackPlayer queue
//         const queue = await TrackPlayer.getQueue();
//         const activeIndex = await TrackPlayer.getActiveMediaItemIndex();

//         if (
//             queue &&
//             queue.length > 1 &&
//             activeIndex !== null &&
//             activeIndex > 0
//         ) {
//             console.log(`⏮️ [Queue] Skipping to previous album track: ${activeIndex - 1}/${queue.length}`);
//             await TrackPlayer.skipToPrevious();
//             const prevIdx = activeIndex - 1;
//             if (queue[prevIdx]) {
//                 await syncTrackTransition(queue[prevIdx], prevIdx);
//             }
//             return;
//         }

//         // 2. Check Redux playlist queue
//         const authState = (store.getState() as any)?.auth;
//         const reduxQueue = authState?.playlistQueue || [];
//         let reduxIndex = authState?.playlistIndex ?? -1;

//         if (Array.isArray(reduxQueue) && reduxQueue.length > 1) {
//             if (reduxIndex < 0) {
//                 const currentId = (await TrackPlayer.getActiveMediaItem())?.mediaId || authState?.playsong?.id;
//                 if (currentId) {
//                     reduxIndex = reduxQueue.findIndex(
//                         (s: any) => s.id?.toString() === currentId.toString()
//                     );
//                 }
//             }

//             if (reduxIndex > 0) {
//                 const prevIdx = reduxIndex - 1;
//                 console.log(`⏮️ [ReduxQueue] Playing previous track in list at index ${prevIdx}`);
//                 await playSongList(reduxQueue, prevIdx, true);
//                 return;
//             }
//         }

//         // 3. Beginning of queue: fallback to adjacent song API
//         console.log('⏮️ [API] Start of queue reached, querying adjacent song API...');
//         await playAdjacentSong('prev', dispatch);
//     } catch (error) {
//         console.log('❌ skipToPreviousTrack error:', error);
//         await playAdjacentSong('prev', dispatch);
//     } finally {
//         setTimeout(() => {
//             isSwitchingSong = false;
//         }, 600);
//     }
// };

// /**
//  * Synchronizes Redux store when TrackPlayer transitions tracks in a queue
//  * (e.g., auto-advancing at the end of a track, or lockscreen/CarPlay skip).
//  */
// export const syncTrackTransition = async (
//     item: MediaItem | null,
//     index: number,
// ) => {
//     if (!item) return;

//     // Guard against re-entrant calls triggered by addMediaItem inside prefetchNextSongForQueue
//     if (isSyncingTransition) {
//         console.log('⚠️ syncTrackTransition: skipping re-entrant call for', item.title);
//         return;
//     }

//     isSyncingTransition = true;
//     isSwitchingSong = true;
//     try {
//         console.log(`🔄 Syncing track transition at index ${index}:`, item.title);

//         let song = (item.extras as any)?.originalSong;

//         if (!song) {
//             const queue = (store.getState() as any)?.auth?.playlistQueue || [];
//             song =
//                 queue[index] ||
//                 queue.find(
//                     (s: any) => s.id?.toString() === item.mediaId?.toString()
//                 );
//         }

//         if (song) {
//             store.dispatch(setPlaylistIndex(index));
//             store.dispatch(addsong(song));
//             saveLastPlayed(song);
//         }
//     } catch (e) {
//         console.log('❌ syncTrackTransition error:', e);
//     } finally {
//         setTimeout(() => {
//             isSyncingTransition = false;
//             isSwitchingSong = false;
//         }, 500);
//     }
// };

// /**
//  * Switches to adjacent track using the KarKab API.
//  */
// export const playAdjacentSong = async (
//     direction: 'next' | 'prev',
//     dispatch?: Dispatch,
// ) => {
//     try {
//         let currentId: string | number | null = null;

//         try {
//             const activeTrack = TrackPlayer.getActiveMediaItem();
//             if (activeTrack?.mediaId) {
//                 currentId = activeTrack.mediaId;
//             }
//         } catch (e) { }

//         const currentAuthState = (store.getState() as any)?.auth;
//         if (!currentId) {
//             currentId = currentAuthState?.playsong?.id;
//         }

//         if (!currentId) {
//             const last = getLastPlayed();
//             currentId = last?.id;
//         }

//         if (!currentId) {
//             console.log(`❌ No active song ID found for ${direction}`);
//             return;
//         }

//         console.log(`🔄 Fetching ${direction} song for ID:`, currentId);

//         const res = await ApiService.get(apiUrls.adjacentsong(currentId));

//         if (!(res as any).data?.success) {
//             console.log('❌ Adjacent song API failed');
//             return;
//         }

//         const targetSongRef =
//             direction === 'next'
//                 ? (res as any).data.nextSong
//                 : (res as any).data.previousSong;

//         if (!targetSongRef?.id) {
//             console.log(`⚠️ No ${direction} song available from adjacent API, querying random song fallback...`);
//             const randomRes = await ApiService.get(apiUrls.randomsong);
//             if ((randomRes as any).data?.success && (randomRes as any).data.songs?.length > 0) {
//                 const randomSong = (randomRes as any).data.songs[0];
//                 await playTrackSong(randomSong, true);
//                 const d = dispatch || store.dispatch;
//                 d(addsong(randomSong));
//                 return randomSong;
//             }
//             return;
//         }

//         const detailRes = await ApiService.get(
//             apiUrls.singlesongdetail(targetSongRef.id),
//         );

//         if (!(detailRes as any).data?.success) {
//             console.log('❌ Song detail API failed');
//             return;
//         }

//         const song = (detailRes as any).data.song || (detailRes as any).data.recording;

//         if (!song) {
//             console.log('❌ Song object missing in API response');
//             return;
//         }

//         await playTrackSong(song, true);

//         const d = dispatch || store.dispatch;
//         d(addsong(song));

//         console.log(`🎧 Switched to ${direction}:`, song.title);
//         return song;
//     } catch (error) {
//         console.log(`❌ Adjacent ${direction} error:`, error);
//         const lastSong = getLastPlayed();
//         if (lastSong) {
//             const d = dispatch || store.dispatch;
//             d(addsong(lastSong));
//         }
//     }
// };

// export const pauseCurrentSong = async () => {
//     try {
//         await TrackPlayer.pause();
//         console.log('⏸️ Audio playback paused');
//     } catch (error) {
//         console.log('❌ Pause current song error:', error);
//     }
// };

// export const resumeCurrentSong = async () => {
//     try {
//         await TrackPlayer.play();
//         console.log('▶️ Audio playback resumed');
//     } catch (error) {
//         console.log('❌ Resume current song error:', error);
//     }
// };

// export const togglePlayPause = async () => {
//     try {
//         const isPlaying = TrackPlayer.isPlaying();
//         if (isPlaying) {
//             await TrackPlayer.pause();
//         } else {
//             await TrackPlayer.play();
//         }
//     } catch (error) {
//         console.log('❌ Toggle play/pause error:', error);
//     }
// };




// src/services/player.ts
import { Platform } from 'react-native';
import TrackPlayer, { PlayerCommand, type MediaItem } from '@rntp/player';
import type { Dispatch } from '@reduxjs/toolkit';
import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  addsong,
  setPlaylistQueue,
  setPlaylistIndex,
  isPausesd,
} from '../auth/redux/authSlice';

import { saveLastPlayed, getLastPlayed } from './lastPlayed';
import ApiService from './api';
import apiUrls, { BASE_URL } from './apiUrls';
import { store } from '../app/store';
import {
  downloadAudio,
  getCachedAudioUrl,
  initAudioFileCache,
} from './audioFileCache';
import {
  beginSwitch,
  currentSwitchId,
  timingAudible,
  hasPendingSwitch,
  timeApi,
  timingCancel,
  timingFailed,
  timingPath,
  timingSong,
  timingStep,
} from './playbackTimings';

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const LOG_TAG = '[KarKabPlayer]';
const CACHE_SIZE_BYTES = 500 * 1024 * 1024;
const PREFETCH_DELAY_MS = 1500;
/** Only append the next song once the current one is really playing. */
const PREFETCH_MIN_POSITION_SEC = 1;
const PREFETCH_RETRY_MS = 2000;
const PREFETCH_MAX_RETRIES = 30; // ~1 min of waiting (paused / slow network)

/**
 * Native disk cache + preloading. If songs get stuck on "loading" at 0:00,
 * set this to false and rebuild to check whether the cache layer is the cause.
 */
const USE_NATIVE_CACHE = true;

/**
 * Which file to try first for catalogue songs.
 * 'original' = original_song (known to play). 'stream' = stream_m4a / song_url.
 * Whichever is first, the others are kept as automatic fallbacks.
 */
const PREFERRED_SOURCE: 'original' | 'stream' = 'original';

/** If audio hasn't started after this long, try the next URL for the song. */
const LOAD_TIMEOUT_MS = 8000;

/**
 * Download the next song's file while the current one plays, so Next plays
 * from a local file instead of buffering from the network.
 */
const DOWNLOAD_NEXT_SONG = true;
const S3_BASE = 'https://karkab-media-storage.s3.ap-southeast-2.amazonaws.com';

/**
 * iOS recordings fix.
 * Recordings are AAC audio saved with a ".mp3" name, which iOS cannot stream.
 * While true, iOS downloads + caches the recording as ".m4a" before playing.
 *
 * Set to FALSE once the backend saves recordings as real .m4a
 * (ffmpeg -c:a aac -movflags +faststart, Content-Type: audio/mp4).
 */
const IOS_RECORDING_REMUX = true;

/** Large fields kept out of native MediaItem extras (full song stays in Redux). */
const HEAVY_FIELDS = ['lyrics', 'lyrics_timestamps'];

// -----------------------------------------------------------------------------
// Internal state
// -----------------------------------------------------------------------------

let initialized = false;
let setupPromise: Promise<boolean> | null = null;
let operationLocked = false;
let transitionSyncLocked = false;
let lastSyncedMediaId: string | null = null;
let isPrefetching = false;
let prefetchTimer: ReturnType<typeof setTimeout> | null = null;
let prefetchRetries = 0;

/**
 * The "playing" state event doesn't always fire (e.g. skipping while already
 * playing). Poll until the position actually moves, then close the timing trace.
 */
const watchAudioStart = (maxMs = 20000) => {
  const id = currentSwitchId();
  if (id == null) return;
  const startedAt = Date.now();
  let firstPos: number | null = null;

  const tick = async () => {
    if (currentSwitchId() !== id) return; // already finished or replaced
    try {
      const pos = Number((await TrackPlayer.getProgress())?.position) || 0;
      if (firstPos === null) firstPos = pos;
      if (TrackPlayer.isPlaying() && pos > firstPos + 0.05) {
        timingAudible(id, `audio position moving (${pos.toFixed(2)} s)`);
        return;
      }
    } catch {}
    if (Date.now() - startedAt < maxMs) setTimeout(tick, 100);
  };
  setTimeout(tick, 100);
};

// Load-time measurement (see markLoadStart / markPlaybackStarted)
let loadStartedAt = 0;
let loadLabel = '';

let loadWatchdog: ReturnType<typeof setTimeout> | null = null;

const clearLoadWatchdog = () => {
  if (loadWatchdog) clearTimeout(loadWatchdog);
  loadWatchdog = null;
};

const markLoadStart = (song: any, url?: string) => {
  loadStartedAt = Date.now();
  loadLabel = `${song?.title ?? song?.id} → ${url ?? '?'}`;
  log('⏱ Loading:', loadLabel);

  clearLoadWatchdog();
  loadWatchdog = setTimeout(() => {
    loadWatchdog = null;
    tryAudioFallback('timeout');
  }, LOAD_TIMEOUT_MS);
};

/** Called by service.js when playback really starts. Logs how long loading took. */
export const markPlaybackStarted = () => {
  clearLoadWatchdog();
  if (!loadStartedAt) return;
  log(`⏱ Audio started in ${Date.now() - loadStartedAt} ms:`, loadLabel);
  loadStartedAt = 0;
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const log = (...args: any[]) => console.log(LOG_TAG, ...args);

const getAuthState = (): any => (store.getState() as any)?.auth ?? {};

const toId = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const isAbsolute = (value: string) =>
  /^(https?:\/\/|file:\/\/|content:\/\/)/i.test(value);

const isEmptyString = (value: unknown) =>
  typeof value !== 'string' ||
  value.trim() === '' ||
  value === 'null' ||
  value === 'undefined';

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path.trim().replace(/^\/+/, '')}`;

export const isRecordingSong = (song: any): boolean =>
  !!(
    song?.recording_url ||
    song?.recordingUrl ||
    song?.type === 'recordings' ||
    (typeof song?.file_path === 'string' &&
      song.file_path.includes('uploads/recordings/'))
  );

/** Converts API / S3 paths into playable absolute URLs. */
export const getMediaAudioUrl = (url?: string | null): string => {
  if (isEmptyString(url)) return '';
  const clean = (url as string).trim();

  let fullUrl = clean;
  if (!isAbsolute(clean)) {
    fullUrl = clean.includes('uploads/recordings/')
      ? joinUrl(S3_BASE, clean)
      : joinUrl(BASE_URL, clean);
  }

  try {
    return encodeURI(decodeURI(fullUrl));
  } catch {
    return fullUrl;
  }
};

/** Artwork URL for notification / lock-screen metadata. */
export const getArtworkUrl = (url?: string | null): string | undefined => {
  if (isEmptyString(url)) return undefined;
  const clean = (url as string).trim();
  return isAbsolute(clean) ? clean : joinUrl(BASE_URL, clean);
};

/** Converts "05:59", "01:02:03", seconds or ms into seconds. */
export const parseDurationToSeconds = (duration: any): number => {
  if (duration === null || duration === undefined || duration === '') return 0;

  if (typeof duration === 'number') {
    if (!Number.isFinite(duration) || duration <= 0) return 0;
    return duration > 1000 ? duration / 1000 : duration;
  }

  if (typeof duration === 'string') {
    const value = duration.trim();
    if (value.includes(':')) {
      const parts = value.split(':').map(Number);
      if (parts.some(p => !Number.isFinite(p))) return 0;
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return 0;
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return 0;
    return numeric > 1000 ? numeric / 1000 : numeric;
  }

  return 0;
};

/** All playable URLs for a song, best first, no duplicates, .wav last. */
const getSongAudioCandidates = (song: any): string[] => {
  if (!song) return [];
  const stream = [song.stream_m4a, song.song_url];
  const original = [song.original_song];
  const preferred =
    PREFERRED_SOURCE === 'stream' ? [...stream, ...original] : [...original, ...stream];

  const raw = [
    song._resolvedAudioUrl,
    song.recording_url,
    song.recordingUrl,
    ...preferred,
    song.file_path,
    song.path,
    song.url,
    song.audio_url,
    song.audio_file,
    song.file,
    song.media_url,
    song.audio,
    song.song_file,
  ];

  const urls: string[] = [];
  raw.forEach(value => {
    if (isEmptyString(value)) return;
    const url = getMediaAudioUrl(value);
    if (url && !urls.includes(url)) urls.push(url);
  });
  // Large .wav files only as a last resort.
  const isWav = (u: string) => /\.wav(\?|$)/i.test(u);
  return [...urls.filter(u => !isWav(u)), ...urls.filter(isWav)];
};

const getSongAudioSource = (song: any): string | null =>
  getSongAudioCandidates(song)[0] ?? null;

const slimSong = (song: any) => {
  if (!song || typeof song !== 'object') return song;
  const copy = { ...song };
  HEAVY_FIELDS.forEach(field => delete copy[field]);
  return copy;
};

// -----------------------------------------------------------------------------
// iOS recording fix (see IOS_RECORDING_REMUX)
// -----------------------------------------------------------------------------

const resolveIosRecordingUrl = async (song: any): Promise<string | null> => {
  try {
    if (!IOS_RECORDING_REMUX || Platform.OS !== 'ios' || !isRecordingSong(song)) {
      return null;
    }
    if (typeof song._resolvedAudioUrl === 'string' && song._resolvedAudioUrl.startsWith('file://')) {
      return song._resolvedAudioUrl;
    }

    const remote = getMediaAudioUrl(
      song.recording_url || song.recordingUrl || song.file_path,
    );
    if (!remote) return null;

    const { fs } = ReactNativeBlobUtil;
    const filename = remote.split('/').pop()?.split('?')[0] || `rec_${song.id}.mp3`;
    const m4aName = filename.replace(/\.(mp3|wav|m4a)$/i, '') + '.m4a';
    const dir = `${fs.dirs.CacheDir}/recordings`;
    const target = `${dir}/${m4aName}`;

    if (await fs.exists(target)) return `file://${target}`;
    if (!(await fs.exists(dir))) await fs.mkdir(dir);

    const res = await ReactNativeBlobUtil.config({ path: target }).fetch('GET', remote);
    if (res.info().status === 200) return `file://${target}`;

    await fs.unlink(target).catch(() => {});
  } catch (error) {
    log('resolveIosRecordingUrl failed, falling back to stream:', error);
  }
  return null;
};

/** Returns the song with a local URL attached when the iOS recording fix applies. */
const prepareSongForPlayback = async (song: any): Promise<any> => {
  const local = await resolveIosRecordingUrl(song);
  if (local) return { ...song, _resolvedAudioUrl: local };

  // Already downloaded (prefetched next song, or played before)? Play the local file.
  if (!isRecordingSong(song)) {
    const remote = getSongAudioCandidates(song)[0];
    const cached = await getCachedAudioUrl(remote);
    if (cached) return { ...song, _resolvedAudioUrl: cached };
  }
  return song;
};

/** Kept for existing imports. Returns the URL the player will use. */
export const resolvePlayableAudioUrl = async (song: any): Promise<string | null> => {
  if (!song) return null;
  const prepared = await prepareSongForPlayback(song);
  return getSongAudioSource(prepared);
};

// -----------------------------------------------------------------------------
// MediaItem
// -----------------------------------------------------------------------------

export const formatSongToMediaItem = (song: any, index = 0): MediaItem | null => {
  if (!song?.id) return null;

  const candidates = getSongAudioCandidates(song);
  const audioUrl = candidates[0];
  if (!audioUrl) {
    log('Skipping song without a playable audio URL:', song.id);
    return null;
  }

  const artwork = getArtworkUrl(
    song.cover_image_url ||
      song.song?.cover_image_url ||
      song.cover_image ||
      song.image_url ||
      song.artwork ||
      song.album_picture_url ||
      song.album_picture ||
      (typeof song.image === 'string' ? song.image : undefined),
  );

  const duration = parseDurationToSeconds(song.duration);

  return {
    mediaId: toId(song.id),
    url: audioUrl,
    title: song.title || song.song_name || song.name || 'Unknown Title',
    artist:
      song.artist ||
      song.artist_name ||
      song.singer ||
      song.song?.artist ||
      song.user?.name ||
      song.album_name ||
      'KarKab Music',
    albumTitle: song.album_name || undefined,
    artworkUrl: artwork,
    duration: duration > 0 ? duration : undefined,
    extras: {
      originalSong: slimSong(song),
      fallbackUrls: candidates.slice(1),
      isRecording: isRecordingSong(song),
      queueIndex: index,
    },
  } as MediaItem;
};

// -----------------------------------------------------------------------------
// Redux sync helpers
// -----------------------------------------------------------------------------

const setPausedState = (paused: boolean) => {
  store.dispatch(isPausesd(paused));
};

const dispatchCurrentSong = (song: any, index: number, queue: any[], paused: boolean) => {
  if (!song) return;
  store.dispatch(setPlaylistQueue({ songs: queue, initialIndex: index }));
  store.dispatch(setPlaylistIndex(index));
  store.dispatch(addsong(song));
  setPausedState(paused);
  saveLastPlayed(song);
  lastSyncedMediaId = toId(song.id);
};

const getCurrentSongId = (): string => {
  try {
    const active = TrackPlayer.getActiveMediaItem();
    if (active?.mediaId) return toId(active.mediaId);
  } catch {}
  const auth = getAuthState();
  if (auth?.playsong?.id) return toId(auth.playsong.id);
  return toId(getLastPlayed()?.id);
};

const getCurrentSong = (): any => {
  try {
    const active: any = TrackPlayer.getActiveMediaItem();
    if (active?.extras?.originalSong) return active.extras.originalSong;
  } catch {}
  return getAuthState()?.playsong ?? null;
};

const findSongIndex = (songs: any[], id: string): number =>
  !id || !Array.isArray(songs) ? -1 : songs.findIndex(s => toId(s?.id) === id);

/** Full song (with lyrics) from Redux first, slim native copy as fallback. */
const findSongForMediaItem = (item: any, index: number): any => {
  const mediaId = toId(item?.mediaId);
  const queue = getAuthState()?.playlistQueue;
  if (Array.isArray(queue)) {
    const match = queue.find((s: any) => toId(s?.id) === mediaId);
    if (match) return match;
    if (queue[index] && toId(queue[index]?.id) === mediaId) return queue[index];
  }
  return item?.extras?.originalSong ?? null;
};

const appendToNativeQueue = async (item: MediaItem) => {
  const tp: any = TrackPlayer;
  if (typeof tp.addMediaItem === 'function') {
    await tp.addMediaItem(item);
  } else if (typeof tp.addMediaItems === 'function') {
    await tp.addMediaItems([item]);
  } else {
    throw new Error('No addMediaItem API available in @rntp/player');
  }
};

/** isRetry = false for a new song (resets the retry counter). */
const schedulePrefetch = (isRetry = false) => {
  if (prefetchTimer) clearTimeout(prefetchTimer);
  if (!isRetry) prefetchRetries = 0;
  prefetchTimer = setTimeout(
    () => {
      prefetchTimer = null;
      prefetchNextSongForQueue();
    },
    isRetry ? PREFETCH_RETRY_MS : PREFETCH_DELAY_MS,
  );
};

/** True once the current track has loaded and played a few seconds. */
const isCurrentTrackSettled = async (): Promise<boolean> => {
  try {
    if (!TrackPlayer.isPlaying()) return false;
    const progress = await TrackPlayer.getProgress();
    return (Number(progress?.position) || 0) >= PREFETCH_MIN_POSITION_SEC;
  } catch {
    return false;
  }
};

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------

/**
 * Serialized setup so simultaneous callers can't initialize twice.
 * POST_NOTIFICATIONS permission is requested from the app UI, not here.
 */
export const setupAudioPlayer = async (): Promise<boolean> => {
  if (initialized) return true;
  if (setupPromise) return setupPromise;

  setupPromise = (async () => {
    try {
      TrackPlayer.setupPlayer({
        contentType: 'music',
        handleAudioBecomingNoisy: true,
        // false: keep our Arabic title/artist instead of the file's ID3 tags
        autoUpdateMetadataFromStream: false,
        ...(USE_NATIVE_CACHE
          ? {
              cache: {
                maxSizeBytes: CACHE_SIZE_BYTES,
                preloading: { window: 1 },
              },
            }
          : {}),
        android: {
          wakeMode: 'network',
          taskRemovedBehavior: 'stop',
          notification: {
            channelId: 'karkab-music',
            channelName: 'KarKab Music',
            smallIcon: 'ic_notification',
          },
        },
      });

      // No SkipForward/SkipBackward: on iOS they replace Next/Previous
      // on the lock screen with ±15s buttons.
      await Promise.resolve(
        TrackPlayer.setCommands({
          capabilities: [
            PlayerCommand.PlayPause,
            PlayerCommand.Next,
            PlayerCommand.Previous,
            PlayerCommand.Seek,
            PlayerCommand.Stop,
          ],
          handling: 'js',
        }),
      );

      initialized = true;
      initAudioFileCache();
      log('Initialized; cache 500 MB, preload window 1');
      return true;
    } catch (error) {
      initialized = false;
      log('Player setup failed:', error);
      return false;
    } finally {
      if (!initialized) setupPromise = null;
    }
  })();

  return setupPromise;
};

export const isAudioPlayerInitialized = () => initialized;
export const isPlayerSwitching = () => operationLocked;

// -----------------------------------------------------------------------------
// Restore last played song
// -----------------------------------------------------------------------------

export const restoreLastPlayedSong = async (): Promise<void> => {
  const ready = await setupAudioPlayer();
  if (!ready) return;

  try {
    if (TrackPlayer.getActiveMediaItem()?.mediaId) {
      log('Existing native session found; leaving it untouched.');
      return;
    }

    const auth = getAuthState();
    const lastSong = auth?.playsong?.id ? auth.playsong : getLastPlayed();
    if (!lastSong?.id) return;

    const prepared = await prepareSongForPlayback(lastSong);
    const mediaItem = formatSongToMediaItem(prepared, 0);
    if (!mediaItem) return;

    await TrackPlayer.setMediaItem(mediaItem);
    await TrackPlayer.pause();

    dispatchCurrentSong(lastSong, 0, [lastSong], true);
    log('Restored last played song (paused):', lastSong.title);
  } catch (error) {
    log('restoreLastPlayedSong failed:', error);
  }
};

// -----------------------------------------------------------------------------
// Playback
// -----------------------------------------------------------------------------

/** Loads a full album / playlist / search-result queue and starts at initialIndex. */
export const playSongList = async (
  songs: any[],
  initialIndex = 0,
  autoPlay = true,
): Promise<any | null> => {
  if (operationLocked) {
    log('Ignoring playSongList: another operation is running.');
    return null;
  }
  operationLocked = true;
  if (autoPlay && !hasPendingSwitch()) beginSwitch('play list');
  if (autoPlay) timingPath('queue load');

  try {
    const ready = await setupAudioPlayer();
    if (!ready || !Array.isArray(songs) || songs.length === 0) return null;

    const requestedIndex = Math.max(0, Math.min(initialIndex, songs.length - 1));
    const requestedId = toId(songs[requestedIndex]?.id);

    const validSongs: any[] = [];
    const mediaItems: MediaItem[] = [];

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      // Only the selected recording needs the iOS fix right away.
      const toFormat =
        toId(song?.id) === requestedId ? await prepareSongForPlayback(song) : song;
      const item = formatSongToMediaItem(toFormat, i);
      if (item) {
        mediaItems.push(item);
        validSongs.push(song);
      }
    }

    if (mediaItems.length === 0) {
      log('No playable items in queue.');
      return null;
    }

    let targetIndex = findSongIndex(validSongs, requestedId);
    if (targetIndex < 0) targetIndex = 0;
    const targetSong = validSongs[targetIndex];

    // UI first (instant title/cover/lyrics), then let the native player load.
    dispatchCurrentSong(targetSong, targetIndex, validSongs, !autoPlay);

    markLoadStart(targetSong, mediaItems[targetIndex]?.url);
    if (autoPlay) timingSong(targetSong, mediaItems[targetIndex]?.url);
    await TrackPlayer.setMediaItems(mediaItems, targetIndex);
    if (autoPlay) timingStep(`setMediaItems() — ${mediaItems.length} items`);
    warmNextSongData();
    if (autoPlay) await TrackPlayer.play();
    else await TrackPlayer.pause();
    if (autoPlay) {
      timingStep('play() resolved');
      watchAudioStart();
    }
    log(`${autoPlay ? 'Playing' : 'Loaded'} queue of`, mediaItems.length, 'at', targetIndex);

    schedulePrefetch();
    return targetSong;
  } catch (error) {
    log('playSongList failed:', error);
    return null;
  } finally {
    operationLocked = false;
  }
};

/** Fetches a playlist and plays it. */
export const playPlaylistById = async (
  playlistId: string | number,
  initialIndex = 0,
  isUserPlaylist = true,
): Promise<any | null> => {
  try {
    let songs: any[] = [];

    const fromAppPlaylist = async () => {
      const response = await ApiService.get(apiUrls.getplaylistsongs(playlistId));
      const data = (response as any)?.data;
      return data?.playlist?.songs || data?.songs || [];
    };

    if (isUserPlaylist) {
      try {
        const response = await ApiService.get(apiUrls.playlistDetail(playlistId));
        const data = (response as any)?.data;
        songs =
          data?.playlist?.songs || data?.playlist?.playlist_songs || data?.songs || [];
      } catch (error) {
        log('User playlist failed; trying app playlist endpoint:', error);
        songs = await fromAppPlaylist();
      }
    } else {
      songs = await fromAppPlaylist();
    }

    if (!Array.isArray(songs) || songs.length === 0) {
      log('No songs found for playlist:', playlistId);
      return null;
    }
    return await playSongList(songs, initialIndex, true);
  } catch (error) {
    log('playPlaylistById failed:', error);
    return null;
  }
};

/**
 * Plays a single song.
 * 1. Already current / next / previous in the native queue → native skip (no re-buffer).
 * 2. In the Redux queue → reload that queue at its index.
 * 3. Otherwise → one-item queue, then prefetch the next song.
 *
 * options.forceReload: always reload (e.g. switching vocal/instrumental URL for the same id).
 */
export const playTrackSong = async (
  song: any,
  autoPlay = true,
  options: { forceReload?: boolean } = {},
): Promise<any | null> => {
  if (!song?.id) return null;
  const songId = toId(song.id);
  if (autoPlay && !hasPendingSwitch()) beginSwitch(options.forceReload ? 'reload (audio mode)' : 'play request');

  if (!options.forceReload) {
    // 1. Native queue fast path
    if (!operationLocked) {
      try {
        const nativeQueue = await TrackPlayer.getQueue();
        const activeIdx = TrackPlayer.getActiveMediaItemIndex();
        const nativeIdx = Array.isArray(nativeQueue)
          ? nativeQueue.findIndex(q => toId(q?.mediaId) === songId)
          : -1;

        if (nativeIdx >= 0 && activeIdx !== null) {
          const diff = nativeIdx - activeIdx;
          if (diff === 0 || diff === 1 || diff === -1) {
            operationLocked = true;
            try {
              timingPath(diff === 0 ? 'already loaded' : 'preloaded (native skip)');
              timingSong(song, (nativeQueue[nativeIdx] as any)?.url);
              if (diff === 1) await TrackPlayer.skipToNext();
              if (diff === -1) await TrackPlayer.skipToPrevious();
              if (diff !== 0) timingStep(diff === 1 ? 'skipToNext()' : 'skipToPrevious()');
              if (autoPlay) await TrackPlayer.play();
              else await TrackPlayer.pause();
              if (autoPlay) {
      timingStep('play() resolved');
      watchAudioStart();
    }
              if (autoPlay && TrackPlayer.isPlaying()) timingStep('state: playing (already)');
              setPausedState(!autoPlay);
              log('Native queue hit (offset', diff, '):', song.title);
              return song;
            } finally {
              operationLocked = false;
            }
          }
        }
      } catch (error) {
        log('Native queue lookup failed, reloading:', error);
      }
    }

    // 2. Redux queue
    const reduxQueue = getAuthState()?.playlistQueue;
    if (Array.isArray(reduxQueue) && reduxQueue.length > 1) {
      const existingIndex = findSongIndex(reduxQueue, songId);
      if (existingIndex >= 0) {
        return await playSongList(reduxQueue, existingIndex, autoPlay);
      }
    }
  }

  // 3. Single item
  if (operationLocked) {
    log('Ignoring playTrackSong: another operation is running.');
    return null;
  }
  operationLocked = true;

  try {
    const ready = await setupAudioPlayer();
    if (!ready) return null;

    const prepared = await prepareSongForPlayback(song);
    const mediaItem = formatSongToMediaItem(prepared, 0);
    if (!mediaItem) {
      log('Song has no playable URL:', song.id);
      if (autoPlay) timingFailed('no playable URL');
      return null;
    }
    if (autoPlay) {
      timingPath('single load');
      timingSong(song, mediaItem.url);
      if (prepared?._resolvedAudioUrl?.startsWith?.('file://')) {
        timingStep('iOS recording ready (downloaded/cached)');
      }
    }

    // UI first (instant title/cover/lyrics), then let the native player load.
    dispatchCurrentSong(song, 0, [song], !autoPlay);
    if (autoPlay) timingStep('UI updated (Redux)');

    if (autoPlay) markLoadStart(song, mediaItem.url);
    await TrackPlayer.setMediaItem(mediaItem);
    if (autoPlay) timingStep('setMediaItem()');
    warmNextSongData(); // fetch next song's data now, so Next doesn't wait for the API
    if (autoPlay) await TrackPlayer.play();
    else await TrackPlayer.pause();
    if (autoPlay) {
      timingStep('play() resolved');
      watchAudioStart();
    }
    log(`${autoPlay ? 'Playing' : 'Loaded'} single song:`, song.title);

    schedulePrefetch();
    return song;
  } catch (error) {
    log('playTrackSong failed:', error);
    return null;
  } finally {
    operationLocked = false;
  }
};

// -----------------------------------------------------------------------------
// Prefetch (makes Next / auto-advance instant)
// -----------------------------------------------------------------------------

/**
 * Next-song data cache: currentId → Promise<full next song | null>.
 * The API calls start as soon as a song starts loading, so pressing Next
 * early (before the next song is queued) doesn't wait for the API again.
 */
const nextSongCache = new Map<string, Promise<any | null>>();
const NEXT_CACHE_MAX = 30;

const fetchNextSongFor = (currentId: string): Promise<any | null> => {
  const cached = nextSongCache.get(currentId);
  if (cached) return cached;

  const promise = (async () => {
    const adjRes: any = await ApiService.get(apiUrls.adjacentsong(currentId));
    const nextRef = adjRes?.data?.success ? adjRes.data.nextSong : null;
    if (!nextRef?.id) return null;
    const detailRes: any = await ApiService.get(apiUrls.singlesongdetail(nextRef.id));
    const song = detailRes?.data?.success ? detailRes.data.song : null;
    return song?.id ? song : null;
  })().catch(error => {
    log('fetchNextSongFor failed:', error);
    nextSongCache.delete(currentId);
    return null;
  });

  nextSongCache.set(currentId, promise);
  if (nextSongCache.size > NEXT_CACHE_MAX) {
    const oldest = nextSongCache.keys().next().value;
    if (oldest) nextSongCache.delete(oldest);
  }
  return promise;
};

/** Start fetching the next song's data for the active item right away (no queue change). */
const warmNextSongData = () => {
  try {
    const active: any = TrackPlayer.getActiveMediaItem();
    if (!active?.mediaId || active?.extras?.isRecording) return;
    fetchNextSongFor(toId(active.mediaId));
  } catch {}
};

/**
 * If the current song is the LAST item in the native queue, fetch the next
 * song from the API and append it. The native cache (preload window = 1)
 * then buffers it in the background.
 */
export const prefetchNextSongForQueue = async (
  _currentSongId?: string | number | null,
): Promise<void> => {
  if (isPrefetching || operationLocked) return;

  // API data can be fetched right away — only the queue append has to wait.
  warmNextSongData();

  // Adding to the queue while the current song is still loading makes the
  // native player jump to the new item. Wait until it is actually playing.
  if (!(await isCurrentTrackSettled())) {
    if (prefetchRetries < PREFETCH_MAX_RETRIES) {
      prefetchRetries += 1;
      schedulePrefetch(true);
    }
    return;
  }

  isPrefetching = true;

  try {
    const queue = await TrackPlayer.getQueue();
    const idx = TrackPlayer.getActiveMediaItemIndex();
    if (!Array.isArray(queue) || queue.length === 0 || idx === null) return;
    if (idx < queue.length - 1) return; // next already queued

    const current: any = queue[idx];
    if (current?.extras?.isRecording) return; // recordings have no "next"

    const currentId = toId(current?.mediaId);
    if (!currentId) return;

    const nextSong = await fetchNextSongFor(currentId);
    if (!nextSong?.id) return;

    const nextId = toId(nextSong.id);
    if (queue.some(q => toId(q?.mediaId) === nextId)) return;

    // The user may have skipped while we were fetching — re-check.
    const latestQueue = await TrackPlayer.getQueue();
    const latestIdx = TrackPlayer.getActiveMediaItemIndex();
    if (
      operationLocked ||
      !(await isCurrentTrackSettled()) ||
      latestIdx === null ||
      latestIdx !== latestQueue.length - 1 ||
      toId(latestQueue[latestIdx]?.mediaId) !== currentId
    ) {
      return;
    }

    // Download the file first, then queue it with its local path.
    let songForQueue = nextSong;
    if (DOWNLOAD_NEXT_SONG && !isRecordingSong(nextSong)) {
      const remote = getSongAudioCandidates(nextSong)[0];
      log('⬇️ Downloading next song:', nextSong.title);
      const local = await downloadAudio(remote);
      if (local) songForQueue = { ...nextSong, _resolvedAudioUrl: local };
      else log('⬇️ Download failed, queueing the remote URL instead');

      // The user may have skipped during the download — re-check.
      const q = await TrackPlayer.getQueue();
      const i = TrackPlayer.getActiveMediaItemIndex();
      if (
        operationLocked ||
        i === null ||
        i !== q.length - 1 ||
        toId(q[i]?.mediaId) !== currentId
      ) {
        return;
      }
    }

    const queueNow = await TrackPlayer.getQueue();
    const item = formatSongToMediaItem(songForQueue, queueNow.length);
    if (!item) return;

    await appendToNativeQueue(item);

    const reduxQueue = getAuthState()?.playlistQueue;
    const baseQueue = Array.isArray(reduxQueue) && reduxQueue.length ? reduxQueue : [];
    if (findSongIndex(baseQueue, nextId) < 0) {
      store.dispatch(
        setPlaylistQueue({ songs: [...baseQueue, nextSong], initialIndex: latestIdx }),
      );
      store.dispatch(setPlaylistIndex(latestIdx));
    }

    log('⏩ Queued next song:', nextSong.title, item.url.startsWith('file://') ? '(local file)' : '(stream)');
  } catch (error) {
    log('prefetchNextSongForQueue failed:', error);
  } finally {
    isPrefetching = false;
  }
};

// -----------------------------------------------------------------------------
// Next / previous
// -----------------------------------------------------------------------------

/** Native skip when a next item exists, otherwise adjacent-song API. Redux syncs via MediaItemTransition. */
export const skipToNextTrack = async (
  dispatch?: Dispatch,
  trigger = 'next',
): Promise<void> => {
  if (operationLocked) {
    log('Next ignored: another operation is running.');
    return;
  }
  operationLocked = true;
  let useApi = false;
  beginSwitch(trigger);

  try {
    const ready = await setupAudioPlayer();
    if (!ready) return;

    const queue = await TrackPlayer.getQueue();
    const activeIndex = TrackPlayer.getActiveMediaItemIndex();

    if (
      Array.isArray(queue) &&
      activeIndex !== null &&
      activeIndex >= 0 &&
      activeIndex < queue.length - 1
    ) {
      const nextItem: any = queue[activeIndex + 1];
      timingPath('preloaded (native skip)');
      timingSong(nextItem?.extras?.originalSong ?? nextItem, nextItem?.url);
      await TrackPlayer.skipToNext();
      timingStep('skipToNext()');
      await TrackPlayer.play();
      timingStep('play() resolved');
      watchAudioStart();
      return;
    }
    timingStep(
      TrackPlayer.isPlaying()
        ? 'next song NOT preloaded yet → API'
        : 'next song NOT preloaded (current song had not started playing) → API',
    );
    timingPath('api → load');
    useApi = true;
  } catch (error) {
    log('skipToNextTrack failed:', error);
    timingFailed(String(error));
  } finally {
    operationLocked = false;
  }

  if (useApi) await playAdjacentSong('next', dispatch);
};

/** >3s in → restart; else native previous; else adjacent-song API. */
export const skipToPreviousTrack = async (
  dispatch?: Dispatch,
  trigger = 'previous',
): Promise<void> => {
  if (operationLocked) return;
  operationLocked = true;
  let useApi = false;

  try {
    const ready = await setupAudioPlayer();
    if (!ready) return;

    try {
      const progress = await TrackPlayer.getProgress();
      if ((progress?.position ?? 0) > 3) {
        await TrackPlayer.seekTo(0);
        return;
      }
    } catch {}

    beginSwitch(trigger);
    const queue = await TrackPlayer.getQueue();
    const activeIndex = TrackPlayer.getActiveMediaItemIndex();

    if (Array.isArray(queue) && activeIndex !== null && activeIndex > 0) {
      const prevItem: any = queue[activeIndex - 1];
      timingPath('preloaded (native skip)');
      timingSong(prevItem?.extras?.originalSong ?? prevItem, prevItem?.url);
      await TrackPlayer.skipToPrevious();
      timingStep('skipToPrevious()');
      await TrackPlayer.play();
      timingStep('play() resolved');
      watchAudioStart();
      return;
    }
    timingStep('previous song not in queue → API');
    timingPath('api → load');
    useApi = true;
  } catch (error) {
    log('skipToPreviousTrack failed:', error);
  } finally {
    operationLocked = false;
  }

  if (useApi) await playAdjacentSong('prev', dispatch);
};

// -----------------------------------------------------------------------------
// Adjacent-song API fallback
// -----------------------------------------------------------------------------

export const playAdjacentSong = async (
  direction: 'next' | 'prev',
  dispatch?: Dispatch,
): Promise<any | null> => {
  try {
    // Recordings are not part of the song catalogue.
    if (isRecordingSong(getCurrentSong())) {
      log(`No ${direction} for recordings.`);
      return null;
    }

    const currentId = getCurrentSongId();
    if (!currentId) return null;

    // Next song data already fetched in the background? Use it — no API wait.
    if (direction === 'next' && nextSongCache.has(currentId)) {
      timingPath('cached data → load', true);
      const t0 = Date.now();
      const cachedSong = await nextSongCache.get(currentId);
      timingStep(`next song from prefetch cache (waited ${Date.now() - t0} ms)`);
      if (cachedSong?.id) {
        const played = await playTrackSong(cachedSong, true);
        if (played) (dispatch || store.dispatch)(addsong(played));
        return played;
      }
    }

    if (direction === 'next') timingStep('prefetch cache empty for this song');
    timingPath('api → load');
    const response = await timeApi('API adjacentsong', () =>
      ApiService.get(apiUrls.adjacentsong(currentId)),
    );
    const data = (response as any)?.data;
    if (!data?.success) {
      timingFailed('adjacentsong API unsuccessful');
      return null;
    }

    const target = direction === 'next' ? data.nextSong : data.previousSong;

    if (!target?.id) {
      const randomResponse = await timeApi('API randomsong', () =>
        ApiService.get(apiUrls.randomsong),
      );
      const randomData = (randomResponse as any)?.data;
      const randomSong = randomData?.success ? randomData?.songs?.[0] : null;
      if (!randomSong?.id) return null;

      const played = await playTrackSong(randomSong, true);
      if (played) (dispatch || store.dispatch)(addsong(played));
      return played;
    }

    const detailResponse = await timeApi('API singlesongdetail', () =>
      ApiService.get(apiUrls.singlesongdetail(target.id)),
    );
    const detailData = (detailResponse as any)?.data;
    if (!detailData?.success) {
      timingFailed('singlesongdetail API unsuccessful');
      return null;
    }

    const song = detailData.song || detailData.recording;
    if (!song?.id) return null;

    const played = await playTrackSong(song, true);
    if (played) {
      (dispatch || store.dispatch)(addsong(played));
      log(`Loaded ${direction} song:`, played.title);
    }
    return played;
  } catch (error) {
    log(`playAdjacentSong(${direction}) failed:`, error);
    timingFailed(`playAdjacentSong failed: ${String(error)}`);
    return null;
  }
};

// -----------------------------------------------------------------------------
// Native transition → Redux (called ONLY from service.js)
// -----------------------------------------------------------------------------

export const syncTrackTransition = async (
  item: MediaItem | null,
  index: number,
  reason?: 'auto' | 'seek' | 'repeat' | 'playlistChanged',
): Promise<void> => {
  if (!item) return;
  if (reason === 'repeat') return;

  const mediaId = toId(item.mediaId);
  if (!mediaId || transitionSyncLocked || lastSyncedMediaId === mediaId) return;

  transitionSyncLocked = true;
  try {
    const song = findSongForMediaItem(item, index);
    if (!song) {
      log('Transition item has no matching song:', mediaId);
      return;
    }

    const auth = getAuthState();
    const currentQueue = Array.isArray(auth?.playlistQueue) ? auth.playlistQueue : [];
    const safeIndex = index >= 0 ? index : Math.max(0, findSongIndex(currentQueue, mediaId));

    if (currentQueue.length === 0) {
      store.dispatch(setPlaylistQueue({ songs: [song], initialIndex: 0 }));
    }
    store.dispatch(setPlaylistIndex(safeIndex));
    store.dispatch(addsong(song));
    if (reason === 'auto') setPausedState(false);
    saveLastPlayed(song);

    lastSyncedMediaId = mediaId;
    log('Redux synced:', song.title, 'index:', safeIndex, 'reason:', reason);
    warmNextSongData();

    // Song finished and the native queue moved on by itself (no JS trigger).
    if (reason === 'auto' && !hasPendingSwitch()) {
      beginSwitch('auto-advance');
      timingPath('preloaded (native auto)');
      timingSong(song, (item as any)?.url);
      timingStep('native transition');
      if (TrackPlayer.isPlaying()) timingStep('state: playing (gapless)');
      watchAudioStart();
    }

    schedulePrefetch();
  } catch (error) {
    log('syncTrackTransition failed:', error);
  } finally {
    transitionSyncLocked = false;
  }
};

/** Called by service.js on PlaybackState Ended — only fires at the END of the queue. */
export const handlePlaybackQueueEnded = async (): Promise<void> => {
  try {
    const queue = await TrackPlayer.getQueue();
    const activeIndex = TrackPlayer.getActiveMediaItemIndex();

    const atQueueEnd =
      !Array.isArray(queue) ||
      queue.length === 0 ||
      activeIndex === null ||
      activeIndex >= queue.length - 1;

    if (!atQueueEnd) return;

    if (isRecordingSong(getCurrentSong())) {
      setPausedState(true);
      return;
    }

    beginSwitch('auto-advance (queue end)');
    timingStep('song ended, next not preloaded');
    await playAdjacentSong('next');
  } catch (error) {
    log('handlePlaybackQueueEnded failed:', error);
  }
};

// -----------------------------------------------------------------------------
// Playback controls
// -----------------------------------------------------------------------------

export const pauseCurrentSong = async (): Promise<void> => {
  clearLoadWatchdog();
  loadStartedAt = 0;
  timingCancel('paused before audio started');
  try {
    await TrackPlayer.pause();
    setPausedState(true);
  } catch (error) {
    log('pauseCurrentSong failed:', error);
  }
};

export const resumeCurrentSong = async (): Promise<void> => {
  try {
    const ready = await setupAudioPlayer();
    if (!ready) return;
    await TrackPlayer.play();
    setPausedState(false);
  } catch (error) {
    log('resumeCurrentSong failed:', error);
  }
};

export const togglePlayPause = async (): Promise<void> => {
  try {
    if (TrackPlayer.isPlaying()) await pauseCurrentSong();
    else await resumeCurrentSong();
  } catch (error) {
    log('togglePlayPause failed:', error);
  }
};

export const seekTo = async (positionSeconds: number): Promise<void> => {
  if (!Number.isFinite(positionSeconds) || positionSeconds < 0) return;
  try {
    await TrackPlayer.seekTo(positionSeconds);
  } catch (error) {
    log('seekTo failed:', error);
  }
};

export const seekBy = async (offsetSeconds: number): Promise<void> => {
  if (!Number.isFinite(offsetSeconds) || offsetSeconds === 0) return;
  try {
    const progress = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(Math.max(0, (progress?.position || 0) + offsetSeconds));
  } catch (error) {
    log('seekBy failed:', error);
  }
};

export const stopCurrentSong = async (): Promise<void> => {
  clearLoadWatchdog();
  loadStartedAt = 0;
  try {
    await TrackPlayer.stop();
    setPausedState(true);
  } catch (error) {
    log('stopCurrentSong failed:', error);
  }
};

// -----------------------------------------------------------------------------
// Utility exports
// -----------------------------------------------------------------------------

export const getCurrentMediaItem = (): MediaItem | null => {
  try {
    return TrackPlayer.getActiveMediaItem();
  } catch {
    return null;
  }
};

export const getCurrentMediaItemIndex = (): number | null => {
  try {
    return TrackPlayer.getActiveMediaItemIndex();
  } catch {
    return null;
  }
};

/**
 * Current song failed or didn't start in time → retry it with its next URL
 * (e.g. stream_m4a → original_song). Called by the load watchdog and by
 * service.js on a playback error.
 */
export const tryAudioFallback = async (reason: string): Promise<void> => {
  clearLoadWatchdog();
  if (operationLocked) return;

  try {
    const item: any = TrackPlayer.getActiveMediaItem();
    const idx = TrackPlayer.getActiveMediaItemIndex();
    if (!item || idx === null) return;

    // Started meanwhile → nothing to do.
    try {
      const progress = await TrackPlayer.getProgress();
      if (TrackPlayer.isPlaying() && (Number(progress?.position) || 0) > 0.3) return;
    } catch {}

    const fallbacks: string[] = item?.extras?.fallbackUrls ?? [];
    if (fallbacks.length === 0) {
      log(`✖ ${reason}: no other URL to try for`, item.title, '→', item.url);
      timingFailed(`${reason}, no fallback URL left`);
      return;
    }

    const [nextUrl, ...rest] = fallbacks;
    const replaced = { ...item, url: nextUrl, extras: { ...item.extras, fallbackUrls: rest } };
    const queue = await TrackPlayer.getQueue();
    const newQueue = queue.map((q: any, i: number) => (i === idx ? replaced : q));

    operationLocked = true;
    try {
      log(`↩️ ${reason}: ${item.title} failed on`, item.url, '→ trying', nextUrl);
      if (!hasPendingSwitch()) beginSwitch(`fallback (${reason})`);
      timingStep(`${reason} on ${item.url} → fallback ${nextUrl}`);
      timingPath('fallback URL', true);
      timingSong(item?.extras?.originalSong ?? item, nextUrl);
      markLoadStart(item?.extras?.originalSong ?? item, nextUrl);
      await TrackPlayer.setMediaItems(newQueue, idx);
      await TrackPlayer.play();
      watchAudioStart();
    } finally {
      operationLocked = false;
    }
  } catch (error) {
    log('tryAudioFallback failed:', error);
  }
};

/**
 * True if the native player already holds this song (current, queued or preloaded).
 * Used by the MiniPlayer to tell "the player moved on" apart from
 * "another screen asked for a new song".
 */
export const isSongInNativeQueue = async (id: unknown): Promise<boolean> => {
  const target = toId(id);
  if (!target) return false;
  try {
    const queue = await TrackPlayer.getQueue();
    return Array.isArray(queue) && queue.some(q => toId(q?.mediaId) === target);
  } catch {
    return false;
  }
};

export const getIsPlaying = (): boolean => {
  try {
    return TrackPlayer.isPlaying();
  } catch {
    return false;
  }
};