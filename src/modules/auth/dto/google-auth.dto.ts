import { z } from 'zod/v4'

export const GoogleCallbackBodySchema = z.object({
  code: z.string().min(1)
})
export type GoogleCallbackBody = z.infer<typeof GoogleCallbackBodySchema>
