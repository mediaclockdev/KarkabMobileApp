import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

import ApiService from '../../services/api';
import AppImage from '../../share/components/AppImage';
import AppText from '../../share/components/AppText';
import { Images } from '../../share/constants/media';
import color, { useAppColors } from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import apiUrls from '../../services/apiUrls';
import { addsong, isPausesd, openSongAction, showToast } from '../../auth/redux/authSlice';
import { useAppDispatch, useAppSelector } from '../../share/hooks/useAppSelector';
import TrackPlayer from '@rntp/player';
import { playSongList, playTrackSong } from '../../services/player'

type PlaylistSong = {
    id: string;
    title: string;
    artist: string;
    image: any;
    duration: string;
};

type AvailableSong = {
    id: string;
    title: string;
    artist: string;
    image: any;
    duration: string;
};

const PlaylistDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const colors = useAppColors();
    const dispatch = useAppDispatch();

    const {
        playlistId,
        playlistName,
    } = route.params || {};

    const [songs, setSongs] = useState<PlaylistSong[]>([]);
    const [availableSongs, setAvailableSongs] = useState<AvailableSong[]>([]);

    const [loading, setLoading] = useState(true);
    const [songsLoading, setSongsLoading] = useState(false);
    const [addingSongs, setAddingSongs] = useState(false);

    const [addSongsVisible, setAddSongsVisible] = useState(false);
    const [songSearch, setSongSearch] = useState('');
    const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [loadings, setLoadings] = useState(false);
    const isPaused = useAppSelector((state: any) => state.auth.isPaused);
    const recordingRefresh = useAppSelector(
        state => state.auth.recordingRefresh
    );
    /**
     * ==========================================
     * GET PLAYLIST DETAILS / SONGS
     * ==========================================
     */
    const getPlaylistDetails = useCallback(async () => {
        if (!playlistId) return;

        try {
            setLoading(true);

            /*
             * Replace with your actual GET playlist-detail API.
             *
             * Example:
             * apiUrls.playlistDetail(playlistId)
             */

            const response = await ApiService.get(
                apiUrls.playlistDetail(playlistId),
            );

            const data = response?.data;
            console.log(data, "ebehdhevhdvdh")
            if (data?.success) {
                const playlistData = data?.playlist;

                const playlistSongs =
                    playlistData?.songs ||
                    playlistData?.playlist_songs ||
                    [];

                const formattedSongs: PlaylistSong[] =
                    playlistSongs.map((item: any) => ({
                        id: String(item.id || item.song_id),
                        title:
                            item.title ||
                            item.song_name ||
                            item.name ||
                            'Unknown Song',
                        artist:
                            item.artist?.name ||
                            item.artist_name ||
                            item.artist ||
                            'Unknown Artist',
                        image: item.cover_image_url
                            ? { uri: item.cover_image_url }
                            : item.image
                                ? { uri: item.image }
                                : Images.profile,
                        duration: item.duration || '0:00',
                    }));

                setSongs(formattedSongs);
            } else {
                setSongs([]);
            }
        } catch (error: any) {
            console.log(
                'GET PLAYLIST DETAILS ERROR:',
                error?.response?.data || error,
            );

            dispatch(
                showToast({
                    visible: true,
                    message:
                        error?.response?.data?.message ||
                        'Unable to load playlist.',
                    type: 'error',
                }),
            );
        } finally {
            setLoading(false);
        }
    }, [playlistId, dispatch, recordingRefresh]);

    /**
     * ==========================================
     * GET SONGS FOR ADD SONG MODAL
     * ==========================================
     */
    const getAvailableSongs = useCallback(async () => {
        try {
            setSongsLoading(true);

            /*
             * Replace with your existing songs API.
             *
             * Example:
             * apiUrls.songs
             */

            const response = await ApiService.get(
                apiUrls.allsongs,
            );

            const data = response?.data;

            if (data?.success) {
                const apiSongs =
                    data?.data ||
                    data?.songs ||
                    [];

                const formattedSongs: AvailableSong[] =
                    apiSongs.map((item: any) => ({
                        id: String(item.id),
                        title:
                            item.title ||
                            item.song_name ||
                            item.name ||
                            'Unknown Song',
                        artist:
                            item.artist?.name ||
                            item.artist_name ||
                            item.artist ||
                            'Unknown Artist',
                        image: item.cover_image_url
                            ? { uri: item.cover_image_url }
                            : item.image
                                ? { uri: item.image }
                                : Images.profile,
                        duration: item.duration || '0:00',
                    }));

                setAvailableSongs(formattedSongs);
            }
        } catch (error: any) {
            console.log(
                'GET AVAILABLE SONGS ERROR:',
                error?.response?.data || error,
            );
        } finally {
            setSongsLoading(false);
        }
    }, []);

    useEffect(() => {
        getPlaylistDetails();
    }, [getPlaylistDetails]);

    /**
     * ==========================================
     * OPEN ADD SONGS
     * ==========================================
     */


    const openAddSongs = () => {
        setSongSearch('');
        setSelectedSongs([]);
        setAddSongsVisible(true);

        getAvailableSongs();
    };

    /**
     * ==========================================
     * SEARCH SONGS
     * ==========================================
     */
    const filteredSongs = useMemo(() => {
        const query = songSearch.trim().toLowerCase();

        if (!query) {
            return availableSongs;
        }

        return availableSongs.filter(song =>
            `${song.title} ${song.artist}`
                .toLowerCase()
                .includes(query),
        );
    }, [availableSongs, songSearch]);

    /**
     * ==========================================
     * SELECT / UNSELECT SONG
     * ==========================================
     */


    const toggleSong = (songId: string) => {
        setSelectedSongs(prev => {
            if (prev.includes(songId)) {
                return prev.filter(id => id !== songId);
            }

            return [...prev, songId];
        });
    };

    /**
     * ==========================================
     * ADD SONGS TO PLAYLIST
     * ==========================================
     */
    const handleAddSongs = async () => {
        if (!playlistId || selectedSongs.length === 0) {
            return;
        }

        try {
            setAddingSongs(true);

            /*
             * Recommended backend payload:
             *
             * {
             *   songIds: selectedSongs
             * }
             */

            const response = await ApiService.post(
                apiUrls.addSongToPlaylist(playlistId),
                {
                    song_ids: selectedSongs,
                },
            );

            const data = response?.data;

            if (!data?.success) {
                dispatch(
                    showToast({
                        visible: true,
                        message:
                            data?.message ||
                            'Unable to add songs.',
                        type: 'error',
                    }),
                );

                return;
            }

            setAddSongsVisible(false);
            setSelectedSongs([]);

            await getPlaylistDetails();

            dispatch(
                showToast({
                    visible: true,
                    message: 'Songs added to playlist successfully.',
                    type: 'success',
                }),
            );
        } catch (error: any) {
            console.log(
                'ADD SONGS ERROR:',
                error?.response?.data || error,
            );

            dispatch(
                showToast({
                    visible: true,
                    message:
                        error?.response?.data?.message ||
                        'Unable to add songs to playlist.',
                    type: 'error',
                }),
            );
        } finally {
            setAddingSongs(false);
        }
    };

    /**
     * ==========================================
     * PLAYLIST SONG
     * ==========================================
     */
    const stopRecording = async () => {
        try {
            await dispatch(isPausesd(true));
            await TrackPlayer.pause();
            try {

            } catch (e) { }
        } catch (error) {
            console.log('Stop Error:', error);
        }
    };
    const playRecording = async (item: any) => {
        try {

        } catch (e) { }

        setPlayingId(item.id?.toString());
        setLoadings(true);
        await dispatch(isPausesd(false));

        try {
            const list = songs.length > 0 ? songs : [];
            const songIndex = list.findIndex(
                (s: any) => s.id?.toString() === item.id?.toString()
            );
            const initialIndex = songIndex >= 0 ? songIndex : 0;
            if (list.length > 0) {
                await playSongList(list, initialIndex, true);
            } else {
                await playTrackSong(item, true);
            }
        } catch (error) {
            console.log('Librarylist play error:', error);
            dispatch(addsong({ ...item }));
        } finally {
            setLoadings(false);
        }
    };
    const renderPlaylistSong = ({
        item,
    }: {
        item: PlaylistSong;
    }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.songCard}
                onPress={() => {
                    navigation.navigate('.', { id: item.id, prevScreen: 'PlaylistDetailScreen' });
                }}
            >
                <AppImage
                    source={item.image}
                    width={54}
                    height={54}
                    radius={9}
                    resizeMode="cover"
                />

                <View style={styles.songInfo}>
                    <AppText
                        color={colors.darkthemetext}
                        fontSize={12}
                        fontWeight="600"
                        fontFamily={Inter.medium}
                        numberOfLines={1}
                    >
                        {item.title}
                    </AppText>

                    <AppText
                        color="#817A77"
                        fontSize={10}
                        fontFamily={Inter.regular}
                        marginTop={5}
                        numberOfLines={1}
                    >
                        {item.artist}
                    </AppText>

                    <AppText
                        color="#625B58"
                        fontSize={9}
                        fontFamily={Inter.regular}
                        marginTop={5}
                    >
                        {item.duration}
                    </AppText>
                </View>
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => {
                        playingId?.toString() === item.id?.toString() && !isPaused
                            ? stopRecording()
                            : playRecording(item);
                    }}
                >
                    {loadings && playingId?.toString() === item.id?.toString() ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            {playingId?.toString() === item.id?.toString() && !isPaused ? (
                                <View style={styles.pauseContainer}>
                                    <View style={styles.pauseLine} />
                                    <View style={styles.pauseLine} />
                                </View>
                            ) : (
                                <AppImage
                                    source={Images.playicon}
                                    width={10}
                                    height={10}
                                    tintColor={color.darkthemetext}
                                />
                            )}
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        dispatch(
                            openSongAction({
                                ...item,
                                songType: 'Playlist',
                                playlistId: playlistId
                            }),
                        );
                    }}
                    style={styles.songMore}
                    activeOpacity={0.7}
                >
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    /**
     * ==========================================
     * ADD SONG ITEM
     * ==========================================
     */
    const renderAddSong = ({
        item,
    }: {
        item: AvailableSong;
    }) => {
        const selected = selectedSongs.includes(item.id);

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addSongItem}
                onPress={() => toggleSong(item.id)}
            >
                <AppImage
                    source={item.image}
                    width={52}
                    height={52}
                    radius={9}
                    resizeMode="cover"
                />

                <View style={styles.songInfo}>
                    <AppText
                        color={colors.darkthemetext}
                        fontSize={12}
                        fontWeight="600"
                        fontFamily={Inter.medium}
                        numberOfLines={1}
                    >
                        {item.title}
                    </AppText>

                    <AppText
                        color="#817A77"
                        fontSize={10}
                        fontFamily={Inter.regular}
                        marginTop={5}
                        numberOfLines={1}
                    >
                        {item.artist}
                    </AppText>
                </View>

                <View
                    style={[
                        styles.selectCircle,
                        selected && styles.selectCircleActive,
                    ]}
                >
                    {selected ? (
                        <AppText
                            color="#FFFFFF"
                            fontSize={13}
                            fontWeight="600"
                        >
                            ✓
                        </AppText>
                    ) : (
                        <AppText
                            color="#817A77"
                            fontSize={18}
                        >
                            +
                        </AppText>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    /**
     * ==========================================
     * EMPTY PLAYLIST
     * ==========================================
     */
    const renderEmptyPlaylist = () => {
        return (
            <View style={styles.emptyContainer}>
                <LinearGradient
                    colors={['#FF4B4C', '#AB2C5D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.emptyIcon}
                >
                    <AppImage
                        source={Images.playlist}
                        width={28}
                        height={28}
                        resizeMode="contain"
                        tintColor="#FFFFFF"
                    />
                </LinearGradient>

                <AppText
                    color={colors.darkthemetext}
                    fontSize={16}
                    fontWeight="600"
                    fontFamily={Inter.medium}
                    marginTop={16}
                >
                    No Songs Yet
                </AppText>

                <AppText
                    color="#817A77"
                    fontSize={10}
                    fontFamily={Inter.regular}
                    marginTop={7}
                    style={styles.emptyText}
                >
                    Add your favorite songs to this playlist
                    and listen to them anytime.
                </AppText>

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={openAddSongs}
                    style={styles.emptyButton}
                >
                    <LinearGradient
                        colors={['#FF4B4C', '#AB2C5D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.emptyButtonGradient}
                    >
                        <AppText
                            color="#FFFFFF"
                            fontSize={11}
                            fontWeight="600"
                            fontFamily={Inter.medium}
                        >
                            + Add Songs
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor: colors.darkbackround,
                },
            ]}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreatePlaylist')}
                    style={styles.backButton}
                >
                    <AppText
                        color={colors.darkthemetext}
                        fontSize={28}
                        fontFamily={Inter.regular}
                    >
                        ‹
                    </AppText>
                </TouchableOpacity>

                <AppText
                    color={colors.darkthemetext}
                    fontSize={16}
                    fontWeight="600"
                    fontFamily={Inter.medium}
                >
                    Playlist
                </AppText>

                <TouchableOpacity

                    style={styles.headerMore}>
                    <View style={styles.headerDot} />
                    <View style={styles.headerDot} />
                    <View style={styles.headerDot} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator
                        size="large"
                        color="#EFCB61"
                    />

                    <AppText
                        color="#817A77"
                        fontSize={11}
                        fontFamily={Inter.regular}
                        marginTop={10}
                    >
                        Loading playlist...
                    </AppText>
                </View>
            ) : (
                <>
                    {/* PLAYLIST HERO */}
                    <View style={styles.hero}>
                        <LinearGradient
                            colors={['#FF4B4C', '#AB2C5D']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.coverWrapper}
                        >
                            <AppImage
                                source={Images.playlist}
                                width={54}
                                height={54}
                                resizeMode="contain"
                                tintColor="#FFFFFF"
                            />
                        </LinearGradient>

                        <AppText
                            color={colors.darkthemetext}
                            fontSize={20}
                            fontWeight="600"
                            fontFamily={Inter.medium}
                            marginTop={15}
                            numberOfLines={1}
                        >
                            {playlistName || 'My Playlist'}
                        </AppText>

                        <AppText
                            color="#817A77"
                            fontSize={10}
                            fontFamily={Inter.regular}
                            marginTop={6}
                        >
                            {songs.length} songs
                        </AppText>

                        {/* PLAY ALL */}
                        {/* {songs.length > 0 && (
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.playAllButton}
                            >
                                <LinearGradient
                                    colors={[
                                        '#FF4B4C',
                                        '#AB2C5D',
                                    ]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.playAllGradient}
                                >
                                    <AppImage
                                        source={Images.playicon}
                                        width={12}
                                        height={12}
                                        resizeMode="contain"
                                    />

                                    <AppText
                                        color="#FFFFFF"
                                        fontSize={11}
                                        fontWeight="600"
                                        fontFamily={Inter.medium}
                                        marginLeft={7}
                                    >
                                        Play All
                                    </AppText>
                                </LinearGradient>
                            </TouchableOpacity>
                        )} */}
                    </View>

                    {/* SONG HEADER */}
                    <View style={styles.songHeader}>
                        <View>
                            <AppText
                                color={colors.darkthemetext}
                                fontSize={14}
                                fontWeight="600"
                                fontFamily={Inter.medium}
                            >
                                Songs
                            </AppText>

                            <AppText
                                color="#817A77"
                                fontSize={9}
                                fontFamily={Inter.regular}
                                marginTop={4}
                            >
                                {songs.length} songs in this playlist
                            </AppText>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={openAddSongs}
                        >
                            <LinearGradient
                                colors={[
                                    '#FF4B4C',
                                    '#AB2C5D',
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.addButton}
                            >
                                <AppText
                                    color="#FFFFFF"
                                    fontSize={10}
                                    fontWeight="600"
                                    fontFamily={Inter.medium}
                                >
                                    + Add Songs
                                </AppText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={songs}
                        keyExtractor={item => item.id}
                        renderItem={renderPlaylistSong}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={
                            songs.length === 0
                                ? styles.emptyList
                                : styles.listContent
                        }
                        ListEmptyComponent={
                            renderEmptyPlaylist
                        }
                    />
                </>
            )}

            {/* ===================================== */}
            {/* ADD SONGS MODAL */}
            {/* ===================================== */}

            <Modal
                visible={addSongsVisible}
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setAddSongsVisible(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.addSongsModal,
                            {
                                backgroundColor:
                                    colors.darkbackround,
                            },
                        ]}
                    >
                        {/* HANDLE */}
                        <View style={styles.sheetHandle} />

                        {/* MODAL HEADER */}
                        <View style={styles.modalHeader}>
                            <View>
                                <AppText
                                    color={colors.darkthemetext}
                                    fontSize={17}
                                    fontWeight="600"
                                    fontFamily={Inter.medium}
                                >
                                    Add Songs
                                </AppText>

                                <AppText
                                    color="#817A77"
                                    fontSize={9}
                                    fontFamily={Inter.regular}
                                    marginTop={4}
                                >
                                    Add songs to {playlistName}
                                </AppText>
                            </View>

                            <TouchableOpacity
                                onPress={() =>
                                    setAddSongsVisible(false)
                                }
                            >
                                <AppText
                                    color="#8F8986"
                                    fontSize={25}
                                >
                                    ×
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        {/* SEARCH */}
                        <View style={styles.songSearch}>
                            <AppImage
                                source={Images.search}
                                width={16}
                                height={16}
                                resizeMode="contain"
                                tintColor="#8F8986"
                            />

                            <TextInput
                                value={songSearch}
                                onChangeText={setSongSearch}
                                placeholder="Search songs..."
                                placeholderTextColor="#716B69"
                                style={[
                                    styles.songSearchInput,
                                    {
                                        color:
                                            colors.darkthemetext,
                                    },
                                ]}
                            />

                            {songSearch.length > 0 && (
                                <TouchableOpacity
                                    onPress={() =>
                                        setSongSearch('')
                                    }
                                >
                                    <AppText
                                        color="#8F8986"
                                        fontSize={18}
                                    >
                                        ×
                                    </AppText>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* SELECTED COUNT */}
                        {selectedSongs.length > 0 && (
                            <View style={styles.selectedInfo}>
                                <AppText
                                    color="#D07113"
                                    fontSize={10}
                                    fontFamily={Inter.medium}
                                >
                                    {selectedSongs.length} songs selected
                                </AppText>

                                <TouchableOpacity
                                    onPress={() =>
                                        setSelectedSongs([])
                                    }
                                >
                                    <AppText
                                        color="#817A77"
                                        fontSize={9}
                                        fontFamily={Inter.regular}
                                    >
                                        Clear
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* SONGS */}
                        {songsLoading ? (
                            <View style={styles.modalLoader}>
                                <ActivityIndicator
                                    size="large"
                                    color="#EFCB61"
                                />

                                <AppText
                                    color="#817A77"
                                    fontSize={10}
                                    fontFamily={Inter.regular}
                                    marginTop={10}
                                >
                                    Loading songs...
                                </AppText>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredSongs}
                                keyExtractor={item =>
                                    item.id
                                }
                                renderItem={renderAddSong}
                                showsVerticalScrollIndicator={
                                    false
                                }
                                contentContainerStyle={{
                                    paddingBottom: 15,
                                }}
                                ListEmptyComponent={
                                    <View
                                        style={
                                            styles.noSongs
                                        }
                                    >
                                        <AppText
                                            color="#817A77"
                                            fontSize={11}
                                            fontFamily={
                                                Inter.regular
                                            }
                                        >
                                            No songs found
                                        </AppText>
                                    </View>
                                }
                            />
                        )}

                        {/* ADD BUTTON */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            disabled={
                                selectedSongs.length === 0 ||
                                addingSongs
                            }
                            onPress={handleAddSongs}
                            style={[
                                styles.addToPlaylistButton,
                                {
                                    opacity:
                                        selectedSongs.length ===
                                            0 ||
                                            addingSongs
                                            ? 0.45
                                            : 1,
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={[
                                    '#FF4B4C',
                                    '#AB2C5D',
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.addToPlaylistGradient}
                            >
                                {addingSongs ? (
                                    <ActivityIndicator
                                        color="#FFFFFF"
                                        size="small"
                                    />
                                ) : (
                                    <AppText
                                        color="#FFFFFF"
                                        fontSize={12}
                                        fontWeight="600"
                                        fontFamily={
                                            Inter.medium
                                        }
                                    >
                                        Add to Playlist
                                    </AppText>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    headerMore: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerDot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
        marginVertical: 2,
    },

    hero: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 20,
    },

    coverWrapper: {
        width: 145,
        height: 145,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    playAllButton: {
        marginTop: 15,
        borderRadius: 22,
        overflow: 'hidden',
    },

    playAllGradient: {
        height: 42,
        minWidth: 130,

        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    songHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    addButton: {
        height: 35,
        width: 90,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    listContent: {
        paddingBottom: 100,
    },

    songCard: {
        minHeight: 76,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#241C19',
        backgroundColor: '#0C0B0B',
        padding: 10,
        marginBottom: 9,
        flexDirection: 'row',
        alignItems: 'center',
    },

    songInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },

    songMore: {
        width: 30,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    dot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#8F8986',
        marginVertical: 2,
    },

    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 35,
        paddingBottom: 80,
    },

    emptyIcon: {
        width: 65,
        height: 65,
        borderRadius: 33,
        justifyContent: 'center',
        alignItems: 'center',
    },

    emptyText: {
        textAlign: 'center',
        lineHeight: 17,
        maxWidth: 280,
    },

    emptyButton: {
        marginTop: 18,
        borderRadius: 20,
        overflow: 'hidden',
    },

    emptyButtonGradient: {
        height: 40,
        minWidth: 125,

        justifyContent: 'center',
        alignItems: 'center',
    },

    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* =============================== */
    /* ADD SONGS MODAL */
    /* =============================== */

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.72)',
        justifyContent: 'flex-end',
    },

    addSongsModal: {
        width: '100%',
        height: '82%',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 25,
        borderWidth: 1,
        borderColor: '#30221D',
    },

    sheetHandle: {
        width: 42,
        height: 4,
        borderRadius: 5,
        backgroundColor: '#625B58',
        alignSelf: 'center',
        marginBottom: 15,
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    songSearch: {
        height: 44,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#30221D',
        backgroundColor: '#0D0C0C',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginTop: 15,
    },

    songSearchInput: {
        flex: 1,
        marginLeft: 9,
        paddingVertical: 0,
        fontSize: 11,
        fontFamily: Inter.regular,
    },

    selectedInfo: {
        height: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    addSongItem: {
        minHeight: 70,
        borderBottomWidth: 1,
        borderBottomColor: '#1F1816',
        flexDirection: 'row',
        alignItems: 'center',
    },

    selectCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#4A3933',
        justifyContent: 'center',
        alignItems: 'center',
    },

    selectCircleActive: {
        borderColor: '#AB2C5D',
        backgroundColor: '#AB2C5D',
    },

    addToPlaylistButton: {
        borderRadius: 22,
        overflow: 'hidden',
        marginTop: 10,
    },

    addToPlaylistGradient: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    noSongs: {
        paddingTop: 50,
        alignItems: 'center',
    },
    playButton: {
        width: 34,
        height: 34,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: '#FF5A00',
        justifyContent: 'center',
        alignItems: 'center',
    },

    pauseContainer: {
        flexDirection: 'row',
        gap: 4,
    },

    pauseLine: {
        width: 3,
        height: 14,
        backgroundColor: '#FFF',
        borderRadius: 10,
    },
});

export default PlaylistDetailScreen;