import { z } from 'zod/v4'

import { registry } from '@common/docs/registry'

import {
  ForgotPasswordBodySchema,
  GoogleCallbackBodySchema,
  LoginBodySchema,
  RefreshTokenBodySchema,
  RegisterBodySchema,
  ResetPasswordBodySchema,
  VerifyEmailBodySchema
} from '@modules/auth/dto'

import { errorResponse, validationErrorResponse, successWrapper } from './shared'

export const TokenPairSchema = registry.register(
  'TokenPair',
  z.object({
    accessToken: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    refreshToken: z.string().openapi({ example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...' })
  })
)

export const AuthUserSchema = registry.register(
  'AuthUser',
  z.object({
    id: z.string().uuid().openapi({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
    username: z.string().nullable().openapi({ example: 'kimnguen79' }),
    email: z.string().email().openapi({ example: 'kimnguen79lc@gmail.com' }),
    fullName: z.string().openapi({ example: 'Kim Nguyen' }),
    role: z.enum(['user', 'admin']).openapi({ example: 'user' }),
    googleId: z.string().nullable().optional().openapi({ example: null }),
    avatarUrl: z.string().url().nullable().optional().openapi({ example: null })
  })
)

export const AuthResponseSchema = registry.register(
  'AuthResponse',
  z.object({
    accessToken: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    refreshToken: z.string().openapi({ example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...' }),
    user: AuthUserSchema
  })
)

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: RegisterBodySchema.openapi({
            example: {
              username: 'kimnguen79',
              email: 'kimnguen79lc@gmail.com',
              password: 'Abc123!@#',
              confirmPassword: 'Abc123!@#',
              fullName: 'Kim Nguyen'
            }
          })
        }
      }
    }
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.object({ user: AuthUserSchema }), '/auth/register')
        }
      }
    },
    409: errorResponse(409, 'Email or username already exists', 'Conflict'),
    422: validationErrorResponse(),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: LoginBodySchema.openapi({
            example: { email: 'kimnguen79lc@gmail.com', password: 'Abc123!@#' }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: successWrapper(AuthResponseSchema, '/auth/login')
        }
      }
    },
    401: errorResponse(401, 'Invalid credentials', 'Unauthorized'),
    422: validationErrorResponse(),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Logout — invalidate refresh token',
  security: [{ refreshTokenAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: RefreshTokenBodySchema.openapi({
            example: { refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...' }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Logged out successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/logout')
        }
      }
    },
    401: errorResponse(401, 'Invalid or expired refresh token', 'Unauthorized')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/refresh-token',
  tags: ['Auth'],
  summary: 'Issue new token pair from refresh token',
  security: [{ refreshTokenAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: RefreshTokenBodySchema.openapi({
            example: { refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...' }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'New token pair issued',
      content: {
        'application/json': {
          schema: successWrapper(TokenPairSchema, '/auth/refresh-token')
        }
      }
    },
    401: errorResponse(401, 'Invalid or expired refresh token', 'Unauthorized')
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
              url: z.string().url().openapi({ example: 'https://accounts.google.com/o/oauth2/v2/auth?...' }),
              state: z.string().openapi({ example: 'random-csrf-token' })
            }),
            '/auth/google'
          )
        }
      }
    },
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
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
    query: GoogleCallbackBodySchema.openapi({
      example: { code: '4/0AfJohXn...', state: 'random-csrf-token' }
    })
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: successWrapper(AuthResponseSchema, '/auth/google/callback')
        }
      }
    },
    401: errorResponse(401, 'Invalid or expired OAuth state / Google account mismatch', 'Unauthorized'),
    409: errorResponse(409, 'Email already registered with password — link Google from account settings', 'Conflict'),
    422: validationErrorResponse(),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/google/callback',
  tags: ['Auth - Google OAuth'],
  summary: 'Google OAuth callback via body (mobile / SPA)',
  description:
    'Alternative OAuth callback method for mobile apps or SPAs. Frontend receives `code` and `state` from Google, then sends them to this endpoint.',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: GoogleCallbackBodySchema.openapi({
            example: { code: '4/0AfJohXn...', state: 'random-csrf-token' }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: successWrapper(AuthResponseSchema, '/auth/google/callback')
        }
      }
    },
    401: errorResponse(401, 'Invalid or expired OAuth state / Google account mismatch', 'Unauthorized'),
    409: errorResponse(409, 'Email already registered with password — link Google from account settings', 'Conflict'),
    422: validationErrorResponse(),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/forgot-password',
  tags: ['Auth - Email'],
  summary: 'Request a password reset email',
  description:
    'Sends a 6-digit OTP code to the provided email address. **Requirements**: User must have verified their email address and have a password (email/password auth only, not Google OAuth). Always returns 200 regardless of whether the email exists (privacy protection). Rate limited.',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: ForgotPasswordBodySchema.openapi({
            example: { email: 'kimnguen79lc@gmail.com' }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Reset email sent (or silently skipped if email not found / not verified / Google OAuth user)',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/forgot-password')
        }
      }
    },
    409: errorResponse(409, 'User created via Google OAuth — use Google login instead', 'Conflict'),
    422: validationErrorResponse(),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/reset-password',
  tags: ['Auth - Email'],
  summary: 'Reset password using OTP code from email',
  description:
    "Completes the password reset flow. No authentication required — the 6-digit OTP sent to the user's email is sufficient to verify identity.",
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: ResetPasswordBodySchema.openapi({
            example: {
              token: '123456',
              password: 'Abc123!@#',
              confirmPassword: 'Abc123!@#'
            }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Password reset successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/reset-password')
        }
      }
    },
    401: errorResponse(401, 'Invalid, expired or already used OTP token', 'Unauthorized'),
    422: validationErrorResponse(),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/verify-email',
  tags: ['Auth - Email'],
  summary: 'Verify email address using token from email link',
  description:
    "Confirms the user's email address. No authentication required — the secure token sent via email link is sufficient to verify identity.",
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: VerifyEmailBodySchema.openapi({
            example: { token: 'a3f9c2d1e8b74056af12cd93e6b5a201' }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Email verified successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/verify-email')
        }
      }
    },
    401: errorResponse(401, 'Invalid, expired or already used verification token', 'Unauthorized'),
    422: validationErrorResponse(),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})
