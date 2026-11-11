
import { ActivityIndicator, Alert, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Header from "../share/components/Header";
import { Banner, BottomIcons, Images, Logo } from "../share/constants/media";
import color, { useAppColors } from "../share/constants/color";
import AppImage from "../share/components/AppImage";
import AppText from "../share/components/AppText";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Inter } from "../share/constants/fonts";
import { useAppDispatch } from "../share/hooks/useAppSelector";
import { addsong, loaderstate, setAuthenticated, showToast } from "../auth/redux/authSlice";
import Sound, {
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    RecordBackType,
    PlayBackType,
} from 'react-native-nitro-sound';
import { useCallback, useEffect, useState } from "react";
import apiUrls from "../services/apiUrls";
import ApiService from '../services/api';
import { GlobalImage } from "../share/utils/GlobalImage";
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { launchImageLibrary } from 'react-native-image-picker';
import { storage } from "../share/storage/mmkv";
import { useTranslation } from "react-i18next";
import { prefetchNextSongForQueue } from "../services/player";
import TrackPlayer from "@rntp/player";

const Profile = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const color = useAppColors();
    const { t } = useTranslation();
    const [play, setPlay] = useState(false);
    const [profiledetail, setProfileDetail] = useState<{
        name?: string;
        image?: string;
        avatar_url?: string;
        bio?: string;
        songs_count?: number;
        performance_count?: number;
        day_streak?: number;
        created_at?: string;
    } | null>(null);
    const [recdata, setRecdata] = useState(null);
    const [recentlyPlayed, setRecentlyPlayed] = useState(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [loader, setLoader] = useState(false);
    const [favorites, setFavorites] = useState<string | null>(null);

    const fetchProfileData = async () => {
        try {
            setLoader(true);
            const response = await ApiService.get(apiUrls.profileApi)

            const data = (response as any).data
            console.log(data, "PROFILE API RESPONSE")

            if (data?.success) {
                setProfileDetail(data.user)
            }

        } catch (error) {
            console.log("PROFILE ERROR:", error)
        }
        finally {
            setLoader(false)
        }
    }




    useFocusEffect(
        useCallback(() => {
            fetchProfileData()
            getRecording()
            getFavorites()
            getRecentlyPlayed()
        }, [])
    )



    const features = [
        // {
        //     image: Images.music,
        //     number: profiledetail?.songs_count || 0,
        //     title: 'song',
        //     tintColor: '#E52450'
        // },
        {
            image: Images.micros,
            number: profiledetail?.performance_count || 0,
            title: 'Recordings',
            tintColor: '#CC4FEE'
        },
        {
            image: Images.lit,
            number: profiledetail?.day_streak || 0,
            title: 'Streak',
            tintColor: '#D4AF37'
        },
        {
            image: Images.star,
            number: profiledetail?.ratingScore || 0,
            title: 'Rating',
            tintColor: '#F43257'
        },

    ]

    const featuritem = [
        {
            image: Images.like,
            title: t('Library.Favorites'),
            color: '#E52450'
        },
        {
            image: Images.playlist,
            title: t('Library.MyPlaylists'),
            color: '#B95EE2'
        },
        {
            image: Images.mic,
            title: t('Search.Recordings'),
            color: '#D4AF37'
        },
        // {
        //     image: Images.import,
        //     title: t('Library.Downloads'),
        //     color: '#E52450'
        // },
        // {
        //     image: Images.history,
        //     title: t('Library.History'),
        //     color: '#B95EE2'
        // },
        // {
        //     image: Images.achiv,
        //     title: t('Library.Achievments'),
        //     color: '#D4AF37'
        // },
        // {
        //     image: Images.reward,
        //     title: t('Library.Rewards'),
        //     color: '#E52450'
        // },
        {
            image: Images.import,
            title: t('Library.Logout'),
            color: '#BBD3E9'
        },

    ]


    const achievmentdata = [
        {
            image: Images.micros,
            title: 'First Recording',
            title1: 'Recorded your\nfirst performance',
            tintcolor: '#FE2A47'
        },
        // {
        //     image: Images.ylit,
        //     title: '7 day streak',
        //     title1: 'Sang everyday\nfor 7 day',
        //     tintcolor: '#FE2A47'
        // },
        {
            image: Logo.lstar,
            title: 'Top performer',
            title1: 'Featured in\ntop performances',
            tintcolor: '#CC4FEE'
        }

    ]


    const recentactivitydata = [
        {
            id: 1,
            image: Images.profile,
            title: 'Ya Leil',
        }
        ,
        {
            id: 2,
            image: Images.profile,
            title: 'Ya Leil',
        },
        {
            id: 3,
            image: Images.profile,
            title: 'Ya Leil',
        }


    ]


    const handlefeaturefun = (item: any, index: number) => {
        console.log(item, index);
        if (index == 3) {
            LogOutAlertOccurred(
                'User Logout',
                'Are you sure you want to logout?',
                'yes',
                'No',
            );
            //   storage.clearAll();

        }
        if (index == 1) {
            (navigation as any).navigate('CreatePlaylist')
        }
        if (index == 0) {
            (navigation as any).navigate('SongsListScreen', {
                songs: favorites,
                previousScreen: 'Profile',
            });
        }
        // if (index == 3) {
        //     (navigation as any).navigate('DownloadsScreen');
        // }
        if (index == 2) {
            (navigation as any).navigate('RecordingList', {
                recordings: recdata,
                previousScreen: 'Profile',
                isRecordings: true,
            });
        }
    };


    const handleachevmentfun = (item: any, index: number) => {
        console.log(item, index);

        if (index == 0) {
            (navigation as any).navigate('Recording', { prevScreen: 'Profile' })
        }
        if (index == 1) {
            (navigation as any).navigate('RecordingList', {
                recordings: recdata,
                previousScreen: 'Profile',
                isRecordings: true,
            });
        }
    };





    const playRecording = async (item: any) => {
        stopRecording()

        console.log(item.id, item.recording_url, "dkdkbkdbkdb5")
        try {
            const result = await Sound.startPlayer(item.recording_url);
            setPlayingId(item.id);
            console.log('Playing:', result);
            Sound.removePlayBackListener();
            Sound.addPlayBackListener((e) => {
                console.log(
                    'Current:',
                    Sound.mmssss(Math.floor(e.currentPosition)),
                );



                if (e.currentPosition >= e.duration) {
                    Sound.stopPlayer();
                    Sound.removePlayBackListener();
                    setPlay(true)
                    setPlayingId(null)
                }
            });
        } catch (error) {
            console.log('Play error:', error);
        }
    };


    const stopRecording = () => {
        console.log("dkdkbkdbkdb")
        Sound.stopPlayer();
        Sound.removePlayBackListener();
        setPlay(true)
        setPlayingId(null)
    }


    const getRecording = async () => {
        try {

            const response = await ApiService.get(apiUrls.getrecording)

            const data = (response as any).data
            console.log(data, "getrecording API RESPONSE")

            if (data?.success) {
                console.log(data.recordings, "inside API RESPONSE")
                setRecdata(data.recordings)
            }

        } catch (error) {
            console.log("getrecording ERROR:", error)
        }
        finally {

        }
    }


    const getRecentlyPlayed = async () => {
        try {

            const response = await ApiService.get(apiUrls.recentlypalyed)

            const data = (response as any).data
            console.log(data.success, "getrecentlyplayed API RESPONSE")

            if (data?.success) {
                console.log(data.songs, "inside API RESPONSE")
                setRecentlyPlayed(data.songs)
            }

        } catch (error) {
            console.log("getrecentlyplayed ERROR:", error)
        }
        finally {

        }
    }



    const pickImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 1,
                selectionLimit: 1,
            },
            async response => {
                if (response.didCancel) {
                    console.log('Cancelled');
                    return;
                }

                if (response.errorCode) {
                    console.log(response.errorMessage);

                    dispatch(
                        showToast({
                            visible: true,
                            message: response.errorMessage || 'Unable to select image.',
                            type: 'error',
                        }),
                    );

                    return;
                }

                const asset = response.assets?.[0];

                if (!asset?.uri) {
                    dispatch(
                        showToast({
                            visible: true,
                            message: 'Unable to select image.',
                            type: 'error',
                        }),
                    );

                    return;
                }

                try {
                    const formData = new FormData();

                    formData.append('avatar', {
                        uri: asset.uri,
                        type: asset.type || 'image/jpeg',
                        name: asset.fileName || `profile_${Date.now()}.jpg`,
                    } as any);

                    const result = await ApiService.put(
                        apiUrls.profileApi,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        },
                    );

                    console.log(
                        result.data,
                        'UPDATE AVATAR RESPONSE',
                    );

                    if (result.data?.success) {
                        // Immediately update avatar on Profile screen
                        setProfileDetail(prev => ({
                            ...prev,
                            avatar_url:
                                result.data?.user?.avatar_url ||
                                result.data?.avatar_url ||
                                prev?.avatar_url,
                        }));

                        dispatch(
                            showToast({
                                visible: true,
                                message: 'Profile picture updated successfully.',
                                type: 'success',
                            }),
                        );


                        fetchProfileData();
                    } else {
                        dispatch(
                            showToast({
                                visible: true,
                                message:
                                    result.data?.message ||
                                    'Unable to update profile picture.',
                                type: 'error',
                            }),
                        );
                    }
                } catch (error: any) {
                    console.log(
                        'UPDATE AVATAR ERROR:',
                        error?.response?.data || error,
                    );

                    dispatch(
                        showToast({
                            visible: true,
                            message:
                                error?.response?.data?.message ||
                                'Unable to update profile picture.',
                            type: 'error',
                        }),
                    );
                }
            },
        );
    };

    const getTimeAgo = (updated_at) => {
        if (!updated_at) return '';

        const diff = new Date() - new Date(updated_at);

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };


    const LogOutAlertOccurred = (title: string, body: string, btnTxt: string, btnTxt2: string) => {
        Alert.alert(title, body, [
            {
                text: btnTxt,
                onPress: async () => {
                    storage.set('userToken', '');
                    const token = storage.getString('userToken');
                    console.log(token, "fkfckfv")
                    dispatch(setAuthenticated(false));
                    await TrackPlayer.stop();
                    dispatch(
                        addsong
                            (''),)
                },
            },

            {
                text: btnTxt2,
                onPress: () => {
                    console.log('No Pressed');
                },
            },
        ]);
    };


    const getInitials = (name?: string) => {
        return name
            ?.trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(word => word[0])
            .join('')
            .toUpperCase() || '';
    };

    const formatMemberSince = (createdAt?: string) => {
        if (!createdAt) return '';

        const date = new Date(createdAt);

        if (isNaN(date.getTime())) return '';

        return `Member Since ${date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        })}`;
    };

    const getFavorites = async () => {
        try {

            const response = await ApiService.get(apiUrls.favorites)

            const data = (response as any).data
            console.log(data, "profilefavorate API RESPONSE")

            if (data?.success) {
                console.log(data.songs, "inside API RESPONSE")
                setFavorites(data.songs)

            }

        } catch (error) {
            console.log("PROFILE ERROR:", error)
        }
        finally {

        }
    }


    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: color.darkbackround },
            ]}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* <View style={styles.topHeader}>
                    <AppText
                        color="#FFFFFF"
                        fontSize={18}
                        fontWeight="600"
                        fontFamily={Inter.medium}
                    >
                        Karkab
                    </AppText>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('SettingScreen' as never)}
                    >
                        <AppImage
                            source={Images.setting}
                            width={20}
                            height={20}
                        />
                    </TouchableOpacity>
                </View> */}


                <Header
                    headername={'Profile'}
                    headertitle={t('Library.Yourjourneyyourvoice')}
                    rightIcon={Images.bell}
                    onRightPress={() => { (navigation as any).navigate('NotificationScreen', { previousScreen: 'Profile' }) }}
                    rightView={
                        <TouchableOpacity style={{
                            width: 40,
                            height: 40,

                            flexDirection: 'row',
                            borderWidth: 1,
                            borderColor: color.brown,

                            justifyContent: 'center',
                            alignItems: 'center',

                            borderRadius: 97
                        }}
                            onPress={() => {
                                (navigation as any)?.navigate(
                                    'SettingScreen',
                                );
                            }}
                        >
                            <AppImage
                                source={Images.setting}
                                width={18}
                                height={19}

                            />

                        </TouchableOpacity>
                    }
                />

                {loader ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#D07113" />
                    </View>
                ) : (
                    <>
                        {/* Profile Information */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarWrapper}>
                                <LinearGradient
                                    colors={['#A83DDA', '#F04A85']}
                                    style={styles.avatarGradient}
                                >
                                    {profiledetail?.avatar_url ? (
                                        <AppImage
                                            source={GlobalImage(profiledetail.avatar_url)}
                                            width={68}
                                            height={68}
                                            radius={34}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <AppText
                                            color="#FFFFFF"
                                            fontSize={26}
                                            fontWeight="700"
                                        >
                                            {getInitials(profiledetail?.name)}
                                        </AppText>
                                    )}
                                </LinearGradient>
                            </View>

                            <View style={styles.profileInfo}>
                                <AppText
                                    color="#FFFFFF"
                                    fontSize={18}

                                    fontFamily={Inter.bold}
                                    numberOfLines={1}
                                >
                                    {profiledetail?.name
                                        ? profiledetail.name.charAt(0).toUpperCase() +
                                        profiledetail.name.slice(1)
                                        : 'User'}
                                </AppText>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        navigation.navigate('SettingScreen' as never)
                                    }
                                    style={styles.editProfileButton}
                                >
                                    <AppText
                                        color="#D5D5D5"
                                        fontSize={10}
                                        fontFamily={Inter.regular}
                                    >
                                        {t('Player.Editprofile')}

                                    </AppText>
                                </TouchableOpacity>
                            </View>
                            {/* 
                            <TouchableOpacity
                                onPress={pickImage}
                                style={styles.cameraButton}
                            >
                                <AppImage
                                    source={Logo.camera}
                                    width={13}
                                    height={13}
                                />
                            </TouchableOpacity> */}
                        </View>

                        {/* Profile Menu */}
                        <View style={styles.menuCard}>
                            {[
                                {
                                    title: t('Profile.Myrecordings'),
                                    image: Images.mic,
                                    onPress: () =>
                                        (navigation as any).navigate('RecordingList' as never, {
                                            recordings: recdata,
                                            previousScreen: 'Profile',
                                            isRecordings: true,
                                        } as never),
                                },
                                {
                                    title: t('Profile.Myplaylists'),
                                    image: Images.playlist,
                                    onPress: () =>
                                        (navigation as any).navigate('CreatePlaylist' as never),
                                },
                                {
                                    title: t('Library.Myplaylists'),
                                    image: Images.like,
                                    onPress: () =>
                                        (navigation as any).navigate('SongsListScreen' as never, {
                                            songs: favorites,
                                            previousScreen: 'Profile',
                                        } as never),
                                },
                                {
                                    title: t('Home.RecentlyPlayed'),
                                    image: Images.history,
                                    onPress: () =>

                                        (navigation as any).navigate('SongsListScreen' as never, {
                                            songs: recentlyPlayed,
                                            previousScreen: 'Profile',
                                        } as never),
                                },
                            ].map((item, index) => (
                                <TouchableOpacity
                                    key={item.title}
                                    activeOpacity={0.7}
                                    onPress={item.onPress}
                                    style={[
                                        styles.menuItem,
                                        index !== 3 && styles.menuItemBorder,
                                    ]}
                                >
                                    <View style={styles.menuLeft}>
                                        <AppImage
                                            source={item.image}
                                            width={20}
                                            height={20}
                                            resizeMode="contain"
                                            tintColor="#E7E7E7"
                                        />

                                        <AppText
                                            color="#E8E8E8"
                                            fontSize={13}
                                            fontFamily={Inter.regular}
                                        >
                                            {item.title}
                                        </AppText>
                                    </View>

                                    <AppText color="#929292" fontSize={23}>
                                        ›
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Recent Recordings */}
                        <View style={styles.recentHeader}>
                            <AppText
                                color="#FFFFFF"
                                fontSize={15}
                                fontWeight="600"
                                fontFamily={Inter.medium}
                            >
                                {t('Profile.Recentrecordings')}

                            </AppText>

                            <TouchableOpacity
                                onPress={() =>
                                    (navigation as any).navigate('RecordingList' as never, {
                                        recordings: recdata,
                                        previousScreen: 'Profile',
                                        isRecordings: true,
                                    } as never)
                                }
                                style={styles.seeAllButton}
                            >
                                <AppText
                                    color="#B84CFF"
                                    fontSize={12}
                                    fontFamily={Inter.medium}
                                >
                                    {t('Home.Seeall')}

                                </AppText>

                                <AppText color="#B84CFF" fontSize={18}>
                                    ›
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        {recdata?.length > 0 ? (
                            <View style={styles.recordingCard}>
                                {recdata.slice(0, 3).map((item, index) => (
                                    <View
                                        key={item.id?.toString() || index.toString()}
                                        style={styles.recordingItem}
                                    >
                                        <AppImage
                                            source={GlobalImage(item?.album_picture_url)}
                                            width={48}
                                            height={48}
                                            radius={8}
                                            resizeMode="cover"
                                        />

                                        <View style={styles.recordingInfo}>
                                            <AppText
                                                color="#FFFFFF"
                                                fontSize={12}
                                                fontFamily={Inter.medium}
                                                numberOfLines={1}
                                            >
                                                {item.title || 'Practice recording'}
                                            </AppText>

                                            <AppText
                                                color="#999999"
                                                fontSize={10}
                                                fontFamily={Inter.regular}
                                                style={{ marginTop: 4 }}
                                            >
                                                {item.duration || '00:00'} · {getTimeAgo(item.updated_at)}
                                            </AppText>
                                        </View>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                (navigation as any).navigate('.' as never, {
                                                    id: item.id,
                                                    type: 'recordings',
                                                    previousScreen: 'Profile',
                                                } as never);
                                            }}
                                            style={styles.recordingPlayButton}
                                        >
                                            <AppImage
                                                source={Images.playicon}
                                                width={10}
                                                height={10}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.moreButton}
                                            onPress={() => {
                                                // Add recording options here if required.
                                            }}
                                        >
                                            <AppText color="#FFFFFF" fontSize={20}>
                                                ⋮
                                            </AppText>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyRecordings}>
                                <AppText color="#999999" fontSize={12}>

                                    {t('Profile.Norecordingsfound')}
                                </AppText>
                            </View>
                        )}

                        {/* Create Playlist */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                navigation.navigate('CreatePlaylist' as never)
                            }
                            style={styles.createPlaylistGradient}
                        >
                            <LinearGradient
                                colors={['#F28B36', '#A53DDB']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.createPlaylistBorder}
                            >
                                <View style={styles.createPlaylistInner}>
                                    <AppText
                                        color="#B84CFF"
                                        fontSize={20}
                                        fontWeight="400"
                                    >
                                        +
                                    </AppText>

                                    <AppText
                                        color="#B84CFF"
                                        fontSize={13}
                                        fontFamily={Inter.medium}
                                    >

                                        {t('Profile.Createplaylist')}

                                    </AppText>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={{ height: 30 }} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}





