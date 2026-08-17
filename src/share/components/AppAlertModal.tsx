import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';
import { color } from '../constants/color';
import { Icons } from '../constants/media';
import { useSelector } from 'react-redux';

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
        icon: Icons.tick,
        iconBg: '#16A34A',
        buttonColor: '#16A34A',
    },
    error: {
        icon: Icons.info,
        iconBg: '#FDECEC',
        buttonColor: '#DC3545',
    },
    warning: {
        icon: Icons.info,
        iconBg: '#FFF8E6',
        buttonColor: '#F4A100',
    },
    info: {
        icon: Icons.info,
        iconBg: '#E8F4FF',
        buttonColor: '#0D6EFD',
    },
    confirm: {
        icon: Icons.confirm,
        iconBg: '#FCE4EC',
        buttonColor: color.btncolor,
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
    const config = alertConfig[type];

    //   const alert = useSelector(
    //       (state: any) => state.auth.alert
    //     );


    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View
                        style={[
                            styles.iconView,
                            {
                                //backgroundColor: config.iconBg,
                                backgroundColor: '#FFD1DC'
                            },
                        ]}>
                        <AppImage
                            source={config.icon}
                            width={38}
                            height={38}
                            resizeMode="contain"
                        />
                    </View>

                    <AppText
                        fontSize={20}
                        fontWeight={700}
                        color={color.textcolor}
                        marginTop={20}>
                        {title}
                    </AppText>

                    <AppText
                        fontSize={14}
                        color="#6B5A60"
                        style={styles.message}>
                        {message}
                    </AppText>

                    <View style={styles.buttonRow}>
                        {showCancel && (
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onCancel}>
                                <AppText
                                    fontSize={14}
                                    fontWeight={600}
                                    color="#78555E">
                                    {cancelText}
                                </AppText>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                {
                                    // backgroundColor: config.buttonColor,
                                    backgroundColor: '#FFD1DC',
                                    flex: showCancel ? 1 : undefined,
                                    width: showCancel ? undefined : '100%',
                                },
                            ]}
                            onPress={onConfirm}>
                            <AppText
                                fontSize={14}
                                fontWeight={600}
                                //  color={color.white}
                                color={'#7A5761'}
                            >
                                {confirmText}
                            </AppText>
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
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    container: {
        width: '82%',
        backgroundColor: color.white,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center',
    },

    iconView: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },

    message: {
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },

    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 20,
        gap: 10,
    },

    cancelButton: {
        flex: 1,
        height: 42,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#78555E',
        justifyContent: 'center',
        alignItems: 'center',
    },

    confirmButton: {
        height: 42,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});