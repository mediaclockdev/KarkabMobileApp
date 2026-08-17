
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Alert,
//   BackHandler,
//   StatusBar,
//   StyleSheet,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import { WebView } from 'react-native-webview';
// import apiUrls from '../../services/apiUrls';
// import ApiService from '../../services/api';
// import AppText from '../../share/components/AppText';
// import AppImage from '../../share/components/AppImage';
// import { Icons } from '../../share/constants/media';
// import { useNavigation } from '@react-navigation/native';
// import color from '../../share/constants/color';

// function WebViewScreen() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>

//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();
//   const webViewRef = useRef<WebView>(null);
//   const [canGoBack, setCanGoBack] = useState(false);
//   const navigation = useNavigation();
//   useEffect(() => {
//     const onBackPress = () => {
//       if (canGoBack && webViewRef.current) {
//         webViewRef.current.goBack();
//         return true;
//       }

//       return false;
//     };

//     const subscription = BackHandler.addEventListener(
//       'hardwareBackPress',
//       onBackPress,
//     );

//     return () => subscription.remove();
//   }, [canGoBack]);

//   async function logCartToServer(
//     payload: any,
//     products: CartProduct[] = [],
//   ) {
//     try {
//       console.log('============================');
//       console.log('API URL:');
//       console.log(payload?.url);

//       console.log('----------------------------');
//       console.log('REQUEST BODY:');

//       if (typeof payload?.body === 'string') {
//         const body = Object.fromEntries(
//           new URLSearchParams(payload.body).entries(),
//         );
//         console.log(body);
//       } else {
//         console.log(payload?.body);
//       }

//       console.log('----------------------------');
//       console.log('API RESPONSE:');
//       console.log(payload?.response);

//       console.log('----------------------------');
//       console.log('EXTRACTED PRODUCTS:');
//       console.log(products[0]);
//       const orderPayload = {
//         customerName: "",          // Replace with actual user data
//         customerPhone: "",
//         shippingAddress: "",
//         items: products,
//       };
//       handleSubmit(orderPayload)
//       console.log('============================');
//     } catch (e) {
//       console.log('Server log failed', e);
//     }
//   }


//   type Variant = { name: string; value: string };

//   type CartProduct = {

//     goodsId: string;

//     spu: string;

//     skuCode: string;

//     goodsSn: string;

//     name: string;

//     brand: string;

//     quantity: number;

//     price: string;        // e.g. "AU$23.95"

//     priceUsd: string;

//     image: string;

//     variants: Variant[];  // selected color/size

//     addTime: string;

//   };

//   function extractCartProducts(rawResponse: string): CartProduct[] {

//     // decode URL-encoded portions, then parse

//     let json: any;

//     try {

//       json = JSON.parse(rawResponse);

//     } catch {

//       json = JSON.parse(decodeURIComponent(rawResponse));

//     }

//     const carts = json?.info?.carts ?? [];

//     return carts.map((c: any) => {

//       const p = c.product ?? {};

//       return {

//         goodsId: c.goodsId ?? c.goodId,

//         spu: c.spu,

//         skuCode: p.sku_code,

//         goodsSn: p.goods_sn,

//         name: p.goods_name,

//         brand: p.brand,

//         quantity: Number(c.quantity ?? p.quantity ?? 0),

//         price: p.salePrice?.amountWithSymbol,

//         priceUsd: p.salePrice?.usdAmountWithSymbol,

//         image: p.goods_img ? `https:${p.goods_img}` : '',

//         variants: (p.sku_sale_attr ?? []).map((a: any) => ({

//           name: a.attr_name,        // "Color" / "Size"

//           value: a.attr_value_name, // "Khaki" / "XS"

//         })),

//         addTime: c.add_time,

//       };

//     });

//   }


//   const handleSubmit = async (data: any) => {
//     console.log("rfbfbrb", apiUrls.createorder)
//     try {
//       const response = await ApiService.post(
//         apiUrls.createorder,
//         data
//       );

//       console.log(response)
//       if (response?.status == 200) {
//         console.log(response)
//         Alert.alert("Success", "Order Added successfully");
//       }
//     } catch (error: any) {
//       console.log(error.response?.data || error);
//     }
//   };

//   const injectedJS = `
// (function() {
//   function send(type, payload) {
//     window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
//   }

//   // Match SHEIN's cart / wishlist endpoints
//   function classify(url) {
//     if (/add[_-]?to[_-]?cart|cart\\/add|\\/cart\\/update/i.test(url)) return 'ADD_TO_CART';
//     if (/wishlist|wish\\/add|save[_-]?item|favorite/i.test(url)) return 'ADD_TO_WISHLIST';
//     return null;
//   }

//   // Hook fetch
// const originalFetch = window.fetch;

// window.fetch = async function (...args) {

//     const url = args[0]?.url || args[0];

//     let body = args[1]?.body ?? null;
//     const bodyString = payload.body;

// const bodyObject = Object.fromEntries(
//   new URLSearchParams(bodyString).entries()
// );
// console.log(
//   JSON.stringify(bodyObject, null, 2)
// );
// console.log("URL:", payload.url);
// console.log("BODY:", bodyObject);

//     try {
//         body = JSON.parse(body);
//     } catch {}

//     const response = await originalFetch.apply(this, args);

//     let responseData = null;
// console.log("response:", response);
//     try {

//         const clone = response.clone();

//         responseData = await clone.text();

//         try {
//             responseData = JSON.parse(responseData);
//         } catch {}

