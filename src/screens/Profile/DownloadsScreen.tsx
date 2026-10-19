import React, { useCallback, useState } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Sound from 'react-native-nitro-sound';
import ReactNativeBlobUtil from 'react-native-blob-util';

import ApiService from '../../services/api';
import apiUrls from '../../services/apiUrls';
import Header from '../../share/components/Header';
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import color, { useAppColors } from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import { Images, Logo } from '../../share/constants/media';
import { storage } from '../../share/storage/mmkv';
import { GlobalImage } from '../../share/utils/GlobalImage';
import { useAppDispatch, useAppSelector } from '../../share/hooks/useAppSelector';
import { playSongList, playTrackSong } from '../../services/player'
import { addsong, isPausesd } from '../../auth/redux/authSlice';
import TrackPlayer from '@rntp/player';

const DownloadsScreen = () => {
    const navigation = useNavigation<any>();
    const colors = useAppColors();
    const route = useRoute();
    const dispatch = useAppDispatch();
    const isPaused = useAppSelector(
        (state: any) => state.auth.isPaused
    );
    const [downloads, setDownloads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadings, setLoadings] = useState(false);
    const [playingId, setPlayingId] = useState<string | number | null>(null);

    /**
     * Auto-refresh downloads whenever screen comes into focus
     * and stop playing audio when navigating away
     */
    useFocusEffect(
        useCallback(() => {
            fetchDownloads();

            return () => {
                stopRecording();
            };
        }, [])
    );

    /**
     * Fetch downloaded songs:
     * 1. Reads local songs from MMKV (instant & offline)
     * 2. Fetches server-recorded downloads from API and merges them
     */
    const fetchDownloads = async (isPullToRefresh = false) => {
        if (!isPullToRefresh) {
            setLoading(true);
        }

        let localSongs: any[] = [];
        try {
            const savedDownloads = storage.getString('downloaded_songs');
            if (savedDownloads) {
                localSongs = JSON.parse(savedDownloads);
                setDownloads(localSongs);
            }
        } catch (err) {
            console.log('Error reading MMKV downloads:', err);
        }

        try {
            // Check if backend has a downloads endpoint
            const downloadUrl =
                (apiUrls as any)?.getdownloadsongs ||
                (apiUrls as any)?.downloadsongs ||
                (apiUrls as any)?.downloads;

            if (downloadUrl) {
                const endpoint =
                    typeof downloadUrl === 'function' ? downloadUrl() : downloadUrl;

                const response = await ApiService.get(endpoint);
                const data = (response as any)?.data;

                if (data?.success) {
                    const serverSongs =
                        data?.data || data?.songs || data?.downloads || [];

                    // Map server songs and merge with local paths from MMKV
                    const mergedSongs = serverSongs.map((srvItem: any) => {
                        const matchedLocal = localSongs.find(
                            loc => String(loc.id) === String(srvItem.id),
                        );

                        return {
                            id: srvItem.id,
                            title: srvItem.title || srvItem.name || 'Unknown Title',
                            artist:
                                srvItem.artist ||
                                srvItem.artist_name ||
                                'Unknown Artist',
                            image:
                                srvItem.cover_image_url ||
                                srvItem.cover_image ||
                                srvItem.image,
                            original_song:
                                srvItem.original_song ||
                                srvItem.download_url ||
                                srvItem.song_url,
                            duration: srvItem.duration || '0:00',
                            local_path: matchedLocal?.local_path || null,
                            download_date:
                                matchedLocal?.download_date ||
                                (srvItem.created_at
                                    ? new Date(srvItem.created_at).toLocaleDateString()
                                    : 'recently'),
                        };
                    });

                    // Add any local MMKV songs that might not yet be in server response
                    localSongs.forEach(loc => {
                        if (!mergedSongs.some((m: any) => String(m.id) === String(loc.id))) {
                            mergedSongs.unshift(loc);
                        }
                    });

                    setDownloads(mergedSongs);
                    // Update MMKV cache with latest data
                    storage.set('downloaded_songs', JSON.stringify(mergedSongs));
                }
            }
        } catch (error) {
            console.log('Error fetching downloads from server (using local cache):', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Remove download: cleans up local file, MMKV, and state
     */

    const removeDownload = (id: string | number) => {
        Alert.alert(
            'Remove Download',
            'Are you sure you want to remove this song from your downloads?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        const target = downloads.find(
                            item => String(item.id) === String(id),
                        );

                        // 1. Delete physical audio file if local_path exists
                        if (target?.local_path) {
                            try {
                                const exists = await ReactNativeBlobUtil.fs.exists(
                                    target.local_path,
                                );
                                if (exists) {
                                    await ReactNativeBlobUtil.fs.unlink(
                                        target.local_path,
                                    );
                                }
                            } catch (fsErr) {
                                console.log('File deletion error:', fsErr);
                            }
                        }

                        // 2. Stop audio if it was currently playing
                        if (playingId === id) {
                            stopRecording();
                        }

                        // 3. Update state & MMKV
                        const updated = downloads.filter(
                            item => String(item.id) !== String(id),
                        );
                        setDownloads(updated);
                        storage.set('downloaded_songs', JSON.stringify(updated));

                        // 4. Optional backend delete sync
                        try {
                            if ((apiUrls as any)?.deletedownload) {
                                await ApiService.delete(
                                    (apiUrls as any).deletedownload(id),
                                );
                            }
                        } catch (e) {
                            // ignore API delete error
                        }
                    },
                },
            ],
        );
    };

    /**
     * Play offline audio file (falls back to stream URL if offline path unavailable)
     */
    const playRecording = async (item: any) => {
        try {
            await Sound.stopPlayer();
            Sound.removePlayBackListener();
        } catch (e) { }

        setPlayingId(item.id?.toString());
        setLoadings(true);
        await dispatch(isPausesd(false));

        try {
            const list = Array.isArray(downloads) && downloads.length > 0 ? downloads : [item];
            const songIndex = list.findIndex(
                (s: any) => s.id?.toString() === item.id?.toString()
            );
            const initialIndex = songIndex >= 0 ? songIndex : 0;
            await playSongList(list, initialIndex, true);
        } catch (error) {
            console.log('MusicList play error:', error);
            dispatch(addsong({ ...item }));
        } finally {
            setLoadings(false);
        }
    };


    const stopRecording = async () => {
        try {
            console.log('Stopping player in MusicList');
            await dispatch(isPausesd(true));
            await TrackPlayer.pause();
            try {
                await Sound.pausePlayer();
            } catch (e) { }
        } catch (error) {
            console.log('Stop Error:', error);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const imageSource = item.image
            ? typeof GlobalImage === 'function'
                ? GlobalImage(item.image)
                : typeof item.image === 'string'
                    ? { uri: item.image }
                    : item.image
            : Images.profile;

        const isPlaying = String(playingId) === String(item.id);

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.card, { borderColor: colors.searhbarbordercolor || '#241A17' }]}
                onPress={() => (isPlaying ? stopRecording() : playRecording(item))}
            >
                <AppImage
                    source={imageSource}
                    width={62}
                    height={64}
                    radius={8}
                    resizeMode="cover"
                />

                <View style={styles.content}>
                    <AppText
                        fontSize={12}
                        fontWeight="700"
                        color={colors.darkthemetext}
                        fontFamily={Inter.medium}
                        numberOfLines={1}
                    >
                        {item.title || 'Unknown Title'}
                    </AppText>
                    <AppText
                        fontSize={10}
                        color="#8F8986"
                        marginTop={4}
                        fontFamily={Inter.regular}
                        numberOfLines={1}
                    >
                        {item.artist || 'Unknown Artist'}
                    </AppText>
                    <AppText
                        fontSize={8}
                        color="#AFA7A2"
                        marginTop={6}
                        fontFamily={Inter.light}
                    >
                        Downloaded {item.download_date || 'recently'}
                    </AppText>
                </View>

                <View style={styles.right}>
                    {/* Play / Pause Button */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.playButton, { borderColor: '#F3870C' }]}

                        onPress={() => {
                            (playingId?.toString() === item.id?.toString() && !isPaused)
                                ? stopRecording()
                                : playRecording(item)
                        }}
                    >
                        {
                            playingId?.toString() === item.id?.toString() && !isPaused
                                ? (
                                    <View style={styles.pauseContainer}>
                                        <View style={styles.pauseLine} />
                                        <View style={styles.pauseLine} />
                                    </View>
                                ) : (
                                    <AppImage
                                        source={Images.playicon}
                                        width={10}
                                        height={10}
                                        tintColor="#F3870C"
                                        resizeMode="contain"
                                    />
                                )}
                    </TouchableOpacity>

                    {/* Delete Download Button */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.deleteButton}
                        onPress={() => removeDownload(item.id)}
                    >
                        <AppImage
                            source={Logo.dustbin}
                            width={18}
                            height={18}
                            tintColor="#E52450"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: colors.darkbackround },
            ]}
        >
            <Header
                headername="Downloads"
                headertitle="Listen offline anytime"
                backpress={() => {
                    const previousScreen = route?.params?.previousScreen;
                    if (previousScreen) {
                        navigation.navigate(previousScreen);
                    } else {
                        navigation.navigate('Profile');
                    }
                }}
            //  onLeftPress={() => navigation.goBack()}
            />

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#EFCB61" />
                    <AppText
                        color="#8F8986"
                        fontSize={12}
                        marginTop={10}
                        fontFamily={Inter.regular}
                    >
                        Loading downloads...
                    </AppText>
                </View>
            ) : downloads.length > 0 ? (
                <FlatList
                    data={downloads}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchDownloads(true);
                            }}
                            tintColor="#EFCB61"
                        />
                    }
                />
            ) : (
                <View style={styles.centerContainer}>
                    <AppImage
                        source={Images.import}
                        width={40}
                        height={40}
                        tintColor="#AFA7A2"
                        resizeMode="contain"
                    />
                    <AppText
                        color={colors.darkthemetext}
                        fontSize={16}
                        marginTop={15}
                        fontFamily={Inter.medium}
                    >
                        No downloads yet
                    </AppText>
                    <AppText
                        color="#AFA7A2"
                        fontSize={12}
                        marginTop={5}
                        fontFamily={Inter.regular}
                    >
                        Songs you download will appear here.
                    </AppText>
                </View>
            )}
        </SafeAreaView>
    );
};

export default DownloadsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingTop: 16,
        paddingBottom: 80,
        gap: 12,
    },
    card: {
        borderRadius: 12,
        padding: 12,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: '#0C0B0B',
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E120F',
    },
    pauseContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    pauseLine: {
        width: 3,
        height: 12,
        backgroundColor: '#F3870C',
        borderRadius: 10,
    },
    deleteButton: {
        padding: 6,
    },
});