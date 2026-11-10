
import React from 'react';
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

import AppText from '../../share/components/AppText';
import AppImage from './AppImage';
import { Inter } from '../../share/constants/fonts';
import { Logo } from '../constants/media';
import color from '../constants/color';

interface Artist {
    id: string;
    name: string;
    time: string;
    image: string;
    album_picture_url?: string;
    album_name?: string;
    title?: string;
    public_request_status?: string;
    duration?: string;
}

interface PeopleWhoSangProps {
    artists?: Artist[];
    onPlay?: (artist: Artist) => void;
    onSeeAll?: () => void;
    profileimage?: any;
}

const PeopleWhoSang = ({
    artists = [],
    onPlay,
}: PeopleWhoSangProps) => {
    const { width } = useWindowDimensions();

    const renderArtist = ({ item }: { item: Artist }) => {
        const isLive = item?.public_request_status === 'approved';

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onPlay?.(item)}
                style={styles.artistCard}
            >
                {/* Album Artwork */}
                <View style={styles.imageContainer}>
                    <AppImage
                        source={item?.album_picture_url || item?.image}
                        style={styles.artistImage}
                        resizeMode="cover"
                    />

                    {isLive && (
                        <View style={styles.liveDot}>
                            <View style={styles.dot} />
                        </View>
                    )}
                </View>

                {/* Recording Information */}
                <View style={styles.artistInfo}>
                    <AppText
                        fontSize={13}
                        fontFamily={Inter.semibold}
                        color="#FFFFFF"
                        numberOfLines={1}
                    >
                        {item?.album_name || item?.name || 'Untitled'}
                    </AppText>

                    <AppText
                        marginTop={4}
                        fontSize={10}
                        fontFamily={Inter.regular}
                        color="#A9A9A9"
                        numberOfLines={1}
                    >
                        {item?.title || 'Recording'}
                    </AppText>

                    <View style={styles.bottomInfo}>
                        {isLive ? (
                            <View style={styles.liveBadge}>
                                <AppText
                                    fontSize={9}
                                    fontFamily={Inter.semibold}
                                    color="#22C983"
                                >
                                    LIVE
                                </AppText>
                            </View>
                        ) : (
                            <AppText
                                fontSize={9}
                                fontFamily={Inter.medium}
                                color="#999999"
                            >
                                Recording
                            </AppText>
                        )}

                        {!!item?.time && (
                            <AppText
                                fontSize={9}
                                fontFamily={Inter.medium}
                                color="#888888"
                            >
                                {item.time}
                            </AppText>
                        )}
                    </View>
                </View>

                {/* Play Button */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onPlay?.(item)}
                    style={styles.playButton}
                >
                    <AppText
                        fontSize={13}
                        fontFamily={Inter.semibold}
                        color="#FFFFFF"
                        style={{ marginLeft: 2 }}
                    >
                        ▶
                    </AppText>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={artists}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderArtist}
                keyExtractor={(item, index) =>
                    String(item?.id || index)
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View
                        style={[
                            styles.emptyContainer,
                            { width: width - 32 },
                        ]}
                    >
                        <AppImage
                            source={Logo.ymusic}
                            width={25}
                            height={25}
                        />

                        <AppText
                            color={color.darkthemetext}
                            fontSize={14}
                            fontFamily={Inter.medium}
                            marginTop={10}
                        >
                            No recorded songs found
                        </AppText>
                    </View>
                }
            />
        </View>
    );
};

export default PeopleWhoSang;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 15,
    },

    listContent: {
        gap: 12,
        paddingRight: 10,
    },

    artistCard: {
        width: 205,
        height: 78,
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#292929',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        paddingVertical: 8,
    },

    imageContainer: {
        width: 52,
        height: 52,
        borderRadius: 9,
        position: 'relative',
    },

    artistImage: {
        width: 52,
        height: 52,
        borderRadius: 9,
    },

    liveDot: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 13,
        height: 13,
        borderRadius: 10,
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
    },

    dot: {
        width: 7,
        height: 7,
        borderRadius: 5,
        backgroundColor: '#22C983',
    },

    artistInfo: {
        flex: 1,
        marginLeft: 9,
        justifyContent: 'center',
        overflow: 'hidden',
    },

    bottomInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    },

    liveBadge: {
        backgroundColor: 'rgba(34,201,131,0.12)',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },

    playButton: {
        width: 28,
        height: 28,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#494949',
        backgroundColor: '#202020',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },

    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
});
