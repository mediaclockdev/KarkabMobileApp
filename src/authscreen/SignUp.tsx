// import {
//   ImageBackground,
//   ScrollView,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Alert,
//   Platform,
//   Dimensions,
//   ActivityIndicator,
// } from "react-native";
// import { useState } from "react";
// import LinearGradient from "react-native-linear-gradient";

// import AppImage from "../share/components/AppImage";
// import AppText from "../share/components/AppText";
// import { Banner, Logo } from "../share/constants/media";
// import color, { useAppColors } from "../share/constants/color";
// import { Inter } from "../share/constants/fonts";
// import { useNavigation } from '@react-navigation/native'
// import { changeLanguage } from "../localization/changeLanguage";
// import ApiService from "../services/api";
// import apiUrls from "../services/apiUrls";
// import LineView from "../share/components/LineView";
// import GoogleButton from "../share/components/Googlebutton";
// import AppleButton from "../share/components/AppleButton";
// import { useTranslation } from "react-i18next";
// import Toast from "react-native-toast-message";
// import i18n from "../localization/i18n";
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// export default function SignUp() {
//   const color = useAppColors();
//   const navigation = useNavigation<any>();
//   const { t } = useTranslation("ar");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [secure, setSecure] = useState(true);
//   const [secureconfirm, setSecureConfirm] = useState(true);
//   const [errors, setErrors] = useState<any>({});
//   const [showLanguage, setShowLanguage] = useState(false);
//   const [selectedLanguage, setSelectedLanguage] = useState("English");
//   const [loading, setLoading] = useState(false);

//   const validate = () => {
//     let valid = true;
//     let err: any = {};

//     if (!name.trim()) {
//       err.name = t("Name is required");
//       valid = false;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!email.trim()) {
//       err.email = t("Email is required");
//       valid = false;
//     } else if (!emailRegex.test(email)) {
//       err.email = t("Please enter a valid email");
//       valid = false;
//     }

//     if (!password.trim()) {
//       err.password = t("Password is required");
//       valid = false;
//     } else if (password.length < 6) {
//       err.password = t("Min 6 characters required");
//       valid = false;
//     }

//     if (confirmPassword !== password) {
//       err.confirmPassword = t("Passwords do not match");
//       valid = false;
//     }

//     setErrors(err);
//     return valid;
//   };


//   const handleSignup = async () => {
//     if (!validate()) return;

//     try {
//       setLoading(true)
//       const response = await ApiService.post(apiUrls.signup, {
//         name,
//         email,
//         password,
//       });

//       const data = response.data;

//       if (data?.success) {
//         //  Alert.alert("Success", data.message || "Account created");
//         Toast.show({
//           type: 'success',
//           position: 'bottom',
//           text1: 'Success',
//           text2: data?.message || 'Account created successfully',
//         });
//         navigation.navigate('Login')
//       } else {
//         Toast.show({
//           type: 'error',
//           position: 'bottom',
//           text1: 'Message:-',
//           text2: data.message ?? 'Signup failed',
//         });

//       }
//     } catch (error) {
//       console.log(error);
//       Toast.show({
//         type: 'error',
//         position: 'bottom',
//         text1: 'Message:-',
//         text2: error.message ?? 'Something went wrong',
//       });

//     }
//     finally {
//       setLoading(false);
//     }
//   };

//   // ---------------- UI ----------------
//   return (
//     <ImageBackground
//       source={Logo.loginbackground}
//       style={styles.banner}
//       resizeMode="stretch"
//       imageStyle={{
//         width: Dimensions.get('window').width + 20,
//         height: Dimensions.get('window').height,
//       }}
//       tintColor={color.loginbackground}
//     >
//       {/* <ScrollView contentContainerStyle={{ rowGap: 5, alignItems: 'center' }}
//         style={{ gap: 10, }} showsVerticalScrollIndicator={false}> */}

//       <KeyboardAwareScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.scrollContainer}
//         enableOnAndroid
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//         extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
//       >


//         <View
//           style={{
//             width: "100%",

//           }}
//         >

//           {/* Language Selector */}
//           <View style={{ alignSelf: 'flex-end' }}>
//             <TouchableOpacity
//               onPress={() => setShowLanguage(!showLanguage)}
//               style={{
//                 borderWidth: 1,
//                 borderColor: "#4E5050",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: 8,
//                 flexDirection: "row",
//                 borderRadius: 17,
//                 paddingVertical: 5,
//                 paddingHorizontal: 10,
//               }}
//             >
//               <AppImage
//                 source={Logo.language}
//                 width={12}
//                 height={12}
//                 tintColor={color.darkthemetext}
//               />

