import { z } from 'zod/v4'

export const VerifyTwoFactorLoginBodySchema = z.object({
  twoFactorToken: z.string().min(1),
  code: z.string().length(6)
})

export type VerifyTwoFactorLoginBody = z.infer<typeof VerifyTwoFactorLoginBodySchema>
