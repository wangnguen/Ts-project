import { z } from 'zod/v4'

import { registry } from '@common/docs/registry'

import { UpdateUserBodySchema, UpdateUserPasswordBodySchema } from '@modules/user/dto'

import { AuthUserSchema } from './auth.schema'
import { errorResponse, successWrapper } from './shared'

registry.registerPath({
  method: 'get',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Get current user profile',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Current user profile',
      content: {
        'application/json': {
          schema: successWrapper(AuthUserSchema, '/users/me')
        }
      }
    },
    401: errorResponse(401, 'Unauthorized — missing or invalid access token', 'Unauthorized')
  }
})

registry.registerPath({
  method: 'patch',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Update current user profile',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      description: 'At least one field required',
      required: true,
      content: {
        'application/json': {
          schema: UpdateUserBodySchema.openapi({
            example: { username: 'jane_doe', fullName: 'Jane Doe' }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: successWrapper(AuthUserSchema, '/users/me')
        }
      }
    },
    400: errorResponse(400, 'Validation error or no fields provided', 'Validation failed'),
    401: errorResponse(401, 'Unauthorized', 'Unauthorized'),
    409: errorResponse(409, 'Username already taken', 'Conflict')
  }
})

registry.registerPath({
  method: 'patch',
  path: '/users/me/password',
  tags: ['Users'],
  summary: 'Change current user password',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: UpdateUserPasswordBodySchema.openapi({
            example: {
              currentPassword: 'OldP@ss123!',
              newPassword: 'NewP@ss456!',
              confirmPassword: 'NewP@ss456!'
            }
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Password updated successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({ message: z.string().openapi({ example: 'Password updated successfully' }) }),
            '/users/me/password'
          )
        }
      }
    },
    400: errorResponse(400, 'Validation error or passwords do not match', 'Validation failed'),
    401: errorResponse(401, 'Unauthorized or incorrect current password', 'Unauthorized')
  }
})

registry.registerPath({
  method: 'delete',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Delete current user account',
  security: [{ bearerAuth: [] }],
  responses: {
    204: {
      description: 'Account deleted successfully'
    },
    401: errorResponse(401, 'Unauthorized', 'Unauthorized')
  }
})
