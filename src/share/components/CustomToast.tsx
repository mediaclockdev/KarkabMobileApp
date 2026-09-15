
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    View,
    TouchableOpacity,
} from 'react-native';

import AppText from './AppText';
import { useAppColors } from '../constants/color';
import { Inter } from '../constants/fonts';

interface Props {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onHide: () => void;
}

const CustomToast = ({
    visible,
    message,
    type = 'success',
    duration = 2500,
    onHide,
}: Props) => {
    const color = useAppColors();

    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 100,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            return;
        }

        // Reset before showing
        translateY.setValue(100);
        opacity.setValue(0);

        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                tension: 70,
                friction: 8,
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
            ]).start(({ finished }) => {
                if (finished) {
                    onHide();
                }
            });
        }, duration);

        return () => clearTimeout(timer);
    }, [visible, duration, onHide, opacity, translateY]);

    if (!visible) {
        return null;
    }

    const toastConfig = {
        success: {
            title: 'Success',
            icon: '✓',
            accent: color.mgyellow,
        },
        error: {
            title: 'Error',
            icon: '✕',
            accent: '#E53935',
        },
        warning: {
            title: 'Warning',
            icon: '⚠',
            accent: '#F59E0B',
        },
        info: {
            title: 'Info',
            icon: 'ⓘ',
            accent: color.mgred,
        },
    };

    const current = toastConfig[type];

    return (
        <View pointerEvents="box-none" style={styles.wrapper}>
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: color.darkbackround,
                        borderColor: color.homebordercolor,
                        opacity,
                        transform: [{ translateY }],
                        shadowColor: color.mgred,
                    },
                ]}
            >
                {/* Accent line */}
                <View
                    style={[
                        styles.accent,
                        {
                            backgroundColor: current?.accent,
                        },
                    ]}
                />

                <View style={styles.content}>
                    {/* Icon */}
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                backgroundColor: `${current?.accent}20`,
                            },
                        ]}
                    >
                        <AppText
                            color={current?.accent}
                            fontSize={16}
                            fontWeight="600"
                            fontFamily={Inter.semibold}
                        >
                            {current?.icon}
                        </AppText>
                    </View>

                    {/* Message */}
                    <View style={styles.messageContainer}>
                        <AppText
                            color={color.darkthemetext}
                            fontSize={14}
                            fontWeight="600"
                            fontFamily={Inter.semibold}
                        >
                            {current.title}
                        </AppText>

                        <AppText
                            color={color.darkthemetext}
                            fontSize={12}
                            fontWeight="400"
                            fontFamily={Inter.regular}
                            numberOfLines={3}
                        >
                            {message}
                        </AppText>
                    </View>

                    {/* Close */}
                    <TouchableOpacity
                        onPress={onHide}
                        activeOpacity={0.7}
                        style={styles.closeButton}
                    >
                        <AppText
                            color={color.darkthemetext}
                            fontSize={16}
                            fontWeight="500"
                            fontFamily={Inter.medium}
                        >
                            ×
                        </AppText>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

export default CustomToast;

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 25,
        zIndex: 99999,
        elevation: 999,
        alignItems: 'center',
    },

    container: {
        width: '92%',
        minHeight: 65,
        borderRadius: 14,
        borderWidth: 1,

        overflow: 'hidden',

        elevation: 8,

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.25,
        shadowRadius: 8,
    },

    accent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },

    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingLeft: 14,
        paddingRight: 8,
    },

    iconContainer: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    messageContainer: {
        flex: 1,
        gap: 2,
    },

    closeButton: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
});

