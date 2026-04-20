import { z } from 'zod/v4'

export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string()
})

export type RefreshTokenBody = z.infer<typeof RefreshTokenBodySchema>
