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
import { useNavigation } from '@react-navigation/native';





const BannerCard = () => {

    const navigation = useNavigation();
    return (

        <ImageBackground

            source={Banner.ArtistBanner}

            style={styles.container}
            resizeMode='cover'
            imageStyle={{
                borderRadius: 12,
                width: '100%',
                alignSelf: 'center',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
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
                    onPress={() => {
                        (navigation as any).navigate('AllArtistScreen', { previousScreen: 'ArtistScreen' })
                    }}
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
        height: 145,
        // marginHorizontal: 15,
        marginTop: 30,
        overflow: 'hidden',
        width: '100%',
        borderRadius: 12,
    },


    overlay: {
        flex: 1,
        padding: 25,
        backgroundColor: 'rgba(0,0,0,0.35)'
    },


    small: {
        fontSize: 10,
        color: '#F6A202',
        fontWeight: '700',
        fontFamily: Inter.semibold,
        marginBottom: 10
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