import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';

import { useAppColors } from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import AppText from '../../share/components/AppText';
import { FastAppImage } from '../../share/components/FastAppImage';
import AppImage from '../../share/components/AppImage';

import ApiService from '../../services/api';
import apiUrls from '../../services/apiUrls';

import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { setLoginState } from '../../auth/redux/authSlice';
import { BottomIcons } from '../../share/constants/media';

type Artist = {
    id: number | string;
    name: string;
    artist_image?: string | null;
    isMoreArtist?: boolean;
    isLessArtist?: boolean;
    isPlaceholder?: boolean;
};

const MAX_VISIBLE_ARTISTS = 11;
const NUM_COLUMNS = 3;

const ArtistImage = ({
    name,
    image,
    style,
}: {
    name: string;
    image?: string | null;
    style?: any;
}) => {
    const [imageError, setImageError] = useState(false);


    const artistImage = image?.trim?.() || '';

    const getArtistInitials = (artistName: string = '') => {
        const words = artistName
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (words.length === 0) {
            return '';
        }

        if (words.length === 1) {
            const word = words[0];

            if (word.length === 1) {
                return word.toUpperCase();
            }

            return `${word.charAt(0)}${word.charAt(
                word.length - 1,
            )}`.toUpperCase();
        }

        return `${words[0].charAt(
            0,
        )}${words[words.length - 1].charAt(0)}`.toUpperCase();
    };

    const showInitials = !artistImage || imageError;

    if (showInitials) {
        return (
            <View
                style={[
                    style,
                    styles.initialsContainer,
                    {
                        borderWidth: 1,
                        borderColor: '#FCC378',
                    },
                ]}
            >
                <AppText
                    color="#FFFFFF"
                    fontSize={28}
                    fontFamily={Inter.semibold}
                >
                    {getArtistInitials(name)}
                </AppText>
            </View>
        );
    }

    return (
        <FastAppImage
            source={{ uri: artistImage }}
            style={style}
            resizeMode="cover"
            onError={() => setImageError(true)}
        />
    );


};

