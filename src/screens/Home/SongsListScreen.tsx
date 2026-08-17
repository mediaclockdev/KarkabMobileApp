import React, { useCallback, useState } from 'react';
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
} from 'react-native';
import AppImage from '../../share/components/AppImage';
import { Banner, BottomIcons, Images, Logo } from '../../share/constants/media';
import { Inter } from '../../share/constants/fonts';
import MiniPlayer from '../../share/components/MiniPlayer';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import AppText from '../../share/components/AppText';
import Librarylist from '../../share/components/Librarylist';
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





export default function SongsListScreen() {
    const navigation = useNavigation();
    const [selected, setSelected] = useState('All');
    const [activeBanner, setActiveBanner] = useState(0);
    const route = useRoute();


    const {
        songs,
        previousScreen,
        filter = false,
    } = route.params as {
        songs: any;
        previousScreen: string;
        filter?: boolean;
    };
    const [songdata, setSongdata] = useState<any[] | null>(null);
    const [numberofsong, setNumberofsong] = useState(0)
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [sortOrder, setSortOrder] = useState('asc');



    useFocusEffect(
        useCallback(() => {

            console.log('SongsListScreen focused');
            if (previousScreen === 'Browsemood') {
                setSearchText('')
                songlist()
            }
            else if (filter && previousScreen == 'SongsScreen') {
                setSearchText('')
                songlist()
            }
            else {
                setIsLoading(true)
                setNumberofsong(songs?.length || 0)
                setSearchText('')
                setSongdata(songs)
                setIsLoading(false)
            }
            //  songlist()
        }, [songs])
    )

    const filteredSongs = (songdata || [])
        .filter((song: any) => {
            const search = searchText.toLowerCase();

            const title = song.title || '';
            const artist = song.artist?.name || song.artist || '';
            const category = song.categoryName || '';

            return (
                title.toLowerCase().includes(search) ||
                artist.toLowerCase().includes(search) ||
                category.toLowerCase().includes(search)
            );
        })
        .sort((a: any, b: any) => {
            const comparison = (a.title || '').localeCompare(
                b.title || '',
                ['ar', 'en'],
                { sensitivity: 'base' }
            );

            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const songlist = async () => {
        console.log("getsongcategorieslist api called")
        try {
            setIsLoading(true)
            // dispatch(loaderstate(true));

            const response = await ApiService.get(apiUrls.getsongcategorieslist(songs.id));

            const data = response.data;
            console.log(data, 'getsongcategorieslist RESPONSEdddd');

            if (data?.success) {
                setSongdata(data?.songs);
                setNumberofsong(data?.total_songs)
                // setFavoritescount(data?.favorite_songs_count)
                // setRecordingcount(data?.overall_recordings_count)
            }
        } catch (error) {
            console.log('songlist ERROR:', error);
        } finally {
            setIsLoading(false)
            // dispatch(loaderstate(false));
        }
    };

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

                <View style={styles.header}>

                    <TouchableOpacity
                        onPress={() => {
                            if (previousScreen) {
                                console.log('Navigating back to:', previousScreen);
                                navigation.navigate(previousScreen);
                            } else {
                                navigation.goBack();
                            }
                        }}
                    >

                        {/* <Text style={styles.back}>←</Text> */}
                        <AppImage
                            source={Logo.arrowline}
                            height={25}
                            width={19}
                            resizeMode='cover'
                            tintColor={"#FFFF"}
                        />
                    </TouchableOpacity>

                    <View style={{ flex: 1, marginLeft: 15 }}>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                            <AppImage
                                source={Logo.ymusic}
                                height={28}
                                width={28}
                                tintColor={"#E52450"}
                            />


                            <View>
                                <Text style={styles.title}>
                                    {" "}Songs
                                </Text>

                                <Text style={styles.subtitle}>
                                    {" "}Discover thousands of
                                    <Text style={{ color: '#D4AF37' }}>
                                        {' '}Sudanese songs
                                    </Text>
                                </Text>
                            </View>

                        </View>

                    </View>

                    <TouchableOpacity style={styles.settingBtn}>
                        <AppImage
                            source={Images.playlist}
                            height={16}
                            width={16}
                        />
                    </TouchableOpacity>

                </View>

                {/* SEARCH */}

                {/* CATEGORY */}
                {/* 
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 15 }}>
                    {categories.map(item => {
                        const active = item === selected;

                        return (
                            <TouchableOpacity
                                key={item}
                                onPress={() => setSelected(item)}
                                activeOpacity={0.8}>
                                {active ? (
                                    <LinearGradient
                                        colors={['#FF8A00', '#FF3D5A']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.category}>
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                { color: '#FFF' },
                                            ]}>
                                            {item}
                                        </Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.category, styles.categoryInactive]}>
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                { color: '#DDD' },
                                            ]}>
                                            {item}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                </ScrollView> */}


                <View style={{ marginHorizontal: 15 }}>



                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 10 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <AppText color="#F46E00" fontSize={12} fontFamily={Inter.regular}>
                                {"All Songs"}
                            </AppText>
                            <AppText color="#CDCECB" fontSize={12} fontFamily={Inter.regular}>
                                {" (" + numberofsong + ")"}
                            </AppText>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, }}>
                            <View style={{
                                flexDirection: 'row',
                                borderWidth: 1,
                                borderColor: '#242424',
                                alignItems: 'center',
                                borderRadius: 12,
                                width: 204,
                                gap: 5,
                                paddingHorizontal: 10,

                            }}>
                                <AppImage
                                    source={BottomIcons.search}
                                    height={14}
                                    width={14}
                                    tintColor={"#CDCECB"}
                                />
                                <TextInput
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    placeholder="Search songs, artists..."
                                    placeholderTextColor={"#CDCECB"}
                                    style={{ fontSize: 10, color: '#FFFF', flex: 1 }}
                                />

                            </View>

                            <TouchableOpacity style={{ padding: 10, borderWidth: 1, borderColor: '#303030', borderRadius: 12 }}>
                                <AppImage
                                    source={Logo.gfilter}
                                    height={12}
                                    width={25}
                                />
                            </TouchableOpacity>
                        </View>


                    </View>



                    <Librarylist musicData={filteredSongs} loading={isLoading} />


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

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        marginBottom: 15,
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