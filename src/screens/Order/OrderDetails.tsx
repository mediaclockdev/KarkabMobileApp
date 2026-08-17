// OrderDetails.tsx

import React, { useCallback, useEffect, useState } from 'react';
import {

    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';

import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import ApiService from '../../services/api';
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import { Banners, BottomIcons, Icons, Logos } from '../../share/constants/media';
import color from '../../share/constants/color';
import apiUrls from '../../services/apiUrls';
import { SafeAreaView } from 'react-native-safe-area-context';

const products = [
    {
        id: '1',
        image: Banners.bagimage,
        name: 'Minimalist Knit Dress',
        sku: '0823741',
        size: 'M',
        color: 'Beige',
        qty: 1,
        price: '$45.00',
    },
    {
        id: '2',
        image: Banners.banner,
        name: 'Structured Blazer',
        sku: '8172645',
        size: 'L',
        color: 'Black',
        qty: 1,
        price: '$55.00',
    },
    {
        id: '3',
        image: Banners.banner,
        name: 'Vintage Denim Jeans',
        sku: '3490021',
        size: 'L',
        color: 'Light Blue',
        qty: 1,
        price: '$12.00',
    },
    {
        id: '4',
        image: Banners.costume,
        name: 'Essential Ribbed Tank Pack',
        sku: '7712332',
        size: 'S',
        color: 'Multi',
        qty: 1,
        price: '$8.00',
    },
];

const OrderDetails = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const item = route.params?.item ?? '';
    const [orderdetaildata, setOrderDetailData] = useState(null)
    console.log(item, "hvefvefvh")
    const [loading, setLoading] = useState(false);



    useFocusEffect(
        useCallback(() => {

            const id = route.params?.item?.id || route.params?.item;
            console.log(id, "hhh")
            if (id) {
                getorderdetail(id);
            }
        }, [route.params?.item])
    );




    interface OrderDetailResponse {
        status: number;
        data: {
            data: any;
        };
    }

    const getorderdetail = async (id: string | number): Promise<void> => {
        console.log(item.id, "whjhdj")
        try {
            setLoading(true);

            const response: OrderDetailResponse = await ApiService.get(apiUrls.getorderdatabyid(id));
            console.log(response, "detailoforder api response")
            if (response.status === 200) {
                const data = response.data.data;
                console.log(data, "ehvedhv")
                setOrderDetailData(data)


            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    const shippingAddress = orderdetaildata?.shippingAddress
        ? orderdetaildata?.shippingAddress
        : null;

    const addressData = Array.isArray(shippingAddress)
        ? shippingAddress[0]
        : shippingAddress;

    const handleBack = () => {
        const previous = route.params?.previousScreen;

        if (previous) {
            navigation.navigate(previous);
        } else {
            navigation.goBack();
        }
    };


    const formatDateRange = (startDate: string, endDate?: string) => {
        const start = new Date(startDate);

        if (!endDate) {
            return start.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }

        const end = new Date(endDate);

        if (
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear()
        ) {
            return `${start.toLocaleDateString('en-US', {
                month: 'short',
            })} ${start.getDate()} - ${end.getDate()}`;
        }

        return `${start.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })} - ${end.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })}`;
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.productCard}>
            <AppImage
                source={item.photoUrl}
                width={70}
                height={70}
                borderRadius={8}
                style={{
                    borderRadius: 8
                }}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.row}>
                    <AppText style={styles.productName}
                        numberOfLines={1}
                    >{item.productName}</AppText>

                    <AppText style={styles.price}>${item.price}</AppText>
                </View>

                <AppText style={styles.small}>SKU: {item.skuCode}</AppText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View>
                        <AppText style={styles.small}>
                            SIZE
                        </AppText>
                        <AppText style={[styles.small, { color: color.textcolor, fontSize: 14 }]}>
                            {item.size}
                        </AppText>
                    </View>
                    <View>
                        <AppText style={styles.small}>
                            COLOR
                        </AppText>
                        <AppText style={[styles.small, { color: color.textcolor, fontSize: 14 }]}>
                            {item.color}
                        </AppText>
                    </View>
                </View>




                <AppText style={styles.small}>QTY</AppText>
                <AppText style={[styles.small, { color: color.textcolor, fontSize: 14 }]}>
                    {item.quantity}
                </AppText>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}

            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <AppImage
                        source={Logos.rightarrow}
                        width={22}
                        height={16}
                    />
                </TouchableOpacity>

                <AppText style={styles.headerTitle}>
                    Order #{orderdetaildata?.orderId}
                </AppText>
                <TouchableOpacity>
                    <AppImage
                        source={Icons.help}
                        width={20}
                        height={20}
                        tintColor={"#AB2C5D"}
                    />
                </TouchableOpacity>

            </View>


            {loading ?

                <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
                    <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
                </View> :

                <FlatList
                    data={orderdetaildata?.items}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            {/* Status */}

                            <View style={styles.card}>
                                <View style={styles.row}>
                                    <View>
                                        <View style={{
                                            height: 28,
                                            width: 107,
                                            backgroundColor: '#FD6C9C1A',
                                            borderRadius: 99,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            gap: 5
                                        }}>
                                            <AppImage
                                                source={Icons.truck}
                                                height={15}
                                                width={22}
                                                resizeMode='conatin'
                                            />
                                            <AppText style={styles.status}>
                                                {orderdetaildata?.status}
                                            </AppText>
                                        </View>


                                        <AppText style={styles.small}>
                                            Ordered on {" "}
                                            {orderdetaildata?.createdAt
                                                ? new Date(orderdetaildata.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                                : ""}
                                        </AppText>
                                    </View>

                                    <View>
                                        <AppText style={styles.small}>
                                            EST. DELIVERY
                                        </AppText>

                                        <AppText style={styles.delivery}>
                                            {formatDateRange(orderdetaildata?.formattedDeliveryDate)}
                                        </AppText>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('OrderStatus', { items: orderdetaildata, previousScreen: 'OrderDetails', })
                                    }}
                                    style={styles.trackBtn}>
                                    <AppText style={styles.trackText}>
                                        Track Journey →
                                    </AppText>
                                </TouchableOpacity>
                            </View>

                            {/* Agent */}

                            <View style={styles.card}>
                                <View style={styles.row}>
                                    <View style={styles.row}>
                                        <AppImage
                                            // source={orderdetaildata?.agent?.avatarUrl || Icons.agent}
                                            source={
                                                orderdetaildata?.agent?.avatarUrl
                                                    ? { uri: `https://shelynx.mediaclocksoft.com.au${orderdetaildata?.agent?.avatarUrl}` }
                                                    : Icons.agent
                                            }
                                            width={45}
                                            height={45}
                                            borderRadius={25}
                                            resizeMode='cover'
                                            style={{
                                                borderRadius: 25
                                            }}
                                        />

                                        <View style={{ marginLeft: 10 }}>
                                            <AppText style={styles.small}>
                                                Assigned Agent
                                            </AppText>

                                            <AppText style={[styles.productName, { fontSize: 14 }]}>
                                                {orderdetaildata?.agent?.name}
                                            </AppText>
                                        </View>
                                    </View>

                                    <TouchableOpacity

                                        onPress={() => {
                                            navigation.navigate('ChatScreen', { previousScreen: 'OrderDetails', conversation: orderdetaildata?.agent, order: orderdetaildata })
                                        }}
                                        style={styles.messageBtn}>
                                        <AppImage
                                            source={BottomIcons.library}
                                            height={15}
                                            width={15}
                                            resizeMode='contain'
                                            tintColor={"#AB2C5D"}
                                        />
                                        <AppText style={{ color: '#AB2C5D' }}>
                                            Message
                                        </AppText>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Address */}
                            {console.log(addressData, "dndkndek")}
                            <View style={styles.card}>
                                <AppText style={[styles.productName, { fontSize: 12, color: '#7F7478' }]}>
                                    Delivery Address
                                </AppText>

                                <AppText style={[styles.small, { color: color.textcolor, fontSize: 16 }]}>
                                    {addressData?.tag || ''}:
                                </AppText>


                                <AppText
                                    style={[
                                        styles.small,
                                        { color: color.textcolor, fontSize: 16 },
                                    ]}
                                >
                                    {`${addressData?.addressLine || ''}${addressData?.city ? `, ${addressData.city}` : ''
                                        }${addressData?.addressLine ? `, ${addressData.addressLine}` : ''
                                        }${addressData?.zipCode ? ` - ${addressData.zipCode}` : ''
                                        }`}
                                </AppText>
                            </View>

                            <View style={styles.row}>
                                <AppText style={styles.section}>
                                    Order Items
                                </AppText>

                                <AppText style={{ fontSize: 14, color: '#7F7478' }}>
                                    {orderdetaildata?.items?.length ?? 0} Items
                                </AppText>
                            </View>
                        </>
                    }
                    ListFooterComponent={
                        <>

                            <View style={styles.card}>
                                <AppText style={styles.section}>
                                    Payment Summary
                                </AppText>
                                <View style={styles.line} />
                                <Row title="Actual Price" value={`$${Number(orderdetaildata?.itemSubtotal + orderdetaildata?.totalPromotionalDiscount).toFixed(2)}`} />
                                {/* <Row
                                    title="Promotions/Coupons"
                                    value={`-$${orderdetaildata?.discountAmount}`}
                                    valueColor="green"
                                /> */}
                                <Row
                                    title="Total Promotional Discount"
                                    value={`-$${orderdetaildata?.totalPromotionalDiscount}`}
                                    valueColor="red"
                                />
                                <View style={styles.line} />
                                <Row title="Base Amount" value={`$${orderdetaildata?.itemSubtotal}`} />
                                <Row title="Delivery Fee" value={`$${orderdetaildata?.deliveryFee}`} />
                                <Row title="Custom Fee" value={`$${orderdetaildata?.customFee}`} />
                                {
                                    orderdetaildata?.status == 'APPROVED' ?
                                        <Row title="Total Weight" value={`${orderdetaildata?.totalWeight} KG`} /> : null}
                                {
                                    orderdetaildata?.status == 'APPROVED' ?
                                        <Row title="Shipping Rate" value={`$${orderdetaildata?.shippingFee}`} /> : null}
                                <View style={styles.line} />
                                <Row title="Net Amount" value={`$${Number(orderdetaildata?.itemSubtotal + orderdetaildata?.deliveryFee
                                    + orderdetaildata?.customFee + orderdetaildata?.shippingFee).toFixed(2)}`} />
                                {
                                    orderdetaildata?.status == 'APPROVED' ?
                                        <Row
                                            valueColor="green"
                                            title="Agent Surcharge" value={`+$${orderdetaildata?.agentSurcharge}`} />
                                        : null
                                }

                                {/* <Row title="SheLynx Service Fee" value={`+$${orderdetaildata?.serviceFee}`} /> */}





                                <View style={styles.line} />

                                {/* <Row
                            title="Total Amount"
                            value="$142.50"
                            bold
                        /> */}
                                <View style={styles.summaryRow}>
                                    <AppText
                                        style={{ color: color.textcolor, fontSize: 20, fontWeight: 600 }}
                                    >
                                        {"Total Amount"}
                                    </AppText>

                                    <AppText
                                        style={{ color: '#AB2C5D', fontSize: 24, fontWeight: 600 }}>
                                        {`$${orderdetaildata?.grandTotal.toFixed(2)}`}
                                    </AppText>
                                </View>
                            </View>

                            <AppText style={{ fontSize: 14, fontWeight: 500, color: '#7F7478', textAlign: 'center', marginBottom: 40 }}>
                                Payment Method{"  "}
                                <AppText style={{ fontSize: 14, fontWeight: 500, color: color.textcolor }}>
                                    Cash on Delivery ({orderdetaildata?.paymentMethod})
                                </AppText>
                            </AppText>

                        </>
                    }
                />
            }


        </SafeAreaView>
    );
};

