import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, RefreshControl, ActivityIndicator } from "react-native"
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
import ArtistList from "../share/components/SelectedArtistMix";
import SelectedArtistMix from "../share/components/SelectedArtistMix";
import RecommendedSongs from "../share/components/RecommendedSongs";
import PeopleWhoSang from "../share/components/PeopleWhoSang";
import PopularSongs from "../share/components/PopularSongs";
import ArtistRow from "../share/components/ArtistRow";
import LinearGradient from "react-native-linear-gradient";


const Home = () => {
  const navigation = useNavigation();
  const color = useAppColors();
  const [profiledetail, setProfileDetail] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [populardatas, setPopulardatas] = useState<any[]>([])
  const [artistmixsongdata, setArtistmixsongdata] = useState<any[]>([])
  const [artistdata, setArtistdata] = useState<any[]>([])
  const [songsartistdata, setSongsartistdata] = useState<any[]>([])
  const [recommendedsongdata, setRecommendedsongdata] = useState<any[]>([])
  const dispatch = useAppDispatch();
  const [songsArtistLoading, setSongsArtistLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'Latest' | 'Popular' | 'A-Z'>(
    'Latest'
  );
  const [loader, setLoader] = useState(false)
  const playsong = useAppSelector(
    (state: any) => state.auth.playsong
  );
  const loginState = useAppSelector(
    (state: any) => state.auth.loginState
  );




  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        fetchProfileData(),
        categorydata(),
        Dashboarddata(),
        topmostdata(),
        artistmixedsongfun(),
        recommendedsongfun(),
        getartistfun(),
        fetchArtistsByFilter(selectedFilter),
      ]);
    } catch (error) {
      console.log("Home refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedFilter]);




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
      setLoader(true);

      const response = await ApiService.get(apiUrls.profileApi)

      const data = (response as any).data
      console.log(data, "API RESPONSE")

      if (data?.success) {
        setProfileDetail(data?.user)
      }

    } catch (error) {
      console.log("PROFILE ERROR:", error)
    }
    finally {
      setLoader(false);
    }
  }


  const categorydata = async () => {
    console.log("category api called", apiUrls.categories)
    try {
      setLoader(true);

      const response = await ApiService.get(apiUrls.categories);

      const data = (response as any).data;
      console.log(data, 'category API RESPONSEdddd');

      if (data?.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.log('Categorydata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };


  const topmostdata = async () => {
    console.log("popular api called")
    try {
      setLoader(true);

      const response = await ApiService.get(apiUrls.getpopularsong);

      const data = (response as any).data;
      console.log(data.songs, 'popular API RESPONSEdddd');

      if (data?.success) {
        setPopulardatas(data.songs);
      }
    } catch (error) {
      console.log('populardata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };


  const fetchArtistsByFilter = async (
    filter: 'Latest' | 'Popular' | 'A-Z'
  ) => {
    try {
      setSongsArtistLoading(true);

      let url = apiUrls.artistsong;

      if (filter === 'Latest') {
        url = `${apiUrls.artistsong}/latest`;
      } else if (filter === 'Popular') {
        url = `${apiUrls.artistsong}/popular`;
      }
      // A-Z uses apiUrls.artistsong

      console.log('Artist Songs API:', url);

      const response = await ApiService.get(url);
      const data = (response as any).data;

      console.log(`${filter} artist songs response:`, data);

      if (data?.success) {
        setSongsartistdata(data.songs || []);
      } else {
        setSongsartistdata([]);
      }
    } catch (error) {
      console.log(`${filter} artist songs ERROR:`, error);
      setSongsartistdata([]);
    } finally {
      setSongsArtistLoading(false);
    }
  };


  const artistmixedsongfun = async () => {
    console.log("popular api called")
    try {
      setLoader(true);

      const response = await ApiService.get(apiUrls.artistmixsong);

      const data = (response as any).data;
      console.log(data.songs, 'artistmixedsong API RESPONSE');

      if (data?.success) {
        setArtistmixsongdata(data.songs)
      }
    } catch (error) {
      console.log('populardata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };


  const recommendedsongfun = async () => {
    console.log("popular api called")
    try {
      setLoader(true);

      const response = await ApiService.get(apiUrls.recommendedsongs);

      const data = (response as any).data;
      console.log(data.songs, 'recommendedsong API RESPONSE');

      if (data?.success) {
        setRecommendedsongdata(data.songs)
      }
    } catch (error) {
      console.log('populardata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };


  const getartistfun = async () => {
    console.log("popular api called")
    try {
      setLoader(true);

      const response = await ApiService.get(apiUrls.selectartists);

      const data = (response as any).data;
      console.log(data.artists, 'getartist API RESPONSE');

      if (data?.success) {
        setArtistdata(data.artists)
      }
    } catch (error) {
      console.log('populardata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };




  const Dashboarddata = async () => {
    console.log("Dashboard api called");
    try {
      setLoader(true);

      const response = await ApiService.get(apiUrls.dashboard);

      const data = (response as any).data;
      console.log(data, 'API RESPONSE Dashboard');

      if (data?.success) {
        // setCategories(data.categories);
      }
    } catch (error) {
      console.log('Dashboard ERROR:', error);
    } finally {
      setLoader(false);
    }
  };



  useEffect(() => {
    fetchProfileData()
    categorydata()
    Dashboarddata()
    topmostdata()
    artistmixedsongfun()
    recommendedsongfun()
    getartistfun()

    //fetchHomeData()
  }, [])


  useEffect(() => {
    fetchArtistsByFilter(selectedFilter);
  }, [selectedFilter]);


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

  const getInitials = (name?: string) => {
    return name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase() || '';
  };

  if (loginState == 'first') {

    return <SelectedArtistScreen />

  }
  // return <SelectedArtistScreen />


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
          ; (navigation as any).navigate('SearchSongSecreen', { previousScreen: 'Home' })
        }}

      />
      {
        loader ?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#EFCB61" />
          </View> :
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={color.mgred}
                colors={[color.mgred]}
                progressBackgroundColor={color.darkgray}
              />
            }
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
              <AppText
                color={color.darkthemetext}
                fontSize={12}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                Selected Artists  -  Mix Song
              </AppText>

              <TouchableOpacity
                onPress={() => {
                  (navigation as any).navigate('SongsListScreen', {
                    songs: artistmixsongdata,
                    previousScreen: 'Home',
                  });
                }}
                activeOpacity={0.4}
                style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                <AppText
                  color={color.mgred}
                  fontSize={12}
                  fontWeight="500"
                  fontFamily={Inter.medium}
                >
                  See all
                </AppText>

                <AppImage
                  source={Images.arrow}
                  width={5}
                  height={8}
                />
              </TouchableOpacity>
            </View>

            <SelectedArtistMix
              data={artistmixsongdata}
              onPress={(artist) => {
                console.log('Artist selected:', artist);
              }}
              onPlay={(artist) => {
                console.log('Play mix:', artist);
                (navigation as any).navigate('.', {
                  id: artist.id,
                });
              }}
            />

            <View style={styles.titles}>
              <AppText
                color={color.darkthemetext}
                fontSize={12}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                Recommended Songs
              </AppText>

              <TouchableOpacity
                onPress={() => {
                  (navigation as any).navigate('SongsListScreen', {
                    songs: recommendedsongdata,
                    previousScreen: 'Home',
                  });
                }}
                activeOpacity={0.4}
                style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                <AppText
                  color={color.mgred}
                  fontSize={12}
                  fontWeight="500"
                  fontFamily={Inter.medium}
                >
                  See all
                </AppText>

                <AppImage
                  source={Images.arrow}
                  width={5}
                  height={8}
                />
              </TouchableOpacity>
            </View>

            <RecommendedSongs
              songs={recommendedsongdata}
              onSeeAll={() => {
                //  navigation.navigate('RecommendedSongs');
              }}
              onPlay={song => {
                console.log('Play:', song);

                (navigation as any).navigate('.', {
                  id: song.id,
                });
              }}

              onMore={song => {
                console.log('More:', song);
              }}
            />



            <View style={styles.titles}>
              <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>
                Browse moods
              </AppText>
              <TouchableOpacity
                activeOpacity={0.4}
                onPress={() => {
                  (navigation as any).navigate('Browsemood')
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

            {/* {
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
        } */}


            <View style={styles.titles}>
              <AppText
                color={color.darkthemetext}
                fontSize={12}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                Selected Artists
              </AppText>

              <TouchableOpacity
                onPress={() => {
                  (navigation as any).navigate('AllArtistScreen')
                }}
                activeOpacity={0.4}
                style={{
                  flexDirection: 'row',
                  gap: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <AppText
                  color={color.mgred}
                  fontSize={12}
                  fontWeight="500"
                  fontFamily={Inter.medium}
                >
                  See all
                </AppText>

                <AppImage
                  source={Images.arrow}
                  width={5}
                  height={8}
                />
              </TouchableOpacity>
            </View>

            <ArtistRow
              artists={artistdata?.slice(0, 10)}

              onPress={artist => {
                console.log('Artist selected:', artist);

                (navigation as any).navigate('SongsListScreen', {
                  artist: artist,
                  previousScreen: 'Home',
                });
              }}
              onPlay={song => {
                console.log('Play:', song);

                (navigation as any).navigate('SongsListScreen', {
                  artist: song,
                  previousScreen: 'Home',
                });
              }}
            />

            <View style={styles.titles}>
              <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>
                Selected Artist - All Songs
              </AppText>
              <TouchableOpacity
                onPress={() => {
                  (navigation as any).navigate('SongsListScreen', {
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginVertical: 10,
              }}
            >
              {(['Latest', 'Popular', 'A-Z'] as const).map(item => {
                const isSelected = selectedFilter === item;

                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.7}
                    onPress={() => setSelectedFilter(item)}
                    style={{
                      borderWidth: 1,
                      borderColor: isSelected
                        ? color.mgyellow
                        : color.homebordercolor,
                      borderRadius: 29,
                      overflow: 'hidden',
                    }}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={[
                          '#FF9A01',
                          '#CF7D00',
                          '#A96600',
                        ]}
                        start={{ x: 0.2, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{

                          borderRadius: 29,
                          alignItems: 'center'
                        }}
                      >
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AppText
                            color="#FFF"
                            fontSize={12}
                            fontWeight="500"
                            fontFamily={Inter.medium}
                          >
                            {item}
                          </AppText>
                        </View>
                      </LinearGradient>
                    ) : (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AppText
                          color={color.darkthemetext}
                          fontSize={12}
                          fontWeight="500"
                          fontFamily={Inter.medium}
                        >
                          {item}
                        </AppText>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <MusicList data={songsartistdata} loading={songsArtistLoading} />

            <View style={styles.titles}>
              <AppText
                color={color.darkthemetext}
                fontSize={12}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                Recorded Songs
              </AppText>

              <TouchableOpacity
                activeOpacity={0.4}
                style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                <AppText
                  color={color.mgred}
                  fontSize={12}
                  fontWeight="500"
                  fontFamily={Inter.medium}
                >
                  See all
                </AppText>

                <AppImage
                  source={Images.arrow}
                  width={5}
                  height={8}
                />
              </TouchableOpacity>
            </View>

            <PeopleWhoSang
              artists={[]}
              onPlay={artist => {
                console.log('Playing:', artist.name);
              }}
              onSeeAll={() => {
                //navigation.navigate('AllArtists');
              }}
            />

            <View style={styles.titles}>
              <AppText
                color={color.darkthemetext}
                fontSize={12}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                Popular Songs
              </AppText>

              <TouchableOpacity
                activeOpacity={0.4}
                style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                <AppText
                  color={color.mgred}
                  fontSize={12}
                  fontWeight="500"
                  fontFamily={Inter.medium}
                >
                  See all
                </AppText>

                <AppImage
                  source={Images.arrow}
                  width={5}
                  height={8}
                />
              </TouchableOpacity>
            </View>
            <PopularSongs
              songs={populardatas}
              onSeeAll={() => {
                //  navigation.navigate('PopularSongs');
              }}
              onPlay={song => {
                console.log('Playing:', song);
                (navigation as any).navigate('.', {
                  id: song.id,
                });
              }}
            />
            <View style={{ height: 80 }} />
          </ScrollView>

      }


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
    // justifyContent: 'space-between',
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