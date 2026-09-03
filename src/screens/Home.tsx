import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import color, { useAppColors } from "../share/constants/color";
import AppText from "../share/components/AppText";
import MainHeader from "../share/components/MainHeader";
import HomeBanner from "../share/components/HomeBanner";
import MusicType from "../share/components/MusicType";
import AppImage from "../share/components/AppImage";
import { Images } from "../share/constants/media";
import MusicCard from "../share/components/MusicCard";
import MusicList from "../share/components/MusicList";
import SearchBar from "../share/components/SearchBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Inter } from "../share/constants/fonts";
import { FontDebug } from "../authscreen/FontDebug";
import apiUrls from "../services/apiUrls";
import ApiService from '../services/api';
import { useCallback, useEffect, useState } from "react";
import { useSSR } from "react-i18next";
import { loaderstate, } from "../auth/redux/authSlice";
import { useAppDispatch, useAppSelector } from "../share/hooks/useAppSelector";
import App from "../app/App";
import AppLoader from "../share/components/AppLoader";
import { navigate } from "../navigation/NavigationService";
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Sound } from "react-native-nitro-sound";
import SelectedArtistScreen from "./Home/SelectedArtistScreen";

const Home = () => {
  const navigation = useNavigation();
  const color = useAppColors();
  const [profiledetail, setProfileDetail] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [populardatas, setPopulardatas] = useState<any[]>([])
  const dispatch = useAppDispatch();
  const playsong = useAppSelector(
    (state: any) => state.auth.playsong
  );
  const loginState = useAppSelector(
    (state: any) => state.auth.loginState
  );

  const fetchHomeData = async () => {
    try {
      const response = await ApiService.get(
        apiUrls.homeApi
      );

      console.log(response.data, "jejbfjbfejf");
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProfileData = async () => {
    try {
      dispatch(loaderstate(true));

      const response = await ApiService.get(apiUrls.profileApi)

      const data = response.data
      console.log(data, "API RESPONSE")

      if (data?.success) {
        setProfileDetail(data?.user)
      }

    } catch (error) {
      console.log("PROFILE ERROR:", error)
    }
    finally {
      dispatch(loaderstate(false));
    }
  }


  const categorydata = async () => {
    console.log("category api called", apiUrls.categories)
    try {
      dispatch(loaderstate(true));

      const response = await ApiService.get(apiUrls.categories);

      const data = response.data;
      console.log(data, 'category API RESPONSEdddd');

      if (data?.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.log('Categorydata ERROR:', error);
    } finally {
      dispatch(loaderstate(false));
    }
  };


  const topmostdata = async () => {
    console.log("popular api called")
    try {
      dispatch(loaderstate(true));

      const response = await ApiService.get(apiUrls.getpopularsong);

      const data = response.data;
      console.log(data, 'popular API RESPONSEdddd');

      if (data?.success) {
        setPopulardatas(data.songs);
      }
    } catch (error) {
      console.log('populardata ERROR:', error);
    } finally {
      dispatch(loaderstate(false));
    }
  };


  const Dashboarddata = async () => {
    console.log("Dashboard api called")
    try {
      dispatch(loaderstate(true));

      const response = await ApiService.get(apiUrls.dashboard);

      const data = response.data;
      console.log(data, 'API RESPONSE Dashboard');

      if (data?.success) {
        // setCategories(data.categories);
      }
    } catch (error) {
      console.log('Dashboard ERROR:', error);
    } finally {
      dispatch(loaderstate(false));
    }
  };

  useEffect(() => {
    fetchProfileData()
    categorydata()
    Dashboarddata()
    topmostdata()
    //fetchHomeData()
  }, [])


  // useFocusEffect(

  //   useCallback(() => {
  //     { console.log(loginState, "llllllllllll") }
  //     if (loginState == 'first') {

  //       return (navigation.navigate('SelectedArtistScreen'))

  //     }
  //     else {
  //       console.log('wdkdkwnkdwn')
  //     }
  //   }, [loginState])
  // )

  if (loginState == 'first') {

    return <SelectedArtistScreen />

  }


  return (


    <SafeAreaView style={[styles.container, { backgroundColor: color.darkbackround, }]} edges={['top']} >

      <MainHeader
        user={profiledetail}
      />
      <SearchBar
        value={''}
        // onChangeText={() => console.log('filter')}
        onFilterPress={() => console.log('filter')}
        onPress={() => {
          navigation.navigate('SearchSongSecreen', { previousScreen: 'Home' })
        }}

      />
      <ScrollView
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
        style={styles.innercontainer}>


        <HomeBanner />
        {/* <FontDebug/> */}
        {/* <View style={styles.filterview}>
          <TouchableOpacity
            activeOpacity={0.3}
            style={[styles.filter, { borderColor: color.homebordercolor }]}>
            <AppText

              color={color.darkthemetext}
              fontSize={12}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              {"Added"}
            </AppText>
            <AppText

              color={"#FCC378"}
              fontSize={12}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              {"⌵"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.3}
            style={[styles.filter, { borderColor: color.homebordercolor }]}>
            <AppText

              color={color.darkthemetext}
              fontSize={12}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              {"Recently added"}
            </AppText>
            <AppText

              color={"#FCC378"}
              fontSize={12}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              {"⌵"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.3}
            style={[styles.filter, { borderColor: color.homebordercolor }]}>
            <AppImage
              source={Images.playlist}
              width={15}
              height={15}
              tintColor={"#D4AF37"}

            />
            <AppText

              color={color.darkthemetext}
              fontSize={12}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              {"Sort"}
            </AppText>
          </TouchableOpacity>
        </View> */}



        <View style={styles.titles}>
          <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>
            Browse moods
          </AppText>
          <TouchableOpacity
            activeOpacity={0.4}
            onPress={() => {
              navigation.navigate('Browsemood')
            }}
            style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
            <AppText color={color.mgred} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>
              See all
            </AppText>
            <AppImage
              source={Images.arrow}
              width={5}
              height={8}
            />
          </TouchableOpacity>


        </View>
        <MusicType data={categories} />

        {
          playsong?.id == null ?
            null :
            <>

              <View style={styles.titles}>
                <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>
                  Continue playing
                </AppText>
              </View>
              <MusicCard data={playsong} />
            </>
        }

        <View style={styles.titles}>
          <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>
            Popular for you
          </AppText>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SongsListScreen', {
                songs: populardatas,
                previousScreen: 'Home',
              });
            }}
            activeOpacity={0.4} style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
            <AppText color={color.mgred} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>
              See all
            </AppText>
            <AppImage
              source={Images.arrow}
              width={5}
              height={8}

            />
          </TouchableOpacity>


        </View>
        <MusicList data={populardatas} />
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {

    flex: 1,
    paddingHorizontal: 10,

  },
  innercontainer: {
    gap: 20,
    marginHorizontal: 10
  },
  titles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  filterview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    //marginTop: 10,
    justifyContent: 'space-between',
    marginVertical: 10
  },
  filter: {
    alignItems: 'center',
    justifyContent: "center",
    gap: 8,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#21110A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 29,

  },
})
export default Home;