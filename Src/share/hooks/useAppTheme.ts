import React,{ useContext }  from 'react'
import { AppTheme } from '../theme/types'
import { ThemeContext } from '../theme/ThemeContext'

export const useAppTheme = (): AppTheme => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider')
  }

  return context.theme
}


