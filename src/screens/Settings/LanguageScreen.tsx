
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import ApiService from '../../services/api';
import color from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import { Logo } from '../../share/constants/media';
import { changeLanguage } from '../../localization/changeLanguage';
import {
    LANGUAGE_LIST,
    AppLanguage,
} from '../../localization/supportLang';
import { showToast } from '../../auth/redux/authSlice';
import apiUrls from '../../services/apiUrls';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import LinearGradient from 'react-native-linear-gradient';



const LanguageScreen = () => {
    const navigation = useNavigation();
    const { i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const activeCode = i18n.language.split('-')[0] as AppLanguage;

    const [selectedLanguage, setSelectedLanguage] =
        useState<AppLanguage | null>(null);
    const [changingLanguage, setChangingLanguage] = useState(false);



    const confirmLanguageChange = async () => {
        if (!selectedLanguage || changingLanguage) return;

        setChangingLanguage(true);

        try {
            await handleSave(selectedLanguage);
        } finally {
            setChangingLanguage(false);
        }
    };
    const handleLanguageSelect = (code: AppLanguage) => {
        if (code === activeCode || changingLanguage) {
            return;
        }

        setSelectedLanguage(code);
    };



    const handleSave = async (codes: AppLanguage) => {
        const code = codes === 'en' ? 'english' : 'arabic';

        try {
            const response = await ApiService.put(
                `${apiUrls.profileApi}?language=${code}`,
                { language: code },
            );

            const data = (response as any)?.data;

            if (data?.success) {
                await changeLanguage(codes);

                setSelectedLanguage(null);

                dispatch(
                    showToast({
                        visible: true,
                        message: 'Language updated successfully.',
                        type: 'success',
                    }),
                );
            } else {
                dispatch(
                    showToast({
                        visible: true,
                        message: data?.message || 'Language failed to update.',
                        type: 'error',
                    }),
                );
            }
        } catch (error: any) {
            console.log(
                'UPDATE PROFILE ERROR:',
                error?.response?.data || error,
            );

            dispatch(
                showToast({
                    visible: true,
                    message:
                        error?.response?.data?.message ||
                        'Language failed to update.',
                    type: 'error',
                }),
            );
        }
    };



    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => (navigation as any).navigate('SettingScreen')}
                        style={styles.backButton}
                    >
                        <AppImage
                            source={Logo.arrowline}
                            height={25}
                            width={19}
                            resizeMode="cover"
                            tintColor="#FFFFFF"
                        />
                    </TouchableOpacity>

                    <View style={styles.headerText}>
                        <AppText style={styles.title}>
                            Language
                        </AppText>

                        <AppText style={styles.subtitle}>
                            Choose your preferred language
                        </AppText>
                    </View>
                </View>

                {/* Section */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        App Language
                    </AppText>
                </View>

                {/* Languages */}
                <View style={styles.languagesCard}>
                    {LANGUAGE_LIST.map((language, index) => {
                        const isSelected = language.code === activeCode;

                        return (
                            <React.Fragment key={language.code}>
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={() =>
                                        handleLanguageSelect(language.code)
                                    }
                                    style={styles.languageRow}
                                >
                                    {/* Icon */}
                                    <View
                                        style={[
                                            styles.iconBox,
                                            isSelected && styles.selectedIconBox,
                                        ]}
                                    >
                                        <AppText
                                            style={[
                                                styles.languageIcon,
                                                isSelected && styles.selectedIcon,
                                            ]}
                                        >
                                            {language.code === 'ar' ? 'ع' : 'A'}
                                        </AppText>
                                    </View>

                                    {/* Language */}
                                    <View style={styles.languageContent}>
                                        <AppText style={styles.languageTitle}>
                                            {language.label}
                                        </AppText>

                                        <AppText style={styles.languageCode}>
                                            {language.code.toUpperCase()}
                                        </AppText>
                                    </View>

                                    {/* Radio */}
                                    <View
                                        style={[
                                            styles.radio,
                                            isSelected && styles.radioSelected,
                                        ]}
                                    >
                                        {isSelected && (
                                            <View style={styles.radioInner} />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                {index < LANGUAGE_LIST.length - 1 && (
                                    <View style={styles.divider} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>

                {/* Information */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconBox}>
                        <AppText style={styles.infoIcon}>
                            i
                        </AppText>
                    </View>

                    <View style={styles.infoContent}>
                        <AppText style={styles.infoTitle}>
                            Language preference
                        </AppText>

                        <AppText style={styles.infoText}>
                            Your language preference will be used throughout
                            the app.
                        </AppText>
                    </View>
                </View>

            </View>
            <Modal
                visible={selectedLanguage !== null}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => {
                    if (!changingLanguage) setSelectedLanguage(null);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContainer,
                            { backgroundColor: color.darkbackround },
                        ]}
                    >
                        <View style={styles.modalIcon}>
                            <AppImage
                                source={Logo.language}
                                width={26}
                                height={26}
                                tintColor="#FFB300"
                            />
                        </View>

                        <AppText
                            color={color.darkthemetext}
                            fontSize={19}
                            fontFamily={Inter.medium}
                            style={styles.modalTitle}
                        >
                            Change Language?
                        </AppText>

                        <AppText
                            color="#A5A5A5"
                            fontSize={13}
                            style={styles.modalDescription}
                        >
                            Are you sure you want to change the app language?
                            The application will reload to apply the changes properly.
                        </AppText>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={changingLanguage}
                                onPress={() => setSelectedLanguage(null)}
                                style={styles.cancelButton}
                            >
                                <AppText
                                    color={color.darkthemetext}
                                    fontSize={13}
                                    fontFamily={Inter.medium}
                                >
                                    Cancel
                                </AppText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                disabled={changingLanguage}
                                onPress={confirmLanguageChange}
                                style={styles.confirmButton}
                            >
                                <LinearGradient
                                    colors={['#FFB300', '#F3870C', '#CF7D00']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.confirmGradient}
                                >
                                    <AppText
                                        color="#FFFFFF"
                                        fontSize={13}
                                        fontFamily={Inter.medium}
                                    >
                                        {changingLanguage ? 'Please wait...' : 'Confirm'}
                                    </AppText>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default LanguageScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: color.darkbackround,
    },

    container: {
        flex: 1,
        paddingHorizontal: 15,
    },

    /* Header */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },

    backButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 4,
        marginRight: 15,
    },

    headerText: {
        flex: 1,
    },

    title: {
        color: color.darkthemetext,
        fontSize: 22,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    subtitle: {
        marginTop: 2,
        color: '#FFF97E',
        fontSize: 12,
        fontFamily: Inter.regular,
    },

    /* Section */

    sectionHeader: {
        marginTop: 24,
        marginBottom: 10,
        paddingHorizontal: 2,
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    /* Card */

    languagesCard: {
        borderWidth: 1,
        borderColor: '#272727',
        borderRadius: 16,
        backgroundColor: '#050505',
        overflow: 'hidden',
    },

    languageRow: {
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },

    divider: {
        height: 1,
        backgroundColor: '#191919',
        marginLeft: 68,
    },

    /* Icon */

    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#17100A',
        borderWidth: 1,
        borderColor: '#5B3A0B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 13,
    },

    selectedIconBox: {
        backgroundColor: '#211505',
        borderColor: '#F6A202',
    },

    languageIcon: {
        color: '#777777',
        fontSize: 20,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    selectedIcon: {
        color: '#F6A202',
    },

    /* Text */

    languageContent: {
        flex: 1,
        justifyContent: 'center',
    },

    languageTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    languageCode: {
        color: '#777777',
        fontSize: 9,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    /* Radio */

    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: '#555555',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },

    radioSelected: {
        borderColor: '#F6A202',
    },

    radioInner: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: '#F6A202',
    },

    /* Info */

    infoCard: {
        marginTop: 18,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#272727',
        backgroundColor: '#0A0A0A',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    infoIconBox: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#17100A',
        borderWidth: 1,
        borderColor: '#5B3A0B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 11,
    },

    infoIcon: {
        color: '#F6A202',
        fontSize: 14,
        fontWeight: '700',
    },

    infoContent: {
        flex: 1,
    },

    infoTitle: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    infoText: {
        color: '#777777',
        fontSize: 9,
        lineHeight: 14,
        marginTop: 4,
        fontFamily: Inter.regular,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    modalContainer: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 22,
        paddingHorizontal: 22,
        paddingTop: 28,
        paddingBottom: 22,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#383838',
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
    },

    modalIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 179, 0, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 179, 0, 0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },

    modalTitle: {
        textAlign: 'center',
        marginBottom: 12,
    },

    modalDescription: {
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 26,
        paddingHorizontal: 4,
    },

    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginTop: 2,
    },

    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#454545',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1C1C1C',
    },

    confirmButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        overflow: 'hidden',
    },

    confirmGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },

});
