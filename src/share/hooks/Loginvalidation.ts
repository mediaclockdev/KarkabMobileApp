export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldError = {
  key: string;
  params?: Record<string, unknown>;
} | null;

export type LoginErrors = {
  email: FieldError;
  password: FieldError;
};

/**
 * Validation returns translation KEYS, never translated strings.
 * This keeps validation language-agnostic and testable.
 */
export const validateLogin = (email: string, password: string): LoginErrors => {
  const errors: LoginErrors = { email: null, password: null };

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

  return errors;
};


export const hasErrors = (errors: LoginErrors): boolean =>
  Boolean(errors.email || errors.password);