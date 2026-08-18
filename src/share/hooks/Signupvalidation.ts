export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldError = {
  key: string;
  params?: Record<string, unknown>;
} | null;

export type SignupErrors = {
  name: FieldError;
  email: FieldError;
  password: FieldError;
  confirmPassword: FieldError;
};

export const EMPTY_SIGNUP_ERRORS: SignupErrors = {
  name: null,
  email: null,
  password: null,
  confirmPassword: null,
};

export type SignupValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

/** Returns translation KEYS, never translated strings. */
export const validateSignup = ({
  name,
  email,
  password,
  confirmPassword,
}: SignupValues): SignupErrors => {
  const errors: SignupErrors = { ...EMPTY_SIGNUP_ERRORS };

  if (!name.trim()) {
    errors.name = { key: 'auth.validation.nameRequired' };
  }

  if (!email.trim()) {
    errors.email = { key: 'auth.validation.emailRequired' };
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = { key: 'auth.validation.emailInvalid' };
  }

  if (!password.trim()) {
    errors.password = { key: 'auth.validation.passwordRequired' };
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = {
      key: 'auth.validation.passwordTooShort',
      params: { count: MIN_PASSWORD_LENGTH },
    };
  }

  if (!confirmPassword.trim()) {
    errors.confirmPassword = { key: 'auth.validation.confirmPasswordRequired' };
  } else if (confirmPassword !== password) {
    errors.confirmPassword = { key: 'auth.validation.passwordsDoNotMatch' };
  }

  return errors;
};

export const hasSignupErrors = (errors: SignupErrors): boolean =>
  Object.values(errors).some(Boolean);