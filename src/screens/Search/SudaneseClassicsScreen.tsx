import React, { useEffect, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import SearchBar from '../../share/components/SearchBar';
import CategoryChip from '../../share/components/CategoryChip';
import MiniPlayer from '../../share/components/MiniPlayer';
import { useNavigation } from '@react-navigation/native'
import color from '../../share/constants/color';
import { Images, Logo } from '../../share/constants/media';
import { Inter } from '../../share/constants/fonts';
import HeroBanner from '../../share/components/HeroBanner';
import ClassicSongItem from '../../share/components/ClassicSongItem';
import PlaylistCard from '../../share/components/PlaylistCard';
import LegendaryArtistCard from '../../share/components/LegendaryArtistCard';
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { loaderstate } from '../../auth/redux/authSlice';

// const categories = [
//     'All',
//     'Golden Era',
//     'Wardi',
//     'Al Sadiq',
//     'Traditional',
//     'Nubian',
//     'Instrumental',
// ];

const artists = [
    {
        id: '1',
        name: 'Mohamed Wardi',
        songs: '186 classic songs',
        badge: 'Legend',
        image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    },
    {
        id: '2',
        name: 'Hussein Al Sadiq',
        songs: '142 classic songs',
        badge: 'Legend',
        image:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1',
    },
    {
        id: '3',
        name: 'Al Balabil',
        songs: '98 classic songs',
        badge: 'Icon',
        image:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
    {
        id: '4',
        name: 'Ehab Tawfik',
        songs: '76 classic songs',
        badge: 'Icon',
        image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    },
];

const songs = [
    {
        id: '1',
        title: 'يا أغلى وطن',
        artist: 'Mohamed Wardi',
        likes: '125K',
        duration: '5:24',
        level: 'Easy',
        image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    },
    {
        id: '2',
        title: 'مبروك',
        artist: 'Hussein Al Sadiq',
        likes: '102K',
        duration: '6:12',
        level: 'Intermediate',
        image:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1',
    },
    {
        id: '3',
        title: 'الزين نادي',
        artist: 'Mustafa Al Sadiq',
        likes: '87K',
        duration: '5:48',
        level: 'Easy',
        image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    },
    {
        id: '4',
        title: 'أسعد يا طيب القلب',
        artist: 'Jalal Mohamed',
        likes: '76K',
        duration: '5:20',
        level: 'Easy',
        image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    },
];

const playlists = [
    {
        id: '1',
        name: 'Golden Era',
        songs: '86 songs',
        image:
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
    },
    {
        id: '2',
        name: 'Wardi Collection',
        songs: '54 songs',
        image:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    },
    {
        id: '3',
        name: 'Nubian Melodies',
        songs: '48 songs',
        image:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    },
    {
        id: '4',
        name: 'Traditional Hits',
        songs: '52 songs',
        image:
            'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
    },
];

export default function SudaneseClassicsScreen() {
    const [selected, setSelected] = useState('All');
    const [classics, setClassics] = useState(null)
    const navigation = useNavigation();
    const [categories, setCategories] = useState<any[]>([])
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const categorydata = async () => {
        console.log("sudanesecategory api called", apiUrls.sudanesecategory)
        try {
            //dispatch(loaderstate(true));

            const response = await ApiService.get(apiUrls.sudanesecategory);

            const data = response?.data;
            console.log(data, 'sudanesecategory API RESPONSEdddd');

            if (data?.success) {
                setCategories(data?.subcategories)

            }
        } catch (error) {
            console.log('Categorydata ERROR:', error);
        } finally {
            //  dispatch(loaderstate(false));
        }
    };



    const classicdata = async () => {
        // console.log("classicdata api called")
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.getsudanesesong);

            const data = response.data;
            console.log(data, 'classicdata API RESPONSEdddd');

            if (data?.success) {
                setClassics(data.songs);
            }
        } catch (error) {
            console.log('classicdata ERROR:', error);
        } finally {
            setLoading(false);
        }
    };



    const classicdatabyid = async (categoryId: string) => {
        if (categoryId === 'all') {
            setSelected(categories.find((cat) => cat.id === categoryId)?.title || 'All');
            classicdata();
            return;
        }
        console.log(categoryId, "classicdatabyid api called")
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.getsudanesesongbycategory(categoryId));

            const data = response.data;
            console.log(data, 'classicdatabyid API RESPONSEdddd');

            if (data?.success) {
                setClassics(data.songs);
                setSelected(categories.find((cat) => cat.id === categoryId)?.title || 'All');
            }
        } catch (error) {
            console.log('classicdata ERROR:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        classicdata()
        categorydata()
    }, [])

    const categoryList = [
        { id: 'all', title: 'All' },
        ...categories,
    ];
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}>
                {/* HEADER */}

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {

                            navigation.navigate('Search')
                        }}
                    >
                        <AppImage
                            source={Logo.arrowline}
                            width={20}
                            height={20}
                            tintColor={"#ffff"}
                        />
                    </TouchableOpacity>

                    <View style={styles.headerText}>
                        {/* <AppImage
                            source={Images.bplay}
                            height={28}
                            width={28}

                        /> */}


                        <AppText style={styles.title}>
                            Sudanese Classics
                        </AppText>

                        <AppText style={styles.subtitle}>
                            The timeless melodies of Sudan
                        </AppText>
                    </View>

                    <TouchableOpacity style={styles.mic}>
                        <AppImage
                            source={Images.mics}
                            width={16}
                            height={18}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                <SearchBar
                    onPress={() => {
                        navigation.navigate('SearchSongSecreen', { previousScreen: 'SudaneseClassicsScreen' })
                    }}
                />

                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categoryList}
                    keyExtractor={(i) => i.id}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    renderItem={({ item }) => (
                        <CategoryChip
                            title={item?.title}
                            selected={selected === item.title}
                            onPress={() => classicdatabyid(item.id)}
                        />
                    )}
                />

                <HeroBanner />

                {/* LEGENDARY */}

                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>
                        👑 Legendary Artists
                    </AppText>

                    <AppText style={styles.view}>
                        See all
                    </AppText>
                </View>

                <FlatList
                    horizontal
                    data={artists}
                    keyExtractor={(i) => i.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <LegendaryArtistCard item={item}
                        //loading={loading}
                        />
                    )}
                />

                {/* SONGS */}

                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>
                        🎵 All Classics
                    </AppText>

                    <AppText style={styles.view}>
                        Sort by: Most Popular ▼
                    </AppText>
                </View>
                {classics?.length > 0 ? (
                    classics.map((item) => (
                        <ClassicSongItem
                            key={item.id}
                            item={item}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <AppImage
                            source={Images.music} // or your empty-state image
                            width={20}
                            height={20}
                            resizeMode="contain"
                        />

                        <AppText style={styles.emptyTitle}>
                            No Songs Found
                        </AppText>

                        <AppText style={styles.emptySubtitle}>
                            There are no songs available in this category.
                        </AppText>
                    </View>
                )}

                {/* PLAYLISTS */}

                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>
                        🎼 Classic Playlists
                    </AppText>

                    <AppText style={styles.view}>
                        View all
                    </AppText>
                </View>

                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={playlists}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => (
                        <PlaylistCard item={item} />
                    )}
                />
            </ScrollView>

            {/* <MiniPlayer /> */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.darkbackround,
        paddingHorizontal: 16,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 14,
    },

    headerText: {
        flex: 1,
        marginHorizontal: 12,
    },

    title: {
        color: color.darkthemetext,
        fontSize: 22,
        fontFamily: Inter.bold,
    },

    subtitle: {
        color: '#D5A83F',
        fontSize: 12,
        marginTop: 2,
        fontFamily: Inter.regular,
    },

    mic: {
        width: 32,
        height: 32,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#F4A000',
        justifyContent: 'center',
        alignItems: 'center',
    },

    section: {
        marginTop: 24,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    sectionTitle: {
        color: '#fff',
        fontSize: 15,
        fontFamily: Inter.semiBold,
    },

    view: {
        color: '#F4A000',
        fontSize: 12,
        fontFamily: Inter.medium,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },

    emptyTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
    },

    emptySubtitle: {
        color: '#8A8A8A',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});