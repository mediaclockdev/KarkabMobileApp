import React, { useState } from 'react';
import {
  FlatList,

  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import color from '../../share/constants/color';
import { Icons } from '../../share/constants/media';
import ProductCard from '../../share/components/ProductCard';
import MainHeader from '../../share/components/MainHeader';
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = ['All Items', 'Bags', 'Shoes', 'Beauty'];

const PRODUCTS = [
  {
    id: '1',
    category: 'LUXURY BAG',
    title: 'Petite Rose',
    size: 'OS',
    price: '$320.00',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
  },
  {
    id: '2',
    category: 'SHOES',
    title: 'City Blush Runner',
    size: '38',
    price: '$185.00',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  },
  {
    id: '3',
    category: 'BEAUTY',
    title: 'Glow Elixir Serum',
    size: '50ml',
    price: '$75.00',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
  },
  {
    id: '4',
    category: 'SHOES',
    title: 'Ethereal Stiletto',
    size: '37',
    price: '$210.00',
    image:
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600',
  },
  {
    id: '5',
    category: 'BEAUTY',
    title: 'Lumina Palette',
    size: '1',
    price: '$62.00',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
  },
  {
    id: '6',
    category: 'BAGS',
    title: 'Urban Chic Tote',
    size: 'M',
    price: '$145.00',
    image:
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600',
  },

];

const Products = () => {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState('All Items');
  const route = useRoute<any>();

  const { item } = route?.params;

  // console.log(item, "ss")

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <MainHeader

      />
      <View style={{ marginHorizontal: 16, marginBottom: 66, flex: 1, }}>
        <FlatList
          data={item}
          numColumns={2}
          keyExtractor={item => item.id}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <AppText
                fontSize={12}
                color="#78555E"
                fontWeight={600}
                marginTop={16}>
                📍 LOCAL STOCK
              </AppText>

              <AppText
                fontSize={24}
                color={color.textcolor}
                fontWeight={600}
                marginTop={5}>
                Available in Lebanon
              </AppText>

              <AppText
                fontSize={16}
                color="#4D4447"
                marginTop={5}>
                Ready-to-ship local inventory.No
              </AppText>

              <AppText
                fontSize={16}
                color="#4D4447"
                marginBottom={20}>
                international wait times.
              </AppText>

              {/* Categories */}
              <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={item => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {

                      setSelected(item)
                      //navigation.navigate('ProductDetails')

                    }}
                    style={[
                      styles.chip,
                      selected === item && styles.activeChip,
                    ]}>
                    <AppText
                      fontSize={16}
                      color={
                        selected === item
                          ? '#78555E'
                          : color.textcolor
                      }>
                      {item}
                    </AppText>
                  </TouchableOpacity>
                )}
              />
            </>
          }
          renderItem={({ item }) => (
            <View style={{ width: '48%', marginBottom: 10 }}>
              <ProductCard
                onPress={() => { navigation.navigate('ProductDetails', { item }) }}
                item={item} />
            </View>
          )}
        />
      </View>

    </SafeAreaView>
  );
};

export default Products;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',

  },

  header: {
    marginTop: 10,
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },

  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  chip: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D0C3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  activeChip: {
    backgroundColor: '#FFD6E1',
    borderColor: '#FFD6E1',
  },
});