import React from 'react';
import {
  StyleSheet,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';

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

  const isTablet = width >= 768;
  const TAB_HEIGHT = isTablet ? 85 : 65;

  return (
    <View style={styles.root}>
      <Tab.Navigator

        screenOptions={{
          headerShown: false,

          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
        }}
        tabBar={(props) => {
          const currentRoute =
            props.state.routes[props.state.index]?.name;


          if (
            currentRoute === 'Recording' ||
            currentRoute === 'Createorder' ||
            currentRoute === 'WebViewScreen' ||
            currentRoute === 'ChangeAddress' ||
            currentRoute === 'PlaceOrder' ||
            currentRoute === 'Products' ||
            currentRoute === 'ProductDetails' ||
            currentRoute === 'ChatScreen' ||
            currentRoute === 'NotificationScreen' ||
            currentRoute === 'OrderDetails' ||
            currentRoute === 'OrderStatus' ||
            currentRoute === 'PersonalInformation' ||
            currentRoute === 'NotificationPreferences' ||
            currentRoute === 'FindAgent' ||
            currentRoute === 'OtpVerification' ||
            currentRoute === 'ResetPassword' ||
            currentRoute === 'ConnectedDevices'

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
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  tabContainer: {
    position: 'absolute',
    left: 1,
    right: 1,
    bottom: Platform.OS === 'ios' ? 10 : 8,

    backgroundColor: 'transparent',

    elevation: 0,
    shadowOpacity: 0,
  },
});