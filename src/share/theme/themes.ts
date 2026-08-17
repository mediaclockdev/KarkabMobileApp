import { AppTheme } from './types';
//import { IMAGES } from '../constants/media';
import color from '../constants/color';

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: color.darkbackround,
   
   
  },
};


export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#000000',
    text: '#FFFFFF',
    primary: '#1B549F',      // Keep brand blue
    button: '#1B549F',
    link: '#4A90E2',         // Slightly brighter for dark mode
    error: '#FF6B6B',
    placeholder: '#888888',
    border: '#8E8E8F',
    textInverse: '#FFFFFF', // ✅ added
    borderInput: '#ACD0FF',
    gray: '#8E8E8F',
  



  },
};
export const imageTheme: AppTheme = {
  mode: 'image',
  colors: {
    background: 'transparent',
    text: '#FFFFFF',
    primary: '#1B549F',
    button: '#1B549F',
    link: '#FFFFFF',
    error: '#FF4540',
    placeholder: '#DDDDDD',
    border: '#FFFFFF',
    textInverse: '#FFFFFF', // ✅ added
    borderInput: '#ACD0FF',
    gray: '#8E8E8F',
   

  },
 // backgroundImage: IMAGES.theme1,
};
