
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
    base: '#171717',
    highlight: '#292929',
    border: '#292929',
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

// Section heading
const SectionHeadingSkeleton = () => (
    <View style={styles.sectionHeading}>
        <SkeletonBlock width="43%" height={25} radius={4} />
        <SkeletonBlock width={18} height={24} radius={4} />
    </View>
);

// Recently Played card
const RecentlyPlayedSkeleton = ({ width }: { width: number }) => (
    <View style={[styles.recentCard, { width }]}>
        <SkeletonBlock
            width="100%"
            height="100%"
            radius={12}
        />

        <View style={styles.mixLabel}>
            <SkeletonBlock width={25} height={11} radius={3} />
        </View>

        <View style={styles.playButton}>
            <SkeletonBlock
                width={38}
                height={38}
                radius={19}
            />
        </View>
    </View>
);

// Browse Collections card
const CollectionSkeleton = () => (
    <View style={styles.collectionCard}>
        <SkeletonBlock
            width={38}
            height={38}
            radius={10}
        />

        <View style={styles.collectionInfo}>
            <SkeletonBlock width="90%" height={11} radius={4} />
            <SkeletonBlock
                width="70%"
                height={10}
                radius={4}
                style={{ marginTop: 5 }}
            />
        </View>

        <SkeletonBlock
            width={13}
            height={20}
            radius={4}
        />
    </View>
);

const HomeSkeleton = () => {
    const bannerHeight = SCREEN_WIDTH * 0.56;
    const recentCardWidth = Math.min(172, SCREEN_WIDTH * 0.27);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        >
            {/* Hero Banner */}
            <View style={[styles.banner, { height: bannerHeight }]}>
                <SkeletonBlock
                    width="100%"
                    height="100%"
                    radius={25}
                />

                <View style={styles.bannerContent}>
                    <SkeletonBlock
                        width="55%"
                        height={17}
                        radius={4}
                    />

                    <SkeletonBlock
                        width={135}
                        height={53}
                        radius={28}
                        style={styles.bannerButton}
                    />
                </View>

                {/* Pagination */}
                <View style={styles.pagination}>
                    <SkeletonBlock width={16} height={5} radius={3} />
                    <SkeletonBlock width={16} height={5} radius={3} />
                    <SkeletonBlock width={36} height={5} radius={3} />
                </View>
            </View>

            {/* Recently Played */}
            <View style={styles.section}>
                <SectionHeadingSkeleton />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                >
                    <View style={styles.recentRow}>
                        {[0, 1, 2, 3].map(item => (
                            <RecentlyPlayedSkeleton
                                key={`recent-${item}`}
                                width={recentCardWidth}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Browse Collections */}
            <View style={styles.collectionSection}>
                <SectionHeadingSkeleton />

                <View style={styles.collectionGrid}>
                    {[0, 1, 2, 3, 4, 5].map(item => (
                        <View
                            key={`collection-${item}`}
                            style={styles.collectionItem}
                        >
                            <CollectionSkeleton />
                        </View>
                    ))}
                </View>
            </View>

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
        paddingHorizontal: 14,
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

    // Hero banner
    banner: {
        width: '100%',
        borderRadius: 25,
        overflow: 'hidden',
        marginBottom: 55,
        position: 'relative',
    },

    bannerContent: {
        position: 'absolute',
        top: '16%',
        left: '6%',
        right: '6%',
        alignItems: 'flex-start',
    },

    bannerButton: {
        marginTop: 15,
    },

    pagination: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    // Sections
    section: {
        marginBottom: 42,
    },

    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },

    // Recently played
    recentRow: {
        flexDirection: 'row',
        gap: 20,
        paddingBottom: 3,
    },

    recentCard: {
        height: 170,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#49301A',
        position: 'relative',
    },

    mixLabel: {
        position: 'absolute',
        bottom: 15,
        left: 15,
    },

    playButton: {
        position: 'absolute',
        right: 10,
        bottom: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Browse collections
    collectionSection: {
        marginTop: 0,
    },

    collectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 27,
    },

    collectionItem: {
        width: '49%',
    },

    collectionCard: {
        height: 82,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 9,
        borderRadius: 21,
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#272727',
    },

    collectionInfo: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
    },
});

export default HomeSkeleton;
