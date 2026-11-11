// import React, { useEffect, useState, useRef } from 'react'
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
//   Platform,
// } from 'react-native'
// import AppText from '../components/AppText'
// import AppImage from '../components/AppImage'
// import { Banner, Images, Logo } from '../constants/media'
// import { useAppColors } from '../constants/color'
// import Sound from 'react-native-nitro-sound'
// import { Inter } from '../constants/fonts'
// import { GlobalImage } from '../utils/GlobalImage'
// import apiUrls from '../../services/apiUrls'
// import { useNavigation } from '@react-navigation/native'
// import ApiService from '../../services/api'
// import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
// import { addsong, isPausesd, openSongAction } from '../../auth/redux/authSlice'
// import TrackPlayer from '@rntp/player'
// import { playSongList, playTrackSong } from '../../services/player'
// import LinearGradient from 'react-native-linear-gradient';

// export type MusicItem = {
//   id: string;
//   title: string;
//   artist: string;
//   image?: any;
//   cover_image_url?: string;
//   album_picture_url?: string;
//   badge?: string;
//   duration?: string | number;
//   original_song?: string;
//   is_favorite?: boolean;
//   recording_url?: string;
//   file_path?: string;
//   album_name?: string;
//   status?: string;
//   type?: string;
//   tags?: any[];
//   song_name?: string;
//   artist_name?: string;
// };

// interface LibrarylistProps {
//   data?: MusicItem[];
//   musicData: MusicItem[];
//   loading: boolean;
//   onLikePress?: () => void;
//   onDislikePress?: () => void;
//   onSingPress?: (item: MusicItem) => void;
//   type?: string;
//   ListHeaderComponent?: React.ReactElement | null;
//   refreshing?: boolean;
//   onRefresh?: () => void;
//   loadingMore?: boolean;
//   onLoadMore?: () => void;
//   hasMore?: boolean;
//   scrollEnabled?: boolean;
// }

// const Librarylist = ({
//   musicData,
//   loading,
//   onLikePress,
//   onDislikePress,
//   onSingPress,
//   type,
//   ListHeaderComponent,
//   refreshing = false,
//   onRefresh,
//   loadingMore = false,
//   onLoadMore,
//   hasMore = true,
//   scrollEnabled = true,
// }: LibrarylistProps) => {
//   const navigation = useNavigation();
//   const dispatch = useAppDispatch();
//   const playsong = useAppSelector((state: any) => state.auth.playsong);
//   const isPaused = useAppSelector((state: any) => state.auth.isPaused);
//   const color = useAppColors();

//   const [playingId, setPlayingId] = useState<string | null>(null);
//   const [loadings, setLoadings] = useState(false);
//   const [songs, setSongs] = useState<MusicItem[]>(musicData || []);
//   const onEndReachedCalledDuringMomentum = useRef(false);
//   const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([]);
//   const [songdetail, setSongDetail] = useState<any>(null);
//   const [screenLoading, setScreenLoading] = useState(true);
//   const [singLoadingId, setSingLoadingId] = useState<string | null>(null);
//   useEffect(() => {
//     setSongs(musicData || []);
//   }, [musicData]);

//   useEffect(() => {
//     if (playsong?.id) {
//       setPlayingId(playsong.id.toString());
//     } else {
//       setPlayingId(null);
//     }
//   }, [playsong?.id]);

//   const playRecording = async (item: any) => {
//     try {
//       await Sound.stopPlayer();
//       await Sound.removePlayBackListener();
//     } catch (e) { }

//     setPlayingId(item.id?.toString());
//     setLoadings(true);
//     await dispatch(isPausesd(false));

//     try {
//       const list = songs.length > 0 ? songs : musicData || [];
//       const songIndex = list.findIndex(
//         (s: any) => s.id?.toString() === item.id?.toString()
//       );
//       const initialIndex = songIndex >= 0 ? songIndex : 0;
//       if (list.length > 0) {
//         await playSongList(list, initialIndex, true);
//       } else {
//         await playTrackSong(item, true);
//       }
//     } catch (error) {
//       console.log('Librarylist play error:', error);
//       dispatch(addsong({ ...item }));
//     } finally {
//       setLoadings(false);
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       await dispatch(isPausesd(true));
//       await TrackPlayer.pause();
//       try {
//         await Sound.pausePlayer();
//       } catch (e) { }
//     } catch (error) {
//       console.log('Stop Error:', error);
//     }
//   };

