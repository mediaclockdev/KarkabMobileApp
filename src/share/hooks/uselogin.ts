import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { storage } from '../../share/storage/mmkv';
import {
    LoginErrors,
    hasErrors,
    validateLogin,
} from './Loginvalidation';
import { loginSuccess, setAuthenticated, setLoginState } from '../../auth/redux/authSlice';
import authService from '../../services/auth.service';
import ApiService from '../../services/api';
import apiUrls from '../../services/apiUrls';
const EMPTY_ERRORS: LoginErrors = { email: null, password: null };

/**
 * All login business logic lives here.
 * The screen only renders state and forwards user intent.
 */
export const useLogin = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<LoginErrors>(EMPTY_ERRORS);
    const [loading, setLoading] = useState(false);

    const onChangeEmail = useCallback((value: string) => {
        setEmail(value);
        setErrors(prev => ({ ...prev, email: null }));
    }, []);

    const onChangePassword = useCallback((value: string) => {
        setPassword(value);
        setErrors(prev => ({ ...prev, password: null }));
    }, []);

    const persistSession = useCallback(
        (res: authService.LoginResponse) => {
            const authData = {
                user: res.user ?? null,
                accessToken: res.token ?? null,
                refreshToken: res.refreshToken ?? null,
            };

            storage.set('authData', JSON.stringify(authData));
            if (res.token) storage.set('userToken', res.token);

            dispatch(loginSuccess(authData));
            dispatch(setAuthenticated(true));
            dispatch(setLoginState('first'));
        },
        [dispatch],
    );

    const submit = useCallback(async () => {
        const validation = validateLogin(email, password);
        setErrors(validation);
        if (hasErrors(validation)) return;

        try {
            setLoading(true);

            const response = await ApiService.post(
                apiUrls.login,
                {
                    email: email,
                    password: password,
                }
            );
            const res = response.data
            if (res.success && res.token) {
                persistSession(res);
                return;
            }

            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: t('common.error'),
                text2: res.error ?? res.message ?? t('common.somethingWentWrong'),
            });
        } catch (error: any) {
            if (__DEV__) console.warn('[login]', error?.response?.data ?? error);

            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: t('auth.login.loginFailed'),
                text2:
                    error?.response?.data?.message ??
                    error?.message ??
                    t('common.somethingWentWrong'),
            });
        } finally {
            setLoading(false);
        }
    }, [email, password, persistSession, t]);

    return {
        email,
        password,
        errors,
        loading,
        onChangeEmail,
        onChangePassword,
        submit,
    };
};