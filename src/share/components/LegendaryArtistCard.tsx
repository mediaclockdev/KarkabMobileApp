import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';
import { Images, Logo } from '../constants/media';
import { Inter } from '../constants/fonts';

interface Artist {
    id: string;
    name: string;
    songs: string;
    badge: string;
    image: string;
}

interface Props {
    item: Artist;
    onPress?: () => void;
    loading?: boolean;
}

const LegendaryArtistCard = ({ item, onPress, loading }: Props) => {
    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#F6A202" />
            </View>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={styles.container}>
            <View style={styles.imageWrapper}>
                <AppImage
                    source={Images.profile}
                    width={88}
                    height={88}
                    borderRadius={44}
                />

                {/* <View style={styles.verify}>
                    <AppText style={styles.verifyText}>✓</AppText>
                </View> */}
            </View>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <AppText numberOfLines={1} style={styles.name}>
                    {item.name}
                </AppText>
                <AppImage
                    source={Logo.Bluetick}
                    height={10}
                    width={10}
                />
            </View>


            <AppText style={styles.songs}>
                {item.songs}
            </AppText>

            <View style={styles.badge}>
                <AppText style={styles.badgeText}>
                    👑 {item.badge}
                </AppText>
            </View>
        </TouchableOpacity>
    );
};

export default LegendaryArtistCard;

const styles = StyleSheet.create({
    container: {
        width: 120,
        marginRight: 18,
        alignItems: 'center',
        marginTop: 10
    },

    imageWrapper: {
        width: 76,
        height: 76,
        borderRadius: 88,
        borderWidth: 2,
        borderColor: '#F6A202',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },

    verify: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F6A202',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#111',
    },

    verifyText: {
        color: '#111',
        fontWeight: '700',
        fontSize: 12,
    },

    name: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },

    songs: {
        color: '#9F9F9F',
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
    },

    badge: {
        marginTop: 10,
        // backgroundColor: '#30240A',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F6A202',
        alignItems: 'center'
    },

    badgeText: {
        color: '#F6A202',
        fontSize: 8,
        // fontWeight: '600',
        fontFamily: Inter.regular
    },
    loaderContainer: {
        width: 120,
        height: 170,
        justifyContent: 'center',
        alignItems: 'center',
    },
});