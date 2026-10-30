import React, { useEffect, useState } from "react";
import { Alert, TouchableOpacity, View, ActivityIndicator } from "react-native";
import AppImage from "./AppImage";
import { Logo } from "../constants/media";
import AppText from "./AppText";
import { Inter } from "../constants/fonts";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import apiUrls from "../../services/apiUrls";
import { loginSuccess, setAuthenticated } from "../../auth/redux/authSlice";
import ApiService from '../../services/api';
import { useAppDispatch } from "../hooks/useAppSelector";
import { useTranslation } from "react-i18next";
import { storage } from "../storage/mmkv";
import Toast from "react-native-toast-message";
import { ensureFcmToken } from "../../services/fcmToken";

export default function GoogleButton() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("ar");
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "325150637146-hh5bkrhlfu12ukh2rpnulpnagjbuo814.apps.googleusercontent.com",
    });
  }, []);

  const onGooglePress = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        console.log("No ID Token found");
        return;
      }

      const googleCredential =
        auth.GoogleAuthProvider.credential(idToken);

      const userCredential =
        await auth().signInWithCredential(googleCredential);

      console.log(idToken, "User logged in:", userCredential.user);
      await handleGoogleLoginfun(idToken);

    } catch (error) {
      console.log("Google Sign-In Error:", error);
      Toast.show({
        type: 'error',
        text1: error?.code || 'Google Sign-In Failed',
        text2: error?.message || 'Something went wrong',
        position: 'bottom',
      });
    } finally {
      // setLoading(false);
    }
  };


  const handleGoogleLoginfun = async (idToken: string) => {
    if (!idToken) {
      Toast.show({
        type: 'error',
        text1: 'No ID Token Found',
        position: 'bottom',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'ID Token Received',
      text2: idToken.substring(0, 40) + '...',
      position: 'bottom',
    });
    console.log("Google Login API called with ID Token:", idToken);
    try {
      setLoading(true);
      const fcmToken = await ensureFcmToken();
      const response = await ApiService.post(
        apiUrls.Googlelogin,
        {
          idToken,
          device_token: fcmToken || '',
        }
      );

      const res = response.data;

      console.log("Google Login Response:", res.success);

      if (res.success) {
        // Save token
        // dispatch(loginSuccess(...))

        dispatch(
          loginSuccess({
            user: res?.user ?? null,
            accessToken: res?.token,
            refreshToken: res?.refreshToken ?? null,
          })
        );
        storage.set('userToken', res.token);

        dispatch(setAuthenticated(true))
      } else {
        Alert.alert("Error", res.error || res.message);
      }
    } catch (error: any) {
      console.log(
        "Google Login API Error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "Google login failed"
      );
    }
    finally {
      setLoading(false);
    }
  };


  return (
    <TouchableOpacity
      onPress={onGooglePress}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 17,
        height: 48,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#838080",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 20
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <>
            <AppImage source={Logo.google} width={24} height={24} />



            <AppText
              color="#000000"
              fontSize={14}
              fontFamily={Inter.medium}
            >
              {t("Continue with Google")}
            </AppText>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}