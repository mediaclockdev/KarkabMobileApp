import React, { createContext, PropsWithChildren } from 'react'

export const FeatureFlagContext = createContext<any>(null)

const flags = {
  reelsEnabled: true,
  storiesEnabled: true,
  adsEnabled: false,
}

const FeatureFlagProvider = ({ children }: PropsWithChildren) => {
  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export default FeatureFlagProvider
