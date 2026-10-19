import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AppImage from './AppImage';
import AppText from './AppText';
import { Logo } from '../constants/media';
import { Inter } from '../constants/fonts';
import { useAppColors } from '../constants/color';
import { changeLanguage } from '../../localization/changeLanguage';
import { LANGUAGE_LIST, AppLanguage } from '../../localization/supportLang';
import LinearGradient from 'react-native-linear-gradient';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const color = useAppColors();
  const [open, setOpen] = useState(false);

  const activeCode = i18n.language.split('-')[0] as AppLanguage;
  const activeLabel =
    LANGUAGE_LIST.find(l => l.code === activeCode)?.label ?? 'العربية';

  // const onSelect = async (code: AppLanguage) => {
  //   setOpen(false);
  //   if (code !== activeCode) await changeLanguage(code);
  // };


  const [selectedLanguage, setSelectedLanguage] =
    useState<AppLanguage | null>(null);
  const [changingLanguage, setChangingLanguage] = useState(false);

  const onSelect = (code: AppLanguage) => {
    setOpen(false);

    if (code !== activeCode) {
      setSelectedLanguage(code);
    }
  };

  const confirmLanguageChange = async () => {
    if (!selectedLanguage || changingLanguage) return;

    try {
      setChangingLanguage(true);
      await changeLanguage(selectedLanguage);
      setSelectedLanguage(null);
    } catch (error) {
      console.error('Language change failed:', error);
    } finally {
      setChangingLanguage(false);
    }
  };


  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => setOpen(prev => !prev)}
        style={[styles.trigger, { borderColor: '#4E5050' }]}
      >
        <AppImage
          source={Logo.language}
          width={12}
          height={12}
          tintColor={color.darkthemetext}
        />
        <AppText color="#BABABA" fontSize={12} fontFamily={Inter.regular}>
          {activeLabel}
        </AppText>
        <AppImage
          source={Logo.downarrow}
          width={8}
          height={4}
          tintColor={color.darkthemetext}
        />
      </TouchableOpacity>

      {open && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: color.darkbackround, borderColor: '#4E5050' },
          ]}
        >
          {LANGUAGE_LIST.map((lang, index) => (
            <View key={lang.code}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.option}
                onPress={() => onSelect(lang.code)}
              >
                <AppText
                  color={
                    lang.code === activeCode ? '#EA9305' : color.darkthemetext
                  }
                >
                  {lang.label}
                </AppText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <Modal
        visible={selectedLanguage !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!changingLanguage) setSelectedLanguage(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: color.darkbackround },
            ]}
          >
            <View style={styles.modalIcon}>
              <AppImage
                source={Logo.language}
                width={26}
                height={26}
                tintColor="#FFB300"
              />
            </View>

            <AppText
              color={color.darkthemetext}
              fontSize={19}
              fontFamily={Inter.medium}
              style={styles.modalTitle}
            >
              Change Language?
            </AppText>

            <AppText
              color="#A5A5A5"
              fontSize={13}
              style={styles.modalDescription}
            >
              Are you sure you want to change the app language?
              The application will reload to apply the changes properly.
            </AppText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={changingLanguage}
                onPress={() => setSelectedLanguage(null)}
                style={styles.cancelButton}
              >
                <AppText
                  color={color.darkthemetext}
                  fontSize={13}
                  fontFamily={Inter.medium}
                >
                  Cancel
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={changingLanguage}
                onPress={confirmLanguageChange}
                style={styles.confirmButton}
              >
                <LinearGradient
                  colors={['#FFB300', '#F3870C', '#CF7D00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.confirmGradient}
                >
                  <AppText
                    color="#FFFFFF"
                    fontSize={13}
                    fontFamily={Inter.medium}
                  >
                    {changingLanguage ? 'Please wait...' : 'Confirm'}
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-end',
    zIndex: 999,
    marginTop: 15
  },
  trigger: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexDirection: 'row',
    borderRadius: 17,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    end: 0,
    borderRadius: 12,
    borderWidth: 1,
    width: 120,
    overflow: 'hidden',
    zIndex: 999,
  },
  option: {
    padding: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#4E5050',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#383838',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
  },

  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 179, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },

  modalDescription: {
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 26,
    paddingHorizontal: 4,
  },

  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 2,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#454545',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
  },

  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },

  confirmGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

});