//   const likefun = async (id: string) => {
//     try {
//       const response = await ApiService.post(apiUrls.addfavorite(id));
//       const res = response.data;
//       if (res.success) {
//         setSongs(prev =>
//           prev.map(song =>
//             song.id === id ? { ...song, is_favorite: true } : song
//           )
//         );
//         onLikePress?.();
//       } else {
//         //  Alert.alert("Error", res.error || res.message);
//       }
//     } catch (error: any) {
//       // Alert.alert("Error", error?.response?.data?.message || "failed");
//     }
//   };

//   const dislikefun = async (id: string) => {
//     try {
//       const response = await ApiService.delete(apiUrls.addfavorite(id));
//       const res = response.data;
//       if (res.success) {
//         setSongs(prev =>
//           prev.map(song =>
//             song.id === id ? { ...song, is_favorite: false } : song
//           )
//         );
//         onDislikePress?.();
//       } else {
//         // Alert.alert("Error", res.error || res.message);
//       }
//     } catch (error: any) {
//       //Alert.alert("Error", error?.response?.data?.message || "failed");
//     }
//   };

//   const handleFavorite = async (item: MusicItem) => {
//     const id = item.id?.toString();

//     if (!id || favoriteLoadingIds.includes(id)) {
//       return;
//     }

//     const wasFavorite = !!item.is_favorite;
//     const nextFavorite = !wasFavorite;

//     // Update UI immediately
//     setSongs(prev =>
//       prev.map(song =>
//         song.id?.toString() === id
//           ? { ...song, is_favorite: nextFavorite }
//           : song
//       )
//     );

//     setFavoriteLoadingIds(prev => [...prev, id]);

//     try {
//       const response = nextFavorite
//         ? await ApiService.post(apiUrls.addfavorite(id))
//         : await ApiService.delete(apiUrls.addfavorite(id));

//       const res = response.data;

//       if (!res?.success) {
//         throw new Error(res?.message || 'Favorite request failed');
//       }

//       if (nextFavorite) {
//         onLikePress?.();
//       } else {
//         onDislikePress?.();
//       }
//     } catch (error: any) {
//       // Restore the previous state if the API fails
//       setSongs(prev =>
//         prev.map(song =>
//           song.id?.toString() === id
//             ? { ...song, is_favorite: wasFavorite }
//             : song
//         )
//       );

//       Alert.alert(
//         'Error',
//         error?.response?.data?.message ||
//         error?.message ||
//         'Unable to update favorite. Please try again.'
//       );
//     } finally {
//       setFavoriteLoadingIds(prev => prev.filter(songId => songId !== id));
//     }
//   };


//   const handleEndReached = () => {
//     if (!onEndReachedCalledDuringMomentum.current) {
//       if (!loading && !loadingMore && hasMore && onLoadMore) {
//         onEndReachedCalledDuringMomentum.current = true;
//         onLoadMore();
//       }
//     }
//   };

//   useEffect(() => {
//     onEndReachedCalledDuringMomentum.current = false;
//   }, [loadingMore, musicData?.length]);

//   const renderFooter = () => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footerLoader}>
//         <ActivityIndicator size="small" color={color.mgyellow || '#BC4402'} />
//         <AppText fontSize={12} color={color.darkthemetext} marginTop={6}>
//           Loading more songs...
//         </AppText>
//       </View>
//     );
//   };


//   const getSongDetail = async (songid: any) => {
//     try {
//       setScreenLoading(true);
//       const response = await ApiService.get(apiUrls.singlesongdetail(songid));
//       console.log(response, "kkkknnnnmmsssss")
//       if ((response as any).data?.success) {
//         const song = (response as any).data.song;
//         setSongDetail(song);
//         (navigation as any).navigate('Recording', {
//           prevScreen: 'Library',
//           data: song,
//         });
//         // prepareLyrics(song);

//         let activeMediaId: string | null = null;
//         try {
//           activeMediaId = TrackPlayer.getActiveMediaItem()?.mediaId || null;
//         } catch (e) { }




//       }
//     } catch (error: any) {
//       setScreenLoading(false);
//     } finally {

//       setScreenLoading(false);
//     }
//   };


//   const handleSing = async (item: MusicItem) => {
//     if (singLoadingId) return;

