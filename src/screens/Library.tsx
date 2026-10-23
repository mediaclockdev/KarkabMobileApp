import {
  StyleSheet,
  View,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  ActivityIndicator,
} from "react-native"
import Header from "../share/components/Header";
import color, { useAppColors } from "../share/constants/color";
import AppText from "../share/components/AppText";
import LinearGradient from 'react-native-linear-gradient';
import AppImage from "../share/components/AppImage";
import { Banner, BottomIcons, Images, Logo } from "../share/constants/media";
import Librarylist, { MusicItem } from "../share/components/Librarylist";
import { SafeAreaView } from "react-native-safe-area-context";
import { Inter } from "../share/constants/fonts";
import apiUrls from "../services/apiUrls";
import ApiService from '../services/api';
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAppSelector } from "../share/hooks/useAppSelector";
import Sound from 'react-native-nitro-sound';
import { GlobalImage } from "../share/utils/GlobalImage";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

const LIMIT = 15; // Set to 10 or 15 songs per page

const Library = () => {
  const color = useAppColors();
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Counts & Stats
  const [favoritescount, setFavoritescount] = useState(0);
  const [recordingcount, setRecordingcount] = useState(0);
  const [numberofsong, setNumberofsong] = useState(0);

  // Songs & Pagination States
  const [songdata, setSongdata] = useState<MusicItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter & Search
  const [searchText, setSearchText] = useState('');
  const [visible, setVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTab, setSelectedTab] = useState('Songs');

  // Recordings & Audio States
  const [recdata, setRecdata] = useState<any[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const playsong = useAppSelector((state: any) => state.auth.playsong);
  const recordingRefresh = useAppSelector((state: any) => state.auth.recordingRefresh);

  const ferture = [
    {
      image: Images.music,
      title: 'Songs\nAvailable',
      number: numberofsong,
      bordercolor: '#8F4602',
    },
    {
      image: Images.like,
      title: 'Favourites\nSongs',
      number: favoritescount,
      bordercolor: '#9214699C',
    },
    {
      image: Images.mic,
      title: 'Karaoke\nSessions',
      number: recordingcount,
      bordercolor: '#8F4602',
    },
    {
      image: Logo.headponeicon,
      title: 'Recently\nSung',
      number: 0,
      bordercolor: '#9E8F1F',
    },
  ];

  useFocusEffect(
    useCallback(() => {
      return async () => {
        try {
          await Sound.stopPlayer();
          Sound.removePlayBackListener();
        } catch (e) { }
      };
    }, [])
  );



  useFocusEffect(
    useCallback(() => {
      songlist(1, true);
      setSelectedTab('Songs')
      setVisible(true)
    }, [])
  )
  useFocusEffect(
    useCallback(() => {

      getRecording();
    }, [recordingRefresh])
  )

  const normalizeText = (text: any) => {
    return String(text ?? '')
      .toLowerCase()
      .trim()
      // Normalize Arabic letters
      .replace(/[إأآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      // Remove Arabic diacritics
      .replace(/[\u064B-\u065F\u0670]/g, '')
      // Remove Arabic tatweel
      .replace(/ـ/g, '')
      // Normalize extra spaces
      .replace(/\s+/g, ' ');
  };

  // Fetch songs with pagination
  const songlist = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await ApiService.get(apiUrls.getsonglist, {
        params: {
          page: pageNumber,

        },
      });

      const data = (response as any).data;

      if (data?.success) {
        const incomingSongs = data?.songs || [];

        if (pageNumber === 1) {
          setSongdata(incomingSongs);
        } else {
          setSongdata(prev => [...prev, ...incomingSongs]);
        }
        console.log(data?.favorite_songs_count, "dejdjebdeb")

        setNumberofsong(data?.total_songs || 0);
        setFavoritescount(data?.favorite_songs_count || 0);
        setRecordingcount(data?.overall_recordings_count || 0);

        // Check if more songs are available
        if (data?.total_songs !== undefined) {
          const totalLoaded = (pageNumber === 1 ? incomingSongs.length : songdata.length + incomingSongs.length);
          setHasMore(totalLoaded < data.total_songs);
        } else {
          setHasMore(incomingSongs.length >= LIMIT);
        }

        setPage(pageNumber);
      }
    } catch (error) {
      console.log('songlist ERROR:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const getFavorites = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await ApiService.get(apiUrls.favorites, {
        params: {
          page: pageNumber,
          limit: LIMIT,
        },
      });

      const data = (response as any).data;

      if (data?.success) {
        const incomingSongs = data?.songs || [];
        if (pageNumber === 1) {
          setSongdata(incomingSongs);
        } else {
          setSongdata(prev => [...prev, ...incomingSongs]);
        }
        setHasMore(incomingSongs.length >= LIMIT);
        setPage(pageNumber);
      }
    } catch (error) {
      console.log("FAVORITES ERROR:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const getRecording = async () => {
    try {
      const response = await ApiService.get(apiUrls.getrecording);
      const data = (response as any).data;
      if (data?.success) {
        setRecdata(data.recordings || []);
      }
    } catch (error) {
      console.log("getrecording ERROR:", error);
    }
  };

  // Pull-to-refresh
  const handleRefresh = async () => {
    setHasMore(true);
    getRecording();
    if (selectedTab === 'Favorites') {
      await getFavorites(1, true);
    } else {
      await songlist(1, true);
    }
  };

  // Pagination on scroll
  const handleLoadMore = () => {
    if (!isLoading && !loadingMore && hasMore && !searchText.trim()) {
      if (selectedTab === 'Favorites') {
        getFavorites(page + 1, false);
      } else {
        songlist(page + 1, false);
      }
    }
  };

  const handlepages = (item: string) => {
    setSelectedTab(item);
    setPage(1);
    setHasMore(true);

    if (item === 'Favorites') {
      getFavorites(1);
      setVisible(false);
    } else if (item === 'Songs') {
      songlist(1);
      setVisible(true);
    } else if (item === 'Playlists') {
      (navigation as any).navigate('PlayListScreen', { previousScreen: 'Library' });
    } else if (item === 'Recently Played') {
      // Toast.show(title="coming soon")
      Toast.show({
        type: 'info',
        position: 'bottom',
        bottomOffset: 200,
        text1: 'Coming soon!',
        // text2: "coming soon",
      });
    }
  };

  // Search & Sort filter
  const filteredSongs = (songdata || [])
    .filter(item => {
      if (!searchText.trim()) return true;

      const search = normalizeText(searchText);

      const title = normalizeText(item?.title);

      const artist = normalizeText(
        typeof item?.artist === 'object'
          ? item?.artist?.name
          : item?.artist
      );

      const badge = normalizeText(item?.badge);

      return (
        title.includes(search) ||
        artist.includes(search) ||
        badge.includes(search)
      );
    })
    .sort((a, b) => {
      const comparison = normalizeText(a?.title).localeCompare(
        normalizeText(b?.title),
        ['ar', 'en'],
        { sensitivity: 'base' }
      );

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Render everything above the songs list inside ListHeaderComponent
  const renderHeader = () => (
    <View style={{ gap: 20, paddingTop: 16 }}>
      {/* 4 Feature Cards */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {ferture.map((item, index) => (
          <View
            key={index}
            style={{
              borderColor: '#9D3F00',
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center',
              width: '23.6%',
              flexDirection: 'row',
              gap: 6,
              paddingHorizontal: 8,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <View
              style={{
                borderWidth: 1,
                borderColor: item.bordercolor,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 6,
                borderRadius: 50,
              }}
            >
              <AppImage source={item.image} height={20} width={20} />
            </View>

            <View>
              <AppText fontSize={7} fontFamily={Inter.regular} color={color.darkthemetext}>
                {item.title}
              </AppText>
              <AppText fontSize={16} fontFamily={Inter.regular} color={color.darkthemetext}>
                {item.number}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      {visible && (
        <>

          {/* Karaoke Banner */}
          <View
            style={{
              borderWidth: 1,
              borderColor: 'brown',
              height: 133,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <ImageBackground source={Banner.addbanner} resizeMode="cover" style={{ flex: 1, width: '100%' }}>
              <View style={{ paddingVertical: 10, marginHorizontal: 15 }}>
                <AppText color="#fff" fontSize={16} fontFamily={Inter.bold}>
                  {t('Library.featuredsudanese')}
                </AppText>
                <AppText color="#F29803" fontSize={16} fontFamily={Inter.bold}>
                  {t('Library.Karaoke')}
                </AppText>
                <AppText color="#FFFFFF" fontSize={10} fontFamily={Inter.bold}>
                  {t('Library.madeyournextgathering')}
                </AppText>

                <TouchableOpacity
                  style={{ height: 29, width: 105 }}
                  onPress={() => {
                    (navigation as any).navigate('Recording');
                  }}
                >
                  <LinearGradient
                    colors={['#F36902', '#E04A0F', '#BD1221']}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 135,
                      height: 29,
                      borderRadius: 10,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#D86F0C',
                      marginTop: 8,
                    }}
                  >
                    <View style={{ paddingHorizontal: 8, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', width: 135 }}>
                      <AppImage source={Images.hmic} height={14.58} width={14.58} />
                      <AppText color="#FFFFFF" fontSize={11} fontFamily={Inter.bold}>
                        {t('Library.SingItYourOwn')}
                      </AppText>
                      <AppImage source={Images.arrow} height={8} width={9} tintColor={"#FFFFFF"} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>

          {recdata?.length ? (
            <>

              {/* Continue Singing Section */}
              <View style={[styles.titles, { width: '100%' }]}>
                <View style={{ flexDirection: 'row', gap: 5, justifyContent: "center", alignItems: 'center' }}>
                  <AppText color={'#FB6B01'} fontSize={14} fontWeight="500" fontFamily={Inter.regular}>
                    {t('Library.continuesinging')}
                  </AppText>
                  <AppImage source={Banner.brightstar} height={12} width={12} />
                </View>

                <TouchableOpacity
                  onPress={() => {
                    (navigation as any).navigate('RecordingList', {
                      recordings: recdata,
                      previousScreen: 'Library',
                      isRecordings: true,
                    });
                  }}
                  style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}
                >
                  <AppText color={color.darkthemetext} fontSize={14} fontWeight="500" fontFamily={Inter.regular}>
                    {t('Library.Viewall')}
                  </AppText>
                  <AppImage source={Images.arrow} width={5} height={8} tintColor={color.darkthemetext} />
                </TouchableOpacity>
              </View>





              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {recdata.slice(0, 4).map((item, index) => (
                  <View
                    key={index}
                    style={{
                      borderWidth: 1,
                      borderColor: 'brown',
                      borderRadius: 8,
                      width: '23%',
                      height: 116,
                      overflow: 'hidden',
                    }}
                  >
                    <ImageBackground
                      source={GlobalImage(item?.album_picture_url)}
                      resizeMode="cover"
                      style={{ flex: 1, padding: 8, justifyContent: 'space-between' }}
                    >
                      <TouchableOpacity
                        onPress={() => (navigation as any).navigate('.', { id: item.id, type: 'recordings' })}
                        style={{
                          height: 27,
                          width: 27,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: '#40413E',
                          backgroundColor: '#050808',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'flex-end',
                        }}
                      >
                        {playingId === item.id ? (
                          <AppImage source={Images.playicon} height={10} width={10} />
                        ) : (
                          // <View style={styles.pauseContainer}>
                          //   <View style={styles.pauseLine} />
                          //   <View style={styles.pauseLine} />
                          // </View>
                          <AppImage source={Images.playicon} height={10} width={10} />
                        )}
                      </TouchableOpacity>

                      <View>
                        <AppText fontSize={11} fontFamily={Inter.regular} color="#FFFFFF" numberOfLines={1}>
                          {item.album_name}
                        </AppText>
                        <AppText fontSize={10} fontFamily={Inter.regular} color="#C0C2C1" numberOfLines={1}>
                          {item.status}
                        </AppText>
                        <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginTop: 6 }}>
                          <View
                            style={{
                              width: `${progressMap[item.id] || 0}%`,
                              height: '100%',
                              backgroundColor: '#F3870C',
                              borderRadius: 4,
                            }}
                          />
                        </View>
                      </View>
                    </ImageBackground>
                  </View>
                ))}
              </View>
            </>

          ) : (
            // <View style={styles.centerContainer}>
            //   <AppImage source={Logo.ymusic} width={20} height={20} />
            //   <AppText color={color.darkthemetext} fontSize={14} marginTop={10}>
            //     {t('Library.norecordingfound')}
            //   </AppText>
            // </View>
            null
          )}



          {/* All Songs Count & Search Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              <AppText color="#F46E00" fontSize={12} fontFamily={Inter.regular}>
                {t('Library.allsongs')}
              </AppText>
              <AppText color="#CDCECB" fontSize={12} fontFamily={Inter.regular}>
                {" (" + (numberofsong || songdata.length) + ")"}
              </AppText>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderColor: '#242424',
                  alignItems: 'center',
                  borderRadius: 12,
                  width: 204,
                  gap: 5,
                  paddingHorizontal: 10,
                }}
              >
                <AppImage source={BottomIcons.search} height={14} width={14} tintColor={"#CDCECB"} />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder={t('Library.searchsongs,artists...')}
                  placeholderTextColor={"#CDCECB"}
                  style={{ fontSize: 10, color: '#FFFF', flex: 1 }}
                />
              </View>

              <TouchableOpacity style={{ padding: 10, borderWidth: 1, borderColor: '#303030', borderRadius: 12 }}>
                <AppImage source={Logo.gfilter} height={12} width={25} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color.darkbackround }]}>
      {/* Header */}
      <Header
        rightIcon={Images.bell}
        onRightPress={() => { (navigation as any).navigate('NotificationScreen') }}
        rightView={
          <LinearGradient
            colors={['#845726', '#4D2001']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 8 }}
          >
            <TouchableOpacity
              style={{
                width: 62,
                height: 28,
                borderRadius: 8,
                flexDirection: 'row',
                backgroundColor: color.darkbackround,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                margin: 1,
              }}
              onPress={() => {
                (navigation as any).navigate('Recording');
              }}
            >
              <AppImage source={Images.mic} width={15} height={15} tintColor={color.darkthemetext} />
              <AppText color={color.darkthemetext} fontSize={10} fontWeight="400" fontFamily={Inter.regular}>
                {t('Library.Rooms')}
              </AppText>
            </TouchableOpacity>
          </LinearGradient>
        }
      />

      {/* Top Tabs */}
      <View style={[styles.toptitle, { backgroundColor: color.darkbackround, borderColor: '#302E2E' }]}>
        {['Songs', 'Playlists', 'Favorites', 'Recently Played'].map((item, index) => (
          <TouchableOpacity key={index} style={styles.tabItem} onPress={() => handlepages(item)}>
            <AppText
              color={color.darkthemetext}
              fontSize={12}
              fontWeight="500"
              fontFamily={Inter.medium}
            >
              {item}
            </AppText>
            {selectedTab === item && <View style={styles.bottomLine} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Row */}
      <View style={styles.filterview}>
        {/* All Genres */}
        <LinearGradient
          colors={['#8E6B3E', '#292727']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ borderRadius: 25 }}
        >
          <TouchableOpacity
            onPress={() => {
              setPage(1);
              songlist(1);
              setVisible(true);
            }}
            style={[styles.filter, { backgroundColor: color.darkbackround, margin: 1 }]}
          >
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <AppImage source={Images.music} tintColor={"#ADA03E"} height={10} width={10} />
              <AppText color={color.darkthemetext} fontSize={8} fontWeight="500" fontFamily={Inter.medium}>
                All Genres
              </AppText>
            </View>
            <AppImage
              source={Logo.downarrow}
              width={7}
              height={4}
              resizeMode="contain"
              style={{ marginTop: 2 }}
              tintColor={color.darkthemetext}
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Sudanese Arabic */}
        <LinearGradient
          colors={['#8E6B3E', '#292727']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ borderRadius: 25 }}
        >
          <TouchableOpacity
            onPress={() => { (navigation as any).navigate('SudaneseClassicsScreen') }}
            style={[styles.filter, { backgroundColor: color.darkbackround, margin: 1 }]}
          >
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <AppImage source={Logo.glob} height={10} width={10} />
              <AppText color={color.darkthemetext} fontSize={8} fontWeight="500" fontFamily={Inter.medium}>
                Sudanese Arabic
              </AppText>
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* Sort */}
        <LinearGradient
          colors={['#8E6B3E', '#292727']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ borderRadius: 25 }}
        >
          <TouchableOpacity
            onPress={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            style={[styles.filter, { backgroundColor: color.darkbackround, margin: 1 }]}
          >
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <AppImage source={Logo.sort} height={10} width={10} />
              <AppText color={color.darkthemetext} fontSize={8} fontWeight="500" fontFamily={Inter.medium}>
                {sortOrder === 'asc' ? 'Sort ▲' : 'Sort ▼'}
              </AppText>
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* Filter */}
        {/* <LinearGradient
          colors={['#8E6B3E', '#292727']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ borderRadius: 25 }}
        >
          <TouchableOpacity style={[styles.filter, { backgroundColor: color.darkbackround, margin: 1 }]}>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
              <AppImage source={Logo.lfilter} height={10} width={10} />
              <AppText color={color.darkthemetext} fontSize={8} fontWeight="500" fontFamily={Inter.medium}>
                Filter
              </AppText>
            </View>
          </TouchableOpacity>
        </LinearGradient> */}
      </View>

      {/* Main List with Integrated Header and Pagination */}
      <View style={{ flex: 1 }}>
        <Librarylist
          ListHeaderComponent={renderHeader()}
          musicData={filteredSongs}
          loading={isLoading && page === 1}
          refreshing={refreshing}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onLikePress={() => {
            songlist(page);
          }}
          onDislikePress={() => {
            songlist(page);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Library;

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.darkbackround,
    flex: 1,
    paddingHorizontal: 10,
  },
  toptitle: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#31200E',
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#080808',
    borderRadius: 11,
  },
  filterview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
    marginTop: 10,
    //justifyContent: 'space-between',
    marginBottom: 5,
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 0,
    gap: 8,
  },
  titles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pauseContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseLine: {
    width: 3,
    height: 12,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLine: {
    position: 'absolute',
    bottom: -10,
    width: '125%',
    height: 2,
    backgroundColor: '#F66A01',
    borderRadius: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});