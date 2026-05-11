import { z } from 'zod/v4'

import { registry } from '@docs/registry'

import {
  ForgotPasswordBodySchema,
  GoogleCallbackBodySchema,
  LoginBodySchema,
  RefreshTokenBodySchema,
  RegisterBodySchema,
  ResetPasswordBodySchema,
  VerifyEmailBodySchema,
  ConfirmTwoFactorBodySchema,
  DisableTwoFactorBodySchema,
  VerifyTwoFactorLoginBodySchema
} from '@modules/auth/dto'

import {
  validationErrorResponse,
  successWrapper,
  jsonBody,
  unauthorizedResponse,
  conflictResponse,
  rateLimitResponse,
  badRequestResponse,
  TokenPairSchema,
  AuthUserSchema,
  AuthResponseSchema,
  forbiddenResponse
} from './shared'

const TwoFactorRequiredSchema = registry.register(
  'TwoFactorRequired',
  z.object({
    requiresTwoFactor: z.literal(true),
    twoFactorToken: z.string().meta({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  })
)

const TwoFactorSetupSchema = registry.register(
  'TwoFactorSetup',
  z.object({
    qrCodeUrl: z.string().meta({ example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' }),
    resetPending: z.boolean().meta({
      example: false,
      description: 'true if a previous unconfirmed setup was overwritten — prompt user to re-scan'
    })
  })
)

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: jsonBody(RegisterBodySchema),
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.object({ user: AuthUserSchema }), '/auth/register', 201, 'Registration successful')
        }
      }
    },
    409: conflictResponse('Email or username already exists'),
    422: validationErrorResponse(),
    429: rateLimitResponse()
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  description:
    'Returns tokens and user on success. If the account has 2FA enabled, returns `{ requiresTwoFactor: true, twoFactorToken }` instead — use `POST /auth/2fa/login/verify` to complete the login.',
  request: jsonBody(LoginBodySchema),
  responses: {
    200: {
      description: 'Login successful **or** 2FA required',
      content: {
        'application/json': {
          schema: z.union([
            successWrapper(AuthResponseSchema, '/auth/login', 200, 'Login successful'),
            successWrapper(TwoFactorRequiredSchema, '/auth/login', 200, 'Two-factor authentication required')
          ])
        }
      }
    },
    401: unauthorizedResponse('Invalid credentials'),
    422: validationErrorResponse(),
    429: rateLimitResponse()
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Logout — invalidate refresh token',
  security: [{ refreshTokenAuth: [] }],
  request: jsonBody(RefreshTokenBodySchema),
  responses: {
    200: {
      description: 'Logged out successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/logout', 200, 'Logout successful')
        }
      }
    },
    401: unauthorizedResponse('Invalid or expired refresh token')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/refresh-token',
  tags: ['Auth'],
  summary: 'Issue new token pair from refresh token',
  security: [{ refreshTokenAuth: [] }],
  request: jsonBody(RefreshTokenBodySchema),
  responses: {
    200: {
      description: 'New token pair issued',
      content: {
        'application/json': {
          schema: successWrapper(TokenPairSchema, '/auth/refresh-token', 200, 'Token refreshed successfully')
        }
      }
    },
    401: unauthorizedResponse('Invalid or expired refresh token')
  }
})

registry.registerPath({
  method: 'get',
  path: '/auth/google',
  tags: ['Auth - Google OAuth'],
  summary: 'Generate Google OAuth redirect URL',
  responses: {
    200: {
      description: 'Google OAuth URL generated successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({
              url: z.url().meta({ example: 'https://accounts.google.com/o/oauth2/v2/auth?...' }),
              state: z.string().meta({ example: 'random-csrf-token' })
            }),
            '/auth/google',
            200,
            'Google OAuth URL generated successfully'
          )
        }
      }
    },
    429: rateLimitResponse()
  }
})

