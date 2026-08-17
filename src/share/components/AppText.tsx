import React from 'react';
import {
  Text,
  TextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';

interface AppTextProps extends TextProps {
  children: React.ReactNode;

  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  fontFamily?: string;
  fontStyle?: TextStyle['fontStyle'];
  lineHeight?: number;
  letterSpacing?: number;

  color?: string;

  textAlign?: TextStyle['textAlign'];
  textTransform?: TextStyle['textTransform'];
  textDecorationLine?: TextStyle['textDecorationLine'];

  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;

  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;

  alignSelf?: TextStyle['alignSelf'];

  opacity?: number;

  style?: TextStyle | TextStyle[];
}

const AppText: React.FC<AppTextProps> = ({
  children,

  fontSize,
  fontWeight,
  fontFamily,
  fontStyle,
  lineHeight,
  letterSpacing,

  color,

  textAlign,
  textTransform,
  textDecorationLine,

  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,

  padding,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,

  alignSelf,
  opacity,

  style,

  ...props
}) => {
  return (
    <Text
      style={[
        styles.body,
        {
          fontSize,
          fontWeight,
          fontFamily,
          fontStyle,
          lineHeight,
          letterSpacing,

          color,

          textAlign,
          textTransform,
          textDecorationLine,

          margin,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,

          padding,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,

          alignSelf,
          opacity,
        },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: '#000',
  },
});

export default AppText;