//     } catch (e) {}

//     window.ReactNativeWebView.postMessage(
//         JSON.stringify({
//             type: "API",
//             payload: {
//                 url,
//                 body,
//                 response: responseData,
//                 status: response.status
//             }
//         })
//     );

//     return response;
// };


// function handleAction(action, body) {

//     var b = parseBody(body);

//     var goodsId = String(b.goods_id);

//     var cached = productCache[goodsId] || {};

//     var item = {

//       goodsId: goodsId,

//       skuCode: b.sku_code || '',

//       name: cached.name || '',

//       price: cached.price || '',

//       priceUsd: cached.priceUsd || '',

//       image: cached.image || '',

//       brand: cached.brand || '',

//       quantity: Number(b.quantity || 1),

//       variants: resolveVariants(cached, b.sku_code),

//       action: action,

//       addedAt: Date.now()

//     };

//     post('CART_ITEM', item);

//   }


//   // Hook XHR
//   const origOpen = XMLHttpRequest.prototype.open;
//   const origSend = XMLHttpRequest.prototype.send;
//   XMLHttpRequest.prototype.open = function(method, url) {
//     this.__url = url;
//     return origOpen.apply(this, arguments);
//   };
// XMLHttpRequest.prototype.send = function(body) {


//     const url = String(this.__url || '');

//     const type = classify(url);

//     let parsed = body;

//     try {
//         parsed = JSON.parse(body);
//     } catch {}

//     this.addEventListener('load', () => {

//         let response = this.responseText;

//         try {
//             response = JSON.parse(response);
//         } catch {}

//         send(type || "API", {
//             url,
//             body: parsed,
//             response,
//             status: this.status
//         });

//     });

//     return origSend.apply(this, arguments);

// };

//   true;
// })();
// `;


//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           paddingTop: safeAreaInsets.top,
//         },
//       ]}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => {
//             if (canGoBack && webViewRef.current) {
//               webViewRef.current.goBack();
//             } else {
//               navigation.goBack();
//             }
//           }}>
//           <AppImage
//             source={Icons.rightArrow}
//             style={styles.backIcon}
//             resizeMode="contain"
//             tintColor={color.textcolor}

//           />
//           <AppText style={styles.backText}>Return to App</AppText>
//         </TouchableOpacity>
//       </View>
//       <WebView
//         ref={webViewRef}
//         source={{ uri: 'https://au.shein.com/' }}
//         injectedJavaScriptBeforeContentLoaded={injectedJS}
//         sharedCookiesEnabled
//         thirdPartyCookiesEnabled
//         javaScriptEnabled
//         domStorageEnabled
//         allowsBackForwardNavigationGestures
//         applicationNameForUserAgent="Safari"
//         onMessage={(event) => {
//           try {
//             const { payload } = JSON.parse(event.nativeEvent.data);

//             if (!payload) return;

//             const products = extractCartProducts(
//               JSON.stringify(payload.response),
//             );

//             if (!products.length) return;

//             const body =
//               typeof payload.body === 'string'
//                 ? Object.fromEntries(
//                   new URLSearchParams(payload.body).entries(),
//                 )
//                 : payload.body;

//             const addedProduct = products.find(
//               item =>
//                 String(item.goodsId) === String(body?.goods_id) &&
//                 String(item.skuCode) === String(body?.sku_code),
//             );

//             if (addedProduct) {
//               console.log('==============================');
//               console.log('ADDED PRODUCT');
//               console.log(JSON.stringify(addedProduct, null, 2));
//               const data = JSON.stringify(addedProduct, null, 2)
//               console.log(data, 'jfjrjfjjrjjfjrjjfrjjfj==============================');
//             }

//             logCartToServer(payload, products);
//           } catch (e) {
//             console.log(e);
//           }
//         }}
//         userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
//       />
//     </View>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     height: 56,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     paddingHorizontal: 16,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: '#E5E5E5',
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//   },
//   backIcon: {
//     width: 14,
//     height: 14,
//     transform: [{ rotate: '180deg' }],
//   },
//   backText: {
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: '600',
//     color: color.textcolor,
//   },
// });
// export default WebViewScreen;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import AppText from '../../share/components/AppText';
import AppImage from '../../share/components/AppImage';
import { Icons } from '../../share/constants/media';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import color from '../../share/constants/color';
import apiUrls from '../../services/apiUrls';
import ApiService from '../../services/api';
import Toast from 'react-native-toast-message';
import { showAlert, showToast } from '../../auth/redux/authSlice';
import { useAppDispatch } from '../../share/hooks/useAppSelector';

function WebViewScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

