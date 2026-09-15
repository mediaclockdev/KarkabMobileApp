import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../share/components/AppText';
import SearchBar from '../../share/components/SearchBar';
import AppImage from '../../share/components/AppImage';

import color from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import { Images, Logo } from '../../share/constants/media';
import { useNavigation } from '@react-navigation/native';

const categories = [
    'All',
    'Live',
    'Concert',
    'Acoustic',
    'Traditional',
    'Popular',
];

const performances = [
    {
        id: '1',
        title: 'Live Sudanese Night',
        artist: 'Mohammed Wardi',
        views: '1.2M views',
        duration: '08:42',
        image:
            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
    },
    {
        id: '2',
        title: 'Nile Concert',
        artist: 'Mustafa Al Sadiq',
        views: '845K views',
        duration: '06:18',
        image:
            'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b',
    },
    {
        id: '3',
        title: 'Sudanese Acoustic',
        artist: 'Asma',
        views: '624K views',
        duration: '05:34',
        image:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    },
    {
        id: '4',
        title: 'Khartoum Live',
        artist: 'Jalal Mohamed',
        views: '512K views',
        duration: '07:25',
        image:
            'https://images.unsplash.com/photo-1506157786151-b8491531f063',
    },
    {
        id: '5',
        title: 'Classic Sudanese',
        artist: 'Majaj Band',
        views: '438K views',
        duration: '09:12',
        image:
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    },
    {
        id: '6',
        title: 'Nubian Performance',
        artist: 'Nubian Voice',
        views: '389K views',
        duration: '06:47',
        image:
            'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
    },
];

const popularPerformances = [
    {
        id: '1',
        title: 'Sudanese Live Session',
        artist: 'Mohammed Wardi',
        image:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    },
    {
        id: '2',
        title: 'Nile Evening',
        artist: 'Asma',
        image:
            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
    },
    {
        id: '3',
        title: 'Classic Live',
        artist: 'Majaj Band',
        image:
            'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b',
    },
];

