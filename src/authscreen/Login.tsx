import {
  ImageBackground,
  LogBox,
  ScrollView,
  StyleSheet, ActivityIndicator, Text, TextInput, TouchableOpacity, View, Platform, Image, Dimensions, Alert
} from "react-native";
import { BottomIcons, Images, Logo } from "../share/constants/media";
import AppImage from "../share/components/AppImage";
import AppText from "../share/components/AppText";
import color, { useAppColors } from "../share/constants/color";
import { Inter } from "../share/constants/fonts";
import { useEffect, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import GoogleButton from "../share/components/Googlebutton";
import AppleButton from "../share/components/AppleButton";
import LineView from "../share/components/LineView";
import { useAppDispatch, useAppSelector } from "../share/hooks/useAppSelector";
import { loginSuccess, setAuthenticated } from "../auth/redux/authSlice";
import { FontDebug } from "./FontDebug";
import { storage } from "../share/storage/mmkv";
import { changeLanguage } from "../localization/changeLanguage";
import { useTranslation } from "react-i18next";
import i18n from "../localization/i18n";
import apiUrls from "../services/apiUrls";
import ApiService from '../services/api';
import appleAuth from '@invertase/react-native-apple-authentication';

import { useNavigation } from '@react-navigation/native'
import { store } from "../app/store";
import Toast from "react-native-toast-message";

export default function Login() {
  const navigation = useNavigation();
  const { t } = useTranslation("ar");
  const [email, SetEmail] = useState('');
  const [password, SetPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(
    storage.getString('mode') !== 'light'
  );
  const [secure, setSecure] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showLanguage, setShowLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const dispatch = useAppDispatch();

  const { isAuthenticated, } = useAppSelector(
    (state: any) => state.auth
  );
  const color = useAppColors()


  useEffect(() => {
    console.log(i18n.language);
    console.log(t("title"), "dkhekddkeh");
    console.log(isAuthenticated, "ejjdjdbj")
    const token = storage.getString('userToken');
    console.log(token, "jdjdhjdjh")
  }, [isAuthenticated, t])

  const validateForm = () => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError(t('Email is required'));
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError(t('Please enter a valid email'));
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError(t('Password is required'));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t('Password must be at least 6 characters'));
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    //await  handleLoginfun()
    if (validateForm()) {
      console.log('Login API Call');
      //dispatch(setAuthenticated(true));
      await handleLoginfun()

      //storage.set('userToken', 'abc123');
    }
  };


  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';

    storage.set('mode', newMode);
    setIsDark(!isDark);

    //setThemeVersion(prev => prev + 1);
  };
  useEffect(() => {
    const lang = storage.getString("app_language");

    if (lang === "ar") {
      setSelectedLanguage("العربية");
    } else {
      setSelectedLanguage("English");
    }
  }, []);

  const handleLoginfun = async () => {
    try {
      setLoading(true);
      console.log(email, password, "jjegjgedjgejg")
      const response = await ApiService.post(
        apiUrls.login,
        {
          email: email,
          password: password,
        }
      );
      const res = response.data
      console.log(res, "dbdkebdb")
      if (res.success) {
        console.log('Login Success:hhh', res.user, res?.token, res?.refreshToken);
        // Alert.alert(res.message);
        const authData = {
          user: res?.user ?? null,
          accessToken: res?.token,
          refreshToken: res?.refreshToken ?? null,
        };
        storage.set('authData', JSON.stringify(authData));
        dispatch(
          loginSuccess({
            user: res?.user ?? null,
            accessToken: res?.token,
            refreshToken: res?.refreshToken ?? null,
          })
        );

        storage.set('userToken', res.token);
        dispatch(setAuthenticated(true));
        console.log(isAuthenticated, store.getState(), "ejjdjd2bj")


      }
      else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error',
          text2: res.error || 'Something went wrong',
        });
        // dispatch(setAuthenticated(false))
      }


    } catch (error: any) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Login Failed',
        text2: error?.response?.data?.message || error?.message || 'Something went wrong',
      });
      console.log(
        "FULL ERROR =>",
        JSON.stringify(error, null, 2)
      );
      console.log('Full Error:', error);
      console.log('Response:', error?.response);
      console.log('Response Data:', error?.response?.data);
      console.log('Status:', error?.response?.status);
    }
    finally {
      setLoading(false);
    }
  };

  return (

    <ImageBackground
      source={Logo.loginbackground}
      resizeMode="stretch"
      style={styles.banner}
      imageStyle={{
        width: Dimensions.get('window').width + 20,
        height: Dimensions.get('window').height,
      }}
      tintColor={color.loginbackground}

    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ rowGap: 5, alignItems: 'center' }}
        style={{ gap: 10, }}>

        {/* <FontDebug /> */}

        <View
          style={{
            width: "100%",

          }}
        >
          {/* Theme Toggle */}
          {/* <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: "#4E5050",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              flexDirection: "row",
              borderRadius: 17,
              paddingVertical: 5,
              paddingHorizontal: 12,
            }}
            // onPress={toggleTheme}
          >
            <AppText
              color={color.darkthemetext}
              fontSize={12}
              fontFamily={Inter.regular}
            >
              {isDark ? `🌙  ${t("Dark")}` : `☀️ ${t("Light")}`}
            </AppText>
          </TouchableOpacity> */}

          {/* Language Selector */}
          <View style={{ alignSelf: 'flex-end' }}>
            <TouchableOpacity
              onPress={() => setShowLanguage(!showLanguage)}
              style={{
                borderWidth: 1,
                borderColor: "#4E5050",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                flexDirection: "row",
                borderRadius: 17,
                paddingVertical: 5,
                paddingHorizontal: 10,
              }}
            >
              <AppImage
                source={Logo.language}
                width={12}
                height={12}
                tintColor={color.darkthemetext}
              />

              <AppText
                color={"#BABABA"}
                fontSize={12}
                fontFamily={Inter.regular}
              >
                {i18n.language === 'ar' ? 'العربية' : 'English'}
              </AppText>

              <AppImage
                source={Logo.downarrow}
                width={8}
                height={4}
                tintColor={color.darkthemetext}
              />
            </TouchableOpacity>

            {showLanguage && (
              <View
                style={{
                  position: "absolute",
                  top: 40,
                  right: 0,
                  backgroundColor: color.darkbackround,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#4E5050",
                  width: 120,
                  overflow: "hidden",
                  zIndex: 999,
                }}
              >
                <TouchableOpacity
                  style={{ padding: 12 }}
                  onPress={() => {
                    setSelectedLanguage("English");
                    changeLanguage("en");
                    setShowLanguage(false);
                  }}
                >
                  <AppText color={color.darkthemetext}>
                    English
                  </AppText>
                </TouchableOpacity>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#4E5050",
                  }}
                />

                <TouchableOpacity
                  style={{ padding: 12 }}
                  onPress={() => {
                    setSelectedLanguage("العربية");
                    changeLanguage("ar");
                    setShowLanguage(false);
                  }}
                >
                  <AppText color={color.darkthemetext}>
                    العربية
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>


        <AppImage
          source={Logo.loginlogo}
          width={144}
          height={142}
          style={{ alignSelf: 'center', marginTop: 40 }}

        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
          {/* <AppImage
          source={Logo.logintext1}
          width={196}
          height={34}
         tintColor={color.darkthemetext}

        /> */}
          <AppText color={color.darkthemetext} fontSize={28} fontFamily={Inter.semibold}>
            {"Ready for your "}
          </AppText>
          <AppImage
            resizeMode="contain"
            source={Logo.logintext2}
            width={111}
            height={34}


          />
        </View>
        <AppText color={color.darkthemetext} fontSize={16} fontFamily={Inter.regular} marginTop={10}>
          {"Your stage is waiting"}
        </AppText>
        <AppText color={"#F3B40F"} fontSize={16} fontFamily={Inter.regular} marginBottom={10}>
          {"دورك تغنى والمسرح بانتظارك"}
        </AppText>

        <View style={styles.searchContainer}>
          <AppImage
            source={Logo.email}
            width={18}
            height={18}
            tintColor={"#EEA75E"}
          />

          <TextInput
            value={email}
            writingDirection="ltr"
            onChangeText={SetEmail}
            placeholder={t("Enter Email")}
            placeholderTextColor="#B4B1AD"
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="left"
            style={[styles.input, , { color: color.darkthemetext, }]}
          />
        </View>

        {emailError ? (
          <AppText
            color="#FF4D4F"
            fontSize={12}
            fontFamily={Inter.regular}
            style={{ alignSelf: 'flex-start', marginTop: -6, marginLeft: 5 }}
          >
            {emailError}
          </AppText>
        ) : null}
        <View style={styles.searchContainer}>
          <AppImage
            source={Logo.lock}
            width={18}
            height={18}
            tintColor={"#EEA75E"}
          />

          <TextInput
            value={password}
            onChangeText={SetPassword}
            placeholder={t("Password")}
            placeholderTextColor="#B4B1AD"
            secureTextEntry={secure}
            textAlign="left"
            style={[styles.input, { color: color.darkthemetext, }]}
          />

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setSecure(!secure)}>
            <AppImage
              source={Logo.eye}
              width={15}
              height={11}
              tintColor="#EEA75E"
            />

            {secure && <View style={styles.eyeSlash} />}
          </TouchableOpacity>
        </View>

        {passwordError ? (
          <AppText
            color="#FF4D4F"
            fontSize={12}
            fontFamily={Inter.regular}
            style={{ alignSelf: 'flex-start', marginTop: -6, marginLeft: 5 }}
          >
            {passwordError}
          </AppText>
        ) : null}

        <TouchableOpacity style={
          { alignSelf: "flex-end" }
        } onPress={() => {
          // forgetpasswordfun()
          navigation.navigate("ForgotPassword", {
            email,
          });
        }}>
          <AppText color={"#FD8102"} fontSize={12} fontFamily={Inter.regular} textAlign="right">
            {t("Forgot password?")}
          </AppText>
        </TouchableOpacity>

        {/* <Text style={{ fontFamily: 'Inter18pt-Regular', fontSize: 20 ,color:"#FFFF" }}>
          Test Regular
        </Text>

        <Text style={{ fontFamily: 'Inter18pt-Bold', fontSize: 20 ,color:"#FFFF" }}>
          Test Bold
        </Text> */}



        <TouchableOpacity
          activeOpacity={0.8}
          style={{ width: '100%', marginVertical: 10 }}
          onPress={handleLogin}
          disabled={loading}
        >
          <LinearGradient
            colors={['#FD8701', '#D62C64', '#BA17A6', '#8801F1']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.signinview}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppText
                color="#FFFFFF"
                fontSize={16}
                fontFamily={Inter.semibold}
              >
                {t("Sign In")}
              </AppText>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <LineView />
        {
          Platform.OS === 'android' && <GoogleButton />
        }
        {Platform.OS === 'ios' && <AppleButton />}

        <View style={{ flexDirection: 'row', marginVertical: 5 }}>
          <AppText color={color.darkthemetext} fontSize={12} fontFamily={Inter.regular}>
            {t("Don’t have an account? ")}

          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <AppText color={"#EA9305"} fontSize={12} fontFamily={Inter.regular} >{t("Sign Up")} </AppText>
          </TouchableOpacity>

        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
          <AppText color={color.darkthemetext} fontSize={10} fontFamily={Inter.regular}>
            {t("By continuing you agree to our")}
          </AppText>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity>
              <AppText color={"#EA9305"} fontSize={10} fontFamily={Inter.regular}>
                {t("Terms of Service  ")}
              </AppText>
            </TouchableOpacity>

            <AppText color={color.darkthemetext} fontSize={10} fontFamily={Inter.regular}>
              {t(" and")}
            </AppText>
            <TouchableOpacity>
              <AppText color={"#EA9305"} fontSize={10} fontFamily={Inter.regular}>
                {t("   Privacy Policy")}
              </AppText>
            </TouchableOpacity>
          </View>




        </View>
        <View style={{ height: 30 }} />

      </ScrollView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  banner: {
    flex: 1,
    // justifyContent:'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'ios' ? 80 : 10,
    //  gap:10
    // alignSelf:'center',
  },


  searchContainer: {
    width: '100%',
    height: 55,
    borderRadius: 16,
    // backgroundColor: '#07090D',
    borderWidth: 0.5,
    borderColor: '#8A8A8A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    marginVertical: 5
  },

  input: {
    flex: 1,

    fontSize: 12,
    fontFamily: Inter.regular
  },

  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#2A2A2A',
  },
  signinview: {
    height: 59,
    width: "100%",
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center'
  },
  eyeSlash: {
    position: 'absolute',
    width: 18,
    height: 0.8,
    backgroundColor: '#EEA75E',
    transform: [{ rotate: '-45deg' }],
  },

})