import { Dimensions, PixelRatio } from 'react-native';
// import DeviceInfo from 'react-native-device-info';

const { width, height } = Dimensions.get('window');
const baseWidth = 375; // iPhone base
const baseHeight = 812;

// export const isTablet = DeviceInfo.isTablet();

// Horizontal scale — for width, fontSize, padding
export const s = (size: number) => (width / baseWidth) * size;

// Vertical scale — for height, margin-top/bottom
export const vs = (size: number) => (height / baseHeight) * size;

// Moderate scale — for fontSize (dampens scale factor so tablets don't get giant text)
export const ms = (size: number, factor = 0.5) => size + (s(size) - size) * factor;

// Tablet-aware value picker
export const responsiveValue = <T,>(phone: T, tablet: T): T => (isTablet ? tablet : phone);

// Font scaling that respects OS accessibility settings but caps runaway scale
export const fontScale = (size: number) => {
  const scale = PixelRatio.getFontScale();
  const capped = Math.min(scale, 1.3); // prevent broken layouts on max accessibility text
  return ms(size) * capped;
};
