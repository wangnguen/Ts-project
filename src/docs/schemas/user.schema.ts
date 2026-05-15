import { z } from 'zod/v4'

import { registry } from '@docs/registry'

import { UpdateUserBodySchema, UpdateUserPasswordBodySchema } from '@modules/user/dto'

import {
  successWrapper,
  jsonBody,
  unauthorizedResponse,
  conflictResponse,
  validationErrorResponse,
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
    401: unauthorizedResponse('Missing or invalid access token')
  }
})

registry.registerPath({
  method: 'patch',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Update current user profile',
  security: [{ bearerAuth: [] }],
  request: jsonBody(UpdateUserBodySchema),
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: successWrapper(AuthUserSchema, '/users/me', 200, 'User updated successfully')
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    409: conflictResponse('Username already taken'),
    422: validationErrorResponse()
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
          schema: successWrapper(z.null(), '/users/me/password', 200, 'Password updated successfully')
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token or incorrect current password'),
    422: validationErrorResponse()
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
    401: unauthorizedResponse('Missing or invalid access token')
  }
})
