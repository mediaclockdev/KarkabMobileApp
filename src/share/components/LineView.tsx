import { StyleSheet, View } from "react-native";
import AppText from "./AppText";
import { Inter } from "../constants/fonts";
import { useTranslation } from "react-i18next";

export default function LineView() {
    const { t } = useTranslation("ar");
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 20, alignSelf: 'center' }}>
            <View style={styles.view} />
            <AppText color={"#838382"} fontSize={12} fontFamily={Inter.regular}>
                {t("OR")}
            </AppText>
            <View style={styles.view} />
        </View>
    )
}
const styles = StyleSheet.create({
    view: {
        height: 1,
        backgroundColor: '#302E2E',
        width: '40%'
    }
})