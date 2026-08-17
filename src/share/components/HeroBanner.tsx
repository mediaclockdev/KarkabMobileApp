import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    ImageBackground,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import AppText from './AppText';
import AppImage from './AppImage';
import { Banner } from '../constants/media';
import { Inter } from '../constants/fonts';

interface Props {
    onPress?: () => void;
}

const HeroBanner = ({ onPress }: Props) => {
    return (
        <ImageBackground
            source={Banner.br1banner}
            imageStyle={styles.image}
            style={styles.container}>
            {/* <LinearGradient
                colors={[
                    'rgba(20,12,0,.95)',
                    'rgba(112,58,0,.88)',
                    'rgba(0,0,0,.45)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.overlay}> */}
            <View style={styles.left}>
                <AppText style={styles.smallTitle}>
                    THE SOUL OF SUDAN
                </AppText>

                <AppText style={styles.title}>
                    Relive the golden
                </AppText>

                <AppText style={styles.title}>
                    era of Sudanese music
                </AppText>

                <AppText style={styles.subtitle}>
                    Timeless classics that live forever
                </AppText>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPress}
                    style={styles.button}>
                    <AppText style={styles.playIcon}>▶</AppText>

                    <AppText style={styles.buttonText}>
                        Play Collection
                    </AppText>
                </TouchableOpacity>
            </View>

            {/* <View style={styles.right}>
                    <AppImage
                        source={{
                            uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
                        }}
                        width={150}
                        height={180}
                        borderRadius={0}
                        resizeMode="cover"
                    />
                </View> */}
            {/* </LinearGradient> */}
        </ImageBackground>
    );
};

export default HeroBanner;

const styles = StyleSheet.create({
    container: {
        height: 150,
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 10,
        padding: 20
    },

    image: {
        borderRadius: 18,
    },

    overlay: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingVertical: 18,
        justifyContent: 'space-between',
    },

    left: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 10,
    },

    right: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },

    smallTitle: {
        color: '#FFC341',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 8,
    },

    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 20,
    },

    subtitle: {
        color: '#DDD',
        fontSize: 10,
        marginTop: 10,
        marginBottom: 18,
    },

    button: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#FF6A45',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 5,
    },

    playIcon: {
        color: '#FFF',
        marginRight: 8,
        fontSize: 12,
    },

    buttonText: {
        color: '#FFF',
        //fontWeight: '700',
        fontSize: 10,
        fontFamily: Inter.regular
    },
});