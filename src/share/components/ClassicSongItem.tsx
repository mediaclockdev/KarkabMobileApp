import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';
import { Images } from '../constants/media';
import { GlobalImage } from '../utils/GlobalImage';
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector';
import { Sound } from 'react-native-nitro-sound';
import { addsong, isPausesd } from '../../auth/redux/authSlice';
import { color } from '../constants/color';
import TrackPlayer from '@rntp/player';
import { playSongList, playTrackSong } from '../../services/player';

interface Song {
    id: string;
    title: string;
    artist: string;
    likes: string;
    duration: string;
    badge: string;
    image: string;
}

interface Props {
    item: Song;
    onPress?: () => void;
    songList?: any[];
    index?: number;
}

const ClassicSongItem = ({ item, onPress, songList, index }: Props) => {
    const levelColor =
        item?.badge === 'Easy'
            ? '#9AF332'
            : item.level === 'Intermediate'
                ? '#F8C706'
                : '#F36303';

    const levelColorb =
        item?.badge === 'Easy'
            ? '#c4ffde'
            : item.level === 'Intermediate'
                ? '#ffe8bd'
                : '#ffaea5';

    const [playingId, setPlayingId] = useState<string | null>(null);
    const [loadings, setLoadings] = useState(false);
    const dispatch = useAppDispatch();
    const playsong = useAppSelector(
        (state: any) => state.auth.playsong
    );
    const isPaused = useAppSelector(
        (state: any) => state.auth.isPaused
    );

    // Sync playingId with Redux playsong so active track highlight updates automatically
    useEffect(() => {
        if (playsong?.id) {
            setPlayingId(playsong.id.toString());
        } else {
            setPlayingId(null);
        }
    }, [playsong?.id]);

    const playRecording = async (item: any) => {
        try {
            await Sound.stopPlayer();
            Sound.removePlayBackListener();
        } catch (e) { }

        setPlayingId(item.id?.toString());
        await dispatch(isPausesd(false));
        setLoadings(true);

        try {
            if (Array.isArray(songList) && songList.length > 0) {
                const targetIdx =
                    typeof index === 'number' && index >= 0
                        ? index
                        : songList.findIndex(
                            (s: any) => s.id?.toString() === item.id?.toString(),
                        );
                await playSongList(songList, targetIdx >= 0 ? targetIdx : 0, true);
            } else {
                await playTrackSong(item, true);
            }
        } catch (error) {
            console.log('ClassicSongItem play error:', error);
            dispatch(addsong({ ...item }));
        } finally {
            setLoadings(false);
        }
    };

    const stopRecording = async () => {
        try {
            console.log('Stopping player in ClassicSongItem');
            await dispatch(isPausesd(true));
            await TrackPlayer.pause();
            try {
                await Sound.pausePlayer();
            } catch (e) { }
        } catch (error) {
            console.log('Stop Error:', error);
        }
    };

    const formatDuration = (duration: any) => {
        if (duration === null || duration === undefined || duration === '') {
            return '00:00';
        }

        // Already formatted as MM:SS
        if (typeof duration === 'string' && duration.includes(':')) {
            return duration;
        }

        const seconds = Number(duration);

        if (!Number.isFinite(seconds) || seconds < 0) {
            return '00:00';
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${String(minutes).padStart(2, '0')}:${String(
            remainingSeconds,
        ).padStart(2, '0')}`;
    };
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={styles.container}>
            <View
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <AppImage
                    source={GlobalImage(item?.cover_image_url)}
                    width={56}
                    height={99}
                    resizeMode="cover"
                    style={{ alignSelf: 'center' }}
                />
            </View>
            <View style={styles.content}>
                <View>
                    <AppText numberOfLines={1} style={styles.title}>
                        {item.title}
                    </AppText>

                    <AppText numberOfLines={1} style={styles.artist}>
                        {item.artist}
                    </AppText>
                </View>



            </View>
            <View style={styles.actions}>
                {/* <View style={styles.infoRow}> */}
                {/* <AppText style={styles.info}>
                    ❤️ {item.likes_count}
                </AppText> */}

                <AppText style={styles.info}>
                    {formatDuration(item.duration)}
                </AppText>

                {/* <View
                    style={[
                        styles.levelBadge,
                        { borderColor: levelColor, borderWidth: 1 },
                    ]}>
                    <AppText style={[styles.levelText, { color: levelColor }]}>
                        {item.badge}
                    </AppText>
                </View> */}
                {/* </View> */}

                <TouchableOpacity
                    onPress={() => {
                        (playingId?.toString() === item.id?.toString() && !isPaused)
                            ? stopRecording()
                            : playRecording(item)
                    }}
                    style={styles.playButton}>
                    {loadings && playingId?.toString() === item.id?.toString() ? (
                        <ActivityIndicator
                            size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            {
                                playingId?.toString() === item.id?.toString() && !isPaused ?
                                    <View style={styles.pauseContainer}>
                                        <View style={styles.pauseLine} />
                                        <View style={styles.pauseLine} />
                                    </View> :
                                    <AppImage
                                        source={Images.playicon}
                                        width={10}
                                        height={10}
                                        tintColor={color.darkthemetext}
                                    />
                            }
                        </>)}
                </TouchableOpacity>

                {/* <TouchableOpacity style={styles.moreButton}>
                    <AppText style={styles.moreText}>⋮</AppText>
                </TouchableOpacity> */}
            </View>
        </TouchableOpacity>
    );
};

export default ClassicSongItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#181818',
        borderRadius: 18,
        //  padding: 12,
        height: 56,
        marginBottom: 14,
        justifyContent: 'space-between'
    },

    content: {
        flex: 1,
        marginLeft: 5,
        flexDirection: 'row'
    },

    title: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },

    artist: {
        color: '#AAAAAA',
        fontSize: 10,
        marginTop: 3,
        marginBottom: 8,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    info: {
        color: '#C8C8C8',
        fontSize: 10,
        // marginRight: 12,
    },

    levelBadge: {
        paddingHorizontal: 5,
        paddingVertical: 4,
        borderRadius: 10,
    },

    levelText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },

    actions: {
        alignItems: 'center',
        justifyContent: 'space-between',
        // height: 70,
        marginLeft: 12,
        flexDirection: 'row',
        gap: 10
    },

    playButton: {
        width: 28,
        height: 28,
        borderRadius: 21,
        // backgroundColor: '#F6A202',
        borderWidth: 1,
        borderColor: '#F6A202',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },

    playIcon: {
        color: '#FFFF',
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 2,
    },

    moreButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },

    moreText: {
        color: '#999',
        fontSize: 20,
        lineHeight: 20,
    },
    pauseLine: {
        width: 3,
        height: 14,
        backgroundColor: '#FFF',
        borderRadius: 10,
    },
    pauseContainer: {
        flexDirection: 'row',
        gap: 4,
    },
});