export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  avatar?: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  playsong: null
}

export interface loaderState {
  loading: boolean;
}

