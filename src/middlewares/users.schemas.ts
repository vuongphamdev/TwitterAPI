import { Request } from 'express'
import { ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { USERNAME_REGEX } from '~/constants/regex'
import { ChangePasswordReqBody, TokenPayload } from '~/models/requests/User.requests'
import { ErrorWithStatus } from '~/models/Errors'
import databaseServices from '~/services/database.services'
import userServices from '~/services/user.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { ParamsDictionary } from 'express-serve-static-core'
import { envConfig } from '~/utils/config'

export const verifyAuthorization = async ({ value, req }: { value: any; req?: Request }) => {
  try {
    const token = value.split(' ')[1]
    if (!token) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.ACCESS_TOKEN_IS_INVALID,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    const result = await verifyToken({
      token: token,
      secretKey: envConfig.JWT_ACCESS_TOKEN_SECRET
    })
    if (req) {
      ;(req as Request).decoded_authorization = result
    }
    return true
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.ACCESS_TOKEN_IS_INVALID,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    throw error
  }
}

export const AuthorizationSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED },
  custom: {
    options: async (value, { req }) => verifyAuthorization({ value, req: req as Request })
  }
}

export const RefreshTokenSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED },
  custom: {
    options: async (value, { req }) => {
      try {
        const [refresh_token, decoded_refresh_token] = await Promise.all([
          databaseServices.refreshTokens.findOne({ refresh_token: value }),
          verifyToken({ token: value, secretKey: envConfig.JWT_REFRESH_TOKEN_SECRET })
        ])
        if (!refresh_token) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.REFRESH_TOKEN_IS_NOT_EXIST,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        ;(req as Request).decoded_refresh_token = decoded_refresh_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.REFRESH_TOKEN_IS_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
    }
  }
}

export const VerifyEmailTokenSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.VERIFY_EMAIL_TOKEN_IS_REQUIRED },
  custom: {
    options: async (value, { req }) => {
      try {
        const decoded_verify_email_token = await verifyToken({
          token: value,
          secretKey: envConfig.JWT_VERIFY_EMAIL_TOKEN_SECRET
        })

        if (!decoded_verify_email_token) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.VERIFY_EMAIL_TOKEN_IS_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }

        const user = await databaseServices.users.findOne({
          _id: new ObjectId(decoded_verify_email_token.user_id)
        })

        if (user?.email_verify_token !== value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.VERIFY_EMAIL_TOKEN_IS_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }

        ;(req as Request).decoded_verify_email_token = decoded_verify_email_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.VERIFY_EMAIL_TOKEN_IS_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
    }
  }
}

export const LoginEmailSchema: ParamSchema = {
  isEmail: {
    errorMessage: USER_MESSAGES.EMAIL_MUST_BE_VALID
  },
  trim: true,
  custom: {
    options: async (value, { req }) => {
      const password = req.body.password
      const user = await databaseServices.users.findOne({ email: value, password: hashPassword(password) })
      if (!user) {
        throw new Error(USER_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)
      }

      ;(req as Request).user = user
      return true
    }
  }
}

export const LoginPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
  trim: true
}

export const RegisterEmailSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
  isEmail: {
    errorMessage: USER_MESSAGES.EMAIL_MUST_BE_VALID
  },
  trim: true,
  custom: {
    options: async (value) => {
      const isExist = await userServices.checkEmailExist(value)
      if (isExist) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.EMAIL_ALREADY_EXISTS,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      return true
    }
  }
}

export const UsernameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.USERNAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.USERNAME_MUST_BE_STRING
  },
  isLength: {
    options: {
      min: 4,
      max: 15
    },
    errorMessage: USER_MESSAGES.USERNAME_MUST_BE_FROM_4_TO_15_CHARACTERS
  },
  trim: true,
  custom: {
    options: async (value) => {
      if (!USERNAME_REGEX.test(value)) {
        throw new Error(USER_MESSAGES.USERNAME_INVALID)
      }
      const user = await databaseServices.users.findOne({ username: value })
      if (user) {
        throw new Error(USER_MESSAGES.USERNAME_ALREADY_EXIST)
      }
      return true
    }
  }
}

export const PasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
  isString: { errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_FROM_6_TO_50_CHARACTERS
  },
  trim: true,
  isStrongPassword: {
    options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

export const ConfirmPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
  isString: { errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_FROM_6_TO_50_CHARACTERS
  },
  trim: true,
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.PASSWORDS_DO_NOT_MATCH)
      }
      return true
    }
  }
}

export const OldPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
  custom: {
    options: async (value, { req }) => {
      const { decoded_authorization, body } = req as Request<ParamsDictionary, any, ChangePasswordReqBody>
      const { user_id } = decoded_authorization as TokenPayload
      const { newPassword } = body

      const currentUser = await databaseServices.users.findOne({
        _id: new ObjectId(user_id)
      })
      if (hashPassword(value) != currentUser?.password) {
        throw new Error(USER_MESSAGES.PASSWORD_INCORRECT)
      }
      if (hashPassword(newPassword) === currentUser?.password) {
        throw new Error(USER_MESSAGES.PASSWORD_SHOULD_DIFFERRENCE)
      }
      return true
    }
  }
}

export const DateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: { strict: true, strictSeparator: true },
    errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO_8601
  }
}

export const ForgotPasswordEmailSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
  isEmail: {
    errorMessage: USER_MESSAGES.EMAIL_MUST_BE_VALID
  },
  trim: true,
  custom: {
    options: async (value, { req }) => {
      const user = await databaseServices.users.findOne({ email: value })
      if (!user) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      ;(req as Request).user = user
      return true
    }
  }
}

export const ForgotPasswordTokenSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
  },
  custom: {
    options: async (value, { req }) => {
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretKey: envConfig.JWT_FORGOT_PASSWORD_TOKEN_SECRET
        })
        if (!decoded_forgot_password_token) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        const user = await databaseServices.users.findOne({
          _id: new ObjectId(decoded_forgot_password_token.user_id)
        })
        if (!user) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
        return true
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
    }
  }
}

export const UserIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.USERID_IS_REQUIRED
  },
  custom: {
    options: (value) => {
      if (!ObjectId.isValid(value))
        throw new ErrorWithStatus({ message: USER_MESSAGES.USERID_IS_INVALID, status: HTTP_STATUS.UNAUTHORIZED })

      return true
    }
  }
}

export const FollowUserIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.USERID_IS_REQUIRED
  },
  custom: {
    options: (value, { req }) => {
      if (!ObjectId.isValid(value))
        throw new ErrorWithStatus({ message: USER_MESSAGES.USERID_IS_INVALID, status: HTTP_STATUS.UNAUTHORIZED })
      if ((req as Request).decoded_authorization?.user_id === value) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.CANNOT_FOLLOW_OR_UNFOLLOW_YOURSELF,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      return true
    }
  }
}

export const TweetCircleSchema: ParamSchema = {
  optional: true,
  isArray: {
    errorMessage: USER_MESSAGES.TWEET_CIRCLE_INVALID
  },
  custom: {
    options: (value) => {
      if (value.some((item: any) => !ObjectId.isValid(item))) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: USER_MESSAGES.TWEET_CIRCLE_INVALID
        })
      }
      return true
    }
  }
}
