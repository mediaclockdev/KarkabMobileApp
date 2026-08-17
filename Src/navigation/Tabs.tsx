import React from 'react';
import { HideableBottomTabs } from './HideableBottomTabs';
// import { useHideableTabBar } from './useHideTabBar';
import Home from '../screens/Home';
import Profile from '../screens/Profile';
import Search from '../screens/Order';

import AudioRec from '../screens/AudioRec';
import Recording from '../screens/Recording';
import Order from '../screens/Order';
import Createorder from '../screens/Order/Createorder';

import WebViewScreen from '../screens/Home/WebViewScreen';
import Inbox from '../screens/Inbox';
import ChangeAddress from '../screens/Order/ChangeAddress';
import PlaceOrder from '../screens/Home/PlaceOrder';
import Products from '../screens/Home/Products';
import ProductDetails from '../screens/Home/ProductDetails';
import ChatScreen from '../screens/Inbox/ChatScreen';
import NotificationScreen from '../screens/NotificationScreen';
import OrderDetails from '../screens/Order/OrderDetails';
import OrderStatus from '../screens/Order/OrderStatus';
import PersonalInformation from '../screens/Profile/PersonalInformation';
import NotificationPreferences from '../screens/Profile/NotificationPreferences';
import FindAgent from '../screens/Home/FindAgent';
import OtpVerification from '../authscreen/OtpVerification';
import ResetPassword from '../authscreen/ResetPassword';
import ConnectedDevices from '../screens/Profile/ConnectedDevices';

export const Tabs = () => {


    const screens = [
        { name: 'Home', component: Home },
        { name: 'Order', component: Order },
        { name: 'Inbox', component: Inbox },
        { name: 'Profile', component: Profile },
        { name: 'Recording', component: Recording },
        { name: 'WebViewScreen', component: WebViewScreen },
        { name: 'Createorder', component: Createorder },
        { name: 'ChangeAddress', component: ChangeAddress },
        { name: 'PlaceOrder', component: PlaceOrder },
        { name: 'Products', component: Products },
        { name: 'ProductDetails', component: ProductDetails },
        { name: 'ChatScreen', component: ChatScreen },
        { name: 'NotificationScreen', component: NotificationScreen },
        { name: 'OrderDetails', component: OrderDetails },
        { name: 'OrderStatus', component: OrderStatus },
        { name: 'PersonalInformation', component: PersonalInformation },
        { name: 'NotificationPreferences', component: NotificationPreferences },
        { name: 'FindAgent', component: FindAgent },
        { name: 'OtpVerification', component: OtpVerification },
        { name: 'ResetPassword', component: ResetPassword },
        { name: 'ConnectedDevices', component: ConnectedDevices },

    ];

    return (
        <HideableBottomTabs
            screens={screens}

        />
    );
};