//               <AppText
//                 color={"#BABABA"}
//                 fontSize={12}
//                 fontFamily={Inter.regular}
//               >
//                 {i18n.language === 'ar' ? 'العربية' : 'English'}
//               </AppText>

//               <AppImage
//                 source={Logo.downarrow}
//                 width={8}
//                 height={4}
//                 tintColor={color.darkthemetext}
//               />
//             </TouchableOpacity>

//             {showLanguage && (
//               <View
//                 style={{
//                   position: "absolute",
//                   top: 40,
//                   right: 0,
//                   backgroundColor: color.darkbackround,
//                   borderRadius: 12,
//                   borderWidth: 1,
//                   borderColor: "#4E5050",
//                   width: 120,
//                   overflow: "hidden",
//                   zIndex: 999,
//                 }}
//               >
//                 <TouchableOpacity
//                   style={{ padding: 12 }}
//                   onPress={() => {
//                     setSelectedLanguage("English");
//                     changeLanguage("en");
//                     setShowLanguage(false);
//                   }}
//                 >
//                   <AppText color={color.darkthemetext}>
//                     English
//                   </AppText>
//                 </TouchableOpacity>

//                 <View
//                   style={{
//                     height: 1,
//                     backgroundColor: "#4E5050",
//                   }}
//                 />

//                 <TouchableOpacity
//                   style={{ padding: 12 }}
//                   onPress={() => {
//                     setSelectedLanguage("العربية");
//                     changeLanguage("ar");
//                     setShowLanguage(false);
//                   }}
//                 >
//                   <AppText color={color.darkthemetext}>
//                     العربية
//                   </AppText>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         </View>
//         <AppImage
//           source={Logo.loginlogo}
//           width={144}
//           height={142}
//           style={{ alignSelf: 'center', marginTop: 20 }}

//         />
//         {/* <AppText fontSize={20} color={colors.darkthemetext}>
//           Create Account
//         </AppText> */}

//         {/* <AppImage source={Logo.loginlogo} width={120} height={120} /> */}


//         <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
//           {/* <AppImage
//           source={Logo.logintext1}
//           width={196}
//           height={34}
//          tintColor={color.darkthemetext}

//         /> */}
//           <AppText color={color.darkthemetext} fontSize={28} fontFamily={Inter.semibold}>
//             {"Ready for your "}
//           </AppText>
//           <AppImage
//             resizeMode="contain"
//             source={Banner.signuptext}
//             width={94}
//             height={34}
//             style={{ marginTop: 5.5 }}

//           />
//         </View>
//         <AppText color={color.darkthemetext} fontSize={16} fontFamily={Inter.regular}>
//           {"Your stage is waiting"}
//         </AppText>
//         <AppText color={"#F3B40F"} fontSize={16} fontFamily={Inter.regular} marginBottom={10}>
//           {"دورك تغنى والمسرح بانتظارك"}
//         </AppText>
//         {/* NAME */}
//         {/* <View style={styles.inputBox}>
//           <TextInput
//             placeholder="Full Name"
//             placeholderTextColor="#B4B1AD"
//             value={name}
//             onChangeText={setName}
//             style={styles.input}
//           />
//         </View> */}
//         <View style={styles.searchContainer}>
//           <AppImage
//             source={Logo.person}
//             width={16}
//             height={21}
//             tintColor={"#EEA75E"}
//           />

//           <TextInput
//             value={name}
//             onChangeText={setName}
//             placeholder={t("Full Name *")}
//             placeholderTextColor="#B4B1AD"
//             //  keyboardType="email-address"
//             //  autoCapitalize="none"
//             textAlign="left"
//             style={[styles.input, , { color: color.darkthemetext, }]}
//           />
//         </View>
//         {errors.name && <AppText fontSize={12} style={{ alignSelf: 'flex-start', marginTop: -6, marginLeft: 5 }} color="red">{errors.name}</AppText>}


//         {/* <View style={styles.inputBox}>
//           <TextInput
//             placeholder="Email"
//             placeholderTextColor="#B4B1AD"
//             value={email}
//             onChangeText={setEmail}
//             style={styles.input}
//           />
//         </View> */}
//         <View style={styles.searchContainer}>
//           <AppImage
//             source={Logo.email}
//             width={18}
//             height={18}
//             tintColor={"#EEA75E"}
//           />

//           <TextInput
//             value={email}
//             onChangeText={setEmail}
//             placeholder={t("Enter Email *")}
//             placeholderTextColor="#B4B1AD"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             textAlign="left"
//             style={[styles.input, , { color: color.darkthemetext, }]}
//           />
//         </View>
//         {errors.email && <AppText fontSize={12} style={{ alignSelf: 'flex-start', marginTop: -6, marginLeft: 5 }} color="red">{errors.email}</AppText>}


