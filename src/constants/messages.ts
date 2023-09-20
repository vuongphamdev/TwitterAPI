export const USER_MESSAGES = {
  LOGIN_FAILED: 'Login failed',
  LOGIN_SUCCESSFUL: 'Login successful',
  REGISTER_FAILED: 'Register failed',
  REGISTER_SUCCESSFUL: 'Register successful',
  VALIDATION_ERROR: 'Validation error',
  USERNAME_AND_PASSWORD_ARE_REQUIRED: 'Username and password are required',
  USERNAME_IS_REQUIRED: 'UserName is required',
  USERNAME_MUST_BE_STRING: 'UserName must be a string',
  USERNAME_MUST_BE_FROM_1_TO_100_CHARACTERS: 'UserName must be from 1 to 100 characters',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_MUST_BE_STRING: 'Email must be a string',
  EMAIL_MUST_BE_VALID: 'Email must be a valid email',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_FROM_6_TO_50_CHARACTERS: 'Password must be from 6 to 50 characters',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 6 characters and contain at least one lowercase letter, one uppercase letter, one number and one symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_MUST_BE_FROM_6_TO_50_CHARACTERS: 'Confirm password must be from 6 to 50 characters',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be at least 6 characters and contain at least one lowercase letter, one uppercase letter, one number and one symbol',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  EMAIL_OR_PASSWORD_INCORRECT: 'Email or password incorrect',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_CREATED: 'User created',
  DATE_OF_BIRTH_MUST_BE_ISO_8601: 'Date of birth must be in ISO 8601 format',
  ACCESS_TOKEN_IS_INVALID: 'Access token is invalid',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_IS_NOT_EXIST: 'Refresh token is not exist',
  LOGOUT_FAILED: 'Logout failed'
} as const
