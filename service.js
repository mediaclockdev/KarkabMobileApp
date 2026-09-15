// service.js
import TrackPlayer, { Event } from '@rntp/player';

// Switch from module.exports to an explicit default function export
export default async function playbackService() {
    // Listens for the lock screen/notification play button click
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        TrackPlayer.play();
    });

    // Listens for the lock screen/notification pause button click
    TrackPlayer.addEventListener(Event.RemotePause, () => {
        TrackPlayer.pause();
    });

    // Listens for the next track button click
    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        // Leave blank or hook your custom next-track handler here
    });

    // Listens for the previous track button click
    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        // Leave blank or hook your custom previous-track handler here
    });

    // Automatically stops/cleans up resources if the notification is swiped away
    TrackPlayer.addEventListener(Event.RemoteStop, () => {
        TrackPlayer.destroy();
    });
}
