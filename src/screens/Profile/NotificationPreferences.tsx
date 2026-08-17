import React, { useCallback, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    Switch,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AppImage from '../../share/components/AppImage';
import AppText from '../../share/components/AppText';
import { Icons, Logos } from '../../share/constants/media';
import color from '../../share/constants/color';
import CustomSwitch from '../../share/components/CustomSwitch';
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { showToast } from '../../auth/redux/authSlice';
import DatePicker from 'react-native-date-picker';

const NotificationPreferences = ({ navigation }: any) => {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [openTimePicker, setOpenTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [timeType, setTimeType] = useState<'start' | 'end'>('start');
    const [settings, setSettings] = useState({
        orderUpdates: true,
        delivery: true,
        promotions: false,
        rewards: true,
        receipts: true,
        newsletter: false,
        otp: true,
        marketing: false,
        sound: 'Default',
        vibration: true,
        quietHours: true,
        startTime: '00:00',
        endTime: '00:00'
    });
    const soundOptions = [
        'Default',
        'Bell',
        'Chime',
        'Digital',
        'Silent',
    ];
    const [soundModal, setSoundModal] = useState(false);
    useFocusEffect(
        useCallback(() => {

            getProfile()

        }, [])
    )


    const getProfile = async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.getprofile);
            console.log(response, "profile api response")
            if (response.status === 200) {
                const data = (response as any)?.data?.data?.notificationPreferences;

                setSettings({
                    orderUpdates: data?.pushNotifications?.orderUpdates,
                    delivery: data?.pushNotifications?.deliveryNotifications,
                    promotions: data?.pushNotifications.promotionsAndOffers,
                    rewards: data?.pushNotifications?.rewardsAndLoyalty,
                    receipts: data?.emailNotifications.orderReceipts,
                    newsletter: data?.emailNotifications.weeklyNewsletter,
                    otp: data?.smsNotifications.otpVerification,
                    marketing: data.smsNotifications.marketingSms,
                    sound: data.soundAndVibration.notificationSound,
                    vibration: data.soundAndVibration.vibration,
                    quietHours: data.quietHours.enabled,
                    startTime: data.quietHours.startTime,
                    endTime: data.quietHours.endTime
                })

            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };


    const updateNotificationSettings = async () => {
        try {
            //  setLoadings(true);

            const payload = {
                pushNotifications: {
                    orderUpdates: settings.orderUpdates,
                    deliveryNotifications: settings.delivery,
                    promotionsAndOffers: settings.promotions,
                    rewardsAndLoyalty: settings.rewards,
                },
                emailNotifications: {
                    orderReceipts: settings.receipts,
                    weeklyNewsletter: settings.newsletter,
                },
                smsNotifications: {
                    otpVerification: settings.otp,
                    marketingSms: settings.marketing,
                },
                soundAndVibration: {
                    notificationSound: settings.sound,
                    vibration: settings.vibration,
                },
                quietHours: {
                    enabled: settings.quietHours,
                    startTime: settings.startTime,
                    endTime: settings.endTime
                },
            };

            const response = await ApiService.patch(
                apiUrls.profileNotifications,
                payload
            );

            console.log('Status:', response.status);
            console.log('Response:', response.data);

            if (response.status === 200) {
                // Alert.alert('Success', response.data?.message);
                dispatch(
                    showToast({
                        visible: true,
                        message: response.data?.message || 'Success',
                        type: 'success',
                    })
                );
                getProfile()
            }
        } catch (error: any) {
            console.log('Error:', error.response?.data || error);

            Alert.alert(
                'Error',
                error.response?.data?.message || error.message
            );
        } finally {
            // setLoadings(false);
        }
    };




    const Row = ({
        icon,
        title,
        subtitle,
        value,
        onChange,
    }: any) => (
        <View style={styles.row}>
            <View style={styles.left}>
                <View style={styles.iconBox}>
                    <AppImage source={icon} width={18} height={18} resizeMode='contain' />
                </View>

                <View style={{ marginLeft: 14, flex: 1 }}>
                    <AppText fontSize={16} fontWeight={500}>
                        {title}
                    </AppText>

                    {!!subtitle && (
                        <AppText fontSize={12} color="#8B8B8B" marginTop={2}>
                            {subtitle}
                        </AppText>
                    )}
                </View>
            </View>

            {/* <Switch
                value={value}
                onValueChange={onChange}
                thumbColor="#fff"
                trackColor={{
                    false: "#DDD",
                    true: "#A86A79",
                }}
            /> */}


            <CustomSwitch
                value={value}
                onChange={onChange}
            />
        </View>
    );

    const Card = ({
        title,
        children,
    }: {
        title: string;
        children: React.ReactNode;
    }) => (
        <>
            <AppText
                fontSize={12}
                fontWeight={700}
                color="#6B5A60"
                marginBottom={12}
                marginTop={20}>
                {title}
            </AppText>

            <View style={styles.card}>
                {children}
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                translucent={false}
                barStyle="dark-content" />

            {/* Header */}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <AppImage
                        source={Icons.rightArrow}
                        width={13}
                        height={23}
                        style={{
                            transform: [{ rotate: '180deg' }],
                        }}
                    />
                </TouchableOpacity>

                <AppText fontSize={18} fontWeight={700}>
                    Notification Preferences
                </AppText>

                <View style={{ width: 18 }} />
            </View>
            {
                loading ?
                    <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
                        <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
                    </View>
                    :

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.content}>

                        <Card title="PUSH NOTIFICATIONS">

                            <Row
                                icon={Icons.bell}
                                title="Order Updates"
                                subtitle="Receive order status updates"
                                value={settings.orderUpdates}
                                onChange={v =>
                                    setSettings({ ...settings, orderUpdates: v })
                                }
                            />

                            <Row
                                icon={Icons.delivery}
                                title="Delivery Notifications"
                                subtitle="Driver is arriving"
                                value={settings.delivery}
                                onChange={v =>
                                    setSettings({ ...settings, delivery: v })
                                }
                            />

                            <Row
                                icon={Icons.offer}
                                title="Promotions & Offers"
                                subtitle="Special discounts and offers"
                                value={settings.promotions}
                                onChange={v =>
                                    setSettings({ ...settings, promotions: v })
                                }
                            />

                            <Row
                                icon={Icons.reward}
                                title="Rewards & Loyalty"
                                subtitle="Earn points and rewards"
                                value={settings.rewards}
                                onChange={v =>
                                    setSettings({ ...settings, rewards: v })
                                }
                            />

                        </Card>
                        <Card title="EMAIL NOTIFICATIONS">

                            <Row
                                icon={Icons.email}
                                title="Order Receipts"
                                subtitle="Email receipts and invoices"
                                value={settings.receipts}
                                onChange={v =>
                                    setSettings({ ...settings, receipts: v })
                                }
                            />

                            <Row
                                icon={Icons.news}
                                title="Weekly Newsletter"
                                subtitle="Receive news and updates"
                                value={settings.newsletter}
                                onChange={v =>
                                    setSettings({ ...settings, newsletter: v })
                                }
                            />

                        </Card>
                        <Card title="SMS NOTIFICATIONS">
                            <Row
                                icon={Icons.otp}
                                title="OTP Verification"
                                subtitle="Security verification codes"
                                value={settings.otp}
                                onChange={v => setSettings({ ...settings, otp: v })}
                            />

                            <Row
                                icon={Icons.sms}
                                title="Marketing SMS"
                                subtitle="Offers and promotions via SMS"
                                value={settings.marketing}
                                onChange={v => setSettings({ ...settings, marketing: v })}
                            />
                        </Card>
                        <Card title="SOUND & VIBRATION">
                            <TouchableOpacity
                                style={styles.row}
                                onPress={() => setSoundModal(true)}
                            >
                                <View style={styles.left}>
                                    <View style={styles.iconBox}>
                                        <AppImage
                                            source={Icons.sound}
                                            width={18}
                                            height={18}
                                        />
                                    </View>

                                    <View style={{ marginLeft: 14 }}>
                                        <AppText fontSize={16}>
                                            Notification Sound
                                        </AppText>
                                    </View>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <AppText
                                        fontSize={13}
                                        fontWeight={600}
                                        color="#444">
                                        {settings.sound}
                                    </AppText>

                                    <AppImage
                                        source={Icons.rightArrow}
                                        width={8}
                                        height={12}
                                        style={{ marginLeft: 8 }}
                                    />
                                </View>
                            </TouchableOpacity>

                            <Row
                                icon={Icons.vibration}
                                title="Vibration"
                                value={settings.vibration}
                                onChange={v =>
                                    setSettings({
                                        ...settings,
                                        vibration: v,
                                    })
                                }
                            />
                        </Card>
                        <Card title="QUIET HOURS">
                            <Row
                                icon={Icons.moon}
                                title="Order Updates"
                                subtitle="Receive order status updates"
                                value={settings.quietHours}
                                onChange={v =>
                                    setSettings({
                                        ...settings,
                                        quietHours: v,
                                    })
                                }
                            />

                            <View style={styles.timeRow}>
                                <TouchableOpacity
                                    style={styles.timeBox}
                                    onPress={() => {
                                        setTimeType('start');
                                        setSelectedTime(new Date());
                                        setOpenTimePicker(true);
                                    }}
                                >
                                    <AppText fontWeight={600}>
                                        {settings.startTime}
                                    </AppText>

                                    <AppImage
                                        source={Icons.downArrow}
                                        width={10}
                                        height={10}
                                        resizeMode='contain'
                                    />
                                </TouchableOpacity>

                                <AppImage
                                    source={Logos.arrow}
                                    width={18}
                                    height={18}
                                />

                                <TouchableOpacity
                                    style={styles.timeBox}
                                    onPress={() => {
                                        setTimeType('end');
                                        setSelectedTime(new Date());
                                        setOpenTimePicker(true);
                                    }}
                                >
                                    <AppText fontWeight={600}>
                                        {settings.endTime}
                                    </AppText>

                                    <AppImage
                                        source={Icons.downArrow}
                                        width={10}
                                        height={10}
                                        resizeMode='contain'
                                    />
                                </TouchableOpacity>
                            </View>
                        </Card>
                        <TouchableOpacity
                            onPress={() => {
                                updateNotificationSettings()
                            }}
                            style={styles.saveButton}>
                            {loading ? (
                                <ActivityIndicator size="small" color={color.themetext} />
                            ) : (
                                <>
                                    <AppImage
                                        source={Icons.save}
                                        width={18}
                                        height={19}
                                        resizeMethod='contain'
                                    />

                                    <AppText
                                        marginLeft={10}
                                        color={color.themetext}
                                        fontWeight={600}>
                                        Save Preferences
                                    </AppText>
                                </>)}

                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>}
            <Modal
                visible={soundModal}
                transparent
                animationType="slide"
                onRequestClose={() => setSoundModal(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.modalContainer}
                    onPress={() => setSoundModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.bottomSheet}
                    >
                        <AppText
                            fontSize={18}
                            fontWeight={700}
                            marginBottom={20}
                        >
                            Notification Sound
                        </AppText>

                        {soundOptions.map(item => (
                            <TouchableOpacity
                                key={item}
                                style={styles.soundRow}
                                onPress={() => {
                                    setSettings(prev => ({
                                        ...prev,
                                        sound: item,
                                    }));
                                    setSoundModal(false);
                                }}
                            >
                                <AppText
                                    fontSize={16}
                                    color="#1B1C1C"
                                >
                                    {item}
                                </AppText>

                                {settings.sound === item && (
                                    <AppImage
                                        source={Icons.tick}
                                        width={20}
                                        height={20}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
            <Modal
                transparent
                visible={openTimePicker}
                animationType="fade"
            >
                <DatePicker
                    modal
                    open={openTimePicker}
                    date={selectedTime}
                    mode="time"
                    onConfirm={(time) => {
                        setOpenTimePicker(false);
                        setSelectedTime(time);

                        const formattedTime = time.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        });

                        setSettings(prev => ({
                            ...prev,
                            startTime:
                                timeType === 'start' ? formattedTime : prev.startTime,
                            endTime:
                                timeType === 'end' ? formattedTime : prev.endTime,
                        }));
                    }}
                    onCancel={() => setOpenTimePicker(false)}
                />
            </Modal>

        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF7F8',
    },

    content: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },

    header: {
        height: 60,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,

        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginBottom: 8,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#FDECF2',
        justifyContent: 'center',
        alignItems: 'center',
    },

    timeRow: {
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },

    timeBox: {
        flex: 1,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#FDF5F7',
        paddingHorizontal: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    saveButton: {
        marginTop: 30,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: color.themetext,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.35)',
    },

    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 35,
    },

    soundRow: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        marginTop: 10,
    },

    button: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E5E5E5',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    datePickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '85%',
        alignItems: 'center'
    },
});
export default NotificationPreferences;