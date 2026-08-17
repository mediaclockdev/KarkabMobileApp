import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import color from "../../share/constants/color";
import AppText from "../../share/components/AppText";
import SearchBar from "../../share/components/SearchBar";
import AppImage from "../../share/components/AppImage";
import { BottomIcons, Icons } from "../../share/constants/media";
import { useCallback, useEffect, useState } from "react";
import apiUrls, { BASE_URL } from "../../services/apiUrls";
import ApiService from '../../services/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AppLoader from "../../share/components/AppLoader";
import ImmediateProductList from "../../share/components/ImmediateProductList";
import TopProductList from "../../share/components/TopProductList";
import MainHeader from "../../share/components/MainHeader";
import { storage } from "../../share/storage/mmkv";
import { setAuthenticated, showToast } from "../../auth/redux/authSlice";
import { useAppDispatch } from "../../share/hooks/useAppSelector";
import { GlobalImage } from "../../share/utils/GlobalImage";

interface DashboardProps {
    setVisible: (visible: any) => void;

}

const Dashboard: React.FC<DashboardProps> = ({ setVisible }) => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [trustscore, setTrustscore] = useState<any>(null);
    const [orderdata, setOrderdata] = useState<any>(null);
    const [cartCount, setCartcount] = useState<number>(0);


    useFocusEffect(
        useCallback(() => {

            getProfile()
            getscore()
            getproductdata()
            getCartCount()
            const token = storage.getString('userToken');
            console.log(token, "fkfckfv")
        }, [])
    )


    const getCartCount = async () => {
        try {
            //setLoading(true);

            const response = await ApiService.get(apiUrls.cartcount);
            console.log(response, "getcartcount api response")
            if (response.status === 200) {
                const data = response.data;
                console.log(data, "dwhdkhwhdnwk")
                setCartcount(data.cartCount);
            }
        } catch (error: any) {
            console.log(error);
        } finally {
            //setLoading(false);
        }
    };

    const handlelogout = () => {


        storage.set('userToken', '');
        const token = storage.getString('userToken');
        console.log(token, "fkfckfv")
        dispatch(setAuthenticated(false));

    };

    const getProfile = async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.getprofile);
            console.log(response, "profile api response")
            if (response.status === 200) {
                const data = (response as any)?.data?.data;

                setProfile(data);

                //   setFaceId(data.faceIdEnabled);
                //   setLanguage(data.language === 'ar' ? 'Arabic' : 'English');
            }
        } catch (error: any) {
            console.log(error);
            if (
                error?.status === 403 ||
                error?.message === "Invalid or Expired Token"
            ) {
                handlelogout();
                return;
            }
        } finally {
            setLoading(false);
        }
    };


    const getscore = async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.gettrustscore);
            console.log(response, "gettrustscore api response")
            if (response.status === 200) {
                const data = (response as any)?.data?.data;
                console.log(data, "jcjcb")
                setTrustscore(data);

            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const getproductdata = async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.availableorder);
            console.log(response, "getproductdata api response")
            if (response.status === 200) {
                const data = (response as any)?.data?.orders;
                console.log(data, "jcjcb")
                setOrderdata(data[0].items);

            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const capitalizeFirstLetter = (text = "") => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    // if (loading) {
    //     return (
    //         <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
    //             <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
    //         </View>)

    // }


    const randomagentfun = async () => {
        try {


            const response = await ApiService.patch(
                apiUrls.randomagent

            );

            console.log('Status:', response.status);
            console.log('Response:', response.data);

            if (response.status === 200) {
                dispatch(
                    showToast({
                        visible: true,
                        message: response.data?.message || 'Agent assigned successfully.',
                        type: 'success',
                    })
                );


                getProfile();
            }
        } catch (error: any) {
            console.log('Error:', error.response?.data || error);

            Alert.alert(
                'Error',
                error.response?.data?.message || error.message
            );
        }
    };

    return (


        <View style={{ flex: 1, backgroundColor: color.appcolor }}>
            <MainHeader
                headerName={'dash'}
                setVisible={setVisible}
            />
            {
                loading ?
                    <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
                        <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
                    </View>
                    :
                    <>
                        <ScrollView
                            stickyHeaderIndices={[1]}
                            style={{
                                paddingHorizontal: 15,
                                paddingVertical: 10,
                                paddingBottom: 120,
                                gap: 10,
                            }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 20, gap: 15 }}
                        >
                            <View style={styles.userview}>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 10
                                }}>
                                    <View style={{ flex: 1 }}>
                                        <AppText
                                            fontSize={24}
                                            fontWeight={600}
                                            color={color.textcolor}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {`Hello, ${capitalizeFirstLetter(profile?.name || "")}!`}
                                        </AppText>
                                    </View>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                                        onPress={() => {
                                            setVisible('guid')
                                        }}
                                    >
                                        <AppText
                                            fontSize={10}
                                            fontWeight={600}
                                            color={color.themetext}
                                        >
                                            {"How It Works"}
                                        </AppText>
                                        <AppImage
                                            source={Icons.help}
                                            width={11}
                                            height={11}
                                            tintColor={color.themetext}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {
                                    profile?.addresses?.length > 0 ? (
                                        profile?.addresses?.[0]?.addressLine == '' && profile?.addresses?.[0]?.addressLine == '' ?
                                            null :
                                            (
                                                <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                                    <AppImage
                                                        source={Icons.location}
                                                        height={11}
                                                        width={8.5}
                                                        resizeMode="conatin"
                                                        tintColor={color.themetext}
                                                    />
                                                    <AppText
                                                        fontSize={10}
                                                        fontWeight={600}
                                                        color={"#4D4447"}
                                                    >
                                                        {` ${profile?.addresses?.[0]?.addressLine}`}
                                                    </AppText>
                                                </View>
                                            )
                                    ) : null}


                            </View>


                            <SearchBar />


                            <View style={styles.addview}>
                                <AppText
                                    fontSize={20}
                                    color={color.white}
                                    fontWeight={600}
                                >
                                    {"Start Your Shopping"}
                                </AppText>
                                <AppText
                                    fontSize={20}
                                    color={color.white}
                                    fontWeight={600}
                                >
                                    {"Journey Now"}
                                </AppText>

                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('WebViewScreen')
                                    }}
                                    style={[styles.btnview, { borderColor: color.white, marginTop: 25 }]}>
                                    <AppText
                                        fontSize={14}
                                        color={color.white}
                                        fontWeight={600}
                                    >
                                        {"Start Shopping From Shein"}
                                    </AppText>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.featureview}>
                                {/* <View style={{ gap: 5, alignItems: 'center' }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setVisible('find')
                                        }}

                                        style={styles.innerview}>

                                        <AppImage
                                            source={Icons.agent}
                                            width={20}
                                            height={18}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                    <AppText
                                        fontSize={12}
                                        color="#1B1C1C"
                                        fontWeight={600}

                                    >
                                        {"Find Agent"}
                                    </AppText>
                                </View> */}
                                <View style={{ gap: 5, alignItems: 'center' }}>


                                    <TouchableOpacity
                                        onPress={() => {

                                            navigation.navigate('PlaceOrder')
                                        }}

                                        style={styles.innerview}>

                                        <AppImage
                                            source={Icons.placecart}
                                            width={20}
                                            height={18}
                                            resizeMode="contain"
                                        />
                                        {cartCount > 0 && (
                                            <View style={styles.cartBadge}>
                                                <AppText
                                                    fontSize={10}
                                                    color="#fff"
                                                    fontWeight={700}
                                                    textAlign="center"
                                                >
                                                    {cartCount > 99 ? '99+' : cartCount}
                                                </AppText>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <AppText
                                        fontSize={12}
                                        color="#1B1C1C"
                                        fontWeight={600}
                                        textAlign="center"
                                    >
                                        {"My Cart"}
                                    </AppText>
                                </View>
                                <View style={{ gap: 5, alignItems: 'center' }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.navigate('Order')
                                        }}
                                        style={styles.innerview}>

                                        <AppImage
                                            source={Icons.truck}
                                            width={20}
                                            height={18}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                    <AppText
                                        fontSize={12}
                                        color="#1B1C1C"
                                        fontWeight={600}
                                        textAlign="center"
                                    >
                                        {"Track Orders"}
                                    </AppText>
                                </View>
                            </View>



                            {profile?.agent && Object.keys(profile.agent).length > 0 && (
                                <>
                                    <AppText
                                        fontSize={20}
                                        color="#1B1C1C"
                                        fontWeight={600}
                                        marginTop={5}
                                    >
                                        {"Your Current Agent"}
                                    </AppText>


                                    <View style={styles.card}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                            <View style={{
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 48,
                                                width: 48,
                                                borderRadius: 40,
                                                borderWidth: 2,
                                                borderColor: "#AB2C5D",
                                                overflow: 'hidden',
                                            }}>

                                                <AppImage
                                                    source={
                                                        profile?.agent?.avatarUrl
                                                            ? `https://shelynx.mediaclocksoft.com.au${profile.agent.avatarUrl}`
                                                            : Icons.agent
                                                    }
                                                    width={50}
                                                    height={50}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                            <View style={{ marginLeft: 10, flex: 1 }}>
                                                <AppText
                                                    fontSize={14}
                                                    color="#1B1C1C"
                                                    fontWeight={600}
                                                >
                                                    {profile?.agent?.name || "John Doe"}
                                                </AppText>
                                                <AppText
                                                    fontSize={10}
                                                    color="#AB2C5D"
                                                    fontWeight={600}
                                                >
                                                    {"PRO AGENT"}
                                                </AppText>
                                            </View>
                                            {/* <TouchableOpacity
                                                onPress={() => {
                                                    navigation.navigate('ChatScreen', {
                                                        previousScreen: 'Home',
                                                        conversation: profile?.agent,
                                                    });
                                                }}
                                            >
                                                <AppImage
                                                    source={Icons.fillchat}
                                                    width={20}
                                                    height={20}
                                                />
                                            </TouchableOpacity> */}

                                            <TouchableOpacity
                                                onPress={() => {
                                                    setVisible('find')
                                                    //  randomagentfun()
                                                }}
                                            >
                                                <AppImage
                                                    source={Icons.setting}
                                                    width={20}
                                                    height={20}
                                                    style={{ marginLeft: 20 }}
                                                />
                                            </TouchableOpacity>


                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                navigation.navigate('ChatScreen', { previousScreen: 'Home', conversation: profile?.agent, })
                                            }}
                                            style={{
                                                backgroundColor: "#FFD1DC", gap: 10, borderRadius: 8,
                                                width: '90%',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                height: 46,
                                                //padding: 20,
                                                marginVertical: 10,
                                            }}>
                                            <AppImage
                                                source={BottomIcons.library}
                                                width={20}
                                                height={20}
                                                resizeMode="contain"
                                                tintColor={"#AB2C5D"}
                                            />
                                            <AppText
                                                fontSize={14}
                                                fontWeight={600}
                                                color={"#AB2C5D"}
                                            >
                                                {"Message"}
                                            </AppText>
                                        </TouchableOpacity>
                                    </View>
                                </>)}


                            {/* 
                            <TouchableOpacity
                                onPress={() => {
                                    setVisible('find')
                                }}
                                style={[styles.btnview, { borderColor: color.themetext }]}>
                                <AppText
                                    fontSize={14}
                                    color={color.themetext}
                                    fontWeight={600}
                                >
                                    {"Find Different Agent"}
                                </AppText>
                            </TouchableOpacity> */}




                            <View style={styles.card}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginVertical: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <AppImage
                                            source={Icons.confirm}
                                            height={21}
                                            width={22}
                                            tintColor={"#FFD1DC"}
                                        />
                                        <AppText fontSize={20} color="#1B1C1C" fontWeight={600}>
                                            {"Trust Score"}
                                        </AppText>

                                    </View>

                                    <AppText fontSize={24} color="#7A5761" fontWeight={600}>
                                        {`${trustscore?.score}%`}
                                    </AppText>
                                </View>

                                <View style={{
                                    width: '100%',
                                    backgroundColor: '#F0EDED',
                                    height: 12,
                                    borderRadius: 99,
                                    overflow: 'hidden',
                                    marginTop: 10
                                }}>
                                    <View style={{ width: `${trustscore?.score}%`, backgroundColor: '#AB2C5D', height: 12, alignItems: 'center' }} />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginVertical: 10 }}>

                                    <AppText fontSize={12} color="#1B1C1C" fontWeight={600}>
                                        {trustscore?.label}
                                    </AppText>
                                    <AppText fontSize={12} color="#7A5761" fontWeight={600}>
                                        {"Boost Score →"}
                                    </AppText>
                                </View>

                            </View>


                            <View>


                                <AppText
                                    fontSize={20}
                                    color="#1B1C1C"
                                    fontWeight={600}
                                    marginTop={10}
                                >
                                    {"Available in Lebanon"}
                                </AppText>
                                <AppText
                                    fontSize={12}
                                    color="#4D4447"
                                    fontWeight={600}

                                >
                                    {"Ready for immediate local delivery"}
                                </AppText>

                                <ImmediateProductList data={orderdata} />
                                {/* <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('Products', { item: orderdata })
                                    }}
                                >
                                    <AppText
                                        fontSize={14}
                                        color="#AB2C5D"
                                        fontWeight={600}
                                        textAlign="center"
                                        marginTop={5}

                                    >
                                        {"See All"}
                                    </AppText>

                                </TouchableOpacity> */}

                                <AppText
                                    fontSize={20}
                                    color={color.textcolor}
                                    fontWeight={600}
                                    marginTop={10}
                                >
                                    {"Top Selling Items"}
                                </AppText>



                                <TopProductList />
                                <TouchableOpacity

                                    onPress={() => {
                                        navigation.navigate('Products', { item: orderdata })
                                    }}
                                >
                                    <AppText
                                        fontSize={14}
                                        color={color.btntextcolor}
                                        fontWeight={600}
                                        textAlign="center"
                                        marginTop={5}

                                    >
                                        {"Explore Trend"}
                                    </AppText>

                                </TouchableOpacity>

                            </View>





                            <View style={{ height: 100 }} />
                        </ScrollView>
                        <View style={styles.pinkShadow}>
                            <TouchableOpacity

                                onPress={() => {
                                    navigation.navigate('Createorder')
                                }}
                                style={styles.fixedView}>
                                <AppImage
                                    source={Icons.plus}
                                    width={24}
                                    height={24}
                                />
                            </TouchableOpacity>
                        </View>
                    </>
            }

        </View>

    )
}

const styles = StyleSheet.create({
    container: {

        flex: 1,
        paddingHorizontal: 15
    },
    userview: {

    },
    featureview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 80
    },
    innerview: {
        height: 56,
        width: 56,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: color.lightpink
    },
    card: {
        width: '100%',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: color.white,
        marginTop: 10,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,

        // Android Shadow
        elevation: 6,
    },
    btnview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderRadius: 12,
        borderWidth: 2,
        height: 48,
        width: '100%',
    },
    addview: {
        backgroundColor: color.themetext,
        padding: 20,
        borderRadius: 12,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20
    },
    pinkShadow: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        borderRadius: 26,

        shadowColor: '#FFD1DC',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        zIndex: 999,
    },
    fixedView: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#AB2C5D',

        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25, // #00000040
        shadowRadius: 4,
        elevation: 10,
    },
    cartBadge: {
        position: 'absolute',
        top: 2,
        right: -6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#AB2C5D',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#FFF',
    },

    // innerview: {
    //     position: 'relative',
    //     width: 44,
    //     height: 44,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },


})
export default Dashboard;