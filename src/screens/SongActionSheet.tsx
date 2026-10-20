
import React from 'react';
import {
    Animated,
    Clipboard,
    Dimensions,
    Pressable,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
    Modal,
    FlatList,
    ActivityIndicator,
    TextInput,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import ApiService from '../services/api';
import apiUrls from '../services/apiUrls';
import AppText from '../share/components/AppText';
import AppImage from '../share/components/AppImage';
import color from '../share/constants/color';
import { Inter } from '../share/constants/fonts';
import { useAppDispatch } from '../share/hooks/useAppSelector';
import { showToast } from '../auth/redux/authSlice';
import { Images, Logo, Banner } from '../share/constants/media';
import { storage } from '../share/storage/mmkv';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SongAction {
    id: string;
    title: string;
    icon?: any;
    onPress: () => void;
    danger?: boolean;
}

interface SongActionSheetProps {
    visible: boolean;
    song?: any;
    onClose: () => void;
    onDeleted?: (songId: number | string) => void;
}

const SongActionSheet = ({
    visible,
    song,
    onClose,
    onDeleted,
}: SongActionSheetProps) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const translateY = React.useRef(
        new Animated.Value(SCREEN_HEIGHT),
    ).current;

    const [mounted, setMounted] = React.useState(visible);

    // --- Playlist Feature State ---
    const [playlistModalVisible, setPlaylistModalVisible] = React.useState(false);
    const [createPlaylistModalVisible, setCreatePlaylistModalVisible] = React.useState(false);
    const [playlists, setPlaylists] = React.useState<any[]>([]);
    const [playlistsLoading, setPlaylistsLoading] = React.useState(false);
    const [newPlaylistName, setNewPlaylistName] = React.useState('');
    const [newPlaylistDesc, setNewPlaylistDesc] = React.useState('');
    const [addingSong, setAddingSong] = React.useState(false);
    const [creatingPlaylist, setCreatingPlaylist] = React.useState(false);

    const getPlaylists = async () => {
        try {
            setPlaylistsLoading(true);
            const response = await ApiService.get(apiUrls.createplaylist);
            const data = (response as any)?.data;
            if (data?.success) {
                const apiPlaylists = data?.data || data?.playlists || [];
                setPlaylists(apiPlaylists);
            }
        } catch (error) {
            console.log('GET PLAYLIST ERROR:', error);
            dispatch(showToast({ visible: true, message: 'Unable to load playlists.', type: 'error' }));
        } finally {
            setPlaylistsLoading(false);
        }
    };

    const handleAddSongToPlaylist = async (playlistId: string | number) => {
        if (!song?.id) return;
        try {
            setAddingSong(true);
            const response = await ApiService.post(apiUrls.addSongToPlaylist(playlistId), {
                song_ids: [song.id],
            });
            const data = (response as any)?.data;
            if (!data?.success) {
                dispatch(showToast({ visible: true, message: data?.message || 'Unable to add song.', type: 'error' }));
                return;
            }
            dispatch(showToast({ visible: true, message: 'Song added to playlist successfully.', type: 'success' }));
            setPlaylistModalVisible(false);
            closeSheet();
        } catch (error: any) {
            console.log('ADD SONG TO PLAYLIST ERROR:', error);
            dispatch(showToast({ visible: true, message: error?.response?.data?.message || 'Unable to add song.', type: 'error' }));
        } finally {
            setAddingSong(false);
        }
    };

    const handleCreatePlaylist = async () => {
        const name = newPlaylistName.trim();
        if (!name) {
            dispatch(showToast({ visible: true, message: 'Please enter a playlist name.', type: 'error' }));
            return;
        }
        try {
            setCreatingPlaylist(true);
            const response = await ApiService.post(apiUrls.createplaylist, {
                name,
                description: newPlaylistDesc.trim(),
            });

            const data = (response as any)?.data;
            if (!data?.success) {
                dispatch(showToast({ visible: true, message: data?.message || 'Unable to create playlist.', type: 'error' }));
                return;
            }
            const newPlaylistId = data?.data?.id || data?.playlist?.id;
            if (newPlaylistId && song?.id) {
                await ApiService.post(apiUrls.addSongToPlaylist(newPlaylistId), {
                    song_ids: [song.id],
                });
                dispatch(showToast({ visible: true, message: 'Playlist created and song added!', type: 'success' }));
            } else {
                dispatch(showToast({ visible: true, message: 'Playlist created successfully.', type: 'success' }));
            }
            getPlaylists();
            setCreatePlaylistModalVisible(false);
            setNewPlaylistName('');
            setNewPlaylistDesc('');
            setPlaylistModalVisible(false);
            closeSheet();
        } catch (error: any) {
            console.log('CREATE PLAYLIST ERROR:', error);
            dispatch(showToast({ visible: true, message: error?.response?.data?.message || 'Unable to create playlist.', type: 'error' }));
        } finally {
            setCreatingPlaylist(false);
        }
    };

    /**
     * Open / close animation
     */
    React.useEffect(() => {
        if (visible) {
            setMounted(true);
            translateY.setValue(SCREEN_HEIGHT);

            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 180,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 220,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    setMounted(false);
                }
            });
        }
    }, [visible, translateY]);

    const closeSheet = React.useCallback(() => {
        onClose();
    }, [onClose]);

    const handleAction = (action: SongAction) => {
        action.onPress();
    };

    /**
     * Storage permission check for Android
     */
    const checkStoragePermission = async () => {
        if (Platform.OS !== 'android') return true;

        // Android 10+ (API 29+) doesn't require WRITE_EXTERNAL_STORAGE for MediaStore
        if (Platform.Version >= 29) {
            return true;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission Required',
                    message: 'App needs storage access to save songs to your phone Downloads folder.',
                    buttonPositive: 'OK',
                },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    /**
     * Download the audio file and make it visible in the phone's Download directory
     */
    const downloadSongFileToDownloads = async (fileUrl: string, songData: any) => {
        try {
            const hasPermission = await checkStoragePermission();
            if (!hasPermission) {
                dispatch(
                    showToast({
                        visible: true,
                        message: 'Storage permission denied.',
                        type: 'error',
                    }),
                );
                return;
            }

            const rawTitle =
                songData?.title ||
                songData?.name ||
                song?.title ||
                song?.name ||
                'Song';

            // Clean title: keep letters, numbers, and Arabic characters (\u0600-\u06FF)
            const cleanTitle =
                rawTitle
                    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
                    .trim()
                    .replace(/\s+/g, ' ') || 'Song';

            const extension = fileUrl.split('.').pop()?.split('?')[0] || 'mp3';
            const fileName = `${cleanTitle}.${extension}`;
            const mimeType = extension === 'm4a' ? 'audio/mp4' : 'audio/mpeg';

            const { fs } = ReactNativeBlobUtil;
            const isAndroid = Platform.OS === 'android';

            // dispatch(
            //     showToast({
            //         visible: true,
            //         message: 'Downloading song to your phone...',
            //         type: 'success',
            //     }),
            // );

            // 1. Download file to cache first
            const downloadRes = await ReactNativeBlobUtil.config({
                fileCache: true,
                appendExt: extension,
            }).fetch('GET', fileUrl);

            const tempFilePath = downloadRes.path();
            let finalSavedPath = tempFilePath;

            // 2. Put file in the phone's public Downloads directory
            if (isAndroid) {
                let savedViaMediaStore = false;

                // Modern Android 10+ (API 29+): MediaStore Download directory
                if (ReactNativeBlobUtil.MediaCollection?.copyToMediaStore) {
                    try {
                        const mediaUri = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
                            {
                                name: fileName,
                                parentFolder: '', // Root of Downloads folder
                                mimeType: mimeType,
                            },
                            'Download',
                            tempFilePath,
                        );
                        finalSavedPath = mediaUri || `${fs.dirs.DownloadDir}/${fileName}`;
                        savedViaMediaStore = true;
                    } catch (mediaError) {
                        console.log('MediaStore fallback error:', mediaError);
                    }
                }

                // Fallback for older Android or direct copy: Copy to DownloadDir + scanFile
                if (!savedViaMediaStore) {
                    const destDownloadPath = `${fs.dirs.DownloadDir}/${fileName}`;

                    if (await fs.exists(destDownloadPath)) {
                        await fs.unlink(destDownloadPath);
                    }

                    await fs.cp(tempFilePath, destDownloadPath);
                    finalSavedPath = destDownloadPath;

                    // Trigger Android MediaScanner so it immediately appears in the Downloads & Files app
                    await fs.scanFile([{ path: destDownloadPath, mime: mimeType }]);
                }

                dispatch(
                    showToast({
                        visible: true,
                        message: `Saved to Downloads: ${fileName}`,
                        type: 'success',
                    }),
                );
            } else {
                // iOS: Copy to Documents and open native preview/share sheet
                const destPath = `${fs.dirs.DocumentDir}/${fileName}`;
                if (await fs.exists(destPath)) {
                    await fs.unlink(destPath);
                }
                await fs.cp(tempFilePath, destPath);
                finalSavedPath = destPath;

                ReactNativeBlobUtil.ios.previewDocument(destPath);

                dispatch(
                    showToast({
                        visible: true,
                        message: 'Song downloaded successfully.',
                        type: 'success',
                    }),
                );
            }

            // 3. Save song metadata to MMKV so it is immediately visible in DownloadsScreen
            try {
                const savedStr = storage.getString('downloaded_songs');
                const savedList = savedStr ? JSON.parse(savedStr) : [];
                const songId = songData?.id || song?.id;

                const filtered = savedList.filter(
                    (item: any) => String(item.id) !== String(songId),
                );

                const newDownloadItem = {
                    id: songId,
                    title: rawTitle,
                    artist:
                        songData?.artist ||
                        songData?.artist_name ||
                        song?.artist ||
                        song?.artist_name ||
                        'Unknown Artist',
                    image:
                        songData?.cover_image_url ||
                        songData?.cover_image ||
                        song?.cover_image_url ||
                        song?.image?.uri ||
                        song?.cover_image,
                    local_path: finalSavedPath,
                    original_song: fileUrl,
                    duration: songData?.duration || song?.duration || '0:00',
                    download_date: new Date().toLocaleDateString(),
                };

                storage.set('downloaded_songs', JSON.stringify([newDownloadItem, ...filtered]));
            } catch (storageErr) {
                console.log('Error saving download to MMKV:', storageErr);
            }
        } catch (downloadError: any) {
            console.log('DOWNLOAD FILE ERROR:', downloadError);
            dispatch(
                showToast({
                    visible: true,
                    message: downloadError?.message || 'Failed to save song to Downloads.',
                    type: 'error',
                }),
            );
        }
    };

    /**
     * Download handler: calls API & saves data.original_song to phone's Download directory
     */
    const handledownload = async (songId: number | string) => {
        closeSheet();

        try {
            const response = await ApiService.post(
                apiUrls.downloadsongs(songId),
            );

            const data = (response as any)?.data;

            if (data?.success === false) {
                dispatch(
                    showToast({
                        visible: true,
                        message: data?.message || 'Unable to download song.',
                        type: 'error',
                    }),
                );
                return;
            }

            // Extract original_song URL from response data
            const songData = data?.data || data;
            const originalSongUrl =
                songData?.original_song ||
                songData?.download_url ||
                songData?.song_url ||
                song?.original_song ||
                song?.download_url;

            if (!originalSongUrl) {
                dispatch(
                    showToast({
                        visible: true,
                        message: 'Song download URL not found.',
                        type: 'error',
                    }),
                );
                return;
            }

            // Download physical audio file into the phone's Download directory
            await downloadSongFileToDownloads(originalSongUrl, songData);

        } catch (error: any) {
            console.log('DOWNLOAD ERROR:', error?.response?.data || error);

            dispatch(
                showToast({
                    visible: true,
                    message:
                        error?.response?.data?.message ||
                        'Unable to download song.',
                    type: 'error',
                }),
            );
        }
    };

    const handleLikeDislike = async (
        songId: number | string,
        action: 'like' | 'dislike',
    ) => {
        closeSheet();
        try {
            const endpoint =
                action === 'like'
                    ? apiUrls.likesong(songId)
                    : apiUrls.dislikesong(songId);

            const response = await ApiService.post(endpoint);
            const data = (response as any)?.data;

            dispatch(
                showToast({
                    visible: true,
                    message:
                        data?.message ||
                        (action === 'like'
                            ? 'Song liked successfully.'
                            : 'Song disliked successfully.'),
                    type: 'success',
                }),
            );
        } catch (error: any) {
            dispatch(
                showToast({
                    visible: true,
                    message:
                        error?.response?.data?.message ||
                        `Unable to ${action} song.`,
                    type: 'error',
                }),
            );
        }
    };

    const handleAddtofav = async (
        songId: number | string,
        isfavorate: boolean | string,
    ) => {
        closeSheet();
        const isFavorite =
            isfavorate === true ||
            isfavorate === 'true' ||
            isfavorate === '1';

        try {
            const response = isFavorite
                ? await ApiService.delete(apiUrls.addfavorite(songId))
                : await ApiService.post(apiUrls.addfavorite(songId));

            const data = (response as any)?.data;

            if (!data?.success) {
                onDeleted?.(songId);
                dispatch(
                    showToast({
                        visible: true,
                        message: data?.message || 'Unable to update favorites.',
                        type: 'error',
                    }),
                );
                return;
            }

            dispatch(
                showToast({
                    visible: true,
                    message:
                        data?.message ||
                        (isFavorite
                            ? 'Song removed from favorites.'
                            : 'Song added to favorites.'),
                    type: 'success',
                }),
            );
            onDeleted?.(songId);
        } catch (error: any) {
            dispatch(
                showToast({
                    visible: true,
                    message: error?.response?.data?.message || 'Unable to update favorites.',
                    type: 'error',
                }),
            );
        }
    };

    const handleDeleteRecording = async (recordingId: number | string) => {
        closeSheet();
        try {
            const endpoint = apiUrls.singlerecdetail(recordingId);
            const response = await ApiService.delete(endpoint);
            const data = (response as any)?.data;

            onDeleted?.(recordingId);
            dispatch(
                showToast({
                    visible: true,
                    message: data?.message || 'Recording deleted successfully.',
                    type: 'success',
                }),
            );
        } catch (error: any) {
            dispatch(
                showToast({
                    visible: true,
                    message: error?.response?.data?.message || 'Unable to delete recording.',
                    type: 'error',
                }),
            );
        }
    };

    const handleRemovesong = async (
        songId: number | string,
        playlistId: number | string,
    ) => {
        closeSheet();
        try {
            const endpoint = apiUrls.deletesongplaylist(playlistId, songId);
            const response = await ApiService.delete(endpoint);
            const data = (response as any)?.data;

            onDeleted?.(playlistId);
            dispatch(
                showToast({
                    visible: true,
                    message: data?.message || 'Song removed from playlist successfully.',
                    type: 'success',
                }),
            );
        } catch (error: any) {
            dispatch(
                showToast({
                    visible: true,
                    message: error?.response?.data?.message || 'Unable to remove song from playlist.',
                    type: 'error',
                }),
            );
        }
    };

    const handleRequestPublic = async (recordingId: number | string) => {
        try {
            const response = await ApiService.post(
                apiUrls.requestPublicRecording(recordingId),
            );
            const data = (response as any)?.data;

            if (!data?.success) {
                dispatch(
                    showToast({
                        visible: true,
                        message: data?.message || 'Unable to request public verification.',
                        type: 'error',
                    }),
                );
                return;
            }

            dispatch(
                showToast({
                    visible: true,
                    message: data?.message || 'Public verification request submitted.',
                    type: 'success',
                }),
            );
        } catch (error: any) {
            dispatch(
                showToast({
                    visible: true,
                    message: error?.response?.data?.message || 'Unable to submit public verification request.',
                    type: 'error',
                }),
            );
        }
    };

    const handleShare = async () => {
        closeSheet();
        try {
            const songTitle = song?.title || song?.name || 'Unknown Song';
            const songId = song?.id;
            const songUrl = songId
                ? `https://karkab.com/song/${songId}`
                : 'https://karkab.com';

            await Share.share({
                title: songTitle,
                message: `${songTitle}\n${songUrl}`,
                url: songUrl,
            });
        } catch (error: any) {
            console.log('Share error:', error);
        }
    };

    const actions: SongAction[] = [
        {
            id: 'favorite',
            title:
                (song?.is_favorite ?? song?.is_favorite) === true
                    ? 'Remove from Favorite'
                    : 'Add to Favorite',
            icon: Images.star1,
            danger: (song?.is_favorite ?? song?.isfavorate) === true,
            onPress: () => {
                if (song?.id) {
                    const isFavorite = Boolean(
                        song?.is_favorite ?? song?.isfavorate,
                    );
                    handleAddtofav(song.id, isFavorite);
                } else {
                    closeSheet();
                }
            },
        },
        {
            id: 'playlist',
            title: 'Add to Playlist',
            icon: Images.playlist,
            onPress: () => {
                setPlaylistModalVisible(true);
                getPlaylists();
            },
        },
        {
            id: 'like',
            title: 'Like',
            icon: Banner.filllike,
            onPress: () => {
                if (song?.id) {
                    handleLikeDislike(song.id, 'like');
                } else {
                    closeSheet();
                }
            },
        },
        {
            id: 'dislike',
            title: 'Dislike',
            icon: Images.like,
            onPress: () => {
                if (song?.id) {
                    handleLikeDislike(song.id, 'dislike');
                } else {
                    closeSheet();
                }
            },
        },
        {
            id: 'share',
            title: 'Share',
            icon: Logo.share,
            onPress: handleShare,
        },
        // {
        //     id: 'download',
        //     title: 'Download',
        //     icon: Images.import,
        //     onPress: () => {
        //         if (song?.id) {
        //             handledownload(song.id);
        //         } else {
        //             closeSheet();
        //         }
        //     },
        // },
        {
            id: 'copy-link',
            title: 'Copy Song Link',
            icon: Logo.copy,
            onPress: async () => {
                try {
                    const songId = song?.id;
                    const songUrl = songId
                        ? `https://karkab.com/song/${songId}`
                        : 'https://karkab.com';

                    await Clipboard.setString(songUrl);
                    closeSheet();

                    dispatch(
                        showToast({
                            visible: true,
                            message: 'Song link copied successfully.',
                            type: 'success',
                        }),
                    );
                } catch (error) {
                    closeSheet();
                    dispatch(
                        showToast({
                            visible: true,
                            message: 'Unable to copy song link.',
                            type: 'error',
                        }),
                    );
                }
            },
        },
        ...(song?.recording_url && song?.public_request_status != 'approved'
            ? [
                {
                    id: 'request-public',
                    title: 'Request Public Verification',
                    icon: Logo.glob,
                    onPress: () => {
                        if (song?.id) {
                            closeSheet();
                            handleRequestPublic(song.id);
                        } else {
                            closeSheet();
                        }
                    },
                },
                {
                    id: 'delete',
                    title: 'Delete',
                    icon: Logo.dustbin,
                    danger: true,
                    onPress: () => {
                        if (song?.id) {
                            handleDeleteRecording(song.id);
                        } else {
                            closeSheet();
                        }
                    },
                },
            ]
            : []),
        ...(song?.songType == 'Playlist'
            ? [
                {
                    id: 'Remove',
                    title: 'Remove',
                    icon: Images.bin,
                    danger: true,
                    onPress: () => {
                        if (song?.id) {
                            handleRemovesong(song.id, song?.playlistId);
                        } else {
                            closeSheet();
                        }
                    },
                },
            ]
            : []),
    ];

    if (!mounted) {
        return null;
    }

    return (
        <View
            pointerEvents={visible ? 'auto' : 'none'}
            style={StyleSheet.absoluteFill}
        >
            <Pressable style={styles.overlay} onPress={closeSheet} />

            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [{ translateY }],
                    },
                ]}
            >
                <View style={styles.dragIndicator} />

                {song && (
                    <View style={styles.songHeader}>
                        <View style={styles.songImageContainer}>
                            {song?.image?.uri ||
                                song?.cover_image ||
                                song?.cover_image_url ||
                                song?.coverImage ? (
                                <AppImage
                                    source={{
                                        uri:
                                            song?.image?.uri ||
                                            song?.cover_image_url ||
                                            song?.coverImage,
                                    }}
                                    width={56}
                                    height={56}
                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <AppText style={styles.musicIcon}>♫</AppText>
                                </View>
                            )}
                        </View>

                        <View style={styles.songInfo}>
                            <AppText
                                numberOfLines={1}
                                fontSize={15}
                                fontFamily={Inter.semiBold}
                                color={color.darkthemetext}
                            >
                                {song?.title || song?.name || 'Unknown Song'}
                            </AppText>

                            <AppText
                                numberOfLines={1}
                                fontSize={12}
                                fontFamily={Inter.regular}
                                color="#999999"
                                style={styles.artist}
                            >
                                {song?.artist_name ||
                                    song?.artistName ||
                                    song?.artist ||
                                    'Unknown Artist'}
                            </AppText>
                        </View>
                    </View>
                )}

                <View style={styles.separator} />

                <View style={styles.actionsContainer}>
                    {actions.map(action => (
                        <TouchableOpacity
                            key={action.id}
                            activeOpacity={0.7}
                            style={styles.action}
                            onPress={() => handleAction(action)}
                        >
                            <View style={styles.actionIcon}>
                                {action.icon ? (
                                    <AppImage
                                        source={action.icon}
                                        width={20}
                                        height={20}
                                        tintColor={
                                            action.danger
                                                ? '#FF4B4C'
                                                : color.darkthemetext
                                        }
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <AppText
                                        fontSize={20}
                                        color={
                                            action.danger
                                                ? '#FF4B4C'
                                                : color.darkthemetext
                                        }
                                    >
                                        •
                                    </AppText>
                                )}
                            </View>

                            <AppText
                                fontSize={14}
                                fontFamily={Inter.medium}
                                color={
                                    action.danger
                                        ? '#FF4B4C'
                                        : color.darkthemetext
                                }
                            >
                                {action.title}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.cancelButton}
                    onPress={closeSheet}
                >
                    <AppText
                        fontSize={14}
                        fontFamily={Inter.semibold}
                        color={color.darkthemetext}
                    >
                        Cancel
                    </AppText>
                </TouchableOpacity>
            </Animated.View>

            {/* Playlist Selection Modal */}
            <Modal
                visible={playlistModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setPlaylistModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.playlistModalContainer}>
                        <View style={styles.modalHeaderInner}>
                            <AppText
                                color={color.darkthemetext}
                                fontSize={17}
                                fontFamily={Inter.semiBold}
                            >
                                Add to Playlist
                            </AppText>
                            <TouchableOpacity
                                onPress={() => setPlaylistModalVisible(false)}
                            >
                                <AppText color="#8F8986" fontSize={25}>
                                    ×
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.createNewBtn}
                            onPress={() => setCreatePlaylistModalVisible(true)}
                        >
                            <AppText
                                color={color.darkthemetext}
                                fontSize={15}
                                fontFamily={Inter.medium}
                            >
                                + Create New Playlist
                            </AppText>
                        </TouchableOpacity>

                        {playlistsLoading ? (
                            <ActivityIndicator
                                size="large"
                                color="#FF4B4C"
                                style={{ marginTop: 20 }}
                            />
                        ) : (
                            <FlatList
                                data={playlists}
                                keyExtractor={item => String(item.id)}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.playlistItem}
                                        onPress={() =>
                                            handleAddSongToPlaylist(item.id)
                                        }
                                        disabled={addingSong}
                                    >
                                        <AppImage
                                            source={
                                                item.image
                                                    ? { uri: item.image }
                                                    : Images.profile
                                            }
                                            width={50}
                                            height={50}
                                            radius={8}
                                        />
                                        <View style={styles.playlistItemInfo}>
                                            <AppText
                                                color={color.darkthemetext}
                                                fontSize={15}
                                                fontFamily={Inter.medium}
                                            >
                                                {item.name}
                                            </AppText>
                                            <AppText
                                                color="#8F8986"
                                                fontSize={12}
                                                fontFamily={Inter.regular}
                                            >
                                                {item.songs_count ??
                                                    item.song_count ??
                                                    item.songs ??
                                                    0}{' '}
                                                songs
                                            </AppText>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            marginTop: 30,
                                        }}
                                    >
                                        <AppText
                                            color="#8F8986"
                                            fontSize={14}
                                        >
                                            No playlists found.
                                        </AppText>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Create Playlist Modal */}
            <Modal
                visible={createPlaylistModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCreatePlaylistModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.playlistModalContainer}>
                        <View style={styles.modalHeaderInner}>
                            <AppText
                                color={color.darkthemetext}
                                fontSize={17}
                                fontFamily={Inter.semiBold}
                            >
                                Create New Playlist
                            </AppText>
                            <TouchableOpacity
                                onPress={() =>
                                    setCreatePlaylistModalVisible(false)
                                }
                            >
                                <AppText color="#8F8986" fontSize={25}>
                                    ×
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        <AppText
                            color={color.darkthemetext}
                            fontSize={13}
                            fontFamily={Inter.medium}
                            style={{ marginTop: 10 }}
                        >
                            Playlist Name
                        </AppText>
                        <TextInput
                            value={newPlaylistName}
                            onChangeText={setNewPlaylistName}
                            placeholder="Enter playlist name"
                            placeholderTextColor="#716B69"
                            style={styles.modalInput}
                        />

                        <AppText
                            color={color.darkthemetext}
                            fontSize={13}
                            fontFamily={Inter.medium}
                            style={{ marginTop: 10 }}
                        >
                            Description (Optional)
                        </AppText>
                        <TextInput
                            value={newPlaylistDesc}
                            onChangeText={setNewPlaylistDesc}
                            placeholder="Enter description"
                            placeholderTextColor="#716B69"
                            style={styles.modalInput}
                        />

                        <TouchableOpacity
                            style={styles.modalSubmitBtn}
                            onPress={handleCreatePlaylist}
                            disabled={creatingPlaylist}
                        >
                            {creatingPlaylist ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <AppText
                                    color="#FFF"
                                    fontSize={14}
                                    fontFamily={Inter.semiBold}
                                >
                                    Create & Add Song
                                </AppText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SongActionSheet;

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: color.darkbackround,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 28,
        zIndex: 1000,
    },
    dragIndicator: {
        width: 42,
        height: 4,
        borderRadius: 10,
        backgroundColor: '#555555',
        alignSelf: 'center',
        marginBottom: 18,
    },
    songHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    songImageContainer: {
        width: 56,
        height: 56,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color.darkbackround,
    },
    musicIcon: {
        fontSize: 24,
        color: '#999999',
    },
    songInfo: {
        flex: 1,
        marginLeft: 12,
    },
    artist: {
        marginTop: 5,
    },
    separator: {
        height: 1,
        backgroundColor: '#292929',
        marginBottom: 6,
    },
    actionsContainer: {
        marginTop: 2,
    },
    action: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        width: 42,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    cancelButton: {
        height: 52,
        marginTop: 8,
        borderRadius: 12,
        backgroundColor: '#252525',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    playlistModalContainer: {
        backgroundColor: color.darkbackround,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 15,
        maxHeight: '80%',
    },
    modalHeaderInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    createNewBtn: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#292929',
        marginBottom: 10,
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#292929',
    },
    playlistItemInfo: {
        marginLeft: 15,
        flex: 1,
    },
    modalInput: {
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        color: color.darkthemetext,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginTop: 8,
        marginBottom: 10,
        fontSize: 14,
    },
    modalSubmitBtn: {
        backgroundColor: '#FF4B4C',
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 20,
    },
});
