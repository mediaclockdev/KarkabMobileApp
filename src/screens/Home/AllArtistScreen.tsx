import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Inter } from '../../share/constants/fonts';
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import SearchBar from '../../share/components/SearchBar';
import { Logo } from '../../share/constants/media';

import ApiService from '../../services/api';
import apiUrls from '../../services/apiUrls';

import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { loaderstate } from '../../auth/redux/authSlice';
import { useAppColors } from '../../share/constants/color';

type FilterType = 'Latest' | 'Popular' | 'A-Z';

interface Artist {
    id: number | string;
    name: string;
    image?: string;
    profile_image?: string;
    avatar?: string;
    artist_image?: string;
    songs_count?: number;
    followers_count?: number;
    total_songs?: number;
    [key: string]: any;
}

const AllArtistScreen = () => {
    const navigation = useNavigation<any>();
    const color = useAppColors();
    const dispatch = useAppDispatch();

    const [artists, setArtists] = useState<Artist[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] =
        useState<FilterType>('Latest');
    const [loading, setLoading] = useState(false);

    const route = useRoute();

    const { previousScreen } = route.params as {
        previousScreen?: string;
    };

    /**
     * ---------------------------------------------------------
     * Fetch Artists
     * ---------------------------------------------------------
     *
     * Latest  -> /api/artists/active?sort=latest
     * Popular -> /api/artists/active?sort=popular
     * A-Z     -> /api/artists/active
     */
    const fetchArtists = useCallback(
        async (filter: FilterType = selectedFilter) => {
            try {
                setLoading(true);
                dispatch(loaderstate(true));

                let url = apiUrls.artists;

                if (filter === 'Latest') {
                    url = apiUrls.artists + '?sort=latest';
                } else if (filter === 'Popular') {
                    url = apiUrls.artists + '?sort=popular';
                }

                console.log('ARTISTS API URL:', url);

                const response = await ApiService.get(url);

                const data = (response as any)?.data;

                console.log('ARTISTS API RESPONSE:', data);

                if (data?.success) {
                    const artistData =
                        data?.artists ||
                        data?.data ||
                        data?.results ||
                        [];

                    setArtists(Array.isArray(artistData) ? artistData : []);
                } else {
                    setArtists([]);
                }
            } catch (error) {
                console.log('ARTISTS API ERROR:', error);
                setArtists([]);
            } finally {
                setLoading(false);
                dispatch(loaderstate(false));
            }
        },
        [dispatch, selectedFilter],
    );

    /**
     * Initial API
     */
    useEffect(() => {
        fetchArtists('Latest');
    }, []);

    /**
     * ---------------------------------------------------------
     * Filter Change
     * ---------------------------------------------------------
     */
    const handleFilterChange = (filter: FilterType) => {
        setSelectedFilter(filter);

        // A-Z uses all active artists API.
        // Latest/Popular use sorted API.
        fetchArtists(filter);
    };

    /**
     * ---------------------------------------------------------
     * Search
     * ---------------------------------------------------------
     *
     * Search is performed locally on the already fetched
     * artist list.
     */
    const filteredArtists = artists.filter(artist => {
        if (!searchText.trim()) {
            return true;
        }

        const search = searchText.trim().toLowerCase();

        return String(artist?.name || '')
            .toLowerCase()
            .includes(search);
    });

    /**
     * A-Z sorting is only done locally because there is
     * no A-Z API mentioned.
     */
    const displayedArtists = [...filteredArtists].sort((a, b) => {
        if (selectedFilter === 'A-Z') {
            return String(a?.name || '').localeCompare(
                String(b?.name || ''),
            );
        }

        return 0;
    });

    /**
     * ---------------------------------------------------------
     * Artist Image
     * ---------------------------------------------------------
     */
    const getArtistImage = (artist: Artist) => {
        return (
            artist?.image ||
            artist?.profile_image ||
            artist?.artist_image ||
            artist?.avatar ||
            null
        );
    };

    /**
     * ---------------------------------------------------------
     * Get Artist Songs
     * ---------------------------------------------------------
     */
    const fetchArtistSongs = async (artistId: number | string) => {
        try {
            console.log(
                'ARTIST SONGS API:',
                apiUrls.artistSongs(artistId),
            );

            const response = await ApiService.get(
                apiUrls.artistSongs(artistId),
            );

            const data = (response as any)?.data;

            console.log('ARTIST SONGS RESPONSE:', data.songs);

            if (data?.success) {
                return (
                    data?.songs ||
                    data?.data ||
                    data?.results ||
                    []
                );
            }

            return [];
        } catch (error) {
            console.log('ARTIST SONGS API ERROR:', error);
            return [];
        }
    };

    /**
     * ---------------------------------------------------------
     * Navigate Artist
     * ---------------------------------------------------------
     */
    const handleArtistPress = async (artist: Artist) => {
        console.log('Selected Artist:', artist);

        const songs = await fetchArtistSongs(artist.id);
        console.log(songs, "kkk")
        navigation.navigate('SongsListScreen', {
            songs,

            previousScreen: 'AllArtistScreen',
        });
    };

    /**
     * ---------------------------------------------------------
     * Play Artist
     * ---------------------------------------------------------
     */
    const handlePlayArtist = async (artist: Artist) => {
        console.log('Play artist:', artist);

        const songs = await fetchArtistSongs(artist.id);

        if (!songs?.length) {
            console.log('No songs found for artist');
            return;
        }

        // Use your existing player logic here.
        //
        // Example:
        //
        // navigation.navigate('MusicPlayer', {
        //   artist,
        //   songs,
        // });
    };

    /**
     * ---------------------------------------------------------
     * Render Filter
     * ---------------------------------------------------------
     */
    const renderFilter = (item: FilterType) => {
        const isSelected = selectedFilter === item;

        return (
            <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                onPress={() => handleFilterChange(item)}
                style={[
                    styles.filterButton,
                    {
                        borderColor: isSelected
                            ? color.mgyellow
                            : color.homebordercolor,
                    },
                ]}>
                {isSelected ? (
                    <LinearGradient
                        colors={['#FF9A01', '#CF7D00', '#A96600']}
                        start={{ x: 0.2, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.filterGradient}>
                        <AppText
                            color="#FFFFFF"
                            fontSize={12}
                            fontWeight="500"
                            fontFamily={Inter.medium}>
                            {item}
                        </AppText>
                    </LinearGradient>
                ) : (
                    <View style={styles.filterInner}>
                        <AppText
                            color={color.darkthemetext}
                            fontSize={12}
                            fontWeight="500"
                            fontFamily={Inter.medium}>
                            {item}
                        </AppText>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    /**
     * ---------------------------------------------------------
     * Artist Card
     * ---------------------------------------------------------
     */
    const renderArtist = ({
        item,
    }: {
        item: Artist;
        index: number;
    }) => {
        const image = getArtistImage(item);

        const songsCount =
            item?.songs_count ??
            item?.total_songs ??
            0;

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleArtistPress(item)}
                style={styles.artistCard}>

                <View style={styles.imageWrapper}>
                    {image ? (
                        <AppImage
                            source={{ uri: image }}
                            width={100}
                            height={100}
                            borderRadius={50}
                            style={{ borderWidth: 1, borderColor: color.homebordercolor, borderRadius: 50 }}
                        />
                    ) : (
                        <View
                            style={[
                                styles.imagePlaceholder,
                                {
                                    backgroundColor:
                                        color.homebordercolor,
                                },
                            ]}>
                            <AppText
                                color={color.darkthemetext}
                                fontSize={30}
                                fontWeight="600"
                                fontFamily={Inter.semibold}>
                                {String(item?.name || 'A')
                                    .charAt(0)
                                    .toUpperCase()}
                            </AppText>
                        </View>
                    )}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleArtistPress(item)}
                        style={styles.playButtonWrapper}>
                        <LinearGradient
                            colors={['#FF9A01', '#CF7D00', '#A96600']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.playButton}>
                            <AppText
                                color="#FFFFFF"
                                fontSize={14}
                                fontWeight="600"
                                fontFamily={Inter.semibold}>
                                ▶
                            </AppText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.artistDetails}>
                    <AppText
                        color={color.darkthemetext}
                        fontSize={14}
                        fontWeight="600"
                        fontFamily={Inter.semibold}
                        numberOfLines={1}
                        textAlign="center">
                        {item?.name || 'Unknown Artist'}
                    </AppText>


                    <AppText
                        color={color.darkthemetext}
                        fontSize={11}
                        fontWeight="400"
                        fontFamily={Inter.regular}
                        opacity={0.6}
                        marginTop={4}
                        textAlign="center">
                        {songsCount}{' '}
                        {songsCount === 1 ? 'Song' : 'Songs'}
                    </AppText>

                </View>
            </TouchableOpacity>
        );
    };

    /**
     * ---------------------------------------------------------
     * Empty State
     * ---------------------------------------------------------
     */
    const renderEmpty = () => {
        if (loading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator
                        size="large"
                        color={color.mgyellow}
                    />
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <AppText
                    color={color.darkthemetext}
                    fontSize={15}
                    fontWeight="500"
                    fontFamily={Inter.medium}>
                    {searchText
                        ? 'No artists found'
                        : 'No artists available'}
                </AppText>

                {searchText ? (
                    <AppText
                        color={color.darkthemetext}
                        fontSize={12}
                        fontWeight="400"
                        fontFamily={Inter.regular}
                        opacity={0.6}
                        marginTop={6}>
                        Try searching with another artist name
                    </AppText>
                ) : null}
            </View>
        );
    };

    const handleBack = () => {
        if (previousScreen) {
            navigation.navigate(previousScreen);
        } else {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor: color.darkbackround,
                },
            ]}
            edges={['top']}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleBack}
                    style={styles.backButton}>
                    <AppImage
                        source={Logo.arrowline}
                        height={25}
                        width={19}
                        resizeMode="cover"
                        tintColor="#FFFF"
                    />
                </TouchableOpacity>

                <AppText
                    color={color.darkthemetext}
                    fontSize={18}
                    fontWeight="600"
                    fontFamily={Inter.semibold}>
                    Artists
                </AppText>

                <View style={styles.headerRight} />
            </View>

            {/* Search */}
            <SearchBar
                value={searchText}
                onChangeText={setSearchText}
                onFilterPress={() => {
                    console.log('Filter pressed');
                }}
                onPress={() => { }}
            />

            {/* Title */}
            <View style={styles.titleContainer}>
                <AppText
                    color={color.darkthemetext}
                    fontSize={14}
                    fontWeight="600"
                    fontFamily={Inter.semibold}>
                    All Artists
                </AppText>

                <AppText
                    color={color.darkthemetext}
                    fontSize={11}
                    fontWeight="400"
                    fontFamily={Inter.regular}
                    opacity={0.6}>
                    {displayedArtists.length}{' '}
                    {displayedArtists.length === 1
                        ? 'Artist'
                        : 'Artists'}
                </AppText>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                {(
                    ['Latest', 'Popular', 'A-Z'] as FilterType[]
                ).map(renderFilter)}
            </View>

            {/* Artists */}
            <FlatList
                data={displayedArtists}
                keyExtractor={(item, index) =>
                    String(item?.id ?? index)
                }
                renderItem={renderArtist}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={[
                    styles.listContent,
                    displayedArtists.length === 0 &&
                    styles.emptyListContent,
                ]}
                ListEmptyComponent={renderEmpty}
                refreshing={loading}
                onRefresh={() => fetchArtists(selectedFilter)}
            />

            <View style={styles.bottomSpace} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },

    header: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerRight: {
        width: 40,
        height: 40,
    },

    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 18,
        marginHorizontal: 5,
        marginBottom: 4,
    },

    filtersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 10,
        marginHorizontal: 5,
    },

    filterButton: {
        borderWidth: 1,
        borderRadius: 29,
        overflow: 'hidden',
    },

    filterGradient: {
        minHeight: 30,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 29,
    },

    filterInner: {
        minHeight: 30,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },

    listContent: {
        paddingHorizontal: 5,
        paddingTop: 8,
        paddingBottom: 30,
    },

    columnWrapper: {
        justifyContent: 'space-between',
    },

    artistCard: {
        width: '48%',
        marginBottom: 22,
        alignItems: 'center',
    },

    imageWrapper: {
        width: 110,
        height: 110,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },

    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    playButtonWrapper: {
        position: 'absolute',
        right: 1,
        bottom: 2,
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
    },

    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    artistDetails: {
        width: '100%',
        marginTop: 9,
        alignItems: 'center',
    },

    emptyListContent: {
        flexGrow: 1,
    },

    emptyContainer: {
        flex: 1,
        minHeight: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },

    bottomSpace: {
        height: 70,
    },
});

export default AllArtistScreen;