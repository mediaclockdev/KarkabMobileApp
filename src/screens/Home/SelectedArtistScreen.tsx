import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,

    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AppImage from '../../share/components/AppImage';
import { useAppColors } from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import ApiService from '../../services/api';
import apiUrls from '../../services/apiUrls';
import AppText from '../../share/components/AppText';
import Toast from 'react-native-toast-message';
import { FastAppImage } from '../../share/components/FastAppImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { setLoginState } from '../../auth/redux/authSlice';


const ArtistImage = ({
    name,
    image,
    style,
    colors,
}: {
    name: string;
    image?: string | null;
    style?: any;
    colors: any;
}) => {
    const [imageError, setImageError] = useState(false);

    const artistImage = image?.trim?.() || '';

    const getArtistInitials = (name: string = '') => {
        const words = name.trim().split(/\s+/).filter(Boolean);

        if (words.length === 0) {
            return '';
        }

        if (words.length === 1) {
            const word = words[0];

            if (word.length === 1) {
                return word.toUpperCase();
            }

            return `${word.charAt(0)}${word.charAt(word.length - 1)}`.toUpperCase();
        }

        return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
    };

    const showInitials = !artistImage || imageError;

    if (showInitials) {
        return (
            <View
                style={[
                    style,
                    styles.initialsContainer,
                    {
                        // backgroundColor: '#3D3425',
                        borderWidth: 1,
                        borderColor: '#FCC378'
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

const SelectedArtistScreen = ({ navigation }: any) => {
    const colors = useAppColors();
    const dispatch = useAppDispatch();
    const [artists, setArtists] = useState<any[]>([]);
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const DUMMY_ARTISTS = [
        {
            id: '1',
            name: 'Arijit Singh',
            image: 'https://picsum.photos/200?random=1',
        },
        {
            id: '2',
            name: 'Diljit Dosanjh',
            image: 'https://picsum.photos/200?random=2',
        },
        {
            id: '3',
            name: 'Shreya Ghoshal',
            image: 'https://picsum.photos/200?random=3',
        },
        {
            id: '4',
            name: 'AP Dhillon',
            image: 'https://picsum.photos/200?random=4',
        },
        {
            id: '5',
            name: 'Sidhu Moose Wala',
            image: 'https://picsum.photos/200?random=5',
        },
        {
            id: '6',
            name: 'Badshah',
            image: 'https://picsum.photos/200?random=6',
        },
        {
            id: '7',
            name: 'Karan Aujla',
            image: 'https://picsum.photos/200?random=7',
        },
        {
            id: '8',
            name: 'Yo Yo Honey Singh',
            image: 'https://picsum.photos/200?random=8',
        },
        {
            id: '9',
            name: 'A. R. Rahman',
            image: 'https://picsum.photos/200?random=9',
        },
        {
            id: '10',
            name: 'Atif Aslam',
            image: 'https://picsum.photos/200?random=10',
        },
        {
            id: '11',
            name: 'Neha Kakkar',
            image: 'https://picsum.photos/200?random=11',
        },
        {
            id: '12',
            name: 'Sonu Nigam',
            image: 'https://picsum.photos/200?random=12',
        },
    ];

    const getArtists = async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.artists);

            console.log(
                'ARTISTS RESPONSE:',
                JSON.stringify(response, null, 2),
            );

            const data = response?.data || response;

            if (data?.success) {
                setArtists(data?.artists || []);
            } else {
                console.log('ARTISTS API FAILED:', data);
                setArtists([]);
            }
        } catch (error: any) {
            console.log(
                'ARTISTS ERROR:',
                error?.response?.data ||
                error?.message ||
                error,
            );
        } finally {
            setLoading(false);
        }
    };



    useFocusEffect(
        useCallback(() => {
            getArtists();
        }, [])
    )

    const toggleArtist = (artistId: number | string) => {
        const id = Number(artistId);

        setSelectedArtists(previous => {
            if (previous.includes(id)) {
                return previous.filter(item => item !== id);
            }

            return [...previous, id];
        });
    };

    const handleContinue = async () => {
        if (selectedArtists.length === 0) {
            console.log('Please select at least one artist');
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

            const data = response?.data || response;

            console.log(
                'SELECT ARTISTS RESPONSE:',
                JSON.stringify(data, null, 2),
            );

            if (data?.success) {
                Toast.show({ type: 'success', bottomOffset: 80, position: 'bottom', text1: 'Success', text2: data?.message || 'Your favourite artists have been selected.', });
                // navigation.replace('MainTabs');
                dispatch(setLoginState(''));
            } else {
                console.log(
                    'SELECT ARTISTS API FAILED:',
                    data?.message || data,
                );
            }
        } catch (error: any) {
            console.log(
                'SELECT ARTIST ERROR:',
                error?.response?.data ||
                error?.message ||
                error,
            );
        } finally {
            setLoading(false);
        }
    };

    const renderArtist = ({ item }: any) => {
        const isSelected = selectedArtists.includes(item?.id);

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleArtist(item?.id)}
                style={[
                    styles.artistCard,
                    {
                        backgroundColor: colors.darkbackround,
                        borderColor: isSelected
                            ? colors.mgred
                            : '#3A3033',
                    },
                ]}
            >
                <View style={styles.imageWrapper}>
                    <ArtistImage
                        name={item?.name || ''}
                        image={item?.artist_image}
                        style={styles.artistImage}
                        colors={colors}
                    />
                    {isSelected && (
                        <View
                            style={[
                                styles.checkContainer,
                                { backgroundColor: colors.mgred },
                            ]}
                        >
                            <AppText
                                color="#FFFFFF"
                                fontSize={14}
                                fontFamily={Inter.semibold}
                            >
                                ✓
                            </AppText>
                        </View>
                    )}
                </View>

                <AppText
                    marginTop={10}
                    fontSize={14}
                    fontFamily={Inter.semibold}
                    color={colors.darkthemetext}
                    numberOfLines={1}
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
                { backgroundColor: colors.darkbackround },
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
                    Choose multiple artists to personalise your music experience{'  '}

                    <AppText
                        fontSize={14}
                        fontFamily={Inter.semibold}
                        color="#FFFFFF"
                    >
                        {selectedArtists.length} artist
                        {selectedArtists.length !== 1 ? 's' : ''} selected
                    </AppText>
                </AppText>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.lgyellow1} />
                </View>
            ) : (



                <FlatList
                    data={artists}
                    renderItem={renderArtist}
                    keyExtractor={(item, index) =>
                        item?.id?.toString() || index.toString()
                    }
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    columnWrapperStyle={styles.columnWrapper}
                />

            )}

            <View style={styles.bottomContainer}>
                <View style={styles.selectedTextContainer}>
                    {/* <AppText
                        fontSize={13}
                        fontFamily={Inter.medium}
                        color="#9B9094"
                    >
                        {selectedArtists.length} artist
                        {selectedArtists.length !== 1 ? 's' : ''} selected
                    </AppText> */}
                </View>
                {

                    selectedArtists.length > 0 ?
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleContinue}
                            disabled={selectedArtists.length === 0}
                            style={[
                                styles.continueButton,
                                {
                                    backgroundColor:
                                        selectedArtists.length > 0
                                            ? colors.mgred
                                            : '#4D4447',
                                },
                            ]}
                        >
                            <AppText
                                fontSize={16}
                                fontFamily={Inter.semibold}
                                color="#FFFFFF"
                            >
                                Continue
                            </AppText>
                        </TouchableOpacity> : null
                }

                {/* <View style={{ height: 80 }} /> */}
            </View>
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
        borderWidth: 1.5,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 5,
    },

    imageWrapper: {
        position: 'relative',
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

    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    bottomContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },

    selectedTextContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },

    continueButton: {
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },
    artistImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    initialsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});