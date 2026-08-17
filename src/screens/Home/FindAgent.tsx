import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { color } from "../../share/constants/color";
import AppText from "../../share/components/AppText";
import AppImage from "../../share/components/AppImage";
import { BottomIcons, Icons } from "../../share/constants/media";
import SearchBar from "../../share/components/SearchBar";
import { useEffect, useState } from "react";
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import { useNavigation, useRoute } from '@react-navigation/native'
import Toast from "react-native-toast-message";
import MainHeader from "../../share/components/MainHeader";
import PaymentAlertModal from "../../share/components/PaymentAlertModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "../../auth/redux/authSlice";
import { useAppDispatch } from "../../share/hooks/useAppSelector";

type FindAgentProps = {
    setVisible: (value: string) => void;
};

export default function FindAgent({ setVisible }: FindAgentProps) {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const type = route.params?.type ?? '';
    const adddressdata = route.params?.adddress ?? '';
    const dispatch = useAppDispatch();
    const [agentdata, setAgentdata] = useState(null)
    const [agentData, setAgentData] = useState<any[]>([]);
    const [recagentData, setRecAgentData] = useState<any[]>([]);
    const [filteredAgents, setFilteredAgents] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadings, setLoadings] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [agentid, setAgentId] = useState(null)
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
    const [paymentModal, setPaymentModal] = useState({
        visible: false,
        title: 'Proceed to Payment',
        message: '',
        cancelText: 'Cancel',
        confirmText: 'Continue',
        onCancel: () => { },
        onConfirm: () => { },
    });




    useEffect(() => {
        getProfile()
        recommendationsgentfun()
    }, [navigation])





    const getProfile = async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.getprofile);
            console.log(response, "profile api response")
            if (response.status === 200) {
                const data = response.data.data;

                setProfile(data);

            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };


    const searchAgent = (text: string) => {
        setSearchText(text);

        if (!text.trim()) {
            setFilteredAgents(agentData);
            return;
        }

        const filtered = agentData.filter((item: any) =>
            item.name?.toLowerCase().includes(text.toLowerCase()) ||
            item.location?.toLowerCase().includes(text.toLowerCase())
        );

        setFilteredAgents(filtered);
    };


    const filtered = agentData.filter((item: any) =>
        item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.rating?.toString().includes(searchText) ||
        item.completedOrders?.toString().includes(searchText)
    );

    const geagentdata = async () => {
        console.log("geagentdata api called")
        try {
            setLoading(true);
            // dispatch(loaderstate(true));

            const response = await ApiService.get(apiUrls.getagent);

            const data = response.data;
            console.log(data, 'geagentdata API RESPONSEdddd');

            if (response.status === 200) {
                setAgentData(data.agents);
                setFilteredAgents(data.agents);
            }
        } catch (error) {
            console.log('geagentdatadata ERROR:', error);
        } finally {
            setLoading(false);
        }
    };

    const SelectAgent = async (agentId: number) => {
        try {
            setLoadings(true)
            setAgentId(agentId)
            const response = await ApiService.patch(
                apiUrls.selectAgent,
                {
                    agentId,
                }
            );

            console.log('Status:', response.status);
            console.log('Response:', response.data);

            if (response.status === 200) {
                setSelectedAgentId(agentId);
                if (type == 'Submitorder') {
                    await handleSubmitOrder({})
                }
                getProfile()


                dispatch(
                    showToast({
                        visible: true,
                        message:
                            response.data?.message ||
                            'Agent assigned successfully.',
                        type: 'success',
                    })
                );
                // Alert.alert('Success', response.data.message);
            }
            else {
                if (type == 'Submitorder') {
                    await handleSubmitOrder({})
                }
            }
        } catch (error: any) {
            console.log('Error:', error.response?.data || error);

            dispatch(
                showToast({
                    visible: true,
                    message:
                        error.response?.data?.message ||
                        error.message ||
                        'Something went wrong.',
                    type: 'info',
                })
            );
        }
        finally {
            setLoadings(false);
            setAgentId(agentId)
        }
    };

    const recommendationsgentfun = async () => {
        console.log("geagentdata api called")
        try {
            setLoading(true);
            // dispatch(loaderstate(true));

            const response = await ApiService.get(apiUrls.agentrecommendations);

            const data = response.data;
            console.log(data, 'recommendationsgent API RESPONSEdddd');

            if (response.status === 200) {
                setRecAgentData(data?.data)
            }
        } catch (error) {
            console.log('geagentdatadata ERROR:', error);
        } finally {
            setLoading(false);
        }
    };



    const randomagentfun = async () => {
        try {
            setLoading(true)

            const response = await ApiService.patch(
                apiUrls.randomagent

            );

            console.log('Status:', response.status);
            console.log('Response:', response.data);

            if (response.status === 200) {
                setLoading(false)
                dispatch(
                    showToast({
                        visible: true,
                        message: response.data?.message || 'Agent assigned successfully.',
                        type: 'success',
                    })
                );
                // if (type == 'Submitorder') {
                //     await handleSubmitOrder({})
                // }

                geagentdata()

                getProfile();
            }
        } catch (error: any) {
            setLoading(false)
            console.log('Error:', error.response?.data || error);

            Alert.alert(
                'Error',
                error.response?.data?.message || error.message
            );
        }
        finally {
            setLoadings(false);

        }
    };




    const handleSubmitOrder = async (data: any) => {

        console.log("profile.shippingAddress:", profile?.addresses);
        console.log("adddressdata:", [adddressdata]);
        const shippingAddress =
            profile?.addresses?.length > 0
                ? JSON.stringify(profile.addresses[0])
                : JSON.stringify([adddressdata]);
        const body = {
            shippingAddress,
            customerMessage: "Thanks buddy!",
            couponBucket: "SUMMER_SALE",
        };

        console.log("Request Body:", JSON.stringify(body, null, 2));
        try {
            setLoadings(true)
            const response = await ApiService.post(apiUrls.createorder, body);

            console.log(response.data.success, "kkkkkkkkkkkkk");

            if (response.data.success) {
                Toast.show({
                    type: 'success',
                    position: 'bottom',
                    text1: 'Success',
                    text2: 'Order created successfully',
                    visibilityTime: 3000,
                    bottomOffset: 30,
                });
                // if (type == 'change') {
                // navigation.navigate('OrderDetails', { item: response.data.data, previousScreen: 'FindAgent', })
                // Alert.alert(
                //     'Proceed to Payment',
                //     'Your order has been created successfully. Would you like to continue to payment?',
                //     [
                //         {
                //             text: 'Cancel',
                //             style: 'cancel',
                //             onPress: () => {
                //                 Alert.alert(
                //                     'Order Cancelled',
                //                     'Your order has been cancelled.',
                //                     [
                //                         {
                //                             text: 'OK',
                //                             onPress: () => {
                //                                 navigation.navigate('PlaceOrder');
                //                             },
                //                         },
                //                     ]
                //                 );
                //             },
                //         },
                //         {
                //             text: 'Continue',
                //             onPress: () => {
                //                 // navigation.navigate('PlaceOrder');
                //                 navigation.navigate('OrderDetails', { item: response?.data?.data, previousScreen: 'FindAgent', })
                //             },
                //         },
                //     ],
                //     { cancelable: false }
                // );
                setPaymentModal({
                    visible: true,
                    title: 'Proceed to Payment',
                    message:
                        'Your order has been created successfully. Would you like to continue to payment?',
                    cancelText: 'Cancel',
                    confirmText: 'Continue',
                    onCancel: () => {
                        setPaymentModal(prev => ({ ...prev, visible: false }));

                        navigation.navigate('OrderDetails', {
                            item: response?.data?.data,
                            previousScreen: 'FindAgent',
                        });
                    },
                    onConfirm: () => {
                        setPaymentModal(prev => ({ ...prev, visible: false }));

                        navigation.navigate('OrderDetails', {
                            item: response?.data?.data,
                            previousScreen: 'FindAgent',
                        });
                    },
                });

                // }
                // else {
                //   navigation.navigate('FindAgent', { type: 'Submitorder' })
                // }

                // Alert.alert("Success", "Order created successfully");
            }
        } catch (error: any) {
            console.log(error.response?.data || error);
            Toast.show({
                type: 'error',
                text1: 'Unable to Add Item',
                text2:
                    error.response?.data?.message ||
                    'Something went wrong. Please try again.',
                position: 'bottom',
            });
        }
        finally {
            setLoadings(false);
        }
    };

    const handleBack = () => {
        const previous = route.params?.previousScreen;

        if (previous) {
            navigation.navigate(previous);
        } else {
            setVisible?.('dash');
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <MainHeader
                headerName={'find'}
                onbackpress={handleBack}
            // setVisible={setVisible}
            />
            {
                loading ?
                    <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
                        <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
                    </View>
                    :
                    <>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={{ gap: 10, marginHorizontal: 15 }} contentContainerStyle={{ gap: 10 }}>
                            <AppText
                                fontSize={24}
                                fontWeight={600}
                                color={color.textcolor}
                                marginTop={10}
                            >
                                {"Find Your Expert Agent"}
                            </AppText>
                            <AppText
                                fontSize={16}
                                fontWeight={400}
                                color={"#4D4447"}
                            >
                                {"Your dedicated shopping agent for a\nseamless experience."}
                            </AppText>
                            {profile?.agent && Object.keys(profile.agent).length > 0 && (
                                <View style={styles.currentagentview}>
                                    <View style={styles.topview}>
                                        <View style={{
                                            alignItems: 'center', justifyContent: 'center', padding: 5, backgroundColor: color.white,
                                            borderRadius: 50
                                        }}>
                                            <AppText
                                                fontSize={12}
                                                fontWeight={600}
                                                color={color.btntextcolor}>
                                                {"CURRENT AGENT"}
                                            </AppText>

                                        </View>
                                        <AppImage
                                            source={Icons.confirm}
                                            width={22}
                                            height={21}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <View style={styles.profileview}>
                                        <View style={styles.innerview}>
                                            <AppImage
                                                source={
                                                    profile?.agent?.avatarUrl
                                                        ? { uri: `https://shelynx.mediaclocksoft.com.au${profile.agent.avatarUrl}` }
                                                        : Icons.agent
                                                }
                                                width={40}
                                                height={40}
                                                resizeMode="cover"
                                                borderRadius={30}
                                                style={{
                                                    borderRadius: 30
                                                }}
                                            />
                                        </View>

                                        <View>
                                            <AppText
                                                fontSize={16}
                                                fontWeight={600}
                                                color={'#1B1C1C'}
                                            >
                                                {profile?.agent?.name || " "}
                                            </AppText>
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 5,
                                            }}>
                                                <AppImage
                                                    source={Icons.star}
                                                    width={14}
                                                    height={12}
                                                    resizeMode="contain" />

                                                <AppText
                                                    fontSize={12}
                                                    fontWeight={400}
                                                    color={color.themetext}
                                                >
                                                    {profile?.agent?.rating}
                                                </AppText>
                                                <View style={styles.dots} />
                                                <AppText
                                                    fontSize={12}
                                                    fontWeight={400}
                                                    color={"#4D4447"}
                                                >
                                                    {`${profile?.agent?.completedOrders} orders`}
                                                </AppText>
                                            </View>

                                        </View>


                                    </View>

                                    <View style={{ flexDirection: 'row', gap: 10, width: '100%', justifyContent: 'space-between' }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                navigation.navigate('ChatScreen', { previousScreen: 'FindAgent', conversation: profile?.agent, })
                                            }}
                                            style={[styles.btnview, { backgroundColor: "#FFD1DC", gap: 5, borderRadius: 8 }]}>
                                            <AppImage
                                                source={BottomIcons.library}
                                                width={20}
                                                height={20}
                                                resizeMode="contain"
                                                tintColor={"#78555E"}
                                            />
                                            <AppText
                                                fontSize={14}
                                                fontWeight={600}
                                                color={"#78555E"}
                                            >
                                                {"Message"}
                                            </AppText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Toast.show({
                                                    type: 'info',
                                                    text1: 'Feature coming soon',

                                                    position: 'bottom',
                                                });
                                            }}
                                            style={[styles.btnview, {
                                                backgroundColor: color.white, gap: 5, borderWidth: 1,
                                                borderColor: '#78555E', borderRadius: 8
                                            }]}>

                                            <AppText
                                                fontSize={14}
                                                fontWeight={600}
                                                color={"#78555E"}
                                            >
                                                {"Manage"}
                                            </AppText>
                                            <AppImage
                                                source={Icons.downArrow}
                                                width={10}
                                                height={20}
                                                resizeMode="contain"
                                                tintColor={"#78555E"}
                                                style={{ marginTop: 5 }}
                                            />
                                        </TouchableOpacity>
                                    </View>



                                </View>
                            )}


                            <TouchableOpacity
                                onPress={() => {
                                    randomagentfun()
                                }}
                                style={styles.btnview1}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={color.themetext} />
                                ) : (
                                    <AppText
                                        fontSize={14}
                                        fontWeight={400}
                                        color={color.themetext}
                                        textAlign={"center"}
                                    >
                                        {"Switch to a Random Agent"}
                                    </AppText>)}

                            </TouchableOpacity>



                            {/* <View style={{ marginHorizontal: 5, marginVertical: 10 }}>
                    <SearchBar
                        value={searchText}
                        onChangeText={searchAgent}
                        placeholder="Search agents by name..."
                    />
                </View> */}



                            <AppText
                                fontSize={14}
                                fontWeight={600}
                                color={"#4D4447"}
                            >
                                {"RECOMMENDED AGENTS"}
                            </AppText>

                            {loading ? (
                                <View
                                    style={{
                                        height: 300,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <ActivityIndicator size="large" color={color.themetext} />
                                </View>
                            ) : (
                                <FlatList
                                    data={recagentData}
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled={true}
                                    renderItem={({ item, index }) => {
                                        const isSelected = String(selectedAgentId) === String(item.id);

                                        return (
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => {
                                                    SelectAgent(item.id)

                                                }}
                                                style={[
                                                    styles.card,
                                                    isSelected && {
                                                        borderWidth: 1,
                                                        borderColor: color.themetext,
                                                    },
                                                ]}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            gap: 8,
                                                            flex: 1,
                                                        }}
                                                    >
                                                        <AppImage
                                                            source={
                                                                item?.avatarUrl
                                                                    ? {
                                                                        uri: `https://shelynx.mediaclocksoft.com.au${item.avatarUrl}`,
                                                                    }
                                                                    : Icons.agent
                                                            }
                                                            width={40}
                                                            height={40}
                                                            resizeMode="cover"
                                                            borderRadius={30}
                                                            style={{
                                                                borderRadius: 30,
                                                            }}
                                                        />

                                                        <View style={{ flex: 1 }}>
                                                            <AppText
                                                                fontSize={16}
                                                                fontWeight={600}
                                                                color="#1B1C1C"
                                                            >
                                                                {item.name}
                                                            </AppText>

                                                            <View
                                                                style={{
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    gap: 5,
                                                                }}
                                                            >
                                                                <AppImage
                                                                    source={Icons.track}
                                                                    width={14}
                                                                    height={12}
                                                                    resizeMode="contain"
                                                                    tintColor="#4D4447"
                                                                />

                                                                <AppText
                                                                    fontSize={12}
                                                                    fontWeight={400}
                                                                    color="#4D4447"
                                                                >
                                                                    {item?.location || ''}
                                                                </AppText>
                                                            </View>
                                                        </View>
                                                    </View>

                                                    {/* Rating + Radio */}
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: 10,

                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flexDirection: 'row',
                                                                gap: 5,
                                                                backgroundColor: '#F0EDED',
                                                                borderRadius: 8,
                                                                alignSelf: 'flex-start',
                                                                padding: 5,
                                                            }}
                                                        >
                                                            <AppImage
                                                                source={Icons.star}
                                                                height={13}
                                                                width={14}
                                                                resizeMode="contain"
                                                            />

                                                            <AppText
                                                                fontSize={12}
                                                                fontWeight={700}
                                                                color="#1B1C1C"
                                                            >
                                                                {item.rating}
                                                            </AppText>
                                                        </View>


                                                    </View>
                                                    {/* Radio Button */}
                                                    <View
                                                        style={{
                                                            width: 22,
                                                            height: 22,
                                                            borderRadius: 11,
                                                            borderWidth: 2,
                                                            marginLeft: 20,
                                                            marginTop: 4,
                                                            borderColor: isSelected
                                                                ? color.themetext
                                                                : '#BDBDBD',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <View
                                                                style={{
                                                                    width: 12,
                                                                    height: 12,
                                                                    borderRadius: 6,
                                                                    backgroundColor: color.themetext,
                                                                }}
                                                            />
                                                        )}
                                                    </View>
                                                </View>

                                                {/* Specialist */}
                                                {/* <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        gap: 5,
                                                        backgroundColor: '#FCE4EC',
                                                        borderRadius: 8,
                                                        alignSelf: 'flex-start',
                                                        padding: 5,
                                                        marginTop: 10,
                                                    }}
                                                >
                                                    <AppText
                                                        fontSize={10}
                                                        color="#76646B"
                                                    >
                                                        BULK SPECIALIST
                                                    </AppText>
                                                </View> */}
                                            </TouchableOpacity>
                                        );
                                    }}

                                    ListEmptyComponent={
                                        <AppText
                                            fontSize={16}
                                            color="#4D4447"
                                            style={{ textAlign: 'center', marginTop: 30 }}
                                        >
                                            No agents found
                                        </AppText>
                                    }
                                />)}

                            {/* {loading ? (
                                <View
                                    style={{
                                        height: 300,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <ActivityIndicator size="large" color={color.themetext} />
                                </View>
                            ) : (
                                <FlatList
                                    data={filteredAgents}
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled={true}
                                    renderItem={({ item, index }) => {
                                        return (
                                            <View style={styles.card}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <View style={{ flexDirection: 'row', gap: 8 }}>

                                                        <AppImage
                                                            source={
                                                                item?.avatarUrl
                                                                    ? { uri: `https://shelynx.mediaclocksoft.com.au${item.avatarUrl}` }
                                                                    : Icons.agent
                                                            }
                                                            width={40}
                                                            height={40}
                                                            resizeMode="cover"
                                                            borderRadius={30}
                                                            style={{
                                                                borderRadius: 30
                                                            }}
                                                        />
                                                        <View>
                                                            <AppText
                                                                fontSize={16}
                                                                fontWeight={600}
                                                                color={'#1B1C1C'}
                                                            >
                                                                {item.name}
                                                            </AppText>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                gap: 5,
                                                            }}>
                                                                <AppImage
                                                                    source={Icons.track}
                                                                    width={14}
                                                                    height={12}
                                                                    resizeMode="contain"
                                                                    tintColor={"#4D4447"}
                                                                />

                                                                <AppText
                                                                    fontSize={12}
                                                                    fontWeight={400}
                                                                    color={"#4D4447"}
                                                                >
                                                                    {item?.location || ''}
                                                                </AppText>

                                                            </View>

                                                        </View>

                                                    </View>

                                                    <View style={{ flexDirection: 'row', gap: 5, backgroundColor: '#F0EDED', borderRadius: 8, alignSelf: 'flex-start', padding: 5 }}>
                                                        <AppImage
                                                            source={Icons.star}
                                                            height={13}
                                                            width={14}
                                                            resizeMode="contain"
                                                        />
                                                        <AppText
                                                            fontSize={12}
                                                            fontWeight={700}
                                                            color={"#1B1C1C"}
                                                        >
                                                            {item.rating}
                                                        </AppText>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row', gap: 5, backgroundColor: "#FCE4EC", borderRadius: 8, alignSelf: 'flex-start', padding: 5 }}>
                                                    <AppText fontSize={10} color="#76646B">
                                                        {"BULK SPECIALIST"}
                                                    </AppText>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <AppText
                                                        fontSize={16}
                                                        fontWeight={400}
                                                        color={"#4D4447"}
                                                    >
                                                        {`${item.completedOrders} orders completed`}
                                                    </AppText>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            SelectAgent(item.id)
                                                        }}
                                                        style={{
                                                            borderWidth: 1,
                                                            height: 38,
                                                            borderRadius: 8,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            paddingHorizontal: 10
                                                        }}>
                                                        {loadings && String(item.id) === String(agentid) ? (
                                                            <ActivityIndicator size="small" color="#78555E" />
                                                        ) : (
                                                            <AppText
                                                                fontSize={16}
                                                                fontWeight={400}
                                                                color="#78555E"
                                                            >
                                                                Select Agent
                                                            </AppText>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        );
                                    }}

                                    ListEmptyComponent={
                                        <AppText
                                            fontSize={16}
                                            color="#4D4447"
                                            style={{ textAlign: 'center', marginTop: 30 }}
                                        >
                                            [ No agents found ]
                                        </AppText>
                                    }
                                />)} */}

                            <View style={styles.addview}>
                                <AppText
                                    fontSize={20}
                                    color={color.white}
                                    fontWeight={600}
                                >
                                    {"Join the Network"}
                                </AppText>
                                <AppText
                                    fontSize={16}
                                    color={"#D7C1C8"}
                                    fontWeight={400}
                                >
                                    {"Earn commissions by helping others\nshop and ship."}
                                </AppText>
                                <AppText
                                    fontSize={16}
                                    color={"#FFD9E1"}
                                    fontWeight={400}
                                    marginTop={15}
                                >
                                    {"Become a SheLynx Agent"}
                                </AppText>
                            </View>
                            <View style={{
                                height: 100
                            }} />
                        </ScrollView>
                    </>
            }
            <PaymentAlertModal
                visible={paymentModal.visible}
                title={paymentModal.title}
                message={paymentModal.message}
                cancelText={paymentModal.cancelText}
                confirmText={paymentModal.confirmText}
                onCancel={paymentModal.onCancel}
                onConfirm={paymentModal.onConfirm}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.appcolor,
        //paddingHorizontal: 15,
    },
    currentagentview: {
        backgroundColor: "#FCE4EC",
        borderRadius: 12,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 5,
        marginHorizontal: 5,
        marginTop: 10

    },
    topview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    profileview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    innerview: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderwidth: 1,
        borderColor: color.white,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',

    },
    dots: {
        width: 4,
        height: 4,
        borderRadius: 4,
        backgroundColor: '#D0C3C7',
        marginHorizontal: 2,
    },
    btnview: {
        marginTop: 20,
        width: '45%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        height: 46,
        //padding: 20,
        borderRadius: 8,
    },
    card: {
        padding: 20,
        backgroundColor: color.white,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 5,
        marginVertical: 10,
        gap: 10,
        marginHorizontal: 5,

    },
    addview: {
        backgroundColor: color.themetext,
        padding: 20,
        borderRadius: 12,
        marginTop: 10,
        justifyContent: 'center',
        // alignItems:'center',
        paddingVertical: 20
    },
    btnview1: {
        marginVertical: 20,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#90144826',

        padding: 20,
        borderRadius: 10,
        shadowColor: "#B030600F",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.20,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: color.btncolor,
        flexDirection: 'row',
        gap: 8
        //marginHorizontal:20
    }
})