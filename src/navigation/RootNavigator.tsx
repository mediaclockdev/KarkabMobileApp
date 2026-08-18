import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../share/hooks/useAppSelector';
import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import AppLoader from '../share/components/AppLoader';
import { storage } from '../share/storage/mmkv';
import { loginSuccess, setAuthenticated } from '../auth/redux/authSlice';

const RootNavigator: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state: any) => state.auth);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const authData = storage.getString('authData');
        const token = storage.getString('userToken');

        if (authData && token) {
            try {
                dispatch(loginSuccess(JSON.parse(authData)));
                dispatch(setAuthenticated(true));   // loginSuccess alone doesn't set this
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
        </>
    );
};

export default RootNavigator;