import React from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native'

import AppImage from './AppImage'
import color, { } from '../constants/color'
import { BottomIcons, Icons, } from '../constants/media'


interface SearchBarProps {
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  onFilterPress?: () => void
  title?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search Products In Lebanon ',
  onFilterPress,
  title = '',
}) => {

  return (
    <View style={[styles.searchContainer, { backgroundColor: color.white, borderColor: '#D0C3C7', }]}>
      <AppImage
        source={Icons.search}
        width={18}
        height={18}
      //  tintColor={"#EEA75E"}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={'#777'}
        style={[styles.input, { color: color.darkthemetext, }]}

      />


    </View>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    height: 57,
    borderRadius: 16,

    borderWidth: 0.5,
    borderColor: '#D0C3C7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    elevation: 5
  },

  input: {
    flex: 1,

    fontSize: 16,

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