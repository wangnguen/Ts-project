import { z } from 'zod/v4'

import { MonitorType } from '@common/constants/monitor.constant'

const UpdateMonitorBodyBaseSchema = z
  .object({
    name: z.string().min(1).max(100),
    type: z.enum(Object.values(MonitorType) as [MonitorType, ...MonitorType[]]),
    target: z.string().min(1),
    interval: z.int().positive(),
    timeout: z.int().positive(),
    retries: z.int().nonnegative(),
    isActive: z.boolean(),
    acceptedStatusCodes: z.array(z.int().positive()),
    keyword: z.string().nullable()
  })
  .partial()

export const UpdateMonitorBodyExample = {
  name: 'Production API',
  type: MonitorType.HTTP,
  target: 'https://example.com',
  interval: 60,
  timeout: 30,
  retries: 1,
  isActive: true,
  acceptedStatusCodes: [200, 201, 204],
  keyword: null
} satisfies z.input<typeof UpdateMonitorBodyBaseSchema>

export const UpdateMonitorBodySchema = UpdateMonitorBodyBaseSchema.meta({
  example: UpdateMonitorBodyExample
})

export type UpdateMonitorBody = z.infer<typeof UpdateMonitorBodyBaseSchema>
