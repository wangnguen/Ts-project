import { z } from 'zod/v4'

import { registry } from '@docs/registry'

import { MonitorStatus, MonitorType } from '@common/constants/monitor.constant'

import { CreateMonitorBodySchema } from '@modules/monitor/dto/create-monitor.dto'

import { successWrapper, jsonBody, unauthorizedResponse, validationErrorResponse } from './shared'

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

registry.registerPath({
  method: 'post',
  path: '/monitors',
  tags: ['Monitors'],
  summary: 'Create a new monitor',
  security: [{ bearerAuth: [] }],
  request: jsonBody(CreateMonitorBodySchema),
  responses: {
    201: {
      description: 'Monitor created successfully',
      content: {
        'application/json': {
          schema: successWrapper(MonitorSchema, '/monitors', 201, 'Monitor created successfully')
        }
      }
    },
    401: unauthorizedResponse('Missing or invalid access token'),
    422: validationErrorResponse()
  }
})
