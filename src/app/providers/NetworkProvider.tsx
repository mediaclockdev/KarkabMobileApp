import React, { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import Toast from 'react-native-toast-message'

const NetworkProvider = ({ children }: any) => {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
        })
      }
    })

    return unsubscribe
  }, [])

  return children
}

export default NetworkProvider
