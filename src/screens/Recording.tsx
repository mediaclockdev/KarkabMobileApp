import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useAppColors } from '../share/constants/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppImage from '../share/components/AppImage';
import { Banner, Images, Logo } from '../share/constants/media';
import AppText from '../share/components/AppText';
import { Inter } from '../share/constants/fonts';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Sound, { RecordBackType } from 'react-native-nitro-sound';
import { requestMicPermission } from '../share/utils/requestMicPermission';
import { useTranslation } from 'react-i18next';
import apiUrls from '../services/apiUrls';
import ApiService from '../services/api';
import { showToast } from '../auth/redux/authSlice';
import { useAppDispatch } from '../share/hooks/useAppSelector';

const Recording = () => {
  const navigation = useNavigation<any>();
  const color = useAppColors();
  const { t } = useTranslation('ar');
  const dispatch = useAppDispatch();

  // State Management
  const [recording, setRecording] = useState(false);
  const [path, setPath] = useState('');
  const [recordTime, setRecordTime] = useState('00:00');
  const [recPercentage, setRecPercentage] = useState('0');
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Clean up listeners and recording when component unmounts
  useEffect(() => {
    return () => {
      Sound.removeRecordBackListener();
      Sound.stopRecorder().catch(() => { });
    };
  }, []);

  const progressViews = [
    {
      id: 'duration',
      image: Logo.clock,
      title: t('Duration'),
      color: '#D4AF37',
      number: recordTime.slice(0, 5),
      tintcolor: '',
    },
    {
      id: 'completion',
      image: Logo.ymusic,
      title: t('Song completion'),
      color: '#C552E6',
      number: `${recPercentage}%`,
      tintcolor: '#C552E6',
    },
    {
      id: 'status',
      image: Logo.filltick,
      title: t('Status'),
      color: '#FFFFFF',
      number: saved ? t('Saved') || 'تم الحفظ' : t('Not Saved') || 'غير محفوظ',
      tintcolor: saved ? '#27AE60' : '#E74C3C',
    },
  ];

  const onShare = async () => {
    if (!path) {
      dispatch(
        showToast({
          visible: true,
          message: t('Please record audio first') || 'يرجى التسجيل أولاً',
          type: 'error',
        })
      );
      return;
    }

    try {
      await Share.share({
        message: `Check out this song!\n${path}`,
        url: path,
        title: 'Share Song',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      dispatch(
        showToast({
          visible: true,
          message: t('Microphone permission denied') || 'تم رفض إذن الميكروفون',
          type: 'error',
        })
      );
      return;
    }

    try {
      // Reset prior recording states
      setSaved(false);
      setPath('');
      setRecPercentage('0');
      setRecordTime('00:00');

      Sound.addRecordBackListener((e: RecordBackType) => {
        setRecordTime(Sound.mmssss(Math.floor(e.currentPosition)));
      });

      const result = await Sound.startRecorder();
      setRecording(true);
      console.log('Recording started:', result);
    } catch (e) {
      console.log('Error starting recording:', e);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await Sound.stopRecorder();
      Sound.removeRecordBackListener();

      setPath(result);
      setRecording(false);
      setRecPercentage('100');
      console.log('Recording stopped at path:', result);
    } catch (e) {
      console.log('Error stopping recording:', e);
      setRecording(false);
    }
  };

  const handleMicPress = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const generateSongId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}-SONG`;
  };

  const uploadRecording = async () => {
    if (!path || saved || isUploading) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('song_id', generateSongId());
      formData.append('status', 'review');
      formData.append('recordingFile', {
        uri: path,
        type: 'audio/mp3',
        name: 'song.mp3',
      } as any);

      const response: any = await ApiService.post(apiUrls.uploadrecording, formData);

      if (response?.data?.success) {
        setSaved(true);
        if (response.data.recording_url) {
          setPath(response.data.recording_url);
        }
        dispatch(
          showToast({
            visible: true,
            message: t('Recording saved successfully.') || 'تم حفظ التسجيل بنجاح.',
            type: 'success',
          })
        );
      } else {
        dispatch(
          showToast({
            visible: true,
            message: response?.data?.message || 'Recording upload failed.',
            type: 'error',
          })
        );
      }
    } catch (error: any) {
      console.log('UPLOAD ERROR:', error);
      dispatch(
        showToast({
          visible: true,
          message:
            error?.response?.data?.message ||
            'Unable to upload recording. Please try again.',
          type: 'error',
        })
      );
    } finally {
      setIsUploading(false);
    }
  };

  const isRecorded = Boolean(path) && !recording;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color.darkbackround }]} edges={['top']}>
      {/* Top Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Library')}
          style={styles.backButton}
        >
          <AppImage
            source={Images.leftarrow}
            width={8}
            height={16}
            tintColor={color.darkthemetext}
          />
        </TouchableOpacity>

        {isRecorded && (
          <TouchableOpacity onPress={onShare} style={styles.shareHeaderButton}>
            <AppImage
              source={Banner.shareicon}
              height={16}
              width={16}
              tintColor={'#FFFFFF'}
            />
            <AppText fontFamily={Inter.regular} color={color.darkthemetext} fontSize={14}>
              {t('Share') || 'Share'}
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Background Area */}
        <ImageBackground
          source={Banner.recbackground}
          resizeMode="cover"
          style={styles.heroBackground}
        >
          {/* Header Title depending on state */}
          {isRecorded ? (
            <>
              <View style={styles.completionTitleRow}>
                <AppImage source={Images.bstar} width={29} height={32.5} />
                <AppText fontSize={44} color="#FEC749" fontFamily={Inter.extrabold}>
                  {'أبدعت!'}
                </AppText>
                <AppImage source={Images.bstar} width={29} height={32.5} />
              </View>
              <AppText fontSize={18} color="#FEC749" fontFamily={Inter.extrabold} style={{ marginTop: 4 }}>
                {'لقد اكتمل أداؤك'}
              </AppText>
            </>
          ) : (
            <AppText fontSize={28} color="#FFFFFF" fontFamily={Inter.extrabold} style={{ marginTop: 12 }}>
              {recording ? t('Recording in Progress...') || 'جاري التسجيل...' : t('Ready to Sing?') || 'جاهز للغناء؟'}
            </AppText>
          )}

          {/* Central Mic & Record Action Button */}
          <ImageBackground
            source={Banner.circleview}
            resizeMode="contain"
            style={styles.circleContainer}
          >
            {saved && (
              <View style={styles.savedBadge}>
                <AppImage source={Logo.tick} width={18} height={18} />
                <AppText fontSize={16} color="#FFFFFF" fontFamily={Inter.extrabold}>
                  {'تم الحفظ'}
                </AppText>
              </View>
            )}

            <TouchableOpacity onPress={handleMicPress} activeOpacity={0.7} style={styles.micTouchArea}>
              <AppImage
                source={recording ? Images.playicon : Logo.linmic}
                height={recording ? 60 : 89}
                width={recording ? 60 : 51}
              />
            </TouchableOpacity>

            <AppText fontSize={14} color="#FFFFFF" fontFamily={Inter.extrabold} style={{ marginTop: 8 }}>
              {recording ? t('Tap to Stop') || 'اضغط للإيقاف' : isRecorded ? t('Tap to Re-record') || 'اضغط لإعادة التسجيل' : t('Tap to Start') || 'اضغط للبدء'}
            </AppText>

            {recording && (
              <AppText fontSize={16} color="#FEC749" fontFamily={Inter.bold} style={{ marginTop: 4 }}>
                {recordTime}
              </AppText>
            )}
          </ImageBackground>

          {/* Saved Notification Banner */}
          {saved && (
            <View style={styles.savedSuccessRow}>
              <AppImage source={Logo.tick} width={18} height={18} />
              <AppText fontSize={16} color="#EA8721" fontFamily={Inter.extrabold}>
                {'تم حفظ ادائك بنجاح'}
              </AppText>
            </View>
          )}

          {/* Progress & Duration Cards */}
          {isRecorded && (
            <View style={styles.statsContainer}>
              {progressViews.map((item) => (
                <View key={item.id} style={styles.statCard}>
                  <AppImage
                    source={item.image}
                    height={28}
                    width={28}
                    tintColor={item.tintcolor || undefined}
                  />
                  <AppText fontSize={12} fontFamily={Inter.regular} color={item.color}>
                    {item.title}
                  </AppText>
                  <AppText fontSize={18} fontFamily={Inter.bold} color={color.darkthemetext}>
                    {item.number}
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </ImageBackground>

        {/* Action Controls when Recorded */}
        {isRecorded && (
          <View style={styles.actionButtonsRow}>
            {/* Sing Again */}
            <TouchableOpacity onPress={startRecording} style={styles.actionBtn}>
              <LinearGradient
                colors={['#FC5B01', '#E80360']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                <AppImage source={Logo.round} height={24} width={24} />
                <AppText fontSize={12} fontFamily={Inter.regular} color="#FFFF">
                  {t('Sing Again') || 'Sing Again'}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>

            {/* Save / Upload */}
            <TouchableOpacity
              onPress={uploadRecording}
              disabled={saved || isUploading}
              style={[styles.actionBtn, saved && { opacity: 0.6 }]}
            >
              <LinearGradient
                colors={saved ? ['#27AE60', '#2ECC71'] : ['#5002AE', '#160146']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <AppImage
                      source={saved ? Logo.filltick : Images.import}
                      height={24}
                      width={24}
                      tintColor={'#FFFF'}
                    />
                    <AppText fontSize={12} fontFamily={Inter.regular} color="#FFFF">
                      {saved ? t('Saved') || 'Saved' : t('Save Recording') || 'Save Recording'}
                    </AppText>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
              <LinearGradient
                colors={['#FC5B01', '#E80360']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                <AppImage source={Logo.share} height={24} width={24} tintColor={color.darkthemetext} />
                <AppText fontSize={12} fontFamily={Inter.regular} color="#FFFF">
                  {t('Share') || 'Share'}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Next Song Banner */}
        <TouchableOpacity activeOpacity={0.8} style={styles.nextSongContainer}>
          <ImageBackground source={Banner.btnview} resizeMode="stretch" style={styles.nextSongBg}>
            <View style={styles.nextSongInner}>
              <AppImage source={Images.music} height={30} width={30} />
              <View style={{ alignItems: 'center' }}>
                <AppText color="#fff" fontSize={14} fontFamily={Inter.regular}>
                  {t('Next Song') || 'Next Song'}
                </AppText>
                <AppText color="#FFFF00" fontSize={16} fontFamily={Inter.bold}>
                  {'يا ليالي الخرطوم'}
                </AppText>
              </View>
              <AppImage source={Images.arrow} height={16} width={10} tintColor={'#FFFFFF'} />
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Back to Library Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.dividerRow}>
            <LinearGradient
              colors={['#7F142C', '#E52450']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.dividerLine}
            />
            <AppText fontSize={16} fontFamily={Inter.regular} color="#D900D5">
              {`~ ${t('Karkab')} ~`}
            </AppText>
            <LinearGradient
              colors={['#E52450', '#7F142C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.dividerLine}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Library')}
            style={{ marginTop: 8 }}
          >
            <AppText fontSize={16} fontFamily={Inter.regular} color="#D900D5">
              {t('Back to Library') || 'Back to Library'}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#373534',
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    width: 42,
    borderRadius: 21,
  },
  shareHeaderButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#373534',
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 35,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroBackground: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  completionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleContainer: {
    width: 280,
    height: 280,
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  micTouchArea: {
    padding: 8,
  },
  savedSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3D3B38',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: 110,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 70,
  },
  gradientBtn: {
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  nextSongContainer: {
    marginTop: 20,
  },
  nextSongBg: {
    height: 64,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextSongInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 8,
  },
});

export default Recording;