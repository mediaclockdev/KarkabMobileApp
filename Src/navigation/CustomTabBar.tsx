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
import color, { } from '../share/constants/color';

const ACTIVE_COLOR = '#AB2C5D';
const INACTIVE_COLOR = '#4D4447';

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {


  const getIcon = (name: string, focused: boolean) => {
    switch (name) {
      case 'Home':
        return focused
          ? BottomIcons.home
          : BottomIcons.home
      case 'Order':
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
      case 'Inbox':
        return focused
          ? BottomIcons.library
          : BottomIcons.library




      default:
        return BottomIcons.home
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color.white }]}>
      {state.routes
        .filter(route => route.name !== 'Recording' &&
          route.name !== 'Createorder' &&
          route.name !== 'WebViewScreen' &&
          route.name !== 'ChangeAddress' &&
          route.name !== 'PlaceOrder' &&
          route.name !== 'Products' &&
          route.name !== 'ProductDetails' &&
          route.name !== 'ChatScreen' &&
          route.name !== 'NotificationScreen' &&
          route.name !== 'OrderDetails' &&
          route.name !== 'OrderStatus' &&
          route.name !== 'PersonalInformation' &&
          route.name !== 'NotificationPreferences' &&
          route.name !== 'FindAgent' &&
          route.name !== 'OtpVerification' &&
          route.name !== 'ResetPassword' &&
          route.name !== 'ConnectedDevices'





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
              activeOpacity={0.8}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.tabContent,
                  isFocused && route.name !== '.' && styles.activeTab,
                ]}
              >
                {route.name === '.' ? (
                  <Image
                    source={icon}
                    style={[styles.icon, { width: 58, height: 58 }]}
                    tintColor={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                    resizeMode="contain"
                  />
                ) : (
                  <>
                    <Image
                      source={icon}
                      style={[
                        styles.icon,
                        route.name === 'Profile'
                          ? { width: 16, height: 16 }
                          : { width: 20, height: 20 },
                      ]}
                      tintColor={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                      resizeMode="contain"
                    />

                    <Text
                      style={[
                        styles.label,
                        {
                          color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                        },
                      ]}
                    >
                      {route.name}
                    </Text>
                  </>
                )}
              </View>
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
    alignItems: 'center',
    justifyContent: 'space-around',
    bottom: 0,
    height: 74,
    backgroundColor: color.white,

    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContent: {
    width: 70,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },

  activeTab: {
    width: 66,
    height: 44,
    backgroundColor: '#FAD0DA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    //marginBottom: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});