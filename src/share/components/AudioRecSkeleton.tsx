
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Dimensions,
    StyleSheet,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get('window');

const COLORS = {
    background: '#0D0D12',
    base: '#19191F',
    highlight: '#292932',
    border: '#292932',
};

const ARTWORK_SIZE = Math.min(SCREEN_WIDTH * 0.58, 380);

const SkeletonBlock = ({
    width = '100%',
    height,
    radius = 10,
    style,
}: {
    width?: number | `${number}%`;
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
        outputRange: [-SCREEN_WIDTH * 0.8, SCREEN_WIDTH * 0.8],
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

// Header
const HeaderSkeleton = () => (
    <View style={styles.header}>
        <View style={styles.headerLeft}>
            <SkeletonBlock width={9} height={16} radius={3} />
            <SkeletonBlock width={75} height={20} radius={4} />
        </View>

        <SkeletonBlock width={125} height={23} radius={5} />

        <SkeletonBlock width={35} height={12} radius={5} />
    </View>
);

// Lyrics card
const LyricsSkeleton = () => (
    <View style={styles.lyricsContainer}>
        <SkeletonBlock width="35%" height={22} radius={5} />

        <SkeletonBlock
            width="72%"
            height={21}
            radius={5}
            style={styles.lyricSecondLine}
        />

        <View style={styles.lyricsActions}>
            <View style={styles.lyricsButton}>
                <SkeletonBlock width={17} height={19} radius={3} />
                <SkeletonBlock width={85} height={15} radius={4} />
            </View>

            <View style={styles.lyricsButton}>
                <SkeletonBlock width={27} height={17} radius={4} />
                <SkeletonBlock width={75} height={15} radius={4} />
            </View>
        </View>
    </View>
);

// Progress bar
const ProgressSkeleton = () => (
    <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
            <View style={styles.progressDot}>
                <SkeletonBlock width={16} height={16} radius={8} />
            </View>
        </View>

        <View style={styles.progressLabels}>
            <SkeletonBlock width={38} height={13} radius={4} />
            <SkeletonBlock width={38} height={13} radius={4} />
        </View>
    </View>
);

// Playback controls
const PlaybackControlsSkeleton = () => (
    <View style={styles.controls}>
        {/* Shuffle */}
        <SkeletonBlock width={25} height={13} radius={3} />

        {/* Previous */}
        <SkeletonBlock width={29} height={30} radius={4} />

        {/* Play */}
        <SkeletonBlock
            width={108}
            height={108}
            radius={54}
            style={styles.playButton}
        />

        {/* Next */}
        <SkeletonBlock width={29} height={30} radius={4} />

        {/* Repeat */}
        <SkeletonBlock width={25} height={25} radius={13} />
    </View>
);

// Bottom sing button
const SingButtonSkeleton = () => (
    <View style={styles.bottomSection}>
        <SkeletonBlock
            width="100%"
            height={84}
            radius={50}
        />

        <SkeletonBlock
            width={205}
            height={16}
            radius={5}
            style={styles.bottomSubtitle}
        />
    </View>
);

const AudioRecSkeleton = () => {
    return (
        <View style={styles.container}>

            {/* Header */}
            <HeaderSkeleton />

            {/* Song Artwork */}
            <View style={styles.artworkContainer}>
                <SkeletonBlock
                    width={ARTWORK_SIZE}
                    height={ARTWORK_SIZE}
                    radius={37}
                    style={styles.artwork}
                />
            </View>

            {/* Song Information */}
            <View style={styles.songInfo}>
                <SkeletonBlock
                    width="35%"
                    height={24}
                    radius={5}
                />

                <SkeletonBlock
                    width="55%"
                    height={20}
                    radius={5}
                    style={styles.artist}
                />
            </View>

            {/* Lyrics Card */}
            <LyricsSkeleton />

            {/* Progress */}
            <View style={styles.playerBottom}>
                <ProgressSkeleton />

                {/* Playback Controls */}
                <PlaybackControlsSkeleton />

                {/* Sing This Song */}
                <SingButtonSkeleton />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
        paddingTop: 10,
    },

    block: {
        backgroundColor: COLORS.base,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    shimmerGradient: {
        width: SCREEN_WIDTH * 1.6,
        height: '100%',
        opacity: 0.95,
    },

    // Header
    header: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    // Artwork
    artworkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Math.max(35, SCREEN_HEIGHT * 0.065),
    },

    artwork: {
        borderColor: '#34343A',
        borderWidth: 1,
    },

    // Song information
    songInfo: {
        alignItems: 'center',
        marginTop: 22,
        gap: 12,
    },

    artist: {
        marginTop: 1,
    },

    // Lyrics card
    lyricsContainer: {
        width: '100%',
        minHeight: 217,
        marginTop: 25,
        paddingHorizontal: 18,
        paddingVertical: 27,
        borderRadius: 34,
        backgroundColor: '#191920',
        borderWidth: 1.5,
        borderColor: '#303039',
        alignItems: 'center',
        justifyContent: 'center',
    },

    lyricSecondLine: {
        marginTop: 17,
    },

    lyricsActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginTop: 24,
    },

    lyricsButton: {
        height: 50,
        paddingHorizontal: 15,
        borderRadius: 30,
        backgroundColor: '#25252D',
        borderWidth: 1,
        borderColor: '#35353F',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
    },

    // Bottom player
    playerBottom: {
        marginTop: 'auto',
        paddingBottom: 55,
    },

    // Progress
    progressContainer: {
        marginBottom: 22,
    },

    progressTrack: {
        height: 5,
        backgroundColor: '#29292E',
        borderRadius: 5,
        justifyContent: 'center',
    },

    progressDot: {
        position: 'absolute',
        left: 0,
        top: -6,
        width: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: COLORS.background,
        borderWidth: 2,
        borderColor: '#C33FEA',
        alignItems: 'center',
        justifyContent: 'center',
    },

    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },

    // Playback controls
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 35,
        marginTop: 0,
        marginBottom: 30,
    },

    playButton: {
        backgroundColor: '#24242D',
        borderColor: '#383842',
        borderWidth: 2,
    },

    // Bottom button
    bottomSection: {
        width: '100%',
        alignItems: 'center',
    },

    bottomSubtitle: {
        marginTop: 17,
    },
});

export default AudioRecSkeleton;
