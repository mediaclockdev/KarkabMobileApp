import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomIcons, Images } from '../share/constants/media';
import color, { useAppColors } from '../share/constants/color';
import GradientText from '../share/components/GradientText';
import AppImageLg from '../share/components/AppImageLg';

const ACTIVE_COLOR = '#E52450';
// const INACTIVE_COLOR = '#D4AF37';
const INACTIVE_COLOR = '#8E8F94';

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const color = useAppColors();

  // Hide the tab bar when '.' screen is focused
  const currentRouteName = state.routes[state.index]?.name;
  if (currentRouteName === '.') {
    return null;
  }

  //  { name: 'Home', component: Home },
  //  { name: 'Library', component: Library },
  // { name: 'Profile', component: Profile },
  // { name: 'Search', component: Search },

  const getIcon = (name: string, focused: boolean) => {
    switch (name) {
      case 'Home':
        return focused
          ? BottomIcons.home
          : BottomIcons.home;
      case 'PlayListScreen':
        return focused
          ? Images.songplay
          : Images.songplay;

      case '.':
        return focused
          ? BottomIcons.singl
          : BottomIcons.audio;

      case 'Profile':
        return focused
          ? BottomIcons.profile
          : BottomIcons.profile;
      case 'Library':
        return focused
          ? BottomIcons.library
          : BottomIcons.library;

      default:
        return BottomIcons.home;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color.darkbackround }]}>
      {state.routes
        .filter(route => route.name !== 'Recording' && route.name !== 'ArtistScreen' && route.name !== 'SongsScreen'
          && route.name !== 'SudaneseClassicsScreen'
          && route.name !== 'Browsemood'
          && route.name !== 'SongsListScreen'
          && route.name !== 'SearchSongSecreen'
          && route.name !== 'SelectedArtistScreen'
          && route.name !== 'AllArtistScreen'
          && route.name !== 'Search'
          // && route.name !== 'PlayListScreen'
          && route.name !== 'GenreScreen'
          && route.name !== 'PerformanceScreen'
          && route.name !== 'SettingScreen'
          && route.name !== 'ManageProfileScreen'
          && route.name !== 'NotificationScreen'
          && route.name !== 'CreatePlaylist'
          && route.name !== 'PlaylistDetailScreen'
          && route.name !== 'RecordingList'
          && route.name !== 'LanguageScreen'
          && route.name !== 'DownloadsScreen'
          && route.name !== 'VocalRecordingScreen'
          && route.name !== 'TermsConditionsScreen'
          && route.name !== 'PrivacyPolicyScreen'
          && route.name !== 'AboutKarKabScreen'
          && route.name !== 'ContactUsScreen'
        )
        .map((route, index) => {
          const isFocused =
            state.routes[state.index].name === route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const icon = getIcon(route.name, isFocused);

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {route.name === '.' ? (
                <Image
                  source={icon}
                  style={[styles.icon, { height: 58, width: 58 }]}
                  tintColor={isFocused ? undefined : INACTIVE_COLOR}
                  resizeMode="cover"
                />
              ) : route.name === 'Profile' ? (
                isFocused ? (
                  <AppImageLg
                    source={icon}
                    width={14}
                    height={22}
                    style={[styles.icon, { height: 22, width: 15 }]}
                    colors={['#FA6144', '#D83B7E', '#7E3FF2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={icon}
                    style={[styles.icon, { height: 22, width: 14 }]}
                    tintColor={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                    resizeMode="cover"
                  />
                )
              ) : (
                isFocused ? (
                  <AppImageLg
                    source={icon}
                    width={18}
                    height={19}
                    style={styles.icon}
                    colors={['#FA6144', '#D83B7E', '#7E3FF2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                ) : (
                  <Image
                    source={icon}
                    style={styles.icon}
                    tintColor={INACTIVE_COLOR}
                    resizeMode="contain"
                  />
                )
              )}

              {route.name !== '.' && (
                isFocused ? (
                  // <GradientText style={styles.label}>
                  //   {route.name === 'PlayListScreen' ? 'Playlist' : route.name}
                  // </GradientText>
                  <Text
                    style={[
                      styles.label,
                      { color: '#FA6144' },
                    ]}
                  >
                    {route.name === 'PlayListScreen' ? 'Playlist' : route.name}
                  </Text>
                ) : (
                  <Text
                    style={[
                      styles.label,
                      { color: INACTIVE_COLOR },
                    ]}
                  >
                    {route.name === 'PlayListScreen' ? 'Playlist' : route.name}
                  </Text>
                )
              )}
            </TouchableOpacity>
          );
        })}
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 18,
    height: 19,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});