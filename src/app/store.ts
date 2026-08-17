// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { persistStore } from 'redux-persist'
import rootSaga from '../store/rootSaga'
import { persistedReducer } from '../store/persistConfig'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefault =>
    getDefault({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
