import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AppText from '../share/components/AppText';
import AppImage from '../share/components/AppImage';
import { Logos } from '../share/constants/media';
import color from '../share/constants/color';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import ApiService from "../services/api";
import apiUrls from '../services/apiUrls';

const OtpVerification = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const emailprop = route?.params?.email;
  const [email, SetEmail] = useState(emailprop);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [otpError, setOtpError] = useState('');

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (otpError) {
      setOtpError('');
    }

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (
    text: string,
    index: number,
  ) => {
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };



  const handleOtpverification = async () => {
    console.log(emailprop, "ppppphhhp")
    const enteredOtp = otp.join("");
    setOtpError('');

    if (enteredOtp.length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }
    try {
      setLoading(true);
      const response = await ApiService.post(apiUrls.otpverify, {
        email,
        otp: enteredOtp,

      });

      const data = response.data;

      if (response.status === 200) {
        console.log(data?.resetToken, "djjkkehje")
        const resetToken = data?.resetToken
        //   Alert.alert("Success", data.message || "Account created");
        navigation.navigate('ResetPassword', {
          resetToken,
        })
      } else {
        Alert.alert("Error", data.message || "Signup failed");
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Sign up Failed',
        error.message || 'Something went wrong'
      );
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}

        <AppImage
          source={Logos.splashLogo}
          width={90}
          height={90}
          resizeMode="contain"
        />

        {/* Title */}

        <AppText style={styles.title}>
          Verify Email
        </AppText>

        {/* Description */}

        <AppText style={styles.description}>
          {"We've sent a 6-digit code to your email.\nPlease enter it below to reset your\npassword."}
        </AppText>

        {/* OTP */}

        <View style={styles.otpContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputs.current[index] = ref;
              }}
              value={value}
              onChangeText={text =>
                handleChange(text, index)
              }
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace(value, index);
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              style={styles.otpInput}
              textAlign="center"
            />
          ))}
        </View>

        {otpError ? (
          <AppText style={styles.errorText}>
            {otpError}
          </AppText>
        ) : null}
        {/* Button */}

        <TouchableOpacity style={styles.button}
          onPress={handleOtpverification}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#7A535D" />
          ) : (
            <>
              <AppText style={styles.buttonText}>
                Verify To Continue
              </AppText>

              <AppImage
                source={Logos.arrow}
                width={16}
                height={16}
                resizeMode="contain"
                marginLeft={10}
              />
            </>)}

        </TouchableOpacity>

        {/* Timer */}

        <AppText style={styles.timer}>
          Resend code in{' '}
          <AppText
            style={{
              color: '#8C6670',
              fontWeight: '700',
            }}
          >
            00:58
          </AppText>
        </AppText>
      </View>
    </SafeAreaView>
  );
};

export default OtpVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6F8',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#222',
    marginTop: 30,
  },

  description: {
    marginTop: 18,
    fontSize: 18,
    color: '#5B5356',
    textAlign: 'center',
    lineHeight: 32,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
  },

  otpInput: {
    width: 52,
    height: 68,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCCFD3',
    backgroundColor: '#FFF',
    fontSize: 26,
    color: '#000',
    fontWeight: '700',
  },

  button: {
    marginTop: 45,
    height: 58,
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#FFC7D7',

    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7A535D',
  },

  timer: {
    marginTop: 40,
    fontSize: 18,
    color: '#5B5356',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    marginLeft: 2,
  },
});