import React from 'react';
import {
    SafeAreaView,
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
} from 'react-native';

import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import { Icons } from '../../share/constants/media';
import color from '../../share/constants/color';

const devices = [
    {
        id: '1',
        name: 'iPhone 15 Pro',
        os: 'iOS 18.5',
        lastActive: 'Just now',
        current: true,
    },
    {
        id: '2',
        name: 'MacBook Pro',
        os: 'macOS Sequoia',
        lastActive: 'Yesterday • 10:35 AM',
        current: false,
    },
    {
        id: '3',
        name: 'Samsung Galaxy S24',
        os: 'Android 15',
        lastActive: '18 Jul • 09:42 PM',
        current: false,
    },
];

const ConnectedDevices = ({ navigation }: any) => {
    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.iconBox}>
                    <AppImage
                        source={Icons.device}
                        width={22}
                        height={22}
                        resizeMode="contain"
                    />
                </View>

                <View style={{ flex: 1, marginLeft: 15 }}>
                    <AppText fontSize={16} fontWeight={600}>
                        {item.name}
                    </AppText>

                    <AppText fontSize={13} color="#777" marginTop={4}>
                        {item.os}
                    </AppText>

                    <AppText fontSize={12} color="#999" marginTop={6}>
                        Last Active
                    </AppText>

                    <AppText fontSize={13}>
                        {item.lastActive}
                    </AppText>
                </View>
            </View>

            {item.current ? (
                <View style={styles.currentBadge}>
                    <View style={styles.dot} />
                    <AppText
                        color="#22C55E"
                        fontWeight={600}
                        fontSize={13}>
                        Current Device
                    </AppText>
                </View>
            ) : (
                <TouchableOpacity style={styles.removeButton}>
                    <AppText
                        color={color.themetext}
                        fontWeight={600}>
                        Remove Device
                    </AppText>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('PersonalInformation')}>
                    <AppImage
                        source={Icons.rightArrow}
                        width={13}
                        height={23}
                        tintColor="#000"
                        style={{
                            transform: [{ rotate: '180deg' }],
                        }}
                    />
                </TouchableOpacity>

                <AppText fontWeight={700} fontSize={16}>
                    Connected Devices
                </AppText>

                <View style={{ width: 20 }} />
            </View>

            <AppText
                marginHorizontal={20}
                marginTop={20}
                color="#666"
                fontSize={13}>
                Manage the devices currently signed in to your account.
            </AppText>

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 120,
                }}
                renderItem={renderItem}
            />

            <TouchableOpacity style={styles.logoutButton}>
                <AppText
                    color={color.themetext}
                    fontWeight={700}>
                    Sign Out From All Devices
                </AppText>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default ConnectedDevices;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8F8',
    },

    header: {
        height: 60,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        marginBottom: 18,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    row: {
        flexDirection: 'row',
    },

    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 12,
        backgroundColor: '#FDECF2',
        justifyContent: 'center',
        alignItems: 'center',
    },

    currentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
    },

    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#22C55E',
        marginRight: 8,
    },

    removeButton: {
        alignSelf: 'flex-end',
        marginTop: 18,
        borderWidth: 1,
        borderColor: color.themetext,
        borderRadius: 10,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },

    logoutButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: color.themetext,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});