// Final payload shape sent to your backend
type ShylenxCartPayload = {
  url: string;
  name: string;
  skuCode: string;
  price: number;
  quantity: number;
  available_quantity: number;
  image: string;
  size: string;
  color: string;
  promotionalPrice?: number;
};

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [webviewurl, setWebviewurl] = useState('');
  const currentUrlRef = useRef('https://au.shein.com/'); // page user is currently on
  const lastTriggeredRef = useRef(0); // debounce guard
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);
  const cartDataRef = useRef<any>(null);
  const [webViewKey, setWebViewKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 WebViewScreen focused - RESETTING WEBVIEW');

      // Reset React Native state
      cartDataRef.current = null;
      setCanGoBack(false);
      setLoading(true);
      firstLoad.current = true;

      // IMPORTANT:
      // Change key so the old WebView is destroyed
      // and a completely new WebView is created.
      setWebViewKey(prev => prev + 1);

      return () => {
        console.log('👋 WebViewScreen unfocused');
      };
    }, [])
  );


  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, [canGoBack]);

  function parsePrice(priceStr: string): number {
    const num = parseFloat(String(priceStr ?? '').replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  function extractPromotion(cart: any, product: any) {
    return {
      promotion_discount:
        parseFloat(
          cart?.single_total_promotion_discount?.amount ??
          cart?.discountPrice?.amount ??
          cart?.promotion?.discountAmount?.amount ??
          product?.promotion?.discountAmount?.amount ??
          "0"
        ) || 0,

      promotion_name:
        cart?.promotion?.promotionName ??
        product?.promotion?.promotionName ??
        "",

      original_price:
        parseFloat(
          cart?.originalPrice?.amount ??
          product?.retailPrice?.amount ??
          "0"
        ) || 0,
    };
  }

  // SHEIN's attr_name is frequently blank in real responses (confirmed in your logs),
  // so we can't always match by name. Fall back to pattern-matching the value itself:
  // sizes look like S/M/L/XL/2XL/numeric, everything else is treated as color.
  const SIZE_PATTERN = /^(XXXS|XXS|XS|S|M|L|XL|XXL|XXXL|\d{1,2}XL|ONE\s?SIZE|\d{1,3}(\.\d+)?)$/i;

  function classifyVariant(attrName: string, value: string): 'Size' | 'Color' | null {
    const nameLower = String(attrName ?? '').toLowerCase();
    if (nameLower.includes('size')) return 'Size';
    if (nameLower.includes('color') || nameLower.includes('colour')) return 'Color';
    if (!value) return null;
    return SIZE_PATTERN.test(String(value).trim()) ? 'Size' : 'Color';
  }

  function getAttrValue(a: any): string {
    return (
      a?.attr_value_name_en ??
      a?.attr_value_name ??
      a?.attr_value_en ??
      a?.attr_value ??
      ''
    );
  }

  function extractVariants(p: any, cart: any): { size: string; color: string } {
    const result = { size: '', color: '' };
    const attrs: any[] = p?.sku_sale_attr ?? [];

    attrs.forEach((a: any) => {
      const value = getAttrValue(a);
      const kind = classifyVariant(a?.attr_name ?? a?.attr_name_en, value);
      if (kind === 'Size' && !result.size) result.size = value;
      if (kind === 'Color' && !result.color) result.color = value;
    });

    // Positional fallback: if there are exactly 2 sale attrs and we only
    // resolved one (usually size), treat the other as color regardless of
    // pattern match — covers cases where color value is a numeric code.
    if (attrs.length === 2 && result.size && !result.color) {
      const other = attrs.find((a: any) => getAttrValue(a) !== result.size);
      if (other) result.color = getAttrValue(other);
    } else if (attrs.length === 2 && result.color && !result.size) {
      const other = attrs.find((a: any) => getAttrValue(a) !== result.color);
      if (other) result.size = getAttrValue(other);
    }

    // Fill any gap from the single selected attr on the cart line itself
    if ((!result.size || !result.color) && cart?.attr) {
      const value = getAttrValue(cart.attr);
      const kind = classifyVariant(cart.attr.attr_name, value);
      if (kind === 'Size' && !result.size) result.size = value;
      if (kind === 'Color' && !result.color) result.color = value;
    }

    return result;
  }

  function extractStock(p: any, cart: any): number {
    const raw =
      cart?.attr?.stock ?? p?.realTimeInventory ?? p?.qs_stock ?? p?.stock ?? '0';
    const num = parseInt(String(raw), 10);
    return isNaN(num) ? 0 : num;
  }

  // response.info.cart is a SINGLE object (not an array) — confirmed from real traffic
  function buildPayload(body: any, response: any): ShylenxCartPayload | null {
    const cart =
      response?.info?.cart ??
      response?.info?.carts?.[0] ??
      null;

    if (!cart) {
      console.log("No cart found", response);
      return null;
    }

    const p = cart?.product ?? {};
    // Debug — remove once size/color/stock are confirmed correct across a few products
    console.log(
      "RESPONSE",
      JSON.stringify(response, null, 2)
    );
    console.log('RAW sku_sale_attr:', JSON.stringify(p.sku_sale_attr));
    console.log('RAW cart.attr:', JSON.stringify(cart.attr));
    const { size, color } = extractVariants(p, cart);
    const promotion = extractPromotion(cart, p);

    return {
      url: currentUrlRef.current,
      name: p.goods_name ?? '',
      skuCode: cart.skuCode ?? p.sku_code ?? body?.sku_code ?? '',
      price:
        parseFloat(
          p?.retailPrice?.amount ??
          cart?.product?.retailPrice?.amount ??
          "0"
        ) || 0,

      quantity: Number(body?.quantity ?? p.quantity ?? 1),
      available_quantity: extractStock(p, cart),
      image: p.goods_img ? `https:${p.goods_img}` : '',
      size,
      color,
      promotionalPrice:
        parseFloat(cart.unitPrice?.amount ?? cart.totalPrice?.amount ?? '0') || 0,
    };
  }

  async function sendToShylenxCart(payload: ShylenxCartPayload) {


    let API_REQ_DATA = JSON.stringify(payload, null, 2)

    try {
      const response = await ApiService.post(
        apiUrls.cartadd,
        API_REQ_DATA
      );

      console.log("SuccessSuccess", response)
      if (response?.status == 200) {
        console.log(response)
        //         ToastAndroid.showWithGravity(
        //   'Login Successful',
        //   ToastAndroid.SHORT,
        //   ToastAndroid.BOTTOM,
        // );
        // Toast.show({
        //   type: 'success',
        //   position: 'bottom',
        //   text1: 'Added to Cart',
        //   text2: 'Click on Return to app and open your cart to place the order.',
        //   visibilityTime: 20000,
        // });
        // dispatch(
        //   showAlert({
        //     type: 'success',
        //     title: 'Added to Cart',
        //     message: 'Click  Return to App to view your cart and place your order.',
        //     showCancel: true,
        //     confirmText: 'Return to App',
        //     cancelText: 'Stay',
        //     onConfirm: () => {
        //       navigation.navigate('PlaceOrder');
        //     },
        //   })
        // );
        dispatch(
          showToast({
            visible: true,
            message: 'Item has been added to your Shylenx cart.',
            type: 'success',
          })
        );
      }
    } catch (error: any) {
      console.log(error.response?.data || error);
    }

    // Uncomment once apiUrls/ApiService are wired in:
    // try {
    //   const response = await ApiService.post(apiUrls.addToCart, payload);
    //   if (response?.status === 200) {
    //     Alert.alert('Added to Cart', 'Product has been added to your Shylenx cart.');
    //   }
    // } catch (error: any) {
    //   console.log('sendToShylenxCart error', error.response?.data || error);
    // }
  }
  async function sendToShylenxCartcheck(payload: ShylenxCartPayload) {


    let API_REQ_DATA = JSON.stringify(payload, null, 2)

    try {
      const response = await ApiService.post(
        apiUrls.cartadd + '?clearCart=true',
        API_REQ_DATA
      );

      console.log("SuccessSuccess", response)
      if (response?.status == 200) {
        console.log(response)

        dispatch(
          showToast({
            visible: true,
            message: 'Item has been added to your Shylenx cart.',
            type: 'success',
          })
        );
        navigation.navigate('PlaceOrder')

      }
    } catch (error: any) {
      console.log(error.response?.data || error);
    }

  }
  const injectedJS = `
  






(function () {
  let cartSelectionTimer = null;

  function getCartAfterSelection() {
    if (cartSelectionTimer) {
      clearTimeout(cartSelectionTimer);
    }

    cartSelectionTimer = setTimeout(() => {
      const path = window.location.pathname.toLowerCase();

      if (
        !path.includes('cart') &&
        !path.includes('bag')
      ) {
        return;
      }

      console.log('🛒 USER CHANGED CART SELECTION');
      console.log('🔄 Calling GET /api/cart/get');

      fetch('/api/cart/get', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      })
        .then(async response => {
          const text = await response.text();

          let data = text;

          try {
            data = JSON.parse(text);
          } catch (e) {
            console.log('⚠️ Cart response is not JSON');
          }

          console.log('✅ UPDATED CART RECEIVED');

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'GET_CART_RESPONSE',
              payload: {
                url: '/api/cart/get',
                response: data,
                status: response.status,
                reason: 'USER_SELECTION_CHANGED',
              },
            }),
          );
        })
        .catch(error => {
          console.log(
            '❌ GET UPDATED CART ERROR:',
            error,
          );
        });
    }, 500);
  }

  // Capture clicks without touching your existing listeners
  document.addEventListener(
    'click',
    function (event) {
      const path = window.location.pathname.toLowerCase();

      if (
        !path.includes('cart') &&
        !path.includes('bag')
      ) {
        return;
      }

      console.log('👆 CART CLICK DETECTED');

      getCartAfterSelection();
    },
    true,
  );
})();

(function() {
  try {
    function send(type, payload) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
    }

    // Only real "add" endpoints — not cart-count/badge reads
    function classify(url) {
    
      if (/add[_-]?to[_-]?cart|cart\\/add|goods\\/add/i.test(url)) return 'ADD_TO_CART';
       if (/cart.*update|update.*cart|cart.*quantity|quantity.*update/i.test(url)) {
    return 'UPDATE_CART';
  }
   
  if (/cart.*delete|cart.*remove|remove.*cart|delete.*cart/i.test(url)) {
    return 'DELETE_CART';
  }
   
      return null;
    }

    // Hook fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const url = (args[0] && args[0].url) || args[0];
      const method = ((args[1] && args[1].method) || 'GET').toUpperCase();
      const isAdd = method === 'POST' && classify(String(url));

      let body = args[1] && args[1].body;
      if (isAdd) {
        try { body = JSON.parse(body); } catch (e) {
          try { body = Object.fromEntries(new URLSearchParams(body).entries()); } catch (e2) {}
        }
      }

      const response = await originalFetch.apply(this, args);

      if (isAdd) {
        let responseData = null;
        try {
          const clone = response.clone();
          responseData = await clone.text();
          try { responseData = JSON.parse(responseData); } catch (e) {}
        } catch (e) {}

        send('ADD_TO_CART', { url: String(url), body, response: responseData, status: response.status });
      }

      return response;
    };

    // Hook XHR
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.__method = String(method || 'GET').toUpperCase();
      this.__url = url;
      this.__isAdd = this.__method === 'POST' && !!classify(String(url));
      return origOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body) {
      if (this.__isAdd) {
        let parsedBody = body;
        try { parsedBody = Object.fromEntries(new URLSearchParams(body).entries()); } catch (e) {
          try { parsedBody = JSON.parse(body); } catch (e2) {}
        }

        this.addEventListener('load', () => {
          let response = this.responseText;
          try { response = JSON.parse(response); } catch (e) {}
          send('ADD_TO_CART', { url: this.__url, body: parsedBody, response, status: this.status });
        });
      }
      return origSend.apply(this, arguments);
    };

    send('DEBUG_LOG', { message: 'hooks installed OK' });
  } catch (e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'INJECT_ERROR',
      payload: { message: e.message },
    }));
  }
  true;
})();
const originalFetch = window.fetch;

window.fetch = async function (...args) {
  const url = (args[0] && args[0].url) || args[0];

  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'FETCH_URL',
    payload: String(url),
  }));

  return originalFetch.apply(this, args);
};


const oldOpen = XMLHttpRequest.prototype.open;
const oldSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url) {
    this.__url = String(url || "");
    return oldOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function(body) {

    this.addEventListener("load", () => {

       const url = String(this.__url || "");

if (
    url.includes("login_from=checkout") ||
    url.includes("/checkout") ||
    url.includes("checkout")||
      url.includes("=checkout")||
       url.includes("checkout/getLiteInfo")
    
  
) {
    window.ReactNativeWebView.postMessage(
        JSON.stringify({
            type: "CHECKOUT_API",
            payload: {
                url,
                response: this.responseText
            }
        })
    );
}
   if (url.includes("/api/cart/get")) {
            let response = this.responseText;

            try {
                response = JSON.parse(response);
            } catch (e) {}

            window.ReactNativeWebView.postMessage(
                JSON.stringify({
                    type: "GET_CART_RESPONSE",
                    payload: {
                        url,
                        response,
                        status: this.status,
                    },
                })
            );
        }

    
    });

    return oldSend.apply(this, arguments);
};
document.addEventListener(
  "click",
  function (e) {
    let el = e.target;

    while (el) {
      const text = (el.innerText || "").trim();

      if (text.startsWith("Checkout")) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "CHECKOUT_CLICK",
            payload: {
              text,
            },
          })
        );
        break;
      }

      el = el.parentElement;
    }
  },
  true
);
(function () {
  let cartRefreshTimer = null;

  function refreshCart() {
    if (cartRefreshTimer) {
      clearTimeout(cartRefreshTimer);
    }

    cartRefreshTimer = setTimeout(async function () {
      try {
        const path = window.location.pathname.toLowerCase();

        if (
          !path.includes('cart') &&
          !path.includes('bag')
        ) {
          return;
        }

        console.log('🛒 Refreshing cart after selection...');

        const response = await fetch('/api/cart/get', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch (e) {
          console.log('❌ Cart response is not JSON');
          data = text;
        }

        console.log('✅ UPDATED CART RECEIVED');

        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'GET_CART_RESPONSE',
            payload: {
              url: '/api/cart/get',
              response: data,
              status: response.status,
              reason: 'USER_SELECTION_CHANGED',
            },
          }),
        );
      } catch (error) {
        console.log(
          '❌ GET CART ERROR:',
          String(error),
        );
      }
    }, 500);
  }

  // Detect checkbox / product selection
  document.addEventListener(
    'click',
    function (event) {
      const path = window.location.pathname.toLowerCase();

      if (
        !path.includes('cart') &&
        !path.includes('bag')
      ) {
        return;
      }

      console.log('👆 Cart click detected');

      refreshCart();
    },
    true,
  );

  // Some SHEIN controls use pointer events instead of click
  document.addEventListener(
    'pointerup',
    function () {
      const path = window.location.pathname.toLowerCase();

      if (
        path.includes('/api/cart/get/select') &&
        path.includes('bag')
      ) {
        return;
      }

      refreshCart();
    },
    true,
  );
})();

const OriginalXHR = XMLHttpRequest;

const originalOpen =
  OriginalXHR.prototype.open;

const originalSend =
  OriginalXHR.prototype.send;

OriginalXHR.prototype.open = function (
  method,
  url
) {
  this._cartMethod = method;
  this._cartUrl = url;

  return originalOpen.apply(
    this,
    arguments
  );
};

OriginalXHR.prototype.send = function () {

  const xhr = this;

  xhr.addEventListener(
    'load',
    function () {

      if (
        String(xhr._cartUrl).includes(
          '/bff-api/order/mall/modify_cart_check_status'
        )
      ) {

        console.log(
          '🛒 CART SELECTION XHR RESPONSE'
        );

        console.log(
          'URL:',
          xhr._cartUrl
        );

        console.log(
          'STATUS:',
          xhr.status
        );

        console.log(
          'RESPONSE:',
          xhr.responseText
        );

        let responseData =
          xhr.responseText;

        try {
          responseData =
            JSON.parse(xhr.responseText);
        } catch (e) {}

        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'CART_SELECTION_RESPONSE',
            payload: {
              method: xhr._cartMethod,
              url: xhr._cartUrl,
              status: xhr.status,
              response: responseData,
            },
          })
        );
      }
    }
  );

  return originalSend.apply(
    this,
    arguments
  );
};


`;

  async function syncCartToShylenx(
    items: ShylenxCartPayload[],
  ) {
    try {
      console.log('📦 SYNC CART TO SHYLENX');
      console.log(JSON.stringify(items, null, 2));

      const response = await ApiService.post(
        apiUrls.cartadd,
        JSON.stringify(items),
      );

      console.log('✅ CART STORE UPDATED:', response);

    } catch (error: any) {
      console.log(
        '❌ CART STORE UPDATE ERROR:',
        error?.response?.data || error,
      );
    }
  }

  function slugify(name: string) {
    return name
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function isCartItemSelected(line: any, content: any, shop: any): boolean {
    // SHEIN can use different names depending on the response/page.
    const value =
      line?.selected ??
      line?.isSelected ??
      line?.is_selected ??
      line?.checked ??
      line?.isChecked ??
      line?.is_checked ??
      content?.selected ??
      content?.isSelected ??
      shop?.selected ??
      shop?.isSelected;

    // Handle boolean values
    if (typeof value === 'boolean') {
      return value;
    }

    // Handle 0/1 or string values
    if (value !== undefined && value !== null) {
      return (
        value === 1 ||
        value === '1' ||
        value === 'true' ||
        value === 'TRUE'
      );
    }

    // If SHEIN does not provide a selection flag,
    // don't assume it is selected.
    return false;
  }

  // function getCartItems(response: any): ShylenxCartPayload[] {
  //   const mallCarts =
  //     response?.info?.mallCartInfo?.mallCarts ??
  //     response?.contextForSSR?.originCartInfo?.mallCartInfo?.mallCarts ??
  //     [];

  //   const items: ShylenxCartPayload[] = [];

  //   mallCarts.forEach((mall: any) => {
  //     (mall.shops || []).forEach((shop: any) => {
  //       (shop.contentData || []).forEach((content: any) => {
  //         (content.productLineInfoList || []).forEach((line: any) => {

  //           // ⭐ ONLY SELECTED ITEMS
  //           const selected = isCartItemSelected(
  //             line,
  //             content,
  //             shop,
  //           );

  //           console.log(
  //             '🛒 CART ITEM:',
  //             line?.goodsId,
  //             'selected:',
  //             selected,
  //             'raw:',
  //             {
  //               selected: line?.selected,
  //               isSelected: line?.isSelected,
  //               checked: line?.checked,
  //               isChecked: line?.isChecked,
  //               is_checked: line?.is_checked,
  //             },
  //           );

  //           if (!selected) {
  //             console.log(
  //               '⏭️ Skipping unselected item:',
  //               line?.goodsId,
  //             );
  //             return;
  //           }

  //           const product = line.product || {};
  //           const attrs = product.sku_sale_attr || [];

  //           let size = '';
  //           let color = '';

  //           attrs.forEach((attr: any) => {
  //             const attrName = String(
  //               attr?.attr_name ||
  //               attr?.attr_name_en ||
  //               ''
  //             ).toLowerCase();

  //             const value =
  //               attr?.attr_value_name ||
  //               attr?.attr_value_name_en ||
  //               attr?.attr_value ||
  //               '';

  //             if (attrName.includes('size')) {
  //               size = value;
  //             }

  //             if (
  //               attrName.includes('color') ||
  //               attrName.includes('colour')
  //             ) {
  //               color = value;
  //             }
  //           });

  //           // Fallback when SHEIN doesn't provide attr_name
  //           if (attrs.length === 2 && (!size || !color)) {
  //             const values = attrs.map(
  //               (a: any) =>
  //                 a?.attr_value_name ||
  //                 a?.attr_value_name_en ||
  //                 a?.attr_value ||
  //                 ''
  //             );

  //             const SIZE_PATTERN =
  //               /^(XXXS|XXS|XS|S|M|L|XL|XXL|XXXL|\d{1,2}XL|ONE\s?SIZE|\d{1,3}(.\d+)?)$/i;

  //             values.forEach((value: string) => {
  //               if (SIZE_PATTERN.test(String(value).trim())) {
  //                 if (!size) size = value;
  //               } else {
  //                 if (!color) color = value;
  //               }
  //             });
  //           }

  //           const availableQuantity = Number(
  //             product.realTimeInventory ??
  //             product.qs_stock ??
  //             product.stock ??
  //             line.realTimeInventory ??
  //             line.stock ??
  //             0
  //           );

  //           const price = Number(
  //             product.retailPrice?.amount ??
  //             product.salePrice?.amount ??
  //             line.retailPrice?.amount ??
  //             0
  //           );

  //           const promotionalPrice = Number(
  //             line.unitPrice?.amount ??
  //             line.salePrice?.amount ??
  //             product.salePrice?.amount ??
  //             line.totalPrice?.amount ??
  //             0
  //           );

  //           const image = product.goods_img
  //             ? `https:${product.goods_img.replace(/^https?:/, '')}`
  //             : '';

  //           items.push({
  //             url:

  //               `https://us.shein.com/${slugify(
  //                 product.goods_name || ''
  //               )}-p-${line.goodsId}.html` || currentUrlRef.current,

  //             skuCode:
  //               line.skuCode ||
  //               line.sku_code ||
  //               product.sku_code ||
  //               '',

  //             name:
  //               product.goods_name ||
  //               line.goods_name ||
  //               '',

  //             image,
  //             size,
  //             color,

  //             price: isNaN(price) ? 0 : price,

  //             promotionalPrice: isNaN(promotionalPrice)
  //               ? 0
  //               : promotionalPrice,

  //             quantity: Number(
  //               line.quantity ??
  //               line.buyQuantity ??
  //               1
  //             ),

  //             available_quantity: isNaN(availableQuantity)
  //               ? 0
  //               : availableQuantity,


  //           });
  //         });
  //       });
  //     });
  //   });

  //   console.log(
  //     '✅ SELECTED CART ITEMS:',
  //     JSON.stringify(items, null, 2)
  //   );

  //   return items;
  // }


  function getCartItems(response: any): ShylenxCartPayload[] {
    const mallCarts =
      response?.info?.mallCartInfo?.mallCarts ??
      response?.contextForSSR?.originCartInfo?.mallCartInfo?.mallCarts ??
      [];

    const items: ShylenxCartPayload[] = [];

    mallCarts.forEach((mall: any) => {
      (mall.shops || []).forEach((shop: any) => {
        (shop.contentData || []).forEach((content: any) => {
          (content.productLineInfoList || []).forEach((line: any) => {
            // ⭐ ONLY SELECTED ITEMS
            const selected = isCartItemSelected(line, content, shop);

            if (!selected) {
              console.log('⏭️ Skipping unselected item:', line?.goodsId);
              return;
            }

            const product = line.product || {};
            const attrs = product.sku_sale_attr || [];
            let size = '';
            let color = '';

            // 1. Extract ALL selected variant values so we never lose anything
            const allValues = attrs
              .map((a: any) => String(a?.attr_value_name || a?.attr_value_name_en || a?.attr_value || '').trim())
              .filter(Boolean);

            // 2. Try standard Shein matching first
            attrs.forEach((attr: any) => {
              const attrName = String(attr?.attr_name || attr?.attr_name_en || '').toLowerCase();
              const value = String(attr?.attr_value_name || attr?.attr_value_name_en || attr?.attr_value || '').trim();

              if (attrName.includes('size')) size = value;
              if (attrName.includes('color') || attrName.includes('colour')) color = value;
            });

            // 3. Robust Fallback: Only map values that were missed by standard matching!
            const mappedValues = [size, color].filter(Boolean);
            const unmappedValues = allValues.filter((v: string) => !mappedValues.includes(v));

            if (unmappedValues.length > 0) {
              if (!color && unmappedValues.length > 0) {
                color = unmappedValues.shift() || '';
              }
              if (!size && unmappedValues.length > 0) {
                size = unmappedValues.shift() || '';
              }
              // If there are STILL unmapped values (3+ variants), append them to size!
              if (unmappedValues.length > 0) {
                size = [size, ...unmappedValues].filter(Boolean).join(', ');
              }
            }

            // 4. Final Safety Net to pass Backend Validation perfectly
            if (!size || size.trim() === '') size = 'N/A';
            if (!color || color.trim() === '') color = 'N/A';

            // const availableQuantity = Number(
            //   product.realTimeInventory ??
            //   product.qs_stock ??
            //   product.stock ??
            //   line.realTimeInventory ??
            //   line.stock ??
            //   0
            // );
            const availableQuantity = Number(
              product?.realTimeInventory ||
              product?.stock ||
              line?.realTimeInventory ||
              line?.stock ||
              0
            );

            const price = Number(
              product.retailPrice?.amount ??
              product.salePrice?.amount ??
              line.retailPrice?.amount ??
              0
            );

            const promotionalPrice = Number(
              line.unitPrice?.amount ??
              line.salePrice?.amount ??
              product.salePrice?.amount ??
              line.totalPrice?.amount ??
              0
            );

            // 🛡️ EDGE CASE 3: Handle Missing Images!
            // Shein sometimes fails to provide an image for a specific color. We add a fallback placeholder so the UI doesn't crash.
            const fallbackImage = 'https://via.placeholder.com/150?text=No+Image';
            const image = product.goods_img
              ? `https:${product.goods_img.replace(/^https?:/, '')}`
              : fallbackImage;

            // 🛡️ EDGE CASE 4: Handle Missing Product Names securely
            const productName = product.goods_name || line.goods_name || 'Unknown Product';
            items.push({
              url: `https://us.shein.com/${slugify(productName)}-p-${line.goodsId}.html` || currentUrlRef.current,
              skuCode: line.skuCode || line.sku_code || product.sku_code || '',
              name: productName,
              image,
              size,
              color,
              price: isNaN(price) ? 0 : price,
              promotionalPrice: isNaN(promotionalPrice) ? 0 : promotionalPrice,
              quantity: Number(line.quantity ?? line.buyQuantity ?? 1),
              available_quantity: isNaN(availableQuantity)
                ? 0
                : Math.min(availableQuantity, 20),
            });
          });
        });
      });
    });

    console.log('✅ SELECTED CART ITEMS:', JSON.stringify(items, null, 2));
    return items;
  }
  return (
    <View
      style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (canGoBack && webViewRef.current) {
              // webViewRef.current.goBack();
              // navigation.goBack();
              navigation.navigate('PlaceOrder')
            } else {
              navigation.navigate('PlaceOrder')
              // navigation.goBack();
            }
          }}>
          <AppImage
            source={Icons.rightArrow}
            style={styles.backIcon}
            resizeMode="contain"
            tintColor={color.textcolor}
          />
          <AppText style={styles.backText}>Return to App</AppText>
        </TouchableOpacity>
      </View>
      {loading && (
        <View style={styles.loaderContainer}>
          <View style={styles.loaderBox}>
            <ActivityIndicator
              size="large"
              color="#AB2C5D"
            />
            <AppText style={styles.loaderText}>
              Loading...
            </AppText>
          </View>
        </View>
      )}
      <WebView
        key={webViewKey}
        ref={webViewRef}
        source={{ uri: 'https://m.shein.com/us/' }}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        applicationNameForUserAgent="Safari"

        onLoadStart={() => {
          console.log('🌐 WebView loading started');
          setLoading(true);
        }}
        onLoadEnd={() => {
          console.log('✅ WebView loading finished');
          setLoading(false);
          firstLoad.current = false;
        }}
        onError={() => {
          console.log('❌ WebView loading error');
          setLoading(false);
        }}
        onNavigationStateChange={navState => {
          setCanGoBack(navState.canGoBack);
          currentUrlRef.current = navState.url;




        }}
        onMessage={event => {
          try {
            const { type, payload } = JSON.parse(event.nativeEvent.data);

            // if (type === "GET_CART") {
            //   console.log(payload.response);

            //   const cart = extractCartProducts(payload.response);

            //   console.log(cart);
            // }
            if (type === 'CART_SELECTION_RESPONSE') {

              console.log(
                '🛒🛒🛒 CART SELECTION RESPONSE 🛒🛒🛒'
              );

              console.log(
                'STATUS:',
                payload?.status
              );

              console.log(
                'RESPONSE:',
                JSON.stringify(
                  payload?.response,
                  null,
                  2
                )
              );
              cartDataRef.current = payload.response;
              return;
            }
            if (type === 'CART_CLICK_API') {
              console.log(
                '🔥 API CALLED AFTER CART CLICK:',
                payload?.method,
                payload?.url,
                payload?.status
              );
            }

            if (type === "XHR_URL") {
              console.log(payload.respone);
            }

            if (type === 'INJECT_ERROR') {
              console.log('WEBVIEW SCRIPT CRASHED:', payload);
              return;
            }

            if (type === 'DEBUG_LOG') {
              console.log('WEBVIEW:', payload.message);
              return;
            }

            if (type === 'ADD_TO_CART') {
              const now = Date.now();
              if (now - lastTriggeredRef.current < 2000) return; // dedupe fetch+xhr double-fire
              lastTriggeredRef.current = now;

              const cartPayload = buildPayload(payload.body, payload.response);
              if (!cartPayload) {
                console.log('ADD_TO_CART fired but could not match product in response', payload.response);
                cartDataRef.current = payload.response
                return;
              }
              dispatch(
                showToast({
                  visible: true,
                  message: 'Go to Cart → Checkout to add it to Sheylnx.',
                  type: 'success',
                })
              );


              sendToShylenxCart(cartPayload);


            }
            if (type === 'ADD_TO_CART') {
              const cartPayload = buildPayload(payload.body, payload.response);
              console.log(cartPayload, "kkkkk")

            }

            // if (type === "GET_CART_RESPONSE") {
            //   console.log("Cart API");
            //   //  console.log(payload.url);
            //   console.log(JSON.stringify(payload.response, null, 2));

            //   // const items = getCartItems(payload.response);
            //   cartDataRef.current = payload.response;
            //   // console.log(JSON.stringify(items, null, 2));type === "CHECKOUT_API"
            // }
            if (type === 'GET_CART_RESPONSE') {
              console.log('🛒 UPDATED CART DATA');

              // Always keep the latest SHEIN cart response
              cartDataRef.current = payload.response;

              console.log(
                "🛒 LATEST CART DATA:",
                JSON.stringify(cartDataRef.current, null, 2)
              );

              // Get ONLY currently selected items
              const selectedItems = getCartItems(payload.response);

              console.log(
                '✅ CURRENTLY SELECTED ITEMS:',
                JSON.stringify(selectedItems, null, 2),
              );
            }

            if (type === "CHECKOUT_CLICK") {
              console.log(JSON.stringify(payload, null, 2));

              const cartData = cartDataRef.current;
              // console.log(cartData, "djjd")
              if (!cartData) {
                console.log("Cart data not available yet.");
                return;
              }

              const items = getCartItems(cartData);

              console.log(
                '🛒 SELECTED ITEMS TO SEND:',
                JSON.stringify(items, null, 2)
              );

              // sendToShylenxCartcheck(items);
            }


            // if (type === 'GET_CART_RESPONSE') {
            //   cartDataRef.current = payload.response;

            //   const items = getCartItems(payload.response);

            //   console.log('🛒 LATEST CART:', items);
            //   console.log('🔄 Cart refresh reason:', payload.reason);

            //   // IMPORTANT:
            //   // Sync even when items.length === 0
            //   // because empty cart means all products were deleted.
            //   syncCartToShylenx(items);


            // }
            if (type === 'ADD_TO_CART') {



              const cartPayload = buildPayload(payload.body, payload.response);
              if (!cartPayload) {
                console.log('ADD_TO_CART update', payload.response);
                cartDataRef.current = payload.response;
                return;
              }




            }
          } catch (e) {
            console.log('onMessage parse error', e);
          }
        }}
        mixedContentMode="always"
        originWhitelist={['*']}
        setSupportMultipleWindows={false}
        cacheEnabled
      //  userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backIcon: { width: 14, height: 14, transform: [{ rotate: '180deg' }] },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: color.textcolor,
  },




  loaderContainer: {
    position: 'absolute',
    top: 56 + 0, // header height
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    // zIndex: 999,
    pointerEvents: 'none',
  },

  loaderBox: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: color.appcolor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: color.textcolor,
  },

  header: {
    height: 56,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  backIcon: {
    width: 14,
    height: 14,
    transform: [{ rotate: '180deg' }],
  },

  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: color.textcolor,
  },

});

export default WebViewScreen;