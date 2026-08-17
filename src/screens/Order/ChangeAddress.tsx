import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,

  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';


import Geocoder from 'react-native-geocoding';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import ApiService from '../../services/api';
import AppText from '../../share/components/AppText';
import color from '../../share/constants/color';
import AddressCard from '../../share/components/AddressCard';
import CustomInput from '../../share/components/CustomInput';
import AppImage from '../../share/components/AppImage';
import { Icons, Logos } from '../../share/constants/media';
import apiUrls from '../../services/apiUrls';
import CountryPicker from '../../share/components/CountryPicker';
import Toast from 'react-native-toast-message';
import PaymentAlertModal from '../../share/components/PaymentAlertModal';
import { showToast } from '../../auth/redux/authSlice';
import { useAppDispatch } from '../../share/hooks/useAppSelector';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
Geocoder.init('AIzaSyAW3FltSWOO4J9Yg54V0eJy9M9kYs_qa8Q');


const ChangeAddress = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { type } = route?.params;
  const mapRef = useRef(null);
  const [selected, setSelected] = useState('home');
  const [name, setName] = useState('')
  const [phoneNumber, setPhonenumber] = useState('')
  const [countryCode, setCountryCode] = useState({ name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' })
  const [address, setAddress] = useState('')
  const [address1, setAddress1] = useState('')
  const [zipcode, setZipCode] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [profile, setProfile] = useState<any>(null);
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const tags = ['Home', 'Work', 'Other'];
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [marker, setMarker] = useState(null);
  const [region, setRegion] = useState({
    latitude: 33.8938,
    longitude: 35.5018,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [paymentModal, setPaymentModal] = useState({
    visible: false,
    title: 'Proceed to Payment',
    message: '',
    cancelText: 'Cancel',
    confirmText: 'Continue',
    onCancel: () => { },
    onConfirm: () => { },
  });



  useFocusEffect(
    useCallback(() => {
      getProfile()
    }, []))


  const getProfile = async () => {
    try {
      //setLoading(true);

      const response = await ApiService.get(apiUrls.getprofile);
      console.log(response, "profileplace api response")
      if (response.status === 200) {
        const data = response.data.data;

        setProfile(data);

        setName(data.name)
        setPhonenumber(data.phone)
        setCountryCode({
          name: 'Australia',
          code: 'AU',
          dialCode: data.countryCode,
          flag: '🇦🇺'
        })
      }

    } catch (error: any) {
      console.log(error);
    } finally {
      //setLoading(false);
    }
  };

  const setdefaultaddress = async (id) => {

    try {
      //setLoading(true);

      const response = await ApiService.patch(apiUrls.defaultaddress(id));
      console.log(response, "defaultaddress api response")
      if (response.status === 200) {
        const data = response.data.data;

      }

    } catch (error: any) {
      console.log(error);
    } finally {
      //setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {


    console.log(address, city, state, name, phoneNumber, countryCode.dialCode, tag, "rfbfbrb", apiUrls.createorder)
    const dataaddress = {
      addressLine: address,
      addressLine2: address1,
      city: city,
      // state: state,
      name,
      phone: phoneNumber,
      countryCode: countryCode.dialCode,
      zipCode: zipcode,
      tag
    }



    try {
      setLoadings(true)
      const response = await ApiService.post(
        apiUrls.addaddress,
        {
          addressLine: address,
          addressLine2: address1,
          city: city,
          // state: state,
          name,
          phone: phoneNumber,
          countryCode: countryCode.dialCode,
          zipCode: zipcode,
          tag

        }
      );

      console.log(response.data);

      if (response.status === 201) {
        console.log("addadressapi", response.data)
        if (route.params?.previousScreen == 'Profile') {
          handleBack()
        }
        else {
          if (type == 'change') {
            navigation.navigate('PlaceOrder')
          }
          else {
            if (
              !profile?.agent ||
              Object.keys(profile.agent).length === 0
            ) {
              navigation.navigate('FindAgent', { type: 'Submitorder', previousScreen: 'ChangeAddress', adddress: dataaddress })
            } else {
              handleSubmitOrder({ dataaddress })
              // Agent exists, don't navigate
            }
            // navigation.navigate('FindAgent', { type: 'Submitorder', adddress: dataaddress })
          }
        }


        // Alert.alert("Success", "Order created successfully");
      }
    } catch (error: any) {
      console.log(error.response?.data || error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Invalid Address',
        text2: 'Please select or add a valid shipping address.',
        visibilityTime: 3000,
        bottomOffset: 30,
      });
    }
    finally {
      setLoadings(false);
    }
  };
  const uniqueAddresses = profile?.addresses?.filter(
    (item: any, index: number, self: any[]) =>
      index === self.findIndex(addr => addr.tag === item.tag),
  );




  const AddAdress = async (item: any, index?: number) => {
    const id = item?.id ?? index ?? 0;

    setSelected(id.toString());
    setAddress(item.addressLine);
    setAddress1(item.addressLine2);
    setCity(item.city);
    setCountryCode({
      name: 'Australia',
      code: 'AU',
      dialCode: item.countryCode,
      flag: '🇦🇺'
    });
    // setState(item.state);
    setZipCode(item.zipCode);
    setTag(item.tag);
    setPhonenumber(item.phone);
    setName(item.name);

    const dataaddress = {
      addressLine: item.addressLine,
      city: item.city,
      state: item.state,
      name: item.name,
      phone: item.phone,
      countryCode:
        typeof item.countryCode === 'object'
          ? item.countryCode.dialCode
          : item.countryCode,
      zipCode: item.zipCode,
      tag: item.tag,
    };


    const dataaddress1 = {
      addressLine: item.addressLine,
      city: item.city,
      state: item.state,

      countryCode:
        typeof item.countryCode === 'object'
          ? item.countryCode.dialCode
          : item.countryCode,
      zipCode: item.zipCode,
      tag: item.tag,
    };

    getLatLongFromAddress(dataaddress1)
    await setdefaultaddress(id)

    if (route.params?.previousScreen == 'Profile') {

    }
    else {
      if (type === 'change') {
        navigation.navigate('PlaceOrder');
      } else {

        if (
          !profile?.agent ||
          Object.keys(profile.agent).length === 0
        ) {
          navigation.navigate('FindAgent', {
            type: 'Submitorder',
            adddress: dataaddress,
          });
        }
        else {
          handleSubmitOrder({ dataaddress })
          // Agent exists, don't navigate
        }
      }
    }

  };

  const handleSubmitOrder = async (adddressdata: any) => {

    console.log("profile.shippingAddress:", profile?.addresses);
    console.log("adddressdata:",);
    const shippingAddress =

      JSON.stringify([adddressdata])

    const body = {
      shippingAddress,
      customerMessage: "Thanks buddy!",
      couponBucket: "SUMMER_SALE",
    };

    console.log("Request Body:", JSON.stringify(body, null, 2));
    try {
      setLoadings(true)
      const response = await ApiService.post(apiUrls.createorder, body);

      console.log(response.data.success, "kkkkkkkkkkkkk");

      if (response.data.success) {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Success',
          text2: 'Order created successfully',
          visibilityTime: 3000,
          bottomOffset: 30,
        });
        // if (type == 'change') {
        // navigation.navigate('OrderDetails', { item: response.data.data, previousScreen: 'FindAgent', })
        // Alert.alert(
        //   'Proceed to Payment',
        //   'Your order has been created successfully. Would you like to continue to payment?',
        //   [
        //     {
        //       text: 'Cancel',
        //       style: 'cancel',
        //       onPress: () => {
        //         Alert.alert(
        //           'Order Cancelled',
        //           'Your order has been cancelled.',
        //           [
        //             {
        //               text: 'OK',
        //               onPress: () => {
        //                 navigation.navigate('PlaceOrder');
        //               },
        //             },
        //           ]
        //         );
        //       },
        //     },
        //     {
        //       text: 'Continue',
        //       onPress: () => {
        //         // navigation.navigate('PlaceOrder');
        //         navigation.navigate('OrderDetails', { item: response?.data?.data, previousScreen: 'ChangeAddress', })
        //       },
        //     },
        //   ],
        //   { cancelable: false }
        // );
        setPaymentModal({
          visible: true,
          title: 'Proceed to Payment',
          message:
            'Your order has been created successfully. Would you like to continue to payment?',
          cancelText: 'Cancel',
          confirmText: 'Continue',
          onCancel: () => {
            setPaymentModal(prev => ({ ...prev, visible: false }));

            navigation.navigate('OrderDetails', {
              item: response?.data?.data,
              previousScreen: 'ChangeAddress',
            });
          },
          onConfirm: () => {
            setPaymentModal(prev => ({ ...prev, visible: false }));

            navigation.navigate('OrderDetails', {
              item: response?.data?.data,
              previousScreen: 'ChangeAddress',
            });
          },
        });
        // }
        // else {
        //   navigation.navigate('FindAgent', { type: 'Submitorder' })
        // }

        // Alert.alert("Success", "Order created successfully");
      }
      else {

      }
    } catch (error: any) {
      console.log(error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Unable to Add Item',
        text2:
          error.response?.data?.message ||
          'Something went wrong. Please try again.',
        position: 'bottom',
      });
    }
    finally {
      setLoadings(false);
    }
  };


  const DeleteAdress = async (item: any, index?: number) => {
    const id = item?.id ?? index ?? 0;
    try {
      const response = await ApiService.delete(
        apiUrls.removeAddress(id)
      );

      console.log(response, 'Delete Address Response');

      if (response.status === 200) {
        // Refresh address list
        getProfile();

        dispatch(
          showToast({
            visible: true,
            message: response.data?.message || 'Address deleted successfully.',
            type: 'success',
          }),
        );
      }
    } catch (error: any) {
      console.log(error.response?.data || error);
    }
  }

  const getLatLongFromAddress = async (address: any) => {
    const address1 = `${address.addressLine}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.countryCode}`;

    console.log(address1);
    try {
      const response = await Geocoder.from(address1);

      const location = response.results[0].geometry.location;

      console.log('Latitude:', location.lat);
      console.log('Longitude:', location.lng);

      setMarker({
        latitude: location.lat,
        longitude: location.lng,
      });

      mapRef.current?.animateToRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      });

    } catch (error) {
      console.log(error);
    }
  };

  const selectLocation = (event) => {
    const coordinate = event.nativeEvent.coordinate;

    setMarker(coordinate);
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('Selected Location:', coordinate);
    getAddress(latitude, longitude);
  };
  const getAddress = async (latitude, longitude) => {
    try {
      const response = await Geocoder.from(latitude, longitude);

      const addressComponents = response.results[0].address_components;

      const getComponent = (type) => {
        const component = addressComponents.find(item =>
          item.types.includes(type)
        );
        return component ? component.long_name : '';
      };

      const selectedAddress = {
        addressLine: response.results[0].formatted_address,
        city: getComponent('locality'),
        state: getComponent('administrative_area_level_1'),
        name: '',
        phone: '',
        countryCode: getComponent('country'),
        zipCode: getComponent('postal_code'),
        tag: 'Home',
      };



      setAddress(response.results[0].formatted_address);
      setAddress1(response.results[0].formatted_address);
      setCity(getComponent('locality'));
      setCountryCode({
        name: 'Australia',
        code: 'AU',
        dialCode: '+61',
        flag: '🇦🇺'
      });
      setState(getComponent('administrative_area_level_1'));
      setZipCode(getComponent('postal_code'));


      console.log(selectedAddress);

      return selectedAddress;

    } catch (error) {
      console.log('Address Error:', error);
    }
  };

  const handleBack = () => {
    const previous = route.params?.previousScreen;

    if (previous) {
      navigation.navigate(previous);
    } else {
      navigation.goBack();
    }
  };
  const getPlaceDetails = (details: any) => {
    if (!details) {
      console.log('❌ No place details received');
      return;
    }

    console.log('✅ Google Place Details:', details);

    const components = details.address_components || [];

    const getComponent = (type: string) => {
      const component = components.find((item: any) =>
        item.types?.includes(type),
      );

      return component?.long_name || '';
    };

    const streetNumber = getComponent('street_number');
    const routeName = getComponent('route');

    const streetAddress = `${streetNumber} ${routeName}`.trim();

    const cityName =
      getComponent('locality') ||
      getComponent('postal_town') ||
      getComponent('administrative_area_level_2');

    const stateName = getComponent('administrative_area_level_1');
    const postcode = getComponent('postal_code');
    const countryName = getComponent('country');

    const countryShortCode =
      components.find((item: any) =>
        item.types?.includes('country'),
      )?.short_name || 'AU';

    const latitude = details.geometry?.location?.lat;
    const longitude = details.geometry?.location?.lng;

    console.log('📍 Parsed place:', {
      streetAddress,
      cityName,
      stateName,
      postcode,
      countryName,
      countryShortCode,
      latitude,
      longitude,
    });

    setAddress(streetAddress);
    setCity(cityName);
    setState(stateName);
    setZipCode(postcode);

    setCountryCode({
      name: countryName || 'Australia',
      code: countryShortCode,
      dialCode: '+61',
      flag: '🇦🇺',
    });

    if (
      typeof latitude === 'number' &&
      typeof longitude === 'number'
    ) {
      const coordinate = {
        latitude,
        longitude,
      };

      setMarker(coordinate);

      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
        >

          <AppImage
            source={Logos.rightarrow}
            width={16}
            height={16}
            resizeMode='contain'
          />
        </TouchableOpacity>

        <AppText style={styles.logo}>
          Address
        </AppText>

        <View style={styles.headerRight}>
          <TouchableOpacity style={{ marginRight: 16 }}>

            <AppImage
              source={Icons.bell}
              width={16}
              height={20}
              resizeMode='contain'
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <AppImage
              source={Icons.cart}
              width={20}
              height={20}
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <AppText style={styles.title}>
            Change Address
          </AppText>

          <AppText style={styles.subtitle}>
            Choose a saved location or add a new
            delivery point.
          </AppText>
        </View>

        {/* Saved Address */}
        {uniqueAddresses?.length > 0 ?
          <AppText style={styles.sectionTitle}>
            SAVED ADDRESSES
          </AppText>
          : null}
        {uniqueAddresses?.length > 0 &&
          uniqueAddresses.map((item: any, index: number) => (
            <AddressCard
              key={item.id ?? index}
              selected={selected === (item.id ?? index).toString()}
              icon={
                item.tag === 'Work'
                  ? Icons.work
                  : item.tag === 'Home'
                    ? Icons.homeunfill
                    : Icons.location
              }
              title={item.tag}
              address={`${item.addressLine}, ${item.city}`}
              onPress={() => { AddAdress(item, index) }}
              onDelete={() => { DeleteAdress(item, index) }}
            />
          ))}

        {/* Add Address */}
        <TouchableOpacity style={styles.addRow}>

          <AppImage
            source={Icons.pluslocation}
            width={16}
            height={20}
            resizeMode='contain'
            tintColor={"#AB2C5D"}
          />

          <AppText style={styles.addText}>
            ADD NEW ADDRESS
          </AppText>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <View style={{ marginTop: 10, marginBottom: 20 }}>
            <AppText style={[styles.label, { marginBottom: 0, marginLeft: 4 }]}>Address Tag</AppText>

            <View style={styles.tagContainer}>
              {tags.map(item => {
                const isSelected = tag === item;

                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.8}
                    onPress={() => setTag(item)}
                    style={[
                      styles.tagButton,
                      isSelected && styles.tagButtonSelected,
                    ]}>
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                      ]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>

                    <AppText
                      color={isSelected ? '#AB2C5D' : '#666'}
                      fontWeight={600}>
                      {item}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <CustomInput
            label="Full Name"
            placeholder="e.g. Jane Doe"
            onChangeText={setName}
            value={name}

          />
          <View>
            <AppText style={styles.label}>
              {"Phone Number"}
            </AppText>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0, // remove if your RN version doesn't support gap
              }}>
              <CountryPicker
                value={countryCode}
                onSelect={setCountryCode}


              />

              <View style={{ flex: 1 }}>
                <CustomInput
                  //  label="Phone Number"
                  placeholder="(555) 000-0000"
                  keyboardType='numeric'
                  onChangeText={setPhonenumber}
                  maxLength={10}
                  value={phoneNumber}
                />
              </View>
            </View>
          </View>

          <CustomInput
            label="Street Address"
            placeholder="Street Address"
            onChangeText={setAddress}
            value={address}
          />
          <CustomInput
            label="Street Address1"
            placeholder="Street Address1"
            onChangeText={setAddress1}
            value={address1}
          />
          {/* <View style={{ marginBottom: 15 }}>
            <AppText style={{
              fontSize: 12,
              color: '#7F7478',
              marginBottom: 8,
              fontWeight: '600',
            }}>
              Street Address
            </AppText>

            <GooglePlacesAutocomplete

              placeholder="Enter street address"
              fetchDetails={true}
              debounce={300}
              disableScroll={true}
              enablePoweredByContainer={false}
              keyboardShouldPersistTaps="handled"

              query={{
                key: 'AIzaSyAW3FltSWOO4J9Yg54V0eJy9M9kYs_qa8Q',
                language: 'en',
                components: 'country:au',
                types: 'address',
              }}

              onPress={(data, details = null) => {
                console.log('🔵 PLACE SELECTED:', data);
                console.log('🟢 PLACE DETAILS:', details);

                if (!details) {
                  console.log('❌ No details returned');
                  return;
                }

                getPlaceDetails(details);
              }}

              textInputProps={{
                value: address,
                onChangeText: text => {
                  setAddress(text);
                },
              }}

              styles={{
                container: {
                  flex: 0,
                },

                textInputContainer: {
                  width: '100%',
                },

                textInput: {
                  height: 50,
                  borderWidth: 1,
                  borderColor: '#E6E6E6',
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  fontSize: 14,
                  color: '#333',
                  backgroundColor: '#FFF',
                },

                listView: {
                  backgroundColor: '#FFF',
                  borderRadius: 10,
                  elevation: 10,
                  zIndex: 9999,
                },

                row: {
                  padding: 13,
                  minHeight: 50,
                },

                description: {
                  fontSize: 14,
                  color: '#333',
                },

                separator: {
                  height: 1,
                  backgroundColor: '#EEEEEE',
                },
              }}
            />
          </View> */}
          {/* <CustomInput
            label="State"
            placeholder="State"
            onChangeText={setState}
            value={state}
          /> */}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <CustomInput
                label="ZipCode"
                placeholder="Apt, Suite, etc"
                onChangeText={setZipCode}
                maxLength={6}
                value={zipcode}


              />
            </View>

            <View style={{ flex: 1 }}>
              <CustomInput
                label="City"
                placeholder="City"
                onChangeText={setCity}
                value={city}
              />
            </View>
          </View>

          {/* Map */}
          <View style={styles.map}>
            {/* <AppText style={{ color: '#888' }}>
              Map Preview
            </AppText> */}
            <MapView
              ref={mapRef}
              style={{
                width: '100%',
                height: '100%',
              }}
              zoomEnabled
              zoomTapEnabled
              zoomControlEnabled={true} // Android
              scrollEnabled
              rotateEnabled
              pitchEnabled
              showsCompass
              initialRegion={region}
              showsUserLocation={true}
              onPress={selectLocation}
              onRegionChangeComplete={(region) => {
                // console.log('Latitude:', region.latitude);
                // console.log('Longitude:', region.longitude);

                // Save location
                // setLocation({
                //   latitude: region.latitude,
                //   longitude: region.longitude,
                // });
              }}
            >
              {marker && (
                <Marker
                  coordinate={marker}
                  title="Selected Location"
                />
              )}
            </MapView>

            <View style={styles.cityBadge}>

              <AppImage
                source={Icons.locationb}
                height={13}
                width={10}
                resizeMode='contain'

              />

              <AppText style={styles.cityText}>
                Auto-detected city
              </AppText>
            </View>
          </View>
        </View>


        <TouchableOpacity

          onPress={() => {
            handleSubmit({})
          }}
          style={styles.button}>
          {loadings ? (
            <ActivityIndicator size="small" color="#7A5761" />
          ) : (
            <>
              <AppText style={styles.buttonText}>
                Confirm New Address
              </AppText>
              <AppImage
                source={Logos.arrow}
                height={16}
                width={16}
                resizeMode='contain'

              />
            </>
          )}

        </TouchableOpacity>
      </ScrollView>
      <PaymentAlertModal
        visible={paymentModal.visible}
        title={paymentModal.title}
        message={paymentModal.message}
        cancelText={paymentModal.cancelText}
        confirmText={paymentModal.confirmText}
        onCancel={paymentModal.onCancel}
        onConfirm={paymentModal.onConfirm}
      />

    </SafeAreaView>
  );
};

