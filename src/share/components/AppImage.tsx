import React from 'react'
import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  ImageSourcePropType,
} from 'react-native'

interface AppImageProps extends ImageProps {
  source: ImageSourcePropType | string
  width?: number
  height?: number
  radius?: number
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
  style?: StyleProp<ImageStyle>
  fallbackSource?: ImageSourcePropType
}

const AppImage: React.FC<AppImageProps> = ({
  source,
  width = 24,
  height = 24,
  radius = 0,
  resizeMode = 'cover',
  style,
  fallbackSource,
  ...props
}) => {
  const imageSource =
    typeof source === 'string' ? { uri: source } : source

  return (
    <Image
      source={imageSource}
      resizeMode={resizeMode}
      defaultSource={fallbackSource}
      style={[
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
      {...props}
    />
  )
}

export default AppImage