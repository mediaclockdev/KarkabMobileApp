import { Sound } from 'react-native-nitro-sound';

class MusicPlayerService {
    private currentSongId: string | number | null = null;
    private isPlaying = false;

    async play(song: any) {
        try {
            if (!song?.song_url) {
                console.log('No song URL');
                return;
            }

            console.log('Playing:', song.title);
            console.log('URL:', song.song_url);

            // If same song is already playing, don't restart it
            if (
                this.currentSongId === song.id &&
                this.isPlaying
            ) {
                return;
            }

            try {
                await Sound.stopPlayer();
            } catch (e) {
                console.log('No previous player:', e);
            }

            this.currentSongId = song.id;

            await Sound.startPlayer(song.song_url);

            this.isPlaying = true;

            console.log('Music started');
        } catch (error) {
            console.log('Music play error:', error);
            this.isPlaying = false;
        }
    }

    async pause() {
        try {
            await Sound.pausePlayer();

            this.isPlaying = false;

            console.log('Music paused');
        } catch (error) {
            console.log('Pause error:', error);
        }
    }

    async resume() {
        try {
            await Sound.resumePlayer();

            this.isPlaying = true;

            console.log('Music resumed');
        } catch (error) {
            console.log('Resume error:', error);
        }
    }

    async stop() {
        try {
            await Sound.stopPlayer();

            this.isPlaying = false;
            this.currentSongId = null;

            console.log('Music stopped');
        } catch (error) {
            console.log('Stop error:', error);
        }
    }

    getIsPlaying() {
        return this.isPlaying;
    }

    getCurrentSongId() {
        return this.currentSongId;
    }
}

export default new MusicPlayerService();