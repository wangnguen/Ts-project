import { z } from 'zod/v4'

export const ConfirmTwoFactorBodySchema = z.object({
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
  setUpToken: z.string().min(1)
})

export type ConfirmTwoFactorBody = z.infer<typeof ConfirmTwoFactorBodySchema>
