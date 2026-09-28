import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, LogBox, StatusBar } from 'react-native';

import Providers from './providers';
import RootNavigator from '../navigation/RootNavigator';
import { storage } from '../share/storage/mmkv';

import { setupAudioPlayer } from '../services/player';
import TrackPlayer from '@rntp/player';

LogBox.ignoreAllLogs(true);

const App = () => {
    const token = storage.getString('userToken');

    console.log('auth token App file', token);

    useEffect(() => {
        let mounted = true;

        const initializePlayer = async () => {
            try {
                if (!mounted) {
                    return;
                }

                const initialized = await setupAudioPlayer();

                if (initialized) {
                    console.log(
                        'Audio background engine initialized successfully!',
                    );
                }
            } catch (error) {
                console.log(
                    'Player initialization error:',
                    error,
                );
            }
        };

        initializePlayer();

        return () => {
            mounted = false;
        };
    }, []);
    useEffect(() => {
        const sub = AppState.addEventListener('change', async (state) => {
            console.log(state, "whwdsjdjb")
            if (state === 'unknown') {
                // Optional: pause when app backgrounds (remove if you want background play)
                await TrackPlayer.pause();
            }
        });
        return () => sub.remove();
    }, []);

    return (
        <SafeAreaProvider>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#000000"
            />

            <Providers>
                <RootNavigator />
            </Providers>
        </SafeAreaProvider>
    );
};

export default App;