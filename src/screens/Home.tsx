import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAppColors } from '../share/constants/color';
import AppText from '../share/components/AppText';
import MainHeader from '../share/components/MainHeader';
import HomeBanner from '../share/components/HomeBanner';
import MusicType from '../share/components/MusicType';
import AppImage from '../share/components/AppImage';
import { Images } from '../share/constants/media';
import MusicList from '../share/components/MusicList';
import SearchBar from '../share/components/SearchBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Inter } from '../share/constants/fonts';
import apiUrls from '../services/apiUrls';
import ApiService from '../services/api';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../share/hooks/useAppSelector';
import { useNavigation } from '@react-navigation/native';
import SelectedArtistScreen from './Home/SelectedArtistScreen';
import SelectedArtistMix from '../share/components/SelectedArtistMix';
import RecommendedSongs from '../share/components/RecommendedSongs';
import PeopleWhoSang from '../share/components/PeopleWhoSang';
import PopularSongs from '../share/components/PopularSongs';
import ArtistRow from '../share/components/ArtistRow';
import LinearGradient from 'react-native-linear-gradient';
import { addsong } from '../auth/redux/authSlice';
import { getLastPlayed } from '../services/lastPlayed';

const Home = () => {
  const navigation = useNavigation<any>();
  const color = useAppColors();
  const dispatch = useAppDispatch();
  const [profiledetail, setProfileDetail] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [populardatas, setPopulardatas] = useState<any[]>([]);
  const [artistmixsongdata, setArtistmixsongdata] = useState<any[]>([]);
  const [artistdata, setArtistdata] = useState<any[]>([]);
  const [songsartistdata, setSongsartistdata] = useState<any[]>([]);
  const [recommendedsongdata, setRecommendedsongdata] = useState<any[]>([]);
  const [songsArtistLoading, setSongsArtistLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recdata, setRecdata] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState<'Latest' | 'Popular' | 'A-Z'>(
    'Latest'
  );
  const [loader, setLoader] = useState(false);

  const loginState = useAppSelector((state: any) => state.auth.loginState);





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
        getRecording(),
        fetchArtistsByFilter(selectedFilter),
      ]);
    } catch (error) {
      console.log('Home refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedFilter]);

  const fetchProfileData = async () => {
    try {
      setLoader(true);
      const response = await ApiService.get(apiUrls.profileApi);
      const data = (response as any).data;
      if (data?.success) {
        setProfileDetail(data?.user);
      }
    } catch (error) {
      console.log('PROFILE ERROR:', error);
    } finally {
      setLoader(false);
    }
  };

  const getRecording = async () => {
    try {
      const response = await ApiService.get(apiUrls.getrecording);
      const data = (response as any).data;
      if (data?.success) {
        setRecdata(data.recordings);
      }
    } catch (error) {
      console.log('getrecording ERROR:', error);
    }
  };

  const categorydata = async () => {
    try {
      setLoader(true);
      const response = await ApiService.get(apiUrls.categories);
      const data = (response as any).data;
      if (data?.success) {
        setCategories(data.categories);
        console.log(data, "kkkk")
      }
    } catch (error) {
      console.log('Categorydata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };

  const topmostdata = async () => {
    try {
      setLoader(true);
      const response = await ApiService.get(apiUrls.getpopularsong);
      const data = (response as any).data;
      if (data?.success) {
        setPopulardatas(data.songs);
      }
    } catch (error) {
      console.log('populardata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };

  const fetchArtistsByFilter = async (filter: 'Latest' | 'Popular' | 'A-Z') => {
    try {
      setSongsArtistLoading(true);
      let url = apiUrls.artistsong;
      if (filter === 'Latest') {
        url = `${apiUrls.artistsong}/latest`;
      } else if (filter === 'Popular') {
        url = `${apiUrls.artistsong}/popular`;
      }

      const response = await ApiService.get(url);
      const data = (response as any).data;
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
    try {
      setLoader(true);
      const response = await ApiService.get(apiUrls.artistmixsong);
      const data = (response as any).data;
      if (data?.success) {
        setArtistmixsongdata(data.songs);
      }
    } catch (error) {
      console.log('populardata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };

  const recommendedsongfun = async () => {
    try {
      setLoader(true);
      const response = await ApiService.get(apiUrls.recommendedsongs);
      const data = (response as any).data;
      if (data?.success) {
        setRecommendedsongdata(data.songs);
      }
    } catch (error) {
      console.log('populardata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };

  const getartistfun = async () => {
    try {
      setLoader(true);
      const response = await ApiService.get(apiUrls.selectartists);
      const data = (response as any).data;
      if (data?.success) {
        setArtistdata(data.artists);
      }
    } catch (error) {
      console.log('populardata ERROR:', error);
    } finally {
      setLoader(false);
    }
  };

  const Dashboarddata = async () => {
    try {
      setLoader(true);
      const response = await ApiService.get(apiUrls.dashboard);
    } catch (error) {
      console.log('Dashboard ERROR:', error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    categorydata();
    Dashboarddata();
    topmostdata();
    artistmixedsongfun();
    recommendedsongfun();
    getartistfun();
    getRecording();
  }, []);

  useEffect(() => {
    fetchArtistsByFilter(selectedFilter);
  }, [selectedFilter]);

  // Spotify Navigation helper
  const openPlayer = (songId: number) => {
    navigation.navigate('.', { id: songId });
  };

  if (loginState === 'first') {
    return <SelectedArtistScreen />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: color.darkbackround }]}
      edges={['top']}
    >
      <MainHeader user={profiledetail} />

      <SearchBar
        value={''}
        onFilterPress={() => console.log('filter')}
        onPress={() => {
          navigation.navigate('SearchSongSecreen', { previousScreen: 'Home' });
        }}
      />

      {loader ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EFCB61" />
        </View>
      ) : (
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
          style={styles.innercontainer}
        >
          <HomeBanner />

          {/* Selected Artists - Mix Song */}
          <View style={styles.titles}>
            <AppText
              color={color.darkthemetext}
              fontSize={14}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              Selected Artists - Mix Song
            </AppText>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SongsListScreen', {
                  songs: artistmixsongdata,
                  previousScreen: 'Home',
                });
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
                fontSize={14}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                See all
              </AppText>
              <AppImage source={Images.arrow} width={5} height={8} />
            </TouchableOpacity>
          </View>

          <SelectedArtistMix
            data={artistmixsongdata}
            onPress={(artist) => {
              console.log('Artist selected:', artist);
            }}
            onPlay={(artist) => {
              openPlayer(artist.id); // 👈 Fixed
            }}
          />

          {/* Recommended Songs */}
          <View style={styles.titles}>
            <AppText
              color={color.darkthemetext}
              fontSize={14}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              Recommended Songs
            </AppText>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SongsListScreen', {
                  songs: recommendedsongdata,
                  previousScreen: 'Home',
                });
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
                fontSize={14}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                See all
              </AppText>
              <AppImage source={Images.arrow} width={5} height={8} />
            </TouchableOpacity>
          </View>

          <RecommendedSongs
            songs={recommendedsongdata}
            onSeeAll={() => { }}
            onPlay={(song) => {
              openPlayer(song.id); // 👈 Fixed
            }}
            onMore={(song) => {
              console.log('More:', song);
            }}
          />

          {/* Browse Moods */}
          <View style={styles.titles}>
            <AppText
              color={color.darkthemetext}
              fontSize={14}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              Browse moods
            </AppText>
            <TouchableOpacity
              activeOpacity={0.4}
              onPress={() => {
                navigation.navigate('Browsemood');
              }}
              style={{
                flexDirection: 'row',
                gap: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AppText
                color={color.mgred}
                fontSize={14}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                See all
              </AppText>
              <AppImage source={Images.arrow} width={5} height={8} />
            </TouchableOpacity>
          </View>
          <MusicType data={categories} />

          {/* Selected Artists */}
          <View style={styles.titles}>
            <AppText
              color={color.darkthemetext}
              fontSize={14}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              Selected Artists
            </AppText>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('AllArtistScreen');
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
                fontSize={14}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                See all
              </AppText>
              <AppImage source={Images.arrow} width={5} height={8} />
            </TouchableOpacity>
          </View>

          <ArtistRow
            artists={artistdata?.slice(0, 10)}
            onPress={(artist) => {
              navigation.navigate('SongsListScreen', {
                artist: artist,
                previousScreen: 'Home',
              });
            }}
            onPlay={(song) => {
              navigation.navigate('SongsListScreen', {
                artist: song,
                previousScreen: 'Home',
              });
            }}
          />

          {/* Selected Artist - All Songs */}
          <View style={styles.titles}>
            <AppText
              color={color.darkthemetext}
              fontSize={14}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              Selected Artist - All Songs
            </AppText>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SongsListScreen', {
                  songs: populardatas,
                  previousScreen: 'Home',
                });
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
                fontSize={14}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                See all
              </AppText>
              <AppImage source={Images.arrow} width={5} height={8} />
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginVertical: 10,
            }}
          >
            {(['Latest', 'Popular', 'A-Z'] as const).map((item) => {
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
                      colors={['#FF9A01', '#CF7D00', '#A96600']}
                      start={{ x: 0.2, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 29,
                        alignItems: 'center',
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

          {/* Recorded Songs */}
          <View style={styles.titles}>
            <AppText
              color={color.darkthemetext}
              fontSize={14}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              Recorded Songs
            </AppText>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('RecordingList', {
                  recordings: recdata,
                  previousScreen: 'Home',
                });
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
                fontSize={14}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                See all
              </AppText>
              <AppImage source={Images.arrow} width={5} height={8} />
            </TouchableOpacity>
          </View>

          <PeopleWhoSang
            artists={recdata}
            profileimage={profiledetail}
            onPlay={(artist) => {
              console.log('Playing:', artist.name);
              navigation.navigate('.', { id: artist.id, type: 'recordings' });
            }}
            onSeeAll={() => { }}
          />

          {/* Popular Songs */}
          <View style={styles.titles}>
            <AppText
              color={color.darkthemetext}
              fontSize={14}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              Popular Songs
            </AppText>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SongsListScreen', {
                  songs: populardatas,
                  previousScreen: 'Home',
                });
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
                fontSize={14}
                fontWeight="500"
                fontFamily={Inter.medium}
              >
                See all
              </AppText>
              <AppImage source={Images.arrow} width={5} height={8} />
            </TouchableOpacity>
          </View>

          <PopularSongs
            songs={populardatas}
            onSeeAll={() => { }}
            onPlay={(song) => {
              openPlayer(song.id); // 👈 Fixed
            }}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  innercontainer: {
    gap: 20,
    marginHorizontal: 10,
  },
  titles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
});

export default Home;