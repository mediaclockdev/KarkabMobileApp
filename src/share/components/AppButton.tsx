import React, { useRef } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  View,
  Animated,
  Platform,
} from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import AppText from './AppText';

interface AppButtonProps {
  title: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: any;
  ns?: string
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  style,
  ns,
  rightIcon,
}) => {
  const theme = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.button
      : 'transparent';

  const textColor =
    variant === 'primary'
      ? theme.colors.textInverse
      : theme.colors.link;

  const borderStyle =
    variant === 'outline'
      ? {
        borderWidth: 1,
        borderColor: theme.colors.button,
      }
      : {};

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 24 },
    large: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
        fullWidth && { width: '100%' },
      ]}    >
      <Pressable
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{
          color: 'rgba(255,255,255,0.2)',
        }}
        style={[
          styles.base,
          sizeStyles[size],
          {
            backgroundColor,
            opacity: isDisabled ? 0.6 : 1,
          },
          borderStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.content}>
            {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
            <AppText ns={ns} style={[
              styles.text,
              {
                color: textColor || theme?.colors?.text,
              },
            ]}
            >
              {title}
            </AppText>
            {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 6,
  },
});

export default AppButton;
