import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';

import MainHeader from '../share/components/MainHeader';
import Dashboard from './Home/Dashboard';
import Guidline from './Home/Guidline';
import FindAgent from './Home/FindAgent';
import PlaceOrder from './Home/PlaceOrder';
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import DeviceInfo from 'react-native-device-info';

const Home = () => {
  const [visible, setVisible] = useState('dash');
  const navigation = useNavigation<any>();
  const loginState = useSelector(
    (state: any) => state.auth.loginState
  );


  useEffect(() => {
    getDeviceName();
    if (loginState == 'first') {
      setVisible('guid')
    }

  }, [])

  const getDeviceName = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    console.log(deviceName, "Device");
  };




  return (
    <SafeAreaView
      //edges={['top']}

      style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent={false}
      />
      {/* <MainHeader 
      headerName={visible}
      setVisible={setVisible}
      /> */}

      {visible == 'dash' ? (
        <Dashboard setVisible={setVisible} />

      ) :
        visible == 'guid' ?
          (
            <Guidline
              setVisible={setVisible}
            />
          )
          : visible == 'find' ?
            <FindAgent
              setVisible={setVisible}
            />
            //      :visible == 'place'?
            //  <PlaceOrder/>
            :
            null
      }
      {/* <PaymentAlertModal
        visible={true}
        title={'Proceed to Payment'}
        message={'rn3'}
        cancelText={'Later'}
        confirmText={'Continue'}
      // onCancel,
      // onConfirm,
      /> */}

      {/* <AppAlertModal
        visible={true}
        type="success"
        title="success"
        message="Something went wrong. Please try again."
        confirmText="Retry"
        cancelText="Cancel"
        showCancel
      // onConfirm={handleRetry}
      // onCancel={() => setErrorVisible(false)}
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
});

export default Home;