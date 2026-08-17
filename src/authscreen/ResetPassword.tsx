import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AppImage from '../share/components/AppImage';
import AppText from '../share/components/AppText';
import { Icons, Logos } from '../share/constants/media';
import color from '../share/constants/color';
import { useNavigation, useRoute } from "@react-navigation/native";
import ApiService from "../services/api";
import apiUrls from "../services/apiUrls";

const ResetPassword = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const resetToken = route?.params?.resetToken;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);



  const validatePassword = (value: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    return regex.test(value);
  };

  const handleResetPassword = async () => {
    // const enteredOtp = otp.join("");

    // if (enteredOtp.length !== 5) {
    //   Alert.alert("Please enter valid OTP");
    //   return;
    // }
    let isValid = true;

    setPasswordError('');
    setConfirmPasswordError('');

    if (!password.trim()) {
      setPasswordError('Please enter a new password.');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError(
        'Password must be at least 8 characters and contain uppercase, lowercase, number and special character.'
      );
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    if (!isValid) return;

    // if (!password.trim()) {
    //   Alert.alert("Enter new password");
    //   return;
    // }

    // if (!confirmPassword.trim()) {
    //   Alert.alert("Enter confirm password");
    //   return;
    // }

    // if (password !== confirmPassword) {
    //   Alert.alert("Passwords do not match");
    //   return;
    // }

    try {
      setLoading(true)
      const response = await ApiService.post(
        apiUrls.resetPassword,
        {
          resetToken: resetToken,

          newPassword: password,
          confirmPassword,
        }
      );

      const res = response.data;

      if (response.status == 200) {
        console.log(res, "ejeih")
        navigation.navigate("Login");
      } else {
        Alert.alert(res.error || res.message);
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        error?.response?.data?.message ||
        "Something went wrong"
      );
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.background}>
          {/* Logo */}
          <AppImage
            source={Logos.splashLogo}
            width={90}
            height={90}
            resizeMode="contain"
          />

          {/* Lock Icon */}
          <View style={styles.iconContainer}>
            <AppImage
              source={Logos.lock}
              width={34}
              height={34}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <AppText style={styles.title}>
            Create New Password
          </AppText>

          {/* Description */}
          <AppText style={styles.description}>
            Your new password must be different{'\n'}
            from previous passwords for security.
          </AppText>

          {/* Card */}
          <View style={styles.card}>
            <AppText style={styles.label}>
              New Password
            </AppText>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Min. 8 characters"
                placeholderTextColor="#7B7B7B"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setPasswordError('');
                }}
                style={styles.input}
              />


              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
              >
                <AppImage
                  source={Icons.eye}
                  width={22}
                  height={15}
                />

                {!showPassword && (
                  <View
                    style={{
                      position: 'absolute',
                      width: 24,
                      height: 2,
                      backgroundColor: '#7A5761',
                      transform: [{ rotate: '-45deg' }],
                    }}
                  />
                )}
              </TouchableOpacity>

            </View>
            {passwordError ? (
              <AppText style={styles.errorText}>
                {passwordError}
              </AppText>
            ) : null}

            <AppText style={[styles.label, { marginTop: 20 }]}>
              Confirm Password
            </AppText>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Re-enter password"
                placeholderTextColor="#7B7B7B"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  setConfirmPasswordError('');
                }}
                style={styles.input}
              />


              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
              >
                <AppImage
                  source={Icons.eye}
                  width={22}
                  height={15}
                />

                {!showConfirmPassword && (
                  <View
                    style={{
                      position: 'absolute',
                      width: 24,
                      height: 2,
                      backgroundColor: '#7A5761',
                      transform: [{ rotate: '-45deg' }],
                    }}
                  />
                )}
              </TouchableOpacity>

            </View>
            {confirmPasswordError ? (
              <AppText style={styles.errorText}>
                {confirmPasswordError}
              </AppText>
            ) : null}

            <TouchableOpacity
              onPress={handleResetPassword}
              style={styles.button}>
              {loading ? (
                <ActivityIndicator size="small" color="#7A535D" />
              ) : (
                <>
                  <AppText style={styles.buttonText}>
                    Create Password
                  </AppText>

                  <AppImage
                    source={Logos.arrow}
                    width={18}
                    height={18}
                    resizeMode="contain"
                    marginLeft={10}
                  />
                </>)}

            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  background: {
    flex: 1,
    backgroundColor: '#FFF6F8',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },

  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1C1C',
    marginTop: 35,
    textAlign: 'center',
  },

  description: {
    fontSize: 16,
    color: '#574146',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 28,
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginTop: 35,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 5,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4D4447',
    marginBottom: 10,
  },

  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: '#DCCFD3',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#1B1C1C',
  },

  button: {
    marginTop: 40,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFC8D6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#7B545D',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});