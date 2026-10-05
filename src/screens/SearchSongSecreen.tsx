import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    FlatList,
    TextInput,
    Image,
    Dimensions,
    ImageBackground,
    ActivityIndicator,
} from 'react-native';
import AppImage from '../share/components/AppImage';
import { Banner, BottomIcons, Images, Logo } from '../share/constants/media';
import { Inter } from '../share/constants/fonts';
import MiniPlayer from '../share/components/MiniPlayer';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import apiUrls from '../services/apiUrls';
import ApiService from '../services/api';
import AppText from '../share/components/AppText';
import Librarylist from '../share/components/Librarylist';
const { width } = Dimensions.get('window');

const COLORS = {
    bg: '#090909',
    card: '#151515',
    border: '#242424',
    primary: '#FF2D55',
    yellow: '#FFB300',
    white: '#fff',
    gray: '#888',
};

const categories = [
    'All',
    'Trending',
    'Latest',
    'Classics',
    'Love',
    'Sad',
    'Wedding',
    'Religious',
    'Hip Hop',
];





export default function SearchSongSecreen() {
    const navigation = useNavigation();
    const [selected, setSelected] = useState('All');
    const [activeBanner, setActiveBanner] = useState(0);
    const route = useRoute();

    const { previousScreen } = route.params as {
        songs: any[];
        previousScreen: string;
    };
    const [songdata, setSongdata] = useState<any[] | null>(null);
    const [numberofsong, setNumberofsong] = useState(0)
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filteredSongs, setFilteredSongs] = useState<any[]>([]);

    const [sortOrder, setSortOrder] = useState('asc');


    const normalizeText = (text: any) => {
        return String(text ?? '')
            .toLowerCase()
            .trim()
            // Arabic letter normalization
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

    const songlist = async () => {
        try {
            setIsLoading(true);

            const response = await ApiService.get(apiUrls.allsongs);

            const data = response.data;
            console.log(data, "hhlllllvhvh")
            if (data?.success) {
                setSongdata(data.songs);
                setNumberofsong(data.total_songs);
            }
        } catch (error) {
            console.log('songlist ERROR:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setSearchText('');
            songlist();
        }, [])
    );




    useEffect(() => {
        if (searchText.trim().length === 0) {
            setFilteredSongs([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const timer = setTimeout(() => {
            const search = normalizeText(searchText);

            const result =
                songdata?.filter((song: any) => {
                    const title = normalizeText(song?.title);

                    const artist = normalizeText(
                        typeof song?.artist === 'object'
                            ? song?.artist?.name
                            : song?.artist
                    );

                    const badge = normalizeText(song?.badge);

                    const favorite = normalizeText(song?.is_favorite);

                    return (
                        title.includes(search) ||
                        artist.includes(search) ||
                        badge.includes(search) ||
                        favorite.includes(search)
                    );
                }) || [];

            setFilteredSongs(result);
            setIsLoading(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchText, songdata]);


    return (
        <SafeAreaView style={styles.container}>
            {/* <StatusBar
                translucent={false}
                backgroundColor={v.bg}
                barStyle="light-content"
            /> */}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}>

                {/* HEADER */}

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            if (previousScreen) {
                                navigation.navigate(previousScreen);
                            } else {
                                navigation.goBack();
                            }
                        }}>
                        <AppImage
                            source={Logo.arrowline}
                            height={25}
                            width={19}
                            tintColor="#FFF"
                        />
                    </TouchableOpacity>


                    {/* Logo & Title */}
                    <View style={styles.logoContainer}>
                        <AppImage
                            source={Logo.mainlogo}   // use your app logo
                            width={35}
                            height={35}
                            resizeMode="contain"
                        />

                        <AppText
                            fontSize={22}
                            fontFamily={Inter.bold}
                            color="#FFF"
                        >
                            Search
                        </AppText>

                        <AppText
                            fontSize={12}
                            color="#8A8A8A"
                            style={{ marginTop: 4 }}>
                            Find your favorite songs & artists
                        </AppText>
                    </View>

                </View>



                <View style={{ marginHorizontal: 15 }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                        }}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: '#242424',
                                borderRadius: 12,
                                paddingHorizontal: 10,
                                height: 44,
                            }}>
                            <AppImage
                                source={BottomIcons.search}
                                height={14}
                                width={14}
                                tintColor="#CDCECB"
                            />

                            <TextInput
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Search songs, artists..."
                                placeholderTextColor="#CDCECB"
                                style={{
                                    flex: 1,
                                    fontSize: 14,
                                    color: '#FFF',
                                    marginLeft: 8,
                                }}
                            />
                        </View>
                    </View>
                    {searchText.trim().length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 80,
                            }}>
                            <AppImage
                                source={BottomIcons.search}
                                height={60}
                                width={60}
                                tintColor="#555"
                            />

                            <AppText
                                color="#FFF"
                                fontSize={18}
                                fontFamily={Inter.medium}
                                style={{ marginTop: 16 }}>
                                Search Songs
                            </AppText>

                            <AppText
                                color="#888"
                                fontSize={12}
                                style={{ marginTop: 8, textAlign: 'center' }}>
                                Search by song title, artist or badge
                            </AppText>
                        </View>
                    ) : isLoading ? (
                        <View
                            style={{
                                marginTop: 60,
                                alignItems: 'center',
                            }}>
                            <ActivityIndicator size="small" color="#FF2D55" />
                            <AppText
                                color="#888"
                                style={{ marginTop: 10 }}>
                                Searching...
                            </AppText>
                        </View>
                    ) : (
                        <Librarylist
                            musicData={filteredSongs}
                            loading={false}
                        />
                    )}
                </View>


            </ScrollView>
            {/* <MiniPlayer /> */}

        </SafeAreaView>
    );
}





