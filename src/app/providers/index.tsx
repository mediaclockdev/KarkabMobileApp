import React, { ReactNode } from 'react'
import ReduxProvider from './ReduxProvider'
import ThemeProvider from './ThemeProvider'
import ToastProvider from './ToastProvider'
import NetworkProvider from './NetworkProvider'
import FeatureFlagProvider from './FeatureFlagProvider'
import AnalyticsProvider from './AnalyticsProvider'
import ErrorBoundary from './ErrorBoundary'
import {
  NavigationContainer,
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
} from '@react-navigation/native'
import { useAppTheme } from '../../share/hooks/useAppTheme'



interface ProvidersProps {
  children: ReactNode
}



const AppNavigation = ({ children }: { children: ReactNode }) => {
  const theme = useAppTheme()

  return (
    <NavigationContainer
      theme={theme.mode === 'dark' ? NavDarkTheme : NavLightTheme}
    >
      {children}
    </NavigationContainer>
  )
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    // <ErrorBoundary>
      <ReduxProvider>
        <FeatureFlagProvider>
          <AnalyticsProvider>
            <ThemeProvider>
              <NetworkProvider>
                <AppNavigation>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </AppNavigation>
              </NetworkProvider>
            </ThemeProvider>
          </AnalyticsProvider>
        </FeatureFlagProvider>
      </ReduxProvider>
    // </ErrorBoundary>
  )
}





export default Providers



