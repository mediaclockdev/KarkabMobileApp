
import React from 'react';
import {
    FlatList,
    ImageSourcePropType,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';
import { Inter } from '../constants/fonts';
import { Images } from '../constants/media';
import { GlobalImage } from '../utils/GlobalImage';
import { useNavigation } from '@react-navigation/native';

type TagLIstItem = {
    id: number;
    title: string;
    artist: string;
    image?: ImageSourcePropType;
    cover_image_url?: string;
    likes_count?: number;
};

type TagLIstProps = {
    data?: TagLIstItem[];
};

export default function TagLIst({
    data = [],
}: TagLIstProps) {
    const navigation = useNavigation();

    const handlePress = (item: TagLIstItem) => {
        (navigation as any).navigate('.', {
            previousScreen: 'Search',
            id: item.id,
        });
    };

    return (
        <View>
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handlePress(item)}
                        style={styles.card}
                    >
                        {/* Album Artwork */}
                        <View style={styles.imageContainer}>
                            <AppImage
                                source={
                                    item?.cover_image_url
                                        ? GlobalImage(item.cover_image_url)
                                        : item?.image
                                }
                                width={145}
                                height={145}
                                resizeMode="cover"
                            />

                            {/* Bottom Image Overlay */}
                            <View style={styles.imageOverlay} />

                            {/* Play Button */}
                            <View style={styles.playButton}>
                                <AppImage
                                    source={Images.playicon}
                                    width={13}
                                    height={13}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        {/* Song Information */}
                        <View style={styles.infoContainer}>
                            <AppText
                                color="#FFFFFF"
                                fontSize={13}
                                fontFamily={Inter.regular}
                                numberOfLines={1}
                            >
                                {item?.title || 'Unknown Song'}
                            </AppText>

                            <AppText
                                color="#999999"
                                fontSize={11}
                                fontFamily={Inter.regular}
                                marginTop={4}
                                numberOfLines={1}
                            >
                                {item?.artist || 'Unknown Artist'}
                            </AppText>

                            {/* Likes */}
                            <View style={styles.likesContainer}>
                                <AppImage
                                    source={Images.ylit}
                                    width={12}
                                    height={12}
                                    resizeMode="contain"
                                />

                                <AppText
                                    color="#E52450"
                                    fontSize={11}
                                    fontFamily={Inter.regular}
                                    marginLeft={4}
                                >
                                    {item?.likes_count ?? 0}
                                </AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 10,
        paddingVertical: 12,
    },

    separator: {
        width: 12,
    },

    card: {
        width: 145,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#1A1919',
    },

    imageContainer: {
        width: 145,
        height: 145,
        position: 'relative',
        overflow: 'hidden',
    },

    imageOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },

    playButton: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#BC4402',
        alignItems: 'center',
        justifyContent: 'center',
    },

    infoContainer: {
        paddingHorizontal: 9,
        paddingTop: 9,
        paddingBottom: 10,
    },

    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 7,
    },
});
