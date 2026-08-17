import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
 
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
  Text,
  ActivityIndicator,
  Image,
} from 'react-native';


import AppImage from '../../share/components/AppImage';
import AppText from '../../share/components/AppText';
import { Icons, Logos } from '../../share/constants/media';
import color from '../../share/constants/color';
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

const Createorder = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [productLink, setProductLink] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [links, setLinks] = useState<string[]>([

  ]);
  const [products, setProducts] = useState<any[]>([]);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const linkInputRef = useRef<TextInput>(null);

  const updateProduct = (index: number, key: string, value: any) => {
    setProducts(prev => {
      const data = [...prev];
      data[index] = {
        ...data[index],
        [key]: value,
      };
      return data;
    });
  };
  const updateQuantity = (index: number, action: 'inc' | 'dec') => {
    setProducts(prevProducts =>
      prevProducts.map((item, i) => {
        if (i !== index) return item;

        let quantity = item.quantity || 1;

        if (action === 'inc') {
          quantity += 1;
        } else if (action === 'dec' && quantity > 1) {
          quantity -= 1;
        }

        return {
          ...item,
          quantity,
        };
      }),
    );
  };


  const addLink = () => {
    if (!productLink.trim()) return;

    setLinks(prev => [...prev, productLink.trim()]);
    // if (productData) {
    //   setProducts(prev => [...prev, productData]);
    // }
    setProductLink('');
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };




  useFocusEffect(
    useCallback(() => {



      if (!productLink) {
      }
      else {
        // if (!isValidSheinProductLink(productLink)) {
        //   Toast.show({
        //     type: 'error',
        //     position: 'top',
        //     text1: 'Invalid Link',
        //     visibilityTime: 1000,
        //     text2: 'Please paste a valid SHEIN product link.',
        //   });

        // }
        // else {
        geturldata(productLink)
        // }
      }



    }, [productLink])
  )


  // const isValidSheinProductLink = (url: string) => {
  //   const regex =
  //     /^https?:\/\/(www\.|m\.|ar\.)?shein\.[a-z.]+\/.*-p-\d+.*$/i;

  //   return regex.test(url.trim());
  // };





  const geturldata = async (url?: string): Promise<void> => {
    //const url = url.trim();

    if (!url) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error',
        text2: 'Please paste a SHEIN product link.',
      });
      return;
    }

    // if (!isValidSheinProductLink(url)) {
    //   Toast.show({
    //     type: 'error',
    //     position: 'bottom',
    //     text1: 'Invalid Link',
    //     text2: 'Please paste a valid SHEIN product link.',
    //   });
    //   return;
    // }
    console.log(apiUrls.linkproductdetail, "whwbwjknk")
    try {
      setLoading(true);

      const requestUrl = url?.trim();

      const body = {
        url: requestUrl,
      };

      console.log("Request Body:", JSON.stringify(body, null, 2));

      const response = await ApiService.post(
        apiUrls.linkproductdetail,
        body
      );
      // const response = await ApiService.get(
      //   `https://shelynx.mediaclocksoft.com.au/scrape?url=${requestUrl}`

      // );

      //console.log("Responsdhdhde:", response.data);

      if (response.status === 200) {
        console.log("Responsdhdhde:", response.data);
        // setProducts(prev => [
        //   ...prev,
        //   {
        //     ...response.data,
        //     selectedSize: response.data.variants?.size?.[0],
        //     selectedColor: response.data.variants?.colors?.[0],
        //   },
        // ]);
        setProducts(prev => [

          {
            ...response.data,
            selectedSize: response.data.variants?.size?.[0],
            selectedColor: response.data.variants?.colors?.[0],
          },
        ]);
        // setProducts([
        //   {
        //     ...response.data,
        //     selectedSize: response.data.skus?.[0] ?? null,
        //     selectedColor: response.data.related_colors?.[0] ?? null,
        //     quantity: 1,
        //   },
        // ]);
        // Alert.alert(
        //   "Success",
        //   response.data.message || "Order submitted successfully."
        // );

      }
    } catch (error: any) {
      console.log(error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error',
        text2: error?.response?.data?.message || error?.message || 'Something went wrong',
      });
      // Alert.alert(
      //   "Error",
      //   error.message || "Unable to submit order."
      // );
    } finally {
      setLoading(false);
    }
  };




  const handleSubmitOrder = async (products: any) => {
    console.log(products.orderData, "e4hirk4khrid")
    if (products.length === 0) {
      Alert.alert("Error", "Please add at least one product.");
      return;
    }

    try {
      setLoading1(true);
      // console.log(apiUrls.submitOrder, "Dkck")
      const body = {
        // products: products.map(item => ({
        // productId: item.product_id,
        productUrl: products.orderData?.productUrl,
        skuCode: products.sku,
        productName: products.title,
        image: products.main_image,
        size:
          products.selectedSize?.sale_attributes?.[0]?.value || "",
        color:
          products.selectedColor?.main_sale_attribute?.value || "",

        quantity: products.quantity || 1,

        price:
          products.selectedSize?.extracted_price ??
          products.extracted_price,
        // })),
        //  notes,
      };

      console.log(
        "Request Body:",
        JSON.stringify(body, null, 2),
      );

      const response = await ApiService.post(
        apiUrls.cartadd,
        body,
      );
      if (response.status === 200 || response.status === 201) {
        setIsAddedToCart(true);

        Toast.show({
          type: 'success',
          text1: 'Added to Cart',
          text2: 'Product added successfully',
          position: 'bottom',
        });
      }
      setProducts([]);
      setProductLink('');
      console.log(response.data);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading1(false);
    }
  };


  const handleBack = () => {
    setProducts([]);
    setProductLink('');


    setQuantity(1);
    setNotes('');
    setIsAddedToCart(false);
    const previous = route.params?.previousScreen;

    if (previous) {
      navigation.navigate(previous);
    } else {
      navigation.goBack();
    }
  };

  const focusLinkInput = () => {
    scrollRef.current?.scrollTo({
      y: 200,
      animated: true,
    });

    setTimeout(() => {
      linkInputRef.current?.focus();
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
        >
          <AppImage
            source={Logos.rightarrow}
            width={16}
            height={12}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <AppText
          fontSize={24}
          fontWeight={700}
          color={"#78555E"}>
          Submit Order
        </AppText>

        <TouchableOpacity>
          <AppImage
            source={Icons.help}
            width={20}
            height={26}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}



        {/* Paste Links */}

        <View style={styles.card}>

          <View style={[styles.titleRow, { marginBottom: 16 }]}>
            <AppImage
              source={Icons.link}
              width={20}
              height={10}
              resizeMode="contain"
            />

            <AppText
              fontSize={20}
              fontWeight={700}
              color="#222">
              Paste SHEIN links
            </AppText>
            {productLink.length > 0 && (
              <TouchableOpacity
                onPress={() => { setProductLink(""); setProducts([]) }}
                style={{ marginLeft: 'auto' }}
              >
                <AppText
                  fontSize={13}
                  fontWeight={600}
                  color="#EB2C78"
                >
                  Clear
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            ref={linkInputRef}
            value={productLink}
            onChangeText={(text) => {
              setProductLink(text);
              //   geturldata(text);
            }}
            multiline
            placeholder="Paste your product URLs here (one per line)..."
            placeholderTextColor="#7F7478"
            style={styles.textArea}
          />

          {/* <AppText
            fontSize={12}
            fontWeight={700}
            color="#4D4447"
            marginTop={18}>
            ADD QUANTITY
          </AppText> */}

          {/* <View style={styles.qtyContainer}>
            <TouchableOpacity
              onPress={() =>
                products.quantity > 1 &&
                updateProduct(
                  0,
                  "quantity",
                  products.quantity - 1
                )
              }>
              <AppText fontSize={26}>−</AppText>
            </TouchableOpacity>

            <AppText fontSize={16}>{quantity}</AppText>

            <TouchableOpacity
              onPress={() =>
                updateProduct(
                  0,
                  "quantity",
                  products.quantity + 1
                )}>
              <AppText fontSize={26}>+</AppText>
            </TouchableOpacity>
          </View> */}

          <AppText
            fontSize={12}
            color="#4D4447"
            marginTop={15}
            fontWeight={600}
          >
            {"Our agents will automatically verify these links for\n you."}
          </AppText>
        </View>

        {/* Added Links */}

        <View style={styles.card}>
          <View style={styles.linkHeader}>
            <View style={styles.titleRow}>
              <AppImage
                source={Icons.list}
                width={18}
                height={18}
                resizeMode='contain'
              />

              <AppText
                fontSize={22}
                fontWeight={700}>
                Added Links
              </AppText>
            </View>
            <TouchableOpacity onPress={addLink} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  height: 15,
                  width: 15,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: color.themetext,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AppText
                  fontSize={12}
                  color={color.themetext}
                  style={{ lineHeight: 12 }}>
                  +
                </AppText>
              </View>
              <View

              >
                <AppText
                  color={color.themetext}
                  fontSize={14}
                  fontWeight={600}>
                  Add Link
                </AppText>
              </View>
            </TouchableOpacity>

          </View>

          <FlatList
            data={links}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <AppText
                style={{
                  textAlign: 'center',
                  color: '#999',
                  marginVertical: 20,
                }}>
                No links added yet.
              </AppText>
            }
            ItemSeparatorComponent={() => (
              <View style={{ height: 12 }} />
            )}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  setProductLink(item)
                }}
                style={styles.linkItem}>
                <AppText
                  style={{ flex: 1 }}
                  numberOfLines={1}>
                  {item}
                </AppText>

                <TouchableOpacity
                  onPress={() => removeLink(index)}>
                  <AppImage
                    source={Icons.delete}
                    width={16}
                    height={18}
                    resizeMode='contain'
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>

        {
          loading ?
            <View style={styles.card}>
              <View
                style={{
                  height: 320,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <ActivityIndicator size="large" color="#AB2C5D" />

                <Text
                  style={{
                    marginTop: 12,
                    color: "#666",
                    fontSize: 14,
                  }}>
                  Loading product...
                </Text>
              </View>
            </View> :
            <FlatList
              data={products}
              keyExtractor={(item, index) => `${item?.product_id}-${index}`}
              scrollEnabled={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No products available
                  </Text>

                  <TouchableOpacity onPress={focusLinkInput}>
                    <Text style={styles.addLinkText}>
                      Add SHEIN links to get products
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item, index }) => {
                const firstColor = item?.variants?.colors?.[0];
                const firstSize = item?.variants?.size?.[0];
                const unitPrice = Number(
                  String(item.selectedSize?.price ?? item.price ?? 0).replace('$', '')
                );

                const totalPrice = (unitPrice * (item.quantity || 1)).toFixed(2);
                const color =
                  firstColor?.main_sale_attribute?.value ||
                  item?.orderData?.color ||
                  "-";

                const size =
                  firstSize?.sale_attributes?.[0]?.value ||
                  item?.orderData?.size ||
                  "-";

                const price =
                  firstSize?.price ||
                  item?.price ||
                  `$${item?.extracted_price}`;

                return (
                  <View style={styles.productCard}>
                    <AppImage
                      source={item?.main_image}
                      width={80}
                      height={100}
                      borderRadius={10}
                    />

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <AppText
                        numberOfLines={2}
                        fontSize={15}
                        fontWeight={700}>
                        {item?.title}
                      </AppText>

                      {/* <AppText
                    fontSize={13}
                    color="#7F7478"
                    marginTop={8}>
                    SKU: {item?.sku}
                  </AppText> */}

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 10,
                        }}>
                        <View>
                          {/* SIZE */}

                          <AppText
                            fontSize={12}
                            fontWeight={700}
                            color="#7F7478"
                            marginTop={12}>
                            SIZE
                          </AppText>

                          <View
                            style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              marginTop: 8,
                            }}>
                            {item?.variants?.size?.map((sizeItem, i) => {
                              const value = sizeItem.sale_attributes?.[0]?.value;

                              const selected =
                                item.selectedSize?.sale_attributes?.[0]?.value === value;

                              return (
                                <TouchableOpacity
                                  key={i}
                                  onPress={() =>
                                    updateProduct(index, 'selectedSize', sizeItem)
                                  }
                                  style={[
                                    styles.optionChip,
                                    selected && styles.selectedChip,
                                  ]}>
                                  <AppText
                                    style={[
                                      styles.optionText,
                                      selected && styles.selectedOptionText,
                                    ]}>
                                    {value}
                                  </AppText>
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                          {/* COLOR */}

                          {/* COLOR */}

                          <AppText
                            fontSize={12}
                            fontWeight={700}
                            color="#7F7478"
                            marginTop={15}>
                            COLOR
                          </AppText>

                          <View
                            style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              marginTop: 10,
                              gap: 10,
                            }}>
                            {item?.variants?.colors?.map((colorItem, i) => {
                              const colorName =
                                colorItem?.main_sale_attribute?.value;

                              const selected =
                                item.selectedColor?.product_id === colorItem.product_id;

                              return (
                                <TouchableOpacity
                                  key={i}
                                  onPress={() =>
                                    updateProduct(index, 'selectedColor', colorItem)
                                  }
                                  style={{
                                    alignItems: 'center',
                                  }}
                                >
                                  <View
                                    style={[
                                      {
                                        width: 45,
                                        height: 45,
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        borderWidth: 1,
                                        borderColor: '#ddd',
                                      },
                                      selected && {
                                        borderWidth: 2,
                                        borderColor: '#AB2C5D',
                                      },
                                    ]}
                                  >
                                    <AppImage
                                      source={colorItem?.main_image}
                                      width={45}
                                      height={45}
                                      resizeMode="cover"
                                    />
                                  </View>

                                  <AppText
                                    fontSize={10}
                                    color="#7F7478"
                                    marginTop={4}>
                                    {colorName}
                                  </AppText>
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                          {/* PRICE */}

                          <View
                            style={{
                              marginTop: 16,
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                            <AppText fontSize={13} color="#7F7478">
                              PRICE
                            </AppText>

                            <AppText
                              fontSize={20}
                              fontWeight={700}
                              color="#AB2C5D">
                              ${totalPrice}
                            </AppText>
                          </View>
                          <View
                            style={{
                              marginTop: 20,
                              flexDirection: 'column',
                              gap: 12,
                            }}>
                            {/* Quantity */}
                            <View
                              style={{
                                flexDirection: 'row',

                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <AppText
                                fontSize={12}
                                // fontWeight={700}
                                color="#7F7478"
                              >
                                QUANTITY
                              </AppText>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  backgroundColor: '#F4F4F4',
                                  borderRadius: 10,
                                  overflow: 'hidden',
                                  width: 120,
                                }}>
                                <TouchableOpacity
                                  onPress={() => updateQuantity(index, 'dec')}
                                  style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                  }}>
                                  <AppText fontSize={18} fontWeight={700}>
                                    −
                                  </AppText>
                                </TouchableOpacity>

                                <View
                                  style={{
                                    minWidth: 40,
                                    alignItems: 'center',
                                  }}>
                                  <AppText fontSize={16} fontWeight={700}>
                                    {item.quantity || 1}
                                  </AppText>
                                </View>

                                <TouchableOpacity
                                  onPress={() => updateQuantity(index, 'inc')}
                                  style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                  }}>
                                  <AppText fontSize={18} fontWeight={700}>
                                    +
                                  </AppText>
                                </TouchableOpacity>
                              </View>
                            </View>
                            {/* Add To Cart */}

                            <TouchableOpacity
                              onPress={() => handleSubmitOrder(item)}
                              style={{
                                backgroundColor: '#AB2C5D',
                                paddingVertical: 12,
                                borderRadius: 12,
                                alignItems: 'center',
                                width: '100%',
                              }}>
                              {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <AppText
                                  color="#fff"
                                  fontSize={14}
                                  fontWeight={700}>
                                  Add to Cart
                                </AppText>)}
                            </TouchableOpacity>
                          </View>

                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setProducts(prev =>
                          prev.filter((_, i) => i !== index),
                        );
                        setProductLink('')
                      }
                      }

                    // style={{ marginTop: 10 }}
                    >
                      <AppImage
                        source={Icons.delete}
                        width={16}
                        height={25}
                        resizeMode='conatin'
                      />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          // <FlatList
          //   data={products}
          //   keyExtractor={(_, index) => index.toString()}
          //   scrollEnabled={false}
          //   ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          //   ListEmptyComponent={() => (
          //     <View style={styles.emptyContainer}>
          //       <Text style={styles.emptyText}>
          //         No products available
          //       </Text>
          //     </View>
          //   )}
          //   renderItem={({ item }) => (
          //     <View style={styles.card}>
          //       {/* Product Image */}
          //       <Image
          //         source={{ uri: item.images?.[0] }}
          //         style={styles.image}
          //         resizeMode="cover"
          //       />

          //       {/* Product Name */}
          //       <Text style={styles.title}>{item.title}</Text>

          //       {/* Description */}
          //       <Text
          //         numberOfLines={3}
          //         style={styles.description}>
          //         {item.description}
          //       </Text>

          //       {/* Price */}
          //       <Text style={styles.price}>
          //         {item.currency} {item.price}
          //       </Text>

          //       {/* Sizes */}
          //       <Text style={styles.label}>Sizes</Text>
          //       {console.log(item, "dejjde")}
          //       <View style={styles.chipContainer}>
          //         {item.skus?.map((sku: any) => {
          //           const selected = item.selectedSize?.sku === sku.sku;

          //           return (
          //             <TouchableOpacity
          //               key={sku.sku}
          //               disabled={!sku.is_in_stock}
          //               onPress={() => updateProduct(index, "selectedSize", sku)}
          //               style={[
          //                 styles.chip,
          //                 selected && {
          //                   backgroundColor: "#AB2C5D",
          //                   borderColor: "#AB2C5D",
          //                 },
          //                 !sku.is_in_stock && {
          //                   opacity: 0.4,
          //                 },
          //               ]}>
          //               <Text
          //                 style={{
          //                   color: selected ? "#fff" : "#000",
          //                   fontWeight: "600",
          //                 }}>
          //                 {sku.size}
          //               </Text>
          //             </TouchableOpacity>
          //           );
          //         })}
          //       </View>

          //       {/* Colors */}
          //       <Text style={styles.label}>Available Colors</Text>

          //       <View style={styles.chipContainer}>
          //         {item.related_colors?.map((color: any) => (
          //           <TouchableOpacity
          //             key={color.goods_id}
          //             style={styles.chip}
          //             onPress={() => {
          //               // set selected color here
          //               console.log("Selected Color:", color.color);
          //             }}>
          //             <Text>{color.color}</Text>
          //           </TouchableOpacity>
          //         ))}
          //       </View>

          //       {/* Stock */}
          //       <Text style={styles.label}>
          //         Stock : {item.skus?.[0]?.stock ?? 0}
          //       </Text>

          //       {/* Quantity */}
          //       <View style={styles.quantityRow}>
          //         <TouchableOpacity style={styles.qtyBtn}>
          //           <Text>-</Text>
          //         </TouchableOpacity>

          //         <Text style={styles.qty}>1</Text>

          //         <TouchableOpacity style={styles.qtyBtn}>
          //           <Text>+</Text>
          //         </TouchableOpacity>
          //       </View>

          //       {/* Add To Cart */}
          //       <TouchableOpacity style={styles.cartBtn}>
          //         <Text
          //           style={{
          //             color: "#fff",
          //             fontWeight: "700",
          //           }}>
          //           Add To Cart
          //         </Text>
          //       </TouchableOpacity>
          //     </View>
          //   )}
          // />
        }



        {/* Notes */}

        {/* <View style={styles.card}>
          <View style={[styles.titleRow, { marginBottom: 16, }]}>
            <AppImage
              source={Icons.note}
              width={18}
              height={18}
              resizeMode='contain'
            />

            <AppText
              fontSize={22}
              fontWeight={700}
              color='#1B1C1C'
            >
              Notes for Agent
            </AppText>
          </View>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Any specific instructions for your agent? (e.g. 'Only buy if on sale')"
            placeholderTextColor="#999"
            style={styles.noteInput}
          />
        </View> */}

        {/* Info */}

        <View style={styles.infoBox}>
          <AppImage
            source={Icons.info}
            height={17}
            width={17}
            resizeMode="contain"
            style={{ marginTop: 2 }}
          />

          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText
              fontSize={12}
              fontWeight={700}
              color="#1B1C1C">
              Tracking & Payment:
              <AppText
                fontSize={12}
                fontWeight={600}
                color="#4D4447"
                // marginTop={4}

                numberOfLines={3}
              >
                {" Most orders are COD.\n Please contact your agent directly for payment\n confirmation and shipping updates."}
              </AppText>
            </AppText>


          </View>
        </View>

        {/* <View style={{ height: 160 }} /> */}


        <View style={styles.bottom}>
          <TouchableOpacity
            disabled={!isAddedToCart}
            onPress={() => {
              setProducts([]);
              setProductLink('');


              setQuantity(1);
              setNotes('');
              setIsAddedToCart(false);
              navigation.navigate('PlaceOrder')
            }}
            style={[
              styles.button,
              { opacity: isAddedToCart ? 1 : 0.5 }
            ]}
          >
            <AppText
              color={"#7A5761"}
              fontWeight={700}
              fontSize={13}
            >
              {/* {isAddedToCart ? "Go To Cart" : "Add Item To Cart"} */}
              {"Go To Cart"}
            </AppText>

            <AppImage
              source={Logos.arrow}
              height={16}
              width={16}
              resizeMode="contain"
              tintColor={"#78555E"}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Button */}


      {/* <View style={{height:100}}/> */}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6F8',
  },

  content: {
    padding: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 25,
    padding: 20,
  },

  card: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // marginBottom: 16,
  },

  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#D0C3C7',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#222',
    textAlignVertical: 'top',
    backgroundColor: '#FBF9F8',
  },

  qtyContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D0C3C7',
    borderRadius: 10,
    height: 48,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 16,
    backgroundColor: '#FBF9F8'
  },

  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,

  },

  linkItem: {
    borderWidth: 1,
    borderColor: '#D0C3C7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FBF9F8',
    flexDirection: 'row',
    alignItems: 'center',
  },

  noteInput: {
    minHeight: 95,
    borderWidth: 1,
    borderColor: '#D0C3C7',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#222',
    backgroundColor: '#FBF9F8',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F3F3',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D0C3C7',


  },

  bottom: {
    // position: 'absolute',
    // bottom: 70,
    // left: 0,
    // right: 0,
    marginTop: 30,
    backgroundColor: '#FDF6F8',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 25,

    borderTopWidth: 1,
    borderColor: '#EFE6E8',
  },

  button: {
    height: 54,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#F8BFD0',

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FBF9F8",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E7E1E2",
    alignItems: "flex-start",
    marginVertical: 20
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0C3C7',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },

  selectedChip: {
    backgroundColor: '#AB2C5D',
    borderColor: '#AB2C5D',
  },

  optionText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
  },

  selectedOptionText: {
    color: '#FFF',
  },


  card1: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    margin: 12,
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 260,
    borderRadius: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },

  description: {
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },

  price: {
    fontSize: 22,
    color: "#AB2C5D",
    fontWeight: "700",
    marginTop: 15,
  },

  label: {
    marginTop: 18,
    marginBottom: 10,
    fontWeight: "700",
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },

  qty: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: "700",
  },

  cartBtn: {
    marginTop: 20,
    backgroundColor: "#AB2C5D",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7F7478",
  },
  addLinkContainer: {
    marginTop: 14,
    backgroundColor: '#FCE4EC',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#AB2C5D',
  },

  addLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AB2C5D',
  },
});
export default Createorder;