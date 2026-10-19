
import React from 'react';
import {
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppText from './AppText';
import { Inter } from '../constants/fonts';
import { GlobalImage } from '../utils/GlobalImage';

interface Band {
    id: string;
    name: string;
    song_count: number | string;
    cover_image_url?: string;
}

interface Props {
    item: Band;
    onpressbtn?: (item: Band) => void;
}

const PlaylistCard: React.FC<Props> = ({ item, onpressbtn }) => {
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.8}
            onPress={() => onpressbtn?.(item)}
        >
            <ImageBackground
                source={
                    item.cover_image_url
                        ? GlobalImage(item.cover_image_url)
                        : undefined
                }
                style={styles.image}
                imageStyle={styles.imageStyle}
            >
                <View style={styles.info}>
                    <AppText style={styles.name} numberOfLines={1}>
                        {item.name}
                    </AppText>

                    <AppText style={styles.songs}>
                        {item.song_count} songs
                    </AppText>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

export default PlaylistCard;

const styles = StyleSheet.create({
    container: {
        width: 90,
        height: 80,
        marginRight: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },

    image: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        backgroundColor: '#171717',
    },

    imageStyle: {
        borderRadius: 8,
    },

    info: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },

    name: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        fontFamily: Inter.semibold,
    },

    songs: {
        marginTop: 2,
        color: '#B4B1AD',
        fontSize: 8,
    },
});
