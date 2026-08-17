import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  Pressable,
  Text,
} from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface Props {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  editable?: boolean;
}

const AppFloatingInput: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  rightIcon,
  onRightPress,
  editable = true,
}) => {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: isFocused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelTop = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -10],
  });

  const labelFontSize = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const labelColor = isFocused
    ? theme.colors.button
    : theme.colors.placeholder;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            borderColor: isFocused
              ? theme.colors.button
              : theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        {/* Animated Label */}
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: labelColor,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          {label}
        </Animated.Text>

        <TextInput
          value={value}
          editable={editable}
          onChangeText={onChangeText}
          style={[styles.input, { color: theme.colors.text }]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {rightIcon && (
          <Pressable onPress={onRightPress} style={styles.icon}>
            {rightIcon}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
  },
  container: {
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    left: 18,
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingTop: 6,
  },
  icon: {
    marginLeft: 10,
  },
});

export default AppFloatingInput;
