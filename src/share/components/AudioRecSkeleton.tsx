import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
    background: '#0D0D11',
    base: '#191920',
    highlight: '#2A2A35',
    border: '#2A2A35',
};

const ARTWORK_SIZE = Math.min(SCREEN_WIDTH * 0.58, 230);

const SkeletonBlock = ({
    width = '100%',
    height,
    radius = 10,
    style,
}: {
    width?: number | `${number}%` | '100%';
    height: number;
    radius?: number;
    style?: any;
}) => {
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

// Lyrics preview card
const LyricsSkeleton = () => (
    <View style={styles.lyricsContainer}>
        <SkeletonBlock width="72%" height={20} radius={5} />

        <SkeletonBlock
            width="46%"
            height={15}
            radius={4}
            style={styles.lyricSecondLine}
        />

        <View style={styles.lyricsActions}>
            <SkeletonBlock width={106} height={32} radius={16} />
            <SkeletonBlock width={96} height={32} radius={16} />
        </View>
    </View>
);

// Progress scrubber
const ProgressSkeleton = () => (
    <View style={styles.progressContainer}>
        <View style={styles.progressHitArea}>
            <View style={styles.progressTrack} />
            <View style={styles.progressDot}>
                <SkeletonBlock width={10} height={10} radius={5} />
            </View>
        </View>

        <View style={styles.progressLabels}>
            <SkeletonBlock width={32} height={11} radius={3} />
            <SkeletonBlock width={32} height={11} radius={3} />
        </View>
    </View>
);

// Playback controls (matching AudioRec.tsx)
const PlaybackControlsSkeleton = () => (
    <View style={styles.controls}>
        {/* Shuffle */}
        <SkeletonBlock width={38} height={38} radius={19} />

        {/* Previous */}
        <SkeletonBlock width={36} height={36} radius={18} />

        {/* Hero Play Button (66x66) */}
        <SkeletonBlock
            width={66}
            height={66}
            radius={33}
            style={styles.playButton}
        />

        {/* Next */}
        <SkeletonBlock width={36} height={36} radius={18} />

        {/* Repeat */}
        <SkeletonBlock width={38} height={38} radius={19} />
    </View>
);

// Sing This Song CTA Button
const SingButtonSkeleton = () => (
    <View style={styles.bottomSection}>
        <SkeletonBlock
            width={SCREEN_WIDTH - 25}
            height={52}
            radius={27}
        />

        <SkeletonBlock
            width={200}
            height={12}
            radius={3}
            style={styles.bottomSubtitle}
        />
    </View>
);

const AudioRecSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Content Area */}
            <View style={styles.contentArea}>
                {/* Artwork */}
                <View style={styles.artworkContainer}>
                    <SkeletonBlock
                        width={ARTWORK_SIZE}
                        height={ARTWORK_SIZE}
                        radius={22}
                        style={styles.artwork}
                    />
                </View>

                {/* Song Meta Title & Artist */}
                <View style={styles.songInfo}>
                    <SkeletonBlock
                        width="58%"
                        height={20}
                        radius={5}
                    />

                    <SkeletonBlock
                        width="38%"
                        height={14}
                        radius={4}
                        style={styles.artist}
                    />
                </View>

                {/* Lyric Card */}
                <LyricsSkeleton />
            </View>

            {/* Bottom Player Section */}
            <View style={styles.playerBottom}>
                {/* Scrubber */}
                <ProgressSkeleton />

                {/* Controls */}
                <PlaybackControlsSkeleton />

                {/* Sing This Song CTA */}
                <SingButtonSkeleton />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'space-between',
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

    contentArea: {
        flex: 1,
        justifyContent: 'center',
    },

    // Artwork
    artworkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
        marginBottom: 12,
    },

    artwork: {
        borderColor: '#2A2A35',
        borderWidth: 1,
    },

    // Song information
    songInfo: {
        alignItems: 'center',
        paddingHorizontal: 28,
        marginBottom: 12,
        gap: 6,
    },

    artist: {
        marginTop: 2,
    },

    // Lyrics card
    lyricsContainer: {
        backgroundColor: '#17171F',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginHorizontal: 22,
        marginBottom: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },

    lyricSecondLine: {
        marginTop: 8,
    },

    lyricsActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 12,
    },

    // Bottom player
    playerBottom: {
        paddingTop: 2,
        paddingBottom: 20,
    },

    // Progress
    progressContainer: {
        paddingHorizontal: 24,
        marginTop: 6,
        marginBottom: 4,
    },

    progressHitArea: {
        height: 24,
        justifyContent: 'center',
        position: 'relative',
    },

    progressTrack: {
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        position: 'absolute',
        left: 0,
        right: 0,
    },

    progressDot: {
        position: 'absolute',
        left: '35%',
        top: 7,
    },

    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
    },

    // Playback controls
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 26,
        marginVertical: 8,
    },

    playButton: {
        backgroundColor: '#24232C',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
    },

    // Bottom CTA button
    bottomSection: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 10,
    },

    bottomSubtitle: {
        marginTop: 8,
    },
});

export default AudioRecSkeleton;
