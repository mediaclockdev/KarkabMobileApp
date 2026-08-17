import React from 'react';

import {
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import AppText from './AppText';
import { Banner, Images } from '../constants/media';
import { Inter } from '../constants/fonts';





const BannerCard = () => {


    return (

        <ImageBackground

            source={Banner.ArtistBanner}

            style={styles.container}
            resizeMode='contain'
            imageStyle={{
                borderRadius: 12,
                width: '100%',
                alignSelf: 'center'
            }}


        >


            <View style={styles.overlay}>


                <AppText style={styles.small}>
                    SUDANESE VOICES • OUR PRIDE
                </AppText>



                <AppText style={styles.title}>
                    Celebrate the artists
                    {"\n"}
                    who inspire us
                </AppText>



                <TouchableOpacity
                    style={styles.button}
                >

                    <AppText style={styles.buttonText}>
                        Explore Now
                    </AppText>

                </TouchableOpacity>


            </View>



        </ImageBackground>


    )

}



export default BannerCard;




const styles = StyleSheet.create({


    container: {
        height: 105,
        // marginHorizontal: 15,
        marginTop: 20,
        overflow: 'hidden',
        width: '100%',
        borderRadius: 12,
    },


    overlay: {
        flex: 1,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.35)'
    },


    small: {
        fontSize: 10,
        color: '#F6A202',
        fontWeight: '700',
        fontFamily: Inter.semibold
    },


    title: {
        marginTop: 0,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '700',
        color: '#fff',
        fontFamily: Inter.bold
    },


    button: {
        backgroundColor: '#FF383C',
        width: 75,
        height: 22,
        borderRadius: 5,
        marginTop: 5,

        alignItems: 'center',
        justifyContent: 'center'
    },


    buttonText: {
        fontSize: 10,
        color: '#fff',
        fontFamily: Inter.regular
    }



});