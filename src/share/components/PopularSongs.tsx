
import React from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';
import { Inter } from '../constants/fonts';
import { useAppColors } from '../constants/color';

interface Song {
    id: string;
    title: string;
    artist: string;
    image?: string;
    cover_image_url?: string;
}

interface PopularSongsProps {
    songs?: Song[];
    onSeeAll?: () => void;
    onPlay?: (song: Song) => void;
}

const { width } = Dimensions.get('window');

const PopularSongs: React.FC<PopularSongsProps> = ({
    songs = [],
    onSeeAll,
    onPlay,
}) => {
    const colors = useAppColors();

    return (
        <FlatList
            horizontal
            data={songs?.slice(0, 10)}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) =>
                String(item?.id || index)
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <AppText
                        color="#999"
                        fontSize={14}
                        fontFamily={Inter.medium}
                    >
                        No popular songs available
                    </AppText>
                </View>
            }
            contentContainerStyle={[
                styles.listContainer,
                songs.length === 0 && styles.emptyListContainer,
            ]}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onPlay?.(item)}
                    style={[
                        styles.card,
                        {
                            borderColor: colors.homebordercolor,
                        },
                    ]}
                >
                    {/* Song Image */}
                    <AppImage
                        source={item?.cover_image_url || item?.image}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    {/* Dark Overlay */}
                    <View style={styles.overlay} />

                    {/* Song Details */}
                    <View style={styles.bottomContent}>
                        <AppText
                            color="#FFFFFF"
                            fontSize={14}
                            fontFamily={Inter.semibold}
                            numberOfLines={1}
                        >
                            {item.title}
                        </AppText>

                        <AppText
                            color="#D4AF37"
                            fontSize={11}
                            fontFamily={Inter.medium}
                            marginTop={4}
                            numberOfLines={1}
                        >
                            {item.artist || 'Popular Song'}
                        </AppText>
                    </View>

                    {/* Song Number */}
                    <View style={styles.numberContainer}>
                        <AppText
                            color="#FFFFFF"
                            fontSize={11}
                            fontFamily={Inter.bold}
                        >
                            {String(index + 1).padStart(2, '0')}
                        </AppText>
                    </View>

                    {/* Play Button */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onPlay?.(item)}
                        style={styles.playButton}
                    >
                        <AppText
                            color="#FFFFFF"
                            fontSize={16}
                            fontFamily={Inter.semibold}
                            style={{ marginLeft: 2 }}
                        >
                            ▶
                        </AppText>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}
        />
    );
};

export default PopularSongs;

const styles = StyleSheet.create({
    listContainer: {
        gap: 12,
        paddingRight: 10,
        marginBottom: 15,
    },

    card: {
        width: 105,
        height: 105,
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#111',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },

    bottomContent: {
        position: 'absolute',
        left: 10,
        bottom: 10,
        right: 45,
    },

    numberContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        minWidth: 27,
        height: 25,
        paddingHorizontal: 5,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    playButton: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        width: 28,
        height: 28,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#6B625D',
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyListContainer: {
        flexGrow: 1,
    },

    emptyContainer: {
        height: 100,
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
