import React from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from './AppText';
import color from '../constants/color';

interface Props {
  currentStep?: number;
  totalSteps?: number;
  status?: string;
}

const OrderProgressCard: React.FC<Props> = ({
  currentStep = 5,
  totalSteps = 8,
  status = 'In Transit to Global Hub',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText
          fontSize={16}
          fontWeight={400}
          color={color.textcolor}>
          Order Progress
        </AppText>

        <AppText
          fontSize={11}
          fontWeight={700}
          color="#AB2C5D">
          {currentStep} / {totalSteps} STEPS
        </AppText>
      </View>

      <View style={styles.progressRow}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < currentStep
                ? styles.activeDot
                : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      <AppText
        fontSize={12}
        color="#4D4447"
        fontWeight={400}
        marginTop={14}>
        Current status:{' '}
        <AppText
          fontSize={12}
          color="#4D4447"
          fontWeight={400}>
          {status}
        </AppText>
      </AppText>
    </View>
  );
};

export default OrderProgressCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  activeDot: {
    backgroundColor: '#D6336C',
  },

  inactiveDot: {
    backgroundColor: '#D9D9D9',
  },
});