//         {/* <View style={styles.inputBox}>
//           <TextInput
//             placeholder="Password"
//             placeholderTextColor="#B4B1AD"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry
//             style={styles.input}
//           />
//         </View> */}
//         <View style={styles.searchContainer}>
//           <AppImage
//             source={Logo.lock}
//             width={18}
//             height={18}
//             tintColor={"#EEA75E"}
//           />

//           <TextInput
//             value={password}
//             onChangeText={setPassword}
//             placeholder={t("Choose Password *")}
//             placeholderTextColor="#B4B1AD"
//             secureTextEntry={secure}
//             textAlign="left"
//             style={[styles.input, { color: color.darkthemetext, }]}
//           />

//           <TouchableOpacity
//             style={styles.filterButton}
//             onPress={() => setSecure(!secure)}>
//             <AppImage
//               source={Logo.eye}
//               width={15}
//               height={11}
//               tintColor="#EEA75E"
//             />

//             {secure && <View style={styles.eyeSlash} />}
//           </TouchableOpacity>
//         </View>
//         {errors.password && <AppText fontSize={12} style={{ alignSelf: 'flex-start', marginTop: -6, marginLeft: 5 }} color="red">{errors.password}</AppText>}


//         <View style={styles.searchContainer}>
//           <AppImage
//             source={Logo.lock}
//             width={18}
//             height={18}
//             tintColor={"#EEA75E"}
//           />

//           <TextInput
//             value={confirmPassword}
//             onChangeText={setConfirmPassword}
//             placeholder={t("Confirm Password *")}
//             placeholderTextColor="#B4B1AD"
//             secureTextEntry={secureconfirm}
//             textAlign="left"
//             style={[styles.input, { color: color.darkthemetext, }]}
//           />

//           <TouchableOpacity
//             style={styles.filterButton}
//             onPress={() => setSecureConfirm(!secureconfirm)}>
//             <AppImage
//               source={Logo.eye}
//               width={15}
//               height={11}
//               tintColor="#EEA75E"
//             />

//             {secureconfirm && <View style={styles.eyeSlash} />}
//           </TouchableOpacity>
//         </View>
//         {errors.confirmPassword && (
//           <AppText fontSize={12} style={{ alignSelf: 'flex-start', marginTop: -6, marginLeft: 5 }} color="red">{errors.confirmPassword}</AppText>
//         )}

//         {/* SIGNUP BUTTON */}
//         <TouchableOpacity onPress={handleSignup} style={{ width: "100%", marginBottom: 10 }}>
//           <LinearGradient
//             colors={["#FD8701", "#D62C64", "#BA17A6", "#8801F1"]}
//             style={styles.button}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#FFFFFF" />
//             ) : (
//               <AppText color="#fff" fontSize={16} fontFamily={Inter.semibold}>
//                 {t("Sign Up")}
//               </AppText>)}
//           </LinearGradient>
//         </TouchableOpacity>
//         <LineView />
//         {
//           Platform.OS === 'android' && <GoogleButton />
//         }
//         {Platform.OS === 'ios' && <AppleButton />}

//         <View style={{ flexDirection: 'row', marginVertical: 5 }}>
//           <AppText color={color.darkthemetext} fontSize={12} fontFamily={Inter.regular}>
//             {t("Already have an account? ")}

//           </AppText>
//           <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//             <AppText color={"#EA9305"} fontSize={12} fontFamily={Inter.regular} >{t("Sign In")} </AppText>
//           </TouchableOpacity>

//         </View>

//         <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
//           <AppText color={color.darkthemetext} fontSize={10} fontFamily={Inter.regular}>
//             {t("By continuing you agree to our")}
//           </AppText>
//           <View style={{ flexDirection: 'row' }}>
//             <TouchableOpacity>
//               <AppText color={"#EA9305"} fontSize={10} fontFamily={Inter.regular}>
//                 {t("Terms of Service  ")}
//               </AppText>
//             </TouchableOpacity>

//             <AppText color={color.darkthemetext} fontSize={10} fontFamily={Inter.regular}>
//               {t(" and")}
//             </AppText>
//             <TouchableOpacity>
//               <AppText color={"#EA9305"} fontSize={10} fontFamily={Inter.regular}>
//                 {t("   Privacy Policy")}
//               </AppText>
//             </TouchableOpacity>
//           </View>




//         </View>
//         <View style={{ height: 30 }} />