const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    logoContainer: {
        //  alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },

    header: {
        flexDirection: 'row',
        // alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        // marginBottom: 10,
    },
    back: {
        fontSize: 28,
        color: 'white',
    },

    music: {
        fontSize: 22,
        marginRight: 8,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffff',
        fontFamily: Inter.bold
    },

    subtitle: {
        color: '#999',
        marginTop: 2,
        fontSize: 10,
        fontFamily: Inter.regular
    },

    settingBtn: {
        height: 32,
        width: 32,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#FF2D55',
        justifyContent: 'center',
        alignItems: 'center',
    },

    searchBox: {
        marginHorizontal: 15,
        backgroundColor: '#121212',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#222',
    },

    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },

    input: {
        flex: 1,
        color: 'white',
    },

    category: {
        paddingHorizontal: 18,
        paddingVertical: 6,
        borderRadius: 18,
        marginRight: 10,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    categoryInactive: {
        backgroundColor: '#181818',
    },

    categoryText: {
        fontSize: 10,
        fontWeight: '600',
    },

    categoryActive: {
        backgroundColor: '#FF6A00',
    },

    banner: {
        width: width - 30,
        height: 170,
        marginHorizontal: 15,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#222',
    },

    bannerImage: {
        height: 170,
        ...StyleSheet.absoluteFillObject,

    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(30,0,40,.65)',
    },

    bannerContent: {
        padding: 20,
    },

    bannerSmall: {
        color: '#FFB300',
        fontWeight: '700',
        marginBottom: 10,
        fontSize: 10
    },

    bannerTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 18,
        marginBottom: 18,
        fontFamily: Inter.bold
    },

    playBtn: {
        backgroundColor: '#FF4B5C',
        paddingHorizontal: 15,
        paddingVertical: 8,
        alignSelf: 'flex-start',
        borderRadius: 8,
    },

    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 14,
    },

    dot: {
        height: 7,
        width: 7,
        backgroundColor: '#555',
        borderRadius: 5,
        marginHorizontal: 4,
    },

    activeDot: {
        backgroundColor: '#FF2D55',
        width: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginTop: 20,
        marginBottom: 12,
    },

    sectionTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },

    viewAll: {
        color: '#FFB300',
        fontWeight: '600',
        fontSize: 10,
    },

    songCard: {
        backgroundColor: '#151515',
        borderRadius: 14,
        overflow: 'hidden',
        marginRight: 8,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#262626',
        height: 160
    },

    songImage: {
        width: '100%',
        height: 180,
        justifyContent: 'flex-end'
    },

    songOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,.25)',
    },

    playCircle: {
        position: 'absolute',
        top: 65,
        left: 18,
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
        padding: 10,
    },

    songTitle: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },

    songArtist: {
        color: '#999',
        marginTop: 3,
        fontSize: 10,
    },

    songLike: {
        color: '#FF4D67',
        marginTop: 8,
        fontSize: 10,
        fontWeight: '600',
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 5,
    },

    moodCard: {
        width: '23%',
        backgroundColor: '#141414',
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#252525',
        height: 50,

    },

    moodEmoji: {
        fontSize: 10,
    },

    moodTitle: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 8,
    },

    moodSubtitle: {
        color: '#888',
        fontSize: 8,
        marginTop: 2,
    },

    karaokeCard: {
        width: '49%',
        backgroundColor: '#151515',
        borderRadius: 10,
        //  padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#252525',
        flexDirection: 'row',
        // remove these
        // marginHorizontal: 15,
        flexWrap: 'wrap',
        overflow: 'hidden',
        height: 60,
        gap: 5
    },

    karaokeImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },

    smallPlay: {
        position: 'absolute',
        left: 30,
        top: 30,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(0,0,0,.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    karaokeTitle: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 10,
        marginTop: 5
    },

    karaokeArtist: {
        color: '#999',
        fontSize: 8,
        marginTop: 4,
    },

    karaokeCount: {
        color: '#FF4D67',
        marginTop: 8,
        fontWeight: '600',
        fontSize: 8,
    },

    more: {
        color: '#888',
        fontSize: 22,
        paddingHorizontal: 3,
    },
});