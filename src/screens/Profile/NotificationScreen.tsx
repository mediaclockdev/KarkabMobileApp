import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';

import color from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import { Images, Logo } from '../../share/constants/media';
import { useNavigation } from '@react-navigation/native';

type NotificationItem = {
    id: string;
    type: 'achievement' | 'performance' | 'like' | 'system' | 'follow';
    title: string;
    message: string;
    time: string;
    unread: boolean;
};

const notifications: NotificationItem[] = [
    {
        id: '1',
        type: 'achievement',
        title: 'New Achievement!',
        message:
            'Congratulations! You earned the "7 Day Streak" badge.',
        time: '5 min ago',
        unread: true,
    },
    {
        id: '2',
        type: 'performance',
        title: 'Your performance is trending',
        message:
            'Your "Ya Leil" performance received 128 new views.',
        time: '25 min ago',
        unread: true,
    },
    {
        id: '3',
        type: 'like',
        title: 'New likes on your performance',
        message:
            '45 people liked your recent performance of "Ya Leil".',
        time: '1 hour ago',
        unread: true,
    },
    {
        id: '4',
        type: 'follow',
        title: 'New follower',
        message:
            'Someone started following your karaoke performances.',
        time: '3 hours ago',
        unread: false,
    },
    {
        id: '5',
        type: 'performance',
        title: 'Performance reminder',
        message:
            'You have not performed today. Keep your streak alive!',
        time: '5 hours ago',
        unread: false,
    },
    {
        id: '6',
        type: 'system',
        title: 'New songs available',
        message:
            'Discover the latest Sudanese songs added to the library.',
        time: 'Yesterday',
        unread: false,
    },
    {
        id: '7',
        type: 'achievement',
        title: 'Top Performer',
        message:
            "You are featured among this week's top performers.",
        time: 'Yesterday',
        unread: false,
    },
];

