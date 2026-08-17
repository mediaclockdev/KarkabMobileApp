import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomIcons } from '../share/constants/media';
import color, { useAppColors } from '../share/constants/color';

const ACTIVE_COLOR = '#E52450';
const INACTIVE_COLOR = '#D4AF37';

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {

  const color = useAppColors();
  //  { name: 'Home', component: Home },
  //  { name: 'Library', component: Library },
  // { name: 'Profile', component: Profile },
  // { name: 'Search', component: Search },

  const getIcon = (name: string, focused: boolean) => {
    switch (name) {
      case 'Home':
        return focused
          ? BottomIcons.home
          : BottomIcons.home
      case 'Search':
        return focused
          ? BottomIcons.search
          : BottomIcons.search

      case '.':
        return focused
          ? BottomIcons.audio
          : BottomIcons.audio


      case 'Profile':
        return focused
          ? BottomIcons.profile
          : BottomIcons.profile
      case 'Library':
        return focused
          ? BottomIcons.library
          : BottomIcons.library




      default:
        return BottomIcons.home
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
                  tintColor={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  resizeMode="cover"
                />
              ) : route.name === 'Profile' ? (
                <Image
                  source={icon}
                  style={[styles.icon, { height: 22, width: 14 }]}
                  tintColor={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={icon}
                  style={styles.icon}
                  tintColor={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                />
              )}

              {route.name !== '.' && (
                <Text
                  style={[
                    styles.label,
                    { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
                  ]}
                >
                  {route.name}
                </Text>
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
    fontSize: 8,
    fontWeight: '500',
  },
});