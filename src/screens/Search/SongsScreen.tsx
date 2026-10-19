import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,

    StatusBar,
    TouchableOpacity,
    ScrollView,
    FlatList,
    TextInput,
    Image,
    Dimensions,
    ImageBackground,
    GestureResponderEvent,
    ActivityIndicator,
} from 'react-native';
import AppImage from '../../share/components/AppImage';
import { Banner, BottomIcons, Images, Logo } from '../../share/constants/media';
import { Inter } from '../../share/constants/fonts';
import MiniPlayer from '../../share/components/MiniPlayer';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native'
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import { GlobalImage } from '../../share/utils/GlobalImage';
import AppText from '../../share/components/AppText';
import { color } from '../../share/constants/color';
import { SvgUri } from 'react-native-svg';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { loaderstate } from '../../auth/redux/authSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

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

const banners = [
    {
        id: '1',
        title: 'Most played songs\nthis week',
        image:
            Banner.br1banner
    },
    {
        id: '2',
        title: 'Discover new\nartists',
        image:
            Banner.br3banner
    },
    {
        id: '3',
        title: 'Top Sudanese\nHits',
        image:
            Banner.br2banner
    },
];
const trendingSongs = [
    {
        id: '1',
        title: 'Salam Ya Hob',
        artist: 'Mohamed Wardi',
        likes: '15.3K',
        image: 'https://picsum.photos/300/400?1',
    },
    {
        id: '2',
        title: 'Habibi',
        artist: 'Hussein Al Sadiq',
        likes: '13.1K',
        image: 'https://picsum.photos/300/400?2',
    },
    {
        id: '3',
        title: 'Al Leila',
        artist: 'Mustafa Saeed',
        likes: '11.8K',
        image: 'https://picsum.photos/300/400?3',
    },
];

const newReleases = [
    {
        id: '4',
        title: 'Gharam El Banat',
        artist: 'Khalid El Amin',
        likes: '7.9K',
        image: 'https://picsum.photos/300/400?4',
    },
    {
        id: '5',
        title: 'Zaman Gamel',
        artist: 'Ahmed Bashir',
        likes: '6.2K',
        image: 'https://picsum.photos/300/400?5',
    },
    {
        id: '6',
        title: 'Ma Binsak',
        artist: 'Ezz Eldin',
        likes: '5.4K',
        image: 'https://picsum.photos/300/400?6',
    },
    {
        id: '7',
        title: 'Bent Al Sudan',
        artist: 'Rania Ahmed',
        likes: '4.8K',
        image: 'https://picsum.photos/300/400?7',
    },
];
const moods = [
    {
        id: '1',
        emoji: '❤️',
        title: 'Love Songs',
        subtitle: 'Feel the love',
    },
    {
        id: '2',
        emoji: '🥺',
        title: 'Sad Songs',
        subtitle: 'For your feelings',
    },
    {
        id: '3',
        emoji: '🔥',
        title: 'Trending',
        subtitle: 'Hot right now',
    },
    {
        id: '4',
        emoji: '🎉',
        title: 'Party',
        subtitle: 'Get the vibe',
    },
    {
        id: '5',
        emoji: '☀️',
        title: 'Morning',
        subtitle: 'Start your day',
    },
    {
        id: '6',
        emoji: '🌙',
        title: 'Night',
        subtitle: 'Late night vibes',
    },
    {
        id: '7',
        emoji: '🕌',
        title: 'Religious',
        subtitle: 'Spiritual songs',
    },
    {
        id: '8',
        emoji: '🇸🇩',
        title: 'Sudan Classics',
        subtitle: 'Timeless hits',
    },
];

const karaoke = [
    {
        id: '1',
        title: 'Law Kan',
        artist: 'Mohamed Wardi',
        plays: '18.2K performances',
        image: 'https://picsum.photos/200/200?20',
    },
    {
        id: '2',
        title: 'Fi Hagat',
        artist: 'Hussein Al Sadiq',
        plays: '15.1K performances',
        image: 'https://picsum.photos/200/200?21',
    },
    {
        id: '3',
        title: 'Ayesh Maya',
        artist: 'Mustafa Saeed',
        plays: '13.6K performances',
        image: 'https://picsum.photos/200/200?22',
    },
    {
        id: '4',
        title: 'Ya Tayeb',
        artist: 'Jaffer Hassan',
        plays: '12.9K performances',
        image: 'https://picsum.photos/200/200?23',
    },
];

