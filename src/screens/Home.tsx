import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ImageBackground,
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
import { GlobalImage } from '../share/utils/GlobalImage';

const { width } = Dimensions.get('window');

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
  const [newReleasesdata, setNewreleasesdata] = useState<any[]>([])
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
        newreleasesdata(),
        fetchArtistsByFilter(selectedFilter),
      ]);
    } catch (error) {
      console.log('Home refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedFilter]);

  const newreleasesdata = async () => {
    console.log("popular api called")
    try {
      //dispatch(loaderstate(true));

      const response = await ApiService.get(apiUrls.getnewreleases);

      const data = (response as any)?.data;
      console.log(data, 'tranding API RESPONSEdddd');

      if (data?.success) {
        setNewreleasesdata(data.songs);
      }
    } catch (error) {
      console.log('trandingdata ERROR:', error);
    } finally {
      // dispatch(loaderstate(false));
    }
  };

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
    newreleasesdata();
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
              openPlayer(artist.id);
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



          <View style={styles.titles}>

            <AppText color={color.darkthemetext}
              fontSize={14}
              fontWeight="500"
              fontFamily={Inter.medium}>
              New Releases
            </AppText>
            <TouchableOpacity
              onPress={() => {
                (navigation as any).navigate('SongsListScreen', {
                  songs: newReleasesdata,
                  previousScreen: 'Home',
                });
              }}
              activeOpacity={0.4} style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
              <AppText color={'#FFB300'} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>
                View all
              </AppText>
              <AppImage
                source={Images.arrow}
                width={5}
                height={8}
                tintColor={'#FFB300'}

              />
            </TouchableOpacity>
            {/* <TouchableOpacity>
                        <Text style={styles.viewAll}>
                            View all >
                        </Text>
                    </TouchableOpacity> */}

          </View>

          <View style={styles.grid}>


            <FlatList
              horizontal
              data={newReleasesdata.slice(0, 10)}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <AppImage
                    source={Images.music}
                    width={20}
                    height={20}
                    resizeMode="contain"
                  />

                  <AppText
                    style={styles.emptyTitle}>
                    No New Releases
                  </AppText>

                  <AppText style={styles.emptySubtitle}>
                    New songs will appear here soon.
                  </AppText>
                </View>
              )}

              contentContainerStyle={{
                paddingHorizontal: 5,
              }}
              renderItem={({ item }) => (
                <SongCard
                  key={item.id}
                  showNewTag={true}
                  item={item}
                  width={(width - 45) / 3}
                  onpress={() => (navigation as any).navigate('.', {
                    id: item.id,
                  })}

                />

              )}
            />

            {/* {newReleases.map(item => (
                        <SongCard
                            key={item.id}
                            item={item}
                            width={(width - 45) / 2}
                        />
                    ))} */}

          </View>


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

const SongCard = ({
  item,
  width = 150,
  onpress,
  showNewTag = false,

}: {
  item: any;
  width?: number;
  onpress?: () => void;
  showNewTag?: boolean;
}) => {


  return (
    <TouchableOpacity

      onPress={
        onpress

      }
      style={[styles.songCard, { width }]}>

      <   ImageBackground
        source={GlobalImage
          (item.cover_image_url)}
        style={styles.songImage}
        resizeMode='cover'
      >

        <LinearGradient
          colors={[
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.15)',
            'rgba(0,0,0,0.45)',
            'rgba(0,0,0,0.9)',
          ]}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.songOverlay}
        />
        {showNewTag && (
          <View style={styles.newReleaseTag}>


            <LinearGradient
              colors={['#FFB300', '#FF4D67']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: '100%', width: '100%', flex: 1, justifyContent
                  : 'center', alignItems: 'center', borderRadius: 8
              }}
            >
              <AppText style={styles.newReleaseText}>NEW</AppText>
            </LinearGradient>
          </View>
        )}
        <TouchableOpacity style={styles.playCircle}>
          <AppImage
            source={Images.playicon}
            height={12}
            width={12}
          />
        </TouchableOpacity>

        <View style={styles.songBottom}>

          <AppText
            numberOfLines={1}
            style={styles.songTitle}>
            {item.title}
          </AppText>

          <AppText
            numberOfLines={1}
            style={styles.songArtist}>
            {item.artist}
          </AppText>

          <AppText style={styles.songLike}>
            ❤️ {item.likes_count}
          </AppText>

        </View>
      </ImageBackground>

    </TouchableOpacity>
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
  emptyContainer: {
    width: width - 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },

  emptySubtitle: {
    color: '#888',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
  songCard: {
    backgroundColor: '#151515',
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#262626',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },

  songImage: {
    width: '100%',
    height: 282,
    justifyContent: 'flex-end',
    alignSelf: 'center',
  },

  songOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  songTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  songArtist: {
    color: '#E5E5E5',
    marginTop: 3,
    fontSize: 10,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  songLike: {
    color: '#FFD54F',
    marginTop: 8,
    fontSize: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  newReleaseTag: {
    position: 'absolute',
    top: 70,
    left: 10,
    backgroundColor: '#FF2D55',
    height: 20,
    width: 40,
    borderRadius: 8,
    zIndex: 10,
  },

  newReleaseText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playCircle: {
    position: 'absolute',
    bottom: 135,
    left: 10,
    //alignSelf: 'center',
    width: 32,
    height: 32,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3870C',
  },

  songBottom: {
    position: 'absolute',
    bottom: 65,
    left: 0,
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    //  paddingHorizontal: 15,
  },
});

export default Home;