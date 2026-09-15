import React from 'react';
import {
  TouchableOpacity,
  TextInput,
  StyleSheet,
  View,
} from 'react-native';

import AppImage from './AppImage';
import { useAppColors } from '../constants/color';
import { BottomIcons } from '../constants/media';
import { Inter } from '../constants/fonts';
import AppText from './AppText';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  title?: string;
  onPress?: () => void;
  IsPressable?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChangeText,
  placeholder = 'Search songs, artists or lyrics...',
  onPress,
  IsPressable = true,
}) => {
  const color = useAppColors();

  return (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: color.darkbackround,
          borderColor: color.searhbarbordercolor,
        },
      ]}
    >
      <AppImage
        source={BottomIcons.search}
        width={18}
        height={18}
        tintColor="#EEA75E"
      />

      {IsPressable ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          style={{
            flex: 1,
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <AppText
            color={'#777'}
            fontSize={12}
            fontFamily={Inter.regular}
          >
            {placeholder}
          </AppText>
        </TouchableOpacity>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#777"
          style={[
            styles.input,
            {
              color: color.darkthemetext,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    height: 55,
    borderRadius: 16,
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    elevation: 5,
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    fontFamily: Inter.regular,
  },
});

export default SearchBar;