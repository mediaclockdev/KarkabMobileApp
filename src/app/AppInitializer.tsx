import React, { useEffect, useState } from 'react'
import { restoreSession } from '../auth/redux/authSlice'
import { useAppDispatch } from '../share/hooks/useAppSelector'

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const dispatch = useAppDispatch()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      await dispatch(restoreSession())
      setReady(true)
    }

    init()
  }, [])

  if (!ready) return null

  return <>{children}</>
}
export default AppInitializer


