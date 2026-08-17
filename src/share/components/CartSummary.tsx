import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';


import AppText from './AppText';
import color from '../constants/color';

interface CartSummaryProps {
  itemCount: number;
  itemTotal: number;
  shipping: number;
  serviceFee: number;
  grandTotal: number;
  deliveryFee: number;
  totalPromotionalDiscount: number;
  customFee: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  itemCount,
  itemTotal,
  shipping,
  serviceFee,
  grandTotal,
  deliveryFee,
  totalPromotionalDiscount,
  customFee,
}) => {
  return (
    <View style={styles.container}>
      <AppText
        fontSize={20}
        fontWeight={700}
        marginBottom={18}
        color='#6B5A60'
      >
        Cart Summary
      </AppText>

      <View style={styles.row}>
        <AppText fontSize={15} color="#4D4447">
          Items ({itemCount})
        </AppText>

        <AppText fontSize={15} fontWeight={600} color='#4D4447'>
          ${Number(itemTotal + totalPromotionalDiscount).toFixed(2)}
        </AppText>
      </View>
      <View style={styles.row}>
        <AppText fontSize={15} color="#4D4447">
          Total Promotional Discount
        </AppText>

        <AppText fontSize={15} fontWeight={600} color='#BA1A1A'>
          - ${totalPromotionalDiscount?.toFixed(2)}
        </AppText>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <AppText fontSize={15} color="#4D4447">
          Base Amount
        </AppText>

        <AppText fontSize={15} fontWeight={600} color='#4D4447'>
          ${itemTotal?.toFixed(2)}
        </AppText>
      </View>
      {/* <View style={styles.row}>
        <AppText fontSize={15} color="#4D4447">
          Delivery Fee
        </AppText>

        <AppText fontSize={15} fontWeight={600} color='#4D4447'>
          ${deliveryFee?.toFixed(2)}
        </AppText>
      </View> */}
      {/* <View style={styles.row}>
        <AppText fontSize={15} color="#4D4447">
          Custom Fee
        </AppText>

        <AppText fontSize={15} fontWeight={600} color="#4D4447">
          ${customFee?.toFixed(2)}
        </AppText>
      </View> */}


      {/* <View style={styles.row}>
        <AppText fontSize={15} color="#4D4447">
          Shipping Fee (Weight-based)
        </AppText>

        <AppText fontSize={15} fontWeight={600} color='#4D4447'>
          ${shipping?.toFixed(2)}
        </AppText>
      </View> */}
      {/* 
      <View style={styles.row}>
        <AppText fontSize={15} color="#4D4447">
          Service Fee (5%)
        </AppText>

        <AppText fontSize={15} fontWeight={600} color='#4D4447'>
          ${serviceFee?.toFixed(2)}
        </AppText>
      </View> */}






      <View style={styles.divider} />



      {/* <View style={styles.row}>
        <AppText fontSize={18} fontWeight={700}>
          Grand Total
        </AppText>

        <AppText
          fontSize={20}
          fontWeight={700}
          color={color.themetext}>
          ${grandTotal.toFixed(2)}
        </AppText>
      </View>

      <TouchableOpacity style={styles.button}>
        <AppText
          fontSize={16}
          color={color.white}
          fontWeight={700}>
          Confirm & Send to Agent
        </AppText>
      </TouchableOpacity> */}
    </View>
  );
};

export default CartSummary;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FCE4EC',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#D0C3C7'
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#FFFF',
    marginVertical: 15,
  },

  button: {
    marginTop: 20,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#AB2C5D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});