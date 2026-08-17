import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';



import AppText from './AppText';
import AppImage from './AppImage';
import color from '../constants/color';
import { GlobalImage } from '../utils/GlobalImage';
import { Icons } from '../constants/media';
import apiUrls from '../../services/apiUrls';

interface ItemProps {
  item: {
    id: number;
    image: any;
    title: string;
    ref: string;
    weight: string;
    price: number;
    quantity: number;
  };
  onPlus: () => void;
  onMinus: () => void;
  onDelete: () => void;
}

const OrderItemCard: React.FC<ItemProps> = ({
  item,
  onPlus,
  onMinus,
  onDelete
}) => {




  return (
    <View
      style={[
        styles.card,
        !item.isAvailable && styles.unavailableCard,
      ]}>


      <View style={styles.topRow}>
        {!item?.isAvailable && (
          <View style={styles.unavailableBadge}>
            <AppText color="#fff" fontSize={11} fontWeight={700}>
              Unavailable
            </AppText>
          </View>
        )}
        <TouchableOpacity
          onPress={onDelete}
          style={{
            position: 'absolute',
            right: -5,
            top: -5,
            width: 24,
            height: 24,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}
        >
          <AppImage
            source={Icons.delete}
            width={16}
            height={16}
            resizeMode="contain"
            style={{ alignSelf: 'center', marginTop: 5 }}
          />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <AppImage
          source={GlobalImage(item?.photoUrl)}
          width={90}
          height={90}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.info}>
          <AppText
            fontSize={16}
            fontWeight={400}
            numberOfLines={1}
            color={color.textcolor}
            style={{ marginTop: 10 }}
          >
            {item?.productName}
          </AppText>

          <AppText
            fontSize={12}
            fontWeight={600}
            color="#6B5A60">
            Ref: {item?.skuCode}
          </AppText>
          <TouchableOpacity
            onPress={async () => {
              console.log(item?.productUrl);
              const url = item?.productUrl;

              if (!url) return;

              const supported = await Linking.canOpenURL(url);

              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert('Unable to open link');
              }
            }}
            style={{ marginTop: 8 }}
          >
            <AppText
              fontSize={14}
              color="#AB2C5D">
              View on SHEIN
            </AppText>
          </TouchableOpacity>



        </View>

      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.qtyButton,
                item?.quantity <= 1 && styles.qtyButtonDisabled,
              ]}
              onPress={onMinus}
              disabled={item?.quantity <= 1}
            >
              <AppText
                color='#6B5A60'
                style={{ includeFontPadding: false }}

                fontSize={16}>-</AppText>
            </TouchableOpacity>

            <AppText
              fontSize={16}
              fontWeight={600}
              color={color.textcolor}
              style={{ marginHorizontal: 10 }}
            >
              {item?.quantity}
            </AppText>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={onPlus}>
              <AppText
                color='#6B5A60'
                style={{ includeFontPadding: false }}
                fontSize={16}>+</AppText>
            </TouchableOpacity>
          </View>
          <AppText
            fontSize={12}
            color="#4D4447">
            Est. {item?.weight}
          </AppText>
        </View>

        {/* <AppText
          fontSize={18}
          fontWeight={700}
          color={color.textcolor}>
          ${(Number(item.price) * item.quantity).toFixed(2)}
        </AppText> */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>


          <AppText
            fontSize={16}
            fontWeight={700}
            style={{ marginRight: 8 }}
            color={'#BA1A1A'}>
            ${(Number(item?.promotionalPrice) * item.quantity).toFixed(2)}
          </AppText>
          <AppText
            fontSize={14}
            fontWeight={500}
            color="#999"
            style={{ textDecorationLine: 'line-through', }}>
            ${(Number(item.price) * item.quantity).toFixed(2)}
          </AppText>
        </View>
      </View>

    </View>
  );
};

export default OrderItemCard;

const styles = StyleSheet.create({
  card: {
    // flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  image: {
    borderRadius: 10,
  },

  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },

  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0EDED',
    padding: 5,
    borderRadius: 99,
    flexDirection: 'row'
  },

  qtyButton: {
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: color.white,

    justifyContent: 'center',
    alignItems: 'center',
  },
  topRow: {
    flexDirection: "row",
    justifyContent: 'flex-start',
    alignItems: "center",
    marginBottom: 10,
  },

  qtyButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },


  unavailableCard: {
    borderWidth: 2,
    borderColor: '#E53935',
    backgroundColor: '#FFF5F5',
    opacity: 0.85,
  },

  topActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },

  unavailableBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
  },
});