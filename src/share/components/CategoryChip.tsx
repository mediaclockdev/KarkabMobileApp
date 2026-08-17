import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import AppText from './AppText';

interface Props {
    title: string;
    selected: boolean;
    onPress: () => void;
}

const CategoryChip = ({ title, selected, onPress }: Props) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                selected && styles.active,
            ]}>
            <AppText
                style={[
                    styles.text,
                    selected && styles.activeText,
                ]}>
                {title}
            </AppText>
        </TouchableOpacity>
    );
};

export default CategoryChip;

const styles = StyleSheet.create({
    container: {
        height: 24,
        paddingHorizontal: 13,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#201813',
        marginLeft: 8,
        marginTop: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
    },

    active: {
        backgroundColor: '#FF383C',
        borderColor: '#FF383C',
    },

    text: {
        fontSize: 10,
        color: '#FFFFFF',
    },

    activeText: {
        color: '#FFFFFF',
    },
});