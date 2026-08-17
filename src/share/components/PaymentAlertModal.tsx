import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import AppText from './AppText';
import AppImage from './AppImage';
import { Icons } from '../constants/media';
import { color } from '../constants/color';

interface PaymentAlertModalProps {
    visible: boolean;
    title?: string;
    message: string;
    cancelText?: string;
    confirmText?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

const PaymentAlertModal = ({
    visible,
    title = 'Proceed to Payment',
    message,
    cancelText = 'Later',
    confirmText = 'Continue',
    onCancel,
    onConfirm,
}: PaymentAlertModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconView}>
                        <AppImage
                            source={Icons.confirm}
                            width={36}
                            height={36}
                            resizeMode="contain"
                        />
                    </View>

                    <AppText
                        fontSize={22}
                        fontWeight={700}
                        color={color.textcolor}
                        marginTop={20}
                    >
                        {title}
                    </AppText>

                    <AppText
                        fontSize={15}
                        color="#76646B"
                        style={styles.message}
                    >
                        {message}
                    </AppText>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                        >
                            <AppText
                                fontSize={16}
                                fontWeight={600}
                                color="#78555E"
                            >
                                {cancelText}
                            </AppText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={onConfirm}
                        >
                            <AppText
                                fontSize={16}
                                fontWeight={600}
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

export default PaymentAlertModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        width: '100%',
        backgroundColor: color.white,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    iconView: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FCE4EC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 30,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#7A5761',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        backgroundColor: color.btncolor,
        justifyContent: 'center',
        alignItems: 'center',
    },
});