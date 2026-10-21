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
import SelectedArtistScreen from '../screens/Home/SelectedArtistScreen';
import AllArtistScreen from '../screens/Home/AllArtistScreen';
import PlayListScreen from '../screens/Search/PlayListScreen';
import GenreScreen from '../screens/Search/GenreScreen';
import PerformanceScreen from '../screens/Search/PerformanceScreen';
import SettingScreen from '../screens/Profile/SettingScreen';
import ManageProfileScreen from '../screens/Profile/ManageProfileScreen';
import NotificationScreen from '../screens/Profile/NotificationScreen';
import CreatePlaylist from '../screens/Profile/CreatePlaylist';
import PlaylistDetailScreen from '../screens/Profile/PlaylistDetailScreen';
import RecordingList from '../screens/Home/RecordingList';
import LanguageScreen from '../screens/Settings/LanguageScreen';
import SongActionSheet from '../screens/SongActionSheet';
import { useAppDispatch, useAppSelector } from '../share/hooks/useAppSelector';
import { closeSongAction, refreshRecordings } from '../auth/redux/authSlice';
import DownloadsScreen from '../screens/Profile/DownloadsScreen';
import VocalRecordingScreen from '../screens/VocalRecordingScreen';
export const Tabs = () => {
    const songAction = useAppSelector(
        (state: any) => state.auth.songAction
    );
    const dispatch = useAppDispatch();
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
        { name: 'SelectedArtistScreen', component: SelectedArtistScreen },
        { name: 'AllArtistScreen', component: AllArtistScreen },
        { name: 'PlayListScreen', component: PlayListScreen },
        { name: 'GenreScreen', component: GenreScreen },
        { name: 'PerformanceScreen', component: PerformanceScreen },
        { name: 'SettingScreen', component: SettingScreen },
        { name: 'ManageProfileScreen', component: ManageProfileScreen },
        { name: 'NotificationScreen', component: NotificationScreen },
        { name: 'CreatePlaylist', component: CreatePlaylist },
        { name: 'PlaylistDetailScreen', component: PlaylistDetailScreen },
        { name: 'RecordingList', component: RecordingList },
        { name: 'LanguageScreen', component: LanguageScreen },
        { name: 'DownloadsScreen', component: DownloadsScreen },
        { name: 'VocalRecordingScreen', component: VocalRecordingScreen },

    ];

    return (
        <>

            <HideableBottomTabs
                screens={screens}
            />
            <SongActionSheet
                visible={songAction.visible}
                song={songAction.song}
                onClose={() => dispatch(closeSongAction())}
                onDeleted={recordingId => {
                    // Remove deleted recording from your list
                    console.log(recordingId)
                    dispatch(refreshRecordings());

                }}

            />
        </>
    );
};