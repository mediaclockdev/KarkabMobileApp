
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Header from "../share/components/Header";
import { Banner, Images, Logo } from "../share/constants/media";
import color, { useAppColors } from "../share/constants/color";
import AppImage from "../share/components/AppImage";
import SearchBar from "../share/components/SearchBar";
import { useCallback, useEffect, useState } from "react";
import AppText from "../share/components/AppText";

import { SafeAreaView } from "react-native-safe-area-context";
import { Inter } from "../share/constants/fonts";

import TrandingList from "../share/components/TrandingList";
import apiUrls from "../services/apiUrls";
import { useAppDispatch } from "../share/hooks/useAppSelector";

import ApiService from '../services/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import TagLIst from "../share/components/TagLIst";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import HomeSkeleton from "../share/components/HomeSkeleton";
const browesdata = [
    {
        image: Banner.brbanner,
        title: 'Songs',

        dtitle1: 'favorite songs',
        icon: Images.music
    },
    {
        image: Banner.br1banner,
        title: 'Artists',

        dtitle1: 'artists',
        icon: Images.picon
    },
    {
        image: Banner.br2banner,
        title: 'KarKab\nSelection',

        dtitle1: 'playlist for you',
        icon: Images.bplay
    },
    {
        image: Banner.br3banner,
        title: 'Performances',

        dtitle1: 'by genre',
        icon: Logo.dmic
    },
    {
        image: Banner.br2banner,
        title: 'Song\nCategory',

        dtitle1: 'by genre',
        icon: Logo.genre
    },
    {
        image: Banner.br4banner,
        title: 'Playlists',

        dtitle1: 'by genre',
        icon: Images.playlist
    },

]

