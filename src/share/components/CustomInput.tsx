import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';


import AppText from '../components/AppText';
import AppImage from './AppImage';
import color from '../constants/color';

interface Props extends TextInputProps {
  label: string;
  leftText?: string;
  rightIcon?: string;
  onChangeText?: (text: string) => void;

}

const CustomInput = ({
  label,
  leftText,
  rightIcon,
  style,
  onChangeText,
  ...rest
}: Props) => {
  return (
    <View style={styles.container}>
      <AppText style={styles.label}>
        {label}
      </AppText>

      <View style={styles.inputContainer}>
        {leftText ? (
          <View style={styles.leftContainer}>
            <AppText style={styles.leftText}>
              {leftText}
            </AppText>
          </View>
        ) : null}

        <TextInput
          {...rest}
          onChangeText={onChangeText}
          style={[
            styles.input,
            leftText && { paddingLeft: 12 },
            style,
          ]}
          placeholderTextColor="#6B7280"
        />

        {rightIcon ? (
          // <Ionicons
          //   name={rightIcon}
          //   size={22}
          //   color="#C5B8BF"
          //   style={styles.icon}
          // />

          <AppImage
            source={rightIcon}
            height={22}
            width={22}
            resizeMode='contain'
            style={styles.icon}
          />
        ) : null}

      </View>
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    fontSize: 12,
    color: '#7F7478',
    marginBottom: 8,
    fontWeight: '600',
  },

  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D0C3C7',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },

  leftContainer: {
    width: 46,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#E6D7DC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  leftText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 16,
    color: color.textcolor,
  },

  icon: {
    marginRight: 14,
  },
});