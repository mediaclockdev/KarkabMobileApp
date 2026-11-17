import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'
import { Platform } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { navigationRef } from '../navigation/NavigationService'
import { store } from '../app/store'
import type { RootState } from '../app/store'
import { logout, loginSuccess } from '../auth/redux/authSlice'

import authService from './auth.service'
import { storage } from '../share/storage/mmkv'
import apiUrls from './apiUrls'


const BASE_URL = 'https://karkab.mediaclocksoft.com.au/'

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
}

interface NormalizedError {
  message: string
  status?: number
}


class ApiService {
  private api: AxiosInstance
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 20000,
    })

    this.setupInterceptors()
  }

  // ---------------------------------
  // INTERCEPTORS
  // ---------------------------------
  private setupInterceptors() {
    // REQUEST INTERCEPTOR
    this.api.interceptors.request.use((config) => {
      const state = store.getState() as RootState
      const token = state.auth?.accessToken || storage.getString('userToken')

      if (token && config.headers && !(config as any)._skipAuth) {
        config.headers['Authorization'] = `Bearer ${token}`
      }

      return config
    })

    // RESPONSE INTERCEPTOR
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig
        const status = error.response?.status

        // Avoid infinite loop on auth calls
        if ((originalRequest as any)?._skipAuth) {
          return Promise.reject(this.normalizeError(error))
        }

        if (status === 401 && !originalRequest?._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push((newToken: string) => {
                if (newToken) {
                  if (!originalRequest.headers) {
                    originalRequest.headers = {}
                  }
                  ;(originalRequest.headers as any).Authorization =
                    `Bearer ${newToken}`
                  resolve(this.api(originalRequest))
                } else {
                  reject(this.normalizeError(error))
                }
              })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newAccessToken = await this.handleRefreshToken()

            if (newAccessToken) {
              this.refreshSubscribers.forEach((cb) => cb(newAccessToken))
              this.refreshSubscribers = []

              if (!originalRequest.headers) {
                originalRequest.headers = {}
              }
              ;(originalRequest.headers as any).Authorization =
                `Bearer ${newAccessToken}`

              return this.api(originalRequest)
            } else {
              this.refreshSubscribers.forEach((cb) => cb(''))
              this.refreshSubscribers = []
              this.handleLogout()
              return Promise.reject(this.normalizeError(error))
            }
          } catch (refreshError) {
            this.refreshSubscribers.forEach((cb) => cb(''))
            this.refreshSubscribers = []
            this.handleLogout()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(this.normalizeError(error))
      }
    )
  }

  // ---------------------------------
  // REFRESH / SILENT RE-AUTH FLOW
  // ---------------------------------
  private async handleRefreshToken(): Promise<string | null> {
    try {
      // 1. Check if we have saved login credentials to silently restore the session
      const savedCredentialsStr = storage.getString('savedCredentials')
      if (savedCredentialsStr) {
        try {
          const creds = JSON.parse(savedCredentialsStr)
          if (creds?.email && creds?.password) {
            console.log('🔄 Session expired — performing silent re-authentication...')
            const response = await this.api.post(
              apiUrls.login,
              {
                email: creds.email.trim(),
                password: creds.password,
                device: Platform.OS === 'ios' ? 'ios' : 'android',
                language: 'english',
              },
              { _skipAuth: true } as any
            )

            const data = (response as any)?.data
            if (data?.success && data?.token) {
              const newToken = data.token
              console.log('✅ Silent re-authentication successful!')

              storage.set('userToken', newToken)
              const existingAuthData = storage.getString('authData')
              let user = data.user
              if (!user && existingAuthData) {
                try {
                  user = JSON.parse(existingAuthData).user
                } catch {}
              }
              const authData = {
                user: user ?? null,
                accessToken: newToken,
                refreshToken: data.refreshToken ?? null,
              }
              storage.set('authData', JSON.stringify(authData))
              store.dispatch(loginSuccess(authData))

              return newToken
            }
          }
        } catch (e) {
          console.log('Silent re-auth error:', e)
        }
      }

      // 2. If the server provides a refresh token in the future
      const state = store.getState() as RootState
      const refreshToken = state.auth?.refreshToken
      if (refreshToken) {
        try {
          const data = await authService.refreshToken(refreshToken)
          if (data?.accessToken) {
            const newToken = data.accessToken
            storage.set('userToken', newToken)
            store.dispatch(
              loginSuccess({
                user: state.auth.user,
                accessToken: newToken,
                refreshToken: data.refreshToken || refreshToken,
              })
            )
            return newToken
          }
        } catch {}
      }

      return null
    } catch (e) {
      console.log('handleRefreshToken failure:', e)
      return null
    }
  }

  private handleLogout() {
    console.log('🔒 Logging out and clearing stored session')
    storage.remove('userToken')
    storage.remove('authData')
    storage.remove('savedCredentials')

    store.dispatch(logout())

    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      })
    }
  }

  // ---------------------------------
  // NETWORK CHECK
  // ---------------------------------
  private async ensureOnline() {
    const state = await NetInfo.fetch()

    if (!state.isConnected) {
      throw { message: 'No Internet Connection' } as NormalizedError
    }
  }

  // ---------------------------------
  // ERROR NORMALIZER
  // ---------------------------------
 private normalizeError(
  error: AxiosError
): NormalizedError {
  if (!error.response) {
    return {
      message: 'Network error. Please check connection.',
    }
  }

  const status = error.response.status

  const responseData = error.response.data as any

  const message =
    responseData?.error ||
    responseData?.message ||
    'Something went wrong'

  return { message, status }
}

  // ---------------------------------
  // REQUEST METHODS
  // ---------------------------------

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    await this.ensureOnline()
    return this.api.get<T>(url, config)
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    await this.ensureOnline()

    const isFormData = data instanceof FormData

    return this.api.post<T>(url, data, {
      ...config,
      headers: {
        ...(isFormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...config?.headers,
      },
    })
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    await this.ensureOnline()

    const isFormData = data instanceof FormData

    return this.api.put<T>(url, data, {
      ...config,
      headers: {
        ...(isFormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...config?.headers,
      },
    })
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    await this.ensureOnline()
    return this.api.delete<T>(url, config)
  }
}

export default new ApiService()
