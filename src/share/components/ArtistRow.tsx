import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';
import { Inter } from '../constants/fonts';
import { useAppColors } from '../constants/color';
import { Logo } from '../constants/media';

interface ArtistRowProps {
    artists: any[];
    onPress?: (artist: any) => void;
    onPlay?: (artist: any) => void;
}

const ArtistRow = ({
    artists = [],
    onPress,
    onPlay,
}: ArtistRowProps) => {
    const color = useAppColors();

    const artistdata = [
        {
            id: 1,
            name: 'Arijit Singh',
            image: 'https://i.pravatar.cc/150?img=12',
        },
        {
            id: 2,
            name: 'Shreya Ghoshal',
            image: 'https://i.pravatar.cc/150?img=47',
        },
        {
            id: 3,
            name: 'A.R. Rahman',
            image: 'https://i.pravatar.cc/150?img=11',
        },
        {
            id: 4,
            name: 'Sonu Nigam',
            image: 'https://i.pravatar.cc/150?img=53',
        },
        {
            id: 5,
            name: 'Neha Kakkar',
            image: 'https://i.pravatar.cc/150?img=44',
        },
        {
            id: 6,
            name: 'Atif Aslam',
            image: 'https://i.pravatar.cc/150?img=68',
        },
    ];

    return (
        <>

            {
                artists?.length === 0 ?

                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 40,
                    }}>

                        <AppText
                            color={color.darkthemetext}
                            fontSize={14}
                            fontFamily={Inter.medium}
                        >
                            No Artists found
                        </AppText>
                    </View>
                    :
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.container}
                    >
                        {artists.map((artist, index) => (
                            <TouchableOpacity
                                key={artist?.id ?? index}
                                activeOpacity={0.8}
                                onPress={() => onPress?.(artist)}
                                style={styles.artistItem}
                            >
                                <View
                                    style={[
                                        styles.imageContainer,
                                        {
                                            borderColor: color.homebordercolor,
                                        },
                                    ]}
                                >
                                    <AppImage
                                        source={{
                                            uri: artist?.artist_image || artist?.artist_image,
                                        }}
                                        width={72}
                                        height={72}
                                        style={styles.image}
                                    />

                                    {/* <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => onPlay?.(artist)}
                            style={{
                                position: 'absolute',
                                right: -2,
                                bottom: -2,
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                backgroundColor: '#D4AF37',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <AppText
                                color="#000000"
                                fontSize={13}
                                fontFamily={Inter.semibold}
                            >
                                ▶
                            </AppText>
                        </TouchableOpacity> */}
                                </View>

                                <AppText
                                    color={color.darkthemetext}
                                    fontSize={12}
                                    fontFamily={Inter.medium}
                                    numberOfLines={1}
                                    style={styles.name}
                                >
                                    {artist?.name || artist?.artistName}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
            }
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 14,
        paddingVertical: 8,
        marginBottom: 15
    },

    artistItem: {
        width: 82,
        alignItems: 'center',
    },

    imageContainer: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    image: {
        borderRadius: 36,
    },

    name: {
        marginTop: 8,
        textAlign: 'center',
        width: 82,
    },
});

export default ArtistRow;