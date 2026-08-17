import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { verticalScale } from '../utils/responsive'

const Seprator =  () => {
  return (
    <View style={styles.seprator}/>
  )
}

export default Seprator

const styles = StyleSheet.create({
    seprator:{
        width:'100%',
        height:verticalScale(10)
    }
})