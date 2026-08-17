import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    showCancel: boolean;
    onConfirm?: (() => void) | null;
    onCancel?: (() => void) | null;
}

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
    userCountry: any | null
    alert: AlertState
    toast: ToastState
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loginState: null,
    loading: false,
    refreshToken: null,
    error: null,
    userCountry: {
        name: 'Australia',
        dial_code: '61',
        code: 'AU',
    },
    alert: {
        visible: false,
        type: 'info',
        title: '',
        message: '',
        confirmText: 'OK',
        cancelText: 'Cancel',
        showCancel: false,
        onConfirm: null,
        onCancel: null,
    },
    toast: {
        visible: false,
        message: '',
        type: 'success',
    },
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

        loaderstate(state, action) {
            state.loading = action.payload
            // state.error = null
        },
        loginSuccess(state, action) {
            state.loading = false
            state.user = action.payload.user
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
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
        showAlert(state, action: PayloadAction<Partial<AlertState>>) {
            state.alert = {
                ...state.alert,
                ...action.payload,
                visible: true,
            };
        },

        // Hide Alert
        hideAlert(state) {
            state.alert.visible = false;
            state.alert.onConfirm = null;
            state.alert.onCancel = null;
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
        }
    },
})

export const {
    setAuthenticated,
    setLoginState,
    loginSuccess,
    loginFailure,
    loaderstate,
    logout,
    restoreSession,
    restoreSessionComplete,
    updateUserCoyntry,
    showAlert,
    hideAlert,
    showToast,
    hideToast

} = authSlice.actions

export default authSlice.reducer