const PerformanceScreen = () => {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState('All');

    const renderPerformance = ({
        item,
    }: {
        item: (typeof performances)[0];
    }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.performanceCard}
            >
                <View style={styles.thumbnailContainer}>
                    <AppImage
                        source={{ uri: item.image }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />

                    <View style={styles.thumbnailOverlay} />

                    {/* Play button */}
                    <View style={styles.playButton}>
                        <AppText style={styles.playIcon}>
                            ▶
                        </AppText>
                    </View>

                    {/* Duration */}
                    <View style={styles.durationContainer}>
                        <AppText style={styles.duration}>
                            {Number(item.duration || 0).toFixed(2) || '00:00'}
                        </AppText>
                    </View>
                </View>

                <View style={styles.performanceInfo}>
                    <AppText
                        style={styles.performanceTitle}
                        numberOfLines={1}
                    >
                        {item.title}
                    </AppText>

                    <AppText
                        style={styles.artistName}
                        numberOfLines={1}
                    >
                        {item.artist}
                    </AppText>

                    <AppText style={styles.views}>
                        {item.views}
                    </AppText>
                </View>

                <TouchableOpacity
                    style={styles.moreButton}
                    activeOpacity={0.7}
                >
                    <AppText style={styles.moreIcon}>
                        ⋮
                    </AppText>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderPopular = ({
        item,
    }: {
        item: (typeof popularPerformances)[0];
    }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.popularCard}
            >
                <AppImage
                    source={{ uri: item.image }}
                    style={styles.popularImage}
                    resizeMode="cover"
                />

                <View style={styles.popularOverlay} />

                <View style={styles.smallPlayButton}>
                    <AppText style={styles.smallPlayIcon}>
                        ▶
                    </AppText>
                </View>

                <View style={styles.popularContent}>
                    <AppText
                        style={styles.popularTitle}
                        numberOfLines={1}
                    >
                        {item.title}
                    </AppText>

                    <AppText
                        style={styles.popularArtist}
                        numberOfLines={1}
                    >
                        {item.artist}
                    </AppText>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => {

                                (navigation as any).navigate('Search')
                            }}
                        >

                            {/* <Text style={styles.back}>←</Text> */}
                            <AppImage
                                source={Logo.arrowline}
                                height={25}
                                width={19}
                                resizeMode='cover'
                                tintColor={"#FFFF"}
                            />
                        </TouchableOpacity>
                        <View>


                            <AppText
                                style={[
                                    styles.title,
                                    {
                                        color: color.darkthemetext,
                                    },
                                ]}
                            >
                                Performances
                            </AppText>

                            <AppText style={styles.subtitle}>
                                Watch your favorite live performances
                            </AppText>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.micContainer}>
                        <AppImage
                            source={Images.mics}
                            height={15}
                            width={18}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <SearchBar

                    onPress={() => {
                        ; (navigation as any).navigate('SearchSongSecreen', { previousScreen: 'PerformanceScreen' })
                    }}
                />

                {/* Categories */}
                <FlatList
                    horizontal
                    data={categories}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                setSelectedCategory(item)
                            }
                            style={[
                                styles.categoryChip,
                                selectedCategory === item &&
                                styles.selectedCategory,
                            ]}
                        >
                            <AppText
                                style={[
                                    styles.categoryText,
                                    selectedCategory === item &&
                                    styles.selectedCategoryText,
                                ]}
                            >
                                {item}
                            </AppText>
                        </TouchableOpacity>
                    )}
                />

                {/* Featured Performance */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Featured Performance
                    </AppText>

                    <AppText style={styles.view}>
                        See all  ›
                    </AppText>
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.featuredCard}
                >
                    <AppImage
                        source={{
                            uri: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
                        }}
                        style={styles.featuredImage}
                        resizeMode="cover"
                    />

                    <View style={styles.featuredOverlay} />

                    <View style={styles.featuredPlayButton}>
                        <AppText style={styles.featuredPlayIcon}>
                            ▶
                        </AppText>
                    </View>

                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />

                        <AppText style={styles.liveText}>
                            LIVE
                        </AppText>
                    </View>

                    <View style={styles.featuredContent}>
                        <AppText style={styles.featuredTitle}>
                            Sudanese Live Concert
                        </AppText>

                        <AppText style={styles.featuredArtist}>
                            Mohammed Wardi
                        </AppText>

                        <View style={styles.featuredMeta}>
                            <AppText style={styles.featuredViews}>
                                1.2M views
                            </AppText>

                            <AppText style={styles.metaDot}>
                                •
                            </AppText>

                            <AppText style={styles.featuredViews}>
                                08:42
                            </AppText>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Popular */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Popular Performances
                    </AppText>

                    <AppText style={styles.view}>
                        View all  ›
                    </AppText>
                </View>

                <FlatList
                    horizontal
                    data={popularPerformances}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.popularList}
                    renderItem={renderPopular}
                />

                {/* All Performances */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        All Performances
                    </AppText>

                    <AppText style={styles.view}>
                        Filter  ›
                    </AppText>
                </View>

                <FlatList
                    data={performances}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={renderPerformance}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default PerformanceScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: color.darkbackround,
    },

    container: {
        paddingHorizontal: 15,
        paddingBottom: 130,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },

    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
    },

    subtitle: {
        marginTop: 2,
        color: '#FFF97E',
        fontSize: 12,
        fontFamily: Inter.regular,
    },

    micContainer: {
        width: 25,
        height: 25,
        borderRadius: 21,
        borderWidth: 1.5,
        borderColor: '#F3870C',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },

    categoryList: {
        paddingVertical: 14,
        paddingRight: 10,
    },

    categoryChip: {
        height: 34,
        paddingHorizontal: 17,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#573B1C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        backgroundColor: '#090909',
    },

    selectedCategory: {
        backgroundColor: '#F3870C',
        borderColor: '#F3870C',
    },

    categoryText: {
        color: '#A7A7A7',
        fontSize: 11,
        fontFamily: Inter.medium,
    },

    selectedCategoryText: {
        color: '#090909',
        fontWeight: '700',
    },

    sectionHeader: {
        marginTop: 16,
        marginBottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    view: {
        color: '#F6A202',
        fontSize: 10,
        fontFamily: Inter.regular,
    },

    /* Featured */

    featuredCard: {
        height: 205,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#613D1B',
        backgroundColor: '#111111',
        position: 'relative',
    },

    featuredImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },

    featuredOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.48)',
    },

    featuredPlayButton: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#080808',
        borderWidth: 2,
        borderColor: '#F3870C',
        justifyContent: 'center',
        alignItems: 'center',
        top: '38%',
        left: '44%',
    },

    featuredPlayIcon: {
        color: '#FFFFFF',
        fontSize: 18,
        marginLeft: 3,
    },

    liveBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        height: 27,
        paddingHorizontal: 10,
        borderRadius: 14,
        backgroundColor: '#A00020',
        flexDirection: 'row',
        alignItems: 'center',
    },

    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF4C67',
        marginRight: 6,
    },

    liveText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    featuredContent: {
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 13,
    },

    featuredTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    featuredArtist: {
        color: '#F6A202',
        fontSize: 11,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    featuredMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },

    featuredViews: {
        color: '#C5C5C5',
        fontSize: 9,
        fontFamily: Inter.regular,
    },

    metaDot: {
        color: '#F3870C',
        marginHorizontal: 7,
        fontSize: 10,
    },

    /* Popular */

    popularList: {
        paddingBottom: 2,
    },

    popularCard: {
        width: 145,
        height: 145,
        borderRadius: 15,
        overflow: 'hidden',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#583A1B',
        position: 'relative',
        backgroundColor: '#111111',
    },

    popularImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },

    popularOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },

    smallPlayButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 31,
        height: 31,
        borderRadius: 16,
        backgroundColor: '#090909',
        borderWidth: 1.5,
        borderColor: '#F3870C',
        justifyContent: 'center',
        alignItems: 'center',
    },

    smallPlayIcon: {
        color: '#FFFFFF',
        fontSize: 11,
        marginLeft: 2,
    },

    popularContent: {
        position: 'absolute',
        bottom: 12,
        left: 11,
        right: 8,
    },

    popularTitle: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    popularArtist: {
        color: '#F6A202',
        fontSize: 9,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    /* Performance list */

    performanceCard: {
        height: 92,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 13,
        padding: 7,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#382717',
        backgroundColor: '#0D0D0D',
    },

    thumbnailContainer: {
        width: 105,
        height: 76,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },

    thumbnail: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },

    thumbnailOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },

    playButton: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderWidth: 1,
        borderColor: '#F3870C',
        justifyContent: 'center',
        alignItems: 'center',
        left: '36%',
        top: '30%',
    },

    playIcon: {
        color: '#FFFFFF',
        fontSize: 10,
        marginLeft: 2,
    },

    durationContainer: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },

    duration: {
        color: '#FFFFFF',
        fontSize: 8,
        fontFamily: Inter.regular,
    },

    performanceInfo: {
        flex: 1,
        paddingHorizontal: 11,
        justifyContent: 'center',
    },

    performanceTitle: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    artistName: {
        color: '#F6A202',
        fontSize: 10,
        marginTop: 5,
        fontFamily: Inter.regular,
    },

    views: {
        color: '#858585',
        fontSize: 9,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    moreButton: {
        width: 25,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    moreIcon: {
        color: '#999999',
        fontSize: 21,
        lineHeight: 22,
    },
});
