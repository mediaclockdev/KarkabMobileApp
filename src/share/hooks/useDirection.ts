import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '../../localization/supportlang';

/**
 * Direction helpers for screens.
 *
 * Note: with forceRTL enabled, React Native auto-flips `flexDirection: 'row'`,
 * `start/end` spacing and `alignSelf: flex-start/flex-end`. You only need these
 * helpers for things RN does NOT flip: `textAlign` and `writingDirection`.
 */
export const useDirection = () => {
    const { i18n } = useTranslation();
    const isRTL = I18nManager.isRTL;

    return {
        isRTL,
        language: i18n.language.split('-')[0] as AppLanguage,    /** Natural text alignment for the active language. */
        textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left',
        /** Opposite alignment, e.g. for a trailing link. */
        textAlignOpposite: (isRTL ? 'left' : 'right') as 'left' | 'right',
        /** Always-LTR fields: email, password, phone, URLs, numbers. */
       ltrField: {
  writingDirection: 'ltr' as const,
  textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left',
},
    };
};