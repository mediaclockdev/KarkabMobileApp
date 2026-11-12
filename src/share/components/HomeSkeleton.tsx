import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
    background: '#050505',
    base: '#171717',
    highlight: '#2A2A2E',
    border: '#262626',
    card: '#141414',
    cardBorder: '#252525',
};

type BlockProps = {
    width?: ViewStyle['width'];
    height: number;
    radius?: number;
    style?: any;
};

const SkeletonBlock = ({
    width = '100%',
    height,
    radius = 10,
    style,
}: BlockProps) => {
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
        outputRange: [-SCREEN_WIDTH * 0.85, SCREEN_WIDTH * 0.85],
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
                    colors={[
                        COLORS.base,
                        COLORS.highlight,
                        COLORS.base,
                    ]}
                    locations={[0.25, 0.5, 0.75]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shimmerGradient}
                />
            </Animated.View>
        </View>
    );
};

// Section heading matching Home.tsx styles.titles
const SectionHeadingSkeleton = ({
    titleWidth = 140,
    marginTop = 20,
    marginBottom = 15,
}: {
    titleWidth?: number | `${number}%`;
    marginTop?: number;
    marginBottom?: number;
}) => (
    <View style={[styles.sectionHeading, { marginTop, marginBottom }]}>
        <SkeletonBlock width={titleWidth} height={20} radius={4} />
        <SkeletonBlock width={10} height={15} radius={3} />
    </View>
);

// Recently Played card (105x105, radius 10 matching SelectedArtistMix)
const RecentlyPlayedSkeleton = () => (
    <View style={styles.recentCard}>
        <SkeletonBlock width="100%" height="100%" radius={10} />

        <View style={styles.recentBottom}>
            <SkeletonBlock width={52} height={11} radius={3} />
        </View>

        <View style={styles.recentPlay}>
            <SkeletonBlock width={28} height={28} radius={14} />
        </View>
    </View>
);

// Browse Collections / Mood card (height 50, radius 14 matching Home.tsx moodCard)
const MoodCardSkeleton = () => (
    <View style={styles.moodCard}>
        <SkeletonBlock width={28} height={28} radius={8} />

        <View style={styles.moodInfo}>
            <SkeletonBlock width="70%" height={11} radius={3} />
            <SkeletonBlock
                width="45%"
                height={9}
                radius={3}
                style={{ marginTop: 4 }}
            />
        </View>
    </View>
);

// Artist circle item (width 86, height 86, radius 46 matching ArtistRow)
const ArtistItemSkeleton = () => (
    <View style={styles.artistItem}>
        <SkeletonBlock width={86} height={86} radius={43} />
        <SkeletonBlock
            width={65}
            height={11}
            radius={3}
            style={styles.artistName}
        />
    </View>
);

// New Release song card (width (SCREEN_WIDTH - 45) / 3, height 160 matching SongCard)
const SongCardSkeleton = ({ cardWidth }: { cardWidth: number }) => (
    <View style={[styles.songCard, { width: cardWidth }]}>
        <SkeletonBlock width="100%" height="100%" radius={14} />

        {/* Play circle */}
        <View style={styles.songPlayCircle}>
            <SkeletonBlock width={30} height={30} radius={15} />
        </View>

        {/* Song bottom info */}
        <View style={styles.songBottom}>
            <SkeletonBlock width="80%" height={12} radius={3} />
            <SkeletonBlock
                width="50%"
                height={10}
                radius={3}
                style={{ marginTop: 4 }}
            />
        </View>
    </View>
);

