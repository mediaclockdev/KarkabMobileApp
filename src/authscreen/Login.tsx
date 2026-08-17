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



import color from '../share/constants/color';
import AppImage from '../share/components/AppImage';
import AppText from '../share/components/AppText';
import { Icons, Logos } from '../share/constants/media';
import { useNavigation, NavigationProp } from '@react-navigation/native'
import apiUrls from '../services/apiUrls';
import ApiService from '../services/api';
import { useAppDispatch, useAppSelector } from "../share/hooks/useAppSelector";
import { storage } from '../share/storage/mmkv';
import { loginSuccess, setAuthenticated, setLoginState, showAlert } from '../auth/redux/authSlice';
import { store } from '../app/store';
// import { useTranslation } from "react-i18next";

type LoginNavigationProp = NavigationProp<{ SignUp: undefined }>;

const Login = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const dispatch = useAppDispatch();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);





  const validateForm = () => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };


  const handleLogin = async () => {
    // await  handleLoginfun()
    if (validateForm()) {
      console.log('Login API Call');
      //dispatch(setAuthenticated(true));
      await handleLoginfun()

      //storage.set('userToken', 'abc123');
    }
  };




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

      if (response.status === 200) {
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
        dispatch(setLoginState('first'))
        //  console.log(isAuthenticated,store.getState(), "ejjdjd2bj")


      }
      else {
        // Alert.alert(res.error)
        dispatch(
          showAlert({
            type: 'error',
            title: 'Error',
            message: res?.error || 'Something went wrong.',
            confirmText: 'Retry',
            cancelText: 'Cancel',
            showCancel: true,
            onConfirm: () => {
              console.log('Retry clicked');
              // handleRetry();
            },
            onCancel: () => {
              console.log('Cancel clicked');
            },
          })
        );
        // dispatch(setAuthenticated(false))
      }


    } catch (error: any) {
      dispatch(
        showAlert({
          type: 'error',
          title: 'Login Failed',
          message: error?.message || 'Something went wrong',
          confirmText: 'OK',
          cancelText: '',
          showCancel: false,
        })
      );
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 5 }}>
        <View style={styles.logoContainer}>
          <AppImage
            source={Logos.splashLogo}
            width={163}
            height={163}
            resizeMethod="contain"
          />

          <AppText fontSize={24} color='#4D4447'>
            Welcome Back
          </AppText>
        </View>

        <View style={styles.card}>
          {/* Email */}
          <AppText fontSize={14} color='#4D4447' fontWeight={500} marginBottom={10}>Email Address</AppText>

          <View style={styles.inputContainer}>
            <AppImage
              source={Icons.email}
              width={20}
              height={16}
              resizeMethod="contain"
            />

            <TextInput
              placeholder="name@example.com"
              placeholderTextColor="#8A8A8A"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          </View>
          {emailError ? (
            <AppText
              color="#FF4D4F"
              fontSize={12}

              style={{ alignSelf: 'flex-start', }}
            >
              {emailError}
            </AppText>
          ) : null}

          {/* Password */}
          <View style={styles.passwordHeader}>
            <AppText fontSize={14} color='#4D4447' fontWeight={500} marginBottom={10}>Password</AppText>


          </View>



          <View style={styles.inputContainer}>
            <AppImage
              source={Icons.password}
              width={16}
              height={21}
              resizeMethod="contain"
            />

            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#8A8A8A"
              secureTextEntry={securePassword}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setSecurePassword(!securePassword)}
              style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
            >
              <AppImage
                source={Icons.eye}
                width={22}
                height={15}
              />

              {!securePassword && (
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
            <AppText
              color="#FF4D4F"
              fontSize={12}

              style={{ alignSelf: 'flex-start', marginTop: 4 }}
            >
              {passwordError}
            </AppText>
          ) : null}

          <TouchableOpacity
            style={{ alignSelf: 'flex-end', marginVertical: 5 }}
            onPress={() => {
              navigation.navigate('ForgotPassword')
            }}
          >
            <AppText style={styles.forgot}>
              Forgot Password?
            </AppText>
          </TouchableOpacity>
          {/* Sign In */}
          <TouchableOpacity
            onPress={handleLogin}
            style={styles.signInButton}>
            {loading ? (
              <ActivityIndicator size="small" color="#7A5761" />
            ) : (
              <AppText style={styles.signInText}>
                Sign In
              </AppText>)}
          </TouchableOpacity>

          {/* Divider */}
          {/* <View style={styles.divider}>
          <View style={styles.line} />
          <AppText style={styles.or}>OR</AppText>
          <View style={styles.line} />
        </View> */}

          {/* Google */}
          {/* <TouchableOpacity style={styles.googleButton}>
          <AppImage
            source={Icons.google}
            width={22}
            height={22}
            resizeMethod="contain"
          />

          <AppText style={styles.googleText}>
            Continue with Google
          </AppText>
        </TouchableOpacity> */}

          {/* Signup */}
          <View style={styles.signupContainer}>
            <AppText style={styles.signupText}>
              New to Shelynx?
            </AppText>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SignUp')
              }}
            >
              <AppText style={styles.signupLink}>
                {' '}Sign up
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomDivider} />

          {/* Portal */}
          <AppText style={styles.portalText}>
            Are you an agent?
          </AppText>

          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            marginTop: 8,
          }}>
            <AppText style={styles.portalLink}>
              Log in to Portal
            </AppText>
            <AppImage
              source={Icons.portal}
              width={13.5}
              height={13.5}
              resizeMethod="contain"
            />
          </TouchableOpacity>
        </View>




        <View style={styles.footer}>
          <AppImage
            source={Icons.secure}
            width={12}
            height={15}
            resizeMethod="contain"
          />

          <AppText style={styles.ssl}>
            SECURE SSL CONNECTION
          </AppText>
        </View>

        <AppText style={styles.copyright}>
          © 2026 SheLynx. All rights reserved.
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.appcolor,

  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
  },

  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#202020',
    marginTop: 24,
  },

  card: {
    backgroundColor: color.white,
    marginTop: 35,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  label: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
    marginBottom: 10,

  },

  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E5D3D6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    // marginBottom: 22,
  },

  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#222',
  },

  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20
  },

  forgot: {
    fontSize: 14,
    color: '#8D5A63',
    fontWeight: '600',
  },

  signInButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: color.btncolor,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  signInText: {
    fontSize: 13,
    fontWeight: '700',
    color: color.btntextcolor,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E3D9DB',
  },

  or: {
    marginHorizontal: 14,
    color: '#888',
    fontWeight: '600',
  },

  googleButton: {
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5D3D6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  googleText: {
    marginLeft: 12,
    fontSize: 18,
    color: '#222',
    fontWeight: '600',
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 34,
  },

  signupText: {
    fontSize: 16,
    color: '#555',
  },

  signupLink: {
    fontSize: 16,
    color: '#8D5A63',
    fontWeight: '700',
  },

  bottomDivider: {
    height: 1,
    backgroundColor: '#E3D9DB',
    marginVertical: 28,
  },

  portalText: {
    textAlign: 'center',
    color: '#444',
    fontSize: 16,
  },

  portalLink: {
    textAlign: 'center',

    color: '#7E555C',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
  },

  ssl: {
    marginLeft: 8,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#8A7E81',
    fontSize: 12,
  },

  copyright: {
    textAlign: 'center',
    marginTop: 12,
    color: '#8A7E81',
    fontSize: 13,
  },
});