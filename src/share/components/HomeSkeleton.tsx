import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
    background: '#050505',
    base: '#151515',
    highlight: '#242424',
    border: '#33200B',
    accent: '#F28A00',
};

type BlockProps = {
    width?: ViewStyle['width'];
    height: number;
    radius?: number;
    style?: any;
};

const SkeletonBlock = ({ width = '100%', height, radius = 10, style }: BlockProps) => {
    const shimmer = useRef(new Animated.Value(-1)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(shimmer, {
                toValue: 1,
                duration: 1350,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );
        animation.start();

        return () => {
            animation.stop();
            shimmer.stopAnimation();
        };
    }, [shimmer]);

    const translateX = shimmer.interpolate({
        inputRange: [-1, 1],
        outputRange: [-SCREEN_WIDTH * 0.75, SCREEN_WIDTH * 0.75],
    });

    return (
        <View
            accessible={false}
            style={[
                styles.block,
                { width, height, borderRadius: radius },
                style,
            ]}
        >
            <Animated.View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFillObject,
                    { transform: [{ translateX }] },
                ]}
            >
                <LinearGradient
                    colors={[COLORS.base, COLORS.highlight, COLORS.base]}
                    locations={[0.25, 0.5, 0.75]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shimmerGradient}
                />
            </Animated.View>
        </View>
    );
};

const SectionHeadingSkeleton = () => (
    <View style={styles.sectionHeading}>
        <SkeletonBlock width="53%" height={17} radius={5} />
        <SkeletonBlock width={48} height={16} radius={5} />
    </View>
);

const HorizontalCardSkeleton = ({
    width,
    height,
    imageHeight,
    rounded = 12,
}: {
    width: number;
    height: number;
    imageHeight?: number;
    rounded?: number;
}) => (
    <View style={[styles.horizontalCard, { width, height, borderRadius: rounded }]}>
        <SkeletonBlock height={imageHeight ?? height - 48} radius={rounded - 2} />
        <View style={styles.cardText}>
            <SkeletonBlock width="82%" height={10} radius={4} />
            <SkeletonBlock width="55%" height={8} radius={4} style={styles.smallGap} />
        </View>
    </View>
);

const SongRowSkeleton = ({ compact = false }: { compact?: boolean }) => (
    <View style={[styles.songRow, compact && styles.compactSongRow]}>
        <SkeletonBlock width={compact ? 52 : 56} height={compact ? 52 : 56} radius={10} />
        <View style={styles.songInfo}>
            <SkeletonBlock width={compact ? '78%' : '82%'} height={12} radius={4} />
            <SkeletonBlock width="52%" height={9} radius={4} style={styles.smallGap} />
        </View>
        {!compact && <SkeletonBlock width="24%" height={10} radius={4} />}
        <SkeletonBlock width={compact ? 27 : 34} height={compact ? 27 : 34} radius={compact ? 14 : 17} />
        {!compact && <SkeletonBlock width={5} height={25} radius={3} />}
    </View>
);

const ArtistCircleSkeleton = () => (
    <View style={styles.artistItem}>
        <SkeletonBlock width={84} height={84} radius={42} style={styles.artistCircle} />
        <SkeletonBlock width={76} height={9} radius={4} />
    </View>
);