export default ChangeAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F7',
  },

  header: {
    height: 72,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
  },

  headerRight: {
    flexDirection: 'row',
  },

  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B5A60',
  },

  titleContainer: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    color: color.textcolor,
  },

  subtitle: {
    marginTop: 6,
    color: '#666',
    lineHeight: 24,
    fontSize: 16
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginBottom: 12,
    fontSize: 14,
    color: '#666',
    letterSpacing: 1,
  },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 18,
  },

  addText: {
    marginLeft: 8,
    color: '#B12A63',
    fontWeight: '600',
  },

  form: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },

  row: {
    flexDirection: 'row',
  },

  map: {
    marginTop: 20,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },

  cityBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,

  },

  cityText: {
    marginLeft: 5,
    fontSize: 12,
  },

  button: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: '#F9C6D3',
    borderRadius: 14,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7A5761',
    marginRight: 10,
  },
  label: {
    fontSize: 12,
    color: '#7F7478',
    marginBottom: -12,
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  tagButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: '#FFF',
  },

  tagButtonSelected: {
    borderColor: '#AB2C5D',
    backgroundColor: '#FFF5F8',
  },

  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CFCFCF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  radioOuterSelected: {
    borderColor: '#AB2C5D',
  },

  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#AB2C5D',
  },
});