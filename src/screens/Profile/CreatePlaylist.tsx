import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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

interface SwipeableCardProps {
    item: Playlist;
    index: number;
    totalCount: number;
    colors: any;
    isReordering: boolean;
    onPress: () => void;
    onPlay: (playlist: Playlist) => void;
    onEdit: (playlist: Playlist) => void;
    onDelete: (playlist: Playlist) => void;
    onOpenMenu: (playlist: Playlist) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
}

/**
 * Swipeable Playlist Item Row
 * Supports left swipe to reveal Edit & Delete actions.
 * In Reorder mode, swipe is disabled in favor of Up/Down reordering controls.
 */
const SwipeablePlaylistCard: React.FC<SwipeableCardProps> = ({
    item,
    index,
    totalCount,
    colors,
    isReordering,
    onPress,
    onPlay,
    onEdit,
    onDelete,
    onOpenMenu,
    onMoveUp,
    onMoveDown,
}) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const isOpen = useRef(false);

    // Auto-close swipe when entering reorder mode
    useEffect(() => {
        if (isReordering && isOpen.current) {
            closeRow();
        }
    }, [isReordering]);

    const closeRow = () => {
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
        }).start(() => {
            isOpen.current = false;
        });
    };

    const openRow = () => {
        Animated.spring(translateX, {
            toValue: -130,
            useNativeDriver: true,
            bounciness: 4,
        }).start(() => {
            isOpen.current = true;
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                if (isReordering) return false;
                // Only capture predominantly horizontal swipes to not block FlatList scrolling
                return (
                    Math.abs(gestureState.dx) > 12 &&
                    Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
                );
            },
            onPanResponderGrant: () => {
                translateX.stopAnimation();
            },
            onPanResponderMove: (_, gestureState) => {
                if (isReordering) return;
                const currentOffset = isOpen.current ? -130 : 0;
                let newX = currentOffset + gestureState.dx;
                // Prevent swiping right past 10px and left past -150px
                if (newX > 10) newX = 10;
                if (newX < -150) newX = -150;
                translateX.setValue(newX);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (isReordering) return;
                if (isOpen.current) {
                    if (gestureState.dx > 35) {
                        closeRow();
                    } else {
                        openRow();
                    }
                } else {
                    if (gestureState.dx < -45) {
                        openRow();
                    } else {
                        closeRow();
                    }
                }
            },
            onPanResponderTerminate: () => {
                closeRow();
            },
        }),
    ).current;

    return (
        <View style={styles.swipeContainer}>
            {/* Background Actions (Revealed upon swiping left) */}
            {!isReordering && (
                <View style={styles.actionsContainer}>
                    {/* Quick Edit */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.actionBtn, styles.editActionBtn]}
                        onPress={() => {
                            closeRow();
                            onEdit(item);
                        }}
                    >
                        <AppText color="#D07113" fontSize={15}>
                            ✎
                        </AppText>
                        <AppText
                            color="#D07113"
                            fontSize={10}
                            fontFamily={Inter.medium}
                            marginTop={3}
                        >
                            Edit
                        </AppText>
                    </TouchableOpacity>

                    {/* Quick Delete */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.actionBtn, styles.deleteActionBtn]}
                        onPress={() => {
                            closeRow();
                            onDelete(item);
                        }}
                    >
                        <AppText color="#E52450" fontSize={15}>
                            ×
                        </AppText>
                        <AppText
                            color="#E52450"
                            fontSize={10}
                            fontFamily={Inter.medium}
                            marginTop={3}
                        >
                            Delete
                        </AppText>
                    </TouchableOpacity>
                </View>
            )}

            {/* Front Card */}
            <Animated.View
                style={[
                    styles.playlistCard,
                    {
                        borderColor:
                            colors.searhbarbordercolor || '#241A17',
                        transform: [{ translateX }],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.cardInnerTouchable}
                    onPress={() => {
                        if (isOpen.current) {
                            closeRow();
                        } else {
                            onPress();
                        }
                    }}
                >
                    {/* Reorder Position Badge */}
                    {isReordering && (
                        <View style={styles.reorderBadge}>
                            <AppText
                                color="#D07113"
                                fontSize={11}
                                fontFamily={Inter.medium}
                            >
                                #{index + 1}
                            </AppText>
                        </View>
                    )}

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
                                onPlay(item);
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
                                {item?.duration}
                            </AppText>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Right Area: Reorder Controls OR Three-Dot Menu */}
                {isReordering ? (
                    <View style={styles.reorderControls}>
                        <TouchableOpacity
                            disabled={index === 0}
                            activeOpacity={0.7}
                            style={[
                                styles.reorderArrowBtn,
                                index === 0 && styles.reorderArrowBtnDisabled,
                            ]}
                            onPress={() => onMoveUp(index)}
                        >
                            <AppText
                                color={
                                    index === 0
                                        ? '#524B48'
                                        : colors.darkthemetext
                                }
                                fontSize={12}
                                fontWeight="700"
                            >
                                ▲
                            </AppText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={index === totalCount - 1}
                            activeOpacity={0.7}
                            style={[
                                styles.reorderArrowBtn,
                                index === totalCount - 1 &&
                                styles.reorderArrowBtnDisabled,
                            ]}
                            onPress={() => onMoveDown(index)}
                        >
                            <AppText
                                color={
                                    index === totalCount - 1
                                        ? '#524B48'
                                        : colors.darkthemetext
                                }
                                fontSize={12}
                                fontWeight="700"
                            >
                                ▼
                            </AppText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.moreButton}
                        activeOpacity={0.7}
                        onPress={event => {
                            event.stopPropagation();
                            onOpenMenu(item);
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
                )}
            </Animated.View>
        </View>
    );
};

