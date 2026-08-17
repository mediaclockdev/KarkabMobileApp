import {
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native'
import { RootStackParamList } from './types'

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>()

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  }
}

export function replace<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T]
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params))
  }
}

export function reset(routes: any[]) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes,
    })
  }
}