const HomeSkeleton = () => {
    const sidePadding = 5;
    const mixCardWidth = Math.min(158, SCREEN_WIDTH * 0.42);
    const moodCardWidth = Math.min(118, SCREEN_WIDTH * 0.31);
    const releaseCardWidth = Math.min(145, SCREEN_WIDTH * 0.39);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        >
            {/* Hero/banner block */}
            <SkeletonBlock
                width="100%"
                height={184}
                radius={22}
                style={styles.banner}
            />

            {/* Artists - Mix Song */}
            <SectionHeadingSkeleton />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
                <View style={styles.horizontalRow}>
                    {[0, 1, 2, 3].map(item => (
                        <HorizontalCardSkeleton
                            key={`mix-${item}`}
                            width={mixCardWidth}
                            height={136}
                            imageHeight={136}
                            rounded={13}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Recommended songs */}
            <SectionHeadingSkeleton />
            <View style={styles.recommendedRow}>
                {[0, 1].map(item => (
                    <View key={`recommended-${item}`} style={styles.recommendedCard}>
                        <SkeletonBlock width={48} height={48} radius={9} />
                        <View style={styles.recommendedInfo}>
                            <SkeletonBlock width="90%" height={11} radius={4} />
                            <SkeletonBlock width="64%" height={9} radius={4} style={styles.smallGap} />
                        </View>
                        <SkeletonBlock width={25} height={25} radius={13} />
                    </View>
                ))}
            </View>

            {/* Browse moods */}
            <SectionHeadingSkeleton />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
                <View style={styles.horizontalRow}>
                    {[0, 1, 2, 3].map(item => (
                        <View key={`mood-${item}`} style={[styles.moodCard, { width: moodCardWidth }]}>
                            <SkeletonBlock width="100%" height={150} radius={17} />
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Selected artists */}
            <SectionHeadingSkeleton />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
                <View style={styles.artistRow}>
                    {[0, 1, 2, 3].map(item => <ArtistCircleSkeleton key={`artist-${item}`} />)}
                </View>
            </ScrollView>

            {/* New releases */}
            <SectionHeadingSkeleton />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
                <View style={styles.horizontalRow}>
                    {[0, 1, 2].map(item => (
                        <HorizontalCardSkeleton
                            key={`release-${item}`}
                            width={releaseCardWidth}
                            height={214}
                            imageHeight={214}
                            rounded={15}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Selected artist - all songs */}
            <SectionHeadingSkeleton />
            <View style={styles.filters}>
                <SkeletonBlock width={78} height={32} radius={18} />
                <SkeletonBlock width={88} height={32} radius={18} />
                <SkeletonBlock width={58} height={32} radius={18} />
            </View>
            <View style={styles.songList}>
                {[0, 1, 2, 3, 4, 5].map(item => (
                    <SongRowSkeleton key={`artist-song-${item}`} />
                ))}
            </View>

            {/* Recorded performances */}
            <SectionHeadingSkeleton />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
                <View style={styles.horizontalRow}>
                    {[0, 1, 2].map(item => (
                        <View key={`recording-${item}`} style={styles.smallTile}>
                            <SkeletonBlock width={42} height={42} radius={22} />
                            <View style={styles.smallTileText}>
                                <SkeletonBlock width={72} height={10} radius={4} />
                                <SkeletonBlock width={48} height={8} radius={4} style={styles.smallGap} />
                            </View>
                            <SkeletonBlock width={24} height={24} radius={12} />
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Public community feed */}
            <SectionHeadingSkeleton />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
                <View style={styles.horizontalRow}>
                    {[0, 1, 2].map(item => (
                        <View key={`community-${item}`} style={styles.smallTile}>
                            <SkeletonBlock width={42} height={42} radius={22} />
                            <View style={styles.smallTileText}>
                                <SkeletonBlock width={70} height={10} radius={4} />
                                <SkeletonBlock width={48} height={8} radius={4} style={styles.smallGap} />
                            </View>
                            <SkeletonBlock width={24} height={24} radius={12} />
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Popular songs */}
            <SectionHeadingSkeleton />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
                <View style={styles.horizontalRow}>
                    {[0, 1, 2].map(item => (
                        <View key={`popular-${item}`} style={styles.popularCard}>
                            <SkeletonBlock width={24} height={23} radius={4} />
                            <SkeletonBlock width={54} height={54} radius={9} />
                            <View style={styles.popularText}>
                                <SkeletonBlock width={100} height={10} radius={4} />
                                <SkeletonBlock width={72} height={8} radius={4} style={styles.smallGap} />
                            </View>
                            <SkeletonBlock width={28} height={28} radius={14} />
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        paddingHorizontal: 5,
        paddingTop: 18,
        paddingBottom: 20,
    },
    block: {
        backgroundColor: COLORS.base,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    shimmerGradient: {
        width: SCREEN_WIDTH * 1.5,
        height: '100%',
        opacity: 0.95,
    },
    banner: {
        marginBottom: 19,
    },
    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
        marginBottom: 13,
        paddingHorizontal: 5,
    },
    horizontalRow: {
        flexDirection: 'row',
        paddingHorizontal: 5,
        paddingBottom: 3,
    },
    horizontalCard: {
        backgroundColor: COLORS.base,
        borderWidth: 1,
        borderColor: '#242424',
        overflow: 'hidden',
        marginRight: 10,
        justifyContent: 'flex-start',
    },
    cardText: {
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    smallGap: {
        marginTop: 7,
    },
    recommendedRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 5,
    },
    recommendedCard: {
        flex: 1,
        minWidth: 0,
        height: 84,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 9,
        gap: 8,
        borderRadius: 14,
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#202020',
    },
    recommendedInfo: {
        flex: 1,
        gap: 1,
    },
    moodCard: {
        marginRight: 10,
        padding: 2,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    artistRow: {
        flexDirection: 'row',
        paddingHorizontal: 4,
    },
    artistItem: {
        alignItems: 'center',
        marginRight: 18,
        width: 88,
        gap: 10,
    },
    artistCircle: {
        borderColor: COLORS.border,
        borderWidth: 2,
    },
    filters: {
        flexDirection: 'row',
        gap: 8,
        marginHorizontal: 5,
        marginTop: 1,
        marginBottom: 12,
    },
    songList: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 19,
        paddingHorizontal: 11,
        paddingVertical: 5,
    },
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 86,
        borderBottomWidth: 1,
        borderBottomColor: '#171717',
    },
    compactSongRow: {
        minHeight: 70,
    },
    songInfo: {
        flex: 1,
        gap: 1,
    },
    smallTile: {
        width: Math.min(220, SCREEN_WIDTH * 0.61),
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 10,
        marginRight: 10,
        borderRadius: 14,
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#242424',
    },
    smallTileText: {
        flex: 1,
        gap: 1,
    },
    popularCard: {
        width: Math.min(310, SCREEN_WIDTH * 0.82),
        height: 82,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 10,
        marginRight: 10,
        borderRadius: 12,
        backgroundColor: '#080808',
        borderWidth: 1,
        borderColor: '#242424',
    },
    popularText: {
        flex: 1,
        gap: 1,
    },
});

export default HomeSkeleton;
