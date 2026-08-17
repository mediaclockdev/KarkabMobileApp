import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import AppImage from './AppImage';
import AppText from './AppText';
import color from '../constants/color';
import { Icons } from '../constants/media';
import { useNavigation } from '@react-navigation/native'

interface ProductCardProps {
  item: {
    id: string;
    productName: string;
    title: string;
    size: string;
    price: string;
    image: any;
    photoUrl: any;
  };
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onPress,
}) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
    >
      <ImageBackground
        source={
          typeof item.photoUrl === 'string'
            ? { uri: item.photoUrl }
            : item.photoUrl
        }
        resizeMode="cover"
        imageStyle={styles.imageStyle}
        style={styles.image}>
        {/* Optional Gradient/Badge */}
      </ImageBackground>

      <View style={styles.content}>
        <AppText
          fontSize={16}
          color="#AB2C5D"
          fontWeight={400}
          marginBottom={4}
          numberOfLines={2}
        >
          {item.productName}
        </AppText>

        {/* <AppText
          fontSize={16}
          color={color.textcolor}
          fontWeight={400}>
          {item.title}
        </AppText> */}

        <View style={styles.row}>
          <AppText
            fontSize={16}
            color="#4D4447">
            Size: {item.size}
          </AppText>

          <AppText
            fontSize={16}
            color="#AB2C5D"
            fontWeight={400}>
            {item.price}
          </AppText>
        </View>

        <TouchableOpacity

          onPress={onPress}
          style={styles.buyButton}>
          <AppImage
            source={Icons.bag}
            width={12}
            height={15}
            resizeMode='contain'
          />

          <AppText
            fontSize={16}
            color={'#6E0034'}
            fontWeight={600}>
            Buy Now
          </AppText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 5,
    margin: 5
  },

  image: {
    width: '100%',
    height: 167,
    backgroundColor: '#FCE3E5',
  },

  imageStyle: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  content: {
    padding: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },

  buyButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: color.btncolor,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    gap: 6,
  },
});