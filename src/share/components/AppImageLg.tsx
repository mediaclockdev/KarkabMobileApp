import React from 'react';
import {
    View,
    StyleSheet,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import AppImage from './AppImage';

interface AppImageLgProps {
    source: ImageSourcePropType;
    width: number;
    height: number;
    colors?: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    style?: StyleProp<ImageStyle>;
    resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

const AppImageLg: React.FC<AppImageLgProps> = ({
    source,
    width,
    height,
    colors = ['#FA6144', '#D83B7E', '#7E3FF2'],
    start = { x: 0, y: 0 },
    end = { x: 1, y: 0 },
    style,
    resizeMode = 'contain',
}) => {
    return (
        <View style={[{ width, height }, style]}>
            <MaskedView
                style={StyleSheet.absoluteFill}
                maskElement={
                    <View style={styles.maskWrapper}>
                        <AppImage
                            source={source}
                            width={width}
                            height={height}
                            resizeMode={resizeMode}
                            style={{ width, height }}
                        />
                    </View>
                }
            >
                <LinearGradient
                    colors={colors}
                    start={start}
                    end={end}
                    style={StyleSheet.absoluteFill}
                />
            </MaskedView>
        </View>
    );
};

const styles = StyleSheet.create({
    maskWrapper: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AppImageLg;