const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },

    scrollContent: {
        paddingBottom: 20,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    topHeader: {
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },

    avatarWrapper: {
        width: 68,
        height: 68,
        borderRadius: 34,
        overflow: 'hidden',
    },

    avatarGradient: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 5,
    },

    editProfileButton: {
        borderWidth: 1,
        borderColor: '#555555',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 5,
        alignSelf: 'flex-start',
    },

    cameraButton: {
        position: 'absolute',
        left: 43,
        bottom: 0,
        height: 21,
        width: 21,
        borderRadius: 11,
        backgroundColor: '#252525',
        justifyContent: 'center',
        alignItems: 'center',
    },

    menuCard: {
        backgroundColor: '#191A1E',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 20,
    },

    menuItem: {
        height: 49,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },

    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#292A2E',
    },

    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },

    recentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    recordingCard: {
        backgroundColor: '#191A1E',
        borderRadius: 13,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    recordingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 10,
    },

    recordingInfo: {
        flex: 1,
        justifyContent: 'center',
    },

    recordingPlayButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#292A2E',
        justifyContent: 'center',
        alignItems: 'center',
    },

    moreButton: {
        width: 20,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },

    emptyRecordings: {
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#191A1E',
        borderRadius: 13,
    },

    createPlaylistGradient: {
        width: '100%',
        height: 42,
        borderRadius: 11,
        overflow: 'hidden',
        marginTop: 12,

    },

    createPlaylistBorder: {
        flex: 1,
        //  padding: 1,

        borderRadius: 11,
    },

    createPlaylistInner: {
        flex: 1,
        borderRadius: 10,
        backgroundColor: '#111216',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        margin: 1,
    },
});


export default Profile;