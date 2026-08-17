import { createContext } from 'react'
import { AppTheme, ThemeMode } from './types'

export type ThemeContextType = {
  theme: AppTheme
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextType | null>(null)
