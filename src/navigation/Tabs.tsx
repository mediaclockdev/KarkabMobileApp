import React from 'react';
import { HideableBottomTabs } from './HideableBottomTabs';
import Home from '../screens/Home';
import Profile from '../screens/Profile';
import Search from '../screens/Search';
import Library from '../screens/Library';
import AudioRec from '../screens/AudioRec';
import Recording from '../screens/Recording';
import ArtistScreen from '../screens/Search/ArtistScreen';
import SongsScreen from '../screens/Search/SongsScreen';
import SudaneseClassicsScreen from '../screens/Search/SudaneseClassicsScreen';
import Browsemood from '../screens/Home/Browsemood';
import SongsListScreen from '../screens/Home/SongsListScreen';
import SearchSongSecreen from '../screens/SearchSongSecreen';
export const Tabs = () => {

    const screens = [
        { name: 'Home', component: Home },
        { name: 'Search', component: Search },
        { name: '.', component: AudioRec },
        { name: 'Library', component: Library },
        { name: 'Profile', component: Profile },
        { name: 'Recording', component: Recording },
        { name: 'ArtistScreen', component: ArtistScreen },
        { name: 'SongsScreen', component: SongsScreen },
        { name: 'SudaneseClassicsScreen', component: SudaneseClassicsScreen },
        { name: 'Browsemood', component: Browsemood },
        { name: 'SongsListScreen', component: SongsListScreen },
        { name: 'SearchSongSecreen', component: SearchSongSecreen },


    ];

    return (
        <HideableBottomTabs
            screens={screens}
        />
    );
};