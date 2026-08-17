import React, { useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { navigationRef } from './NavigationService';
import { useAppDispatch, useAppSelector } from '../share/hooks/useAppSelector';
import { NavigationContainer } from '@react-navigation/native'
import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import AppLoader from '../share/components/AppLoader';
import { storage } from '../share/storage/mmkv';
import { loginSuccess } from '../auth/redux/authSlice';
// import AuthNavigator from './AuthNavigator';
// import BootSplash from 'react-native-bootsplash';

const RootNavigator: React.FC = () => {
    const { isAuthenticated } = useAppSelector(
        (state: any) => state.auth
    );
      const dispatch = useAppDispatch();
    const authData = storage.getString('authData');
    const token = storage.getString('userToken');
useEffect(()=>{
if (authData) {
  const parsedData = JSON.parse(authData);
 dispatch(loginSuccess(parsedData));
}
},[])


    return (
        <>
        {console.log(token,"kkkkkkkkkkkkk")}
        {/* <NavigationContainer> */}
  {/* <MainTabNavigator /> */}
  {/* <AuthNavigator/> */}
        {/* </NavigationContainer> */}
        {/* <MainTabNavigator /> */}
            { token && token != ''? (
                <MainTabNavigator />
            ) : (
                <AuthNavigator />
            )}
            <AppLoader/>
        </>
    );
};

export default RootNavigator;