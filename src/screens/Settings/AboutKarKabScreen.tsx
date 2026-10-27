
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHTML from 'react-native-render-html';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const GOLD = '#D49A5C';
const BG = '#080808';
const CARD = '#151515';
const MUTED = '#A1A1AA';

const AboutKarKabScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { width } = useWindowDimensions();
    const { i18n } = useTranslation();

    const item = route.params?.item;
    const isArabic = i18n.language?.split('-')[0] === 'ar';

    const title = isArabic
        ? item?.title_ar || 'عن تطبيق كركب'
        : item?.title_en || 'About KarKab';

    const content = isArabic
        ? item?.content_ar
        : item?.content_en;

    const extra = item?.extra_data || {};

    const openWebsite = async () => {
        const url = extra.website;
        if (!url) return;

        try {
            await Linking.openURL(url);
        } catch (error) {
            console.warn('Could not open website', error);
        }
    };

    const openSupportEmail = async () => {
        const email = extra.support_email;
        if (!email) return;

        try {
            await Linking.openURL(`mailto:${email}`);
        } catch (error) {
            console.warn('Could not open email', error);
        }
    };

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
                    {isArabic ? 'عن التطبيق' : 'About'}
                </Text>

                <View style={styles.headerSpace} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.brandCard}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoLetter}>K</Text>
                    </View>

                    <Text style={styles.brandName}>KarKab</Text>
                    <Text style={styles.brandArabic}>كركب</Text>

                    <Text style={styles.brandDescription}>
                        {isArabic
                            ? 'اكتشف الموسيقى، واستمتع بالغناء، واجعل كل أغنية تجربتك الخاصة.'
                            : 'Discover music, enjoy singing, and make every song your own.'}
                    </Text>

                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>
                            {isArabic ? 'الإصدار ' : 'VERSION '}
                            {extra.app_version || item?.version || '2.4.0'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>
                    {isArabic ? 'معلومات التطبيق' : 'APP INFORMATION'}
                </Text>

                <View style={styles.infoCard}>
                    <InfoRow
                        label={isArabic ? 'اسم التطبيق' : 'App Name'}
                        value={extra.app_name || 'KarKab'}
                    />
                    <View style={styles.separator} />

                    <InfoRow
                        label={isArabic ? 'الإصدار' : 'Version'}
                        value={extra.app_version || item?.version || '2.4.0'}
                    />
                    <View style={styles.separator} />

                    <InfoRow
                        label={isArabic ? 'رقم البناء' : 'Build Number'}
                        value={String(extra.build_number || '—')}
                    />
                </View>

                <Text style={styles.sectionTitle}>
                    {isArabic ? 'ابقَ على تواصل' : 'CONNECT WITH US'}
                </Text>

                <TouchableOpacity
                    style={styles.linkCard}
                    onPress={openWebsite}
                    activeOpacity={0.8}
                >
                    <View style={styles.linkIcon}>
                        <Text style={styles.linkIconText}>↗</Text>
                    </View>

                    <View style={styles.linkDetails}>
                        <Text style={styles.linkTitle}>
                            {isArabic ? 'الموقع الإلكتروني' : 'Official Website'}
                        </Text>
                        <Text style={styles.linkValue}>
                            {extra.website || '—'}
                        </Text>
                    </View>

                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkCard}
                    onPress={openSupportEmail}
                    activeOpacity={0.8}
                >
                    <View style={styles.linkIcon}>
                        <Text style={styles.linkIconText}>✉</Text>
                    </View>

                    <View style={styles.linkDetails}>
                        <Text style={styles.linkTitle}>
                            {isArabic ? 'الدعم الفني' : 'Support & Help'}
                        </Text>
                        <Text style={styles.linkValue}>
                            {extra.support_email || '—'}
                        </Text>
                    </View>

                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
                    {isArabic ? 'قصتنا' : 'OUR STORY'}
                </Text>

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
                                ? 'معلومات التطبيق غير متاحة حاليًا.'
                                : 'About information is currently unavailable.'}
                        </Text>
                    )}
                </View>

                <Text style={styles.footer}>
                    {isArabic
                        ? 'شكرًا لكونك جزءًا من مجتمع كركب.'
                        : 'Thank you for being part of the KarKab community.'}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

export default AboutKarKabScreen;

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
    brandCard: {
        backgroundColor: '#17150F',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#493722',
        padding: 26,
        alignItems: 'center',
        marginBottom: 28,
    },
    logoBox: {
        width: 82,
        height: 82,
        borderRadius: 26,
        backgroundColor: GOLD,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    logoLetter: { color: BG, fontSize: 48, fontWeight: '900' },
    brandName: { color: '#FFFFFF', fontSize: 29, fontWeight: '800' },
    brandArabic: { color: GOLD, fontSize: 19, marginTop: 4 },
    brandDescription: {
        color: MUTED,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 22,
        marginTop: 15,
    },
    versionBadge: {
        marginTop: 18,
        borderWidth: 1,
        borderColor: '#61452B',
        backgroundColor: '#282016',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    versionText: { color: GOLD, fontSize: 11, fontWeight: '700' },
    sectionTitle: {
        color: GOLD,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 14,
    },
    infoCard: {
        backgroundColor: CARD,
        borderRadius: 17,
        paddingHorizontal: 17,
        marginBottom: 28,
    },
    infoRow: {
        minHeight: 54,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: { color: MUTED, fontSize: 13 },
    infoValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    separator: { height: 1, backgroundColor: '#292929' },
    linkCard: {
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    linkIcon: {
        width: 44,
        height: 44,
        borderRadius: 13,
        backgroundColor: '#282016',
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkIconText: { color: GOLD, fontSize: 23 },
    linkDetails: { flex: 1, marginLeft: 13 },
    linkTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    linkValue: { color: MUTED, fontSize: 12, marginTop: 5 },
    chevron: { color: GOLD, fontSize: 26, marginLeft: 8 },
    contentCard: { backgroundColor: CARD, borderRadius: 18, padding: 16 },
    emptyText: { color: MUTED, lineHeight: 24 },
    footer: {
        color: MUTED,
        textAlign: 'center',
        fontSize: 12,
        marginTop: 25,
        lineHeight: 20,
    },
});
