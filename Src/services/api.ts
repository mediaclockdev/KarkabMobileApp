import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'
import NetInfo from '@react-native-community/netinfo'
import { navigationRef } from '../navigation/NavigationService'
import { store } from '../app/store'
import type { RootState } from '../app/store'
import { logout, loginSuccess } from '../auth/redux/authSlice'

import authService from './auth.service'
import { storage } from '../share/storage/mmkv'


const BASE_URL = 'https://shelynx.mediaclocksoft.com.au/api'

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
      timeout: 60000,
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
      const token = state.auth.accessToken
      //const lang = i18n.language || "en"

      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      //config.headers["Accept-Language"] = lang;


      return config
    })



    // RESPONSE INTERCEPTOR
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig
        const status = error.response?.status

        if (status === 401 && !originalRequest?._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((newToken: string) => {
                if (!originalRequest.headers) {
                  originalRequest.headers = {}
                }

                ; (originalRequest.headers as any).Authorization =
                  `Bearer ${newToken}`

                resolve(this.api(originalRequest))
              })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newAccessToken =
              storage.getString('userToken');

            this.refreshSubscribers.forEach((cb) =>
              cb(newAccessToken)
            )
            this.refreshSubscribers = []

            if (!originalRequest.headers) {
              originalRequest.headers = {}
            }

            ; (originalRequest.headers as any).Authorization =
              `Bearer ${newAccessToken}`

            return this.api(originalRequest)
          } catch (refreshError) {
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
  // REFRESH TOKEN FLOW
  // ---------------------------------



  private async handleRefreshToken(): Promise<string> {
    const state = store.getState() as RootState
    const { refreshToken, user } = state.auth

    // if (!refreshToken) {
    //   throw new Error('No refresh token available')
    // }
    console.log(state.auth, "refresh token in api service")

    const data = await authService.refreshToken(refreshToken)

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = data

    // store.dispatch(
    //   loginSuccess({
    //     user,
    //     accessToken,
    //     refreshToken: newRefreshToken ||'',
    //   })
    // )



    return accessToken
  }

  private handleLogout() {
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

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    await this.ensureOnline();

    const isFormData = data instanceof FormData;

    return this.api.patch<T>(url, data, {
      ...config,
      headers: {
        ...(isFormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...config?.headers,
      },
    });
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
