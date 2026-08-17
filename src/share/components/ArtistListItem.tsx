import React from 'react';

import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';

import { Icons, Images } from '../constants/media';
import { Inter } from '../constants/fonts';


interface Artist {

    id: string;
    name: string;
    genre: string;
    followers: string;
    image: string;

}


interface Props {

    item: Artist;
    onPress?: () => void;

}



const ArtistListItem = ({
    item,
    onPress
}: Props) => {


    return (

        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.container}
            onPress={onPress}
        >


            <View style={styles.left}>

                <AppImage
                    source={Images.profile}
                    style={styles.image}
                />


                <View style={styles.info}>

                    <AppText style={styles.name}>
                        {item.name}
                    </AppText>


                    {/* <AppText style={styles.genre}>
                        {item.genre}
                    </AppText> */}


                    <AppText style={styles.followers}>
                        12.5K songs . 1.2 M listener
                    </AppText>


                </View>


            </View>



            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10
                }}
            //  style={styles.followButton}
            >



                <AppImage
                    source={Images.like}
                    height={12}
                    width={13}
                />

                <AppImage
                    source={Images.arrow}
                    height={8}
                    width={5}
                    tintColor={"#F6A202"}
                />


            </TouchableOpacity>


        </TouchableOpacity>

    )

}



export default ArtistListItem;



const styles = StyleSheet.create({

    container: {

        height: 47,
        //  marginHorizontal: 10,
        marginBottom: 14,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        backgroundColor: '#0E0E10',

        borderRadius: 12,

        paddingHorizontal: 14,

    },


    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },



    image: {

        width: 36,
        height: 36,
        borderRadius: 31,
        borderWidth: 2,
        borderColor: '#6D2C02'

    },



    info: {

        marginLeft: 14,

    },


    name: {

        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: Inter.medium

    },


    genre: {

        marginTop: 4,
        fontSize: 13,
        color: '#777',

    },


    followers: {

        marginTop: 3,
        fontSize: 8,
        color: '#6B7280',

    },



    followButton: {

        height: 34,
        paddingHorizontal: 18,

        borderRadius: 18,

        backgroundColor: '#111',

        justifyContent: 'center',
        alignItems: 'center',

    },



    followText: {

        color: '#fff',
        fontSize: 13,
        fontWeight: '600',

    },


});