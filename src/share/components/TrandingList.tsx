import { FlatList, ImageBackground, ImageSourcePropType, TouchableOpacity, View } from "react-native";
import AppImage from "./AppImage";
import AppText from "./AppText";
import { Inter } from "../constants/fonts";
import color, { useAppColors } from "../constants/color";
import { Images, Logo } from "../constants/media";
import { GlobalImage } from "../utils/GlobalImage";
import { useNavigation } from '@react-navigation/native'

type TrandingListItem = {
  id: number;
  title: string;
  title1: string;
  image: ImageSourcePropType;
};

type TrandingListProps = {
  data?: TrandingListItem[];
};

export default function TrandingList({ data }: TrandingListProps) {

  const colors = useAppColors();

  const navigation = useNavigation();
  const recentdata: TrandingListItem[] = [
    {
      id: 1,
      title: "يا أغلى وطن",
      artist: "محمد وردي",
      image: Images.singericon
    },
    {
      id: 2,
      title: "محمد وردي",
      artist: "مصطفى سيد أحمد",
      image: Images.singericon
    },
    {
      id: 3,
      title: "يا أغلى وطن",
      artist: "محمد وردي",
      image: Images.singericon
    },
    {
      id: 4, title: "محمد وردي",
      artist: "مصطفى سيد أحمد",
      image: Images.singericon
    },

  ];

  return (



    <View style={{ flexDirection: "row", gap: 10, flexWrap: 'wrap', }}>

      <FlatList
        data={data}
        // data={recentdata}
        numColumns={4}
        scrollEnabled={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 10,
        }}
        columnWrapperStyle={{
          // justifyContent: 'space-between',
          marginBottom: 10,
          gap: 10
        }}

        ListEmptyComponent={() =>

          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 40,
          }}>
            <AppImage
              source={Logo.ymusic}
              width={20}
              height={20}
            />
            <AppText
              color={color.darkthemetext}
              fontSize={14}
              marginTop={10}
            >
              No songs found
            </AppText>
          </View>

        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('.', { id: item.id });
            }}
            style={{
              width: '23%',
              height: 164,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#211513',
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
              //backgroundColor: colors.cardBackground,
            }}
          >
            <ImageBackground
              source={GlobalImage(item.cover_image_url)}
              resizeMode="cover"
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                height: 294,
                alignSelf: 'center',
                // marginBottom: 290,
                position: 'absolute',
                alignSelf: 'center',
                width: '100%',
              }}
            >
            </ImageBackground>
            <View
              style={{
                borderWidth: 2,
                borderColor: '#BC4402',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'black',
                height: 38,
                width: 38,
                borderRadius: 19,
                marginTop: 20,
                // position: 'absolute',
                alignSelf: 'center',
                //  bottom: 10,
              }}
            >
              <AppImage
                source={Images.playicon}
                width={12}
                height={12}
                resizeMode="contain"
              />
            </View>

            <AppText
              color="#FFFFFF"
              fontSize={12}
              fontFamily={Inter.regular}
              textAlign="center"
              numberOfLines={1}
              style={{ marginTop: 10 }}
            >
              {item?.title}
            </AppText>
            {/* {console.log(item,"dhvdhcvhcv")} */}
            <AppText
              color="#FFFFFF"
              fontSize={12}
              fontFamily={Inter.regular}
              textAlign="center"
              marginTop={4}
              numberOfLines={1}
            >
              {item.artist}
            </AppText>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 6,
              }}
            >
              <AppImage
                source={Images.ylit}
                width={12}
                height={12}
                resizeMode="contain"
              />

              <AppText
                color="#E52450"
                fontSize={12}
                fontFamily={Inter.regular}
                marginLeft={4}
              >
                {item.likes_count}
              </AppText>
            </View>

          </TouchableOpacity>
        )}
      />
    </View>
  );
}           