//     try {
//       setSingLoadingId(item.id.toString());
//       console.log(item.id, "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
//       await getSongDetail(item.id);

//       // Add your navigation / recording logic here
//     } catch (error) {
//       console.log('Sing error:', error);
//     } finally {
//       setSingLoadingId(null);
//     }
//   };


//   const renderItem = ({ item }: { item: MusicItem }) => {
//     const isCurrentPlaying =
//       playingId?.toString() === item.id?.toString() && !isPaused;

//     return (
//       <LinearGradient
//         colors={['#A63B17', '#79251E', '#6A1A83', '#50106E']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.cardGradient}
//       >
//         <View style={styles.cardInner}>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 20 }}>
//             {/* Album Image */}
//             <TouchableOpacity
//               activeOpacity={0.8}
//               onPress={() =>
//                 (navigation as any).navigate('.', {
//                   id: item.id,
//                   type,
//                   previousScreen: 'Library',
//                 })
//               }
//             >
//               <AppImage
//                 source={GlobalImage(
//                   item?.cover_image_url || item?.album_picture_url
//                 )}
//                 width={82}
//                 height={62}
//                 resizeMode="cover"
//                 style={styles.albumImage}
//               />
//             </TouchableOpacity>

//             {/* Song Details */}

//             <View style={styles.content}>
//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 onPress={() =>
//                   (navigation as any).navigate('.', {
//                     id: item.id,
//                     type,
//                     previousScreen: 'Library',
//                   })
//                 }
//               >
//                 <AppText
//                   fontSize={14}
//                   fontWeight="700"
//                   fontFamily={Inter.bold}
//                   color="#FFFFFF"
//                   numberOfLines={1}
//                 >
//                   {item.title || item?.song_name}
//                 </AppText>

//                 <AppText
//                   fontSize={12}
//                   fontFamily={Inter.medium}
//                   color="#BDBDC1"
//                   marginTop={5}
//                   numberOfLines={1}
//                 >
//                   {item.artist || item.album_name || item?.artist_name}
//                 </AppText>
//               </TouchableOpacity>

//               {/* Trending */}

//               {/* <View style={styles.trendingBadge}>
//               <AppText fontSize={13} color="#FF741D">
//                 {item.badge}
//               </AppText>
//             </View> */}
//               {item.tags?.[0]?.title ? (
//                 <View style={styles.trendingBadge}>
//                   <AppText fontSize={12} color="#FF741D">
//                     {item.tags[0].title}
//                   </AppText>
//                 </View>
//               ) : null}
//             </View>

//             <View style={styles.controlsContainer}>

//               <TouchableOpacity
//                 activeOpacity={0.7}
//                 style={styles.roundAction}
//                 disabled={singLoadingId !== null}
//                 onPress={() => handleSing(item)}
//               >
//                 {singLoadingId === item.id.toString() ? (
//                   <ActivityIndicator size="small" color="#FF741D" />
//                 ) : (
//                   <AppImage
//                     source={Images.mic}
//                     width={18}
//                     height={18}
//                     tintColor="#FF741D"
//                     resizeMode="contain"
//                   />
//                 )}
//               </TouchableOpacity>

//               <TouchableOpacity
//                 activeOpacity={0.7}
//                 style={styles.roundAction}
//                 onPress={() =>
//                   isCurrentPlaying
//                     ? stopRecording()
//                     : playRecording(item)
//                 }
//               >
//                 {loadings &&
//                   playingId?.toString() === item.id?.toString() ? (
//                   <ActivityIndicator size="small" color="#FFFFFF" />
//                 ) : (
//                   <AppImage
//                     source={Images.playicon}
//                     width={15}
//                     height={15}
//                     tintColor="#FFFFFF"
//                     resizeMode="contain"
//                   />
//                 )}
//               </TouchableOpacity>

//             </View>

//           </View>



//           {/* Right Side */}
//           <View style={styles.rightSection}>

//             {/* Duration and Menu */}
//             <View style={styles.topActions}>
//               {
//                 item.is_favorite ?
//                   <AppImage
//                     source={Images.star1}
//                     height={19}
//                     width={19}
//                     resizeMode="contain"
//                   />
//                   : null

//               }
//               <AppText
//                 fontSize={10}
//                 color="#A5A5AE"
//                 fontWeight="500"
//               >
//                 {item.duration || '00:00'}
//               </AppText>

