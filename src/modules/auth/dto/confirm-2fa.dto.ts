import { z } from 'zod/v4'

export const ConfirmTwoFactorBodySchema = z.object({
  code: z.string().length(6)
})

export type ConfirmTwoFactorBody = z.infer<typeof ConfirmTwoFactorBodySchema>