//       </KeyboardAwareScrollView>
//       {/* </ScrollView> */}

//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   banner: {
//     flex: 1,
//     paddingHorizontal: 25,
//     paddingTop: Platform.OS === 'ios' ? 80 : 10,
//   },
//   scrollContainer: {
//     alignItems: 'center',
//     padding: 10,
//   },

//   inputBox: {
//     width: "100%",
//     height: 55,
//     borderRadius: 16,
//     borderWidth: 0.5,
//     borderColor: "#8A8A8A",
//     justifyContent: "center",
//     paddingHorizontal: 15,
//     marginTop: 10,
//   },

//   input: {
//     flex: 1,

//     fontSize: 12,
//     fontFamily: Inter.regular
//   },

//   button: {
//     height: 55,
//     borderRadius: 17,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 20,
//   },
//   searchContainer: {
//     width: '100%',
//     height: 55,
//     borderRadius: 16,
//     // backgroundColor: '#07090D',
//     borderWidth: 0.5,
//     borderColor: '#8A8A8A',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     gap: 10,
//     marginVertical: 5
//   },
//   filterButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     // backgroundColor: '#2A2A2A',
//   },
//   eyeSlash: {
//     position: 'absolute',
//     width: 18,
//     height: 0.8,
//     backgroundColor: '#EEA75E',
//     transform: [{ rotate: '-45deg' }],
//   },
// });




import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import AppImage from '../share/components/AppImage';
import AppText from '../share/components/AppText';
import LineView from '../share/components/LineView';
import GoogleButton from '../share/components/Googlebutton';
import AppleButton from '../share/components/AppleButton';
import LanguageSelector from '../share/components/Languageselector';
import { Banner, Logo } from '../share/constants/media';
import { useAppColors } from '../share/constants/color';
import { Inter } from '../share/constants/fonts';
import { useDirection } from '../share/hooks/useDirection';
import { useSignup } from '../share/hooks/Usesignup';
import { FieldError } from '../share/hooks/Loginvalidation';
import { vs } from '../share/constants/scale';

