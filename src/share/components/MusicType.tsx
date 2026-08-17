import React from 'react'

import {
  View,
  FlatList,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'

import AppText from '../components/AppText'
import color, { useAppColors } from '../constants/color'
import { Inter } from '../constants/fonts'
import { Images } from '../constants/media'
import { GlobalImage } from '../utils/GlobalImage'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'react-native-linear-gradient'
const { width } = Dimensions.get('window')


const DATA = [
  {
    id: '1',
    title: 'Nostalgia',
    title1: 'ظارك',
    image: Images.bmoodbanner,

  },
  {
    id: '2',
    title: 'Sudanese',
    title1: 'المسرح',
    image: Images.b1moodbanner,

  },
  {
    id: '3',
    title: 'Romantic',
    title1: 'لصوت',
    image: Images.b2moodbanner,

  },
  {
    id: '4',
    title: 'Party',
    title1: 'ك.. والم',
    image: Images.b3moodbanner,
    titcolor: '#AE711C'
  },
]

const MusicType = ({ data }: { data: any[] }) => {
  const color = useAppColors()
  const navigation = useNavigation();

  const mergedData =
    data?.length > 0
      ? data.map(item => ({
        ...item,
        image: item.image
          ? typeof item.image === 'string'
            ? { uri: item.image }
            : item.image
          : Images.b3moodbanner,
      }))
      : DATA
  return (
    <View style={styles.container}>
      <FlatList
        data={data?.length > 0
          ? mergedData.slice(0, 6)
          : DATA.slice(0, 6)}
        //data={DATA}

        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SongsListScreen', {
                songs: item,
                previousScreen: 'Browsemood',
              });
            }}
          >


            <ImageBackground
              source={GlobalImage(item?.category_image)}
              style={styles.card}
              imageStyle={styles.image}
              resizeMode="cover"
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(0,0,0,0.25)',
                  'rgba(0,0,0,0.65)',
                  'rgba(0,0,0,0.9)',
                ]}
                locations={[0, 0.45, 0.7, 1]}
                style={styles.overlay}
              >
                <View style={{ paddingHorizontal: 15, paddingBottom: 10 }}>


                  <AppText
                    numberOfLines={2}
                    fontSize={12}
                    color="#FFF"
                    fontFamily={Inter.bold}
                    style={styles.title}
                  >
                    {item.title}
                  </AppText>

                  <AppText
                    numberOfLines={2}
                    fontSize={10}
                    color="#FFD54F"
                    fontFamily={Inter.medium}
                    style={styles.description}
                  >
                    {item.description}
                  </AppText>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

export default MusicType

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },

  contentContainer: {
    paddingHorizontal: 8,
  },

  card: {
    width: 91,
    height: 123,
    marginRight: 10,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#361F04',
  },

  image: {
    borderRadius: 18,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
    // paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    // width: '130%',
    alignSelf: 'center',
    // height: '100%'
    width: 91,
    height: 123,
  },

  title: {
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,

  },

  description: {
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    // margin: 5,
    //alignSelf: 'center'
  },
})