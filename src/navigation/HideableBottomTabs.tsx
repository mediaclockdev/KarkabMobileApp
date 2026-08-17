import React from 'react';
import {
  StyleSheet,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from './CustomTabBar';

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
  const isTablet = width >= 768;
  const TAB_HEIGHT = isTablet ? 85 : 65;

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          //   tabBarHideOnKeyboard: true,
        }}
        tabBar={(props) => {
          const currentRoute =
            props.state.routes[props.state.index]?.name;

          // Hide entire tab bar on Recording screen
          if (currentRoute === 'Recording' || currentRoute === 'SearchSongSecreen') {
            return null;
          }

          return (
            <View
              style={[
                styles.tabContainer,
                {
                  height: TAB_HEIGHT,
                  //  paddingBottom: insets.bottom,
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
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
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