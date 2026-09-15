import React, { useState } from 'react';
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
}

const ClassicSongItem = ({ item, onPress }: Props) => {
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


    const playRecording = async (item: any) => {
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
        setPlayingId(item.id);
        await dispatch(isPausesd(false));
        setLoadings(true)
        console.log(item.id, item.song_url, "dkdkbkdbkdb5")
        // try {
        //   const result = await Sound.startPlayer(item.song_url);

        //   console.log('Playing:', result);
        //   await Sound.removePlayBackListener();
        //   Sound.addPlayBackListener((e) => {
        //     setLoadings(false)
        //     console.log(
        //       'Current:',
        //       Sound.mmssss(Math.floor(e.currentPosition)),
        //     );

        dispatch(
            addsong({
                ...item,
            }),)
        setLoadings(false)
        console.log(playsong, "dkdkbkdbkdb5")
        //     if (e.currentPosition >= e.duration) {
        //       Sound.stopPlayer();
        //       Sound.removePlayBackListener();
        //       setPlay(true)
        //       setPlayingId(null)
        //     }
        //   });
        // } catch (error) {
        //   console.log('Play error:', error);
        // }
    };

    const stopRecording = async () => {
        try {
            console.log('Stopping player');

            await Sound.pausePlayer();
            await dispatch(isPausesd(true));
            setPlayingId(null);
        } catch (error) {
            console.log('Stop Error:', error);
        }
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
                <AppText style={styles.info}>
                    ❤️ {item.likes_count}
                </AppText>

                <AppText style={styles.info}>
                    {Number(item.duration || 0).toFixed(2) || '00:00'}
                </AppText>

                <View
                    style={[
                        styles.levelBadge,
                        { borderColor: levelColor, borderWidth: 1 },
                    ]}>
                    <AppText style={[styles.levelText, { color: levelColor }]}>
                        {item.badge}
                    </AppText>
                </View>
                {/* </View> */}

                <TouchableOpacity
                    onPress={() => {
                        playingId === item.id
                            ? stopRecording()
                            : playRecording(item)
                    }}
                    style={styles.playButton}>
                    {loadings && playingId == item.id ? (
                        <ActivityIndicator
                            size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            {
                                playingId == item.id ?
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