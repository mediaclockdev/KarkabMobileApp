
import { ActivityIndicator, Dimensions, FlatList, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Header from "../share/components/Header";
import { Banner, Images, Logo } from "../share/constants/media";
import color, { useAppColors } from "../share/constants/color";
import AppImage from "../share/components/AppImage";
import SearchBar from "../share/components/SearchBar";
import { useEffect, useState } from "react";
import AppText from "../share/components/AppText";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Inter } from "../share/constants/fonts";
import SingingList from "../share/components/SingingList";
import TrandingList from "../share/components/TrandingList";
import apiUrls from "../services/apiUrls";
import { useAppDispatch } from "../share/hooks/useAppSelector";
import { loaderstate } from "../auth/redux/authSlice";
import ApiService from '../services/api';
import { useNavigation } from '@react-navigation/native'
import { Sound } from "react-native-nitro-sound";

const Search = () => {
  //const [search, setSearch] = useState('')
  const [loader, setLoader] = useState(false)
  const recentdata = ['Mabrook', 'Mabrook', 'Mabrook']
  const dispatch = useAppDispatch();
  const color = useAppColors();


  const [populardatas, setPopulardatas] = useState<any[]>([])
  const trandindata = [
    {
      image: Images.tbanner,
      title: 'Sudanese\nClassics'
    },
    {
      image: Images.t1banner,
      title: 'Haqiba'
    },
    {
      image: Images.t2banner,
      title: 'Makan\nRhythms'
    },
    {
      image: Images.t3banner,
      title: 'Wedding\nSongs'
    },
    {
      image: Images.t4banner,
      title: 'Modern\nKhartoum'
    },
    {
      image: Images.t5banner,
      title: 'Sufi\nSongs'
    },
  ]

  const navigation = useNavigation();
  const trandingdata = async () => {
    console.log("popular api called")
    try {
      setLoader(true)

      const response = await ApiService.get(apiUrls.gettrandingsong);

      const data = (response as any).data;
      console.log(data, 'tranding API RESPONSEdddd');

      if (data?.success) {
        setPopulardatas(data.songs);
      }
    } catch (error) {
      console.log('trandingdata ERROR:', error);
    } finally {
      setLoader(false)
    }
  };


  useEffect(() => {
    trandingdata()
  }, [])


  const handlenavigation = async ({ item }: { item: { title: string } }) => {
    console.log(item)
    if (item.title == 'Artists') {
      (navigation as any).navigate('ArtistScreen')
    }
    else if (item.title == 'Songs') {
      (navigation as any).navigate('SongsScreen')
    }
    else if (item.title == 'Sudanese classics') {
      (navigation as any).navigate('SudaneseClassicsScreen')
    }
    else if (item.title == 'Playlists') {
      (navigation as any).navigate('PlayListScreen')
    }
    else if (item.title == 'Genre') {
      (navigation as any).navigate('GenreScreen')
    }
    else if (item.title == 'Performances') {
      (navigation as any).navigate('PerformanceScreen')
    }

  }




  const browesdata = [
    {
      image: Banner.brbanner,
      title: 'Songs',
      dtitle: 'Find your',
      dtitle1: 'favorite songs',
      icon: Images.music
    },
    {
      image: Banner.br1banner,
      title: 'Artists',
      dtitle: 'Explore top',
      dtitle1: 'artists',
      icon: Images.picon
    },
    {
      image: Banner.br2banner,
      title: 'Sudanese classics',
      dtitle: 'Curated',
      dtitle1: 'playlist for you',
      icon: Images.bplay
    },
    {
      image: Banner.br3banner,
      title: 'Performances',
      dtitle: 'Discover music',
      dtitle1: 'by genre',
      icon: Logo.dmic
    },
    {
      image: Banner.br2banner,
      title: 'Genre',
      dtitle: 'Discover music',
      dtitle1: 'by genre',
      icon: Logo.genre
    },
    {
      image: Banner.br4banner,
      title: 'Playlists',
      dtitle: 'Discover music',
      dtitle1: 'by genre',
      icon: Images.playlist
    },

  ]

  return (
    <SafeAreaView
      style={{
        backgroundColor: color.darkbackround,
        flex: 1,
      }}
    >
      <ImageBackground
        source={Banner.searchbackg}
        resizeMode="cover"
        style={{
          flex: 1,
        }}
        tintColor={color.loginbackground}
      >

        <View style={styles.container}>


          <Header
            headername={'Search'}
            headertitle={'What would you like to sing today?'}
            rightIcon={Images.mics}

            onRightPress={() => {
              (navigation as any).navigate('Recording');
            }}
            rightView={
              <></>
            }
          />
          {/* <AppImage
            source={Banner.serachline}
            height={17}
            width={Dimensions.get('window').width}
            resizeMode="cover"
          /> */}
          <SearchBar
            value={''}
            onChangeText={() => console.log('filter')}
            onFilterPress={() => console.log('filter')}
            title="search"
            onPress={() => {
              (navigation as any).navigate('SearchSongSecreen', { previousScreen: 'Home' })
            }}

          />
          {
            loader ?
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#EFCB61" />
              </View> :
              <ScrollView showsVerticalScrollIndicator={false} style={{ gap: 20, marginVertical: 10 }}>
                <View style={styles.titles}>
                  <AppText
                    color={color.darkthemetext}
                    fontSize={12}
                    fontWeight="500"
                    fontFamily={Inter.regular}
                  >
                    Recent searches
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={0.5}
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <AppText
                      color={'#F6A202'}
                      fontSize={12}
                      fontWeight="500"
                      fontFamily={Inter.regular}
                    >
                      More
                    </AppText>

                    <AppImage
                      source={Images.arrow}
                      width={5}
                      height={8}
                      resizeMode="contain"
                      tintColor={'#F6A202'}
                    />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={recentdata.slice(0, 3)}
                  numColumns={3}
                  scrollEnabled={false}
                  style={{ maxHeight: 120, marginTop: 20 }}
                  keyExtractor={(item, index) => index.toString()}
                  columnWrapperStyle={{
                    justifyContent: 'space-between',

                  }}
                  renderItem={({ item }) => (
                    <View style={[styles.recentview, { backgroundColor: color.darkbackround, borderColor: color.searhbarbordercolor }]}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <AppImage
                          source={Images.music}
                          width={15}
                          height={15}
                        />

                        <AppText
                          color={color.darkthemetext}
                          fontSize={12}
                          fontWeight="500"
                          fontFamily={Inter.regular}
                        >
                          {item}
                        </AppText>
                      </View>
                      <TouchableOpacity>
                        <AppText
                          color={color.darkthemetext}
                          fontSize={12}
                          fontWeight="500"
                          fontFamily={Inter.regular}
                        >
                          X
                        </AppText>
                      </TouchableOpacity>

                    </View>
                  )}
                />
                <View style={styles.titles}>
                  <AppText
                    color={color.darkthemetext}
                    fontSize={12}
                    fontWeight="500"
                    fontFamily={Inter.regular}
                  >
                    Start Singing
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={0.5}
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <AppText
                      color={'#F6A202'}
                      fontSize={12}
                      fontWeight="500"
                      fontFamily={Inter.regular}
                    >
                      View all
                    </AppText>

                    <AppImage
                      source={Images.arrow}
                      width={5}
                      height={8}
                      resizeMode="contain"
                      tintColor={'#F6A202'}
                    />
                  </TouchableOpacity>
                </View>


                <SingingList />

                <View style={styles.titles}>
                  <AppText
                    color={color.darkthemetext}
                    fontSize={12}
                    fontWeight="500"
                    fontFamily={Inter.regular}
                  >
                    Trending Sudanese Songs
                  </AppText>

                  <TouchableOpacity
                    onPress={() => {
                      (navigation as any).navigate('SongsListScreen', {
                        songs: populardatas,
                        previousScreen: 'Search',
                      });
                    }}
                    activeOpacity={0.5}
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <AppText
                      color={'#F6A202'}
                      fontSize={12}
                      fontWeight="500"
                      fontFamily={Inter.regular}
                    >
                      See all
                    </AppText>

                    <AppImage
                      source={Images.arrow}
                      width={5}
                      height={8}
                      resizeMode="contain"
                      tintColor={'#F6A202'}
                    />
                  </TouchableOpacity>
                </View>





                <TrandingList data={populardatas} />

                <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                  Browse by category
                </AppText>


                <View style={styles.container1}>
                  {browesdata.map((item, index) => (
                    <TouchableOpacity
                      onPress={() => {
                        handlenavigation({ item })
                      }}
                      key={index} style={{
                        width: '31%',
                        marginBottom: 12, borderWidth: 1, borderColor: index === 3 || index === 1 ? "#806141" : "#9F4A65", borderRadius: 12
                      }}>
                      <ImageBackground
                        source={item.image}
                        resizeMode="cover"
                        style={{
                          width: '100%',
                          height: 98,

                          borderRadius: 12
                        }}
                        imageStyle={styles.image}
                      >
                        <View style={[styles.overlay, { justifyContent: 'space-between', height: 98, }]}>

                          <AppImage
                            source={item.icon}
                            width={28}
                            height={28}
                            resizeMode="contain"
                          />

                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <AppText
                              color={"#FFF"}
                              fontSize={12}
                              fontWeight="600"
                              fontFamily={Inter.medium}
                            >
                              {item.title}
                            </AppText>


                            <AppImage
                              source={Images.arrow}
                              width={5}
                              height={8}
                              tintColor={"#FFF"}
                            />

                          </View>

                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ height: 80 }} />
              </ScrollView>}
        </View>
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    //   backgroundColor: color.darkbackround,
    flex: 1,
    paddingHorizontal: 10,
    //  paddingBottom: 100,
  },
  recentview: {
    width: '31%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#201813'

  },
  titles: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  container1: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  card: {
    width: '28%',
    marginBottom: 12,
    flexWrap: 'wrap',
  },

  banner: {
    width: '100%',
    height: 115,
    justifyContent: 'flex-start',
    borderRadius: 12
  },

  image: {
    borderRadius: 12,
  },

  overlay: {
    padding: 10,
    gap: 8,
  },
})
export default Search;