export default function SongsScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [selected, setSelected] = useState('All');
    const [activeBanner, setActiveBanner] = useState(0);
    const [populardatas, setPopulardatas] = useState<any[]>([])
    const [newReleasesdata, setNewreleasesdata] = useState<any[]>([])
    const [moods, setCategories] = useState<any[]>([])
    const [songdata, setSongdata] = useState(null);
    const [loader, setLoader] = useState(false);
    const dispatch = useAppDispatch();

    const trandingdata = async () => {
        console.log("popular api called")
        try {
            dispatch(loaderstate(true));

            const response = await ApiService.get(apiUrls.gettrandingsong);

            const data = (response as any).data;
            console.log(data, 'tranding API RESPONSEdddd');

            if (data?.success) {
                setPopulardatas(data.songs);
            }
        } catch (error) {
            console.log('trandingdata ERROR:', error);
        } finally {
            dispatch(loaderstate(false));
        }
    };

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

    const categorydata = async () => {
        console.log("category api called", apiUrls.categories)
        try {
            //dispatch(loaderstate(true));

            const response = await ApiService.get(apiUrls.categories);

            const data = (response as any)?.data;
            console.log(data?.categories, 'category API RESPONSEdddd');

            if (data?.success) {
                setCategories(data?.categories);
                setSelected('All');
            }
        } catch (error) {
            console.log('Categorydata ERROR:', error);
        } finally {
            //  dispatch(loaderstate(false));
        }
    };



    const getFavorites = async () => {
        try {
            //  setIsLoading(true)
            const response = await ApiService.get(apiUrls.favorites)

            const data = (response as any).data
            console.log(data, "favorate API RESPONSE")

            if (data?.success) {
                console.log(data.songs, "inside API RESPONSE")
                // setFavorites(data.favorites)
                setSongdata(data.songs)
            }

        } catch (error) {
            console.log("favorate ERROR:", error)
        }
        finally {
            // setIsLoading(false)
            // dispatch(loaderstate(false));
        }
    }

    useEffect(() => {
        trandingdata()
        newreleasesdata()
        categorydata()
        getFavorites()
    }, [])
    const categoryList = [
        { id: 'all', title: 'All' },
        ...moods,
    ];
    return (
        <SafeAreaView style={styles.container}>
            {/* <StatusBar
                translucent={false}
                backgroundColor={v.bg}
                barStyle="light-content"
            /> */}
            {/* HEADER */}

            <View style={styles.header}>

                <TouchableOpacity
                    onPress={() => {

                        (navigation as any).navigate('Search')
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
                                {" "}{t('Home.Songs')}
                            </Text>

                            <Text style={styles.subtitle}>
                                {" "}{t('Home.Discoverthousandsof')}
                                <Text style={{ color: '#D4AF37' }}>

                                    {' '}{t('Home.Sudanesesongs')}
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

            <TouchableOpacity
                onPress={() => {
                    (navigation as any).navigate('SearchSongSecreen', { previousScreen: 'SongsScreen' })
                }}
                style={styles.searchBox}>
                <AppImage
                    source={BottomIcons.search}
                    height={16}
                    width={16}
                />
                {/* <Text style={styles.searchIcon}>🔍</Text> */}

                <TextInput
                    placeholder={t('Home.Searchbarplaceholder')}
                    placeholderTextColor="#777"
                    style={styles.input}
                    editable={false}
                />

                <TouchableOpacity>
                    <AppImage
                        source={Images.playlist}
                        height={16}
                        width={16}
                    />
                </TouchableOpacity>

            </TouchableOpacity>
            {loader ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#EFCB61" />
                </View>
            ) : (

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}>



                    {/* CATEGORY */}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 15, gap: 10, marginBottom: 15 }}>
                        {categoryList.map(item => {
                            const active = selected === item.title;

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        setSelected(item.title);


                                        (navigation as any).navigate('SongsListScreen', {
                                            songs: item,
                                            previousScreen: 'SongsScreen',
                                            filter: true
                                        });

                                    }}
                                    activeOpacity={0.8}>
                                    {active ? (
                                        <LinearGradient
                                            colors={['#FF8A00', '#FF3D5A']}
                                            style={styles.category}>
                                            <Text style={[styles.categoryText, { color: '#FFF' }]}>
                                                {item.title}
                                            </Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={[styles.category, styles.categoryInactive]}>
                                            <Text style={[styles.categoryText, { color: '#DDD' }]}>
                                                {item.title}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}

                    </ScrollView>

                    {/* BANNER */}

                    <FlatList
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        data={banners}
                        keyExtractor={item => item.id}
                        onMomentumScrollEnd={e => {
                            const index = Math.round(
                                e.nativeEvent.contentOffset.x / (width - 30),
                            );
                            setActiveBanner(index);
                        }}
                        renderItem={({ item }) => (
                            <View style={styles.banner}>

                                <ImageBackground
                                    source={item.image}
                                    style={styles.bannerImage}

                                >

                                    <View style={styles.overlay} />

                                    <View style={styles.bannerContent}>

                                        <Text style={styles.bannerSmall}>
                                            TODAY'S TOP HITS
                                        </Text>

                                        <Text style={styles.bannerTitle}>
                                            {item.title}
                                        </Text>

                                        <TouchableOpacity style={styles.playBtn}>
                                            <Text style={{ color: '#ffff', fontSize: 12 }}>
                                                ▶ Play All
                                            </Text>
                                        </TouchableOpacity>

                                    </View>
                                </ImageBackground>
                            </View>
                        )}
                    />

                    {/* DOTS */}

                    <View style={styles.dots}>

                        {banners.map((_, index) => (

                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    activeBanner === index && styles.activeDot,
                                ]}
                            />

                        ))}

                    </View>
                    {/* Trending */}

                    <View style={styles.sectionHeader}>

                        <Text style={styles.sectionTitle}>
                            🔥 {t('Search.TrendingNow')}
                        </Text>

                        <TouchableOpacity

                            onPress={() => {
                                (navigation as any).navigate('SongsListScreen', {
                                    songs: populardatas,
                                    previousScreen: 'SongsScreen',
                                });
                            }}
                            activeOpacity={0.4} style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <AppText color={'#FFB300'} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>

                                {t('Library.Viewall')}
                            </AppText>
                            <AppImage
                                source={Images.arrow}
                                width={5}
                                height={8}
                                tintColor={'#FFB300'}

                            />
                        </TouchableOpacity>

                    </View>

                    <FlatList
                        horizontal
                        data={populardatas}
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

                                <AppText style={styles.emptyTitle}>
                                    {t('Search.NoTrendingSongs')}

                                </AppText>

                                <AppText style={styles.emptySubtitle}>

                                    {t('Search.Trendingwilappeasoon')}

                                </AppText>
                            </View>
                        )}
                        contentContainerStyle={{
                            paddingHorizontal: 15,
                        }}
                        renderItem={({ item }) => (
                            <SongCard item={item}
                                width={(width - 45) / 3}
                                onpress={() => (navigation as any).navigate('.', {
                                    id: item.id,
                                })}

                            />

                        )}
                    />

                    {/* New Releases */}

                    <View style={styles.sectionHeader}>

                        <Text style={styles.sectionTitle}>
                            ✨   {t('Home.newreleases')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                (navigation as any).navigate('SongsListScreen', {
                                    songs: newReleasesdata,
                                    previousScreen: 'SongsScreen',
                                });
                            }}
                            activeOpacity={0.4} style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <AppText color={'#FFB300'} fontSize={12} fontWeight="500" fontFamily={Inter.medium}>
                                {t('Library.Viewall')}
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
                            data={newReleasesdata}
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
                                        {t('Library.Viewall')}
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
                    <View style={styles.sectionHeader}>

                        <Text style={styles.sectionTitle}>
                            Browse mood
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                (navigation as any).navigate('Browsemood')
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

                        {/* <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('Browsemood')
                        }}
                    >
                        <Text style={styles.viewAll}>
                            View all
                        </Text>
                    </TouchableOpacity> */}

                    </View>
                    {/* Mood Categories */}

                    <View style={[styles.moodGrid, {
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        gap: 12,
                    }]}>
                        {moods.slice(0, 6).map(item => (
                            <MoodCard
                                key={item.id}
                                item={item}
                                onpress={() => {


                                    (navigation as any).navigate('SongsListScreen', {
                                        songs: item,
                                        previousScreen: 'SongsScreen',
                                        filter: true
                                    })
                                }
                                }
                            />
                        ))}
                    </View>

                    {/* Karaoke */}

                    <View style={styles.sectionHeader}>

                        <Text style={styles.sectionTitle}>
                            🎤 Karaoke Favorites
                        </Text>

                        <TouchableOpacity
                            onPress={() => {
                                (navigation as any).navigate('SongsListScreen', {
                                    songs: songdata,
                                    previousScreen: 'SongsScreen',
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

                    </View>
                    <View style={styles.moodGrid}>
                        {songdata?.slice(0, 4).map(item => (
                            <KaraokeCard
                                key={item.id}
                                item={item}
                                onpress={() => (navigation as any).navigate('.', {
                                    id: item.id,
                                })}
                            />
                        ))}
                    </View>


                </ScrollView>)}
            {/* <MiniPlayer /> */}

        </SafeAreaView>
    );
}


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
                source={GlobalImage(item.cover_image_url)}
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
                        // style={{ height: '100%', width: '100%', flex: 1 }}
                        >
                            <Text style={styles.newReleaseText}>NEW</Text>
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

                    <Text
                        numberOfLines={1}
                        style={styles.songTitle}>
                        {item.title}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={styles.songArtist}>
                        {item.artist}
                    </Text>

                    <Text style={styles.songLike}>
                        ❤️ {item.likes_count}
                    </Text>

                </View>
            </ImageBackground>

        </TouchableOpacity>
    );
};
const MoodCard = ({ item, onpress }: any) => (
    <TouchableOpacity
        onPress={onpress}
        style={styles.moodCard}>


        <View style={{ flexDirection: 'row', alignItems: 'center', }}>

            {/* <Text

                style={[
                    styles.moodTitle,
                    {
                        // letterSpacing: 1,
                        fontSize: 14,

                    },
                ]}
            >
                {item.title.match(/\p{Emoji}/u)?.[0] || '🎵'}
            </Text> */}
            <SvgUri
                uri={item.category_icon}
                width={26}
                height={28}
            />
            {/* <AppImage
                source={{
                    uri: item.category_icon.replace(/\.svg$/i, '.jpeg'),
                }}
                style={{
                    width: 24,
                    height: 24,
                    resizeMode: 'contain',
                }} /> */}
            <View style={{ marginLeft: 5, flex: 1 }}>
                <Text
                    numberOfLines={2}
                    style={[
                        styles.moodTitle,
                        {
                            //  letterSpacing: 1,

                        },
                    ]}
                >
                    {item.title.replace(/\p{Emoji}/gu, '').trim()}
                </Text>

                <Text
                    numberOfLines={1}
                    style={styles.moodSubtitle}>
                    {item.description}
                </Text>
            </View>

        </View>
    </TouchableOpacity>
);
const KaraokeCard = ({ item, onpress }: any) => (
    <TouchableOpacity
        onPress={(onpress)}

        style={styles.karaokeCard}>
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
            }}
        >



            <View style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
            }}>
                <Image
                    source={GlobalImage(item.cover_image_url)}
                    style={{
                        width: '100%',
                        height: 110,
                    }}
                    resizeMode="cover" // or "contain", "stretch", "center"
                />
            </View>

            <TouchableOpacity style={styles.smallPlay}>
                <Text style={{ color: '#fff' }}>▶</Text>
            </TouchableOpacity>

            <View style={{}}>

                <Text style={styles.karaokeTitle}>
                    {item.title}
                </Text>

                <Text style={styles.karaokeArtist}>
                    {item.artist}
                </Text>

                <Text style={styles.karaokeCount}>
                    🎤 {item?.plays_count} performances
                </Text>

            </View>
        </View>

        <Text style={styles.more}>⋮</Text>

    </TouchableOpacity>
);
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
        fontSize: 12,
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
        minWidth: 100,
        height: 25,
        borderRadius: 18,
        //  marginRight: 10,
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
        fontSize: 14,
        fontWeight: '700',
    },

    viewAll: {
        color: '#FFB300',
        fontWeight: '600',
        fontSize: 14,
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
        width: '31%',
        backgroundColor: '#141414',
        borderRadius: 14,
        padding: 8,
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
        gap: 5,
        justifyContent: 'space-between',
        alignItems: 'center',

    },

    karaokeImage: {
        width: 60,
        height: 100,
        borderRadius: 10,
        alignSelf: 'center',
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
        marginTop: 0
    },

    karaokeArtist: {
        color: '#999',
        fontSize: 8,
        marginTop: 4,
    },

    karaokeCount: {
        color: '#FF4D67',
        marginTop: 4,
        fontWeight: '600',
        fontSize: 8,
    },

    more: {
        color: '#888',
        fontSize: 22,
        paddingHorizontal: 5,
        //alignSelf: 'flex-end',
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
    newReleaseTag: {
        position: 'absolute',
        top: 70,
        left: 10,
        backgroundColor: '#FF2D55',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 10,
    },

    newReleaseText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
