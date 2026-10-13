import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Sound from 'react-native-nitro-sound';

// Update these imports paths based on where you place this file in your project
import Header from '../../share/components/Header';
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import color, { useAppColors } from '../../share/constants/color';
import { Inter } from '../../share/constants/fonts';
import { Images, Logo } from '../../share/constants/media';
import { storage } from '../../share/storage/mmkv';
import { GlobalImage } from '../../share/utils/GlobalImage';

const DownloadsScreen = () => {
    const navigation = useNavigation();
    const colors = useAppColors();

    const [downloads, setDownloads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState<string | null>(null);

    useEffect(() => {
        fetchDownloads();
    }, []);

    const fetchDownloads = () => {
        setLoading(true);
        try {
            // Fetching downloaded songs metadata saved locally in MMKV
            const savedDownloads = storage.getString('downloaded_songs');
            if (savedDownloads) {
                setDownloads(JSON.parse(savedDownloads));
            }
        } catch (error) {
            console.log("Error fetching downloads:", error);
        } finally {
            setLoading(false);
        }
    };

    const removeDownload = (id: string) => {
        Alert.alert(
            "Remove Download",
            "Are you sure you want to remove this song from your downloads?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        const updatedDownloads = downloads.filter(item => item.id !== id);
                        setDownloads(updatedDownloads);
                        storage.set('downloaded_songs', JSON.stringify(updatedDownloads));

                        // Note: If you are downloading actual files to the device storage 
                        // using react-native-fs or rn-fetch-blob, add the file deletion logic here.
                    }
                }
            ]
        );
    };

    const playRecording = async (item: any) => {
        stopRecording();
        try {
            // Assumes item.local_path contains the file path on the device
            const result = await Sound.startPlayer(item.local_path || item.recording_url);
            setPlayingId(item.id);

            Sound.removePlayBackListener();
            Sound.addPlayBackListener((e) => {
                if (e.currentPosition >= e.duration) {
                    stopRecording();
                }
            });
        } catch (error) {
            console.log('Play error:', error);
            Alert.alert("Error", "Could not play the downloaded file.");
        }
    };

    const stopRecording = () => {
        Sound.stopPlayer();
        Sound.removePlayBackListener();
        setPlayingId(null);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.card, { borderColor: colors.searhbarbordercolor }]}
        >
            <AppImage
                source={item.image ? GlobalImage(item.image) : Images.profile}
                width={62}
                height={64}
                radius={8}
            />

            <View style={styles.content}>
                <AppText fontSize={12} fontWeight="700" color={colors.darkthemetext} fontFamily={Inter.medium}>
                    {item.title || "Unknown Title"}
                </AppText>
                <AppText fontSize={10} color={colors.darkthemetext} marginTop={4} fontFamily={Inter.regular}>
                    {item.artist || "Unknown Artist"}
                </AppText>
                <AppText fontSize={8} color="#AFA7A2" marginTop={6} fontFamily={Inter.light}>
                    Downloaded {item.download_date || "recently"}
                </AppText>
            </View>

            <View style={styles.right}>
                <TouchableOpacity
                    style={[styles.playButton, { borderColor: '#F3870C' }]}
                    onPress={() => playingId === item.id ? stopRecording() : playRecording(item)}
                >
                    {playingId === item.id ? (
                        <View style={styles.pauseContainer}>
                            <View style={styles.pauseLine} />
                            <View style={styles.pauseLine} />
                        </View>
                    ) : (
                        <AppImage source={Images.playicon} width={10} height={10} tintColor="#F3870C" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeDownload(item.id)}
                >
                    <AppImage source={Images.import} width={18} height={18} tintColor="#E52450" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.darkbackround }]}>
            <Header
                headername="Downloads"
                headertitle="Listen offline anytime"
                onLeftPress={() => navigation.goBack()}
            />

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#EFCB61" />
                </View>
            ) : downloads.length > 0 ? (
                <FlatList
                    data={downloads}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <AppImage source={Images.import} width={40} height={40} tintColor="#AFA7A2" />
                    <AppText color={colors.darkthemetext} fontSize={16} marginTop={15} fontFamily={Inter.medium}>
                        No downloads yet
                    </AppText>
                    <AppText color="#AFA7A2" fontSize={12} marginTop={5} fontFamily={Inter.regular}>
                        Songs you download will appear here.
                    </AppText>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingTop: 20,
        paddingBottom: 80,
        gap: 12,
    },
    card: {
        borderRadius: 10,
        padding: 12,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E120F',
    },
    pauseContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    pauseLine: {
        width: 3,
        height: 12,
        backgroundColor: '#F3870C',
        borderRadius: 10,
    },
    deleteButton: {
        padding: 5,
    }
});

export default DownloadsScreen;