registry.registerPath({
  method: 'get',
  path: '/auth/google/callback',
  tags: ['Auth - Google OAuth'],
  summary: 'Google OAuth callback via query params',
  description:
    '⚠️ **Cannot be tested via Swagger "Try it out"** — This is a redirect endpoint. Google automatically redirects the user here with `code` and `state` query parameters after OAuth approval. Do not manually call this endpoint.',
  request: {
    query: GoogleCallbackBodySchema
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: successWrapper(AuthResponseSchema, '/auth/google/callback', 200, 'Google authentication successful')
        }
      }
    },
    401: unauthorizedResponse('Invalid or expired OAuth state / Google account mismatch'),
    409: conflictResponse('Email already registered with password — link Google from account settings'),
    422: validationErrorResponse(),
    429: rateLimitResponse()
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/google/callback',
  tags: ['Auth - Google OAuth'],
  summary: 'Google OAuth callback via body (mobile / SPA)',
  description:
    'Alternative OAuth callback method for mobile apps or SPAs. Frontend receives `code` and `state` from Google, then sends them to this endpoint.',
  request: jsonBody(GoogleCallbackBodySchema),
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: successWrapper(AuthResponseSchema, '/auth/google/callback', 200, 'Google authentication successful')
        }
      }
    },
    401: unauthorizedResponse('Invalid or expired OAuth state / Google account mismatch'),
    409: conflictResponse('Email already registered with password — link Google from account settings'),
    422: validationErrorResponse(),
    429: rateLimitResponse()
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/forgot-password',
  tags: ['Auth - Email'],
  summary: 'Request a password reset email',
  description:
    'Sends a 6-digit OTP code to the provided email address. **Requirements**: User must have verified their email address and have a password (email/password auth only, not Google OAuth). Always returns 200 regardless of whether the email exists (privacy protection). Rate limited.',
  request: jsonBody(ForgotPasswordBodySchema),
  responses: {
    200: {
      description: 'Reset email sent (or silently skipped if email not found / not verified / Google OAuth user)',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/forgot-password', 200, 'Reset link has been sent')
        }
      }
    },
    409: conflictResponse('User created via Google OAuth — use Google login instead'),
    422: validationErrorResponse(),
    429: rateLimitResponse()
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/reset-password',
  tags: ['Auth - Email'],
  summary: 'Reset password using OTP code from email',
  description:
    "Completes the password reset flow. No authentication required — the 6-digit OTP sent to the user's email is sufficient to verify identity.",
  request: jsonBody(ResetPasswordBodySchema),
  responses: {
    200: {
      description: 'Password reset successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/reset-password', 200, 'Password reset successful')
        }
      }
    },
    401: unauthorizedResponse('Invalid, expired or already used OTP token'),
    422: validationErrorResponse(),
    429: rateLimitResponse()
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/verify-email',
  tags: ['Auth - Email'],
  summary: 'Verify email address using token from email link',
  description:
    "Confirms the user's email address. No authentication required — the secure token sent via email link is sufficient to verify identity.",
  request: jsonBody(VerifyEmailBodySchema),
  responses: {
    200: {
      description: 'Email verified successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/verify-email', 200, 'Email verified successfully')
        }
      }
    },
    401: unauthorizedResponse('Invalid, expired or already used verification token'),
    422: validationErrorResponse(),
    429: rateLimitResponse()
  }
})

registry.registerPath({
  method: 'get',
  path: '/auth/2fa/setup',
  tags: ['Auth - 2FA'],
  summary: 'Initiate 2FA setup — get QR code',
  description:
    'Generates a TOTP secret and QR code (base64 data URL) for the authenticated user. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.), then confirm setup via `POST /auth/2fa/setup/confirm`. **2FA is not active until confirmed.**',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'QR code returned',
      content: {
        'application/json': {
          schema: successWrapper(
            TwoFactorSetupSchema,
            '/auth/2fa/setup',
            200,
            'Scan the QR code with your authenticator app, then confirm with /auth/2fa/confirm'
          )
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    403: forbiddenResponse('Email must be verified before enabling 2FA'),
    409: conflictResponse('2FA is already enabled')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/2fa/setup/confirm',
  tags: ['Auth - 2FA'],
  summary: 'Confirm and activate 2FA',
  description:
    'Verifies the 6-digit TOTP code from the authenticator app and permanently enables 2FA for the account. Must be called after `GET /auth/2fa/setup`.',
  security: [{ bearerAuth: [] }],
  request: jsonBody(ConfirmTwoFactorBodySchema),
  responses: {
    200: {
      description: '2FA enabled successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/2fa/setup/confirm', 200, '2FA enabled successfully')
        }
      }
    },
    400: badRequestResponse('Invalid TOTP code'),
    401: unauthorizedResponse('Missing or invalid access token'),
    409: conflictResponse('2FA is already enabled'),
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/2fa/login/verify',
  tags: ['Auth - 2FA'],
  summary: 'Complete login with 2FA code',
  description:
    'Second step of login when the account has 2FA enabled. Submit the `twoFactorToken` received from `POST /auth/login` together with the 6-digit TOTP code from the authenticator app to get the final access and refresh tokens.',
  request: jsonBody(VerifyTwoFactorLoginBodySchema),
  responses: {
    200: {
      description: 'Login completed successfully',
      content: {
        'application/json': {
          schema: successWrapper(AuthResponseSchema, '/auth/2fa/login/verify', 200, 'Login successful')
        }
      }
    },
    401: unauthorizedResponse('Invalid or expired two-factor token, or wrong TOTP code'),
    422: validationErrorResponse(),
    429: rateLimitResponse()
  }
})

registry.registerPath({
  method: 'delete',
  path: '/auth/2fa',
  tags: ['Auth - 2FA'],
  summary: 'Disable 2FA',
  description:
    'Disables two-factor authentication for the authenticated account. Requires a valid TOTP code to confirm.',
  security: [{ bearerAuth: [] }],
  request: jsonBody(DisableTwoFactorBodySchema),
  responses: {
    200: {
      description: '2FA disabled successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/2fa', 200, '2FA disabled successfully')
        }
      }
    },
    400: badRequestResponse('Invalid TOTP code'),
    401: unauthorizedResponse('Missing or invalid access token'),
    422: validationErrorResponse()
  }
})
