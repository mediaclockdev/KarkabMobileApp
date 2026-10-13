
import React from 'react';
import {
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

const LanguageScreen = () => {
    const navigation = useNavigation();
    const { i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const activeCode = i18n.language.split('-')[0] as AppLanguage;

    const handleLanguageSelect = async (code: AppLanguage) => {
        if (code === activeCode) {
            return;
        }

        try {
            handleSave(code);


        } catch (error) {
            console.log('Language change error:', error);
        }
    };



    const handleSave = async (codes: AppLanguage) => {
        const code = codes === 'en' ? 'english' : 'arabic';

        try {
            const response = await ApiService.put(
                `${apiUrls.profileApi}?language=${code}`,
                {
                    language: code
                },
            );

            const data = (response as any)?.data;

            console.log(code, data, 'llll');

            if (data?.success) {
                dispatch(
                    showToast({
                        visible: true,
                        message: 'Language updated successfully.',
                        type: 'success',
                    }),
                );

                await changeLanguage(codes);
            } else {
                dispatch(
                    showToast({
                        visible: true,
                        message:
                            data?.message || 'Language failed to update.',
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
                        onPress={() => navigation.goBack()}
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
});
