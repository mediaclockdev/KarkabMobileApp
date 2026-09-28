// src/services/lastPlayed.ts
import { storage } from '../share/storage/mmkv'; // ✅ use existing instance

const LAST_PLAYED_KEY = 'last_played_song';

export const saveLastPlayed = (song: any) => {
    try {
        storage.set(LAST_PLAYED_KEY, JSON.stringify(song));
    } catch (e) {
        if (__DEV__) console.warn('[lastPlayed] save error:', e);
    }
};

export const getLastPlayed = (): any | null => {
    try {
        const data = storage.getString(LAST_PLAYED_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        if (__DEV__) console.warn('[lastPlayed] read error:', e);
        return null;
    }
};