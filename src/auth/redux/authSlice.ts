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
    toast: ToastState
    isPaused: boolean,
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
    playsong: null
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
            state.playsong = action.payload
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
    showToast,
    hideToast,
} = authSlice.actions

export default authSlice.reducer