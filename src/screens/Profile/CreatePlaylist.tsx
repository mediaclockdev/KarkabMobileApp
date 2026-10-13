
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import Header from '../../share/components/Header';
import AppImage from '../../share/components/AppImage';
import AppText from '../../share/components/AppText';

import { BottomIcons, Images } from '../../share/constants/media';
import { useAppColors } from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import apiUrls from '../../services/apiUrls';
import { showToast } from '../../auth/redux/authSlice';
import { useAppDispatch } from '../../share/hooks/useAppSelector';

type Playlist = {
    id: string;
    name: string;
    description?: string;
    image: any;
    songs: number;
    duration: string;
};

const CreatePlaylist = () => {
    const navigation = useNavigation<any>();
    const route = useRoute()
    const previousScreen = route?.params?.previousScreen;
    const colors = useAppColors();
    const dispatch = useAppDispatch();
    const [search, setSearch] = useState('');
    const [deletingPlaylist, setDeletingPlaylist] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);
    const [creatingPlaylist, setCreatingPlaylist] = useState(false);
    // Create playlist modal
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');

    // Three dot menu
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] =
        useState<Playlist | null>(null);

    /*
     * Replace this static data with your playlist API response.
     */
    // const [playlists, setPlaylists] = useState<Playlist[]>([
    //     {
    //         id: '1',
    //         name: 'My Favorites',
    //         description: 'Songs you love the most',
    //         image: Images.profile,
    //         songs: 24,
    //         duration: '1h 24m',
    //     },
    //     {
    //         id: '2',
    //         name: 'Arabic Vibes',
    //         description: 'Your favorite Arabic songs',
    //         image: Images.profile,
    //         songs: 18,
    //         duration: '58m',
    //     },
    //     {
    //         id: '3',
    //         name: 'Late Night',
    //         description: 'Perfect songs for the night',
    //         image: Images.profile,
    //         songs: 32,
    //         duration: '2h 05m',
    //     },
    //     {
    //         id: '4',
    //         name: 'Workout',
    //         description: 'Energy for your workout',
    //         image: Images.profile,
    //         songs: 15,
    //         duration: '49m',
    //     },
    // ]);

    const filteredPlaylists = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return playlists;
        }

        return playlists.filter(item =>
            item.name.toLowerCase().includes(query),
        );
    }, [search, playlists]);

    /**
     * Open create playlist modal
     */
    const openCreatePlaylist = () => {
        setPlaylistName('');
        setPlaylistDescription('');
        setCreateModalVisible(true);
    };

    useEffect(() => {
        getPlaylists()
    }, [])

    /**
     * Create playlist
     *
     * Replace this with your create-playlist API.
     */
    const handleCreatePlaylist = async () => {
        const name = playlistName.trim();
        const description = playlistDescription.trim();

        if (!name) {
            Alert.alert(
                'Playlist Name',
                'Please enter a playlist name.',
            );
            return;
        }

        if (creatingPlaylist) {
            return;
        }

        try {
            setCreatingPlaylist(true);

            const response = await ApiService.post(
                apiUrls.createplaylist,
                {
                    name,
                    description,
                },
            );

            const data = response?.data;

            if (!data?.success) {
                Alert.alert(
                    'Unable to Create Playlist',
                    data?.message || 'Something went wrong.',
                );
                return;
            }

            // Close/reset modal only after successful API call
            setCreateModalVisible(false);
            setPlaylistName('');
            setPlaylistDescription('');

            // Get latest playlists from server
            await getPlaylists();


            dispatch(
                showToast({
                    visible: true,
                    message: 'Playlist created successfully.',
                    type: 'success',
                }),
            );

        } catch (error: any) {
            console.log(
                'CREATE PLAYLIST ERROR:',
                error?.response?.data || error,
            );


            dispatch(
                showToast({
                    visible: true,
                    message: error?.response?.data?.message ||
                        'Unable to create playlist.',
                    type: 'error',
                }),
            );
        } finally {
            setCreatingPlaylist(false);
        }
    };


    const getPlaylists = useCallback(async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.createplaylist);

            const data = response?.data;

            if (data?.success) {
                const apiPlaylists = data?.data || data?.playlists || [];
                console.log(data, "hdeehjgdj")

                const formattedPlaylists: Playlist[] = apiPlaylists.map(
                    (item: any) => ({
                        id: String(item.id),
                        name: item.name || 'Untitled Playlist',
                        description: item.description || '',
                        image: item.image
                            ? { uri: item.image }
                            : Images.profile,
                        songs: Number(
                            item.songs_count ??
                            item.song_count ??
                            item.songs ??
                            0
                        ),
                        duration: item.duration || '0m',
                    }),
                );

                setPlaylists(formattedPlaylists);
            } else {
                setPlaylists([]);
            }
        } catch (error: any) {
            console.log(
                'GET PLAYLIST ERROR:',
                error?.response?.data || error,
            );

            Alert.alert(
                'Error',
                error?.response?.data?.message ||
                'Unable to load playlists.',
            );
        } finally {
            setLoading(false);
        }
    }, []);



    /**
     * Open three-dot menu
     */
    const openPlaylistMenu = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setMenuVisible(true);
    };

    /**
     * Edit playlist
     */
    const handleEditPlaylist = () => {
        if (!selectedPlaylist) return;

        setMenuVisible(false);

        setPlaylistName(selectedPlaylist.name);
        setPlaylistDescription(
            selectedPlaylist.description || '',
        );

        setCreateModalVisible(true);
    };

    /**
     * Delete playlist
     */
    const handleDeletePlaylist = () => {
        if (!selectedPlaylist || deletingPlaylist) {
            return;
        }

        const playlist = selectedPlaylist;

        setMenuVisible(false);

        Alert.alert(
            'Delete Playlist',
            `Are you sure you want to delete "${playlist.name}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeletingPlaylist(true);

                            const response = await ApiService.delete(
                                apiUrls.deleteplaylist(playlist.id),
                            );

                            const data = response?.data;

                            if (!data?.success) {
                                dispatch(
                                    showToast({
                                        visible: true,
                                        message:
                                            data?.message ||
                                            'Unable to delete playlist.',
                                        type: 'error',
                                    }),
                                );

                                return;
                            }

                            // Remove only after successful API response
                            setPlaylists(prev =>
                                prev.filter(
                                    item => item.id !== playlist.id,
                                ),
                            );

                            setSelectedPlaylist(null);

                            dispatch(
                                showToast({
                                    visible: true,
                                    message: 'Playlist deleted successfully.',
                                    type: 'success',
                                }),
                            );
                        } catch (error: any) {
                            console.log(
                                'DELETE PLAYLIST ERROR:',
                                error?.response?.data || error,
                            );

                            dispatch(
                                showToast({
                                    visible: true,
                                    message:
                                        error?.response?.data?.message ||
                                        'Unable to delete playlist.',
                                    type: 'error',
                                }),
                            );
                        } finally {
                            setDeletingPlaylist(false);
                        }
                    },
                },
            ],
        );
    };

    /**
     * Play complete playlist
     *
     * Connect this to your audio player / Redux later.
     */
    const handlePlayPlaylist = (playlist: Playlist) => {
        if (playlist.songs === 0) {
            Alert.alert(
                'Empty Playlist',
                'Add some songs to this playlist first.',
            );
            return;
        }

        console.log('Play playlist:', playlist.id);

        // Example:
        // navigation.navigate('AudioRec', {
        //     playlistId: playlist.id,
        // });
    };

    const renderPlaylist = ({
        item,
    }: {
        item: Playlist;
        index: number;
    }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                style={[
                    styles.playlistCard,
                    {
                        borderColor:
                            colors.searhbarbordercolor ||
                            '#241A17',
                    },
                ]}
                onPress={() => {
                    navigation.navigate(
                        'PlaylistDetailScreen',
                        {
                            playlistId: item.id,
                            playlistName: item.name,
                        },
                    );
                }}
            >
                {/* Playlist Image */}
                <View style={styles.imageWrapper}>
                    <AppImage
                        source={item.image}
                        width={76}
                        height={76}
                        radius={10}
                        resizeMode="cover"
                    />

                    {/* Play overlay */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.playButton}
                        onPress={event => {
                            event.stopPropagation();
                            handlePlayPlaylist(item);
                        }}
                    >
                        <AppImage
                            source={Images.playicon}
                            width={9}
                            height={9}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                {/* Playlist Information */}
                <View style={styles.playlistContent}>
                    <AppText
                        color={colors.darkthemetext}
                        fontSize={14}
                        fontWeight="600"
                        fontFamily={Inter.medium}
                        numberOfLines={1}
                    >
                        {item.name}
                    </AppText>

                    <AppText
                        color="#8F8986"
                        fontSize={10}
                        fontWeight="400"
                        fontFamily={Inter.regular}
                        marginTop={5}
                        numberOfLines={1}
                    >
                        {item.description}
                    </AppText>

                    <View style={styles.metaRow}>
                        <AppText
                            color="#D07113"
                            fontSize={10}
                            fontWeight="500"
                            fontFamily={Inter.regular}
                        >
                            {item.songs} songs
                        </AppText>

                        <View style={styles.dotSeparator} />

                        <AppText
                            color="#8F8986"
                            fontSize={10}
                            fontWeight="400"
                            fontFamily={Inter.regular}
                        >
                            {item.duration}
                        </AppText>
                    </View>
                </View>

                {/* More */}
                <TouchableOpacity
                    style={styles.moreButton}
                    activeOpacity={0.7}
                    onPress={event => {
                        event.stopPropagation();
                        openPlaylistMenu(item);
                    }}
                >
                    <View
                        style={[
                            styles.dot,
                            {
                                backgroundColor:
                                    colors.darkthemetext,
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.dot,
                            {
                                backgroundColor:
                                    colors.darkthemetext,
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.dot,
                            {
                                backgroundColor:
                                    colors.darkthemetext,
                            },
                        ]}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => {
        return (
            <View style={styles.emptyContainer}>
                <LinearGradient
                    colors={['#EB2C78', '#D07113']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.emptyIcon}
                >
                    <AppImage
                        source={Images.playlist}
                        width={28}
                        height={28}
                        resizeMode="contain"
                        tintColor={"#FFFF"}
                    />
                </LinearGradient>

                <AppText
                    color={colors.darkthemetext}
                    fontSize={17}
                    fontWeight="600"
                    fontFamily={Inter.medium}
                    marginTop={18}
                >
                    No Playlists Yet
                </AppText>

                <AppText
                    color="#8F8986"
                    fontSize={11}
                    fontWeight="400"
                    fontFamily={Inter.regular}
                    marginTop={8}
                    style={styles.emptyText}
                >
                    Create your first playlist and keep all your
                    favorite songs together.
                </AppText>

                <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.emptyCreateButton}
                    onPress={openCreatePlaylist}
                >
                    <LinearGradient
                        colors={['#FF4B4C', '#AB2C5D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.createGradient}
                    >
                        <AppText
                            color="#FFFFFF"
                            fontSize={11}
                            fontWeight="600"
                            fontFamily={Inter.medium}
                        >
                            Create Playlist
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
            <Header
                headername="Playlists"
                headertitle="Your music, your way"
                rightIcon={Images.bell}
                onRightPress={() => {
                    navigation.navigate('NotificationScreen');
                }}
                backpress={() => {
                    const previousScreen = route?.params?.previousScreen;

                    if (previousScreen) {
                        navigation.navigate(previousScreen);
                    } else {
                        navigation.navigate('Profile');
                    }
                }}
            />

            {/* Search */}
            <View
                style={[
                    styles.searchContainer,
                    {
                        borderColor:
                            colors.searhbarbordercolor ||
                            '#2B211E',
                    },
                ]}
            >
                <AppImage
                    source={BottomIcons.search}
                    width={17}
                    height={17}
                    resizeMode="contain"
                    tintColor="#8F8986"
                />

                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search playlists..."
                    placeholderTextColor="#716B69"
                    style={[
                        styles.searchInput,
                        {
                            color: colors.darkthemetext,
                        },
                    ]}
                />

                {search.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearch('')}
                    >
                        <AppText
                            color="#8F8986"
                            fontSize={18}
                            fontFamily={Inter.regular}
                        >
                            ×
                        </AppText>
                    </TouchableOpacity>
                )}
            </View>

            {/* Top Section */}
            <View style={styles.topSection}>
                <View>
                    <AppText
                        color={colors.darkthemetext}
                        fontSize={14}
                        fontWeight="600"
                        fontFamily={Inter.medium}
                    >
                        My Playlists
                    </AppText>

                    <AppText
                        color="#817A77"
                        fontSize={9}
                        fontWeight="400"
                        fontFamily={Inter.regular}
                        marginTop={4}
                    >
                        {filteredPlaylists.length} playlists
                    </AppText>
                </View>

                {/* + CREATE */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={openCreatePlaylist}
                >
                    <LinearGradient
                        colors={['#FF4B4C', '#AB2C5D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.createButton}
                    >
                        <AppText
                            color="#FFFFFF"
                            fontSize={10}
                            fontWeight="600"
                            fontFamily={Inter.medium}
                        >
                            + Create
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Playlist List */}
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator
                        size="large"
                        color="#EFCB61"
                    />

                    <AppText
                        color="#8F8986"
                        fontSize={11}
                        fontFamily={Inter.regular}
                        marginTop={10}
                    >
                        Loading playlists...
                    </AppText>
                </View>
            ) : (
                <FlatList
                    data={filteredPlaylists}
                    keyExtractor={item => item.id}
                    renderItem={renderPlaylist}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={[
                        styles.listContent,
                        filteredPlaylists.length === 0 &&
                        styles.emptyList,
                    ]}
                />
            )}

            {/* ========================================= */}
            {/* CREATE PLAYLIST MODAL */}
            {/* ========================================= */}

            <Modal
                visible={createModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setCreateModalVisible(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.createModal,
                            {
                                backgroundColor:
                                    colors.darkbackround,
                            },
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <AppText
                                color={colors.darkthemetext}
                                fontSize={17}
                                fontWeight="600"
                                fontFamily={Inter.medium}
                            >
                                Create Playlist
                            </AppText>

                            <TouchableOpacity
                                onPress={() =>
                                    setCreateModalVisible(false)
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

                        {/* Name */}
                        <AppText
                            color={colors.darkthemetext}
                            fontSize={11}
                            fontFamily={Inter.medium}
                            marginTop={10}
                        >
                            Playlist Name
                        </AppText>

                        <TextInput
                            value={playlistName}
                            onChangeText={setPlaylistName}
                            placeholder="Enter playlist name"
                            placeholderTextColor="#716B69"
                            style={[
                                styles.modalInput,
                                {
                                    color:
                                        colors.darkthemetext,
                                },
                            ]}
                        />

                        {/* Description */}
                        <AppText
                            color={colors.darkthemetext}
                            fontSize={11}
                            fontFamily={Inter.medium}
                            marginTop={15}
                        >
                            Description
                        </AppText>

                        <TextInput
                            value={playlistDescription}
                            onChangeText={
                                setPlaylistDescription
                            }
                            placeholder="Add a description"
                            placeholderTextColor="#716B69"
                            multiline
                            style={[
                                styles.descriptionInput,
                                {
                                    color:
                                        colors.darkthemetext,
                                },
                            ]}
                        />

                        {/* Create */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.modalCreateButton}
                            onPress={handleCreatePlaylist}
                        >
                            <LinearGradient
                                colors={[
                                    '#FF4B4C',
                                    '#AB2C5D',
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.modalGradient}
                            >
                                <AppText
                                    color="#FFFFFF"
                                    fontSize={12}
                                    fontWeight="600"
                                    fontFamily={
                                        Inter.medium
                                    }
                                >
                                    Create Playlist
                                </AppText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ========================================= */}
            {/* THREE DOT MENU */}
            {/* ========================================= */}

            <Modal
                visible={menuVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.menuOverlay}
                    onPress={() => setMenuVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            styles.actionSheet,
                            {
                                backgroundColor:
                                    colors.darkbackround,
                            },
                        ]}
                    >
                        {/* Handle */}
                        <View style={styles.sheetHandle} />

                        <View style={styles.sheetHeader}>
                            <View style={{ flex: 1 }}>
                                <AppText
                                    color={
                                        colors.darkthemetext
                                    }
                                    fontSize={15}
                                    fontWeight="600"
                                    fontFamily={
                                        Inter.medium
                                    }
                                    numberOfLines={1}
                                >
                                    {selectedPlaylist?.name}
                                </AppText>

                                <AppText
                                    color="#817A77"
                                    fontSize={9}
                                    fontFamily={
                                        Inter.regular
                                    }
                                    marginTop={3}
                                >
                                    {selectedPlaylist?.songs ||
                                        0}{' '}
                                    songs
                                </AppText>
                            </View>

                            <TouchableOpacity
                                onPress={() =>
                                    setMenuVisible(false)
                                }
                            >
                                <AppText
                                    color="#8F8986"
                                    fontSize={24}
                                >
                                    ×
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        {/* Edit */}
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={handleEditPlaylist}
                        >
                            <View
                                style={[
                                    styles.actionIcon,
                                    {
                                        backgroundColor:
                                            '#24130D',
                                    },
                                ]}
                            >
                                <AppText
                                    color="#D07113"
                                    fontSize={15}
                                >
                                    ✎
                                </AppText>
                            </View>

                            <View>
                                <AppText
                                    color={
                                        colors.darkthemetext
                                    }
                                    fontSize={12}
                                    fontFamily={
                                        Inter.medium
                                    }
                                >
                                    Edit Playlist
                                </AppText>

                                <AppText
                                    color="#817A77"
                                    fontSize={9}
                                    fontFamily={
                                        Inter.regular
                                    }
                                    marginTop={3}
                                >
                                    Change name or description
                                </AppText>
                            </View>
                        </TouchableOpacity>

                        {/* Play */}
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => {
                                setMenuVisible(false);

                                if (selectedPlaylist) {
                                    handlePlayPlaylist(
                                        selectedPlaylist,
                                    );
                                }
                            }}
                        >
                            <View
                                style={[
                                    styles.actionIcon,
                                    {
                                        backgroundColor:
                                            '#1B1511',
                                    },
                                ]}
                            >
                                <AppImage
                                    source={
                                        Images.playicon
                                    }
                                    width={12}
                                    height={12}
                                />
                            </View>

                            <View>
                                <AppText
                                    color={
                                        colors.darkthemetext
                                    }
                                    fontSize={12}
                                    fontFamily={
                                        Inter.medium
                                    }
                                >
                                    Play Playlist
                                </AppText>

                                <AppText
                                    color="#817A77"
                                    fontSize={9}
                                    fontFamily={
                                        Inter.regular
                                    }
                                    marginTop={3}
                                >
                                    Start playing all songs
                                </AppText>
                            </View>
                        </TouchableOpacity>

                        {/* Delete */}
                        <TouchableOpacity
                            style={[
                                styles.actionItem,
                                {
                                    borderBottomWidth: 0,
                                },
                            ]}
                            onPress={handleDeletePlaylist}
                        >
                            <View
                                style={[
                                    styles.actionIcon,
                                    {
                                        backgroundColor:
                                            '#2A1017',
                                    },
                                ]}
                            >
                                <AppText
                                    color="#E52450"
                                    fontSize={15}
                                >
                                    ×
                                </AppText>
                            </View>

                            <View>
                                <AppText
                                    color="#E52450"
                                    fontSize={12}
                                    fontFamily={
                                        Inter.medium
                                    }
                                >
                                    Delete Playlist
                                </AppText>

                                <AppText
                                    color="#817A77"
                                    fontSize={9}
                                    fontFamily={
                                        Inter.regular
                                    }
                                    marginTop={3}
                                >
                                    Remove this playlist
                                </AppText>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },

    searchContainer: {
        height: 44,
        borderWidth: 1,
        borderRadius: 12,
        marginTop: 12,
        paddingHorizontal: 13,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D0C0C',
    },

    searchInput: {
        flex: 1,
        marginLeft: 9,
        paddingVertical: 0,
        fontSize: 11,
        fontFamily: Inter.regular,
    },

    topSection: {
        marginTop: 22,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    createButton: {
        minWidth: 82,
        height: 34,
        // paddingHorizontal: 14,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    listContent: {
        paddingBottom: 100,
    },

    playlistCard: {
        width: '100%',
        minHeight: 101,
        borderWidth: 1,
        borderRadius: 14,
        padding: 11,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0C0B0B',
    },

    imageWrapper: {
        width: 76,
        height: 76,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },

    playButton: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 27,
        height: 27,
        borderRadius: 15,
        backgroundColor: '#090909',
        borderWidth: 1,
        borderColor: '#D07113',
        justifyContent: 'center',
        alignItems: 'center',
    },

    playlistContent: {
        flex: 1,
        marginLeft: 13,
        justifyContent: 'center',
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },

    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#625B58',
        marginHorizontal: 7,
    },

    moreButton: {
        width: 28,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5,
    },

    dot: {
        width: 2.5,
        height: 2.5,
        borderRadius: 2,
        marginVertical: 1.5,
    },

    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },

    emptyText: {
        textAlign: 'center',
        lineHeight: 18,
        maxWidth: 280,
    },

    emptyCreateButton: {
        marginTop: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },

    createGradient: {
        height: 40,
        minWidth: 130,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* ========================= */
    /* CREATE MODAL */
    /* ========================= */

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.72)',
        justifyContent: 'flex-end',
    },

    createModal: {
        width: '100%',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 30,
        borderWidth: 1,
        borderColor: '#30221D',
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    modalInput: {
        height: 45,
        borderWidth: 1,
        borderColor: '#30221D',
        borderRadius: 11,
        backgroundColor: '#0D0C0C',
        marginTop: 8,
        paddingHorizontal: 12,
        fontSize: 11,
        fontFamily: Inter.regular,
    },

    descriptionInput: {
        height: 75,
        borderWidth: 1,
        borderColor: '#30221D',
        borderRadius: 11,
        backgroundColor: '#0D0C0C',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingTop: 12,
        fontSize: 11,
        fontFamily: Inter.regular,
        textAlignVertical: 'top',
    },

    modalCreateButton: {
        marginTop: 20,
        borderRadius: 22,
        overflow: 'hidden',
    },

    modalGradient: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* ========================= */
    /* THREE DOT ACTION SHEET */
    /* ========================= */

    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.68)',
        justifyContent: 'flex-end',
    },

    actionSheet: {
        width: '100%',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 28,
        borderWidth: 1,
        borderColor: '#30221D',
    },

    sheetHandle: {
        width: 42,
        height: 4,
        borderRadius: 5,
        backgroundColor: '#625B58',
        alignSelf: 'center',
        marginBottom: 16,
    },

    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#241C19',
    },

    actionItem: {
        minHeight: 62,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#1F1816',
    },

    actionIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CreatePlaylist;

