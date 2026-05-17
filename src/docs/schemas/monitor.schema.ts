import { z } from 'zod/v4'

import { registry } from '@docs/registry'

import { MonitorStatus, MonitorType } from '@common/constants/monitor.constant'

import { CreateMonitorBodySchema } from '@modules/monitor/dto/create-monitor.dto'
import { ListMonitorsQuerySchema } from '@modules/monitor/dto/list-monitors.dto'
import { UpdateMonitorBodySchema } from '@modules/monitor/dto/update-monitor.dto'

import {
  successWrapper,
  jsonBody,
  unauthorizedResponse,
  validationErrorResponse,
  forbiddenResponse,
  errorResponse
} from './shared'

const MonitorSchema = registry.register(
  'Monitor',
  z.object({
    id: z.uuid().meta({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
    name: z.string().meta({ example: 'Production API' }),
    type: z.enum(Object.values(MonitorType) as [MonitorType, ...MonitorType[]]).meta({ example: MonitorType.HTTP }),
    target: z.string().meta({ example: 'https://example.com' }),
    interval: z.number().meta({ example: 60 }),
    timeout: z.number().meta({ example: 30 }),
    retries: z.number().meta({ example: 1 }),
    isActive: z.boolean().meta({ example: true }),
    currentStatus: z
      .enum(Object.values(MonitorStatus) as [MonitorStatus, ...MonitorStatus[]])
      .meta({ example: MonitorStatus.PENDING }),
    lastCheckedAt: z.iso.datetime().nullable().meta({ example: null }),
    acceptedStatusCodes: z.array(z.number()).meta({ example: [200, 201, 204] }),
    keyword: z.string().nullable().meta({ example: null }),
    userId: z.uuid().meta({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  })
)

const PaginatedMonitorSchema = z.object({
  entries: z.array(MonitorSchema),
  limit: z.number().meta({ example: 10 }),
  offset: z.number().meta({ example: 0 }),
  total_count: z.number().optional().meta({ example: 42 })
})

const monitorIdParam = z.object({ id: z.uuid().meta({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }) })

const notFoundResponse = errorResponse(404, 'Monitor not found', 'Not Found')

registry.registerPath({
  method: 'get',
  path: '/monitors',
  tags: ['Monitors'],
  summary: 'List monitors (paginated)',
  description: `Returns a paginated list of monitors belonging to the current user.\n\n**Query params**\n\n
  - \`limit\` — number of items per page (default: 10, max: 100)\n

  - \`offset\` — number of items to skip (default: 0)`,
  security: [{ bearerAuth: [] }],
  request: {
    query: ListMonitorsQuerySchema
  },
  responses: {
    200: {
      description: 'Paginated list of monitors',
      content: {
        'application/json': {
          schema: successWrapper(z.object({ monitors: PaginatedMonitorSchema }), '/monitors', 200, 'OK')
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'get',
  path: '/monitors/{id}',
  tags: ['Monitors'],
  summary: 'Get a monitor by ID',
  security: [{ bearerAuth: [] }],
  request: { params: monitorIdParam },
  responses: {
    200: {
      description: 'Monitor details',
      content: {
        'application/json': {
          schema: successWrapper(z.object({ monitor: MonitorSchema }), '/monitors/{id}', 200, 'OK')
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    403: forbiddenResponse('Monitor belongs to another user'),
    404: notFoundResponse
  }
})

registry.registerPath({
  method: 'post',
  path: '/monitors',
  tags: ['Monitors'],
  summary: 'Create a monitor',
  security: [{ bearerAuth: [] }],
  request: jsonBody(CreateMonitorBodySchema),
  responses: {
    201: {
      description: 'Monitor created successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.object({ monitor: MonitorSchema }), '/monitors', 201, 'Monitor created successfully')
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'patch',
  path: '/monitors/{id}',
  tags: ['Monitors'],
  summary: 'Update a monitor',
  security: [{ bearerAuth: [] }],
  request: {
    params: monitorIdParam,
    ...jsonBody(UpdateMonitorBodySchema)
  },
  responses: {
    200: {
      description: 'Monitor updated successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({ monitor: MonitorSchema }),
            '/monitors/{id}',
            200,
            'Monitor updated successfully'
          )
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    403: forbiddenResponse('Monitor belongs to another user'),
    404: notFoundResponse,
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'delete',
  path: '/monitors/{id}',
  tags: ['Monitors'],
  summary: 'Delete a monitor',
  description: 'Soft-deletes the monitor. Data is retained but the monitor will no longer run.',
  security: [{ bearerAuth: [] }],
  request: { params: monitorIdParam },
  responses: {
    200: {
      description: 'Monitor deleted successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({ message: z.string().meta({ example: 'Monitor deleted successfully' }) }),
            '/monitors/{id}',
            200,
            'Monitor deleted successfully'
          )
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    403: forbiddenResponse('Monitor belongs to another user'),
    404: notFoundResponse
  }
})

registry.registerPath({
  method: 'patch',
  path: '/monitors/{id}/pause',
  tags: ['Monitors'],
  summary: 'Pause a monitor',
  description: `Sets \`isActive = false\` and \`currentStatus = "pending"\`.\n\nThe monitor stops sending check requests until resumed via \`/start\`.`,
  security: [{ bearerAuth: [] }],
  request: { params: monitorIdParam },
  responses: {
    200: {
      description: 'Monitor paused successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({ message: z.string().meta({ example: 'Monitor paused successfully' }) }),
            '/monitors/{id}/pause',
            200,
            'Monitor paused successfully'
          )
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    403: forbiddenResponse('Monitor belongs to another user'),
    404: notFoundResponse
  }
})

registry.registerPath({
  method: 'patch',
  path: '/monitors/{id}/start',
  tags: ['Monitors'],
  summary: 'Start (resume) a monitor',
  description: `Sets \`isActive = true\`.\n\nThe monitor will resume sending check requests on its configured \`interval\`.`,
  security: [{ bearerAuth: [] }],
  request: { params: monitorIdParam },
  responses: {
    200: {
      description: 'Monitor started successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({ message: z.string().meta({ example: 'Monitor started successfully' }) }),
            '/monitors/{id}/start',
            200,
            'Monitor started successfully'
          )
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    403: forbiddenResponse('Monitor belongs to another user'),
    404: notFoundResponse
  }
})
