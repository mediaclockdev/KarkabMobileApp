import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native"
import AppImage from "./AppImage"
import { Logo } from "../constants/media"
import AppText from "./AppText"
import { Inter } from "../constants/fonts"
import { Text } from "react-native-gesture-handler"
import { useAppColors } from "../constants/color"
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { useState } from "react"
import ApiService from '../../services/api';
import apiUrls from "../../services/apiUrls"
import { loginSuccess, setAuthenticated } from "../../auth/redux/authSlice"
import { useDispatch } from "react-redux"
import { storage } from "../storage/mmkv"
import { useTranslation } from "react-i18next"


export default function AppleButton() {
  const color = useAppColors()
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("ar");

  const handleAppleLoginfun = async (identityToken: string) => {
    console.log("Apple Login API called with ID Token:", identityToken);
    try {
      setLoading(true);
      const response = await ApiService.post(
        apiUrls.Applelogin,
        {
          'identityToken': identityToken,
        }
      );

      const res = response.data;


      if (res?.token) {
        console.log("Apple Login Response:", res);
        storage.set('userToken', res.token);
        dispatch(
          loginSuccess({
            user: res?.user ?? null,
            accessToken: res?.token,
          })
        );
        dispatch(setAuthenticated(true))
      } else {
        Alert.alert("Error", res.error || res.message);
      }
    } catch (error: any) {
      console.log(
        "Apple Login API Error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        "Apple login failed"
      );
    }
    finally {
      setLoading(false);
    }
  };







  const onAppleButtonPress = async () => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    handleAppleLoginfun(appleAuthRequestResponse?.identityToken)
  }


  return (
    <TouchableOpacity
      style={{
        backgroundColor: color.darkbackround,
        borderRadius: 17,
        height: 48,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#838080',
        marginTop: 10
      }}

      onPress={onAppleButtonPress}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? <ActivityIndicator size={'large'} color={'#fff'} /> :


          <>

            <AppImage source={Logo.apple} width={24} height={24} tintColor={color.darkthemetext} />

            <View style={{ width: 10 }} />

            <AppText
              color={color.darkthemetext}
              fontSize={14}
              fontFamily={Inter.medium}
            >
              {t("Continue with Apple")}
            </AppText>
          </>

        }

      </View>
    </TouchableOpacity>
  )
}