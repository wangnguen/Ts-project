import { z } from 'zod/v4'

export const ForgotPasswordBodySchema = z.object({
  email: z.email()
})

export type ForgotPasswordBody = z.infer<typeof ForgotPasswordBodySchema>
