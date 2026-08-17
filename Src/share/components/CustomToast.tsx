import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import color from '../constants/color';

interface Props {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onHide: () => void;
}

const colors = {
    success: '#FCE4EC',
    error: '#FCE4EC',
    warning: '#F59E0B',
    info: '#FCE4EC',
};

const CustomToast = ({
    visible,
    message,
    type = 'success',
    duration = 2500,
    onHide,
}: Props) => {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) return;

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 100,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onHide();
            });
        }, duration);

        return () => clearTimeout(timer);
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: colors[type],
                    opacity,
                    transform: [{ translateY }],
                },
            ]}>
            <Text style={styles.title}>
                {type === 'success'
                    ? 'Success ✓'
                    : type === 'error'
                        ? 'Error ✕'
                        : type === 'warning'
                            ? 'Warning ⚠'
                            : 'Info ℹ'}
            </Text>

            <Text style={styles.text}>{message}...</Text>
        </Animated.View>
    );
};

export default CustomToast;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        left: 16,
        right: 16,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        zIndex: 9999,
    },
    text: {
        color: color.btntextcolor,
        fontSize: 13,
        fontWeight: '400',
    },
    title: {
        color: '#8B0E45',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
});