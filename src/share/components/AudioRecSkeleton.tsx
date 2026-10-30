import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Dimensions,
    StyleSheet,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
    background: '#050505',
    base: '#151515',
    highlight: '#292929',
    border: '#33200B',
};

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

const AudioRecSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <SkeletonBlock width={40} height={40} radius={20} />
                <SkeletonBlock width="38%" height={18} radius={5} />
                <SkeletonBlock width={40} height={40} radius={20} />
            </View>

            {/* Song artwork */}
            <View style={styles.artworkContainer}>
                <SkeletonBlock
                    width={Math.min(SCREEN_WIDTH * 0.66, 270)}
                    height={Math.min(SCREEN_WIDTH * 0.66, 270)}
                    radius={22}
                    style={styles.artwork}
                />
            </View>

            {/* Song information */}
            <View style={styles.songInfo}>
                <SkeletonBlock width="68%" height={21} radius={6} />
                <SkeletonBlock
                    width="42%"
                    height={13}
                    radius={5}
                    style={styles.artist}
                />
            </View>

            {/* Vocal / instrumental controls */}
            <View style={styles.modeRow}>
                <SkeletonBlock width="46%" height={42} radius={22} />
                <SkeletonBlock width="46%" height={42} radius={22} />
            </View>

            {/* Lyrics section */}
            <View style={styles.lyricsContainer}>
                <SkeletonBlock width="32%" height={15} radius={5} />
                <View style={styles.lyricsLines}>
                    <SkeletonBlock width="78%" height={13} radius={5} />
                    <SkeletonBlock width="90%" height={13} radius={5} />
                    <SkeletonBlock width="65%" height={13} radius={5} />
                    <SkeletonBlock width="84%" height={13} radius={5} />
                    <SkeletonBlock width="56%" height={13} radius={5} />
                </View>
            </View>

            {/* Recording progress */}
            <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                    <SkeletonBlock width={42} height={10} radius={4} />
                    <SkeletonBlock width={42} height={10} radius={4} />
                </View>
                <SkeletonBlock width="100%" height={5} radius={4} />
            </View>

            {/* Audio controls */}
            <View style={styles.controls}>
                <SkeletonBlock width={30} height={30} radius={15} />
                <SkeletonBlock width={38} height={38} radius={19} />
                <SkeletonBlock width={66} height={66} radius={33} />
                <SkeletonBlock width={38} height={38} radius={19} />
                <SkeletonBlock width={30} height={30} radius={15} />
            </View>

            {/* Bottom action buttons */}
            <View style={styles.bottomActions}>
                <SkeletonBlock width="47%" height={48} radius={25} />
                <SkeletonBlock width="47%" height={48} radius={25} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 18,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 22,
    },
    artworkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    artwork: {
        borderColor: '#3A260F',
        borderWidth: 1,
    },
    songInfo: {
        alignItems: 'center',
        marginTop: 20,
        gap: 10,
    },
    artist: {
        marginTop: 1,
    },
    modeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    lyricsContainer: {
        flex: 1,
        minHeight: 120,
        marginTop: 26,
        padding: 15,
        borderRadius: 16,
        backgroundColor: '#0C0C0C',
        borderWidth: 1,
        borderColor: '#21190F',
    },
    lyricsLines: {
        alignItems: 'center',
        gap: 19,
        marginTop: 24,
    },
    progressContainer: {
        marginTop: 18,
        gap: 10,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 25,
        paddingHorizontal: 6,
    },
    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 24,
        marginBottom: 20,
    },
});

export default AudioRecSkeleton;
