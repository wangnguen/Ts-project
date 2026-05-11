import { z } from 'zod/v4'

export const DisableTwoFactorBodySchema = z.object({
  code: z.string().length(6)
})

export type DisableTwoFactorBody = z.infer<typeof DisableTwoFactorBodySchema>
