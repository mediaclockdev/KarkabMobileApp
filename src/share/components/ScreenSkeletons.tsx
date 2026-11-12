import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
    background: '#050505',
    base: '#191A1E',
    highlight: '#2E3038',
    border: '#292A2E',
    card: '#16161B',
    cardBorder: '#26262B',
};

type BlockProps = {
    width?: any;
    height: number;
    radius?: number;
    style?: any;
};

export const SkeletonBlock = ({
    width = '100%',
    height,
    radius = 8,
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

// ==================== PROFILE SKELETON ====================
export const ProfileSkeleton = () => (
    <View style={styles.profileContainer}>
        {/* Profile information */}
        <View style={styles.profileHeader}>
            <SkeletonBlock width={68} height={68} radius={34} />
            <View style={styles.profileInfo}>
                <SkeletonBlock width="46%" height={20} radius={5} />
                <SkeletonBlock
                    width={92}
                    height={28}
                    radius={20}
                    style={{ marginTop: 6 }}
                />
            </View>
        </View>

        {/* Profile menu (4 items, each 49px height matching Profile.tsx) */}
        <View style={styles.menuCard}>
            {[0, 1, 2, 3].map((item, index) => (
                <View
                    key={`profile-menu-${item}`}
                    style={[
                        styles.menuRow,
                        index !== 3 && styles.menuRowBorder,
                    ]}
                >
                    <View style={styles.menuLeft}>
                        <SkeletonBlock width={20} height={20} radius={5} />
                        <SkeletonBlock
                            width={item === 2 ? '50%' : '42%'}
                            height={15}
                            radius={4}
                        />
                    </View>
                    <SkeletonBlock width={10} height={16} radius={3} />
                </View>
            ))}
        </View>

        {/* Recent recordings heading */}
        <View style={styles.recentHeader}>
            <SkeletonBlock width={140} height={18} radius={4} />
            <SkeletonBlock width={55} height={16} radius={4} />
        </View>

        {/* Recent recordings (matching Profile.tsx recordingCard) */}
        <View style={styles.recordingCard}>
            {[0, 1, 2].map((item, index) => (
                <View
                    key={`recording-${item}`}
                    style={[
                        styles.recordingRow,
                        index !== 2 && styles.recordingRowBorder,
                    ]}
                >
                    <SkeletonBlock width={48} height={48} radius={8} />
                    <View style={styles.recordingInfo}>
                        <SkeletonBlock width="58%" height={15} radius={4} />
                        <SkeletonBlock
                            width="40%"
                            height={12}
                            radius={4}
                            style={{ marginTop: 5 }}
                        />
                    </View>
                    <SkeletonBlock width={32} height={32} radius={16} />
                    <SkeletonBlock width={10} height={22} radius={3} />
                </View>
            ))}
        </View>

        {/* Create playlist button (height 42, radius 11 matching Profile.tsx) */}
        <View style={styles.createPlaylist}>
            <SkeletonBlock width={135} height={16} radius={4} />
        </View>
    </View>
);

// ==================== PLAYLIST SKELETON ====================
export const PlaylistSkeleton = () => (
    <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.playlistContainer}
        contentContainerStyle={styles.playlistContent}
    >
        {/* Classic playlists heading */}
        <View style={styles.playlistHeading}>
            <View style={styles.headingTitle}>
                <SkeletonBlock width={18} height={18} radius={4} />
                <SkeletonBlock width={150} height={20} radius={4} />
            </View>
            <SkeletonBlock
                width={190}
                height={13}
                radius={4}
                style={{ marginTop: 6 }}
            />
        </View>

        {/* Horizontal playlist cards (width 150, height 150) */}
        <View style={styles.horizontalPlaylists}>
            {[0, 1, 2].map(item => (
                <View key={`playlist-${item}`} style={styles.playlistItem}>
                    <View style={styles.playlistImage}>
                        <SkeletonBlock
                            width="100%"
                            height="100%"
                            radius={12}
                        />
                        <View style={styles.playlistPlay}>
                            <SkeletonBlock width={36} height={36} radius={18} />
                        </View>
                    </View>
                    <SkeletonBlock
                        width="76%"
                        height={15}
                        radius={4}
                        style={{ marginTop: 10 }}
                    />
                    <SkeletonBlock
                        width="35%"
                        height={12}
                        radius={4}
                        style={{ marginTop: 5 }}
                    />
                </View>
            ))}
        </View>

        {/* Selected playlist details banner */}
        <View style={styles.selectedPlaylist}>
            <SkeletonBlock width={82} height={82} radius={10} />
            <View style={styles.selectedInfo}>
                <SkeletonBlock width="70%" height={17} radius={4} />
                <SkeletonBlock
                    width="95%"
                    height={12}
                    radius={3}
                    style={{ marginTop: 6 }}
                />
                <SkeletonBlock
                    width="60%"
                    height={12}
                    radius={3}
                    style={{ marginTop: 4 }}
                />
                <SkeletonBlock
                    width="28%"
                    height={12}
                    radius={3}
                    style={{ marginTop: 6 }}
                />
            </View>
            <SkeletonBlock width={42} height={42} radius={21} />
        </View>

        {/* Songs heading */}
        <View style={styles.songsHeading}>
            <View style={styles.headingTitle}>
                <SkeletonBlock width={20} height={20} radius={4} />
                <SkeletonBlock width={70} height={18} radius={4} />
            </View>
            <SkeletonBlock width={52} height={15} radius={4} />
        </View>

        {/* Song cards (Library-style cards matching PlayListScreen / Librarylist) */}
        {[0, 1, 2].map(item => (
            <LibrarySongCardSkeleton key={`playlist-song-${item}`} />
        ))}
    </ScrollView>
);

// ==================== LIBRARY SONG CARD SKELETON ====================
export const LibrarySongCardSkeleton = () => (
    <View style={styles.songCard}>
        {/* Artwork + Play overlay */}
        <View style={styles.songArtworkWrapper}>
            <SkeletonBlock width={68} height={68} radius={15} />
            <View style={styles.songPlayFab}>
                <SkeletonBlock width={24} height={24} radius={12} />
            </View>
        </View>

        {/* Song info */}
        <View style={styles.songInfo}>
            <SkeletonBlock width="68%" height={16} radius={4} />
            <SkeletonBlock
                width="44%"
                height={12}
                radius={3}
                style={{ marginTop: 5 }}
            />
            <View style={styles.songMeta}>
                <SkeletonBlock width={50} height={18} radius={9} />
                <SkeletonBlock width={34} height={12} radius={3} />
            </View>
        </View>

        {/* Right actions: 3 dots + Sing CTA */}
        <View style={styles.songActions}>
            <SkeletonBlock width={14} height={14} radius={3} />
            <SkeletonBlock width={94} height={30} radius={15} />
        </View>
    </View>
);

// ==================== LIBRARY SKELETON ====================
export const LibrarySkeleton = ({ count = 5 }: { count?: number }) => (
    <View style={styles.libraryContainer}>
        {Array.from({ length: count }).map((_, idx) => (
            <LibrarySongCardSkeleton key={`library-card-${idx}`} />
        ))}
    </View>
);

const styles = StyleSheet.create({
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

    // Profile skeleton
    profileContainer: {
        width: '100%',
        paddingBottom: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    menuCard: {
        backgroundColor: COLORS.base,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 20,
    },
    menuRow: {
        height: 49,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    menuRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recordingCard: {
        backgroundColor: COLORS.base,
        borderRadius: 13,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 14,
    },
    recordingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
    },
    recordingRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#202126',
    },
    recordingInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    createPlaylist: {
        width: '100%',
        height: 42,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#A53DDB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111216',
        marginTop: 6,
    },

    // Playlist skeleton
    playlistContainer: {
        width: '100%',
    },
    playlistContent: {
        width: '100%',
        paddingBottom: 130,
    },
    playlistHeading: {
        marginTop: 20,
        marginBottom: 16,
    },
    headingTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    horizontalPlaylists: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 25,
    },
    playlistItem: {
        width: 150,
    },
    playlistImage: {
        width: 150,
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    playlistPlay: {
        position: 'absolute',
        right: 9,
        bottom: 9,
    },
    selectedPlaylist: {
        minHeight: 110,
        backgroundColor: '#171717',
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 25,
    },
    selectedInfo: {
        flex: 1,
        minWidth: 0,
    },
    songsHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },

    // Library song card skeleton
    songCard: {
        backgroundColor: COLORS.card,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        padding: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    songArtworkWrapper: {
        position: 'relative',
        width: 68,
        height: 68,
    },
    songPlayFab: {
        position: 'absolute',
        right: -6,
        bottom: -4,
    },
    songInfo: {
        flex: 1,
        minWidth: 0,
        marginLeft: 14,
        justifyContent: 'center',
    },
    songMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    songActions: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 68,
        marginLeft: 10,
    },

    // Library skeleton container
    libraryContainer: {
        width: '100%',
        paddingVertical: 4,
    },
});
