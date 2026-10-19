import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,

    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';


import AppText from '../../share/components/AppText';
import ApiService from '../../services/api';
import CategoryChip from '../../share/components/CategoryChip';
import BannerCard from '../../share/components/BannerCard';
import BandCard from '../../share/components/BandCard';
import TopArtist from '../../share/components/TopArtist';
import ArtistListItem from '../../share/components/ArtistListItem';
import MiniPlayer from '../../share/components/MiniPlayer';
import { SafeAreaView } from 'react-native-safe-area-context';
import color from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import SearchBar from '../../share/components/SearchBar';
import AppImage from '../../share/components/AppImage';
import { Images, Logo } from '../../share/constants/media';
import { useNavigation } from '@react-navigation/native';
import apiUrls from '../../services/apiUrls';



const categories = [
    'All',
    'Sudanese',
    'Male',
    'Female',
    'Group',
    'New',
    'Popular',
];


const artists = [
    {
        id: '1',
        name: 'Mohammed Wardi',
        songs: '12.5K songs',
        listeners: '1.2M listener',
        image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
    },
    {
        id: '2',
        name: 'Mustafa Al Sadiq',
        songs: '9.8K songs',
        listeners: '982K listener',
        image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    },
    {
        id: '3',
        name: 'Asma',
        songs: '6.2K songs',
        listeners: '745K listener',
        image:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
    },
    {
        id: '4',
        name: 'Jalal Mohamed',
        songs: '5.1K songs',
        listeners: '610K listener',
        image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
    }
];


const bands = [
    {
        id: '1',
        name: 'Majaj Band',
        songs: '234 songs',
        image:
            'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b'
    },
    {
        id: '2',
        name: 'Sudanese Beats',
        songs: '156 songs',
        image:
            'https://images.unsplash.com/photo-1506157786151-b8491531f063'
    },
    {
        id: '3',
        name: 'Nubian Voice',
        songs: '189 songs',
        image:
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f'
    }
];






const ArtistScreen = () => {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [artistdata, setArtistdata] = useState<any[]>([]);
    const [artisttopdata, setArtisttopdata] = useState<any[]>([]);
    const [loader, setLoader] = useState(false);


    useEffect(() => {
        getartistfun()
        gettopartistfun()
    }, [])

    const getartistfun = async () => {
        console.log("popular api called")
        try {
            setLoader(true)

            const response = await ApiService.get(apiUrls.artists);

            const data = (response as any).data;
            console.log(data.artists, 'getartist API RESPONSE');

            if (data?.success) {
                setArtistdata(data.artists)
            }
        } catch (error) {
            console.log('populardata ERROR:', error);
        } finally {
            setLoader(false)
        }
    };

    const gettopartistfun = async () => {
        console.log("popular api called")
        try {


            const response = await ApiService.get(apiUrls.artists + '?sort=popular');

            const data = (response as any).data;
            console.log(data.artists, 'gettopartistfun API RESPONSE');

            if (data?.success) {
                setArtisttopdata(data.artists)
            }
        } catch (error) {
            console.log('populardata ERROR:', error);
        } finally {

        }
    };



    return (

        <SafeAreaView style={{
            backgroundColor: color.darkbackround,
            flex: 1,
        }}>
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
                            ]}>
                            Artist
                        </AppText>

                        <AppText style={styles.subtitle}>
                            What would you like to sing today?
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

            <SearchBar
                onPress={() => {
                    ; (navigation as any).navigate('SearchSongSecreen', { previousScreen: 'ArtistScreen' })
                }}
            />

            {loader ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#EFCB61" />
                </View>
            ) : (

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{
                        paddingBottom: 130,
                        // gap: 10,
                        paddingHorizontal: 15
                    }}
                >





                    <FlatList

                        horizontal

                        showsHorizontalScrollIndicator={false}

                        data={categories}

                        keyExtractor={(item) => item}

                        renderItem={({ item }) => (

                            <CategoryChip
                                key={item}
                                title={item}
                                selected={selectedCategory === item}
                                onPress={() => setSelectedCategory(item)}
                            />

                        )}

                    />



                    <BannerCard />




                    <View style={styles.sectionHeader}>

                        <AppText style={styles.sectionTitle}>
                            Top Artists
                        </AppText>
                        <TouchableOpacity
                            onPress={() => {
                                (navigation as any).navigate('AllArtistScreen', { previousScreen: 'ArtistScreen' })
                            }}
                        >


                            <AppText style={styles.view}>
                                View all  ›
                            </AppText>
                        </TouchableOpacity>
                    </View>



                    <FlatList

                        horizontal

                        showsHorizontalScrollIndicator={false}

                        data={artisttopdata?.slice(0, 10)}

                        keyExtractor={(item) => item.id}
                        //style={{ height: 340 }}
                        renderItem={({ item }) => (

                            <TopArtist item={item}
                                onPress={() => {
                                    (navigation as any).navigate('SongsListScreen', {
                                        artist: item,
                                        previousScreen: 'ArtistScreen',
                                    });
                                }}
                            />

                        )}

                    />



                    <View style={[styles.sectionHeader]}>

                        <AppText style={styles.sectionTitle}>
                            All Artists
                        </AppText>
                        <TouchableOpacity
                            onPress={() => {
                                (navigation as any).navigate('AllArtistScreen', { previousScreen: 'ArtistScreen' })
                            }}
                        >
                            <AppText style={styles.view}>
                                View all  ›
                            </AppText>
                        </TouchableOpacity>


                    </View>



                    {
                        artistdata?.slice(0, 20).map(item => (

                            <ArtistListItem

                                key={item.id}

                                item={item}
                                onPress={() => {
                                    (navigation as any).navigate('SongsListScreen', {
                                        artist: item,
                                        previousScreen: 'ArtistScreen',
                                    });
                                }}

                            />

                        ))
                    }




                    {/* <View style={[styles.sectionHeader, { marginTop: 5 }]}>

                        <AppText style={[styles.sectionTitle,]}>
                            Groups & Bands
                        </AppText>

                        <AppText style={styles.view}>
                            View all  ›
                        </AppText>

                    </View> */}



                    {/* <FlatList

                        horizontal

                        showsHorizontalScrollIndicator={false}

                        data={bands}

                        keyExtractor={(item) => item.id}

                        renderItem={({ item }) => (

                            <BandCard item={item} />

                        )}

                    /> */}



                </ScrollView>

            )}


            {/* <MiniPlayer /> */}




        </SafeAreaView>


    )

}



export default ArtistScreen;





const styles = StyleSheet.create({


    container: {
        flex: 1,
        paddingHorizontal: 10,
    },


    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingHorizontal: 16,
        paddingVertical: 12,
    },

    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },

    micContainer: {
        width: 25,
        height: 25,
        borderRadius: 21,
        borderWidth: 1.5,
        borderColor: '#F3870C', // or your theme color
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        backgroundColor: 'transparent',
    },


    title: {
        fontSize: 22,

        fontWeight: '700'
    },


    subtitle: {
        marginTop: 1,
        color: '#FFF97E',
        fontSize: 12,
        fontFamily: Inter.regular
    },



    sectionHeader: {
        marginTop: 20,
        // paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },


    sectionTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: Inter.medium
    },


    view: {
        color: '#F6A202',
        fontSize: 14,
        fontFamily: Inter.regular
    }



});