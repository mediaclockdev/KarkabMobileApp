import React, { useEffect } from 'react';
import {
  StyleSheet,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from './CustomTabBar';
import { useAppDispatch, useAppSelector } from '../share/hooks/useAppSelector';
import MiniPlayer from '../share/components/MiniPlayer';
import { restoreLastPlayedSong } from '../services/player';

const Tab = createBottomTabNavigator();

type Props = {
  screens: {
    name: string;
    component: React.ComponentType<any>;
  }[];
};

export const HideableBottomTabs = ({ screens }: Props) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const playsong = useAppSelector((state: any) => state.auth.playsong);
  const loginState = useAppSelector(
    (state: any) => state.auth.loginState
  );

  const isTablet = width >= 768;
  const TAB_HEIGHT = isTablet ? 85 : 65;
  useEffect(() => {
    restoreLastPlayedSong();
  }, []);

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,

          tabBarStyle:
            loginState === 'first'
              ? { display: 'none' }
              : styles.tabBar,
        }}
        tabBar={(props) => {
          const currentRoute =
            props.state.routes[props.state.index]?.name;

          // Always hide tab bar for these screens
          if (
            loginState === 'first' ||
            currentRoute === 'Recording' ||
            currentRoute === 'SearchSongSecreen' ||
            currentRoute === 'SelectedArtistScreen' ||
            currentRoute === 'AllArtistScreen' ||
            currentRoute === 'PlayListScreen' ||
            currentRoute === 'GenreScreen' ||
            currentRoute === 'PerformanceScreen' ||
            currentRoute === 'SettingScreen' ||
            currentRoute === 'ManageProfileScreen' ||
            currentRoute === 'NotificationScreen' ||
            currentRoute === 'CreatePlaylist' ||
            currentRoute === 'PlaylistDetailScreen' ||
            currentRoute === 'RecordingList' ||
            currentRoute === 'LanguageScreen' ||
            currentRoute === 'DownloadsScreen' ||
            currentRoute === 'VocalRecordingScreen' ||
            currentRoute === 'SongsListScreen'


          ) {
            return null;
          }

          return (
            <View
              style={[
                styles.tabContainer,
                {
                  height: TAB_HEIGHT,
                },
              ]}
            >
              <CustomTabBar {...props} />
            </View>
          );
        }}
      >
        {screens.map((screen) => (
          <Tab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
          />
        ))}
      </Tab.Navigator>
      <MiniPlayer bottomOffset={78} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },

  tabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor:
      Platform.OS === 'android'
        ? 'rgba(255,255,255,0.95)'
        : 'transparent',

    elevation: 12,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: -2,
    },

    overflow: 'hidden',
    zIndex: 999,
  },
});