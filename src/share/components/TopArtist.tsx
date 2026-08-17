import React from 'react';

import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import AppText from './AppText';
import AppImage from './AppImage';
import { Images, Logo } from '../constants/media';
import { Inter } from '../constants/fonts';


interface Artist {
    id: string;
    name: string;
    image: string;
    songs: string;
}


interface Props {
    item: Artist;
    onPress?: (artist: Artist) => void;
}



const TopArtist = ({
    item,
    onPress
}: Props) => {


    return (

        <TouchableOpacity
            activeOpacity={0.8}
            style={styles.artistContainer}
            onPress={() => onPress?.(item)}
        >

            <View style={styles.imageWrapper}>

                <AppImage
                    resizeMode='cover'
                    source={Images.profile}
                    style={styles.artistImage}
                />

            </View>

            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 5, }}>


                <AppText
                    numberOfLines={1}
                    style={styles.artistName}
                >
                    {item.name}
                </AppText>
                <AppImage
                    source={Logo.Bluetick}
                    height={8}
                    width={8}
                    resizeMode='conatin'
                />
            </View>
            <AppText
                numberOfLines={1}
                style={[styles.artistName, { marginTop: 4 }]}
            >
                {item.songs}
            </AppText>
            <View style={{
                height: 18,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: '#201813',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 11,
                marginTop: 3
            }}>
                <AppText
                    numberOfLines={1}
                    color='#ffff'
                    fontSize={8}
                    style={{ includeFontPadding: false }}
                >
                    Popular
                </AppText>
            </View>


        </TouchableOpacity>

    );

};


export default TopArtist;



const styles = StyleSheet.create({

    artistContainer: {
        width: 82,
        alignItems: 'center',
        marginRight: 18,
        // alignSelf: 'center'
    },


    imageWrapper: {
        width: 57,
        height: 57,
        borderRadius: 35,
        overflow: 'hidden',
        backgroundColor: '#6D2C02',
        borderWidth: 1
    },


    artistImage: {
        width: '100%',
        height: '100%',
    },


    artistName: {
        //   marginTop: 5,
        color: '#fff',
        fontSize: 8,
        textAlign: 'center',
        fontFamily: Inter.medium
    },


});