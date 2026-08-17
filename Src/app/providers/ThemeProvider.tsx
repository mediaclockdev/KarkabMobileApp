import React, { useState, useMemo, PropsWithChildren } from 'react'
import { ThemeContext } from '../../share/theme/ThemeContext'
import { lightTheme, darkTheme, imageTheme } from '../../share/theme/themes'
import { ThemeMode } from '../../share/theme/types'

const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setMode] = useState<ThemeMode>('light')

  const theme = useMemo(() => {
    switch (mode) {
      case 'dark':
        return darkTheme
      case 'image':
        return imageTheme
      default:
        return lightTheme
    }
  }, [mode])

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