export default function SignUp() {
  const colors = useAppColors();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { textAlign, ltrField } = useDirection();

  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const { values, errors, loading, onChange, submit } = useSignup();

  const renderError = (error: FieldError) => {
    if (!error) return null;
    return (
      <AppText
        color="#FF4D4F"
        fontSize={12}
        fontFamily={Inter.regular}
        style={[styles.errorText, { textAlign }]}
      >
        {t(error.key, error.params)}
      </AppText>
    );
  };

  return (
    <ImageBackground
      source={Logo.loginbackground}
      style={styles.banner}
      resizeMode="stretch"
      imageStyle={{
        width: Dimensions.get('window').width + 20,
        height: Dimensions.get('window').height,
      }}
      tintColor={colors.loginbackground}
    >
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
      >
        <View style={styles.header}>
          <LanguageSelector />
        </View>

        <AppImage
          source={Logo.loginlogo}
          width={144}
          height={142}
          style={styles.logo}
        />

        <View style={styles.headlineRow}>
          <AppText
            color={colors.darkthemetext}
            fontSize={28}
            fontFamily={Inter.semibold}
          >
            {`${t('auth.signup.headline')} `}
          </AppText>
          <AppImage
            resizeMode="contain"
            source={Banner.signuptext}
            width={94}
            height={34}
            style={styles.headlineImage}
          />
        </View>

        <AppText
          color={colors.darkthemetext}
          fontSize={16}
          fontFamily={Inter.regular}
        >
          {t('auth.login.tagline')}
        </AppText>
        <AppText
          color="#F3B40F"
          fontSize={16}
          fontFamily={Inter.regular}
          marginBottom={10}
        >
          {t('auth.login.taglineAccent')}
        </AppText>

        {/* NAME — natural direction, users type their own language */}
        <View style={styles.inputContainer}>
          <AppImage
            source={Logo.person}
            width={16}
            height={21}
            tintColor="#EEA75E"
          />
          <TextInput
            value={values.name}
            onChangeText={onChange('name')}
            placeholder={t('auth.signup.fullName')}
            placeholderTextColor="#B4B1AD"
            autoCapitalize="words"
            returnKeyType="next"
            style={[styles.input, { textAlign, color: colors.darkthemetext }]}
          />
        </View>
        {renderError(errors.name)}

        {/* EMAIL — always LTR characters */}
        <View style={styles.inputContainer}>
          <AppImage
            source={Logo.email}
            width={18}
            height={18}
            tintColor="#EEA75E"
          />
          <TextInput
            value={values.email}
            onChangeText={onChange('email')}
            placeholder={t('auth.signup.emailAddress')}
            placeholderTextColor="#B4B1AD"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            style={[styles.input, ltrField, { color: colors.darkthemetext }]}
          />
        </View>
        {renderError(errors.email)}

        {/* PASSWORD */}
        <View style={styles.inputContainer}>
          <AppImage
            source={Logo.lock}
            width={18}
            height={18}
            tintColor="#EEA75E"
          />
          <TextInput
            value={values.password}
            onChangeText={onChange('password')}
            placeholder={t('auth.signup.choosePassword')}
            placeholderTextColor="#B4B1AD"
            secureTextEntry={secure}
            autoCapitalize="none"
            autoComplete="password-new"
            returnKeyType="next"
            style={[styles.input, ltrField, { color: colors.darkthemetext }]}
          />
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.eyeButton}
            onPress={() => setSecure(prev => !prev)}
          >
            <AppImage
              source={Logo.eye}
              width={15}
              height={11}
              tintColor="#EEA75E"
            />
            {secure && <View style={styles.eyeSlash} />}
          </TouchableOpacity>
        </View>
        {renderError(errors.password)}

        {/* CONFIRM PASSWORD */}
        <View style={styles.inputContainer}>
          <AppImage
            source={Logo.lock}
            width={18}
            height={18}
            tintColor="#EEA75E"
          />
          <TextInput
            value={values.confirmPassword}
            onChangeText={onChange('confirmPassword')}
            placeholder={t('auth.signup.confirmPassword')}
            placeholderTextColor="#B4B1AD"
            secureTextEntry={secureConfirm}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={submit}
            style={[styles.input, ltrField, { color: colors.darkthemetext }]}
          />
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.eyeButton}
            onPress={() => setSecureConfirm(prev => !prev)}
          >
            <AppImage
              source={Logo.eye}
              width={15}
              height={11}
              tintColor="#EEA75E"
            />
            {secureConfirm && <View style={styles.eyeSlash} />}
          </TouchableOpacity>
        </View>
        {renderError(errors.confirmPassword)}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={submit}
          disabled={loading}
          style={styles.submitWrapper}
        >
          <LinearGradient
            colors={['#FD8701', '#D62C64', '#BA17A6', '#8801F1']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppText color="#fff" fontSize={16} fontFamily={Inter.semibold}>
                {t('auth.signup.createAccount')}
              </AppText>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <LineView />

        {Platform.OS === 'android' && <GoogleButton />}
        {Platform.OS === 'ios' && <AppleButton />}

        <View style={styles.signinRow}>
          <AppText
            color={colors.darkthemetext}
            fontSize={12}
            fontFamily={Inter.regular}
          >
            {t('auth.signup.alreadyHaveAccount')}
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <AppText color="#EA9305" fontSize={12} fontFamily={Inter.regular}>
              {t('auth.signup.signIn')}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.legalWrapper}>
          <AppText
            color={colors.darkthemetext}
            fontSize={10}
            fontFamily={Inter.regular}
          >
            {t('auth.login.legalPrefix')}
          </AppText>
          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <AppText color="#EA9305" fontSize={10} fontFamily={Inter.regular}>
                {t('auth.login.terms')}
              </AppText>
            </TouchableOpacity>
            <AppText
              color={colors.darkthemetext}
              fontSize={10}
              fontFamily={Inter.regular}
            >
              {t('auth.login.and')}
            </AppText>
            <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
              <AppText color="#EA9305" fontSize={10} fontFamily={Inter.regular}>
                {t('auth.login.privacy')}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  banner: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'ios' ? 80 : 10,
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 10,
  },
  header: {
    width: '100%',
  },
  logo: {
    alignSelf: 'center',
    marginTop: 20,
  },
  headlineRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headlineImage: {
    marginTop: 5.5,
  },
  inputContainer: {
    width: '100%',
    height: 55,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#8A8A8A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    marginVertical: vs(5),
  },
  input: {
    flex: 1,
    fontSize: 12,
    fontFamily: Inter.regular,
  },
  errorText: {
    alignSelf: 'stretch',
    marginTop: vs(4),
    paddingHorizontal: 5,
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeSlash: {
    position: 'absolute',
    width: 18,
    height: 0.8,
    backgroundColor: '#EEA75E',
    transform: [{ rotate: '-45deg' }],
  },
  submitWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  submitButton: {
    height: 55,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signinRow: {
    flexDirection: 'row',
    marginVertical: 5,
    gap: 4,
  },
  legalWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  legalRow: {
    flexDirection: 'row',
    gap: 4,
  },
  bottomSpacer: {
    height: 30,
  },
});