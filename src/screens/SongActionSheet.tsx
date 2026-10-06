import React from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';


import AppText from '../share/components/AppText';
import color from '../share/constants/color';
import { Inter } from '../share/constants/fonts';
import { Logo } from '../share/constants/media';
import AppImage from '../share/components/AppImage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SongAction {
    id: string;
    title: string;
    icon?: any;
    onPress: () => void;
    danger?: boolean;
}

interface SongActionSheetProps {
    visible: boolean;
    song?: any;
    onClose: () => void;

}

const SongActionSheet = ({
    visible,
    song,
    onClose,

}: SongActionSheetProps) => {
    const translateY = React.useRef(
        new Animated.Value(SCREEN_HEIGHT),
    ).current;

    React.useEffect(() => {
        Animated.spring(translateY, {
            toValue: visible ? 0 : SCREEN_HEIGHT,
            useNativeDriver: true,
            damping: 20,
            stiffness: 180,
        }).start();
    }, [visible, translateY]);

    if (!visible && translateY._value === SCREEN_HEIGHT) {
        return null;
    }

    const handleAction = (action: SongAction) => {
        action.onPress();
        onClose();
    };

    const actions = [
        {
            id: 'top-song',
            title: 'Add to Top Songs',
            onPress: () => {
                console.log('Add to Top Songs:', song);
            },
        },
        {
            id: 'playlist',
            title: 'Add to Playlist',
            onPress: () => {
                console.log('Add to Playlist:', song);
            },
        },
        {
            id: 'like',
            title: 'Like',
            onPress: () => {
                console.log('Like:', song);
            },
        },
        {
            id: 'share',
            title: 'Share',
            onPress: () => {
                console.log('Share:', song);
            },
        },
        {
            id: 'copy-link',
            title: 'Copy Song Link',
            onPress: () => {
                console.log('Copy Song Link:', song);
            },
        },
    ];

    return (
        <View
            pointerEvents={visible ? 'auto' : 'none'}
            style={StyleSheet.absoluteFill}
        >
            {/* Background */}
            <Pressable style={styles.overlay} onPress={onClose} />

            {/* Bottom sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [{ translateY }],
                    },
                ]}
            >
                {/* Drag indicator */}
                <View style={styles.dragIndicator} />

                {/* Song information */}
                {song && (
                    <View style={styles.songHeader}>
                        <View style={styles.songImageContainer}>
                            {song?.image || song?.cover_image || song?.coverImage ? (
                                <AppImage
                                    source={{
                                        uri:
                                            song?.image ||
                                            song?.cover_image ||
                                            song?.coverImage,
                                    }}
                                    width={56}
                                    height={56}
                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <AppText style={styles.musicIcon}>♫</AppText>
                                </View>
                            )}
                        </View>

                        <View style={styles.songInfo}>
                            <AppText
                                numberOfLines={1}
                                fontSize={15}
                                fontFamily={Inter.semiBold}
                                color={color.darkthemetext}
                            >
                                {song?.title || song?.name || 'Unknown Song'}
                            </AppText>

                            <AppText
                                numberOfLines={1}
                                fontSize={12}
                                fontFamily={Inter.regular}
                                color="#999999"
                                style={styles.artist}
                            >
                                {song?.artist_name ||
                                    song?.artistName ||
                                    song?.artist ||
                                    'Unknown Artist'}
                            </AppText>
                        </View>
                    </View>
                )}

                <View style={styles.separator} />

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    {actions.map(action => (
                        <TouchableOpacity
                            key={action.id}
                            activeOpacity={0.7}
                            style={styles.action}
                            onPress={() => handleAction(action)}
                        >
                            <View style={styles.actionIcon}>
                                {action.icon ? (
                                    <AppImage
                                        source={action.icon}
                                        width={20}
                                        height={20}
                                        tintColor={
                                            action.danger
                                                ? '#FF4B4C'
                                                : color.darkthemetext
                                        }
                                    />
                                ) : (
                                    <AppText
                                        fontSize={20}
                                        color={
                                            action.danger
                                                ? '#FF4B4C'
                                                : color.darkthemetext
                                        }
                                    >
                                        •
                                    </AppText>
                                )}
                            </View>

                            <AppText
                                fontSize={14}
                                fontFamily={Inter.medium}
                                color={
                                    action.danger
                                        ? '#FF4B4C'
                                        : color.darkthemetext
                                }
                            >
                                {action.title}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Cancel */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.cancelButton}
                    onPress={onClose}
                >
                    <AppText
                        fontSize={14}
                        fontFamily={Inter.semiBold}
                        color={color.darkthemetext}
                    >
                        Cancel
                    </AppText>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default SongActionSheet;

const styles = StyleSheet.create({
    overlay: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,

    },

    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#151515',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 28,
        zIndex: 1000,
    },

    dragIndicator: {
        width: 42,
        height: 4,
        borderRadius: 10,
        backgroundColor: '#555555',
        alignSelf: 'center',
        marginBottom: 18,
    },

    songHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    songImageContainer: {
        width: 56,
        height: 56,
        borderRadius: 8,
        overflow: 'hidden',
    },

    imagePlaceholder: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#252525',
    },

    musicIcon: {
        fontSize: 24,
        color: '#999999',
    },

    songInfo: {
        flex: 1,
        marginLeft: 12,
    },

    artist: {
        marginTop: 5,
    },

    separator: {
        height: 1,
        backgroundColor: '#292929',
        marginBottom: 6,
    },

    actionsContainer: {
        marginTop: 2,
    },

    action: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
    },

    actionIcon: {
        width: 42,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },

    cancelButton: {
        height: 52,
        marginTop: 8,
        borderRadius: 12,
        backgroundColor: '#252525',
        alignItems: 'center',
        justifyContent: 'center',
    },
});