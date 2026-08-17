import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import color from '../../share/constants/color';
import { Icons, Logos } from '../../share/constants/media';
import apiUrls, { BASE_URL } from '../../services/apiUrls';
import ApiService from '../../services/api';
import { launchImageLibrary } from 'react-native-image-picker';
import { GlobalImage } from '../../share/utils/GlobalImage';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { showToast } from '../../auth/redux/authSlice';
import DatePicker from 'react-native-date-picker';
import CountryPicker from '../../share/components/CountryPicker';
import CountryPicker1 from '../../share/components/CountryPicker1';


const Section = ({
    title,
    children,
    isEditing,
    onEdit,
}: {
    title: string;
    children: React.ReactNode;
    isEditing: boolean;
    onEdit: () => void;
}) => (
    <>


        <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText
                    fontSize={12}
                    fontWeight={700}
                    color="#6B5A60"
                    marginVertical={15}
                >
                    {title}
                </AppText>
                {
                    title == 'ACCOUNT' ? null :
                        <TouchableOpacity onPress={onEdit}>
                            <AppImage source={Logos.edit} width={20} height={20} resizeMode='contain' />
                        </TouchableOpacity>
                }


            </View>

            {children}</View>
    </>
);


const PersonalInformation = ({ navigation }: any) => {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editPersonal, setEditPersonal] = useState(false);
    const [editAddress, setEditAddress] = useState(false);
    const [editPassword, setEditPassword] = useState(false);
    const [profiledata, setProfiledata] = useState([])
    const [name, setName] = useState('');
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [profile, setProfile] = useState({
        image: Icons.person,
        name: 'Jane Smith',
        email: 'janesmith@gmail.com',
        phone: '+61 412 345 678',
        phoneCode: { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
        dob: '24 April 1994',
        gender: 'Female',
        addressid: '',
        address: '',
        city: '',
        postcode: '',
        country: '',
    });

    useEffect(() => {
        console.log('PersonalInformation mounted');

        return () => {
            console.log('PersonalInformation unmounted');
        };
    }, []);

    useFocusEffect(
        useCallback(() => {

            getProfile()

        }, [])
    )



    const getProfile = async () => {
        try {
            setLoading(true);

            const response = await ApiService.get(apiUrls.getprofile);
            console.log(response, "profile api response")
            if (response.status === 200) {
                const data = (response as any)?.data?.data;
                setProfiledata(data)
                console.log(BASE_URL + data.avatarUrl)
                setName(data.name)
                setProfile(prevProfile => ({
                    ...prevProfile,
                    image: data.avatarUrl || '',
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    phoneCode: { name: 'Australia', code: 'AU', dialCode: data.countryCode || '', flag: '🇦🇺' },
                    dob: data.dateOfBirth || '',
                    gender: data.gender || '',
                }));
                const Address = data.addresses.find(
                    item => item.type !== 'SHIPPING'
                );
                console.log(Address, "rjfrjbrjbfcjbj")
                if (Address !== undefined) {
                    setProfile(prevProfile => ({
                        ...prevProfile,
                        addressid: Address.id || '',
                        address: Address.addressLine || '',
                        city: Address.city || '',
                        postcode: Address.zipCode || '',
                        country: Address.state || '',
                    }));
                }


            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 1,
                selectionLimit: 1,
            },
            response => {
                if (response.didCancel) {
                    console.log('Cancelled');
                } else if (response.errorCode) {
                    console.log(response.errorMessage);
                } else {
                    const asset = response.assets?.[0];
                    uploadProfilePhoto(asset)
                    console.log(asset);
                    console.log(asset?.uri);
                }
            },
        );
    };


    const uploadProfilePhoto = async (image: any) => {
        try {

            const formData = new FormData();

            formData.append('image', {
                uri: image.uri,
                name: image.fileName || 'profile.jpg',
                type: image.type || 'image/jpeg',
            });

            const response = await ApiService.patch(
                apiUrls.profilePhoto,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Status:', response.status);
            console.log('Response:', response.data);

            if (response.status === 200) {
                getProfile();
            }
        } catch (error: any) {
            console.log('Error:', error.response?.data || error);

            Alert.alert(
                'Error',
                error.response?.data?.message || error.message
            );
        } finally {

        }
    };


    const updateProfile = async () => {
        try {
            const payload = {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                countryCode: phoneCode?.dialCode,
                dateOfBirth: profile.dob,
                gender: profile.gender,

            };
            console.log(payload, "djeiedihedu")
            const response = await ApiService.patch(
                apiUrls.updateProfile,
                payload
            );

            console.log('Status:', response.status);
            console.log('Response:', response.data);

            if (response.status === 200) {

                // Alert.alert(
                //     'Success',
                //     response.data?.message || 'Profile updated successfully.'
                // );
                dispatch(
                    showToast({
                        visible: true,
                        message: response.data?.message || 'Profile updated successfully.',
                        type: 'success',
                    })
                );

                setIsEditing(false);
                setEditPersonal(false)
                // Refresh profile
                getProfile();
            }
        } catch (error: any) {
            console.log('Error:', error.response?.data || error);

            Alert.alert(
                'Error',
                error.response?.data?.message || error.message
            );
        }
    };


    const addressfun = async () => {
        const hasAddresses = profiledata?.addresses?.length > 0;

        const profileAddress = profiledata?.addresses?.find(
            item => item.type !== 'SHIPPING'
        );

        if (hasAddresses && profileAddress) {
            await updateAddress();
        } else {
            await addAddress();
        }
    };

    const addAddress = async () => {
        try {
            const payload = {
                addressLine: profile.address,
                city: profile.city,
                state: profile.country,
                zipCode: profile.postcode,
                name: profile.name,
                phone: profile.phone,
                countryCode: '+61',
                tag: 'Home',
                isDefault: true,
                type: 'PROFILE',
            };
            console.log(payload, "wdnwbdj", apiUrls.addaddress)

            const response = await ApiService.post(
                apiUrls.addaddress,
                payload
            );

            console.log('Status:', response.status);
            console.log('Response:', response.data);

            if (response.status === 201 || response.status === 200) {
                dispatch(
                    showToast({
                        visible: true,
                        message: response.data?.message || 'Profile updated successfully.',
                        type: 'success',
                    })
                );
                setEditAddress(false)
                getProfile();
            }
        } catch (error: any) {
            console.log('Error:', error.response?.data || error);

            Alert.alert(
                'Error',
                error.response?.data?.message || error.message
            );
        }
    };


    const updateAddress = async () => {
        try {
            const payload = {
                addressLine: profile.address,
                city: profile.city,
                state: profile.country,
                zipCode: profile.postcode,
                name: profile.name,
                phone: profile.phone,
                countryCode: '+61',
                tag: 'Home',
                type: 'PROFILE',
            };
            console.log(payload, "Eejej", apiUrls.updateAddress, profile.addressid)
            const response = await ApiService.patch(
                apiUrls.updateAddress(profile.addressid),
                payload
            );

            console.log('Status:', response.status);
            console.log('Response:', response.data);

            if (response.status === 200) {
                dispatch(
                    showToast({
                        visible: true,
                        message: response.data?.message || 'Profile updated successfully.',
                        type: 'success',
                    })
                );

                setEditAddress(false);
                getProfile();
            }
        } catch (error: any) {
            console.log('Error:', error.response?.data || error);

            Alert.alert(
                'Error',
                error.response?.data?.message || error.message
            );
        }
    };






    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                translucent={false}
                barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <AppImage source={Icons.rightArrow} width={13} height={23}
                        style={{
                            transform: [{ rotate: '180deg' }],
                        }}
                        tintColor={"#000000"}
                    />
                </TouchableOpacity>

                <AppText fontSize={15} fontWeight={700} color='#000000'>
                    Personal Information
                </AppText>

                <TouchableOpacity>
                    <AppText color={color.themetext} fontSize={15} fontWeight={600}>

                    </AppText>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}>
                {/* Profile */}

                <View style={styles.profileContainer}>
                    <View style={styles.avatarContainer}>
                        <AppImage
                            source={
                                profile?.image
                                    ? { uri: `https://shelynx.mediaclocksoft.com.au${profile.image}` }
                                    : Icons.person
                            }
                            width={90}
                            height={90}
                            borderRadius={45}
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: 45,
                                borderWidth: 4,
                                borderColor: '#FCE4EC'
                            }}
                        />


                        <TouchableOpacity
                            onPress={pickImage}
                            style={styles.editIcon}>
                            <AppImage
                                source={Icons.edit}
                                width={12}
                                height={12}
                                tintColor="#fff"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={pickImage}
                        style={styles.changePhoto}>
                        <AppImage
                            source={Icons.camera}
                            width={13}
                            height={11}
                        />

                        <AppText
                            marginLeft={8}
                            color={color.themetext}
                            fontSize={15}>
                            Change Photo
                        </AppText>
                    </TouchableOpacity>
                </View>

                {/* PERSONAL DETAILS */}

                <Section title="PERSONAL DETAILS"
                    isEditing={editPersonal}
                    onEdit={() => setEditPersonal(!editPersonal)}
                >
                    <Row
                        icon={Icons.person}
                        title="Full Name"
                        value={profile.name}
                        editable
                        isEditing={editPersonal}
                        onChange={(text) => {
                            console.log('Typing:', text);
                            setProfile(prev => ({
                                ...prev,
                                name: text,
                            }));
                        }}
                    />


                    <Row
                        icon={Icons.email}
                        title="Email Address"
                        value={profile.email}
                        isEditing={editPersonal}
                        onChange={(text) =>
                            setProfile(prev => ({
                                ...prev,
                                email: text,
                            }))
                        }
                    />

                    <Row
                        icon={Icons.phone}
                        title="Phone Number"
                        value={profile.phone}
                        isEditing={editPersonal}
                        type="phone"
                        phoneCode={profile.phoneCode}
                        setphoneCode={(country) =>
                            setProfile(prev => ({
                                ...prev,
                                phoneCode: country,
                            }))
                        }
                        onChange={(text) =>
                            setProfile(prev => ({
                                ...prev,
                                phone: text,
                            }))
                        }
                    />

                    <Row1
                        icon={Icons.birth}
                        title="Date Of Birth"
                        value={profile.dob}
                        isEditing={editPersonal}
                        isDatePicker={true}
                        onDatePress={() => {
                            setOpenDatePicker(true)
                        }}
                    />
                    <Row
                        icon={Icons.gender}
                        title="Gender"
                        value={profile.gender}
                        type="gender"
                        isEditing={editPersonal}
                        onChange={(text) =>
                            setProfile(prev => ({
                                ...prev,
                                gender: text,
                            }))
                        }
                    />
                </Section>

                {/* ADDRESS */}

                <Section title="ADDRESS"
                    isEditing={editAddress}
                    onEdit={() => setEditAddress(!editAddress)}
                >
                    <Row
                        icon={Icons.location}
                        title="Home Address"
                        value={profile.address}
                        isEditing={editAddress}
                        onChange={(text) =>
                            setProfile(prev => ({
                                ...prev,
                                address: text,
                            }))
                        }
                    />

                    <Row
                        icon={Icons.city}
                        title="City"
                        value={profile.city}
                        isEditing={editAddress}

                        onChange={(text) =>
                            setProfile(prev => ({
                                ...prev,
                                city: text,
                            }))
                        }
                    />

                    <Row
                        icon={Icons.email}
                        title="Postcode"
                        value={profile.postcode}
                        isEditing={editAddress}
                        onChange={(text) =>
                            setProfile(prev => ({
                                ...prev,
                                postcode: text,
                            }))
                        }
                    />

                    <Row
                        icon={Icons.language}
                        title="Country"
                        value={profile.country}
                        isEditing={editAddress}
                        onChange={(text) =>
                            setProfile(prev => ({
                                ...prev,
                                country: text,
                            }))
                        }
                    />
                </Section>

                {/* ACCOUNT */}

                <Section title="ACCOUNT"
                    isEditing={editPassword}
                // onEdit={() => navigation.navigate('ChangePassword')}
                >

                    <Row
                        icon={Icons.lockp}
                        isEditing={editPassword}
                        title="Change Password"
                        onPress={() =>
                            navigation.navigate('OtpVerification', {
                                email: profiledata.email,
                            })
                        }
                        value=""

                    />

                    <TouchableOpacity>
                        <Row
                            icon={Icons.phone}
                            isEditing={editPassword}
                            title="Connected Devices"
                            value=""
                            onPress={() =>
                                navigation.navigate('ConnectedDevices')
                            }


                        />
                    </TouchableOpacity>

                </Section>
                {(editPersonal || editAddress || editPassword) && (
                    <TouchableOpacity
                        onPress={() => {
                            if (editPersonal && editAddress) {
                                updateProfile();
                                addressfun();
                            } else if (editPersonal) {
                                updateProfile();
                            } else if (editAddress) {
                                addressfun();
                            } else if (editPassword) {
                                // changePassword();
                            }
                        }}
                        style={styles.saveButton}>
                        {loading ? (
                            <ActivityIndicator size="small" color={color.themetext} />
                        ) : (
                            <>
                                <AppImage
                                    source={Icons.save}
                                    width={17}
                                    height={18}
                                />

                                <AppText
                                    marginLeft={10}
                                    color={color.themetext}
                                    fontWeight={600}>
                                    Save Changes
                                </AppText>
                            </>)}

                    </TouchableOpacity>)}

                <View style={{ height: 40 }} />
            </ScrollView>


            <Modal
                transparent
                visible={openDatePicker}
                animationType="fade"
            >
                <DatePicker
                    modal
                    open={openDatePicker}
                    date={selectedDate}
                    mode="date"
                    maximumDate={new Date()}

                    onConfirm={(date) => {
                        setOpenDatePicker(false);
                        setSelectedDate(date);

                        const formattedDate = date.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        });

                        setProfile(prev => ({
                            ...prev,
                            dob: formattedDate,
                        }));
                    }}
                    onCancel={() => setOpenDatePicker(false)}
                />
            </Modal>
        </SafeAreaView>
    );
};