const Search = () => {

    const [loader, setLoader] = useState(false)

    const dispatch = useAppDispatch();
    const color = useAppColors();
    const { t } = useTranslation();

    const [classics, setClassics] = useState<any[]>([]);

    const [categorySongs, setCategorySongs] = useState<any[]>([]);
    const [tagSongs, setTagSongs] = useState<any[]>([]);




    const navigation = useNavigation();




    useEffect(() => {
        let isMounted = true;

        const loadSearchData = async () => {
            try {
                setLoader(true);

                await Promise.all([



                    tagsdata(),
                ]);
            } catch (error) {
                console.log('LOAD SEARCH DATA ERROR:', error);
            } finally {
                if (isMounted) {
                    setLoader(false);
                }
            }
        };

        loadSearchData();

        return () => {
            isMounted = false;
        };
    }, [])


    const handlenavigation = async ({ item }: { item: { title: string } }) => {
        console.log(item)
        if (item.title == 'Artists') {
            (navigation as any).navigate('ArtistScreen')
        }
        else if (item.title == 'Songs') {
            (navigation as any).navigate('SongsScreen')
        }
        else if (item.title == 'KarKab\nSelection') {

            (navigation as any).navigate('SudaneseClassicsScreen')

        }
        else if (item.title == 'Playlists') {


            (navigation as any).navigate('PlayListScreen', { previousScreen: 'Search' })


        }
        else if (item.title == 'Song\nCategory') {

            (navigation as any).navigate('GenreScreen')

        }
        else if (item.title == 'Performances') {



            Toast.show({
                type: 'info',
                position: 'bottom',
                bottomOffset: 200,
                text1: 'Coming soon!',

            });

        }

    }






    const tagsdata = async () => {
        try {
            setLoader(true);

            const response = await ApiService.get(apiUrls.gettags);
            const data = (response as any)?.data;

            if (data?.success) {
                const tagList = data?.tags || [];

                const results = await Promise.all(
                    tagList.map((tag: any) =>
                        classictagdatabyid(tag.id, tag.title)
                    )
                );

                setTagSongs(results);
            }
        } catch (error) {
            console.log('tagsdata ERROR:', error);
        } finally {
            setLoader(false);
        }
    };





    const classictagdatabyid = async (
        tagId: number,
        tagTitle: string
    ) => {
        setLoader(true);
        try {
            const response = await ApiService.get(
                apiUrls.gettagSongs(String(tagId))
            );

            const data = (response as any)?.data;

            if (data?.success) {
                return {
                    tagId,
                    tagTitle,
                    songs: data?.songs || [],
                };
            }

            return {
                tagId,
                tagTitle,
                songs: [],
            };
        } catch (error) {
            console.log(
                `Error getting songs for tag ${tagTitle}:`,
                error
            );

            return {
                tagId,
                tagTitle,
                songs: [],
            };
        }
        finally {
            setLoader(false);
        }
    };




    return (
        <SafeAreaView
            style={{
                backgroundColor: color.darkbackround,
                flex: 1,
            }}
        >
            <ImageBackground
                source={Banner.searchbackg}
                resizeMode="cover"
                style={{
                    flex: 1,
                }}
                tintColor={color.loginbackground}
            >

                <View style={styles.container}>


                    <Header
                        headername={'Search'}
                        headertitle={t('Search.whatwouldtosingtoday?')}
                        rightIcon={Images.mics}

                        onRightPress={() => {
                            (navigation as any).navigate('Recording');
                        }}
                        rightView={
                            <></>
                        }
                    />

                    <SearchBar
                        value={''}
                        onChangeText={() => console.log('filter')}
                        onFilterPress={() => console.log('filter')}
                        title="search"
                        onPress={() => {
                            (navigation as any).navigate('SearchSongSecreen', { previousScreen: 'Search' })
                        }}

                    />
                    {
                        loader ?

                            <HomeSkeleton />
                            :
                            <ScrollView showsVerticalScrollIndicator={false} style={{ gap: 20, marginVertical: 10 }}>

                                <AppText color={color.darkthemetext} fontSize={14} fontWeight="500" fontFamily={Inter.regular}>
                                    {t('Search.browsebycategory')}

                                </AppText>


                                <View style={styles.container1}>
                                    {browesdata.map((item, index) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                handlenavigation({ item })
                                            }}
                                            key={index} style={{
                                                width: '31%',
                                                marginBottom: 12,
                                                borderWidth: 1,
                                                borderColor: index === 3 || index === 1 ? "#806141" : "#9F4A65",
                                                borderRadius: 12
                                            }}>
                                            <ImageBackground
                                                source={item.image}
                                                resizeMode="cover"
                                                style={{
                                                    width: '100%',
                                                    height: 98,
                                                    borderRadius: 12
                                                }}
                                                imageStyle={styles.image}
                                            >
                                                <View style={[styles.overlay, { justifyContent: 'space-between', height: 98, }]}>

                                                    <AppImage
                                                        source={item.icon}
                                                        width={28}
                                                        height={28}
                                                        resizeMode="contain"
                                                    />

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <AppText
                                                            color={"#FFF"}
                                                            fontSize={12}
                                                            fontWeight="600"
                                                            fontFamily={Inter.medium}
                                                        >
                                                            {item.title}
                                                        </AppText>


                                                        <AppImage
                                                            source={Images.arrow}
                                                            width={5}
                                                            height={8}
                                                            tintColor={"#FFF"}

                                                        />

                                                    </View>

                                                </View>
                                            </ImageBackground>
                                        </TouchableOpacity>
                                    ))}
                                </View>






                                {categorySongs.map((category: any) => {

                                    if (!category.songs?.length) {
                                        return null;
                                    }

                                    return (
                                        <View key={category.categoryId}>

                                            <View style={styles.titles}>
                                                <AppText
                                                    color={color.darkthemetext}
                                                    fontSize={14}
                                                    fontWeight="500"
                                                    fontFamily={Inter.regular}
                                                >
                                                    {category.categoryTitle}
                                                </AppText>

                                                <TouchableOpacity
                                                    onPress={() => {
                                                        (navigation as any).navigate(
                                                            'SongsListScreen',
                                                            {
                                                                songs: category.songs,
                                                                categoryId: category.categoryId,
                                                                categoryTitle: category.categoryTitle,
                                                                previousScreen: 'Search',
                                                            }
                                                        );
                                                    }}
                                                    activeOpacity={0.5}
                                                    style={{
                                                        flexDirection: 'row',
                                                        gap: 5,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <AppText
                                                        color="#F6A202"
                                                        fontSize={14}
                                                        fontWeight="500"
                                                        fontFamily={Inter.regular}
                                                    >
                                                        See all
                                                    </AppText>

                                                    <AppImage
                                                        source={Images.arrow}
                                                        width={5}
                                                        height={8}
                                                        resizeMode="contain"
                                                        tintColor="#F6A202"
                                                    />
                                                </TouchableOpacity>
                                            </View>

                                            <TrandingList data={category.songs} />

                                        </View>
                                    );
                                })}






                                <TrandingList data={classics} />


                                {tagSongs.map((tag: any) => {
                                    if (!tag.songs?.length) {
                                        return null;
                                    }

                                    return (
                                        <View key={tag.tagId}>
                                            <View style={styles.titles}>
                                                <AppText
                                                    color={color.darkthemetext}
                                                    fontSize={14}
                                                    fontWeight="500"
                                                    fontFamily={Inter.regular}
                                                >
                                                    {tag.tagTitle}
                                                </AppText>

                                                <TouchableOpacity
                                                    activeOpacity={0.5}
                                                    onPress={() => {
                                                        (navigation as any).navigate(
                                                            'SongsListScreen',
                                                            {
                                                                songs: tag.songs,
                                                                categoryId: tag.tagId,
                                                                categoryTitle: tag.tagTitle,
                                                                previousScreen: 'Search',
                                                            }
                                                        );
                                                    }}
                                                    style={{
                                                        flexDirection: 'row',
                                                        gap: 5,
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <AppText
                                                        color="#F6A202"
                                                        fontSize={14}
                                                        fontWeight="500"
                                                        fontFamily={Inter.regular}
                                                    >
                                                        {t('Home.Seeall')}

                                                    </AppText>

                                                    <AppImage
                                                        source={Images.arrow}
                                                        width={5}
                                                        height={8}
                                                        resizeMode="contain"
                                                        tintColor="#F6A202"
                                                    />
                                                </TouchableOpacity>
                                            </View>

                                            <TagLIst data={tag.songs} />
                                        </View>
                                    );
                                })}


                                <View style={{ height: 80 }} />
                            </ScrollView>}
                </View>
            </ImageBackground>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {

        flex: 1,
        paddingHorizontal: 10,

    },
    recentview: {
        width: '31%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#201813'

    },
    titles: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
    },
    container1: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 15,
    },

    card: {
        width: '28%',
        marginBottom: 12,
        flexWrap: 'wrap',
    },

    banner: {
        width: '100%',
        height: 115,
        justifyContent: 'flex-start',
        borderRadius: 12
    },

    image: {
        borderRadius: 12,
    },

    overlay: {
        padding: 10,
        gap: 8,
    },
})
export default Search;