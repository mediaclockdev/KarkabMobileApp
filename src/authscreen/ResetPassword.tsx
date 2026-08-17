import React, { useRef, useState } from "react";
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ResetPassword() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const colors = useAppColors();
  const { t } = useTranslation("ar");
  const email = route?.params?.email;
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputRefs = useRef<any[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, "");
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleResetPassword = async () => {
    // const enteredOtp = otp.join("");

    // if (enteredOtp.length !== 5) {
    //   Alert.alert("Please enter valid OTP");
    //   return;
    // }

    if (!newPassword.trim()) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Validation Error',
        text2: 'Enter new password',
      });
      return;
    }

    if (!confirmPassword.trim()) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Validation Error',
        text2: 'Enter confirm password',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Validation Error',
        text2: 'Passwords do not match',
      });
      return;
    }

    try {
      setLoading(true)
      const response = await ApiService.post(
        apiUrls.resetPassword,
        {
          email,

          newPassword,
          confirmPassword,
        }
      );

      const res = response.data;

      if (res.success) {
        // Alert.alert(
        //   "Success",
        //   res.message,
        //   [
        //     {
        //       text: "OK",
        //       onPress: () => navigation.navigate("Login"),
        //     },
        //   ]
        // );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your password has been reset successfully.",
        });
        navigation.navigate("Login");
      } else {
        // Alert.alert(res.error || res.message);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error',
          text2: res.error || res.message,
        });
      }
    } catch (error: any) {
      console.log(error);
      // Alert.alert(
      //   error?.response?.data?.message ||
      //   "Something went wrong"
      // );
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
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
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 40,
        backgroundColor: colors.darkbackround,
        padding: 15
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
        {t("Create New Password")}
      </AppText>

      <AppText
        color="#BABABA"
        fontSize={14}
        textAlign="center"
        marginTop={10}
      >
        {t("Your new password must be different from")}
      </AppText>

      <AppText
        color="#BABABA"
        fontSize={14}
        textAlign="center"
      >
        {t("previously used passwords")}
      </AppText>

      {/* OTP */}

      {/* <View style={styles.otpContainer}>
    {otp.map((digit, index) => (
      <TextInput
        key={index}
        ref={ref => (inputRefs.current[index] = ref)}
        value={digit}
        onChangeText={text =>
          handleOtpChange(text, index)
        }
        keyboardType="number-pad"
        maxLength={1}
        textAlign="center"
        style={[
          styles.otpInput,
          {
            color: colors.darkthemetext,
          },
        ]}
      />
    ))}
  </View> */}

      <AppText
        color={colors.darkthemetext}
        fontSize={15}
        fontFamily={Inter.medium}
        marginBottom={10}
        alignSelf="flex-start"
      >
        {t("New Password")}
      </AppText>

      <View style={styles.searchContainer}>
        <AppImage
          source={Logo.lock}
          width={18}
          height={18}
          tintColor="#FF2D55"
        />

        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t("Enter new password")}
          placeholderTextColor="#B4B1AD"
          secureTextEntry={!showNewPassword}
          style={[
            styles.input,
            { color: colors.darkthemetext },
          ]}
        />

        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() =>
            setShowNewPassword(!showNewPassword)
          }
        >
          <AppImage
            source={Logo.eye}
            width={15}
            height={11}
            tintColor="#FFFFFF"
          />
          {showNewPassword && <View style={styles.eyeSlash} />}
        </TouchableOpacity>
      </View>

      {/* Strength */}

      <View style={styles.strengthContainer}>
        {[1, 2, 3, 4].map(item => (
          <View
            key={item}
            style={[
              styles.strengthBar,
              {
                backgroundColor:
                  strength >= item
                    ? "#FF2D55"
                    : "#2A2A2A",
              },
            ]}
          />
        ))}
      </View>

      <AppText
        color="#FF2D55"
        fontSize={13}
        marginTop={8}
        alignSelf="flex-start"
      >
        {t("Strength")}:
        {strength <= 2
          ? t(" Weak")
          : strength <= 4
            ? " Medium"
            : " Strong"}
      </AppText>

      <AppText
        color={colors.darkthemetext}
        fontSize={15}
        fontFamily={Inter.medium}
        marginTop={28}
        marginBottom={10}
        alignSelf="flex-start"
      >
        {t("Confirm Password")}
      </AppText>

      <View style={styles.searchContainer}>
        <AppImage
          source={Logo.lock}
          width={18}
          height={18}
          tintColor="#FF2D55"
        />

        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("Confirm Password")}
          placeholderTextColor="#B4B1AD"
          secureTextEntry={!showConfirmPassword}
          style={[
            styles.input,
            { color: colors.darkthemetext },
          ]}
        />

        <TouchableOpacity

          style={styles.eyeButton}
          onPress={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
        >
          <AppImage
            source={Logo.eye}
            width={15}
            height={11}
            tintColor="#FFFFFF"
          />
          {showConfirmPassword && <View style={styles.eyeSlash} />}
        </TouchableOpacity>

      </View>

      {/* Requirements */}

      <View
        style={{
          width: "100%",
          marginTop: 15,
        }}
      >
        {requirements.map((item, index) => (
          <View
            key={index}
            style={styles.requirementRow}
          >
            <View
              style={[
                styles.requirementCircle,
                {
                  borderColor: item.valid
                    ? "#FF2D55"
                    : "#B4B1AD",
                },
              ]}
            />

            <AppText
              color={
                item.valid
                  ? colors.darkthemetext
                  : "#B4B1AD"
              }
              fontSize={13}
            >
              {item.label}
            </AppText>
          </View>
        ))}
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
              {t("Update Password")}
            </AppText>)}
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15 }}>
        <ImageBackground
          source={Logo.secure}
          style={styles.secureContainer}
          resizeMode="contain"

        >
          <AppImage
            source={Logo.tick}
            width={6}
            height={7}
            resizeMode="contain"
            tintColor={"#E52450"}
          />
        </ImageBackground>
        <AppText
          color={colors.darkthemetext}
          fontSize={13}
          fontFamily={Inter.medium}


        >
          {t("Your password is encrypted and secure")}
        </AppText>
      </View>
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
    width: 55,
    height: 55,
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
    marginBottom: 15,
  },
  eyeSlash: {
    position: 'absolute',
    width: 18,
    height: 1,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  eyeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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