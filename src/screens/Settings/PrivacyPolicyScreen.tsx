
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

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { width } = useWindowDimensions();
    const { i18n } = useTranslation();

    const item = route.params?.item;
    const isArabic = i18n.language?.split('-')[0] === 'ar';

    const title = isArabic
        ? item?.title_ar || 'سياسة الخصوصية'
        : item?.title_en || 'Privacy Policy';

    const content = isArabic
        ? item?.content_ar
        : item?.content_en;

    const highlights = isArabic
        ? [
            { icon: '◉', title: 'البيانات الشخصية', desc: 'معلوماتك وبيانات حسابك' },
            { icon: '⌁', title: 'استخدام البيانات', desc: 'كيفية استخدام معلوماتك' },
            { icon: '✉', title: 'التواصل معنا', desc: 'استفسارات الخصوصية' },
        ]
        : [
            { icon: '◉', title: 'Personal Data', desc: 'Your account information' },
            { icon: '⌁', title: 'Data Usage', desc: 'How information is used' },
            { icon: '✉', title: 'Contact Us', desc: 'Privacy-related questions' },
        ];

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
                    {isArabic ? 'الخصوصية والأمان' : 'Privacy & Security'}
                </Text>

                <View style={styles.headerSpace} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.heroCard}>
                    <View style={styles.shieldCircle}>
                        <Text style={styles.shieldIcon}>✓</Text>
                    </View>

                    <Text style={styles.title}>{title}</Text>

                    <Text style={styles.subtitle}>
                        {isArabic
                            ? 'نؤمن بأهمية خصوصيتك. تعرّف على كيفية التعامل مع بياناتك.'
                            : 'Your privacy matters. Learn how your information is handled.'}
                    </Text>

                    <View style={styles.statusPill}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>
                            {isArabic ? 'سياسة الخصوصية' : 'PRIVACY INFORMATION'}
                        </Text>
                    </View>
                </View>

                {/* <Text style={styles.sectionTitle}>
                    {isArabic ? 'نظرة عامة' : 'AT A GLANCE'}
                </Text>

                {highlights.map((highlight, index) => (
                    <View key={highlight.title} style={styles.highlightCard}>
                        <View style={styles.highlightIcon}>
                            <Text style={styles.highlightIconText}>
                                {highlight.icon}
                            </Text>
                        </View>

                        <View style={styles.highlightText}>
                            <Text style={styles.highlightTitle}>{highlight.title}</Text>
                            <Text style={styles.highlightDesc}>{highlight.desc}</Text>
                        </View>

                        <Text style={styles.cardNumber}>
                            {String(index + 1).padStart(2, '0')}
                        </Text>
                    </View>
                ))} */}

                <View style={styles.policyHeader}>
                    <Text style={styles.sectionTitle}>
                        {isArabic ? 'تفاصيل السياسة' : 'POLICY DETAILS'}
                    </Text>
                    <Text style={styles.version}>
                        v{item?.version || '1.0.0'}
                    </Text>
                </View>

                <View style={styles.contentCard}>
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
                                h3: { color: GOLD, fontSize: 16, fontWeight: '600' },
                                p: { marginBottom: 12 },
                                li: { color: '#D4D4D8', marginBottom: 8 },
                                strong: { color: '#FFFFFF' },
                                a: { color: GOLD },
                            }}
                        />
                    ) : (
                        <Text style={styles.emptyText}>
                            {isArabic
                                ? 'سياسة الخصوصية غير متاحة حاليًا.'
                                : 'The privacy policy is currently unavailable.'}
                        </Text>
                    )}
                </View>

                <View style={styles.contactCard}>
                    <Text style={styles.contactTitle}>
                        {isArabic ? 'هل لديك أسئلة؟' : 'Questions about privacy?'}
                    </Text>
                    <Text style={styles.contactDescription}>
                        {isArabic
                            ? 'يمكنك التواصل معنا عبر البريد الإلكتروني.'
                            : 'Contact our team for privacy-related questions.'}
                    </Text>
                    <Text style={styles.email}>
                        {item?.extra_data?.contact_email || 'privacy@karkab.com'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyPolicyScreen;

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
    heroCard: {
        backgroundColor: '#17150F',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#493722',
        padding: 24,
        alignItems: 'center',
        marginBottom: 28,
    },
    shieldCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#35291B',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    shieldIcon: { color: GOLD, fontSize: 34, fontWeight: '700' },
    title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', textAlign: 'center' },
    subtitle: {
        color: MUTED,
        fontSize: 13,
        lineHeight: 21,
        textAlign: 'center',
        marginTop: 10,
    },
    statusPill: {
        marginTop: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#282016',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: GOLD,
        marginRight: 8,
    },
    statusText: { color: GOLD, fontSize: 10, fontWeight: '700' },
    sectionTitle: {
        color: GOLD,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 14,
    },
    highlightCard: {
        backgroundColor: CARD,
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    highlightIcon: {
        width: 44,
        height: 44,
        borderRadius: 13,
        backgroundColor: '#282016',
        alignItems: 'center',
        justifyContent: 'center',
    },
    highlightIconText: { color: GOLD, fontSize: 22 },
    highlightText: { flex: 1, marginLeft: 13 },
    highlightTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    highlightDesc: { color: MUTED, fontSize: 12, marginTop: 5 },
    cardNumber: { color: '#666666', fontSize: 12 },
    policyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 22,
    },
    version: { color: MUTED, fontSize: 11, marginBottom: 14 },
    contentCard: { backgroundColor: CARD, borderRadius: 18, padding: 16 },
    emptyText: { color: MUTED, lineHeight: 24 },
    contactCard: {
        backgroundColor: '#17150F',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#493722',
        padding: 20,
        marginTop: 20,
    },
    contactTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    contactDescription: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 8 },
    email: { color: GOLD, fontSize: 14, fontWeight: '600', marginTop: 12 },
});
