import React from 'react'
import {
  Text,
  TextProps,
  StyleSheet,
  TextStyle,
} from 'react-native'

interface AppTextProps extends TextProps {
  children: React.ReactNode
  ellipsizeMode: any
  /* Typography */
  fontSize?: number
  fontWeight?: TextStyle['fontWeight']
  fontFamily?: string
  fontStyle?: TextStyle['fontStyle']
  lineHeight?: number
  letterSpacing?: number

  /* Colors */
  color?: string

  /* Alignment */
  textAlign?: TextStyle['textAlign']
  textTransform?: TextStyle['textTransform']

  /* Decoration */
  textDecorationLine?: TextStyle['textDecorationLine']

  /* Layout */
  margin?: number
  marginTop?: number
  width?:number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  padding?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  alignSelf: any
  /* Extra */
  opacity?: number

  style?: TextStyle | TextStyle[]
}

const AppText: React.FC<AppTextProps> = ({
  children,
  ellipsizeMode,
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
width,
  style,

  ...props
}) => {
  return (
    <Text
      ellipsizeMode={ellipsizeMode}
      style={[
        styles.body,

        {

          fontSize,
          fontWeight,
          fontFamily,
          fontStyle,
          lineHeight,
          letterSpacing,
          width,

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
      {...props}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: '#000',
  },

  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  h2: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  h3: {
    fontSize: 20,
    fontWeight: '600',
  },

  caption: {
    fontSize: 14,
  },

  small: {
    fontSize: 12,
  },
})

export default AppText