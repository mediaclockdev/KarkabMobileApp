import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppImage from "../share/components/AppImage";
import AppText from "../share/components/AppText";

import { Images, Logo } from "../share/constants/media";
import { useAppColors } from "../share/constants/color";
import { Inter } from "../share/constants/fonts";

import ApiService from "../services/api";
import apiUrls from "../services/apiUrls";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

export default function OtpVerification() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const colors = useAppColors();

  const emailprop = route?.params?.email;
  const [email, SetEmail] = useState(emailprop);
  // const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const color = useAppColors();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<any[]>([]);
  const { t } = useTranslation("ar");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);
  const handleOtpChange = (text: string, index: number) => {
    const value = text.replace(/\D/g, '');

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Keep only one digit
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: any,
    index: number,
  ) => {
    if (
      e.nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };




  const handleResetPassword = async () => {

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Validation Error',
        text2: 'Please enter valid OTP',
      });
      return;
    }



    try {
      setLoading(true)
      const response = await ApiService.post(
        apiUrls.otpverify,
        {
          email,
          otp: enteredOtp,

        }
      );

      const res = response.data;

      if (res.success) {

        // await    Alert.alert(
        //       "Success",
        //       res.message,
        //       [
        //         {
        //           text: "OK",
        //           // onPress: () => navigation.navigate("Login"),
        //         },
        //       ]
        //     );

        navigation.navigate('ResetPassword', {
          email,
        })
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error',
          text2: res.error || res.message,
        });
      }
    } catch (error: any) {
      console.log(error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      });
    }
    finally {
      setLoading(false);
    }
  };


  const getPasswordStrength = () => {
    let score = 0;

    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    return score;
  };

  const strength = getPasswordStrength();




  const handleResendOtp = async () => {
    try {
      const response = await ApiService.post(
        apiUrls.forgetpassword,
        {
          email,
        }
      );

      const res = response.data;

      if (res.success) {
        console.log(res, "otp verfication response")
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Success',
          text2: res.message || 'OTP resent successfully',
        });

        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error',
          text2: res.message || 'Failed to resend OTP',
        });
      }
    } catch (error) {
      console.log(error);

      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to resend OTP',
      });
    }
  };

  const requirements = [
    {
      label: "At least 8 characters",
      valid: newPassword.length >= 8,
    },
    {
      label: "Include uppercase letter (A-Z)",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "Include lowercase letter (a-z)",
      valid: /[a-z]/.test(newPassword),
    },
    {
      label: "Include number (0-9)",
      valid: /[0-9]/.test(newPassword),
    },
    {
      label: "Include special character (!@#$%^&*)",
      valid: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      //ref={scrollRef}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        padding: 15,
        paddingBottom: 40,
        backgroundColor: colors.darkbackround,
      }}
    >
      <TouchableOpacity style={{
        alignSelf: "flex-start",
        marginBottom: 20,
      }} onPress={() => navigation.goBack()}>
        <AppImage
          source={Images.leftarrow}
          width={10}
          height={18}
          style={{ alignSelf: 'flex-start' }}
          tintColor={colors.darkthemetext}
        />
      </TouchableOpacity>

      <AppImage
        source={Logo.forgotpassword}
        width={135}
        height={135}
        style={{ marginTop: 20 }}
      />

      <AppText
        color={colors.darkthemetext}
        fontSize={30}
        fontFamily={Inter.semibold}
        marginTop={10}
      >
        {t("Verify Your Identity")}
      </AppText>

      <AppText
        color="#BABABA"
        fontSize={14}
        textAlign="center"
        marginTop={10}
      >
        {t("Enter the 6-digit verification code we’ve sent")}
      </AppText>

      <AppText
        color="#BABABA"
        fontSize={14}
        textAlign="center"
      >
        {t("to your email address")}
      </AppText>

      <View style={styles.searchContainer}>
        <AppImage
          source={Logo.email}
          width={18}
          height={18}
          tintColor={"#EEA75E"}
        />

        <TextInput
          editable={false}
          value={email}

          onChangeText={SetEmail}
          placeholder="Email, username or mobile"
          placeholderTextColor="#B4B1AD"
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, , { color: color.darkthemetext, }]}
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AppText
            color="#FAA833"
            fontSize={14}
            textAlign="center"
          >
            {t("Change")}
          </AppText>
        </TouchableOpacity>

      </View>


      {/* OTP */}
      <View>


        <AppText
          color={"#B4B1AD"}
          fontSize={16}
          fontFamily={Inter.medium}
          marginTop={10}
        >
          {t("Enter 6-digit code")}
        </AppText>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <LinearGradient
              key={index}
              colors={
                digit
                  ? [
                    "#F48215",
                    "#E24930",
                    "#CB324D",
                    "#A2217C",
                    "#7212B4",
                  ]
                  : ["#8A8A8A", "#8A8A8A"]
              }
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                padding: 1.5,
                borderRadius: 14,
              }}
            >
              <TextInput
                ref={ref => (inputRefs.current[index] = ref)}
                value={digit}
                onFocus={() => {
                  scrollRef.current?.scrollTo({
                    y: 250,
                    animated: true,
                  });
                }}
                onChangeText={text =>
                  handleOtpChange(text, index)
                }
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                style={[
                  styles.otpInput,
                  {
                    color: colors.darkthemetext,
                    borderWidth: 0,
                    backgroundColor: colors.darkbackround,
                  },
                ]}
              />
            </LinearGradient>
          ))}
        </View>



        <AppText
          color={"#B4B1AD"}
          fontSize={16}
          fontFamily={Inter.medium}
          marginTop={10}
        >
          {t("Didn’t receive the code?")}
        </AppText>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            disabled={!canResend}
            onPress={handleResendOtp}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <AppImage
                source={Images.restart}
                width={16}
                height={16}
                tintColor={canResend ? "#EEA75E" : "#666666"}
              />

              <AppText
                color={canResend ? "#EEA75E" : "#666666"}
                fontSize={16}
                fontFamily={Inter.semibold}
              >
                {t("Resend Code")}
              </AppText>
            </View>

          </TouchableOpacity>

          {!canResend ? (
            <AppText
              color={"#E71D5A"}
              fontSize={16}
              fontFamily={Inter.medium}
            >
              {t("Resend in")} 00:
              {timer.toString().padStart(2, "0")}
            </AppText>
          ) : (
            <AppText
              color={"#4CAF50"}
              fontSize={16}
              fontFamily={Inter.medium}
            >
              {t("You can resend now")}
            </AppText>
          )}
        </View>
      </View>






      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          width: "100%",
          marginTop: 25,
        }}
        onPress={handleResetPassword}
      >
        <LinearGradient
          colors={["#D4145A", "#F8572F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.signinview}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <AppText
              color="#FFF"
              fontSize={16}
              fontFamily={Inter.semibold}
            >
              {t("Verify Code")}
            </AppText>)}
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ImageBackground
          source={Logo.secure}
          style={styles.secureContainer}
          resizeMode="contain"

        >
          <AppImage
            source={Logo.securty}
            width={6}
            height={7}
            resizeMode="contain"
          />
        </ImageBackground>
        <AppText
          color={"#B4B1AD"}
          fontSize={14}
          fontFamily={Inter.medium}
          marginTop={10}
        >
          {t("For your security,this code will expire")}{"\n"} {t("in 10 minutes")}
        </AppText>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: Platform.OS === "ios" ? 80 : 20,
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30,
    marginBottom: 25,
  },

  otpInput: {
    width: 49,
    height: 62,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#8A8A8A",
    fontSize: 20,
    fontFamily: Inter.semibold,
  },

  // searchContainer: {
  //   width: "100%",
  //   height: 55,
  //   borderRadius: 16,
  //   borderWidth: 0.5,
  //   borderColor: "#8A8A8A",
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 15,
  //   marginBottom: 15,
  // },

  input: {
    flex: 1,
    fontSize: 12,
    fontFamily: Inter.regular,
    marginLeft: 10,
  },

  signinview: {
    height: 59,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  strengthContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 10,
    gap: 6,
  },

  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 4,
  },

  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  requirementCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    marginRight: 12,
  },
  searchContainer: {
    width: "100%",
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    backgroundColor: "rgba(255,255,255,0.03)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  secureContainer: {
    width: 15.26,
    height: 19.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  securityIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});