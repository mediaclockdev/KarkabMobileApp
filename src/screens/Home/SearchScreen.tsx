import React, { useState } from 'react';
import {
    FlatList,

    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import AppText from '../../share/components/AppText';
import SearchBar from '../../share/components/SearchBar';
import AppImage from '../../share/components/AppImage';
import MainHeader from '../../share/components/MainHeader';
import color from '../../share/constants/color';
import { Icons, Logos } from '../../share/constants/media';
import { SafeAreaView } from 'react-native-safe-area-context';

const recentSearches = [
    'Nike Shoes',
    'Women Bag',
    'Perfume',
    'iPhone Cover',
];

const categories = [
    { name: 'Fashion', icon: Icons.bag },
    { name: 'Shoes', icon: Icons.bag },
    { name: 'Beauty', icon: Icons.bag },
    { name: 'Electronics', icon: Icons.bag },
    { name: 'Watches', icon: Icons.bag },
    { name: 'Bags', icon: Icons.bag },
];

const trending = [
    'Summer Collection',
    'Sneakers',
    'Headphones',
    'Dresses',
];

const SearchScreen = () => {
    const [search, setSearch] = useState('');

    return (
        <SafeAreaView style={styles.container}>

            <MainHeader headerName="Search" />

            <View style={{ paddingHorizontal: 15 }}>

                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search products..."
                />

                {/* Recent Search */}

                {!search && (
                    <>
                        <View style={styles.section}>
                            <AppText
                                fontSize={18}
                                fontWeight={600}
                                color={color.textcolor}>
                                Recent Searches
                            </AppText>

                            {recentSearches.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.recentCard}>

                                    <View style={styles.row}>
                                        <AppImage
                                            source={Icons.history}
                                            width={18}
                                            height={18}
                                        />

                                        <AppText
                                            marginLeft={10}
                                            fontSize={14}
                                            color={color.textcolor}>
                                            {item}
                                        </AppText>
                                    </View>

                                    <AppImage
                                        source={Icons.close}
                                        width={14}
                                        height={14}
                                    />

                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Categories */}

                        <View style={styles.section}>

                            <AppText
                                fontSize={18}
                                fontWeight={600}
                                color={color.textcolor}>
                                Popular Categories
                            </AppText>

                            <FlatList
                                data={categories}
                                numColumns={3}
                                scrollEnabled={false}
                                columnWrapperStyle={{
                                    justifyContent: 'space-between',
                                }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.categoryCard}>

                                        <View style={styles.iconCircle}>
                                            <AppImage
                                                source={item.icon}
                                                width={26}
                                                height={26}
                                                tintColor={color.themetext}
                                            />
                                        </View>

                                        <AppText
                                            fontSize={13}
                                            marginTop={8}
                                            textAlign="center">
                                            {item.name}
                                        </AppText>

                                    </TouchableOpacity>
                                )}
                            />

                        </View>

                        {/* Trending */}

                        <View style={styles.section}>

                            <AppText
                                fontSize={18}
                                fontWeight={600}
                                color={color.textcolor}>
                                Trending Searches
                            </AppText>

                            {trending.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.trendingCard}>

                                    <View style={styles.row}>

                                        <AppImage
                                            source={Icons.fire}
                                            width={18}
                                            height={18}
                                        />

                                        <AppText
                                            marginLeft={10}
                                            fontSize={14}>
                                            {item}
                                        </AppText>

                                    </View>

                                    <AppImage
                                        source={Logos.rightarrow}
                                        width={16}
                                        height={16}
                                    />

                                </TouchableOpacity>
                            ))}

                        </View>
                    </>
                )}

            </View>

        </SafeAreaView>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: color.appcolor,
    },

    section: {
        marginTop: 25,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    recentCard: {
        backgroundColor: color.white,
        marginTop: 12,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },

    categoryCard: {
        width: '31%',
        backgroundColor: color.white,
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 18,
        marginTop: 15,

        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },

    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: color.lightpink,
        justifyContent: 'center',
        alignItems: 'center',
    },

    trendingCard: {
        marginTop: 12,
        backgroundColor: color.white,
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },

});