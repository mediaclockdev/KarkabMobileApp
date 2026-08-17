import React, { PropsWithChildren } from 'react'
import Toast from 'react-native-toast-message'

const ToastProvider = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      <Toast />
    </>
  )
}

export default ToastProvider

// usage 
// import Toast from 'react-native-toast-message'

// Toast.show({
//   type: 'success',
//   text1: 'Post uploaded successfully',
// })

