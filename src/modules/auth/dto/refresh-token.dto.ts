import { z } from 'zod/v4'

const RefreshTokenBodyBaseSchema = z.object({
  refreshToken: z.string()
})

export const RefreshTokenBodyExample = {
  refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...'
} satisfies z.input<typeof RefreshTokenBodyBaseSchema>

export const RefreshTokenBodySchema = RefreshTokenBodyBaseSchema.meta({
  example: RefreshTokenBodyExample
})

export type RefreshTokenBody = z.infer<typeof RefreshTokenBodySchema>