export default PersonalInformation;


const Row = ({
    icon,
    title,
    value,
    onChange,
    isEditing,
    type,
    phoneCode,
    setphoneCode,
    onPress,
}: {
    icon: any;
    title: string;
    value: string;

    onChange?: (text: string) => void;
    isEditing?: boolean;
    type?: 'gender' | 'text' | 'phone';
    phoneCode?: CountryType;
    setphoneCode?: (country: CountryType) => void;
    onPress?: () => void;
}) => {

    const [showGender, setShowGender] = useState(false);

    const genders = ['Male', 'Female', 'Other'];

    return (
        <TouchableOpacity
            style={styles.row}
            activeOpacity={1}
            onPress={onPress}
        >
            <View style={styles.left}>
                <View style={styles.iconBox}>
                    <AppImage
                        source={icon}
                        width={18}
                        height={18}
                        resizeMode="contain"
                    />
                </View>

                <View style={{ marginLeft: 15, flex: 1 }}>
                    <AppText
                        fontSize={16}
                        fontWeight={400}
                        color="#1B1C1C"
                    >
                        {title}
                    </AppText>


                    {isEditing ? (
                        type === 'gender' ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.input, { flexDirection: 'row', borderWidth: 0, alignItems: 'center', gap: 10, paddingVertical: 0 }]}
                                    onPress={() => setShowGender(!showGender)}
                                >
                                    <AppText
                                        fontSize={14}
                                        color="#1B1C1C"
                                    >
                                        {value || 'Select Gender'}
                                    </AppText>

                                    <AppText fontSize={12}>
                                        ▼
                                    </AppText>
                                </TouchableOpacity>


                                {showGender && (
                                    <View style={styles.genderDropdown}>
                                        {genders.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={styles.genderOption}
                                                onPress={() => {
                                                    onChange?.(item);
                                                    setShowGender(false);
                                                }}
                                            >
                                                <AppText
                                                    fontSize={14}
                                                    color="#1B1C1C"
                                                >
                                                    {item}
                                                </AppText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </>
                        ) : type === 'phone' ? (
                            <View style={styles.phoneContainer}>
                                <CountryPicker1
                                    value={phoneCode}
                                    onSelect={setphoneCode}
                                />

                                <View style={styles.divider} />

                                <TextInput
                                    value={value || ''}
                                    onChangeText={onChange}
                                    placeholder="Phone Number"
                                    placeholderTextColor="#A0A0A0"
                                    keyboardType="phone-pad"
                                    style={styles.phoneInput}
                                />
                            </View>
                        ) : (
                            <TextInput
                                value={value || ''}
                                onChangeText={onChange}
                                style={styles.input}
                            />
                        )
                    ) : (
                        <AppText
                            fontSize={12}
                            color="#1B1C1C"
                            marginTop={2}
                        >
                            {value}
                        </AppText>
                    )}

                </View>
            </View>
        </TouchableOpacity>
    );
};


