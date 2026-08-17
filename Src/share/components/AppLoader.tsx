import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import color, { } from '../constants/color';

const AppLoader = () => {

  const loading = useSelector(
    (state: RootState) => state.auth.loading,
  );

  if (!loading) return null;

  return (
    <Modal
      visible={loading}
      transparent
      animationType="fade"
    >
      <View style={[styles.container, { backgroundColor: color.darkbackround, }]}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#EFCB61" />
        </View>
      </View>
    </Modal>
  );
};

export default AppLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
     backgroundColor: 'rgba(0,0,0,0.4)',
    // position: 'absolute',
    // top: 0,
    // left: 0,
    //zIndex:9999
  },
  loaderBox: {
    // backgroundColor:  'black',
    padding: 25,
    borderRadius: 12,
  },
});