const CreatePlaylist = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const colors = useAppColors();
    const dispatch = useAppDispatch();

    const [search, setSearch] = useState('');
    const [deletingPlaylist, setDeletingPlaylist] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingPlaylist, setSavingPlaylist] = useState(false);

    // Modal state (Handles both Create and Edit)
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');

    // Reorder mode state
    const [isReordering, setIsReordering] = useState(false);

    // Three-dot menu
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] =
        useState<Playlist | null>(null);

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
        setIsEditing(false);
        setSelectedPlaylist(null);
        setPlaylistName('');
        setPlaylistDescription('');
        setCreateModalVisible(true);
    };

    /**
     * Open edit playlist modal
     */
    const handleEditPlaylist = (playlist?: Playlist) => {
        const target = playlist || selectedPlaylist;
        if (!target) return;

        setMenuVisible(false);
        setIsEditing(true);
        setSelectedPlaylist(target);
        setPlaylistName(target.name);
        setPlaylistDescription(target.description || '');
        setCreateModalVisible(true);
    };

    /**
     * Close modal & reset all related state
     */
    const closePlaylistModal = () => {
        setCreateModalVisible(false);
        setIsEditing(false);
        setSelectedPlaylist(null);
        setPlaylistName('');
        setPlaylistDescription('');
    };

    // useEffect(() => {
    //     getPlaylists();
    // }, []);

    useFocusEffect(
        useCallback(() => {
            getPlaylists();
        }, [])
    )

    /**
     * Fetch playlists from API
     */
    const getPlaylists = useCallback(async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.createplaylist);
            const data = response?.data;

            if (data?.success) {
                const apiPlaylists = data?.data || data?.playlists || [];

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
                            0,
                        ),
                        duration: item.duration || '0m',
                    }),
                );

                setPlaylists(formattedPlaylists);
            } else {
                setPlaylists([]);
            }
        } catch (error: any) {
            console.log('GET PLAYLIST ERROR:', error?.response?.data || error);

            Alert.alert(
                'Error',
                error?.response?.data?.message || 'Unable to load playlists.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Save Playlist (Handles both Create and Edit)
     */
    const handleSavePlaylist = async () => {
        const name = playlistName.trim();
        const description = playlistDescription.trim();

        if (!name) {
            Alert.alert('Playlist Name', 'Please enter a playlist name.');
            return;
        }

        if (savingPlaylist) {
            return;
        }

        try {
            setSavingPlaylist(true);

            if (isEditing && selectedPlaylist) {
                // ==========================================
                // EDIT / UPDATE PLAYLIST
                // ==========================================
                let updateUrl = `${apiUrls.createplaylist}/${selectedPlaylist.id}`;
                if (typeof (apiUrls as any).updateplaylist === 'function') {
                    updateUrl = (apiUrls as any).updateplaylist(selectedPlaylist.id);
                } else if (typeof (apiUrls as any).editplaylist === 'function') {
                    updateUrl = (apiUrls as any).editplaylist(selectedPlaylist.id);
                } else if ((apiUrls as any).updateplaylist) {
                    updateUrl = (apiUrls as any).updateplaylist;
                } else if ((apiUrls as any).editplaylist) {
                    updateUrl = (apiUrls as any).editplaylist;
                }

                const payload = {
                    name,
                    description,
                    id: selectedPlaylist.id,
                    playlist_id: selectedPlaylist.id,
                };

                let response;
                if (typeof ApiService.put === 'function') {
                    try {
                        response = await ApiService.put(updateUrl, payload);
                    } catch (putErr: any) {
                        // Fallback to POST if server prefers POST for updates
                        if (putErr?.response?.status === 405 || !putErr?.response) {
                            response = await ApiService.post(updateUrl, payload);
                        } else {
                            throw putErr;
                        }
                    }
                } else {
                    response = await ApiService.post(updateUrl, payload);
                }

                const data = response?.data;

                if (data && data.success === false) {
                    Alert.alert(
                        'Unable to Update Playlist',
                        data?.message || 'Something went wrong.',
                    );
                    return;
                }

                // Optimistically update playlist in list
                setPlaylists(prev =>
                    prev.map(p =>
                        p.id === selectedPlaylist.id
                            ? { ...p, name, description }
                            : p,
                    ),
                );

                closePlaylistModal();
                await getPlaylists();

                dispatch(
                    showToast({
                        visible: true,
                        message: 'Playlist updated successfully.',
                        type: 'success',
                    }),
                );
            } else {
                // ==========================================
                // CREATE PLAYLIST
                // ==========================================
                const response = await ApiService.post(apiUrls.createplaylist, {
                    name,
                    description,
                });

                const data = response?.data;

                if (!data?.success) {
                    Alert.alert(
                        'Unable to Create Playlist',
                        data?.message || 'Something went wrong.',
                    );
                    return;
                }

                closePlaylistModal();
                await getPlaylists();

                dispatch(
                    showToast({
                        visible: true,
                        message: 'Playlist created successfully.',
                        type: 'success',
                    }),
                );
            }
        } catch (error: any) {
            console.log(
                isEditing ? 'UPDATE PLAYLIST ERROR:' : 'CREATE PLAYLIST ERROR:',
                error?.response?.data || error,
            );

            dispatch(
                showToast({
                    visible: true,
                    message:
                        error?.response?.data?.message ||
                        (isEditing
                            ? 'Unable to update playlist.'
                            : 'Unable to create playlist.'),
                    type: 'error',
                }),
            );
        } finally {
            setSavingPlaylist(false);
        }
    };

    /**
     * Delete playlist
     */
    const handleDeletePlaylist = (playlistTarget?: Playlist) => {
        const playlist = playlistTarget || selectedPlaylist;
        if (!playlist || deletingPlaylist) {
            return;
        }

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

                            // Remove item immediately from state
                            setPlaylists(prev =>
                                prev.filter(item => item.id !== playlist.id),
                            );

                            if (selectedPlaylist?.id === playlist.id) {
                                setSelectedPlaylist(null);
                            }

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
     * Reorder helper: swap playlist positions
     */
    const movePlaylistItem = (fromIndex: number, toIndex: number) => {
        if (
            fromIndex < 0 ||
            fromIndex >= playlists.length ||
            toIndex < 0 ||
            toIndex >= playlists.length
        ) {
            return;
        }

        setPlaylists(prev => {
            const updated = [...prev];
            const [movedItem] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, movedItem);
            return updated;
        });
    };

    /**
     * Save reordered playlists (optionally syncs with backend if API exists)
     */
    const handleFinishReorder = async () => {
        setIsReordering(false);

        try {
            const reorderUrl =
                (apiUrls as any).reorderplaylist ||
                (apiUrls as any).reorderplaylists ||
                (apiUrls as any).playlistOrder;

            if (reorderUrl) {
                await ApiService.post(reorderUrl, {
                    playlist_ids: playlists.map(p => p.id),
                });
            }

            dispatch(
                showToast({
                    visible: true,
                    message: 'Playlist order saved.',
                    type: 'success',
                }),
            );
        } catch (error) {
            console.log('REORDER PLAYLIST SYNC ERROR:', error);
        }
    };

    /**
     * Open three-dot menu
     */
    const openPlaylistMenu = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setMenuVisible(true);
    };

    /**
     * Play complete playlist
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
    };

    const renderPlaylist = ({
        item,
        index,
    }: {
        item: Playlist;
        index: number;
    }) => {
        return (
            <SwipeablePlaylistCard
                item={item}
                index={index}
                totalCount={filteredPlaylists.length}
                colors={colors}
                isReordering={isReordering}
                onPress={() => {
                    navigation.navigate('PlaylistDetailScreen', {
                        playlistId: item.id,
                        playlistName: item.name,
                    });
                }}
                onPlay={handlePlayPlaylist}
                onEdit={handleEditPlaylist}
                onDelete={handleDeletePlaylist}
                onOpenMenu={openPlaylistMenu}
                onMoveUp={currIdx => movePlaylistItem(currIdx, currIdx - 1)}
                onMoveDown={currIdx => movePlaylistItem(currIdx, currIdx + 1)}
            />
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
                        tintColor={'#FFFF'}
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
                    Create your first playlist and keep all your favorite songs
                    together.
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
                            colors.searhbarbordercolor || '#2B211E',
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
                    <TouchableOpacity onPress={() => setSearch('')}>
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

            {/* Top Section with Reorder & Create buttons */}
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

                <View style={styles.topActionsRow}>
                    {/* Reorder Toggle (Enabled when playlists exist and no search filter) */}
                    {playlists.length > 1 && search.trim().length === 0 && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                if (isReordering) {
                                    handleFinishReorder();
                                } else {
                                    setIsReordering(true);
                                }
                            }}
                            style={[
                                styles.reorderToggleBtn,
                                isReordering && styles.reorderToggleBtnActive,
                            ]}
                        >
                            <AppText
                                color={isReordering ? '#EFCB61' : '#8F8986'}
                                fontSize={10}
                                fontWeight="600"
                                fontFamily={Inter.medium}
                            >
                                {isReordering ? '✓ Done' : '⇅ Reorder'}
                            </AppText>
                        </TouchableOpacity>
                    )}

                    {/* + CREATE (Hidden during reordering) */}
                    {!isReordering && (
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
                    )}
                </View>
            </View>

            {/* Playlist List */}
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#EFCB61" />
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
                        filteredPlaylists.length === 0 && styles.emptyList,
                    ]}
                />
            )}

            {/* ========================================= */}
            {/* CREATE / EDIT PLAYLIST MODAL */}
            {/* ========================================= */}
            <Modal
                visible={createModalVisible}
                transparent
                animationType="slide"
                statusBarTranslucent
                onRequestClose={closePlaylistModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <ScrollView
                        contentContainerStyle={styles.modalScrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        <View
                            style={[
                                styles.createModal,
                                {
                                    backgroundColor: colors.darkbackround,
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
                                    {isEditing ? 'Edit Playlist' : 'Create Playlist'}
                                </AppText>

                                <TouchableOpacity onPress={closePlaylistModal}>
                                    <AppText color="#8F8986" fontSize={25}>
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
                                        color: colors.darkthemetext,
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
                                onChangeText={setPlaylistDescription}
                                placeholder="Add a description"
                                placeholderTextColor="#716B69"
                                multiline
                                style={[
                                    styles.descriptionInput,
                                    {
                                        color: colors.darkthemetext,
                                    },
                                ]}
                            />

                            {/* Submit Button */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.modalCreateButton}
                                onPress={handleSavePlaylist}
                                disabled={savingPlaylist}
                            >
                                <LinearGradient
                                    colors={['#FF4B4C', '#AB2C5D']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.modalGradient}
                                >
                                    {savingPlaylist ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#FFFFFF"
                                        />
                                    ) : (
                                        <AppText
                                            color="#FFFFFF"
                                            fontSize={12}
                                            fontWeight="600"
                                            fontFamily={Inter.medium}
                                        >
                                            {isEditing
                                                ? 'Save Changes'
                                                : 'Create Playlist'}
                                        </AppText>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>

            {/* ========================================= */}
            {/* THREE-DOT MENU / ACTION SHEET */}
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
                                backgroundColor: colors.darkbackround,
                            },
                        ]}
                    >
                        {/* Handle */}
                        <View style={styles.sheetHandle} />

                        <View style={styles.sheetHeader}>
                            <View style={{ flex: 1 }}>
                                <AppText
                                    color={colors.darkthemetext}
                                    fontSize={15}
                                    fontWeight="600"
                                    fontFamily={Inter.medium}
                                    numberOfLines={1}
                                >
                                    {selectedPlaylist?.name}
                                </AppText>

                                <AppText
                                    color="#817A77"
                                    fontSize={9}
                                    fontFamily={Inter.regular}
                                    marginTop={3}
                                >
                                    {selectedPlaylist?.songs || 0} songs
                                </AppText>
                            </View>

                            <TouchableOpacity
                                onPress={() => setMenuVisible(false)}
                            >
                                <AppText color="#8F8986" fontSize={24}>
                                    ×
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        {/* Edit Playlist */}
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => handleEditPlaylist()}
                        >
                            <View
                                style={[
                                    styles.actionIcon,
                                    { backgroundColor: '#24130D' },
                                ]}
                            >
                                <AppText color="#D07113" fontSize={15}>
                                    ✎
                                </AppText>
                            </View>

                            <View>
                                <AppText
                                    color={colors.darkthemetext}
                                    fontSize={12}
                                    fontFamily={Inter.medium}
                                >
                                    Edit Playlist
                                </AppText>
                                <AppText
                                    color="#817A77"
                                    fontSize={9}
                                    fontFamily={Inter.regular}
                                    marginTop={3}
                                >
                                    Change name or description
                                </AppText>
                            </View>
                        </TouchableOpacity>

                        {/* Play Playlist */}
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => {
                                setMenuVisible(false);
                                if (selectedPlaylist) {
                                    handlePlayPlaylist(selectedPlaylist);
                                }
                            }}
                        >
                            <View
                                style={[
                                    styles.actionIcon,
                                    { backgroundColor: '#1B1511' },
                                ]}
                            >
                                <AppImage
                                    source={Images.playicon}
                                    width={12}
                                    height={12}
                                />
                            </View>

                            <View>
                                <AppText
                                    color={colors.darkthemetext}
                                    fontSize={12}
                                    fontFamily={Inter.medium}
                                >
                                    Play Playlist
                                </AppText>
                                <AppText
                                    color="#817A77"
                                    fontSize={9}
                                    fontFamily={Inter.regular}
                                    marginTop={3}
                                >
                                    Start playing all songs
                                </AppText>
                            </View>
                        </TouchableOpacity>

                        {/* Quick Reorder: Move to Top */}
                        {playlists.length > 1 && (
                            <TouchableOpacity
                                style={styles.actionItem}
                                onPress={() => {
                                    setMenuVisible(false);
                                    if (selectedPlaylist) {
                                        const idx = playlists.findIndex(
                                            p => p.id === selectedPlaylist.id,
                                        );
                                        if (idx > 0) {
                                            movePlaylistItem(idx, 0);
                                            dispatch(
                                                showToast({
                                                    visible: true,
                                                    message: `"${selectedPlaylist.name}" moved to top.`,
                                                    type: 'success',
                                                }),
                                            );
                                        }
                                    }
                                }}
                            >
                                <View
                                    style={[
                                        styles.actionIcon,
                                        { backgroundColor: '#1A1811' },
                                    ]}
                                >
                                    <AppText color="#EFCB61" fontSize={14}>
                                        ⤒
                                    </AppText>
                                </View>

                                <View>
                                    <AppText
                                        color={colors.darkthemetext}
                                        fontSize={12}
                                        fontFamily={Inter.medium}
                                    >
                                        Move to Top
                                    </AppText>
                                    <AppText
                                        color="#817A77"
                                        fontSize={9}
                                        fontFamily={Inter.regular}
                                        marginTop={3}
                                    >
                                        Place this playlist at the beginning
                                    </AppText>
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Delete Playlist */}
                        <TouchableOpacity
                            style={[
                                styles.actionItem,
                                { borderBottomWidth: 0 },
                            ]}
                            onPress={() => handleDeletePlaylist()}
                        >
                            <View
                                style={[
                                    styles.actionIcon,
                                    { backgroundColor: '#2A1017' },
                                ]}
                            >
                                <AppText color="#E52450" fontSize={15}>
                                    ×
                                </AppText>
                            </View>

                            <View>
                                <AppText
                                    color="#E52450"
                                    fontSize={12}
                                    fontFamily={Inter.medium}
                                >
                                    Delete Playlist
                                </AppText>
                                <AppText
                                    color="#817A77"
                                    fontSize={9}
                                    fontFamily={Inter.regular}
                                    marginTop={3}
                                >
                                    Remove this playlist
                                </AppText>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView >
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

    topActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    reorderToggleBtn: {
        height: 34,
        paddingHorizontal: 12,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#30221D',
        backgroundColor: '#141110',
    },

    reorderToggleBtnActive: {
        borderColor: '#EFCB61',
        backgroundColor: '#262013',
    },

    createButton: {
        minWidth: 82,
        height: 34,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    listContent: {
        paddingBottom: 100,
    },

    /* ========================================= */
    /* SWIPE CONTAINER & CARD */
    /* ========================================= */
    swipeContainer: {
        position: 'relative',
        marginBottom: 10,
    },

    actionsContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 124,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
    },

    actionBtn: {
        width: 58,
        height: '100%',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },

    editActionBtn: {
        backgroundColor: '#24130D',
        borderColor: '#4A2616',
    },

    deleteActionBtn: {
        backgroundColor: '#2A1017',
        borderColor: '#541724',
    },

    playlistCard: {
        width: '100%',
        minHeight: 101,
        borderWidth: 1,
        borderRadius: 14,
        padding: 11,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0C0B0B',
    },

    cardInnerTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    reorderBadge: {
        marginRight: 8,
        backgroundColor: '#241712',
        borderWidth: 1,
        borderColor: '#452A1D',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
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

    /* Reorder Up / Down Controls */
    reorderControls: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 6,
    },

    reorderArrowBtn: {
        width: 32,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#1E1916',
        borderWidth: 1,
        borderColor: '#382B24',
        justifyContent: 'center',
        alignItems: 'center',
    },

    reorderArrowBtnDisabled: {
        opacity: 0.35,
        backgroundColor: '#12100F',
        borderColor: '#1D1917',
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
        width: 130,
        // paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* ========================= */
    /* CREATE / EDIT MODAL */
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
    /* THREE-DOT ACTION SHEET */
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
    modalScrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
});

export default CreatePlaylist;