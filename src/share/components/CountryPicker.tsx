import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import AppText from './AppText';
import AppImage from './AppImage';
import { Icons } from '../constants/media';

export interface CountryType {
    name?: string;
    code?: string;
    dialCode?: string;
    flag?: string;
}

const COUNTRIES: CountryType[] = [
    { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
    { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
    { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
    { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
    { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
    { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
    { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
    { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
    { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
    { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
    { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
];

interface Props {
    value?: CountryType;
    onSelect?: (country: CountryType) => void;
}

const CountryPicker = ({ value, onSelect }: Props) => {
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState('');
    const filteredCountries = useMemo(() => {
        return COUNTRIES.filter(
            item =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.dialCode.includes(search),
        );
    }, [search]);

    return (
        <>
            <TouchableOpacity
                style={styles.countryCode}
                onPress={() => setVisible(true)}>
                <AppText>
                    {value?.dialCode}
                </AppText>
                <AppImage
                    source={Icons.downArrow}
                    height={4.8}
                    width={9.6}
                />
            </TouchableOpacity>

            <Modal
                visible={visible}
                animationType="slide"
                transparent>
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <AppText style={styles.title}>
                            Select Country
                        </AppText>

                        <TextInput
                            placeholder="Search country..."
                            value={search}
                            onChangeText={setSearch}
                            style={styles.search}
                        />

                        <FlatList
                            data={filteredCountries}
                            keyExtractor={item => item.code}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => {
                                        onSelect(item);
                                        setVisible(false);
                                        setSearch('');
                                    }}>
                                    {/* <AppText style={{ fontSize: 18 }}>
                                        {item.flag}
                                    </AppText> */}

                                    <AppText style={{ flex: 1, marginLeft: 12 }}>
                                        {item.code}
                                    </AppText>


                                    <AppText>{item?.dialCode}</AppText>


                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default CountryPicker;

const styles = StyleSheet.create({
    countryCode: {
        width: 95,
        height: 54,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E9D9DD',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexDirection: 'row',
        gap: 10
    },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.4)',
        justifyContent: 'flex-end',
    },

    container: {
        height: '75%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
    },

    search: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
    },

    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
    },
});