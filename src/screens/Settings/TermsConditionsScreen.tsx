
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHTML from 'react-native-render-html';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const GOLD = '#D49A5C';
const BG = '#080808';
const CARD = '#151515';
const MUTED = '#A1A1AA';

const TermsConditionsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { width } = useWindowDimensions();
    const { i18n } = useTranslation();

    const item = route.params?.item;
    const isArabic = i18n.language?.split('-')[0] === 'ar';

    const title = isArabic
        ? item?.title_ar || 'الشروط والأحكام'
        : item?.title_en || 'Terms & Conditions';

    const content = isArabic
        ? item?.content_ar
        : item?.content_en;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('SettingScreen')}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>
                        {isArabic ? '→' : '←'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    {isArabic ? 'المعلومات القانونية' : 'Legal Information'}
                </Text>

                <View style={styles.headerSpace} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.hero}>
                    <View style={styles.iconBox}>
                        <Text style={styles.iconText}>§</Text>
                    </View>

                    <Text style={styles.title}>{title}</Text>

                    <Text style={styles.subtitle}>
                        {isArabic
                            ? 'يرجى قراءة الشروط بعناية قبل استخدام التطبيق.'
                            : 'Please read these terms carefully before using KarKab.'}
                    </Text>
                </View>

                <View style={styles.metaCard}>
                    <View>
                        <Text style={styles.metaLabel}>
                            {isArabic ? 'الإصدار' : 'DOCUMENT VERSION'}
                        </Text>
                        <Text style={styles.metaValue}>
                            {item?.version || '1.0.0'}
                        </Text>
                    </View>

                    <View style={styles.metaDivider} />

                    <View>
                        <Text style={styles.metaLabel}>
                            {isArabic ? 'تاريخ السريان' : 'EFFECTIVE DATE'}
                        </Text>
                        <Text style={styles.metaValue}>
                            {item?.extra_data?.effective_date || '—'}
                        </Text>
                    </View>
                </View>

                <View style={styles.documentCard}>
                    {content ? (
                        <RenderHTML
                            contentWidth={width - 64}
                            source={{ html: content }}
                            baseStyle={{
                                color: '#D4D4D8',
                                fontSize: 14,
                                lineHeight: 24,
                                textAlign: isArabic ? 'right' : 'left',
                            }}
                            tagsStyles={{
                                h1: { color: GOLD, fontSize: 23, fontWeight: '700' },
                                h2: {
                                    color: '#FFFFFF',
                                    fontSize: 18,
                                    fontWeight: '700',
                                    marginTop: 18,
                                },
                                h3: {
                                    color: GOLD,
                                    fontSize: 16,
                                    fontWeight: '600',
                                },
                                p: { marginBottom: 12 },
                                li: { color: '#D4D4D8', marginBottom: 8 },
                                strong: { color: '#FFFFFF' },
                                a: { color: GOLD },
                            }}
                        />
                    ) : (
                        <Text style={styles.emptyText}>
                            {isArabic
                                ? 'لا يوجد محتوى متاح حاليًا.'
                                : 'Terms and conditions are currently unavailable.'}
                        </Text>
                    )}
                </View>

                <Text style={styles.footer}>
                    {isArabic
                        ? 'باستخدامك تطبيق كركب، يرجى التأكد من مراجعة الشروط المحدثة.'
                        : 'Please review the latest terms when using KarKab.'}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsConditionsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    header: {
        height: 58,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: CARD,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backText: { color: GOLD, fontSize: 28 },
    headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    headerSpace: { width: 42 },
    scrollContent: { padding: 20, paddingBottom: 35 },
    hero: { alignItems: 'center', paddingVertical: 22 },
    iconBox: {
        width: 66,
        height: 66,
        borderRadius: 22,
        backgroundColor: '#2B2117',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#61452B',
    },
    iconText: { color: GOLD, fontSize: 40, fontWeight: '600' },
    title: {
        color: '#FFFFFF',
        fontSize: 25,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        color: MUTED,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 21,
        marginTop: 10,
    },
    metaCard: {
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    metaLabel: { color: MUTED, fontSize: 10, marginBottom: 7 },
    metaValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    metaDivider: {
        width: 1,
        backgroundColor: '#303030',
        marginHorizontal: 12,
    },
    documentCard: {
        backgroundColor: CARD,
        borderRadius: 18,
        padding: 16,
    },
    emptyText: { color: MUTED, lineHeight: 24 },
    footer: {
        color: MUTED,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 20,
    },
});