const Row1 = ({
    icon,
    title,
    value,
    onChange,
    isEditing,
    isDatePicker,
    onDatePress,

}: {
    icon: any;
    title: string;
    value: string;
    onChange?: (text: string) => void;
    isEditing?: boolean;
    isDatePicker?: boolean;
    onDatePress?: () => void;
}) => (
    <TouchableOpacity
        style={styles.row}
        onPress={isDatePicker ? onDatePress : undefined}
    >
        <View style={styles.left}>
            <View style={styles.iconBox}>
                <AppImage
                    source={icon}
                    width={18}
                    height={18}
                    resizeMode="contain"
                />
            </View>

            <View style={{ marginLeft: 15 }}>
                <AppText
                    fontSize={16}
                    color="#1B1C1C"
                >
                    {title}
                </AppText>

                {
                    isEditing && !isDatePicker ? (
                        <TextInput
                            value={value}
                            onChangeText={onChange}
                            style={styles.input}
                        />
                    ) : (
                        <AppText
                            fontSize={12}
                            marginTop={2}
                        >
                            {value}
                        </AppText>
                    )
                }

            </View>
        </View>
    </TouchableOpacity>
);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8F8',
    },

    content: {
        padding: 20,
    },

    header: {
        height: 60,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    profileContainer: {
        alignItems: 'center',
        marginTop: 20,
    },

    avatarContainer: {
        position: 'relative',
    },

    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 8,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: color.themetext,
        justifyContent: 'center',
        alignItems: 'center',
    },

    changePhoto: {
        marginTop: 18,
        borderWidth: 1,
        borderColor: color.themetext,
        borderRadius: 10,
        paddingHorizontal: 18,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 4,
        marginTop: 35
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,

    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#FDECF2',
        justifyContent: 'center',
        alignItems: 'center',
    },

    saveButton: {
        marginTop: 35,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: color.themetext,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    input: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#1B1C1C',
        backgroundColor: '#fff',
        minWidth: 220,
    },
    genderDropdown: {
        width: 150,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        marginTop: 5,
        overflow: 'hidden',
    },

    genderOption: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    datePickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '85%',
        alignItems: 'center'
    },

    buttons: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        paddingTop: 15,
    },

    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 0,
        borderWidth: 1,
        borderColor: '#E9D9DD',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        marginTop: 8,
    },

    divider: {
        width: 1,
        height: 20,
        backgroundColor: '#E9D9DD',
    },

    phoneInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#1B1C1C',
    },
});