import React from 'react';
import {
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import AppImage from './AppImage';
import AppText from './AppText';
import { Images, Logo } from '../constants/media';
import { Inter } from '../constants/fonts';




interface Band {
    id: string;
    name: string;
    songs: string;
    image: string;
}


interface Props {
    item: Band;
}


const BandCard = ({ item }: Props) => {

    return (

        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.8}
        >

            <ImageBackground
                source={Images.b2moodbanner}
                style={styles.image}
            >


                <View style={styles.info}>
                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                        <AppText style={styles.name}>
                            {item.name}
                        </AppText>

                        <AppImage
                            source={Logo.Bluetick}
                            height={8}
                            width={8}
                            resizeMode='conatin'
                        />
                    </View>



                    <AppText style={styles.songs}>
                        {item.songs}
                    </AppText>

                </View>
            </ImageBackground>

        </TouchableOpacity>

    );
};


export default BandCard;



const styles = StyleSheet.create({

    container: {
        width: 160,
        marginRight: 15,
        // backgroundColor: '#171717',
        borderRadius: 8,
        overflow: 'hidden',
        height: 100
    },


    image: {
        width: '100%',
        height: '100%',
        // alignItems: 'flex-end',
        justifyContent: 'flex-end'
    },


    info: {
        padding: 12,
        //  alignSelf: 'flex-end'
    },


    name: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        fontFamily: Inter.semibold
    },


    songs: {
        marginTop: 2,
        color: '#B4B1AD',
        fontSize: 8,
    },


});