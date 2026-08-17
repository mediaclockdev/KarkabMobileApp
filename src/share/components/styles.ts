import { StyleSheet } from 'react-native';


export const COLORS = {

    primary: '#111111',

    background: '#FFFFFF',

    card: '#F8F8F8',

    text: '#111111',

    textLight: '#666666',

    textMuted: '#999999',

    white: '#FFFFFF',

    border: '#EEEEEE',

};



export const SPACING = {

    xs: 5,

    sm: 10,

    md: 15,

    lg: 20,

    xl: 30,

};



export const FONT = {

    small: 12,

    regular: 14,

    medium: 16,

    large: 20,

    title: 32,

};



export const commonStyles = StyleSheet.create({

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },


    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },


    shadow: {

        shadowColor: '#000',

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.08,

        shadowRadius: 8,

        elevation: 3,

    },

});