const Row = ({
    title,
    value,
    valueColor,
    bold,
}: any) => (
    <View style={styles.summaryRow}>
        <AppText
            numberOfLines={2}
            style={[styles.small, bold && { fontWeight: '700', color: valueColor || '#7F7478', }]}>
            {title}
        </AppText>

        <AppText
            style={[
                styles.small,
                {
                    color: valueColor || color.textcolor,
                    fontWeight: bold ? '700' : '500',
                },
            ]}>
            {value}
        </AppText>
    </View>
);

export default OrderDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F6F6',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        //  paddingTop: 10

    },

    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#6B5A60',
    },

    card: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 15,
        marginBottom: 16,
        elevation: 3,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
    },

    status: {
        color: '#AB2C5D',
        fontWeight: '500',
        fontSize: 14
    },

    delivery: {
        color: '#AB2C5D',
        fontWeight: '600',
        fontSize: 20,
    },

    trackBtn: {
        marginTop: 15,
        backgroundColor: '#FFD1DC',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },

    trackText: {
        color: '#7A5761',
        fontWeight: '700',
        fontSize: 13
    },

    messageBtn: {
        backgroundColor: '#FCE4EC',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 5
    },

    section: {
        fontSize: 24,
        fontWeight: '700',
        color: '#AB2C5D',
        marginBottom: 15,
    },

    productCard: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        marginBottom: 15,
    },

    productName: {
        fontSize: 20,
        fontWeight: '700',
        color: color.textcolor,
    },

    price: {
        color: '#AB2C5D',
        fontSize: 18,
        fontWeight: '700',
    },

    small: {
        fontSize: 14,
        color: '#7F7478',
        marginTop: 4,
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },

    line: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 10,
    },
});