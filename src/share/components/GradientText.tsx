import React from 'react';
import { Text, TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

interface GradientTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  style,
}) => {
  return (
    <MaskedView
      style={{ alignSelf: 'center' }}
      maskElement={
        <Text
          style={[
            {
              fontSize: 12,
              fontWeight: '600',
              backgroundColor: 'transparent',
              textAlign: 'center',
            },
            style,
          ]}
        >
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={['#FA6144', '#D83B7E', '#7E3FF2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text
          style={[
            {
              fontSize: 12,
              fontWeight: '600',
              opacity: 0,
              textAlign: 'center',
            },
            style,
          ]}
        >
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;