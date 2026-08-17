import React, { useState } from 'react';

import {
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import AppText from './AppText';
import { Images } from '../constants/media';
import { Inter } from '../constants/fonts';
import AppImage from './AppImage';
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector';
import { GlobalImage } from '../utils/GlobalImage';
import { color } from '../constants/color';
import { Sound } from 'react-native-nitro-sound';




interface MiniPlayerProps {
    song: {
        title: string;
        artist: string;
        image: string;
    };
}


const MiniPlayer = ({ song }: MiniPlayerProps) => {
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadings, setLoadings] = useState(false);
    const dispatch = useAppDispatch();
    const playsong = useAppSelector
        (
            (state: any) => state.auth.playsong
        );



    const pauseAudio = async () => {
        try {
            console.log({
                isPlaying,
                isPaused,
            });
            console.log("PAUSE CLICKED");
            await Sound.pausePlayer();
            console.log("PAUSE SUCCESSfhfhfhfh ");

            setIsPlaying(false);
            dispatch(isPaused(true));
            setIsPaused(true);
        } catch (error) {
            console.log("PAUSE ERROR", error);
        }
    };

    const resumeAudio = async () => {
        try {
            await Sound.resumePlayer();

            setIsPlaying(true);
            setIsPaused(false);
        } catch (error) {
            console.log(error);
        }
    };
    if (!playsong?.id) {
        return null;
    }


    return (
        <View style={styles.container}>


            {/* Album Image */}
            <Image
                source={GlobalImage(playsong?.cover_image_url) || Images.singericon}
                style={styles.image}
            />



            {/* Song Info */}
            <View style={styles.info}>

                <AppText
                    numberOfLines={1}
                    style={styles.title}
                >
                    {playsong?.title || 'Mohammed Wardi'}
                </AppText>


                <AppText
                    numberOfLines={1}
                    style={styles.artist}
                >
                    {playsong?.artist || 'Sudan. 12.5K songs . 1.2 M listener'}
                </AppText>


            </View>

            <AppImage
                source={Images.like}
                height={16}
                width={16}

            />


            {/* Previous Button */}
            <TouchableOpacity style={styles.playButton} onPress={() => {
                if (isPlaying) {
                    pauseAudio();
                } else if (isPaused) {
                    resumeAudio();
                } else {
                    pauseAudio()
                    // playAudio();
                }
            }}>

                {loadings ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <>
                        {
                            isPaused ?
                                <AppImage
                                    source={Images.playicon}
                                    width={10}
                                    height={10}
                                    tintColor={color.darkthemetext}
                                />
                                :
                                <View style={styles.pauseContainer}>
                                    <View style={[styles.pauseLine, { backgroundColor: color.darkthemetext }]} />
                                    <View style={[styles.pauseLine, { backgroundColor: color.darkthemetext }]} />
                                </View>
                        }

                    </>)}


            </TouchableOpacity>


        </View>
    );
};


export default MiniPlayer;



const styles = StyleSheet.create({

    container: {
        position: 'absolute',
        bottom: 78,
        left: 8,
        right: 8,

        height: 47,

        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#111111',

        borderRadius: 12,

        paddingHorizontal: 12,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },



    image: {
        width: 34,
        height: 34,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: ""
    },



    info: {
        flex: 1,
        marginHorizontal: 12,
    },



    title: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        fontFamily: Inter.medium
    },



    artist: {
        color: '#6B7280',
        fontSize: 8,
        marginTop: 2,
    },



    iconButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },



    icon: {
        fontSize: 16,
        color: '#FFFFFF',
    },



    playButton: {
        width: 34,
        height: 34,
        borderRadius: 22,

        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F84E07',

        //    backgroundColor: '#FFFFFF',

        marginHorizontal: 5,
    },



    playIcon: {
        fontSize: 18,
        color: '#FFFFFF',
        marginLeft: 2,
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