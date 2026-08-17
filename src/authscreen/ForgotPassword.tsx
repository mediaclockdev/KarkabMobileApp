import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, NavigationProp } from "@react-navigation/native";

import AppText from "../share/components/AppText";
import AppImage from "../share/components/AppImage";
import Toast from 'react-native-toast-message';
import { Banner, Logo } from "../share/constants/media";
import color, { useAppColors } from "../share/constants/color";
import { Inter } from "../share/constants/fonts";
import apiUrls from "../services/apiUrls";
import ApiService from '../services/api';
import { useTranslation } from "react-i18next";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const colors = useAppColors();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { t } = useTranslation("ar");

  const validateEmail = () => {
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }

    return true;
  };

  const handleSendOtp = () => {
    //  navigation.navigate("OtpVerification", {
    //   email,
    // });
    if (!validateEmail()) return;
    forgetpasswordfun()

  };

  const forgetpasswordfun = async () => {
    try {
      setLoading(true)
      const response = await ApiService.post(
        apiUrls.forgetpassword,
        {
          email: email,

        }
      );
      const res = response.data as { success?: boolean; message?: string };
      if (res?.success) {
        console.log('Login Success:', response.data);
        // Alert.alert(res.message);

        (navigation as any).navigate("OtpVerification", { email });



      }
      else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Message:-',
          text2: res?.message ?? 'Something went wrong',
        });

      }


    } catch (error: any) {
      //Alert.alert('Login Error:', error)
      console.log('Forgot Error:', error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Message:-',
        text2: error?.message,
      });
      console.log('Message:', error?.message);
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
        width: Dimensions.get("window").width + 20,
        height: Dimensions.get("window").height,
      }}
      tintColor={colors.darkbackround}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
      >



        {/* <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: 1,
        }}
      > */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            alignSelf: "flex-start",
            marginBottom: 20,
          }}

        >
          <AppImage
            source={Logo.arrowline}
            width={34}
            height={34}

          />
        </TouchableOpacity>

        <AppImage
          source={Logo.forgotpassword}
          width={135}
          height={135}
          style={{
            marginTop: 60,
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 30,
            gap: 10
          }}
        >
          <AppText
            color={colors.darkthemetext}
            fontSize={28}
            fontFamily={Inter.semibold}
          //   style={{ marginRight: 6 }}
          >
            Forgot
          </AppText>

          <AppImage
            source={Banner.forgottext}
            resizeMode="contain"
            width={142}
            height={38}
            style={{ marginTop: 1.5 }}
          />
        </View>


        <AppText
          color={"#A59C93"}
          fontSize={13}
          fontFamily={Inter.regular}
          marginTop={8}
          textAlign="center"
        >
          {t("No worries ! Enter your email address and we’ll")}
        </AppText>

        <AppText
          color={"#A59C93"}
          fontSize={13}
          fontFamily={Inter.regular}
          textAlign="center"
        >
          {t("send you OTP to reset your password")}
        </AppText>

        <View style={{ height: 40 }} />
        <View style={{ width: '100%' }}>
          <AppText
            color={color.darkthemetext}
            fontSize={13}
            fontFamily={Inter.medium}
            textAlign="left"
            marginBottom={20}
          >
            {t("Email Address")}
          </AppText>
        </View>




        <View style={styles.searchContainer}>
          <AppImage
            source={Logo.email}
            width={18}
            height={18}
            tintColor={"#EEA75E"}
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("Enter Email")}
            placeholderTextColor="#B4B1AD"
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="left"
            style={[
              styles.input,
              {
                color: colors.darkthemetext,
              },
            ]}
          />
        </View>

        {emailError ? (
          <AppText
            color="#FF4D4F"
            fontSize={12}
            style={{
              alignSelf: "flex-start",
              marginTop: 5,
            }}
          >
            {emailError}
          </AppText>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: "100%",
            marginTop: 30,
          }}
          onPress={handleSendOtp}
        >
          <LinearGradient
            colors={["#E97124", "#C33332", "#801538",]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.signinview,
              {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>

                <AppText
                  color="#FFF"
                  fontSize={16}
                  fontFamily={Inter.regular}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  {t("Send reset link")}
                </AppText>

                <AppImage
                  source={Logo.arrowline}
                  width={18}
                  height={18}
                  tintColor="#FFF"
                  style={{
                    transform: [{ rotate: '180deg' }],

                  }}

                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <AppText
          color="#B4B1AD"
          fontSize={12}
          fontFamily={Inter.regular}
          marginVertical={20}
        >
          {t("or")}
        </AppText>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            // marginTop: 25,
          }}
        >
          <AppText
            color={"#FAB64D"}
            fontSize={14}
            fontFamily={Inter.regular}
          >
            {t("Back to Login")}
          </AppText>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: Platform.OS === "ios" ? 80 : 20,
  },

  searchContainer: {
    width: "100%",
    height: 55,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#8A8A8A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10,
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 12,
    fontFamily: Inter.regular,
  },

  signinview: {
    height: 59,
    width: "100%",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row'
  },
});