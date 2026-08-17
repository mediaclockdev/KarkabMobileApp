import React, { useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ImageStyle,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';

type Props = {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: keyof typeof FastImage.resizeMode;
  onError?: () => void;
};

export const FastAppImage = ({
  source,
  style,
  resizeMode = 'cover',
  onError,
}: Props) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" />
        </View>
      )}

      <FastImage
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode={FastImage.resizeMode[resizeMode]}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          onError?.();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});