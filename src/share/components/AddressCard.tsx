import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';


import AppText from '../components/AppText';
import color from '../constants/color';
import AppImage from './AppImage';
import { Icons } from '../constants/media';

interface Props {
  title: string;
  address: string;
  icon: string;
  selected?: boolean;
  onPress: () => void;
  onDelete?: () => void;
}

const AddressCard = ({
  title,
  address,
  icon,
  selected = false,
  onPress,
  onDelete,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppImage
            source={Icons.delete} // your delete icon
            width={18}
            height={18}
            tintColor="#FF4D4F"
            resizeMode="contain"
            style={{
              alignSelf: 'center',
              marginTop: 5
            }}
          />
        </TouchableOpacity>
      )}
      <View
        style={[
          styles.iconContainer,
          selected && styles.selectedIcon,
        ]}>

        <AppImage
          source={icon}
          width={20}
          height={20}
          resizeMode='contain'
          tintColor={selected ? '#AB2C5D' : '#7F7478'}
        />
      </View>

      <View style={styles.textContainer}>
        <AppText style={styles.title}>
          {title}
        </AppText>

        <AppText style={styles.address}>
          {address}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

export default AddressCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F3F3',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  selectedContainer: {
    borderColor: '#E75D92',
    backgroundColor: '#FFF',
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  selectedIcon: {
    backgroundColor: '#FDEAF1',
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: color.textcolor,
    marginBottom: 6,
  },

  address: {
    color: '#4D4447',
    fontSize: 15,
    lineHeight: 22,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});