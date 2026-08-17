import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,

  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'
import AppImage from '../../share/components/AppImage';
import AppText from '../../share/components/AppText';
import MainHeader from '../../share/components/MainHeader';
import color from '../../share/constants/color';
import { BottomIcons, Icons, } from '../../share/constants/media';
import apiUrls from "../../services/apiUrls";
import ApiService from '../../services/api';
import { GlobalImage } from '../../share/utils/GlobalImage';
import { SafeAreaView } from 'react-native-safe-area-context';


const ProductDetails = () => {
  const navigation = useNavigation<any>();
  const [productdetail, setProductDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [agentdata, setAgentData] = useState<any>(null);

  const route = useRoute<any>();

  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  //console.log(item, "djdih")


  useEffect(() => {
    getorderdetail()
  }, [navigation])

  const getorderdetail = async () => {
    try {
      setLoading(true);

      const response = await ApiService.get(apiUrls.getOrderDetail(item.id));
      // console.log(response, "getorderdetail api response")
      if (response.status === 200) {
        const data = (response as any)?.data?.data;

        console.log(data, "getorderdetail")
        setProductDetail(data)
        setQuantity(data.quantity)
        setAgentData(data.agent)
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: color.appcolor, justifyContent: 'center' }}>
        <ActivityIndicator size={"large"} color={"#AB2C5D"} />;
      </View>)

  }


  return (
    <SafeAreaView style={styles.container}>
      <MainHeader headerName="Product Details" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Product Image */}

        <View style={styles.imageContainer}>
          <AppImage
            source={
              GlobalImage(productdetail?.photoUrl)

            }
            resizeMode="cover"
            style={styles.image}
          />

          <View style={styles.badge}>
            <AppImage
              source={Icons.locationb}
              width={12}
              height={15}

            />

            <AppText
              fontSize={12}
              fontWeight={600}
              color={color.textcolor}>
              Available {productdetail?.productStatus}
            </AppText>
          </View>
        </View>

        {/* Product */}

        <View style={styles.content}>

          <View style={styles.titleRow}>

            <AppText
              fontSize={34}
              fontWeight={700}
              color="#1B1C1C"
              numberOfLines={2}
              style={{ flex: 1 }}>
              {productdetail?.productName}
            </AppText>

            <AppText
              fontSize={32}
              fontWeight={600}
              color="#AB2C5D">
              ${productdetail?.price}
            </AppText>

          </View>


          <AppText
            marginTop={12}
            color="#22C55E"
            fontSize={14}>
            ●
            <AppText
              marginTop={12}
              color="#4D4447"
              fontSize={14}>
              {"  In Stock - Direct from Agent"}
            </AppText>
          </AppText>

          <AppText
            marginTop={8}
            fontSize={14}
            color="#4D4447">
            SKU- SH10023BG
          </AppText>

          <View style={styles.divider} />

          {/* Size */}

          <AppText
            fontWeight={600}
            marginBottom={12}
            fontSize={14}
            color={color.textcolor}
          >
            Size
          </AppText>

          <TouchableOpacity style={styles.sizeChip}>
            <AppText
              color="#8B0E45"
              fontWeight={500}
              fontSize={14}
            >
              One Size ({productdetail?.size})
            </AppText>
          </TouchableOpacity>

          {/* Quantity */}

          <AppText
            fontWeight={500}
            marginTop={28}
            fontSize={14}
            color={color.textcolor}
          >
            Quantity
          </AppText>

          <View style={styles.quantityContainer}>

            <TouchableOpacity
              onPress={() =>
                quantity > 1 &&
                setQuantity(quantity - 1)
              }>
              <AppText fontSize={24}

                color='#6B5A60'
              >−</AppText>
            </TouchableOpacity>

            <AppText
              fontSize={20}
              fontWeight={700}
              color={color.textcolor}
            >
              {quantity}
            </AppText>

            <TouchableOpacity
              onPress={() =>
                setQuantity(quantity + 1)
              }>
              <AppText fontSize={24}
                color='#6B5A60'
              >＋</AppText>
            </TouchableOpacity>

          </View>

          <View style={styles.divider} />

          {/* Description */}

          <AppText
            fontSize={20}
            fontWeight={700}
            color={color.textcolor}
          >
            Description
          </AppText>

          <AppText
            marginTop={12}
            lineHeight={24}
            fontSize={18}
            fontWeight={400}
            color="#4D4447">
            A timeless silhouette in premium pebble leather.
            Perfect for evening outings or elegant daily wear.
            This piece embodies modern sophistication with its
            minimalist design and artisan craftsmanship.
          </AppText>

          <AppText
            marginTop={10}
            color="#AB2C5D"
            fontSize={18}
            fontWeight={400}
          >
            Limited local availability.
          </AppText>

        </View>



        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              width: 48,
              borderRadius: 40,
              borderWidth: 2,
              borderColor: "#AB2C5D",
              overflow: 'hidden',
            }}>

              <AppImage
                source={Icons.agent}
                width={50}
                height={50}
                resizeMode="contain"
              />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>

              <AppText
                fontSize={14}
                color="#1B1C1C"
                fontWeight={600}
              >
                {`Sold by Agent ${agentdata?.name ?? 'Unknown Agent'}.`}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <AppImage
                  source={Icons.star}
                  height={13}
                  width={14}
                  resizeMode='conatin'
                />
                <AppText
                  fontSize={14}
                  color="#AB2C5D"
                  fontWeight={600}
                >
                  {`${agentdata.rating} (120+ reviews)`}
                </AppText>
              </View>

            </View>

          </View>

          <TouchableOpacity
            onPress={() => {
              // setVisible('find')
            }}
            style={[styles.btnview, { borderColor: color.themetext, gap: 8 }]}>
            <AppImage
              source={BottomIcons.library}
              height={17}
              width={17}
              tintColor={"#AB2C5D"}
            />
            <AppText
              fontSize={14}
              color={color.themetext}
              fontWeight={600}
            >
              {"Message Agent"}
            </AppText>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8F8F8"
  },

  imageContainer: {
    height: 487,
    backgroundColor: "#FFF",
    position: "relative"
  },

  image: {
    width: "100%",
    height: "100%"
  },

  badge: {
    position: "absolute",
    left: 18,
    bottom: 18,

    flexDirection: "row",
    alignItems: "center",
    gap: 6,

    backgroundColor: "#FFF",

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 40,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: .05,
    shadowRadius: 10,
    elevation: 4
  },

  content: {
    padding: 18
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10
  },

  divider: {
    height: 1,
    backgroundColor: "#D0C3C7",
    marginVertical: 22
  },

  sizeChip: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#8B0E45",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12
  },

  quantityContainer: {
    marginTop: 12,
    width: 120,
    height: 45,
    backgroundColor: "#F5F3F3",
    borderRadius: 8,

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  card: {
    //width: '100%',
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: color.white,


    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,

    // Android Shadow
    elevation: 6,
    marginHorizontal: 18,
    marginTop: 40
  },
  btnview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 2,
    height: 48,
    width: '100%',
    marginBottom: 10
  },

});

export default ProductDetails;