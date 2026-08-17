import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppImage from '../share/components/AppImage';
import { Logos } from '../share/constants/media';
import AppText from '../share/components/AppText';
import { useNavigation, NavigationProp } from '@react-navigation/native'
import apiUrls from '../services/apiUrls';
import ApiService from "../services/api";


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});


  const validate = () => {
    let valid = true;
    let err: any = {};


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      err.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(email)) {
      err.email = "Please Enter valid email";
      valid = false;
    }





    setErrors(err);
    return valid;
  };





  const handleForgot = async () => {
    console.log(email, "pppppp")
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await ApiService.post(apiUrls.forgetpassword, {

        email: email,

      });
      console.log(response, "djjehje")
      const data = response.data;

      if (response.status === 200) {
        //   Alert.alert("Success", data.message || "Account created");
        navigation.navigate("OtpVerification", {
          email,
        });
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
      <View style={styles.background}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <AppImage
              source={Logos.lock}
              height={34}
              width={34}
              resizeMode='contain'
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Forgot Password?</Text>

          {/* Description */}
          <Text style={styles.description}>
            Enter the email address associated{'\n'}
            with your account and we'll send you{'\n'}
            a link to reset your password.
          </Text>

          {/* Label */}
          <Text style={styles.label}>Email Address</Text>

          {/* Input */}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. alex@example.com"
            placeholderTextColor="#8D8D8D"
            style={styles.input}
            keyboardType="email-address"
          />
          {errors.email && <AppText fontSize={12} color="red">{errors.email}</AppText>}

          {/* Button */}
          <TouchableOpacity style={styles.button}
            // onPress={() => {
            //  // navigation.navigate('OtpVerification')

            // }}
            onPress={handleForgot}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#7A5761" />
            ) : (
              <>
                <AppText style={styles.buttonText}>
                  {"Change Password"}
                </AppText>



                <AppImage
                  source={Logos.arrow}
                  width={16}
                  height={16}
                  resizeMode='contain'
                  marginLeft={8}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Back */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Login')
            }}
            style={styles.backBtn}>
            {/* <Ionicons
              name="arrow-back"
              size={18}
              color="#7A535D"
            /> */}
            <AppImage
              source={Logos.rightarrow}
              width={16}
              height={16}
              resizeMode='contain' />

            <Text style={styles.backText}> Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  background: {
    flex: 1,
    margin: 0,
    backgroundColor: '#FFF4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
  },

  iconContainer: {
    height: 96,
    width: 96,
    borderRadius: 48,
    backgroundColor: '#FFD6E2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 28,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#202020',
    textAlign: 'center',
  },

  description: {
    fontSize: 18,
    color: '#5B5356',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 30,
  },

  label: {
    marginTop: 36,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#51484B',
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#D8C9CD',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#000',
  },

  button: {
    marginTop: 30,
    height: 58,
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

  backBtn: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },

  backText: {
    fontSize: 18,
    color: '#7A535D',
    fontWeight: '500',
  },
});