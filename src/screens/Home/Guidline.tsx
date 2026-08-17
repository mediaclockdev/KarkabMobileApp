import React from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

import AppText from "../../share/components/AppText";
import { color } from "../../share/constants/color";
import { Icons, Logos } from "../../share/constants/media";

import AppImage from "../../share/components/AppImage";
import { setLoginState } from "../../auth/redux/authSlice";
import { useAppDispatch } from "../../share/hooks/useAppSelector";
import Toast from "react-native-toast-message";

interface GuidlineProps {
    setVisible: (visible: any) => void;
}

const Guidline: React.FC<GuidlineProps> = ({ setVisible }) => {
    const dispatch = useAppDispatch();

    const { width, height } = useWindowDimensions();

    /*
     * Base device:
     * 375 x 812
     */
    const baseWidth = 375;
    const baseHeight = 812;

    /*
     * Responsive scale
     */
    const widthScale = width / baseWidth;
    const heightScale = height / baseHeight;

    /*
     * Use width for horizontal values
     * Use height for vertical values
     */
    const wp = (value: number) => {
        return Math.round(width * (value / 100));
    };

    const hp = (value: number) => {
        return Math.round(height * (value / 100));
    };

    /*
     * Responsive font size
     *
     * Uses both width and height.
     */
    const fontScale = Math.min(
        widthScale,
        heightScale
    );

    const rf = (
        value: number,
        min: number,
        max: number
    ) => {
        return Math.round(
            Math.min(
                max,
                Math.max(
                    min,
                    value * fontScale
                )
            )
        );
    };

    /*
     * Responsive values
     */

    const titleFontSize = rf(
        29,
        21,
        31
    );

    const descriptionFontSize = rf(
        13,
        8,
        13
    );

    const cardTitleFontSize = rf(
        14,
        9,
        14
    );

    const cardDescriptionFontSize = rf(
        14,
        8,
        14
    );

    const buttonFontSize = rf(
        12,
        9,
        13
    );

    /*
     * Width
     */
    const screenHorizontalPadding = wp(3);

    /*
     * Vertical spacing
     */
    const topMargin = hp(2);

    const cardMarginTop = hp(1.5);

    const buttonMarginTop = hp(1);

    /*
     * Card dimensions
     */
    const cardWidth = wp(90);

    const cardPadding = Math.max(
        7,
        Math.min(17, wp(3))
    );

    const cardIconSize = Math.max(
        40,
        Math.min(54, hp(6))
    );

    const cardIconImageSize = Math.max(
        18,
        Math.min(22, hp(3))
    );

    /*
     * Button dimensions
     */
    const buttonPaddingVertical = Math.max(
        10,
        Math.min(18, hp(2))
    );

    /*
     * Bottom margin
     */
    const bottomMargin = hp(6);

    const data = [
        {
            icon: Icons.browse,
            title: "1. Browse SHEIN",
            description:
                "Explore the catalog and select your favorite items.",
        },
        {
            icon: Icons.share,
            title: "2. Share Your Cart",
            description:
                "Paste links or share your cart review for agent review.",
        },
        {
            icon: Icons.searchperson,
            title: "3. Find an Agent",
            description:
                "Browse verified agents in your area.",
        },
        {
            icon: Icons.confirm,
            title: "4. Confirm Order",
            description:
                "Agent reviews and provides final pricing with shipping.",
        },
        {
            icon: Icons.track,
            title: "5. Track Progress",
            description:
                "Stay informed with real-time updates as your order moves.",
        },
        {
            icon: Icons.receive,
            title: "6. Receive Delivery",
            description:
                "Collect from your agent or get it delivered to your door.",
        },
    ];

    const handleBecomeAgent = () => {
        Toast.show({
            type: "info",
            text1: "Become an Agent",
            text2: "Feature coming soon",
            position: "bottom",
        });
    };

    return (
        <>
            <ScrollView
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    alignItems: "center",

                    paddingHorizontal:
                        screenHorizontalPadding,

                    paddingBottom:
                        bottomMargin,

                    marginTop:
                        topMargin,
                }}
            >
                {/* ================= TITLE ================= */}

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",

                        gap: wp(14),

                        marginHorizontal:
                            wp(2.5),
                    }}
                >
                    <AppText
                        fontSize={titleFontSize}
                        fontWeight={600}
                        color="#78555E"
                        textAlign="center"
                    >
                        {"How It Works"}
                    </AppText>
                </View>

                {/* ================= DESCRIPTION ================= */}

                <AppText
                    fontSize={descriptionFontSize}
                    fontWeight={400}
                    color="#574146"
                    textAlign="center"
                >
                    {
                        "Shopping from SHEIN has never been this\neasy. Follow these simple steps to get\nyour items delivered to your door."
                    }
                </AppText>

                {/* ================= STEPS ================= */}

                <FlatList
                    data={data}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    scrollEnabled={false}
                    keyExtractor={(_, index) =>
                        index.toString()
                    }
                    renderItem={({ item }) => {
                        return (
                            <View
                                style={[
                                    styles.card,
                                    {
                                        width:
                                            cardWidth,

                                        gap: wp(2.5),

                                        marginTop:
                                            cardMarginTop,

                                        padding:
                                            cardPadding,
                                    },
                                ]}
                            >
                                {/* ICON */}

                                <View
                                    style={{
                                        height:
                                            cardIconSize,

                                        width:
                                            cardIconSize,

                                        borderRadius:
                                            cardIconSize /

                                            2,

                                        justifyContent:
                                            "center",

                                        alignItems:
                                            "center",

                                        backgroundColor:
                                            "#90144826",

                                        alignSelf:
                                            "center",
                                    }}
                                >
                                    <AppImage
                                        source={
                                            item.icon
                                        }
                                        width={
                                            cardIconImageSize
                                        }
                                        height={
                                            cardIconImageSize
                                        }
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* TEXT */}

                                <View
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    <AppText
                                        fontSize={
                                            cardTitleFontSize
                                        }
                                        fontWeight={600}
                                        color="#901448"
                                    >
                                        {item.title}
                                    </AppText>

                                    <AppText
                                        fontSize={
                                            cardDescriptionFontSize
                                        }
                                        fontWeight={400}
                                        color="#574146"
                                    >
                                        {
                                            item.description
                                        }
                                    </AppText>
                                </View>
                            </View>
                        );
                    }}
                />

                {/* ================= START EXPLORING ================= */}

                <TouchableOpacity
                    onPress={() => {
                        dispatch(
                            setLoginState("")
                        );

                        setVisible("dash");
                    }}
                    style={[
                        styles.btnview,
                        {
                            width: wp(90),

                            marginTop:
                                buttonMarginTop,

                            paddingVertical:
                                buttonPaddingVertical,
                        },
                    ]}
                >
                    <AppText
                        fontSize={buttonFontSize}
                        fontWeight={400}
                        color={color.themetext}
                        textAlign="center"
                    >
                        {"Start Exploring"}
                    </AppText>

                    <AppImage
                        source={
                            Logos.rightarrow
                        }
                        width={wp(5)}
                        height={hp(1.1)}
                        resizeMode="contain"
                        tintColor={
                            color.themetext
                        }
                        style={{
                            transform: [
                                {
                                    rotate:
                                        "180deg",
                                },
                            ],
                        }}
                    />
                </TouchableOpacity>

                {/* ================= BECOME AGENT ================= */}

                <TouchableOpacity
                    onPress={
                        handleBecomeAgent
                    }
                    style={[
                        styles.btnview,
                        {
                            width: wp(90),

                            marginTop:
                                buttonMarginTop,

                            marginBottom:
                                bottomMargin,

                            paddingVertical:
                                buttonPaddingVertical,

                            backgroundColor:
                                color.white,
                        },
                    ]}
                >
                    <AppText
                        fontSize={
                            buttonFontSize
                        }
                        fontWeight={400}
                        color={
                            color.themetext
                        }
                        textAlign="center"
                    >
                        {"Become an Agent"}
                    </AppText>
                </TouchableOpacity>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        alignItems: "center",

        borderWidth: 1,
        borderColor: "#90144826",

        backgroundColor: color.white,

        borderRadius: 10,

        shadowColor: "#B030600F",

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.2,
        shadowRadius: 3.84,

        elevation: 5,

        flexDirection: "row",

        alignSelf: "center",
    },

    btnview: {
        justifyContent: "center",
        alignItems: "center",

        borderWidth: 1,
        borderColor: "#90144826",

        borderRadius: 10,

        shadowColor: "#B030600F",

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.2,
        shadowRadius: 3.84,

        elevation: 5,

        backgroundColor: color.btncolor,

        flexDirection: "row",

        gap: 8,
    },
});

export default Guidline;