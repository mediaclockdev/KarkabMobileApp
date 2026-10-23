import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import SearchBar from '../../share/components/SearchBar';
import CategoryChip from '../../share/components/CategoryChip';
import ClassicSongItem from '../../share/components/ClassicSongItem';

import color from '../../share/constants/color';
import { Images, Logo } from '../../share/constants/media';
import { Inter } from '../../share/constants/fonts';

import ApiService from '../../services/api';
import apiUrls from '../../services/apiUrls';

interface Playlist {
    id: string;
    name: string;
    songs?: string;
    image?: string;
    description?: string;
}

interface Song {
    id: string;
    title: string;
    artist: string;
    likes?: string;
    duration?: string;
    level?: string;
    image?: string;
}

const defaultPlaylists: Playlist[] = [
    {
        id: '1',
        name: 'Golden Era',
        songs: '86 songs',
        image:
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        description: 'The greatest timeless songs from the golden era.',
    },
    {
        id: '2',
        name: 'Wardi Collection',
        songs: '54 songs',
        image:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
        description: 'A collection of classic Mohamed Wardi songs.',
    },
    {
        id: '3',
        name: 'Nubian Melodies',
        songs: '48 songs',
        image:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        description: 'Beautiful traditional Nubian melodies.',
    },
    {
        id: '4',
        name: 'Traditional Hits',
        songs: '52 songs',
        image:
            'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
        description: 'Traditional Sudanese songs everyone remembers.',
    },
];