//               <TouchableOpacity
//                 onPress={() => dispatch(openSongAction(item))}
//                 style={styles.menu}
//               >
//                 <View style={styles.dot} />
//                 <View style={styles.dot} />
//                 <View style={styles.dot} />
//               </TouchableOpacity>
//             </View>

//             {/* Microphone and Play */}

//           </View>

//         </View>
//       </LinearGradient>
//     );
//   };



//   return (
//     <FlatList
//       data={songs}
//       scrollEnabled={scrollEnabled}
//       keyboardShouldPersistTaps="handled"
//       keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
//       keyExtractor={(item, index) => (item?.id ? `${item.id}-${index}` : index.toString())}
//       renderItem={renderItem}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.listContainer}
//       ListHeaderComponent={ListHeaderComponent}
//       refreshControl={
//         onRefresh ? (
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[color.mgred]}
//             progressBackgroundColor={color.darkgray}
//           />
//         ) : undefined
//       }
//       onEndReached={handleEndReached}
//       onEndReachedThreshold={0.5}
//       onScrollBeginDrag={() => {
//         onEndReachedCalledDuringMomentum.current = false;
//       }}
//       onMomentumScrollBegin={() => {
//         onEndReachedCalledDuringMomentum.current = false;
//       }}
//       removeClippedSubviews={Platform.OS === 'android'}
//       maxToRenderPerBatch={10}
//       windowSize={10}
//       initialNumToRender={10}
//       ListFooterComponent={renderFooter}
//       ListEmptyComponent={() =>
//         loading ? (
//           <View style={styles.centerContainer}>
//             <ActivityIndicator size="large" color={color.mgyellow || '#BC4402'} />
//           </View>
//         ) : (
//           <View style={styles.centerContainer}>
//             <AppImage source={Logo.ymusic} width={20} height={20} />
//             <AppText color={color.darkthemetext} fontSize={14} marginTop={10}>
//               No songs found
//             </AppText>
//           </View>
//         )
//       }
//     />
//   );
// };

// export default Librarylist;


// const styles = StyleSheet.create({
//   listContainer: {
//     paddingBottom: 140,
//     paddingHorizontal: 2,
//   },

//   card: {
//     width: '100%',
//     backgroundColor: '#171719',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#29292D',
//     padding: 8,
//     marginVertical: 5,
//   },

//   topSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 9,
//   },

//   // albumImage: {
//   //   borderRadius: 9,
//   //   overflow: 'hidden',
//   // },

//   // content: {
//   //   flex: 1,
//   //   marginLeft: 11,
//   //   justifyContent: 'center',
//   // },

//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 5,
//     gap: 5,
//   },

//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 10,
//     backgroundColor: '#25D68A',
//   },

//   // menu: {
//   //   alignSelf: 'flex-start',
//   //   paddingHorizontal: 5,
//   //   paddingVertical: 3,
//   //   alignItems: 'center',
//   //   justifyContent: 'center',
//   // },

//   // dot: {
//   //   width: 2.5,
//   //   height: 2.5,
//   //   borderRadius: 5,
//   //   backgroundColor: '#AFAFB3',
//   //   marginVertical: 1.5,
//   // },

//   actionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },

//   playButton: {
//     flex: 1,
//     height: 34,
//     borderRadius: 18,
//     backgroundColor: '#303035',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//   },

//   singButtonWrapper: {
//     flex: 1,
//     borderRadius: 18,
//     overflow: 'hidden',
//   },

//   singButton: {
//     height: 34,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 7,
//     borderRadius: 18,
//   },

//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 40,
//   },

//   footerLoader: {
//     paddingVertical: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 80,
//   },

//   cardGradient: {
//     width: '100%',
//     borderRadius: 27,
//     // padding: 2,
//     marginVertical: 7,
//     height: 101,
//     alignItems: 'center',
//     justifyContent: 'center',

//   },

//   cardInner: {
//     width: '99%',
//     height: 98,
//     borderRadius: 25,
//     backgroundColor: '#111116',
//     padding: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     alignSelf: 'center',
//     //margin: 1
//   },

//   albumImage: {
//     borderRadius: 13,
//     overflow: 'hidden',
//   },

//   content: {
//     flex: 1,
//     minWidth: 0,
//     marginLeft: 12,
//     justifyContent: 'center',
//   },

