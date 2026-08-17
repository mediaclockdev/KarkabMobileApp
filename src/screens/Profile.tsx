import React, { useEffect, useState } from 'react';
import {

  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';

import AppText from '../share/components/AppText';
import AppImage from '../share/components/AppImage';
import { Icons, Logos } from '../share/constants/media';
import color from '../share/constants/color';
import apiUrls from '../services/apiUrls';
import MainHeader from '../share/components/MainHeader';
import ApiService from '../services/api';
import { storage } from '../share/storage/mmkv';
import { setAuthenticated } from '../auth/redux/authSlice';
import { useAppDispatch, useAppSelector } from "../share/hooks/useAppSelector";
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileProps = {
  navigation: any;
};

const Profile = ({ navigation }: ProfileProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [faceId, setFaceId] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    getProfile()
  }, [])


  const getProfile = async () => {
    try {
      setLoading(true);

      const response = await ApiService.get(apiUrls.getprofile);
      console.log(response, "profile api response")
      if (response.status === 200) {
        const data = response.data.data;

        setProfile(data);
        setLanguage(data?.language)
        //   setFaceId(data.faceIdEnabled);
        //   setLanguage(data.language === 'ar' ? 'Arabic' : 'English');
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };



  const handlelogout = () => {


    storage.set('userToken', '');
    const token = storage.getString('userToken');
    console.log(token, "fkfckfv")
    dispatch(setAuthenticated(false));

  };


  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) {
          console.log('Cancelled');
        } else if (response.errorCode) {
          console.log(response.errorMessage);
        } else {
          const asset = response.assets?.[0];
          uploadProfilePhoto(asset)
          console.log(asset);
          console.log(asset?.uri);
        }
      },
    );
  };


  const uploadProfilePhoto = async (image: any) => {
    try {

      const formData = new FormData();

      formData.append('image', {
        uri: image.uri,
        name: image.fileName || 'profile.jpg',
        type: image.type || 'image/jpeg',
      });

      const response = await ApiService.patch(
        apiUrls.profilePhoto,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Status:', response.status);
      console.log('Response:', response.data);

      if (response.status === 200) {
        getProfile();
      }
    } catch (error: any) {
      console.log('Error:', error.response?.data || error);

      Alert.alert(
        'Error',
        error.response?.data?.message || error.message
      );
    } finally {

    }
  };


  const updatelanguage = async (lang: string) => {
    try {
      const payload = {

        language: lang,
      };
      console.log(payload, "djeiedihedu")
      const response = await ApiService.patch(
        apiUrls.updateProfile,
        payload
      );

      console.log('Status:', response.status);
      console.log('Response:', response.data);

      if (response.status === 200) {
        const data = response?.data?.data
        setLanguage(data.language)


        getProfile();
      }
    } catch (error: any) {
      console.log('Error:', error.response?.data || error);

      Alert.alert(
        'Error',
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <SafeAreaView
      // edges={['top']}
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
      <StatusBar
        barStyle="dark-content"
        translucent={false}
      />

      <MainHeader />

      {loading ?

        <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
          <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
        </View> :
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          {/* Header */}



          {/* Profile */}

          <View style={styles.profileContainer}>
            <View style={styles.avatarWrapper}>
              <AppImage
                source={
                  profile?.avatarUrl
                    ? { uri: `https://shelynx.mediaclocksoft.com.au${profile.avatarUrl}` }
                    : Icons.person
                }
                width={100}
                height={100}
                borderRadius={50}
                resizeMode='cover'
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 4,
                  borderColor: '#FCE4EC'
                }}
              />
              <TouchableOpacity
                onPress={pickImage}
                style={styles.editButton}>
                <AppImage
                  source={Icons.edit}
                  width={12}
                  height={12}
                  tintColor={color.white}
                />
              </TouchableOpacity>
            </View>

            <AppText
              fontSize={24}
              fontWeight={700}
              color="#1B1C1C"
              marginTop={2}>
              {profile?.name || ""}
            </AppText>

            <View style={styles.memberRow}>
              <View style={styles.memberBadge}>
                <AppText
                  fontSize={12}
                  fontWeight={600}
                  color={'#1B1C1C'}>
                  ELITE MEMBER
                </AppText>
              </View>

              <AppText
                fontSize={14}
                color="#4D4447"
                marginLeft={10}>
                • Member since 2025
              </AppText>
            </View>

            <View style={styles.ratingRow}>
              <AppImage
                source={Icons.star}
                width={15}
                height={14}
                resizeMode="contain"
              />
              <AppImage
                source={Icons.star}
                width={15}
                height={14}
                resizeMode="contain"
              /> <AppImage
                source={Icons.star}
                width={15}
                height={14}
                resizeMode="contain"
              />
              <AppImage
                source={Icons.star}
                width={15}
                height={14}
                resizeMode="contain"
              />
              <AppText
                fontSize={12}
                fontWeight={600}
                color={color.themetext}
                marginLeft={8}>
                4.8/5.0
              </AppText>

              <AppText
                fontSize={10}
                color="#8D8588"
                marginLeft={5}>
                (124 reviews)
              </AppText>
            </View>
          </View>

          {/* Security */}

          <View style={styles.card}>
            <AppText
              fontSize={12}
              fontWeight={700}
              color="#6B5A60">
              SECURITY & LOGIN
            </AppText>

            <TouchableOpacity style={styles.row}>
              <View style={styles.left}>
                <View style={styles.iconBox}>
                  <AppImage
                    source={Icons.faceid}
                    width={20}
                    height={20}
                  />
                </View>

                <AppText
                  fontSize={16}
                  marginLeft={15}
                  color='#1B1C1C'
                >
                  Face ID Login
                </AppText>
              </View>

              <Switch
                value={faceId}
                onValueChange={setFaceId}
                trackColor={{
                  false: '#DDD',
                  true: '#3DBE63',
                }}
              />
            </TouchableOpacity>
          </View>

          {/* Personal Settings */}

          <View style={styles.card}>
            <AppText
              fontSize={12}
              fontWeight={700}
              color="#6B5A60">
              PERSONAL SETTINGS
            </AppText>

            <TouchableOpacity style={styles.menuItem}>
              <TouchableOpacity style={styles.left}
                onPress={() => {
                  navigation.navigate('PersonalInformation')
                }}
              >
                <View style={styles.iconBox}>
                  <AppImage
                    source={Icons.user}
                    width={16}
                    height={16}
                  />
                </View>

                <AppText
                  fontSize={16}
                  marginLeft={15}
                  color='#1B1C1C'
                >
                  Personal Information
                </AppText>
              </TouchableOpacity>

              <AppImage
                source={Icons.rightArrow}
                width={7.4}
                height={12}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ChangeAddress', { type: 'FindAgent', previousScreen: 'Profile' })
              }}
              style={styles.menuItem}>
              <View style={styles.left}>
                <View style={styles.iconBox}>
                  <AppImage
                    source={Icons.location}
                    width={16}
                    height={20}
                  />
                </View>

                <AppText
                  fontSize={16}
                  marginLeft={15}
                  color='#1B1C1C'
                >
                  Shipping Addresses
                </AppText>
              </View>

              <AppImage
                source={Icons.rightArrow}
                width={7.4}
                height={12}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}
              onPress={() => {
                navigation.navigate('NotificationPreferences')
              }}
            >
              <View style={styles.left}>
                <View style={styles.iconBox}>
                  <AppImage
                    source={Icons.bell}
                    width={16}
                    height={20}
                    tintColor={"#6B5A60"}
                  />
                </View>

                <AppText
                  fontSize={16}
                  marginLeft={15}
                  color='#1B1C1C'>
                  Notification Preferences
                </AppText>
              </View>

              <AppImage
                source={Icons.rightArrow}
                width={7.4}
                height={12}
              />
            </TouchableOpacity>
          </View>

          {/* Language */}

          <View style={styles.card}>
            <View style={styles.languageRow}>
              <View style={styles.left}>
                <View style={styles.iconBox}>
                  <AppImage
                    source={Icons.language}
                    width={20}
                    height={20}
                  />
                </View>

                <AppText
                  fontSize={16}
                  marginLeft={15}
                  color='#1B1C1C'
                >
                  Language
                </AppText>
              </View>

              <View style={styles.segment}>
                <TouchableOpacity
                  onPress={() => updatelanguage('en')}
                  style={[
                    styles.segmentButton,
                    language === 'en' &&
                    styles.segmentActive,
                  ]}>
                  <AppText
                    fontSize={12}
                    color={
                      language === 'en'
                        ? color.themetext
                        : '#4D4447'
                    }>
                    English
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => updatelanguage('ar')}
                  style={[
                    styles.segmentButton,
                    language === 'ar' &&
                    styles.segmentActive,
                  ]}>
                  <AppText
                    fontSize={12}
                    color={
                      language === 'ar'
                        ? color.themetext
                        : '#4D4447'
                    }>
                    Arabic
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Logout */}

          <TouchableOpacity
            onPress={handlelogout}

            style={styles.logoutButton}>
            <AppImage
              source={Icons.logout}
              width={18}
              height={18}
            //tintColor={color.themetext}
            />

            <AppText
              fontSize={20}
              fontWeight={600}
              color={"#78555E"}
              marginLeft={10}>
              Logout
            </AppText>
          </TouchableOpacity>

          <View style={{ height: 70 }} />
        </ScrollView>
      }

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#FAF7F8',
  },

  header: {
    height: 75,
    backgroundColor: color.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F0F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginHorizontal: -20,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  profileContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 30,
  },

  avatarWrapper: {
    position: 'relative',
  },

  editButton: {
    position: 'absolute',
    bottom: 5,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 15,
    backgroundColor: color.themetext,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 2,
    // borderColor: color.white,
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  memberBadge: {
    backgroundColor: '#F65D96',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  card: {
    backgroundColor: color.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconBox: {
    width: 36,
    height: 37.72,
    borderRadius: 10,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  segment: {
    flexDirection: 'row',
    backgroundColor: '#F2EEEE',
    borderRadius: 10,
    padding: 3,
  },

  segmentButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },

  segmentActive: {
    backgroundColor: color.white,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  logoutButton: {
    marginTop: 40,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#8B6873',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: color.white,
  },
});

export default Profile;