const HomeSkeleton = () => {
    const songCardWidth = (SCREEN_WIDTH - 45) / 3;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        >
            {/* Hero Banner (matching HomeBanner: width - 40, height: 220, radius: 20) */}
            <View style={styles.banner}>
                <SkeletonBlock width="100%" height="100%" radius={20} />

                <View style={styles.bannerContent}>
                    <SkeletonBlock width="65%" height={22} radius={4} />
                    <SkeletonBlock
                        width="45%"
                        height={14}
                        radius={4}
                        style={{ marginTop: 8 }}
                    />
                    <SkeletonBlock
                        width={143}
                        height={33}
                        radius={22}
                        style={styles.bannerButton}
                    />
                </View>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    <SkeletonBlock width={10} height={3} radius={2} />
                    <SkeletonBlock width={22} height={3} radius={2} />
                    <SkeletonBlock width={10} height={3} radius={2} />
                </View>
            </View>

            {/* 1. Recently Played */}
            <View style={styles.section}>
                <SectionHeadingSkeleton titleWidth={135} marginTop={5} marginBottom={15} />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                >
                    <View style={styles.horizontalRow}>
                        {[0, 1, 2, 3].map(item => (
                            <RecentlyPlayedSkeleton key={`recent-${item}`} />
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* 2. Browse Collections */}
            <View style={styles.section}>
                <SectionHeadingSkeleton titleWidth={160} marginTop={10} marginBottom={12} />

                <View style={styles.moodGrid}>
                    {[0, 1, 2, 3].map(item => (
                        <View key={`mood-${item}`} style={styles.moodItem}>
                            <MoodCardSkeleton />
                        </View>
                    ))}
                </View>
            </View>

            {/* 3. Selected Artists */}
            <View style={styles.section}>
                <SectionHeadingSkeleton titleWidth={80} marginTop={15} marginBottom={12} />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                >
                    <View style={styles.artistRow}>
                        {[0, 1, 2, 3, 4].map(item => (
                            <ArtistItemSkeleton key={`artist-${item}`} />
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* 4. New Releases */}
            <View style={styles.section}>
                <SectionHeadingSkeleton titleWidth={120} marginTop={15} marginBottom={15} />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                >
                    <View style={styles.horizontalRow}>
                        {[0, 1, 2].map(item => (
                            <SongCardSkeleton
                                key={`new-release-${item}`}
                                cardWidth={songCardWidth}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* 5. Selected Artist - All Songs (Filter Chips + Song Row) */}
            <View style={styles.section}>
                <SectionHeadingSkeleton titleWidth={180} marginTop={15} marginBottom={12} />

                {/* Filter Chips */}
                <View style={styles.filterRow}>
                    {[65, 75, 55].map((w, idx) => (
                        <SkeletonBlock
                            key={`filter-${idx}`}
                            width={w}
                            height={28}
                            radius={20}
                        />
                    ))}
                </View>

                {/* Song Rows */}
                {[0, 1].map(item => (
                    <View key={`artist-song-${item}`} style={styles.musicListRow}>
                        <SkeletonBlock width={54} height={54} radius={12} />
                        <View style={styles.musicListInfo}>
                            <SkeletonBlock width="65%" height={15} radius={4} />
                            <SkeletonBlock
                                width="40%"
                                height={12}
                                radius={3}
                                style={{ marginTop: 5 }}
                            />
                        </View>
                        <SkeletonBlock width={75} height={28} radius={14} />
                    </View>
                ))}
            </View>

            <View style={{ height: 80 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    content: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
    },

    block: {
        backgroundColor: COLORS.base,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    shimmerGradient: {
        width: SCREEN_WIDTH * 1.8,
        height: '100%',
        opacity: 0.95,
    },

    // Hero banner
    banner: {
        width: SCREEN_WIDTH - 40,
        height: 220,
        borderRadius: 20,
        overflow: 'hidden',
        alignSelf: 'center',
        marginBottom: 15,
        position: 'relative',
    },

    bannerContent: {
        position: 'absolute',
        top: 24,
        left: 20,
        right: 20,
        alignItems: 'flex-start',
    },

    bannerButton: {
        marginTop: 15,
    },

    pagination: {
        position: 'absolute',
        bottom: 25,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    // Sections
    section: {
        marginBottom: 8,
    },

    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    horizontalRow: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 4,
    },

    // Recently played
    recentCard: {
        width: 105,
        height: 105,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#111111',
    },

    recentBottom: {
        position: 'absolute',
        bottom: 10,
        left: 10,
    },

    recentPlay: {
        position: 'absolute',
        right: 10,
        bottom: 10,
    },

    // Browse collections / Mood
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 10,
    },

    moodItem: {
        width: '48%',
    },

    moodCard: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        gap: 8,
        borderRadius: 14,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },

    moodInfo: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
    },

    // Artists
    artistRow: {
        flexDirection: 'row',
        gap: 20,
        paddingVertical: 6,
    },

    artistItem: {
        width: 86,
        alignItems: 'center',
    },

    artistName: {
        marginTop: 8,
    },

    // New releases
    songCard: {
        height: 160,
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#111111',
    },

    songPlayCircle: {
        position: 'absolute',
        bottom: 50,
        left: 10,
    },

    songBottom: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
    },

    // Selected artist all songs
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginVertical: 10,
    },

    musicListRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16161B',
        borderRadius: 16,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#26262B',
    },

    musicListInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
});

export default HomeSkeleton;
