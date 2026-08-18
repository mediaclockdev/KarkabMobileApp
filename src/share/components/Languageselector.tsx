import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AppImage from './AppImage';
import AppText from './AppText';
import { Logo } from '../constants/media';
import { Inter } from '../constants/fonts';
import { useAppColors } from '../constants/color';
import { changeLanguage } from '../../localization/changeLanguage';
import { LANGUAGE_LIST, AppLanguage } from '../../localization/supportLang';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const color = useAppColors();
  const [open, setOpen] = useState(false);

  const activeCode = i18n.language.split('-')[0] as AppLanguage;
  const activeLabel =
    LANGUAGE_LIST.find(l => l.code === activeCode)?.label ?? 'العربية';

  const onSelect = async (code: AppLanguage) => {
    setOpen(false);
    if (code !== activeCode) await changeLanguage(code);
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-end',
    zIndex: 999,
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
});