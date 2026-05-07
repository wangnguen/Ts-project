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

import { errorResponse, successWrapper } from './shared'

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
    username: z.string().nullable().openapi({ example: 'john_doe' }),
    email: z.string().email().openapi({ example: 'john@example.com' }),
    fullName: z.string().openapi({ example: 'John Doe' }),
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
              username: 'john_doe',
              email: 'john@example.com',
              password: 'P@ssword123!',
              confirmPassword: 'P@ssword123!',
              fullName: 'John Doe'
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
    400: errorResponse(400, 'Validation error', 'Validation failed'),
    409: errorResponse(409, 'Email or username already exists', 'Conflict')
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
            example: { email: 'john@example.com', password: 'P@ssword123!' }
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
    400: errorResponse(400, 'Validation error', 'Validation failed'),
    401: errorResponse(401, 'Invalid credentials', 'Unauthorized'),
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
    429: errorResponse(429, 'Too many requests', 'Too Many Requests')
  }
})

registry.registerPath({
  method: 'get',
  path: '/auth/google/callback',
  tags: ['Auth - Google OAuth'],
  summary: 'Google OAuth callback via query params',
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
    400: errorResponse(400, 'Invalid state or code', 'Bad Request')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/google/callback',
  tags: ['Auth - Google OAuth'],
  summary: 'Google OAuth callback via body (mobile / SPA)',
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
    400: errorResponse(400, 'Invalid code or state', 'Bad Request')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/forgot-password',
  tags: ['Auth - Email'],
  summary: 'Request a password reset email',
  description:
    'Sends a 6-digit OTP code to the provided email address. Always returns 200 regardless of whether the email exists (privacy protection). Rate limited.',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: ForgotPasswordBodySchema.openapi({
            example: { email: 'john@example.com' }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Reset email sent (or silently skipped if email not found)',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/auth/forgot-password')
        }
      }
    },
    400: errorResponse(400, 'Validation error', 'Validation failed'),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/reset-password',
  tags: ['Auth - Email'],
  summary: 'Reset password using OTP code from email',
  description:
    "Completes the password reset flow. Requires a valid access token in the Authorization header and the 6-digit OTP sent to the user's email.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: ResetPasswordBodySchema.openapi({
            example: {
              token: '123456',
              password: 'NewP@ssword1!',
              confirmPassword: 'NewP@ssword1!'
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
    400: errorResponse(400, 'Validation error or passwords do not match', 'Validation failed'),
    401: errorResponse(401, 'Invalid or expired refresh token', 'Unauthorized'),
    410: errorResponse(410, 'OTP token has expired or already been used', 'Gone'),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})

registry.registerPath({
  method: 'post',
  path: '/auth/verify-email',
  tags: ['Auth - Email'],
  summary: 'Verify email address using OTP token',
  description:
    "Confirms the user's email address. Requires a valid access token in the Authorization header and the 6-digit OTP sent during registration.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: VerifyEmailBodySchema.openapi({
            example: { token: '654321' }
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
    400: errorResponse(400, 'Validation error', 'Validation failed'),
    401: errorResponse(401, 'Invalid or expired refresh token', 'Unauthorized'),
    410: errorResponse(410, 'Verification token has expired or already been used', 'Gone'),
    429: errorResponse(429, 'Too many requests (rate limited)', 'Too Many Requests')
  }
})
