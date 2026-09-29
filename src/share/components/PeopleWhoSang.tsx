import React from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppText from '../../share/components/AppText';
import { Inter } from '../../share/constants/fonts';
import { Images, Logo } from '../constants/media';
import { GlobalImage } from '../utils/GlobalImage';
import AppImage from './AppImage';
import color from '../constants/color';

interface Artist {
    id: string;
    name: string;
    time: string;
    image: string;
}

interface PeopleWhoSangProps {
    artists?: Artist[];
    onPlay?: (artist: Artist) => void;
    onSeeAll?: () => void;
    profileimage?: any;
}

const DEFAULT_ARTISTS: Artist[] = [
    {
        id: '1',
        name: 'Ahmed',
        time: '1:42',
        image: Images.profile,
    },
    {
        id: '2',
        name: 'Sara',
        time: '2:15',
        image: Images.profile,
    },
    {
        id: '3',
        name: 'Mohamed',
        time: '3:05',
        image: Images.profile,
    },
    {
        id: '4',
        name: 'Heba',
        time: '1:58',
        image: Images.profile,
    },
];

const PeopleWhoSang = ({
    artists,
    onPlay,
    onSeeAll,
    profileimage,
}: PeopleWhoSangProps) => {
    const formatCreatedAt = (dateString?: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);

        if (isNaN(date.getTime())) return '';

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };
    const renderArtist = ({ item }: { item: Artist }) => {
        return (
            <View style={styles.artistCard}>
                {/* Artist Image */}
                {console.log(item, "hwhdjwjhkwdlwjldw")}

                <Image source={GlobalImage(profileimage?.avatar_url)} style={styles.artistImage} />

                {/* Artist Info */}
                <View style={styles.artistInfo}>
                    <AppText
                        fontSize={12}
                        fontFamily={Inter.semibold}
                        color="#FFFFFF"
                        numberOfLines={1}>
                        {item?.title}
                    </AppText>

                    <AppText
                        marginTop={3}
                        fontSize={10}
                        fontFamily={Inter.regular}
                        color="#A9A9A9"
                    >
                        {formatCreatedAt(item?.created_at)}
                    </AppText>
                </View>

                {/* Play Button */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.playButton}
                    onPress={() => onPlay?.(item)}>
                    <AppText
                        fontSize={10}
                        fontFamily={Inter.semibold}
                        color="#FFFFFF"
                        style={styles.playIcon}>
                        ▶
                    </AppText>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}


            {/* Artists */}
            <FlatList
                data={artists}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderArtist}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 40,
                }}>
                    <AppImage
                        source={Logo.ymusic}
                        width={20}
                        height={20}
                    />
                    <AppText
                        color={color.darkthemetext}
                        fontSize={14}
                        marginTop={10}
                    >
                        No songs found
                    </AppText>
                </View>}

            />
        </View>
    );
};

export default PeopleWhoSang;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 15
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },

    seeAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    arrow: {
        marginLeft: 3,
        marginTop: -2,
    },

    listContent: {

        gap: 10,
    },

    artistCard: {
        width: 140,
        height: 55,
        borderRadius: 10,
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#252525',

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 12,
    },

    artistImage: {
        width: 34,
        height: 34,
        borderRadius: 32,
    },

    artistInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },

    playButton: {
        width: 22,
        height: 22,
        borderRadius: 21,

        borderWidth: 1,
        borderColor: '#383838',

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#0D0D0D',
    },

    playIcon: {
        marginLeft: 2,
    },
});