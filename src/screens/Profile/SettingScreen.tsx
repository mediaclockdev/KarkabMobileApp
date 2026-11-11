import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import SearchBar from '../../share/components/SearchBar';
import color from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import { Images, Logo } from '../../share/constants/media';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../../share/storage/mmkv';
import { addsong, setAuthenticated } from '../../auth/redux/authSlice';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import Toast from 'react-native-toast-message';
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import TrackPlayer from '@rntp/player';
import { useTranslation } from "react-i18next";

const SettingScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [highQuality, setHighQuality] = useState(false);
    const [downloadWifi, setDownloadWifi] = useState(true);
    const dispatch = useAppDispatch();
    const [settingdata, setSettingdata] = useState([])

    const getsettingdata = async () => {
        try {

            const response = await ApiService.get(apiUrls.settingcontent);
            const data = (response as any).data;
            console.log(data.data, "ddhvehvd")
            if (data?.success) {
                setSettingdata(data.data);
            }
        } catch (error) {
            console.log('getsettingdata ERROR:', error);
        } finally {

        }
    };

    useEffect(() => {
        getsettingdata()
    }, [])

    const LogOutAlertOccurred = (title = 'User Logout',
        body = 'Are you sure you want to logout?',
        btnTxt = 'yes',
        btnTxt2 = 'No') => {
        Alert.alert(title, body, [
            {
                text: btnTxt,
                onPress: async () => {
                    storage.set('userToken', '');
                    const token = storage.getString('userToken');
                    console.log(token, "fkfckfv")
                    await TrackPlayer.stop();
                    dispatch(
                        addsong(''),)
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

    const renderSettingRow = ({
        icon,
        title,
        subtitle,
        right,
        onPress,
        danger = false,
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        right?: React.ReactNode;
        onPress?: () => void;
        danger?: boolean;
    }) => (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPress}
            disabled={!onPress}
            style={styles.settingRow}
        >
            {/* <AppText style={[styles.rowIcon, danger && styles.dangerText]}>
                {icon}
            </AppText> */}

            <AppImage
                source={icon}
                width={20}
                height={20}
                style={[styles.rowIcon, danger && styles.dangerText]}
                tintColor={'#F4F4F6'}
                resizeMode='contain'
            />

            <View style={styles.rowContent}>
                <AppText style={[styles.rowTitle, danger && styles.dangerText]}>
                    {title}
                </AppText>
            </View>

            {subtitle ? (
                <AppText style={styles.rowSubtitle}>{subtitle}</AppText>
            ) : null}

            {right || (
                <AppText style={[styles.arrow, danger && styles.dangerText]}>
                    ›
                </AppText>
            )}
        </TouchableOpacity>
    );

    const renderSwitch = (
        value: boolean,
        onValueChange: (value: boolean) => void,
    ) => (
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{
                false: '#414147',
                true: '#873DF2',
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#414147"
            style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
        />
    );

    // const renderSwitch = (
    //     value: boolean,
    //     onValueChange: (value: boolean) => void,
    // ) => {
    //     return (
    //         <Switch
    //             value={value}
    //             onValueChange={onValueChange}
    //             trackColor={{
    //                 false: '#292929',
    //                 true: '#704C0A',
    //             }}
    //             thumbColor={
    //                 value ? '#F6A202' : '#777777'
    //             }
    //             ios_backgroundColor="#292929"
    //         />
    //     );
    // };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => (navigation as any).navigate('Profile')}
                        style={styles.backButton}
                    >
                        <AppImage
                            source={Logo.arrowline}
                            height={28}
                            width={19}
                            // resizeMode="contain"
                            tintColor="#FFFFFF"
                        />
                    </TouchableOpacity>

                    <AppText style={styles.title}>{t('Profile.Settings')}</AppText>

                    <View style={styles.headerRight} />
                </View>

                {/* Preferences */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>{t('Profile.Preferences')}</AppText>
                </View>

                <View style={styles.settingsCard}>
                    {renderSettingRow({
                        icon: Logo.language,
                        title: t('language.label'),
                        subtitle: 'العربية / English',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                            });
                        },
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: Images.playicon,
                        title: 'Autoplay',
                        right: renderSwitch(autoPlay, setAutoPlay),
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: Images.bell,
                        title: t('Profile.Notifications'),
                        right: <AppText style={styles.arrow}>›</AppText>,
                        onPress: () => {
                            // Navigate to notification settings when available
                        },
                    })}
                </View>

                {/* Account & Privacy */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Account & privacy
                    </AppText>
                </View>

                <View style={styles.settingsCard}>
                    {renderSettingRow({
                        icon: Logo.person,
                        title: t('Profile.Accountsettings'),
                        onPress: () =>
                            (navigation as any).navigate('ManageProfileScreen'),
                    })}

                    <View style={styles.divider} />

                    {/* {renderSettingRow({
                        icon: Logo.lock,
                        title: 'Recording visibility',
                        subtitle: 'Private',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                            });
                        },
                    })}

                    <View style={styles.divider} /> */}

                    {renderSettingRow({
                        icon: Logo.secure,
                        title: t('Profile.Permissions'),
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                            });
                        },
                    })}
                </View>

                {/* Help */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>Help</AppText>
                </View>

                <View style={styles.settingsCard}>
                    {renderSettingRow({
                        icon: Logo.chatbox,
                        title: 'Report a problem',
                        onPress: () =>
                            (navigation as any).navigate('ContactUsScreen'),
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: Logo.Bluetick,
                        title: t('Profile.AboutKarkab'),
                        onPress: () =>
                            (navigation as any).navigate(
                                'AboutKarKabScreen',
                                { item: settingdata[2] },
                            ),
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: Logo.reportfile,
                        title: t('Profile.AboutKarkab'),
                        onPress: () => {
                            Alert.alert(
                                'Terms & privacy',
                                'Choose which document you want to view.',
                                [
                                    {
                                        text: 'Terms & Conditions',
                                        onPress: () =>
                                            (navigation as any).navigate(
                                                'TermsConditionsScreen',
                                                { item: settingdata[0] },
                                            ),
                                    },
                                    {
                                        text: 'Privacy Policy',
                                        onPress: () =>
                                            (navigation as any).navigate(
                                                'PrivacyPolicyScreen',
                                                { item: settingdata[1] },
                                            ),
                                    },
                                    { text: 'Cancel', style: 'cancel' },
                                ],
                            );
                        },
                    })}
                </View>

                {/* Logout */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.logoutButton}
                    onPress={() => LogOutAlertOccurred()}
                >
                    {/* <AppText style={styles.logoutIcon}>⇥</AppText> */}
                    <AppImage
                        source={Logo.logout}
                        width={20}
                        height={20}
                        style={[styles.logoutIcon]}
                        tintColor={'#FF554F'}
                        resizeMode='contain'
                    />

                    <AppText style={styles.logoutText}>{t('Profile.Logout')}</AppText>

                    <View style={{ flex: 1 }} />

                    <AppText style={styles.logoutArrow}>›</AppText>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#101114',
    },

    container: {
        paddingHorizontal: 16,
        paddingBottom: 110,
    },

    header: {
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backButton: {
        width: 45,
        height: 50,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    title: {
        position: 'absolute',
        left: 45,
        right: 45,
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: Inter.medium,
        fontWeight: '700',
    },

    headerRight: {
        width: 35,
    },

    sectionHeader: {
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 8,
    },

    sectionTitle: {
        color: '#A5A5AE',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    settingsCard: {
        backgroundColor: '#1D1E22',
        borderRadius: 12,
        overflow: 'hidden',
    },

    settingRow: {
        minHeight: 55,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13,
        paddingVertical: 8,
    },

    divider: {
        height: 1,
        backgroundColor: '#292A2F',
        marginLeft: 42,
    },

    rowIcon: {
        width: 23,
        color: '#E5E5EA',
        fontSize: 17,
        textAlign: 'left',
        marginRight: 10,
    },

    rowContent: {
        flex: 1,
        justifyContent: 'center',
    },

    rowTitle: {
        color: '#F4F4F6',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: Inter.regular,
    },

    rowSubtitle: {
        color: '#A5A5AE',
        fontSize: 10,
        marginLeft: 8,
        fontFamily: Inter.regular,
    },

    arrow: {
        color: '#A5A5AE',
        fontSize: 25,
        marginLeft: 8,
        lineHeight: 24,
    },

    logoutButton: {
        minHeight: 55,
        marginTop: 12,
        borderRadius: 12,
        backgroundColor: '#1D1E22',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
    },

    logoutIcon: {
        color: '#FF554F',
        fontSize: 18,
        marginRight: 13,
    },

    logoutText: {
        color: '#FF554F',
        fontSize: 16,
        fontFamily: Inter.medium,
    },

    logoutArrow: {
        color: '#A5A5AE',
        fontSize: 22,
    },

    dangerText: {
        color: '#FF554F',
    },
});
