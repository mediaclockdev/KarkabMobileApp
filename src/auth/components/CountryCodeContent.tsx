import React, { useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import CountryCodes from '../../../shared/utils/CountryCodes.json';
import CountryRow from './CountryRow';
import { Country } from '../../../navigation/types';

interface Props {
    onSelect: (country: Country) => void;
    selectedCode?: string;
}

const CountryCodeContent: React.FC<Props> = ({
    onSelect,
    selectedCode,
}) => {
    const [search, setSearch] = useState('');

    const filteredCountries = useMemo(() => {
        if (!search) return CountryCodes as Country[];

        const q = search.toLowerCase();

        return (CountryCodes as Country[]).filter(
            c =>
                c.name.toLowerCase().includes(q) ||
                c.dial_code.includes(q)
        );
    }, [search]);

    return (
        <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
                <CountryRow
                    item={item}
                    selected={item.dial_code === selectedCode}
                    onPress={onSelect}
                />
            )}
            ListHeaderComponent={
                <View style={styles.searchWrapper}>
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search country"
                        placeholderTextColor="#9CA3AF"
                        style={styles.searchInput}
                    />
                </View>
            }
            stickyHeaderIndices={[0]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
        />
    );
};

export default CountryCodeContent;

const styles = StyleSheet.create({
    searchWrapper: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        // Glass surface, not blur
        backgroundColor:
            'rgba(20,20,20,0.95)',
    },

    searchInput: {
        height: 44,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#FFFFFF',

        backgroundColor:
            'rgba(255,255,255,0.08)',
    },
});