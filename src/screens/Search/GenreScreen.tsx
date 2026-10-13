import React, { useCallback, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { loaderstate } from '../../auth/redux/authSlice';
import apiUrls from '../../services/apiUrls';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import ApiService from '../../services/api';
const categories = [
    'All',
    'Sudanese',
    'Traditional',
    'Modern',
    'Popular',
    'Classic',
];

const genres = [
    {
        id: '1',
        name: 'Afrobeat',
        songs: '1.2K songs',
        image:
            'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
    },
    {
        id: '2',
        name: 'Sudanese Folk',
        songs: '856 songs',
        image:
            'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b',
    },
    {
        id: '3',
        name: 'Nubian',
        songs: '624 songs',
        image:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    },
    {
        id: '4',
        name: 'Arabic Pop',
        songs: '2.4K songs',
        image:
            'https://images.unsplash.com/photo-1506157786151-b8491531f063',
    },
    {
        id: '5',
        name: 'Traditional',
        songs: '945 songs',
        image:
            'https://images.unsplash.com/photo-1524650359799-842906ca1c06',
    },
    {
        id: '6',
        name: 'Reggae',
        songs: '734 songs',
        image:
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    },
    {
        id: '7',
        name: 'Gospel',
        songs: '532 songs',
        image:
            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
    },
    {
        id: '8',
        name: 'Jazz',
        songs: '486 songs',
        image:
            'https://images.unsplash.com/photo-1511192336575-5a79af67a629',
    },
    {
        id: '9',
        name: 'Blues',
        songs: '328 songs',
        image:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    },
    {
        id: '10',
        name: 'Acoustic',
        songs: '412 songs',
        image:
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
    },
];

const GenreScreen = () => {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<any[]>([])
    const dispatch = useAppDispatch();
    const [selected, setSelected] = useState('All');
    const [searchText, setSearchText] = useState('');
    const [searchText1, setSearchText1] = useState('');
    useFocusEffect(
        useCallback(() => {
            setSearchText('');
            setSearchText1('');
            setSelected('All');
            categorydata();
        }, [])
    );

    const filteredCategories = categories.filter((item: any) => {
        const search = searchText.trim().toLowerCase();


        const matchesSearch =
            !search ||
            item.name?.toLowerCase().includes(search) ||
            item.title?.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search);


        const matchesCategory =
            selected === 'All' ||
            item.name === selected ||
            item.title === selected;

        return matchesSearch && matchesCategory;
    });

    const categorydata = async () => {
        console.log("category api called", apiUrls.categories)
        try {
            dispatch(loaderstate(true));

            const response = await ApiService.get(apiUrls
                .categories);

            const data = (response as any)?.data;
            console.log(data?.categories, 'category API RESPONSEdddd');

            if (data?.success) {
                setCategories(data?.categories);
            }
        } catch (error) {
            console.log('Categorydata ERROR:', error);
        } finally {
            dispatch(loaderstate(false));
        }
    };
    const categoryList = [
        { id: 'all', title: 'All' },
        ...categories,
    ];
    const renderGenre = ({ item }: { item: (typeof genres)[0] }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.genreCard}
                onPress={() => {
                    (navigation as any).navigate('SongsListScreen', {
                        songs: item,
                        previousScreen: 'GenreScreen',
                    });
                }}
            >
                <AppImage
                    source={{ uri: item?.category_image }}
                    style={styles.genreImage}
                    resizeMode="cover"
                />

                {/* Dark gradient-like overlay */}
                <View style={styles.imageOverlay} />

                <View style={styles.genreContent}>
                    <AppText style={styles.genreName}>
                        {item.name}
                    </AppText>

                    <AppText style={styles.songCount}>
                        {item?.songs_count}
                    </AppText>
                </View>

                <View style={styles.arrowContainer}>
                    <AppText style={styles.arrow}>
                        ›
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
                                Genre
                            </AppText>

                            <AppText style={styles.subtitle}>
                                Explore music by genre
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
                        ; (navigation as any).navigate('SearchSongSecreen', { previousScreen: 'GenreScreen' })
                    }}
                />

                {/* Categories */}
                <FlatList
                    horizontal
                    data={categoryList}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                setSelected(item.title)
                            }
                            style={[
                                styles.categoryChip,
                                selected === item.title &&
                                styles.selectedCategory,
                            ]}
                        >
                            <AppText
                                style={[
                                    styles.categoryText,
                                    selected === item.title &&
                                    styles.selectedCategoryText,
                                ]}
                            >
                                {item.title}
                            </AppText>
                        </TouchableOpacity>
                    )}
                />

                {/* Featured section */}
                {/* <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Explore Genres
                    </AppText>

                    <AppText style={styles.view}>
                        See all  ›
                    </AppText>
                </View> */}

                {/* Genre Grid */}
                <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => item.id}
                    renderItem={renderGenre}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.genreList}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default GenreScreen;

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
        backgroundColor: 'transparent',
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
        marginTop: 12,
        marginBottom: 15,
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

    genreList: {
        paddingBottom: 20,
    },

    row: {
        justifyContent: 'space-between',
        marginBottom: 14,
    },

    genreCard: {
        width: '48%',
        height: 155,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#613D1B',
        backgroundColor: '#111111',
        position: 'relative',
    },

    genreImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },

    imageOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.48)',
    },

    genreContent: {
        position: 'absolute',
        left: 13,
        right: 10,
        bottom: 13,
    },

    genreName: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: Inter.medium,
        fontWeight: '700',
    },

    songCount: {
        color: '#F6A202',
        fontSize: 10,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    arrowContainer: {
        position: 'absolute',
        right: 10,
        bottom: 11,
        width: 25,
        height: 25,
        borderRadius: 13,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3870C',
    },

    arrow: {
        color: '#F6A202',
        fontSize: 20,
        lineHeight: 20,
        marginTop: -2,
    },
});
