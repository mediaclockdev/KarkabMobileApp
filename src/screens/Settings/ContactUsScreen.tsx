import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import color from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import { Logo } from '../../share/constants/media';
import ApiService from '../../services/api';
import apiUrls from '../../services/apiUrls';

const ContactUsScreen = () => {
    const navigation = useNavigation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle) {
            Toast.show({
                type: 'error',
                position: 'bottom',
                bottomOffset: 80,
                text1: 'Please enter a subject',
            });
            return;
        }

        if (!trimmedDescription) {
            Toast.show({
                type: 'error',
                position: 'bottom',
                bottomOffset: 80,
                text1: 'Please describe your issue',
            });
            return;
        }

        try {
            setLoading(true);

            const response = await ApiService.post(apiUrls.contactus, {
                title: trimmedTitle,
                description: trimmedDescription,
            });

            const result = (response as any)?.data;

            if (result?.success === false) {
                throw new Error(result?.message || 'Failed to submit your request');
            }

            Toast.show({
                type: 'success',
                position: 'bottom',
                bottomOffset: 80,
                text1: 'Request submitted successfully',
                text2:
                    result?.message ||
                    'Thank you for contacting KarKab!',
            });

            setTitle('');
            setDescription('');

            // Optional: return to the previous screen after submission.
            // navigation.goBack();
        } catch (error: any) {
            console.log('CONTACT US ERROR:', error?.response?.data || error);

            Toast.show({
                type: 'error',
                position: 'bottom',
                bottomOffset: 80,
                text1: 'Unable to submit your request',
                text2:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.container}
                >
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
                                resizeMode="contain"
                                tintColor="#FFFFFF"
                            />
                        </TouchableOpacity>

                        <View style={styles.headerText}>
                            <AppText style={styles.headerTitle}>Contact Us</AppText>
                            <AppText style={styles.headerSubtitle}>
                                We are here to help you
                            </AppText>
                        </View>
                    </View>

                    {/* Intro card */}
                    <View style={styles.introCard}>
                        <View style={styles.mailIconBox}>
                            <AppText style={styles.mailIcon}>✉</AppText>
                        </View>

                        <AppText style={styles.introTitle}>
                            How can we help?
                        </AppText>

                        <AppText style={styles.introDescription}>
                            Having trouble with KarKab? Tell us what happened, and our team
                            will do its best to assist you.
                        </AppText>
                    </View>

                    {/* Contact form */}
                    <View style={styles.formCard}>
                        <AppText style={styles.sectionTitle}>
                            Send us a message
                        </AppText>

                        <AppText style={styles.fieldLabel}>
                            Subject <AppText style={styles.required}>*</AppText>
                        </AppText>

                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Audio playback issue"
                            placeholderTextColor="#777777"
                            style={styles.input}
                            maxLength={120}
                            returnKeyType="next"
                            editable={!loading}
                        />

                        <AppText style={styles.fieldLabel}>
                            Description <AppText style={styles.required}>*</AppText>
                        </AppText>

                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Please explain your issue in detail..."
                            placeholderTextColor="#777777"
                            style={[styles.input, styles.descriptionInput]}
                            multiline
                            textAlignVertical="top"
                            maxLength={2000}
                            editable={!loading}
                        />

                        <AppText style={styles.characterCount}>
                            {description.length}/2000 characters
                        </AppText>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.submitButton,
                                loading && styles.disabledButton,
                            ]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <AppText style={styles.submitButtonText}>
                                        Submit Request
                                    </AppText>
                                    <AppText style={styles.submitIcon}>➤</AppText>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Help footer */}
                    <View style={styles.footerCard}>
                        <AppText style={styles.footerIcon}>♫</AppText>

                        <View style={styles.footerContent}>
                            <AppText style={styles.footerTitle}>
                                Your music matters to us
                            </AppText>

                            <AppText style={styles.footerDescription}>
                                Thank you for helping us improve your KarKab experience.
                            </AppText>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    safeArea: {
        flex: 1,
        backgroundColor: color.darkbackround,
    },

    container: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
    },

    backButton: {
        width: 38,
        height: 42,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    headerText: {
        marginLeft: 10,
    },

    headerTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontFamily: Inter.medium,
        fontWeight: '700',
    },

    headerSubtitle: {
        color: '#F6A202',
        fontSize: 12,
        fontFamily: Inter.regular,
        marginTop: 4,
    },

    introCard: {
        backgroundColor: '#100C07',
        borderWidth: 1,
        borderColor: '#49300D',
        borderRadius: 18,
        padding: 20,
        marginTop: 12,
        alignItems: 'center',
    },

    mailIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#251707',
        borderWidth: 1,
        borderColor: '#6B430B',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    mailIcon: {
        color: '#F6A202',
        fontSize: 25,
    },

    introTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    introDescription: {
        color: '#A3A3A3',
        fontSize: 13,
        lineHeight: 21,
        fontFamily: Inter.regular,
        marginTop: 8,
        textAlign: 'center'
    },

    formCard: {
        backgroundColor: '#080808',
        borderWidth: 1,
        borderColor: '#292929',
        borderRadius: 18,
        padding: 18,
        marginTop: 20,
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        fontFamily: Inter.medium,
        marginBottom: 22,
    },

    fieldLabel: {
        color: '#EDEDED',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: Inter.medium,
        marginBottom: 9,
    },

    required: {
        color: '#FF4B5C',
    },

    input: {
        minHeight: 52,
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 12,
        backgroundColor: '#111111',
        paddingHorizontal: 14,
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: Inter.regular,
        marginBottom: 20,
    },

    descriptionInput: {
        height: 150,
        paddingTop: 14,
        paddingBottom: 14,
    },

    characterCount: {
        color: '#777777',
        fontSize: 10,
        fontFamily: Inter.regular,
        textAlign: 'right',
        marginTop: -12,
        marginBottom: 20,
    },

    submitButton: {
        minHeight: 52,
        backgroundColor: '#F6A202',
        borderRadius: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginTop: 4,
    },

    disabledButton: {
        opacity: 0.65,
    },

    submitButtonText: {
        color: '#090909',
        fontSize: 14,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    submitIcon: {
        color: '#090909',
        fontSize: 17,
        marginLeft: 10,
    },

    footerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#101010',
        borderWidth: 1,
        borderColor: '#252525',
        borderRadius: 15,
        padding: 16,
        marginTop: 20,
    },

    footerIcon: {
        color: '#F6A202',
        fontSize: 26,
        marginRight: 14,
    },

    footerContent: {
        flex: 1,
    },

    footerTitle: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    footerDescription: {
        color: '#888888',
        fontSize: 11,
        lineHeight: 17,
        fontFamily: Inter.regular,
        marginTop: 5,
    },
});