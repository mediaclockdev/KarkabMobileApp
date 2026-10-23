import React, { useState } from 'react';
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

const SettingScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [highQuality, setHighQuality] = useState(false);
    const [downloadWifi, setDownloadWifi] = useState(true);

    const dispatch = useAppDispatch();

    const LogOutAlertOccurred = (title = 'User Logout', body = 'Are you sure you want to logout?', btnTxt = 'yes', btnTxt2 = 'No') => {
        Alert.alert(title, body, [
            {
                text: btnTxt,
                onPress: async () => {
                    storage.set('userToken', '');
                    const token = storage.getString('userToken');
                    console.log(token, "fkfckfv")
                    dispatch(setAuthenticated(false));
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
    }) => {


        return (
            <TouchableOpacity
                activeOpacity={0.75}
                onPress={onPress}
                disabled={!onPress}
                style={styles.settingRow}
            >
                <View
                    style={[
                        styles.iconBox,
                        danger && styles.dangerIconBox,
                    ]}
                >
                    <AppText
                        style={[
                            styles.rowIcon,
                            danger && styles.dangerText,
                        ]}
                    >
                        {icon}
                    </AppText>
                </View>

                <View style={styles.rowContent}>
                    <AppText
                        style={[
                            styles.rowTitle,
                            danger && styles.dangerText,
                        ]}
                    >
                        {title}
                    </AppText>

                    {subtitle ? (
                        <AppText style={styles.rowSubtitle}>
                            {subtitle}
                        </AppText>
                    ) : null}
                </View>

                {right ? (
                    right
                ) : (
                    <AppText style={styles.arrow}>
                        ›
                    </AppText>
                )}
            </TouchableOpacity>
        );
    };

    const renderSwitch = (
        value: boolean,
        onValueChange: (value: boolean) => void,
    ) => {
        return (
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{
                    false: '#292929',
                    true: '#704C0A',
                }}
                thumbColor={
                    value ? '#F6A202' : '#777777'
                }
                ios_backgroundColor="#292929"
            />
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >

                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => {

                                (navigation as any).navigate('Profile')
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
                                ]}
                            >
                                Settings
                            </AppText>

                            <AppText style={styles.subtitle}>
                                Customize your karaoke experience
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

                {/* Account */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Account
                    </AppText>
                </View>

                <View style={styles.settingsCard}>
                    {renderSettingRow({
                        icon: '♙',
                        title: 'Profile',
                        subtitle: 'Manage your profile information',
                        onPress: () => { (navigation as any).navigate('ManageProfileScreen') },
                    })}

                    <View style={styles.divider} />

                    {/* {renderSettingRow({
                        icon: '♛',
                        title: 'Subscription',
                        subtitle: 'VIP Premium',
                        right: (
                            <View style={styles.vipBadge}>
                                <AppText style={styles.vipText}>
                                    VIP
                                </AppText>
                            </View>
                        ),
                    })} */}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: '▣',
                        title: 'Language',
                        subtitle: 'English',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });
                            (navigation as any).navigate('LanguageScreen')
                        },
                    })}
                </View>

                {/* Preferences */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Preferences
                    </AppText>
                </View>

                <View style={styles.settingsCard}>
                    {renderSettingRow({
                        icon: '♧',
                        title: 'Notifications',
                        subtitle: 'Song requests, achievements & updates',
                        right: renderSwitch(
                            notifications,
                            setNotifications,
                        ),
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: '▶',
                        title: 'Auto Play',
                        subtitle: 'Automatically play the next song',
                        right: renderSwitch(
                            autoPlay,
                            setAutoPlay

                        ),
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}

                    <View style={styles.divider} />

                    {/* {renderSettingRow({
                        icon: '☾',
                        title: 'Dark Mode',
                        subtitle: 'Use dark appearance throughout the app',
                        right: renderSwitch(
                            darkMode,
                            setDarkMode,
                        ),
                    })} */}

                    <View style={styles.divider} />

                    {/* {renderSettingRow({
                        icon: '♫',
                        title: 'High Quality Audio',
                        subtitle: 'Use higher quality audio when available',
                        right: renderSwitch(
                            highQuality,
                            setHighQuality,
                        ),
                    })} */}
                </View>

                {/* Playback & Download */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Playback & Downloads
                    </AppText>
                </View>

                <View style={styles.settingsCard}>
                    {renderSettingRow({
                        icon: '♬',
                        title: 'Audio Quality',
                        subtitle: 'High quality',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}

                    {/* <View style={styles.divider} /> */}

                    {/* {renderSettingRow({
                        icon: '⇩',
                        title: 'Download Settings',
                        subtitle: 'Manage downloaded songs',
                    })} */}

                    {/* <View style={styles.divider} /> */}

                    {/* {renderSettingRow({
                        icon: '⌁',
                        title: 'Download over Wi-Fi',
                        subtitle: 'Save mobile data',
                        right: renderSwitch(
                            downloadWifi,
                            setDownloadWifi,
                        ),
                    })} */}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: '⌫',
                        title: 'Clear Cache',
                        subtitle: 'Remove temporary files',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}
                </View>

                {/* Privacy */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Privacy & Security
                    </AppText>
                </View>

                <View style={styles.settingsCard}>
                    {renderSettingRow({
                        icon: '♙',
                        title: 'Privacy Settings',
                        subtitle: 'Control your profile visibility',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: '▣',
                        title: 'Permissions',
                        subtitle: 'Microphone, storage & notifications',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: '⌾',
                        title: 'Security',
                        subtitle: 'Password and account security',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}
                </View>

                {/* Support */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Support
                    </AppText>
                </View>

                <View style={styles.settingsCard}>
                    {renderSettingRow({
                        icon: '?',
                        title: 'Help Center',
                        subtitle: 'Get answers to common questions',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: '✉',
                        title: 'Contact Us',
                        subtitle: 'We are here to help',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: '★',
                        title: 'Rate the App',
                        subtitle: 'Tell us what you think',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}
                </View>

                {/* About */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        About
                    </AppText>
                </View>

                <View style={styles.settingsCard}>
                    {renderSettingRow({
                        icon: 'ⓘ',
                        title: 'About Karaoke',
                        subtitle: 'Learn more about the app',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: '▤',
                        title: 'Terms & Conditions',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}

                    <View style={styles.divider} />

                    {renderSettingRow({
                        icon: '♢',
                        title: 'Privacy Policy',
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                position: 'bottom',
                                bottomOffset: 80,
                                text1: 'Coming soon!',
                                // text2: "coming soon",
                            });

                        },
                    })}
                </View>

                {/* Logout */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.logoutButton}
                    onPress={() => LogOutAlertOccurred()}
                >
                    <AppText style={styles.logoutIcon}>
                        ⇥
                    </AppText>

                    <AppText style={styles.logoutText}>
                        Log Out
                    </AppText>
                </TouchableOpacity>

                <AppText style={styles.version}>
                    Karaoke
                    {'\n'}
                    Version 1.0.0
                </AppText>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: color.darkbackround,
    },

    container: {
        paddingHorizontal: 15,
        paddingBottom: 130,
    },

    /* Header */

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },

    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    subtitle: {
        marginTop: 2,
        color: '#FFF97E',
        fontSize: 12,
        fontFamily: Inter.regular,
    },

    micContainer: {
        width: 25,
        height: 25,
        borderRadius: 21,
        borderWidth: 1.5,
        borderColor: '#F3870C',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        backgroundColor: 'transparent',
    },

    /* Sections */

    sectionHeader: {
        marginTop: 19,
        marginBottom: 10,
        paddingHorizontal: 2,
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    settingsCard: {
        borderWidth: 1,
        borderColor: '#272727',
        borderRadius: 16,
        backgroundColor: '#050505',
        overflow: 'hidden',
    },

    settingRow: {
        minHeight: 69,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 9,
    },

    divider: {
        height: 1,
        backgroundColor: '#191919',
        marginLeft: 64,
    },

    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 11,
        backgroundColor: '#17100A',
        borderWidth: 1,
        borderColor: '#5B3A0B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    rowIcon: {
        color: '#F6A202',
        fontSize: 19,
        fontWeight: '600',
    },

    /* Text */

    rowContent: {
        flex: 1,
        justifyContent: 'center',
    },

    rowTitle: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    rowSubtitle: {
        color: '#777777',
        fontSize: 9,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    arrow: {
        color: '#F6A202',
        fontSize: 23,
        marginLeft: 8,
        marginRight: 2,
    },

    vipBadge: {
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: '#2B180A',
        borderWidth: 1,
        borderColor: '#8A4B0A',
    },

    vipText: {
        color: '#F6A202',
        fontSize: 9,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },
    logoutButton: {
        height: 52,
        marginTop: 24,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#7B162C',
        backgroundColor: '#160609',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoutIcon: {
        color: '#FF365B',
        fontSize: 19,
        marginRight: 9,
    },

    logoutText: {
        color: '#FF365B',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    version: {
        color: '#4F4F4F',
        textAlign: 'center',
        fontSize: 9,
        lineHeight: 15,
        marginTop: 18,
        fontFamily: Inter.regular,
    },

    dangerIconBox: {
        borderColor: '#591827',
        backgroundColor: '#18070B',
    },

    dangerText: {
        color: '#FF365B',
    },
});