//   trendingBadge: {
//     alignSelf: 'flex-start',
//     borderWidth: 1,
//     borderColor: '#B64B0B',
//     borderRadius: 20,
//     paddingHorizontal: 9,
//     paddingVertical: 4,
//     marginTop: 10,
//   },

//   rightSection: {
//     position: 'absolute',
//     right: 10,
//     top: 10,
//     bottom: 0,
//     width: 112,
//     // height: 138,
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//   },

//   topActions: {
//     width: '100%',
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     gap: 8,
//   },

//   menu: {
//     paddingHorizontal: 5,
//     paddingVertical: 4,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   dot: {
//     width: 2,
//     height: 2,
//     borderRadius: 5,
//     backgroundColor: '#888890',
//     marginVertical: 2,
//   },

//   controlsContainer: {
//     width: 118,
//     height: 42,
//     borderWidth: 1,
//     borderColor: '#69616A',
//     borderRadius: 30,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-evenly',

//   },

//   roundAction: {
//     width: 29,
//     height: 29,
//     borderRadius: 22,
//     borderWidth: 1.5,
//     borderColor: '#E95A00',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

// });



import React, { useEffect, useState, useRef } from 'react'

import {

  View,

  FlatList,

  StyleSheet,

  TouchableOpacity,

  ActivityIndicator,

  Alert,

  RefreshControl,

  Platform,

} from 'react-native'

import AppText from '../components/AppText'

import AppImage from '../components/AppImage'

import { Banner, Images, Logo } from '../constants/media'

import { useAppColors } from '../constants/color'

import Sound from 'react-native-nitro-sound'

import { Inter } from '../constants/fonts'

import { GlobalImage } from '../utils/GlobalImage'

import apiUrls from '../../services/apiUrls'

import { useNavigation } from '@react-navigation/native'

import ApiService from '../../services/api'

import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'

import { addsong, isPausesd, openSongAction } from '../../auth/redux/authSlice'

import TrackPlayer from '@rntp/player'

import { playSongList, playTrackSong } from '../../services/player'

import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from "react-i18next";
// ---- UI tokens ----

const BRAND_GRADIENT = ['#FF741D', '#C2361B', '#8A1FA8'];

const BORDER_IDLE = ['rgba(255,116,29,0.35)', 'rgba(138,31,168,0.35)'];

const BORDER_ACTIVE = ['#FF741D', '#8A1FA8'];

const CARD_BG = '#14141A';

const TEXT_PRIMARY = '#FFFFFF';

const TEXT_SECONDARY = '#9C9CA6';

const ACCENT = '#FF741D';

export type MusicItem = {

  id: string;

  title: string;

  artist: string;

  image?: any;

  cover_image_url?: string;

  album_picture_url?: string;

  badge?: string;

  duration?: string | number;

  original_song?: string;

  is_favorite?: boolean;

  recording_url?: string;

  file_path?: string;

  album_name?: string;

  status?: string;

  type?: string;

  tags?: any[];

  song_name?: string;

  artist_name?: string;

};

interface LibrarylistProps {

  data?: MusicItem[];

  musicData: MusicItem[];

  loading: boolean;

  onLikePress?: () => void;

  onDislikePress?: () => void;

  onSingPress?: (item: MusicItem) => void;

  type?: string;

  ListHeaderComponent?: React.ReactElement | null;

  refreshing?: boolean;

  onRefresh?: () => void;

  loadingMore?: boolean;

  onLoadMore?: () => void;

  hasMore?: boolean;

  scrollEnabled?: boolean;

}

