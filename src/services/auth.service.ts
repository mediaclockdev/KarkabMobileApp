import api from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name: string
  phoneNumber?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: string
    email: string
    name: string
    phoneNumber?: string
    avatar?: string
  }
}

export interface OtpVerification {
  phoneNumber: string
  otp: string
}

const authService = {
  login: async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      '/auth/login',
      credentials
    )
    return response.data
  },

  signup: async (
    data: SignupData
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      '/auth/signup',
      data
    )
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  verifyOtp: async (
    data: OtpVerification
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      '/auth/verify-otp',
      data
    )
    return response.data
  },

  requestPasswordReset: async (
    email: string
  ): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<void> => {
    await api.post('/auth/reset-password', {
      token,
      newPassword,
    })
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>(
      '/auth/refresh-token',
      { refreshToken }
    )
    return response.data
  },
}

export default authService
