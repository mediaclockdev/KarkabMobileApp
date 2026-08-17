import type { NavigatorScreenParams } from '@react-navigation/native'
import type { StackScreenProps } from '@react-navigation/stack'
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'

/* =====================================================
   AUTH STACK
===================================================== */
export type BottomSheetType = 'COUNTRY_CODE';
export interface Country {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}



export type AuthStackParamList = {
  IntroScreen: undefined;
  Login: undefined;
  SignupScreen: undefined;
  VerifyAccount: undefined;

  'bottom-sheet': {
    type: BottomSheetType;
    payload?: Partial<Country>;
  };
};


/* =====================================================
   MAIN TAB
===================================================== */

export type MainTabParamList = {
  Feed: undefined
  Search: undefined
  Notifications: undefined
  ChatList: undefined
  Profile: undefined
}

/* =====================================================
   ROOT STACK
===================================================== */

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: NavigatorScreenParams<MainTabParamList>
}

/* =====================================================
   AUTH SCREEN PROPS
===================================================== */

export type LoginProps =
  StackScreenProps<AuthStackParamList, 'Login'>

export type SignupScreenScreenProps =
  StackScreenProps<AuthStackParamList, 'SignupScreen'>

export type VerifyAccountProps =
  StackScreenProps<AuthStackParamList, 'VerifyAccount'>


export type IntroScreenProps =
  StackScreenProps<AuthStackParamList, 'IntroScreen'>


export type BottomSheetScreenProps =
  NativeStackScreenProps<AuthStackParamList, 'bottom-sheet'>;

/* =====================================================
   TAB SCREEN PROPS
===================================================== */

// export type FeedScreenProps =
//   BottomTabScreenProps<MainTabParamList, 'Feed'>

// export type SearchScreenProps =
//   BottomTabScreenProps<MainTabParamList, 'Search'>

// export type NotificationsScreenProps =
//   BottomTabScreenProps<MainTabParamList, 'Notifications'>

// export type ChatListScreenProps =
//   BottomTabScreenProps<MainTabParamList, 'ChatList'>

// export type ProfileScreenProps =
//   BottomTabScreenProps<MainTabParamList, 'Profile'>

/* =====================================================
   ROOT SCREEN PROPS (OPTIONAL)
===================================================== */

export type RootScreenProps<
  T extends keyof RootStackParamList
> = StackScreenProps<RootStackParamList, T>