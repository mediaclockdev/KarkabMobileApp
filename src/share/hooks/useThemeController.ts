import React, { useContext } from 'react'
import { ThemeContext } from '../theme/ThemeContext'

export const useThemeController = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeController must be used inside ThemeProvider')
  }

  return {
    mode: context.mode,
    setMode: context.setMode,
  }
}
