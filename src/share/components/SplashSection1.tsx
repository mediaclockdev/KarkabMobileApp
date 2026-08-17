import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import color from '../constants/color';
import AppImage from './AppImage';
import { Logos } from '../constants/media';
import AppText from './AppText';
import { useAppDispatch } from '../hooks/useAppSelector';
import { setAuthenticated } from '../../auth/redux/authSlice';

import { useNavigation } from '@react-navigation/native'

const SplashSection1 = () => {
     const dispatch = useAppDispatch();
     const navigation=useNavigation()
  return (
    <View style={styles.container}>
      {/* <Text>cjnf</Text> */}
      <AppImage
      source={Logos.splashLogo}
      width={353}
      height={362}
      />
      <TouchableOpacity
      onPress={()=>{
    // dispatch(setAuthenticated(true));
      navigation.navigate('Login')
      }}
      
      style={{
        height:48,
        width:327,
        backgroundColor:color.btncolor,
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        gap:10
        }}>
          
<AppText
fontSize={13}
color={color.btntextcolor}
>
    {"Let’s Start"}
</AppText>
<AppImage
      source={Logos.arrow}
      width={13}
      height={13}
      />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.appcolor,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashSection1;