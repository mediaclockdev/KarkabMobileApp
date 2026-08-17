import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../share/hooks/useAppSelector';

import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import AppLoader from '../share/components/AppLoader';
import { hideAlert, hideToast, loginSuccess } from '../auth/redux/authSlice';
import { storage } from '../share/storage/mmkv';
import AppAlertModal from '../share/components/AppAlertModal';
import CustomToast from '../share/components/CustomToast';



const RootNavigator: React.FC = () => {
    const { isAuthenticated } = useAppSelector(
        (state: any) => state.auth
    );
    const dispatch = useAppDispatch();
    const authData = storage.getString('authData');
    const token = storage.getString('userToken');
    const alert = useAppSelector((state: any) => state.auth.alert);
    const toast = useAppSelector(
        (state: any) => state.auth.toast
    );
    useEffect(() => {
        if (authData) {
            const parsedData = JSON.parse(authData);
            dispatch(loginSuccess(parsedData));
        }
    }, [])


    return (
        <>


            {token && token != '' ? (
                <MainTabNavigator />
            ) : (
                <AuthNavigator />
            )}

            <AppLoader />
            <CustomToast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => dispatch(hideToast())}
            />
            <AppAlertModal
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                confirmText={alert.confirmText}
                cancelText={alert.cancelText}
                showCancel={alert.showCancel}
                onConfirm={() => {
                    alert.onConfirm?.();
                    dispatch(hideAlert());
                }}
                onCancel={() => {
                    alert.onCancel?.();
                    dispatch(hideAlert());
                }}
            />

        </>
    );
};

export default RootNavigator;