import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../share/hooks/useAppSelector';
import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import AppLoader from '../share/components/AppLoader';
import { storage } from '../share/storage/mmkv';
import { hideToast, loginSuccess, setAuthenticated } from '../auth/redux/authSlice';
import CustomToast from '../share/components/CustomToast';

const RootNavigator: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state: any) => state.auth);
    const [hydrated, setHydrated] = useState(false);
    const toast = useAppSelector(
        (state: any) => state.auth.toast
    );

    useEffect(() => {
        const token = storage.getString('userToken');
        const authDataStr = storage.getString('authData');

        if (token || authDataStr) {
            try {
                let parsed: any = {};
                if (authDataStr) {
                    parsed = JSON.parse(authDataStr);
                }
                const activeToken = token || parsed.accessToken;
                if (activeToken) {
                    dispatch(
                        loginSuccess({
                            user: parsed.user ?? null,
                            accessToken: activeToken,
                            refreshToken: parsed.refreshToken ?? null,
                        }),
                    );
                    dispatch(setAuthenticated(true));
                } else {
                    storage.remove('authData');
                    storage.remove('userToken');
                }
            } catch {
                storage.remove('authData');
                storage.remove('userToken');
            }
        }
        setHydrated(true);
    }, [dispatch]);

    if (!hydrated) return <AppLoader />;

    return (
        <>
            {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
            <AppLoader />
            <CustomToast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => dispatch(hideToast())}
            />
        </>
    );
};

export default RootNavigator;