const SelectedArtistScreen = () => {
    const colors = useAppColors();
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();


    const [artists, setArtists] = useState<Artist[]>([]);
    const [selectedArtists, setSelectedArtists] = useState<
        (number | string)[]
    >([]);

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showAllArtists, setShowAllArtists] =
        useState(false);

    const getArtists = async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(
                apiUrls.artists,
            );

            console.log(
                'ARTISTS RESPONSE:',
                JSON.stringify(response, null, 2),
            );

            const data = (response as any)?.data || response;

            if (data?.success) {
                setArtists(data?.artists || []);
            } else {
                console.log(
                    'ARTISTS API FAILED:',
                    data,
                );

                setArtists([]);
            }
        } catch (error: any) {
            console.log(
                'ARTISTS ERROR:',
                error?.response?.data ||
                error?.message ||
                error,
            );

            setArtists([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            getArtists();
        }, []),
    );

    const filteredArtists = artists.filter(item =>
        item?.name
            ?.toLowerCase()
            .includes(searchText.trim().toLowerCase()),
    );


    const addToggleAtEnd = (
        artistList: Artist[],
        toggleItem: Artist,
    ): Artist[] => {
        const remainder =
            artistList.length % NUM_COLUMNS;

        const placeholderCount =
            remainder === 0
                ? NUM_COLUMNS - 1
                : NUM_COLUMNS - remainder - 1;

        const placeholders: Artist[] = Array.from(
            { length: placeholderCount },
            (_, index) => ({
                id: `placeholder_${toggleItem.id}_${index}`,
                name: '',
                isPlaceholder: true,
            }),
        );

        return [
            ...artistList,
            ...placeholders,
            toggleItem,
        ];
    };


    const artistData: Artist[] = (() => {
        const hasMoreArtists =
            filteredArtists.length > MAX_VISIBLE_ARTISTS;

        if (!hasMoreArtists) {
            return filteredArtists;
        }

        if (showAllArtists) {
            return addToggleAtEnd(
                filteredArtists,
                {
                    id: 'less_artists',
                    name: 'Less Artists',
                    isLessArtist: true,
                },
            );
        }

        return addToggleAtEnd(
            filteredArtists.slice(
                0,
                MAX_VISIBLE_ARTISTS,
            ),
            {
                id: 'more_artists',
                name: 'More Artists',
                isMoreArtist: true,
            },
        );
    })();

    const toggleArtist = (
        artistId: number | string,
    ) => {
        const id = Number(artistId);

        setSelectedArtists(previous => {
            if (previous.includes(id)) {
                return previous.filter(
                    item => item !== id,
                );
            }

            return [...previous, id];
        });
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
        setShowAllArtists(false);
    };

    const clearSearch = () => {
        setSearchText('');
        setShowAllArtists(false);
    };

    const handleContinue = async () => {
        if (selectedArtists.length === 0) {
            Toast.show({
                type: 'error',
                position: 'bottom',
                bottomOffset: 80,
                text1: 'Select artists',
                text2:
                    'Please select at least one artist.',
            });

            return;
        }

        try {
            setLoading(true);

            const payload = {
                artist_ids: selectedArtists,
            };

            console.log(
                'SELECT ARTISTS PAYLOAD:',
                JSON.stringify(payload, null, 2),
            );

            const response = await ApiService.post(
                apiUrls.selectartists,
                payload,
            );

            const data = (response as any)?.data || response;

            console.log(
                'SELECT ARTISTS RESPONSE:',
                JSON.stringify(data, null, 2),
            );

            if (data?.success) {
                Toast.show({
                    type: 'success',
                    bottomOffset: 80,
                    position: 'bottom',
                    text1: 'Success',
                    text2:
                        data?.message ||
                        'Your favourite artists have been selected.',
                });

                dispatch(setLoginState(''));
            } else {
                Toast.show({
                    type: 'error',
                    bottomOffset: 80,
                    position: 'bottom',
                    text1: 'Error',
                    text2:
                        data?.message ||
                        'Unable to select artists.',
                });
            }
        } catch (error: any) {
            console.log(
                'SELECT ARTIST ERROR:',
                error?.response?.data ||
                error?.message ||
                error,
            );

            Toast.show({
                type: 'error',
                bottomOffset: 80,
                position: 'bottom',
                text1: 'Error',
                text2: 'Something went wrong.',
            });
        } finally {
            setLoading(false);
        }
    };

    const renderArtist = ({
        item,
    }: {
        item: Artist;
    }) => {

        if (item?.isPlaceholder) {
            return (
                <View style={styles.artistCard} />
            );
        }


        if (item?.isLessArtist) {
            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        setShowAllArtists(false)
                    }
                    style={styles.artistCard}
                >
                    <LinearGradient
                        colors={[
                            '#FF9A01',
                            '#CF7D00',
                            '#A96600',
                        ]}
                        start={{ x: 0.2, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.moreArtistCircle}
                    >
                        <AppText
                            color="#FFFFFF"
                            fontSize={14}
                            fontFamily={Inter.semibold}
                            style={
                                styles.moreArtistText
                            }
                        >
                            Less{'\n'}Artists
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>
            );
        }


        if (item?.isMoreArtist) {
            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        setShowAllArtists(true)
                    }
                    style={styles.artistCard}
                >
                    <LinearGradient
                        colors={[
                            '#FF9A01',
                            '#CF7D00',
                            '#A96600',
                        ]}
                        start={{ x: 0.2, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.moreArtistCircle}
                    >
                        <AppText
                            color="#FFFFFF"
                            fontSize={14}
                            fontFamily={Inter.semibold}
                            style={
                                styles.moreArtistText
                            }
                        >
                            More{'\n'}Artists
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>
            );
        }

        const artistId = Number(item?.id);

        const isSelected =
            selectedArtists.includes(artistId);

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                    toggleArtist(item?.id)
                }
                style={styles.artistCard}
            >
                <View style={styles.imageWrapper}>
                    <ArtistImage
                        name={item?.name || ''}
                        image={item?.artist_image}
                        style={styles.artistImage}
                    />

                    {isSelected && (
                        <LinearGradient
                            colors={[
                                '#FF9A01',
                                '#CF7D00',
                                '#A96600',
                            ]}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.checkContainer}
                        >
                            <AppText
                                color="#FFFFFF"
                                fontSize={16}
                                fontFamily={
                                    Inter.semibold
                                }
                            >
                                ✓
                            </AppText>
                        </LinearGradient>
                    )}
                </View>

                <AppText
                    marginTop={10}
                    fontSize={14}
                    fontFamily={Inter.semibold}
                    color={colors.darkthemetext}
                    numberOfLines={2}
                    style={styles.artistName}
                >
                    {item?.name}
                </AppText>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor:
                        colors.darkbackround,
                },
            ]}
        >

            <View style={styles.header}>
                <AppText
                    fontSize={26}
                    fontFamily={Inter.semibold}
                    color={colors.darkthemetext}
                >
                    Select your favourite artists
                </AppText>

                <AppText
                    marginTop={8}
                    fontSize={14}
                    fontFamily={Inter.regular}
                    color="#9B9094"
                >
                    Choose multiple artists to personalise
                    your music experience{' '}

                    <AppText
                        fontSize={14}
                        fontFamily={Inter.semibold}
                        color="#FFFFFF"
                    >
                        {selectedArtists.length} artist
                        {selectedArtists.length !== 1
                            ? 's'
                            : ''}{' '}
                        selected
                    </AppText>
                </AppText>
            </View>


            <View
                style={styles.searchContainer}
            >
                <AppImage
                    source={BottomIcons.search}
                    style={styles.searchIcon}
                    resizeMode="contain"
                    tintColor="#FFF"
                />

                <TextInput
                    value={searchText}
                    onChangeText={handleSearch}
                    placeholder="Search artists..."
                    placeholderTextColor="#9B9094"
                    style={[
                        styles.searchInput,
                        {
                            color:
                                colors.darkthemetext,
                        },
                    ]}
                />

                {searchText.length > 0 && (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={clearSearch}
                    >
                        <AppText
                            fontSize={18}
                            color="#9B9094"
                        >
                            ✕
                        </AppText>
                    </TouchableOpacity>
                )}
            </View>


            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator
                        size="large"
                        color={colors.lgyellow1}
                    />
                </View>
            ) : (
                <FlatList
                    data={artistData}
                    renderItem={renderArtist}
                    keyExtractor={(item, index) =>
                        item?.id?.toString() ||
                        index.toString()
                    }
                    numColumns={NUM_COLUMNS}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        styles.listContainer
                    }
                    columnWrapperStyle={
                        artistData.length >= NUM_COLUMNS
                            ? styles.columnWrapper
                            : undefined
                    }
                    ListEmptyComponent={
                        <View
                            style={
                                styles.emptyContainer
                            }
                        >
                            <AppText
                                fontSize={16}
                                fontFamily={
                                    Inter.medium
                                }
                                color="#9B9094"
                            >
                                No artists found
                            </AppText>
                        </View>
                    }
                />
            )}


            {selectedArtists.length > 0 && (
                <View
                    style={[
                        styles.bottomContainer,
                        {
                            bottom:
                                insets.bottom + 16,
                        },
                    ]}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleContinue}
                    >
                        <LinearGradient
                            colors={[
                                '#FF9A01',
                                '#CF7D00',
                                '#A96600',
                            ]}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={
                                styles.continueButton
                            }
                        >
                            <AppText
                                fontSize={16}
                                fontFamily={
                                    Inter.semibold
                                }
                                color="#FFFFFF"
                            >
                                Continue
                            </AppText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );


};

export default SelectedArtistScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },


    header: {
        paddingTop: 25,
        marginBottom: 25,
    },

    searchContainer: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#31200E',
        backgroundColor: '#242124',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        marginBottom: 20,
    },

    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },

    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        fontFamily: Inter.medium,
        paddingVertical: 0,
    },

    listContainer: {
        paddingBottom: 120,
    },

    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    artistCard: {
        width: '30%',
        alignItems: 'center',
        paddingVertical: 4,
    },

    imageWrapper: {
        position: 'relative',
    },

    artistImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },

    initialsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3D3425',
    },

    checkContainer: {
        width: 26,
        height: 26,
        borderRadius: 13,
        position: 'absolute',
        right: -3,
        bottom: -3,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },

    artistName: {
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 2,
    },

    moreArtistCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    moreArtistText: {
        textAlign: 'center',
        lineHeight: 20,
    },

    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center',
    },

    bottomContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
    },

    continueButton: {
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },


});
