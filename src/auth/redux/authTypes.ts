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
  LoginState: string | null;
  isLoading: boolean;
  error: string | null;
  alert: AlertState;
  toast: ToastState;
}

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
}
interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface loaderState {
  loading: boolean;
}

