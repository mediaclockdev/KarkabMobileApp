import React, { useState } from 'react';
import {
    FlatList,

    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';


import AppText from '../../share/components/AppText';

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
import { Images } from '../../share/constants/media';



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
    const [selectedCategory, setSelectedCategory] = useState('All');

    return (

        <SafeAreaView style={{
            backgroundColor: color.darkbackround,
            flex: 1,
        }}>


            <ScrollView
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={{
                    paddingBottom: 130,
                    // gap: 10,
                    paddingHorizontal: 15
                }}
            >

                <View style={styles.header}>
                    <View style={styles.headerContent}>
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

                    <TouchableOpacity style={styles.micContainer}>
                        <AppImage
                            source={Images.mics}
                            height={15}
                            width={18}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                <SearchBar />



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

                    <AppText style={styles.view}>
                        View all  ›
                    </AppText>

                </View>



                <FlatList

                    horizontal

                    showsHorizontalScrollIndicator={false}

                    data={artists}

                    keyExtractor={(item) => item.id}
                    //style={{ height: 340 }}
                    renderItem={({ item }) => (

                        <TopArtist item={item} />

                    )}

                />



                <View style={[styles.sectionHeader]}>

                    <AppText style={styles.sectionTitle}>
                        All Artists
                    </AppText>

                    <AppText style={styles.view}>
                        View all  ›
                    </AppText>

                </View>



                {
                    artists.map(item => (

                        <ArtistListItem

                            key={item.id}

                            item={item}

                        />

                    ))
                }




                <View style={[styles.sectionHeader, { marginTop: 5 }]}>

                    <AppText style={[styles.sectionTitle,]}>
                        Groups & Bands
                    </AppText>

                    <AppText style={styles.view}>
                        View all  ›
                    </AppText>

                </View>



                <FlatList

                    horizontal

                    showsHorizontalScrollIndicator={false}

                    data={bands}

                    keyExtractor={(item) => item.id}

                    renderItem={({ item }) => (

                        <BandCard item={item} />

                    )}

                />



            </ScrollView>




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
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Inter.medium
    },


    view: {
        color: '#F6A202',
        fontSize: 10,
        fontFamily: Inter.regular
    }



});