const Librarylist = ({

  musicData,

  loading,

  onLikePress,

  onDislikePress,

  onSingPress,

  type,

  ListHeaderComponent,

  refreshing = false,

  onRefresh,

  loadingMore = false,

  onLoadMore,

  hasMore = true,

  scrollEnabled = true,

}: LibrarylistProps) => {

  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const playsong = useAppSelector((state: any) => state.auth.playsong);

  const isPaused = useAppSelector((state: any) => state.auth.isPaused);

  const color = useAppColors();

  const [playingId, setPlayingId] = useState<string | null>(null);

  const [loadings, setLoadings] = useState(false);

  const [songs, setSongs] = useState<MusicItem[]>(musicData || []);

  const onEndReachedCalledDuringMomentum = useRef(false);

  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([]);

  const [songdetail, setSongDetail] = useState<any>(null);

  const [screenLoading, setScreenLoading] = useState(true);

  const [singLoadingId, setSingLoadingId] = useState<string | null>(null);

  useEffect(() => {

    setSongs(musicData || []);

  }, [musicData]);

  useEffect(() => {

    if (playsong?.id) {

      setPlayingId(playsong.id.toString());

    } else {

      setPlayingId(null);

    }

  }, [playsong?.id]);

  const playRecording = async (item: any) => {

    try {

      await Sound.stopPlayer();

      await Sound.removePlayBackListener();

    } catch (e) { }

    setPlayingId(item.id?.toString());

    setLoadings(true);

    await dispatch(isPausesd(false));

    try {

      const list = songs.length > 0 ? songs : musicData || [];

      const songIndex = list.findIndex(

        (s: any) => s.id?.toString() === item.id?.toString()

      );

      const initialIndex = songIndex >= 0 ? songIndex : 0;

      if (list.length > 0) {

        await playSongList(list, initialIndex, true);

      } else {

        await playTrackSong(item, true);

      }

    } catch (error) {

      console.log('Librarylist play error:', error);

      dispatch(addsong({ ...item }));

    } finally {

      setLoadings(false);

    }

  };

  const stopRecording = async () => {

    try {

      await dispatch(isPausesd(true));

      await TrackPlayer.pause();

      try {

        await Sound.pausePlayer();

      } catch (e) { }

    } catch (error) {

      console.log('Stop Error:', error);

    }

  };

  const likefun = async (id: string) => {

    try {

      const response = await ApiService.post(apiUrls.addfavorite(id));

      const res = response.data;

      if (res.success) {

        setSongs(prev =>

          prev.map(song =>

            song.id === id ? { ...song, is_favorite: true } : song

          )

        );

        onLikePress?.();

      }

    } catch (error: any) { }

  };

  const dislikefun = async (id: string) => {

    try {

      const response = await ApiService.delete(apiUrls.addfavorite(id));

      const res = response.data;

      if (res.success) {

        setSongs(prev =>

          prev.map(song =>

            song.id === id ? { ...song, is_favorite: false } : song

          )

        );

        onDislikePress?.();

      }

    } catch (error: any) { }

  };

  const handleFavorite = async (item: MusicItem) => {

    const id = item.id?.toString();

    if (!id || favoriteLoadingIds.includes(id)) return;

    const wasFavorite = !!item.is_favorite;

    const nextFavorite = !wasFavorite;

    setSongs(prev =>

      prev.map(song =>

        song.id?.toString() === id ? { ...song, is_favorite: nextFavorite } : song

      )

    );

    setFavoriteLoadingIds(prev => [...prev, id]);

    try {

      const response = nextFavorite

        ? await ApiService.post(apiUrls.addfavorite(id))

        : await ApiService.delete(apiUrls.addfavorite(id));

      const res = response.data;

      if (!res?.success) {

        throw new Error(res?.message || 'Favorite request failed');

      }

      nextFavorite ? onLikePress?.() : onDislikePress?.();

    } catch (error: any) {

      setSongs(prev =>

        prev.map(song =>

          song.id?.toString() === id ? { ...song, is_favorite: wasFavorite } : song

        )

      );

      Alert.alert(

        'Error',

        error?.response?.data?.message ||

        error?.message ||

        'Unable to update favorite. Please try again.'

      );

    } finally {

      setFavoriteLoadingIds(prev => prev.filter(songId => songId !== id));

    }

  };

  const handleEndReached = () => {

    if (!onEndReachedCalledDuringMomentum.current) {

      if (!loading && !loadingMore && hasMore && onLoadMore) {

        onEndReachedCalledDuringMomentum.current = true;

        onLoadMore();

      }

    }

  };

  useEffect(() => {

    onEndReachedCalledDuringMomentum.current = false;

  }, [loadingMore, musicData?.length]);

  const renderFooter = () => {

    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={color.mgyellow || '#BC4402'} />
        <AppText fontSize={12} color={color.darkthemetext} marginTop={6}>

          {t('Library.Loadingmorsongs')}
        </AppText>
      </View>

    );

  };

  const getSongDetail = async (songid: any) => {

    try {

      setScreenLoading(true);

      const response = await ApiService.get(apiUrls.singlesongdetail(songid));

      if ((response as any).data?.success) {

        const song = (response as any).data.song;

        setSongDetail(song);

        (navigation as any).navigate('Recording', {

          prevScreen: 'Library',

          data: song,

        });

      }

    } catch (error: any) {

      setScreenLoading(false);

    } finally {

      setScreenLoading(false);

    }

  };

  const handleSing = async (item: MusicItem) => {

    if (singLoadingId) return;

    try {

      setSingLoadingId(item.id.toString());

      await getSongDetail(item.id);

    } catch (error) {

      console.log('Sing error:', error);

    } finally {

      setSingLoadingId(null);

    }

  };

  const openDetail = (item: MusicItem) =>

    (navigation as any).navigate('.', {

      id: item.id,

      type,

      previousScreen: 'Library',

    });

  const renderItem = ({ item }: { item: MusicItem }) => {

    const isActive = playingId?.toString() === item.id?.toString();

    const isCurrentPlaying = isActive && !isPaused;

    const isPlayLoading = loadings && isActive;

    const isSingLoading = singLoadingId === item.id?.toString();

    const tag = item.tags?.[0]?.title;

    const hasDuration = item.duration && item.duration !== '00:00';

    return (
      <LinearGradient

        colors={isActive ? BORDER_ACTIVE : BORDER_IDLE}

        start={{ x: 0, y: 0 }}

        end={{ x: 1, y: 1 }}

        style={styles.cardBorder}
      >
        <View style={styles.card}>

          {/* Artwork + play overlay */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => openDetail(item)}>
            <View style={[styles.artWrap, isActive && styles.artWrapActive]}>
              <AppImage

                source={GlobalImage(item?.cover_image_url || item?.album_picture_url)}

                width={68}

                height={68}

                resizeMode="cover"

                style={styles.art}

              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity

            activeOpacity={0.8}

            style={styles.playFab}

            onPress={() => (isCurrentPlaying ? stopRecording() : playRecording(item))}

            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >

            {isPlayLoading ? (
              <ActivityIndicator size="small" color={ACCENT} />

            ) : isCurrentPlaying ? (
              <View style={styles.pauseIcon}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>

            ) : (
              <AppImage

                source={Images.playicon}

                width={11}

                height={11}

                tintColor={ACCENT}

                resizeMode="contain"

                style={{ marginLeft: 2 }}

              />

            )}
          </TouchableOpacity>

          {/* Song info */}
          <TouchableOpacity

            activeOpacity={0.8}

            style={styles.info}

            onPress={() => openDetail(item)}
          >
            <AppText

              fontSize={15}

              fontWeight="700"

              fontFamily={Inter.bold}

              color={isActive ? ACCENT : TEXT_PRIMARY}

              numberOfLines={1}
            >

              {item.title || item?.song_name}
            </AppText>

            <AppText

              fontSize={12}

              fontFamily={Inter.medium}

              color={TEXT_SECONDARY}

              marginTop={3}

              numberOfLines={1}
            >

              {item.artist || item.album_name || item?.artist_name}
            </AppText>

            <View style={styles.metaRow}>

              {tag ? (
                <View style={styles.tagChip}>
                  <AppText fontSize={10} fontWeight="600" color={ACCENT}>

                    {tag}
                  </AppText>
                </View>

              ) : null}

              {item.is_favorite ? (
                <AppImage source={Images.star1} width={13} height={13} resizeMode="contain" />

              ) : null}

              {hasDuration ? (
                <AppText fontSize={11} color={TEXT_SECONDARY}>

                  {item.duration}
                </AppText>

              ) : null}
            </View>
          </TouchableOpacity>

          {/* Right actions */}
          <View style={styles.actions}>
            <TouchableOpacity

              onPress={() => dispatch(openSongAction(item))}

              style={styles.menu}

              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </TouchableOpacity>

            <TouchableOpacity

              activeOpacity={0.85}

              disabled={singLoadingId !== null}

              onPress={() => handleSing(item)}

              style={{ opacity: singLoadingId && !isSingLoading ? 0.5 : 1 }}
            >
              <LinearGradient

                colors={BRAND_GRADIENT}

                start={{ x: 0, y: 0 }}

                end={{ x: 1, y: 0 }}

                style={styles.singBtn}
              >

                {isSingLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />

                ) : (
                  <>
                    <AppImage

                      source={Images.mic}

                      width={13}

                      height={13}

                      tintColor="#FFFFFF"

                      resizeMode="contain"

                    />

                    {/* swap with your i18n key, e.g. t('sing') */}
                    <AppText fontSize={12} fontWeight="700" fontFamily={Inter.bold} color="#FFFFFF">
                      {t('Library.Sing')}

                    </AppText>
                  </>

                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

    );

  };

  return (
    <FlatList

      data={songs}

      scrollEnabled={scrollEnabled}

      keyboardShouldPersistTaps="handled"

      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}

      keyExtractor={(item, index) => (item?.id ? `${item.id}-${index}` : index.toString())}

      renderItem={renderItem}

      showsVerticalScrollIndicator={false}

      contentContainerStyle={styles.listContainer}

      ListHeaderComponent={ListHeaderComponent}

      refreshControl={

        onRefresh ? (
          <RefreshControl

            refreshing={refreshing}

            onRefresh={onRefresh}

            colors={[color.mgred]}

            progressBackgroundColor={color.darkgray}

          />

        ) : undefined

      }

      onEndReached={handleEndReached}

      onEndReachedThreshold={0.5}

      onScrollBeginDrag={() => {

        onEndReachedCalledDuringMomentum.current = false;

      }}

      onMomentumScrollBegin={() => {

        onEndReachedCalledDuringMomentum.current = false;

      }}

      removeClippedSubviews={Platform.OS === 'android'}

      maxToRenderPerBatch={10}

      windowSize={10}

      initialNumToRender={10}

      ListFooterComponent={renderFooter}

      ListEmptyComponent={() =>

        loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={color.mgyellow || '#BC4402'} />
          </View>

        ) : (
          <View style={styles.centerContainer}>
            <AppImage source={Logo.ymusic} width={20} height={20} />
            <AppText color={color.darkthemetext} fontSize={14} marginTop={10}>

              No songs found
            </AppText>
          </View>

        )

      }

    />

  );

};

