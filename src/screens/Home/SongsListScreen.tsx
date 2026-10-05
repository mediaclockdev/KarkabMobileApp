import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,

    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions,
} from 'react-native';

import AppImage from '../../share/components/AppImage';
import { BottomIcons, Images, Logo } from '../../share/constants/media';
import { Inter } from '../../share/constants/fonts';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import AppText from '../../share/components/AppText';
import Librarylist from '../../share/components/Librarylist';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function SongsListScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const {
        songs,
        previousScreen,
        filter = false,
        artist,
    } = route.params as {
        songs?: any;
        previousScreen?: string;
        filter?: boolean;
        artist?: any;
    };

    const [songdata, setSongdata] = useState<any[]>([]);
    const [numberofsong, setNumberofsong] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    /**
     * -----------------------------------------
     * FETCH ARTIST SONGS
     * -----------------------------------------
     */
    const fetchArtistSongs = async (
        artistId: number | string
    ) => {
        setIsLoading(true);

        try {
            console.log(
                'ARTIST SONGS APIjjjj:',
                apiUrls.artistSongs(artistId)
            );

            const response = await ApiService.get(
                apiUrls.artistSongs(artistId)
            );

            const data = (response as any)?.data;

            console.log(
                'ARTIST SONGS RESPONSEhhh:',
                data
            );

            if (data?.success) {
                console.log(data?.songs, "jjjj")
                const songsList = Array.isArray(data?.songs)
                    ? data.songs
                    : [];

                setSongdata(songsList);

                setNumberofsong(
                    data?.total_songs ?? songsList.length
                );
            } else {
                setSongdata([]);
                setNumberofsong(0);
            }
        } catch (error) {
            console.log(
                'ARTIST SONGS API ERROR:',
                error
            );

            setSongdata([]);
            setNumberofsong(0);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * -----------------------------------------
     * FETCH CATEGORY SONGS
     * -----------------------------------------
     */

    useEffect(() => {
        console.log(songs, "filter", songdata);
    }, [songs, songdata]);


    const songlist = async () => {
        setIsLoading(true);

        try {
            console.log(
                'getsongcategorieslist API called'
            );

            if (!songs?.id) {
                setSongdata([]);
                setNumberofsong(0);
                return;
            }

            const response = await ApiService.get(
                apiUrls.getsongcategorieslist(songs.id)
            );

            const data = (response as any)?.data;

            console.log(
                'getsongcategorieslist RESPONSE:',
                data
            );

            if (data?.success) {
                const songsList = Array.isArray(data?.songs)
                    ? data.songs
                    : [];

                setSongdata(songsList);

                setNumberofsong(
                    data?.total_songs ?? songsList.length
                );
            } else {
                setSongdata([]);
                setNumberofsong(0);
            }
        } catch (error) {
            console.log(
                'songlist ERROR:',
                error
            );

            setSongdata([]);
            setNumberofsong(0);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * -----------------------------------------
     * LOAD SONGS WHEN SCREEN FOCUSES
     * -----------------------------------------
     */
    useFocusEffect(
        useCallback(() => {
            let cancelled = false;

            const loadSongs = async () => {

                console.log(
                    'SongsListScreen focused', previousScreen, artist,
                );

                setSearchText('');

                /**
                 * Artist songs
                 */


                if (artist?.id) {
                    await fetchArtistSongs(
                        artist.id
                    );

                    return;
                }

                /**
                 * Browse mood
                 */
                if (
                    previousScreen === 'Browsemood'
                ) {
                    await songlist();

                    return;
                }

                /**
                 * Songs screen + filter
                 */
                if (
                    filter &&
                    previousScreen === 'SongsScreen'
                ) {
                    await songlist();

                    return;
                }

                /**
                 * Songs passed directly
                 * through navigation
                 */
                setIsLoading(true);
                console.log(songs, "songsList")

                const songsList = Array.isArray(songs)
                    ? songs
                    : [];
                console.log(songsList, "songsList")

                if (!cancelled) {
                    setSongdata(songsList);
                    setNumberofsong(
                        songsList.length
                    );
                    setIsLoading(false);
                }
            };

            loadSongs();

            return () => {
                cancelled = true;
            };
        }, [
            artist?.id,
            previousScreen,
            filter,
            songs?.id,
            songs
        ])
    );

    /**
     * -----------------------------------------
     * FILTER + SORT SONGS
     * -----------------------------------------
     */
    /**
  * -----------------------------------------
  * NORMALIZE SEARCH TEXT
  * Supports English + Arabic
  * -----------------------------------------
  */
    const normalizeText = (text: any) => {
        return String(text ?? '')
            .toLowerCase()
            .trim()

            // Arabic character normalization
            .replace(/[إأآ]/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه')
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي')

            // Remove Arabic tashkeel/diacritics
            .replace(/[\u064B-\u065F\u0670]/g, '')

            // Remove tatweel
            .replace(/ـ/g, '');
    };


    /**
     * -----------------------------------------
     * FILTER + SORT SONGS
     * English + Arabic
     * -----------------------------------------
     */
    const filteredSongs = (songdata || [])
        .filter((song: any) => {
            const search = normalizeText(searchText);

            // Show everything when search is empty
            if (!search) {
                return true;
            }

            const title = normalizeText(song?.title);

            const artistName = normalizeText(
                typeof song?.artist === 'object'
                    ? song?.artist?.name
                    : song?.artist
            );

            const category = normalizeText(
                song?.categoryName
            );

            return (
                title.includes(search) ||
                artistName.includes(search) ||
                category.includes(search)
            );
        })
        .sort((a: any, b: any) => {
            const comparison = String(a?.title || '').localeCompare(
                String(b?.title || ''),
                ['ar', 'en'],
                {
                    sensitivity: 'base',
                }
            );

            return sortOrder === 'asc'
                ? comparison
                : -comparison;
        });

    return (
        <SafeAreaView
            style={styles.container}
        >
            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={{
                    paddingBottom: 60,
                }}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            if (previousScreen) {
                                (
                                    navigation as any
                                ).navigate(
                                    previousScreen
                                );
                            } else {
                                navigation.goBack();
                            }
                        }}
                    >
                        <AppImage
                            source={
                                Logo.arrowline
                            }
                            height={25}
                            width={19}
                            resizeMode="cover"
                            tintColor="#FFFF"
                        />
                    </TouchableOpacity>

                    <View
                        style={{
                            flex: 1,
                            marginLeft: 15,
                        }}
                    >
                        <View
                            style={{
                                flexDirection:
                                    'row',
                                alignItems:
                                    'center',
                            }}
                        >
                            <AppImage
                                source={
                                    Logo.ymusic
                                }
                                height={28}
                                width={28}
                                tintColor="#E52450"
                            />

                            <View>
                                <Text
                                    style={
                                        styles.title
                                    }
                                >
                                    {' '}Songs
                                </Text>

                                <Text
                                    style={
                                        styles.subtitle
                                    }
                                >
                                    {' '}Discover
                                    thousands of
                                    <Text
                                        style={{
                                            color:
                                                '#D4AF37',
                                        }}
                                    >
                                        {' '}Sudanese
                                        songs
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={
                            styles.settingBtn
                        }
                    >
                        <AppImage
                            source={
                                Images.playlist
                            }
                            height={16}
                            width={16}
                        />
                    </TouchableOpacity>
                </View>

                {/* CONTENT */}
                <View
                    style={{
                        marginHorizontal: 15,
                    }}
                >
                    {/* SECTION HEADER */}
                    <View
                        style={{
                            flexDirection:
                                'row',
                            alignItems:
                                'center',
                            justifyContent:
                                'space-between',
                            marginBottom: 20,
                            marginTop: 10,
                        }}
                    >
                        <View
                            style={{
                                flexDirection:
                                    'row',
                            }}
                        >
                            <AppText
                                color="#F46E00"
                                fontSize={12}
                                fontFamily={
                                    Inter.regular
                                }
                            >
                                All Songs
                            </AppText>

                            <AppText
                                color="#CDCECB"
                                fontSize={12}
                                fontFamily={
                                    Inter.regular
                                }
                            >
                                {' (' +
                                    numberofsong +
                                    ')'}
                            </AppText>
                        </View>

                        {/* SEARCH */}
                        <View
                            style={{
                                flexDirection:
                                    'row',
                                alignItems:
                                    'center',
                                gap: 10,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection:
                                        'row',
                                    borderWidth: 1,
                                    borderColor:
                                        '#242424',
                                    alignItems:
                                        'center',
                                    borderRadius: 12,
                                    width:
                                        204,
                                    height:
                                        36,
                                    gap: 5,
                                    paddingHorizontal:
                                        10,
                                }}
                            >
                                <AppImage
                                    source={
                                        BottomIcons.search
                                    }
                                    height={14}
                                    width={14}
                                    tintColor="#CDCECB"
                                />

                                <TextInput
                                    value={
                                        searchText
                                    }
                                    onChangeText={
                                        setSearchText
                                    }
                                    placeholder="Search songs, artists..."
                                    placeholderTextColor="#CDCECB"
                                    style={{
                                        fontSize: 10,
                                        color: '#FFFF',
                                        flex: 1,
                                        paddingVertical: 0,
                                    }}
                                />
                            </View>

                            <TouchableOpacity
                                style={{
                                    padding:
                                        10,
                                    borderWidth:
                                        1,
                                    borderColor:
                                        '#303030',
                                    borderRadius:
                                        12,
                                }}
                            >
                                <AppImage
                                    source={
                                        Logo.gfilter
                                    }
                                    height={12}
                                    width={25}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* SONG LIST */}
                    <Librarylist
                        musicData={
                            filteredSongs
                        }
                        loading={
                            isLoading
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:
            COLORS.bg,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        marginBottom: 15,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFF',
        fontFamily: Inter.bold,
    },

    subtitle: {
        color: '#999',
        marginTop: 2,
        fontSize: 12,
        fontFamily:
            Inter.regular,
    },

    settingBtn: {
        height: 32,
        width: 32,
        borderRadius: 21,
        borderWidth: 1,
        borderColor:
            '#FF2D55',
        justifyContent:
            'center',
        alignItems:
            'center',
    },
});