const NotificationScreen = () => {
    const navigation = useNavigation();
    const [notificationsEnabled, setNotificationsEnabled] =
        useState(true);

    const [performanceNotifications, setPerformanceNotifications] =
        useState(true);

    const [achievementNotifications, setAchievementNotifications] =
        useState(true);

    const [newSongNotifications, setNewSongNotifications] =
        useState(false);

    const [items, setItems] = useState(notifications);

    const unreadCount = items.filter(item => item.unread).length;

    const getIcon = (type: NotificationItem['type']) => {
        switch (type) {
            case 'achievement':
                return '★';

            case 'performance':
                return '♫';

            case 'like':
                return '♡';

            case 'follow':
                return '♙';

            default:
                return 'i';
        }
    };

    const getIconColor = (
        type: NotificationItem['type'],
    ) => {
        switch (type) {
            case 'achievement':
                return '#F6A202';

            case 'performance':
                return '#C34CFF';

            case 'like':
                return '#FF2857';

            case 'follow':
                return '#F3870C';

            default:
                return '#6FA8FF';
        }
    };

    const markAllAsRead = () => {
        setItems(current =>
            current.map(item => ({
                ...item,
                unread: false,
            })),
        );
    };

    const markAsRead = (id: string) => {
        setItems(current =>
            current.map(item =>
                item.id === id
                    ? {
                        ...item,
                        unread: false,
                    }
                    : item,
            ),
        );
    };

    const renderNotification = ({
        item,
    }: {
        item: NotificationItem;
    }) => {
        const iconColor = getIconColor(item.type);

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => markAsRead(item.id)}
                style={[
                    styles.notificationCard,
                    item.unread && styles.unreadCard,
                ]}
            >
                {/* Icon */}
                <View
                    style={[
                        styles.notificationIcon,
                        {
                            borderColor: iconColor,
                            backgroundColor:
                                iconColor + '12',
                        },
                    ]}
                >
                    <AppText
                        style={[
                            styles.iconText,
                            {
                                color: iconColor,
                            },
                        ]}
                    >
                        {getIcon(item.type)}
                    </AppText>
                </View>

                {/* Content */}
                <View style={styles.notificationContent}>
                    <View style={styles.titleRow}>
                        <AppText
                            style={styles.notificationTitle}
                            numberOfLines={1}
                        >
                            {item.title}
                        </AppText>

                        {item.unread && (
                            <View style={styles.unreadDot} />
                        )}
                    </View>

                    <AppText
                        style={styles.notificationMessage}
                        numberOfLines={2}
                    >
                        {item.message}
                    </AppText>

                    <AppText style={styles.notificationTime}>
                        {item.time}
                    </AppText>
                </View>

                <AppText style={styles.arrow}>
                    ›
                </AppText>
            </TouchableOpacity>
        );
    };

    const renderSwitch = (
        value: boolean,
        onChange: (value: boolean) => void,
    ) => {
        return (
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{
                    false: '#292929',
                    true: '#654609',
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
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={renderNotification}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerContent}>
                                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>


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
                                    <View>


                                        <View
                                            style={styles.titleRowHeader}
                                        >

                                            <AppText
                                                style={styles.title}
                                            >
                                                Notifications
                                            </AppText>

                                            {unreadCount > 0 && (
                                                <View
                                                    style={
                                                        styles.countBadge
                                                    }
                                                >
                                                    <AppText
                                                        style={
                                                            styles.countText
                                                        }
                                                    >
                                                        {unreadCount}
                                                    </AppText>
                                                </View>
                                            )}
                                        </View>

                                        <AppText style={styles.subtitle}>
                                            Stay updated with your karaoke
                                            journey
                                        </AppText>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.micContainer}
                            >
                                <AppImage
                                    source={Images.mics}
                                    height={15}
                                    width={18}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Top actions */}
                        <View style={styles.actionRow}>
                            <View>
                                <AppText
                                    style={styles.recentTitle}
                                >
                                    Recent Notifications
                                </AppText>

                                <AppText
                                    style={styles.recentSubtitle}
                                >
                                    {unreadCount} unread
                                    notifications
                                </AppText>
                            </View>

                            {unreadCount > 0 && (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={markAllAsRead}
                                >
                                    <AppText
                                        style={styles.markRead}
                                    >
                                        Mark all as read
                                    </AppText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                }
                ListFooterComponent={
                    <>
                        {/* Notification Settings */}
                        <View style={styles.sectionHeader}>
                            <AppText style={styles.sectionTitle}>
                                Notification Settings
                            </AppText>
                        </View>

                        <View style={styles.settingsCard}>
                            {/* Main notifications */}
                            <View style={styles.settingRow}>
                                <View
                                    style={[
                                        styles.settingIcon,
                                        {
                                            borderColor:
                                                '#F6A202',
                                        },
                                    ]}
                                >
                                    <AppText
                                        style={[
                                            styles.settingIconText,
                                            {
                                                color: '#F6A202',
                                            },
                                        ]}
                                    >
                                        ♧
                                    </AppText>
                                </View>

                                <View style={styles.settingContent}>
                                    <AppText
                                        style={styles.settingTitle}
                                    >
                                        Push Notifications
                                    </AppText>

                                    <AppText
                                        style={
                                            styles.settingSubtitle
                                        }
                                    >
                                        Receive notifications from
                                        the app
                                    </AppText>
                                </View>

                                {renderSwitch(
                                    notificationsEnabled,
                                    setNotificationsEnabled,
                                )}
                            </View>

                            <View style={styles.divider} />

                            {/* Performance */}
                            <View style={styles.settingRow}>
                                <View
                                    style={[
                                        styles.settingIcon,
                                        {
                                            borderColor:
                                                '#C34CFF',
                                        },
                                    ]}
                                >
                                    <AppText
                                        style={[
                                            styles.settingIconText,
                                            {
                                                color: '#C34CFF',
                                            },
                                        ]}
                                    >
                                        ♫
                                    </AppText>
                                </View>

                                <View style={styles.settingContent}>
                                    <AppText
                                        style={styles.settingTitle}
                                    >
                                        Performance Updates
                                    </AppText>

                                    <AppText
                                        style={
                                            styles.settingSubtitle
                                        }
                                    >
                                        Likes, views and performance
                                        activity
                                    </AppText>
                                </View>

                                {renderSwitch(
                                    performanceNotifications,
                                    setPerformanceNotifications,
                                )}
                            </View>

                            <View style={styles.divider} />

                            {/* Achievements */}
                            <View style={styles.settingRow}>
                                <View
                                    style={[
                                        styles.settingIcon,
                                        {
                                            borderColor:
                                                '#F6A202',
                                        },
                                    ]}
                                >
                                    <AppText
                                        style={[
                                            styles.settingIconText,
                                            {
                                                color: '#F6A202',
                                            },
                                        ]}
                                    >
                                        ★
                                    </AppText>
                                </View>

                                <View style={styles.settingContent}>
                                    <AppText
                                        style={styles.settingTitle}
                                    >
                                        Achievements
                                    </AppText>

                                    <AppText
                                        style={
                                            styles.settingSubtitle
                                        }
                                    >
                                        Badges, streaks and rewards
                                    </AppText>
                                </View>

                                {renderSwitch(
                                    achievementNotifications,
                                    setAchievementNotifications,
                                )}
                            </View>

                            <View style={styles.divider} />

                            {/* New songs */}
                            <View style={styles.settingRow}>
                                <View
                                    style={[
                                        styles.settingIcon,
                                        {
                                            borderColor:
                                                '#FF2857',
                                        },
                                    ]}
                                >
                                    <AppText
                                        style={[
                                            styles.settingIconText,
                                            {
                                                color: '#FF2857',
                                            },
                                        ]}
                                    >
                                        ♬
                                    </AppText>
                                </View>

                                <View style={styles.settingContent}>
                                    <AppText
                                        style={styles.settingTitle}
                                    >
                                        New Songs
                                    </AppText>

                                    <AppText
                                        style={
                                            styles.settingSubtitle
                                        }
                                    >
                                        Get notified about new songs
                                    </AppText>
                                </View>

                                {renderSwitch(
                                    newSongNotifications,
                                    setNewSongNotifications,
                                )}
                            </View>
                        </View>

                        {/* Empty footer */}
                        <View style={styles.footer}>
                            <AppText style={styles.footerText}>
                                You're all caught up!
                            </AppText>

                            <AppText style={styles.footerSubtext}>
                                Check back later for new updates
                            </AppText>
                        </View>
                    </>
                }
            />
        </SafeAreaView>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: color.darkbackround,
    },

    container: {
        paddingHorizontal: 15,
        paddingBottom: 100,
    },

    /* Header */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },

    headerContent: {
        flex: 1,
    },

    titleRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    subtitle: {
        color: '#FFF97E',
        fontSize: 12,
        marginTop: 2,
        fontFamily: Inter.regular,
    },

    countBadge: {
        minWidth: 21,
        height: 21,
        paddingHorizontal: 6,
        borderRadius: 11,
        backgroundColor: '#FF2857',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },

    countText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
        fontFamily: Inter.medium,
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
    },

    /* Recent */

    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 18,
        marginBottom: 12,
    },

    recentTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    recentSubtitle: {
        color: '#6B6B6B',
        fontSize: 9,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    markRead: {
        color: '#F6A202',
        fontSize: 10,
        fontFamily: Inter.medium,
    },

    /* Notification */

    notificationCard: {
        minHeight: 91,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#282828',
        backgroundColor: '#070707',
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    unreadCard: {
        borderColor: '#493416',
        backgroundColor: '#0C0A07',
    },

    notificationIcon: {
        width: 43,
        height: 43,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 11,
    },

    iconText: {
        fontSize: 19,
        fontWeight: '600',
    },

    notificationContent: {
        flex: 1,
        justifyContent: 'center',
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    notificationTitle: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    unreadDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#FF2857',
        marginLeft: 7,
    },

    notificationMessage: {
        color: '#8A8A8A',
        fontSize: 9,
        lineHeight: 14,
        marginTop: 5,
        paddingRight: 5,
        fontFamily: Inter.regular,
    },

    notificationTime: {
        color: '#555555',
        fontSize: 8,
        marginTop: 5,
        fontFamily: Inter.regular,
    },

    arrow: {
        color: '#F6A202',
        fontSize: 21,
        marginLeft: 5,
    },

    /* Settings */

    sectionHeader: {
        marginTop: 17,
        marginBottom: 10,
        paddingHorizontal: 2,
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 14,
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
        minHeight: 73,
        paddingHorizontal: 11,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },

    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 11,
        borderWidth: 1,
        backgroundColor: '#120D08',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 11,
    },

    settingIconText: {
        fontSize: 18,
        fontWeight: '600',
    },

    settingContent: {
        flex: 1,
        paddingRight: 8,
    },

    settingTitle: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    settingSubtitle: {
        color: '#666666',
        fontSize: 8.5,
        lineHeight: 13,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    divider: {
        height: 1,
        backgroundColor: '#1A1A1A',
        marginLeft: 63,
    },

    /* Footer */

    footer: {
        alignItems: 'center',
        marginTop: 30,
        paddingBottom: 20,
    },

    footerText: {
        color: '#555555',
        fontSize: 10,
        fontFamily: Inter.medium,
    },

    footerSubtext: {
        color: '#3F3F3F',
        fontSize: 8,
        marginTop: 5,
        fontFamily: Inter.regular,
    },
});
