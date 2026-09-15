
import React from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import AppImage from './AppImage';
import AppText from './AppText';
import color, { useAppColors } from '../constants/color';
import { Images, Logo } from '../constants/media';
import { Inter } from '../constants/fonts';

export type AlertType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'confirm';

interface AppAlertModalProps {
    visible: boolean;
    type?: AlertType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
}

const alertConfig = {
    success: {
        icon: Images.tick,
        iconBg: '#1F1712',
        iconTint: '#D49A5C',
    },

    error: {
        icon: Logo.tick,
        iconBg: '#251313',
        iconTint: '#FF4B4C',
    },

    warning: {
        icon: Logo.tick,
        iconBg: '#251D12',
        iconTint: '#FCC378',
    },

    info: {
        icon: Logo.tick,
        iconBg: '#121C25',
        iconTint: '#6DB7FF',
    },

    confirm: {
        icon: Logo.Bluetick,
        iconBg: '#24151B',
        iconTint: '#FF4B4C',
    },
};

const AppAlertModal = ({
    visible,
    type = 'confirm',
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    onConfirm,
    onCancel,
}: AppAlertModalProps) => {
    const colors = useAppColors();

    const config = alertConfig[type];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: colors.darkgray,
                            borderColor: colors.homebordercolor,
                        },
                    ]}
                >
                    {/* Icon */}
                    <View
                        style={[
                            styles.iconView,
                            {
                                backgroundColor: config.iconBg,
                                borderColor: config.iconTint,
                            },
                        ]}
                    >
                        <AppImage
                            source={config.icon}
                            width={30}
                            height={30}
                            resizeMode="contain"
                            tintColor={config.iconTint}
                        />
                    </View>

                    {/* Title */}
                    <AppText
                        fontSize={19}
                        fontFamily={Inter.semibold}
                        color={colors.darkthemetext}
                        style={styles.title}
                    >
                        {title}
                    </AppText>

                    {/* Message */}
                    <AppText
                        fontSize={14}
                        color="#B9A9AE"
                        fontFamily={Inter.regular}
                        style={styles.message}
                    >
                        {message}
                    </AppText>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        {showCancel && (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.cancelButton,
                                    {
                                        borderColor: colors.homebordercolor,
                                    },
                                ]}
                                onPress={onCancel}
                            >
                                <AppText
                                    fontSize={14}
                                    fontFamily={Inter.semibold}
                                    color={colors.darkthemetext}
                                >
                                    {cancelText}
                                </AppText>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.confirmWrapper,
                                {
                                    flex: showCancel ? 1 : undefined,
                                    width: showCancel ? undefined : '100%',
                                },
                            ]}
                            onPress={onConfirm}
                        >
                            <LinearGradient
                                colors={[
                                    '#FF9A01',
                                    '#CF7D00',
                                    '#A96600',
                                ]}
                                start={{ x: 0.15, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.confirmButton}
                            >
                                <AppText
                                    fontSize={14}
                                    fontFamily={Inter.semibold}
                                    color="#FFFFFF"
                                >
                                    {confirmText}
                                </AppText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AppAlertModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.72)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    container: {
        width: '88%',
        maxWidth: 390,
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 22,
        paddingVertical: 24,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12,
    },

    iconView: {
        width: 62,
        height: 62,
        borderRadius: 31,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },

    title: {
        textAlign: 'center',
        marginTop: 18,
    },

    message: {
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 21,
        paddingHorizontal: 5,
    },

    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 22,
        gap: 10,
    },

    cancelButton: {
        flex: 1,
        height: 44,
        borderRadius: 11,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },

    confirmWrapper: {
        height: 44,
        borderRadius: 11,
        overflow: 'hidden',
    },

    confirmButton: {
        flex: 1,
        height: 44,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

