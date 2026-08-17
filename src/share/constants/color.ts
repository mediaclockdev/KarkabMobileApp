




export const color={
    darkbackround:'#080808',
    lighbackground:'#FFFFFF',
    darkthemetext:'#FFFFFF',
    lightthemetext:'#000000',
    lgyellow:'#FEE960',
    lgyellow1:'#FCC378',
    mgred:'#FF4B4C',
    darkgray:'#1A1919',
    mgyellow:'#D49A5C',
    brown:'#642F08'

}
export default color;


import { useColorScheme } from 'react-native';
import { storage } from '../storage/mmkv';

export const useAppColors = () => {
 // const theme = useColorScheme();
 // console.log(theme,"dhdjbjdb")
   const theme = storage.getString('mode') || 'dark';
  return {
    darkbackround:
      theme === 'dark' ? '#040506' : '#FFFFFF',
    loginbackground:
      theme === 'dark' ? undefined : '#FFFFFF',
    darkthemetext:
      theme === 'dark' ? '#FFFFFF' : '#000000',

    lgyellow: '#FEE960',
    lgyellow1: '#FCC378',
    mgred: '#FF4B4C',
    darkgray: '#1A1919',
    mgyellow: '#D49A5C',
    brown: '#642F08',
    homebordercolor:theme === 'dark' ? '#6B320B80' : '#F6F3F0',
    searhbarbordercolor:theme === 'dark' ? '#31200E' : '#D9D9D9',
  };
};