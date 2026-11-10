import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import AppImage from '../share/components/AppImage';
import { BottomIcons, Images, Logo } from '../share/constants/media';
import { Inter } from '../share/constants/fonts';
import MiniPlayer from '../share/components/MiniPlayer';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import apiUrls from '../services/apiUrls';
import ApiService from '../services/api';
import AppText from '../share/components/AppText';
import Librarylist from '../share/components/Librarylist';
import ArtistListItem from '../share/components/ArtistListItem';
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

type TabType = 'all' | 'song' | 'artist' | 'collection' | 'category';

interface TabItem {
    key: TabType;
    label: string;
}

const TABS: TabItem[] = [
    { key: 'all', label: 'All' },
    { key: 'song', label: 'Songs' },
    { key: 'artist', label: 'Artists' },
    { key: 'collection', label: 'Collections' },
    { key: 'category', label: 'Categories' },
];

export default function SearchSongSecreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();

    const { previousScreen } = (route.params as {
        previousScreen?: string;
    }) || {};

    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Pagination states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [songsLoading, setSongsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<{
        songs: any[];
        artists: any[];
        collections: any[];
        categories: any[];
        total: number;
    }>({
        songs: [],
        artists: [],
        collections: [],
        categories: [],
        total: 0,
    });

    const deduplicate = (items: any[]) => {
        const seen = new Set();
        return items.filter(item => {
            const id = item?.id !== undefined ? String(item.id) : null;
            if (!id) return true;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    };

    const performSearch = async (
        query: string,
        type: TabType,
        pageNumber = 1,
        isLoadMore = false
    ) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const trimmed = query.trim();
            const separator = apiUrls.searchapi.includes('?') ? '&' : '?';
            const queryParam = trimmed
                ? `&query=${encodeURIComponent(trimmed)}`
                : '';
            const url = `${apiUrls.searchapi}${separator}type=${type}${queryParam}&page=${pageNumber}&limit=20`;

            const response: any = await ApiService.get(url);
            const data = response?.data;

            if (data?.success) {
                if (type === 'all') {
                    const songs = data.songs || data.data?.songs || [];
                    const artists = data.artists || data.data?.artists || [];
                    const playlists =
                        data.collection?.playlists ||
                        data.data?.collection?.playlists ||
                        data.playlists ||
                        [];
                    const categories =
                        data.categories || data.data?.categories || [];
                    const total =
                        data.counts?.total ??
                        songs?.length +
                        artists?.length +
                        playlists?.length +
                        categories?.length;

                    setSearchResults(prev => ({
                        songs: isLoadMore
                            ? deduplicate([...prev.songs, ...songs])
                            : songs,
                        artists: isLoadMore
                            ? deduplicate([...prev.artists, ...artists])
                            : artists,
                        collections: isLoadMore
                            ? deduplicate([...prev.collections, ...playlists])
                            : playlists,
                        categories: isLoadMore
                            ? deduplicate([...prev.categories, ...categories])
                            : categories,
                        total,
                    }));

                    setHasMore(
                        songs.length >= 20 ||
                        artists.length >= 20 ||
                        playlists.length >= 20 ||
                        categories.length >= 20
                    );
                } else if (type === 'song') {
                    const songs = data.songs || [];
                    setSearchResults(prev => ({
                        ...prev,
                        songs: isLoadMore
                            ? deduplicate([...prev.songs, ...songs])
                            : songs,
                        total: data.total ?? data.total_songs ?? songs?.length,
                    }));
                    setHasMore(songs.length >= 20);
                } else if (type === 'artist') {
                    const artists = data.artists || [];
                    setSearchResults(prev => ({
                        ...prev,
                        artists: isLoadMore
                            ? deduplicate([...prev.artists, ...artists])
                            : artists,
                        total:
                            data.total ??
                            data.total_artists ??
                            artists?.length,
                    }));
                    setHasMore(artists.length >= 20);
                } else if (type === 'collection') {
                    const playlists =
                        data.collection?.playlists || data.playlists || [];
                    setSearchResults(prev => ({
                        ...prev,
                        collections: isLoadMore
                            ? deduplicate([...prev.collections, ...playlists])
                            : playlists,
                        total: data.total ?? playlists?.length,
                    }));
                    setHasMore(playlists.length >= 20);
                } else if (type === 'category') {
                    const categories = data.categories || [];
                    setSearchResults(prev => ({
                        ...prev,
                        categories: isLoadMore
                            ? deduplicate([...prev.categories, ...categories])
                            : categories,
                        total:
                            data.total ??
                            data.total_categories ??
                            categories?.length,
                    }));
                    setHasMore(categories.length >= 20);
                }

                setPage(pageNumber);
            } else {
                if (!isLoadMore) {
                    setSearchResults({
                        songs: [],
                        artists: [],
                        collections: [],
                        categories: [],
                        total: 0,
                    });
                }
                setHasMore(false);
            }
        } catch (error) {
            console.log('SEARCH API ERROR:', error);
            if (!isLoadMore) {
                setSearchResults({
                    songs: [],
                    artists: [],
                    collections: [],
                    categories: [],
                    total: 0,
                });
            }
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setIsLoading(true);
        const delay = searchText.trim()?.length > 0 ? 400 : 0;
        const timer = setTimeout(() => {
            performSearch(searchText, activeTab, 1, false);
        }, delay);

        return () => clearTimeout(timer);
    }, [searchText, activeTab]);

    const handleClear = () => {
        setSearchText('');
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setPage(1);
        setHasMore(true);
        performSearch(searchText, activeTab, 1, false);
    };

    const handleLoadMore = () => {
        if (!isLoading && !loadingMore && hasMore) {
            performSearch(searchText, activeTab, page + 1, true);
        }
    };

    const isCloseToBottom = ({
        layoutMeasurement,
        contentOffset,
        contentSize,
    }: any) => {
        const paddingToBottom = 150;
        return (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        );
    };

    const navigateToArtist = (artistItem: any) => {
        navigation.navigate('SongsListScreen', {
            artist: artistItem,
            previousScreen: 'SearchSongSecreen',
        });
    };


    const getPlaylistSongs = async (playlistId: string) => {
        try {
            setSongsLoading(true);


            const response = await ApiService.get(
                apiUrls.getplaylistsongs(playlistId),
            );

            console.log('Playlist songs API response:', response);

            const res = (response as any)?.data;

            if (res?.success) {
                const playlistSongs = res?.playlist.songs || [];

                // setSongs(playlistSongs);
            } else {
                // setSongs([]);
            }
        } catch (error) {
            console.log('Playlist songs error:', error);
            // setSongs([]);
        } finally {
            setSongsLoading(false);
        }
    };


    const navigateToPlaylist = (playlistItem: any) => {
        console.log(playlistItem, "fjbjfbjfbjbfrej")
        getPlaylistSongs(playlistItem.id)
        navigation.navigate('SongsListScreen', {
            songs: playlistItem,
            feature: 'playlist',
            previousScreen: 'SearchSongSecreen',
        });
    };

    const navigateToCategory = (categoryItem: any) => {
        console.log(categoryItem, "fjbjfbjfbjbfrej")
        navigation.navigate('SongsListScreen', {
            songs: categoryItem,
            feature: 'category',
            categoryTitle: categoryItem.name || categoryItem.title,
            previousScreen: 'SearchSongSecreen',
        });
    };

    const hasAnyResults =
        searchResults.songs?.length > 0 ||
        searchResults.artists?.length > 0 ||
        searchResults.collections?.length > 0 ||
        searchResults.categories?.length > 0;

    const renderCollectionsList = (items: any[]) => {
        return items.map((item: any) => (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => navigateToPlaylist(item)}
                style={styles.collectionCard}
            >
                <AppImage
                    source={
                        item?.cover_image_url
                            ? { uri: item.cover_image_url }
                            : Images.songplay
                    }
                    style={{
                        width: item?.cover_image_url ? 52 : 32,
                        height: item?.cover_image_url ? 52 : 32,
                        borderRadius: 8,
                        backgroundColor: '#222',
                    }}
                    resizeMode="contain"
                />
                <View style={styles.collectionInfo}>
                    <AppText style={styles.collectionTitle} numberOfLines={1}>
                        {item.name || item.title}
                    </AppText>
                    {item.description ? (
                        <AppText
                            style={styles.collectionDescription}
                            numberOfLines={1}
                        >
                            {item.description}
                        </AppText>
                    ) : null}
                    <AppText style={styles.collectionSubtitle}>
                        {item.song_count || item.songs_count || 0} songs
                    </AppText>
                </View>
                <AppImage
                    source={Images.arrow}
                    height={10}
                    width={6}
                    tintColor="#F6A202"
                />
            </TouchableOpacity>
        ));
    };

    const renderCategoriesList = (items: any[]) => {
        return items.map((item: any) => (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => navigateToCategory(item)}
                style={styles.categoryCardItem}
            >
                <AppImage
                    source={
                        item?.category_image
                            ? { uri: item.category_image }
                            : Images.gener
                    }
                    style={styles.categoryCardImage}
                    resizeMode="cover"
                />
                <View style={styles.categoryCardContent}>
                    <AppText style={styles.categoryCardTitle} numberOfLines={1}>
                        {item.name || item.title}
                    </AppText>
                    <AppText style={styles.categoryCardSubtitle}>
                        {item.songs_count
                            ? `${item.songs_count} songs`
                            : '0 song'}
                    </AppText>
                </View>
                <AppImage
                    source={Images.arrow}
                    height={10}
                    width={6}
                    tintColor="#F6A202"
                />
            </TouchableOpacity>
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 130 }}
                keyboardShouldPersistTaps="handled"
                onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {
                        handleLoadMore();
                    }
                }}
                scrollEventThrottle={300}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            if (previousScreen) {
                                navigation.navigate(previousScreen);
                            } else {
                                navigation.goBack();
                            }
                        }}
                        style={styles.backButton}
                    >
                        <AppImage
                            source={Logo.arrowline}
                            height={25}
                            width={19}
                            tintColor="#FFF"
                        />
                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <AppImage
                            source={Logo.mainlogo}
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
                            color="#FF741D"
                            style={{ marginTop: 2 }}
                        >
                            Find your favorite songs & artists
                        </AppText>
                    </View>
                </View>

                {/* SEARCH INPUT */}
                <View style={styles.searchSection}>
                    <View style={styles.searchBarContainer}>
                        <AppImage
                            source={BottomIcons.search}
                            height={16}
                            width={16}
                            tintColor="#CDCECB"
                        />

                        <TextInput
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Search songs, artists, collections..."
                            placeholderTextColor="#7C7C82"
                            returnKeyType="search"
                            onSubmitEditing={() =>
                                performSearch(searchText, activeTab, 1, false)
                            }
                            style={styles.searchInput}
                        />

                        {searchText?.length > 0 && (
                            <TouchableOpacity
                                onPress={handleClear}
                                hitSlop={{
                                    top: 10,
                                    bottom: 10,
                                    left: 10,
                                    right: 10,
                                }}
                                style={styles.clearBtn}
                            >
                                <View style={styles.clearCircle}>
                                    <AppText style={styles.clearText}>
                                        ✕
                                    </AppText>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* FILTER TABS */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContainer}
                    >
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.key;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    activeOpacity={0.8}
                                    onPress={() => setActiveTab(tab.key)}
                                    style={[
                                        styles.tabPill,
                                        !isActive && styles.tabPillInactive,
                                    ]}
                                >
                                    {isActive && (
                                        <LinearGradient
                                            colors={[
                                                '#FF6A00',
                                                '#EE0979',
                                                '#9B51E0',
                                            ]}
                                            start={{ x: 0, y: 0.5 }}
                                            end={{ x: 1, y: 0.5 }}
                                            style={StyleSheet.absoluteFill}
                                        />
                                    )}
                                    <AppText
                                        style={
                                            isActive
                                                ? styles.tabTextActive
                                                : styles.tabTextInactive
                                        }
                                        numberOfLines={1}
                                    >
                                        {tab.label}
                                    </AppText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* CONTENT STATES */}
                    {isLoading && !isRefreshing ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator
                                size="small"
                                color={COLORS.primary}
                            />
                            <AppText
                                color="#888"
                                fontSize={13}
                                style={{ marginTop: 10 }}
                            >
                                {searchText.trim()?.length > 0
                                    ? 'Searching...'
                                    : 'Loading...'}
                            </AppText>
                        </View>
                    ) : !hasAnyResults ? (
                        <View style={styles.emptyPromptContainer}>
                            <AppImage
                                source={BottomIcons.search}
                                height={50}
                                width={50}
                                tintColor="#444"
                            />
                            <AppText
                                color="#FFF"
                                fontSize={16}
                                fontFamily={Inter.medium}
                                style={{ marginTop: 16 }}
                            >
                                {searchText.trim()?.length > 0
                                    ? 'No results found'
                                    : 'No items found'}
                            </AppText>
                            <AppText
                                color="#888"
                                fontSize={12}
                                style={{ marginTop: 6 }}
                            >
                                {searchText.trim()?.length > 0
                                    ? `No matches for "${searchText.trim()}"`
                                    : 'There are no items to display right now.'}
                            </AppText>
                        </View>
                    ) : (
                        <View style={styles.resultsContainer}>
                            {/* ALL TAB: SECTIONS */}
                            {activeTab === 'all' && (
                                <>
                                    {/* ARTISTS SECTION */}
                                    {searchResults.artists?.length > 0 && (
                                        <View style={styles.sectionBlock}>
                                            <View style={styles.sectionHeader}>
                                                <AppText
                                                    style={styles.sectionTitle}
                                                >
                                                    Artists
                                                </AppText>
                                                {searchResults.artists?.length >
                                                    3 && (
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                setActiveTab(
                                                                    'artist'
                                                                )
                                                            }
                                                        >
                                                            <AppText
                                                                style={
                                                                    styles.seeAllText
                                                                }
                                                            >
                                                                See all
                                                            </AppText>
                                                        </TouchableOpacity>
                                                    )}
                                            </View>
                                            {searchResults.artists
                                                .slice(0, 5)
                                                .map((item: any) => (
                                                    <ArtistListItem
                                                        key={item.id}
                                                        item={item}
                                                        onPress={() =>
                                                            navigateToArtist(
                                                                item
                                                            )
                                                        }
                                                    />
                                                ))}
                                        </View>
                                    )}

                                    {/* SONGS SECTION */}
                                    {searchResults.songs?.length > 0 && (
                                        <View style={styles.sectionBlock}>
                                            <View style={styles.sectionHeader}>
                                                <AppText
                                                    style={styles.sectionTitle}
                                                >
                                                    Songs
                                                </AppText>
                                                {searchResults.songs?.length >
                                                    5 && (
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                setActiveTab('song')
                                                            }
                                                        >
                                                            <AppText
                                                                style={
                                                                    styles.seeAllText
                                                                }
                                                            >
                                                                See all
                                                            </AppText>
                                                        </TouchableOpacity>
                                                    )}
                                            </View>
                                            <Librarylist
                                                musicData={searchResults.songs}
                                                loading={false}
                                                scrollEnabled={false}
                                            />
                                        </View>
                                    )}

                                    {/* COLLECTIONS SECTION */}
                                    {searchResults.collections?.length > 0 && (
                                        <View style={styles.sectionBlock}>
                                            <View style={styles.sectionHeader}>
                                                <AppText
                                                    style={styles.sectionTitle}
                                                >
                                                    Collections
                                                </AppText>
                                                {searchResults.collections
                                                    ?.length > 3 && (
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                setActiveTab(
                                                                    'collection'
                                                                )
                                                            }
                                                        >
                                                            <AppText
                                                                style={
                                                                    styles.seeAllText
                                                                }
                                                            >
                                                                See all
                                                            </AppText>
                                                        </TouchableOpacity>
                                                    )}
                                            </View>
                                            {renderCollectionsList(
                                                searchResults.collections.slice(
                                                    0,
                                                    4
                                                )
                                            )}
                                        </View>
                                    )}

                                    {/* CATEGORIES SECTION */}
                                    {searchResults.categories?.length > 0 && (
                                        <View style={styles.sectionBlock}>
                                            <View style={styles.sectionHeader}>
                                                <AppText
                                                    style={styles.sectionTitle}
                                                >
                                                    Categories
                                                </AppText>
                                                {searchResults.categories
                                                    ?.length > 3 && (
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                setActiveTab(
                                                                    'category'
                                                                )
                                                            }
                                                        >
                                                            <AppText
                                                                style={
                                                                    styles.seeAllText
                                                                }
                                                            >
                                                                See all
                                                            </AppText>
                                                        </TouchableOpacity>
                                                    )}
                                            </View>
                                            {renderCategoriesList(
                                                searchResults.categories.slice(
                                                    0,
                                                    4
                                                )
                                            )}
                                        </View>
                                    )}
                                </>
                            )}

                            {/* SONGS TAB */}
                            {activeTab === 'song' && (
                                <View style={styles.sectionBlock}>
                                    <View style={styles.sectionHeader}>
                                        <AppText style={styles.sectionTitle}>
                                            {searchText.trim()?.length > 0
                                                ? `Songs (${searchResults.songs?.length})`
                                                : `All Songs (${searchResults.songs?.length})`}
                                        </AppText>
                                    </View>
                                    <Librarylist
                                        musicData={searchResults.songs}
                                        loading={false}
                                        scrollEnabled={false}
                                    />
                                </View>
                            )}

                            {/* ARTISTS TAB */}
                            {activeTab === 'artist' && (
                                <View style={styles.sectionBlock}>
                                    <View style={styles.sectionHeader}>
                                        <AppText style={styles.sectionTitle}>
                                            {searchText.trim()?.length > 0
                                                ? `Artists (${searchResults.artists?.length})`
                                                : `All Artists (${searchResults.artists?.length})`}
                                        </AppText>
                                    </View>
                                    {searchResults.artists.map((item: any) => (
                                        <ArtistListItem
                                            key={item.id}
                                            item={item}
                                            onPress={() =>
                                                navigateToArtist(item)
                                            }
                                        />
                                    ))}
                                </View>
                            )}

                            {/* COLLECTIONS TAB */}
                            {activeTab === 'collection' && (
                                <View style={styles.sectionBlock}>
                                    <View style={styles.sectionHeader}>
                                        <AppText style={styles.sectionTitle}>
                                            {searchText.trim()?.length > 0
                                                ? `Collections (${searchResults.collections?.length})`
                                                : `All Collections (${searchResults.collections?.length})`}
                                        </AppText>
                                    </View>
                                    {renderCollectionsList(
                                        searchResults.collections
                                    )}
                                </View>
                            )}

                            {/* CATEGORIES TAB */}
                            {activeTab === 'category' && (
                                <View style={styles.sectionBlock}>
                                    <View style={styles.sectionHeader}>
                                        <AppText style={styles.sectionTitle}>
                                            {searchText.trim()?.length > 0
                                                ? `Categories (${searchResults.categories?.length})`
                                                : `All Categories (${searchResults.categories?.length})`}
                                        </AppText>
                                    </View>
                                    {renderCategoriesList(
                                        searchResults.categories
                                    )}
                                </View>
                            )}

                            {/* PAGINATION LOADING MORE INDICATOR */}
                            {loadingMore && (
                                <View style={styles.footerLoader}>
                                    <ActivityIndicator
                                        size="small"
                                        color={COLORS.primary}
                                    />
                                    <AppText
                                        color="#888"
                                        fontSize={12}
                                        style={{ marginTop: 6 }}
                                    >
                                        Loading more...
                                    </AppText>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <MiniPlayer />
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
        paddingHorizontal: 15,
        paddingTop: 10,
        alignItems: 'flex-start',
    },
    backButton: {
        paddingTop: 6,
        paddingRight: 10,
    },
    logoContainer: {
        justifyContent: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    searchSection: {
        marginHorizontal: 15,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#26262E',
        backgroundColor: '#16161B',
        borderRadius: 24,
        paddingHorizontal: 14,
        height: 48,
        marginBottom: 14,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#FFF',
        marginLeft: 10,
        paddingVertical: 0,
        textAlign: 'left',
    },
    clearBtn: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#2E2E36',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearText: {
        color: '#CDCECB',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 13,
    },
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 8,
        marginBottom: 16,
    },
    tabPill: {
        height: 38,
        paddingHorizontal: 18,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    tabPillInactive: {
        backgroundColor: '#18181D',
        borderWidth: 1,
        borderColor: '#26262E',
    },
    tabTextActive: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: Inter.bold,
        textAlign: 'center',
    },
    tabTextInactive: {
        color: '#8E8E93',
        fontSize: 13,
        fontFamily: Inter.medium,
        textAlign: 'center',
    },
    emptyPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 70,
    },
    loaderContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    resultsContainer: {
        marginTop: 4,
    },
    sectionBlock: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 6,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: Inter.bold,
    },
    seeAllText: {
        color: '#FFB300',
        fontSize: 12,
        fontFamily: Inter.medium,
    },
    collectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121215',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#24242A',
    },
    collectionImage: {
        width: 52,
        height: 52,
        borderRadius: 8,
        backgroundColor: '#222',
    },
    collectionInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    collectionTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: Inter.medium,
    },
    collectionDescription: {
        color: '#777',
        fontSize: 11,
        fontFamily: Inter.regular,
        marginTop: 2,
    },
    collectionSubtitle: {
        color: '#FF6A00',
        fontSize: 11,
        fontFamily: Inter.regular,
        marginTop: 3,
    },
    categoryCardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121215',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#24242A',
    },
    categoryCardImage: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#222',
    },
    categoryCardContent: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    categoryCardTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: Inter.medium,
    },
    categoryCardSubtitle: {
        color: '#8A8A8E',
        fontSize: 11,
        marginTop: 2,
    },
    footerLoader: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
