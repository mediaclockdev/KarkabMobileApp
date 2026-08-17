import React, { createContext, PropsWithChildren } from 'react'

export const AnalyticsContext = createContext<any>(null)

const AnalyticsProvider = ({ children }: PropsWithChildren) => {
  const track = (event: string, params?: any) => {
    console.log('Analytics:', event, params)
  }

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export default AnalyticsProvider
