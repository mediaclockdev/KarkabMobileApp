import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    FlatList,
    TextInput,
    Image,
    Dimensions,
    ImageBackground,
} from 'react-native';
import AppImage from '../../share/components/AppImage';
import { Banner, BottomIcons, Images, Logo } from '../../share/constants/media';
import { Inter } from '../../share/constants/fonts';
import MiniPlayer from '../../share/components/MiniPlayer';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { loaderstate } from '../../auth/redux/authSlice';
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';

const { width } = Dimensions.get('window');

const COLORS = {
    bg: '#090909',
    card: '#151515',
    border: '#242424',
    primary: '#FF2D55',
    yellow: '#FFB300',
    white: '#fff',
    gray: '#888',
};

const categoriess = [
    'All',
    'Trending',
    'Latest',
    'Classics',
    'Love',
    'Sad',
    'Wedding',
    'Religious',
    'Hip Hop',
];





export default function Browsemood() {
    const navigation = useNavigation();
    const [selected, setSelected] = useState('All');
    const [categories, setCategories] = useState<any[]>([])
    const [searchText, setSearchText] = useState('');
    const [searchText1, setSearchText1] = useState('');
    const dispatch = useAppDispatch();
    // const route = useRoute<any>();

    // const { previousScreen } = route.params;


    useFocusEffect(
        useCallback(() => {
            setSearchText('');
            setSearchText1('');
            setSelected('All');
            categorydata();
        }, [])
    );

    const categorydata = async () => {
        console.log("category api called", apiUrls.categories)
        try {
            dispatch(loaderstate(true));

            const response = await ApiService.get(apiUrls.categories);

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
    const filteredCategoriestop = categories.filter((item: any) => {
        if (selected === 'All') {
            return true;
        }
        const search = searchText1.trim().toLowerCase();
        return (
            item.name?.toLowerCase().includes(search) ||
            item.title?.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search)
        );
    });
    const categoryList = [
        { id: 'all', title: 'All' },
        ...categories,
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* <StatusBar
                translucent={false}
                backgroundColor={v.bg}
                barStyle="light-content"
            /> */}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}>



                <View style={styles.header}>

                    <TouchableOpacity
                        onPress={() => {

                            (navigation as any).navigate('Home')
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

                    <View style={{ flex: 1, marginLeft: 15 }}>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                            <AppImage
                                source={Logo.ymusic}
                                height={28}
                                width={28}
                            //  tintColor={"#E52450"}
                            />


                            <View>
                                <Text style={styles.title}>
                                    {" "} Moods & Vibes
                                </Text>

                                <Text style={styles.subtitle}>
                                    {"  "} Explore playlists that match your
                                    <Text style={{ color: '#D4AF37' }}>
                                        {' '}feelings
                                    </Text>
                                    .
                                </Text>
                            </View>
                        </View>

                    </View>

                    <TouchableOpacity style={styles.settingBtn}>
                        <AppImage
                            source={Images.playlist}
                            height={16}
                            width={16}
                        />
                    </TouchableOpacity>

                </View>



                <View style={styles.searchBox}>
                    <AppImage
                        source={BottomIcons.search}
                        height={16}
                        width={16}
                    />
                    {/* <Text style={styles.searchIcon}>🔍</Text> */}

                    <TextInput
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Search categories..."
                        placeholderTextColor="#777"
                        style={styles.input}
                    />

                    {/* <TouchableOpacity>
                        <AppImage
                            source={Images.playlist}
                            height={16}
                            width={16}
                        />
                    </TouchableOpacity> */}

                </View>



                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 15, gap: 10, marginBottom: 15 }}>
                    {categoryList.map(item => {
                        const active = item.title === selected;

                        return (
                            <TouchableOpacity
                                key={item}
                                onPress={() => {
                                    setSelected(item.title);
                                }}
                                activeOpacity={0.8}>
                                {active ? (
                                    <LinearGradient
                                        colors={['#FF8A00', '#FF3D5A']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.category}>
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                { color: '#FFF' },
                                            ]}>
                                            {item.title}
                                        </Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.category, styles.categoryInactive]}>
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                { color: '#DDD' },
                                            ]}>
                                            {item.title}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                </ScrollView>




                <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: '#999', fontSize: 16 }}>
                                No categories found
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                (navigation as any).navigate('SongsListScreen', {
                                    songs: item,
                                    previousScreen: 'Browsemood',
                                });
                            }}
                            style={styles.cardShadow}
                            activeOpacity={0.9}
                        >
                            <View style={styles.card}>
                                <ImageBackground
                                    source={{ uri: item.category_image }}
                                    style={styles.cardImage}
                                    imageStyle={styles.cardImageStyle}>
                                    <LinearGradient
                                        colors={[
                                            'rgba(0,0,0,0)',
                                            'rgba(0,0,0,0.15)',
                                            'rgba(0,0,0,0.5)',
                                            'rgba(0,0,0,0.9)',
                                        ]}
                                        locations={[0, 0.45, 0.7, 1]}
                                        style={styles.overlay}
                                    >
                                        <View style={{
                                            paddingHorizontal: 12,
                                            paddingBottom: 12,
                                        }}>


                                            <Text
                                                style={styles.cardTitle}
                                                numberOfLines={2}
                                            >
                                                {item.name}
                                            </Text>

                                            <Text
                                                style={styles.cardDescription}
                                                numberOfLines={2}
                                            >
                                                {item.description}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, }}>
                                                <AppImage
                                                    source={Images.music}
                                                    height={12}
                                                    width={12}

                                                />
                                                <Text style={styles.songCount}>
                                                    {item.songsCount} Songs
                                                </Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </ImageBackground>
                            </View>
                        </TouchableOpacity>
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
        backgroundColor: COLORS.bg,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        marginBottom: 15,
    },

    back: {
        fontSize: 28,
        color: 'white',
    },

    music: {
        fontSize: 22,
        marginRight: 8,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffff',
        fontFamily: Inter.bold
    },

    subtitle: {
        color: '#999',
        marginTop: 2,
        fontSize: 10,
        fontFamily: Inter.regular
    },

    settingBtn: {
        height: 32,
        width: 32,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#FF2D55',
        justifyContent: 'center',
        alignItems: 'center',
    },

    searchBox: {
        marginHorizontal: 15,
        backgroundColor: '#121212',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#222',
    },

    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },

    input: {
        flex: 1,
        color: 'white',
    },

    category: {
        // paddingHorizontal: 18,
        minWidth: 100,
        height: 25,
        borderRadius: 18,
        //  marginRight: 10,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',

    },

    categoryInactive: {
        backgroundColor: '#181818',
    },

    categoryText: {
        fontSize: 10,
        fontWeight: '600',
    },

    categoryActive: {
        backgroundColor: '#FF6A00',
    },



    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 120,
    },

    row: {
        justifyContent: 'space-between',
    },

    cardShadow: {
        width: '48.5%',
        height: 150,
        marginBottom: 15,

        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,

        // Android
        elevation: 8,
    },

    card: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#0F0F0F',
    },

    cardImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    cardImageStyle: {
        borderRadius: 18,
    },

    overlay: {
        flex: 1,
        justifyContent: 'flex-end',

        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },

    cardTitle: {
        color: '#FFF',
        fontSize: 15,
        fontFamily: Inter.bold,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    cardDescription: {
        color: '#E6E6E6',
        fontSize: 11,
        marginTop: 4,
        fontFamily: Inter.regular,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    songCount: {
        color: '#FFC107',

        fontSize: 11,
        fontFamily: Inter.medium,
    },









});
