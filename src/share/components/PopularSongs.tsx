import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AppImage from './AppImage';

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

const PopularSongs: React.FC<PopularSongsProps> = ({
    songs = [],
    onSeeAll,
    onPlay,
}) => {
    const renderSong = ({
        item,
        index,
    }: {
        item: Song;
        index: number;
    }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onPlay?.(item)}
                style={styles.card}
            >
                {/* Number */}
                <Text style={styles.number}>
                    {String(index + 1).padStart(2, '0')}
                </Text>

                {/* Song Image */}
                <AppImage
                    source={item?.cover_image_url || item?.image}
                    style={styles.songImage}
                    resizeMode="cover"
                />

                {/* Song Info */}
                <View style={styles.songInfo}>
                    <Text
                        style={styles.songTitle}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>

                    <Text
                        style={styles.artist}
                        numberOfLines={1}
                    >
                        {item.artist}
                    </Text>
                </View>

                {/* Play */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.playButton}
                    onPress={() => onPlay?.(item)}
                >
                    <Text style={styles.playIcon}>▶</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    No popular songs available
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={songs?.slice(0, 10)}
                renderItem={renderSong}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={[
                    styles.listContent,
                    songs.length === 0 && styles.emptyListContent,
                ]}
            />
        </View>
    );
};

export default PopularSongs;

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },

    listContent: {
        gap: 8,
    },

    emptyListContent: {
        flexGrow: 1,
    },

    emptyContainer: {
        // width: 250,
        height: 62,
        // backgroundColor: '#090909',
        // borderWidth: 1,
        // borderColor: '#252525',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
    },

    emptyText: {
        color: '#777777',
        fontSize: 12,
        fontWeight: '500',
    },

    card: {
        width: 195,
        height: 62,
        backgroundColor: '#090909',
        borderWidth: 1,
        borderColor: '#252525',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },

    number: {
        width: 27,
        color: '#FFCA28',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },

    songImage: {
        width: 43,
        height: 43,
        borderRadius: 3,
        marginRight: 8,
    },

    songInfo: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 5,
    },

    songTitle: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 4,
    },

    artist: {
        color: '#888888',
        fontSize: 8,
    },

    playButton: {
        width: 31,
        height: 31,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#3A3A3A',
        alignItems: 'center',
        justifyContent: 'center',
    },

    playIcon: {
        color: '#FFFFFF',
        fontSize: 11,
        marginLeft: 2,
    },
});