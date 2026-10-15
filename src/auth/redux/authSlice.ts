import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface ToastState {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

interface AuthState {
    user: any | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    loginState: string | null
    loading: boolean
    error: string | null,
    userCountry: any | null,
    playsong: any | null,
    playlistQueue: any[],
    playlistIndex: number,
    toast: ToastState
    isPaused: boolean,
    hideMiniPlayer: boolean,
    songAction: SongActionState | null,
    recordingRefresh: number;
}


interface SongActionState {
    visible: boolean;
    song: any | null;
}
const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loginState: null,
    loading: false,
    refreshToken: null,
    error: null,
    isPaused: false,
    userCountry: {
        name: 'Australia',
        dial_code: '61',
        code: 'AU',
    },
    toast: {
        visible: false,
        message: '',
        type: 'success',
    },
    playsong: null,
    playlistQueue: [],
    playlistIndex: 0,
    hideMiniPlayer: false,
    songAction: {
        visible: false,
        song: null,
    },
    recordingRefresh: 0,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthenticated(state, action: PayloadAction<boolean>) {
            state.isAuthenticated = action.payload
        },
        setLoginState(state, action: PayloadAction<string | null>) {
            state.loginState = action.payload
        },
        loginRequest(state) {
            state.loading = true
            state.error = null
        },

        loaderstate(state, action) {
            state.loading = action.payload
            //state.isPaused = action.payload
            // state.error = null
        },
        isPausesd(state, action) {
            state.isPaused = action.payload;
        },
        loginSuccess(state, action) {
            console.log("action of login saga", action.payload)
            state.loading = false
            state.user = action?.payload?.user
            state.accessToken = action?.payload?.accessToken
            state.refreshToken = action?.payload?.refreshToken ?? null
            state.isAuthenticated = true
        },

        loginFailure(state, action) {
            state.loading = false
            state.error = action.payload
        },
        logout: (state) => {
            state.user = null
            state.accessToken = null
            state.isAuthenticated = false
        },

        restoreSession: (state) => {
            state.loading = true
        },

        restoreSessionComplete: (state) => {
            state.loading = false
        },
        updateUserCoyntry: (state, action) => {
            state.userCountry = action.payload
        },
        addsong: (state, action) => {
            state.playsong = action.payload;
            if (action.payload?.id && Array.isArray(state.playlistQueue) && state.playlistQueue.length > 0) {
                const idx = state.playlistQueue.findIndex(
                    (s: any) => s?.id?.toString() === action.payload.id.toString()
                );
                if (idx !== -1) {
                    state.playlistIndex = idx;
                }
            }
        },
        setPlaylistQueue: (state, action: PayloadAction<{ songs: any[]; initialIndex?: number }>) => {
            state.playlistQueue = action.payload.songs || [];
            state.playlistIndex = action.payload.initialIndex ?? 0;
            if (state.playlistQueue[state.playlistIndex]) {
                state.playsong = state.playlistQueue[state.playlistIndex];
            }
        },
        setPlaylistIndex: (state, action: PayloadAction<number>) => {
            state.playlistIndex = action.payload;
            if (state.playlistQueue && state.playlistQueue[action.payload]) {
                state.playsong = state.playlistQueue[action.payload];
            }
        },
        setHideMiniPlayer: (state, action) => {
            state.hideMiniPlayer = action.payload;
        },
        showToast(state, action) {
            state.toast = {
                visible: true,
                message: action.payload.message,
                type: action.payload.type,
            };
        },

        hideToast(state) {
            state.toast.visible = false;
        },
        openSongAction(state, action) {
            state.songAction ??= { visible: false, song: null };
            state.songAction.visible = true;
            state.songAction.song = action.payload;
        },

        closeSongAction(state) {
            if (!state.songAction) return;
            state.songAction.visible = false;
            state.songAction.song = null;
        },
        refreshRecordings(state) {
            state.recordingRefresh += 1;
        },
    },
})

export const {
    setAuthenticated,
    setLoginState,
    loginRequest,
    loginSuccess,
    loginFailure,
    loaderstate,
    logout,
    restoreSession,
    restoreSessionComplete,
    isPausesd,
    updateUserCoyntry,
    addsong,
    setPlaylistQueue,
    setPlaylistIndex,
    showToast,
    hideToast,
    setHideMiniPlayer,
    openSongAction,
    closeSongAction,
    refreshRecordings,
} = authSlice.actions

export default authSlice.reducer