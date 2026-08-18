import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Providers from './providers'
import RootNavigator from '../navigation/RootNavigator'
import { LogBox, StatusBar } from 'react-native'
import { storage } from '../share/storage/mmkv'
LogBox.ignoreAllLogs(true);
const App = () => {

    const token = storage.getString('userToken');
    console.log("auth token App file", token)
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
    )
}

export default App



