import React, { memo } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Platform,
} from 'react-native';

import { Country } from '../../../navigation/types';

interface Props {
  item: Country;
  selected: boolean;
  onPress: (country: Country) => void;
}

const CountryRow: React.FC<Props> = ({
  item,
  selected,
  onPress,
}) => {
  return (
    <Pressable
      onPress={() => onPress(item)}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      style={({ pressed }) => [
        styles.row,
        pressed && Platform.OS === 'ios' && styles.pressed,
      ]}
    >
      <Text style={styles.flag}>{item.flag}</Text>

      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
      </View>

      <Text style={styles.code}>+{item.dial_code}</Text>

      {selected && <View style={styles.selectedDot} />}
    </Pressable>
  );
};


export default memo(CountryRow);



const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },

  pressed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  flag: {
    fontSize: 22,
    marginRight: 12,
  },

  nameWrap: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    color: '#100f0f',
  },

  code: {
    fontSize: 15,
    color: '#7f8083',
    marginRight: 8,
  },

  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
});