export default Librarylist;

const styles = StyleSheet.create({

  listContainer: {

    paddingBottom: 140,

    paddingHorizontal: 2,

  },

  // Card

  cardBorder: {

    borderRadius: 22,

    // padding: 1,

    marginVertical: 6,

  },

  card: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: CARD_BG,

    borderRadius: 21,

    paddingVertical: 12,

    paddingLeft: 12,

    paddingRight: 12,
    margin: 1

  },

  // Artwork

  artWrap: {

    width: 70,

    height: 70,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: 'transparent',

    overflow: 'hidden',

    alignItems: 'center',

    justifyContent: 'center',

  },

  artWrapActive: {

    borderColor: ACCENT,

  },

  art: {

    borderRadius: 15,

  },

  playFab: {

    position: 'absolute',

    left: 64,

    bottom: 10,

    width: 28,

    height: 28,

    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: '#000',

    shadowOpacity: 0.4,

    shadowRadius: 4,

    shadowOffset: { width: 0, height: 2 },

    elevation: 5,

  },

  pauseIcon: {

    flexDirection: 'row',

    gap: 3,

  },

  pauseBar: {

    width: 3,

    height: 11,

    borderRadius: 1.5,

    backgroundColor: ACCENT,

  },

  // Info

  info: {

    flex: 1,

    minWidth: 0,

    marginLeft: 16,

    justifyContent: 'center',

  },

  metaRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,

    marginTop: 8,

  },

  tagChip: {

    backgroundColor: 'rgba(255,116,29,0.12)',

    borderRadius: 10,

    paddingHorizontal: 8,

    paddingVertical: 3,

  },

  // Actions

  actions: {

    alignItems: 'flex-end',

    justifyContent: 'space-between',

    alignSelf: 'stretch',

    marginLeft: 10,

  },

  menu: {

    paddingHorizontal: 4,

    paddingVertical: 2,

    alignItems: 'center',

  },

  dot: {

    width: 3,

    height: 3,

    borderRadius: 2,

    backgroundColor: '#8A8A94',

    marginVertical: 1.5,

  },

  singBtn: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 6,

    height: 32,

    width: 106,

    // paddingHorizontal: 14,

    borderRadius: 16,



  },

  // Misc

  centerContainer: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    paddingVertical: 40,

  },

  footerLoader: {

    paddingVertical: 20,

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 80,

  },

});
