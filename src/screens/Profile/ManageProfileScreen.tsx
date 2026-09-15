import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import ApiService from '../../services/api';
import color from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import { Images } from '../../share/constants/media';
import { useNavigation } from '@react-navigation/native';
import apiUrls from '../../services/apiUrls';
import { showToast } from '../../auth/redux/authSlice';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { GlobalImage } from '../../share/utils/GlobalImage';
import DateTimePicker, {
    DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

const ManageProfileScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('Kareena');
    const [username, setUsername] = useState('@kareena');
    const [bio, setBio] = useState(
        'Music is my escape\nKaraoke is where I shine',
    );
    const [gender, setGender] = useState('Female');
    const dispatch = useAppDispatch();
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [showIOSDatePicker, setShowIOSDatePicker] = useState(false);
    const [email, setEmail] = useState('');
    const [showGender, setShowGender] = useState(false);
    const [createdAt, setCreatedAt] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // const handleSave = () => {
    //     Alert.alert(
    //         'Profile Updated',
    //         'Your profile has been updated successfully.',
    //     );
    // };
    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (saving) return;

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append('bio', bio.trim());
            formData.append('gender', gender.trim());

            if (dateOfBirth) {
                formData.append(
                    'date_of_birth',
                    formatDateForApi(dateOfBirth),
                );
            }

            const response = await ApiService.put(
                apiUrls.profileApi,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            const data = response.data;

            if (data?.success) {
                dispatch(
                    showToast({
                        visible: true,
                        message: 'Profile updated successfully.',
                        type: 'success',
                    }),
                );

                navigation.goBack();
            } else {
                dispatch(
                    showToast({
                        visible: true,
                        message: data?.message || 'Unable to update profile.',
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
                        'Unable to update profile.',
                    type: 'error',
                }),
            );
        } finally {
            setSaving(false);
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.profileApi);

            console.log('MANAGE PROFILE RESPONSE:', response.data);

            if (response.data?.success) {
                const user = response.data.user;

                setName(user?.name || '');
                setUsername(user?.username || '');
                setBio(user?.bio || '');
                setGender(user?.gender || '');
                setDateOfBirth(
                    parseDateOfBirth(user?.date_of_birth)
                );
                setEmail(user?.email || '');
                setCreatedAt(user?.created_at || '');
                setAvatarUrl(user?.avatar_url || '');
            }
        } catch (error) {
            console.log('FETCH PROFILE ERROR:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatMemberSince = (createdAt?: string) => {
        if (!createdAt) return '';

        const date = new Date(createdAt);

        if (isNaN(date.getTime())) return '';

        return `${date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        })}`;
    };



    const pickImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 1,
                selectionLimit: 1,
            },
            async response => {
                if (response.didCancel) {
                    console.log('Cancelled');
                    return;
                }

                if (response.errorCode) {
                    console.log(response.errorMessage);

                    dispatch(
                        showToast({
                            visible: true,
                            message: response.errorMessage || 'Unable to select image.',
                            type: 'error',
                        }),
                    );

                    return;
                }

                const asset = response.assets?.[0];

                if (!asset?.uri) {
                    dispatch(
                        showToast({
                            visible: true,
                            message: 'Unable to select image.',
                            type: 'error',
                        }),
                    );

                    return;
                }

                try {
                    const formData = new FormData();

                    formData.append('avatar', {
                        uri: asset.uri,
                        type: asset.type || 'image/jpeg',
                        name: asset.fileName || `profile_${Date.now()}.jpg`,
                    } as any);

                    const result = await ApiService.put(
                        apiUrls.profileApi,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        },
                    );

                    console.log(
                        result.data,
                        'UPDATE AVATAR RESPONSE',
                    );

                    if (result.data?.success) {
                        // Immediately update avatar on Profile screen
                        setAvatarUrl(
                            result.data?.user?.avatar_url ||
                            result.data?.avatar_url ||
                            prev?.avatar_url,
                        );

                        dispatch(
                            showToast({
                                visible: true,
                                message: 'Profile picture updated successfully.',
                                type: 'success',
                            }),
                        );

                        // Refresh complete profile data
                        fetchProfile();
                    } else {
                        dispatch(
                            showToast({
                                visible: true,
                                message:
                                    result.data?.message ||
                                    'Unable to update profile picture.',
                                type: 'error',
                            }),
                        );
                    }
                } catch (error: any) {
                    console.log(
                        'UPDATE AVATAR ERROR:',
                        error?.response?.data || error,
                    );

                    dispatch(
                        showToast({
                            visible: true,
                            message:
                                error?.response?.data?.message ||
                                'Unable to update profile picture.',
                            type: 'error',
                        }),
                    );
                }
            },
        );
    };


    const getInitials = (name?: string) => {
        return name
            ?.trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(word => word[0])
            .join('')
            .toUpperCase() || '';
    };

    const parseDateOfBirth = (value?: string): Date | null => {
        if (!value) return null;

        // Handles API format: YYYY-MM-DD
        const parts = value.split('-');

        if (parts.length === 3) {
            const year = Number(parts[0]);
            const month = Number(parts[1]);
            const day = Number(parts[2]);

            if (
                !isNaN(year) &&
                !isNaN(month) &&
                !isNaN(day)
            ) {
                return new Date(year, month - 1, day);
            }
        }

        const parsed = new Date(value);

        return isNaN(parsed.getTime()) ? null : parsed;
    };

    const formatDateOfBirth = (date: Date | null) => {
        if (!date) return 'Select date of birth';

        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDateForApi = (date: Date | null) => {
        if (!date) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const openDatePicker = () => {
        const currentDate = dateOfBirth || new Date();

        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: currentDate,
                mode: 'date',
                display: 'calendar',

                minimumDate: new Date(1900, 0, 1),
                maximumDate: new Date(),

                onValueChange: (event, selectedDate) => {
                    if (event.type === 'set' && selectedDate) {
                        setDateOfBirth(selectedDate);
                    }
                },
            });
        } else {
            setShowIOSDatePicker(true);
        }
    };

    const handleIOSDateChange = (
        event: any,
        selectedDate?: Date,
    ) => {
        if (event.type === 'set' && selectedDate) {
            setDateOfBirth(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.container}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <AppText style={styles.title}>
                                Manage Profile
                            </AppText>

                            <AppText style={styles.subtitle}>
                                Update your profile information
                            </AppText>
                        </View>

                        <TouchableOpacity
                            onPress={() => { navigation.navigate('SettingScreen') }}
                            style={styles.closeButton}
                            activeOpacity={0.8}
                        >
                            <AppText style={styles.closeText}>
                                ×
                            </AppText>
                        </TouchableOpacity>
                    </View>

                    {/* Profile Photo */}
                    <View style={styles.photoSection}>
                        <View style={styles.photoWrapper}>
                            {
                                avatarUrl ?
                                    <AppImage

                                        source={GlobalImage(avatarUrl)}

                                        style={styles.profileImage}
                                        resizeMode="cover"
                                    />
                                    :
                                    <AppText
                                        style={{
                                            fontSize: 42,
                                            fontWeight: '700',
                                            color: '#FFFFFF',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {getInitials(name)}
                                    </AppText>
                            }

                            <View style={styles.photoBorder} />

                            <TouchableOpacity
                                onPress={pickImage}
                                style={styles.cameraButton}
                                activeOpacity={0.8}
                            >
                                <AppText style={styles.cameraIcon}>
                                    ▣
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity activeOpacity={0.8}>
                            <AppText style={styles.changePhoto}>
                                Change Profile Photo
                            </AppText>
                        </TouchableOpacity>

                        <AppText style={styles.photoHint}>
                            JPG, PNG or JPEG • Max 5MB
                        </AppText>
                    </View>

                    {/* Basic Information */}
                    <View style={styles.sectionHeader}>
                        <AppText style={styles.sectionTitle}>
                            Basic Information
                        </AppText>
                    </View>

                    <View style={styles.formCard}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <AppText style={styles.label}>
                                Display Name
                            </AppText>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#555555"
                                    style={styles.input}
                                />
                            </View>
                        </View>

                        {/* Username */}
                        <View style={styles.inputGroup}>
                            <AppText style={styles.label}>
                                Username
                            </AppText>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={`@${name}`}
                                    onChangeText={setUsername}
                                    placeholder="@username"
                                    placeholderTextColor="#555555"
                                    autoCapitalize="none"
                                    style={styles.input}
                                />

                                <AppText style={styles.available}>
                                    ✓
                                </AppText>
                            </View>
                        </View>

                        {/* Bio */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <AppText style={styles.label}>
                                    Bio
                                </AppText>

                                <AppText style={styles.counter}>
                                    {bio.length}/120
                                </AppText>
                            </View>

                            <View
                                style={[
                                    styles.inputContainer,
                                    styles.bioContainer,
                                ]}
                            >
                                <TextInput
                                    value={bio}
                                    onChangeText={text => {
                                        if (text.length <= 120) {
                                            setBio(text);
                                        }
                                    }}
                                    placeholder="Tell us about yourself"
                                    placeholderTextColor="#555555"
                                    multiline
                                    textAlignVertical="top"
                                    style={[
                                        styles.input,
                                        styles.bioInput,
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Personal Information */}
                    <View style={styles.sectionHeader}>
                        <AppText style={styles.sectionTitle}>
                            Personal Information
                        </AppText>
                    </View>

                    <View style={styles.formCard}>
                        {/* Gender */}
                        <View style={styles.inputGroup}>
                            <AppText style={styles.label}>
                                Gender
                            </AppText>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.selectContainer}
                                onPress={() => {
                                    console.log(gender);
                                    setShowGender(!showGender)
                                }
                                }
                            >
                                <AppText style={styles.selectText}>
                                    {gender}
                                </AppText>

                                <AppText style={styles.selectArrow}>
                                    {showGender ? '⌃' : '⌄'}
                                </AppText>
                            </TouchableOpacity>

                            {showGender && (
                                <View style={styles.dropdown}>
                                    {[
                                        'Female',
                                        'Male',
                                        'Non-binary',
                                        'Prefer not to say',
                                    ].map(item => (
                                        <TouchableOpacity
                                            key={item}
                                            activeOpacity={0.7}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setGender(item);
                                                setShowGender(false);
                                            }}
                                        >
                                            <AppText
                                                style={[
                                                    styles.dropdownText,
                                                    gender === item &&
                                                    styles.activeDropdownText,
                                                ]}
                                            >
                                                {item}
                                            </AppText>

                                            {gender === item && (
                                                <AppText
                                                    style={
                                                        styles.check
                                                    }
                                                >
                                                    ✓
                                                </AppText>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Date of Birth */}
                        <View style={styles.inputGroup}>
                            <AppText style={styles.label}>
                                Date of Birth
                            </AppText>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.selectContainer}
                                onPress={openDatePicker}
                            >
                                <AppText
                                    style={[
                                        styles.selectText,
                                        !dateOfBirth && styles.placeholderText,
                                    ]}
                                >
                                    {formatDateOfBirth(dateOfBirth)}
                                </AppText>

                                <AppText style={styles.calendarIcon}>
                                    □
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Account Information */}
                    <View style={styles.sectionHeader}>
                        <AppText style={styles.sectionTitle}>
                            Account Information
                        </AppText>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <AppText style={styles.infoIconText}>
                                    @
                                </AppText>
                            </View>

                            <View style={styles.infoContent}>
                                <AppText style={styles.infoLabel}>
                                    Email Address
                                </AppText>

                                <AppText style={styles.infoValue}>
                                    {email}
                                </AppText>
                            </View>

                            <AppText style={styles.verified}>
                                ✓
                            </AppText>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <AppText style={styles.infoIconText}>
                                    #
                                </AppText>
                            </View>

                            <View style={styles.infoContent}>
                                <AppText style={styles.infoLabel}>
                                    Member Since
                                </AppText>

                                <AppText style={styles.infoValue}>
                                    {formatMemberSince(createdAt)}
                                </AppText>
                            </View>
                        </View>
                    </View>

                    {/* Privacy note */}
                    <View style={styles.privacyBox}>
                        <View style={styles.privacyIcon}>
                            <AppText style={styles.privacyIconText}>
                                i
                            </AppText>
                        </View>

                        <AppText style={styles.privacyText}>
                            Your personal information is private and
                            will only be visible according to your
                            privacy settings.
                        </AppText>
                    </View>

                    {/* Save */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={[
                            styles.saveButton,
                            saving && {
                                opacity: 0.6,
                            },
                        ]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <AppText style={styles.saveIcon}>
                            ✓
                        </AppText>

                        <AppText style={styles.saveText}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </AppText>
                    </TouchableOpacity>

                    {/* Cancel */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.cancelButton}
                    >
                        <AppText style={styles.cancelText}>
                            Cancel
                        </AppText>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {Platform.OS === 'ios' && (
                <Modal
                    visible={showIOSDatePicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowIOSDatePicker(false)}
                >
                    <View style={styles.datePickerOverlay}>
                        <View style={styles.datePickerContainer}>

                            <View style={styles.datePickerHeader}>
                                <AppText style={styles.datePickerTitle}>
                                    Date of Birth
                                </AppText>

                                <TouchableOpacity
                                    onPress={() => setShowIOSDatePicker(false)}
                                >
                                    <AppText style={styles.datePickerDone}>
                                        Done
                                    </AppText>
                                </TouchableOpacity>
                            </View>

                            <DateTimePicker
                                value={dateOfBirth || new Date(2000, 4, 12)}
                                mode="date"
                                display="spinner"
                                minimumDate={new Date(1900, 0, 1)}
                                maximumDate={new Date()}
                                onChange={handleIOSDateChange}
                                themeVariant="dark"
                            />

                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
};

export default ManageProfileScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: color.darkbackround,
    },

    flex: {
        flex: 1,
    },

    container: {
        paddingHorizontal: 15,
        paddingBottom: 100,
    },

    /* Header */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },

    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    subtitle: {
        color: '#FFF97E',
        fontSize: 12,
        marginTop: 2,
        fontFamily: Inter.regular,
    },

    closeButton: {
        width: 35,
        height: 35,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#5B3A0B',
        backgroundColor: '#0D0D0D',
        justifyContent: 'center',
        alignItems: 'center',
    },

    closeText: {
        color: '#F6A202',
        fontSize: 25,
        lineHeight: 25,
        fontWeight: '300',
    },

    /* Profile photo */

    photoSection: {
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 8,
    },

    photoWrapper: {
        width: 120,
        height: 120,
        position: 'relative',
        marginBottom: 12,
        justifyContent: 'center'
    },

    profileImage: {
        width: 112,
        height: 112,
        borderRadius: 56,
        position: 'absolute',
        left: 4,
        top: 4,
    },

    photoBorder: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#F2265B',
    },

    cameraButton: {
        position: 'absolute',
        right: -2,
        bottom: 1,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#090909',
        borderWidth: 1.5,
        borderColor: '#F6A202',
        justifyContent: 'center',
        alignItems: 'center',
    },

    cameraIcon: {
        color: '#F6A202',
        fontSize: 17,
    },

    changePhoto: {
        color: '#F6A202',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    photoHint: {
        color: '#5F5F5F',
        fontSize: 9,
        marginTop: 5,
        fontFamily: Inter.regular,
    },

    /* Sections */

    sectionHeader: {
        marginTop: 21,
        marginBottom: 10,
        paddingHorizontal: 2,
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: Inter.medium,
    },

    /* Form */

    formCard: {
        borderWidth: 1,
        borderColor: '#272727',
        borderRadius: 16,
        backgroundColor: '#050505',
        paddingHorizontal: 13,
        paddingVertical: 4,
    },

    inputGroup: {
        marginVertical: 9,
    },

    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    label: {
        color: '#D7D7D7',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 7,
        fontFamily: Inter.medium,
    },

    counter: {
        color: '#555555',
        fontSize: 9,
        marginBottom: 7,
        fontFamily: Inter.regular,
    },

    inputContainer: {
        minHeight: 46,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#30291F',
        backgroundColor: '#0C0C0C',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },

    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: Inter.regular,
        paddingVertical: 0,
    },

    available: {
        color: '#F6A202',
        fontSize: 15,
        marginLeft: 8,
    },

    bioContainer: {
        height: 82,
        alignItems: 'flex-start',
    },

    bioInput: {
        height: 70,
        paddingTop: 10,
        lineHeight: 19,
    },

    /* Select */

    selectContainer: {
        minHeight: 46,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#30291F',
        backgroundColor: '#0C0C0C',
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    selectText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: Inter.regular,
    },

    selectArrow: {
        color: '#F6A202',
        fontSize: 18,
    },

    calendarIcon: {
        color: '#F6A202',
        fontSize: 17,
    },

    /* Dropdown */

    dropdown: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#5B3A0B',
        borderRadius: 10,
        backgroundColor: '#101010',
        overflow: 'hidden',
    },

    dropdownItem: {
        minHeight: 42,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#202020',
    },

    dropdownText: {
        color: '#AAAAAA',
        fontSize: 11,
        fontFamily: Inter.regular,
    },

    activeDropdownText: {
        color: '#F6A202',
        fontWeight: '600',
    },

    check: {
        color: '#F6A202',
        fontSize: 14,
    },

    /* Account information */

    infoCard: {
        borderWidth: 1,
        borderColor: '#272727',
        borderRadius: 16,
        backgroundColor: '#050505',
        paddingHorizontal: 12,
    },

    infoRow: {
        minHeight: 66,
        flexDirection: 'row',
        alignItems: 'center',
    },

    infoIcon: {
        width: 39,
        height: 39,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#5B3A0B',
        backgroundColor: '#17100A',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    infoIconText: {
        color: '#F6A202',
        fontSize: 17,
        fontWeight: '600',
    },

    infoContent: {
        flex: 1,
    },

    infoLabel: {
        color: '#777777',
        fontSize: 9,
        fontFamily: Inter.regular,
    },

    infoValue: {
        color: '#FFFFFF',
        fontSize: 11,
        marginTop: 4,
        fontFamily: Inter.medium,
    },

    verified: {
        color: '#F6A202',
        fontSize: 16,
    },

    divider: {
        height: 1,
        backgroundColor: '#191919',
    },

    /* Privacy */

    privacyBox: {
        marginTop: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#493516',
        backgroundColor: '#100D08',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    privacyIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F6A202',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 9,
    },

    privacyIconText: {
        color: '#F6A202',
        fontSize: 11,
        fontWeight: '700',
    },

    privacyText: {
        flex: 1,
        color: '#8B8B8B',
        fontSize: 9,
        lineHeight: 14,
        fontFamily: Inter.regular,
    },

    /* Buttons */

    saveButton: {
        height: 51,
        borderRadius: 13,
        backgroundColor: '#F3870C',
        marginTop: 21,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    saveIcon: {
        color: '#090909',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    },

    saveText: {
        color: '#090909',
        fontSize: 13,
        fontWeight: '700',
        fontFamily: Inter.medium,
    },

    cancelButton: {
        height: 45,
        marginTop: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },

    cancelText: {
        color: '#777777',
        fontSize: 11,
        fontFamily: Inter.medium,
    },
    placeholderText: {
        color: '#555555',
    },

    datePickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },

    datePickerContainer: {
        backgroundColor: '#101010',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 25,
    },

    datePickerHeader: {
        height: 55,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#272727',
    },

    datePickerTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: Inter.medium,
    },

    datePickerDone: {
        color: '#F6A202',
        fontSize: 13,
        fontFamily: Inter.medium,
        fontWeight: '600',
    },
});
