import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import ApiService from '../../services/api';
import apiUrls from '../../services/apiUrls';
import {
  EMPTY_SIGNUP_ERRORS,
  SignupErrors,
  hasSignupErrors,
  validateSignup,
} from './Signupvalidation';
import { storage } from '../storage/mmkv';
import { useAppDispatch } from './useAppSelector';
import { loginSuccess, setAuthenticated, setLoginState } from '../../auth/redux/authSlice';

type Field = 'name' | 'email' | 'password' | 'confirmPassword';

export const useSignup = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<SignupErrors>(EMPTY_SIGNUP_ERRORS);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const onChange = useCallback((field: Field) => (value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);


  const persistSession = useCallback(
    (res: any) => {
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
    const validation = validateSignup(values);
    setErrors(validation);
    if (hasSignupErrors(validation)) return;

    try {
      setLoading(true);

      const { data } = await ApiService.post(apiUrls.signup, {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (data?.success) {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: t('auth.signup.successTitle'),
          text2: data?.message ?? t('auth.signup.successMessage'),
        });

        console.log("data from sing up", data)

        if (data.success && data.token) {
          persistSession(data);
          return;
        }
        return;
      }

      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: t('common.error'),
        text2: data?.message ?? t('auth.signup.failed'),
      });
    } catch (error: any) {
      if (__DEV__) console.warn('[signup]', error?.response?.data ?? error);

      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: t('auth.signup.failed'),
        text2:
          error?.response?.data?.message ??
          error?.message ??
          t('common.somethingWentWrong'),
      });
    } finally {
      setLoading(false);
    }
  }, [values, navigation, t]);

  return { values, errors, loading, onChange, submit };
};