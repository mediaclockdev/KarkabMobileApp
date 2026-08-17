import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import { moderateScale } from '../utils/responsive';
import fonts from '../constants/fonts';

/* =========================
   TYPES
========================= */

interface ImageData {
  uri?: string;
  path?: string;
  type?: string;
  name?: string;
}


interface Props {
  visible: boolean;
  onBackdropPress: () => void;
  setImageSource: (data: ImageData) => void;
  theme: any;
  document: boolean;
  desc: string;
}

/* =========================
   COMPONENT
========================= */

const MediaUploader: React.FC<Props> = ({
  visible,
  onBackdropPress,
  setImageSource,
  theme,
  document,
  desc,
}) => {
  /* =========================
     IMAGE HANDLER
  ========================= */

  const handleResponse = (response: ImagePickerResponse) => {
    if (!response.assets || response.assets.length === 0) {
      return;
    }

    const asset: Asset = response.assets[0];

    const imageData: ImageData = {
      uri: asset.uri,
      path: asset.uri,
      type: asset.type,
      name: asset.fileName,
    };

    setImageSource(imageData);
  };

  const uploadFromGallery = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      });

      handleResponse(response);
    } catch (error) {
      console.log('Gallery Error:', error);
    }
  };

  const clickPicture = async () => {
    try {
      const response = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      });

      handleResponse(response);
    } catch (error) {
      console.log('Camera Error:', error);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <Modal
      isVisible={visible}
      backdropColor="#000"
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={500}
      animationOutTiming={500}
      backdropTransitionOutTiming={0}
      avoidKeyboard
      onBackdropPress={onBackdropPress}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: theme.gray },
          ]}
        >
          Upload {document ? 'Document' : 'Profile Image'}
          <Text style={{ color: theme.primary_color }}>
            {' '}
            {desc}
          </Text>
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: theme.gray },
          ]}
        >
          Take a new photo or select an existing one from your library.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={uploadFromGallery}>
            <Text
              style={[
                styles.actionText,
                { color: theme.primary_color },
              ]}
            >
              GALLERY
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={clickPicture}>
            <Text
              style={[
                styles.actionText,
                { color: theme.primary_color },
              ]}
            >
              CAMERA
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MediaUploader;

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: moderateScale(20),
    borderRadius: 10,
  },
  title: {
    fontSize: moderateScale(14),
   // fontFamily: fonts.family?.semiBold,
    marginBottom: moderateScale(10),
  },
  subtitle: {
    fontSize: moderateScale(12),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: moderateScale(20),
  },
  actionText: {
    fontSize: moderateScale(12),
    marginLeft: moderateScale(20),
   // fontFamily: fonts.family?.semiBold,
  },
});