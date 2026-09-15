
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
import { loaderstate, setAuthenticated, showToast } from "../auth/redux/authSlice";
import Sound, {
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    RecordBackType,
    PlayBackType,
} from 'react-native-nitro-sound';
import { useEffect, useState } from "react";
import apiUrls from "../services/apiUrls";
import ApiService from '../services/api';
import { GlobalImage } from "../share/utils/GlobalImage";
import { useNavigation } from '@react-navigation/native'
import { launchImageLibrary } from 'react-native-image-picker';
import { storage } from "../share/storage/mmkv";

const Profile = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const color = useAppColors();
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
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [loader, setLoader] = useState(false)

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

    useEffect(() => {
        fetchProfileData()
        getRecording()
    }, [])




    const features = [
        {
            image: Images.music,
            number: profiledetail?.songs_count || 0,
            title: 'song',
            tintColor: '#E52450'
        },
        {
            image: Images.micros,
            number: profiledetail?.performance_count || 0,
            title: 'Performances',
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
            number: 128,
            title: 'Rating',
            tintColor: '#F43257'
        },

    ]

    const featuritem = [
        {
            image: Images.like,
            title: 'Favorites',
            color: '#E52450'
        },
        {
            image: Images.playlist,
            title: 'Playlists',
            color: '#B95EE2'
        },
        {
            image: Images.mic,
            title: 'Performances',
            color: '#D4AF37'
        },
        {
            image: Images.import,
            title: 'Downloads',
            color: '#E52450'
        },
        {
            image: Images.history,
            title: 'History',
            color: '#B95EE2'
        },
        {
            image: Images.achiv,
            title: 'Achievements',
            color: '#D4AF37'
        },
        {
            image: Images.reward,
            title: 'Rewards',
            color: '#E52450'
        },
        {
            image: Images.import,
            title: 'Logout',
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
        {
            image: Images.ylit,
            title: '7 day streak',
            title1: 'Sang everyday\nfor 7 day',
            tintcolor: '#FE2A47'
        },
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
        if (index == 7) {
            LogOutAlertOccurred(
                'User Logout',
                'Are you sure you want to logout?',
                'yes',
                'No',
            );
            //   storage.clearAll();

        }
        if (index == 1) {
            navigation.navigate('CreatePlaylist')
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

                        // Refresh complete profile data
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: color.darkbackround }]}>
            <Header
                headername={'Profile'}
                headertitle={'Your journey , your voice'}
                rightIcon={Images.bell}
                onRightPress={() => { navigation.navigate('NotificationScreen') }}
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
                            navigation?.navigate(
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

            {
                loader ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#EFCB61" />
                    </View> :
                    <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false} style={{ gap: 20 }} contentContainerStyle={{
                        rowGap: 20,
                    }}>
                        <View style={{ flexDirection: 'row', gap: 20, justifyContent: 'flex-start', alignItems: 'center', }}>
                            <View style={{
                                width: 120,
                                height: 120,
                                alignSelf: 'center',
                                overflow: 'visible',
                            }}>


                                <LinearGradient
                                    colors={['#EB2C78', '#F8B953']}
                                    start={{ x: 0.2, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: 60,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    {profiledetail?.avatar_url ? (
                                        <AppImage
                                            source={GlobalImage(profiledetail.avatar_url)}
                                            width={118}
                                            height={118}
                                            radius={58}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <AppText
                                            style={{
                                                fontSize: 42,
                                                fontWeight: '700',
                                                color: '#FFFFFF',
                                            }}
                                        >
                                            {getInitials(profiledetail?.name)}
                                        </AppText>
                                    )}
                                </LinearGradient>
                                <TouchableOpacity
                                    onPress={pickImage}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#D07113',
                                        position: 'absolute',
                                        bottom: 4,
                                        right: 2,
                                        height: 32,
                                        width: 32,
                                        borderRadius: 16,
                                        backgroundColor: '#000',

                                        zIndex: 9999,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <AppImage
                                        source={Logo.camera}
                                        height={11}
                                        width={13}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={{ gap: 1 }}>
                                <AppText width={'80%'} lineHeight={22} color={color.darkthemetext} fontSize={16} fontWeight="500" fontFamily={Inter.regular}>

                                    {profiledetail?.name


                                        ? profiledetail?.name?.charAt(0).toUpperCase() + profiledetail.name.slice(1).toLowerCase()
                                        : ''


                                    }
                                </AppText>


                                <View style={styles.vipview}>
                                    <AppImage
                                        source={Images.rivip}
                                        width={15}
                                        height={15}

                                    />
                                    <AppText color={"#FEDF66"} fontSize={10} fontWeight="500" fontFamily={Inter.regular}>
                                        VIP Premium
                                    </AppText>

                                </View>
                                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                    <AppImage
                                        source={Images.star}
                                        width={15}
                                        height={15}
                                        tintColor={"#D07113"}

                                    />
                                    <AppText color={"#D07113"} fontSize={11} fontWeight="500" fontFamily={Inter.regular}>
                                        Rising Star
                                    </AppText>

                                </View>

                                <View style={{ flex: 1, width: '100%', }}>
                                    <View style={{ flex: 1, width: 200, flexWrap: 'wrap' }}>


                                        <AppText
                                            color="#CECECE"
                                            fontSize={10}
                                            lineHeight={18}
                                            numberOfLines={3}
                                            fontFamily={Inter.regular}
                                            style={{
                                                flexShrink: 1,
                                                width: '100%',
                                                flexWrap: 'wrap'

                                            }}
                                        >
                                            {profiledetail?.bio || ''}
                                        </AppText>
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            gap: 5,
                                            alignItems: 'center',
                                            marginTop: 10,
                                        }}
                                    >
                                        <AppImage
                                            source={Logo.calander}
                                            width={15}
                                            height={15}
                                        />

                                        <AppText
                                            color="#D07113"
                                            fontSize={10}
                                            fontWeight="400"
                                            fontFamily={Inter.light}
                                        >
                                            {formatMemberSince(profiledetail?.created_at)}
                                        </AppText>
                                    </View>
                                </View>



                            </View>

                        </View>



                        <View style={styles.dashboardview}>
                            {
                                features.map((item, index) => {
                                    return (
                                        <View key={index} style={{
                                            gap: 5,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <AppImage
                                                source={item.image}
                                                width={30}
                                                height={30}
                                                resizeMode="contain"
                                                tintColor={item.tintColor}
                                                style={{
                                                    alignSelf: 'center',
                                                }}
                                            />
                                            <AppText color={color.darkthemetext}
                                                fontSize={20}
                                                fontWeight="500"
                                                fontFamily={Inter.regular}>
                                                {item.number}
                                            </AppText>
                                            <AppText
                                                color={color.darkthemetext}
                                                fontSize={10}
                                                fontWeight="500"
                                                fontFamily={Inter.regular}>
                                                {item.title}
                                            </AppText>

                                        </View>
                                    )
                                })
                            }
                        </View>

                        <View style={{ borderColor: '#121212', borderWidth: 1, borderRadius: 12, width: '100%', padding: 10 }} >

                            <View style={[styles.titles, { width: '100%' }]}>
                                <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                                    Achievments
                                </AppText>
                                <TouchableOpacity style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                                    <AppText color={color.mgred} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                                        View all
                                    </AppText>
                                    <AppImage
                                        source={Images.arrow}
                                        width={5}
                                        height={8}
                                    />
                                </TouchableOpacity>


                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingVertical: 10 }}>
                                {achievmentdata.map((item, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            width: '31.3%',
                                            borderWidth: 1,
                                            borderColor: '#121212',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 5, padding: 11,
                                            borderRadius: 9,
                                            paddingHorizontal: 12,

                                        }}
                                    >
                                        <ImageBackground
                                            source={Images.hexagon}
                                            height={42}
                                            width={32}
                                            resizeMode="conatin"
                                            style={{ justifyContent: 'center', alignItems: 'center', padding: 8 }}
                                            imageStyle={{
                                                tintColor: item.tintcolor,
                                            }}
                                        >
                                            <AppImage
                                                source={item.image}
                                                width={12}
                                                height={19}
                                                resizeMode="contain"
                                            />

                                        </ImageBackground>
                                        <View>
                                            <AppText color={color.darkthemetext} fontSize={8}
                                                fontWeight="500"
                                                fontFamily={Inter.regular}>
                                                {item.title}
                                            </AppText>
                                            <AppText color={color.darkthemetext} fontSize={7}
                                                fontWeight="500"
                                                marginTop={5}
                                                fontFamily={Inter.regular}>
                                                {item.title1}
                                            </AppText>
                                        </View>

                                    </View>
                                ))}
                            </View>

                        </View>



                        <View style={[styles.titles]}>
                            <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                                Recent Perfomance
                            </AppText>
                            <TouchableOpacity style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                                <AppText color={color.mgred} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                                    See all
                                </AppText>
                                <AppImage
                                    source={Images.arrow}
                                    width={5}
                                    height={8}
                                />
                            </TouchableOpacity>


                        </View>


                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: 10 }}>
                            {recentactivitydata?.slice(0, 3).map((item, index) => (
                                <View key={index} style={{
                                    height: 111,
                                    width: '30%',
                                    borderWidth: 1,
                                    borderColor: '#121212',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',

                                    borderRadius: 9,
                                    overflow: 'hidden'

                                }}>
                                    <ImageBackground
                                        source={Banner.recentperfbaneer}
                                        resizeMode="cover"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            padding: 10,
                                            gap: 10,
                                            justifyContent: 'space-between',
                                        }}
                                        imageStyle={{
                                            width: '120%',
                                        }}
                                    >
                                        {/* Play Button */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                playingId === item.id
                                                    ? stopRecording()
                                                    : playRecording(item)
                                            }}
                                            style={{
                                                borderWidth: 2,
                                                borderColor: '#F3870C',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: 'black',
                                                height: 24,
                                                width: 24,
                                                borderRadius: 15,
                                                alignSelf: 'center',
                                            }}
                                        >
                                            {
                                                playingId == item.id ?
                                                    <View style={styles.pauseContainer}>
                                                        <View style={styles.pauseLine} />
                                                        <View style={styles.pauseLine} />
                                                    </View> :
                                                    <AppImage
                                                        source={Images.playicon}
                                                        width={7}
                                                        height={7}
                                                        resizeMode="contain"
                                                    />}
                                        </TouchableOpacity>

                                        {/* Bottom Content */}
                                        <View>
                                            <AppText
                                                color={color.darkthemetext}
                                                fontSize={12}
                                                fontWeight="500"
                                                fontFamily={Inter.regular}
                                                numberOfLines={1}
                                            >
                                                {item.title}
                                            </AppText>

                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    gap: 5,
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <AppText
                                                    color="#AFA7A2"
                                                    fontSize={10}
                                                    fontWeight="400"
                                                    fontFamily={Inter.light}
                                                >
                                                    {getTimeAgo(item.updated_at)}
                                                </AppText>

                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        gap: 5,
                                                        alignItems: 'center',
                                                        borderWidth: 1,
                                                        borderColor: '#121212',
                                                        padding: 2,
                                                        borderRadius: 5,
                                                    }}
                                                >
                                                    <AppImage
                                                        source={Images.star}
                                                        width={10}
                                                        height={10}
                                                        tintColor={'#D07113'}
                                                    />
                                                    <AppText
                                                        color="#D07113"
                                                        fontSize={10}
                                                        fontWeight="400"
                                                        fontFamily={Inter.light}
                                                    >
                                                        4.8
                                                    </AppText>
                                                </View>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </View>
                            ))}
                        </View>


                        <View style={[styles.titles]}>
                            <AppText color={color.darkthemetext} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                                Recent activity
                            </AppText>
                            <TouchableOpacity style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                                <AppText color={color.mgred} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                                    See all
                                </AppText>
                                <AppImage
                                    source={Images.arrow}
                                    width={5}
                                    height={8}
                                />
                            </TouchableOpacity>


                        </View>



                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.card, { borderColor: color.searhbarbordercolor }]}
                        >
                            {/* Image */}
                            <AppImage
                                source={Images.profile}
                                width={62}
                                height={64}
                                radius={8}
                            />

                            {/* Content */}
                            <View style={styles.content}>
                                <AppText
                                    fontSize={10}
                                    fontWeight="700"
                                    color={color.darkthemetext}
                                    fontFamily={Inter.medium}
                                >
                                    {"Ya Leil"}
                                </AppText>

                                <AppText
                                    fontSize={10}
                                    color={color.darkthemetext}
                                    marginTop={4}
                                    fontFamily={Inter.regular}
                                >
                                    Hozan Yosif
                                </AppText>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        {/* <AppImage
                                    source={Images.mic}
                                    width={16}
                                    height={16}
                                // radius={8}
                                /> */}

                                        <AppText
                                            fontSize={8}
                                            color={color.darkthemetext}
                                            marginTop={4}
                                            fontFamily={Inter.light}
                                        >
                                            {"Performed 2 h ago"}
                                        </AppText>
                                    </View>



                                </View>


                            </View>

                            {/* Right Side */}
                            <View style={styles.right}>


                                {/* <TouchableOpacity style={styles.playButton} onPress={play?stopRecording:playRecording}>
{
    play?
  <View style={styles.pauseContainer}>
              <View style={styles.pauseLine} />
              <View style={styles.pauseLine} />
            </View> 
            :
               <AppImage
                                source={Images.playicon}
                                width={8.2}
                                height={8.2}
                                tintColor={color.darkthemetext}
                            />
}
                         
                         
                        </TouchableOpacity> */}

                                <View style={{ gap: 2, alignItems: 'center' }}>
                                    <AppImage
                                        source={Images.like}
                                        height={16}
                                        width={16}
                                    />
                                    <AppText color={color.darkthemetext} fontSize={10} fontFamily={Inter.regular}>
                                        {"45"}
                                    </AppText>
                                    <AppText color={color.darkthemetext} fontSize={8} fontFamily={Inter.regular}>
                                        {"Likes"}
                                    </AppText>
                                </View>

                                <View style={{ gap: 2, alignItems: 'center' }}>
                                    <AppImage
                                        source={Logo.eye}
                                        height={16}
                                        width={16}
                                        tintColor={"#9FB9DA"}
                                        resizeMode="contain"
                                    />
                                    <AppText color={color.darkthemetext} fontSize={10} fontFamily={Inter.regular}>
                                        {"45"}
                                    </AppText>
                                    <AppText color={color.darkthemetext} fontSize={8} fontFamily={Inter.regular}>
                                        {"Views"}
                                    </AppText>
                                </View>
                                <View style={{ gap: 2, alignItems: 'center' }}>
                                    <AppImage
                                        source={Logo.mshare}
                                        height={16}
                                        width={16}
                                    />
                                    <AppText color={color.darkthemetext} fontSize={10} fontFamily={Inter.regular}>
                                        {"45"}
                                    </AppText>
                                    <AppText color={color.darkthemetext} fontSize={8} fontFamily={Inter.regular}>
                                        {"Likes"}
                                    </AppText>
                                </View>



                                {/* Menu */}
                                <TouchableOpacity style={styles.menu}>
                                    <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
                                    <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
                                    <View style={[styles.dot, { backgroundColor: color.darkthemetext }]} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>

                        <LinearGradient
                            colors={['#620D33', '#3B1230', '#220A20', '#3A120F', '#5B1B01']}
                            locations={[0, 0.3, 0.5, 0.75, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.addview}
                        >
                            <View style={{ width: '99%', flexDirection: 'row', height: '99%', paddingHorizontal: 10, justifyContent: 'space-between', alignSelf: 'center', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                                    {/* <LinearGradient
                        colors={['#DC513F', '#490429']}
                        start={{ x: 0.2, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.vipiconview}
                    >
                        <LinearGradient
                            colors={['#500820', '#270918']}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ justifyContent: 'center', alignItems: 'center', height: 52, width: 52, borderRadius: 70, }}
                        > */}
                                    <ImageBackground
                                        source={Images.lvipview}
                                        resizeMode="cover"
                                        style={{ height: 54, width: 54, justifyContent: 'center', alignItems: 'center' }}
                                        imageStyle={{}}
                                    >
                                        <AppImage
                                            source={Images.rivip}
                                            width={25}
                                            height={21}

                                        />
                                    </ImageBackground>



                                    {/* </LinearGradient>

                    </LinearGradient> */}
                                    <View>
                                        <AppText color={"#FFFF"}
                                            fontSize={15}
                                            fontWeight="500"
                                            fontFamily={Inter.regular}>
                                            {"You’re Premium"}
                                        </AppText>

                                        <AppText color={"#F8CF36"}
                                            fontSize={12}
                                            fontWeight="500"
                                            fontFamily={Inter.regular}>
                                            {"Enjoy all premium features"}
                                        </AppText>
                                        <AppText color={"#F8CF36"} fontSize={12} fontWeight="500" fontFamily={Inter.regular}>
                                            {"and unlimited singing."}
                                        </AppText>
                                    </View>
                                </View>


                                {/* <View style={{
                    borderWidth: 1,
                    borderColor: '#902C27',
                    backgroundColor: '#571815',
                    justifyContent: 'center',
                    alignItems: 'center',
                   // padding: 8,
                    borderRadius: 29,
                   // height:36,


                }}> */}
                                <TouchableOpacity style={{
                                    borderWidth: 1,
                                    borderColor: '#902C27',
                                    flexDirection: 'row',
                                    gap: 8,
                                    backgroundColor: '#571815',
                                    borderRadius: 29,
                                    height: 36,
                                    width: 96,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <AppText color={"#ffff"} fontSize={10} fontWeight="400" fontFamily={Inter.light}>
                                        {"Manage Plan"}
                                    </AppText>
                                    <AppImage
                                        source={Images.arrow}
                                        width={5}
                                        height={8}
                                        tintColor={"#E3B86E"}

                                    />
                                </TouchableOpacity>

                                {/* </View> */}
                            </View>



                        </LinearGradient>


                        <View
                            style={[
                                styles.featureview,
                                {
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-between',
                                },
                            ]}
                        >
                            {featuritem.map((item, index) => (
                                <View
                                    key={index}
                                    style={{
                                        width: '48%',
                                        marginVertical: 8,

                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => handlefeaturefun(item, index)}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            // gap: 15,


                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 15,
                                        }}>
                                            <AppImage
                                                source={item.image}
                                                width={19}
                                                height={19}
                                                resizeMode="contain"
                                                tintColor={item.color}
                                                style={{
                                                    transform: [
                                                        {
                                                            rotate: item.title === "Logout" ? "-90deg" : "0deg",
                                                        },
                                                    ],
                                                }}
                                            />

                                            <AppText
                                                color={color.darkthemetext}
                                                fontSize={12}
                                                fontWeight="400"
                                            >
                                                {item.title}
                                            </AppText>
                                        </View>


                                        <AppImage
                                            source={Images.arrow}
                                            width={7}
                                            height={9}
                                            //   style={{alignSelf:'flex-end'}}
                                            tintColor={"#D6D7D5"}

                                        />
                                    </TouchableOpacity>

                                    {/* <View
        style={{
          height: 1,
          width: '100%',
          marginVertical: 8,
          backgroundColor: '#350C00',
        }}
      /> */}
                                </View>
                            ))}
                        </View>



                        <View style={{ height: 80 }} />
                    </ScrollView>
            }





        </SafeAreaView>
    )
}





const styles = StyleSheet.create({
    container: {
        backgroundColor: color.darkbackround,
        flex: 1,
        paddingHorizontal: 10
    },
    vipview: {
        borderWidth: 1,
        borderColor: '#311C13',
        backgroundColor: '#1E120F',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16.5,
        paddingVertical: 6,
        marginVertical: 5,
        // paddingHorizontal:2,
        flexDirection: 'row',
        width: 96,
        gap: 4
    },
    dashboardview: {
        marginTop: 10,
        flexDirection: 'row',
        // justifyContent:'space-between',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 55
    },
    addview: {
        width: '100%',
        height: 89,
        borderRadius: 16,
        // paddingHorizontal: 10,
        overflow: 'hidden',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'red',

    },
    vipiconview: {
        height: 54,
        width: 54,
        borderRadius: 70,
        justifyContent: 'center',
        overflow: 'hidden',
        alignItems: 'center'
    },
    featureview: {
        borderWidth: 1,
        borderColor: '#3D2B22',
        borderRadius: 18,
        overflow: 'hidden',
        // gap:10,
        padding: 15
    },
    card: {
        //  backgroundColor: '#07080A',
        borderRadius: 10,
        padding: 12,
        marginBottom: 5,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        // marginVertical:5,
        borderWidth: 1,
        borderColor: '#38190A',
    },

    content: {
        flex: 1,
        marginLeft: 12,
    },

    waveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },

    wave: {
        width: 2,
        borderRadius: 10,
        backgroundColor: '#FF003C',
        marginRight: 3,
    },

    right: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        gap: 15
    },

    playButton: {
        width: 30,
        height: 30,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: '#38190A',

        justifyContent: 'center',
        alignItems: 'center',
    },

    pauseContainer: {
        flexDirection: 'row',
        gap: 4,
    },

    pauseLine: {
        width: 3,
        height: 14,
        backgroundColor: '#FFF',
        borderRadius: 10,
    },

    menu: {
        marginLeft: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },

    dot: {
        width: 2.4,
        height: 2.4,
        borderRadius: 100,
        backgroundColor: '#FFF',
        marginVertical: 1.5,
    },
    titles: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginVertical:10,
    }


})


export default Profile;