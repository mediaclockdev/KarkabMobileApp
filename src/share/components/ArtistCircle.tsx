import React from 'react';
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import AppText from './AppText';




interface ArtistCircleProps {
    item: {
        id: string;
        name: string;
        image: string;
    };
}


const ArtistCircle = ({ item }: ArtistCircleProps) => {

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={styles.container}
        >

            <Image
                source={{
                    uri: item.image,
                }}
                style={styles.image}
            />


            <AppText
                numberOfLines={1}
                style={styles.name}
            >
                {item.name}
            </AppText>


        </TouchableOpacity>
    );
};


export default ArtistCircle;



const styles = StyleSheet.create({

    container: {
        width: 85,
        alignItems: 'center',
        marginRight: 18,
    },


    image: {
        width: 72,
        height: 72,
        borderRadius: 40,
        marginBottom: 8,
    },


    name: {
        width: 80,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        color: '#222222',
    },

});
