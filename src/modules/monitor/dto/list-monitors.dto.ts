import { z } from 'zod/v4'

export const ListMonitorsQueryBaseSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
  offset: z.coerce.number().int().nonnegative().default(0)
})

export const ListMonitorsQueryExample = {
  limit: 10,
  offset: 0
} satisfies z.input<typeof ListMonitorsQueryBaseSchema>

export const ListMonitorsQuerySchema = ListMonitorsQueryBaseSchema.meta({
  example: ListMonitorsQueryExample
})

export type ListMonitorsQuery = z.infer<typeof ListMonitorsQuerySchema>
