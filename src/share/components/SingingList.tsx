import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import AppImage from "./AppImage";
import AppText from "./AppText";
import { Inter } from "../constants/fonts";
import color, { useAppColors } from "../constants/color";
import { Images } from "../constants/media";
import { useState } from "react";
import { Sound } from "react-native-nitro-sound";
import { useAppSelector } from "../hooks/useAppSelector";
import { useNavigation } from "@react-navigation/native";

export default function SingingList(populardatas: any) {
    const navigation = useNavigation();
    const colors = useAppColors();
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadings, setLoadings] = useState(false);
    const playsong = useAppSelector
        (
            (state: any) => state.auth.playsong
        );

    const recentdata = [
        {
            id: 1,
            title: "Continue\nLast Song",
            title1: "Mabrook",
            image: Images.singplay
        },
        {
            id: 2,
            title: "Most Sung\n Song",
            title1: "Top 50",
            image: Images.ylit
        },
        {
            id: 3,
            title: "Beginner\nFriendly", title1: "Easy to sing", image: Images.star1
        },
        { id: 4, title: "Trending\nThis week", title1: "New songs", image: Images.uparrow },

    ];

    const pauseAudio = async () => {
        try {
            console.log({
                isPlaying,
                isPaused,
            });
            console.log("PAUSE CLICKED");
            await Sound.pausePlayer();
            console.log("PAUSE SUCCESSfhfhfhfh ");

            setIsPlaying(false);
            // dispatch(isPaused(true));
            setIsPaused(true);
        } catch (error) {
            console.log("PAUSE ERROR", error);
        }
    };

    const resumeAudio = async () => {
        try {
            await Sound.resumePlayer();

            setIsPlaying(true);
            setIsPaused(false);
        } catch (error) {
            console.log(error);
        }
    };

    // console.log("playsong", playsong?.id);
    return (



        <View style={{ flexDirection: "row", gap: 10, flexWrap: 'wrap', }}>

            <FlatList
                data={recentdata}
                numColumns={4}
                scrollEnabled={false}
                style={{ marginTop: 10 }}
                renderItem={({ item }) => (
                    <>
                        {
                            item.id === 1 && !playsong?.id == undefined ? (
                                <View
                                    style={{
                                        margin: 5,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: '#211513',
                                        padding: 10,
                                        width: '22.4%',
                                    }}

                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (isPlaying) {
                                                pauseAudio();
                                            } else {
                                                resumeAudio();
                                            }
                                        }}
                                        style={styles.playButton}
                                    >
                                        {loadings ? (
                                            <ActivityIndicator
                                                size="small" color="#FFFFFF" />
                                        ) : (
                                            <>
                                                {
                                                    isPaused ?
                                                        <AppImage
                                                            source={Images.playicon}
                                                            width={10}
                                                            height={10}
                                                            tintColor={color.darkthemetext}
                                                        />
                                                        :
                                                        <View style={styles.pauseContainer}>
                                                            <View style={[styles.pauseLine, { backgroundColor: color.darkthemetext }]} />
                                                            <View style={[styles.pauseLine, { backgroundColor: color.darkthemetext }]} />
                                                        </View>
                                                }

                                            </>)}
                                    </TouchableOpacity>

                                    <AppText
                                        color={colors.darkthemetext}
                                        fontSize={12}
                                        fontFamily={Inter.regular}
                                        marginTop={5}
                                        textAlign="center"
                                    >
                                        {item.title}
                                    </AppText>
                                    <AppText
                                        color={'#BE6800'}
                                        fontSize={10}
                                        fontFamily={Inter.regular}
                                        marginTop={5}
                                    >
                                        {item.title1}
                                    </AppText>
                                </View>)
                                :
                                item.id != 1 ?
                                    <TouchableOpacity
                                        style={{
                                            //   flex: 1,
                                            margin: 5,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            borderColor: '#211513',
                                            padding: 10,
                                            width: '22.4%',
                                        }}
                                        onPress={() => {
                                            console.log("populardatas", populardatas);
                                            if (item.id == 2) {
                                                (navigation as any).navigate('SongsListScreen', {
                                                    songs: populardatas?.populardatas,
                                                    previousScreen: 'Search',
                                                });
                                            }

                                        }}
                                    >
                                        <AppImage
                                            source={item.image}
                                            width={38}
                                            height={38}
                                            resizeMode="contain"
                                        //style={{ borderRadius: 40 }}
                                        />
                                        <AppText
                                            color={colors.darkthemetext}
                                            fontSize={12}
                                            fontFamily={Inter.regular}
                                            marginTop={5}
                                            textAlign="center"
                                        >
                                            {item.title}
                                        </AppText>
                                        <AppText
                                            color={'#BE6800'}
                                            fontSize={10}
                                            fontFamily={Inter.regular}
                                            marginTop={5}
                                        >
                                            {item.title1}
                                        </AppText>
                                    </TouchableOpacity> : null}
                    </>

                )}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    playIcon: {
        fontSize: 18,
        color: '#FFFFFF',
        marginLeft: 2,
    },

    pauseContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    pauseLine: {
        width: 3,
        height: 14,
        backgroundColor: '#FFF',
        borderRadius: 10,
    },

    playButton: {
        width: 34,
        height: 34,
        borderRadius: 22,

        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FCE469',

        //    backgroundColor: '#FFFFFF',

        marginHorizontal: 5,
    },
});