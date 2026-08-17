import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StatusBar, Platform } from 'react-native'

const AppStatusBar = () => {
  const { dark } = useTheme()

  //   this need to be added in reels screen
// useEffect(() => {
//   StatusBar.setHidden(true)
//   return () => StatusBar.setHidden(false)
// }, [])


  return (
    <StatusBar
      barStyle={dark ? 'light-content' : 'dark-content'}
      backgroundColor={Platform.OS === 'android' ? '#ffffff' : 'undefined'}
      translucent={false} 
      
    />
  )
}

export default AppStatusBar

