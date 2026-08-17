import React from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native'

import AppImage from './AppImage'
import color, { useAppColors } from '../constants/color'
import { BottomIcons, Images } from '../constants/media'
import { Inter } from '../constants/fonts'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  onFilterPress?: () => void
  title: string
  onPress?: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search songs,artists  or lyrics...',
  onFilterPress,
  title = '',
  onPress
}) => {
  const color = useAppColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.searchContainer, { backgroundColor: color.darkbackround, borderColor: color.searhbarbordercolor }]}>
      <AppImage
        source={BottomIcons.search}
        width={18}
        height={18}
        tintColor={"#EEA75E"}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={false}
        placeholder={'Search songs,artists  or lyrics...'}
        placeholderTextColor={'#777'}
        style={[styles.input, { color: color.darkthemetext, }]}

      />

      <TouchableOpacity
        style={styles.filterButton}
        onPress={onFilterPress}
      >
        <AppImage
          source={Images.playlist}
          width={18}
          height={18}
          tintColor={title == 'search' ? '#FF3F44' : "#EEA75E"}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    height: 55,
    borderRadius: 16,

    borderWidth: 0.5,
    borderColor: '#31200E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    elevation: 5
  },

  input: {
    flex: 1,

    fontSize: 12,
    fontFamily: Inter.regular
  },

  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#2A2A2A',
  },
})

export default SearchBar