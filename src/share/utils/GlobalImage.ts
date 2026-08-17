import { ImageSourcePropType } from 'react-native';
import { Images } from '../constants/media';
import { BASE_URL } from '../../services/apiUrls';


export const GlobalImage = (
  url?: string | null
): ImageSourcePropType => {
  if (!url || typeof url !== 'string') {
    return Images.profile;
  }

  const cleanUrl = url.trim();

  if (
    cleanUrl === '' ||
    cleanUrl === 'null' ||
    cleanUrl === 'undefined'
  ) {
    return Images.profile;
  }

  // If already full URL
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://')
  ) {
    return { uri: cleanUrl };
  }

  // Relative path => prepend BASE_URL
  return {
    uri: `${BASE_URL.replace(/\/$/, '')}/${cleanUrl.replace(/^\//, '')}`,
  };
};