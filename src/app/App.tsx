import React from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Providers from './providers'
import RootNavigator from '../navigation/RootNavigator'
import AppStatusBar from '../share/components/AppStatusBar'
import { LogBox, StatusBar } from 'react-native'
LogBox.ignoreAllLogs(true);
const App = () => {
    return (
        <SafeAreaProvider>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#000000"
            />
            <Providers>
                {/* <AppStatusBar /> */}

                <RootNavigator />
            </Providers>
        </SafeAreaProvider>
    )
}

export default App



