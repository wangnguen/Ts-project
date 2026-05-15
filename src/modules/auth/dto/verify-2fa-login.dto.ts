import { z } from 'zod/v4'

const VerifyTwoFactorLoginBodyBaseSchema = z.object({
  pendingToken: z.string().min(1),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/)
})

export const VerifyTwoFactorLoginBodyExample = {
  pendingToken: 'a3f8d2c1e4b57f9a...',
  code: '123456'
} satisfies z.input<typeof VerifyTwoFactorLoginBodyBaseSchema>

export const VerifyTwoFactorLoginBodySchema = VerifyTwoFactorLoginBodyBaseSchema.meta({
  example: VerifyTwoFactorLoginBodyExample
})

export type VerifyTwoFactorLoginBody = z.infer<typeof VerifyTwoFactorLoginBodySchema>
