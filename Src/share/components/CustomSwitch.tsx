import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

interface Props {
    value: boolean;
    onChange: (value: boolean) => void;
}

const CustomSwitch = ({ value, onChange }: Props) => {
    const translateX = useRef(new Animated.Value(value ? 24 : 0)).current;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: value ? 24 : -4,
            useNativeDriver: true,
            friction: 8,
        }).start();
    }, [value]);

    return (
        <Pressable
            onPress={() => onChange(!value)}
            style={[
                styles.container,
                {
                    borderColor: value ? '#78555E' : '#E5E7EB',
                    borderWidth: 2
                },
            ]}
        >
            <Animated.View
                style={[
                    styles.circle,
                    {
                        transform: [
                            {
                                translateX,
                            },
                        ],

                        backgroundColor: value ? '#22C55E' : '#E5E7EB',
                    },
                ]}
            >
                {value && <View style={styles.check} />}
            </Animated.View>
        </Pressable>
    );
};

export default CustomSwitch;


const styles = StyleSheet.create({
    container: {
        width: 55,
        height: 28,
        borderRadius: 20,
        padding: 3,
        justifyContent: 'center',
    },

    circle: {
        width: 29,
        height: 29,
        borderRadius: 22,
        // backgroundColor: '#16A34A',
        justifyContent: 'center',
        alignItems: 'center',
    },

    check: {
        width: 10,
        height: 6,
        borderLeftWidth: 2.5,
        borderBottomWidth: 2.5,
        borderColor: '#fff',
        transform: [
            {
                rotate: '-45deg',
            },
        ],
        marginTop: -2,
    },
});