export default function PlayListScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [selected, setSelected] = useState('All');
    const [playlists, setPlaylists] =
        useState<Playlist[]>(defaultPlaylists);
    const {

        previousScreen,

    } = route.params as {

        previousScreen?: string;

    };
    const [songs, setSongs] = useState<Song[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);
    const [songsLoading, setSongsLoading] = useState(false);

    /**
     * Get playlist categories
     */
    const getPlaylistCategories = async () => {
        try {
            // Replace this API if your backend has a playlist category API
            // const response = await ApiService.get(apiUrls.playlistcategory);

            // if (response?.data?.success) {
            //     setCategories(response.data.categories || []);
            // }
        } catch (error) {
            console.log('Playlist category error:', error);
        }
    };

    /**
     * Get all playlists
     */
    const getPlaylists = async () => {
        try {
            setLoader(true)
            setLoading(true);
            const response = await ApiService.get(apiUrls.getplaylists);

            console.log('Playlist API response:', response);

            const res = (response as any)?.data;

            if (res?.success) {
                const playlistData = res?.playlists || [];

                setPlaylists(playlistData);

                // Select first API playlist
                if (playlistData.length > 0) {
                    const firstPlaylist = playlistData[0];

                    setSelected(firstPlaylist.id);

                    await getPlaylistSongs(firstPlaylist.id);
                }
            } else {
                setPlaylists([]);
            }
        } catch (error) {
            console.log('Playlist API error:', error);
            setPlaylists([]);
        } finally {
            setLoading(false);
            setLoader(false)
        }
    };

    /**
     * Get songs from selected playlist
     */
    const getPlaylistSongs = async (playlistId: string) => {
        try {
            setSongsLoading(true);
            setSongs([]);

            const response = await ApiService.get(
                apiUrls.getplaylistsongs(playlistId),
            );

            console.log('Playlist songs API response:', response);

            const res = (response as any)?.data;

            if (res?.success) {
                const playlistSongs = res?.playlist.songs || [];

                setSongs(playlistSongs);
            } else {
                setSongs([]);
            }
        } catch (error) {
            console.log('Playlist songs error:', error);
            setSongs([]);
        } finally {
            setSongsLoading(false);
        }
    };

    useEffect(() => {
        getPlaylists();
        getPlaylistCategories();
    }, []);

    const categoryList = [
        {
            id: 'all',
            title: 'All',
        },
        ...categories,
    ];

    const selectedPlaylist =
        playlists.find(
            item =>
                item.name === selected ||
                item.id === selected,
        ) || playlists[0];

    const renderPlaylist = ({ item }: { item: Playlist }) => {
        const isSelected =
            selectedPlaylist?.id === item.id;

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                    setSelected(item.id);
                    getPlaylistSongs(item.id);
                }}
                style={[
                    styles.playlistCard,
                    isSelected && styles.selectedPlaylistCard,
                ]}
            >
                <View style={styles.playlistImageWrapper}>
                    <AppImage
                        source={{
                            uri: item?.cover_image_url,
                        }}
                        width={150}
                        height={150}
                        resizeMode="cover"
                    />

                    <View style={styles.playButton}>
                        <AppImage
                            source={Images.bplay}
                            width={18}
                            height={18}
                            resizeMode="contain"
                            tintColor="#FFFFFF"
                        />
                    </View>
                </View>

                <AppText
                    style={styles.playlistName}
                    numberOfLines={1}
                >
                    {item?.creator_name}
                </AppText>

                <AppText style={styles.playlistSongs}>
                    {item?.song_count || '0 songs'}
                </AppText>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
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
                    style={styles.backButton}
                >
                    <AppImage
                        source={Logo.arrowline}
                        width={20}
                        height={20}
                        tintColor="#FFFFFF"
                    />
                </TouchableOpacity>

                <View style={styles.headerText}>
                    <AppText style={styles.title}>
                        Classic Playlists
                    </AppText>

                    <AppText style={styles.subtitle}>
                        Discover timeless Sudanese collections
                    </AppText>
                </View>

                <TouchableOpacity style={styles.mic}>
                    <AppImage
                        source={Images.mics}
                        width={16}
                        height={18}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            {/* SEARCH */}

            <SearchBar
                onPress={() => {
                    (navigation as any).navigate(
                        'SearchSongSecreen' as never,
                        {
                            previousScreen:
                                'PlayListScreen',
                        } as never,
                    );
                }}
            />

            {loader ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#EFCB61" />
                </View>
            ) : (

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 130,
                    }}
                >


                    {/* CATEGORIES */}

                    {categories.length > 0 && (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={categoryList}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{
                                paddingVertical: 16,
                            }}
                            renderItem={({ item }) => (
                                <CategoryChip
                                    title={item.title}
                                    selected={
                                        selected === item.title
                                    }
                                    onPress={() => {
                                        setSelected(item.title);
                                    }}
                                />
                            )}
                        />
                    )}

                    {/* PLAYLIST SECTION */}

                    <View style={styles.section}>
                        <View>
                            <AppText style={styles.sectionTitle}>
                                🎼 Classic Playlists
                            </AppText>

                            <AppText style={styles.sectionSubtitle}>
                                Explore curated collections
                            </AppText>
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator
                                size="small"
                                color="#F4A000"
                            />
                        </View>
                    ) : playlists.length > 0 ? (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={playlists}
                            keyExtractor={item => item.id}
                            renderItem={renderPlaylist}
                            contentContainerStyle={{
                                paddingBottom: 8,
                            }}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <AppImage
                                source={Images.music}
                                width={32}
                                height={32}
                                resizeMode="contain"
                            />

                            <AppText style={styles.emptyTitle}>
                                No Playlists Found
                            </AppText>

                            <AppText style={styles.emptySubtitle}>
                                There are no playlists available.
                            </AppText>
                        </View>
                    )}

                    {/* SELECTED PLAYLIST */}

                    {selectedPlaylist && (
                        <>
                            <View style={styles.selectedHeader}>
                                <AppImage
                                    source={{
                                        uri: selectedPlaylist?.cover_image_url,
                                    }}
                                    width={82}
                                    height={82}
                                    resizeMode="cover"
                                />

                                <View style={styles.selectedInfo}>
                                    <AppText
                                        style={styles.selectedTitle}
                                        numberOfLines={1}
                                    >
                                        {selectedPlaylist.name}
                                    </AppText>

                                    <AppText
                                        style={styles.selectedDescription}
                                        numberOfLines={2}
                                    >
                                        {selectedPlaylist.description ||
                                            'A beautiful collection of timeless Sudanese music.'}
                                    </AppText>

                                    <AppText style={styles.selectedCount}>
                                        {selectedPlaylist.song_count ||
                                            '0 songs'}
                                    </AppText>
                                </View>

                                {/* <TouchableOpacity
                                    style={styles.mainPlayButton}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        if (songs.length > 0) {
                                            // Play first song
                                            // Add your player dispatch here
                                        }
                                    }}
                                >
                                    <AppImage
                                        source={Images.playicon}
                                        width={20}
                                        height={20}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity> */}
                            </View>

                            {/* SONG HEADER */}

                            <View style={styles.songHeader}>
                                <AppText style={styles.songTitle}>
                                    🎵 Songs
                                </AppText>

                                <TouchableOpacity
                                    onPress={() => {
                                        (navigation as any).navigate('SongsListScreen', {
                                            songs: songs,
                                            previousScreen: 'PlayListScreen',
                                        });
                                    }}
                                >
                                    <AppText style={styles.view}>
                                        Play All
                                    </AppText>
                                </TouchableOpacity>
                            </View>

                            {/* SONGS */}

                            {songsLoading ? (
                                <View style={styles.loaderContainer}>
                                    <ActivityIndicator
                                        size="small"
                                        color="#F4A000"
                                    />
                                </View>
                            ) : songs.length > 0 ? (
                                songs.map((item, idx) => (
                                    <ClassicSongItem
                                        key={item.id}
                                        item={item}
                                        songList={songs}
                                        index={idx}
                                    />
                                ))
                            ) : (
                                <View
                                    style={
                                        styles.emptySongsContainer
                                    }
                                >
                                    <AppImage
                                        source={Images.music}
                                        width={28}
                                        height={28}
                                        resizeMode="contain"
                                    />

                                    <AppText
                                        style={styles.emptyTitle}
                                    >
                                        No Songs Found
                                    </AppText>

                                    <AppText
                                        style={
                                            styles.emptySubtitle
                                        }
                                    >
                                        This playlist doesn't have
                                        any songs yet.
                                    </AppText>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.darkbackround,
        paddingHorizontal: 16,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 14,
    },

    backButton: {
        width: 30,
        height: 35,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    headerText: {
        flex: 1,
        marginHorizontal: 12,
    },

    title: {
        color: color.darkthemetext,
        fontSize: 22,
        fontFamily: Inter.bold,
    },

    subtitle: {
        color: '#D5A83F',
        fontSize: 12,
        marginTop: 2,
        fontFamily: Inter.regular,
    },

    mic: {
        width: 32,
        height: 32,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#F4A000',
        justifyContent: 'center',
        alignItems: 'center',
    },

    section: {
        marginTop: 18,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: Inter.semiBold,
    },

    sectionSubtitle: {
        color: '#858585',
        fontSize: 11,
        fontFamily: Inter.regular,
        marginTop: 4,
    },

    playlistCard: {
        width: 150,
        marginRight: 14,
    },

    selectedPlaylistCard: {
        opacity: 1,
    },

    playlistImageWrapper: {
        width: 150,
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#202020',
    },

    playButton: {
        position: 'absolute',
        right: 9,
        bottom: 9,
        width: 36,
        height: 36,
        borderRadius: 20,
        backgroundColor: '#F4A000',
        justifyContent: 'center',
        alignItems: 'center',
    },

    playlistName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: Inter.semiBold,
        marginTop: 10,
    },

    playlistSongs: {
        color: '#858585',
        fontSize: 11,
        fontFamily: Inter.regular,
        marginTop: 4,
    },

    selectedHeader: {
        marginTop: 25,
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#171717',
        flexDirection: 'row',
        alignItems: 'center',
    },

    selectedInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },

    selectedTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Inter.bold,
    },

    selectedDescription: {
        color: '#969696',
        fontSize: 11,
        lineHeight: 16,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    selectedCount: {
        color: '#D5A83F',
        fontSize: 11,
        marginTop: 5,
        fontFamily: Inter.medium,
    },

    mainPlayButton: {
        width: 42,
        height: 42,
        borderRadius: 22,
        backgroundColor: '#F4A000',
        justifyContent: 'center',
        alignItems: 'center',
    },

    songHeader: {
        marginTop: 25,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    songTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: Inter.semiBold,
    },

    view: {
        color: '#F4A000',
        fontSize: 12,
        fontFamily: Inter.medium,
    },

    loaderContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 45,
    },

    emptySongsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },

    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: Inter.bold,
        marginTop: 12,
    },

    emptySubtitle: {
        color: '#858585',
        fontSize: 12,
        fontFamily: Inter.regular,
        marginTop: 7,
        textAlign: 'center',
    },
});