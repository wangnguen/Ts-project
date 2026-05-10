import { z } from 'zod/v4'

import { registry } from '@docs/registry'

import { UpdateUserBodySchema, UpdateUserPasswordBodySchema } from '@modules/user/dto'

import {
  successWrapper,
  jsonBody,
  unauthorizedResponse,
  badRequestResponse,
  conflictResponse,
  AuthUserSchema
} from './shared'

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
    401: unauthorizedResponse('Unauthorized — missing or invalid access token')
  }
})

registry.registerPath({
  method: 'patch',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Update current user profile',
  security: [{ bearerAuth: [] }],
  request: {
    ...jsonBody(UpdateUserBodySchema),
    body: {
      ...jsonBody(UpdateUserBodySchema).body,
      description: 'At least one field required'
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
    400: badRequestResponse('Validation error or no fields provided'),
    401: unauthorizedResponse('Unauthorized'),
    409: conflictResponse('Username already taken')
  }
})

registry.registerPath({
  method: 'patch',
  path: '/users/me/password',
  tags: ['Users'],
  summary: 'Change current user password',
  security: [{ bearerAuth: [] }],
  request: jsonBody(UpdateUserPasswordBodySchema),
  responses: {
    200: {
      description: 'Password updated successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({ message: z.string().meta({ example: 'Password updated successfully' }) }),
            '/users/me/password'
          )
        }
      }
    },
    400: badRequestResponse('Validation error or passwords do not match'),
    401: unauthorizedResponse('Unauthorized or incorrect current password')
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
    401: unauthorizedResponse('Unauthorized')
  }
})
