import { MMKV } from 'react-native-mmkv'
import { persistReducer } from 'redux-persist'
import rootReducer from './rootReducer'


const isJSIAvailable =
  typeof (globalThis as any).nativeCallSyncHook === 'function'


const storage = isJSIAvailable
  ? new MMKV({ id: 'app-storage' })
  : null

if (!isJSIAvailable) {
  console.warn('⚠️ MMKV not available — Remote Debugging or Hermes disabled')
}


const reduxStorage = {
  setItem: async (key: string, value: string) => {
    if (!storage) return
    storage.set(key, value)
  },

  getItem: async (key: string) => {
    if (!storage) return null
    return storage.getString(key) ?? null
  },

  removeItem: async (key: string) => {
    if (!storage) return
    storage.delete(key)
  },
}

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  whitelist: ['auth'],
}

export const persistedReducer = persistReducer(
  persistConfig,
  rootReducer
)
