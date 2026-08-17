import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from 'react-native';

const GradientText = ({ children ,}) => {
  return (
    <MaskedView
      maskElement={
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            backgroundColor: 'transparent',
          }}
        >
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={['#E95B2A', '#FBD38A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            opacity: 0,
          }}
        >
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText