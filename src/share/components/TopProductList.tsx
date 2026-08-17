import React from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';

import AppText from './AppText';
import AppImage from './AppImage';
import color from '../constants/color';
import { Banners, Icons } from '../constants/media';
import { GlobalImage } from '../utils/GlobalImage';

const DATA = [
    {
        id: '1',
        title: 'Classic Belted Trench',
        price: '$42.00',
        image:
            Banners.banner,
    },
    {
        id: '2',
        title: 'Denim Jacket',
        price: '$55.00',
        image:
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
    },
    {
        id: '3',
        title: 'Denim Jacket',
        price: '$55.00',
        image:
            Banners.bagimage,
    },
];

export default function TopProductList() {
    return (
        <View style={styles.container}>
            <FlatList
                data={DATA}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    return (
                        <View style={styles.card}>

                            <ImageBackground
                                source={
                                    typeof item.image === 'string'
                                        ? { uri: item.image }
                                        : item.image
                                }
                                style={styles.imageBackground}
                                imageStyle={styles.imageStyle}
                                resizeMode="cover">

                            </ImageBackground>



                            <View style={{ padding: 10 }}>

                                <AppText
                                    numberOfLines={2} style={styles.title}
                                >
                                    {item.title}
                                </AppText>


                                <View style={styles.bottomRow}>
                                    <AppText
                                        numberOfLines={2} style={styles.price}
                                    >
                                        {item.price}
                                    </AppText>


                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' }}>

                                        <AppImage
                                            source={Icons.star}
                                            height={10}
                                            width={10}
                                            resizeMode='contain'

                                        />
                                        <AppText

                                            fontSize={12}
                                            color={color.textcolor}
                                            fontWeight={"700"}
                                        >
                                            {4.9}
                                        </AppText>

                                    </View>
                                </View>


                            </View>

                            <TouchableOpacity style={{
                                height: 40,
                                width: 135,
                                backgroundColor: color.btncolor,
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                borderRadius: 8,
                                marginBottom: 15
                            }}>
                                <AppText fontSize={16} color='#78555E'>
                                    {"Add to Cart"}
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    );
                }}

                ListEmptyComponent={() => (
                    <View
                        style={{
                            width: Dimensions.get('window').width - 20,
                            height: 80,
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}>
                        <AppText fontSize={12} color={color.textcolor}>[ No Product found ]</AppText>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },

    card: {
        width: 167,
        backgroundColor: color.white,
        borderRadius: 18,
        // padding: 12,
        marginRight: 11,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 4,
        margin: 5,
        overflow: 'hidden'
    },
    tag: {
        fontSize: 10,
        fontWeight: '700',
        color: '#7A5761',
        //  marginBottom: 10,

    },
    imageContainer: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red'
    },
    image: {
        width: 95,
        height: 140,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: color.textcolor,
        marginTop: 10,
    },
    bottomRow: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: color.textcolor,
    },
    plusBtn: {
        width: 17,
        height: 17,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#795D63',
        justifyContent: 'center',
        alignItems: 'center',
    },
    plus: {
        fontSize: 11,
        color: '#795D63',
        fontWeight: '900',
        includeFontPadding: false,
        textAlign: 'center'
    },
    imageBackground: {
        width: '100%',
        height: 250,
        // padding: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },

    imageStyle: {
        resizeMode: 'cover',
        width: '100%'
    },

    badge: {
        width: 99,
        height: 23,
        borderRadius: 99,
        backgroundColor: '#FFD1DC',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },



});











